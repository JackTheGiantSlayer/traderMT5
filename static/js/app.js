const { useState, useEffect, useRef } = React;

// --- Built-in SVG Icon Component (Zero External Loaders Needed!) ---
const Icon = ({ name, className = "react-svg-icon", size = 18 }) => {
    const icons = {
        settings: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        refresh: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
        ),
        "trend-up": (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
        "trend-down": (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
            </svg>
        ),
        dollar: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        history: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2a10 10 0 0 0-10 10" />
            </svg>
        ),
        wallet: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" />
            </svg>
        ),
        shield: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        info: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
        plus: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        minus: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        lock: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        server: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
        ),
        check: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        alert: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        close: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
        trash: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
        ),
        edit: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
        message: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        send: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
        )
    };

    return icons[name] ? React.cloneElement(icons[name], { className, style: { stroke: 'currentColor', fill: 'none' } }) : null;
};

// --- App Main Component ---
const TradingApp = () => {
    // Assets & Selection
    const [watchlist, setWatchlist] = useState([]);
    const [activeSymbol, setActiveSymbol] = useState("XAUUSD");
    const [activeAsset, setActiveAsset] = useState({ symbol: "XAUUSD", name: "Gold Spot", asset_type: "gold" });
    const [timeframe, setTimeframe] = useState("H1");
    const [prices, setPrices] = useState({});

    // Live Trade execution options
    const [lotSize, setLotSize] = useState(0.01);
    const [takeProfit, setTakeProfit] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [isTrading, setIsTrading] = useState(false);

    // Account & Status
    const [account, setAccount] = useState({
        balance: 10000,
        equity: 10000,
        margin: 0,
        margin_free: 10000,
        profit: 0,
        margin_level: 0,
        currency: "USD",
        server: "Simulation-Mode",
        login: 9999999,
        is_demo: true
    });
    const [connectionStatus, setConnectionStatus] = useState({
        is_connected: false,
        is_simulated: true,
        login: null,
        server: null
    });

    // Terminal Tabs
    const [activeTab, setActiveTab] = useState("positions"); // 'positions' | 'history' | 'analytics' | 'bots'
    const [openPositions, setOpenPositions] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);

    // Trading Bots State
    const [bots, setBots] = useState([]);
    const [activeBot, setActiveBot] = useState(null);
    const [botLogs, setBotLogs] = useState([]);
    const [botFormOpen, setBotFormOpen] = useState(false);
    const [botForm, setBotForm] = useState({ name: "บอทเทรดทองคำ RSI", symbol: "XAUUSD", timeframe: "M1", algorithm: "rsi_oscillator", lot_size: 0.01, sl_points: 5.0, tp_points: 10.0, use_trend_filter: false, use_atr_sizing: false, risk_percent: 1.0, allowed_sessions: "all" });
    const [selectedAlgos, setSelectedAlgos] = useState(["rsi_oscillator"]);
    const [signalMode, setSignalMode] = useState("or");
    const [activeRunningBotsCount, setActiveRunningBotsCount] = useState(0);
    const [editingBotId, setEditingBotId] = useState(null);

    // Modal Control
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ login: "", password: "", server: "", auto_connect: false });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsAlert, setSettingsAlert] = useState(null); // { type: 'success'|'error', text: '' }

    // Chatbot States
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'bot',
            text: `สวัสดีครับ! ผมคือ **Giant Slayer AI Assistant** ผู้ช่วยเทรดอัจฉริยะส่วนตัวของคุณ 🤖📊\n\nผมสามารถช่วยเหลือคุณดึงข้อมูลแบบเรียลไทม์จาก Exness/MT5 และระบบบอทเทรดได้ครับ โดยคุณสามารถพิมพ์สอบถามผม หรือคลิกที่ตัวเลือกด่วนด้านล่างได้เลยครับ!`,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [botIsTyping, setBotIsTyping] = useState(false);

    // Dragging state for Chatbot Widget
    const [chatbotPosition, setChatbotPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const chatbotDragRef = useRef({ isDragging: false, startX: 0, startY: 0, posX: 0, posY: 0, moved: false });

    // Initialize position to bottom-right and keep it responsive on resize
    useEffect(() => {
        const initializePosition = () => {
            setChatbotPosition({
                x: window.innerWidth - 80,
                y: window.innerHeight - 80
            });
        };
        // Run once after component mount
        initializePosition();
        window.addEventListener('resize', initializePosition);
        return () => window.removeEventListener('resize', initializePosition);
    }, []);

    const handleChatbotDragStart = (e) => {
        // Only allow left-clicks or touch events
        if (e.button !== undefined && e.button !== 0) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        chatbotDragRef.current = {
            isDragging: true,
            startX: clientX,
            startY: clientY,
            posX: chatbotPosition.x,
            posY: chatbotPosition.y,
            moved: false
        };

        document.addEventListener('mousemove', handleChatbotDragging);
        document.addEventListener('mouseup', handleChatbotDragEnd);
        document.addEventListener('touchmove', handleChatbotDragging, { passive: false });
        document.addEventListener('touchend', handleChatbotDragEnd);
    };

    const handleChatbotDragging = (e) => {
        if (!chatbotDragRef.current.isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const dx = clientX - chatbotDragRef.current.startX;
        const dy = clientY - chatbotDragRef.current.startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            chatbotDragRef.current.moved = true;
        }

        // Bound movement inside the window viewport (keep trigger on screen)
        const nextX = Math.min(window.innerWidth - 70, Math.max(10, chatbotDragRef.current.posX + dx));
        const nextY = Math.min(window.innerHeight - 70, Math.max(10, chatbotDragRef.current.posY + dy));

        setChatbotPosition({ x: nextX, y: nextY });

        if (e.cancelable) {
            e.preventDefault();
        }
    };

    const handleChatbotDragEnd = () => {
        chatbotDragRef.current.isDragging = false;
        document.removeEventListener('mousemove', handleChatbotDragging);
        document.removeEventListener('mouseup', handleChatbotDragEnd);
        document.removeEventListener('touchmove', handleChatbotDragging);
        document.removeEventListener('touchend', handleChatbotDragEnd);
    };

    const handleChatbotTriggerClick = (e) => {
        // If dragged, prevent toggling open/close state
        if (chatbotDragRef.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        setChatbotOpen(prev => !prev);
    };

    // Chart Ref & Objects
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const swingSeriesRef = useRef(null);
    const chatbotEndRef = useRef(null);
    const watchlistRef = useRef([]);

    // Keep watchlistRef in sync with watchlist state
    useEffect(() => {
        watchlistRef.current = watchlist;
    }, [watchlist]);

    // Chatbot Auto scroll effect
    useEffect(() => {
        if (chatbotEndRef.current) {
            chatbotEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, botIsTyping, chatbotOpen]);

    // Initial Load & Polling Setup
    useEffect(() => {
        fetchWatchlist();
        fetchStatus();
        fetchAccount();
        fetchPositions();
        fetchHistory();
        fetchBots();

        // 1-second interval for prices & dynamic ticks
        const priceInterval = setInterval(() => {
            fetchPrices();
        }, 1000);

        // 5-second interval for account metrics, open positions, trade history, and bots
        const accountInterval = setInterval(() => {
            fetchAccount();
            fetchPositions();
            fetchHistory();
            fetchBots();
        }, 5000);

        return () => {
            clearInterval(priceInterval);
            clearInterval(accountInterval);
        };
    }, []);

    // Fetch active bot logs polling loop
    useEffect(() => {
        if (activeBot) {
            fetchBotLogs(activeBot.id);
            const logInterval = setInterval(() => {
                fetchBotLogs(activeBot.id);
            }, 3000);
            return () => clearInterval(logInterval);
        }
    }, [activeBot]);

    // Load prices loop helper
    const fetchPrices = async () => {
        try {
            // Get symbol prices
            const currentWatchlist = watchlistRef.current;
            if (currentWatchlist.length === 0) return;
            const updatedPrices = {};
            
            for (const item of currentWatchlist) {
                const res = await fetch(`/api/mt5/candles?symbol=${item.symbol}&timeframe=D1&count=2`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const lastCandle = data[data.length - 1];
                        const prevCandle = data[data.length - 2] || lastCandle;
                        
                        const changePct = ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100;
                        
                        updatedPrices[item.symbol] = {
                            bid: lastCandle.close,
                            ask: lastCandle.close + (item.symbol === "XAUUSD" ? 0.45 : item.symbol === "EURUSD" ? 0.00015 : item.symbol === "BTCUSD" ? 25.0 : 0.15),
                            change: changePct.toFixed(2)
                        };
                    }
                }
            }
            setPrices(prevPrices => ({
                ...prevPrices,
                ...updatedPrices
            }));
        } catch (err) {
            console.error("Error fetching prices:", err);
        }
    };

    // Build/Init TradingView Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Clean up older chart if exists
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        // Initialize Lightweight Chart
        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            layout: {
                background: { type: LightweightCharts.ColorType.Solid, color: '#0c1220' },
                textColor: '#94a3b8',
                fontSize: 11,
                fontFamily: 'Inter',
            },
            grid: {
                vertLines: { color: 'rgba(38, 50, 80, 0.2)' },
                horzLines: { color: 'rgba(38, 50, 80, 0.2)' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    color: '#ffb703',
                    width: 1,
                    style: 2, // dashed
                },
                horzLine: {
                    color: '#ffb703',
                    width: 1,
                    style: 2,
                }
            },
            rightPriceScale: {
                borderColor: 'rgba(38, 50, 80, 0.4)',
                textColor: '#94a3b8',
            },
            timeScale: {
                borderColor: 'rgba(38, 50, 80, 0.4)',
                timeVisible: true,
                secondsVisible: false,
            },
            localization: {
                locale: 'th-TH',
            }
        });

        // Create candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#2ecc71',
            downColor: '#e74c3c',
            borderUpColor: '#2ecc71',
            borderDownColor: '#e74c3c',
            wickUpColor: '#2ecc71',
            wickDownColor: '#e74c3c',
        });

        // Create ZigZag swing line series
        const swingSeries = chart.addLineSeries({
            color: 'rgba(255, 183, 3, 0.45)', // beautiful glowing translucent gold
            lineWidth: 2,
            lineType: 0,
            lineStyle: 2, // dashed line
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        swingSeriesRef.current = swingSeries;

        // Fetch candle history for active symbol & timeframe
        loadChartData(activeSymbol, timeframe);
        loadPatterns(activeSymbol, timeframe);

        // Responsive resize
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [activeSymbol, timeframe]);

    // Live Candle update pooling
    useEffect(() => {
        const updateLastCandle = async () => {
            if (!candlestickSeriesRef.current) return;
            try {
                // Fetch the latest candle for the active chart asset
                const res = await fetch(`/api/mt5/candles?symbol=${activeSymbol}&timeframe=${timeframe}&count=1`);
                if (res.ok) {
                    const candles = await res.json();
                    if (candles && candles.length > 0) {
                        const candle = candles[0];
                        candlestickSeriesRef.current.update({
                            time: candle.time,
                            open: candle.open,
                            high: candle.high,
                            low: candle.low,
                            close: candle.close
                        });
                    }
                }
            } catch (err) {
                console.error("Error updating live candle:", err);
            }
        };

        const liveUpdateInterval = setInterval(updateLastCandle, 1000);
        return () => clearInterval(liveUpdateInterval);
    }, [activeSymbol, timeframe]);

    // Live patterns and ZigZag line update pooling
    useEffect(() => {
        loadPatterns(activeSymbol, timeframe);
        const patternsInterval = setInterval(() => {
            loadPatterns(activeSymbol, timeframe);
        }, 5000);
        return () => clearInterval(patternsInterval);
    }, [activeSymbol, timeframe]);

    // Load historical candles
    const loadChartData = async (symbol, tf) => {
        try {
            const res = await fetch(`/api/mt5/candles?symbol=${symbol}&timeframe=${tf}&count=200`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0 && candlestickSeriesRef.current) {
                    candlestickSeriesRef.current.setData(data);
                    chartRef.current.timeScale().fitContent();
                }
            }
        } catch (err) {
            console.error("Failed to load chart data:", err);
        }
    };

    // Load patterns and swing ZigZag lines
    const loadPatterns = async (symbol, tf) => {
        try {
            const res = await fetch(`/api/mt5/patterns?symbol=${symbol}&timeframe=${tf}&count=200`);
            if (res.ok) {
                const data = await res.json();
                
                // 1. Draw ZigZag Line if we have swings
                if (data.swings && data.swings.length > 0 && swingSeriesRef.current) {
                    const lineData = data.swings.map(s => ({
                        time: s.time,
                        value: s.price
                    }));
                    // Sort line data by time to avoid Lightweight Charts draw error
                    lineData.sort((a, b) => a.time - b.time);
                    swingSeriesRef.current.setData(lineData);
                } else if (swingSeriesRef.current) {
                    swingSeriesRef.current.setData([]);
                }
                
                // 2. Add Markers for Elliott Wave, Harmonic, and Swings
                if (candlestickSeriesRef.current) {
                    const markers = [];
                    
                    // Add standard swing peaks and troughs markers (subtle pins/circles)
                    if (data.swings) {
                        data.swings.forEach(s => {
                            markers.push({
                                time: s.time,
                                position: s.type === 'high' ? 'aboveBar' : 'belowBar',
                                color: s.type === 'high' ? '#e74c3c' : '#2ecc71',
                                shape: 'circle',
                                size: 0.5,
                                text: '' // Just draw small circles at swing points
                            });
                        });
                    }
                    
                    // Add Harmonic Pattern coordinates and big reversal marker
                    if (data.harmonic && data.harmonic.points) {
                        const pts = data.harmonic.points;
                        const labels = ['X', 'A', 'B', 'C', 'D'];
                        pts.forEach((pt, idx) => {
                            markers.push({
                                time: pt.time,
                                position: pt.type === 'high' ? 'aboveBar' : 'belowBar',
                                color: '#ffb703', // vibrant gold
                                shape: idx === 4 ? 'pin' : 'square',
                                text: labels[idx]
                            });
                        });
                        
                        // Big action indicator at point D
                        const D = pts[4];
                        markers.push({
                            time: D.time,
                            position: D.type === 'high' ? 'aboveBar' : 'belowBar',
                            color: data.harmonic.signal === 'buy' ? '#2ecc71' : '#e74c3c',
                            shape: data.harmonic.signal === 'buy' ? 'arrowUp' : 'arrowDown',
                            text: `🎯 ${data.harmonic.pattern} (${data.harmonic.signal.toUpperCase()})`
                        });
                    }
                    
                    // Add Elliott Wave counts and signal markers
                    if (data.elliott && data.elliott.points) {
                        const pts = data.elliott.points;
                        pts.forEach((pt, idx) => {
                            markers.push({
                                time: pt.time,
                                position: pt.type === 'high' ? 'aboveBar' : 'belowBar',
                                color: '#00b4d8', // bright wave blue
                                shape: 'circle',
                                text: `${idx}`
                            });
                        });
                        
                        // Big wave action indicator at completion point
                        const lastPt = pts[pts.length - 1];
                        markers.push({
                            time: lastPt.time,
                            position: lastPt.type === 'high' ? 'aboveBar' : 'belowBar',
                            color: data.elliott.signal === 'buy' ? '#2ecc71' : '#e74c3c',
                            shape: data.elliott.signal === 'buy' ? 'arrowUp' : 'arrowDown',
                            text: `🌊 ${data.elliott.pattern} (${data.elliott.signal.toUpperCase()})`
                        });
                    }
                    
                    // Sort markers by time to avoid render errors
                    markers.sort((a, b) => a.time - b.time);
                    
                    // Set markers on the candlestick series
                    candlestickSeriesRef.current.setMarkers(markers);
                }
            }
        } catch (err) {
            console.error("Failed to load pattern data:", err);
        }
    };

    // --- API Interactions ---

    const fetchWatchlist = async () => {
        try {
            const res = await fetch("/api/watchlist");
            if (res.ok) {
                const data = await res.json();
                setWatchlist(data);
                if (data.length > 0) {
                    // Find active symbol name
                    const active = data.find(i => i.symbol === activeSymbol) || data[0];
                    setActiveSymbol(active.symbol);
                    setActiveAsset(active);
                }
            }
        } catch (err) {
            console.error("Error fetching watchlist:", err);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/mt5/status");
            if (res.ok) {
                const data = await res.json();
                setConnectionStatus(data);
                if (data.is_connected) {
                    setSettingsForm(prev => ({
                        ...prev,
                        login: data.login || "",
                        server: data.server || ""
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching connection status:", err);
        }
    };

    const fetchAccount = async () => {
        try {
            const res = await fetch("/api/mt5/account");
            if (res.ok) {
                const data = await res.json();
                setAccount(data);
            }
        } catch (err) {
            console.error("Error fetching account info:", err);
        }
    };

    const fetchPositions = async () => {
        try {
            const res = await fetch("/api/mt5/positions");
            if (res.ok) {
                const data = await res.json();
                setOpenPositions(data);
            }
        } catch (err) {
            console.error("Error fetching open positions:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/mt5/history");
            if (res.ok) {
                const data = await res.json();
                setTradeHistory(data);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const fetchBots = async () => {
        try {
            const res = await fetch("/api/bots");
            if (res.ok) {
                const data = await res.json();
                setBots(data);
                
                // Calculate running bots count
                const running = data.filter(b => b.is_running).length;
                setActiveRunningBotsCount(running);

                // Auto select first bot if none selected
                if (data.length > 0 && !activeBot) {
                    setActiveBot(data[0]);
                }
            }
        } catch (err) {
            console.error("Error fetching bots:", err);
        }
    };

    const fetchBotLogs = async (botId) => {
        try {
            const res = await fetch(`/api/bots/${botId}/logs`);
            if (res.ok) {
                const data = await res.json();
                setBotLogs(data);
            }
        } catch (err) {
            console.error("Error fetching bot logs:", err);
        }
    };

    const handleEditBotInit = (bot) => {
        setEditingBotId(bot.id);
        setBotForm({
            name: bot.name,
            symbol: bot.symbol,
            timeframe: bot.timeframe,
            algorithm: bot.algorithms || bot.algorithm || "",
            lot_size: bot.lot_size,
            sl_points: bot.sl_points,
            tp_points: bot.tp_points,
            use_trend_filter: bot.use_trend_filter || false,
            use_atr_sizing: bot.use_atr_sizing || false,
            risk_percent: bot.risk_percent || 1.0,
            allowed_sessions: bot.allowed_sessions || "all"
        });
        setSelectedAlgos((bot.algorithms || bot.algorithm || "").split(",").map(a => a.trim()).filter(Boolean));
        setSignalMode(bot.signal_mode || "or");
        setBotFormOpen(true);
    };

    const handleSubmitBotForm = async (e) => {
        e.preventDefault();
        try {
            const url = editingBotId ? `/api/bots/${editingBotId}` : "/api/bots";
            const method = editingBotId ? "PUT" : "POST";
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: botForm.name,
                    symbol: botForm.symbol,
                    timeframe: botForm.timeframe,
                    algorithm: selectedAlgos.join(","),
                    lot_size: parseFloat(botForm.lot_size),
                    sl_points: parseFloat(botForm.sl_points) || 0.0,
                    tp_points: parseFloat(botForm.tp_points) || 0.0,
                    signal_mode: signalMode,
                    use_trend_filter: botForm.use_trend_filter || false,
                    use_atr_sizing: botForm.use_atr_sizing || false,
                    risk_percent: parseFloat(botForm.risk_percent) || 1.0,
                    allowed_sessions: botForm.allowed_sessions || "all"
                })
            });
            if (res.ok) {
                setBotFormOpen(false);
                setEditingBotId(null);
                fetchBots();
            } else {
                let errMsg = "Unknown error";
                try {
                    const err = await res.json();
                    errMsg = err.detail || err.message || JSON.stringify(err);
                } catch (_) {
                    try {
                        errMsg = await res.text();
                    } catch (__) {}
                }
                alert(`ล้มเหลวในการบันทึกบอท: ${errMsg}`);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleToggleBot = async (botId) => {
        try {
            const res = await fetch(`/api/bots/${botId}/toggle`, {
                method: "PUT"
            });
            if (res.ok) {
                const updated = await res.json();
                fetchBots();
                if (activeBot && activeBot.id === botId) {
                    setActiveBot(updated);
                    fetchBotLogs(botId);
                }
            }
        } catch (err) {
            console.error("Error toggling bot status:", err);
        }
    };

    const handleDeleteBot = async (botId, e) => {
        e.stopPropagation();
        if (!confirm("คุณต้องการลบบอทเทรดนี้ออกจากระบบใช่หรือไม่? ประวัติบันทึกการทำงานทั้งหมดของบอทนี้จะถูกลบไปด้วย")) return;
        try {
            const res = await fetch(`/api/bots/${botId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                if (activeBot && activeBot.id === botId) {
                    setActiveBot(null);
                    setBotLogs([]);
                }
                fetchBots();
            }
        } catch (err) {
            console.error("Error deleting bot:", err);
        }
    };

    // Handle Buy or Sell execution
    const handleExecuteTrade = async (action) => {
        setIsTrading(true);
        try {
            const res = await fetch("/api/mt5/trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: activeSymbol,
                    action: action,
                    volume: parseFloat(lotSize),
                    sl: parseFloat(stopLoss) || 0.0,
                    tp: parseFloat(takeProfit) || 0.0
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Clear order form SL/TP
                setTakeProfit("");
                setStopLoss("");
                
                // Refresh data
                fetchAccount();
                fetchPositions();
                
                // Display success log
                console.log(`Position opened successfully: ${action.toUpperCase()} ${lotSize} lot ${activeSymbol}`);
            } else {
                alert(`ล้มเหลวในการส่งออเดอร์: ${data.detail}`);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาดในการซื้อขาย: ${err.message}`);
        } finally {
            setIsTrading(false);
        }
    };

    // Close active trade position
    const handleClosePosition = async (ticket) => {
        try {
            const res = await fetch(`/api/mt5/close-position/${ticket}`, {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                fetchAccount();
                fetchPositions();
                fetchHistory();
            } else {
                alert(`ล้มเหลวในการปิดออเดอร์: ${data.detail}`);
            }
        } catch (err) {
            console.error("Error closing position:", err);
        }
    };

    // Settings Modal MT5 Connection Login
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setSettingsLoading(true);
        setSettingsAlert(null);

        try {
            const res = await fetch("/api/mt5/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: parseInt(settingsForm.login),
                    password: settingsForm.password,
                    server: settingsForm.server,
                    auto_connect: settingsForm.auto_connect
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSettingsAlert({ type: "success", text: "เชื่อมต่อบัญชี Exness สำเร็จแล้ว!" });
                fetchStatus();
                fetchAccount();
                fetchPositions();
                setTimeout(() => {
                    setSettingsOpen(false);
                    setSettingsAlert(null);
                }, 2000);
            } else {
                setSettingsAlert({ type: "error", text: `การเชื่อมต่อผิดพลาด: ${data.detail}` });
            }
        } catch (err) {
            setSettingsAlert({ type: "error", text: `เกิดข้อผิดพลาดในการส่งข้อมูล: ${err.message}` });
        } finally {
            setSettingsLoading(false);
        }
    };

    // Disconnect Exness live and back to simulation mode
    const handleDisconnectLive = async () => {
        if (!confirm("คุณต้องการยกเลิกการเชื่อมบัญชี Exness และกลับเข้าสู่โหมดจำลอง (Simulation Mode) ใช่หรือไม่?")) return;
        try {
            const res = await fetch("/api/mt5/disconnect", { method: "POST" });
            if (res.ok) {
                fetchStatus();
                fetchAccount();
                fetchPositions();
                fetchHistory();
                setSettingsOpen(false);
            }
        } catch (err) {
            console.error("Disconnect error:", err);
        }
    };

    // --- Chatbot Handlers ---
    const handleSendMessage = async (text) => {
        const queryText = text || inputMessage;
        if (!queryText.trim()) return;

        // Append User Message
        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: queryText,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        
        if (!text) {
            setInputMessage("");
        }

        setBotIsTyping(true);

        try {
            const res = await fetch("/api/chatbot/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: queryText })
            });

            if (res.ok) {
                const data = await res.json();
                const botMsg = {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: data.response || "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลคำตอบ",
                    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                const botMsg = {
                    id: `bot-err-${Date.now()}`,
                    sender: 'bot',
                    text: "🤖 *ขออภัยครับ ไม่สามารถติดต่อเซิร์ฟเวอร์แชทบอทได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง*",
                    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (err) {
            console.error("Chatbot query error:", err);
            const botMsg = {
                id: `bot-err-${Date.now()}`,
                sender: 'bot',
                text: `🤖 *ขออภัยครับ เกิดข้อผิดพลาดในการส่งข้อมูล: ${err.message}*`,
                timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setBotIsTyping(false);
        }
    };

    const clearChat = () => {
        if (!confirm("คุณต้องการล้างประวัติการสนทนาทั้งหมดใช่หรือไม่?")) return;
        setMessages([
            {
                id: 'welcome',
                sender: 'bot',
                text: `สวัสดีครับ! ผมคือ **Giant Slayer AI Assistant** ผู้ช่วยเทรดอัจฉริยะส่วนตัวของคุณ 🤖📊\n\nผมสามารถช่วยเหลือคุณดึงข้อมูลแบบเรียลไทม์จาก Exness/MT5 และระบบบอทเทรดได้ครับ โดยคุณสามารถพิมพ์สอบถามผม หรือคลิกที่ตัวเลือกด่วนด้านล่างได้เลยครับ!`,
                timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const renderMessageContent = (text) => {
        if (!text) return null;
        const lines = text.split("\n");
        const rendered = [];
        let currentList = [];

        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("* ");
            
            let escapedLine = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            let html = escapedLine
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/`(.*?)`/g, "<code>$1</code>");

            if (isBullet) {
                const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "");
                let bulletHtml = bulletContent
                    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/`(.*?)`/g, "<code>$1</code>");
                    
                currentList.push(<li key={`li-${idx}`} dangerouslySetInnerHTML={{ __html: bulletHtml }} style={{ marginBottom: '4px' }} />);
            } else {
                if (currentList.length > 0) {
                    rendered.push(<ul key={`ul-${idx}`} style={{ marginLeft: '20px', marginBottom: '8px', listStyleType: 'disc' }}>{currentList}</ul>);
                    currentList = [];
                }
                if (trimmed !== "") {
                    rendered.push(<p key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: html }} style={{ marginBottom: '8px' }} />);
                }
            }
        });

        if (currentList.length > 0) {
            rendered.push(<ul key="ul-end" style={{ marginLeft: '20px', marginBottom: '8px', listStyleType: 'disc' }}>{currentList}</ul>);
        }

        return rendered;
    };

    // Helpers to handle lot sizing
    const adjustLotSize = (val) => {
        const current = parseFloat(lotSize);
        const next = Math.max(0.01, Math.min(50.0, current + val));
        setLotSize(parseFloat(next.toFixed(2)));
    };

    // --- On-the-fly Analytics calculations ---
    const calculateAnalytics = () => {
        if (tradeHistory.length === 0) {
            return { totalProfit: 0, winRate: 0, winCount: 0, loseCount: 0, totalTrades: 0, best: 0, worst: 0, botStats: [] };
        }

        let total = 0.0;
        let wins = 0;
        let best = -999999.0;
        let worst = 999999.0;
        
        // Group by bot
        const botGroups = {};

        for (const t of tradeHistory) {
            total += t.profit;
            if (t.profit > 0) wins++;
            if (t.profit > best) best = t.profit;
            if (t.profit < worst) worst = t.profit;
            
            // Clean strategy suffix
            const cleanComment = t.comment ? t.comment.replace(/\s*\[.*?\]$/, '') : '';
            const sourceName = cleanComment ? (cleanComment === 'Manual' || cleanComment === 'Simulation' || cleanComment === 'Exness Real Close' || cleanComment === 'Close via Antigravity MT5' ? 'เทรดเอง (Manual)' : cleanComment) : 'เทรดเอง (Manual)';
            
            if (!botGroups[sourceName]) {
                botGroups[sourceName] = { name: sourceName, totalTrades: 0, winCount: 0, loseCount: 0, totalProfit: 0.0 };
            }
            
            botGroups[sourceName].totalTrades += 1;
            botGroups[sourceName].totalProfit += t.profit;
            if (t.profit > 0) {
                botGroups[sourceName].winCount += 1;
            } else {
                botGroups[sourceName].loseCount += 1;
            }
        }

        const winRate = (wins / tradeHistory.length) * 100;
        
        const botStats = Object.values(botGroups).map(bot => {
            const botWinRate = bot.totalTrades > 0 ? (bot.winCount / bot.totalTrades * 100).toFixed(1) : '0.0';
            return {
                ...bot,
                winRate: botWinRate,
                totalProfit: bot.totalProfit.toFixed(2)
            };
        }).sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit));

        return {
            totalProfit: total.toFixed(2),
            winRate: winRate.toFixed(1),
            winCount: wins,
            loseCount: tradeHistory.length - wins,
            totalTrades: tradeHistory.length,
            best: best.toFixed(2),
            worst: worst.toFixed(2),
            botStats: botStats
        };
    };

    const analytics = calculateAnalytics();
    const currentPriceInfo = prices[activeSymbol] || { bid: 0.0, ask: 0.0, change: "0.00" };

    return (
        <div className="app-container">
            {/* --- HEADER --- */}
            <header>
                <div className="brand-section">
                    <div className="brand-logo">G</div>
                    <div>
                        <h1 className="brand-title">GIANT SLAYER</h1>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>MT5 EXNESS TRADING PRO</span>
                    </div>
                </div>

                {/* Live values metrics */}
                <div className="account-bar">
                    <div className="account-metric">
                        <span className="metric-label">Balance</span>
                        <span className="metric-value" style={{ fontFamily: 'monospace' }}>
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Equity</span>
                        <span className="metric-value" style={{ fontFamily: 'monospace' }}>
                            ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Used Margin</span>
                        <span className="metric-value" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            ${account.margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Floating Profit</span>
                        <span className={`metric-value ${account.profit >= 0 ? 'pnl-positive' : 'pnl-negative'}`} style={{ fontFamily: 'monospace' }}>
                            {account.profit >= 0 ? '+' : ''}${account.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Connection indicator */}
                    <div 
                        className={`connection-pill ${connectionStatus.is_simulated ? 'simulated' : 'connected'}`}
                        onClick={() => setSettingsOpen(true)}
                    >
                        <div className="pulse-dot"></div>
                        <span>{connectionStatus.is_simulated ? 'SIMULATION MODE' : `LIVE: ${connectionStatus.login}`}</span>
                    </div>

                    <button className="settings-trigger" onClick={() => setSettingsOpen(true)}>
                        <Icon name="settings" size={18} />
                    </button>
                </div>
            </header>

            {/* --- MAIN WORK GRID --- */}
            <div className="main-dashboard">
                {/* 1. Left Watchlist */}
                <div className="watchlist-sidebar">
                    <div className="sidebar-header">
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ตลาดซื้อขาย (Markets)</h3>
                        <Icon name="trend-up" size={16} style={{ color: 'var(--accent-gold)' }} />
                    </div>
                    
                    <div className="watchlist-items">
                        {watchlist.map((item) => {
                            const pr = prices[item.symbol] || { bid: 0.0, ask: 0.0, change: "0.00" };
                            const changeColor = parseFloat(pr.change) >= 0 ? "price-up" : "price-down";
                            return (
                                <div 
                                    key={item.symbol} 
                                    className={`watchlist-item ${activeSymbol === item.symbol ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSymbol(item.symbol);
                                        setActiveAsset(item);
                                    }}
                                >
                                    <div className="asset-details">
                                        <span className="asset-symbol">{item.symbol}</span>
                                        <span className="asset-name">{item.name}</span>
                                    </div>
                                    <div className="asset-price-box">
                                        <span className={`asset-price ${changeColor}`}>
                                            {pr.bid > 0 ? pr.bid.toLocaleString('en-US', { minimumFractionDigits: item.symbol === "EURUSD" ? 5 : 2 }) : '...'}
                                        </span>
                                        <span className={`asset-change ${changeColor}`}>
                                            {parseFloat(pr.change) >= 0 ? '+' : ''}{pr.change}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Middle (Chart & Terminal) */}
                <div className="center-content">
                    {/* Top Chart Box */}
                    <div className="chart-container-box">
                        <div className="chart-toolbar">
                            <div className="toolbar-left">
                                <div className="active-symbol-info">
                                    <span className="active-symbol-title">{activeAsset.symbol}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeAsset.name}</span>
                                </div>
                            </div>
                            
                            <div className="timeframe-selector">
                                {["M1", "M5", "M15", "M30", "H1", "D1"].map((tf) => (
                                    <button 
                                        key={tf} 
                                        className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                                        onClick={() => setTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Render Target */}
                        <div className="chart-wrapper" ref={chartContainerRef}>
                            <div className="chart-watermark">GIANT SLAYER</div>
                        </div>
                    </div>

                    {/* Bottom Terminal (Positions & History) */}
                    <div className="terminal-tabs-box">
                        <div className="terminal-header-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('positions')}
                            >
                                <Icon name="wallet" size={14} />
                                <span>โพสิชันที่เปิด ({openPositions.length})</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <Icon name="history" size={14} />
                                <span>ประวัติการเทรด ({tradeHistory.length})</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                <Icon name="trend-up" size={14} />
                                <span>การวิเคราะห์เชิงลึก (Analytics)</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'bots' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bots')}
                                style={{ position: 'relative' }}
                            >
                                <Icon name="settings" size={14} style={{ color: activeRunningBotsCount > 0 ? 'var(--bull-green)' : 'inherit' }} />
                                <span>ระบบบอทเทรด ({bots.length})</span>
                                {activeRunningBotsCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--bull-green)',
                                        boxShadow: 'var(--glow-green)'
                                    }}></span>
                                )}
                            </button>
                        </div>

                        <div className="terminal-content">
                            {/* Open Positions Tab Content */}
                            {activeTab === 'positions' && (
                                openPositions.length === 0 ? (
                                    <div className="empty-terminal-state">
                                        <Icon name="info" size={32} />
                                        <p>ไม่มีโพสิชันการเทรดที่เปิดทำงานอยู่ในขณะนี้</p>
                                    </div>
                                ) : (
                                    <table className="trading-table">
                                        <thead>
                                            <tr>
                                                <th>Ticket</th>
                                                <th>ที่มา (Source)</th>
                                                <th>เวลาเปิด</th>
                                                <th>สินทรัพย์</th>
                                                <th>ประเภท</th>
                                                <th>ขนาด (Lot)</th>
                                                <th>ราคาเปิด</th>
                                                <th>ราคาปัจจุบัน</th>
                                                <th>Stop Loss (SL)</th>
                                                <th>Take Profit (TP)</th>
                                                <th>กำไร/ขาดทุน (USD)</th>
                                                <th>การจัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {openPositions.map((pos) => (
                                                <tr key={pos.ticket}>
                                                    <td style={{ fontFamily: 'monospace' }}>#{pos.ticket}</td>
                                                    <td style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '11px',
                                                        color: (!pos.bot_name || pos.bot_name === 'เทรดเอง (Manual)' || pos.bot_name === 'Manual' || pos.bot_name === 'Simulation') ? 'var(--text-muted)' : 'var(--accent-gold)'
                                                    }}>
                                                        {pos.bot_name || 'เทรดเอง (Manual)'}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{pos.time}</td>
                                                    <td style={{ fontWeight: 700 }}>{pos.symbol}</td>
                                                    <td>
                                                        <span className={pos.type === 'buy' ? 'buy-badge' : 'sell-badge'}>
                                                            {pos.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontFamily: 'monospace' }}>{pos.volume}</td>
                                                    <td style={{ fontFamily: 'monospace' }}>{pos.open_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{pos.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ fontFamily: 'monospace', color: pos.sl > 0 ? 'var(--bear-red)' : 'var(--text-muted)' }}>{pos.sl > 0 ? pos.sl.toFixed(2) : '-'}</td>
                                                    <td style={{ fontFamily: 'monospace', color: pos.tp > 0 ? 'var(--bull-green)' : 'var(--text-muted)' }}>{pos.tp > 0 ? pos.tp.toFixed(2) : '-'}</td>
                                                    <td 
                                                        className={pos.profit >= 0 ? 'price-up' : 'price-down'}
                                                        style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}
                                                    >
                                                        {pos.profit >= 0 ? '+' : ''}${pos.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn-close-position"
                                                            onClick={() => handleClosePosition(pos.ticket)}
                                                        >
                                                            ปิดออเดอร์
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}

                            {/* Trade History Tab Content */}
                            {activeTab === 'history' && (
                                tradeHistory.length === 0 ? (
                                    <div className="empty-terminal-state">
                                        <Icon name="history" size={32} />
                                        <p>ไม่พบประวัติธุรกรรมการซื้อขายที่ปิดไปแล้ว</p>
                                    </div>
                                ) : (
                                    <table className="trading-table">
                                        <thead>
                                            <tr>
                                                <th>Ticket</th>
                                                <th>ที่มา (Source)</th>
                                                <th>เวลาเปิด</th>
                                                <th>เวลาปิด</th>
                                                <th>สินทรัพย์</th>
                                                <th>ประเภท</th>
                                                <th>ขนาด (Lot)</th>
                                                <th>ราคาเปิด</th>
                                                <th>ราคาปิด</th>
                                                <th>กำไร/ขาดทุน (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tradeHistory.map((t, idx) => {
                                                const isManual = !t.comment || t.comment === 'Manual' || t.comment === 'เทรดเอง (Manual)' || t.comment === 'Exness Real Close' || t.comment === 'Simulation' || t.comment === 'Close via Antigravity MT5';
                                                const cleanComment = t.comment ? t.comment.replace(/\s*\[.*?\]$/, '') : '';
                                                const sourceName = cleanComment ? (cleanComment === 'Manual' || cleanComment === 'Simulation' || cleanComment === 'Exness Real Close' || cleanComment === 'Close via Antigravity MT5' ? 'เทรดเอง (Manual)' : cleanComment) : 'เทรดเอง (Manual)';
                                                
                                                return (
                                                    <tr key={`${t.ticket}-${idx}`}>
                                                        <td style={{ fontFamily: 'monospace' }}>#{t.ticket}</td>
                                                        <td style={{ 
                                                            fontWeight: 600, 
                                                            fontSize: '11px',
                                                            color: isManual ? 'var(--text-muted)' : 'var(--accent-gold)'
                                                        }}>
                                                            {sourceName}
                                                        </td>
                                                        <td style={{ color: 'var(--text-muted)' }}>{t.open_time}</td>
                                                        <td style={{ color: 'var(--text-secondary)' }}>{t.close_time}</td>
                                                        <td style={{ fontWeight: 700 }}>{t.symbol}</td>
                                                        <td>
                                                            <span className={t.type === 'buy' ? 'buy-badge' : 'sell-badge'}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontFamily: 'monospace' }}>{t.volume}</td>
                                                        <td style={{ fontFamily: 'monospace' }}>{t.open_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ fontFamily: 'monospace' }}>{t.close_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td 
                                                            className={t.profit >= 0 ? 'price-up' : 'price-down'}
                                                            style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}
                                                        >
                                                            {t.profit >= 0 ? '+' : ''}${t.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )
                            )}

                            {/* Analytics Tab Content */}
                            {activeTab === 'analytics' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px' }}>
                                    {/* Top Summary Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>ยอดกำไรรวมสะสม</span>
                                            <h4 className={parseFloat(analytics.totalProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                {parseFloat(analytics.totalProfit) >= 0 ? '+' : ''}${analytics.totalProfit}
                                            </h4>
                                        </div>
                                        
                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>อัตราการชนะ (Win Rate)</span>
                                            <h4 style={{ fontSize: '24px', marginTop: '6px', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                                                {analytics.winRate}%
                                            </h4>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                ชนะ {analytics.winCount} | แพ้ {analytics.loseCount} จากทั้งหมด {analytics.totalTrades} ออเดอร์
                                            </span>
                                        </div>

                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>กำไรต่อออเดอร์สูงสุด</span>
                                            <h4 className="price-up" style={{ fontSize: '22px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                +${analytics.best}
                                            </h4>
                                        </div>

                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>ขาดทุนต่อออเดอร์สูงสุด</span>
                                            <h4 className="price-down" style={{ fontSize: '22px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                ${analytics.worst}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Bot breakdown metrics */}
                                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: 'var(--text-secondary)' }}>
                                                วิเคราะห์สิทธิภาพรายบอทเทรด (Bot Win Rate & Profit Analytics)
                                            </h3>
                                        </div>
                                        
                                        {analytics.botStats.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                                ไม่มีข้อมูลสถิติของบอทในขณะนี้
                                            </div>
                                        ) : (
                                            <table className="trading-table">
                                                <thead>
                                                    <tr>
                                                        <th>ที่มา / ชื่อบอท (Trading Source)</th>
                                                        <th style={{ textAlign: 'center' }}>จำนวนออเดอร์ (Trades)</th>
                                                        <th style={{ textAlign: 'center' }}>ชนะ (Wins)</th>
                                                        <th style={{ textAlign: 'center' }}>แพ้ (Losses)</th>
                                                        <th style={{ textAlign: 'center' }}>อัตราการชนะ (Win Rate)</th>
                                                        <th style={{ textAlign: 'right' }}>กำไรรวม (Net Profit)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analytics.botStats.map((bot, index) => {
                                                        const isBotManual = bot.name === 'เทรดเอง (Manual)';
                                                        const winRateVal = parseFloat(bot.winRate);
                                                        
                                                        let winRateColor = 'var(--text-muted)';
                                                        if (winRateVal >= 60) winRateColor = 'var(--bull-green)';
                                                        else if (winRateVal >= 45) winRateColor = 'var(--accent-gold)';
                                                        else if (winRateVal > 0) winRateColor = 'var(--bear-red)';

                                                        return (
                                                            <tr key={index}>
                                                                <td style={{ 
                                                                    fontWeight: 600, 
                                                                    color: isBotManual ? 'var(--text-muted)' : 'var(--accent-gold)'
                                                                }}>
                                                                    {bot.name}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{bot.totalTrades}</td>
                                                                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--bull-green)' }}>{bot.winCount}</td>
                                                                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--bear-red)' }}>{bot.loseCount}</td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: winRateColor }}>
                                                                            {bot.winRate}%
                                                                        </span>
                                                                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                            <div style={{ width: `${winRateVal}%`, height: '100%', background: winRateColor }}></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td 
                                                                    className={parseFloat(bot.totalProfit) >= 0 ? 'price-up' : 'price-down'}
                                                                    style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}
                                                                >
                                                                    {parseFloat(bot.totalProfit) >= 0 ? '+' : ''}${bot.totalProfit}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Trading Bots Tab Content */}
                            {activeTab === 'bots' && (
                                <div className="bot-tab-content">
                                    {/* Left: Bots controls & list */}
                                    <div className="bot-control-area">
                                        <div className="bot-control-header">
                                            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                                จัดการระบบอัลกอริทึม ({activeRunningBotsCount} ทำงานอยู่)
                                            </h4>
                                            <button className="btn-create-bot" onClick={() => { setSelectedAlgos(["rsi_oscillator"]); setSignalMode("or"); setBotForm({ name: "บอทเทรดทองคำ RSI", symbol: "XAUUSD", timeframe: "M1", algorithm: "rsi_oscillator", lot_size: 0.01, sl_points: 5.0, tp_points: 10.0 }); setEditingBotId(null); setBotFormOpen(true); }}>
                                                <Icon name="plus" size={12} />
                                                <span>สร้างบอทใหม่</span>
                                            </button>
                                        </div>
                                        
                                        {bots.length === 0 ? (
                                            <div className="empty-terminal-state">
                                                <Icon name="settings" size={32} />
                                                <p>ยังไม่มีบอทเทรดในระบบ กด "สร้างบอทใหม่" เพื่อเริ่มต้น</p>
                                            </div>
                                        ) : (
                                            <div className="bots-cards-grid">
                                                {bots.map((bot) => (
                                                    <div 
                                                        key={bot.id} 
                                                        className={`bot-card ${activeBot && activeBot.id === bot.id ? 'selected' : ''}`}
                                                        onClick={() => setActiveBot(bot)}
                                                    >
                                                        <div className="bot-card-header">
                                                            <span className="bot-card-title">{bot.name}</span>
                                                            <div className="bot-card-status">
                                                                <span style={{ fontSize: '10px', color: bot.is_running ? 'var(--bull-green)' : 'var(--text-muted)' }}>
                                                                    {bot.is_running ? 'RUNNING' : 'STOPPED'}
                                                                </span>
                                                                <div className={`bot-status-dot ${bot.is_running ? 'active' : ''}`}></div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bot-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px' }}>
                                                            <div className="bot-metric-item">
                                                                <span className="bot-metric-label">สินทรัพย์</span>
                                                                <span className="bot-metric-value">{bot.symbol}</span>
                                                            </div>
                                                            <div className="bot-metric-item">
                                                                <span className="bot-metric-label">Timeframe</span>
                                                                <span className="bot-metric-value">{bot.timeframe}</span>
                                                            </div>
                                                            <div className="bot-metric-item" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                                                                <span className="bot-metric-label">กลยุทธ์ ({bot.signal_mode ? bot.signal_mode.toUpperCase() : 'OR'})</span>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    {(bot.algorithms || bot.algorithm || "").split(",").map((a, i) => {
                                                                        const aTrim = a.trim();
                                                                        if (!aTrim) return null;
                                                                        return (
                                                                            <span key={i} style={{ 
                                                                                fontSize: '9px', 
                                                                                background: 'rgba(255,183,3,0.1)', 
                                                                                color: 'var(--accent-gold)', 
                                                                                padding: '2px 6px', 
                                                                                borderRadius: '3px',
                                                                                border: '1px solid rgba(255,183,3,0.25)',
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {aTrim === 'rsi_oscillator' ? 'RSI' : 
                                                                                 aTrim === 'sma_cross' ? 'SMA Cross' : 
                                                                                 aTrim === 'macd' ? 'MACD' : 
                                                                                 aTrim === 'elliott_wave' ? 'Elliott Wave' : 
                                                                                 aTrim === 'harmonic_patterns' ? 'Harmonics' : 
                                                                                 aTrim === 'ema_cross_50_200' ? 'EMA 50/200' :
                                                                                 aTrim === 'rsi_divergence' ? 'RSI Div' :
                                                                                 aTrim === 'atr_breakout' ? 'ATR Breakout' :
                                                                                 aTrim === 'support_resistance' ? 'S/R Bounce' : 
                                                                                 aTrim === 'liquidity_sweep' ? 'Liq Sweep' :
                                                                                 aTrim === 'smc_bos_choch' ? 'SMC BOS/CHoCH' :
                                                                                 aTrim === 'smc_order_block' ? 'SMC Order Block' :
                                                                                 aTrim === 'smc_fvg_imbalance' ? 'SMC FVG' :
                                                                                 aTrim === 'smc_confluence_pro' ? 'SMC Master Pro' : aTrim}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="bot-metric-item">
                                                                <span className="bot-metric-label">ขนาด Lot</span>
                                                                <span className="bot-metric-value">
                                                                    {bot.use_atr_sizing ? `Dynamic (${bot.risk_percent || 1.0}%)` : `${bot.lot_size} lot`}
                                                                </span>
                                                            </div>
                                                            <div className="bot-metric-item">
                                                                <span className="bot-metric-label">เซสชันเทรด</span>
                                                                <span className="bot-metric-value" style={{ textTransform: 'capitalize' }}>
                                                                    {bot.allowed_sessions === 'london' ? 'London Only' :
                                                                     bot.allowed_sessions === 'newyork' ? 'NY Only' :
                                                                     bot.allowed_sessions === 'london_ny' ? 'London+NY' :
                                                                     bot.allowed_sessions === 'asian' ? 'Asian Only' : '24 Hours'}
                                                                </span>
                                                            </div>
                                                            <div className="bot-metric-item">
                                                                <span className="bot-metric-label">กรอง EMA 200</span>
                                                                <span className="bot-metric-value" style={{ color: bot.use_trend_filter ? 'var(--bull-green)' : 'var(--text-muted)' }}>
                                                                    {bot.use_trend_filter ? 'ACTIVE' : 'INACTIVE'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bot-card-actions" onClick={(e) => e.stopPropagation()}>
                                                            <div 
                                                                className={`toggle-switch-container ${bot.is_running ? 'active' : ''}`}
                                                                onClick={() => handleToggleBot(bot.id)}
                                                            >
                                                                <div className="toggle-switch"></div>
                                                            </div>
                                                            
                                                            <button 
                                                                className="btn-edit-bot-icon"
                                                                onClick={() => handleEditBotInit(bot)}
                                                                title="แก้ไขบอทนี้"
                                                            >
                                                                <Icon name="edit" size={14} />
                                                            </button>
                                                            
                                                            <button 
                                                                className="btn-delete-bot-icon"
                                                                onClick={(e) => handleDeleteBot(bot.id, e)}
                                                                title="ลบบอทนี้"
                                                            >
                                                                <Icon name="trash" size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Right: Selected Bot live console logs */}
                                    <div className="bot-logs-panel">
                                        <div className="bot-logs-header">
                                            <span>บันทึกการทำงาน {activeBot ? `[${activeBot.name}]` : '(กรุณาเลือกบอท)'}</span>
                                            {activeBot && activeBot.is_running && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <div className="pulse-dot" style={{ backgroundColor: 'var(--bull-green)' }}></div>
                                                    <span style={{ fontSize: '9px', color: 'var(--bull-green)' }}>LIVE</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bot-logs-console">
                                            {!activeBot ? (
                                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                                                    คลิกเลือกบอทซ้ายมือ เพื่อดูบันทึกและสัญญาณเทรดแบบเรียลไทม์
                                                </div>
                                            ) : botLogs.length === 0 ? (
                                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                                                    ไม่มีบันทึกข้อมูลในขณะนี้ ระบบจะประมวลผลสัญญาณทุกๆ 10 วินาที
                                                </div>
                                            ) : (
                                                botLogs.map((log) => (
                                                    <div key={log.id} className={`bot-log-line ${log.log_type}`}>
                                                        <span className="bot-log-time">[{log.timestamp.split(' ')[1]}]</span>
                                                        <span>{log.message}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Right Sidebar (Order Controls) */}
                <div className="execution-sidebar">
                    {/* Execution Card */}
                    <div className="sidebar-panel-card">
                        <h3>ส่งคำสั่งซื้อขาย (Order Execution)</h3>
                        
                        <div className="order-type-tabs">
                            <button className="order-tab-btn active">Market Order</button>
                            <button className="order-tab-btn" onClick={() => alert('ระบบ Limit Order รองรับเฉพาะ LIVE ACCOUNT และต้องส่งคำสั่งแบบ Pending, ในโหมดปัจจุบันกรุณาใช้ Market Order ครับ')}>Limit Order</button>
                        </div>

                        {/* Lot Input */}
                        <div className="input-group">
                            <label>Volume (Lots)</label>
                            <div className="input-wrapper">
                                <input 
                                    type="number" 
                                    className="numeric-input"
                                    value={lotSize}
                                    step="0.01"
                                    min="0.01"
                                    onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                                />
                                <div className="lot-adjuster-btn">
                                    <button className="adjust-btn" onClick={() => adjustLotSize(-0.01)}>-</button>
                                    <button className="adjust-btn" onClick={() => adjustLotSize(0.01)}>+</button>
                                </div>
                            </div>
                        </div>

                        {/* SL/TP Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="input-group">
                                <label style={{ color: 'var(--bear-red)' }}>Stop Loss (SL)</label>
                                <input 
                                    type="number" 
                                    className="numeric-input" 
                                    placeholder="ไม่ตั้ง"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ color: 'var(--bull-green)' }}>Take Profit (TP)</label>
                                <input 
                                    type="number" 
                                    className="numeric-input" 
                                    placeholder="ไม่ตั้ง"
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Big Buy/Sell buttons */}
                        <div className="execution-buttons-grid">
                            <button 
                                className="btn-trade-execute sell"
                                disabled={isTrading}
                                onClick={() => handleExecuteTrade("sell")}
                            >
                                <span className="btn-label-title">SELL</span>
                                <span className="btn-label-price">
                                    {currentPriceInfo.bid > 0 ? currentPriceInfo.bid.toLocaleString('en-US', { minimumFractionDigits: activeSymbol === "EURUSD" ? 5 : 2 }) : '...'}
                                </span>
                            </button>
                            
                            <button 
                                className="btn-trade-execute buy"
                                disabled={isTrading}
                                onClick={() => handleExecuteTrade("buy")}
                            >
                                <span className="btn-label-title">BUY</span>
                                <span className="btn-label-price">
                                    {currentPriceInfo.ask > 0 ? currentPriceInfo.ask.toLocaleString('en-US', { minimumFractionDigits: activeSymbol === "EURUSD" ? 5 : 2 }) : '...'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Account Health Summary Card */}
                    <div className="sidebar-panel-card">
                        <h3>ระดับความปลอดภัยบัญชี</h3>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span className="text-secondary">Free Margin</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    ${account.margin_free.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                                <span className="text-secondary">Margin Level</span>
                                <span style={{ 
                                    fontFamily: 'monospace', 
                                    fontWeight: 'bold',
                                    color: account.margin > 0 ? (account.margin_level > 200 ? 'var(--bull-green)' : account.margin_level > 100 ? 'var(--accent-gold)' : 'var(--bear-red)') : 'var(--text-muted)'
                                }}>
                                    {account.margin > 0 ? `${account.margin_level.toFixed(1)}%` : '∞'}
                                </span>
                            </div>
                            
                            {account.margin > 0 && (
                                <div>
                                    <div className="margin-indicator-bar">
                                        <div 
                                            className="margin-fill" 
                                            style={{ 
                                                width: `${Math.min(100, Math.max(5, (100 - (account.margin / account.equity * 100))))}%`,
                                                background: account.margin_level > 200 ? 'var(--bull-green)' : 'var(--accent-gold)'
                                            }}
                                        ></div>
                                    </div>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                                        * Margin Call อยู่ที่ระดับต่ำกว่า 60%, Stop Out อยู่ที่ระดับต่ำกว่า 30% ในเซิร์ฟเวอร์ Exness
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SETTINGS / MT5 CONNECTION MODAL --- */}
            <div className={`modal-overlay ${settingsOpen ? 'active' : ''}`}>
                <div className="modal-container">
                    <div className="modal-header">
                        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="server" size={18} style={{ color: 'var(--accent-gold)' }} />
                            <span>เชื่อมต่อบัญชี EXNESS METATRADER 5</span>
                        </h3>
                        <button className="modal-close-btn" onClick={() => setSettingsOpen(false)}>
                            <Icon name="close" size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {settingsAlert && (
                            <div className={`form-alert ${settingsAlert.type}`}>
                                <Icon name={settingsAlert.type === 'success' ? 'check' : 'alert'} size={16} />
                                <span>{settingsAlert.text}</span>
                            </div>
                        )}

                        {!connectionStatus.is_simulated ? (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    พอร์ตของคุณกำลังเชื่อมต่ออยู่กับเซิร์ฟเวอร์ Exness แบบ Real-time
                                    <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Exness Account ID</span>
                                        <strong style={{ fontSize: '18px', color: 'var(--accent-gold)' }}>{connectionStatus.login}</strong>
                                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Server Name</span>
                                        <strong style={{ fontSize: '14px' }}>{connectionStatus.server}</strong>
                                    </div>
                                </div>

                                <button className="btn-secondary" style={{ borderColor: 'var(--bear-red)', color: 'var(--bear-red)' }} onClick={handleDisconnectLive}>
                                    ยกเลิกการเชื่อมโยงบัญชีจริง (กลับสู่ระบบจำลอง)
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSettingsSubmit}>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
                                    กรอกข้อมูลเข้าสู่ระบบ MetaTrader 5 ของ Exness เพื่อดึงพอร์ต บัญชีบาลานซ์ ประวัติการเทรด และควบคุมส่งคำสั่งซื้อขายจริง
                                </div>

                                <div className="input-group">
                                    <label>เลขบัญชีเทรด (MT5 Login ID)</label>
                                    <input 
                                        type="number" 
                                        className="numeric-input" 
                                        required 
                                        placeholder="เช่น 14234509"
                                        value={settingsForm.login}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, login: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>รหัสผ่านเทรด (Trading Password)</label>
                                    <input 
                                        type="password" 
                                        className="numeric-input" 
                                        required 
                                        placeholder="รหัสผ่านเข้าสู่ระบบ Exness ของคุณ"
                                        value={settingsForm.password}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>ชื่อเซิร์ฟเวอร์ Exness (MT5 Server Name)</label>
                                    <input 
                                        type="text" 
                                        className="numeric-input" 
                                        required 
                                        placeholder="เช่น Exness-MT5-Trial9 หรือ Exness-MT5-Real"
                                        value={settingsForm.server}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, server: e.target.value })}
                                    />
                                </div>

                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="chk-autoconnect"
                                        checked={settingsForm.auto_connect}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, auto_connect: e.target.checked })}
                                        style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="chk-autoconnect" style={{ margin: 0, cursor: 'pointer', textTransform: 'none' }}>
                                        จำค่าข้อมูลบัญชีและล็อกอินอัตโนมัติเมื่อเปิดเซิร์ฟเวอร์
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-primary" 
                                    style={{ marginTop: '20px' }}
                                    disabled={settingsLoading}
                                >
                                    {settingsLoading ? 'กำลังตรวจสอบสิทธิ์เชื่อมต่อ...' : 'เชื่อมต่อบัญชีเทรดจริง'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setSettingsOpen(false)}
                                >
                                    ใช้งานโหมดจำลอง (Simulation Mode) ต่อไป
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CREATE NEW BOT MODAL --- */}
            <div className={`modal-overlay ${botFormOpen ? 'active' : ''}`}>
                <div className="modal-container" style={{ width: '500px' }}>
                    <div className="modal-header">
                        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="settings" size={18} style={{ color: 'var(--accent-gold)' }} />
                            <span>{editingBotId ? "แก้ไขบอทเทรดอัจฉริยะระบบอัลกอริทึม" : "สร้างบอทเทรดอัจฉริยะระบบอัลกอริทึม"}</span>
                        </h3>
                        <button className="modal-close-btn" onClick={() => { setBotFormOpen(false); setEditingBotId(null); }}>
                            <Icon name="close" size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmitBotForm}>
                            <div className="input-group">
                                <label>ชื่อบอทเทรด (Bot Profile Name)</label>
                                <input 
                                    type="text" 
                                    className="numeric-input" 
                                    required 
                                    placeholder="เช่น Gold RSI Scalper"
                                    value={botForm.name}
                                    onChange={(e) => setBotForm({ ...botForm, name: e.target.value })}
                                />
                            </div>

                            <div className="bot-form-grid">
                                <div className="input-group">
                                    <label>เลือกสินทรัพย์ (Symbol)</label>
                                    <select 
                                        className="numeric-input"
                                        style={{ appearance: 'auto' }}
                                        value={botForm.symbol}
                                        onChange={(e) => {
                                            const sym = e.target.value;
                                            let defaultName = `บอทเทรด ${sym} RSI`;
                                            setBotForm({ ...botForm, symbol: sym, name: defaultName });
                                        }}
                                    >
                                        <option value="XAUUSD">XAUUSD (Gold)</option>
                                        <option value="EURUSD">EURUSD (Euro)</option>
                                        <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                                        <option value="AAPL">AAPL (Apple)</option>
                                        <option value="TSLA">TSLA (Tesla)</option>
                                        <option value="US500">US500 (S&P 500)</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Timeframe</label>
                                    <select 
                                        className="numeric-input"
                                        style={{ appearance: 'auto' }}
                                        value={botForm.timeframe}
                                        onChange={(e) => setBotForm({ ...botForm, timeframe: e.target.value })}
                                    >
                                        <option value="M1">M1 (1 Minute)</option>
                                        <option value="M5">M5 (5 Minutes)</option>
                                        <option value="M15">M15 (15 Minutes)</option>
                                        <option value="M30">M30 (30 Minutes)</option>
                                        <option value="H1">H1 (1 Hour)</option>
                                        <option value="D1">D1 (1 Day)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <label style={{ marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>อัลกอริทึมกลยุทธ์ (เลือกได้มากกว่า 1 ตัว)</label>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '10px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    padding: '12px', 
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {[
                                        { id: 'rsi_oscillator', name: 'RSI Overbought/Oversold', desc: 'เทรดเมื่อจุดกลับตัวจากเขต RSI Overbought/Oversold' },
                                        { id: 'sma_cross', name: 'Double SMA Crossover', desc: 'เทรดตามแนวโน้มเมื่อเส้น SMA 5 ตัดกับ 15' },
                                        { id: 'macd', name: 'MACD Signal Cross', desc: 'เทรดตามโมเมนตัมเมื่อเส้น MACD ตัดกับ Signal' },
                                        { id: 'elliott_wave', name: 'Elliott Wave Theory', desc: 'ตรวจจับคลื่น Impulse/Correction จากราคาย้อนหลัง' },
                                        { id: 'harmonic_patterns', name: 'Harmonic Patterns', desc: 'เทรดจุดกลับตัวสมมาตร Gartley/Bat/Butterfly' },
                                        { id: 'ema_cross_50_200', name: 'EMA 50 / 200 Cross', desc: 'เทรดตามแนวโน้มใหญ่เมื่อเส้น EMA 50 ตัดกับ EMA 200' },
                                        { id: 'rsi_divergence', name: 'RSI Divergence', desc: 'จับคู่สัญญาณกลับตัวราคากับโมเมนตัม RSI (Bullish/Bearish Divergence)' },
                                        { id: 'atr_breakout', name: 'ATR Volatility Breakout', desc: 'เทรดกรอบความผันผวน ATR (Close > EMA20 + 1.5 * ATR)' },
                                        { id: 'support_resistance', name: 'Support / Resistance Bounce', desc: 'เทรดการเด้งกลับเมื่อราคาทดสอบแนวรับหรือแนวต้านที่แข็งแกร่ง' },
                                        { id: 'liquidity_sweep', name: 'Liquidity Sweep (Stop Hunt)', desc: 'จับสัญญาณกวาดสภาพคล่องย่อย (Stop Hunt Reversal) ที่แนวรับ/แนวต้าน' },
                                        { id: 'smc_bos_choch', name: 'SMC BOS/CHoCH Breakout', desc: 'ตรวจจับโครงสร้างราคา BOS และการเปลี่ยนเทรนย่อย CHoCH' },
                                        { id: 'smc_order_block', name: 'SMC Order Block (OB)', desc: 'เข้าออเดอร์เมื่อราคาย่อตัวทดสอบโซน Supply/Demand ของสถาบันใหญ่' },
                                        { id: 'smc_fvg_imbalance', name: 'SMC Fair Value Gap (FVG)', desc: 'จับสัญญาณเข้าซื้อเมื่อราคาย่อปิดช่องว่างสภาวะราคาไม่สมดุล' },
                                        { id: 'smc_confluence_pro', name: 'SMC Confluence Master Pro', desc: 'กลยุทธ์ SMC ขั้นสูงสุด ผสานโครงสร้างราคา + Sweep + OB + FVG' }
                                    ].map(algo => {
                                        const isChecked = selectedAlgos.includes(algo.id);
                                        return (
                                            <div 
                                                key={algo.id}
                                                onClick={() => {
                                                    let nextAlgos = [...selectedAlgos];
                                                    if (isChecked) {
                                                        if (nextAlgos.length > 1) {
                                                            nextAlgos = nextAlgos.filter(id => id !== algo.id);
                                                        }
                                                    } else {
                                                        nextAlgos.push(algo.id);
                                                    }
                                                    setSelectedAlgos(nextAlgos);
                                                    
                                                    // Dynamically update name
                                                    let name = `บอทเทรด ${botForm.symbol}`;
                                                    if (nextAlgos.length === 1) {
                                                        const single = nextAlgos[0];
                                                        const suffix = single === "rsi_oscillator" ? "RSI Overbought/Oversold" :
                                                                       single === "sma_cross" ? "Double SMA" :
                                                                       single === "macd" ? "MACD Cross" :
                                                                       single === "elliott_wave" ? "Elliott Wave Bot" :
                                                                       single === "harmonic_patterns" ? "Harmonics Reversal" :
                                                                       single === "ema_cross_50_200" ? "EMA 50/200 Cross" :
                                                                       single === "rsi_divergence" ? "RSI Divergence" :
                                                                       single === "atr_breakout" ? "ATR Breakout" :
                                                                       single === "support_resistance" ? "S/R Bounce" : 
                                                                       single === "liquidity_sweep" ? "Liquidity Sweep Bot" :
                                                                       single === "smc_bos_choch" ? "SMC BOS/CHoCH" :
                                                                       single === "smc_order_block" ? "SMC Order Block" :
                                                                       single === "smc_fvg_imbalance" ? "SMC FVG Imbalance" : "SMC Confluence Master";
                                                        name += ` ${suffix}`;
                                                    } else {
                                                        name += ` Multi-Algo (${signalMode === "and" ? "Consensus" : "Aggressive"})`;
                                                    }
                                                    setBotForm(prev => ({ ...prev, name }));
                                                }}
                                                style={{
                                                    background: isChecked ? 'rgba(255, 183, 3, 0.06)' : 'rgba(255,255,255,0.01)',
                                                    border: isChecked ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '6px',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked} 
                                                        readOnly
                                                        style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer' }} 
                                                    />
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: isChecked ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{algo.name}</span>
                                                </div>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{algo.desc}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedAlgos.length > 1 && (
                                <div className="input-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>โหมดการควบรวมสัญญาณ (Signal Combination Mode)</label>
                                    <select 
                                        className="numeric-input"
                                        style={{ appearance: 'auto', border: '1px solid var(--accent-gold)' }}
                                        value={signalMode}
                                        onChange={(e) => {
                                            const mode = e.target.value;
                                            setSignalMode(mode);
                                            setBotForm(prev => ({
                                                ...prev,
                                                name: `บอทเทรด ${prev.symbol} Multi-Algo (${mode === "and" ? "Consensus" : "Aggressive"})`
                                            }));
                                        }}
                                    >
                                        <option value="or">OR - Aggressive (อินดิเคเตอร์ใดก็ได้ส่งสัญญาณ ก็เปิดออเดอร์ทันที)</option>
                                        <option value="and">AND - Consensus (ทุกอินดิเคเตอร์ที่เลือกต้องเห็นพ้องตรงกัน จึงเปิดออเดอร์)</option>
                                    </select>
                                </div>
                            )}

                            <div className="bot-form-grid">
                                <div className="input-group">
                                    <label>ขนาดสัญญา (Lot Size)</label>
                                    <input 
                                        type="number" 
                                        className="numeric-input" 
                                        required={!botForm.use_atr_sizing} 
                                        disabled={botForm.use_atr_sizing}
                                        step="0.01" 
                                        min="0.01" 
                                        max="10.0"
                                        placeholder={botForm.use_atr_sizing ? "คำนวณอัตโนมัติ (ATR)" : "เช่น 0.01"}
                                        value={botForm.use_atr_sizing ? "" : botForm.lot_size}
                                        onChange={(e) => setBotForm({ ...botForm, lot_size: e.target.value })}
                                    />
                                </div>
                                <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                                        {botForm.use_atr_sizing ? "* ขนาด Lot จะคำนวณแบบแปรผันตามความเสี่ยงพอร์ต % และ ATR" : "* กำหนดขนาดสัญญาคงที่ต่อ 1 ไม้สำหรับการเข้าเทรด"}
                                    </span>
                                </div>
                            </div>

                            <div className="bot-form-grid">
                                <div className="input-group">
                                    <label>Stop Loss (SL ระยะราคาห่าง)</label>
                                    <input 
                                        type="number" 
                                        className="numeric-input" 
                                        required 
                                        step="0.0001" 
                                        placeholder="เช่น 5.0 สำหรับทอง, 0.0020 สำหรับคู่เงิน"
                                        value={botForm.sl_points}
                                        onChange={(e) => setBotForm({ ...botForm, sl_points: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Take Profit (TP ระยะราคาห่าง)</label>
                                    <input 
                                        type="number" 
                                        className="numeric-input" 
                                        required 
                                        step="0.0001" 
                                        placeholder="เช่น 10.0 สำหรับทอง, 0.0040 สำหรับคู่เงิน"
                                        value={botForm.tp_points}
                                        onChange={(e) => setBotForm({ ...botForm, tp_points: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* --- Advanced SMC & Risk Management Settings --- */}
                            <div style={{
                                marginTop: '16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                paddingTop: '16px'
                            }}>
                                <h4 style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--accent-gold)', 
                                    fontWeight: 700, 
                                    marginBottom: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    การบริหารความเสี่ยงและตัวกรองขั้นสูง (Advanced Risk & Filters)
                                </h4>

                                <div className="bot-form-grid" style={{ marginBottom: '12px' }}>
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <input 
                                            type="checkbox" 
                                            id="chk-trend-filter"
                                            checked={botForm.use_trend_filter}
                                            onChange={(e) => setBotForm({ ...botForm, use_trend_filter: e.target.checked })}
                                            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }} onClick={() => setBotForm({ ...botForm, use_trend_filter: !botForm.use_trend_filter })}>
                                            <label htmlFor="chk-trend-filter" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '11px', textTransform: 'none' }}>
                                                เปิดใช้ตัวกรองเทรนด์ใหญ่ (EMA 200)
                                            </label>
                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                                                เข้า BUY เมื่อราคาอยู่เหนือ EMA 200 และ SELL เมื่อราคาอยู่ใต้เท่านั้น
                                            </span>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>ช่วงเวลาทำเงิน (Allowed Session)</label>
                                        <select 
                                            className="numeric-input"
                                            style={{ appearance: 'auto', fontSize: '12px' }}
                                            value={botForm.allowed_sessions}
                                            onChange={(e) => setBotForm({ ...botForm, allowed_sessions: e.target.value })}
                                        >
                                            <option value="all">ทุกช่วงเวลา (All Sessions - 24 Hours)</option>
                                            <option value="asian">Asian Session (00:00 - 08:00 UTC)</option>
                                            <option value="london">London Session (08:00 - 16:00 UTC)</option>
                                            <option value="newyork">New York Session (13:00 - 21:00 UTC)</option>
                                            <option value="london_ny">London-NY Overlap (13:00 - 16:00 UTC)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bot-form-grid">
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', height: 'fit-content' }}>
                                        <input 
                                            type="checkbox" 
                                            id="chk-atr-sizing"
                                            checked={botForm.use_atr_sizing}
                                            onChange={(e) => setBotForm({ ...botForm, use_atr_sizing: e.target.checked })}
                                            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }} onClick={() => setBotForm({ ...botForm, use_atr_sizing: !botForm.use_atr_sizing })}>
                                            <label htmlFor="chk-atr-sizing" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '11px', textTransform: 'none' }}>
                                                คำนวณ Lot อัตโนมัติด้วย ATR
                                            </label>
                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                                                คำนวณขนาดสัญญาเทรดอัตโนมัติตาม % ความเสี่ยงและระยะ SL ปัจจุบัน
                                            </span>
                                        </div>
                                    </div>

                                    {botForm.use_atr_sizing && (
                                        <div className="input-group">
                                            <label style={{ color: 'var(--accent-gold)' }}>เปอร์เซ็นต์ความเสี่ยง (% Risk)</label>
                                            <input 
                                                type="number" 
                                                className="numeric-input" 
                                                required 
                                                step="0.1" 
                                                min="0.1"
                                                max="10.0"
                                                placeholder="เช่น 1.0 ของบัญชี"
                                                value={botForm.risk_percent}
                                                onChange={(e) => setBotForm({ ...botForm, risk_percent: parseFloat(e.target.value) || 1.0 })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- Premium SMC & Risk Controls Section --- */}
                            <div style={{
                                marginTop: '16px',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                            }}>
                                <h4 style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--accent-gold)', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.5px',
                                    margin: '0 0 4px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Icon name="shield" size={14} />
                                    <span>ระบบกรองเทรดขั้นสูง & การจัดการความเสี่ยง</span>
                                </h4>

                                {/* 1. Trend Filter & Session Filter in one row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="input-group" style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: 'rgba(255,255,255,0.02)',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        height: '42px',
                                        marginTop: 'auto',
                                        marginBottom: '0'
                                    }} onClick={() => setBotForm({ ...botForm, use_trend_filter: !botForm.use_trend_filter })}>
                                        <input 
                                            type="checkbox" 
                                            id="chk-trendfilter"
                                            checked={botForm.use_trend_filter || false}
                                            onChange={(e) => setBotForm({ ...botForm, use_trend_filter: e.target.checked })}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="chk-trendfilter" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', fontSize: '11px', fontWeight: 600 }}>
                                            กรองเทรด EMA 200 (Trend Filter)
                                        </label>
                                    </div>

                                    <div className="input-group" style={{ margin: 0 }}>
                                        <label style={{ fontSize: '11px', marginBottom: '4px' }}>เวลาซื้อขาย (Trading Session)</label>
                                        <select 
                                            className="numeric-input"
                                            style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px', height: '42px' }}
                                            value={botForm.allowed_sessions || "all"}
                                            onChange={(e) => setBotForm({ ...botForm, allowed_sessions: e.target.value })}
                                        >
                                            <option value="all">ตลอดทั้งวัน (All Day Sessions)</option>
                                            <option value="london">ลอนดอน (London Session)</option>
                                            <option value="newyork">นิวยอร์ก (NY Session)</option>
                                            <option value="london_ny">ทับซ้อน London+NY (Overlap)</option>
                                            <option value="asian">เอเชีย (Asian Session)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 2. ATR Position Sizing Box */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setBotForm({ ...botForm, use_atr_sizing: !botForm.use_atr_sizing })}>
                                        <input 
                                            type="checkbox" 
                                            id="chk-atrsizing"
                                            checked={botForm.use_atr_sizing || false}
                                            onChange={(e) => setBotForm({ ...botForm, use_atr_sizing: e.target.checked })}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="chk-atrsizing" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            คำนวณ Lot ขนาดตามความเสี่ยงพอร์ต (ATR Sizing)
                                        </label>
                                    </div>
                                    
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', lineHeight: '1.3' }}>
                                        * คำนวณ Lot อัตโนมัติ เพื่อเสี่ยงเป็น % ของบาลานซ์พอร์ตตามระยะ Stop Loss และความผันผวนของ ATR ปัจจุบัน
                                    </span>

                                    {botForm.use_atr_sizing && (
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1.2fr 1fr', 
                                            gap: '12px',
                                            marginTop: '4px',
                                            borderTop: '1px dashed rgba(255,255,255,0.05)',
                                            paddingTop: '10px'
                                        }}>
                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label style={{ fontSize: '11px', marginBottom: '4px', color: 'var(--accent-gold)' }}>เปอร์เซ็นต์ความเสี่ยงต่อไม้ (Risk %)</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <input 
                                                        type="number" 
                                                        className="numeric-input" 
                                                        required={botForm.use_atr_sizing}
                                                        step="0.1" 
                                                        min="0.1" 
                                                        max="10.0"
                                                        placeholder="เช่น 1.0"
                                                        value={botForm.risk_percent || 1.0}
                                                        onChange={(e) => setBotForm({ ...botForm, risk_percent: parseFloat(e.target.value) || 1.0 })}
                                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                                    />
                                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>%</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '2px' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                                                    ระบบจะคำนวณขนาด Lot แบบ Real-time เช่น 1% ของทุน $10,000 คือเสี่ยงขาดทุนได้ $100 ต่อไม้
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-primary" 
                                style={{ marginTop: '20px' }}
                            >
                                {editingBotId ? "บันทึกการแก้ไขตั้งค่าบอท" : "ยืนยันการสร้างและเปิดสแตนด์บายบอท"}
                            </button>
                            
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => { setBotFormOpen(false); setEditingBotId(null); }}
                            >
                                ยกเลิก
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- AI TRADING ASSISTANT CHATBOT --- */}
            <div 
                className="chatbot-widget"
                style={{
                    position: 'fixed',
                    left: `${chatbotPosition.x}px`,
                    top: `${chatbotPosition.y}px`,
                    bottom: 'auto',
                    right: 'auto',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'flex-end',
                    gap: '16px'
                }}
            >
                {/* Floating Chat Trigger Button */}
                <button 
                    className={`chatbot-trigger ${chatbotOpen ? 'active' : ''}`}
                    onClick={handleChatbotTriggerClick}
                    onMouseDown={handleChatbotDragStart}
                    onTouchStart={handleChatbotDragStart}
                    title="Giant Slayer AI Assistant"
                    style={{ cursor: 'grab' }}
                >
                    {!chatbotOpen && <div className="chatbot-trigger-pulse"></div>}
                    <Icon name={chatbotOpen ? "close" : "message"} size={24} />
                </button>

                {/* Glassmorphic Chat Window */}
                <div className={`chatbot-window ${chatbotOpen ? '' : 'hidden'}`}>
                    {/* Header */}
                    <div 
                        className="chatbot-header"
                        onMouseDown={handleChatbotDragStart}
                        onTouchStart={handleChatbotDragStart}
                        style={{ cursor: 'move', userSelect: 'none' }}
                    >
                        <div className="chatbot-title-area">
                            <div className="chatbot-avatar-glow">
                                <Icon name="message" size={16} />
                            </div>
                            <div className="chatbot-header-text">
                                <h4>Giant Slayer AI Assistant</h4>
                                <div className="chatbot-status">
                                    <div className="chatbot-status-dot"></div>
                                    <span>Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="chatbot-header-actions" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <button 
                                className="chatbot-action-btn"
                                onClick={clearChat}
                                title="ล้างการสนทนา"
                            >
                                <Icon name="trash" size={14} />
                            </button>
                            <button 
                                className="chatbot-action-btn close"
                                onClick={() => setChatbotOpen(false)}
                                title="ปิดหน้าต่างแชท"
                            >
                                <Icon name="close" size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="chatbot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chatbot-msg-wrapper ${msg.sender}`}>
                                <div className="chatbot-msg-bubble">
                                    {renderMessageContent(msg.text)}
                                </div>
                                <span className="chatbot-msg-time">{msg.timestamp}</span>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {botIsTyping && (
                            <div className="chatbot-msg-wrapper bot">
                                <div className="chatbot-msg-bubble" style={{ padding: '8px 12px' }}>
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatbotEndRef} />
                    </div>

                    {/* Quick Reply Suggestion Chips */}
                    <div className="chatbot-suggestions">
                        {[
                            { label: "📊 ยอดเงินและพอร์ต", query: "ขอดูยอดเงินในพอร์ตและกำไรรวมปัจจุบัน" },
                            { label: "💼 ไม้ที่เปิดค้างไว้", query: "มีออเดอร์โพสิชันอะไรเปิดอยู่บ้างขณะนี้" },
                            { label: "📜 ประวัติการเทรด", query: "ขอดูประวัติบันทึกการเทรดล่าสุด" },
                            { label: "📈 วิเคราะห์ราคาทอง", query: "แนวโน้มราคาสินทรัพย์ทองคำ XAUUSD ในปัจจุบันเป็นอย่างไร" },
                            { label: "🤖 ขอคำแนะนำบอท", query: "แนะนำการตั้งค่ากลยุทธ์บอทเทรดของ Giant Slayer หน่อย" }
                        ].map((chip, idx) => (
                            <button
                                key={idx}
                                className="chatbot-chip"
                                onClick={() => handleSendMessage(chip.query)}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Message Input Area */}
                    <form 
                        className="chatbot-input-area"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                    >
                        <div className="chatbot-input-wrapper">
                            <input 
                                type="text"
                                className="chatbot-input"
                                placeholder="พิมพ์ข้อความสอบถามการเทรดที่นี่..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                disabled={botIsTyping}
                            />
                        </div>
                        <button 
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputMessage.trim() || botIsTyping}
                        >
                            <Icon name="send" size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Mount the React Application to DOM Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TradingApp />);
