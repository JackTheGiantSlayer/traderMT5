import logging

logger = logging.getLogger("PatternDetector")

def detect_swings(candles, window=4):
    """
    Detects swing highs and swing lows in candle data.
    Ensures that swings strictly alternate (high -> low -> high -> low ...).
    candles: list of dicts with {"time": int, "high": float, "low": float, "close": float}
    """
    swings = []
    n = len(candles)
    if n < window * 2 + 1:
        return []
        
    for i in range(window, n - window):
        is_high = True
        is_low = True
        
        val_high = candles[i]["high"]
        val_low = candles[i]["low"]
        
        # Check surrounding window
        for j in range(1, window + 1):
            if candles[i - j]["high"] > val_high or candles[i + j]["high"] > val_high:
                is_high = False
            if candles[i - j]["low"] < val_low or candles[i + j]["low"] < val_low:
                is_low = False
                
        if is_high and not is_low:
            swings.append({
                "type": "high",
                "index": i,
                "price": val_high,
                "time": candles[i]["time"]
            })
        elif is_low and not is_high:
            swings.append({
                "type": "low",
                "index": i,
                "price": val_low,
                "time": candles[i]["time"]
            })
            
    # Cleaning pass to ensure strict alternation (High -> Low -> High -> Low ...)
    if not swings:
        return []
        
    alternating = []
    for s in swings:
        if not alternating:
            alternating.append(s)
        else:
            prev = alternating[-1]
            if prev["type"] == s["type"]:
                # Same type back-to-back! Keep the most extreme one
                if prev["type"] == "high":
                    if s["price"] > prev["price"]:
                        alternating[-1] = s # Keep higher high
                else:
                    if s["price"] < prev["price"]:
                        alternating[-1] = s # Keep lower low
            else:
                alternating.append(s)
                
    return alternating

def check_ratio(val, target, tolerance=0.15):
    """Checks if ratio is within tolerance of target."""
    return abs(val - target) <= (target * tolerance)

def detect_harmonic_patterns(candles):
    """
    Scans historical candles to detect harmonic patterns (Gartley, Bat, Butterfly, Crab).
    Returns pattern details if found, else None.
    """
    swings = detect_swings(candles)
    if len(swings) < 5:
        return None
        
    # Get last 5 alternating swing points: X, A, B, C, D
    pts = swings[-5:]
    X, A, B, C, D = pts[0], pts[1], pts[2], pts[3], pts[4]
    
    pX, pA, pB, pC, pD = X["price"], A["price"], B["price"], C["price"], D["price"]
    
    XA = abs(pA - pX)
    AB = abs(pB - pA)
    BC = abs(pC - pB)
    CD = abs(pD - pC)
    XD = abs(pD - pX)
    
    if XA == 0 or AB == 0 or BC == 0 or CD == 0:
        return None
        
    rAB = AB / XA
    rBC = BC / AB
    rCD = CD / BC
    rXD = XD / XA
    
    # Structural check for alternating peak/trough directions
    is_bullish = (X["type"] == "low" and A["type"] == "high" and B["type"] == "low" and C["type"] == "high" and D["type"] == "low")
    is_bearish = (X["type"] == "high" and A["type"] == "low" and B["type"] == "high" and C["type"] == "low" and D["type"] == "high")
    
    if not (is_bullish or is_bearish):
        return None
        
    pattern_name = None
    
    # 1. Gartley Pattern
    if (check_ratio(rAB, 0.618) and 
        (0.382 - 0.1 <= rBC <= 0.886 + 0.1) and 
        (1.272 - 0.15 <= rCD <= 1.618 + 0.15) and 
        check_ratio(rXD, 0.786)):
        pattern_name = "Gartley"
        
    # 2. Bat Pattern
    elif ((0.382 - 0.1 <= rAB <= 0.50 + 0.05) and 
          (0.382 - 0.1 <= rBC <= 0.886 + 0.1) and 
          (1.618 - 0.2 <= rCD <= 2.618 + 0.2) and 
          check_ratio(rXD, 0.886)):
        pattern_name = "Bat"
        
    # 3. Butterfly Pattern
    elif (check_ratio(rAB, 0.786) and 
          (0.382 - 0.1 <= rBC <= 0.886 + 0.1) and 
          (1.618 - 0.2 <= rCD <= 2.24 + 0.2) and 
          (1.272 - 0.1 <= rXD <= 1.618 + 0.1)):
        pattern_name = "Butterfly"
        
    # 4. Crab Pattern
    elif ((0.382 - 0.1 <= rAB <= 0.618 + 0.08) and 
          (0.382 - 0.1 <= rBC <= 0.886 + 0.1) and 
          (2.24 - 0.3 <= rCD <= 3.618 + 0.3) and 
          check_ratio(rXD, 1.618)):
        pattern_name = "Crab"
        
    if pattern_name:
        direction = "bullish" if is_bullish else "bearish"
        signal = "buy" if is_bullish else "sell"
        return {
            "pattern": f"{direction.capitalize()} {pattern_name}",
            "direction": direction,
            "signal": signal,
            "points": [X, A, B, C, D],
            "ratios": {
                "AB_XA": round(rAB, 3),
                "BC_AB": round(rBC, 3),
                "CD_BC": round(rCD, 3),
                "XD_XA": round(rXD, 3)
            }
        }
        
    return None

