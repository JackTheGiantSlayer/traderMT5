# 🤖 Giant Slayer - Advanced MT5 & Exness Trading Dashboard

**Giant Slayer** เป็นระบบกระดานเทรดอัจฉริยะ (Trading Dashboard) และระบบบอทเทรดอัตโนมัติ (Algorithmic Trading Bot) ระดับมืออาชีพที่ออกแบบมาเพื่อเชื่อมต่อพอร์ตการลงทุนของ **Exness ผ่านแพลตฟอร์ม MetaTrader 5 (MT5)** โดยตรง พัฒนาด้วยเทคโนโลยีเว็บสมัยใหม่ ธีมกระจกโปร่งแสงสุดพรีเมียม (Glassmorphic Dark Theme) และติดตั้งระบบการตรวจจับโครงสร้างราคาระดับสูง (Smart Money Concepts - SMC) พร้อมระบบบริหารจัดการความเสี่ยงที่แม่นยำสูง

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 1. 🔮 ระบบบอทเทรดวิเคราะห์โครงสร้างตลาดขั้นสูง (Advanced SMC Algorithms)
*   **BOS & CHoCH Detection**: ค้นหาจุดทะลุโครงสร้าง (Break of Structure - BOS) และจุดเปลี่ยนโครงสร้างตลาดฝั่งขาขึ้น/ขาลง (Change of Character - CHoCH) ยืนยันการกลับตัวของเทรนด์
*   **Order Blocks (OB)**: ตรวจจับแท่งราคาหนาแน่นของสถาบันการเงินขนาดใหญ่ (Institutional Order Blocks) พร้อมเช็กสัญญาณราคาทดสอบโซนและดีดกลับ
*   **Fair Value Gaps (FVG)**: ค้นหาจุดราคาไม่สมดุล (Imbalance Zone) เพื่อเข้าซื้อขาย ณ ราคาที่มีความสมส่วนสูงสุด
*   **Liquidity Sweep**: ระบบแจ้งเตือนหยุดการล่า (Stop Hunt / Turtle Soup) ที่มักเกิดขึ้นบริเวณแนวรับและแนวต้านสำคัญ
*   **SMC Confluence Master Pro**: อัลกอริทึมขั้นสูงผสานสัญญาณอัตโนมัติ โดยเปิดคำสั่งซื้อขายเมื่อเกิดการ Sweep ร่วมกับการดึงราคาเข้าทดสอบ Order Block หรือ FVG

### 2. 🛡️ ระบบบริหารความเสี่ยงระดับสถาบัน (Professional Risk Management)
*   **Dynamic ATR Position Sizing**: คำนวณขนาดสัญญาเทรด (Lot Size) ให้แปรผันอัตโนมัติอ้างอิงจากระยะ Stop Loss (คำนวณผ่านความผันผวนของกรอบ ATR), ยอดเงินทุนเหลือ (Balance) ในพอร์ต และเปอร์เซ็นต์ความเสี่ยง (% Risk) ที่รับได้ต่อออเดอร์
*   **Multi-Asset Point Value Calculator**: ระบบคำนวณมูลค่าจุดทศนิยมแยกประเภทสินทรัพย์อัตโนมัติ (ทองคำ XAUUSD, คู่เงินหลัก EURUSD/GBPUSD, หุ้น และดัชนีสหรัฐฯ US500) เพื่อคำนวณ Lots ที่แม่นยำที่สุด
*   **EMA 200 Macro Trend Filter**: ระบบป้องกันการเปิดออเดอร์สวนทิศทางเทรนด์หลัก โดยจะบล็อกออเดอร์ BUY เมื่อราคาอยู่ใต้เส้น EMA 200 และบล็อกออเดอร์ SELL เมื่อราคาอยู่เหนือ EMA 200 เท่านั้น
*   **Allowed Session Hours Filter**: จำกัดชั่วโมงทำงานของบอทให้ปลอดภัยตามเซสชันตลาดโลก (Asian Session, London Session, New York Session หรือช่วงทับซ้อน London-NY Overlap)
*   **Opposite Signal Reversal**: สั่งปิดออเดอร์ที่ถืออยู่และสลับหน้าเล่นทันทีเมื่อเกิดสัญญาณกลับตัวฝั่งตรงข้าม เพื่อจำกัดความเสี่ยง

