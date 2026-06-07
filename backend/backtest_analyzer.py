import random
import numpy as np
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.models_advanced import HistoricalCandle, AdvancedBacktestRun, AdvancedBacktestTrade
from backend.mt5_manager import MT5Manager, MT5_AVAILABLE
if MT5_AVAILABLE:
    import MetaTrader5 as mt5

# Spacing map in seconds
SPACING_MAP = {"M1": 60, "M5": 300, "M15": 900, "M30": 1800, "H1": 3600, "H4": 14400, "D1": 86400}

def get_start_date_for_timeframe(timeframe: str) -> datetime:
    now = datetime.utcnow()
    tf = timeframe.upper()
    if tf == "M1":
        return now - timedelta(days=6*30)
    elif tf == "M5":
        return now - timedelta(days=365)
    elif tf == "M15":
        return now - timedelta(days=2*365)
    elif tf == "M30":
        return now - timedelta(days=3*365)
    elif tf == "H1":
        return now - timedelta(days=5*365)
    elif tf == "H4":
        return now - timedelta(days=10*365)
    elif tf == "D1":
        return now - timedelta(days=15*365)
    else:
        return now - timedelta(days=30)

def generate_mock_rates(symbol: str, timeframe: str, start_dt: datetime, end_dt: datetime) -> list:
    """Generates high-fidelity mock candlestick data for simulation or offline fallback."""
    spacing = SPACING_MAP.get(timeframe.upper(), 3600)
    start_ts = int(start_dt.replace(tzinfo=timezone.utc).timestamp())
    end_ts = int(end_dt.replace(tzinfo=timezone.utc).timestamp())
    
    # Bound count
    count = (end_ts - start_ts) // spacing
    if count <= 0:
        return []
        
    rates = []
    # Base price lookup
    base_prices = {
        "XAUUSD": 2345.50,
        "AAPL": 185.20,
        "TSLA": 178.50,
        "US500": 5230.10,
        "EURUSD": 1.0820,
        "BTCUSD": 67500.00
    }
    base_price = base_prices.get(symbol.upper(), 100.0)
    current_price = base_price * 0.95
    
    for i in range(count):
        c_time = start_ts + (i * spacing)
        # Random walk with slight upward bias
        change = random.uniform(-0.002, 0.0022)
        target_close = current_price * (1 + change)
        high = max(current_price, target_close) * (1 + random.uniform(0, 0.001))
        low = min(current_price, target_close) * (1 - random.uniform(0, 0.001))
        
        rates.append((
            c_time,
            round(current_price, 5 if "EURUSD" in symbol.upper() else 2),
            round(high, 5 if "EURUSD" in symbol.upper() else 2),
            round(low, 5 if "EURUSD" in symbol.upper() else 2),
            round(target_close, 5 if "EURUSD" in symbol.upper() else 2),
            float(random.randint(100, 1000))
        ))
        current_price = target_close
        
    return rates

