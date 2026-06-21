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
            # Wave 1 is downward (p1 < p0)
            # Wave 2 retraces part of Wave 1 but remains below Wave 1 start (p2 < p0 and p2 > p1)
            # Wave 3 breaks below Wave 1 bottom (p3 < p1)
            # Wave 4 correction remains below Wave 1 bottom (no overlap) (p4 < p1 and p4 > p3)
            # Wave 5 extends below Wave 3 bottom (p5 < p3)
            if (p1 < p0 and p2 < p0 and p2 > p1 and p3 < p1 and p4 > p3 and p4 < p1 and p5 < p3):
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

def calculate_stoch_rsi(prices, rsi_period=13, stoch_period=13, k_period=3, d_period=3):
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
    if len(prices) < slow_period + signal_period:
        return [None] * len(prices), [None] * len(prices)
        
    macd_line, signal_line = calculate_macd(prices, fast_period, slow_period, signal_period)
    
    # Calculate Histogram = MACD Line - Signal Line
    hist_vals = []
    for m, s in zip(macd_line, signal_line):
        if m is None or s is None:
            hist_vals.append(None)
        else:
            hist_vals.append(m - s)
            
    colors = [None] * len(hist_vals)
    for i in range(1, len(hist_vals)):
        curr = hist_vals[i]
        prev = hist_vals[i - 1]
        
        if curr is None or prev is None:
            continue
            
        if curr > 0:
            colors[i] = "lime" if curr > prev else "green"
        else:
            colors[i] = "maroon" if curr < prev else "red"
            
    return hist_vals, colors

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

# --- PJ Indicator calculations ---

def calculate_sma(prices, period):
    """Calculates Simple Moving Average."""
    if len(prices) < period:
        return [None] * len(prices)
    sma_vals = [None] * (period - 1)
    for i in range(period - 1, len(prices)):
        sma_vals.append(sum(prices[i - period + 1 : i + 1]) / period)
    return sma_vals

def calculate_stochastic(candles, period=9, k_period=3, d_period=3):
    """Calculates Stochastic %K and %D lines."""
    n = len(candles)
    if n < period:
        return [None] * n, [None] * n
    
    stoch_raw = []
    for i in range(n):
        if i < period - 1:
            stoch_raw.append(None)
            continue
        sub_candles = candles[i - period + 1 : i + 1]
        lows = [c["low"] for c in sub_candles]
        highs = [c["high"] for c in sub_candles]
        min_low = min(lows)
        max_high = max(highs)
        
        if max_high == min_low:
            stoch_raw.append(50.0)
        else:
            val = 100.0 * (candles[i]["close"] - min_low) / (max_high - min_low)
            stoch_raw.append(val)
            
    # Calculate %K (3-period SMA of stoch_raw)
    k_vals = []
    for i in range(n):
        if i < period - 1 + k_period - 1:
            k_vals.append(None)
            continue
        sub_raw = stoch_raw[i - k_period + 1 : i + 1]
        if any(x is None for x in sub_raw):
            k_vals.append(None)
        else:
            k_vals.append(sum(sub_raw) / k_period)
            
    # Calculate %D (3-period SMA of %K)
    d_vals = []
    for i in range(n):
        if i < period - 1 + k_period - 1 + d_period - 1:
            d_vals.append(None)
            continue
        sub_k = k_vals[i - d_period + 1 : i + 1]
        if any(x is None for x in sub_k):
            d_vals.append(None)
        else:
            d_vals.append(sum(sub_k) / d_period)
            
    return k_vals, d_vals