def detect_elliott_waves(candles):
    """
    Scans historical swings to detect Elliott Wave structures.
    Matches impulsive wave 4-to-5 transitions and completed 5-wave structures.
    """
    swings = detect_swings(candles)
    if len(swings) < 5:
        return None
        
    # We analyze last 5 swing points: S0, S1, S2, S3, S4
    pts5 = swings[-5:]
    S0, S1, S2, S3, S4 = pts5[0], pts5[1], pts5[2], pts5[3], pts5[4]
    p0, p1, p2, p3, p4 = S0["price"], S1["price"], S2["price"], S3["price"], S4["price"]
    
    # 1. Bullish Wave 4 to 5 Transition (Buying setup)
    if (S0["type"] == "low" and S1["type"] == "high" and 
        S2["type"] == "low" and S3["type"] == "high" and S4["type"] == "low"):
        # Wave 1 is upward (p1 > p0)
        # Wave 2 retraces part of Wave 1 but remains above Wave 1 start (p2 > p0 and p2 < p1)
        # Wave 3 breaks above Wave 1 peak (p3 > p1)
        # Wave 4 correction remains above Wave 1 peak (no overlap rule) (p4 > p1 and p4 < p3)
        if (p1 > p0 and p2 > p0 and p2 < p1 and p3 > p1 and p4 < p3 and p4 > p1):
            return {
                "pattern": "Elliott Wave 4-to-5 Impulse (Bullish)",
                "direction": "bullish",
                "signal": "buy",
                "points": [S0, S1, S2, S3, S4],
                "description": "Wave 4 correction completed above Wave 1 peak. Anticipating Wave 5 impulse upward."
            }
            
    # 2. Bearish Wave 4 to 5 Transition (Selling setup)
    if (S0["type"] == "high" and S1["type"] == "low" and 
        S2["type"] == "high" and S3["type"] == "low" and S4["type"] == "high"):
        # Wave 1 is downward (p1 < p0)
        # Wave 2 retraces part of Wave 1 but remains below Wave 1 start (p2 < p0 and p2 > p1)
        # Wave 3 breaks below Wave 1 bottom (p3 < p1)
        # Wave 4 correction remains below Wave 1 bottom (no overlap rule) (p4 < p1 and p4 > p3)
        if (p1 < p0 and p2 < p0 and p2 > p1 and p3 < p1 and p4 > p3 and p4 < p1):
            return {
                "pattern": "Elliott Wave 4-to-5 Impulse (Bearish)",
                "direction": "bearish",
                "signal": "sell",
                "points": [S0, S1, S2, S3, S4],
                "description": "Wave 4 correction completed below Wave 1 bottom. Anticipating Wave 5 impulse downward."
            }

    # Now check 6 points for a completed 5-wave reversal pattern (requires S0 to S5)
    if len(swings) >= 6:
        pts6 = swings[-6:]
        S0, S1, S2, S3, S4, S5 = pts6[0], pts6[1], pts6[2], pts6[3], pts6[4], pts6[5]
        p0, p1, p2, p3, p4, p5 = S0["price"], S1["price"], S2["price"], S3["price"], S4["price"], S5["price"]
        
        # 3. Completed Bullish 5-Wave Structure (Selling setup at peak)
        if (S0["type"] == "low" and S1["type"] == "high" and 
            S2["type"] == "low" and S3["type"] == "high" and 
            S4["type"] == "low" and S5["type"] == "high"):
            if (p1 > p0 and p2 > p0 and p2 < p1 and p3 > p1 and p4 < p3 and p4 > p1 and p5 > p3):
                return {
                    "pattern": "Elliott Wave 5 Peak (Bearish Correction Expected)",
                    "direction": "bearish",
                    "signal": "sell",
                    "points": [S0, S1, S2, S3, S4, S5],
                    "description": "Completed 5-wave bullish structure. Anticipating ABC corrective reversal downward."
                }
                
        # 4. Completed Bearish 5-Wave Structure (Buying setup at trough)
        if (S0["type"] == "high" and S1["type"] == "low" and 
            S2["type"] == "high" and S3["type"] == "low" and 
            S4["type"] == "high" and S5["type"] == "low"):
                return {
                    "pattern": "Elliott Wave 5 Trough (Bullish Correction Expected)",
                    "direction": "bullish",
                    "signal": "buy",
                    "points": [S0, S1, S2, S3, S4, S5],
                    "description": "Completed 5-wave bearish structure. Anticipating ABC corrective reversal upward."
                }
                
    return None

