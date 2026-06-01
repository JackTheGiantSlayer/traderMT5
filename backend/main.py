import os
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from backend.config import HOST, PORT, STATIC_DIR, MT5_LOGIN, MT5_PASSWORD, MT5_SERVER
from backend.database import engine, Base, get_db
from backend.models import AccountSettings, TradeHistoryRecord, WatchlistItem, BotSettings, BotLog, NewsRecord
from backend.mt5_manager import MT5Manager
from backend.trading_bot import BotManager
from backend.chatbot import ChatbotAssistant
from sqlalchemy import inspect, text
import threading
import time
import logging


# Create database tables
Base.metadata.create_all(bind=engine)

# Self-healing migration to add missing columns in older DB versions
try:
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('bot_settings')]
    
    with engine.begin() as conn:
        if "signal_mode" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN signal_mode VARCHAR(10) DEFAULT 'or'"))
            print("Database Migration: Successfully added 'signal_mode' column to 'bot_settings' table.")
            
        if "use_trend_filter" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN use_trend_filter BOOLEAN DEFAULT 0"))
            print("Database Migration: Successfully added 'use_trend_filter' column.")
            
        if "use_atr_sizing" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN use_atr_sizing BOOLEAN DEFAULT 0"))
            print("Database Migration: Successfully added 'use_atr_sizing' column.")

        if "use_news_filter" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN use_news_filter BOOLEAN DEFAULT 0"))
            print("Database Migration: Successfully added 'use_news_filter' column.")
            
        if "risk_percent" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN risk_percent FLOAT DEFAULT 1.0"))
            print("Database Migration: Successfully added 'risk_percent' column.")
            
        if "allowed_sessions" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN allowed_sessions VARCHAR(50) DEFAULT 'all'"))
            print("Database Migration: Successfully added 'allowed_sessions' column.")
            
    # NewsRecord self-healing migration
    news_columns = [col['name'] for col in inspector.get_columns('news_records')]
    with engine.begin() as conn:
        if "title_th" not in news_columns:
            conn.execute(text("ALTER TABLE news_records ADD COLUMN title_th VARCHAR(300) NULL"))
            print("Database Migration: Successfully added 'title_th' column to 'news_records' table.")
        if "summary_th" not in news_columns:
            conn.execute(text("ALTER TABLE news_records ADD COLUMN summary_th VARCHAR(1500) NULL"))
            print("Database Migration: Successfully added 'summary_th' column to 'news_records' table.")

    # TradeHistoryRecord self-healing migration
    history_columns = [col['name'] for col in inspector.get_columns('trade_history')]
    with engine.begin() as conn:
        if "sl" not in history_columns:
            conn.execute(text("ALTER TABLE trade_history ADD COLUMN sl FLOAT DEFAULT 0.0"))
            print("Database Migration: Successfully added 'sl' column to 'trade_history' table.")
        if "tp" not in history_columns:
            conn.execute(text("ALTER TABLE trade_history ADD COLUMN tp FLOAT DEFAULT 0.0"))
            print("Database Migration: Successfully added 'tp' column to 'trade_history' table.")
except Exception as e:
    print(f"Database Migration Warning: {e}")


# Seed default watchlist if empty
db = next(get_db())
try:
    if db.query(WatchlistItem).count() == 0:
        defaults = [
            WatchlistItem(symbol="XAUUSD", name="Gold Spot / US Dollar", asset_type="gold"),
            WatchlistItem(symbol="AAPL", name="Apple Inc.", asset_type="stock"),
            WatchlistItem(symbol="TSLA", name="Tesla Inc.", asset_type="stock"),
            WatchlistItem(symbol="US500", name="S&P 500 Index", asset_type="index"),
            WatchlistItem(symbol="EURUSD", name="Euro / US Dollar", asset_type="forex"),
            WatchlistItem(symbol="BTCUSD", name="Bitcoin / US Dollar", asset_type="crypto")
        ]
        db.add_all(defaults)
        db.commit()
        print("Database Seed: Successfully seeded initial watchlist.")
    else:
        # Proactively verify and add BTCUSD if it's missing in already-existing DB watchlist
        btc_exists = db.query(WatchlistItem).filter(WatchlistItem.symbol == "BTCUSD").first()
        if not btc_exists:
            btc_item = WatchlistItem(symbol="BTCUSD", name="Bitcoin / US Dollar", asset_type="crypto")
            db.add(btc_item)
            db.commit()
            print("Database Seed: Proactively added BTCUSD to existing watchlist.")
finally:
    db.close()

# Initialize FastAPI
app = FastAPI(
    title="Antigravity MT5 Exness Trader API",
    description="Backend for stock and gold trading web application connected to MT5/Exness.",
    version="1.0.0"
)

# CORS middleware for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MT5 Manager singleton
mt5_manager = MT5Manager()

# Try to auto-connect if credentials are set in .env
if MT5_LOGIN and MT5_PASSWORD and MT5_SERVER:
    try:
        mt5_manager.connect(int(MT5_LOGIN), MT5_PASSWORD, MT5_SERVER)
        print(f"Auto-connected to Exness MT5 Account {MT5_LOGIN}")
    except Exception as e:
        print(f"Auto-connect failed: {e}. Running in Simulation Mode.")