def sync_historical_data(db: Session, symbol: str, timeframe: str, start_dt: datetime, end_dt: datetime) -> int:
    """
    Downloads historical rates from MT5 terminal or generates simulation fallback,
    and caches them in the PostgreSQL/SQLite database in bulk.
    Returns the count of newly inserted records.
    """
    manager = MT5Manager()
    resolved_symbol = manager._resolve_symbol(symbol)
    
    # 1. Get rates from MT5 if active and connected
    rates = None
    if MT5_AVAILABLE and not manager.is_simulated and manager.is_connected:
        tf_map = {
            "M1": mt5.TIMEFRAME_M1, "M5": mt5.TIMEFRAME_M5, "M15": mt5.TIMEFRAME_M15,
            "M30": mt5.TIMEFRAME_M30, "H1": mt5.TIMEFRAME_H1, "H4": mt5.TIMEFRAME_H4,
            "D1": mt5.TIMEFRAME_D1
        }
        tf = tf_map.get(timeframe.upper(), mt5.TIMEFRAME_H1)
        # Fetch raw server rates
        rates_data = mt5.copy_rates_range(resolved_symbol, tf, start_dt, end_dt)
        if rates_data is not None and len(rates_data) > 0:
            rates = []
            for rate in rates_data:
                rates.append((
                    int(rate[0]),
                    float(rate[1]),
                    float(rate[2]),
                    float(rate[3]),
                    float(rate[4]),
                    float(rate[5])
                ))
                
    # 2. Fallback to high-fidelity simulated candles if offline or no rates fetched
    if not rates:
        rates = generate_mock_rates(symbol, timeframe, start_dt, end_dt)
        
    if not rates:
        return 0
        
    # 3. Fetch existing timestamps matching the actual returned rate range to avoid timezone-shift duplicate issues
    rates_times = [int(r[0]) for r in rates]
    min_ts = min(rates_times)
    max_ts = max(rates_times)
    
    existing_times = {row[0] for row in db.query(HistoricalCandle.time).filter(
        HistoricalCandle.symbol == symbol,
        HistoricalCandle.timeframe == timeframe,
        HistoricalCandle.time >= min_ts,
        HistoricalCandle.time <= max_ts
    ).all()}
    
    # 4. Filter out items that are already in cache, or duplicated in the input rates batch
    to_insert = []
    seen_in_batch = set()
    for r in rates:
        ts = int(r[0])
        if ts not in existing_times and ts not in seen_in_batch:
            seen_in_batch.add(ts)
            to_insert.append({
                "symbol": symbol,
                "timeframe": timeframe,
                "time": ts,
                "open": float(r[1]),
                "high": float(r[2]),
                "low": float(r[3]),
                "close": float(r[4]),
                "volume": float(r[5])
            })
            
    # 5. Bulk insert mappings for maximum database speed and conflict avoidance
    if to_insert:
        try:
            dialect = db.bind.dialect.name if db.bind else None
            if dialect == "sqlite":
                from sqlalchemy.dialects.sqlite import insert as sqlite_insert
                stmt = sqlite_insert(HistoricalCandle).values(to_insert).on_conflict_do_nothing()
                db.execute(stmt)
                db.commit()
            elif dialect == "postgresql":
                from sqlalchemy.dialects.postgresql import insert as pg_insert
                stmt = pg_insert(HistoricalCandle).values(to_insert).on_conflict_do_nothing()
                db.execute(stmt)
                db.commit()
            else:
                db.bulk_insert_mappings(HistoricalCandle, to_insert)
                db.commit()
        except Exception as e:
            db.rollback()
            db.bulk_insert_mappings(HistoricalCandle, to_insert)
            db.commit()
        
    return len(to_insert)

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