def calculate_bollinger_bands(prices, period=14, std_multiplier=2.0):
    """Calculates Bollinger Bands Basis, Upper, and Lower."""
    n = len(prices)
    if n < period:
        return [None] * n, [None] * n, [None] * n
    
    basis = [None] * (period - 1)
    upper = [None] * (period - 1)
    lower = [None] * (period - 1)
    
    for i in range(period - 1, n):
        sub_prices = prices[i - period + 1 : i + 1]
        mean = sum(sub_prices) / period
        variance = sum((x - mean) ** 2 for x in sub_prices) / period
        std_dev = variance ** 0.5
        
        basis.append(mean)
        upper.append(mean + std_multiplier * std_dev)
        lower.append(mean - std_multiplier * std_dev)
        
    return basis, upper, lower

def calculate_vwap(candles, anchor="Session"):
    """Calculates Volume Weighted Average Price (VWAP) resetting at Session/Week/Month."""
    from datetime import datetime
    n = len(candles)
    vwap_vals = []
    
    cum_pv = 0.0
    cum_v = 0.0
    prev_date = None
    
    for i in range(n):
        c = candles[i]
        t = c["time"]
        dt = datetime.fromtimestamp(t)
        
        reset = False
        if prev_date is not None:
            if anchor == "Session":
                reset = (dt.date() != prev_date.date())
            elif anchor == "Week":
                reset = (dt.isocalendar()[1] != prev_date.isocalendar()[1] or dt.year != prev_date.year)
            elif anchor == "Month":
                reset = (dt.month != prev_date.month or dt.year != prev_date.year)
                
        if reset:
            cum_pv = 0.0
            cum_v = 0.0
            
        hlc3 = (c["high"] + c["low"] + c["close"]) / 3.0
        vol = c.get("volume", 1.0)
        if vol <= 0:
            vol = 1.0
            
        cum_pv += hlc3 * vol
        cum_v += vol
        
        vwap_vals.append(cum_pv / cum_v)
        prev_date = dt
        
    return vwap_vals

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
    first_valid_idx = slow_period - 1
    valid_macd = macd_line[first_valid_idx:]
    
    valid_signal = calculate_ema(valid_macd, signal_period)
    
    signal_line = [None] * first_valid_idx + valid_signal
    return macd_line, signal_line