### 3. 📊 หน้าจอแดชบอร์ดระดับพรีเมียม (Premium Dark Glassmorphic Dashboard)
*   **TradingView Lightweight Charts**: กราฟเท่งราคาแบบ Interactive ลื่นไหลสูง พร้อมวาดเส้น ZigZag สวิงไฮ/โลว์ และพล็อตปักหมุดจุดเข้าซื้อขาย (Markers) ของคลื่น Elliott Wave หรือ Harmonic Patterns
*   **Monitored Terminal Tabs**: 
    *   `Active Positions`: รายงานออเดอร์ที่ถืออยู่และยอดกำไร/ขาดทุนลอยตัว (Floating P&L) แบบสดๆ
    *   `Trade History`: ประวัติการปิดออเดอร์ย้อนหลัง
    *   `Deep Analytics`: หน้าสถิติวิเคราะห์เชิงลึก คำนวณอัตราการชนะ (Win Rate), ออเดอร์ชนะ/แพ้, กำไรสุทธิรวมสะสม และเปรียบเทียบสถิติประสิทธิภาพรายบอทเทรด
    *   `Bots System`: ควบคุม เปิด/ปิด ปรับปรุง ลบ และสร้างบอทเทรดผ่านหน้าจอหลัก
*   **Auto-Refresh System**: ระบบอัปเดตข้อมูลพอร์ตการลงทุน โพสิชันเปิด ประวัติ และสถิติเชิงลึกทุกๆ **5 วินาที** แบบอัตโนมัติ ไหลลื่นโดยไม่ต้องกดรีโหลดหน้าเว็บ

### 💬 4. ระบบผู้ช่วยอัจฉริยะส่วนตัว (Giant Slayer AI Assistant)
*   ระบบ **Chatbot Widget** สไตล์ลอยตัว (สามารถลากย้ายตำแหน่งได้อิสระบนหน้าจอ) เชื่อมโยงฐานข้อมูลพอร์ตการลงทุนและเชื่อม MT5 API สดๆ
*   คุณสามารถพิมพ์สอบถามเพื่อคุยกับบอทเรื่อง:
    *   *“พอร์ตของฉันตอนนี้มีเงินคงเหลือเท่าไหร่?”*
    *   *“ขอดูโพสิชันที่เปิดค้างอยู่หน่อย”*
    *   *“ราคาทองคำปัจจุบันบิด/อาร์สเท่าไหร่?”*
    *   *“ประวัติการเทรดล่าสุดชนะกี่ครั้ง?”*
    *   *“แนะนำการตั้งค่าบอทเทรดให้หน่อย”*

---

## 🛠️ เทคโนโลยีที่เลือกใช้ (Technology Stack)