def execute_backtest_on_candles(candles: list, algorithm: str, signal_mode: str, lot_size: float, sl_points: float, tp_points: float, initial_balance: float, allowed_sessions: str, symbol: str, timeframe: str) -> dict:
    """Executes the simulation loop on a provided array of candles."""
    from backend.trading_bot import evaluate_multi_signals
    
    balance = initial_balance
    equity_curve = [{"time": candles[0]["time"], "value": balance}]
    active_trade = None
    trades_history = []
    ticket_counter = 100000
    
    algorithms_list = [a.strip() for a in algorithm.split(",") if a.strip()]
    multiplier = get_point_multiplier(symbol)
    
    for i in range(35, len(candles)):
        current_candle = candles[i]
        current_price = current_candle["close"]
        current_time = current_candle["time"]
        
        # Apply Session Filter
        is_allowed = True
        if allowed_sessions != "all":
            is_allowed = False
            utc_hour = datetime.fromtimestamp(current_time, timezone.utc).hour
            sessions_list = [s.strip().lower() for s in allowed_sessions.split(",") if s.strip()]
            for s in sessions_list:
                if s == "asian" and (0 <= utc_hour < 8):
                    is_allowed = True
                elif s == "london" and (8 <= utc_hour < 16):
                    is_allowed = True
                elif s == "newyork" and (13 <= utc_hour < 21):
                    is_allowed = True
                elif s == "london_ny" and (13 <= utc_hour < 16):
                    is_allowed = True
                    
        candles_slice = candles[max(0, i - 299) : i+1]
        close_prices_slice = [c["close"] for c in candles_slice]
        
        # 1. Manage active trade
        if active_trade:
            t_type = active_trade["type"]
            open_p = active_trade["open_price"]
            sl = active_trade["sl"]
            tp = active_trade["tp"]
            
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
                    
            # Opposite Exit Signal
            opp_signal = False
            sig = evaluate_multi_signals(close_prices_slice, algorithms_list, signal_mode, candles=candles_slice, symbol=symbol, timeframe=timeframe)
            if not is_allowed:
                sig = "none"
                
            if t_type == "buy" and sig == "sell":
                opp_signal = True
            elif t_type == "sell" and sig == "buy":
                opp_signal = True
                
            if hit_tp or hit_sl or opp_signal:
                close_p = current_price
                close_reason = "Opposite Signal"
                if hit_tp:
                    close_p = tp
                    close_reason = "Take Profit"
                elif hit_sl:
                    close_p = sl
                    close_reason = "Stop Loss"
                    
                if t_type == "buy":
                    pnl = (close_p - open_p) * lot_size * multiplier
                else:
                    pnl = (open_p - close_p) * lot_size * multiplier
                    
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
                    "sl": sl,
                    "tp": tp,
                    "profit": round(pnl, 2),
                    "result": "win" if pnl >= 0 else "loss",
                    "reason": close_reason
                })
                equity_curve.append({"time": current_time, "value": round(balance, 2)})
                active_trade = None
                
        # 2. Look for new trades
        if not active_trade:
            sig = evaluate_multi_signals(close_prices_slice, algorithms_list, signal_mode, candles=candles_slice, symbol=symbol, timeframe=timeframe)
            if not is_allowed:
                sig = "none"
                
            if sig in ["buy", "sell"]:
                sl_p = 0.0
                tp_p = 0.0
                
                is_wave_strategy = any(algo in ["elliott_wave", "harmonic_patterns"] for algo in algorithms_list)
                if is_wave_strategy:
                    from backend.pattern_detector import calculate_atr
                    atr_vals = calculate_atr(candles_slice, 14)
                    atr_val = atr_vals[-1] if (atr_vals and atr_vals[-1] is not None) else 0.0
                    if atr_val > 0:
                        sl_dist = 2.0 * atr_val
                        tp_dist = 3.0 * atr_val
                        if sig == "buy":
                            sl_p = current_price - sl_dist
                            tp_p = current_price + tp_dist
                        else:
                            sl_p = current_price + sl_dist
                            tp_p = current_price - tp_dist
                else:
                    if sig == "buy":
                        if sl_points > 0: sl_p = current_price - sl_points
                        if tp_points > 0: tp_p = current_price + tp_points
                    else:
                        if sl_points > 0: sl_p = current_price + sl_points
                        if tp_points > 0: tp_p = current_price - tp_points
                        
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
                
    # Force close final trade
    if active_trade:
        t_type = active_trade["type"]
        open_p = active_trade["open_price"]
        close_p = candles[-1]["close"]
        pnl = (close_p - open_p) * lot_size * multiplier if t_type == "buy" else (open_p - close_p) * lot_size * multiplier
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
            "sl": active_trade["sl"],
            "tp": active_trade["tp"],
            "profit": round(pnl, 2),
            "result": "win" if pnl >= 0 else "loss",
            "reason": "End of Data"
        })
        equity_curve.append({"time": candles[-1]["time"], "value": round(balance, 2)})
        
    return {
        "final_balance": round(balance, 2),
        "trades": trades_history,
        "equity_curve": equity_curve
    }