def calculate_pj_indicator_trend_and_score(candles, timeframe="H1", min_score=6, use_volume=False, vol_multiplier=2.0, vwap_anchor="Session"):
    """
    Calculates the Trend direction and Confluence Scores of the PJ Indicator.
    """
    n = len(candles)
    if n < 55:
        return [{
            "bull_score": 0, "bear_score": 0,
            "trend_bull": False, "trend_bear": False,
            "trend_text": "SIDEWAY", "trend_col": "#D4AF37",
            "high_vol": False,
            "ema14": None, "rsi14": None, "vwap": None,
            "macd_line": None, "macd_signal": None,
            "stoch_k": None, "stoch_d": None, "bb_basis": None
        }] * n
        
    prices = [c["close"] for c in candles]
    
    ema14 = calculate_ema(prices, 14)
    rsi14 = calculate_rsi(prices, 14)
    macd_line, macd_signal = calculate_macd(prices, 15, 35, 9)
    stoch_k, stoch_d = calculate_stochastic(candles, 9, 3, 3)
    bb_basis, bb_upper, bb_lower = calculate_bollinger_bands(prices, 14, 2.0)
    vwap_vals = calculate_vwap(candles, anchor=vwap_anchor)
    
    vol_prices = [c.get("volume", 1.0) for c in candles]
    vol_avg = calculate_sma(vol_prices, 20)
    high_vol_list = []
    for i in range(n):
        vol = candles[i].get("volume", 1.0)
        avg = vol_avg[i]
        high_vol_list.append(vol > avg * vol_multiplier if avg is not None else False)
        
    results = []
    for i in range(n):
        if (ema14[i] is None or rsi14[i] is None or macd_line[i] is None or 
            macd_signal[i] is None or stoch_k[i] is None or stoch_d[i] is None or 
            bb_basis[i] is None or vwap_vals[i] is None):
            results.append({
                "bull_score": 0, "bear_score": 0,
                "trend_bull": False, "trend_bear": False,
                "trend_text": "SIDEWAY", "trend_col": "#D4AF37",
                "high_vol": high_vol_list[i],
                "ema14": None, "rsi14": None, "vwap": None,
                "macd_line": None, "macd_signal": None,
                "stoch_k": None, "stoch_d": None, "bb_basis": None
            })
            continue
            
        close = candles[i]["close"]
        
        # Bull conditions
        ema_bull = close > ema14[i]
        vwap_bull = close > vwap_vals[i]
        macd_bull = macd_line[i] > macd_signal[i]
        rsi_bull = rsi14[i] > 55
        stoch_bull = stoch_k[i] > stoch_d[i] and stoch_k[i] > 50
        bb_bull = close > bb_basis[i]
        
        bull_score = ((2 if ema_bull else 0) + 
                      (2 if vwap_bull else 0) + 
                      (2 if macd_bull else 0) + 
                      (2 if rsi_bull else 0) + 
                      (1 if stoch_bull else 0) + 
                      (1 if bb_bull else 0))
                      
        # Bear conditions
        ema_bear = close < ema14[i]
        vwap_bear = close < vwap_vals[i]
        macd_bear = macd_line[i] < macd_signal[i]
        rsi_bear = rsi14[i] < 45
        stoch_bear = stoch_k[i] < stoch_d[i] and stoch_k[i] < 50
        bb_bear = close < bb_basis[i]
        
        bear_score = ((2 if ema_bear else 0) + 
                      (2 if vwap_bear else 0) + 
                      (2 if macd_bear else 0) + 
                      (2 if rsi_bear else 0) + 
                      (1 if stoch_bear else 0) + 
                      (1 if bb_bear else 0))
                      
        trend_bull = bull_score >= min_score and bull_score > bear_score
        trend_bear = bear_score >= min_score and bear_score > bull_score
        
        trend_text = "UPTREND" if trend_bull else "DOWNTREND" if trend_bear else "SIDEWAY"
        trend_col = "#00C853" if trend_bull else "#FF1744" if trend_bear else "#D4AF37"
        
        results.append({
            "bull_score": bull_score,
            "bear_score": bear_score,
            "trend_bull": trend_bull,
            "trend_bear": trend_bear,
            "trend_text": trend_text,
            "trend_col": trend_col,
            "high_vol": high_vol_list[i],
            "ema14": ema14[i],
            "rsi14": rsi14[i],
            "vwap": vwap_vals[i],
            "macd_line": macd_line[i],
            "macd_signal": macd_signal[i],
            "stoch_k": stoch_k[i],
            "stoch_d": stoch_d[i],
            "bb_basis": bb_basis[i]
        })
        
    return results


