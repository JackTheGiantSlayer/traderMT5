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
from backend.models import AccountSettings, TradeHistoryRecord, WatchlistItem, BotSettings, BotLog
from backend.mt5_manager import MT5Manager
from backend.trading_bot import BotManager
from backend.chatbot import ChatbotAssistant
from sqlalchemy import inspect, text

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
            
        if "risk_percent" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN risk_percent FLOAT DEFAULT 1.0"))
            print("Database Migration: Successfully added 'risk_percent' column.")
            
        if "allowed_sessions" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN allowed_sessions VARCHAR(50) DEFAULT 'all'"))
            print("Database Migration: Successfully added 'allowed_sessions' column.")
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
    count: int = Query(150, description="Number of candles")
):
    """Retrieve detected patterns and swing points for charting."""
    try:
        candles = mt5_manager.get_historical_candles(symbol, timeframe, count)
        if not candles or len(candles) < 20:
            return {
                "swings": [],
                "harmonic": None,
                "elliott": None
            }
            
        from backend.pattern_detector import detect_swings, detect_harmonic_patterns, detect_elliott_waves
        
        swings = detect_swings(candles)
        harmonic = detect_harmonic_patterns(candles)
        elliott = detect_elliott_waves(candles)
        
        return {
            "swings": swings,
            "harmonic": harmonic,
            "elliott": elliott
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

# Initialize and manage bot thread
bot_manager = BotManager()

@app.on_event("startup")
def startup_event():
    bot_manager.start()

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
        "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "message": l.message,
        "log_type": l.log_type
    } for l in logs]

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