def run_advanced_backtest(db: Session, symbol: str, timeframe: str, algorithm: str, signal_mode: str, lot_size: float, sl_points: float, tp_points: float, initial_balance: float, allowed_sessions: str, start_dt: datetime, end_dt: datetime) -> dict:
    """
    Runs an advanced historical backtest on cached DB candles, 
    calculates stats, WFO, Monte Carlo, and Monthly metrics, and commits results.
    """
    start_ts = int(start_dt.replace(tzinfo=timezone.utc).timestamp())
    end_ts = int(end_dt.replace(tzinfo=timezone.utc).timestamp())
    
    # 1. Load cached candles
    candle_records = db.query(HistoricalCandle).filter(
        HistoricalCandle.symbol == symbol,
        HistoricalCandle.timeframe == timeframe,
        HistoricalCandle.time >= start_ts,
        HistoricalCandle.time <= end_ts
    ).order_by(HistoricalCandle.time.asc()).all()
    
    if len(candle_records) < 40:
        raise Exception(f"มีแท่งเทียนในระบบไม่เพียงพอสำหรับการทดสอบย้อนหลัง (พบ {len(candle_records)} แท่ง ต้องการอย่างน้อย 40 แท่ง)")
        
    candles = [{
        "time": c.time, "open": c.open, "high": c.high, "low": c.low, "close": c.close, "volume": c.volume
    } for c in candle_records]
    
    # 2. Execute full backtest
    full_result = execute_backtest_on_candles(
        candles, algorithm, signal_mode, lot_size, sl_points, tp_points, initial_balance, allowed_sessions, symbol, timeframe
    )
    
    trades_history = full_result["trades"]
    equity_curve = full_result["equity_curve"]
    final_balance = full_result["final_balance"]
    
    # 3. Calculate main metrics
    wins = [t for t in trades_history if t["profit"] >= 0]
    losses = [t for t in trades_history if t["profit"] < 0]
    gross_profit = sum(t["profit"] for t in wins)
    gross_loss = sum(abs(t["profit"]) for t in losses)
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else round(gross_profit, 2)
    
    peak = initial_balance
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
            
    win_rate = (len(wins) / len(trades_history) * 100) if trades_history else 0.0
    net_profit = round(final_balance - initial_balance, 2)
    
    avg_win = round(gross_profit / len(wins), 2) if wins else 0.0
    avg_loss = round(gross_loss / len(losses), 2) if losses else 0.0
    
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
                
    expectancy = round(net_profit / len(trades_history), 2) if trades_history else 0.0
    
    # 4. Save run metadata to DB
    run_record = AdvancedBacktestRun(
        symbol=symbol,
        timeframe=timeframe,
        algorithm=algorithm,
        start_time=start_dt,
        end_time=end_dt,
        initial_balance=initial_balance,
        final_balance=final_balance,
        net_profit=net_profit,
        win_rate=round(win_rate, 1),
        total_trades=len(trades_history),
        max_drawdown=round(max_drawdown, 2),
        max_drawdown_percent=round(max_drawdown_pct, 2),
        profit_factor=profit_factor
    )
    db.add(run_record)
    db.commit()
    db.refresh(run_record)
    
    # 5. Save trade details in bulk
    db_trades = []
    for t in trades_history:
        db_trades.append({
            "run_id": run_record.id,
            "ticket": t["ticket"],
            "type": t["type"],
            "open_time": datetime.strptime(t["open_time"], "%Y-%m-%d %H:%M:%S"),
            "close_time": datetime.strptime(t["close_time"], "%Y-%m-%d %H:%M:%S"),
            "open_price": t["open_price"],
            "close_price": t["close_price"],
            "sl": t["sl"],
            "tp": t["tp"],
            "profit": t["profit"],
            "result": t["result"],
            "reason": t["reason"]
        })
    if db_trades:
        db.bulk_insert_mappings(AdvancedBacktestTrade, db_trades)
        db.commit()
        
    # 6. Walk Forward Test (5 segments)
    wfo_segments = []
    segment_size = len(candles) // 5
    if segment_size >= 40:
        for seg in range(5):
            seg_candles = candles[seg * segment_size : (seg + 1) * segment_size]
            if len(seg_candles) < 40:
                continue
            split_idx = int(len(seg_candles) * 0.70)
            train_candles = seg_candles[:split_idx]
            test_candles = seg_candles[split_idx:]
            
            train_res = execute_backtest_on_candles(train_candles, algorithm, signal_mode, lot_size, sl_points, tp_points, initial_balance, allowed_sessions, symbol, timeframe)
            test_res = execute_backtest_on_candles(test_candles, algorithm, signal_mode, lot_size, sl_points, tp_points, initial_balance, allowed_sessions, symbol, timeframe)
            
            # Helper to get win rate
            tr_wins = len([t for t in train_res["trades"] if t["profit"] >= 0])
            te_wins = len([t for t in test_res["trades"] if t["profit"] >= 0])
            
            wfo_segments.append({
                "segment": seg + 1,
                "period_start": datetime.fromtimestamp(seg_candles[0]["time"], timezone.utc).strftime("%Y-%m-%d"),
                "period_end": datetime.fromtimestamp(seg_candles[-1]["time"], timezone.utc).strftime("%Y-%m-%d"),
                "train_pnl": round(train_res["final_balance"] - initial_balance, 2),
                "train_win_rate": round((tr_wins / len(train_res["trades"]) * 100) if train_res["trades"] else 0.0, 1),
                "test_pnl": round(test_res["final_balance"] - initial_balance, 2),
                "test_win_rate": round((te_wins / len(test_res["trades"]) * 100) if test_res["trades"] else 0.0, 1),
            })
            
    # 7. Monte Carlo Simulation (1,000 iterations)
    monte_carlo = {}
    if len(trades_history) >= 2:
        sim_count = 1000
        ruin_count = 0
        all_drawdowns = []
        all_final_values = []
        
        # We simulate 1000 runs
        simulated_paths = []
        # Store index points to draw simulated equity paths (draw max 3 paths to keep payload small: 5th, 50th, 95th)
        raw_profits = [t["profit"] for t in trades_history]
        
        for sim in range(sim_count):
            # Sample with replacement
            sim_profits = random.choices(raw_profits, k=len(raw_profits))
            # Build simulated equity path
            path = [initial_balance]
            curr_bal = initial_balance
            for p in sim_profits:
                curr_bal += p
                path.append(curr_bal)
                
            all_final_values.append(curr_bal)
            
            # Calc max drawdown of this run
            mc_peak = initial_balance
            mc_max_dd = 0.0
            mc_ruin = False
            for val in path:
                if val > mc_peak:
                    mc_peak = val
                dd = mc_peak - val
                dd_pct = (dd / mc_peak) * 100.0 if mc_peak > 0 else 0.0
                if dd_pct > mc_max_dd:
                    mc_max_dd = dd_pct
                if val <= (initial_balance * 0.50): # Ruin threshold = 50%
                    mc_ruin = True
                    
            all_drawdowns.append(mc_max_dd)
            if mc_ruin:
                ruin_count += 1
                
        # Calculate percentiles at each trade index
        trade_steps = len(raw_profits)
        percentiles_paths = {
            "p5": [initial_balance],
            "p50": [initial_balance],
            "p95": [initial_balance]
        }
        # Iterate over each trade step and extract statistics
        step_runs = np.zeros((sim_count, trade_steps + 1))
        for sim in range(sim_count):
            sim_profits = random.choices(raw_profits, k=len(raw_profits))
            curr = initial_balance
            step_runs[sim, 0] = curr
            for step, p in enumerate(sim_profits):
                curr += p
                step_runs[sim, step + 1] = curr
                
        for step in range(trade_steps + 1):
            vals = step_runs[:, step]
            percentiles_paths["p5"].append(float(np.percentile(vals, 5)))
            percentiles_paths["p50"].append(float(np.percentile(vals, 50)))
            percentiles_paths["p95"].append(float(np.percentile(vals, 95)))
            
        # Drawdown probabilities
        dd_10 = sum(1 for d in all_drawdowns if d >= 10.0) / sim_count * 100.0
        dd_20 = sum(1 for d in all_drawdowns if d >= 20.0) / sim_count * 100.0
        dd_30 = sum(1 for d in all_drawdowns if d >= 30.0) / sim_count * 100.0
        dd_40 = sum(1 for d in all_drawdowns if d >= 40.0) / sim_count * 100.0
        dd_50 = sum(1 for d in all_drawdowns if d >= 50.0) / sim_count * 100.0
        
        monte_carlo = {
            "ruin_probability": round((ruin_count / sim_count * 100), 2),
            "median_drawdown": round(float(np.median(all_drawdowns)), 2),
            "max_drawdown_simulated": round(float(np.max(all_drawdowns)), 2),
            "drawdown_probabilities": {
                "dd_10": round(dd_10, 1),
                "dd_20": round(dd_20, 1),
                "dd_30": round(dd_30, 1),
                "dd_40": round(dd_40, 1),
                "dd_50": round(dd_50, 1)
            },
            "p5_equity_curve": percentiles_paths["p5"],
            "p50_equity_curve": percentiles_paths["p50"],
            "p95_equity_curve": percentiles_paths["p95"]
        }
        
    # 8. Monthly Win Rate Analysis
    monthly_stats = {}
    for t in trades_history:
        close_dt = datetime.fromtimestamp(t["close_timestamp"], timezone.utc)
        m_key = close_dt.strftime("%Y-%m")
        if m_key not in monthly_stats:
            monthly_stats[m_key] = {"month": m_key, "trades": 0, "profit": 0.0, "wins": 0, "losses": 0, "gross_profit": 0.0, "gross_loss": 0.0}
            
        ms = monthly_stats[m_key]
        ms["trades"] += 1
        ms["profit"] += t["profit"]
        if t["profit"] >= 0:
            ms["wins"] += 1
            ms["gross_profit"] += t["profit"]
        else:
            ms["losses"] += 1
            ms["gross_loss"] += abs(t["profit"])
            
    monthly_list = []
    for k in sorted(monthly_stats.keys()):
        ms = monthly_stats[k]
        win_rate_m = (ms["wins"] / ms["trades"] * 100) if ms["trades"] else 0.0
        pf_m = (ms["gross_profit"] / ms["gross_loss"]) if ms["gross_loss"] > 0 else ms["gross_profit"]
        monthly_list.append({
            "month": ms["month"],
            "total_trades": ms["trades"],
            "net_profit": round(ms["profit"], 2),
            "win_rate": round(win_rate_m, 1),
            "profit_factor": round(pf_m, 2)
        })
        
    return {
        "run_id": run_record.id,
        "symbol": symbol,
        "timeframe": timeframe,
        "algorithm": algorithm,
        "initial_balance": initial_balance,
        "final_balance": final_balance,
        "net_profit": net_profit,
        "total_trades": len(trades_history),
        "win_rate": round(win_rate, 1),
        "wins_count": len(wins),
        "losses_count": len(losses),
        "profit_factor": profit_factor,
        "gross_profit": round(gross_profit, 2),
        "gross_loss": round(gross_loss, 2),
        "avg_win": avg_win,
        "avg_loss": avg_loss,
        "max_consecutive_wins": max_consec_wins,
        "max_consecutive_losses": max_consec_losses,
        "expectancy": expectancy,
        "max_drawdown": round(max_drawdown, 2),
        "max_drawdown_percent": round(max_drawdown_pct, 2),
        "trades": trades_history,
        "equity_curve": equity_curve,
        "walk_forward": wfo_segments,
        "monte_carlo": monte_carlo,
        "monthly_analysis": monthly_list,
        "candles": candles
    }
