import os
import asyncio
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from backend.config import HOST, PORT, STATIC_DIR, MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, ENCRYPTION_KEY, encrypt_password, decrypt_password
from backend.database import engine, Base, get_db
from backend.models import AccountSettings, TradeHistoryRecord, WatchlistItem, BotSettings, BotLog, NewsRecord
from backend.models_advanced import HistoricalCandle, AdvancedBacktestRun, AdvancedBacktestTrade
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
            
        if "last_traded_pattern_time" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN last_traded_pattern_time INTEGER DEFAULT 0"))
            print("Database Migration: Successfully added 'last_traded_pattern_time' column.")

        if "pj_tp_target" not in columns:
            conn.execute(text("ALTER TABLE bot_settings ADD COLUMN pj_tp_target VARCHAR(20) DEFAULT 'manual'"))
            print("Database Migration: Successfully added 'pj_tp_target' column to 'bot_settings' table.")
            
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

        # AccountSettings self-healing migration
        account_columns = [col['name'] for col in inspector.get_columns('account_settings')]
        if "encrypted_password" not in account_columns:
            conn.execute(text("ALTER TABLE account_settings ADD COLUMN encrypted_password VARCHAR(250) NULL"))
            print("Database Migration: Successfully added 'encrypted_password' column to 'account_settings' table.")
        if "is_active" not in account_columns:
            conn.execute(text("ALTER TABLE account_settings ADD COLUMN is_active BOOLEAN DEFAULT 0"))
            print("Database Migration: Successfully added 'is_active' column to 'account_settings' table.")
        if "created_at" not in account_columns:
            conn.execute(text("ALTER TABLE account_settings ADD COLUMN created_at DATETIME NULL"))
            print("Database Migration: Successfully added 'created_at' column to 'account_settings' table.")
except Exception as e:
    print(f"Database Migration Warning: {e}")