def calculate_adx(candles, period=14):
    """
    Calculates ADX (Average Directional Index), +DI, and -DI using Wilder's smoothing.
    Returns: (adx_list, plus_di_list, minus_di_list)
    """
    n = len(candles)
    if n < period + 1:
        return [None] * n, [None] * n, [None] * n
        
    tr_vals = [None]
    plus_dm_vals = [None]
    minus_dm_vals = [None]
    
    for i in range(1, n):
        h = candles[i]["high"]
        l = candles[i]["low"]
        ph = candles[i - 1]["high"]
        pl = candles[i - 1]["low"]
        pc = candles[i - 1]["close"]
        
        tr = max(h - l, abs(h - pc), abs(l - pc))
        tr_vals.append(tr)
        
        up_move = h - ph
        down_move = pl - l
        
        if up_move > down_move and up_move > 0:
            plus_dm = up_move
        else:
            plus_dm = 0.0
        plus_dm_vals.append(plus_dm)
        
        if down_move > up_move and down_move > 0:
            minus_dm = down_move
        else:
            minus_dm = 0.0
        minus_dm_vals.append(minus_dm)
        
    smoothed_tr = [None] * n
    smoothed_plus_dm = [None] * n
    smoothed_minus_dm = [None] * n
    
    # First valid value is index 'period'
    sum_tr = sum(tr_vals[1:period+1])
    sum_plus_dm = sum(plus_dm_vals[1:period+1])
    sum_minus_dm = sum(minus_dm_vals[1:period+1])
    
    smoothed_tr[period] = sum_tr
    smoothed_plus_dm[period] = sum_plus_dm
    smoothed_minus_dm[period] = sum_minus_dm
    
    for i in range(period + 1, n):
        smoothed_tr[i] = smoothed_tr[i - 1] - (smoothed_tr[i - 1] / period) + tr_vals[i]
        smoothed_plus_dm[i] = smoothed_plus_dm[i - 1] - (smoothed_plus_dm[i - 1] / period) + plus_dm_vals[i]
        smoothed_minus_dm[i] = smoothed_minus_dm[i - 1] - (smoothed_minus_dm[i - 1] / period) + minus_dm_vals[i]
        
    plus_di = [None] * n
    minus_di = [None] * n
    dx_vals = [None] * n
    
    for i in range(period, n):
        tr_val = smoothed_tr[i]
        if tr_val == 0:
            plus_di[i] = 0.0
            minus_di[i] = 0.0
        else:
            plus_di[i] = 100.0 * (smoothed_plus_dm[i] / tr_val)
            minus_di[i] = 100.0 * (smoothed_minus_dm[i] / tr_val)
            
        sum_di = plus_di[i] + minus_di[i]
        if sum_di == 0:
            dx_vals[i] = 0.0
        else:
            dx_vals[i] = 100.0 * abs(plus_di[i] - minus_di[i]) / sum_di
            
    adx = [None] * n
    start_adx_idx = 2 * period - 1
    if n >= start_adx_idx + 1:
        sum_dx = sum(dx_vals[period:start_adx_idx+1])
        adx[start_adx_idx] = sum_dx / period
        
        for i in range(start_adx_idx + 1, n):
            adx[i] = (adx[i - 1] * (period - 1) + dx_vals[i]) / period
            
    return adx, plus_di, minus_di


def calculate_pj_dynamic_levels(candles, order_type, tp_target, atr_mult=1.5, use_dyn_atr=True):
    """
    Calculates dynamic SL and TP levels based on PJ Indicator logic.
    Ref: PJ_Indicator.pine
    """
    if len(candles) < 55:
        return None, None
        
    atr_vals = calculate_atr(candles, 14)
    # Calculate 50-period SMA of atr_vals safely
    atr_sma_vals = []
    for i in range(len(atr_vals)):
        sub = atr_vals[max(0, i - 49) : i + 1]
        valid_sub = [x for x in sub if x is not None]
        if len(valid_sub) < 50:
            atr_sma_vals.append(None)
        else:
            atr_sma_vals.append(sum(valid_sub) / 50)
            
    # Reference values are at index -2 (last completed candle)
    atr14_prev = atr_vals[-2]
    atr_sma_prev = atr_sma_vals[-2]
    
    if atr14_prev is None or atr_sma_prev is None or atr_sma_prev == 0:
        return None, None
        
    atr_ratio = atr14_prev / atr_sma_prev
    
    # Pine Script: dynamicMult = useDynATR ? (atrRatio > 1.5 ? atrMult * 0.8 : atrRatio < 0.7 ? atrMult * 1.2 : atrMult) : atrMult
    if use_dyn_atr:
        if atr_ratio > 1.5:
            dynamic_mult = atr_mult * 0.8
        elif atr_ratio < 0.7:
            dynamic_mult = atr_mult * 1.2
        else:
            dynamic_mult = atr_mult
    else:
        dynamic_mult = atr_mult
        
    risk = atr14_prev * dynamic_mult
    
    # Map tp_target string to RR multiplier
    # Default multipliers: TP1=1.0, TP1.5=1.5, TP2=2.0, TP2.5=2.5, TP3=3.0
    rr_multipliers = {
        "tp1": 1.0,
        "tp1.5": 1.5,
        "tp1_5": 1.5,
        "tp2": 2.0,
        "tp2.5": 2.5,
        "tp2_5": 2.5,
        "tp3": 3.0
    }
    
    tp_mult = rr_multipliers.get(tp_target.lower(), 1.0)
    
    # Calculate SL and TP distances
    return risk, risk * tp_mult


