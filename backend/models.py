from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from backend.database import Base

class AccountSettings(Base):
    __tablename__ = "account_settings"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(Integer, unique=True, index=True, nullable=False) # เลขพอร์ต MT5
    server = Column(String(100), nullable=False)                     # Exness Server
    encrypted_password = Column(String(250), nullable=False)         # รหัสผ่านที่เข้ารหัสลับแล้ว
    is_active = Column(Boolean, default=False, index=True)           # เป็นบัญชีที่เลือกใช้งานอยู่หรือไม่
    auto_connect = Column(Boolean, default=False)                    # เชื่อมต่ออัตโนมัติเมื่อสตาร์ทระบบ
    created_at = Column(DateTime, default=datetime.utcnow)
    last_connected = Column(DateTime, nullable=True)

class TradeHistoryRecord(Base):
    __tablename__ = "trade_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer, unique=True, index=True) # MT5 ticket ID
    symbol = Column(String(20), nullable=False)
    order_type = Column(String(10), nullable=False) # 'buy' or 'sell'
    volume = Column(Float, nullable=False) # Lot size
    open_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    sl = Column(Float, nullable=True, default=0.0)
    tp = Column(Float, nullable=True, default=0.0)
    open_time = Column(DateTime, nullable=False)
    close_time = Column(DateTime, nullable=False)
    profit = Column(Float, nullable=False) # Profit or Loss in USD
    comment = Column(String(100), nullable=True)

class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    asset_type = Column(String(20), nullable=False) # 'gold', 'stock', 'forex', 'index'
    is_active = Column(Boolean, default=True)

class BotSettings(Base):
    __tablename__ = "bot_settings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    symbol = Column(String(20), nullable=False)
    timeframe = Column(String(10), default="M1")
    algorithms = Column(String(200), nullable=False)
    signal_mode = Column(String(10), default="or")
    lot_size = Column(Float, default=0.01)
    sl_points = Column(Float, default=0.0)
    tp_points = Column(Float, default=0.0)
    pj_tp_target = Column(String(20), default="manual")
    active_ticket = Column(Integer, nullable=True)
    is_running = Column(Boolean, default=False)
    use_trend_filter = Column(Boolean, default=False)
    use_atr_sizing = Column(Boolean, default=False)
    use_news_filter = Column(Boolean, default=False)
    risk_percent = Column(Float, default=1.0)
    allowed_sessions = Column(String(50), default="all")
    last_traded_pattern_time = Column(Integer, default=0, nullable=True)
    max_hold_hours = Column(Float, default=0.0, nullable=True)
    use_mtf_filter = Column(Boolean, default=False)
    stoch_rsi_len = Column(Integer, default=13, nullable=True)
    stoch_len = Column(Integer, default=13, nullable=True)
    stoch_k = Column(Integer, default=3, nullable=True)
    stoch_d = Column(Integer, default=3, nullable=True)
    macd_fast = Column(Integer, default=12, nullable=True)
    macd_slow = Column(Integer, default=26, nullable=True)
    macd_signal = Column(Integer, default=9, nullable=True)
    pj_min_score = Column(Integer, default=6, nullable=True)
    pj_use_volume = Column(Boolean, default=False, nullable=True)
    pj_vol_multiplier = Column(Float, default=2.0, nullable=True)
    pj_vwap_anchor = Column(String(20), default="Session", nullable=True)
    pj_atr_mult = Column(Float, default=1.5, nullable=True)
    pj_use_dyn_atr = Column(Boolean, default=True, nullable=True)
    pj_cooldown_bars = Column(Integer, default=5, nullable=True)
    pj_min_bars_between = Column(Integer, default=5, nullable=True)
    pj_strict_mtf = Column(Boolean, default=False, nullable=True)
    pj_use_atr_block = Column(Boolean, default=True, nullable=True)
    pj_min_cross_count = Column(Integer, default=1, nullable=True)
    ema_fast = Column(Integer, default=50, nullable=True)
    ema_slow = Column(Integer, default=200, nullable=True)
    adx_len = Column(Integer, default=25, nullable=True)
    adx_threshold = Column(Integer, default=30, nullable=True)
    use_trailing_stop = Column(Boolean, default=False, nullable=True)
    trailing_stop_points = Column(Float, default=0.0, nullable=True)
    use_break_even = Column(Boolean, default=False, nullable=True)
    break_even_trigger_points = Column(Float, default=0.0, nullable=True)
    break_even_lock_points = Column(Float, default=0.0, nullable=True)
    use_partial_tp = Column(Boolean, default=False, nullable=True)
    partial_tp_points = Column(Float, default=0.0, nullable=True)
    partial_tp_ratio = Column(Float, default=0.5, nullable=True)
    is_partial_closed = Column(Boolean, default=False, nullable=True)
    use_regime_filter = Column(Boolean, default=False, nullable=True)
    regime_mode = Column(String(20), default="trend", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BotLog(Base):
    __tablename__ = "bot_logs"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message = Column(String(200), nullable=False)
    log_type = Column(String(20), default="info") # 'info', 'buy', 'sell', 'close', 'error'


class NewsRecord(Base):
    __tablename__ = "news_records"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    title_th = Column(String(300), nullable=True) # Thai translated title
    summary = Column(String(1000), nullable=False)
    summary_th = Column(String(1500), nullable=True) # Thai translated summary
    source = Column(String(50), nullable=False)
    url = Column(String(300), nullable=True)
    published_at = Column(DateTime, nullable=False)
    sentiment = Column(String(20), default="neutral") # 'bullish', 'bearish', 'neutral'
    impact_level = Column(String(20), default="low") # 'high', 'medium', 'low'
    category = Column(String(20), default="general") # 'economic', 'geopolitical', 'general'
    analysis = Column(String(2000), nullable=True) # Detailed AI impact analysis on Gold, USD, Crypto
    created_at = Column(DateTime, default=datetime.utcnow)