# --- API Models ---
class ConnectionRequest(BaseModel):
    login: int
    password: str
    server: str
    auto_connect: bool = False

class TradeRequest(BaseModel):
    symbol: str
    action: str  # 'buy' or 'sell'
    volume: float
    sl: float = 0.0
    tp: float = 0.0

class ChatbotRequest(BaseModel):
    message: str

chatbot_assistant = ChatbotAssistant()

class WatchlistRequest(BaseModel):
    symbol: str
    name: str
    asset_type: str

class BotCreateRequest(BaseModel):
    name: str
    symbol: str
    timeframe: str
    algorithm: str
    lot_size: float
    sl_points: float = 0.0
    tp_points: float = 0.0
    signal_mode: str = "or"
    use_trend_filter: bool = False
    use_atr_sizing: bool = False
    use_news_filter: bool = False
    risk_percent: float = 1.0
    allowed_sessions: str = "all"


# --- Endpoints ---

@app.get("/api/mt5/status")
def get_status():
    """Get the current connection status to MetaTrader 5."""
    return {
        "is_connected": mt5_manager.is_connected,
        "is_simulated": mt5_manager.is_simulated,
        "login": mt5_manager.login_id if mt5_manager.is_connected else 9999999 if mt5_manager.is_simulated else None,
        "server": mt5_manager.server if mt5_manager.is_connected else "Simulation-Mode" if mt5_manager.is_simulated else None,
        "api_available": mt5_manager.is_connected or mt5_manager.is_simulated
    }

