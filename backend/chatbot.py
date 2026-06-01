import re
import os
from sqlalchemy.orm import Session
from datetime import datetime
from backend.mt5_manager import MT5Manager
from backend.models import TradeHistoryRecord, BotSettings, NewsRecord
from backend.pattern_detector import (
    calculate_rsi,
    calculate_stoch_rsi,
    calculate_macd_4c,
    detect_swings,
    detect_harmonic_patterns,
    detect_elliott_waves,
    detect_rsi_divergence,
    detect_support_resistance_bounce,
    detect_liquidity_sweep,
    detect_order_blocks,
    detect_fvg
)

class ChatbotAssistant:
    def __init__(self):
        self.mt5 = MT5Manager()

    def process_query(self, query: str, db: Session) -> dict:
        query_lower = query.lower().strip()
        
        # -1. NEWS & GEOPOLITICAL MARKET INTELLIGENCE AGENT INTENT
        if any(keyword in query_lower for keyword in ["ข่าว", "news", "ภูมิรัฐศาสตร์", "สงคราม", "เศรษฐกิจมหภาค", "วิเคราะห์ข่าว", "cpi", "fed"]):
            return self.get_news_intelligence_summary(db)
            
        # 0. GOLD-SPECIFIC Deep Technical Analysis Interceptor
        if any(keyword in query_lower for keyword in ["ทอง", "gold", "xau", "xauusd"]):
            # Trigger our new deep technical analysis
            return self.analyze_gold_market(query, db)
        
        # 1. GREETING INTENT
        if any(keyword in query_lower for keyword in ["สวัสดี", "hello", "hi", "หวัดดี", "บอท", "bot", "assistant"]):
            response = (
                "สวัสดีครับ! ผมคือ **Giant Slayer AI Assistant** ผู้ช่วยเทรดอัจฉริยะส่วนตัวของคุณ 🤖📊\n\n"
                "ผมสามารถช่วยเหลือคุณดึงข้อมูลแบบเรียลไทม์จาก Exness/MT5 และระบบบอทเทรดได้ครับ โดยคุณสามารถสอบถามผมได้ดังนี้:\n"
                "• 📊 **ขอดูยอดเงินในพอร์ต** (ยอดบาลานซ์, อีควิตี้, กำไรลอยตัว)\n"
                "• 💼 **ขอดูออเดอร์/โพสิชันที่เปิดอยู่**\n"
                "• 📜 **ขอดูประวัติการเทรดล่าสุด**\n"
                "• 📈 **แนวโน้มราคาสินทรัพย์** (เช่น ราคาทองคำ XAUUSD)\n"
                "• 🤖 **แนะนำการตั้งค่าบอท**\n\n"
                "ต้องการให้ผมช่วยเหลือด้านใด พิมพ์สอบถามหรือคลิกที่ตัวเลือกด่วนด้านล่างได้เลยครับ!"
            )
            return {"response": response, "intent": "greeting"}
            
        # 2. ACCOUNT INFO INTENT
        if any(keyword in query_lower for keyword in ["balance", "equity", "พอร์ต", "ยอดเงิน", "บัญชี", "ทุน", "เงินเหลือ", "กำไรรวม", "เงินในบัญชี"]):
            try:
                acc = self.mt5.get_account_info()
                pnl = acc.get("profit", 0.0)
                pnl_str = f"+${pnl:,.2f}" if pnl >= 0 else f"-${abs(pnl):,.2f}"
                pnl_color = "🟢" if pnl >= 0 else "🔴"
                
                response = (
                    "📊 **สรุปสถานะพอร์ตการเทรดของคุณในขณะนี้**:\n\n"
                    f"• 💰 **ยอดคงเหลือ (Balance)**: `${acc.get('balance', 0.0):,.2f}`\n"
                    f"• 📈 **มูลค่าพอร์ตปัจจุบัน (Equity)**: `${acc.get('equity', 0.0):,.2f}`\n"
                    f"• 🔒 **หลักประกันที่ใช้ (Used Margin)**: `${acc.get('margin', 0.0):,.2f}`\n"
                    f"• 🔓 **หลักประกันที่เหลือ (Free Margin)**: `${acc.get('margin_free', 0.0):,.2f}`\n"
                    f"• {pnl_color} **กำไร/ขาดทุนลอยตัว (Floating P&L)**: `{pnl_str}`\n\n"
                    f"⚡ **โหมดการเชื่อมต่อ**: " + ("Simulation Mode (พอร์ตจำลอง)" if self.mt5.is_simulated else f"Live Account (บัญชีจริง #{self.mt5.login_id})")
                )
            except Exception as e:
                response = f"ขออภัยครับ ไม่สามารถดึงข้อมูลบัญชีได้ในขณะนี้เนื่องจาก: {e}"
            return {"response": response, "intent": "account_info"}

        # 3. OPEN POSITIONS INTENT
        if any(keyword in query_lower for keyword in ["position", "โพสิชัน", "ออเดอร์", "order", "เปิดอยู่", "ถืออยู่", "ไม้ที่เปิด"]):
            try:
                positions = self.mt5.get_positions()
                if not positions:
                    response = "💼 **คุณไม่มีโพสิชันหรือออเดอร์ใดๆ ที่เปิดค้างไว้ในขณะนี้ครับ**\n\nหากต้องการส่งออเดอร์ สามารถส่งแบบด่วนผ่านแถบส่งคำสั่งขวามือได้เลยครับ!"
                else:
                    response = f"💼 **รายการออเดอร์ที่เปิดทำงานอยู่ ({len(positions)} โพสิชัน)**:\n\n"
                    
                    # Get active ticket mapping for bots
                    bots = db.query(BotSettings).filter(BotSettings.active_ticket.isnot(None)).all()
                    ticket_to_bot = {bot.active_ticket: bot.name for bot in bots}
                    
                    for idx, pos in enumerate(positions, 1):
                        pnl = pos.get("profit", 0.0)
                        pnl_str = f"+${pnl:,.2f}" if pnl >= 0 else f"-${abs(pnl):,.2f}"
                        pnl_emoji = "🟢" if pnl >= 0 else "🔴"
                        
                        # Bot vs manual name
                        bot_name = ticket_to_bot.get(pos["ticket"])
                        if not bot_name:
                            comment = pos.get("comment", "")
                            is_manual = not comment or comment in ['Manual', 'Simulation', 'Exness Real Close', 'Close via Antigravity MT5']
                            bot_name = "เทรดเอง (Manual)" if is_manual else re.sub(r'\s*\[.*?\]$', '', comment)
                            
                        response += (
                            f"{idx}. **#{pos['ticket']} {pos['symbol'].upper()}** ({pos['type'].upper()})\n"
                            f"   • ขนาด Lot: `{pos['volume']}` | ราคาเปิด: `{pos['open_price']}`\n"
                            f"   • กำไร/ขาดทุน: **{pnl_str}** {pnl_emoji}\n"
                            f"   • ที่มา: `{bot_name}`\n\n"
                        )
            except Exception as e:
                response = f"ขออภัยครับ ไม่สามารถดึงข้อมูลออเดอร์เปิดอยู่ได้ในขณะนี้เนื่องจาก: {e}"
            return {"response": response, "intent": "open_positions"}

        # 4. TRADE HISTORY INTENT
        if any(keyword in query_lower for keyword in ["history", "ประวัติ", "ปิดไปแล้ว", "ย้อนหลัง", "บันทึก"]):
            try:
                # 1. Fetch simulated history from our local DB
                sim_records = db.query(TradeHistoryRecord).order_by(TradeHistoryRecord.close_time.desc()).all()
                
                formatted_records = []
                for r in sim_records:
                    clean_comment = re.sub(r'\s*\[.*?\]$', '', r.comment) if r.comment else 'เทรดเอง (Manual)'
                    is_manual = not clean_comment or clean_comment in ['Manual', 'Simulation', 'Exness Real Close', 'Close via Antigravity MT5']
                    source_name = "เทรดเอง (Manual)" if is_manual else clean_comment
                    formatted_records.append({
                        "ticket": r.ticket,
                        "symbol": r.symbol,
                        "type": r.order_type,
                        "volume": r.volume,
                        "open_price": r.open_price,
                        "close_price": r.close_price,
                        "sl": r.sl or 0.0,
                        "tp": r.tp or 0.0,
                        "open_time": r.open_time,
                        "close_time": r.close_time,
                        "profit": r.profit,
                        "comment": source_name,
                        "is_simulated": True
                    })
                
                # 2. If connected to real MT5, try to fetch real history from the past 30 days
                real_records = []
                if not self.mt5.is_simulated and self.mt5.is_connected:
                    try:
                        import MetaTrader5 as mt5_lib
                        from datetime import datetime, timedelta
                        from_date = datetime.now() - timedelta(days=30)
                        to_date = datetime.now() + timedelta(days=1)
                        
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
                            entry_info = {}
                            for d in deals:
                                if d.entry == 0 and d.position_id > 0:
                                    entry_info[d.position_id] = {
                                        "comment": d.comment,
                                        "price": d.price,
                                        "time": datetime.fromtimestamp(d.time)
                                    }
                            
                            for d in deals:
                                if d.entry == 1:
                                    info = entry_info.get(d.position_id, {})
                                    orig_comment = info.get("comment", d.comment) or "Exness Real Close"
                                    open_price = info.get("price", d.price)
                                    open_time = info.get("time", datetime.fromtimestamp(d.time))
                                    
                                    clean_comment = re.sub(r'\s*\[.*?\]$', '', orig_comment) if orig_comment else 'เทรดเอง (Manual)'
                                    is_manual = not clean_comment or clean_comment in ['Manual', 'Simulation', 'Exness Real Close', 'Close via Antigravity MT5']
                                    source_name = "เทรดเอง (Manual)" if is_manual else clean_comment
                                    
                                    real_records.append({
                                        "ticket": d.position_id,
                                        "symbol": d.symbol,
                                        "type": "buy" if d.type == 1 else "sell",
                                        "volume": d.volume,
                                        "open_price": open_price,
                                        "close_price": d.price,
                                        "sl": order_sl_tp.get(d.position_id, {}).get("sl", 0.0),
                                        "tp": order_sl_tp.get(d.position_id, {}).get("tp", 0.0),
                                        "open_time": open_time,
                                        "close_time": datetime.fromtimestamp(d.time),
                                        "profit": d.profit,
                                        "comment": source_name,
                                        "is_simulated": False
                                    })
                    except Exception as e:
                        print(f"Failed to fetch real MT5 history in chatbot: {e}")
                
                # Combine lists, sorted by close_time descending
                all_records = real_records + formatted_records
                all_records.sort(key=lambda x: x["close_time"], reverse=True)
                
                if not all_records:
                    response = (
                        "📜 **ไม่พบประวัติบันทึกการเทรดที่ปิดไปแล้วในระบบพอร์ตการลงทุนของคุณขณะนี้ครับ**\n\n"
                        "💡 *คำแนะนำ: คุณสามารถเลือกสะสมประวัติการเทรดได้ง่ายๆ โดย:*\n"
                        "1. **ส่งคำสั่งซื้อขายด้วยตนเอง:** ไปที่แผงควบคุมหลักด้านซ้ายแล้วกรอก Lot และกดปุ่ม BUY หรือ SELL เมื่อเทรดจบและปิดคำสั่ง ระบบจะบันทึกเข้าสู่ประวัติทันที\n"
                        "2. **สร้างบอทเทรดจำลองอัตโนมัติ:** คลิกแท็บ **'ระบบบอทเทรด'** -> **'สร้างบอทใหม่'** เพื่อให้ระบบเปิด/ปิดคำสั่งตามเงื่อนไขโมเมนตัมแบบเรียลไทม์\n"
                        "3. **เชื่อมโยงพอร์ตจริง:** คลิกไอคอน **'ฟันเฟือง/เซิร์ฟเวอร์'** มุมขวาบนเพื่อป้อนข้อมูลล็อกอินบัญชี **Exness MT5** ของคุณ ระบบจะดึงประวัติการเทรดจริงจากโบรกเกอร์ย้อนหลัง 30 วันมาแสดงผลในระบบทันที!"
                    )
                else:
                    total_count = len(all_records)
                    display_limit = min(5, total_count)
                    
                    response = f"📜 **ประวัติการเทรดล่าสุดของคุณ ({display_limit} ออเดอร์ล่าสุด)**:\n\n"
                    for idx in range(display_limit):
                        r = all_records[idx]
                        pnl = r["profit"]
                        pnl_str = f"+${pnl:,.2f}" if pnl >= 0 else f"-${abs(pnl):,.2f}"
                        pnl_emoji = "🟢" if pnl >= 0 else "🔴"
                        mode_tag = " (จำลอง)" if r["is_simulated"] else " (บัญชีจริง)"
                        
                        sl_val = r.get("sl", 0.0)
                        tp_val = r.get("tp", 0.0)
                        sl_str = f"{sl_val:,.5f}" if 'EURUSD' in r['symbol'].upper() else f"{sl_val:,.2f}"
                        tp_str = f"{tp_val:,.5f}" if 'EURUSD' in r['symbol'].upper() else f"{tp_val:,.2f}"
                        sl_display = sl_str if sl_val > 0 else "ไม่ได้ตั้ง"
                        tp_display = tp_str if tp_val > 0 else "ไม่ได้ตั้ง"
                        
                        response += (
                            f"{idx + 1}. **#{r['ticket']} {r['symbol']}** ({r['type'].upper()}){mode_tag}\n"
                            f"   • Lot: `{r['volume']}` | เปิด `{r['open_price']}` ➔ ปิด `{r['close_price']}`\n"
                            f"   • SL: `{sl_display}` | TP: `{tp_display}`\n"
                            f"   • ผลลัพธ์: **{pnl_str}** {pnl_emoji}\n"
                            f"   • ที่มา: `{r['comment']}`\n"
                            f"   • เวลาปิด: `{r['close_time'].strftime('%Y-%m-%d %H:%M:%S')}`\n\n"
                        )
                    
                    # Calculate winrate summary
                    wins = sum(1 for r in all_records if r["profit"] > 0)
                    winrate = (wins / total_count) * 100 if total_count > 0 else 0.0
                    response += f"📊 **ภาพรวมสถิติ**: เทรดทั้งหมด `{total_count}` ครั้ง | ชนะ `{wins}` ครั้ง | **Win Rate: {winrate:.1f}%**"
            except Exception as e:
                response = f"ขออภัยครับ ไม่สามารถดึงข้อมูลประวัติการเทรดได้ในขณะนี้เนื่องจาก: {e}"
            return {"response": response, "intent": "trade_history"}

        # 5. MARKET TREND INTENT
        if any(keyword in query_lower for keyword in ["price", "ราคา", "ทอง", "gold", "xau", "แนวโน้ม", "trend", "คู่เงิน", "aapl", "tsla", "eur", "us500"]):
            # Detect target asset
            symbol = "XAUUSD"
            name = "Gold (ทองคำ)"
            if "aapl" in query_lower or "apple" in query_lower:
                symbol = "AAPL"
                name = "Apple Inc. (หุ้น AAPL)"
            elif "tsla" in query_lower or "tesla" in query_lower:
                symbol = "TSLA"
                name = "Tesla Inc. (หุ้น TSLA)"
            elif "eur" in query_lower or "forex" in query_lower:
                symbol = "EURUSD"
                name = "EURUSD (ยูโร / ดอลลาร์)"
            elif "us500" in query_lower or "index" in query_lower:
                symbol = "US500"
                name = "US500 (ดัชนี S&P 500)"

            try:
                price = self.mt5.get_symbol_price(symbol)
                bid = price.get("bid", 0.0)
                ask = price.get("ask", 0.0)
                
                bid_str = f"{bid:,.5f}" if symbol == 'EURUSD' else f"{bid:,.2f}"
                ask_str = f"{ask:,.5f}" if symbol == 'EURUSD' else f"{ask:,.2f}"
                
                # Fetch recent candles for trend check
                candles = self.mt5.get_historical_candles(symbol, "H1", count=10)
                trend_text = "ไม่ชัดเจน (Sideway)"
                if candles and len(candles) >= 5:
                    closes = [c["close"] for c in candles]
                    if closes[-1] > closes[0]:
                        trend_text = "📈 ขาขึ้น (Bullish Trend)"
                    elif closes[-1] < closes[0]:
                        trend_text = "📉 ขาลง (Bearish Trend)"
                
                response = (
                    f"📈 **ข้อมูลราคาสดและการวิเคราะห์ตลาดสำหรับ {name}**:\n\n"
                    f"• 💰 **ราคาเสนอซื้อ (Bid)**: `{bid_str}`\n"
                    f"• 🏷️ **ราคาเสนอขาย (Ask)**: `{ask_str}`\n"
                    f"• 📊 **แนวโน้มช่วงสั้น (H1 Trend)**: **{trend_text}**\n\n"
                    "💡 *หมายเหตุ: แนวโน้มวิเคราะห์เบื้องต้นจากทิศทางปิดของแท่งราคาล่าสุด 10 ชั่วโมงย้อนหลัง*"
                )
            except Exception as e:
                response = f"ขออภัยครับ ไม่สามารถดึงข้อมูลราคาตลาดได้ในขณะนี้เนื่องจาก: {e}"
            return {"response": response, "intent": "market_prices"}

        # 6. BOT RECOMMENDATION INTENT
        if any(keyword in query_lower for keyword in ["บอท", "bot", "แนะนำ", "กลยุทธ์", "บอทแนะนำ", "algorithm"]):
            response = (
                "🤖 **คู่มือแนะนำการตั้งค่าบอทเทรดอัจฉริยะ (Bot Recommendation)**:\n\n"
                "ระบบของ **Giant Slayer** รองรับอัลกอริทึมวิเคราะห์ที่หลากหลาย โดยแนะนำการตั้งค่าดังนี้:\n\n"
                "1. 🟡 **บอทเทรดทองคำ (RSI Oscillator)**\n"
                "   • **Asset**: `XAUUSD` | **Timeframe**: `M5` หรือ `M15`\n"
                "   • **กลยุทธ์**: RSI (ตรวจจับจุดเข้าซื้อเมื่อ Oversold < 30 และจุดขายเมื่อ Overbought > 70)\n"
                "   • **คำแนะนำ**: เหมาะกับสภาวะตลาดที่เป็นตลาดไซด์เวย์ (Range-bound)\n\n"
                "2. ⚡ **บอทไวพิเศษ (Stochastic RSI)**\n"
                "   • **Asset**: `XAUUSD`, `BTCUSD`, `EURUSD` | **Timeframe**: `M1`, `M5` หรือ `M15`\n"
                "   • **กลยุทธ์**: StochRSI (เข้าซื้อเมื่อ %K ตัดขึ้นเหนือ %D ต่ำกว่าระดับ 20 และขายเมื่อ %K ตัดลงใต้ %D สูงกว่าระดับ 80)\n"
                "   • **คำแนะนำ**: ตอบสนองต่อราคาและจับสัญญาณจุดกลับตัวด่วนได้ไวกว่า RSI ทั่วไป เหมาะกับ Day Trading หรือ Swing Trading ระยะสั้น\n\n"
                "3. 📈 **บอทเทรดตามเทรน (SMA Cross)**\n"
                "   • **Asset**: `EURUSD`, `US500` | **Timeframe**: `H1`\n"
                "   • **กลยุทธ์**: SMA 5 และ SMA 15 (Golden Cross / Death Cross)\n"
                "   • **คำแนะนำ**: เหมาะกับสภาวะตลาดที่มีทิศทางแนวโน้มชัดเจน (Trending Market)\n\n"
                "4. 🔮 **บอทเทรดเวฟชั้นสูง (Elliott Wave / Harmonics)**\n"
                "   • **Asset**: `XAUUSD` | **Timeframe**: `H1`\n"
                "   • **กลยุทธ์**: Elliott Wave 3 หรือฮาร์มอนิกแพทเทิร์น (Gartley/Butterfly)\n"
                "   • **คำแนะนำ**: ใช้สำหรับมองหาจุดเปลี่ยนเทรนสำคัญ (Trend Reversal)\n\n"
                "💡 *คุณสามารถคลิกปุ่ม 'สร้างบอทใหม่' ในแท็บระบบบอทเทรดเพื่อเลือกใช้กลยุทธ์เหล่านี้ได้ทันที!*"
            )
        # 7. STOCHASTIC RSI INTENT
        if any(keyword in query_lower for keyword in ["stochrsi", "stoch rsi", "stochastic rsi", "stochasticrsi", "สโต", "stoch"]):
            # Determine target asset and timeframe
            symbol = "XAUUSD"
            name = "Gold Spot / US Dollar"
            if "aapl" in query_lower or "apple" in query_lower:
                symbol = "AAPL"
                name = "Apple Inc."
            elif "tsla" in query_lower or "tesla" in query_lower:
                symbol = "TSLA"
                name = "Tesla Inc."
            elif "eur" in query_lower or "forex" in query_lower:
                symbol = "EURUSD"
                name = "Euro / US Dollar"
            elif "us500" in query_lower or "index" in query_lower:
                symbol = "US500"
                name = "S&P 500 Index"
            elif "btc" in query_lower or "bitcoin" in query_lower:
                symbol = "BTCUSD"
                name = "Bitcoin / US Dollar"

            timeframe = "H1"
            if "m1" in query_lower and "m15" not in query_lower and "m30" not in query_lower:
                timeframe = "M1"
            elif "m5" in query_lower:
                timeframe = "M5"
            elif "m15" in query_lower:
                timeframe = "M15"
            elif "m30" in query_lower:
                timeframe = "M30"
            elif "h4" in query_lower:
                timeframe = "H4"
            elif "d1" in query_lower:
                timeframe = "D1"

            is_educational = any(k in query_lower for k in ["คืออะไร", "คือ", "แปลว่า", "อธิบาย", "ความหมาย", "อย่างไร", "วิธีใช้"])

            try:
                candles = self.mt5.get_historical_candles(symbol, timeframe, count=150)
                if candles and len(candles) >= 35:
                    from backend.pattern_detector import calculate_stoch_rsi, calculate_rsi
                    close_prices = [c["close"] for c in candles]
                    k_vals, d_vals = calculate_stoch_rsi(close_prices, 14, 14, 3, 3)
                    rsi_vals = calculate_rsi(close_prices, 14)
                    
                    k = k_vals[-1]
                    d = d_vals[-1]
                    rsi = rsi_vals[-1]
                    
                    prev_k = k_vals[-2] if len(k_vals) >= 2 else None
                    prev_d = d_vals[-2] if len(d_vals) >= 2 else None
                    
                    status_text = "Neutral (ปกติ)"
                    status_color = "⚪"
                    
                    if k is not None:
                        if k >= 80:
                            status_text = "Overbought (ซื้อมากเกินไป - ระวังแรงเทขาย) 🔴"
                        elif k <= 20:
                            status_text = "Oversold (ขายมากเกินไป - มีโอกาสรีบาวน์) 🟢"
                        
                    # Signal crossover
                    signal_text = "ยังไม่มีสัญญาณก้าวข้าม (Crossover) ของเส้น %K และ %D ในตอนนี้"
                    if k is not None and d is not None and prev_k is not None and prev_d is not None:
                        if prev_k <= prev_d and k > d:
                            if k <= 25:
                                signal_text = "🚀 **สัญญาณซื้อ (BUY Signal)**: %K ตัดขึ้นเหนือ %D ในเขต Oversold (มีโอกาสกลับตัวขึ้นสูง!)"
                            else:
                                signal_text = "📈 %K ตัดขึ้นเหนือ %D (สัญญาณโมเมนตัมขาขึ้นเบื้องต้น)"
                        elif prev_k >= prev_d and k < d:
                            if k >= 75:
                                signal_text = "⚠️ **สัญญาณขาย (SELL Signal)**: %K ตัดลงต่ำกว่า %D ในเขต Overbought (มีโอกาสกลับตัวลงสูง!)"
                            else:
                                signal_text = "📉 %K ตัดลงต่ำกว่า %D (สัญญาณโมเมนตัมขาลงเบื้องต้น)"
                            
                    price_str = f"{close_prices[-1]:,.5f}" if symbol == 'EURUSD' else f"{close_prices[-1]:,.2f}"
                    rsi_str = f"{rsi:.1f}" if rsi is not None else 'N/A'
                    k_str = f"{k:.1f}" if k is not None else 'N/A'
                    d_str = f"{d:.1f}" if d is not None else 'N/A'
                    
                    analysis = (
                        f"📊 **วิเคราะห์ Stochastic RSI เรียลไทม์ ({symbol} - {timeframe})** ⚡\n\n"
                        f"• 💰 **ราคาล่าสุด**: `{price_str}`\n"
                        f"• 🌊 **RSI ดิบ (14)**: `{rsi_str}`\n"
                        f"• 📈 **StochRSI %K (Fast Line)**: `{k_str}`\n"
                        f"• 📉 **StochRSI %D (Slow Line)**: `{d_str}`\n"
                        f"• **สถานะ**: **{status_text}**\n"
                        f"• 🎯 **สัญญาณเทรดปัจจุบัน**: {signal_text}\n\n"
                        f"💡 **คำแนะนำเชิงกลยุทธ์**: "
                    )
                    
                    if k is not None:
                        if k >= 80:
                            analysis += f"โมเมนตัมในระดับ {timeframe} อยู่ในเขต Overbought สูงมาก บ่งชี้ว่าราคามีการปรับตัวขึ้นมารวดเร็วเกินไป มีโอกาสปรับฐานหรือเผชิญแรงเทขายทำกำไรในระยะสั้น แนะนำชะลอการ BUY และรอสัญญาณยืนยันการกลับตัวเป็น SELL เมื่อ %K ตัดต่ำกว่า %D"
                        elif k <= 20:
                            analysis += f"ราคาในระดับ {timeframe} ดิ่งลงลึกจนเข้าสู่ระดับ Oversold บ่งชี้ถึงแรงขายที่มากเกินไปและมูลค่าเริ่มถูกลง มีโอกาสที่ราคาจะเกิดแรงซื้อกลับเพื่อเกิด technical rebound ได้ตลอดเวลา แนะนำเฝ้ารอจังหวะ BUY เมื่อเกิดสัญญาณ %K ตัดขึ้นเหนือ %D"
                        else:
                            analysis += f"เครื่องมือ StochRSI แสดงค่าระดับกลางๆ ตลาดกำลังประคองตัวหรือเคลื่อนไหวสะสมพลัง แนะนำรอการวิ่งเข้าหาโซนสุดโต่ง (OB/OS) หรือรอการจับคู่กับสัญญาณ Indicator ตัวอื่น เช่น SMC (BOS/Order Block) หรือ EMA Cross เพื่อยืนยันเทรนหลัก"
                    else:
                        analysis += "ยังไม่สามารถวิเคราะห์ข้อมูลกลยุทธ์ได้เนื่องจากมีข้อมูลไม่เพียงพอ"
                else:
                    analysis = f"⚠️ ข้อมูลประวัติราคาย้อนหลังของ {symbol} ({timeframe}) มีไม่เพียงพอสำหรับการคำนวณ Stochastic RSI ในขณะนี้"
            except Exception as e:
                analysis = f"ขออภัยครับ เกิดข้อผิดพลาดขณะพยายามวิเคราะห์อินดิเคเตอร์: {str(e)}"

            if is_educational:
                educational_info = (
                    "💡 **ความรู้: Stochastic RSI (StochRSI) คืออะไร?**\n"
                    "Stochastic RSI คืออินดิเคเตอร์ประเภท **'ออสซิลเลเตอร์ของออสซิลเลเตอร์' (Oscillator of Oscillator)** "
                    "โดยนำสูตรของ Stochastic Oscillator มาคำนวณซ้ำบนค่า Relative Strength Index (RSI) "
                    "แทนการใช้ราคาดิบเพื่อ **เพิ่มความเร็วและความไว** ในการจับสัญญาณซื้อขาย\n\n"
                    "**ประโยชน์หลัก**:\n"
                    "• ช่วยให้มองเห็นสภาวะ Overbought (ซื้อมากเกินไป > 80) และ Oversold (ขายมากเกินไป < 20) ได้รวดเร็วกว่าการดู RSI ทั่วไป\n"
                    "• ช่วยจับสัญญาณจุดกลับตัวระยะสั้นได้อย่างดีเยี่ยม\n\n"
                    "---\n\n"
                )
                response = educational_info + analysis
            else:
                response = analysis

            return {"response": response, "intent": "stochrsi_analysis"}

        # 8. MACD 4C INTENT
        if any(keyword in query_lower for keyword in ["macd4c", "macd 4c", "macd 4 colour", "4 colour macd", "4color", "4color macd"]):
            # Determine target asset and timeframe
            symbol = "XAUUSD"
            name = "Gold Spot / US Dollar"
            if "aapl" in query_lower or "apple" in query_lower:
                symbol = "AAPL"
                name = "Apple Inc."
            elif "tsla" in query_lower or "tesla" in query_lower:
                symbol = "TSLA"
                name = "Tesla Inc."
            elif "eur" in query_lower or "forex" in query_lower:
                symbol = "EURUSD"
                name = "Euro / US Dollar"
            elif "us500" in query_lower or "index" in query_lower:
                symbol = "US500"
                name = "S&P 500 Index"
            elif "btc" in query_lower or "bitcoin" in query_lower:
                symbol = "BTCUSD"
                name = "Bitcoin / US Dollar"

            timeframe = "H1"
            if "m1" in query_lower and "m15" not in query_lower and "m30" not in query_lower:
                timeframe = "M1"
            elif "m5" in query_lower:
                timeframe = "M5"
            elif "m15" in query_lower:
                timeframe = "M15"
            elif "m30" in query_lower:
                timeframe = "M30"
            elif "h4" in query_lower:
                timeframe = "H4"
            elif "d1" in query_lower:
                timeframe = "D1"

            is_educational = any(k in query_lower for k in ["คืออะไร", "คือ", "แปลว่า", "อธิบาย", "ความหมาย", "อย่างไร", "วิธีใช้", "สี", "ทำไม"])

            try:
                candles = self.mt5.get_historical_candles(symbol, timeframe, count=150)
                if candles and len(candles) >= 35:
                    from backend.pattern_detector import calculate_macd_4c
                    close_prices = [c["close"] for c in candles]
                    macd_vals, colors = calculate_macd_4c(close_prices, 12, 26, 9)
                    
                    macd_val = macd_vals[-1]
                    color = colors[-1]
                    
                    prev_macd = macd_vals[-2] if len(macd_vals) >= 2 else None
                    prev_color = colors[-2] if len(colors) >= 2 else None
                    
                    status_text = "Neutral (ปกติ)"
                    status_color = "⚪"
                    desc_thai = "ไม่มีทิศทางที่ชัดเจน"
                    
                    if color == "lime":
                        status_text = "Bullish Momentum แข็งแกร่ง (Rising above Zero)"
                        status_color = "🟢"
                        desc_thai = "แนวโน้มขาขึ้นกำลังมีพลังและพุ่งแรงเหนือเส้น 0 (แท่งสีเขียวสว่าง / Lime)"
                    elif color == "green":
                        status_text = "Bullish Slowdown ชะลอตัว (Falling above Zero)"
                        status_color = "🌲"
                        desc_thai = "แนวโน้มยังเป็นขาขึ้นเหนือเส้น 0 แต่เริ่มอ่อนแรง/ชะลอตัวลง (แท่งสีเขียวเข้ม / Green)"
                    elif color == "maroon":
                        status_text = "Bearish Momentum แข็งแกร่ง (Falling below Zero)"
                        status_color = "🪵"
                        desc_thai = "แนวโน้มขาลงกำลังรุนแรงและทิ้งตัวลึกใต้เส้น 0 (แท่งสีน้ำตาลแดง / Maroon)"
                    elif color == "red":
                        status_text = "Bearish Recovery เริ่มฟื้นตัว (Rising below Zero)"
                        status_color = "🔴"
                        desc_thai = "แนวโน้มยังเป็นขาลงใต้เส้น 0 แต่เริ่มฟื้นตัว/ดีดกลับขึ้นมา (แท่งสีแดงสว่าง / Red)"
                        
                    # Signal crossover
                    signal_text = "ยังไม่มีสัญญาณก้าวข้าม (Crossover) ของสีในขณะนี้"
                    if prev_color == "maroon" and color == "red":
                        signal_text = "🚀 **สัญญาณกลับตัวฝั่งซื้อ (BULLISH CURL)**: ฮิสโตแกรมเปลี่ยนสีจาก Maroon เป็น Red บ่งชี้แรงขายเริ่มชะลอตัวและพร้อมจะฟื้นตัว (เหมาะกับการเตรียม BUY)"
                    elif prev_color == "green" and color == "lime":
                        signal_text = "📈 **สัญญาณผลักดันฝั่งซื้อ (BULLISH EXPANSION)**: ฮิสโตแกรมเปลี่ยนจาก Green เป็น Lime บ่งชี้ขาขึ้นกลับมามีแรงขับเคลื่อนอีกครั้ง"
                    elif prev_color == "lime" and color == "green":
                        signal_text = "⚠️ **สัญญาณชะลอตัวฝั่งขาย (BEARISH CURL)**: ฮิสโตแกรมเปลี่ยนสีจาก Lime เป็น Green บ่งชี้แรงซื้อเริ่มแผ่วลงและอาจจบรอบขาขึ้น (ระวังและเตรียมปล่อยของ)"
                    elif prev_color == "red" and color == "maroon":
                        signal_text = "🩸 **สัญญาณกลับตัวฝั่งขาย (BEARISH EXPANSION)**: ฮิสโตแกรมเปลี่ยนจาก Red เป็น Maroon บ่งชี้ขาลงกลับมาทิ้งตัวรุนแรงอีกครั้ง"
                    elif prev_macd is not None and prev_macd <= 0 and macd_val > 0:
                        signal_text = "🚀 **สัญญาณทะลุฝั่งซื้อ (ZERO CROSSUP)**: เส้น MACD ตัดพ้นแกน 0 ขึ้นมา บ่งชี้ทิศทางภาพใหญ่เปลี่ยนเป็นขาขึ้นเต็มตัว"
                    elif prev_macd is not None and prev_macd >= 0 and macd_val < 0:
                        signal_text = "⚠️ **สัญญาณดิ่งฝั่งขาย (ZERO CROSSDOWN)**: เส้น MACD ตัดต่ำกว่าแกน 0 ลงไป บ่งชี้ทิศทางภาพใหญ่เปลี่ยนเป็นขาลงเต็มตัว"
                            
                    price_str = f"{close_prices[-1]:,.5f}" if symbol == 'EURUSD' else f"{close_prices[-1]:,.2f}"
                    macd_val_str = f"{macd_val:.4f}" if macd_val is not None else 'N/A'
                    
                    analysis = (
                        f"📊 **วิเคราะห์ MACD 4C (4 Color MACD) เรียลไทม์ ({symbol} - {timeframe})** ⚡\n\n"
                        f"• 💰 **ราคาล่าสุด**: `{price_str}`\n"
                        f"• 📈 **MACD Line Value**: `{macd_val_str}`\n"
                        f"• 🏷️ **สีของแท่งโมเมนตัม**: `{color.upper() if color else 'N/A'}` {status_color}\n"
                        f"• 🔍 **สภาวะแนวโน้ม**: **{status_text}**\n"
                        f"• 💡 **ความหมายเชิงลึก**: {desc_thai}\n"
                        f"• 🎯 **สัญญาณเทรดปัจจุบัน**: {signal_text}\n\n"
                        f"💡 **คำแนะนำการซื้อขาย**: "
                    )
                    
                    if color == "lime":
                        analysis += "สภาวะปัจจุบันเป็นแรงซื้อขาขึ้นแข็งแกร่ง ห้ามเปิดออเดอร์ SELL สวนเด็ดขาด! แนะนำให้ถือไม้ BUY รันเทรนตามระบบไปเรื่อยๆ จนกว่าแท่งสีจะเปลี่ยนเป็นสีเขียวเข้ม (Green)"
                    elif color == "green":
                        analysis += "แรงซื้อขาขึ้นเริ่มอ่อนแรงลง ถือเป็นสัญญาณเตือนให้ระวังการกลับตัว แนะนำให้เตรียมปิดล็อกกำไรของออเดอร์ BUY หรือเลื่อนตั้งจุดเท่าทุน (Trailing Stop) ห้ามเปิดสถานะ BUY เพิ่ม"
                    elif color == "maroon":
                        analysis += "สภาวะปัจจุบันเป็นแรงเทขายขาลงรุนแรง ห้ามเปิดออเดอร์ BUY สวนเด็ดขาด! แนะนำถือไม้ SELL รันเทรนตามระบบจนกว่าแท่งสีจะเริ่มเปลี่ยนเป็นสีแดง (Red)"
                    elif color == "red":
                        analysis += "แรงขายใต้เส้น 0 เริ่มอ่อนกำลังลงและมีแรงพยุงฟื้นตัวขึ้น ถือเป็นสภาวะเด้งสั้น (Technical Rebound) หรือเตรียมพร้อมกลับตัว แนะนำเฝ้ารอออเดอร์ BUY เมื่อราคาประคองตัวอยู่ได้ หรือเตรียมพร้อมรับมือกับการปิดไม้ SELL"
                else:
                    analysis = f"⚠️ ข้อมูลประวัติราคาย้อนหลังของ {symbol} ({timeframe}) มีไม่เพียงพอสำหรับการคำนวณ MACD 4C ในขณะนี้"
            except Exception as e:
                analysis = f"ขออภัยครับ เกิดข้อผิดพลาดขณะพยายามวิเคราะห์อินดิเคเตอร์: {str(e)}"

            if is_educational:
                educational_info = (
                    "💡 **ความรู้: MACD 4C (4 Color MACD) คืออะไร?**\n"
                    "MACD 4C คืออินดิเคเตอร์ที่นำเส้น **MACD Line (Fast EMA - Slow EMA)** มาเปลี่ยนรูปแบบการแสดงผลเป็น **ฮิสโตแกรม (Histogram)** "
                    "พร้อมใส่รหัสสีที่เฉียบคมและแม่นยำ 4 สี เพื่อบ่งบอกการเพิ่มขึ้นหรือลดลงของโมเมนตัมได้อย่างมีประสิทธิภาพรวดเร็วกว่าแท่งสีเดียว\n\n"
                    "**รหัสสีทั้ง 4 สี**:\n"
                    "1. 🟢 **Lime (เขียวสว่าง)**: ยืนเหนือ 0 และมีทิศทางปรับตัวสูงขึ้น (ขาขึ้นแข็งแกร่งมาก)\n"
                    "2. 🌲 **Green (เขียวเข้ม)**: ยืนเหนือ 0 แต่มีทิศทางปรับตัวลดลง (ขาขึ้นเริ่มอ่อนแรง/ชะลอตัว)\n"
                    "3. 🪵 **Maroon (น้ำตาลแดง)**: อยู่ใต้ 0 และมีทิศทางปรับตัวต่ำลง (ขาลงรุนแรงมาก)\n"
                    "4. 🔴 **Red (แดงสว่าง)**: อยู่ใต้ 0 แต่มีทิศทางฟื้นตัวดึงกลับขึ้นมา (ขาลงเริ่มฟื้นตัว/ชะลอตัว)\n\n"
                    "---\n\n"
                )
                response = educational_info + analysis
            else:
                response = analysis

            return {"response": response, "intent": "macd_4c_analysis"}

        # DEFAULT RESPONSE
        response = (
            "🤖 **ขออภัยครับ ผมยังไม่เข้าใจคำถามนี้อย่างสมบูรณ์**\n\n"
            "เนื่องจากผมมีข้อมูลเชิงลึกเฉพาะที่เกี่ยวกับการซื้อขายและสถานะพอร์ตการลงทุนของคุณเป็นหลัก กรุณาลองถามคำถามเช่น:\n"
            "• *\"พอร์ตของฉันตอนนี้มีเงินเท่าไหร่\"*\n"
            "• *\"มีออเดอร์ทองเปิดอยู่ไหม\"*\n"
            "• *\"ขอดูประวัติการเทรดที่ผ่านมาหน่อย\"*\n"
            "• *\"ราคาทองคำ XAUUSD อยู่ที่เท่าไหร่\"*\n\n"
            "หรือคลิกที่ตัวเลือกด่วนด้านล่างนี้ได้เลยครับ!"
        )
        return {"response": response, "intent": "unknown"}

    def get_news_intelligence_summary(self, db: Session) -> dict:
        try:
            # Query latest 5 news records
            news_items = db.query(NewsRecord).order_by(NewsRecord.published_at.desc()).limit(5).all()
            
            # Calculate summary metrics (similar to REST API)
            bullish_count = 0
            bearish_count = 0
            neutral_count = 0
            has_high_geopolitical_threat = False
            has_medium_threat = False
            
            for item in news_items:
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
                
            sentiment_text = "🟢 **BULLISH (แนวโน้มขาขึ้น)**" if sentiment_summary == "bullish" else "🔴 **BEARISH (แนวโน้มขาลง)**" if sentiment_summary == "bearish" else "⚪ **NEUTRAL (แนวโน้มคงตัว)**"
            risk_text = "🚨 **HIGH (ระดับภัยคุกคามสงคราม/ภูมิรัฐศาสตร์รุนแรง)**" if risk_level == "high" else "⚡ **MEDIUM (ความเสี่ยงปานกลาง/ผันผวนสูง)**" if risk_level == "medium" else "🟢 **LOW (ระดับภัยคุกคามต่ำ/อยู่ในกรอบปกติ)**"
            
            response = (
                f"🤖 **รายงานวิเคราะห์ข่าวกรอง & ภูมิรัฐศาสตร์อัจฉริยะ (AI Market Intelligence)** 🛡️📈\n\n"
                f"• 📊 **สรุปอารมณ์ตลาด (AI Market Mood)**: {sentiment_text}\n"
                f"• ⚠️ **ระดับความเสี่ยงภูมิรัฐศาสตร์ (Geopolitical Threat Level)**: {risk_text}\n\n"
            )
            
            if risk_level == "high":
                response += "💡 **คำแนะนำเชิงความเสี่ยง**: สภาวะภูมิรัฐศาสตร์ตึงเครียดระดับรุนแรง ถือเป็นแรงบวกระดับสูงต่อสินทรัพย์ปลอดภัย (Safe-Haven) เช่น ทองคำ (XAUUSD) ห้ามเปิดออเดอร์ SELL สวนเป็นอันขาด แนะนำให้เน้นเปิด BUY หรือปรับขนาด SL ให้กว้างขึ้นเพื่อป้องกันความผันผวนของราคา\n\n"
            elif risk_level == "medium":
                response += "💡 **คำแนะนำเชิงความเสี่ยง**: ตลาดมีความผันผวนจากปัจจัยการเงินมหภาคหรือภูมิรัฐศาสตร์ปานกลาง แนะนำให้ควบคุมความเสี่ยงอย่างรัดกุม ตั้งจุด Stop Loss ทุกตำแหน่ง\n\n"
            else:
                response += "💡 **คำแนะนำเชิงความเสี่ยง**: ปัจจัยข่าวยังคงปกติ บอทระบบสัมผัสทางเทคนิคคอลสามารถรันงานได้อย่างเต็มที่\n\n"
                
            if not news_items:
                response += "📜 *ขณะนี้ยังไม่มีรายการวิเคราะห์ข่าวด่วนบันทึกในระบบพอร์ตของคุณ คุณสามารถกดดึงข่าวสารเรียลไทม์ได้จากแถบ 'ข่าวและ AI วิเคราะห์' ด้านล่างพรีเมียมแดชบอร์ดครับ!*"
            else:
                response += f"📰 **ข่าวด่วนและบทวิเคราะห์ล่าสุด ({len(news_items)} ข่าวเด่น)**:\n\n"
                for idx, n in enumerate(news_items, 1):
                    category_badge = "🛡️ สงคราม/ภูมิรัฐศาสตร์" if n.category == "geopolitical" else "📊 เศรษฐกิจมหภาค"
                    impact_badge = "🔴 HIGH" if n.impact_level == "high" else "🟡 MEDIUM" if n.impact_level == "medium" else "🔵 LOW"
                    sentiment_badge = "🟢 BUY (Bullish)" if n.sentiment == "bullish" else "🔴 SELL (Bearish)" if n.sentiment == "bearish" else "⚪ NEUTRAL"
                    
                    response += (
                        f"{idx}. **{n.title}** ({n.source})\n"
                        f"   • ประเภท: `{category_badge}` | ความรุนแรง: `{impact_badge}` | AI โหวต: `{sentiment_badge}`\n"
                        f"   • **บทวิเคราะห์ AI**: {n.analysis or 'ไม่มีข้อมูลการวิเคราะห์ในขณะนี้'}\n\n"
                    )
                    
            return {"response": response, "intent": "news_intelligence"}
        except Exception as e:
            return {
                "response": f"ขออภัยครับ เกิดข้อผิดพลาดขณะวิเคราะห์ดึงข้อมูลข่าวสาร: {e}",
                "intent": "news_intelligence_error"
            }

    def analyze_gold_market(self, query: str, db: Session) -> dict:
        symbol = "XAUUSD"
        
        # 1. Fetch live price
        try:
            price = self.mt5.get_symbol_price(symbol)
            bid = price.get("bid", 0.0)
            ask = price.get("ask", 0.0)
            spread = ask - bid
        except Exception as e:
            bid, ask, spread = 0.0, 0.0, 0.0
            
        # 2. Fetch multi-timeframe candles
        try:
            m15_candles = self.mt5.get_historical_candles(symbol, "M15", count=100)
            h1_candles = self.mt5.get_historical_candles(symbol, "H1", count=100)
            d1_candles = self.mt5.get_historical_candles(symbol, "D1", count=50)
        except Exception as e:
            return {
                "response": f"ขออภัยครับ เกิดข้อผิดพลาดขณะพยายามดึงข้อมูลแท่งเทียนทองคำจาก MT5: {str(e)}",
                "intent": "gold_analysis_error"
            }
            
        if not m15_candles or not h1_candles or not d1_candles:
            return {
                "response": "ขออภัยครับ ข้อมูลแท่งเทียนทองคำมีไม่เพียงพอสำหรับการวิเคราะห์เชิงลึกในขณะนี้",
                "intent": "gold_analysis_no_data"
            }
            
        # Extract close prices
        m15_closes = [c["close"] for c in m15_candles]
        h1_closes = [c["close"] for c in h1_candles]
        d1_closes = [c["close"] for c in d1_candles]
        
        # 3. Technical calculations - D1 (Long-term)
        d1_rsi_list = calculate_rsi(d1_closes, 14)
        d1_rsi = d1_rsi_list[-1] if d1_rsi_list else None
        d1_macd_list, d1_colors_list = calculate_macd_4c(d1_closes)
        d1_macd = d1_macd_list[-1] if d1_macd_list else None
        d1_color = d1_colors_list[-1] if d1_colors_list else None
        
        # Long-term trend based on last 20 candles
        d1_trend = "ไซด์เวย์ (Sideways) ⚪"
        if len(d1_closes) >= 10:
            if d1_closes[-1] > d1_closes[-10]:
                d1_trend = "📈 ขาขึ้น (Bullish)"
            elif d1_closes[-1] < d1_closes[-10]:
                d1_trend = "📉 ขาลง (Bearish)"
                
        # 4. Technical calculations - H1 (Medium-term)
        h1_rsi_list = calculate_rsi(h1_closes, 14)
        h1_rsi = h1_rsi_list[-1] if h1_rsi_list else None
        h1_macd_list, h1_colors_list = calculate_macd_4c(h1_closes)
        h1_macd = h1_macd_list[-1] if h1_macd_list else None
        h1_color = h1_colors_list[-1] if h1_colors_list else None
        
        h1_trend = "ไซด์เวย์ (Sideways) ⚪"
        if len(h1_closes) >= 10:
            if h1_closes[-1] > h1_closes[-10]:
                h1_trend = "📈 ขาขึ้น (Bullish)"
            elif h1_closes[-1] < h1_closes[-10]:
                h1_trend = "📉 ขาลง (Bearish)"
                
        # Smart Money Concepts & Patterns on H1
        harmonic = detect_harmonic_patterns(h1_candles)
        elliott = detect_elliott_waves(h1_candles)
        rsi_div = detect_rsi_divergence(h1_candles)
        sr_bounce = detect_support_resistance_bounce(h1_candles)
        liq_sweep = detect_liquidity_sweep(h1_candles)
        order_block_test = detect_order_blocks(h1_candles)
        fvg_test = detect_fvg(h1_candles)
        
        # Swings for support & resistance extraction
        swings = detect_swings(h1_candles, window=4)
        highs = [s["price"] for s in swings if s["type"] == "high"]
        lows = [s["price"] for s in swings if s["type"] == "low"]
        
        support_levels = sorted(list(set(lows)))[-3:] if lows else []
        resistance_levels = sorted(list(set(highs)))[:3] if highs else []
        
        # 5. Technical calculations - M15 (Short-term)
        m15_rsi_list = calculate_rsi(m15_closes, 14)
        m15_rsi = m15_rsi_list[-1] if m15_rsi_list else None
        k_list, d_list = calculate_stoch_rsi(m15_closes)
        stoch_k = k_list[-1] if k_list else None
        stoch_d = d_list[-1] if d_list else None
        
        m15_trend = "ไซด์เวย์ (Sideways) ⚪"
        if len(m15_closes) >= 10:
            if m15_closes[-1] > m15_closes[-10]:
                m15_trend = "📈 ขาขึ้น (Bullish)"
            elif m15_closes[-1] < m15_closes[-10]:
                m15_trend = "📉 ขาลง (Bearish)"
                
        # 6. Sentiment Scoring Engine
        bullish_score = 0
        bearish_score = 0
        signals_summary = []
        
        # Trend signals
        if "ขาขึ้น" in d1_trend: bullish_score += 2.0; signals_summary.append("• **D1 Trend**: ขาขึ้น (+2.0 Bullish)")
        elif "ขาลง" in d1_trend: bearish_score += 2.0; signals_summary.append("• **D1 Trend**: ขาลง (+2.0 Bearish)")
        
        if "ขาขึ้น" in h1_trend: bullish_score += 1.5; signals_summary.append("• **H1 Trend**: ขาขึ้น (+1.5 Bullish)")
        elif "ขาลง" in h1_trend: bearish_score += 1.5; signals_summary.append("• **H1 Trend**: ขาลง (+1.5 Bearish)")
        
        if "ขาขึ้น" in m15_trend: bullish_score += 1.0; signals_summary.append("• **M15 Trend**: ขาขึ้น (+1.0 Bullish)")
        elif "ขาลง" in m15_trend: bearish_score += 1.0; signals_summary.append("• **M15 Trend**: ขาลง (+1.0 Bearish)")
        
        # Indicator signals
        if d1_rsi:
            if d1_rsi < 30: bullish_score += 1.5; signals_summary.append("• **RSI D1**: Oversold (<30) จุดกลับตัวซื้อกลับสะสมพอร์ต (+1.5 Bullish)")
            elif d1_rsi > 70: bearish_score += 1.5; signals_summary.append("• **RSI D1**: Overbought (>70) ระวังจุดกลับตัวเทขายแรง (+1.5 Bearish)")
            
        if h1_rsi:
            if h1_rsi < 30: bullish_score += 1.0; signals_summary.append("• **RSI H1**: Oversold เขตขายมากเกินไป (+1.0 Bullish)")
            elif h1_rsi > 70: bearish_score += 1.0; signals_summary.append("• **RSI H1**: Overbought เขตซื้อมากเกินไป (+1.0 Bearish)")
            
        if stoch_k and stoch_d:
            if stoch_k <= 20 and stoch_k > stoch_d: bullish_score += 1.0; signals_summary.append("• **StochRSI M15**: %K ตัดขึ้นเหนือ %D ในเขต Oversold สัญญาณซื้อย่อย (+1.0 Bullish)")
            elif stoch_k >= 80 and stoch_k < stoch_d: bearish_score += 1.0; signals_summary.append("• **StochRSI M15**: %K ตัดลงใต้ %D ในเขต Overbought สัญญาณขายย่อย (+1.0 Bearish)")
            
        if h1_color == "lime": bullish_score += 1.0; signals_summary.append("• **MACD H1**: แท่งสีเขียวสว่าง (Lime) โมเมนตัมขาขึ้นแข็งแกร่งมาก (+1.0 Bullish)")
        elif h1_color == "maroon": bearish_score += 1.0; signals_summary.append("• **MACD H1**: แท่งสีน้ำตาลแดง (Maroon) โมเมนตัมขาลงรุนแรงมาก (+1.0 Bearish)")
        elif h1_color == "red": bullish_score += 0.5; signals_summary.append("• **MACD H1**: แท่งสีแดงสว่าง (Red) แรงเทขายลดความรุนแรงลง (+0.5 Bullish)")
        elif h1_color == "green": bearish_score += 0.5; signals_summary.append("• **MACD H1**: แท่งสีเขียวเข้ม (Green) แรงซื้อขาขึ้นชะลอตัวลง (+0.5 Bearish)")

        # SMC Signals
        if harmonic:
            if harmonic["signal"] == "buy": bullish_score += 2.5; signals_summary.append(f"• **Harmonic Pattern**: ตรวจพบ {harmonic['pattern']} รูปแบบกลับตัวฝั่ง BUY (+2.5 Bullish)")
            else: bearish_score += 2.5; signals_summary.append(f"• **Harmonic Pattern**: ตรวจพบ {harmonic['pattern']} รูปแบบกลับตัวฝั่ง SELL (+2.5 Bearish)")
            
        if elliott:
            if elliott["signal"] == "buy": bullish_score += 2.0; signals_summary.append(f"• **Elliott Wave**: ตรวจพบ {elliott['pattern']} (+2.0 Bullish)")
            else: bearish_score += 2.0; signals_summary.append(f"• **Elliott Wave**: ตรวจพบ {elliott['pattern']} (+2.0 Bearish)")
            
        if rsi_div == "buy": bullish_score += 2.0; signals_summary.append("• **RSI Divergence**: เกิดสัญญาณขัดแย้งฝั่งกระทิง (Bullish Divergence) บน H1 (+2.0 Bullish)")
        elif rsi_div == "sell": bearish_score += 2.0; signals_summary.append("• **RSI Divergence**: เกิดสัญญาณขัดแย้งฝั่งหมี (Bearish Divergence) บน H1 (+2.0 Bearish)")
        
        if sr_bounce == "buy": bullish_score += 1.5; signals_summary.append("• **S/R Bounce**: ราคาสะท้อนตัวกลับขึ้นอย่างแข็งแกร่งบริเวณแนวรับสำคัญ (+1.5 Bullish)")
        elif sr_bounce == "sell": bearish_score += 1.5; signals_summary.append("• **S/R Bounce**: ราคาเผชิญแรงเทขายร่วงหล่นเมื่อชนแนวต้านสำคัญ (+1.5 Bearish)")
        
        if liq_sweep == "buy": bullish_score += 2.0; signals_summary.append("• **Liquidity Sweep**: เกิดสัญญาณกวาด Sell-Side Liquidity ดักตัดพอร์ตลาดแล้วดีดแรงกลับ (+2.0 Bullish)")
        elif liq_sweep == "sell": bearish_score += 2.0; signals_summary.append("• **Liquidity Sweep**: เกิดสัญญาณกวาด Buy-Side Liquidity กวาดแรงดันฝั่งซื้อแล้วดิ่งแรงกลับ (+2.0 Bearish)")
        
        if order_block_test == "buy": bullish_score += 1.5; signals_summary.append("• **Order Block**: ราคาดึงตัวเข้าทดสอบเขตความต้องการซื้อหลัก (Bullish Order Block Zone) (+1.5 Bullish)")
        elif order_block_test == "sell": bearish_score += 1.5; signals_summary.append("• **Order Block**: ราคาดีดตัวขึ้นทดสอบเขตความต้องการขายหลัก (Bearish Order Block Zone) (+1.5 Bearish)")
        
        if fvg_test == "buy": bullish_score += 1.2; signals_summary.append("• **Fair Value Gap**: ปรับตัวลงมาปิดช่องว่างราคาสภาพคล่องที่ขาดหายแล้วดีดตัว (Bullish FVG Filled) (+1.2 Bullish)")
        elif fvg_test == "sell": bearish_score += 1.2; signals_summary.append("• **Fair Value Gap**: ปรับตัวขึ้นปิดช่องว่างราคาสภาพคล่องที่ขาดหายแล้วร่วงหล่น (Bearish FVG Filled) (+1.2 Bearish)")
        
        # Calculate overall sentiment
        total_score = bullish_score + bearish_score
        sentiment = "ไซด์เวย์ ไร้ทิศทางชัดเจน (Neutral) ⚪"
        strategy_recommendation = "เน้นการตั้งรับสั้นๆ เล่นรอบบริเวณขอบแนวรับ-แนวต้านหลัก หลีกเลี่ยงการถือรันเทรนด์"
        
        if total_score > 0:
            bull_pct = (bullish_score / total_score) * 100
            if bull_pct >= 75:
                sentiment = "กระทิงดุ แข็งแกร่งมาก (Strongly Bullish) 🚀"
                strategy_recommendation = "เน้นเปิดสถานะ BUY เป็นหลักเมื่อราคาพูลแบ็กย่อตัวลงมาทดสอบแนวรับ / Order Block หรือถือรันเทรนด์"
            elif bull_pct >= 55:
                sentiment = "ฝั่งซื้อได้เปรียบ (Bullish) 📈"
                strategy_recommendation = "หาจังหวะย่อตัวเพื่อเข้าซื้อ (Buy on Dips) บริเวณแนวรับสำคัญ"
            elif bull_pct <= 25:
                sentiment = "หมีดุ ร่วงรุนแรง (Strongly Bearish) 🩸"
                strategy_recommendation = "เน้นเปิดสถานะ SELL เป็นหลักเมื่อราคาดีดตัวกลับขึ้นไปทดสอบแนวต้าน / Order Block"
            elif bull_pct <= 45:
                sentiment = "ฝั่งขายได้เปรียบ (Bearish) 📉"
                strategy_recommendation = "หาจังหวะดีดตัวขึ้นทดสอบแนวต้านเพื่อเปิดสถานะขาย (Sell on Rallies)"
                
        # 7. Actionable Trading Levels & Targets
        current_val = ask if ask > 0 else (m15_closes[-1] if m15_closes else 0.0)
        
        # Calculate dynamic SL and TP targets
        tp1, tp2, sl_target = 0.0, 0.0, 0.0
        if "Bullish" in sentiment:
            sl_target = support_levels[-1] - 3.0 if support_levels else current_val - 8.0
            tp1 = current_val + 6.0
            tp2 = resistance_levels[0] if resistance_levels and resistance_levels[0] > current_val else current_val + 15.0
        else:
            sl_target = resistance_levels[-1] + 3.0 if resistance_levels else current_val + 8.0
            tp1 = current_val - 6.0
            tp2 = support_levels[-1] if support_levels and support_levels[-1] < current_val else current_val - 15.0
            
        levels_text = (
            f"• 🎯 **ราคาเข้าสะสมที่แนะนำ**: " + (f"ย่อสะสมช่วง `{current_val - 2.0:.2f} - {current_val:.2f}`" if "Bullish" in sentiment else f"เด้งขายช่วง `{current_val:.2f} - {current_val + 2.0:.2f}`") + "\n"
            f"• 🟢 **เป้าหมายกำไร (Take Profit)**:\n"
            f"  - TP1: `{tp1:.2f}`\n"
            f"  - TP2: `{tp2:.2f}`\n"
            f"• 🔴 **จุดตัดขาดทุน (Stop Loss)**: `{sl_target:.2f}`\n"
        )
        
        # 8. Bot Recommendations
        bot_recs = "💡 **คำแนะนำสำหรับระบบบอทเทรดอัจฉริยะ**:\n"
        if "Neutral" in sentiment:
            bot_recs += "• ขอแนะนำบอทกลยุทธ์ **RSI Oscillator** หรือ **Stochastic RSI** บน Timeframe `M5 / M15` เนื่องจากเหมาะกับการเล่นเก็บกำไรในกรอบ Sideway สวิงไปกลับได้ดีเยี่ยม"
        elif "Bullish" in sentiment:
            bot_recs += "• ขอแนะนำบอทกลยุทธ์ **SMA Cross (Trend Follower)** บน Timeframe `H1` เพื่อรันเทรนด์ขาขึ้นยาวๆ\n"
            bot_recs += "• หรือใช้บอท **Stochastic RSI** บน Timeframe `M1 / M5` เพื่อดักจับสัญญาณช่วงราคาเกิดพักตัวลึกในเขต Oversold เพื่อเข้าไม้เข้าซื้ออย่างรวดเร็ว"
        else:
            bot_recs += "• ขอแนะนำบอทกลยุทธ์ **SMA Cross** หรือ **Stochastic RSI** ตั้งค่ากรองโมเมนตัมฝั่งขายดักรอสัญญาณ %K ตัดลงใต้ %D บริเวณเขต Overbought ของคลื่นย่อยยื่นขายด่วน"

        # Pre-format indicators safely
        d1_rsi_str = f"{d1_rsi:.1f}" if d1_rsi is not None else "N/A"
        h1_rsi_str = f"{h1_rsi:.1f}" if h1_rsi is not None else "N/A"
        stoch_k_str = f"{stoch_k:.1f}" if stoch_k is not None else "N/A"

        # Construct markdown raw analysis
        analysis_markdown = (
            f"📊 **รายงานด่วนการวิเคราะห์สัญญาณเทรดทองคำ (XAUUSD)** ⚡\n\n"
            f"• 💰 **ราคาเสนอซื้อ/เสนอขายปัจจุบัน**: Bid `{bid:,.2f}` | Ask `{ask:,.2f}`\n"
            f"• 📏 **ส่วนต่างราคา (Spread)**: `{spread * 100:.1f} Points`\n"
            f"• 🎯 **ความรู้สึกตลาดภาพรวม (Composite Sentiment)**: **{sentiment}**\n\n"
            f"⚙️ **โครงสร้างแนวโน้มแบบ Multi-Timeframe**:\n"
            f"  - ระยะยาว D1: `{d1_trend}` (RSI: `{d1_rsi_str}`)\n"
            f"  - ระยะกลาง H1: `{h1_trend}` (RSI: `{h1_rsi_str}`)\n"
            f"  - ระยะสั้น M15: `{m15_trend}` (StochRSI %K: `{stoch_k_str}`)\n\n"
            f"📌 **ระดับเทคนิคอลที่สำคัญของระบบ**:\n"
            f"  - แนวต้านหลัก H1 (Resistance): " + (", ".join([f"`{r:.2f}`" for r in resistance_levels]) if resistance_levels else "ยังไม่พบแนวต้านเด่นชัด") + "\n"
            f"  - แนวรับหลัก H1 (Support): " + (", ".join([f"`{s:.2f}`" for s in support_levels]) if support_levels else "ยังไม่พบแนวรับเด่นชัด") + "\n\n"
            f"🔍 **รายการสัญญาณวิเคราะห์เชิงโครงสร้างตลาด (SMC & Indicators)**:\n" + ("\n".join(signals_summary) if signals_summary else "• ยังไม่มีสัญญาณบ่งชี้เด่นชัดประคองระดับปัจจุบัน") + "\n\n"
            f"💡 **กลยุทธ์เชิงปฏิบัติการหน้างาน (Action Plan)**:\n"
            f"• **แผนการเทรด**: {strategy_recommendation}\n"
            f"{levels_text}\n"
            f"{bot_recs}"
        )
        
        # 9. LLM Selector (Local LLM vs ChatGPT vs Claude vs Gemini vs Python Native)
        local_llm_url = os.getenv("LOCAL_LLM_URL")
        local_llm_model = os.getenv("LOCAL_LLM_MODEL", "llama3")
        
        openai_key = os.getenv("OPENAI_API_KEY")
        openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20240620")
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        # Reload env explicitly if needed
        if not any([local_llm_url, openai_key, anthropic_key, gemini_key]):
            try:
                from dotenv import load_dotenv
                load_dotenv()
                local_llm_url = os.getenv("LOCAL_LLM_URL")
                local_llm_model = os.getenv("LOCAL_LLM_MODEL", "llama3")
                openai_key = os.getenv("OPENAI_API_KEY")
                openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                anthropic_key = os.getenv("ANTHROPIC_API_KEY")
                anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20240620")
                gemini_key = os.getenv("GEMINI_API_KEY")
            except Exception:
                pass
                
        # Clean and strip whitespaces safely
        if local_llm_url: local_llm_url = local_llm_url.strip()
        if local_llm_model: local_llm_model = local_llm_model.strip()
        if openai_key: openai_key = openai_key.strip()
        if openai_model: openai_model = openai_model.strip()
        if anthropic_key: anthropic_key = anthropic_key.strip()
        if anthropic_model: anthropic_model = anthropic_model.strip()
        if gemini_key: gemini_key = gemini_key.strip()

                
        system_instruction = (
            "คุณคือ Giant Slayer AI Assistant ผู้ช่วยเทรดและนักวิเคราะห์ราคาทองคำระดับมืออาชีพ "
            "ให้ตอบคำถามผู้ใช้เป็นภาษาไทยอย่างกระชับ สุภาพ น่าเชื่อถือ และอิงข้อมูลจากรายงานการวิเคราะห์เทคนิคคอลดิบที่เราเตรียมให้เสมอ "
            "ห้ามคาดเดาข้อมูลนอกเหนือจากรายงานเทคนิคคอล แต่คุณสามารถบรรยายเพิ่มความลื่นไหลและแนะนำกลยุทธ์การบริหารความเสี่ยงได้อย่างมืออาชีพ "
            "ใช้การจัดแต่งฟอร์แมต Markdown ที่อ่านง่ายและสวยงามเสมอ"
        )
        
        prompt = (
            f"คำถามของผู้ใช้: \"{query}\"\n\n"
            f"นี่คือข้อมูลวิเคราะห์ดิบล่าสุดจากระบบ Python MT5 ของเรา:\n"
            f"----------------------------------------\n"
            f"{analysis_markdown}\n"
            f"----------------------------------------\n\n"
            f"กรุณาตอบคำถามของผู้ใช้โดยประยุกต์และประมวลผลข้อมูลวิเคราะห์ดิบด้านบนนี้ให้เข้ากับสิ่งที่เขาถามโดยตรง "
            f"พร้อมสรุปแนวทางการเทรดทองที่ชัดเจน เข้าใจง่าย"
        )

        # Cascading Execution Sequence:
        
        # Option A: Local LLM
        if local_llm_url:
            try:
                import requests
                base_url = local_llm_url.rstrip('/')
                if not base_url.endswith('/v1') and not base_url.endswith('/v1/'):
                    url = f"{base_url}/v1/chat/completions"
                else:
                    url = f"{base_url}/chat/completions"
                payload = {
                    "model": local_llm_model or "llama3",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                response_api = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
                if response_api.status_code == 200:
                    result = response_api.json()
                    ai_text = result["choices"][0]["message"]["content"].strip()
                    if ai_text:
                        return {
                            "response": ai_text, 
                            "intent": "gold_deep_analysis_local_llm", 
                            "data": {
                                "raw_analysis": analysis_markdown,
                                "sentiment": sentiment,
                                "bid": bid,
                                "ask": ask
                            }
                        }
                else:
                    print(f"Local LLM error: {response_api.status_code}")
                    analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจาก Local LLM ขัดข้องรหัส {response_api.status_code})*"
            except Exception as local_err:
                print(f"Local LLM failed: {local_err}")
                analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจากเกิดข้อผิดพลาดของ Local LLM: {str(local_err)})*"
                
        # Option B: OpenAI ChatGPT
        if openai_key:
            try:
                import requests
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}"
                }
                payload = {
                    "model": openai_model or "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                response_api = requests.post(url, json=payload, headers=headers, timeout=15)
                if response_api.status_code == 200:
                    result = response_api.json()
                    ai_text = result["choices"][0]["message"]["content"].strip()
                    if ai_text:
                        return {
                            "response": ai_text, 
                            "intent": "gold_deep_analysis_openai", 
                            "data": {
                                "raw_analysis": analysis_markdown,
                                "sentiment": sentiment,
                                "bid": bid,
                                "ask": ask
                            }
                        }
                else:
                    print(f"OpenAI error: {response_api.status_code}")
                    analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจาก OpenAI ขัดข้องรหัส {response_api.status_code})*"
            except Exception as openai_err:
                print(f"OpenAI failed: {openai_err}")
                analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจากเกิดข้อผิดพลาดของ OpenAI: {str(openai_err)})*"
                
        # Option C: Anthropic Claude
        if anthropic_key:
            try:
                import requests
                url = "https://api.anthropic.com/v1/messages"
                headers = {
                    "content-type": "application/json",
                    "x-api-key": anthropic_key,
                    "anthropic-version": "2023-06-01"
                }
                payload = {
                    "model": anthropic_model or "claude-3-5-sonnet-20240620",
                    "max_tokens": 4000,
                    "system": system_instruction,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                response_api = requests.post(url, json=payload, headers=headers, timeout=15)
                if response_api.status_code == 200:
                    result = response_api.json()
                    ai_text = result["content"][0]["text"].strip()
                    if ai_text:
                        return {
                            "response": ai_text, 
                            "intent": "gold_deep_analysis_anthropic", 
                            "data": {
                                "raw_analysis": analysis_markdown,
                                "sentiment": sentiment,
                                "bid": bid,
                                "ask": ask
                            }
                        }
                else:
                    print(f"Anthropic error: {response_api.status_code}")
                    analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจาก Anthropic ขัดข้องรหัส {response_api.status_code})*"
            except Exception as anthropic_err:
                print(f"Anthropic failed: {anthropic_err}")
                if "หมายเหตุ" not in analysis_markdown:
                    analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจากเกิดข้อผิดพลาดของ Anthropic: {str(anthropic_err)})*"
                
        # Option D: Gemini AI
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction
                )
                
                response_ai = model.generate_content(prompt)
                ai_text = response_ai.text.strip()
                if ai_text:
                    return {
                        "response": ai_text, 
                        "intent": "gold_deep_analysis_gemini", 
                        "data": {
                            "raw_analysis": analysis_markdown,
                            "sentiment": sentiment,
                            "bid": bid,
                            "ask": ask
                        }
                    }
            except Exception as gemini_err:
                print(f"Gemini API failed: {gemini_err}")
                if "หมายเหตุ" not in analysis_markdown:
                    analysis_markdown += f"\n\n*(หมายเหตุ: ระบบสลับมาใช้รายงานด่วนแบบสถิติในเครื่องเนื่องจากเกิดข้อผิดพลาดในการเรียกใช้โมเดล AI: {str(gemini_err)})*"
                
        return {
            "response": analysis_markdown, 
            "intent": "gold_deep_analysis",
            "data": {
                "sentiment": sentiment,
                "bid": bid,
                "ask": ask,
                "levels": {
                    "supports": support_levels,
                    "resistances": resistance_levels,
                    "sl": sl_target,
                    "tp1": tp1,
                    "tp2": tp2
                }
            }
        }

