import re
from sqlalchemy.orm import Session
from datetime import datetime
from backend.mt5_manager import MT5Manager
from backend.models import TradeHistoryRecord, BotSettings

class ChatbotAssistant:
    def __init__(self):
        self.mt5 = MT5Manager()

    def process_query(self, query: str, db: Session) -> dict:
        query_lower = query.lower().strip()
        
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
                # Fetch recent history records (limit to 5 for readability)
                records = db.query(TradeHistoryRecord).order_by(TradeHistoryRecord.close_time.desc()).limit(5).all()
                if not records:
                    response = "📜 **ไม่พบประวัติบันทึกการเทรดที่ปิดไปแล้วในระบบฐานข้อมูลจำลองครับ**"
                else:
                    response = "📜 **ประวัติการเทรดล่าสุดของคุณ (5 ออเดอร์ล่าสุด)**:\n\n"
                    for idx, r in enumerate(records, 1):
                        pnl = r.profit
                        pnl_str = f"+${pnl:,.2f}" if pnl >= 0 else f"-${abs(pnl):,.2f}"
                        pnl_emoji = "🟢" if pnl >= 0 else "🔴"
                        
                        clean_comment = re.sub(r'\s*\[.*?\]$', '', r.comment) if r.comment else 'เทรดเอง (Manual)'
                        is_manual = not clean_comment or clean_comment in ['Manual', 'Simulation', 'Exness Real Close', 'Close via Antigravity MT5']
                        source_name = "เทรดเอง (Manual)" if is_manual else clean_comment
                        
                        response += (
                            f"{idx}. **#{r.ticket} {r.symbol}** ({r.order_type.upper()})\n"
                            f"   • Lot: `{r.volume}` | เปิด `{r.open_price}` ➔ ปิด `{r.close_price}`\n"
                            f"   • ผลลัพธ์: **{pnl_str}** {pnl_emoji}\n"
                            f"   • ที่มา: `{source_name}`\n"
                            f"   • เวลาปิด: `{r.close_time.strftime('%Y-%m-%d %H:%M:%S')}`\n\n"
                        )
                    
                    # Add winrate summary
                    total = db.query(TradeHistoryRecord).count()
                    wins = db.query(TradeHistoryRecord).filter(TradeHistoryRecord.profit > 0).count()
                    if total > 0:
                        winrate = (wins / total) * 100
                        response += f"📊 **ภาพรวมสถิติ**: เทรดทั้งหมด `{total}` ครั้ง | ชนะ `{wins}` ครั้ง | **Win Rate: {winrate:.1f}%**"
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
                    f"• 💰 **ราคาเสนอซื้อ (Bid)**: `{bid:,.2f if symbol != 'EURUSD' else 5}`\n"
                    f"• 🏷️ **ราคาเสนอขาย (Ask)**: `{ask:,.2f if symbol != 'EURUSD' else 5}`\n"
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
                "ระบบของ **Giant Slayer** รองรับอัลกอริทึมวิเคราะห์ 5 รูปแบบหลัก โดยแนะนำการตั้งค่าดังนี้:\n\n"
                "1. 🟡 **บอทเทรดทองคำ (RSI Oscillator)**\n"
                "   • **Asset**: `XAUUSD` | **Timeframe**: `M5` หรือ `M15`\n"
                "   • **กลยุทธ์**: RSI (ตรวจจับจุดเข้าซื้อเมื่อ Oversold < 30 และจุดขายเมื่อ Overbought > 70)\n"
                "   • **คำแนะนำ**: เหมาะกับสภาวะตลาดที่เป็นตลาดไซด์เวย์ (Range-bound)\n\n"
                "2. 📈 **บอทเทรดตามเทรด (SMA Cross)**\n"
                "   • **Asset**: `EURUSD`, `US500` | **Timeframe**: `H1`\n"
                "   • **กลยุทธ์**: SMA 5 และ SMA 15 (Golden Cross / Death Cross)\n"
                "   • **คำแนะนำ**: เหมาะกับสภาวะตลาดที่มีทิศทางแนวโน้มชัดเจน (Trending Market)\n\n"
                "3. 🔮 **บอทเทรดเวฟชั้นสูง (Elliott Wave / Harmonics)**\n"
                "   • **Asset**: `XAUUSD` | **Timeframe**: `H1`\n"
                "   • **กลยุทธ์**: Elliott Wave 3 หรือฮาร์มอนิกแพทเทิร์น (Gartley/Butterfly)\n"
                "   • **คำแนะนำ**: ใช้สำหรับมองหาจุดเปลี่ยนเทรนสำคัญ (Trend Reversal)\n\n"
                "💡 *คุณสามารถคลิกปุ่ม 'สร้างบอทใหม่' ในแท็บระบบบอทเทรดเพื่อเลือกใช้กลยุทธ์เหล่านี้ได้ทันที!*"
            )
            return {"response": response, "intent": "bot_recommendation"}

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