# --- Custom Indicators requested by User ---

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

def calculate_atr(candles, period=14):
    """Calculates Average True Range."""
    if len(candles) < period + 1:
        return [None] * len(candles)
    
    tr_vals = []
    # First candle has TR = High - Low
    tr_vals.append(candles[0]["high"] - candles[0]["low"])
    
    for i in range(1, len(candles)):
        h = candles[i]["high"]
        l = candles[i]["low"]
        pc = candles[i - 1]["close"]
        tr = max(h - l, abs(h - pc), abs(l - pc))
        tr_vals.append(tr)
        
    # ATR is SMA of TR
    atr_vals = [None] * (period - 1)
    first_atr = sum(tr_vals[:period]) / period
    atr_vals.append(first_atr)
    
    current_atr = first_atr
    for i in range(period, len(tr_vals)):
        current_atr = (current_atr * (period - 1) + tr_vals[i]) / period
        atr_vals.append(current_atr)
        
    return atr_vals

def calculate_stoch_rsi(prices, rsi_period=14, stoch_period=14, k_period=3, d_period=3):
    """
    Calculates Stochastic RSI (%K and %D lines).
    Returns list of %K and %D values (0 to 100).
    """
    # 1. Calculate RSI
    rsi_vals = calculate_rsi(prices, rsi_period)
    
    # 2. Calculate StochRSI
    stoch_rsi_vals = []
    for i in range(len(rsi_vals)):
        if i < rsi_period + stoch_period - 1:
            stoch_rsi_vals.append(None)
            continue
            
        sub_rsi = rsi_vals[i - stoch_period + 1 : i + 1]
        if any(x is None for x in sub_rsi):
            stoch_rsi_vals.append(None)
            continue
            
        min_rsi = min(sub_rsi)
        max_rsi = max(sub_rsi)
        
        if max_rsi == min_rsi:
            stoch_rsi_vals.append(100.0)
        else:
            stoch_rsi_vals.append(((rsi_vals[i] - min_rsi) / (max_rsi - min_rsi)) * 100.0)
            
    # 3. Calculate %K (SMA of StochRSI)
    k_vals = [None] * len(stoch_rsi_vals)
    first_valid_k_idx = rsi_period + stoch_period - 1
    
    for i in range(first_valid_k_idx + k_period - 1, len(stoch_rsi_vals)):
        sub_stoch = stoch_rsi_vals[i - k_period + 1 : i + 1]
        if any(x is None for x in sub_stoch):
            continue
        k_vals[i] = sum(sub_stoch) / k_period
        
    # 4. Calculate %D (SMA of %K)
    d_vals = [None] * len(k_vals)
    first_valid_d_idx = first_valid_k_idx + k_period - 1
    
    for i in range(first_valid_d_idx + d_period - 1, len(k_vals)):
        sub_k = k_vals[i - d_period + 1 : i + 1]
        if any(x is None for x in sub_k):
            continue
        d_vals[i] = sum(sub_k) / d_period
        
    return k_vals, d_vals

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

def calculate_macd_4c(prices, fast_period=12, slow_period=26, signal_period=9):
    """
    Calculates 4 Color MACD (MACD 4C) values and their corresponding colors.
    Returns: lists of (macd_vals, colors)
    """
    if len(prices) < slow_period:
        return [None] * len(prices), [None] * len(prices)
        
    fast_ema = calculate_ema(prices, fast_period)
    slow_ema = calculate_ema(prices, slow_period)
    
    macd_vals = []
    for f, s in zip(fast_ema, slow_ema):
        if f is None or s is None:
            macd_vals.append(None)
        else:
            macd_vals.append(f - s)
            
    colors = [None] * len(macd_vals)
    for i in range(1, len(macd_vals)):
        curr = macd_vals[i]
        prev = macd_vals[i - 1]
        
        if curr is None or prev is None:
            continue
            
        if curr > 0:
            colors[i] = "lime" if curr > prev else "green"
        else:
            colors[i] = "maroon" if curr < prev else "red"
            
    return macd_vals, colors

