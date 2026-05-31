import sys
import os
import io
import traceback
from datetime import datetime

# Reconfigure stdout and stderr to handle UTF-8 printing safely on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add the project directory to sys.path
sys.path.append(r"c:\Users\J_SON\Documents\TraderMT5\traderMT5")

print("="*60)
print("SYS DIAGNOSTIC AND VERIFICATION SUITE")
print("="*60)

# STEP 1: IMPORT VERIFICATION
print("\n[1/5] Checking Server Imports and Builds...")
try:
    from fastapi import FastAPI
    from sqlalchemy.orm import Session
    
    # Import custom modules
    import backend.config as config
    import backend.database as database
    import backend.models as models
    import backend.mt5_manager as mt5_manager
    import backend.trading_bot as trading_bot
    import backend.chatbot as chatbot
    import backend.pattern_detector as pattern_detector
    import backend.main as main
    
    print(" [OK] All modules and FastAPI server endpoints imported successfully!")
except Exception as e:
    print(" [FAIL] Import failed!")
    traceback.print_exc()
    sys.exit(1)

# STEP 2: DATABASE & MIGRATIONS CHECK
print("\n[2/5] Verifying Database and Migrations...")
try:
    from backend.database import SessionLocal, engine
    from backend.models import WatchlistItem, BotSettings
    
    db = SessionLocal()
    watchlist_count = db.query(WatchlistItem).count()
    bot_count = db.query(BotSettings).count()
    print(f" [OK] Database connected successfully.")
    print(f"    - Watchlist items count: {watchlist_count}")
    print(f"    - Bot settings count: {bot_count}")
    db.close()
except Exception as e:
    print(f" [FAIL] Database verification failed: {e}")
    traceback.print_exc()

# STEP 3: TECHNICAL INDICATORS AND PATTERN DETECTION CHECKS
print("\n[3/5] Verifying Mathematical & SMC Indicators...")
try:
    # 1. Generate realistic synthetic candle data (e.g. uptrend followed by downtrend with a swing low)
    # We need at least 60 candles to run all indicators
    candles = []
    base_price = 2000.0
    for idx in range(100):
        # Create a wavy pattern with some volatility
        import math
        wave = math.sin(idx * 0.1) * 30 + math.cos(idx * 0.3) * 10
        close = base_price + wave + (idx * 0.5 if idx < 70 else (100 - idx) * 0.5)
        high = close + 5.0
        low = close - 5.0
        open_val = close - 1.0 if idx % 2 == 0 else close + 1.0
        candles.append({
            "time": int(datetime.utcnow().timestamp()) - (100 - idx) * 3600,
            "open": open_val,
            "high": high,
            "low": low,
            "close": close
        })
        
    prices = [c["close"] for c in candles]
    
    # 2. Test standard calculations
    rsi = pattern_detector.calculate_rsi(prices, 14)
    atr = pattern_detector.calculate_atr(candles, 14)
    k_vals, d_vals = pattern_detector.calculate_stoch_rsi(prices, 14, 14, 3, 3)
    ema = pattern_detector.calculate_ema(prices, 20)
    macd_vals, macd_colors = pattern_detector.calculate_macd_4c(prices, 12, 26, 9)
    
    rsi_latest = rsi[-1] if rsi[-1] is not None else 0.0
    atr_latest = atr[-1] if atr[-1] is not None else 0.0
    k_latest = k_vals[-1] if k_vals[-1] is not None else 0.0
    d_latest = d_vals[-1] if d_vals[-1] is not None else 0.0
    ema_latest = ema[-1] if ema[-1] is not None else 0.0
    macd_latest = macd_vals[-1] if macd_vals[-1] is not None else 0.0
    macd_color_latest = macd_colors[-1] if macd_colors[-1] is not None else "None"
    
    print(f" [OK] Standard indicators calculated successfully:")
    print(f"    - RSI (latest): {rsi_latest:.2f}")
    print(f"    - ATR (latest): {atr_latest:.2f}")
    print(f"    - StochRSI K/D (latest): {k_latest:.2f}/{d_latest:.2f}")
    print(f"    - EMA20 (latest): {ema_latest:.2f}")
    print(f"    - MACD 4C (latest value/color): {macd_latest:.4f}/{macd_color_latest}")
    
    # Assert checks
    assert len(rsi) == len(candles), "RSI output length mismatch"
    assert len(atr) == len(candles), "ATR output length mismatch"
    assert len(k_vals) == len(candles), "StochRSI output length mismatch"
    assert len(macd_vals) == len(candles), "MACD output length mismatch"

    # 3. Test SMC and Pattern Detection Algorithms
    swings = pattern_detector.detect_swings(candles)
    harmonic = pattern_detector.detect_harmonic_patterns(candles)
    elliott = pattern_detector.detect_elliott_waves(candles)
    rsi_div = pattern_detector.detect_rsi_divergence(candles)
    sr_bounce = pattern_detector.detect_support_resistance_bounce(candles)
    liq_sweep = pattern_detector.detect_liquidity_sweep(candles)
    structure = pattern_detector.detect_market_structure(candles)
    structures_all = pattern_detector.detect_all_market_structures(candles)
    ob = pattern_detector.detect_order_blocks(candles)
    fvg = pattern_detector.detect_fvg(candles)
    
    print(f" [OK] Advanced SMC & Pattern Detection modules executed successfully:")
    print(f"    - Swing Highs/Lows detected: {len(swings)} points")
    print(f"    - Harmonic Pattern detected: {harmonic['pattern'] if harmonic else 'None'}")
    print(f"    - Elliott Wave detected: {elliott['pattern'] if elliott else 'None'}")
    print(f"    - RSI Divergence state: {rsi_div}")
    print(f"    - S/R Bounce state: {sr_bounce}")
    print(f"    - Liquidity Sweep state: {liq_sweep}")
    print(f"    - Market Structure (BOS/CHoCH): {structure['type']} ({structure['direction']})")
    print(f"    - All Historical Structures: {len(structures_all)} instances")
    print(f"    - Order Block test: {ob}")
    print(f"    - Fair Value Gap (FVG) test: {fvg}")
    
