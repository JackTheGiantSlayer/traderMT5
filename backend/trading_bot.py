import time
import threading
import logging
from datetime import datetime
from backend.database import SessionLocal
from backend.models import BotSettings, BotLog
from backend.mt5_manager import MT5Manager

# Setup Logging
logger = logging.getLogger("TradingBot")

# --- Pure Python Technical Indicators ---

def calculate_sma(prices, period):
    """Calculates Simple Moving Average."""
    if len(prices) < period:
        return [None] * len(prices)
    sma_vals = [None] * (period - 1)
    for i in range(period - 1, len(prices)):
        sma_vals.append(sum(prices[i - period + 1 : i + 1]) / period)
    return sma_vals

def calculate_ema(prices, period):
    """Calculates Exponential Moving Average."""
    if len(prices) < period:
        return [None] * len(prices)
    ema_vals = [None] * (period - 1)
    # Start with SMA
    sma = sum(prices[:period]) / period
    ema_vals.append(sma)
    
    multiplier = 2 / (period + 1)
    current_ema = sma
    for i in range(period, len(prices)):
        current_ema = (prices[i] - current_ema) * multiplier + current_ema
        ema_vals.append(current_ema)
    return ema_vals

def calculate_rsi(prices, period=14):
    """Calculates Relative Strength Index."""
    if len(prices) < period + 1:
        return [None] * len(prices)
    
    rsi_vals = [None] * period
    deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]
    
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    if avg_loss == 0:
        rsi_vals.append(100.0)
    else:
        rs = avg_gain / avg_loss
        rsi_vals.append(100.0 - (100.0 / (1.0 + rs)))
        
    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        
        if avg_loss == 0:
            rsi_vals.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi_vals.append(100.0 - (100.0 / (1.0 + rs)))
            
    return rsi_vals

def calculate_macd(prices, fast_period=12, slow_period=26, signal_period=9):
    """Calculates MACD and Signal lines."""
    if len(prices) < slow_period + signal_period:
        return [None] * len(prices), [None] * len(prices)
        
    fast_ema = calculate_ema(prices, fast_period)
    slow_ema = calculate_ema(prices, slow_period)
    
    macd_line = []
    for f, s in zip(fast_ema, slow_ema):
        if f is None or s is None:
            macd_line.append(None)
        else:
            macd_line.append(f - s)
            
    # Calculate signal line (EMA of MACD line)
    # Filter out None values to calculate EMA
    first_valid_idx = slow_period - 1
    valid_macd = macd_line[first_valid_idx:]
    
    valid_signal = calculate_ema(valid_macd, signal_period)
    
    signal_line = [None] * first_valid_idx + valid_signal
    return macd_line, signal_line

# --- Signal Resolver ---