def detect_rsi_divergence(candles, rsi_period=14):
    """
    Detects Bullish and Bearish RSI Divergence based on swing highs/lows.
    Returns 'buy', 'sell' or 'none'.
    """
    if len(candles) < 40:
        return "none"
        
    close_prices = [c["close"] for c in candles]
    rsi_vals = calculate_rsi(close_prices, rsi_period)
    
    swings = detect_swings(candles, window=3)
    if len(swings) < 3:
        return "none"
        
    high_swings = [s for s in swings if s["type"] == "high"]
    low_swings = [s for s in swings if s["type"] == "low"]
    
    # Check for Bullish Divergence (on lows)
    if len(low_swings) >= 2:
        s1, s2 = low_swings[-2], low_swings[-1]
        i1, i2 = s1["index"], s2["index"]
        
        if i1 < len(rsi_vals) and i2 < len(rsi_vals) and rsi_vals[i1] is not None and rsi_vals[i2] is not None:
            # Lower Low in Price
            price_ll = s2["price"] < s1["price"]
            # Higher Low in RSI
            rsi_hl = rsi_vals[i2] > rsi_vals[i1]
            # The swing low must be in oversold or near oversold area (< 45)
            rsi_low_zone = rsi_vals[i2] < 45
            # Recent check (last swing low within last 8 bars)
            recent = (len(candles) - 1 - i2) < 8
            
            if price_ll and rsi_hl and rsi_low_zone and recent:
                return "buy"
                
    # Check for Bearish Divergence (on highs)
    if len(high_swings) >= 2:
        s1, s2 = high_swings[-2], high_swings[-1]
        i1, i2 = s1["index"], s2["index"]
        
        if i1 < len(rsi_vals) and i2 < len(rsi_vals) and rsi_vals[i1] is not None and rsi_vals[i2] is not None:
            # Higher High in Price
            price_hh = s2["price"] > s1["price"]
            # Lower High in RSI
            rsi_lh = rsi_vals[i2] < rsi_vals[i1]
            rsi_high_zone = rsi_vals[i2] > 55
            recent = (len(candles) - 1 - i2) < 8
            
            if price_hh and rsi_lh and rsi_high_zone and recent:
                return "sell"
                
    return "none"

def detect_support_resistance_bounce(candles, lookback=100):
    """
    Detects bounces off Support & Resistance levels.
    """
    if len(candles) < 30:
        return "none"
        
    swings = detect_swings(candles[-lookback:], window=3)
    if not swings:
        return "none"
        
    high_swings = [s["price"] for s in swings if s["type"] == "high"]
    low_swings = [s["price"] for s in swings if s["type"] == "low"]
    
    if not high_swings or not low_swings:
        return "none"
        
    current_price = candles[-1]["close"]
    prev_close = candles[-2]["close"]
    
    support = min(low_swings)
    resistance = max(high_swings)
    
    # 0.15% tolerance buffer
    tolerance = current_price * 0.0015
    
    # 1. Bullish bounce off support:
    near_support = abs(candles[-1]["low"] - support) <= tolerance or abs(candles[-2]["low"] - support) <= tolerance
    bullish_reaction = candles[-1]["close"] > candles[-1]["open"] and candles[-1]["close"] > prev_close
    
    if near_support and bullish_reaction and current_price > support:
        return "buy"
        
    # 2. Bearish bounce off resistance:
    near_resistance = abs(candles[-1]["high"] - resistance) <= tolerance or abs(candles[-2]["high"] - resistance) <= tolerance
    bearish_reaction = candles[-1]["close"] < candles[-1]["open"] and candles[-1]["close"] < prev_close
    
    if near_resistance and bearish_reaction and current_price < resistance:
        return "sell"
        
    return "none"