def get_mtf_timeframe_and_seconds(timeframe_str: str) -> tuple:
    """
    Returns the dynamic MTF timeframe and its duration in seconds matching the current chart timeframe.
    M1, M5 -> M15 (900s)
    M15 -> H1 (3600s)
    M30, H1 -> H4 (14400s)
    Others (H4, D1) -> D1 (86400s)
    """
    spacing_map = {"M1": 60, "M5": 300, "M15": 900, "M30": 1800, "H1": 3600, "H4": 14400, "D1": 86400}
    tf_secs = spacing_map.get(timeframe_str, 3600)
    if tf_secs <= 300:
        return "M15", 900
    elif tf_secs <= 900:
        return "H1", 3600
    elif tf_secs <= 3600:
        return "H4", 14400
    else:
        return "D1", 86400


def calculate_pj_indicator_v2_trend_and_score(
    candles,
    mtf_candles,
    mtf_timeframe,
    min_score=6,
    use_volume=False,
    vol_multiplier=2.0,
    vwap_anchor="Session",
    pj_atr_mult=1.5,
    pj_use_dyn_atr=True,
    cooldown_bars=5,
    min_bars_between=5,
    use_strict_mtf=False,
    use_atr_block=True,
    min_cross_count=1,
    allowed_sessions="all"
):
    """
    Calculates the PJ Indicator V2 strategy.
    Evaluates confluence score, volatility ATR block, cooldowns, min bar gaps, and strict MTF.
    """
    from datetime import datetime, timezone, timedelta
    n = len(candles)
    if n < 55:
        return [{
            "trigger_buy": False,
            "trigger_sell": False,
            "bull_score": 0,
            "bear_score": 0,
            "trend_text": "SIDEWAY",
            "trend_col": "#D4AF37",
            "in_cooldown": False,
            "can_trade": True,
            "is_volatile": True,
            "mtf_confirm": False,
            "mtf_trend_text": "SIDEWAY",
            "bars_since_sl_hit": 999,
            "bars_since_last_signal": 999
        }] * n

    # Helper function for session check
    def is_ts_in_sessions(ts, sessions_str):
        if not sessions_str or sessions_str.lower() == "all":
            return True
        dt = datetime.fromtimestamp(ts, tz=timezone(timedelta(hours=7)))
        hm = dt.hour + dt.minute / 60.0
        sessions_list = [s.strip().lower() for s in sessions_str.split(",") if s.strip()]
        for s in sessions_list:
            if s == "asian" and (7.0 <= hm < 15.0):
                return True
            elif s in ["london", "lon"] and (14.0 <= hm <= 22.5):
                return True
            elif s in ["newyork", "ny"] and (20.5 <= hm or hm < 3.0):
                return True
            elif s == "london_ny" and (20.0 <= hm < 23.0):
                return True
            elif s == "both" and ((20.5 <= hm or hm < 3.0) or (14.0 <= hm <= 22.5)):
                return True
        return False

    # 1. Main chart indicators
    closes = [c["close"] for c in candles]
    ema20 = calculate_ema(closes, 20)
    atr14 = calculate_atr(candles, 14)
    rsi14 = calculate_rsi(closes, 14)
    macd_line, macd_sig = calculate_macd(closes, 15, 35, 9)
    stoch_k, stoch_d = calculate_stochastic(candles, 9, 3, 3)
    bb_basis, bb_upper, bb_lower = calculate_bollinger_bands(closes, 14, 2.0)
    vwap_vals = calculate_vwap(candles, anchor=vwap_anchor)

    vol_prices = [c.get("volume", 1.0) for c in candles]
    vol_avg = calculate_sma(vol_prices, 20)
    high_vol = []
    for i in range(n):
        vol = candles[i].get("volume", 1.0)
        avg = vol_avg[i]
        high_vol.append(vol > avg * vol_multiplier if avg is not None else False)

    atr_sma = []
    for i in range(len(atr14)):
        sub = atr14[max(0, i - 49) : i + 1]
        valid_sub = [x for x in sub if x is not None]
        if len(valid_sub) < 50:
            atr_sma.append(None)
        else:
            atr_sma.append(sum(valid_sub) / 50)

    # 2. MTF indicators
    mtf_closes = [c["close"] for c in mtf_candles]
    mtf_ema20 = calculate_ema(mtf_closes, 20)
    mtf_ema50 = calculate_ema(mtf_closes, 50)
    mtf_rsi14 = calculate_rsi(mtf_closes, 14)
    mtf_macd_line, mtf_macd_sig = calculate_macd(mtf_closes, 15, 35, 9)
    mtf_vwap = calculate_vwap(mtf_candles, anchor="Session")

    spacing_map = {"M1": 60, "M5": 300, "M15": 900, "M30": 1800, "H1": 3600, "H4": 14400, "D1": 86400}
    mtf_seconds = spacing_map.get(mtf_timeframe, 3600)

    aligned_j = []
    j = 0
    for i in range(n):
        t_i = candles[i]["time"]
        while j < len(mtf_candles) and mtf_candles[j]["time"] + mtf_seconds <= t_i:
            j += 1
        aligned_j.append(j - 1 if j > 0 else None)

    # State machine variables
    barsSinceSlHit = 999
    barsSinceLastSignal = 999
    lastSignalState = 0
    entryP = None
    slP = None
    slHit = False

    results = []

    for i in range(n):
        barsSinceLastSignal += 1
        barsSinceSlHit += 1

        inCooldown = barsSinceSlHit < cooldown_bars
        canTrade = barsSinceLastSignal >= min_bars_between

        if (ema20[i] is None or atr14[i] is None or rsi14[i] is None or 
            macd_line[i] is None or macd_sig[i] is None or 
            stoch_k[i] is None or stoch_d[i] is None or 
            bb_basis[i] is None or vwap_vals[i] is None or 
            atr_sma[i] is None or atr_sma[i] == 0):
            results.append({
                "trigger_buy": False, "trigger_sell": False,
                "bull_score": 0, "bear_score": 0,
                "trend_bull": False, "trend_bear": False,
                "trend_text": "SIDEWAY", "trend_col": "#D4AF37",
                "in_cooldown": inCooldown, "can_trade": canTrade, "is_volatile": True,
                "mtf_confirm": False, "mtf_trend_text": "SIDEWAY",
                "bars_since_sl_hit": barsSinceSlHit, "bars_since_last_signal": barsSinceLastSignal
            })
            continue

        close_i = closes[i]
        atr14_i = atr14[i]
        atr_ratio = atr14_i / atr_sma[i]
        is_volatile = not use_atr_block or atr_ratio >= 0.75

        # Confluence Score Main Chart
        ema_bull = close_i > ema20[i]
        vwap_bull = close_i > vwap_vals[i]
        macd_bull = macd_line[i] > macd_sig[i]
        rsi_bull = rsi14[i] > 55
        stoch_bull = stoch_k[i] > stoch_d[i] and stoch_k[i] > 50
        bb_bull = close_i > bb_basis[i]

        bull_score = (2 if ema_bull else 0) + (2 if vwap_bull else 0) + (2 if macd_bull else 0) + (2 if rsi_bull else 0) + (1 if stoch_bull else 0) + (1 if bb_bull else 0)

        ema_bear = close_i < ema20[i]
        vwap_bear = close_i < vwap_vals[i]
        macd_bear = macd_line[i] < macd_sig[i]
        rsi_bear = rsi14[i] < 45
        stoch_bear = stoch_k[i] < stoch_d[i] and stoch_k[i] < 50
        bb_bear = close_i < bb_basis[i]

        bear_score = (2 if ema_bear else 0) + (2 if vwap_bear else 0) + (2 if macd_bear else 0) + (2 if rsi_bear else 0) + (1 if stoch_bear else 0) + (1 if bb_bear else 0)

        trend_bull = bull_score >= min_score and bull_score > bear_score
        trend_bear = bear_score >= min_score and bear_score > bull_score

        trend_text = "UPTREND" if trend_bull else "DOWNTREND" if trend_bear else "SIDEWAY"
        trend_col = "#00C853" if trend_bull else "#FF1744" if trend_bear else "#D4AF37"

        # MTF Alignment
        mtf_confirm = False
        mtf_trend_text = "SIDEWAY"
        j_aligned = aligned_j[i]

        if j_aligned is not None:
            h1_close = mtf_closes[j_aligned]
            h1_ema20 = mtf_ema20[j_aligned]
            h1_rsi14 = mtf_rsi14[j_aligned]
            h1_vwap = mtf_vwap[j_aligned]
            h1_macd_line = mtf_macd_line[j_aligned]
            h1_macd_sig = mtf_macd_sig[j_aligned]
            h1_ema50 = mtf_ema50[j_aligned]
            
            h1_ema20_prev = mtf_ema20[j_aligned - 3] if j_aligned >= 3 else None

            if (h1_ema20 is not None and h1_rsi14 is not None and h1_vwap is not None and 
                h1_macd_line is not None and h1_macd_sig is not None and h1_ema50 is not None):
                
                h1_macdBull = h1_macd_line > h1_macd_sig
                h1_emaBull = h1_close > h1_ema20
                h1_rsiBull = h1_rsi14 > 55
                h1_rsiBear = h1_rsi14 < 45
                h1_vwapBull = h1_close > h1_vwap

                h1_bullCount = int(h1_emaBull) + int(h1_rsiBull) + int(h1_macdBull) + int(h1_vwapBull)
                h1_bearCount = int(not h1_emaBull) + int(h1_rsiBear) + int(not h1_macdBull) + int(not h1_vwapBull)

                h1_trendBull = h1_bullCount >= 3
                h1_trendBear = h1_bearCount >= 3
                mtf_trend_text = "UPTREND" if h1_trendBull else "DOWNTREND" if h1_trendBear else "SIDEWAY"

                # Strict MTF
                if use_strict_mtf and h1_ema20_prev is not None:
                    h1_emaSlope = h1_ema20 - h1_ema20_prev
                    h1_slopeBull = h1_emaSlope > 0
                    h1_slopeBear = h1_emaSlope < 0
                    h1_aboveEma50 = h1_ema20 > h1_ema50
                    h1_belowEma50 = h1_ema20 < h1_ema50

                    h1_trendBullFinal = h1_trendBull and h1_aboveEma50 and h1_slopeBull
                    h1_trendBearFinal = h1_trendBear and h1_belowEma50 and h1_slopeBear
                else:
                    h1_trendBullFinal = h1_trendBull
                    h1_trendBearFinal = h1_trendBear

                mtf_confirm = (trend_bull and h1_trendBullFinal) or (trend_bear and h1_trendBearFinal)

        # Monitor current trade SL hit (chronological hit detection)
        if lastSignalState == 1 and entryP is not None and slP is not None:
            if candles[i]["low"] <= slP:
                slHit = True
                lastSignalState = 0
                barsSinceSlHit = 0
        elif lastSignalState == -1 and entryP is not None and slP is not None:
            if candles[i]["high"] >= slP:
                slHit = True
                lastSignalState = 0
                barsSinceSlHit = 0

        # Crossover logic at index i - 1
        trigger_buy = False
        trigger_sell = False

        if i >= 2:
            c_prev = closes[i-1]
            c_prev2 = closes[i-2]
            
            e_prev = ema20[i-1]
            e_prev2 = ema20[i-2]
            
            ml_prev = macd_line[i-1]
            ml_prev2 = macd_line[i-2]
            ms_prev = macd_sig[i-1]
            ms_prev2 = macd_sig[i-2]
            
            sk_prev = stoch_k[i-1]
            sk_prev2 = stoch_k[i-2]
            sd_prev = stoch_d[i-1]
            sd_prev2 = stoch_d[i-2]

            if (e_prev is not None and e_prev2 is not None and ml_prev is not None and 
                ml_prev2 is not None and ms_prev is not None and ms_prev2 is not None and 
                sk_prev is not None and sk_prev2 is not None and sd_prev is not None and sd_prev2 is not None):

                emaCrossUp = (c_prev2 <= e_prev2 and c_prev > e_prev)
                macdCrossUp = (ml_prev2 <= ms_prev2 and ml_prev > ms_prev)
                stochCrossUp = (sk_prev2 <= sd_prev2 and sk_prev > sd_prev)

                emaCrossDown = (c_prev2 >= e_prev2 and c_prev < e_prev)
                macdCrossDown = (ml_prev2 >= ms_prev2 and ml_prev < ms_prev)
                stochCrossDown = (sk_prev2 >= sd_prev2 and sk_prev < sd_prev)

                crossBullCount = int(emaCrossUp) + int(macdCrossUp) + int(stochCrossUp)
                crossBearCount = int(emaCrossDown) + int(macdCrossDown) + int(stochCrossDown)

                trend_bull_prev = results[i-1]["trend_bull"]
                trend_bear_prev = results[i-1]["trend_bear"]
                high_vol_prev = high_vol[i-1]

                buySignalRaw = trend_bull_prev and crossBullCount >= min_cross_count
                sellSignalRaw = trend_bear_prev and crossBearCount >= min_cross_count

                buySignal = buySignalRaw and high_vol_prev if use_volume else buySignalRaw
                sellSignal = sellSignalRaw and high_vol_prev if use_volume else sellSignalRaw

                in_session = is_ts_in_sessions(candles[i]["time"], allowed_sessions)

                trigger_buy = buySignal and mtf_confirm and lastSignalState != 1 and in_session and is_volatile and not inCooldown and canTrade
                trigger_sell = sellSignal and mtf_confirm and lastSignalState != -1 and in_session and is_volatile and not inCooldown and canTrade

                if trigger_buy or trigger_sell:
                    barsSinceLastSignal = 0
                    lastSignalState = 1 if trigger_buy else -1
                    entryP = closes[i-1]
                    
                    dynamic_mult = pj_atr_mult
                    if pj_use_dyn_atr:
                        if atr_ratio > 1.5:
                            dynamic_mult = pj_atr_mult * 0.8
                        elif atr_ratio < 0.7:
                            dynamic_mult = pj_atr_mult * 1.2
                    
                    risk = atr14[i-1] * dynamic_mult
                    slP = entryP - risk if trigger_buy else entryP + risk
                    slHit = False

        results.append({
            "trigger_buy": trigger_buy,
            "trigger_sell": trigger_sell,
            "bull_score": bull_score,
            "bear_score": bear_score,
            "trend_bull": trend_bull,
            "trend_bear": trend_bear,
            "trend_text": trend_text,
            "trend_col": trend_col,
            "in_cooldown": inCooldown,
            "can_trade": canTrade,
            "is_volatile": is_volatile,
            "mtf_confirm": mtf_confirm,
            "mtf_trend_text": mtf_trend_text,
            "bars_since_sl_hit": barsSinceSlHit,
            "bars_since_last_signal": barsSinceLastSignal
        })

    return results