def evaluate_signals(prices, algorithm, candles=None, symbol="XAUUSD", timeframe="H1"):
    """
    Evaluates trading signals from historic close prices.
    Returns: 'buy', 'sell', or 'none'
    """
    if len(prices) < 30:
        return "none"
        
    if algorithm == "sma_cross":
        # 5 SMA vs 15 SMA Crossover
        short_period, long_period = 5, 15
        short_sma = calculate_sma(prices, short_period)
        long_sma = calculate_sma(prices, long_period)
        
        if short_sma[-1] is None or short_sma[-2] is None or long_sma[-1] is None or long_sma[-2] is None:
            return "none"
            
        # Bullish Crossover (Short SMA cuts above Long SMA)
        if short_sma[-2] <= long_sma[-2] and short_sma[-1] > long_sma[-1]:
            return "buy"
        # Bearish Crossover (Short SMA cuts below Long SMA)
        if short_sma[-2] >= long_sma[-2] and short_sma[-1] < long_sma[-1]:
            return "sell"
            
    elif algorithm == "rsi_oscillator":
        rsi = calculate_rsi(prices, 14)
        if len(rsi) < 3 or rsi[-2] is None or rsi[-3] is None:
            return "none"
            
        # Oversold cross upwards (RSI crosses above 30) on completed candle -> BUY
        if rsi[-3] <= 30 and rsi[-2] > 30:
            return "buy"
        # Overbought cross downwards (RSI crosses below 70) on completed candle -> SELL
        if rsi[-3] >= 70 and rsi[-2] < 70:
            return "sell"
            
    elif algorithm == "stoch_rsi":
        from backend.pattern_detector import calculate_stoch_rsi
        k_vals, d_vals = calculate_stoch_rsi(prices, 14, 14, 3, 3)
        if len(k_vals) < 3 or len(d_vals) < 3 or k_vals[-2] is None or k_vals[-3] is None or d_vals[-2] is None or d_vals[-3] is None:
            return "none"
            
        # %K crosses above %D while in or near oversold zone (<= 25) on completed candle -> BUY
        if k_vals[-3] <= d_vals[-3] and k_vals[-2] > d_vals[-2] and (k_vals[-2] <= 25 or k_vals[-3] <= 20):
            return "buy"
        # %K crosses below %D while in or near overbought zone (>= 75) on completed candle -> SELL
        if k_vals[-3] >= d_vals[-3] and k_vals[-2] < d_vals[-2] and (k_vals[-2] >= 75 or k_vals[-3] >= 80):
            return "sell"
            
    elif algorithm == "macd":
        macd_line, signal_line = calculate_macd(prices)
        if macd_line[-1] is None or macd_line[-2] is None or signal_line[-1] is None or signal_line[-2] is None:
            return "none"
            
        # Bullish MACD Crossover (MACD Line cuts above Signal Line)
        if macd_line[-2] <= signal_line[-2] and macd_line[-1] > signal_line[-1]:
            return "buy"
        # Bearish MACD Crossover (MACD Line cuts below Signal Line)
        if macd_line[-2] >= signal_line[-2] and macd_line[-1] < signal_line[-1]:
            return "sell"
            
    elif algorithm == "macd_4c":
        from backend.pattern_detector import calculate_macd_4c
        macd_vals, colors = calculate_macd_4c(prices, 12, 26, 9)
        if len(macd_vals) < 2 or len(colors) < 2 or macd_vals[-1] is None or macd_vals[-2] is None or colors[-1] is None or colors[-2] is None:
            return "none"
            
        curr_color = colors[-1]
        prev_color = colors[-2]
        curr_val = macd_vals[-1]
        prev_val = macd_vals[-2]
        
        # BUY signal:
        # 1. shifts from maroon to red (curling up below zero)
        # 2. shifts from green to lime (curling up above zero)
        # 3. crosses above zero (prev_val <= 0 and curr_val > 0)
        is_bullish_curl = (prev_color == "maroon" and curr_color == "red") or (prev_color == "green" and curr_color == "lime")
        is_zero_cross_up = (prev_val <= 0 and curr_val > 0)
        if is_bullish_curl or is_zero_cross_up:
            return "buy"
            
        # SELL signal:
        # 1. shifts from lime to green (curling down above zero)
        # 2. shifts from red to maroon (curling down below zero)
        # 3. crosses below zero (prev_val >= 0 and curr_val < 0)
        is_bearish_curl = (prev_color == "lime" and curr_color == "green") or (prev_color == "red" and curr_color == "maroon")
        is_zero_cross_down = (prev_val >= 0 and curr_val < 0)
        if is_bearish_curl or is_zero_cross_down:
            return "sell"
            
    elif algorithm == "elliott_wave":
        if candles is None or len(candles) < 35:
            return "none"
        from backend.pattern_detector import detect_elliott_waves
        res = detect_elliott_waves(candles)
        if res:
            return res["signal"]
            
    elif algorithm == "harmonic_patterns":
        if candles is None or len(candles) < 35:
            return "none"
        from backend.pattern_detector import detect_harmonic_patterns
        res = detect_harmonic_patterns(candles)
        if res:
            return res["signal"]
            
    elif algorithm == "ema_cross_50_200":
        ema50 = calculate_ema(prices, 50)
        ema200 = calculate_ema(prices, 200)
        if ema50[-1] is None or ema50[-2] is None or ema200[-1] is None or ema200[-2] is None:
            return "none"
        if ema50[-2] <= ema200[-2] and ema50[-1] > ema200[-1]:
            return "buy"
        if ema50[-2] >= ema200[-2] and ema50[-1] < ema200[-1]:
            return "sell"
            
    elif algorithm == "rsi_divergence":
        if candles is None or len(candles) < 40:
            return "none"
        from backend.pattern_detector import detect_rsi_divergence
        return detect_rsi_divergence(candles)
        
    elif algorithm == "atr_breakout":
        if candles is None or len(candles) < 20:
            return "none"
        from backend.pattern_detector import calculate_atr
        ema20 = calculate_ema(prices, 20)
        atr14 = calculate_atr(candles, 14)
        if ema20[-1] is None or atr14[-1] is None:
            return "none"
        current_price = prices[-1]
        prev_price = prices[-2]
        upper_band = ema20[-1] + 1.5 * atr14[-1]
        lower_band = ema20[-1] - 1.5 * atr14[-1]
        prev_upper_band = ema20[-2] + 1.5 * atr14[-2] if ema20[-2] is not None and atr14[-2] is not None else upper_band
        prev_lower_band = ema20[-2] - 1.5 * atr14[-2] if ema20[-2] is not None and atr14[-2] is not None else lower_band
        
        if prev_price <= prev_upper_band and current_price > upper_band:
            return "buy"
        if prev_price >= prev_lower_band and current_price < lower_band:
            return "sell"
            
    elif algorithm == "support_resistance":
        if candles is None or len(candles) < 30:
            return "none"
        from backend.pattern_detector import detect_support_resistance_bounce
        return detect_support_resistance_bounce(candles)
        
    elif algorithm == "liquidity_sweep":
        if candles is None or len(candles) < 15:
            return "none"
        from backend.pattern_detector import detect_liquidity_sweep
        return detect_liquidity_sweep(candles)
        
    elif algorithm == "smc_bos_choch":
        if candles is None or len(candles) < 30:
            return "none"
        from backend.pattern_detector import detect_market_structure
        res = detect_market_structure(candles)
        if res["type"] in ["bos", "choch"]:
            return "buy" if res["direction"] == "bullish" else "sell" if res["direction"] == "bearish" else "none"
        return "none"
        
    elif algorithm == "smc_order_block":
        if candles is None or len(candles) < 25:
            return "none"
        from backend.pattern_detector import detect_order_blocks
        return detect_order_blocks(candles)
        
    elif algorithm == "smc_fvg_imbalance":
        if candles is None or len(candles) < 20:
            return "none"
        from backend.pattern_detector import detect_fvg
        return detect_fvg(candles)
    elif algorithm == "adx":
        if candles is None or len(candles) < 35:
            return "none"
        from backend.pattern_detector import calculate_adx
        adx_vals, plus_di, minus_di = calculate_adx(candles, 14)
        if (len(adx_vals) < 3 or adx_vals[-2] is None or 
            plus_di[-2] is None or plus_di[-3] is None or 
            minus_di[-2] is None or minus_di[-3] is None):
            return "none"
            
        plus_di_prev2 = plus_di[-3]
        plus_di_prev = plus_di[-2]
        minus_di_prev2 = minus_di[-3]
        minus_di_prev = minus_di[-2]
        adx_prev = adx_vals[-2]
        
        is_bullish_cross = plus_di_prev2 <= minus_di_prev2 and plus_di_prev > minus_di_prev
        is_bearish_cross = plus_di_prev2 >= minus_di_prev2 and plus_di_prev < minus_di_prev
        
        if is_bullish_cross and adx_prev is not None and adx_prev > 20:
            return "buy"
        if is_bearish_cross and adx_prev is not None and adx_prev > 20:
            return "sell"
            
    elif algorithm == "pj_indicator":
        if candles is None or len(candles) < 55:
            return "none"
            
        from backend.pattern_detector import calculate_pj_indicator_trend_and_score
        
        # Calculate PJ trend and score history
        results = calculate_pj_indicator_trend_and_score(candles, timeframe=timeframe)
        if len(results) < 3:
            return "none"
            
        # We evaluate crossover at previous candle (index -2) and candle before that (index -3)
        close_prev = candles[-2]["close"]
        close_prev2 = candles[-3]["close"]
        
        ema_prev = results[-2]["ema14"]
        ema_prev2 = results[-3]["ema14"]
        
        macd_line_prev = results[-2]["macd_line"]
        macd_line_prev2 = results[-3]["macd_line"]
        
        macd_sig_prev = results[-2]["macd_signal"]
        macd_sig_prev2 = results[-3]["macd_signal"]
        
        stoch_k_prev = results[-2]["stoch_k"]
        stoch_k_prev2 = results[-3]["stoch_k"]
        
        stoch_d_prev = results[-2]["stoch_d"]
        stoch_d_prev2 = results[-3]["stoch_d"]
        
        if (ema_prev is None or ema_prev2 is None or macd_line_prev is None or 
            macd_line_prev2 is None or macd_sig_prev is None or macd_sig_prev2 is None or 
            stoch_k_prev is None or stoch_k_prev2 is None or stoch_d_prev is None or stoch_d_prev2 is None):
            return "none"
            
        # Crossovers at index -2
        emaCrossUp = (close_prev2 <= ema_prev2 and close_prev > ema_prev)
        macdCrossUp = (macd_line_prev2 <= macd_sig_prev2 and macd_line_prev > macd_sig_prev)
        stochCrossUp = (stoch_k_prev2 <= stoch_d_prev2 and stoch_k_prev > stoch_d_prev)
        
        emaCrossDown = (close_prev2 >= ema_prev2 and close_prev < ema_prev)
        macdCrossDown = (macd_line_prev2 >= macd_sig_prev2 and macd_line_prev < macd_sig_prev)
        stochCrossDown = (stoch_k_prev2 >= stoch_d_prev2 and stoch_k_prev < stoch_d_prev)
        
        trend_bull_prev = results[-2]["trend_bull"]
        trend_bear_prev = results[-2]["trend_bear"]
        
        # PJ Indicator Signal Logic:
        # buySignalRaw  = trendBull[1] and (emaCrossUp[1] or macdCrossUp[1] or stochCrossUp[1])
        # sellSignalRaw = trendBear[1] and (emaCrossDown[1] or macdCrossDown[1] or stochCrossDown[1])
        buySignal = trend_bull_prev and (emaCrossUp or macdCrossUp or stochCrossUp)
        sellSignal = trend_bear_prev and (emaCrossDown or macdCrossDown or stochCrossDown)
        
        if buySignal:
            return "buy"
        if sellSignal:
            return "sell"
            
    elif algorithm == "smc_confluence_pro":
        if candles is None or len(candles) < 35:
            return "none"
        from backend.pattern_detector import detect_liquidity_sweep, detect_order_blocks, detect_fvg
        sweep = detect_liquidity_sweep(candles)
        ob = detect_order_blocks(candles)
        fvg = detect_fvg(candles)
        
        if sweep == "buy" and (ob == "buy" or fvg == "buy"):
            return "buy"
        if sweep == "sell" and (ob == "sell" or fvg == "sell"):
            return "sell"
            
        if ob != "none":
            return ob
        return fvg
            
    return "none"