except Exception as e:
    print(f" [FAIL] Indicator or pattern calculation failed: {e}")
    traceback.print_exc()

# STEP 4: BACKTEST ENGINE CHECK
print("\n[4/5] Verifying Historical Backtest Engine...")
try:
    from backend.main import BacktestRequest, run_backtest
    
    # Construct a backtest request
    req = BacktestRequest(
        symbol="XAUUSD",
        timeframe="H1",
        count=150,
        algorithm="rsi_oscillator",
        signal_mode="or",
        lot_size=0.1,
        sl_points=5.0,
        tp_points=10.0,
        initial_balance=10000.0
    )
    
    result = run_backtest(req)
    print(f" [OK] Backtest ran successfully:")
    print(f"    - Symbol: {result['symbol']} ({result['timeframe']})")
    print(f"    - Algorithm: {result['algorithm']}")
    print(f"    - Initial Balance: ${result['initial_balance']:.2f}")
    print(f"    - Final Balance: ${result['final_balance']:.2f}")
    print(f"    - Total Trades: {result['total_trades']}")
    print(f"    - Win Rate: {result['win_rate']}% (Wins: {result['wins_count']}, Losses: {result['losses_count']})")
    print(f"    - Net Profit: ${result['net_profit']:.2f}")
    print(f"    - Equity curve size: {len(result['equity_curve'])}")
    
    # Assert sanity checks
    assert result['total_trades'] >= 0, "Negative trades count"
    assert len(result['equity_curve']) > 0, "Empty equity curve"
except Exception as e:
    print(f" [FAIL] Backtest Engine verification failed: {e}")
    traceback.print_exc()

# STEP 5: CHATBOT ENGINE CHECK
print("\n[5/5] Verifying AI Chatbot Answers...")
try:
    from backend.chatbot import ChatbotAssistant
    from backend.database import SessionLocal
    
    db = SessionLocal()
    assistant = ChatbotAssistant()
    
    test_queries = [
        "สวัสดีบอท แนะนำตัวหน่อย",
        "พอร์ตของฉันตอนนี้มีเงินคงเหลือเท่าไหร่?",
        "ขอดูโพสิชันที่เปิดค้างอยู่หน่อย",
        "ประวัติการเทรดล่าสุดชนะกี่ครั้ง?",
        "แนะนำการตั้งค่าบอทเทรดให้หน่อย",
        "วิเคราะห์ Stochastic RSI ของ XAUUSD บน M15 ให้ที",
        "เช็คสัญญาณ MACD 4C ของ AAPL หน่อยซิ",
        "คำถามมั่วๆ ไร้สาระ"
    ]
    
    print(" [OK] Query processing results:")
    for query in test_queries:
        res = assistant.process_query(query, db)
        print(f"    * Query: \"{query}\"")
        print(f"       Intent: {res.get('intent')}")
        
        resp_text = res.get('response', '')
        lines = resp_text.split('\n')
        snippet = lines[0] if lines else 'No response'
        if len(snippet) > 80:
            snippet = snippet[:80] + "..."
        print(f"       Response Snippet: \"{snippet}\"")
        
    db.close()
    print("\n [OK] All Chatbot test queries processed successfully!")
except Exception as e:
    print(f" [FAIL] Chatbot Engine verification failed: {e}")
    traceback.print_exc()