# Proactive data migration for legacy accounts in database
db = next(get_db())
try:
    # 1. Seed default account from .env if table is empty and .env has login credentials
    if db.query(AccountSettings).count() == 0 and MT5_LOGIN and MT5_PASSWORD:
        default_acc = AccountSettings(
            login=int(MT5_LOGIN),
            server=MT5_SERVER,
            encrypted_password=encrypt_password(MT5_PASSWORD),
            auto_connect=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(default_acc)
        db.commit()
        print(f"Database Seeding: Proactively seeded active account {MT5_LOGIN} from .env.")
        
    # 2. Update any existing accounts in DB that are missing encrypted_password
    legacy_accounts = db.query(AccountSettings).filter(AccountSettings.encrypted_password == None).all()
    if legacy_accounts:
        for acc in legacy_accounts:
            # If MT5_PASSWORD from .env is set, encrypt and seed it
            if MT5_PASSWORD:
                acc.encrypted_password = encrypt_password(MT5_PASSWORD)
                acc.is_active = True
                acc.created_at = datetime.utcnow()
                print(f"Database Seeding: Migrated legacy account {acc.login} using .env MT5_PASSWORD.")
            else:
                db.delete(acc)
                print(f"Database Seeding: Deleted legacy account {acc.login} with no available password.")
        db.commit()
except Exception as e:
    print(f"Database Seeding Error: {e}")
finally:
    db.close()


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
    title="MT5 Trader API",
    description="Backend for stock and gold trading web application connected to MetaTrader 5.",
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

# Startup Auto-connect sequence using database settings
connected = False
db = next(get_db())
try:
    active_acc = db.query(AccountSettings).filter(AccountSettings.is_active == True, AccountSettings.auto_connect == True).first()
    if active_acc and active_acc.encrypted_password:
        try:
            decrypted_password = decrypt_password(active_acc.encrypted_password)
            if decrypted_password:
                success = mt5_manager.connect(active_acc.login, decrypted_password, active_acc.server)
                if success:
                    print(f"Auto-connected to active Exness MT5 Account {active_acc.login} from database.")
                    connected = True
                    active_acc.last_connected = datetime.utcnow()
                    db.commit()
        except Exception as e:
            print(f"Auto-connect to active DB account {active_acc.login} failed: {e}")
except Exception as e:
    print(f"Error querying active account for startup auto-connect: {e}")
finally:
    db.close()

# Fallback to .env default credentials if no active account was connected
if not connected and MT5_LOGIN and MT5_PASSWORD and MT5_SERVER:
    try:
        mt5_manager.connect(int(MT5_LOGIN), MT5_PASSWORD, MT5_SERVER)
        print(f"Auto-connected to Exness MT5 Account {MT5_LOGIN} using .env fallback credentials.")
    except Exception as e:
        print(f"Auto-connect using .env fallback failed: {e}. Running in Simulation Mode.")

# --- API Models ---
class ConnectionRequest(BaseModel):
    login: int
    password: str
    server: str
    auto_connect: bool = False

class AccountCreateRequest(BaseModel):
    login: int
    password: str
    server: str
    auto_connect: bool = False
    is_active: bool = False

class AccountUpdateRequest(BaseModel):
    server: str = None
    auto_connect: bool = None
    password: str = None

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
    pj_tp_target: str = "manual"
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
    """Logs into the user's Exness MT5 account (Legacy compatibility wrapper)."""
    try:
        success = mt5_manager.connect(req.login, req.password, req.server)
        if success:
            # Encrypt password
            encrypted_password = encrypt_password(req.password)
            if not encrypted_password:
                raise Exception("Failed to encrypt account credentials.")
                
            # Deactivate all other accounts
            db.query(AccountSettings).update({AccountSettings.is_active: False})
            
            # Save or update settings in database
            settings = db.query(AccountSettings).filter(AccountSettings.login == req.login).first()
            if not settings:
                settings = AccountSettings(
                    login=req.login,
                    server=req.server,
                    encrypted_password=encrypted_password,
                    auto_connect=req.auto_connect,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    last_connected=datetime.utcnow()
                )
                db.add(settings)
            else:
                settings.server = req.server
                settings.encrypted_password = encrypted_password
                settings.auto_connect = req.auto_connect
                settings.is_active = True
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

# --- Secure Multi-Account API Group ---

@app.get("/api/mt5/accounts")
def get_mt5_accounts(db: Session = Depends(get_db)):
    """Retrieve all saved Exness accounts without exposing raw or encrypted passwords."""
    accounts = db.query(AccountSettings).order_by(AccountSettings.created_at.desc()).all()
    return [{
        "id": a.id,
        "login": a.login,
        "server": a.server,
        "is_active": a.is_active,
        "auto_connect": a.auto_connect,
        "last_connected": a.last_connected.isoformat() if a.last_connected else None,
        "created_at": a.created_at.isoformat() if a.created_at else None
    } for a in accounts]

@app.post("/api/mt5/accounts")
def add_mt5_account(req: AccountCreateRequest, db: Session = Depends(get_db)):
    """Add a new Exness account to database, password is encrypted using AES-256 Fernet."""
    existing = db.query(AccountSettings).filter(AccountSettings.login == req.login).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"บัญชีหมายเลข {req.login} มีอยู่ในระบบแล้ว")
        
    encrypted_pw = encrypt_password(req.password)
    if not encrypted_pw:
        raise HTTPException(status_code=500, detail="ระบบขัดข้อง: ไม่สามารถเข้ารหัสผ่านบัญชีได้")
        
    # If this is set to active, make all other accounts inactive
    if req.is_active:
        db.query(AccountSettings).update({AccountSettings.is_active: False})
        
    new_acc = AccountSettings(
        login=req.login,
        server=req.server,
        encrypted_password=encrypted_pw,
        auto_connect=req.auto_connect,
        is_active=req.is_active,
        created_at=datetime.utcnow()
    )
    db.add(new_acc)
    db.commit()
    db.refresh(new_acc)
    
    return {"success": True, "message": "เพิ่มบัญชีเรียบร้อยแล้ว", "account_id": new_acc.id}