def evaluate_multi_signals(prices, algorithms_list, signal_mode, candles=None, symbol="XAUUSD", timeframe="H1"):
    """
    Evaluates signals from a list of algorithms and combines them.
    algorithms_list: list of strings (e.g. ['sma_cross', 'rsi_oscillator'])
    signal_mode: 'and' or 'or'
    """
    if not algorithms_list:
        return "none"
        
    individual_signals = {}
    for algo in algorithms_list:
        individual_signals[algo] = evaluate_signals(prices, algo, candles=candles, symbol=symbol, timeframe=timeframe)
        
    buys = [algo for algo, sig in individual_signals.items() if sig == "buy"]
    sells = [algo for algo, sig in individual_signals.items() if sig == "sell"]
    
    if signal_mode == "and":
        # Consensus: ALL chosen algorithms must trigger the target signal
        if len(buys) == len(algorithms_list):
            return "buy"
        if len(sells) == len(algorithms_list):
            return "sell"
        return "none"
    else: # 'or' (Aggressive)
        # EITHER chosen algorithm triggers
        # If both buy and sell triggers are active, cancel to avoid conflict
        if buys and sells:
            return "none"
        if buys:
            return "buy"
        if sells:
            return "sell"
        return "none"

# --- Bot Manager (Background Executor) ---

class BotManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if not cls._instance:
                cls._instance = super(BotManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.is_running = False
        self.runner_thread = None
        self.mt5 = MT5Manager()
        self._initialized = True

    def start(self):
        """Starts background thread if not already running."""
        with self._lock:
            if self.is_running:
                return
            self.is_running = True
            self.runner_thread = threading.Thread(target=self._bot_loop, daemon=True)
            self.runner_thread.start()
            logger.info("Bot Manager background runner thread successfully started.")

    def stop(self):
        """Stops the bot loop thread."""
        with self._lock:
            self.is_running = False
            logger.info("Bot Manager background runner thread requested to stop.")

    def _log_to_db(self, db, bot_id, message, log_type="info"):
        """Utility to write persistent log entries to bot_logs table."""
        try:
            log_entry = BotLog(bot_id=bot_id, message=message, log_type=log_type)
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save bot log to DB: {e}")

    def _bot_loop(self):
        """Standard execution loop running every 10 seconds."""
        while self.is_running:
            try:
                time.sleep(10.0) # check bots every 10 seconds
                db = SessionLocal()
                try:
                    # Get all active running bots
                    active_bots = db.query(BotSettings).filter(BotSettings.is_running == True).all()
                    if not active_bots:
                        continue
                        
                    for bot in active_bots:
                        try:
                            self._process_bot(db, bot)
                        except Exception as bot_err:
                            logger.error(f"Error processing bot #{bot.id} ({bot.name}): {bot_err}")
                            self._log_to_db(db, bot.id, f"ERROR: {str(bot_err)}", "error")
                finally:
                    db.close()
            except Exception as loop_err:
                logger.error(f"General error in main bot runner loop: {loop_err}")

    def _process_bot(self, db, bot):
        """Processes signals and executes trades for an individual bot."""
        # 1. Fetch candles for indicator computations
        candles = self.mt5.get_historical_candles(bot.symbol, bot.timeframe, count=300)
        if not candles or len(candles) < 35:
            # Not enough data yet
            return
            
        close_prices = [c["close"] for c in candles]
        current_price = close_prices[-1]
        
        # 2. Check position tracking
        active_positions = self.mt5.get_positions()
        has_active_position = False
        active_pos = None
        
        if bot.active_ticket is not None:
            # Check if our active ticket is still in active MT5 positions
            matching_pos = [p for p in active_positions if p["ticket"] == bot.active_ticket]
            if matching_pos:
                has_active_position = True
                active_pos = matching_pos[0]
                
                # Check maximum holding time limit (max_hold_hours)
                max_hold = getattr(bot, "max_hold_hours", 0.0)
                if max_hold and max_hold > 0.0:
                    try:
                        time_raw = active_pos.get("time_raw")
                        if time_raw:
                            elapsed_hours = (time.time() - time_raw) / 3600.0
                            if elapsed_hours >= max_hold:
                                self._log_to_db(db, bot.id, f"หมดเวลาถือครองสูงสุด ({elapsed_hours:.2f} / {max_hold:.2f} ชม.)! กำลังสั่งปิดออเดอร์ #{bot.active_ticket}", "info")
                                res = self.mt5.close_position(bot.active_ticket)
                                if res.get("success"):
                                    pnl = res.get("profit", 0.0)
                                    self._log_to_db(db, bot.id, f"ปิดออเดอร์ #{bot.active_ticket} สำเร็จเนื่องจากหมดเวลาถือครอง! กำไร/ขาดทุน: ${pnl}", "close")
                                    
                                    if self.mt5.is_simulated:
                                        try:
                                            from backend.models import TradeHistoryRecord
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
                                                comment=f"{bot.name} [Time Out - {max_hold}h]"
                                            )
                                            db.add(history_record)
                                        except Exception as e:
                                            logger.error(f"Failed to save bot simulated trade history: {e}")
                                            
                                    bot.active_ticket = None
                                    db.commit()
                                    has_active_position = False
                                    active_pos = None
                                else:
                                    self._log_to_db(db, bot.id, f"ไม่สามารถปิดออเดอร์ (หมดเวลาถือครอง): {res.get('comment')}", "error")
                    except Exception as close_err:
                        self._log_to_db(db, bot.id, f"ข้อผิดพลาดขณะพยายามปิดออเดอร์ (หมดเวลาถือครอง): {str(close_err)}", "error")
            else:
                # Ticket no longer open (closed manually, or hit TP/SL)
                msg = f"ออเดอร์ #{bot.active_ticket} ถูกปิดการทำงานแล้ว (โดยผู้ใช้ หรือถึงขีดจำกัด TP/SL)"
                self._log_to_db(db, bot.id, msg, "close")
                
                # Fetch details from MT5 history if live to notify Discord
                if not self.mt5.is_simulated and self.mt5.is_connected:
                    try:
                        import MetaTrader5 as mt5_lib
                        deals = mt5_lib.history_deals_get(position=bot.active_ticket)
                        if deals:
                            exit_deals = [d for d in deals if d.entry == 1]
                            entry_deals = [d for d in deals if d.entry == 0]
                            if exit_deals and entry_deals:
                                exit_deal = exit_deals[0]
                                entry_deal = entry_deals[0]
                                
                                p_symbol = exit_deal.symbol
                                p_type = "buy" if entry_deal.type == 0 else "sell"
                                p_volume = exit_deal.volume
                                p_open_price = entry_deal.price
                                p_close_price = exit_deal.price
                                p_profit = exit_deal.profit
                                
                                # Determine close reason from broker comment (e.g. "[tp]" or "[sl]")
                                close_reason = exit_deal.comment or "Take Profit / Stop Loss or Manual"
                                if "[tp]" in close_reason.lower():
                                    close_reason = "Take Profit (TP) 🎯"
                                elif "[sl]" in close_reason.lower():
                                    close_reason = "Stop Loss (SL) 🛑"
                                elif "sl/tp" in close_reason.lower() or "s/l" in close_reason.lower():
                                    close_reason = "Stop Loss / Take Profit 🛑🎯"
                                    
                                self.mt5._notify_discord_close(
                                    ticket=bot.active_ticket,
                                    symbol=p_symbol,
                                    order_type=p_type,
                                    volume=p_volume,
                                    open_price=p_open_price,
                                    close_price=p_close_price,
                                    profit=p_profit,
                                    comment=close_reason,
                                    is_live=True
                                )
                    except Exception as hist_err:
                        logger.error(f"Failed to fetch real MT5 closed history for Discord notification: {hist_err}")
                
                bot.active_ticket = None
                db.commit()
                
        # 3. Evaluate signals
        algorithms_list = [a.strip() for a in bot.algorithms.split(",") if a.strip()]
        signal = evaluate_multi_signals(close_prices, algorithms_list, bot.signal_mode, candles=candles, symbol=bot.symbol, timeframe=bot.timeframe)
        
        # Apply Geopolitical & News Sentiment Filter
        if getattr(bot, "use_news_filter", False) and signal in ["buy", "sell"]:
            try:
                from backend.models import NewsRecord
                # Query the latest news records
                latest_news = db.query(NewsRecord).order_by(NewsRecord.published_at.desc()).limit(10).all()
                
                # Compute current sentiment and risk levels
                bullish_count = sum(1 for n in latest_news if n.sentiment == "bullish")
                bearish_count = sum(1 for n in latest_news if n.sentiment == "bearish")
                neutral_count = sum(1 for n in latest_news if n.sentiment == "neutral")
                
                has_high_geopolitical_threat = any(n.impact_level == "high" and n.category == "geopolitical" for n in latest_news)
                has_medium_threat = any(n.impact_level in ["high", "medium"] for n in latest_news)
                
                risk_level = "low"
                if has_high_geopolitical_threat:
                    risk_level = "high"
                elif has_medium_threat:
                    risk_level = "medium"
                    
                sentiment_summary = "neutral"
                if bullish_count > bearish_count and bullish_count > neutral_count:
                    sentiment_summary = "bullish"
                elif bearish_count > bullish_count and bearish_count > neutral_count:
                    sentiment_summary = "bearish"
                
                symbol_upper = bot.symbol.upper()
                is_gold = "XAU" in symbol_upper or "GOLD" in symbol_upper
                
                if risk_level == "high" and is_gold and signal == "sell":
                    self._log_to_db(db, bot.id, "🛡️ AI News Filter: บล็อกคำสั่ง SELL [XAUUSD] อัตโนมัติ เนื่องจากตรวจพบความเสี่ยงภูมิรัฐศาสตร์ระดับ HIGH (ข่าวกระตุ้นแรงซื้อสินทรัพย์ปลอดภัย)", "info")
                    signal = "none"
                elif sentiment_summary == "bearish" and is_gold and signal == "buy":
                    self._log_to_db(db, bot.id, "🛡️ AI News Filter: บล็อกคำสั่ง BUY [XAUUSD] อัตโนมัติ เนื่องจากอารมณ์ข่าวเศรษฐกิจมหภาคเป็น BEARISH รุนแรงต่อทองคำ", "info")
                    signal = "none"
            except Exception as news_err:
                logger.error(f"Error executing AI news filter inside trading loop: {news_err}")
                
        # Apply Macro Trend Filter (EMA 200)
        if getattr(bot, "use_trend_filter", False) and signal in ["buy", "sell"]:
            ema200 = calculate_ema(close_prices, 200)
            if ema200[-1] is not None:
                if signal == "buy" and current_price < ema200[-1]:
                    if int(time.time()) % 60 < 10:
                        self._log_to_db(db, bot.id, f"ขัดแย้งกับเทรนด์ใหญ่! สัญญาณ BUY ถูกบล็อกเนื่องจากราคาปัจจุบัน ({current_price:.2f}) ต่ำกว่า EMA 200 ({ema200[-1]:.2f})", "info")
                    signal = "none"
                elif signal == "sell" and current_price > ema200[-1]:
                    if int(time.time()) % 60 < 10:
                        self._log_to_db(db, bot.id, f"ขัดแย้งกับเทรนด์ใหญ่! สัญญาณ SELL ถูกบล็อกเนื่องจากราคาปัจจุบัน ({current_price:.2f}) สูงกว่า EMA 200 ({ema200[-1]:.2f})", "info")
                    signal = "none"
                    
        # Apply Multi-Timeframe Trend Filter (HTF EMA 200 Alignment)
        if getattr(bot, "use_mtf_filter", False) and signal in ["buy", "sell"]:
            try:
                # 1. Determine higher timeframe
                htf = "H1"
                tf = bot.timeframe.upper()
                if tf == "M1":
                    htf = "M15"
                elif tf == "M5":
                    htf = "H1"
                elif tf == "M15":
                    htf = "H1"
                elif tf == "M30":
                    htf = "H4"
                elif tf == "H1":
                    htf = "H4"
                elif tf == "H4":
                    htf = "D1"
                else:
                    htf = "D1"
                    
                # 2. Fetch candles for higher timeframe
                htf_candles = self.mt5.get_historical_candles(bot.symbol, htf, count=250)
                if htf_candles and len(htf_candles) >= 200:
                    htf_close_prices = [c["close"] for c in htf_candles]
                    htf_ema200 = calculate_ema(htf_close_prices, 200)
                    htf_current_price = htf_close_prices[-1]
                    
                    if htf_ema200[-1] is not None:
                        # If BUY signal, higher timeframe trend must be Bullish (HTF Close > HTF EMA 200)
                        if signal == "buy" and htf_current_price < htf_ema200[-1]:
                            if int(time.time()) % 60 < 10:
                                self._log_to_db(db, bot.id, f"🛡️ MTF Filter: สัญญาณ BUY ถูกบล็อกเนื่องจากแนวโน้มหลักบน {htf} เป็นขาลง (ราคาปิดปัจจุบัน {htf_current_price:.2f} < EMA 200 {htf_ema200[-1]:.2f})", "info")
                            signal = "none"
                        # If SELL signal, higher timeframe trend must be Bearish (HTF Close < HTF EMA 200)
                        elif signal == "sell" and htf_current_price > htf_ema200[-1]:
                            if int(time.time()) % 60 < 10:
                                self._log_to_db(db, bot.id, f"🛡️ MTF Filter: สัญญาณ SELL ถูกบล็อกเนื่องจากแนวโน้มหลักบน {htf} เป็นขาขึ้น (ราคาปิดปัจจุบัน {htf_current_price:.2f} > EMA 200 {htf_ema200[-1]:.2f})", "info")
                            signal = "none"
            except Exception as mtf_err:
                logger.error(f"Error executing Multi-Timeframe Trend filter: {mtf_err}")
                    
        # Apply Session Time Filter
        allowed_sess = getattr(bot, "allowed_sessions", "all")
        if allowed_sess != "all" and signal in ["buy", "sell"]:
            import datetime
            utc_hour = datetime.datetime.utcnow().hour
            session_names = {
                "asian": "Asian Session (00-08 UTC)",
                "london": "London Session (08-16 UTC)",
                "newyork": "New York Session (13-21 UTC)",
                "london_ny": "London-NY Overlap (13-16 UTC)"
            }
            
            is_allowed = False
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
                    
            if not is_allowed:
                readable_sess = ", ".join([session_names.get(s, s) for s in sessions_list])
                if int(time.time()) % 60 < 10:
                    self._log_to_db(db, bot.id, f"ข้ามนอกช่วงเวลาทำงาน! สัญญาณถูกบล็อกเนื่องจากเวลาปัจจุบัน ({utc_hour:02d}:00 UTC) อยู่นอกเซสชันที่กำหนด: {readable_sess}", "info")
                signal = "none"
        
        # 4. Handle state machine
        if has_active_position and active_pos is not None:
            # Bot currently holds an active position. Check for Exit/Opposite Signal
            pos_type = active_pos["type"]
            
            # If we hold a BUY and get a SELL signal, or hold a SELL and get a BUY signal -> CLOSE position
            should_close = False
            if pos_type == "buy" and signal == "sell":
                should_close = True
            elif pos_type == "sell" and signal == "buy":
                should_close = True
                
            if should_close:
                self._log_to_db(db, bot.id, f"พบสัญญาณตรงกันข้าม ({signal.upper()})! กำลังสั่งปิดออเดอร์ #{bot.active_ticket}", "info")
                try:
                    res = self.mt5.close_position(bot.active_ticket)
                    if res.get("success"):
                        pnl = res.get("profit", 0.0)
                        self._log_to_db(db, bot.id, f"ปิดออเดอร์ #{bot.active_ticket} สำเร็จ! กำไร/ขาดทุน: ${pnl}", "close")
                        
                        # Record simulated closed trade in history database
                        if self.mt5.is_simulated:
                            try:
                                from backend.models import TradeHistoryRecord
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
                                    comment=f"{bot.name} [{bot.algorithms}]"
                                )
                                db.add(history_record)
                            except Exception as e:
                                logger.error(f"Failed to save bot simulated trade history: {e}")
                                
                        bot.active_ticket = None
                        db.commit()
                        # Now that the position is closed, we fall through to open the new opposite position!
                        has_active_position = False
                    else:
                        self._log_to_db(db, bot.id, f"ไม่สามารถปิดออเดอร์ได้: {res.get('comment')}", "error")
                except Exception as close_err:
                    self._log_to_db(db, bot.id, f"ข้อผิดพลาดขณะพยายามปิดออเดอร์: {str(close_err)}", "error")
                    
        # 5. Open new position if no position is active and signal is valid
        if not has_active_position:
            if signal in ["buy", "sell"]:
                # Calculate SL & TP
                sl_price = 0.0
                tp_price = 0.0
                
                pj_tp_target = getattr(bot, "pj_tp_target", "manual")
                is_wave_strategy = any(algo in ["elliott_wave", "harmonic_patterns"] for algo in algorithms_list)
                
                if pj_tp_target and pj_tp_target != "manual":
                    from backend.pattern_detector import calculate_pj_dynamic_levels
                    sl_dist, tp_dist = calculate_pj_dynamic_levels(candles, signal, pj_tp_target)
                    if sl_dist is not None and tp_dist is not None:
                        if signal == "buy":
                            sl_price = current_price - sl_dist
                            tp_price = current_price + tp_dist
                        else: # sell
                            sl_price = current_price + sl_dist
                            tp_price = current_price - tp_dist
                        self._log_to_db(db, bot.id, f"คํานวณ SL/TP แบบไดนามิก ({pj_tp_target.upper()}): SL ห่าง {sl_dist:.4f} (ราคา SL: {sl_price:.4f}), TP ห่าง {tp_dist:.4f} (ราคา TP: {tp_price:.4f})", "info")
                    else:
                        # Fallback
                        self._log_to_db(db, bot.id, "คำเตือน: ไม่สามารถคำนวณ PJ SL/TP แบบไดนามิกได้เนื่องจากข้อมูลไม่พอ ใช้ค่า manual แทน", "error")
                        if signal == "buy":
                            if bot.sl_points > 0: sl_price = current_price - bot.sl_points
                            if bot.tp_points > 0: tp_price = current_price + bot.tp_points
                        else: # sell
                            if bot.sl_points > 0: sl_price = current_price + bot.sl_points
                            if bot.tp_points > 0: tp_price = current_price - bot.tp_points
                elif is_wave_strategy:
                    from backend.pattern_detector import calculate_atr
                    atr_vals = calculate_atr(candles, 14)
                    atr_val = atr_vals[-1] if (atr_vals and atr_vals[-1] is not None) else 0.0
                    if atr_val > 0:
                        sl_dist = 2.0 * atr_val
                        tp_dist = 3.0 * atr_val
                        if signal == "buy":
                            sl_price = current_price - sl_dist
                            tp_price = current_price + tp_dist
                        else: # sell
                            sl_price = current_price + sl_dist
                            tp_price = current_price - tp_dist
                        self._log_to_db(db, bot.id, f"คํานวณ SL/TP แบบไดนามิกอิงตามความผันผวนจริง (ATR-based): SL ห่าง {sl_dist:.4f} (ราคา SL: {sl_price:.4f}), TP ห่าง {tp_dist:.4f} (ราคา TP: {tp_price:.4f})", "info")
                    else:
                        self._log_to_db(db, bot.id, "คำเตือน: ไม่สามารถคำนวณ ATR SL/TP ได้เนื่องจากข้อมูลไม่พอ ใช้ค่า manual แทน", "error")
                        if signal == "buy":
                            if bot.sl_points > 0: sl_price = current_price - bot.sl_points
                            if bot.tp_points > 0: tp_price = current_price + bot.tp_points
                        else: # sell
                            if bot.sl_points > 0: sl_price = current_price + bot.sl_points
                            if bot.tp_points > 0: tp_price = current_price - bot.tp_points
                else:
                    if signal == "buy":
                        if bot.sl_points > 0:
                            sl_price = current_price - bot.sl_points
                        if bot.tp_points > 0:
                            tp_price = current_price + bot.tp_points
                    else: # sell
                        if bot.sl_points > 0:
                            sl_price = current_price + bot.sl_points
                        if bot.tp_points > 0:
                            tp_price = current_price - bot.tp_points
                        
                # Dynamic ATR Risk Position Sizing
                lot_size = bot.lot_size
                if getattr(bot, "use_atr_sizing", False):
                    try:
                        from backend.pattern_detector import calculate_atr
                        atr_vals = calculate_atr(candles, 14)
                        atr_val = atr_vals[-1] if atr_vals[-1] is not None else 0.0
                        
                        sl_dist = bot.sl_points if bot.sl_points > 0 else (1.5 * atr_val)
                        if sl_dist > 0:
                            acct = self.mt5.get_account_info()
                            bal = acct.get("balance", 10000.0)
                            risk_pct = getattr(bot, "risk_percent", 1.0)
                            
                            symbol_upper = bot.symbol.upper()
                            if "XAU" in symbol_upper or "GOLD" in symbol_upper:
                                point_value_at_1_lot = 100.0
                            elif "USD" in symbol_upper or symbol_upper in ["EURUSD", "GBPUSD", "AUDUSD"]:
                                point_value_at_1_lot = 100000.0 * 0.0001
                            elif "AAPL" in symbol_upper or "TSLA" in symbol_upper or "US500" in symbol_upper:
                                point_value_at_1_lot = 1.0
                            else:
                                point_value_at_1_lot = 1.0
                                
                            risk_amt = bal * (risk_pct / 100.0)
                            calculated_lot = risk_amt / (sl_dist * point_value_at_1_lot)
                            lot_size = round(max(0.01, min(10.0, calculated_lot)), 2)
                            self._log_to_db(db, bot.id, f"ระบบคํานวณ Lot (ATR Position Sizing): {lot_size} lot (ความเสี่ยง {risk_pct}% ของบาลานซ์ = ${risk_amt:.2f}, SL ห่าง: {sl_dist:.4f})", "info")
                    except Exception as e:
                        logger.error(f"Error calculating ATR Position Sizing: {e}")
                        
                self._log_to_db(db, bot.id, f"สัญญาณ {signal.upper()} ถูกกระตุ้น! ส่งคำสั่งเทรด {lot_size} Lot {bot.symbol} (ราคาปัจจุบัน: {current_price})", "info")
                
                try:
                    res = self.mt5.open_position(
                        symbol=bot.symbol,
                        order_type=signal,
                        volume=lot_size,
                        sl=round(sl_price, 4),
                        tp=round(tp_price, 4),
                        comment=f"{bot.name} [{bot.algorithms}]"
                    )
                    
                    if res.get("success"):
                        ticket = res.get("ticket")
                        bot.active_ticket = ticket
                        db.commit()
                        
                        log_msg = f"เปิดออเดอร์สำเร็จ! Ticket: #{ticket} | ประเภท: {signal.upper()} | โหมด: {bot.signal_mode.upper()} | ตัวบ่งชี้: {bot.algorithms}"
                        self._log_to_db(db, bot.id, log_msg, signal)
                    else:
                        self._log_to_db(db, bot.id, f"เปิดออเดอร์ล้มเหลว: {res.get('detail')}", "error")
                except Exception as open_err:
                    self._log_to_db(db, bot.id, f"ข้อผิดพลาดในการเปิดออเดอร์: {str(open_err)}", "error")
            else:
                # Log a heartbeat periodically
                if int(time.time()) % 90 < 10:
                    ind_info_list = []
                    for algo in algorithms_list:
                        if algo == "sma_cross":
                            sma5 = calculate_sma(close_prices, 5)[-1]
                            sma15 = calculate_sma(close_prices, 15)[-1]
                            if sma5 is not None and sma15 is not None:
                                ind_info_list.append(f"SMA5={sma5:.2f}/SMA15={sma15:.2f}")
                        elif algo == "rsi_oscillator":
                            rsi = calculate_rsi(close_prices, 14)[-1]
                            if rsi is not None:
                                ind_info_list.append(f"RSI={rsi:.2f}")
                        elif algo == "adx":
                            from backend.pattern_detector import calculate_adx
                            adx_vals, plus_di, minus_di = calculate_adx(candles, 14)
                            if adx_vals[-1] is not None:
                                ind_info_list.append(f"ADX={adx_vals[-1]:.1f}, +DI={plus_di[-1]:.1f}, -DI={minus_di[-1]:.1f}")
                        elif algo == "stoch_rsi":
                            from backend.pattern_detector import calculate_stoch_rsi
                            k_vals, d_vals = calculate_stoch_rsi(close_prices, 14, 14, 3, 3)
                            if k_vals[-1] is not None and d_vals[-1] is not None:
                                ind_info_list.append(f"StochRSI(K={k_vals[-1]:.1f}, D={d_vals[-1]:.1f})")
                        elif algo == "macd":
                            macd_l, signal_l = calculate_macd(close_prices)
                            if macd_l[-1] is not None and signal_l[-1] is not None:
                                ind_info_list.append(f"MACD={macd_l[-1]:.4f}/Signal={signal_l[-1]:.4f}")
                        elif algo == "macd_4c":
                            from backend.pattern_detector import calculate_macd_4c
                            macd_vals, colors = calculate_macd_4c(close_prices, 12, 26, 9)
                            if macd_vals[-1] is not None and colors[-1] is not None:
                                ind_info_list.append(f"MACD4C(Val={macd_vals[-1]:.4f}, Col={colors[-1]})")
                        elif algo == "elliott_wave":
                            from backend.pattern_detector import detect_elliott_waves
                            wave = detect_elliott_waves(candles)
                            if wave:
                                ind_info_list.append(f"Elliott Wave={wave['pattern']}")
                            else:
                                ind_info_list.append("Elliott Wave=No Pattern")
                        elif algo == "harmonic_patterns":
                            from backend.pattern_detector import detect_harmonic_patterns
                            harmonic = detect_harmonic_patterns(candles)
                            if harmonic:
                                ind_info_list.append(f"Harmonic={harmonic['pattern']}")
                            else:
                                ind_info_list.append("Harmonic=No Pattern")
                        elif algo == "ema_cross_50_200":
                            ema50 = calculate_ema(close_prices, 50)[-1]
                            ema200 = calculate_ema(close_prices, 200)[-1]
                            if ema50 is not None and ema200 is not None:
                                ind_info_list.append(f"EMA50={ema50:.2f}/EMA200={ema200:.2f}")
                        elif algo == "rsi_divergence":
                            ind_info_list.append("RSI Div=No Div")
                        elif algo == "atr_breakout":
                            from backend.pattern_detector import calculate_atr
                            atr = calculate_atr(candles, 14)[-1]
                            if atr is not None:
                                ind_info_list.append(f"ATR14={atr:.4f}")
                        elif algo == "support_resistance":
                            ind_info_list.append("S/R=No Bounce")
                        elif algo == "liquidity_sweep":
                            ind_info_list.append("Liq Sweep=No Sweep")
                                
                    ind_info = ", ".join(ind_info_list)
                    self._log_to_db(
                        db, 
                        bot.id, 
                        f"กำลังเฝ้าสังเกตการณ์ตลาด {bot.symbol} ({bot.timeframe}) | โหมด: {bot.signal_mode.upper()} | ตัวชี้วัด: {ind_info} (ไร้สัญญาณ)", 
                        "info"
                    )