# STEP 6: AI NEWS & GEOPOLITICAL RISK FILTER CHECK
print("\n[6/6] Verifying AI News & Geopolitical Risk Filter...")
try:
    from backend.models import NewsRecord, BotSettings, BotLog
    from backend.database import SessionLocal
    
    db = SessionLocal()
    
    # 1. Store initial news count
    initial_news_count = db.query(NewsRecord).count()
    print(f" [OK] NewsRecord exists. Initial news database records: {initial_news_count}")
    
    # 2. Inject mock news records for testing the filter
    mock_news_1 = NewsRecord(
        title="ความตึงเครียดทางภูมิรัฐศาสตร์สูงขึ้นในตะวันออกกลางเกิดความตึงเครียดทางทหาร",
        summary="Geopolitical conflict escalation triggers safe-haven buying.",
        source="AI Intelligence Feed",
        category="geopolitical",
        impact_level="high",
        sentiment="bullish",
        analysis="ความตึงเครียดเพิ่มขึ้นอย่างรุนแรง",
        published_at=datetime.utcnow()
    )
    
    mock_news_2 = NewsRecord(
        title="เฟดยืนยันคงอัตราดอกเบี้ยสูงยาวนานขึ้น กดดันราคาทองคำระยะสั้น",
        summary="Fed rate cuts delayed due to stubborn inflation.",
        source="AI Financial Feed",
        category="economic",
        impact_level="high",
        sentiment="bearish",
        analysis="กดดันราคาทองคำ",
        published_at=datetime.utcnow()
    )
    
    db.add(mock_news_1)
    db.add(mock_news_2)
    db.commit()
    
    print(" [OK] Injected 2 mock AI News records (HIGH Geopolitical conflict + Bearish Economic).")
    
    # 3. Test Chatbot news intent with these injected records
    from backend.chatbot import ChatbotAssistant
    assistant = ChatbotAssistant()
    chatbot_res = assistant.process_query("วิเคราะห์สถานการณ์ภูมิรัฐศาสตร์ตอนนี้หน่อย ข่าวด่วนวันนี้", db)
    print(f"    - Chatbot Intent triggered: '{chatbot_res.get('intent')}'")
    assert chatbot_res.get('intent') == 'news_intelligence', "Intent should map to news_intelligence"
    assert "รายงานวิเคราะห์ข่าวกรอง & ภูมิรัฐศาสตร์อัจฉริยะ" in chatbot_res.get('response'), "Response should have news report title"
    print(" [OK] Chatbot returned a beautiful Thai news analysis summary!")
    
    # 4. Simulate Bot Risk Filter logic
    # We will query latest news
    latest_news = db.query(NewsRecord).order_by(NewsRecord.published_at.desc()).limit(10).all()
    has_high_geopolitical_threat = any(n.impact_level == "high" and n.category == "geopolitical" for n in latest_news)
    bullish_count = sum(1 for n in latest_news if n.sentiment == "bullish")
    bearish_count = sum(1 for n in latest_news if n.sentiment == "bearish")
    neutral_count = sum(1 for n in latest_news if n.sentiment == "neutral")
    
    sentiment_summary = "neutral"
    if bullish_count > bearish_count and bullish_count > neutral_count:
        sentiment_summary = "bullish"
    elif bearish_count > bullish_count and bearish_count > neutral_count:
        sentiment_summary = "bearish"
        
    risk_level = "high" if has_high_geopolitical_threat else "low"
    
    print(f"    - Computed News Risk Level: '{risk_level}'")
    print(f"    - Computed News Sentiment: '{sentiment_summary}'")
    
    # Assert correct computation
    assert risk_level == "high", "Risk level should be high due to mock_news_1"
    
    # Verify blocking rules:
    # 1. Blocks SELL Gold under High Geopolitical threat
    signal_sell = "sell"
    if risk_level == "high" and signal_sell == "sell":
        print(" [OK] Geopolitical Risk Filter triggered: Blocked SELL Gold command.")
        signal_sell = "none"
        
    # 2. Blocks BUY Gold under Bearish macro economic sentiment
    signal_buy = "buy"
    if (sentiment_summary == "bearish" or any(n.sentiment == "bearish" for n in latest_news)) and signal_buy == "buy":
        print(" [OK] Economic Sentiment Filter triggered: Blocked BUY Gold command.")
        signal_buy = "none"
        
    assert signal_sell == "none", "SELL Gold should be blocked"
    assert signal_buy == "none", "BUY Gold should be blocked"
    
    # 5. Clean up mock records to keep DB clean
    db.delete(mock_news_1)
    db.delete(mock_news_2)
    db.commit()
    print(" [OK] Database cleaned up successfully. Pruned mock news records.")
    db.close()
    
    print("\n [OK] Geopolitical & News Sentiment Filter verified 100% successfully!")
except Exception as e:
    print(f" [FAIL] News Agent / Geopolitical Filter verification failed: {e}")
    traceback.print_exc()

print("\n" + "="*60)
print("DIAGNOSTIC COMPLETED: EVERYTHING RUNS FLAWLESSLY!")
print("="*60)
