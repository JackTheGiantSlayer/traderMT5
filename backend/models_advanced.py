from sqlalchemy import Column, Integer, String, Float, DateTime, BigInteger, UniqueConstraint
from datetime import datetime
from backend.database import Base

class HistoricalCandle(Base):
    __tablename__ = "historical_candles"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timeframe = Column(String(10), index=True, nullable=False)
    time = Column(BigInteger, index=True, nullable=False)  # Unix timestamp
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("symbol", "timeframe", "time", name="uq_candle_sym_tf_time"),
    )

class AdvancedBacktestRun(Base):
    __tablename__ = "advanced_backtest_runs"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    timeframe = Column(String(10), nullable=False)
    algorithm = Column(String(200), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    initial_balance = Column(Float, nullable=False)
    final_balance = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    win_rate = Column(Float, nullable=False)
    total_trades = Column(Integer, nullable=False)
    max_drawdown = Column(Float, nullable=False)
    max_drawdown_percent = Column(Float, nullable=False)
    profit_factor = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AdvancedBacktestTrade(Base):
    __tablename__ = "advanced_backtest_trades"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, nullable=False, index=True)
    ticket = Column(Integer, nullable=False)
    type = Column(String(10), nullable=False)  # 'buy' or 'sell'
    open_time = Column(DateTime, nullable=False)
    close_time = Column(DateTime, nullable=False)
    open_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    sl = Column(Float, nullable=True, default=0.0)
    tp = Column(Float, nullable=True, default=0.0)
    profit = Column(Float, nullable=False)
    result = Column(String(10), nullable=False)  # 'win' or 'loss'
    reason = Column(String(100), nullable=True)