def detect_liquidity_sweep(candles, lookback=40):
    """
    Detects a Liquidity Sweep (Turtle Soup/Stop Hunt).
    """
    if len(candles) < 15:
        return "none"
        
    current_candle = candles[-1]
    prev_candles = candles[-lookback:-1]
    
    recent_highs = [c["high"] for c in prev_candles]
    recent_lows = [c["low"] for c in prev_candles]
    
    highest_high = max(recent_highs)
    lowest_low = min(recent_lows)
    
    # 1. Bullish Liquidity Sweep (Sweeping Sell-Side Liquidity):
    swept_lows = current_candle["low"] < lowest_low
    closed_above_lows = current_candle["close"] > lowest_low
    bullish_close = current_candle["close"] > current_candle["open"]
    
    if swept_lows and closed_above_lows and bullish_close:
        return "buy"
        
    # 2. Bearish Liquidity Sweep (Sweeping Buy-Side Liquidity):
    swept_highs = current_candle["high"] > highest_high
    closed_below_highs = current_candle["close"] < highest_high
    bearish_close = current_candle["close"] < current_candle["open"]
    
    if swept_highs and closed_below_highs and bearish_close:
        return "sell"
        
    return "none"

def detect_market_structure(candles, window=4):
    """
    Detects BOS (Break of Structure) and CHoCH (Change of Character).
    Returns {"type": "bos"|"choch"|"none", "direction": "bullish"|"bearish"|"none", "price": float}
    """
    swings = detect_swings(candles, window=window)
    if len(swings) < 4:
        return {"type": "none", "direction": "none", "price": 0.0}
        
    pts = swings[-4:]
    S0, S1, S2, S3 = pts[0], pts[1], pts[2], pts[3]
    
    current_price = candles[-1]["close"]
    prev_price = candles[-2]["close"]
    
    is_bullish_trend = False
    is_bearish_trend = False
    
    highs = [s for s in pts if s["type"] == "high"]
    lows = [s for s in pts if s["type"] == "low"]
    
    if len(highs) >= 2 and len(lows) >= 2:
        highs_sorted = sorted(highs, key=lambda x: x["index"])
        lows_sorted = sorted(lows, key=lambda x: x["index"])
        if highs_sorted[1]["price"] > highs_sorted[0]["price"] and lows_sorted[1]["price"] > lows_sorted[0]["price"]:
            is_bullish_trend = True
        elif highs_sorted[1]["price"] < highs_sorted[0]["price"] and lows_sorted[1]["price"] < lows_sorted[0]["price"]:
            is_bearish_trend = True
            
    last_high = highs[-1]["price"]
    last_low = lows[-1]["price"]
    
    # 1. Bullish Breakout
    if prev_price <= last_high and current_price > last_high:
        if is_bullish_trend:
            return {"type": "bos", "direction": "bullish", "price": last_high}
        else:
            return {"type": "choch", "direction": "bullish", "price": last_high}
            
    # 2. Bearish Breakout
    if prev_price >= last_low and current_price < last_low:
        if is_bearish_trend:
            return {"type": "bos", "direction": "bearish", "price": last_low}
        else:
            return {"type": "choch", "direction": "bearish", "price": last_low}
            
    return {"type": "none", "direction": "none", "price": 0.0}

def detect_all_market_structures(candles, window=4):
    """
    Detects all historical BOS (Break of Structure) and CHoCH (Change of Character) levels in the candle sequence.
    Returns a list of dicts with {"type": "bos"|"choch", "direction": "bullish"|"bearish", "price": float, "time": int}
    """
    swings = detect_swings(candles, window=window)
    if len(swings) < 4:
        return []
        
    structures = []
    current_trend = None # "bullish" or "bearish"
    
    active_high = None
    active_low = None
    
    swing_map = {s["index"]: s for s in swings}
    
    for i in range(len(candles)):
        if i in swing_map:
            s = swing_map[i]
            if s["type"] == "high":
                active_high = s
            elif s["type"] == "low":
                active_low = s
                
        if active_high and i > active_high["index"]:
            if candles[i]["close"] > active_high["price"]:
                if current_trend == "bearish":
                    struct_type = "choch"
                    current_trend = "bullish"
                elif current_trend == "bullish":
                    struct_type = "bos"
                    current_trend = "bullish"
                else:
                    struct_type = "choch"
                    current_trend = "bullish"
                    
                middle_idx = (active_high["index"] + i) // 2
                structures.append({
                    "type": struct_type,
                    "direction": "bullish",
                    "price": active_high["price"],
                    "time": candles[i]["time"],
                    "start_time": active_high["time"],
                    "end_time": candles[i]["time"],
                    "middle_time": candles[middle_idx]["time"]
                })
                active_high = None
                
        if active_low and i > active_low["index"]:
            if candles[i]["close"] < active_low["price"]:
                if current_trend == "bullish":
                    struct_type = "choch"
                    current_trend = "bearish"
                elif current_trend == "bearish":
                    struct_type = "bos"
                    current_trend = "bearish"
                else:
                    struct_type = "choch"
                    current_trend = "bearish"
                    
                middle_idx = (active_low["index"] + i) // 2
                structures.append({
                    "type": struct_type,
                    "direction": "bearish",
                    "price": active_low["price"],
                    "time": candles[i]["time"],
                    "start_time": active_low["time"],
                    "end_time": candles[i]["time"],
                    "middle_time": candles[middle_idx]["time"]
                })
                active_low = None
                
    return structures