### **หลังบ้าน (Backend)**
*   **Core Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python) สำหรับการประมวลผลความเร็วสูง
*   **Database Management**: SQLite ผ่าน [SQLAlchemy ORM](https://www.sqlalchemy.org/) (พร้อมระบบ Self-healing Database Migrations ยืดหยุ่นในตัว)
*   **Broker Connectivity**: [MetaTrader 5 Python Library](https://pypi.org/project/MetaTrader5/) (เชื่อมต่อการรับส่งออเดอร์ ส่งพารามิเตอร์ และประวัติการเทรดกับ Exness)
*   **Async Server**: [Uvicorn](https://www.uvicorn.org/)

### **หน้าบ้าน (Frontend)**
*   **Structure**: HTML5 & [React 18 JS](https://react.dev/) (รันผ่าน Babel In-browser Compiler แบบติดตั้งศูนย์วิจัย - Zero Install)
*   **Design & Styling**: Vanilla CSS เกรดพรีเมียม (Glassmorphic Dark Theme, Micro-animations, Harmonious Tailored Colors)
*   **Chart Engine**: [TradingView Lightweight Charts API](https://www.tradingview.com/lightweight-charts/) (ระบบวาดกราฟที่ดีที่สุด)

---

## 🚀 วิธีการติดตั้งและเริ่มรันระบบ (Installation & Setup)

### **ความต้องการก่อนการติดตั้ง (Prerequisites)**
1.  ใช้งานบนระบบปฏิบัติการ **Windows** เท่านั้น (เนื่องจากไลบรารี `MetaTrader5` ในไพธอนรันเฉพาะบน Windows)
2.  ติดตั้งโปรแกรมเทรด [MetaTrader 5 Client Terminal](https://www.metatrader5.com/en/download) และทำล็อกอินเข้าพอร์ต Exness ของคุณให้เรียบร้อยก่อนเปิดบอท
3.  เปิดโปรแกรมไพธอนเวอร์ชัน 3.8 - 3.11 ขึ้นไป

### **ขั้นตอนการรันโปรเจกต์**

1.  **โคลนโปรเจกต์และเข้าโฟลเดอร์หลัก**:
    ```bash
    cd c:\Users\warawut\traderMT5\traderMT5
    ```

2.  **ติดตั้งแพ็คเกจที่จำเป็น**:
    ```bash
    python -m pip install -r requirements.txt
    ```

3.  **ตั้งค่าบัญชี Exness ในไฟล์ `.env`**:
    สร้างไฟล์ `.env` ในโฟลเดอร์หลัก (Root Directory) และระบุข้อมูลพอร์ตของคุณ:
    ```env
    HOST=127.0.0.1
    PORT=8000
    MT5_LOGIN= account สำหรับเทรด
    MT5_PASSWORD=รหัสผ่านเทรดของคุณ
    MT5_SERVER= server สำหรับเทรด
    ```
    *หมายเหตุ: หากเว้นรหัสผ่านหรือล็อกอิน ระบบของบอทจะสลับเข้าสู่โหมดจำลองตลาด (Simulation Mode) ให้อัตโนมัติ เพื่อความปลอดภัยในการทดลองระบบ*

4.  **เริ่มต้นรันเซิร์ฟเวอร์**:
    ```bash
    python -m backend.main
    ```

5.  **เปิดใช้งานระบบ**:
    เปิดเบราว์เซอร์ไปที่ลิงก์ด้านล่างเพื่อพบกับระบบพรีเมียมแดชบอร์ด:
    👉 [**http://127.0.0.1:8000**](http://127.0.0.1:8000)

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Tree)

```text
traderMT5/
│
├── backend/                  # ระบบหลังบ้านประมวลผล
│   ├── config.py             # จัดการค่านำเข้าสภาพแวดล้อม (.env)
│   ├── database.py           # จัดการ SQLAlchemy Connection
│   ├── models.py             # โครงสร้างฐานข้อมูล SQLite
│   ├── mt5_manager.py        # MT5 APIs (ดึงกราฟ แท่งเทียน เปิด/ปิด ออเดอร์)
│   ├── pattern_detector.py   # อัลกอริทึมอินดิเคเตอร์ (SMC, Harmonic, Elliott Waves)
│   ├── trading_bot.py        # ลูปรันเนอร์ของบอท และ Professional Risk Management
│   ├── chatbot.py            # AI Chatbot Engine
│   └── main.py               # FastAPI Route Endpoints & DB Migrations
│
├── static/                   # หน้าบ้านพรีเมียมแดชบอร์ด
│   ├── css/
│   │   └── style.css         # ไฟล์สไตล์ Dark Glassmorphism หลัก
│   ├── js/
│   │   └── app.js            # แอพพลิเคชัน React 18 & ปฏิทินและกราฟ TradingView
│   └── index.html            # โครงสร้างหลักและ CDNs
│
├── trader.db                 # ฐานข้อมูลภายใน (จัดเก็บข้อมูลตั้งค่าบอทและประวัติ)
├── requirements.txt          # ไฮไลท์แพ็คเกจสำหรับการรัน
└── README.md                 # คู่มือแนะนำโครงการ
```

---

## ⚠️ ข้อแนะนำเพื่อความปลอดภัย (Risk Warning)
การซื้อขายผลิตภัณฑ์ในตลาดแลกเปลี่ยนเงินตราต่างประเทศและการเทรดทองคำมีความเสี่ยงสูง บอทระบบนี้มีวัตถุประสงค์เพื่ออำนวยความสะดวกในการวิเคราะห์และบริหารการเทรดด้วยสถิติตามเทคนิคทางวิศวกรรมการวิเคราะห์ตลาด (SMC) เท่านั้น ผู้ใช้งานควรทดลองรันบอทเทรดบนบัญชีทดลอง (Demo Account) ให้เข้าใจอย่างถ่องแท้ก่อนเชื่อมต่อการเทรดด้วยบัญชีเงินจริงของท่าน