@app.put("/api/mt5/accounts/{account_id}")
def update_mt5_account(account_id: int, req: AccountUpdateRequest, db: Session = Depends(get_db)):
    """Edit an existing Exness account properties in database."""
    account = db.query(AccountSettings).filter(AccountSettings.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีที่ต้องการแก้ไข")
        
    if req.server is not None:
        account.server = req.server
    if req.auto_connect is not None:
        account.auto_connect = req.auto_connect
        
    if req.password is not None and req.password.strip() != "":
        encrypted_pw = encrypt_password(req.password)
        if not encrypted_pw:
            raise HTTPException(status_code=500, detail="ระบบขัดข้อง: ไม่สามารถเข้ารหัสผ่านใหม่ได้")
        account.encrypted_password = encrypted_pw
        
    db.commit()
    return {"success": True, "message": "อัปเดตข้อมูลบัญชีเรียบร้อยแล้ว"}

@app.post("/api/mt5/accounts/{account_id}/activate")
def activate_mt5_account(account_id: int, db: Session = Depends(get_db)):
    """Switch connection to this Exness account, decrypting password and establishing live link in MT5."""
    account = db.query(AccountSettings).filter(AccountSettings.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีที่ต้องการเปิดใช้งาน")
        
    decrypted_pw = decrypt_password(account.encrypted_password)
    if not decrypted_pw:
        raise HTTPException(status_code=500, detail="ระบบขัดข้อง: ไม่สามารถถอดรหัสผ่านเพื่อเชื่อมต่อได้")
        
    # Disconnect current connection first
    mt5_manager.disconnect()
    
    try:
        success = mt5_manager.connect(account.login, decrypted_pw, account.server)
        if success:
            # Set all other accounts to inactive
            db.query(AccountSettings).update({AccountSettings.is_active: False})
            account.is_active = True
            account.last_connected = datetime.utcnow()
            db.commit()
            return {
                "success": True, 
                "message": f"สลับบัญชีและเชื่อมต่อ MT5 พอร์ตหมายเลข {account.login} สำเร็จเรียบร้อยแล้ว!",
                "account": account.login
            }
        else:
            raise Exception("การตรวจสอบสิทธิ์ MT5 ล้มเหลว")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"เชื่อมต่อไม่สำเร็จ: {str(e)}")

@app.delete("/api/mt5/accounts/{account_id}")
def delete_mt5_account(account_id: int, db: Session = Depends(get_db)):
    """Delete an Exness account. If active, safely disconnects first."""
    account = db.query(AccountSettings).filter(AccountSettings.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="ไม่พบบัญชีที่ต้องการลบ")
        
    # If active, disconnect to return to Simulation Mode
    if account.is_active:
        mt5_manager.disconnect()
        
    db.delete(account)
    db.commit()
    return {"success": True, "message": "ลบบัญชีออกจากระบบเรียบร้อยแล้ว"}

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

@app.websocket("/ws/live-data")
async def websocket_live_data(
    websocket: WebSocket,
    symbol: str = "XAUUSD",
    timeframes: str = "H1",
    watchlist: str = "XAUUSD"
):
    await websocket.accept()
    
    tfs = [tf.strip() for tf in timeframes.split(",") if tf.strip()]
    watchlist_syms = [s.strip() for s in watchlist.split(",") if s.strip()]
    
    # Cache D1 change percentages to minimize heavy copy_rates calls
    d1_change_cache = {}
    counter = 0
    
    try:
        while True:
            # 1. Fetch watchlist prices (every 0.5 seconds)
            watchlist_data = {}
            # Update D1 change percentage cache every 10 ticks (5.0 seconds at 0.5s loop interval)
            update_d1 = (counter % 10 == 0)
            
            for sym in watchlist_syms:
                price_info = mt5_manager.get_symbol_price(sym)
                
                if update_d1 or sym not in d1_change_cache:
                    try:
                        candles_d1 = mt5_manager.get_historical_candles(sym, "D1", 2)
                        change_pct = 0.0
                        if len(candles_d1) >= 2:
                            change_pct = ((candles_d1[-1]["close"] - candles_d1[-2]["close"]) / candles_d1[-2]["close"]) * 100
                        d1_change_cache[sym] = f"{change_pct:.2f}"
                    except Exception as d1_err:
                        if sym not in d1_change_cache:
                            d1_change_cache[sym] = "0.00"
                            
                watchlist_data[sym] = {
                    "bid": price_info["bid"],
                    "ask": price_info["ask"],
                    "change": d1_change_cache.get(sym, "0.00")
                }
                
            # 2. Fetch chart candle updates (every tick = 0.5 seconds)
            chart_data = {}
            for tf in tfs:
                try:
                    candles_tf = mt5_manager.get_historical_candles(symbol, tf, 1)
                    if candles_tf:
                        chart_data[tf] = candles_tf[0]
                except Exception as chart_err:
                    pass
                        
            # 3. Send combined payload
            await websocket.send_json({
                "watchlist": watchlist_data,
                "charts": chart_data
            })
            
            counter += 1
            # Wait for 0.5 seconds before next push
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass


@app.get("/api/mt5/pj-levels")
def get_pj_levels(
    symbol: str = Query(..., description="Asset symbol like XAUUSD"),
    timeframe: str = Query("H1", description="Timeframe M1, M5, M15, M30, H1, D1")
):
    """Retrieve the current calculated PJ Indicator dynamic SL and TP distances (TP1, TP1.5, TP2, TP2.5, TP3)."""
    try:
        # We need at least 150 candles (55 candles minimum for PJ + 50 ATR SMA = 105 candles total)
        candles = mt5_manager.get_historical_candles(symbol, timeframe, count=150)
        if not candles or len(candles) < 105:
            raise HTTPException(status_code=400, detail="ข้อมูลแท่งเทียนไม่เพียงพอสำหรับการคำนวณ PJ levels")
            
        from backend.pattern_detector import calculate_pj_dynamic_levels
        # order_type doesn't affect the sl_dist or tp_dist magnitude, it just calculates risk and risk * tp_mult.
        sl_tp1 = calculate_pj_dynamic_levels(candles, "buy", "tp1")
        sl_tp1_5 = calculate_pj_dynamic_levels(candles, "buy", "tp1_5")
        sl_tp2 = calculate_pj_dynamic_levels(candles, "buy", "tp2")
        sl_tp2_5 = calculate_pj_dynamic_levels(candles, "buy", "tp2_5")
        sl_tp3 = calculate_pj_dynamic_levels(candles, "buy", "tp3")
        
        if not sl_tp1 or sl_tp1[0] is None:
            raise HTTPException(status_code=400, detail="ไม่สามารถคำนวณ PJ dynamic levels ได้")
            
        # Get ATR and ATR ratio for metadata
        from backend.pattern_detector import calculate_atr
        atr_vals = calculate_atr(candles, 14)
        atr_sma_vals = []
        for i in range(len(atr_vals)):
            sub = atr_vals[max(0, i - 49) : i + 1]
            valid_sub = [x for x in sub if x is not None]
            if len(valid_sub) < 50:
                atr_sma_vals.append(None)
            else:
                atr_sma_vals.append(sum(valid_sub) / 50)
        atr_val = atr_vals[-2]
        atr_sma = atr_sma_vals[-2]
        atr_ratio = atr_val / atr_sma if (atr_val is not None and atr_sma is not None and atr_sma > 0) else 1.0
        
        # Calculate dynamic multiplier
        atr_mult = 1.5
        if atr_ratio > 1.5:
            dynamic_mult = atr_mult * 0.8
        elif atr_ratio < 0.7:
            dynamic_mult = atr_mult * 1.2
        else:
            dynamic_mult = atr_mult
            
        return {
            "success": True,
            "symbol": symbol,
            "timeframe": timeframe,
            "latest_close": candles[-1]["close"],
            "atr": atr_val,
            "atr_sma": atr_sma,
            "atr_ratio": atr_ratio,
            "dynamic_multiplier": dynamic_mult,
            "sl": round(sl_tp1[0], 4),
            "tp1": round(sl_tp1[1], 4),
            "tp1_5": round(sl_tp1_5[1], 4),
            "tp2": round(sl_tp2[1], 4),
            "tp2_5": round(sl_tp2_5[1], 4),
            "tp3": round(sl_tp3[1], 4)
        }
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
                is_manual = not comment or comment.lower() in ['manual', 'simulation'] or 'real close' in comment.lower() or 'close via' in comment.lower() or 'mt5 trader' in comment.lower()
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
            "open_time_raw": int(t.open_time.timestamp()),
            "close_time_raw": int(t.close_time.timestamp()),
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
                            "time": datetime.fromtimestamp(d.time).strftime("%Y-%m-%d %H:%M:%S"),
                            "time_raw": d.time
                        }
                
                real_deals = []
                for d in deals:
                    # Filter only closed trading deals (excluding balance deposits/withdrawals)
                    # entry: 0=buy/sell open, 1=close
                    if d.entry == 1:
                        info = entry_info.get(d.position_id, {})
                        orig_comment = info.get("comment", d.comment) or "MT5 Trader Real Close"
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
                            "open_time_raw": info.get("time_raw", d.time),
                            "close_time_raw": d.time,
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
        "pj_tp_target": getattr(bot, "pj_tp_target", "manual"),
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
        pj_tp_target=req.pj_tp_target,
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
    if getattr(bot, "pj_tp_target", "manual") != req.pj_tp_target: changes.append(f"PJ TP Target: {getattr(bot, 'pj_tp_target', 'manual')} -> {req.pj_tp_target}")
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
    bot.pj_tp_target = req.pj_tp_target
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
    pj_tp_target: str = "manual"
    initial_balance: float = 10000.0
    allowed_sessions: str = "all"


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
            
            # Apply Session Time Filter inside backtest loop
            allowed_sess = getattr(req, "allowed_sessions", "all")
            is_allowed = True
            if allowed_sess != "all":
                is_allowed = False
                utc_hour = datetime.fromtimestamp(current_time, timezone.utc).hour
                sessions_list = [s.strip().lower() for s in allowed_sess.split(",") if s.strip()]
                for s in sessions_list:
                    if s == "asian" and (0 <= utc_hour < 8):
                        is_allowed = True
                    elif s == "london" and (8 <= utc_hour < 16):
                        is_allowed = True
                    elif s == "newyork" and (13 <= utc_hour < 21):
                        is_allowed = True
                    elif s == "london_ny" and (13 <= utc_hour < 16):
                        is_allowed = True
            
            # Slice candle histories up to current loop step to simulate zero-bias environment
            # Cap lookback to 300 candles to optimize indicator computation time and avoid O(N^2) complexity
            candles_slice = candles[max(0, i - 299) : i+1]
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
                sig = evaluate_multi_signals(close_prices_slice, algorithms_list, req.signal_mode, candles=candles_slice, symbol=req.symbol, timeframe=req.timeframe)
                if not is_allowed:
                    sig = "none"
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
                        "open_timestamp": active_trade["open_timestamp"],
                        "close_time": datetime.fromtimestamp(current_time, timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                        "close_timestamp": current_time,
                        "open_price": open_p,
                        "close_price": close_p,
                        "sl": active_trade.get("sl", 0.0),
                        "tp": active_trade.get("tp", 0.0),
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
                sig = evaluate_multi_signals(close_prices_slice, algorithms_list, req.signal_mode, candles=candles_slice, symbol=req.symbol, timeframe=req.timeframe)
                if not is_allowed:
                    sig = "none"
                if sig in ["buy", "sell"]:
                    sl_p = 0.0
                    tp_p = 0.0
                    
                    pj_tp_target = getattr(req, "pj_tp_target", "manual")
                    is_wave_strategy = any(algo in ["elliott_wave", "harmonic_patterns"] for algo in algorithms_list)
                    
                    if pj_tp_target and pj_tp_target != "manual":
                        from backend.pattern_detector import calculate_pj_dynamic_levels
                        sl_dist, tp_dist = calculate_pj_dynamic_levels(candles_slice, sig, pj_tp_target)
                        if sl_dist is not None and tp_dist is not None:
                            if sig == "buy":
                                sl_p = current_price - sl_dist
                                tp_p = current_price + tp_dist
                            else: # sell
                                sl_p = current_price + sl_dist
                                tp_p = current_price - tp_dist
                        else:
                            # Fallback if calculation fails
                            if sig == "buy":
                                if req.sl_points > 0: sl_p = current_price - req.sl_points
                                if req.tp_points > 0: tp_p = current_price + req.tp_points
                            else: # sell
                                if req.sl_points > 0: sl_p = current_price + req.sl_points
                                if req.tp_points > 0: tp_p = current_price - req.tp_points
                    elif is_wave_strategy:
                        from backend.pattern_detector import calculate_atr
                        atr_vals = calculate_atr(candles_slice, 14)
                        atr_val = atr_vals[-1] if (atr_vals and atr_vals[-1] is not None) else 0.0
                        if atr_val > 0:
                            sl_dist = 2.0 * atr_val
                            tp_dist = 3.0 * atr_val
                            if sig == "buy":
                                sl_p = current_price - sl_dist
                                tp_p = current_price + tp_dist
                            else: # sell
                                sl_p = current_price + sl_dist
                                tp_p = current_price - tp_dist
                        else:
                            if sig == "buy":
                                if req.sl_points > 0: sl_p = current_price - req.sl_points
                                if req.tp_points > 0: tp_p = current_price + req.tp_points
                            else: # sell
                                if req.sl_points > 0: sl_p = current_price + req.sl_points
                                if req.tp_points > 0: tp_p = current_price - req.tp_points
                    else:
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
                        "open_time": datetime.fromtimestamp(current_time, timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                        "open_timestamp": current_time,
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
                "open_timestamp": active_trade["open_timestamp"],
                "close_time": datetime.fromtimestamp(candles[-1]["time"], timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                "close_timestamp": candles[-1]["time"],
                "open_price": open_p,
                "close_price": close_p,
                "sl": active_trade.get("sl", 0.0),
                "tp": active_trade.get("tp", 0.0),
                "profit": round(pnl, 2),
                "result": "win" if pnl >= 0 else "loss",
                "reason": "End of Data"
            })
            
            equity_curve.append({
                "time": candles[-1]["time"],
                "value": round(balance, 2)
            })
            
        # Calculate extended statistics
        wins = [t for t in trades_history if t["profit"] >= 0]
        losses = [t for t in trades_history if t["profit"] < 0]
        
        gross_profit = sum(t["profit"] for t in wins)
        gross_loss = sum(abs(t["profit"]) for t in losses)
        
        profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else round(gross_profit, 2)
        
        # Max drawdown calculation from equity curve
        peak = req.initial_balance
        max_drawdown = 0.0
        max_drawdown_pct = 0.0
        
        for eq in equity_curve:
            val = eq["value"]
            if val > peak:
                peak = val
            dd = peak - val
            dd_pct = (dd / peak * 100) if peak > 0 else 0.0
            if dd > max_drawdown:
                max_drawdown = dd
            if dd_pct > max_drawdown_pct:
                max_drawdown_pct = dd_pct
                
        # Average Win & Average Loss
        avg_win = round(gross_profit / len(wins), 2) if wins else 0.0
        avg_loss = round(gross_loss / len(losses), 2) if losses else 0.0
        
        # Consecutive wins / losses
        max_consec_wins = 0
        max_consec_losses = 0
        curr_consec_wins = 0
        curr_consec_losses = 0
        
        for t in trades_history:
            if t["profit"] >= 0:
                curr_consec_wins += 1
                curr_consec_losses = 0
                if curr_consec_wins > max_consec_wins:
                    max_consec_wins = curr_consec_wins
            else:
                curr_consec_losses += 1
                curr_consec_wins = 0
                if curr_consec_losses > max_consec_losses:
                    max_consec_losses = curr_consec_losses
                    
        win_rate = (len(wins) / len(trades_history) * 100) if trades_history else 0.0
        net_profit = round(balance - req.initial_balance, 2)
        expectancy = round(net_profit / len(trades_history), 2) if trades_history else 0.0
        
        return {
            "symbol": req.symbol,
            "timeframe": req.timeframe,
            "algorithm": req.algorithm,
            "initial_balance": req.initial_balance,
            "final_balance": round(balance, 2),
            "net_profit": net_profit,
            "total_trades": len(trades_history),
            "win_rate": round(win_rate, 1),
            "wins_count": len(wins),
            "losses_count": len(losses),
            "gross_profit": round(gross_profit, 2),
            "gross_loss": round(gross_loss, 2),
            "profit_factor": profit_factor,
            "max_drawdown": round(max_drawdown, 2),
            "max_drawdown_percent": round(max_drawdown_pct, 2),
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "max_consecutive_wins": max_consec_wins,
            "max_consecutive_losses": max_consec_losses,
            "expectancy": expectancy,
            "trades": trades_history,
            "equity_curve": equity_curve,
            "candles": candles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SyncRequest(BaseModel):
    symbol: str
    timeframe: str
    start_date: str = ""
    end_date: str = ""

@app.post("/api/backtest/sync")
def api_sync_historical_data(req: SyncRequest, db: Session = Depends(get_db)):
    """Downloads historical rates from MT5 terminal or generates fallback mock data and caches them in DB."""
    try:
        from backend.backtest_analyzer import sync_historical_data, get_start_date_for_timeframe
        
        end_dt = datetime.utcnow()
        if req.end_date:
            end_dt = datetime.strptime(req.end_date, "%Y-%m-%d")
            
        if req.start_date:
            start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
        else:
            start_dt = get_start_date_for_timeframe(req.timeframe)
            
        inserted = sync_historical_data(db, req.symbol, req.timeframe, start_dt, end_dt)
        return {
            "success": True,
            "message": f"Successfully synced historical candles for {req.symbol} ({req.timeframe}).",
            "inserted_count": inserted
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

class AdvancedBacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    algorithm: str
    signal_mode: str = "or"
    lot_size: float = 0.1
    sl_points: float = 0.0
    tp_points: float = 0.0
    initial_balance: float = 10000.0
    allowed_sessions: str = "all"
    start_date: str = ""
    end_date: str = ""

@app.post("/api/backtest/advanced")
def api_run_advanced_backtest(req: AdvancedBacktestRequest, db: Session = Depends(get_db)):
    try:
        from backend.backtest_analyzer import run_advanced_backtest, sync_historical_data, get_start_date_for_timeframe
        
        end_dt = datetime.utcnow()
        if req.end_date:
            end_dt = datetime.strptime(req.end_date, "%Y-%m-%d")
            
        if req.start_date:
            start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
        else:
            start_dt = get_start_date_for_timeframe(req.timeframe)
            
        # 1. Sync rates from MT5/mock to database first
        sync_historical_data(db, req.symbol, req.timeframe, start_dt, end_dt)
        
        # 2. Run the advanced backtest using database candles
        result = run_advanced_backtest(
            db=db,
            symbol=req.symbol,
            timeframe=req.timeframe,
            algorithm=req.algorithm,
            signal_mode=req.signal_mode,
            lot_size=req.lot_size,
            sl_points=req.sl_points,
            tp_points=req.tp_points,
            initial_balance=req.initial_balance,
            allowed_sessions=req.allowed_sessions,
            start_dt=start_dt,
            end_dt=end_dt
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

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