@app.post("/api/mt5/connect")
def connect_mt5(req: ConnectionRequest, db: Session = Depends(get_db)):
    """Logs into the user's Exness MT5 account."""
    try:
        success = mt5_manager.connect(req.login, req.password, req.server)
        if success:
            # Save or update settings in database
            settings = db.query(AccountSettings).first()
            if not settings:
                settings = AccountSettings(login=req.login, server=req.server, auto_connect=req.auto_connect)
                db.add(settings)
            else:
                settings.login = req.login
                settings.server = req.server
                settings.auto_connect = req.auto_connect
                settings.last_connected = datetime.utcnow()
            db.commit()
            
            return {
                "success": True, 
                "message": f"Successfully connected to Exness MT5 account {req.login}",
                "account": req.login
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/mt5/disconnect")
def disconnect_mt5():
    """Disconnects from the live Exness MT5 account and enters Simulation Mode."""
    mt5_manager.disconnect()
    return {"success": True, "message": "Disconnected from live account, entered simulation mode."}

@app.get("/api/mt5/account")
def get_account():
    """Fetch current account parameters (balance, equity, margins, profit)."""
    return mt5_manager.get_account_info()

@app.get("/api/mt5/candles")
def get_candles(
    symbol: str = Query(..., description="Asset symbol like XAUUSD"),
    timeframe: str = Query("H1", description="Timeframe M1, M5, M15, M30, H1, D1"),
    count: int = Query(150, description="Number of candles")
):
    """Retrieve historical candle rates for charts."""
    try:
        data = mt5_manager.get_historical_candles(symbol, timeframe, count)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mt5/patterns")
def get_patterns(
    symbol: str = Query(..., description="Asset symbol like XAUUSD"),
    timeframe: str = Query("H1", description="Timeframe M1, M5, M15, M30, H1, D1"),
    count: int = Query(150, description="Number of candles"),
    # Stoch RSI inputs
    stoch_k: int = Query(3, description="Stochastic RSI %K smoothing period"),
    stoch_d: int = Query(3, description="Stochastic RSI %D signal period"),
    rsi_len: int = Query(13, description="Stochastic RSI RSI period"),
    stoch_len: int = Query(13, description="Stochastic RSI Stochastic period"),
    rsi_source: str = Query("close", description="Price source: open, high, low, close"),
    stoch_tf: str = Query("Chart", description="Stochastic RSI calculation timeframe"),
    wait_close: bool = Query(True, description="Wait for timeframe closes (use index -2)"),
    # MACD 4C inputs
    macd_fast: int = Query(12, description="MACD fast period"),
    macd_slow: int = Query(26, description="MACD slow period"),
    macd_signal: int = Query(9, description="MACD signal period")
):
    """Retrieve detected patterns and swing points for charting."""
    try:
        candles = mt5_manager.get_historical_candles(symbol, timeframe, count)
        if not candles or len(candles) < 20:
            return {
                "swings": [],
                "harmonic": None,
                "elliott": None,
                "structures": []
            }
            
        from backend.pattern_detector import detect_swings, detect_harmonic_patterns, detect_elliott_waves, detect_all_market_structures, calculate_rsi, calculate_stoch_rsi, calculate_macd_4c
        
        swings = detect_swings(candles)
        harmonic = detect_harmonic_patterns(candles)
        elliott = detect_elliott_waves(candles)
        structures = detect_all_market_structures(candles)
        
        # Get candles for Stoch RSI if a different timeframe is specified
        stoch_tf_actual = stoch_tf if stoch_tf != "Chart" else timeframe
        if stoch_tf_actual != timeframe:
            try:
                stoch_candles = mt5_manager.get_historical_candles(symbol, stoch_tf_actual, count)
            except Exception as e:
                print(f"Failed to fetch separate candles for Stoch RSI: {e}")
                stoch_candles = candles
        else:
            stoch_candles = candles

        # Extract correct price array based on rsi_source
        def get_source_prices(candles_list, source):
            if not candles_list:
                return []
            src = source.lower()
            if src == "open":
                return [c["open"] for c in candles_list]
            elif src == "high":
                return [c["high"] for c in candles_list]
            elif src == "low":
                return [c["low"] for c in candles_list]
            else:
                return [c["close"] for c in candles_list]

        # Calculate Stochastic RSI
        stoch_prices = get_source_prices(stoch_candles, rsi_source)
        stoch_rsi_k_vals, stoch_rsi_d_vals = calculate_stoch_rsi(stoch_prices, rsi_len, stoch_len, stoch_k, stoch_d)
        stoch_rsi_vals = calculate_rsi(stoch_prices, rsi_len)
        
        # Determine the target index based on wait_close
        stoch_idx = -1
        if wait_close and len(stoch_rsi_k_vals) >= 2:
            stoch_idx = -2
            
        latest_rsi = stoch_rsi_vals[stoch_idx] if stoch_rsi_vals and len(stoch_rsi_vals) > abs(stoch_idx) and stoch_rsi_vals[stoch_idx] is not None else None
        latest_k = stoch_rsi_k_vals[stoch_idx] if stoch_rsi_k_vals and len(stoch_rsi_k_vals) > abs(stoch_idx) and stoch_rsi_k_vals[stoch_idx] is not None else None
        latest_d = stoch_rsi_d_vals[stoch_idx] if stoch_rsi_d_vals and len(stoch_rsi_d_vals) > abs(stoch_idx) and stoch_rsi_d_vals[stoch_idx] is not None else None
        
        # Calculate MACD 4C
        close_prices = [c["close"] for c in candles]
        macd_vals, macd_colors = calculate_macd_4c(close_prices, macd_fast, macd_slow, macd_signal)
        
        latest_macd = macd_vals[-1] if macd_vals and macd_vals[-1] is not None else None
        latest_macd_color = macd_colors[-1] if macd_colors and macd_colors[-1] is not None else None
        
        # Historical MACD 4C data (last 12 bars) to feed frontend chart
        macd_history = []
        if macd_vals and macd_colors:
            start_idx = max(0, len(macd_vals) - 12)
            for idx in range(start_idx, len(macd_vals)):
                if macd_vals[idx] is not None and macd_colors[idx] is not None:
                    macd_history.append({
                        "value": macd_vals[idx],
                        "color": macd_colors[idx]
                    })
        
        return {
            "swings": swings,
            "harmonic": harmonic,
            "elliott": elliott,
            "structures": structures,
            "indicators": {
                "rsi": latest_rsi,
                "stoch_rsi_k": latest_k,
                "stoch_rsi_d": latest_d,
                "macd_4c": {
                    "value": latest_macd,
                    "color": latest_macd_color,
                    "history": macd_history
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mt5/positions")
def get_positions(db: Session = Depends(get_db)):
    """Retrieve all open trade positions."""
    positions = mt5_manager.get_positions()
    try:
        # Get active ticket to bot name mapping (clean bot name only)
        bots = db.query(BotSettings).filter(BotSettings.active_ticket.isnot(None)).all()
        ticket_to_bot = {bot.active_ticket: bot.name for bot in bots}
        for pos in positions:
            db_bot_name = ticket_to_bot.get(pos["ticket"])
            if db_bot_name:
                pos["bot_name"] = db_bot_name
            else:
                # Fallback to the position's own comment if it contains bot name information
                comment = pos.get("comment", "")
                is_manual = not comment or comment in ['Manual', 'Simulation', 'Exness Real Close', 'Close via Antigravity MT5']
                if is_manual:
                    pos["bot_name"] = "เทรดเอง (Manual)"
                else:
                    # Strip the suffix "[...]" from the comment
                    import re
                    clean_name = re.sub(r'\s*\[.*?\]$', '', comment)
                    pos["bot_name"] = clean_name
    except Exception as e:
        print(f"Error mapping bot names to positions: {e}")
        for pos in positions:
            pos["bot_name"] = "เทรดเอง (Manual)"
    return positions

@app.post("/api/chatbot/query")
def chatbot_query(req: ChatbotRequest, db: Session = Depends(get_db)):
    """Handles chat queries using the local assistant context engine."""
    try:
        res = chatbot_assistant.process_query(req.message, db)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mt5/trade")
def execute_trade(req: TradeRequest):
    """Executes a BUY or SELL order."""
    try:
        trade_result = mt5_manager.open_position(
            symbol=req.symbol,
            order_type=req.action.lower(),
            volume=req.volume,
            sl=req.sl,
            tp=req.tp
        )
        return trade_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/mt5/close-position/{ticket}")
def close_trade(ticket: int, db: Session = Depends(get_db)):
    """Closes an open position by ticket ID."""
    try:
        # Find if there is a bot associated with this active ticket
        bot = db.query(BotSettings).filter(BotSettings.active_ticket == ticket).first()
        bot_name = f"{bot.name} [{bot.algorithms}]" if bot else "เทรดเอง (Manual)"
        
        result = mt5_manager.close_position(ticket)
        
        # If simulated, save the closed trade record to the database history
        if mt5_manager.is_simulated and result.get("success"):
            history_record = TradeHistoryRecord(
                ticket=result["ticket"],
                symbol=result["symbol"],
                order_type=result["type"],
                volume=result["volume"],
                open_price=result["open_price"],
                close_price=result["close_price"],
                sl=result.get("sl", 0.0),
                tp=result.get("tp", 0.0),
                open_time=datetime.strptime(result["open_time"], "%Y-%m-%d %H:%M:%S") if isinstance(result["open_time"], str) else result["open_time"],
                close_time=datetime.strptime(result["close_time"], "%Y-%m-%d %H:%M:%S") if isinstance(result["close_time"], str) else result["close_time"],
                profit=result["profit"],
                comment=bot_name
            )
            db.add(history_record)
            
        # Clear bot active ticket tracking on success
        if result.get("success") and bot:
            bot.active_ticket = None
            
        db.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/mt5/close-all")
def close_all(db: Session = Depends(get_db)):
    """Closes all active open trade positions and records logs & history."""
    try:
        positions = mt5_manager.get_positions()
        if not positions:
            return {"success": True, "closed_count": 0, "message": "ไม่มีโพสิชันที่เปิดทำงานอยู่ในขณะนี้"}
            
        results = []
        for pos in positions:
            ticket = pos["ticket"]
            # Find matching bot
            bot = db.query(BotSettings).filter(BotSettings.active_ticket == ticket).first()
            bot_name = f"{bot.name} [{bot.algorithms}]" if bot else "เทรดเอง (Manual)"
            
            res = mt5_manager.close_position(ticket)
            if res.get("success"):
                results.append(res)
                # If simulated, save to local TradeHistoryRecord
                if mt5_manager.is_simulated:
                    history_record = TradeHistoryRecord(
                        ticket=res["ticket"],
                        symbol=res["symbol"],
                        order_type=res["type"],
                        volume=res["volume"],
                        open_price=res["open_price"],
                        close_price=res["close_price"],
                        sl=res.get("sl", 0.0),
                        tp=res.get("tp", 0.0),
                        open_time=datetime.strptime(res["open_time"], "%Y-%m-%d %H:%M:%S") if isinstance(res["open_time"], str) else res["open_time"],
                        close_time=datetime.strptime(res["close_time"], "%Y-%m-%d %H:%M:%S") if isinstance(res["close_time"], str) else res["close_time"],
                        profit=res["profit"],
                        comment=bot_name
                    )
                    db.add(history_record)
                
                # Clear active ticket
                if bot:
                    bot.active_ticket = None
                    
        db.commit()
        return {"success": True, "closed_count": len(results), "details": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/mt5/history")
def get_history(db: Session = Depends(get_db)):
    """Retrieve history of closed deals (real or simulated)."""
    # Fetch simulated history from our local DB
    sim_history = db.query(TradeHistoryRecord).order_by(TradeHistoryRecord.close_time.desc()).all()
    
    formatted_sim = []
    for t in sim_history:
        formatted_sim.append({
            "ticket": t.ticket,
            "symbol": t.symbol,
            "type": t.order_type,
            "volume": t.volume,
            "open_price": t.open_price,
            "close_price": t.close_price,
            "sl": t.sl or 0.0,
            "tp": t.tp or 0.0,
            "open_time": t.open_time.strftime("%Y-%m-%d %H:%M:%S"),
            "close_time": t.close_time.strftime("%Y-%m-%d %H:%M:%S"),
            "profit": t.profit,
            "comment": t.comment or "Simulation"
        })
        
    # If connected to real MT5, try to fetch real history from the past 30 days
    if not mt5_manager.is_simulated and mt5_manager.is_connected:
        try:
            import MetaTrader5 as mt5_lib
            # From 30 days ago to now
            from_date = datetime.now() - timedelta(days=30)
            to_date = datetime.now() + timedelta(days=1)
            
            # Fetch deals
            deals = mt5_lib.history_deals_get(from_date, to_date)
            orders = mt5_lib.history_orders_get(from_date, to_date)
            
            order_sl_tp = {}
            if orders is not None:
                for o in orders:
                    if o.position_id > 0:
                        existing = order_sl_tp.get(o.position_id, {"sl": 0.0, "tp": 0.0})
                        sl = o.sl if o.sl > 0 else existing["sl"]
                        tp = o.tp if o.tp > 0 else existing["tp"]
                        order_sl_tp[o.position_id] = {"sl": sl, "tp": tp}
            
            if deals is not None:
                # Map position_id to entry deal's details (entry == 0 is DEAL_ENTRY_IN)
                entry_info = {}
                for d in deals:
                    if d.entry == 0 and d.position_id > 0:
                        entry_info[d.position_id] = {
                            "comment": d.comment,
                            "price": d.price,
                            "time": datetime.fromtimestamp(d.time).strftime("%Y-%m-%d %H:%M:%S")
                        }
                
                real_deals = []
                for d in deals:
                    # Filter only closed trading deals (excluding balance deposits/withdrawals)
                    # entry: 0=buy/sell open, 1=close
                    if d.entry == 1:
                        info = entry_info.get(d.position_id, {})
                        orig_comment = info.get("comment", d.comment) or "Exness Real Close"
                        open_price = info.get("price", d.price)
                        open_time = info.get("time", datetime.fromtimestamp(d.time).strftime("%Y-%m-%d %H:%M:%S"))
                        
                        real_deals.append({
                            "ticket": d.position_id,
                            "symbol": d.symbol,
                            "type": "buy" if d.type == 1 else "sell", # Close deal type is opposite
                            "volume": d.volume,
                            "open_price": open_price,
                            "close_price": d.price,
                            "sl": order_sl_tp.get(d.position_id, {}).get("sl", 0.0),
                            "tp": order_sl_tp.get(d.position_id, {}).get("tp", 0.0),
                            "open_time": open_time,
                            "close_time": datetime.fromtimestamp(d.time).strftime("%Y-%m-%d %H:%M:%S"),
                            "profit": d.profit,
                            "comment": orig_comment
                        })
                # Combine lists, real deals first
                return real_deals + formatted_sim
        except Exception as e:
            print(f"Failed to fetch real MT5 history: {e}")
            
    return formatted_sim

@app.get("/api/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    """Fetch user's symbol watchlist."""
    items = db.query(WatchlistItem).filter(WatchlistItem.is_active == True).all()
    return items

@app.post("/api/watchlist")
def add_to_watchlist(req: WatchlistRequest, db: Session = Depends(get_db)):
    """Add a new symbol to watchlist."""
    existing = db.query(WatchlistItem).filter(WatchlistItem.symbol == req.symbol.upper()).first()
    if existing:
        existing.is_active = True
        db.commit()
        return {"success": True, "message": "Symbol reactivated in watchlist."}
        
    item = WatchlistItem(
        symbol=req.symbol.upper(),
        name=req.name,
        asset_type=req.asset_type.lower()
    )
    db.add(item)
    db.commit()
    return {"success": True, "message": "Symbol added to watchlist."}

@app.delete("/api/watchlist/{symbol}")
def remove_from_watchlist(symbol: str, db: Session = Depends(get_db)):
    """Remove symbol from watchlist."""
    item = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
    
    # Soft delete (make inactive)
    item.is_active = False
    db.commit()
    return {"success": True, "message": f"Symbol {symbol} removed from watchlist."}


# --- AI News Agent Endpoints ---

@app.get("/api/news")
def get_news(db: Session = Depends(get_db)):
    """Fetch analyzed economic & war news, with calculated overall market sentiment summary."""
    news_items = db.query(NewsRecord).order_by(NewsRecord.published_at.desc()).limit(30).all()
    
    # Calculate summary metrics of latest news
    bullish_count = 0
    bearish_count = 0
    neutral_count = 0
    has_high_geopolitical_threat = False
    has_medium_threat = False
    
    # Check latest 10 items for a localized mood/threat gauge
    sample_items = news_items[:10]
    for item in sample_items:
        if item.sentiment == "bullish":
            bullish_count += 1
        elif item.sentiment == "bearish":
            bearish_count += 1
        else:
            neutral_count += 1
            
        if item.impact_level == "high" and item.category == "geopolitical":
            has_high_geopolitical_threat = True
        elif item.impact_level in ["high", "medium"]:
            has_medium_threat = True
            
    sentiment_summary = "neutral"
    if bullish_count > bearish_count and bullish_count > neutral_count:
        sentiment_summary = "bullish"
    elif bearish_count > bullish_count and bearish_count > neutral_count:
        sentiment_summary = "bearish"
        
    risk_level = "low"
    if has_high_geopolitical_threat:
        risk_level = "high"
    elif has_medium_threat:
        risk_level = "medium"
        
    return {
        "sentiment_summary": sentiment_summary,
        "risk_level": risk_level,
        "news": [{
            "id": n.id,
            "title": n.title,
            "title_th": n.title_th,
            "summary": n.summary,
            "summary_th": n.summary_th,
            "source": n.source,
            "url": n.url,
            "published_at": n.published_at.isoformat() if n.published_at else None,
            "sentiment": n.sentiment,
            "impact_level": n.impact_level,
            "category": n.category,
            "analysis": n.analysis
        } for n in news_items]
    }


@app.post("/api/news/refresh")
def force_refresh_news():
    """Manually triggers the News Agent to fetch and analyze news instantly."""
    from backend.news_agent import refresh_news_intelligence
    try:
        added_count = refresh_news_intelligence()
        return {"success": True, "added_count": added_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- News Agent Background Worker ---

def news_agent_loop():
    logger = logging.getLogger("NewsAgentWorker")
    logger.info("News Agent background worker thread successfully started.")
    
    # Run once immediately on startup to seed news database
    try:
        from backend.news_agent import refresh_news_intelligence
        refresh_news_intelligence()
    except Exception as e:
        logger.error(f"Error doing initial news seed on startup: {e}")
        
    while True:
        # Sleep for 20 minutes
        time.sleep(1200)
        try:
            refresh_news_intelligence()
        except Exception as e:
            logger.error(f"Error in periodic background news refresh cycle: {e}")


def start_news_agent_worker():
    t = threading.Thread(target=news_agent_loop, daemon=True)
    t.start()


# Initialize and manage bot thread
bot_manager = BotManager()

@app.on_event("startup")
def startup_event():
    bot_manager.start()
    start_news_agent_worker()

@app.on_event("shutdown")
def shutdown_event():
    bot_manager.stop()


# --- Trading Bot Endpoints ---

@app.get("/api/bots")
def get_bots(db: Session = Depends(get_db)):
    """Retrieve all trading bots."""
    return db.query(BotSettings).order_by(BotSettings.created_at.desc()).all()

def serialize_bot(bot: BotSettings):
    return {
        "id": bot.id,
        "name": bot.name,
        "symbol": bot.symbol,
        "timeframe": bot.timeframe,
        "algorithms": bot.algorithms,
        "signal_mode": bot.signal_mode,
        "lot_size": bot.lot_size,
        "sl_points": bot.sl_points,
        "tp_points": bot.tp_points,
        "active_ticket": bot.active_ticket,
        "is_running": bot.is_running,
        "use_trend_filter": bot.use_trend_filter,
        "use_atr_sizing": bot.use_atr_sizing,
        "use_news_filter": getattr(bot, "use_news_filter", False),
        "risk_percent": bot.risk_percent,
        "allowed_sessions": bot.allowed_sessions,
        "created_at": bot.created_at.isoformat() if bot.created_at else None
    }

@app.post("/api/bots")
def create_bot(req: BotCreateRequest, db: Session = Depends(get_db)):
    """Create a new algorithmic trading bot."""
    bot = BotSettings(
        name=req.name,
        symbol=req.symbol.upper(),
        timeframe=req.timeframe,
        algorithms=req.algorithm,
        signal_mode=req.signal_mode,
        lot_size=req.lot_size,
        sl_points=req.sl_points,
        tp_points=req.tp_points,
        use_trend_filter=req.use_trend_filter,
        use_atr_sizing=req.use_atr_sizing,
        use_news_filter=req.use_news_filter,
        risk_percent=req.risk_percent,
        allowed_sessions=req.allowed_sessions,
        is_running=False
    )
    db.add(bot)
    db.commit()
    db.refresh(bot)
    
    # Save an initial log message
    log_entry = BotLog(
        bot_id=bot.id, 
        message=f"บอท {bot.name} ถูกสร้างขึ้นเรียบร้อยแล้ว! อัลกอริทึม: {bot.algorithms}", 
        log_type="info"
    )
    db.add(log_entry)
    db.commit()
    
    return serialize_bot(bot)

@app.put("/api/bots/{bot_id}")
def update_bot(bot_id: int, req: BotCreateRequest, db: Session = Depends(get_db)):
    """Update an existing trading bot's parameters."""
    bot = db.query(BotSettings).filter(BotSettings.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
        
    # Log the changes
    changes = []
    if bot.name != req.name: changes.append(f"ชื่อ: {bot.name} -> {req.name}")
    if bot.symbol != req.symbol.upper(): changes.append(f"สินทรัพย์: {bot.symbol} -> {req.symbol.upper()}")
    if bot.timeframe != req.timeframe: changes.append(f"Timeframe: {bot.timeframe} -> {req.timeframe}")
    if bot.algorithms != req.algorithm: changes.append(f"กลยุทธ์: {bot.algorithms} -> {req.algorithm}")
    if bot.signal_mode != req.signal_mode: changes.append(f"โหมดสัญญาณ: {bot.signal_mode} -> {req.signal_mode}")
    if bot.lot_size != req.lot_size: changes.append(f"ขนาด Lot: {bot.lot_size} -> {req.lot_size}")
    if bot.sl_points != req.sl_points: changes.append(f"SL: {bot.sl_points} -> {req.sl_points}")
    if bot.tp_points != req.tp_points: changes.append(f"TP: {bot.tp_points} -> {req.tp_points}")
    if bot.use_trend_filter != req.use_trend_filter: changes.append(f"Trend Filter: {bot.use_trend_filter} -> {req.use_trend_filter}")
    if bot.use_atr_sizing != req.use_atr_sizing: changes.append(f"ATR Sizing: {bot.use_atr_sizing} -> {req.use_atr_sizing}")
    if getattr(bot, "use_news_filter", False) != req.use_news_filter: changes.append(f"AI News Filter: {getattr(bot, 'use_news_filter', False)} -> {req.use_news_filter}")
    if bot.risk_percent != req.risk_percent: changes.append(f"Risk %: {bot.risk_percent} -> {req.risk_percent}")
    if bot.allowed_sessions != req.allowed_sessions: changes.append(f"Sessions: {bot.allowed_sessions} -> {req.allowed_sessions}")

    bot.name = req.name
    bot.symbol = req.symbol.upper()
    bot.timeframe = req.timeframe
    bot.algorithms = req.algorithm
    bot.signal_mode = req.signal_mode
    bot.lot_size = req.lot_size
    bot.sl_points = req.sl_points
    bot.tp_points = req.tp_points
    bot.use_trend_filter = req.use_trend_filter
    bot.use_atr_sizing = req.use_atr_sizing
    bot.use_news_filter = req.use_news_filter
    bot.risk_percent = req.risk_percent
    bot.allowed_sessions = req.allowed_sessions
    
    db.commit()
    db.refresh(bot)
    
    if changes:
        log_entry = BotLog(
            bot_id=bot.id, 
            message=f"บอทถูกแก้ไขการตั้งค่า: {', '.join(changes)}", 
            log_type="info"
        )
        db.add(log_entry)
        db.commit()
        
    return serialize_bot(bot)

@app.put("/api/bots/{bot_id}/toggle")
def toggle_bot(bot_id: int, db: Session = Depends(get_db)):
    """Toggle a bot ON or OFF."""
    bot = db.query(BotSettings).filter(BotSettings.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
        
    bot.is_running = not bot.is_running
    
    # If we stop the bot, we also clear the active ticket tracking
    status_str = "เปิดใช้งาน (RUNNING)" if bot.is_running else "ปิดใช้งาน (STOPPED)"
    if not bot.is_running:
        bot.active_ticket = None
        
    db.commit()
    
    # Log event
    log_entry = BotLog(
        bot_id=bot.id, 
        message=f"ระบบบอทถูกเปลี่ยนสถานะเป็น: {status_str}", 
        log_type="info"
    )
    db.add(log_entry)
    db.commit()
    
    return bot

@app.delete("/api/bots/{bot_id}")
def delete_bot(bot_id: int, db: Session = Depends(get_db)):
    """Delete a bot and all its logs."""
    bot = db.query(BotSettings).filter(BotSettings.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
        
    # Delete bot logs
    db.query(BotLog).filter(BotLog.bot_id == bot_id).delete()
    
    # Delete bot
    db.delete(bot)
    db.commit()
    return {"success": True, "message": f"Bot {bot_id} deleted successfully."}

@app.get("/api/bots/{bot_id}/logs")
def get_bot_logs(bot_id: int, db: Session = Depends(get_db)):
    """Retrieve operational logs for a specific bot."""
    logs = db.query(BotLog).filter(BotLog.bot_id == bot_id).order_by(BotLog.timestamp.desc()).limit(50).all()
    return [{
        "id": l.id,
        "bot_id": l.bot_id,
        "timestamp": (l.timestamp + timedelta(hours=7)).strftime("%Y-%m-%d %H:%M:%S"),
        "message": l.message,
        "log_type": l.log_type
    } for l in logs]


# --- Backtesting Engine ---

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    count: int = 500
    algorithm: str
    signal_mode: str = "or"
    lot_size: float = 0.1
    sl_points: float = 0.0
    tp_points: float = 0.0
    initial_balance: float = 10000.0


def get_point_multiplier(symbol: str) -> float:
    symbol_upper = symbol.upper()
    if "XAU" in symbol_upper or "GOLD" in symbol_upper:
        return 100.0
    elif "USD" in symbol_upper or symbol_upper in ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDCAD", "USDCHF"]:
        return 100000.0
    elif "JPY" in symbol_upper:
        return 1000.0
    else:
        return 1.0


@app.post("/api/backtest")
def run_backtest(req: BacktestRequest):
    """
    Simulates a high-fidelity step-by-step historical backtest.
    Respects previous candle bounds strictly to prevent look-ahead bias.
    """
    try:
        # Fetch candles using the mapped timeframe constants (supports M1, M5, M15, M30, H1, H4, D1)
        candles = mt5_manager.get_historical_candles(req.symbol, req.timeframe, req.count)
        if not candles or len(candles) < 40:
            raise HTTPException(status_code=400, detail="ข้อมูลดิบแท่งเทียนมีไม่เพียงพอสำหรับการทดสอบย้อนหลัง (ต้องการอย่างน้อย 40 แท่ง)")
            
        from backend.trading_bot import evaluate_multi_signals
        
        balance = req.initial_balance
        equity_curve = [{"time": candles[0]["time"], "value": balance}]
        
        active_trade = None
        trades_history = []
        ticket_counter = 100000
        
        algorithms_list = [a.strip() for a in req.algorithm.split(",") if a.strip()]
        multiplier = get_point_multiplier(req.symbol)
        
        # Start at index 35 so indicators like EMA/RSI have enough initialization data
        for i in range(35, len(candles)):
            current_candle = candles[i]
            current_price = current_candle["close"]
            current_time = current_candle["time"]
            
            # Slice candle histories up to current loop step to simulate zero-bias environment
            candles_slice = candles[:i+1]
            close_prices_slice = [c["close"] for c in candles_slice]
            
            # 1. Manage active trade
            if active_trade:
                t_type = active_trade["type"]
                open_p = active_trade["open_price"]
                sl = active_trade["sl"]
                tp = active_trade["tp"]
                
                # Check for TP / SL hits inside the current candle boundaries
                hit_tp = False
                hit_sl = False
                
                high_p = current_candle["high"]
                low_p = current_candle["low"]
                
                if t_type == "buy":
                    if tp > 0 and high_p >= tp:
                        hit_tp = True
                    elif sl > 0 and low_p <= sl:
                        hit_sl = True
                else: # sell
                    if tp > 0 and low_p <= tp:
                        hit_tp = True
                    elif sl > 0 and high_p >= sl:
                        hit_sl = True
                        
                # Check for opposite exit signals
                opp_signal = False
                sig = evaluate_multi_signals(close_prices_slice, algorithms_list, req.signal_mode, candles=candles_slice)
                if t_type == "buy" and sig == "sell":
                    opp_signal = True
                elif t_type == "sell" and sig == "buy":
                    opp_signal = True
                    
                if hit_tp or hit_sl or opp_signal:
                    # Close trade
                    close_p = current_price
                    close_reason = "Opposite Signal"
                    if hit_tp:
                        close_p = tp
                        close_reason = "Take Profit"
                    elif hit_sl:
                        close_p = sl
                        close_reason = "Stop Loss"
                        
                    # Compute simulated gain/loss
                    if t_type == "buy":
                        pnl = (close_p - open_p) * req.lot_size * multiplier
                    else:
                        pnl = (open_p - close_p) * req.lot_size * multiplier
                        
                    balance += pnl
                    
                    trades_history.append({
                        "ticket": active_trade["ticket"],
                        "type": t_type,
                        "open_time": active_trade["open_time"],
                        "close_time": datetime.fromtimestamp(current_time).strftime("%Y-%m-%d %H:%M:%S"),
                        "open_price": open_p,
                        "close_price": close_p,
                        "profit": round(pnl, 2),
                        "result": "win" if pnl >= 0 else "loss",
                        "reason": close_reason
                    })
                    
                    equity_curve.append({
                        "time": current_time,
                        "value": round(balance, 2)
                    })
                    
                    active_trade = None
                    
            # 2. Look for new trades if none active
            if not active_trade:
                sig = evaluate_multi_signals(close_prices_slice, algorithms_list, req.signal_mode, candles=candles_slice)
                if sig in ["buy", "sell"]:
                    sl_p = 0.0
                    tp_p = 0.0
                    
                    if sig == "buy":
                        if req.sl_points > 0: sl_p = current_price - req.sl_points
                        if req.tp_points > 0: tp_p = current_price + req.tp_points
                    else: # sell
                        if req.sl_points > 0: sl_p = current_price + req.sl_points
                        if req.tp_points > 0: tp_p = current_price - req.tp_points
                        
                    active_trade = {
                        "ticket": ticket_counter,
                        "type": sig,
                        "open_price": current_price,
                        "open_time": datetime.fromtimestamp(current_time).strftime("%Y-%m-%d %H:%M:%S"),
                        "sl": sl_p,
                        "tp": tp_p
                    }
                    ticket_counter += 1
                    
        # Force close remaining open trade at final candle close
        if active_trade:
            t_type = active_trade["type"]
            open_p = active_trade["open_price"]
            close_p = candles[-1]["close"]
            
            if t_type == "buy":
                pnl = (close_p - open_p) * req.lot_size * multiplier
            else:
                pnl = (open_p - close_p) * req.lot_size * multiplier
                
            balance += pnl
            
            trades_history.append({
                "ticket": active_trade["ticket"],
                "type": t_type,
                "open_time": active_trade["open_time"],
                "close_time": datetime.fromtimestamp(candles[-1]["time"]).strftime("%Y-%m-%d %H:%M:%S"),
                "open_price": open_p,
                "close_price": close_p,
                "profit": round(pnl, 2),
                "result": "win" if pnl >= 0 else "loss",
                "reason": "End of Data"
            })
            
            equity_curve.append({
                "time": candles[-1]["time"],
                "value": round(balance, 2)
            })
            
        wins = [t for t in trades_history if t["profit"] >= 0]
        losses = [t for t in trades_history if t["profit"] < 0]
        win_rate = (len(wins) / len(trades_history) * 100) if trades_history else 0.0
        
        return {
            "symbol": req.symbol,
            "timeframe": req.timeframe,
            "algorithm": req.algorithm,
            "initial_balance": req.initial_balance,
            "final_balance": round(balance, 2),
            "net_profit": round(balance - req.initial_balance, 2),
            "total_trades": len(trades_history),
            "win_rate": round(win_rate, 1),
            "wins_count": len(wins),
            "losses_count": len(losses),
            "trades": trades_history,  # ordered chronologically
            "equity_curve": equity_curve
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Serve Static React Frontend ---

# Check if static directory exists; if not, create it
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "css"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "js"), exist_ok=True)

# Mount StaticFiles for CSS/JS
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    """Main route serving our modern React dashboard."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "Running",
        "message": "FastAPI is running! The React frontend is being generated. Please refresh in a moment."
    }

if __name__ == "__main__":
    import uvicorn
    print(f"Starting MT5 Exness Trading Server on http://{HOST}:{PORT}")
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