def detect_order_blocks(candles, lookback=40):
    """
    Detects Order Blocks (OB) and checks if the current candle is testing & reversing off them.
    Returns 'buy', 'sell', or 'none'.
    """
    if len(candles) < 20:
        return "none"
        
    bullish_obs = []
    bearish_obs = []
    
    start_idx = max(2, len(candles) - lookback)
    for i in range(start_idx, len(candles) - 1):
        c = candles[i]
        body = abs(c["close"] - c["open"])
        rng = c["high"] - c["low"]
        
        # Look for strong momentum body
        if rng > 0 and body > 0.6 * rng and body > 0.001 * c["close"]:
            if c["close"] > c["open"]: # Bullish expansion
                for k in range(1, 4):
                    prev = candles[i - k]
                    if prev["close"] < prev["open"]:
                        bullish_obs.append({
                            "high": prev["high"],
                            "low": prev["low"],
                            "time": prev["time"]
                        })
                        break
            elif c["close"] < c["open"]: # Bearish expansion
                for k in range(1, 4):
                    prev = candles[i - k]
                    if prev["close"] > prev["open"]:
                        bearish_obs.append({
                            "high": prev["high"],
                            "low": prev["low"],
                            "time": prev["time"]
                        })
                        break
                        
    if not bullish_obs and not bearish_obs:
        return "none"
        
    current_candle = candles[-1]
    prev_candle = candles[-2]
    
    for ob in bullish_obs[-3:]:
        touched_zone = current_candle["low"] <= ob["high"] and current_candle["low"] >= ob["low"]
        bullish_reaction = current_candle["close"] > current_candle["open"] and current_candle["close"] > prev_candle["close"]
        if touched_zone and bullish_reaction:
            return "buy"
            
    for ob in bearish_obs[-3:]:
        touched_zone = current_candle["high"] >= ob["low"] and current_candle["high"] <= ob["high"]
        bearish_reaction = current_candle["close"] < current_candle["open"] and current_candle["close"] < prev_candle["close"]
        if touched_zone and bearish_reaction:
            return "sell"
            
    return "none"

def detect_fvg(candles, lookback=30):
    """
    Detects Fair Value Gaps (FVG) and checks if price is filling and bouncing off them.
    Returns 'buy', 'sell', or 'none'.
    """
    if len(candles) < 15:
        return "none"
        
    bullish_fvgs = []
    bearish_fvgs = []
    
    start_idx = max(2, len(candles) - lookback)
    for i in range(start_idx, len(candles) - 1):
        c1, c2, c3 = candles[i - 2], candles[i - 1], candles[i]
        
        # Bullish FVG (Imbalance)
        if c1["high"] < c3["low"] and c2["close"] > c2["open"]:
            bullish_fvgs.append({
                "top": c3["low"],
                "bottom": c1["high"],
                "time": c2["time"]
            })
            
        # Bearish FVG (Imbalance)
        if c1["low"] > c3["high"] and c2["close"] < c2["open"]:
            bearish_fvgs.append({
                "top": c1["low"],
                "bottom": c3["high"],
                "time": c2["time"]
            })
            
    if not bullish_fvgs and not bearish_fvgs:
        return "none"
        
    current_candle = candles[-1]
    prev_candle = candles[-2]
    
    for fvg in bullish_fvgs[-3:]:
        touched = current_candle["low"] <= fvg["top"] and current_candle["low"] >= fvg["bottom"]
        bullish_bounce = current_candle["close"] > current_candle["open"] and current_candle["close"] > prev_candle["close"]
        if touched and bullish_bounce:
            return "buy"
            
    for fvg in bearish_fvgs[-3:]:
        touched = current_candle["high"] >= fvg["bottom"] and current_candle["high"] <= fvg["top"]
        bearish_bounce = current_candle["close"] < current_candle["open"] and current_candle["close"] < prev_candle["close"]
        if touched and bearish_bounce:
            return "sell"
            
    return "none"
