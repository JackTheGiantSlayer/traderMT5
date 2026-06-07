const { useState, useEffect, useRef } = React;

// --- Built-in SVG Icon Component (Zero External Loaders Needed!) ---
const Icon = ({ name, className = "react-svg-icon", size = 18 }) => {
    const icons = {
        "external-link": (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        ),
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
        ),
        pencil: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        eraser: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M20 20H7L3 16c-1-1-1-2 0-3l9-9c1-1 2-1 3 0l5 5c1 1 1 2 0 3l-5 5" />
                <line x1="22" y1="20" x2="9" y2="20" />
            </svg>
        ),
        sun: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
        ),
        sunset: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M17 18a5 5 0 0 0-10 0" />
                <line x1="12" y1="9" x2="12" y2="2" />
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                <line x1="1" y1="18" x2="3" y2="18" />
                <line x1="21" y1="18" x2="23" y2="18" />
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
                <line x1="23" y1="22" x2="1" y2="22" />
                <line x1="16" y1="5" x2="12" y2="2" />
                <line x1="8" y1="5" x2="12" y2="2" />
            </svg>
        ),
        moon: (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        ),
        "chevron-down": (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="6 9 12 15 18 9" />
            </svg>
        ),
        "chevron-up": (
            <svg viewBox="0 0 24 24" width={size} height={size}>
                <polyline points="18 15 12 9 6 15" />
            </svg>
        )
    };

    return icons[name] ? React.cloneElement(icons[name], { className, style: { stroke: 'currentColor', fill: 'none' } }) : null;
};

// --- App Main Component ---
const TradingApp = () => {
    // Check if running in standalone popout mode
    const isPopout = new URLSearchParams(window.location.search).get('popout') === 'backtest';
    const isChatbotPopout = new URLSearchParams(window.location.search).get('popout') === 'chatbot';
    const isNewsPopout = new URLSearchParams(window.location.search).get('popout') === 'news';
    const isAnalyticsPopout = new URLSearchParams(window.location.search).get('popout') === 'analytics';

    // Assets & Selection
    const [watchlist, setWatchlist] = useState([]);
    const [showAddWatchlistForm, setShowAddWatchlistForm] = useState(false);
    const [addWatchlistForm, setAddWatchlistForm] = useState({ symbol: "", name: "", asset_type: "forex" });
    
    // Live Stochastic RSI and general indicators state
    const [stochRsiData, setStochRsiData] = useState({ 
        rsi: null, k: null, d: null, 
        macd_val: null, macd_color: null, macd_history: [],
        status: 'loading' 
    });

    // Configurable indicator settings state
    const [stochRsiSettings, setStochRsiSettings] = useState({
        k: 3,
        d: 3,
        rsiLength: 13,
        stochasticLength: 13,
        rsiSource: "Close",
        timeframe: "Chart",
        waitClose: true
    });
    
    const [macdSettings, setMacdSettings] = useState({
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
    });

    const [stochRsiSettingsOpen, setStochRsiSettingsOpen] = useState(false);
    const [macdSettingsOpen, setMacdSettingsOpen] = useState(false);
    
    // Modal Form States for temporary editing
    const [stochRsiForm, setStochRsiForm] = useState({
        k: 3,
        d: 3,
        rsiLength: 13,
        stochasticLength: 13,
        rsiSource: "Close",
        timeframe: "Chart",
        waitClose: true
    });
    
    const [macdForm, setMacdForm] = useState({
        fastPeriod: 12,
        slowPeriod: 26
    });

    const openStochRsiSettings = () => {
        setStochRsiForm({ ...stochRsiSettings });
        setStochRsiSettingsOpen(true);
    };

    const openMacdSettings = () => {
        setMacdForm({ ...macdSettings });
        setMacdSettingsOpen(true);
    };
    
    // Multi-Timeframe Chart configurations
    const [chartLayout, setChartLayout] = useState("single"); // 'single' | 'dual' | 'quad'
    const [activePaneId, setActivePaneId] = useState(0);
    const [paneTimeframes, setPaneTimeframes] = useState({
        0: 'H1',
        1: 'M15',
        2: 'M5',
        3: 'D1'
    });

    // Sidebar panels collapsible states
    const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
    const [isExecutionCollapsed, setIsExecutionCollapsed] = useState(false);

    // Dynamic chart resizing to match sidebar collapse/expand animations
    useEffect(() => {
        const resizeCharts = () => {
            const activePaneIds = chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3];
            activePaneIds.forEach(paneId => {
                const chart = chartsRef.current[paneId];
                const container = containersRef.current[paneId];
                if (chart && container) {
                    chart.applyOptions({
                        width: container.clientWidth,
                        height: container.clientHeight
                    });
                }
            });
        };
        
        // Multiple checks matching standard CSS transition timing
        const intervals = [50, 100, 150, 200, 250, 300, 350];
        const timers = intervals.map(ms => setTimeout(resizeCharts, ms));
        
        return () => timers.forEach(clearTimeout);
    }, [isWatchlistCollapsed, isExecutionCollapsed, chartLayout, isTerminalExpanded, isTerminalCollapsed]);

    // Interactive Graph Drawing states & refs
    const [drawingTool, setDrawingToolState] = useState(null); // null | 'trendline' | 'horizontal'
    const [drawingStartPoint, setDrawingStartPointState] = useState(null); // null | { time, price }
    
    const drawingToolRef = useRef(null);
    const drawingStartPointRef = useRef(null);
    const drawnLinesRef = useRef([]); // persistent list: { id, type, symbol, price, points, instances }

    const setDrawingTool = (tool) => {
        drawingToolRef.current = tool;
        setDrawingToolState(tool);
        drawingStartPointRef.current = null;
        setDrawingStartPointState(null);
    };

    const setDrawingStartPoint = (pt) => {
        drawingStartPointRef.current = pt;
        setDrawingStartPointState(pt);
    };

    const clearDrawings = () => {
        drawnLinesRef.current.forEach(line => {
            if (line.symbol === activeSymbol && line.instances) {
                if (line.type === 'horizontal') {
                    // Also attempt deleting mapping entries by key
                    Object.entries(candlestickSeriesesRef.current).forEach(([pId, series]) => {
                        if (series && line.instances[pId]) {
                            try {
                                series.removePriceLine(line.instances[pId]);
                            } catch (e) {}
                        }
                    });
                } else if (line.type === 'trendline' || line.type === 'bos' || line.type === 'choch') {
                    Object.entries(chartsRef.current).forEach(([pId, chart]) => {
                        if (chart && line.instances[pId]) {
                            try {
                                chart.removeSeries(line.instances[pId]);
                            } catch (e) {
                                console.error(`Error removing series of type ${line.type}:`, e);
                            }
                        }
                    });
                }
            }
        });
        drawnLinesRef.current = drawnLinesRef.current.filter(line => line.symbol !== activeSymbol);
        setDrawingTool(null);
        setSelectedHistoryOrder(null);
        setSelectedBacktestTrade(null);
    };

    const autoDrawSMC = async () => {
        try {
            const paneTf = paneTimeframes[activePaneId] || 'H1';
            const res = await fetch(`/api/mt5/patterns?symbol=${activeSymbol}&timeframe=${paneTf}&count=200`);
            if (!res.ok) {
                alert("ไม่สามารถดึงข้อมูลแนวรับ-แนวต้านของโครงสร้างตลาดได้");
                return;
            }
            const data = await res.json();
            if (!data.structures || data.structures.length === 0) {
                alert("ไม่พบโครงสร้าง Market Structure (BOS/CHoCH) ในประวัติราคาปัจจุบัน");
                return;
            }
            
            clearDrawings();
            
            const newLines = [];
            data.structures.forEach(struct => {
                const lineId = Date.now() + Math.random();
                const lineInstances = {};
                const color = struct.type === 'bos' ? '#00b4d8' : '#ff477e';
                const title = struct.type === 'bos' ? 'BOS' : 'CHoCH';
                
                Object.entries(chartsRef.current).forEach(([pId, chart]) => {
                    if (chart) {
                        try {
                            const lineSeries = chart.addLineSeries({
                                color: color,
                                lineWidth: 2,
                                crosshairMarkerVisible: false,
                                priceLineVisible: false,
                                lastValueVisible: false
                            });
                            
                            const points = [{ time: struct.start_time, value: struct.price }];
                            const midTime = Math.round((struct.start_time + struct.end_time) / 2);
                            if (midTime > struct.start_time && midTime < struct.end_time) {
                                points.push({ time: midTime, value: struct.price });
                            }
                            points.push({ time: struct.end_time, value: struct.price });
                            
                            lineSeries.setData(points);
                            
                            if (title) {
                                const markerTime = (midTime > struct.start_time && midTime < struct.end_time) ? midTime : struct.end_time;
                                lineSeries.setMarkers([
                                    {
                                        time: markerTime,
                                        position: 'aboveBar',
                                        color: color,
                                        shape: 'circle',
                                        size: 0.1,
                                        text: title
                                    }
                                ]);
                            }
                            
                            lineInstances[pId] = lineSeries;
                        } catch (e) {
                            console.error(`Error drawing auto SMC line on pane ${pId}:`, e);
                        }
                    }
                });
                
                newLines.push({
                    id: lineId,
                    type: struct.type,
                    price: struct.price,
                    symbol: activeSymbol,
                    points: [
                        { time: struct.start_time, price: struct.price },
                        { time: struct.end_time, price: struct.price }
                    ],
                    instances: lineInstances
                });
            });
            
            drawnLinesRef.current = newLines;
            setDrawingTool(null);
        } catch (err) {
            console.error("Error auto drawing SMC lines:", err);
            alert("เกิดข้อผิดพลาดในการตีเส้น BOS/CHoCH อัตโนมัติ: " + err.message);
        }
    };

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
    const [activeTab, setActiveTab] = useState(isPopout ? "backtest" : "positions"); // 'positions' | 'history' | 'analytics' | 'bots' | 'backtest'
    const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
    const [showChartPatterns, setShowChartPatterns] = useState(false);
    const [openPositions, setOpenPositions] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);

    // Market Intelligence News States
    const [newsData, setNewsData] = useState({
        sentiment_summary: 'neutral',
        risk_level: 'low',
        news: []
    });
    const [newsRefreshing, setNewsRefreshing] = useState(false);
    const [expandedNewsId, setExpandedNewsId] = useState(null);

    // Trading Bots State
    const [bots, setBots] = useState([]);
    const [activeBot, setActiveBot] = useState(null);
    const [botLogs, setBotLogs] = useState([]);
    const [botFormOpen, setBotFormOpen] = useState(false);
    const [botForm, setBotForm] = useState({ name: "บอทเทรดทองคำ RSI", symbol: "XAUUSD", timeframe: "M1", algorithm: "rsi_oscillator", lot_size: 0.01, sl_points: 5.0, tp_points: 10.0, pj_tp_target: "manual", use_trend_filter: false, use_atr_sizing: false, risk_percent: 1.0, allowed_sessions: "all", use_news_filter: false });
    const [selectedAlgos, setSelectedAlgos] = useState(["rsi_oscillator"]);
    const [signalMode, setSignalMode] = useState("or");
    const [activeRunningBotsCount, setActiveRunningBotsCount] = useState(0);
    const [editingBotId, setEditingBotId] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});

    // --- Backtesting States ---
    const [backtestForm, setBacktestForm] = useState({
        symbol: "XAUUSD",
        timeframe: "H1",
        count: 200,
        lot_size: 0.1,
        sl_points: 5.0,
        tp_points: 10.0,
        initial_balance: 10000.0,
        signal_mode: "or",
        allowed_sessions: "all"
    });
    const [backtestSelectedAlgos, setBacktestSelectedAlgos] = useState(["rsi_oscillator"]);
    const [backtestResult, setBacktestResult] = useState(null);
    const [backtestLoading, setBacktestLoading] = useState(false);
    const [backtestSubTab, setBacktestSubTab] = useState("stats"); // 'stats' | 'price' | 'equity' | 'deals'
    const [selectedBacktestTrade, setSelectedBacktestTrade] = useState(null);
    const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState("all"); // 'day' | 'week' | 'month' | 'year' | 'all'

    const backtestChartContainerRef = useRef(null);
    const backtestPriceLinesRef = useRef([]);
    const backtestChartRef = useRef(null);
    const backtestAreaSeriesRef = useRef(null);

    const backtestPriceChartContainerRef = useRef(null);
    const backtestPriceChartRef = useRef(null);
    const backtestCandlestickSeriesRef = useRef(null);

    // Modal Control
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ login: "", password: "", server: "", auto_connect: false });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsAlert, setSettingsAlert] = useState(null); // { type: 'success'|'error', text: '' }

    // Multi-Account secure settings states
    const [accounts, setAccounts] = useState([]);
    const [accountFormOpen, setAccountFormOpen] = useState(false);
    const [accountForm, setAccountForm] = useState({ id: null, login: "", password: "", server: "", auto_connect: false, is_active: false });
    const [accountFormLoading, setAccountFormLoading] = useState(false);

    // Chatbot States
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'bot',
            text: `สวัสดีครับ! ผมคือ **Giant Slayer AI Assistant** ผู้ช่วยเทรดอัจฉริยะส่วนตัวของคุณ 🤖📊\n\nผมสามารถช่วยเหลือคุณดึงข้อมูลแบบเรียลไทม์จาก MT5 Trader และระบบบอทเทรดได้ครับ โดยคุณสามารถพิมพ์สอบถามผม หรือคลิกที่ตัวเลือกด่วนด้านล่างได้เลยครับ!`,
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
    const containersRef = useRef({});
    const chartsRef = useRef({});
    const candlestickSeriesesRef = useRef({});
    const swingSeriesesRef = useRef({});
    const chatbotEndRef = useRef(null);
    const watchlistRef = useRef([]);
    const historyPriceLinesRef = useRef({});
    const baseMarkersRef = useRef({});

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
        fetchNews();
        fetchAccounts();

        // 1-second interval for prices & dynamic ticks
        const priceInterval = setInterval(() => {
            fetchPrices();
        }, 1000);

        // 5-second interval for account metrics, open positions, trade history, and bots
        const accountInterval = setInterval(() => {
            fetchStatus();
            fetchAccount();
            fetchPositions();
            fetchHistory();
            fetchBots();
            fetchNews();
            fetchAccounts();
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

    // Fetch accounts when settings modal opens
    useEffect(() => {
        if (settingsOpen) {
            fetchAccounts();
        }
    }, [settingsOpen]);

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

    // Helper to load historical candles for a specific chart pane
    const loadChartDataForPane = async (paneId, symbol, tf) => {
        try {
            const res = await fetch(`/api/mt5/candles?symbol=${symbol}&timeframe=${tf}&count=200`);
            if (res.ok) {
                const data = await res.json();
                const series = candlestickSeriesesRef.current[paneId];
                const chart = chartsRef.current[paneId];
                if (data && data.length > 0 && series && chart) {
                    series.setData(data);
                    chart.timeScale().fitContent();
                }
            }
        } catch (err) {
            console.error(`Failed to load chart data for pane ${paneId}:`, err);
        }
    };

    // Helper to consolidate base patterns markers and selected order markers
    const updateChartMarkers = (paneId) => {
        const series = candlestickSeriesesRef.current[paneId];
        if (!series) return;

        let markers = [...(baseMarkersRef.current[paneId] || [])];

        // If a history order is selected, align and add its markers
        if (selectedHistoryOrder && selectedHistoryOrder.symbol === activeSymbol) {
            const paneTf = paneTimeframes[paneId] || 'H1';
            const decimals = selectedHistoryOrder.symbol.includes('EURUSD') ? 5 : 2;
            const formatP = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

            const parseToUnix = (dateStr) => {
                if (!dateStr) return null;
                const parts = dateStr.split(/[- :\/]/);
                if (parts.length >= 6) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10) - 1; // 0-based month
                    const d = parseInt(parts[2], 10);
                    const hr = parseInt(parts[3], 10);
                    const min = parseInt(parts[4], 10);
                    const sec = parseInt(parts[5], 10);
                    return Math.floor(Date.UTC(y, m, d, hr, min, sec) / 1000);
                }
                const parsed = new Date(dateStr.replace(/-/g, '/'));
                return Math.floor(parsed.getTime() / 1000);
            };

            const alignTimeToTimeframe = (timestamp, tf) => {
                const spacingMap = {
                    "M1": 60,
                    "M5": 300,
                    "M15": 900,
                    "M30": 1800,
                    "H1": 3600,
                    "H4": 14400,
                    "D1": 86400
                };
                const seconds = spacingMap[tf] || 3600;
                return Math.floor(timestamp / seconds) * seconds;
            };

            const openTimeUnix = parseToUnix(selectedHistoryOrder.open_time);
            const closeTimeUnix = parseToUnix(selectedHistoryOrder.close_time);
            const alignedOpenTime = openTimeUnix ? alignTimeToTimeframe(openTimeUnix, paneTf) : null;
            const alignedCloseTime = closeTimeUnix ? alignTimeToTimeframe(closeTimeUnix, paneTf) : null;

            if (selectedHistoryOrder.open_price && alignedOpenTime) {
                markers.push({
                    time: alignedOpenTime,
                    position: selectedHistoryOrder.type === 'buy' ? 'belowBar' : 'aboveBar',
                    color: selectedHistoryOrder.type === 'buy' ? '#2ecc71' : '#e74c3c',
                    shape: selectedHistoryOrder.type === 'buy' ? 'arrowUp' : 'arrowDown',
                    size: 1.5,
                    text: `${selectedHistoryOrder.type.toUpperCase()} #${selectedHistoryOrder.ticket} @ ${formatP(selectedHistoryOrder.open_price)}`
                });
            }

            if (selectedHistoryOrder.close_price && alignedCloseTime) {
                markers.push({
                    time: alignedCloseTime,
                    position: selectedHistoryOrder.type === 'buy' ? 'aboveBar' : 'belowBar',
                    color: selectedHistoryOrder.profit >= 0 ? '#2ecc71' : '#e74c3c',
                    shape: 'pin',
                    size: 1.5,
                    text: `CLOSE #${selectedHistoryOrder.ticket} @ ${formatP(selectedHistoryOrder.close_price)} (${selectedHistoryOrder.profit >= 0 ? '+' : ''}${Number(selectedHistoryOrder.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
                });
            }
        }

        // Sort markers chronologically to avoid lightweight-charts warnings/errors
        markers.sort((a, b) => a.time - b.time);
        series.setMarkers(markers);
    };

    // Helper to load patterns and swing ZigZag lines for a specific chart pane
    const loadPatternsForPane = async (paneId, symbol, tf) => {
        try {
            const stochParams = `&stoch_k=${stochRsiSettings.k}&stoch_d=${stochRsiSettings.d}&rsi_len=${stochRsiSettings.rsiLength}&stoch_len=${stochRsiSettings.stochasticLength}&rsi_source=${stochRsiSettings.rsiSource.toLowerCase()}&stoch_tf=${stochRsiSettings.timeframe}&wait_close=${stochRsiSettings.waitClose}`;
            const macdParams = `&macd_fast=${macdSettings.fastPeriod}&macd_slow=${macdSettings.slowPeriod}`;
            const res = await fetch(`/api/mt5/patterns?symbol=${symbol}&timeframe=${tf}&count=200${stochParams}${macdParams}`);
            if (res.ok) {
                const data = await res.json();
                
                // Capture indicators (RSI, StochRSI, MACD 4C) if this is the active pane
                if (paneId === activePaneId) {
                    if (data.indicators) {
                        setStochRsiData({
                            rsi: data.indicators.rsi,
                            k: data.indicators.stoch_rsi_k,
                            d: data.indicators.stoch_rsi_d,
                            macd_val: data.indicators.macd_4c ? data.indicators.macd_4c.value : null,
                            macd_color: data.indicators.macd_4c ? data.indicators.macd_4c.color : null,
                            macd_history: data.indicators.macd_4c ? data.indicators.macd_4c.history : [],
                            status: 'success'
                        });
                    } else {
                        setStochRsiData({ 
                            rsi: null, k: null, d: null, 
                            macd_val: null, macd_color: null, macd_history: [], 
                            status: 'no_data' 
                        });
                    }
                }

                const swingSeries = swingSeriesesRef.current[paneId];
                const series = candlestickSeriesesRef.current[paneId];
                
                // 1. Draw ZigZag Line if we have swings
                if (showChartPatterns && data.swings && data.swings.length > 0 && swingSeries) {
                    const lineData = data.swings.map(s => ({
                        time: s.time,
                        value: s.price
                    }));
                    lineData.sort((a, b) => a.time - b.time);
                    swingSeries.setData(lineData);
                } else if (swingSeries) {
                    swingSeries.setData([]);
                }
                
                // 2. Add Markers for Elliott Wave, Harmonic, and Swings
                if (series) {
                    const markers = [];
                    
                    if (showChartPatterns) {
                        if (data.swings) {
                            data.swings.forEach(s => {
                                markers.push({
                                    time: s.time,
                                    position: s.type === 'high' ? 'aboveBar' : 'belowBar',
                                    color: s.type === 'high' ? '#e74c3c' : '#2ecc71',
                                    shape: 'circle',
                                    size: 0.5,
                                    text: ''
                                });
                            });
                        }
                        
                        if (data.harmonic && data.harmonic.points) {
                            const pts = data.harmonic.points;
                            const labels = ['X', 'A', 'B', 'C', 'D'];
                            pts.forEach((pt, idx) => {
                                markers.push({
                                    time: pt.time,
                                    position: pt.type === 'high' ? 'aboveBar' : 'belowBar',
                                    color: '#ffb703',
                                    shape: idx === 4 ? 'pin' : 'square',
                                    text: labels[idx]
                                });
                            });
                            
                            const D = pts[4];
                            markers.push({
                                time: D.time,
                                position: D.type === 'high' ? 'aboveBar' : 'belowBar',
                                color: data.harmonic.signal === 'buy' ? '#2ecc71' : '#e74c3c',
                                shape: data.harmonic.signal === 'buy' ? 'arrowUp' : 'arrowDown',
                                text: `🎯 ${data.harmonic.pattern} (${data.harmonic.signal.toUpperCase()})`
                            });
                        }
                        
                        if (data.elliott && data.elliott.points) {
                            const pts = data.elliott.points;
                            pts.forEach((pt, idx) => {
                                markers.push({
                                    time: pt.time,
                                    position: pt.type === 'high' ? 'aboveBar' : 'belowBar',
                                    color: '#00b4d8',
                                    shape: 'circle',
                                    text: `${idx}`
                                });
                            });
                            
                            const lastPt = pts[pts.length - 1];
                            markers.push({
                                time: lastPt.time,
                                position: lastPt.type === 'high' ? 'aboveBar' : 'belowBar',
                                color: data.elliott.signal === 'buy' ? '#2ecc71' : '#e74c3c',
                                shape: data.elliott.signal === 'buy' ? 'arrowUp' : 'arrowDown',
                                text: `🌊 ${data.elliott.pattern} (${data.elliott.signal.toUpperCase()})`
                            });
                        }
                    }
                    
                    markers.sort((a, b) => a.time - b.time);
                    baseMarkersRef.current[paneId] = markers;
                    updateChartMarkers(paneId);
                }
            }
        } catch (err) {
            console.error(`Failed to load pattern data for pane ${paneId}:`, err);
        }
    };

    // Consolidated Multi-Timeframe Chart Initializer
    useEffect(() => {
        const activePaneIds = chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3];
        
        // Destroy old charts to prevent duplicate canvases and memory leaks
        Object.entries(chartsRef.current).forEach(([pId, chart]) => {
            if (chart) {
                try {
                    chart.remove();
                } catch (e) {
                    console.error(`Error destroying chart ${pId}:`, e);
                }
            }
        });
        
        chartsRef.current = {};
        candlestickSeriesesRef.current = {};
        swingSeriesesRef.current = {};

        // Initialize active chart panes
        activePaneIds.forEach((paneId) => {
            const container = containersRef.current[paneId];
            if (!container) return;

            const chart = LightweightCharts.createChart(container, {
                layout: {
                    background: { type: LightweightCharts.ColorType.Solid, color: '#0c1220' },
                    textColor: '#cbd5e1',
                    fontSize: 12,
                    fontFamily: 'Inter, Outfit, sans-serif',
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
                        style: 2,
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

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#2ecc71',
                downColor: '#e74c3c',
                borderUpColor: '#2ecc71',
                borderDownColor: '#e74c3c',
                wickUpColor: '#2ecc71',
                wickDownColor: '#e74c3c',
            });

            const swingSeries = chart.addLineSeries({
                color: 'rgba(255, 183, 3, 0.45)',
                lineWidth: 2,
                lineType: 0,
                lineStyle: 2,
            });

            chartsRef.current[paneId] = chart;
            candlestickSeriesesRef.current[paneId] = candlestickSeries;
            swingSeriesesRef.current[paneId] = swingSeries;

            // Render existing drawings on this pane
            drawnLinesRef.current.forEach(line => {
                if (line.symbol !== activeSymbol) return;
                if (!line.instances) line.instances = {};

                if (line.type === 'horizontal') {
                    line.instances[paneId] = candlestickSeries.createPriceLine({
                        price: line.price,
                        color: '#ff4d4d',
                        lineWidth: 2,
                        lineStyle: 2,
                        axisLabelVisible: true,
                        title: 'Horizontal'
                    });
                } else if (line.type === 'bos' || line.type === 'choch' || line.type === 'trendline') {
                    const color = line.type === 'bos' ? '#00b4d8' : line.type === 'choch' ? '#ff477e' : '#ffb703';
                    const title = line.type === 'bos' ? 'BOS' : line.type === 'choch' ? 'CHoCH' : '';
                    const lineSeries = chart.addLineSeries({
                        color: color,
                        lineWidth: 2,
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                        lastValueVisible: false
                    });
                    
                    const tA = line.points[0].time;
                    const tB = line.points[1].time;
                    const pA = line.points[0].price;
                    const pB = line.points[1].price;
                    
                    const points = [{ time: tA, value: pA }];
                    const midTime = Math.round((tA + tB) / 2);
                    if (midTime > tA && midTime < tB) {
                        const midPrice = (pA + pB) / 2;
                        points.push({ time: midTime, value: midPrice });
                    }
                    points.push({ time: tB, value: pB });
                    
                    lineSeries.setData(points);
                    
                    if (title) {
                        const markerTime = (midTime > tA && midTime < tB) ? midTime : tB;
                        lineSeries.setMarkers([
                            {
                                time: markerTime,
                                position: 'aboveBar',
                                color: color,
                                shape: 'circle',
                                size: 0.1,
                                text: title
                            }
                        ]);
                    }
                    
                    line.instances[paneId] = lineSeries;
                }
            });

            // Subcribe chart pane clicks for synchronized drawings
            chart.subscribeClick((param) => {
                if (!param || !param.point || !param.time) return;
                const time = param.time;
                const price = candlestickSeries.coordinateToPrice(param.point.y);
                if (price === null) return;

                const tool = drawingToolRef.current;
                if (!tool) return;

                if (tool === 'horizontal') {
                    const lineId = Date.now();
                    const lineInstances = {};
                    const color = '#ff4d4d';
                    const title = 'Horizontal';

                    // Create price line on all active candlestick series synchronously
                    Object.entries(candlestickSeriesesRef.current).forEach(([pId, series]) => {
                        if (series) {
                            try {
                                const priceLine = series.createPriceLine({
                                    price: price,
                                    color: color,
                                    lineWidth: 2,
                                    lineStyle: 2,
                                    axisLabelVisible: true,
                                    title: title
                                });
                                lineInstances[pId] = priceLine;
                            } catch (e) {
                                console.error(`Error drawing price line on pane ${pId}:`, e);
                            }
                        }
                    });

                    drawnLinesRef.current.push({
                        id: lineId,
                        type: 'horizontal',
                        price: price,
                        symbol: activeSymbol,
                        instances: lineInstances
                    });
                } else if (tool === 'trendline' || tool === 'bos' || tool === 'choch') {
                    if (!drawingStartPointRef.current) {
                        setDrawingStartPoint({ time, price });
                    } else {
                        const pA = drawingStartPointRef.current;
                        // Snap price to first point's price if drawing BOS/CHoCH to make it perfectly horizontal
                        const finalPrice = (tool === 'bos' || tool === 'choch') ? pA.price : price;
                        const pB = { time, price: finalPrice };
                        const lineId = Date.now();
                        const lineInstances = {};
                        
                        const color = tool === 'bos' ? '#00b4d8' : tool === 'choch' ? '#ff477e' : '#ffb703';
                        const title = tool === 'bos' ? 'BOS' : tool === 'choch' ? 'CHoCH' : '';

                        // Create line series on all active charts synchronously
                        Object.entries(chartsRef.current).forEach(([pId, c]) => {
                            if (c) {
                                try {
                                    const lineSeries = c.addLineSeries({
                                        color: color,
                                        lineWidth: 2,
                                        crosshairMarkerVisible: false,
                                        priceLineVisible: false,
                                        lastValueVisible: false
                                    });
                                    
                                    const points = [{ time: pA.time, value: pA.price }];
                                    const midTime = Math.round((pA.time + pB.time) / 2);
                                    if (midTime > pA.time && midTime < pB.time) {
                                        points.push({ time: midTime, value: finalPrice });
                                    }
                                    points.push({ time: pB.time, value: finalPrice });
                                    
                                    lineSeries.setData(points);
                                    
                                    if (title) {
                                        const markerTime = (midTime > pA.time && midTime < pB.time) ? midTime : pB.time;
                                        lineSeries.setMarkers([
                                            {
                                                time: markerTime,
                                                position: 'aboveBar',
                                                color: color,
                                                shape: 'circle',
                                                size: 0.1,
                                                text: title
                                            }
                                        ]);
                                    }
                                    
                                    lineInstances[pId] = lineSeries;
                                } catch (e) {
                                    console.error(`Error drawing line series on pane ${pId}:`, e);
                                }
                            }
                        });

                        drawnLinesRef.current.push({
                            id: lineId,
                            type: tool,
                            points: [pA, pB],
                            symbol: activeSymbol,
                            instances: lineInstances
                        });

                        setDrawingStartPoint(null);
                    }
                }
            });

            // Trigger initial chart pane candle/pattern data loads
            const paneTf = paneTimeframes[paneId] || 'H1';
            loadChartDataForPane(paneId, activeSymbol, paneTf);
            loadPatternsForPane(paneId, activeSymbol, paneTf);
        });

        // Dynamic multi-pane resize handler
        const handleResize = () => {
            activePaneIds.forEach(paneId => {
                const chart = chartsRef.current[paneId];
                const container = containersRef.current[paneId];
                if (chart && container) {
                    chart.applyOptions({
                        width: container.clientWidth,
                        height: container.clientHeight
                    });
                }
            });
        };

        window.addEventListener('resize', handleResize);
        
        // Fire resize handler slightly after mount to fit to layout changes perfectly
        const resizeTimeout = setTimeout(handleResize, 150);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            
            // Clean up charts on unmount or dependency trigger
            Object.values(chartsRef.current).forEach(chart => {
                if (chart) {
                    try {
                        chart.remove();
                    } catch (e) {}
                }
            });
        };
    }, [activeSymbol, chartLayout, JSON.stringify(paneTimeframes)]);

    // Multi-Timeframe live ticks updater
    useEffect(() => {
        const updateLastCandles = async () => {
            const activePaneIds = chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3];
            
            for (const pId of activePaneIds) {
                const series = candlestickSeriesesRef.current[pId];
                if (!series) continue;

                const paneTf = paneTimeframes[pId] || 'H1';
                try {
                    const res = await fetch(`/api/mt5/candles?symbol=${activeSymbol}&timeframe=${paneTf}&count=1`);
                    if (res.ok) {
                        const candles = await res.json();
                        if (candles && candles.length > 0) {
                            const candle = candles[0];
                            series.update({
                                time: candle.time,
                                open: candle.open,
                                high: candle.high,
                                low: candle.low,
                                close: candle.close
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Error updating live candle for pane ${pId}:`, err);
                }
            }
        };

        const liveUpdateInterval = setInterval(updateLastCandles, 1000);
        return () => clearInterval(liveUpdateInterval);
    }, [activeSymbol, chartLayout, JSON.stringify(paneTimeframes)]);

    // Multi-Timeframe live patterns & ZigZag swing updater
    useEffect(() => {
        const activePaneIds = chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3];
        
        const updateAllPatterns = () => {
            activePaneIds.forEach(pId => {
                const paneTf = paneTimeframes[pId] || 'H1';
                loadPatternsForPane(pId, activeSymbol, paneTf);
            });
        };

        updateAllPatterns();
        const patternsInterval = setInterval(updateAllPatterns, 5000);
        return () => clearInterval(patternsInterval);
    }, [activeSymbol, chartLayout, JSON.stringify(paneTimeframes), activePaneId, JSON.stringify(stochRsiSettings), JSON.stringify(macdSettings), showChartPatterns]);

    // --- Backtesting Equity Curve Chart Initializer ---
    useEffect(() => {
        if (activeTab !== 'backtest' || backtestSubTab !== 'equity' || !backtestResult || !backtestResult.equity_curve || backtestLoading) {
            if (backtestChartRef.current) {
                try {
                    backtestChartRef.current.remove();
                } catch (e) {}
                backtestChartRef.current = null;
                backtestAreaSeriesRef.current = null;
            }
            return;
        }

        const container = backtestChartContainerRef.current;
        if (!container) return;

        // Destroy any existing backtest chart first to avoid duplicates
        if (backtestChartRef.current) {
            try {
                backtestChartRef.current.remove();
            } catch (e) {}
            backtestChartRef.current = null;
            backtestAreaSeriesRef.current = null;
        }

        const chart = LightweightCharts.createChart(container, {
            layout: {
                background: { type: LightweightCharts.ColorType.Solid, color: '#0c1220' },
                textColor: '#cbd5e1',
                fontSize: 12,
                fontFamily: 'Inter, Outfit, sans-serif',
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
                    style: 2,
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

        const areaSeries = chart.addAreaSeries({
            topColor: 'rgba(255, 183, 3, 0.4)',
            bottomColor: 'rgba(255, 183, 3, 0.0)',
            lineColor: '#ffb703',
            lineWidth: 2,
        });

        // Format equity curve data
        const chartData = backtestResult.equity_curve.map(item => ({
            time: item.time,
            value: item.value
        }));
        
        // Sort chronologically just in case
        chartData.sort((a, b) => a.time - b.time);
        areaSeries.setData(chartData);
        chart.timeScale().fitContent();

        backtestChartRef.current = chart;
        backtestAreaSeriesRef.current = areaSeries;

        const resizeObserver = new ResizeObserver(() => {
            if (chart && container) {
                chart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chart) {
                try {
                    chart.remove();
                } catch (e) {}
            }
            backtestChartRef.current = null;
            backtestAreaSeriesRef.current = null;
        };
    }, [activeTab, backtestSubTab, backtestResult, backtestLoading]);

    // --- Backtesting Price Candlestick Chart Initializer ---
    useEffect(() => {
        if (activeTab !== 'backtest' || backtestSubTab !== 'price' || !backtestResult || !backtestResult.candles || backtestLoading) {
            if (backtestPriceChartRef.current) {
                try {
                    backtestPriceChartRef.current.remove();
                } catch (e) {}
                backtestPriceChartRef.current = null;
                backtestCandlestickSeriesRef.current = null;
            }
            return;
        }

        const container = backtestPriceChartContainerRef.current;
        if (!container) return;

        // Destroy any existing backtest price chart first to avoid duplicates
        if (backtestPriceChartRef.current) {
            try {
                backtestPriceChartRef.current.remove();
            } catch (e) {}
            backtestPriceChartRef.current = null;
            backtestCandlestickSeriesRef.current = null;
        }

        const chart = LightweightCharts.createChart(container, {
            layout: {
                background: { type: LightweightCharts.ColorType.Solid, color: '#0c1220' },
                textColor: '#cbd5e1',
                fontSize: 12,
                fontFamily: 'Inter, Outfit, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(38, 50, 80, 0.2)' },
                horzLines: { color: 'rgba(38, 50, 80, 0.2)' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: { color: '#ffb703', width: 1, style: 2 },
                horzLine: { color: '#ffb703', width: 1, style: 2 }
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

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#2ecc71',
            downColor: '#e74c3c',
            borderUpColor: '#2ecc71',
            borderDownColor: '#e74c3c',
            wickUpColor: '#2ecc71',
            wickDownColor: '#e74c3c',
        });

        // Format candlestick data
        const candleData = backtestResult.candles.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
        }));

        candleData.sort((a, b) => a.time - b.time);
        candlestickSeries.setData(candleData);

        // Do not generate buy/sell markers overlay by default to keep the graph empty
        candlestickSeries.setMarkers([]);

        chart.timeScale().fitContent();

        backtestPriceChartRef.current = chart;
        backtestCandlestickSeriesRef.current = candlestickSeries;

        const resizeObserver = new ResizeObserver(() => {
            if (chart && container) {
                chart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (chart) {
                try {
                    chart.remove();
                } catch (e) {}
            }
            backtestPriceChartRef.current = null;
            backtestCandlestickSeriesRef.current = null;
        };
    }, [activeTab, backtestSubTab, backtestResult, backtestLoading]);

    // Draw backtest trade TP, SL, Open, Close price points, and PnL when selectedBacktestTrade changes
    useEffect(() => {
        let oldSeries = [];
        let oldPriceLines = [];
        if (backtestPriceLinesRef.current) {
            if (Array.isArray(backtestPriceLinesRef.current)) {
                oldSeries = backtestPriceLinesRef.current;
            } else {
                oldSeries = backtestPriceLinesRef.current.series || [];
                oldPriceLines = backtestPriceLinesRef.current.priceLines || [];
            }
        }

        oldSeries.forEach(series => {
            if (backtestPriceChartRef.current) {
                try {
                    backtestPriceChartRef.current.removeSeries(series);
                } catch (e) {}
            }
        });

        if (backtestCandlestickSeriesRef.current) {
            // Remove previous price lines
            oldPriceLines.forEach(pl => {
                try {
                    backtestCandlestickSeriesRef.current.removePriceLine(pl);
                } catch (e) {}
            });
            // Clear markers on the main candlestick series
            backtestCandlestickSeriesRef.current.setMarkers([]);
        }
        backtestPriceLinesRef.current = { series: [], priceLines: [] };

        if (!selectedBacktestTrade || !backtestPriceChartRef.current) return;

        const chart = backtestPriceChartRef.current;
        const decimals = (backtestForm.symbol && backtestForm.symbol.includes('EURUSD')) ? 5 : 2;
        const formatP = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

        const openTime = selectedBacktestTrade.open_timestamp;
        const closeTime = selectedBacktestTrade.close_timestamp;
        
        const seriesList = [];
        const priceLinesList = [];
        const markersList = [];

        // 1. Open Marker
        if (selectedBacktestTrade.open_price && openTime) {
            markersList.push({
                time: openTime,
                position: selectedBacktestTrade.type === 'buy' ? 'belowBar' : 'aboveBar',
                color: selectedBacktestTrade.type === 'buy' ? '#2ecc71' : '#e74c3c',
                shape: selectedBacktestTrade.type === 'buy' ? 'arrowUp' : 'arrowDown',
                size: 1.5,
                text: `${selectedBacktestTrade.type.toUpperCase()} #${selectedBacktestTrade.ticket} @ ${formatP(selectedBacktestTrade.open_price)}`
            });
        }

        // 2. Close Marker
        if (selectedBacktestTrade.close_price && closeTime) {
            markersList.push({
                time: closeTime,
                position: selectedBacktestTrade.type === 'buy' ? 'aboveBar' : 'belowBar',
                color: selectedBacktestTrade.profit >= 0 ? '#2ecc71' : '#e74c3c',
                shape: 'pin',
                size: 1.5,
                text: `CLOSE #${selectedBacktestTrade.ticket} @ ${formatP(selectedBacktestTrade.close_price)} (${selectedBacktestTrade.profit >= 0 ? '+' : ''}${formatP(selectedBacktestTrade.profit)} USD)`
            });
        }

        if (backtestCandlestickSeriesRef.current && markersList.length > 0) {
            markersList.sort((a, b) => a.time - b.time);
            backtestCandlestickSeriesRef.current.setMarkers(markersList);
        }

        // 3. SL Price Line
        if (selectedBacktestTrade.sl && selectedBacktestTrade.sl > 0 && backtestCandlestickSeriesRef.current) {
            const slPriceLine = backtestCandlestickSeriesRef.current.createPriceLine({
                price: selectedBacktestTrade.sl,
                color: '#e74c3c',
                lineWidth: 1.5,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                axisLabelVisible: true,
                title: `SL: ${formatP(selectedBacktestTrade.sl)}`
            });
            priceLinesList.push(slPriceLine);
        }

        // 4. TP Price Line
        if (selectedBacktestTrade.tp && selectedBacktestTrade.tp > 0 && backtestCandlestickSeriesRef.current) {
            const tpPriceLine = backtestCandlestickSeriesRef.current.createPriceLine({
                price: selectedBacktestTrade.tp,
                color: '#2ecc71',
                lineWidth: 1.5,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                axisLabelVisible: true,
                title: `TP: ${formatP(selectedBacktestTrade.tp)}`
            });
            priceLinesList.push(tpPriceLine);
        }

        // 4.1 Entry Price Line
        if (selectedBacktestTrade.open_price && backtestCandlestickSeriesRef.current) {
            const openPriceLine = backtestCandlestickSeriesRef.current.createPriceLine({
                price: selectedBacktestTrade.open_price,
                color: '#00b4d8',
                lineWidth: 1.5,
                lineStyle: LightweightCharts.LineStyle.Dotted,
                axisLabelVisible: true,
                title: `Entry: ${formatP(selectedBacktestTrade.open_price)}`
            });
            priceLinesList.push(openPriceLine);
        }

        // 4.2 Close Price Line (with PnL)
        if (selectedBacktestTrade.close_price && backtestCandlestickSeriesRef.current) {
            const closePriceLine = backtestCandlestickSeriesRef.current.createPriceLine({
                price: selectedBacktestTrade.close_price,
                color: selectedBacktestTrade.profit >= 0 ? '#2ecc71' : '#e74c3c',
                lineWidth: 1.5,
                lineStyle: LightweightCharts.LineStyle.Dotted,
                axisLabelVisible: true,
                title: `Close: ${formatP(selectedBacktestTrade.close_price)} (PnL: ${selectedBacktestTrade.profit >= 0 ? '+' : ''}${formatP(selectedBacktestTrade.profit)} USD)`
            });
            priceLinesList.push(closePriceLine);
        }

        // 5. Connect Open & Close with a dashed line (green/red based on win/loss)
        if (selectedBacktestTrade.open_price && selectedBacktestTrade.close_price && openTime && closeTime) {
            const pathSeries = chart.addLineSeries({
                color: selectedBacktestTrade.profit >= 0 ? '#2ecc71' : '#e74c3c',
                lineWidth: 2,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false
            });
            pathSeries.setData([
                { time: openTime, value: selectedBacktestTrade.open_price },
                { time: closeTime, value: selectedBacktestTrade.close_price }
            ]);
            seriesList.push(pathSeries);
        }

        backtestPriceLinesRef.current = { series: seriesList, priceLines: priceLinesList };
    }, [selectedBacktestTrade, activeTab, backtestSubTab, backtestResult, backtestLoading]);

    // Resizing trigger for backtest chart on sidebars animation toggles
    useEffect(() => {
        const resizeBacktestCharts = () => {
            const chart = backtestChartRef.current;
            const container = backtestChartContainerRef.current;
            if (chart && container) {
                chart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }

            const priceChart = backtestPriceChartRef.current;
            const priceContainer = backtestPriceChartContainerRef.current;
            if (priceChart && priceContainer) {
                priceChart.applyOptions({
                    width: priceContainer.clientWidth,
                    height: priceContainer.clientHeight
                });
            }
        };
        
        const intervals = [50, 100, 150, 200, 250, 300, 350, 500, 700];
        const timers = intervals.map(ms => setTimeout(resizeBacktestCharts, ms));
        
        return () => timers.forEach(clearTimeout);
    }, [isWatchlistCollapsed, isExecutionCollapsed, activeTab, isTerminalExpanded, isTerminalCollapsed, backtestSubTab, backtestResult]);

    // --- API Interactions ---

    // --- Backtesting API Interaction ---
    const handleRunBacktest = async (e) => {
        if (e) e.preventDefault();
        if (backtestSelectedAlgos.length === 0) {
            alert("กรุณาเลือกกลยุทธ์อย่างน้อย 1 กลยุทธ์เพื่อทำการทดสอบย้อนหลัง");
            return;
        }

        setBacktestLoading(true);
        setBacktestResult(null);
        setSelectedBacktestTrade(null);

        try {
            const res = await fetch("/api/backtest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: backtestForm.symbol,
                    timeframe: backtestForm.timeframe,
                    count: parseInt(backtestForm.count) || 200,
                    algorithm: backtestSelectedAlgos.join(","),
                    signal_mode: backtestForm.signal_mode,
                    lot_size: parseFloat(backtestForm.lot_size) || 0.1,
                    sl_points: parseFloat(backtestForm.sl_points) || 0.0,
                    tp_points: parseFloat(backtestForm.tp_points) || 0.0,
                    initial_balance: parseFloat(backtestForm.initial_balance) || 10000.0,
                    allowed_sessions: backtestForm.allowed_sessions || "all"
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBacktestResult(data);
            } else {
                alert(`ล้มเหลวในการรัน backtest: ${data.detail || "Unknown error"}`);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ${err.message}`);
        } finally {
            setBacktestLoading(false);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch("/api/news");
            if (res.ok) {
                const data = await res.json();
                setNewsData(data);
            }
        } catch (err) {
            console.error("Error fetching news:", err);
        }
    };

    const handleRefreshNews = async () => {
        setNewsRefreshing(true);
        try {
            const res = await fetch("/api/news/refresh", { method: "POST" });
            if (res.ok) {
                await fetchNews();
            } else {
                alert("เกิดข้อผิดพลาดในการอัปเดตข่าวสาร");
            }
        } catch (err) {
            alert("ไม่สามารถติดต่อหลังบ้านเพื่อดึงข่าวได้: " + err.message);
        } finally {
            setNewsRefreshing(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/mt5/accounts");
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    const handleSaveAccount = async (e) => {
        if (e) e.preventDefault();
        setAccountFormLoading(true);
        setSettingsAlert(null);

        const isEdit = !!accountForm.id;
        const url = isEdit ? `/api/mt5/accounts/${accountForm.id}` : "/api/mt5/accounts";
        const method = isEdit ? "PUT" : "POST";

        try {
            const payload = {
                server: accountForm.server,
                auto_connect: accountForm.auto_connect
            };

            if (!isEdit) {
                payload.login = parseInt(accountForm.login);
                payload.password = accountForm.password;
                payload.is_active = accountForm.is_active;
            } else if (accountForm.password && accountForm.password.trim() !== "") {
                payload.password = accountForm.password;
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setSettingsAlert({ type: "success", text: isEdit ? "แก้ไขข้อมูลพอร์ตสำเร็จเรียบร้อย!" : "เพิ่มพอร์ต MT5 Trader ใหม่ลงในระบบสำเร็จเรียบร้อย!" });
                setAccountFormOpen(false);
                setAccountForm({ id: null, login: "", password: "", server: "", auto_connect: false, is_active: false });
                await fetchAccounts();
                await fetchStatus();
                await fetchAccount();
                await fetchPositions();
                setTimeout(() => setSettingsAlert(null), 3000);
            } else {
                setSettingsAlert({ type: "error", text: `ล้มเหลว: ${data.detail || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"}` });
            }
        } catch (err) {
            setSettingsAlert({ type: "error", text: `เกิดข้อผิดพลาด: ${err.message}` });
        } finally {
            setAccountFormLoading(false);
        }
    };

    const handleActivateAccount = async (accountId, loginNum) => {
        setSettingsLoading(true);
        setSettingsAlert(null);
        try {
            const res = await fetch(`/api/mt5/accounts/${accountId}/activate`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSettingsAlert({ type: "success", text: `สลับเปิดใช้งานพอร์ตหมายเลข ${loginNum} และเชื่อมต่อ MT5 สำเร็จ!` });
                await fetchAccounts();
                await fetchStatus();
                await fetchAccount();
                await fetchPositions();
                setTimeout(() => setSettingsAlert(null), 3000);
            } else {
                setSettingsAlert({ type: "error", text: `สลับบัญชีผิดพลาด: ${data.detail}` });
            }
        } catch (err) {
            setSettingsAlert({ type: "error", text: `สลับบัญชีล้มเหลว: ${err.message}` });
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleDeleteAccount = async (accountId, loginNum) => {
        if (!confirm(`คุณต้องการลบพอร์ต MT5 Trader หมายเลข ${loginNum} ออกจากระบบความปลอดภัยใช่หรือไม่?`)) return;
        setSettingsAlert(null);
        try {
            const res = await fetch(`/api/mt5/accounts/${accountId}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setSettingsAlert({ type: "success", text: "ลบพอร์ตออกจากระบบจัดการความปลอดภัยเรียบร้อยแล้ว" });
                await fetchAccounts();
                await fetchStatus();
                await fetchAccount();
                await fetchPositions();
                setTimeout(() => setSettingsAlert(null), 3000);
            } else {
                setSettingsAlert({ type: "error", text: `ลบพอร์ตล้มเหลว: ${data.detail}` });
            }
        } catch (err) {
            setSettingsAlert({ type: "error", text: `เกิดข้อผิดพลาดในการลบพอร์ต: ${err.message}` });
        }
    };

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

    const handleAddWatchlist = async () => {
        if (!addWatchlistForm.symbol || !addWatchlistForm.symbol.trim()) {
            alert("กรุณากรอกสัญลักษณ์สินค้า (Symbol)");
            return;
        }
        if (!addWatchlistForm.name || !addWatchlistForm.name.trim()) {
            alert("กรุณากรอกชื่อสินค้า (Name)");
            return;
        }
        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: addWatchlistForm.symbol.trim().toUpperCase(),
                    name: addWatchlistForm.name.trim(),
                    asset_type: addWatchlistForm.asset_type
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAddWatchlistForm({ symbol: "", name: "", asset_type: "forex" });
                setShowAddWatchlistForm(false);
                await fetchWatchlist();
            } else {
                alert(`เพิ่มไม่สำเร็จ: ${data.detail || "เกิดข้อผิดพลาด"}`);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleDeleteWatchlist = async (symbolToDelete) => {
        if (!confirm(`คุณต้องการลบ ${symbolToDelete} ออกจากกระดานเฝ้าดูใช่หรือไม่?`)) return;
        try {
            const res = await fetch(`/api/watchlist/${symbolToDelete}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                // Determine new active symbol if deleting current active symbol
                let newActive = null;
                if (activeSymbol === symbolToDelete) {
                    const remaining = watchlist.filter(item => item.symbol !== symbolToDelete);
                    if (remaining.length > 0) {
                        newActive = remaining[0];
                    }
                }
                
                await fetchWatchlist();
                
                if (newActive) {
                    setActiveSymbol(newActive.symbol);
                    setActiveAsset(newActive);
                }
            } else {
                alert(`ลบไม่สำเร็จ: ${data.detail || "เกิดข้อผิดพลาด"}`);
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
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

    const handleHistoryOrderClick = (order) => {
        if (selectedHistoryOrder && selectedHistoryOrder.ticket === order.ticket) {
            setSelectedHistoryOrder(null);
            return;
        }

        // Resolve timeframe
        let resolvedTimeframe = null;
        if (order.comment) {
            const cleanComment = order.comment.replace(/\s*\[.*?\]$/, '').trim();
            const matchingBot = bots.find(b => 
                b.name.trim().toLowerCase() === cleanComment.toLowerCase() ||
                cleanComment.toLowerCase().includes(b.name.trim().toLowerCase())
            );
            if (matchingBot && matchingBot.timeframe) {
                resolvedTimeframe = matchingBot.timeframe;
            } else {
                const match = order.comment.match(/\b(M1|M5|M15|M30|H1|H4|D1)\b/i);
                if (match) {
                    resolvedTimeframe = match[1].toUpperCase();
                }
            }
        }

        const finalTf = resolvedTimeframe || paneTimeframes[activePaneId] || 'H1';

        setActiveSymbol(order.symbol);
        setPaneTimeframes(prev => ({
            ...prev,
            [activePaneId]: finalTf
        }));
        setSelectedHistoryOrder(order);
    };

    // Render backtest history deals log table
    const renderBacktestDealsTable = (maxHeight = '450px', showTitle = true) => {
        if (!backtestResult || !backtestResult.trades) return null;
        
        const decimals = (backtestForm.symbol && backtestForm.symbol.includes('EURUSD')) ? 5 : 2;
        
        return (
            <div className="backtest-table-card" style={{ marginTop: '16px' }}>
                {showTitle && (
                    <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📜 บันทึกธุรกรรมประวัติศาสตร์การซื้อขายย้อนหลังอย่างละเอียด (คลิกที่แถวเพื่อแสดงรายละเอียด TP, SL บนกราฟ)
                    </h4>
                )}
                
                {backtestResult.trades.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11.5px', padding: '20px 0' }}>
                        ไม่มีการเปิดธุรกรรมการเทรดใดๆ เกิดขึ้นในตลอดข้อมูลประวัติศาสตร์ lookback นี้
                    </div>
                ) : (
                    <div className="backtest-table-wrapper" style={{ maxHeight: maxHeight }}>
                        <table className="trading-table">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>ประเภท</th>
                                    <th>ขนาด Lot</th>
                                    <th>ราคาเปิด</th>
                                    <th>ราคาปิด</th>
                                    <th>เวลาเปิด</th>
                                    <th>เวลาปิด</th>
                                    <th>ผลลัพธ์</th>
                                    <th>กำไร (USD)</th>
                                    <th>เหตุผลปิดดีล</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backtestResult.trades.map((t, idx) => {
                                    const isSelected = selectedBacktestTrade && selectedBacktestTrade.ticket === t.ticket;
                                    return (
                                        <tr 
                                            key={`${t.ticket}-${idx}`}
                                            onClick={() => setSelectedBacktestTrade(selectedBacktestTrade && selectedBacktestTrade.ticket === t.ticket ? null : t)}
                                            className={isSelected ? 'selected-history-row' : ''}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ fontFamily: 'monospace' }}>#{t.ticket}</td>
                                            <td>
                                                <span className={t.type === 'buy' ? 'buy-badge' : 'sell-badge'}>
                                                    {t.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace' }}>{backtestForm.lot_size}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{(t.open_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: decimals })}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{(t.close_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: decimals })}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t.open_time}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{t.close_time}</td>
                                            <td>
                                                <span className={t.result === 'win' ? 'result-win-badge' : 'result-loss-badge'}>
                                                    {t.result.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className={(t.profit ?? 0) >= 0 ? 'price-up' : 'price-down'} style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                                {(t.profit ?? 0) >= 0 ? '+' : ''}${(t.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ fontWeight: 600, fontSize: '11px', color: t.reason === 'Take Profit' ? 'var(--bull-green)' : t.reason === 'Stop Loss' ? 'var(--bear-red)' : 'var(--text-secondary)' }}>
                                                {t.reason}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Draw order TP, SL, Open, and Close price points when selectedHistoryOrder changes
    useEffect(() => {
        // Clear existing history price points and price lines from all panes
        if (historyPriceLinesRef.current) {
            Object.entries(historyPriceLinesRef.current).forEach(([pId, data]) => {
                const chart = chartsRef.current[pId];
                const candlestickSeries = candlestickSeriesesRef.current[pId];
                if (data) {
                    let oldSeries = [];
                    let oldPriceLines = [];
                    if (Array.isArray(data)) {
                        oldSeries = data;
                    } else {
                        oldSeries = data.series || [];
                        oldPriceLines = data.priceLines || [];
                    }
                    
                    if (chart) {
                        oldSeries.forEach(s => {
                            try {
                                chart.removeSeries(s);
                            } catch (e) {}
                        });
                    }
                    if (candlestickSeries) {
                        oldPriceLines.forEach(pl => {
                            try {
                                candlestickSeries.removePriceLine(pl);
                            } catch (e) {}
                        });
                    }
                }
            });
        }
        historyPriceLinesRef.current = {};

        // Update all active panes' markers to reflect current selection state (or lack thereof)
        const activePaneIds = chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3];
        activePaneIds.forEach(pId => {
            updateChartMarkers(pId);
        });

        if (!selectedHistoryOrder || selectedHistoryOrder.symbol !== activeSymbol) return;

        const decimals = selectedHistoryOrder.symbol.includes('EURUSD') ? 5 : 2;
        const formatP = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

        // Helper to parse time string YYYY-MM-DD HH:MM:SS to Unix timestamp
        const parseToUnix = (dateStr) => {
            if (!dateStr) return null;
            const parts = dateStr.split(/[- :\/]/);
            if (parts.length >= 6) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1; // 0-based month
                const d = parseInt(parts[2], 10);
                const hr = parseInt(parts[3], 10);
                const min = parseInt(parts[4], 10);
                const sec = parseInt(parts[5], 10);
                return Math.floor(Date.UTC(y, m, d, hr, min, sec) / 1000);
            }
            const parsed = new Date(dateStr.replace(/-/g, '/'));
            return Math.floor(parsed.getTime() / 1000);
        };

        // Helper to align Unix timestamp to timeframe boundaries
        const alignTimeToTimeframe = (timestamp, tf) => {
            const spacingMap = {
                "M1": 60,
                "M5": 300,
                "M15": 900,
                "M30": 1800,
                "H1": 3600,
                "H4": 14400,
                "D1": 86400
            };
            const seconds = spacingMap[tf] || 3600;
            return Math.floor(timestamp / seconds) * seconds;
        };

        const openTimeUnix = parseToUnix(selectedHistoryOrder.open_time);
        const closeTimeUnix = parseToUnix(selectedHistoryOrder.close_time);

        activePaneIds.forEach(pId => {
            const chart = chartsRef.current[pId];
            const candlestickSeries = candlestickSeriesesRef.current[pId];
            if (!chart) return;

            const paneTf = paneTimeframes[pId] || 'H1';
            const alignedOpenTime = openTimeUnix ? alignTimeToTimeframe(openTimeUnix, paneTf) : null;
            const alignedCloseTime = closeTimeUnix ? alignTimeToTimeframe(closeTimeUnix, paneTf) : null;

            const seriesList = [];
            const priceLinesList = [];

            // 1. SL Price Line
            if (candlestickSeries && selectedHistoryOrder.sl && selectedHistoryOrder.sl > 0) {
                const slPriceLine = candlestickSeries.createPriceLine({
                    price: selectedHistoryOrder.sl,
                    color: '#e74c3c',
                    lineWidth: 1.5,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: `SL: ${formatP(selectedHistoryOrder.sl)}`
                });
                priceLinesList.push(slPriceLine);
            }

            // 2. TP Price Line
            if (candlestickSeries && selectedHistoryOrder.tp && selectedHistoryOrder.tp > 0) {
                const tpPriceLine = candlestickSeries.createPriceLine({
                    price: selectedHistoryOrder.tp,
                    color: '#2ecc71',
                    lineWidth: 1.5,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: `TP: ${formatP(selectedHistoryOrder.tp)}`
                });
                priceLinesList.push(tpPriceLine);
            }

            // 2.1 Entry Price Line
            if (candlestickSeries && selectedHistoryOrder.open_price) {
                const openPriceLine = candlestickSeries.createPriceLine({
                    price: selectedHistoryOrder.open_price,
                    color: '#00b4d8',
                    lineWidth: 1.5,
                    lineStyle: LightweightCharts.LineStyle.Dotted,
                    axisLabelVisible: true,
                    title: `Entry: ${formatP(selectedHistoryOrder.open_price)}`
                });
                priceLinesList.push(openPriceLine);
            }

            // 2.2 Close Price Line (if closed)
            if (candlestickSeries && selectedHistoryOrder.close_price) {
                const closePriceLine = candlestickSeries.createPriceLine({
                    price: selectedHistoryOrder.close_price,
                    color: selectedHistoryOrder.profit >= 0 ? '#2ecc71' : '#e74c3c',
                    lineWidth: 1.5,
                    lineStyle: LightweightCharts.LineStyle.Dotted,
                    axisLabelVisible: true,
                    title: `Close: ${formatP(selectedHistoryOrder.close_price)} (PnL: ${selectedHistoryOrder.profit >= 0 ? '+' : ''}${Number(selectedHistoryOrder.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
                });
                priceLinesList.push(closePriceLine);
            }

            // 2.3 Current Price Line (if open position)
            if (candlestickSeries && !selectedHistoryOrder.close_price && selectedHistoryOrder.current_price) {
                const currentPriceLine = candlestickSeries.createPriceLine({
                    price: selectedHistoryOrder.current_price,
                    color: selectedHistoryOrder.profit >= 0 ? '#2ecc71' : '#e74c3c',
                    lineWidth: 1.5,
                    lineStyle: LightweightCharts.LineStyle.Dotted,
                    axisLabelVisible: true,
                    title: `Current: ${formatP(selectedHistoryOrder.current_price)} (PnL: ${selectedHistoryOrder.profit >= 0 ? '+' : ''}${Number(selectedHistoryOrder.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
                });
                priceLinesList.push(currentPriceLine);
            }

            // 3. Connect Open & Close with a dashed line (green/red based on win/loss)
            if (selectedHistoryOrder.open_price && selectedHistoryOrder.close_price && alignedOpenTime && alignedCloseTime) {
                const pathSeries = chart.addLineSeries({
                    color: selectedHistoryOrder.profit >= 0 ? '#2ecc71' : '#e74c3c',
                    lineWidth: 2,
                    lineStyle: LightweightCharts.LineStyle.Dashed,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false
                });
                pathSeries.setData([
                    { time: alignedOpenTime, value: selectedHistoryOrder.open_price },
                    { time: alignedCloseTime, value: selectedHistoryOrder.close_price }
                ]);
                seriesList.push(pathSeries);
            }

            historyPriceLinesRef.current[pId] = { series: seriesList, priceLines: priceLinesList };
        });
    }, [selectedHistoryOrder, activeSymbol, chartLayout, JSON.stringify(paneTimeframes)]);

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
            pj_tp_target: bot.pj_tp_target || "manual",
            use_trend_filter: bot.use_trend_filter || false,
            use_atr_sizing: bot.use_atr_sizing || false,
            risk_percent: bot.risk_percent || 1.0,
            allowed_sessions: bot.allowed_sessions || "all",
            use_news_filter: bot.use_news_filter || false
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
                    pj_tp_target: botForm.pj_tp_target || "manual",
                    signal_mode: signalMode,
                    use_trend_filter: botForm.use_trend_filter || false,
                    use_atr_sizing: botForm.use_atr_sizing || false,
                    risk_percent: parseFloat(botForm.risk_percent) || 1.0,
                    allowed_sessions: botForm.allowed_sessions || "all",
                    use_news_filter: botForm.use_news_filter || false
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
                setSettingsAlert({ type: "success", text: "เชื่อมต่อบัญชี MT5 Trader สำเร็จแล้ว!" });
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

    // Disconnect MT5 Trader live and back to simulation mode
    const handleDisconnectLive = async () => {
        if (!confirm("คุณต้องการยกเลิกการเชื่อมบัญชี MT5 Trader และกลับเข้าสู่โหมดจำลอง (Simulation Mode) ใช่หรือไม่?")) return;
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
                text: `สวัสดีครับ! ผมคือ **Giant Slayer AI Assistant** ผู้ช่วยเทรดอัจฉริยะส่วนตัวของคุณ 🤖📊\n\nผมสามารถช่วยเหลือคุณดึงข้อมูลแบบเรียลไทม์จาก MT5 Trader และระบบบอทเทรดได้ครับ โดยคุณสามารถพิมพ์สอบถามผม หรือคลิกที่ตัวเลือกด่วนด้านล่างได้เลยครับ!`,
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
            return { 
                totalProfit: "0.00", winRate: "0.0", winCount: 0, loseCount: 0, totalTrades: 0, best: "0.00", worst: "0.00", 
                todayProfit: "0.00", todayTrades: 0, todayWins: 0, todayWinRate: "0.0",
                monthProfit: "0.00", profitFactor: "0.00", avgWin: "0.00", avgLoss: "0.00", riskRewardRatio: "1.00",
                maxConWins: 0, maxConLosses: 0, botStats: [], sessionStats: [] 
            };
        }

        const parseCloseTime = (str) => {
            if (!str) return null;
            return new Date(str.replace(/-/g, '/'));
        };

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const filteredTrades = tradeHistory.filter(t => {
            if (!t.close_time) return false;
            const closeDate = parseCloseTime(t.close_time);
            if (!closeDate) return false;

            if (analyticsTimeFilter === 'day') {
                return closeDate >= startOfDay;
            } else if (analyticsTimeFilter === 'week') {
                return closeDate >= startOfWeek;
            } else if (analyticsTimeFilter === 'month') {
                return closeDate >= startOfMonth;
            } else if (analyticsTimeFilter === 'year') {
                return closeDate >= startOfYear;
            }
            return true; // 'all'
        });

        if (filteredTrades.length === 0) {
            return { 
                totalProfit: "0.00", winRate: "0.0", winCount: 0, loseCount: 0, totalTrades: 0, best: "0.00", worst: "0.00", 
                todayProfit: "0.00", todayTrades: 0, todayWins: 0, todayWinRate: "0.0",
                monthProfit: "0.00", profitFactor: "0.00", avgWin: "0.00", avgLoss: "0.00", riskRewardRatio: "1.00",
                maxConWins: 0, maxConLosses: 0, botStats: [], sessionStats: [] 
            };
        }

        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local timezone
        const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

        let total = 0.0;
        let wins = 0;
        let best = -999999.0;
        let worst = 999999.0;
        
        let todayProfit = 0.0;
        let todayTradesCount = 0;
        let todayWinsCount = 0;
        let monthProfit = 0.0;

        let grossProfit = 0.0;
        let grossLoss = 0.0;
        
        let totalWinAmt = 0.0;
        let totalLossAmt = 0.0;

        // Group by bot
        const botGroups = {};

        // Group by session
        const sessions = {
            morning: { key: 'morning', name: 'ช่วงเช้า (Morning: 06:00 - 12:00)', totalTrades: 0, winCount: 0, loseCount: 0, totalProfit: 0.0, grossProfit: 0.0, grossLoss: 0.0, best: -999999.0, worst: 999999.0, icon: 'sun', bots: {} },
            afternoon: { key: 'afternoon', name: 'ช่วงบ่าย (Afternoon: 12:00 - 18:00)', totalTrades: 0, winCount: 0, loseCount: 0, totalProfit: 0.0, grossProfit: 0.0, grossLoss: 0.0, best: -999999.0, worst: 999999.0, icon: 'sunset', bots: {} },
            evening: { key: 'evening', name: 'ช่วงค่ำ/ดึก (Evening/Night: 18:00 - 06:00)', totalTrades: 0, winCount: 0, loseCount: 0, totalProfit: 0.0, grossProfit: 0.0, grossLoss: 0.0, best: -999999.0, worst: 999999.0, icon: 'moon', bots: {} }
        };

        for (const t of filteredTrades) {
            total += t.profit;
            if (t.profit > 0) {
                wins++;
                grossProfit += t.profit;
                totalWinAmt += t.profit;
            } else {
                grossLoss += Math.abs(t.profit);
                totalLossAmt += Math.abs(t.profit);
            }

            if (t.profit > best) best = t.profit;
            if (t.profit < worst) worst = t.profit;

            // Check if closed today
            if (t.close_time && t.close_time.startsWith(todayStr)) {
                todayProfit += t.profit;
                todayTradesCount++;
                if (t.profit > 0) todayWinsCount++;
            }

            // Check if closed this month
            if (t.close_time && t.close_time.startsWith(currentMonthStr)) {
                monthProfit += t.profit;
            }
            
            // Clean strategy suffix
            const cleanComment = t.comment ? t.comment.replace(/\s*\[.*?\]$/, '') : '';
            const isManualComment = (c) => {
                if (!c) return true;
                const lower = c.toLowerCase();
                return lower === 'manual' || lower === 'simulation' || lower === 'เทรดเอง (manual)' || lower.includes('real close') || lower.includes('close via') || lower.includes('mt5 trader');
            };
            const sourceName = cleanComment ? (isManualComment(cleanComment) ? 'เทรดเอง (Manual)' : cleanComment) : 'เทรดเอง (Manual)';
            
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

            // Session P&L calculations
            if (t.close_time && t.close_time.length >= 13) {
                const hour = parseInt(t.close_time.substring(11, 13));
                let sessKey = 'evening';
                if (hour >= 6 && hour < 12) {
                    sessKey = 'morning';
                } else if (hour >= 12 && hour < 18) {
                    sessKey = 'afternoon';
                }
                
                const s = sessions[sessKey];
                s.totalTrades += 1;
                s.totalProfit += t.profit;
                if (t.profit > 0) {
                    s.winCount += 1;
                    s.grossProfit += t.profit;
                } else {
                    s.loseCount += 1;
                    s.grossLoss += Math.abs(t.profit);
                }
                if (t.profit > s.best) s.best = t.profit;
                if (t.profit < s.worst) s.worst = t.profit;

                // Track bot stats within session
                if (!s.bots[sourceName]) {
                    s.bots[sourceName] = { name: sourceName, totalTrades: 0, winCount: 0, loseCount: 0, totalProfit: 0.0, grossProfit: 0.0, grossLoss: 0.0 };
                }
                const sb = s.bots[sourceName];
                sb.totalTrades += 1;
                sb.totalProfit += t.profit;
                if (t.profit > 0) {
                    sb.winCount += 1;
                    sb.grossProfit += t.profit;
                } else {
                    sb.loseCount += 1;
                    sb.grossLoss += Math.abs(t.profit);
                }
            }
        }

        const winRate = (wins / filteredTrades.length) * 100;
        const todayWinRate = todayTradesCount > 0 ? ((todayWinsCount / todayTradesCount) * 100).toFixed(1) : "0.0";
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? "Max" : "0.00";
        
        const avgWin = wins > 0 ? (totalWinAmt / wins).toFixed(2) : "0.00";
        const losses = filteredTrades.length - wins;
        const avgLoss = losses > 0 ? (totalLossAmt / losses).toFixed(2) : "0.00";
        const riskRewardRatio = parseFloat(avgLoss) > 0 ? (parseFloat(avgWin) / parseFloat(avgLoss)).toFixed(2) : "1.00";

        // Calculate consecutive win/loss streaks (sort chronologically first)
        const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.close_time) - new Date(b.close_time));
        let maxConWins = 0;
        let maxConLosses = 0;
        let currentConWins = 0;
        let currentConLosses = 0;

        for (const t of sortedTrades) {
            if ((t.profit ?? 0) >= 0) {
                currentConWins++;
                if (currentConWins > maxConWins) maxConWins = currentConWins;
                currentConLosses = 0;
            } else {
                currentConLosses++;
                if (currentConLosses > maxConLosses) maxConLosses = currentConLosses;
                currentConWins = 0;
            }
        }
        
        const botStats = Object.values(botGroups).map(bot => {
            const botWinRate = bot.totalTrades > 0 ? (bot.winCount / bot.totalTrades * 100).toFixed(1) : '0.0';
            return {
                ...bot,
                winRate: botWinRate,
                totalProfit: bot.totalProfit.toFixed(2),
                profit: bot.totalProfit.toFixed(2), // compatibility with old keys
                count: bot.totalTrades, // compatibility with old keys
                wins: bot.winCount, // compatibility with old keys
                losses: bot.loseCount // compatibility with old keys
            };
        }).sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit));

        const sessionStats = Object.values(sessions).map(sess => {
            const winRate = sess.totalTrades > 0 ? (sess.winCount / sess.totalTrades * 100).toFixed(1) : '0.0';
            const profitFactor = sess.grossLoss > 0 ? (sess.grossProfit / sess.grossLoss).toFixed(2) : (sess.grossProfit > 0 ? 'Max' : '0.00');
            const avgProfit = sess.totalTrades > 0 ? (sess.totalProfit / sess.totalTrades).toFixed(2) : '0.00';
            
            const botsArr = Object.values(sess.bots).map(b => {
                const bWinRate = b.totalTrades > 0 ? (b.winCount / b.totalTrades * 100).toFixed(1) : '0.0';
                const bProfitFactor = b.grossLoss > 0 ? (b.grossProfit / b.grossLoss).toFixed(2) : (b.grossProfit > 0 ? 'Max' : '0.00');
                const bAvgProfit = b.totalTrades > 0 ? (b.totalProfit / b.totalTrades).toFixed(2) : '0.00';
                return {
                    ...b,
                    winRate: bWinRate,
                    profitFactor: bProfitFactor,
                    avgProfit: bAvgProfit,
                    totalProfit: b.totalProfit.toFixed(2)
                };
            }).sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit));

            return {
                ...sess,
                winRate: winRate,
                profitFactor: profitFactor,
                avgProfit: avgProfit,
                best: sess.totalTrades > 0 ? sess.best.toFixed(2) : '0.00',
                worst: sess.totalTrades > 0 ? sess.worst.toFixed(2) : '0.00',
                totalProfit: sess.totalProfit.toFixed(2),
                bots: botsArr
            };
        });

        return {
            totalProfit: total.toFixed(2),
            winRate: winRate.toFixed(1),
            winCount: wins,
            loseCount: filteredTrades.length - wins,
            totalTrades: filteredTrades.length,
            best: best.toFixed(2),
            worst: worst.toFixed(2),
            todayProfit: todayProfit.toFixed(2),
            todayTrades: todayTradesCount,
            todayWins: todayWinsCount,
            todayWinRate: todayWinRate,
            monthProfit: monthProfit.toFixed(2),
            profitFactor: profitFactor,
            avgWin: avgWin,
            avgLoss: avgLoss,
            riskRewardRatio: riskRewardRatio,
            maxConWins: maxConWins,
            maxConLosses: maxConLosses,
            botStats: botStats,
            sessionStats: sessionStats
        };
    };

    const analytics = calculateAnalytics();
    const currentPriceInfo = prices[activeSymbol] || { bid: 0.0, ask: 0.0, change: "0.00" };

    if (isNewsPopout) {
        return (
            <div className="app-container" style={{ height: '100vh', background: 'var(--bg-main)', overflow: 'hidden', padding: '16px' }}>
                <div className="news-tab-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '8px', height: 'calc(100vh - 32px)' }}>
                    {/* Left Panel: Market Mood & AI Sentiment */}
                    <div className="news-left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Market Sentiment Gauge */}
                        <div className="sidebar-panel-card" style={{ padding: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ margin: '0 0 14px 0', borderLeft: '3px solid var(--accent-gold)', paddingLeft: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ดัชนีอารมณ์ตลาด (Market Mood)
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px' }}>
                                {newsData.sentiment_summary === 'bullish' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.6))' }}>📈</span>
                                        <strong style={{ fontSize: '18px', color: 'var(--bull-green)', marginTop: '8px', textTransform: 'uppercase' }}>BULLISH (กระทิง)</strong>
                                    </div>
                                ) : newsData.sentiment_summary === 'bearish' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 10px rgba(231, 76, 60, 0.6))' }}>📉</span>
                                        <strong style={{ fontSize: '18px', color: 'var(--bear-red)', marginTop: '8px', textTransform: 'uppercase' }}>BEARISH (หมี)</strong>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>⚪</span>
                                        <strong style={{ fontSize: '18px', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase' }}>NEUTRAL (คงตัว)</strong>
                                    </div>
                                )}
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px', lineHeight: '1.4' }}>
                                    * คำนวณสรุปแบบถ่วงน้ำหนักโดย AI อิงจากข่าวเศรษฐกิจและภูมิรัฐศาสตร์ 10 รายการล่าสุด
                                </span>
                            </div>
                        </div>

                        {/* Geopolitical Risk Scale */}
                        <div className="sidebar-panel-card" style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ margin: '0 0 12px 0', borderLeft: '3px solid var(--bear-red)', paddingLeft: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ระดับภัยคุกคามตลาด
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ระดับความตึงเครียด:</span>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 800, 
                                        color: newsData.risk_level === 'high' ? 'var(--bear-red)' : newsData.risk_level === 'medium' ? 'var(--accent-gold)' : 'var(--bull-green)',
                                        background: newsData.risk_level === 'high' ? 'rgba(231, 76, 60, 0.15)' : newsData.risk_level === 'medium' ? 'rgba(255, 183, 3, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {newsData.risk_level.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ 
                                        width: newsData.risk_level === 'high' ? '100%' : newsData.risk_level === 'medium' ? '60%' : '20%', 
                                        height: '100%', 
                                        background: newsData.risk_level === 'high' ? 'var(--bear-red)' : newsData.risk_level === 'medium' ? 'var(--accent-gold)' : 'var(--bull-green)',
                                        boxShadow: newsData.risk_level === 'high' ? '0 0 8px var(--bear-red)' : newsData.risk_level === 'medium' ? '0 0 8px var(--accent-gold)' : 'none',
                                        transition: 'width 0.5s ease-in-out'
                                    }}></div>
                                </div>
                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                                    {newsData.risk_level === 'high' 
                                        ? '⚠️ ความตึงเครียดทางสงครามหรือภูมิรัฐศาสตร์รุนแรงขึ้น! แนะนำเน้นถือไม้ซื้อทองคำ (BUY Gold) รันเทรนตามระบบและระวังความผันผวนสูง'
                                        : newsData.risk_level === 'medium'
                                        ? '⚡ มีประเด็นสงครามการค้า/อัตราดอกเบี้ยและเงินเฟ้อระดับปานกลาง ตลาดค่อนข้างผันผวน แนะนำเพิ่มความรัดกุมในการตั้งจุด Stop Loss'
                                        : '🟢 ปัจจัยภายนอกยังคงอยู่ในเกณฑ์ปลอดภัย บอทระบบสัมผัสเทคนิคคอลทั่วไปทำงานได้อย่างปกติ'}
                                </p>
                            </div>
                        </div>

                        {/* On-demand manual Refresher controls */}
                        <button 
                            className={`btn-trade-execute buy ${newsRefreshing ? 'active' : ''}`}
                            onClick={handleRefreshNews}
                            disabled={newsRefreshing}
                            style={{ 
                                width: '100%', 
                                height: '42px', 
                                padding: '10px', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                borderRadius: '6px', 
                                border: '1px solid var(--accent-gold)',
                                background: 'rgba(255, 183, 3, 0.08)',
                                color: 'var(--accent-gold)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: 'auto'
                            }}
                        >
                            <div className={newsRefreshing ? "loader-spinner" : ""} style={{ width: '14px', height: '14px', borderTopColor: 'var(--accent-gold)', animationDuration: '0.8s' }}>
                                {!newsRefreshing && <Icon name="refresh" size={14} />}
                            </div>
                            <span>{newsRefreshing ? 'กำลังดึงและวิเคราะห์ข่าวด้วย AI...' : 'ดึงและอัปเดตข่าวเรียลไทม์'}</span>
                        </button>
                    </div>

                    {/* Right Panel: Analyzed News Feed */}
                    <div className="news-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 60px)', paddingRight: '4px', flex: 1 }}>
                        {newsData.news.length === 0 ? (
                            <div className="empty-terminal-state" style={{ height: '300px' }}>
                                <Icon name="info" size={32} />
                                <p>ยังไม่มีรายงานข่าวสารวิเคราะห์ในระบบ กดปุ่มดึงข่าวสารด้านซ้ายเพื่อรับอัปเดต</p>
                            </div>
                        ) : (
                            newsData.news.map((item) => {
                                const isExpanded = expandedNewsId === item.id;
                                const pubDate = item.published_at ? new Date(item.published_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A';
                                
                                const impactColor = item.impact_level === 'high' ? 'rgba(231, 76, 60, 0.12)' : item.impact_level === 'medium' ? 'rgba(255, 183, 3, 0.12)' : 'rgba(0, 180, 216, 0.12)';
                                const impactTextColor = item.impact_level === 'high' ? 'var(--bear-red)' : item.impact_level === 'medium' ? 'var(--accent-gold)' : '#00b4d8';
                                const impactBorderColor = item.impact_level === 'high' ? 'rgba(231, 76, 60, 0.25)' : item.impact_level === 'medium' ? 'rgba(255, 183, 3, 0.25)' : 'rgba(0, 180, 216, 0.25)';
                                
                                const sentimentEmoji = item.sentiment === 'bullish' ? '📈 BUY' : item.sentiment === 'bearish' ? '📉 SELL' : '⚪ NEUTRAL';
                                const sentimentTextColor = item.sentiment === 'bullish' ? 'var(--bull-green)' : item.sentiment === 'bearish' ? 'var(--bear-red)' : 'var(--text-muted)';
                                
                                return (
                                    <div 
                                        key={item.id} 
                                        className="sidebar-panel-card"
                                        style={{ 
                                            padding: '14px 16px', 
                                            border: '1px solid ' + (isExpanded ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)'),
                                            background: isExpanded ? 'rgba(255, 183, 3, 0.02)' : 'rgba(255,255,255,0.01)',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isExpanded ? '0 0 10px rgba(255, 183, 3, 0.06)' : 'none'
                                        }}
                                        onClick={() => setExpandedNewsId(isExpanded ? null : item.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    {item.category === 'geopolitical' ? 'สงคราม/ภูมิรัฐศาสตร์ 🛡️' : 'เศรษฐกิจมหภาค 📊'}
                                                </span>
                                                <span style={{ fontSize: '9px', background: impactColor, color: impactTextColor, border: '1px solid ' + impactBorderColor, padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    IMPACT: {item.impact_level.toUpperCase()}
                                                </span>
                                                <span style={{ fontSize: '9.5px', color: sentimentTextColor, fontWeight: 'bold', marginLeft: '6px' }}>
                                                    {sentimentEmoji}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                {pubDate}
                                            </span>
                                        </div>

                                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isExpanded ? 'var(--accent-gold)' : 'var(--text-primary)', lineHeight: '1.45', transition: 'color 0.2s' }}>
                                            {item.title}
                                        </h4>

                                        {isExpanded && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', animation: 'fadeIn 0.2s ease' }}>
                                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                                    <strong>สรุปข่าวดิบ:</strong> {item.summary || 'ไม่มีบทสรุปของข่าวสารในฐานข้อมูล'}
                                                </p>
                                                <div style={{ background: 'rgba(255, 183, 3, 0.03)', border: '1px dashed rgba(255, 183, 3, 0.2)', padding: '10px 12px', borderRadius: '6px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>🛡️ ผลวิเคราะห์ผลกระทบโดย AI (Thai Language):</span>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', lineHeight: '1.5', fontWeight: 500 }}>
                                                        {item.analysis}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isAnalyticsPopout) {
        return (
            <div className="app-container" style={{ height: '100vh', background: 'var(--bg-main)', overflowY: 'auto', padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="trend-up" size={18} />
                            <span>การวิเคราะห์ประสิทธิภาพเชิงลึกพอร์ตการลงทุน (Deep Analytics)</span>
                        </h2>
                        {/* Time Filter Segmented Control */}
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            {['all', 'day', 'week', 'month', 'year'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setAnalyticsTimeFilter(filter)}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: analyticsTimeFilter === filter ? 'var(--accent-gold)' : 'transparent',
                                        color: analyticsTimeFilter === filter ? '#000' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {filter === 'all' ? 'ทั้งหมด' : filter === 'day' ? 'วันนี้' : filter === 'week' ? 'สัปดาห์นี้' : filter === 'month' ? 'เดือนนี้' : 'ปีนี้'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Top Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <span className="metric-label" style={{ fontSize: '10px' }}>ยอดกำไรรวมสะสม</span>
                            <h4 className={parseFloat(analytics.totalProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                {parseFloat(analytics.totalProfit) >= 0 ? '+' : ''}${analytics.totalProfit}
                            </h4>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                สูงสุด: <span className="price-up">+${analytics.best}</span> | ต่ำสุด: <span className="price-down">${analytics.worst}</span>
                            </span>
                        </div>
                        
                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center', borderLeft: '3px solid ' + (parseFloat(analytics.todayProfit) >= 0 ? 'var(--bull-green)' : 'var(--bear-red)') }}>
                            <span className="metric-label" style={{ fontSize: '10px' }}>กำไร/ขาดทุน วันนี้</span>
                            <h4 className={parseFloat(analytics.todayProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                {parseFloat(analytics.todayProfit) >= 0 ? '+' : ''}${analytics.todayProfit}
                            </h4>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                วันนี้: ชนะ {analytics.todayWins}/{analytics.todayTrades} ออเดอร์ ({analytics.todayWinRate}%)
                            </span>
                        </div>

                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <span className="metric-label" style={{ fontSize: '10px' }}>กำไรรวมเดือนปัจจุบัน</span>
                            <h4 className={parseFloat(analytics.monthProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                {parseFloat(analytics.monthProfit) >= 0 ? '+' : ''}${analytics.monthProfit}
                            </h4>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                ภาพรวมรอบเดือน {new Date().toLocaleString('th-TH', { month: 'long' })}
                            </span>
                        </div>

                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <span className="metric-label" style={{ fontSize: '10px' }}>อัตราการชนะรวม (Win Rate)</span>
                            <h4 style={{ fontSize: '24px', marginTop: '6px', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                                {analytics.winRate}%
                            </h4>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                ชนะ {analytics.winCount} | แพ้ {analytics.loseCount} จากทั้งหมด {analytics.totalTrades} ออเดอร์
                            </span>
                        </div>
                    </div>

                    {/* Institutional Performance Analytics Card */}
                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
                            สถิติวินัยและการวิเคราะห์ความแม่นยำระดับสถาบัน (Institutional Metrics)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>อัตราสัดส่วนกำไรต่อขาดทุน (Profit Factor)</span>
                                <h4 style={{ fontSize: '20px', margin: 0, fontFamily: 'monospace', color: analytics.profitFactor === 'Max' || parseFloat(analytics.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(analytics.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)' }}>
                                    {analytics.profitFactor}
                                </h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                                    {analytics.profitFactor === 'Max' || parseFloat(analytics.profitFactor) >= 1.5 ? '🟢 ประสิทธิภาพยอดเยี่ยม (Excellent)' : parseFloat(analytics.profitFactor) >= 1.0 ? '🟡 ประสิทธิภาพระดับปลอดภัย (Good)' : '🔴 ขาดทุนมากกว่ากำไร (High Risk)'}
                                </span>
                            </div>
                            
                            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สถิติการชนะ/แพ้ต่อเนื่องสูงสุด (Streak Record)</span>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0', color: 'var(--text-secondary)' }}>
                                    ชนะติดกันสูงสุด: <span style={{ color: 'var(--bull-green)', fontFamily: 'monospace', fontSize: '15px' }}>{analytics.maxConWins}</span> ไม้
                                    <br />
                                    แพ้ติดกันสูงสุด: <span style={{ color: 'var(--bear-red)', fontFamily: 'monospace', fontSize: '15px' }}>{analytics.maxConLosses}</span> ไม้
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>กำไร-ขาดทุนเฉลี่ย / สัดส่วน Risk to Reward (R:R)</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                    กำไรเฉลี่ยไม้ชนะ: <span className="price-up" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>+${analytics.avgWin}</span>
                                    <br />
                                    ขาดทุนเฉลี่ยไม้แพ้: <span className="price-down" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>-${analytics.avgLoss}</span>
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                    R:R จริงเฉลี่ย: <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace' }}>1 : {analytics.riskRewardRatio}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trading Sessions Performance Analytics Card */}
                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: 'var(--text-secondary)' }}>
                                วิเคราะห์สถิติกำไรและประสิทธิภาพแยกตามช่วงเวลาเทรด (Trading Session Analytics)
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                            {analytics.sessionStats.map((sess, idx) => {
                                const netProfit = parseFloat(sess.totalProfit);
                                const profitColor = netProfit > 0 ? 'var(--bull-green)' : netProfit < 0 ? 'var(--bear-red)' : 'var(--text-muted)';
                                const winRateVal = parseFloat(sess.winRate);
                                
                                return (
                                                    <div key={idx} style={{ 
                                                        background: 'rgba(255, 255, 255, 0.02)', 
                                                        border: '1px solid rgba(255, 255, 255, 0.04)', 
                                                        borderRadius: '8px', 
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '6px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ color: sess.icon === 'sun' ? '#ffb703' : sess.icon === 'sunset' ? '#fb8500' : '#8ecae6', display: 'inline-flex' }}>
                                                                    <Icon name={sess.icon} size={14} />
                                                                </span>
                                                                <span>{sess.name.split(' (')[0]}</span>
                                                            </span>
                                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                {sess.name.match(/\(([^)]+)\)/)?.[1] || ''}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                                                            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: profitColor }}>
                                                                {netProfit >= 0 ? '+' : ''}${sess.totalProfit}
                                                            </span>
                                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                                                Win Rate: <span style={{ color: winRateVal >= 60 ? 'var(--bull-green)' : winRateVal >= 45 ? 'var(--accent-gold)' : 'var(--bear-red)', fontFamily: 'monospace' }}>{sess.winRate}%</span>
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                            <span>เทรดทั้งหมด: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{sess.totalTrades}</strong> ไม้</span>
                                                            <span>ชนะ/แพ้: <strong style={{ color: 'var(--bull-green)', fontFamily: 'monospace' }}>{sess.winCount}</strong> / <strong style={{ color: 'var(--bear-red)', fontFamily: 'monospace' }}>{sess.loseCount}</strong></span>
                                                        </div>
                                                    </div>
                                );
                            })}
                        </div>

                        {analytics.sessionStats.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                ไม่มีข้อมูลสถิติช่วงเวลาเทรดในขณะนี้
                            </div>
                        ) : (
                            <table className="trading-table">
                                <thead>
                                                    <tr>
                                                        <th>ช่วงเวลาเทรด (Trading Session)</th>
                                                        <th style={{ textAlign: 'center' }}>จำนวนออเดอร์ (Trades)</th>
                                                        <th style={{ textAlign: 'center' }}>สถิติ ชนะ / แพ้ (W / L)</th>
                                                        <th style={{ textAlign: 'center' }}>อัตราการชนะ (Win Rate)</th>
                                                        <th style={{ textAlign: 'center' }}>Profit Factor</th>
                                                        <th style={{ textAlign: 'center' }}>เฉลี่ยต่อไม้ (Avg P&L)</th>
                                                        <th style={{ textAlign: 'center' }}>ดีสุด / แย่สุด (Best/Worst)</th>
                                                        <th style={{ textAlign: 'right' }}>กำไร/ขาดทุนสุทธิ (Net P&L)</th>
                                                    </tr>
                                </thead>
                                <tbody>
                                                    {analytics.sessionStats.map((sess, index) => {
                                                        const winRateVal = parseFloat(sess.winRate);
                                                        let winRateColor = 'var(--text-muted)';
                                                        if (winRateVal >= 60) winRateColor = 'var(--bull-green)';
                                                        else if (winRateVal >= 45) winRateColor = 'var(--accent-gold)';
                                                        else if (winRateVal > 0) winRateColor = 'var(--bear-red)';

                                                        const netProfit = parseFloat(sess.totalProfit);
                                                        const profitColorClass = netProfit > 0 ? 'price-up' : netProfit < 0 ? 'price-down' : '';
                                                        const isExpanded = !!expandedSessions[sess.key];

                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr style={{ background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : '' }}>
                                                                    <td 
                                                                        style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }} 
                                                                        onClick={() => {
                                                                            setExpandedSessions(prev => ({
                                                                                ...prev,
                                                                                [sess.key]: !prev[sess.key]
                                                                            }));
                                                                        }}
                                                                    >
                                                                        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                                            <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={14} />
                                                                        </span>
                                                                        <span style={{ color: sess.icon === 'sun' ? '#ffb703' : sess.icon === 'sunset' ? '#fb8500' : '#8ecae6', display: 'inline-flex', alignItems: 'center' }}>
                                                                            <Icon name={sess.icon} size={14} />
                                                                        </span>
                                                                        <span>{sess.name}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{sess.totalTrades}</td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                                                        <span style={{ color: 'var(--bull-green)' }}>{sess.winCount}</span>
                                                                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                                                                        <span style={{ color: 'var(--bear-red)' }}>{sess.loseCount}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: winRateColor }}>
                                                                                {sess.winRate}%
                                                                            </span>
                                                                            <div style={{ width: '55px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                                <div style={{ width: `${winRateVal}%`, height: '100%', background: winRateColor }}></div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, color: sess.profitFactor === 'Max' || parseFloat(sess.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(sess.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)' }}>
                                                                        {sess.profitFactor}
                                                                    </td>
                                                                    <td className={parseFloat(sess.avgProfit) >= 0 ? 'price-up' : 'price-down'} style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>
                                                                        {parseFloat(sess.avgProfit) >= 0 ? '+' : ''}${sess.avgProfit}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                        <span className="price-up">+${sess.best}</span>
                                                                        <span style={{ margin: '0 4px' }}>|</span>
                                                                        <span className="price-down">${sess.worst}</span>
                                                                    </td>
                                                                    <td className={profitColorClass} style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                                                                        {netProfit >= 0 ? '+' : ''}${sess.totalProfit}
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr>
                                                                        <td colSpan="8" style={{ padding: '0 0 16px 28px', background: 'rgba(255, 255, 255, 0.01)' }}>
                                                                            <div style={{ 
                                                                                borderLeft: '2px solid var(--accent-gold)', 
                                                                                paddingLeft: '16px', 
                                                                                marginTop: '8px',
                                                                                overflowX: 'auto'
                                                                            }}>
                                                                                <table className="trading-table" style={{ width: '100%', background: 'transparent', border: 'none', margin: '4px 0' }}>
                                                                                    <thead>
                                                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px' }}>ชื่อบอทเทรด / แหล่ง (Bot Name / Source)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>จำนวนออเดอร์ (Trades)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>สถิติ ชนะ / แพ้ (W / L)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>อัตราการชนะ (Win Rate)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>Profit Factor</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>เฉลี่ยต่อไม้ (Avg P&L)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'right' }}>กำไรสุทธิ (Net P&L)</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {sess.bots.length === 0 ? (
                                                                                            <tr>
                                                                                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '12px' }}>
                                                                                                    ไม่มีการเทรดของบอทในช่วงเวลานี้
                                                                                                </td>
                                                                                            </tr>
                                                                                        ) : (
                                                                                            sess.bots.map((bot, bIdx) => {
                                                                                                const bWinRateVal = parseFloat(bot.winRate);
                                                                                                let bWinRateColor = 'var(--text-muted)';
                                                                                                if (bWinRateVal >= 60) bWinRateColor = 'var(--bull-green)';
                                                                                                else if (bWinRateVal >= 45) bWinRateColor = 'var(--accent-gold)';
                                                                                                else if (bWinRateVal > 0) bWinRateColor = 'var(--bear-red)';

                                                                                                const bNetProfit = parseFloat(bot.totalProfit);
                                                                                                const bProfitColorClass = bNetProfit > 0 ? 'price-up' : bNetProfit < 0 ? 'price-down' : '';

                                                                                                return (
                                                                                                    <tr key={bIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                                                                        <td style={{ fontSize: '11px', fontWeight: 600, color: bot.name === 'เทรดเอง (Manual)' ? 'var(--text-muted)' : 'var(--accent-gold)', padding: '6px 8px' }}>
                                                                                                            {bot.name}
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', padding: '6px 8px' }}>{bot.totalTrades}</td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', padding: '6px 8px' }}>
                                                                                                            <span style={{ color: 'var(--bull-green)' }}>{bot.winCount}</span>
                                                                                                            <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                                                                                                            <span style={{ color: 'var(--bear-red)' }}>{bot.loseCount}</span>
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', padding: '6px 8px' }}>
                                                                                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: bWinRateColor }}>
                                                                                                                {bot.winRate}%
                                                                                                            </span>
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, color: bot.profitFactor === 'Max' || parseFloat(bot.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(bot.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)', padding: '6px 8px' }}>
                                                                                                            {bot.profitFactor}
                                                                                                        </td>
                                                                                                        <td className={parseFloat(bot.avgProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, padding: '6px 8px' }}>
                                                                                                            {parseFloat(bot.avgProfit) >= 0 ? '+' : ''}${bot.avgProfit}
                                                                                                        </td>
                                                                                                        <td className={bProfitColorClass} style={{ fontSize: '11px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', padding: '6px 8px' }}>
                                                                                                            {bNetProfit >= 0 ? '+' : ''}${bot.totalProfit}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Bot breakdown metrics */}
                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: 'var(--text-secondary)' }}>
                                วิเคราะห์ประสิทธิภาพรายบอทเทรด (Bot Win Rate & Profit Analytics)
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
                                                <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: winRateColor }}>
                                                    {bot.winRate}%
                                                </td>
                                                <td className={parseFloat(bot.totalProfit) >= 0 ? 'price-up' : 'price-down'} style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
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
            </div>
        );
    }

    if (isChatbotPopout) {
        return (
            <div className="app-container" style={{ height: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div 
                    className="chatbot-window" 
                    style={{ 
                        position: 'relative',
                        bottom: 'auto',
                        right: 'auto',
                        width: '100%', 
                        maxWidth: '800px', 
                        height: '100vh', 
                        maxHeight: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: '0px',
                        border: 'none',
                        background: 'rgba(10, 15, 30, 0.75)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'none',
                        transition: 'none'
                    }}
                >
                    {/* Header */}
                    <div className="chatbot-header" style={{ cursor: 'default', padding: '16px 24px' }}>
                        <div className="chatbot-title-area">
                            <div className="chatbot-avatar-glow" style={{ width: '38px', height: '38px' }}>
                                <Icon name="message" size={18} />
                            </div>
                            <div className="chatbot-header-text">
                                <h4 style={{ fontSize: '15px' }}>Giant Slayer AI Assistant</h4>
                                <div className="chatbot-status">
                                    <div className="chatbot-status-dot"></div>
                                    <span>เชื่อมต่อสดกับพอร์ตการลงทุน</span>
                                </div>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button 
                                className="chatbot-action-btn"
                                onClick={clearChat}
                                title="ล้างการสนทนา"
                                style={{ padding: '8px' }}
                            >
                                <Icon name="trash" size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="chatbot-messages" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`chatbot-msg-wrapper ${msg.sender}`} style={{ maxWidth: '85%' }}>
                                <div className="chatbot-msg-bubble" style={{ fontSize: '13.5px', padding: '14px 20px' }}>
                                    {renderMessageContent(msg.text)}
                                </div>
                                <span className="chatbot-msg-time" style={{ fontSize: '10px' }}>{msg.timestamp}</span>
                            </div>
                        ))}
                        
                        {botIsTyping && (
                            <div className="chatbot-msg-wrapper bot">
                                <div className="chatbot-msg-bubble" style={{ padding: '12px 18px' }}>
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
                    <div className="chatbot-suggestions" style={{ padding: '12px 24px', flexWrap: 'wrap', gap: '10px', height: 'auto', background: 'rgba(10, 15, 30, 0.2)' }}>
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
                                style={{ fontSize: '12px', padding: '8px 14px' }}
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
                        style={{ padding: '16px 24px' }}
                    >
                        <div className="chatbot-input-wrapper">
                            <input 
                                type="text"
                                className="chatbot-input"
                                placeholder="พิมพ์ข้อความสอบถามการเทรดที่นี่..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                disabled={botIsTyping}
                                style={{ padding: '12px 20px', fontSize: '13px' }}
                            />
                        </div>
                        <button 
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!inputMessage.trim() || botIsTyping}
                            style={{ width: '40px', height: '40px' }}
                        >
                            <Icon name="send" size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (isPopout) {
        return (
            <div className="app-container" style={{ height: '100vh', background: 'var(--bg-main)', overflow: 'hidden' }}>
                <div className="terminal-content" style={{ flex: 1, padding: '16px', height: '100%', overflowY: 'auto' }}>
                    <div className="backtest-layout popout-view" style={{ height: 'calc(100vh - 32px)', minHeight: '600px' }}>
                        {/* Left Panel: Form Settings */}
                        <div className="backtest-sidebar-panel" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Icon name="settings" size={14} style={{ color: 'var(--accent-gold)' }} />
                                    <span>ตั้งค่าการทดสอบ (Setup)</span>
                                </h4>
                            </div>
                            
                            <form onSubmit={handleRunBacktest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label>สินทรัพย์ที่ต้องการทดสอบ (Symbol)</label>
                                    <select 
                                        className="numeric-input"
                                        value={backtestForm.symbol}
                                        onChange={(e) => setBacktestForm({ ...backtestForm, symbol: e.target.value })}
                                        style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                    >
                                        {watchlist.map(item => (
                                            <option key={item.symbol} value={item.symbol}>{item.symbol} - {item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group" style={{ margin: 0 }}>
                                    <label>กรอบเวลาแท่งเทียน (Timeframe)</label>
                                    <select 
                                        className="numeric-input"
                                        value={backtestForm.timeframe}
                                        onChange={(e) => setBacktestForm({ ...backtestForm, timeframe: e.target.value })}
                                        style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                    >
                                        <option value="M1">M1 (1 Minute)</option>
                                        <option value="M5">M5 (5 Minutes)</option>
                                        <option value="M15">M15 (15 Minutes)</option>
                                        <option value="M30">M30 (30 Minutes)</option>
                                        <option value="H1">H1 (1 Hour)</option>
                                        <option value="H4">H4 (4 Hours)</option>
                                        <option value="D1">D1 (1 Day)</option>
                                    </select>
                                </div>

                                <div className="input-group" style={{ margin: 0 }}>
                                    <label>จำนวนแท่งเทียนย้อนหลัง (Lookback)</label>
                                    <select 
                                        className="numeric-input"
                                        value={backtestForm.count}
                                        onChange={(e) => setBacktestForm({ ...backtestForm, count: parseInt(e.target.value) || 200 })}
                                        style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                    >
                                        <option value="100">100 candles</option>
                                        <option value="200">200 candles</option>
                                        <option value="500">500 candles</option>
                                        <option value="1000">1000 candles</option>
                                    </select>
                                </div>

                                <div className="input-group" style={{ margin: 0 }}>
                                    <div className="backtest-form-section-title">กลยุทธ์อัลกอริทึม (Algorithms)</div>
                                    <div className="backtest-checkbox-list">
                                        {[
                                            { value: 'smc_confluence_pro', label: 'SMC Confluence Pro 🌟' },
                                            { value: 'pj_indicator', label: 'PJ Indicator 🔮' },
                                            { value: 'smc_order_block', label: 'SMC Order Block 🟩' },
                                            { value: 'smc_fvg_imbalance', label: 'SMC FVG Imbalance ⚡' },
                                            { value: 'smc_bos_choch', label: 'SMC BOS / CHoCH 📈' },
                                            { value: 'rsi_oscillator', label: 'RSI Overbought/Oversold 🌊' },
                                            { value: 'stoch_rsi', label: 'Stochastic RSI ⚡' },
                                            { value: 'macd_4c', label: 'MACD 4 Color 📊' },
                                            { value: 'macd', label: 'MACD Crossover 🎛️' },
                                            { value: 'sma_cross', label: 'SMA Crossover ⚔️' },
                                            { value: 'ema_cross_50_200', label: 'EMA Crossover 50/200 🧬' },
                                            { value: 'harmonic_patterns', label: 'Harmonic Patterns 📐' },
                                            { value: 'elliott_wave', label: 'Elliott Wave 🌊' },
                                            { value: 'rsi_divergence', label: 'RSI Divergence 🎯' },
                                            { value: 'atr_breakout', label: 'ATR Breakout 📊' },
                                            { value: 'support_resistance', label: 'S/R Bounce 🧱' },
                                            { value: 'liquidity_sweep', label: 'Liquidity Sweep 🧹' }
                                        ].map((algo) => {
                                            const isChecked = backtestSelectedAlgos.includes(algo.value);
                                            return (
                                                <div 
                                                    key={algo.value}
                                                    className="backtest-checkbox-item"
                                                    onClick={() => {
                                                        if (isChecked) {
                                                            setBacktestSelectedAlgos(backtestSelectedAlgos.filter(a => a !== algo.value));
                                                        } else {
                                                            setBacktestSelectedAlgos([...backtestSelectedAlgos, algo.value]);
                                                        }
                                                    }}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        readOnly
                                                    />
                                                    <span>{algo.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="input-group" style={{ margin: 0 }}>
                                    <label>การยืนยันสัญญาณ (Consensus mode)</label>
                                    <select 
                                        className="numeric-input"
                                        value={backtestForm.signal_mode}
                                        onChange={(e) => setBacktestForm({ ...backtestForm, signal_mode: e.target.value })}
                                        style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                    >
                                        <option value="or">OR (สัญญาณใดสัญญาณหนึ่งออก)</option>
                                        <option value="and">AND (ทุกสัญญาณต้องออกร่วมกัน)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                                    <div className="input-group" style={{ margin: 0 }}>
                                        <label>เงินตั้งต้น (USD)</label>
                                        <input 
                                            type="number"
                                            className="numeric-input"
                                            value={backtestForm.initial_balance}
                                            onChange={(e) => setBacktestForm({ ...backtestForm, initial_balance: parseFloat(e.target.value) || 10000.0 })}
                                            style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                        />
                                    </div>
                                    <div className="input-group" style={{ margin: 0 }}>
                                        <label>ขนาด Lot size</label>
                                        <input 
                                            type="number"
                                            className="numeric-input"
                                            step="0.01"
                                            value={backtestForm.lot_size}
                                            onChange={(e) => setBacktestForm({ ...backtestForm, lot_size: parseFloat(e.target.value) || 0.1 })}
                                            style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div className="input-group" style={{ margin: 0 }}>
                                        <label style={{ color: 'var(--bear-red)' }}>Stop Loss (SL)</label>
                                        <input 
                                            type="number"
                                            className="numeric-input"
                                            placeholder="จุดห่างราคา"
                                            step="0.1"
                                            value={backtestForm.sl_points}
                                            onChange={(e) => setBacktestForm({ ...backtestForm, sl_points: parseFloat(e.target.value) || 0.0 })}
                                            style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                        />
                                    </div>
                                    <div className="input-group" style={{ margin: 0 }}>
                                        <label style={{ color: 'var(--bull-green)' }}>Take Profit (TP)</label>
                                        <input 
                                            type="number"
                                            className="numeric-input"
                                            placeholder="จุดห่างราคา"
                                            step="0.1"
                                            value={backtestForm.tp_points}
                                            onChange={(e) => setBacktestForm({ ...backtestForm, tp_points: parseFloat(e.target.value) || 0.0 })}
                                            style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                        />
                                    </div>
                                </div>

                                <div className="input-group" style={{ margin: '8px 0 0 0' }}>
                                    <label>ช่วงเวลาเทรด (Trading Session)</label>
                                    <select
                                        value={backtestForm.allowed_sessions || "all"}
                                        onChange={(e) => setBacktestForm({ ...backtestForm, allowed_sessions: e.target.value })}
                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '4px', width: '100%' }}
                                    >
                                        <option value="all">24 ชั่วโมง (All Sessions)</option>
                                        <option value="asian">Asian Only (00-08 UTC)</option>
                                        <option value="london">London Only (08-16 UTC)</option>
                                        <option value="newyork">NY Only (13-21 UTC)</option>
                                        <option value="london_ny">London + NY Overlap (13-16 UTC)</option>
                                    </select>
                                </div>

                                <button 
                                    type="submit"
                                    className="btn-primary"
                                    style={{ marginTop: '8px', padding: '10px 14px', fontSize: '12.5px', background: 'linear-gradient(135deg, var(--accent-gold), #f39c12)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                                    disabled={backtestLoading}
                                >
                                    เริ่มทดสอบย้อนหลัง (Run Backtest)
                                </button>
                            </form>
                        </div>

                        {/* Right Panel: Report Stats & Curve Chart & Deals List */}
                        <div className="backtest-main-report" style={{ height: '100%' }}>
                            {backtestLoading && (
                                <div className="backtest-loader-container">
                                    <div className="backtest-pulse-loader"></div>
                                    <h3 style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>กำลังประมวลผลการทดสอบย้อนหลัง...</h3>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ระบบกำลังทำการรันจำลองการเทรดแบบไร้ look-ahead bias ทีละแท่งเทียน</p>
                                </div>
                            )}

                            {!backtestLoading && !backtestResult && (
                                <div className="empty-terminal-state" style={{ height: '100%', flex: 1, border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-lg)', background: 'rgba(18,26,44,0.1)' }}>
                                    <Icon name="refresh" size={48} style={{ color: 'var(--text-muted)' }} />
                                    <h4 style={{ color: 'var(--text-secondary)' }}>ยินดีต้อนรับสู่ระบบทดสอบประสิทธิภาพเชิงลึก (Giant Backtester)</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '380px', textAlign: 'center' }}>
                                        ปรับเปลี่ยนสินทรัพย์ กรอบเวลา ความคลาดเคลื่อนความเสี่ยง SL/TP และเลือกสูตรกลยุทธ์ด้านซ้ายมือ จากนั้นกด "เริ่มทดสอบย้อนหลัง" เพื่อดูรายงานผลลัพธ์ประสิทธิภาพพอร์ตเชิงลึก
                                    </p>
                                </div>
                            )}

                            {!backtestLoading && backtestResult && (
                                <React.Fragment>
                                    {/* Smart View Tabs inside Backtest */}
                                    <div className="backtest-subtabs-bar">
                                        <button
                                            type="button"
                                            className={`backtest-subtab-btn ${backtestSubTab === 'stats' ? 'active' : ''}`}
                                            onClick={() => setBacktestSubTab('stats')}
                                        >
                                            <Icon name="trend-up" size={14} />
                                            <span>📊 สรุปสถิติเชิงลึก (Performance Dashboard)</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`backtest-subtab-btn ${backtestSubTab === 'price' ? 'active' : ''}`}
                                            onClick={() => setBacktestSubTab('price')}
                                        >
                                            <Icon name="info" size={14} />
                                            <span>🕯️ กราฟราคา & จุดเปิด-ปิด (Price & Trade Entries)</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`backtest-subtab-btn ${backtestSubTab === 'equity' ? 'active' : ''}`}
                                            onClick={() => setBacktestSubTab('equity')}
                                        >
                                            <Icon name="refresh" size={14} />
                                            <span>📈 กราฟเงินทุน (Equity Curve)</span>
                                        </button>
                                    </div>

                                    {/* Tab 1: Statistics Dashboard */}
                                    {backtestSubTab === 'stats' && (
                                        <React.Fragment>
                                            {/* Summary Stats Grid */}
                                            <div className="backtest-stats-grid">
                                                <div className="backtest-stat-card">
                                                    <span className="metric-label">กำไร/ขาดทุนสุทธิ (Net profit)</span>
                                                    <span className={`metric-value ${(backtestResult.net_profit ?? 0) >= 0 ? 'price-up' : 'price-down'}`}>
                                                        {(backtestResult.net_profit ?? 0) >= 0 ? '+' : ''}${(backtestResult.net_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="backtest-stat-card">
                                                    <span className="metric-label">อัตราการชนะ (Win Rate)</span>
                                                    <span className="metric-value" style={{ color: 'var(--accent-gold)' }}>
                                                        {backtestResult.win_rate}%
                                                    </span>
                                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                        ชนะ {(backtestResult.wins_count ?? 0)} | แพ้ {(backtestResult.losses_count ?? 0)}
                                                    </span>
                                                    <div className="winrate-gauge-container">
                                                        <div className="winrate-gauge-bar">
                                                            <div className="winrate-gauge-fill" style={{ width: `${backtestResult.win_rate ?? 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="backtest-stat-card">
                                                    <span className="metric-label">ออเดอร์ทั้งหมด (Total deals)</span>
                                                    <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                                                        {(backtestResult.total_trades ?? 0)} ไม้
                                                    </span>
                                                </div>
                                                <div className="backtest-stat-card">
                                                    <span className="metric-label">บาลานซ์สุทธิ (Final Balance)</span>
                                                    <span className="metric-value" style={{ color: 'var(--bull-green)' }}>
                                                        ${(backtestResult.final_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Detailed breakdown dashboard cards */}
                                            <div className="backtest-detailed-grid">
                                                {/* Card 1: Returns Analysis */}
                                                <div className="backtest-detail-card">
                                                    <h5>📊 วิเคราะห์ผลตอบแทน (Returns Analysis)</h5>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">กำไรรวมทั้งหมด (Gross Profit)</span>
                                                        <span className="backtest-detail-value price-up">+${(backtestResult.gross_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">ขาดทุนรวมทั้งหมด (Gross Loss)</span>
                                                        <span className="backtest-detail-value price-down">-${(backtestResult.gross_loss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">ตัวประกอบกำไร (Profit Factor)</span>
                                                        <span className="backtest-detail-value" style={{ 
                                                            color: (backtestResult.profit_factor ?? 0) >= 1.5 ? 'var(--bull-green)' : (backtestResult.profit_factor ?? 0) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {(backtestResult.profit_factor ?? 0)}
                                                        </span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">ความคาดหวังดีลเฉลี่ย (Expectancy)</span>
                                                        <span className={`backtest-detail-value ${(backtestResult.expectancy ?? 0) >= 0 ? 'price-up' : 'price-down'}`}>
                                                            {(backtestResult.expectancy ?? 0) >= 0 ? '+' : ''}${(backtestResult.expectancy ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 2: Risk & Drawdown */}
                                                <div className="backtest-detail-card">
                                                    <h5>🛡️ การควบคุมความเสี่ยง (Risk & Drawdown)</h5>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">การย่อตัวลึกสุด (Max Drawdown)</span>
                                                        <span className="backtest-detail-value price-down">-${(backtestResult.max_drawdown ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">เปอร์เซ็นต์ย่อตัวลึกสุด (Max Drawdown %)</span>
                                                        <span className="backtest-detail-value price-down">-{(backtestResult.max_drawdown_percent ?? 0)}%</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">เงินตั้งต้นจำลอง (Initial Balance)</span>
                                                        <span className="backtest-detail-value" style={{ color: 'var(--text-secondary)' }}>${(backtestResult.initial_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">ระดับความเสี่ยงพอร์ต (Risk Rating)</span>
                                                        <span className="backtest-detail-value" style={{ 
                                                            color: (backtestResult.max_drawdown_percent ?? 0) <= 10 ? 'var(--bull-green)' : (backtestResult.max_drawdown_percent ?? 0) <= 20 ? 'var(--accent-gold)' : 'var(--bear-red)'
                                                        }}>
                                                            {(backtestResult.max_drawdown_percent ?? 0) <= 10 ? 'ต่ำ (Low Risk)' : (backtestResult.max_drawdown_percent ?? 0) <= 20 ? 'ปานกลาง (Medium Risk)' : 'สูง (High Drawdown!)'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 3: Trade Statistics */}
                                                <div className="backtest-detail-card">
                                                    <h5>🧬 พฤติกรรมดีลการเทรด (Trade Statistics)</h5>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">เฉลี่ยต่อดีลกำไร (Average Win)</span>
                                                        <span className="backtest-detail-value price-up">+${(backtestResult.avg_win ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">เฉลี่ยต่อดีลขาดทุน (Average Loss)</span>
                                                        <span className="backtest-detail-value price-down">-${(backtestResult.avg_loss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">อัตราส่วนเฉลี่ย Win/Loss RR</span>
                                                        <span className="backtest-detail-value">
                                                            {(backtestResult.avg_loss ?? 0) > 0 ? ((backtestResult.avg_win ?? 0) / (backtestResult.avg_loss ?? 1)).toFixed(2) : (backtestResult.avg_win ?? 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="backtest-detail-row">
                                                        <span className="backtest-detail-label">สตรีคชนะ / แพ้ ต่อเนื่องสูงสุด</span>
                                                        <span className="backtest-detail-value">
                                                            <span className="price-up">{(backtestResult.max_consecutive_wins ?? 0)} Wins</span> / <span className="price-down">{(backtestResult.max_consecutive_losses ?? 0)} Losses</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )}

                                    {/* Tab 2: Candlestick & Entries Chart */}
                                    {backtestSubTab === 'price' && (
                                        <React.Fragment>
                                            <div className="backtest-chart-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    🕯️ กราฟราคาสินทรัพย์จำลองและจุดเข้าเทรดจริง (Asset Candlestick & Entries Chart)
                                                </h4>
                                                <div ref={backtestPriceChartContainerRef} className="backtest-chart-container" style={{ flex: 1, height: '100%' }}></div>
                                            </div>
                                            {renderBacktestDealsTable('450px', true)}
                                        </React.Fragment>
                                    )}

                                    {/* Tab 3: Equity Curve Chart */}
                                    {backtestSubTab === 'equity' && (
                                        <div className="backtest-chart-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                            <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                📈 กราฟแสดงเส้นความเติบโตของทุนสำรองสุทธิ (Simulated Equity Growth Curve)
                                            </h4>
                                            <div ref={backtestChartContainerRef} className="backtest-chart-container" style={{ flex: 1, height: '100%' }}></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* --- HEADER --- */}
            <header>
                <div className="brand-section">
                    <div className="brand-logo">G</div>
                    <div>
                        <h1 className="brand-title">GIANT SLAYER</h1>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>MT5 TRADER PRO</span>
                    </div>
                </div>

                {/* Live values metrics */}
                <div className="account-bar">
                    <div className="account-metric">
                        <span className="metric-label">Balance</span>
                        <span className="metric-value" style={{ fontFamily: 'monospace' }}>
                            ${(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Equity</span>
                        <span className="metric-value" style={{ fontFamily: 'monospace' }}>
                            ${(account.equity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Used Margin</span>
                        <span className="metric-value" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            ${(account.margin ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="account-metric">
                        <span className="metric-label">Floating Profit</span>
                        <span className={`metric-value ${(account.profit ?? 0) >= 0 ? 'pnl-positive' : 'pnl-negative'}`} style={{ fontFamily: 'monospace' }}>
                            {(account.profit ?? 0) >= 0 ? '+' : ''}${(account.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

            {/* --- BREAKING NEWS TICKER BAR --- */}
            {newsData && newsData.news && newsData.news.length > 0 && (
                <div className="breaking-news-ticker-bar" onClick={() => { setActiveTab("news"); setIsTerminalCollapsed(false); }}>
                    <div className="ticker-label">
                        <span>⚡ BREAKING NEWS</span>
                    </div>
                    <div className="ticker-content-wrapper">
                        <div className="ticker-content">
                            {newsData.news.map((item, idx) => {
                                const impactClass = item.impact === "HIGH" ? "impact-high" : item.impact === "MEDIUM" ? "impact-medium" : "impact-low";
                                const sentimentEmoji = item.sentiment === "bullish" ? "📈" : item.sentiment === "bearish" ? "📉" : "⚖️";
                                return (
                                    <span key={item.id || idx} className={`ticker-item ${impactClass}`}>
                                        <span className="ticker-dot">•</span>
                                        <span className="ticker-time">[{item.time ? (item.time.includes('T') ? item.time.split('T')[1].slice(0, 5) : item.time.slice(0, 16)) : ""}]</span>
                                        <span className="ticker-emoji">{sentimentEmoji}</span>
                                        <span className="ticker-title">{item.title_th || item.title}</span>
                                        {item.impact === "HIGH" && <span className="ticker-badge-high">HIGH RISK</span>}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="ticker-cta">
                        <span>ดูวิเคราะห์ AI 🛡️</span>
                    </div>
                </div>
            )}

            {/* --- MAIN WORK GRID --- */}
            <div 
                className="main-dashboard"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `${isWatchlistCollapsed ? '0px' : '280px'} 1fr ${isExecutionCollapsed ? '0px' : '340px'}`,
                    transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* 1. Left Watchlist */}
                <div 
                    className="watchlist-sidebar"
                    style={{
                        width: isWatchlistCollapsed ? '0px' : '280px',
                        minWidth: isWatchlistCollapsed ? '0px' : '280px',
                        overflow: 'hidden',
                        opacity: isWatchlistCollapsed ? 0 : 1,
                        borderRight: isWatchlistCollapsed ? 'none' : '1px solid var(--border-color)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>ตลาดซื้อขาย (Markets)</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                                onClick={() => setShowAddWatchlistForm(!showAddWatchlistForm)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: showAddWatchlistForm ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                }}
                                title="เพิ่มสินค้าเทรด (Add Symbol)"
                            >
                                <Icon name="plus" size={16} />
                            </button>
                        </div>
                    </div>

                    {showAddWatchlistForm && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="เช่น GBPUSD" 
                                    value={addWatchlistForm.symbol}
                                    onChange={(e) => setAddWatchlistForm({ ...addWatchlistForm, symbol: e.target.value.toUpperCase() })}
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        padding: '6px 8px',
                                        fontSize: '11px',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <input 
                                    type="text" 
                                    placeholder="ชื่อ เช่น Pound Sterling" 
                                    value={addWatchlistForm.name}
                                    onChange={(e) => setAddWatchlistForm({ ...addWatchlistForm, name: e.target.value })}
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        padding: '6px 8px',
                                        fontSize: '11px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <select
                                    value={addWatchlistForm.asset_type}
                                    onChange={(e) => setAddWatchlistForm({ ...addWatchlistForm, asset_type: e.target.value })}
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '4px',
                                        color: 'var(--text-secondary)',
                                        padding: '4px 6px',
                                        fontSize: '11px',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="forex">Forex</option>
                                    <option value="gold">Gold/Metal</option>
                                    <option value="crypto">Crypto</option>
                                    <option value="stock">Stock</option>
                                </select>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => setShowAddWatchlistForm(false)}
                                        style={{ margin: 0, padding: '4px 10px', fontSize: '10px', height: 'fit-content' }}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleAddWatchlist}
                                        style={{ margin: 0, padding: '4px 12px', fontSize: '10px', background: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', height: 'fit-content' }}
                                    >
                                        เพิ่ม
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
                                        setSelectedHistoryOrder(null);
                                        setSelectedBacktestTrade(null);
                                    }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}
                                >
                                    <div className="asset-details" style={{ flex: 1, overflow: 'hidden' }}>
                                        <span className="asset-symbol" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {item.symbol}
                                        </span>
                                        <span className="asset-name">{item.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="asset-price-box">
                                            <span className={`asset-price ${changeColor}`}>
                                                {pr.bid > 0 ? pr.bid.toLocaleString('en-US', { minimumFractionDigits: item.symbol === "EURUSD" ? 5 : 2 }) : '...'}
                                            </span>
                                            <span className={`asset-change ${changeColor}`}>
                                                {parseFloat(pr.change) >= 0 ? '+' : ''}{pr.change}%
                                            </span>
                                        </div>
                                        <button 
                                            className="delete-watchlist-btn"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s',
                                                opacity: 0.5
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWatchlist(item.symbol);
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'var(--bear-red)';
                                                e.currentTarget.style.opacity = 1;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                e.currentTarget.style.opacity = 0.5;
                                            }}
                                            title={`ลบ ${item.symbol}`}
                                        >
                                            <Icon name="trash" size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Middle (Chart & Terminal) */}
                <div 
                    className="center-content"
                    style={{ 
                        gridTemplateRows: isTerminalExpanded ? '150px 1fr' : isTerminalCollapsed ? '1fr 40px' : '1fr 380px',
                        transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* Top Chart Box */}
                    <div className="chart-container-box">
                        <div className="chart-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="active-symbol-info">
                                    <span className="active-symbol-title">{activeAsset.symbol}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeAsset.name}</span>
                                </div>
                                
                                {/* ✏️ Drawing Tools Toolbar */}
                                <div className="drawing-tools-bar" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '3px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <button 
                                        className={`drawing-btn ${drawingTool === 'trendline' ? 'active' : ''}`}
                                        onClick={() => setDrawingTool(drawingTool === 'trendline' ? null : 'trendline')}
                                        title="📈 วาดเส้นแนวโน้ม (Trendline - คลิก 2 จุด)"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: drawingTool === 'trendline' ? 'rgba(255, 183, 3, 0.2)' : 'rgba(255,255,255,0.03)',
                                            borderColor: drawingTool === 'trendline' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                                            color: drawingTool === 'trendline' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon name="pencil" size={12} />
                                        <span>Trendline</span>
                                    </button>

                                    <button 
                                        className={`drawing-btn ${drawingTool === 'horizontal' ? 'active' : ''}`}
                                        onClick={() => setDrawingTool(drawingTool === 'horizontal' ? null : 'horizontal')}
                                        title="➖ วาดเส้นระดับราคาแนวนอน (Horizontal Line - คลิก 1 จุด)"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: drawingTool === 'horizontal' ? 'rgba(255, 183, 3, 0.2)' : 'rgba(255,255,255,0.03)',
                                            borderColor: drawingTool === 'horizontal' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                                            color: drawingTool === 'horizontal' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon name="minus" size={12} />
                                        <span>Horizontal</span>
                                    </button>

                                    <button 
                                        className="drawing-btn"
                                        onClick={autoDrawSMC}
                                        title="🤖 ตีเส้น BOS และ CHoCH อัตโนมัติ (SMC Smart Market Structure)"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,183,3,0.2)',
                                            background: 'rgba(255,183,3,0.05)',
                                            borderColor: 'rgba(255,183,3,0.3)',
                                            color: 'var(--accent-gold)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Icon name="server" size={12} />
                                        <span>Auto BOS/CHoCH</span>
                                    </button>

                                    <button
                                        onClick={() => setShowChartPatterns(!showChartPatterns)}
                                        title={showChartPatterns ? "ซ่อน Elliott Wave บนกราฟ" : "แสดง Elliott Wave บนกราฟ"}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: showChartPatterns ? 'rgba(0, 180, 216, 0.15)' : 'rgba(255,255,255,0.03)',
                                            borderColor: showChartPatterns ? '#00b4d8' : 'rgba(255,255,255,0.08)',
                                            color: showChartPatterns ? '#00b4d8' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {showChartPatterns ? (
                                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        )}
                                        <span>Elliott Wave</span>
                                    </button>

                                    {drawnLinesRef.current.some(line => line.symbol === activeSymbol) && (
                                        <button 
                                            className="drawing-btn"
                                            onClick={clearDrawings}
                                            title="🧹 ล้างลายเส้นทั้งหมดของสินทรัพย์นี้"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(231,76,60,0.2)',
                                                background: 'rgba(231,76,60,0.1)',
                                                color: '#e74c3c',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Icon name="eraser" size={12} />
                                            <span>Clear</span>
                                        </button>
                                    )}
                                </div>

                                {/* 🎛️ Sidebar Panels toggles */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                                    <button
                                        onClick={() => setIsWatchlistCollapsed(!isWatchlistCollapsed)}
                                        title={isWatchlistCollapsed ? "แสดงรายชื่อสินทรัพย์ (Watchlist)" : "ซ่อนรายชื่อสินทรัพย์ (Watchlist)"}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: isWatchlistCollapsed ? 'rgba(255,255,255,0.03)' : 'rgba(255,183,3,0.1)',
                                            borderColor: isWatchlistCollapsed ? 'rgba(255,255,255,0.08)' : 'rgba(255,183,3,0.3)',
                                            color: isWatchlistCollapsed ? 'var(--text-secondary)' : 'var(--accent-gold)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isWatchlistCollapsed ? "📂 แสดงตลาด" : "📁 ซ่อนตลาด"}
                                    </button>

                                    <button
                                        onClick={() => setIsExecutionCollapsed(!isExecutionCollapsed)}
                                        title={isExecutionCollapsed ? "แสดงส่วนส่งคำสั่งซื้อขาย (Order Execution)" : "ซ่อนส่วนส่งคำสั่งซื้อขาย (Order Execution)"}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: isExecutionCollapsed ? 'rgba(255,255,255,0.03)' : 'rgba(255,183,3,0.1)',
                                            borderColor: isExecutionCollapsed ? 'rgba(255,255,255,0.08)' : 'rgba(255,183,3,0.3)',
                                            color: isExecutionCollapsed ? 'var(--text-secondary)' : 'var(--accent-gold)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isExecutionCollapsed ? "📂 แสดงส่งคำสั่ง" : "📁 ซ่อนส่งคำสั่ง"}
                                    </button>
                                </div>
                            </div>
                            
                            {/* 🎛️ Premium Layout Grid Selector */}
                            <div className="layout-selector" style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)', gap: '2px' }}>
                                <button 
                                    className={`layout-btn ${chartLayout === 'single' ? 'active' : ''}`}
                                    onClick={() => setChartLayout('single')}
                                    title="1 หน้าจอแสดงผลเต็มหน้า"
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: chartLayout === 'single' ? 'var(--accent-gold)' : 'transparent',
                                        color: chartLayout === 'single' ? '#000' : 'var(--text-secondary)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    🖥️ 1 จอ
                                </button>
                                <button 
                                    className={`layout-btn ${chartLayout === 'dual' ? 'active' : ''}`}
                                    onClick={() => setChartLayout('dual')}
                                    title="2 หน้าจอแยกคู่ (ซ้าย-ขวา)"
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: chartLayout === 'dual' ? 'var(--accent-gold)' : 'transparent',
                                        color: chartLayout === 'dual' ? '#000' : 'var(--text-secondary)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    ⚖️ 2 จอ
                                </button>
                                <button 
                                    className={`layout-btn ${chartLayout === 'quad' ? 'active' : ''}`}
                                    onClick={() => setChartLayout('quad')}
                                    title="4 หน้าจอแยกตาราง (2x2)"
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: chartLayout === 'quad' ? 'var(--accent-gold)' : 'transparent',
                                        color: chartLayout === 'quad' ? '#000' : 'var(--text-secondary)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    🎛️ 4 จอ
                                </button>
                            </div>

                            <div className="timeframe-selector">
                                {["M1", "M5", "M15", "M30", "H1", "D1"].map((tf) => (
                                    <button 
                                        key={tf} 
                                        className={`timeframe-btn ${paneTimeframes[activePaneId] === tf ? 'active' : ''}`}
                                        onClick={() => {
                                            setTimeframe(tf);
                                            setPaneTimeframes(prev => ({
                                                ...prev,
                                                [activePaneId]: tf
                                            }));
                                        }}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Multi-Chart Grid container */}
                        <div 
                            className={`chart-grid-container layout-${chartLayout}`}
                            style={{
                                display: 'grid',
                                width: '100%',
                                height: '100%',
                                flex: 1,
                                gap: '8px',
                                padding: '8px',
                                gridTemplateColumns: chartLayout === 'single' ? '1fr' : '1fr 1fr',
                                gridTemplateRows: chartLayout === 'quad' ? '1fr 1fr' : '1fr',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {/* Render active chart panes dynamically */}
                            {(chartLayout === 'single' ? [0] : chartLayout === 'dual' ? [0, 1] : [0, 1, 2, 3]).map((paneId) => {
                                const isActive = activePaneId === paneId;
                                const paneTf = paneTimeframes[paneId] || 'H1';
                                return (
                                    <div 
                                        key={paneId}
                                        className={`chart-pane-wrapper ${isActive ? 'active' : ''}`}
                                        onClick={() => setActivePaneId(paneId)}
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#0c1220',
                                            border: isActive ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            boxShadow: isActive ? 'var(--glow-gold)' : 'none',
                                            transition: 'border 0.2s, box-shadow 0.2s'
                                        }}
                                    >
                                        {/* Pane Mini Overlay Header */}
                                        <div 
                                            className="chart-pane-header"
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '12px',
                                                right: '12px',
                                                zIndex: 5,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                pointerEvents: 'auto',
                                                background: 'rgba(12, 18, 32, 0.85)',
                                                backdropFilter: 'blur(6px)',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isActive ? 'var(--accent-gold)' : 'transparent',
                                                    border: isActive ? 'none' : '1px solid var(--text-muted)'
                                                }}></span>
                                                <strong style={{ fontSize: '11px', color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                                    {activeSymbol}
                                                </strong>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {paneTf}
                                                </span>
                                            </div>
                                            
                                            {/* Timeframe quick switches */}
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {["M1", "M5", "M15", "M30", "H1", "D1"].map((tf) => (
                                                    <button
                                                        key={tf}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPaneTimeframes(prev => ({
                                                                ...prev,
                                                                [paneId]: tf
                                                            }));
                                                            if (isActive) setTimeframe(tf);
                                                        }}
                                                        style={{
                                                            fontSize: '9px',
                                                            background: paneTf === tf ? 'var(--accent-gold)' : 'transparent',
                                                            color: paneTf === tf ? '#000' : 'var(--text-secondary)',
                                                            border: 'none',
                                                            borderRadius: '3px',
                                                            padding: '2px 5px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {tf}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Chart Render Target */}
                                        <div 
                                            ref={el => { if (el) containersRef.current[paneId] = el; }}
                                            className="chart-container-target"
                                            style={{ width: '100%', height: '100%', flex: 1 }}
                                        >
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {drawingTool && (
                                <div style={{
                                    position: 'absolute',
                                    top: '64px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 10,
                                    background: 'rgba(12, 18, 32, 0.95)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid ' + (drawingTool === 'bos' ? '#00b4d8' : drawingTool === 'choch' ? '#ff477e' : 'var(--accent-gold)'),
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    color: drawingTool === 'bos' ? '#00b4d8' : drawingTool === 'choch' ? '#ff477e' : 'var(--accent-gold)',
                                    fontSize: '11px',
                                    boxShadow: drawingTool === 'bos' ? '0 0 12px rgba(0, 180, 216, 0.3)' : drawingTool === 'choch' ? '0 0 12px rgba(255, 71, 126, 0.3)' : 'var(--glow-gold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    pointerEvents: 'none',
                                    fontWeight: 500,
                                    letterSpacing: '0.3px',
                                    borderLeftWidth: '4px'
                                }}>
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: drawingTool === 'bos' ? '#00b4d8' : drawingTool === 'choch' ? '#ff477e' : 'var(--accent-gold)',
                                        boxShadow: '0 0 8px ' + (drawingTool === 'bos' ? '#00b4d8' : drawingTool === 'choch' ? '#ff477e' : 'var(--accent-gold)'),
                                    }}></div>
                                    <span>
                                        {drawingTool === 'trendline' 
                                            ? (!drawingStartPoint ? "โหมด Trendline: คลิกเลือกจุดแรกบนกราฟจอใดก็ได้" : "โหมด Trendline: คลิกเลือกจุดที่สองเพื่อสร้างเส้น")
                                            : drawingTool === 'bos'
                                            ? "โหมด BOS: คลิกที่ตำแหน่งราคาบนจอใดก็ได้เพื่อสร้างเส้นแนวระดับ BOS ทุกจอ"
                                            : drawingTool === 'choch'
                                            ? "โหมด CHoCH: คลิกที่ตำแหน่งราคาบนจอใดก็ได้เพื่อสร้างเส้นแนวระดับ CHoCH ทุกจอ"
                                            : "โหมด Horizontal: คลิกที่ตำแหน่งราคาบนจอใดก็ได้เพื่อสร้างแนวราบทุกจอ"
                                        }
                                    </span>
                                </div>
                            )}
                            <div className="chart-watermark">GIANT SLAYER</div>
                        </div>
                    </div>

                    {/* Bottom Terminal (Positions & History) */}
                    <div className="terminal-tabs-box">
                        <div className="terminal-header-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('positions'); setIsTerminalCollapsed(false); }}
                            >
                                <Icon name="wallet" size={14} />
                                <span>โพสิชันที่เปิด ({openPositions.length})</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('history'); setIsTerminalCollapsed(false); }}
                            >
                                <Icon name="history" size={14} />
                                <span>ประวัติการเทรด ({tradeHistory.length})</span>
                            </button>
                            <div 
                                className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('analytics'); setIsTerminalCollapsed(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Icon name="trend-up" size={14} />
                                <span>การวิเคราะห์เชิงลึก (Analytics)</span>
                                <span 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open('/?popout=analytics', '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no');
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2px 6px',
                                        marginLeft: '6px',
                                        borderRadius: '4px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 183, 3, 0.15)';
                                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                        e.currentTarget.style.color = 'var(--accent-gold)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                     }}
                                     title="เปิดในหน้าต่างใหม่ (Popout)"
                                 >
                                     <Icon name="external-link" size={10} />
                                 </span>
                            </div>
                            <button 
                                className={`tab-btn ${activeTab === 'bots' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('bots'); setIsTerminalCollapsed(false); }}
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
                            <button 
                                className={`tab-btn ${activeTab === 'backtest' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('backtest'); setIsTerminalCollapsed(false); }}
                            >
                                <Icon name="refresh" size={14} />
                                <span>ทดสอบย้อนหลัง (Backtest)</span>
                            </button>
                            <div 
                                className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('news'); setIsTerminalCollapsed(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Icon name="info" size={14} />
                                <span>ข่าวและ AI วิเคราะห์</span>
                                <span 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open('/?popout=news', '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no');
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2px 6px',
                                        marginLeft: '6px',
                                        borderRadius: '4px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 183, 3, 0.15)';
                                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                        e.currentTarget.style.color = 'var(--accent-gold)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                     }}
                                     title="เปิดในหน้าต่างใหม่ (Popout)"
                                 >
                                     <Icon name="external-link" size={10} />
                                 </span>
                            </div>

                            {/* Collapse/Expand Terminal Toggle Button */}
                            <button 
                                className="tab-btn"
                                onClick={() => {
                                    const nextState = !isTerminalCollapsed;
                                    setIsTerminalCollapsed(nextState);
                                    if (nextState && isTerminalExpanded) {
                                        setIsTerminalExpanded(false);
                                    }
                                }}
                                style={{ 
                                    marginLeft: 'auto', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    color: isTerminalCollapsed ? 'var(--accent-gold)' : 'var(--text-secondary)', 
                                    padding: '0 16px',
                                    borderLeft: '1px solid var(--border-color)'
                                }}
                                title={isTerminalCollapsed ? "แสดงข้อมูลเทอร์มินัล (Expand)" : "ซ่อนข้อมูลเทอร์มินัล (Collapse)"}
                            >
                                {isTerminalCollapsed ? (
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 15 12 9 6 15" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                )}
                                <span>{isTerminalCollapsed ? "แสดงพาเนล" : "ซ่อนพาเนล"}</span>
                            </button>

                            {/* Maximize/Minimize Terminal Toggle Button */}
                            <button 
                                className="tab-btn"
                                onClick={() => {
                                    const nextState = !isTerminalExpanded;
                                    setIsTerminalExpanded(nextState);
                                    if (nextState && isTerminalCollapsed) {
                                        setIsTerminalCollapsed(false);
                                    }
                                }}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    color: isTerminalExpanded ? 'var(--accent-gold)' : 'var(--text-secondary)', 
                                    padding: '0 16px',
                                    borderLeft: '1px solid var(--border-color)'
                                }}
                                title={isTerminalExpanded ? "ย่อหน้าจอเทอร์มินัล (Minimize)" : "ขยายหน้าจอเทอร์มินัล (Maximize)"}
                            >
                                {isTerminalExpanded ? (
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                                        <polyline points="4 14 10 14 10 20" />
                                        <polyline points="20 10 14 10 14 4" />
                                        <line x1="14" y1="10" x2="21" y2="3" />
                                        <line x1="10" y1="14" x2="3" y2="21" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                                        <polyline points="15 3 21 3 21 9" />
                                        <polyline points="9 21 3 21 3 15" />
                                        <line x1="21" y1="3" x2="14" y2="10" />
                                        <line x1="3" y1="21" x2="10" y2="14" />
                                    </svg>
                                )}
                                <span>{isTerminalExpanded ? "ย่อหน้าจอ" : "ขยายหน้าจอ"}</span>
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
                                            {openPositions.map((pos) => {
                                                const isSelected = selectedHistoryOrder && selectedHistoryOrder.ticket === pos.ticket;
                                                return (
                                                    <tr 
                                                        key={pos.ticket}
                                                        onClick={() => handleHistoryOrderClick(pos)}
                                                        className={isSelected ? 'selected-history-row' : ''}
                                                        style={{ cursor: 'pointer' }}
                                                    >
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
                                                        <td style={{ fontFamily: 'monospace' }}>{(pos.open_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{(pos.current_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ fontFamily: 'monospace', color: pos.sl > 0 ? 'var(--bear-red)' : 'var(--text-muted)' }}>{pos.sl > 0 ? pos.sl.toFixed(2) : '-'}</td>
                                                        <td style={{ fontFamily: 'monospace', color: pos.tp > 0 ? 'var(--bull-green)' : 'var(--text-muted)' }}>{pos.tp > 0 ? pos.tp.toFixed(2) : '-'}</td>
                                                        <td 
                                                            className={(pos.profit ?? 0) >= 0 ? 'price-up' : 'price-down'}
                                                            style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}
                                                        >
                                                            {(pos.profit ?? 0) >= 0 ? '+' : ''}${(pos.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn-close-position"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClosePosition(pos.ticket);
                                                                }}
                                                            >
                                                                ปิดออเดอร์
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                                                <th>SL</th>
                                                <th>TP</th>
                                                <th>ราคาปิด</th>
                                                <th>กำไร/ขาดทุน (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tradeHistory.map((t, idx) => {
                                                const isManual = !t.comment || (() => {
                                                    const l = t.comment.toLowerCase();
                                                    return l === 'manual' || l === 'เทรดเอง (manual)' || l === 'simulation' || l.includes('real close') || l.includes('close via') || l.includes('mt5 trader');
                                                })();
                                                const cleanComment = t.comment ? t.comment.replace(/\s*\[.*?\]$/, '') : '';
                                                const sourceName = cleanComment ? (() => {
                                                    const l = cleanComment.toLowerCase();
                                                    const isManualComment = l === 'manual' || l === 'simulation' || l === 'เทรดเอง (manual)' || l.includes('real close') || l.includes('close via') || l.includes('mt5 trader');
                                                    return isManualComment ? 'เทรดเอง (Manual)' : cleanComment;
                                                })() : 'เทรดเอง (Manual)';
                                                
                                                const decimals = t.symbol && t.symbol.includes('EURUSD') ? 5 : 2;
                                                const formatP = (val) => {
                                                    if (val === undefined || val === null || val === 0 || isNaN(Number(val))) return '-';
                                                    return Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
                                                };
                                                
                                                const isSelected = selectedHistoryOrder && selectedHistoryOrder.ticket === t.ticket;
                                                return (
                                                    <tr 
                                                        key={`${t.ticket}-${idx}`}
                                                        onClick={() => handleHistoryOrderClick(t)}
                                                        className={isSelected ? 'selected-history-row' : ''}
                                                        style={{ cursor: 'pointer' }}
                                                    >
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
                                                        <td style={{ fontFamily: 'monospace' }}>{formatP(t.open_price)}</td>
                                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatP(t.sl)}</td>
                                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatP(t.tp)}</td>
                                                        <td style={{ fontFamily: 'monospace' }}>{formatP(t.close_price)}</td>
                                                        <td 
                                                            className={(t.profit ?? 0) >= 0 ? 'price-up' : 'price-down'}
                                                            style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}
                                                        >
                                                            {(t.profit ?? 0) >= 0 ? '+' : ''}${(t.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                                    {/* Popout Button for Deep Analytics & Filter Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {/* Time Filter Segmented Control */}
                                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                            {['all', 'day', 'week', 'month', 'year'].map(filter => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setAnalyticsTimeFilter(filter)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        background: analyticsTimeFilter === filter ? 'var(--accent-gold)' : 'transparent',
                                                        color: analyticsTimeFilter === filter ? '#000' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {filter === 'all' ? 'ทั้งหมด' : filter === 'day' ? 'วันนี้' : filter === 'week' ? 'สัปดาห์นี้' : filter === 'month' ? 'เดือนนี้' : 'ปีนี้'}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            className="btn-trade-execute buy"
                                            onClick={() => window.open('/?popout=analytics', '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no')}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                padding: '6px 12px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                borderRadius: '4px',
                                                border: '1px solid var(--accent-gold)',
                                                background: 'rgba(255, 183, 3, 0.08)',
                                                color: 'var(--accent-gold)',
                                                cursor: 'pointer',
                                                boxShadow: 'none'
                                            }}
                                            title="เปิดในหน้าต่างใหม่ (Popout Window)"
                                        >
                                            <Icon name="external-link" size={12} />
                                            <span>เปิดวิเคราะห์พอร์ตในหน้าต่างใหม่ (Popout)</span>
                                        </button>
                                    </div>
                                    {/* Top Summary Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>ยอดกำไรรวมสะสม</span>
                                            <h4 className={parseFloat(analytics.totalProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                {parseFloat(analytics.totalProfit) >= 0 ? '+' : ''}${analytics.totalProfit}
                                            </h4>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                สูงสุด: <span className="price-up">+${analytics.best}</span> | ต่ำสุด: <span className="price-down">${analytics.worst}</span>
                                            </span>
                                        </div>
                                        
                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center', borderLeft: '3px solid ' + (parseFloat(analytics.todayProfit) >= 0 ? 'var(--bull-green)' : 'var(--bear-red)') }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>กำไร/ขาดทุน วันนี้</span>
                                            <h4 className={parseFloat(analytics.todayProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                {parseFloat(analytics.todayProfit) >= 0 ? '+' : ''}${analytics.todayProfit}
                                            </h4>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                วันนี้: ชนะ {analytics.todayWins}/{analytics.todayTrades} ออเดอร์ ({analytics.todayWinRate}%)
                                            </span>
                                        </div>

                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>กำไรรวมเดือนปัจจุบัน</span>
                                            <h4 className={parseFloat(analytics.monthProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '24px', marginTop: '6px', fontFamily: 'monospace' }}>
                                                {parseFloat(analytics.monthProfit) >= 0 ? '+' : ''}${analytics.monthProfit}
                                            </h4>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                ภาพรวมรอบเดือน {new Date().toLocaleString('th-TH', { month: 'long' })}
                                            </span>
                                        </div>

                                        <div className="sidebar-panel-card" style={{ padding: '16px', textAlign: 'center' }}>
                                            <span className="metric-label" style={{ fontSize: '10px' }}>อัตราการชนะรวม (Win Rate)</span>
                                            <h4 style={{ fontSize: '24px', marginTop: '6px', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                                                {analytics.winRate}%
                                            </h4>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                ชนะ {analytics.winCount} | แพ้ {analytics.loseCount} จากทั้งหมด {analytics.totalTrades} ออเดอร์
                                            </span>
                                        </div>
                                    </div>

                                    {/* Institutional Performance Analytics Card */}
                                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
                                            สถิติวินัยและการวิเคราะห์ความแม่นยำระดับสถาบัน (Institutional Metrics)
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>อัตราสัดส่วนกำไรต่อขาดทุน (Profit Factor)</span>
                                                <h4 style={{ fontSize: '20px', margin: 0, fontFamily: 'monospace', color: analytics.profitFactor === 'Max' || parseFloat(analytics.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(analytics.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)' }}>
                                                    {analytics.profitFactor}
                                                </h4>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                                                    {analytics.profitFactor === 'Max' || parseFloat(analytics.profitFactor) >= 1.5 ? '🟢 ประสิทธิภาพยอดเยี่ยม (Excellent)' : parseFloat(analytics.profitFactor) >= 1.0 ? '🟡 ประสิทธิภาพระดับปลอดภัย (Good)' : '🔴 ขาดทุนมากกว่ากำไร (High Risk)'}
                                                </span>
                                            </div>
                                            
                                            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สถิติการชนะ/แพ้ต่อเนื่องสูงสุด (Streak Record)</span>
                                                <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0', color: 'var(--text-secondary)' }}>
                                                    ชนะติดกันสูงสุด: <span style={{ color: 'var(--bull-green)', fontFamily: 'monospace', fontSize: '15px' }}>{analytics.maxConWins}</span> ไม้
                                                    <br />
                                                    แพ้ติดกันสูงสุด: <span style={{ color: 'var(--bear-red)', fontFamily: 'monospace', fontSize: '15px' }}>{analytics.maxConLosses}</span> ไม้
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>กำไร-ขาดทุนเฉลี่ย / สัดส่วน Risk to Reward (R:R)</span>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                                    กำไรเฉลี่ยไม้ชนะ: <span className="price-up" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>+${analytics.avgWin}</span>
                                                    <br />
                                                    ขาดทุนเฉลี่ยไม้แพ้: <span className="price-down" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>-${analytics.avgLoss}</span>
                                                </div>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                    R:R จริงเฉลี่ย: <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace' }}>1 : {analytics.riskRewardRatio}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trading Sessions Performance Analytics Card */}
                                    <div className="sidebar-panel-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: 'var(--text-secondary)' }}>
                                                วิเคราะห์สถิติกำไรและประสิทธิภาพแยกตามช่วงเวลาเทรด (Trading Session Analytics)
                                            </h3>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                                            {analytics.sessionStats.map((sess, idx) => {
                                                const netProfit = parseFloat(sess.totalProfit);
                                                const profitColor = netProfit > 0 ? 'var(--bull-green)' : netProfit < 0 ? 'var(--bear-red)' : 'var(--text-muted)';
                                                const winRateVal = parseFloat(sess.winRate);
                                                
                                                return (
                                                    <div key={idx} style={{ 
                                                        background: 'rgba(255, 255, 255, 0.02)', 
                                                        border: '1px solid rgba(255, 255, 255, 0.04)', 
                                                        borderRadius: '8px', 
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '6px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ color: sess.icon === 'sun' ? '#ffb703' : sess.icon === 'sunset' ? '#fb8500' : '#8ecae6', display: 'inline-flex' }}>
                                                                    <Icon name={sess.icon} size={14} />
                                                                </span>
                                                                <span>{sess.name.split(' (')[0]}</span>
                                                            </span>
                                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                {sess.name.match(/\(([^)]+)\)/)?.[1] || ''}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                                                            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: profitColor }}>
                                                                {netProfit >= 0 ? '+' : ''}${sess.totalProfit}
                                                            </span>
                                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                                                Win Rate: <span style={{ color: winRateVal >= 60 ? 'var(--bull-green)' : winRateVal >= 45 ? 'var(--accent-gold)' : 'var(--bear-red)', fontFamily: 'monospace' }}>{sess.winRate}%</span>
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                            <span>เทรดทั้งหมด: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{sess.totalTrades}</strong> ไม้</span>
                                                            <span>ชนะ/แพ้: <strong style={{ color: 'var(--bull-green)', fontFamily: 'monospace' }}>{sess.winCount}</strong> / <strong style={{ color: 'var(--bear-red)', fontFamily: 'monospace' }}>{sess.loseCount}</strong></span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {analytics.sessionStats.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                                ไม่มีข้อมูลสถิติช่วงเวลาเทรดในขณะนี้
                                            </div>
                                        ) : (
                                            <table className="trading-table">
                                                <thead>
                                                    <tr>
                                                        <th>ช่วงเวลาเทรด (Trading Session)</th>
                                                        <th style={{ textAlign: 'center' }}>จำนวนออเดอร์ (Trades)</th>
                                                        <th style={{ textAlign: 'center' }}>สถิติ ชนะ / แพ้ (W / L)</th>
                                                        <th style={{ textAlign: 'center' }}>อัตราการชนะ (Win Rate)</th>
                                                        <th style={{ textAlign: 'center' }}>Profit Factor</th>
                                                        <th style={{ textAlign: 'center' }}>เฉลี่ยต่อไม้ (Avg P&L)</th>
                                                        <th style={{ textAlign: 'center' }}>ดีสุด / แย่สุด (Best/Worst)</th>
                                                        <th style={{ textAlign: 'right' }}>กำไร/ขาดทุนสุทธิ (Net P&L)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analytics.sessionStats.map((sess, index) => {
                                                        const winRateVal = parseFloat(sess.winRate);
                                                        let winRateColor = 'var(--text-muted)';
                                                        if (winRateVal >= 60) winRateColor = 'var(--bull-green)';
                                                        else if (winRateVal >= 45) winRateColor = 'var(--accent-gold)';
                                                        else if (winRateVal > 0) winRateColor = 'var(--bear-red)';

                                                        const netProfit = parseFloat(sess.totalProfit);
                                                        const profitColorClass = netProfit > 0 ? 'price-up' : netProfit < 0 ? 'price-down' : '';
                                                        const isExpanded = !!expandedSessions[sess.key];

                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr style={{ background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : '' }}>
                                                                    <td 
                                                                        style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }} 
                                                                        onClick={() => {
                                                                            setExpandedSessions(prev => ({
                                                                                ...prev,
                                                                                [sess.key]: !prev[sess.key]
                                                                            }));
                                                                        }}
                                                                    >
                                                                        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                                            <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={14} />
                                                                        </span>
                                                                        <span style={{ color: sess.icon === 'sun' ? '#ffb703' : sess.icon === 'sunset' ? '#fb8500' : '#8ecae6', display: 'inline-flex', alignItems: 'center' }}>
                                                                            <Icon name={sess.icon} size={14} />
                                                                        </span>
                                                                        <span>{sess.name}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{sess.totalTrades}</td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                                                        <span style={{ color: 'var(--bull-green)' }}>{sess.winCount}</span>
                                                                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                                                                        <span style={{ color: 'var(--bear-red)' }}>{sess.loseCount}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: winRateColor }}>
                                                                                {sess.winRate}%
                                                                            </span>
                                                                            <div style={{ width: '55px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                                <div style={{ width: `${winRateVal}%`, height: '100%', background: winRateColor }}></div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, color: sess.profitFactor === 'Max' || parseFloat(sess.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(sess.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)' }}>
                                                                        {sess.profitFactor}
                                                                    </td>
                                                                    <td className={parseFloat(sess.avgProfit) >= 0 ? 'price-up' : 'price-down'} style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>
                                                                        {parseFloat(sess.avgProfit) >= 0 ? '+' : ''}${sess.avgProfit}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                        <span className="price-up">+${sess.best}</span>
                                                                        <span style={{ margin: '0 4px' }}>|</span>
                                                                        <span className="price-down">${sess.worst}</span>
                                                                    </td>
                                                                    <td className={profitColorClass} style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                                                                        {netProfit >= 0 ? '+' : ''}${sess.totalProfit}
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr>
                                                                        <td colSpan="8" style={{ padding: '0 0 16px 28px', background: 'rgba(255, 255, 255, 0.01)' }}>
                                                                            <div style={{ 
                                                                                borderLeft: '2px solid var(--accent-gold)', 
                                                                                paddingLeft: '16px', 
                                                                                marginTop: '8px',
                                                                                overflowX: 'auto'
                                                                            }}>
                                                                                <table className="trading-table" style={{ width: '100%', background: 'transparent', border: 'none', margin: '4px 0' }}>
                                                                                    <thead>
                                                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px' }}>ชื่อบอทเทรด / แหล่ง (Bot Name / Source)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>จำนวนออเดอร์ (Trades)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>สถิติ ชนะ / แพ้ (W / L)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>อัตราการชนะ (Win Rate)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>Profit Factor</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'center' }}>เฉลี่ยต่อไม้ (Avg P&L)</th>
                                                                                            <th style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', textAlign: 'right' }}>กำไรสุทธิ (Net P&L)</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {sess.bots.length === 0 ? (
                                                                                            <tr>
                                                                                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '12px' }}>
                                                                                                    ไม่มีการเทรดของบอทในช่วงเวลานี้
                                                                                                </td>
                                                                                            </tr>
                                                                                        ) : (
                                                                                            sess.bots.map((bot, bIdx) => {
                                                                                                const bWinRateVal = parseFloat(bot.winRate);
                                                                                                let bWinRateColor = 'var(--text-muted)';
                                                                                                if (bWinRateVal >= 60) bWinRateColor = 'var(--bull-green)';
                                                                                                else if (bWinRateVal >= 45) bWinRateColor = 'var(--accent-gold)';
                                                                                                else if (bWinRateVal > 0) bWinRateColor = 'var(--bear-red)';

                                                                                                const bNetProfit = parseFloat(bot.totalProfit);
                                                                                                const bProfitColorClass = bNetProfit > 0 ? 'price-up' : bNetProfit < 0 ? 'price-down' : '';

                                                                                                return (
                                                                                                    <tr key={bIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                                                                        <td style={{ fontSize: '11px', fontWeight: 600, color: bot.name === 'เทรดเอง (Manual)' ? 'var(--text-muted)' : 'var(--accent-gold)', padding: '6px 8px' }}>
                                                                                                            {bot.name}
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', padding: '6px 8px' }}>{bot.totalTrades}</td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', padding: '6px 8px' }}>
                                                                                                            <span style={{ color: 'var(--bull-green)' }}>{bot.winCount}</span>
                                                                                                            <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                                                                                                            <span style={{ color: 'var(--bear-red)' }}>{bot.loseCount}</span>
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', padding: '6px 8px' }}>
                                                                                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: bWinRateColor }}>
                                                                                                                {bot.winRate}%
                                                                                                            </span>
                                                                                                        </td>
                                                                                                        <td style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, color: bot.profitFactor === 'Max' || parseFloat(bot.profitFactor) >= 1.5 ? 'var(--bull-green)' : parseFloat(bot.profitFactor) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)', padding: '6px 8px' }}>
                                                                                                            {bot.profitFactor}
                                                                                                        </td>
                                                                                                        <td className={parseFloat(bot.avgProfit) >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600, padding: '6px 8px' }}>
                                                                                                            {parseFloat(bot.avgProfit) >= 0 ? '+' : ''}${bot.avgProfit}
                                                                                                        </td>
                                                                                                        <td className={bProfitColorClass} style={{ fontSize: '11px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', padding: '6px 8px' }}>
                                                                                                            {bNetProfit >= 0 ? '+' : ''}${bot.totalProfit}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
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
                                                                                 aTrim === 'pj_indicator' ? 'PJ Indicator' : 
                                                                                 aTrim === 'stoch_rsi' ? 'StochRSI' : 
                                                                                 aTrim === 'macd_4c' ? 'MACD 4C Momentum' :
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

                            {/* Backtesting Tab Content */}
                            {activeTab === 'backtest' && (
                                <div className="backtest-layout">
                                    {/* Left Panel: Form Settings */}
                                    <div className="backtest-sidebar-panel">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Icon name="settings" size={14} style={{ color: 'var(--accent-gold)' }} />
                                                <span>ตั้งค่าการทดสอบ (Setup)</span>
                                            </h4>
                                            {!isPopout && (
                                                <button 
                                                    type="button"
                                                    onClick={() => window.open('/?popout=backtest', '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no')}
                                                    title="ขยายเป็นอีกหน้าต่างแยก (Popout Window)"
                                                    style={{
                                                        background: 'rgba(255, 183, 3, 0.1)',
                                                        border: '1px solid rgba(255, 183, 3, 0.3)',
                                                        color: 'var(--accent-gold)',
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span>↗️ ขยายหน้าต่าง</span>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <form onSubmit={handleRunBacktest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label>สินทรัพย์ที่ต้องการทดสอบ (Symbol)</label>
                                                <select 
                                                    className="numeric-input"
                                                    value={backtestForm.symbol}
                                                    onChange={(e) => setBacktestForm({ ...backtestForm, symbol: e.target.value })}
                                                    style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                                >
                                                    {watchlist.map(item => (
                                                        <option key={item.symbol} value={item.symbol}>{item.symbol} - {item.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label>กรอบเวลาแท่งเทียน (Timeframe)</label>
                                                <select 
                                                    className="numeric-input"
                                                    value={backtestForm.timeframe}
                                                    onChange={(e) => setBacktestForm({ ...backtestForm, timeframe: e.target.value })}
                                                    style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                                >
                                                    <option value="M1">M1 (1 Minute)</option>
                                                    <option value="M5">M5 (5 Minutes)</option>
                                                    <option value="M15">M15 (15 Minutes)</option>
                                                    <option value="M30">M30 (30 Minutes)</option>
                                                    <option value="H1">H1 (1 Hour)</option>
                                                    <option value="H4">H4 (4 Hours)</option>
                                                    <option value="D1">D1 (1 Day)</option>
                                                </select>
                                            </div>

                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label>จำนวนแท่งเทียนย้อนหลัง (Lookback)</label>
                                                <select 
                                                    className="numeric-input"
                                                    value={backtestForm.count}
                                                    onChange={(e) => setBacktestForm({ ...backtestForm, count: parseInt(e.target.value) || 200 })}
                                                    style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                                >
                                                    <option value="100">100 candles</option>
                                                    <option value="200">200 candles</option>
                                                    <option value="500">500 candles</option>
                                                    <option value="1000">1000 candles</option>
                                                </select>
                                            </div>

                                            <div className="input-group" style={{ margin: 0 }}>
                                                <div className="backtest-form-section-title">กลยุทธ์อัลกอริทึม (Algorithms)</div>
                                                <div className="backtest-checkbox-list">
                                                    {[
                                                        { value: 'smc_confluence_pro', label: 'SMC Confluence Pro 🌟' },
                                                        { value: 'pj_indicator', label: 'PJ Indicator 🔮' },
                                                        { value: 'smc_order_block', label: 'SMC Order Block 🟩' },
                                                        { value: 'smc_fvg_imbalance', label: 'SMC FVG Imbalance ⚡' },
                                                        { value: 'smc_bos_choch', label: 'SMC BOS / CHoCH 📈' },
                                                        { value: 'rsi_oscillator', label: 'RSI Overbought/Oversold 🌊' },
                                                        { value: 'stoch_rsi', label: 'Stochastic RSI ⚡' },
                                                        { value: 'macd_4c', label: 'MACD 4 Color 📊' },
                                                        { value: 'macd', label: 'MACD Crossover 🎛️' },
                                                        { value: 'sma_cross', label: 'SMA Crossover ⚔️' },
                                                        { value: 'ema_cross_50_200', label: 'EMA Crossover 50/200 🧬' },
                                                        { value: 'harmonic_patterns', label: 'Harmonic Patterns 📐' },
                                                        { value: 'elliott_wave', label: 'Elliott Wave 🌊' },
                                                        { value: 'rsi_divergence', label: 'RSI Divergence 🎯' },
                                                        { value: 'atr_breakout', label: 'ATR Breakout 📊' },
                                                        { value: 'support_resistance', label: 'S/R Bounce 🧱' },
                                                        { value: 'liquidity_sweep', label: 'Liquidity Sweep 🧹' }
                                                    ].map((algo) => {
                                                        const isChecked = backtestSelectedAlgos.includes(algo.value);
                                                        return (
                                                            <div 
                                                                key={algo.value}
                                                                className="backtest-checkbox-item"
                                                                onClick={() => {
                                                                    if (isChecked) {
                                                                        setBacktestSelectedAlgos(backtestSelectedAlgos.filter(a => a !== algo.value));
                                                                    } else {
                                                                        setBacktestSelectedAlgos([...backtestSelectedAlgos, algo.value]);
                                                                    }
                                                                }}
                                                            >
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    readOnly
                                                                />
                                                                <span>{algo.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label>การยืนยันสัญญาณ (Consensus mode)</label>
                                                <select 
                                                    className="numeric-input"
                                                    value={backtestForm.signal_mode}
                                                    onChange={(e) => setBacktestForm({ ...backtestForm, signal_mode: e.target.value })}
                                                    style={{ appearance: 'auto', fontSize: '12px', padding: '8px 10px' }}
                                                >
                                                    <option value="or">OR (สัญญาณใดสัญญาณหนึ่งออก)</option>
                                                    <option value="and">AND (ทุกสัญญาณต้องออกร่วมกัน)</option>
                                                </select>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                                                <div className="input-group" style={{ margin: 0 }}>
                                                    <label>เงินตั้งต้น (USD)</label>
                                                    <input 
                                                        type="number"
                                                        className="numeric-input"
                                                        value={backtestForm.initial_balance}
                                                        onChange={(e) => setBacktestForm({ ...backtestForm, initial_balance: parseFloat(e.target.value) || 10000.0 })}
                                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                                    />
                                                </div>
                                                <div className="input-group" style={{ margin: 0 }}>
                                                    <label>ขนาด Lot size</label>
                                                    <input 
                                                        type="number"
                                                        className="numeric-input"
                                                        step="0.01"
                                                        value={backtestForm.lot_size}
                                                        onChange={(e) => setBacktestForm({ ...backtestForm, lot_size: parseFloat(e.target.value) || 0.1 })}
                                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <div className="input-group" style={{ margin: 0 }}>
                                                    <label style={{ color: 'var(--bear-red)' }}>Stop Loss (SL)</label>
                                                    <input 
                                                        type="number"
                                                        className="numeric-input"
                                                        placeholder="จุดห่างราคา"
                                                        step="0.1"
                                                        value={backtestForm.sl_points}
                                                        onChange={(e) => setBacktestForm({ ...backtestForm, sl_points: parseFloat(e.target.value) || 0.0 })}
                                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                                    />
                                                </div>
                                                <div className="input-group" style={{ margin: 0 }}>
                                                    <label style={{ color: 'var(--bull-green)' }}>Take Profit (TP)</label>
                                                    <input 
                                                        type="number"
                                                        className="numeric-input"
                                                        placeholder="จุดห่างราคา"
                                                        step="0.1"
                                                        value={backtestForm.tp_points}
                                                        onChange={(e) => setBacktestForm({ ...backtestForm, tp_points: parseFloat(e.target.value) || 0.0 })}
                                                        style={{ height: '36px', fontSize: '12px', padding: '6px 10px' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group" style={{ margin: '8px 0 0 0' }}>
                                                <label>ช่วงเวลาเทรด (Trading Session)</label>
                                                <select
                                                    value={backtestForm.allowed_sessions || "all"}
                                                    onChange={(e) => setBacktestForm({ ...backtestForm, allowed_sessions: e.target.value })}
                                                    style={{ height: '36px', fontSize: '12px', padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '4px', width: '100%' }}
                                                >
                                                    <option value="all">24 ชั่วโมง (All Sessions)</option>
                                                    <option value="asian">Asian Only (00-08 UTC)</option>
                                                    <option value="london">London Only (08-16 UTC)</option>
                                                    <option value="newyork">NY Only (13-21 UTC)</option>
                                                    <option value="london_ny">London + NY Overlap (13-16 UTC)</option>
                                                </select>
                                            </div>

                                            <button 
                                                type="submit"
                                                className="btn-primary"
                                                style={{ marginTop: '8px', padding: '10px 14px', fontSize: '12.5px', background: 'linear-gradient(135deg, var(--accent-gold), #f39c12)', color: '#000', boxShadow: 'var(--glow-gold)' }}
                                                disabled={backtestLoading}
                                            >
                                                เริ่มทดสอบย้อนหลัง (Run Backtest)
                                            </button>
                                        </form>
                                    </div>

                                    {/* Right Panel: Report Stats & Curve Chart & Deals List */}
                                    <div className="backtest-main-report">
                                        {backtestLoading && (
                                            <div className="backtest-loader-container">
                                                <div className="backtest-pulse-loader"></div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>กำลังประมวลผลการทดสอบย้อนหลัง...</h3>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ระบบกำลังทำการรันจำลองการเทรดแบบไร้ look-ahead bias ทีละแท่งเทียน</p>
                                            </div>
                                        )}

                                        {!backtestLoading && !backtestResult && (
                                            <div className="empty-terminal-state" style={{ height: '100%', flex: 1, border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-lg)', background: 'rgba(18,26,44,0.1)' }}>
                                                <Icon name="refresh" size={48} style={{ color: 'var(--text-muted)' }} />
                                                <h4 style={{ color: 'var(--text-secondary)' }}>ยินดีต้อนรับสู่ระบบทดสอบประสิทธิภาพเชิงลึก (Giant Backtester)</h4>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '380px', textAlign: 'center' }}>
                                                    ปรับเปลี่ยนสินทรัพย์ กรอบเวลา ความคลาดเคลื่อนความเสี่ยง SL/TP และเลือกสูตรกลยุทธ์ด้านซ้ายมือ จากนั้นกด "เริ่มทดสอบย้อนหลัง" เพื่อดูรายงานผลลัพธ์ประสิทธิภาพพอร์ตเชิงลึก
                                                </p>
                                            </div>
                                        )}

                                        {!backtestLoading && backtestResult && (
                                            <React.Fragment>
                                                {/* Smart View Tabs inside Backtest */}
                                                <div className="backtest-subtabs-bar">
                                                    <button
                                                        type="button"
                                                        className={`backtest-subtab-btn ${backtestSubTab === 'stats' ? 'active' : ''}`}
                                                        onClick={() => setBacktestSubTab('stats')}
                                                    >
                                                        <Icon name="trend-up" size={14} />
                                                        <span>📊 สรุปสถิติเชิงลึก (Performance Dashboard)</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`backtest-subtab-btn ${backtestSubTab === 'price' ? 'active' : ''}`}
                                                        onClick={() => setBacktestSubTab('price')}
                                                    >
                                                        <Icon name="info" size={14} />
                                                        <span>🕯️ กราฟราคา & จุดเปิด-ปิด (Price & Trade Entries)</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`backtest-subtab-btn ${backtestSubTab === 'equity' ? 'active' : ''}`}
                                                        onClick={() => setBacktestSubTab('equity')}
                                                    >
                                                        <Icon name="refresh" size={14} />
                                                        <span>📈 กราฟเงินทุน (Equity Curve)</span>
                                                    </button>
                                                </div>

                                                {/* Tab 1: Statistics Dashboard */}
                                                {backtestSubTab === 'stats' && (
                                                    <React.Fragment>
                                                        {/* Summary Stats Grid */}
                                                        <div className="backtest-stats-grid">
                                                            <div className="backtest-stat-card">
                                                                <span className="metric-label">กำไร/ขาดทุนสุทธิ (Net profit)</span>
                                                                <span className={`metric-value ${(backtestResult.net_profit ?? 0) >= 0 ? 'price-up' : 'price-down'}`}>
                                                                    {(backtestResult.net_profit ?? 0) >= 0 ? '+' : ''}${(backtestResult.net_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="backtest-stat-card">
                                                                <span className="metric-label">อัตราการชนะ (Win Rate)</span>
                                                                <span className="metric-value" style={{ color: 'var(--accent-gold)' }}>
                                                                    {backtestResult.win_rate}%
                                                                </span>
                                                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                                    ชนะ {(backtestResult.wins_count ?? 0)} | แพ้ {(backtestResult.losses_count ?? 0)}
                                                                </span>
                                                                <div className="winrate-gauge-container">
                                                                    <div className="winrate-gauge-bar">
                                                                        <div className="winrate-gauge-fill" style={{ width: `${backtestResult.win_rate ?? 0}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="backtest-stat-card">
                                                                <span className="metric-label">ออเดอร์ทั้งหมด (Total deals)</span>
                                                                <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                                                                    {(backtestResult.total_trades ?? 0)} ไม้
                                                                </span>
                                                            </div>
                                                            <div className="backtest-stat-card">
                                                                <span className="metric-label">บาลานซ์สุทธิ (Final Balance)</span>
                                                                <span className="metric-value" style={{ color: 'var(--bull-green)' }}>
                                                                    ${(backtestResult.final_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Detailed breakdown dashboard cards */}
                                                        <div className="backtest-detailed-grid">
                                                            {/* Card 1: Returns Analysis */}
                                                            <div className="backtest-detail-card">
                                                                <h5>📊 วิเคราะห์ผลตอบแทน (Returns Analysis)</h5>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">กำไรรวมทั้งหมด (Gross Profit)</span>
                                                                    <span className="backtest-detail-value price-up">+${(backtestResult.gross_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">ขาดทุนรวมทั้งหมด (Gross Loss)</span>
                                                                    <span className="backtest-detail-value price-down">-${(backtestResult.gross_loss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">ตัวประกอบกำไร (Profit Factor)</span>
                                                                    <span className="backtest-detail-value" style={{ 
                                                                        color: (backtestResult.profit_factor ?? 0) >= 1.5 ? 'var(--bull-green)' : (backtestResult.profit_factor ?? 0) >= 1.0 ? 'var(--accent-gold)' : 'var(--bear-red)',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {(backtestResult.profit_factor ?? 0)}
                                                                    </span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">ความคาดหวังดีลเฉลี่ย (Expectancy)</span>
                                                                    <span className={`backtest-detail-value ${(backtestResult.expectancy ?? 0) >= 0 ? 'price-up' : 'price-down'}`}>
                                                                        {(backtestResult.expectancy ?? 0) >= 0 ? '+' : ''}${(backtestResult.expectancy ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                             {/* Card 2: Risk & Drawdown */}
                                                            <div className="backtest-detail-card">
                                                                <h5>🛡️ การควบคุมความเสี่ยง (Risk & Drawdown)</h5>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">การย่อตัวลึกสุด (Max Drawdown)</span>
                                                                    <span className="backtest-detail-value price-down">-${(backtestResult.max_drawdown ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">เปอร์เซ็นต์ย่อตัวลึกสุด (Max Drawdown %)</span>
                                                                    <span className="backtest-detail-value price-down">-{(backtestResult.max_drawdown_percent ?? 0)}%</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">เงินตั้งต้นจำลอง (Initial Balance)</span>
                                                                    <span className="backtest-detail-value" style={{ color: 'var(--text-secondary)' }}>${(backtestResult.initial_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">ระดับความเสี่ยงพอร์ต (Risk Rating)</span>
                                                                    <span className="backtest-detail-value" style={{ 
                                                                        color: (backtestResult.max_drawdown_percent ?? 0) <= 10 ? 'var(--bull-green)' : (backtestResult.max_drawdown_percent ?? 0) <= 20 ? 'var(--accent-gold)' : 'var(--bear-red)'
                                                                    }}>
                                                                        {(backtestResult.max_drawdown_percent ?? 0) <= 10 ? 'ต่ำ (Low Risk)' : (backtestResult.max_drawdown_percent ?? 0) <= 20 ? 'ปานกลาง (Medium Risk)' : 'สูง (High Drawdown!)'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Card 3: Trade Statistics */}
                                                            <div className="backtest-detail-card">
                                                                <h5>🧬 พฤติกรรมดีลการเทรด (Trade Statistics)</h5>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">เฉลี่ยต่อดีลกำไร (Average Win)</span>
                                                                    <span className="backtest-detail-value price-up">+${(backtestResult.avg_win ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">เฉลี่ยต่อดีลขาดทุน (Average Loss)</span>
                                                                    <span className="backtest-detail-value price-down">-${(backtestResult.avg_loss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">อัตราส่วนเฉลี่ย Win/Loss RR</span>
                                                                    <span className="backtest-detail-value">
                                                                        {(backtestResult.avg_loss ?? 0) > 0 ? ((backtestResult.avg_win ?? 0) / (backtestResult.avg_loss ?? 1)).toFixed(2) : (backtestResult.avg_win ?? 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="backtest-detail-row">
                                                                    <span className="backtest-detail-label">สตรีคชนะ / แพ้ ต่อเนื่องสูงสุด</span>
                                                                    <span className="backtest-detail-value">
                                                                        <span className="price-up">{(backtestResult.max_consecutive_wins ?? 0)} Wins</span> / <span className="price-down">{(backtestResult.max_consecutive_losses ?? 0)} Losses</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                )}

                                                {/* Tab 2: Candlestick & Entries Chart */}
                                                {backtestSubTab === 'price' && (
                                                    <React.Fragment>
                                                        <div className="backtest-chart-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                                            <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                🕯️ กราฟราคาสินทรัพย์จำลองและจุดเข้าเทรดจริง (Asset Candlestick & Entries Chart)
                                                            </h4>
                                                            <div ref={backtestPriceChartContainerRef} className="backtest-chart-container" style={{ flex: 1, height: '100%' }}></div>
                                                        </div>
                                                        {renderBacktestDealsTable('450px', true)}
                                                    </React.Fragment>
                                                )}

                                                {/* Tab 3: Equity Curve Chart */}
                                                {backtestSubTab === 'equity' && (
                                                    <div className="backtest-chart-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                                        <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            📈 กราฟแสดงเส้นความเติบโตของทุนสำรองสุทธิ (Simulated Equity Growth Curve)
                                                        </h4>
                                                        <div ref={backtestChartContainerRef} className="backtest-chart-container" style={{ flex: 1, height: '100%' }}></div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Market Intelligence News Tab Content */}
                            {activeTab === 'news' && (
                                <div className="news-tab-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '8px', height: '100%', minHeight: '350px' }}>
                                    {/* Left Panel: Market Mood & AI Sentiment */}
                                    <div className="news-left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {/* Popout Button for News & AI */}
                                        <button 
                                            className="btn-trade-execute buy"
                                            onClick={() => window.open('/?popout=news', '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no')}
                                            style={{ 
                                                width: '100%', 
                                                height: '36px', 
                                                padding: '8px', 
                                                fontSize: '11.5px', 
                                                fontWeight: 'bold', 
                                                borderRadius: '6px', 
                                                border: '1px solid var(--accent-gold)',
                                                background: 'rgba(255, 183, 3, 0.08)',
                                                color: 'var(--accent-gold)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                marginBottom: '4px',
                                                boxShadow: 'none'
                                            }}
                                            title="เปิดหน้าต่างแยก (Popout News Window)"
                                        >
                                            <Icon name="external-link" size={12} />
                                            <span>เปิดวิเคราะห์ข่าวในหน้าต่างใหม่ (Popout)</span>
                                        </button>
                                        {/* Market Sentiment Gauge */}
                                        <div className="sidebar-panel-card" style={{ padding: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <h3 style={{ margin: '0 0 14px 0', borderLeft: '3px solid var(--accent-gold)', paddingLeft: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                ดัชนีอารมณ์ตลาด (Market Mood)
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px' }}>
                                                {newsData.sentiment_summary === 'bullish' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.6))' }}>📈</span>
                                                        <strong style={{ fontSize: '18px', color: 'var(--bull-green)', marginTop: '8px', textTransform: 'uppercase' }}>BULLISH (กระทิง)</strong>
                                                    </div>
                                                ) : newsData.sentiment_summary === 'bearish' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 10px rgba(231, 76, 60, 0.6))' }}>📉</span>
                                                        <strong style={{ fontSize: '18px', color: 'var(--bear-red)', marginTop: '8px', textTransform: 'uppercase' }}>BEARISH (หมี)</strong>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>⚪</span>
                                                        <strong style={{ fontSize: '18px', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase' }}>NEUTRAL (คงตัว)</strong>
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px', lineHeight: '1.4' }}>
                                                    * คำนวณสรุปแบบถ่วงน้ำหนักโดย AI อิงจากข่าวเศรษฐกิจและภูมิรัฐศาสตร์ 10 รายการล่าสุด
                                                </span>
                                            </div>
                                        </div>

                                        {/* Geopolitical Risk Scale */}
                                        <div className="sidebar-panel-card" style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <h3 style={{ margin: '0 0 12px 0', borderLeft: '3px solid var(--bear-red)', paddingLeft: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                ระดับภัยคุกคามตลาด
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ระดับความตึงเครียด:</span>
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        fontWeight: 800, 
                                                        color: newsData.risk_level === 'high' ? 'var(--bear-red)' : newsData.risk_level === 'medium' ? 'var(--accent-gold)' : 'var(--bull-green)',
                                                        background: newsData.risk_level === 'high' ? 'rgba(231, 76, 60, 0.15)' : newsData.risk_level === 'medium' ? 'rgba(255, 183, 3, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {newsData.risk_level.toUpperCase()}
                                                    </span>
                                                </div>
                                                
                                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ 
                                                        width: newsData.risk_level === 'high' ? '100%' : newsData.risk_level === 'medium' ? '60%' : '20%', 
                                                        height: '100%', 
                                                        background: newsData.risk_level === 'high' ? 'var(--bear-red)' : newsData.risk_level === 'medium' ? 'var(--accent-gold)' : 'var(--bull-green)',
                                                        boxShadow: newsData.risk_level === 'high' ? '0 0 8px var(--bear-red)' : newsData.risk_level === 'medium' ? '0 0 8px var(--accent-gold)' : 'none',
                                                        transition: 'width 0.5s ease-in-out'
                                                    }}></div>
                                                </div>
                                                
                                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                                                    {newsData.risk_level === 'high' 
                                                        ? '⚠️ ความตึงเครียดทางสงครามหรือภูมิรัฐศาสตร์รุนแรงขึ้น! แนะนำเน้นถือไม้ซื้อทองคำ (BUY Gold) รันเทรนตามระบบและระวังความผันผวนสูง'
                                                        : newsData.risk_level === 'medium'
                                                        ? '⚡ มีประเด็นสงครามการค้า/อัตราดอกเบี้ยและเงินเฟ้อระดับปานกลาง ตลาดค่อนข้างผันผวน แนะนำเพิ่มความรัดกุมในการตั้งจุด Stop Loss'
                                                        : '🟢 ปัจจัยภายนอกยังคงอยู่ในเกณฑ์ปลอดภัย บอทระบบสัมผัสเทคนิคคอลทั่วไปทำงานได้อย่างปกติ'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* On-demand manual Refresher controls */}
                                        <button 
                                            className={`btn-trade-execute buy ${newsRefreshing ? 'active' : ''}`}
                                            onClick={handleRefreshNews}
                                            disabled={newsRefreshing}
                                            style={{ 
                                                width: '100%', 
                                                height: '42px', 
                                                padding: '10px', 
                                                fontSize: '12px', 
                                                fontWeight: 'bold', 
                                                borderRadius: '6px', 
                                                boxShadow: 'none',
                                                border: '1px solid var(--accent-gold)',
                                                background: 'rgba(255, 183, 3, 0.08)',
                                                color: 'var(--accent-gold)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                marginTop: 'auto'
                                            }}
                                        >
                                            <div className={newsRefreshing ? "loader-spinner" : ""} style={{ width: '14px', height: '14px', borderTopColor: 'var(--accent-gold)', animationDuration: '0.8s' }}>
                                                {!newsRefreshing && <Icon name="refresh" size={14} />}
                                            </div>
                                            <span>{newsRefreshing ? 'กำลังดึงและวิเคราะห์ข่าวด้วย AI...' : 'ดึงและอัปเดตข่าวเรียลไทม์'}</span>
                                        </button>
                                    </div>

                                    {/* Right Panel: Analyzed News Feed */}
                                    <div className="news-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: isTerminalExpanded ? 'calc(100vh - 220px)' : '420px', paddingRight: '4px', flex: 1, transition: 'all 0.3s' }}>
                                        {newsData.news.length === 0 ? (
                                            <div className="empty-terminal-state" style={{ height: '300px' }}>
                                                <Icon name="info" size={32} />
                                                <p>ยังไม่มีรายงานข่าวสารวิเคราะห์ในระบบ กดปุ่มดึงข่าวสารด้านซ้ายเพื่อรับอัปเดต</p>
                                            </div>
                                        ) : (
                                            newsData.news.map((item) => {
                                                const isExpanded = expandedNewsId === item.id;
                                                const pubDate = item.published_at ? new Date(item.published_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A';
                                                
                                                // Badges styles
                                                const impactColor = item.impact_level === 'high' ? 'rgba(231, 76, 60, 0.12)' : item.impact_level === 'medium' ? 'rgba(255, 183, 3, 0.12)' : 'rgba(0, 180, 216, 0.12)';
                                                const impactTextColor = item.impact_level === 'high' ? 'var(--bear-red)' : item.impact_level === 'medium' ? 'var(--accent-gold)' : '#00b4d8';
                                                const impactBorderColor = item.impact_level === 'high' ? 'rgba(231, 76, 60, 0.25)' : item.impact_level === 'medium' ? 'rgba(255, 183, 3, 0.25)' : 'rgba(0, 180, 216, 0.25)';
                                                
                                                const sentimentEmoji = item.sentiment === 'bullish' ? '📈 BUY' : item.sentiment === 'bearish' ? '📉 SELL' : '⚪ NEUTRAL';
                                                const sentimentTextColor = item.sentiment === 'bullish' ? 'var(--bull-green)' : item.sentiment === 'bearish' ? 'var(--bear-red)' : 'var(--text-muted)';
                                                
                                                return (
                                                    <div 
                                                        key={item.id} 
                                                        className="sidebar-panel-card"
                                                        style={{ 
                                                            padding: '14px 16px', 
                                                            border: '1px solid ' + (isExpanded ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)'),
                                                            background: isExpanded ? 'rgba(255, 183, 3, 0.02)' : 'rgba(255,255,255,0.01)',
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '8px',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: isExpanded ? '0 0 10px rgba(255, 183, 3, 0.06)' : 'none'
                                                        }}
                                                        onClick={() => setExpandedNewsId(isExpanded ? null : item.id)}
                                                    >
                                                        {/* Header row */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                                {/* Category */}
                                                                <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                                    {item.category === 'geopolitical' ? 'สงคราม/ภูมิรัฐศาสตร์ 🛡️' : 'เศรษฐกิจมหภาค 📊'}
                                                                </span>
                                                                
                                                                {/* Impact Level */}
                                                                <span style={{ 
                                                                    fontSize: '9px', 
                                                                    background: impactColor, 
                                                                    color: impactTextColor, 
                                                                    border: '1px solid ' + impactBorderColor,
                                                                    padding: '2px 6px', 
                                                                    borderRadius: '4px',
                                                                    fontWeight: 800,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    {item.impact_level === 'high' && <div className="pulse-dot" style={{ backgroundColor: 'var(--bear-red)', width: '5px', height: '5px', margin: 0 }}></div>}
                                                                    <span>{item.impact_level.toUpperCase()} IMPACT</span>
                                                                </span>
                                                                
                                                                {/* Sentiment */}
                                                                <span style={{ fontSize: '10px', color: sentimentTextColor, fontWeight: 'bold', marginLeft: '4px' }}>
                                                                    {sentimentEmoji}
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{pubDate}</span>
                                                        </div>
                                                        
                                                        {/* Title */}
                                                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isExpanded ? 'var(--accent-gold)' : 'var(--text-primary)', lineHeight: '1.4' }}>
                                                            {item.title_th || item.title}
                                                        </h4>
                                                        
                                                        {/* Summary Preview */}
                                                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                                            {item.summary_th || item.summary}
                                                        </p>
                                                        
                                                        {/* Collapsible AI Analysis section */}
                                                        {isExpanded && (
                                                            <div style={{ 
                                                                marginTop: '10px', 
                                                                borderTop: '1px dashed rgba(255,255,255,0.08)', 
                                                                paddingTop: '10px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px'
                                                            }} onClick={(e) => e.stopPropagation()}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <strong style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Icon name="message" size={12} />
                                                                        <span>วิเคราะห์ความเชื่อมโยงโดย AI Agent</span>
                                                                    </strong>
                                                                    
                                                                    {item.url && (
                                                                        <a 
                                                                            href={item.url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            style={{ fontSize: '10px', color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                                                                        >
                                                                            <span>อ่านข่าวเต็ม</span>
                                                                            <Icon name="external-link" size={10} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                
                                                                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                                                    {item.analysis || 'โมเดล AI กำลังทบทวนข้อสรุปจากข่าวสารรายการนี้...'}
                                                                </div>
                                                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', alignSelf: 'flex-end' }}>
                                                                    สำนักข่าว: {item.source}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Right Sidebar (Order Controls) */}
                <div 
                    className="execution-sidebar"
                    style={{
                        width: isExecutionCollapsed ? '0px' : '340px',
                        minWidth: isExecutionCollapsed ? '0px' : '340px',
                        overflowX: 'hidden',
                        overflowY: isExecutionCollapsed ? 'hidden' : 'auto',
                        opacity: isExecutionCollapsed ? 0 : 1,
                        borderLeft: isExecutionCollapsed ? 'none' : '1px solid var(--border-color)',
                        padding: isExecutionCollapsed ? '0px' : '20px',
                        height: '100%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* Execution Card */}
                    <div className="sidebar-panel-card" style={{ flexShrink: 0 }}>
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
                    <div className="sidebar-panel-card" style={{ flexShrink: 0 }}>
                        <h3>ระดับความปลอดภัยบัญชี</h3>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span className="text-secondary">Free Margin</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    ${(account.margin_free ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                                        * Margin Call อยู่ที่ระดับต่ำกว่า 60%, Stop Out อยู่ที่ระดับต่ำกว่า 30% ในเซิร์ฟเวอร์ MT5 Trader
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stochastic RSI Live Widget */}
                    <div className="sidebar-panel-card" style={{ marginTop: '16px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, borderLeft: '3px solid var(--accent-gold)', paddingLeft: '8px', fontSize: '15px' }}>
                                    Stochastic RSI วิเคราะห์ด่วน
                                </h3>
                                <button 
                                    onClick={openStochRsiSettings}
                                    style={{ 
                                        background: 'rgba(255, 183, 3, 0.08)', 
                                        border: '1px solid rgba(255, 183, 3, 0.25)', 
                                        color: 'var(--accent-gold)', 
                                        cursor: 'pointer', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10.5px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 0 6px rgba(255, 183, 3, 0.05)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 183, 3, 0.15)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.2)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 183, 3, 0.08)'; e.currentTarget.style.boxShadow = '0 0 6px rgba(255, 183, 3, 0.05)'; }}
                                    title="ตั้งค่า Stochastic RSI"
                                >
                                    <Icon name="settings" size={12} />
                                    <span>ตั้งค่า</span>
                                </button>
                            </div>
                            <span style={{ fontSize: '10px', background: 'rgba(255, 183, 3, 0.1)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                {activeSymbol} ({stochRsiSettings.timeframe === "Chart" ? (paneTimeframes[activePaneId] || 'H1') : stochRsiSettings.timeframe})
                            </span>
                        </div>

                        {stochRsiData.status === 'loading' ? (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                <div className="loader-spinner" style={{ width: '20px', height: '20px', margin: '0 auto 10px auto' }}></div>
                                <span>กำลังคำนวณอินดิเคเตอร์...</span>
                            </div>
                        ) : stochRsiData.status === 'success' && stochRsiData.k !== null && stochRsiData.d !== null ? (
                            <div>
                                {/* Status badges and values */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {stochRsiData.k >= 80 ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: 'var(--bear-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                OVERBOUGHT 🔴
                                            </span>
                                        ) : stochRsiData.k <= 20 ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: 'var(--bull-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                OVERSOLD 🟢
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                NEUTRAL ⚪
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        RSI ดิบ: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{stochRsiData.rsi !== null ? stochRsiData.rsi.toFixed(1) : 'N/A'}</strong>
                                    </span>
                                </div>

                                {/* Dynamic Values Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>%K (Fast Line)</span>
                                        <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                                            {stochRsiData.k.toFixed(1)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>%D (Slow Line)</span>
                                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#00b4d8', fontFamily: 'monospace' }}>
                                            {stochRsiData.d.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Gauge Scale */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        <span>0 (Oversold)</span>
                                        <span>50</span>
                                        <span>100 (Overbought)</span>
                                    </div>
                                    {/* Gauge bar container */}
                                    <div style={{ height: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                        {/* Oversold region overlay */}
                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', background: 'rgba(46, 204, 113, 0.08)', borderRight: '1px dashed rgba(46, 204, 113, 0.2)' }}></div>
                                        {/* Overbought region overlay */}
                                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', background: 'rgba(231, 76, 60, 0.08)', borderLeft: '1px dashed rgba(231, 76, 60, 0.2)' }}></div>
                                        
                                        {/* %K Line Marker (Gold Bar) */}
                                        <div style={{ position: 'absolute', left: `${Math.min(96, Math.max(4, stochRsiData.k))}%`, top: '2px', bottom: '2px', width: '4px', background: 'var(--accent-gold)', borderRadius: '2px', boxShadow: '0 0 6px var(--accent-gold)', transform: 'translateX(-2px)', transition: 'left 0.4s ease' }} title={`%K: ${stochRsiData.k.toFixed(1)}`}></div>
                                        {/* %D Line Marker (Blue Circle) */}
                                        <div style={{ position: 'absolute', left: `${Math.min(96, Math.max(4, stochRsiData.d))}%`, top: '3px', bottom: '3px', width: '8px', height: '8px', background: '#00b4d8', borderRadius: '50%', boxShadow: '0 0 6px #00b4d8', transform: 'translateX(-4px)', transition: 'left 0.4s ease' }} title={`%D: ${stochRsiData.d.toFixed(1)}`}></div>
                                    </div>
                                </div>

                                {/* Live recommendation based on StochRSI strategy */}
                                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {stochRsiData.k >= 80 ? '⚠️' : stochRsiData.k <= 20 ? '🚀' : '💡'}
                                    </span>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                            {stochRsiData.k >= 80 ? 'ระวังแรงเทขาย (Overbought)' : stochRsiData.k <= 20 ? 'จับตาโอกาสซื้อ (Oversold)' : 'กำลังสะสมพลัง (Neutral)'}
                                        </strong>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '10.5px', lineHeight: '1.4' }}>
                                            {stochRsiData.k >= 80 
                                                ? 'ราคาเคลื่อนไหวปรับตัวเร็วเกินไปในเขตซื้อมากเกินไป แนะนำชะลอการ BUY และรอสัญญาณกลับตัวเป็นฝั่ง SELL เมื่อ %K ตัดใต้ %D' 
                                                : stochRsiData.k <= 20 
                                                ? 'ราคาปรับตัวดิ่งลงลึกมากในเขตขายมากเกินไป มีโอกาสกลับตัวสูง แนะนำมองหาจังหวะเปิด BUY เมื่อ %K ตัดขึ้นเหนือ %D' 
                                                : 'เครื่องมือแสดงทิศทางอยู่ระดับกลาง แนะนำหลีกเลี่ยงการเปิดออเดอร์ หรือเทรดตามเทรนหลักด้วยการดูเส้น EMA 50/200 Cross ประกอบ'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
                                ⚠️ ข้อมูลไม่เพียงพอสำหรับการคำนวณ Stochastic RSI ในกรอบเวลานี้
                            </div>
                        )}
                        
                        {/* Explanation Help Link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                            <button 
                                onClick={openStochRsiSettings}
                                style={{ 
                                    background: 'rgba(255, 183, 3, 0.06)', 
                                    border: '1px solid rgba(255, 183, 3, 0.15)', 
                                    color: 'var(--accent-gold)', 
                                    fontSize: '10.5px', 
                                    cursor: 'pointer', 
                                    fontWeight: 600, 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 183, 3, 0.12)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 183, 3, 0.06)'}
                            >
                                <span>⚙️ ตั้งค่าอินดิเคเตอร์ (K/D)</span>
                            </button>
                            <button 
                                onClick={() => alert('Stochastic RSI (StochRSI) คือ ออสซิลเลเตอร์ที่คำนวณซ้ำบนค่า RSI (Relative Strength Index) อีกชั้นหนึ่ง แทนการคำนวณบนราคาโดยตรง ส่งผลให้มีความรวดเร็วและจับสภาวะกลับตัว Overbought (>80) และ Oversold (<20) ได้ไวกว่าปกติ ช่วยให้เทรดเดอร์ Day Trading สังเกตสัญญาณจุดสปริงตัวของราคาได้อย่างแม่นยำยิ่งขึ้น')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '10.5px', cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span>💡 StochRSI คืออะไร?</span>
                            </button>
                        </div>
                    </div>

                    {/* MACD 4C Live Momentum Widget */}
                    <div className="sidebar-panel-card" style={{ marginTop: '16px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, borderLeft: '3px solid var(--bull-green)', paddingLeft: '8px', fontSize: '15px' }}>
                                    MACD 4C โมเมนตัมคลื่น
                                </h3>
                                <button 
                                    onClick={openMacdSettings}
                                    style={{ 
                                        background: 'rgba(46, 204, 113, 0.08)', 
                                        border: '1px solid rgba(46, 204, 113, 0.25)', 
                                        color: 'var(--bull-green)', 
                                        cursor: 'pointer', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10.5px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 0 6px rgba(46, 204, 113, 0.05)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(46, 204, 113, 0.15)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(46, 204, 113, 0.2)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(46, 204, 113, 0.08)'; e.currentTarget.style.boxShadow = '0 0 6px rgba(46, 204, 113, 0.05)'; }}
                                    title="ตั้งค่า MACD 4C"
                                >
                                    <Icon name="settings" size={12} />
                                    <span>ตั้งค่า</span>
                                </button>
                            </div>
                            <span style={{ fontSize: '10px', background: 'rgba(46, 204, 113, 0.1)', color: 'var(--bull-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                {activeSymbol} ({paneTimeframes[activePaneId] || 'H1'})
                            </span>
                        </div>

                        {stochRsiData.status === 'loading' ? (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                <div className="loader-spinner" style={{ width: '20px', height: '20px', margin: '0 auto 10px auto' }}></div>
                                <span>กำลังคำนวณโมเมนตัม...</span>
                            </div>
                        ) : stochRsiData.status === 'success' && stochRsiData.macd_val !== null ? (
                            <div>
                                {/* Status badges and values */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {stochRsiData.macd_color === 'lime' ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: '#2ecc71', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', boxShadow: '0 0 6px rgba(46, 204, 113, 0.4)' }}>
                                                BULLISH ACCEL 🚀
                                            </span>
                                        ) : stochRsiData.macd_color === 'green' ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: '#27ae60', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                BULLISH SLOW 📈
                                            </span>
                                        ) : stochRsiData.macd_color === 'maroon' ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: '#8b0000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', boxShadow: '0 0 6px rgba(139, 0, 0, 0.4)' }}>
                                                BEARISH DUMP 🚨
                                            </span>
                                        ) : stochRsiData.macd_color === 'red' ? (
                                            <span style={{ fontSize: '10px', color: '#fff', background: '#e74c3c', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                BEARISH REBOUND 📉
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                NEUTRAL ⚪
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        ค่า MACD: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                            {stochRsiData.macd_val !== null ? (Math.abs(stochRsiData.macd_val) < 0.0001 ? stochRsiData.macd_val.toFixed(6) : stochRsiData.macd_val.toFixed(4)) : 'N/A'}
                                        </strong>
                                    </span>
                                </div>

                                {/* Premium Visual Histogram Wave of last 12 periods */}
                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                        <span>โมเมนตัมย้อนหลัง 12 แท่ง</span>
                                        <span style={{ color: stochRsiData.macd_color === 'lime' ? '#2ecc71' : stochRsiData.macd_color === 'green' ? '#27ae60' : stochRsiData.macd_color === 'maroon' ? '#e74c3c' : '#f39c12' }}>
                                            {stochRsiData.macd_color === 'lime' ? 'กำลังขึ้นแรง' : stochRsiData.macd_color === 'green' ? 'กำลังชะลอขาขึ้น' : stochRsiData.macd_color === 'maroon' ? 'กำลังลงแรง' : 'กำลังชะลอขาลง'}
                                        </span>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-around', 
                                        height: '80px', 
                                        background: 'rgba(0,0,0,0.25)', 
                                        borderRadius: '6px', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        padding: '10px 4px', 
                                        position: 'relative', 
                                        overflow: 'hidden' 
                                    }}>
                                        {/* Zero Line */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            right: 0, 
                                            top: '50%', 
                                            height: '1px', 
                                            background: 'rgba(255,255,255,0.15)', 
                                            borderStyle: 'dashed' 
                                        }}></div>
                                        
                                        {/* 12 Columns */}
                                        {(() => {
                                            const maxAbsVal = stochRsiData.macd_history && stochRsiData.macd_history.length > 0
                                                ? Math.max(...stochRsiData.macd_history.map(item => Math.abs(item.value || 0)), 0.00001)
                                                : 0.00001;
                                                
                                            return stochRsiData.macd_history.map((item, idx) => {
                                                const heightPct = (Math.abs(item.value) / maxAbsVal) * 50;
                                                const isPositive = item.value >= 0;
                                                
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        style={{ 
                                                            width: '6%', 
                                                            height: '100%', 
                                                            display: 'flex', 
                                                            flexDirection: 'column', 
                                                            position: 'relative', 
                                                            zIndex: 2 
                                                        }} 
                                                        title={`Bar ${idx + 1}: ${Math.abs(item.value) < 0.0001 ? item.value.toFixed(6) : item.value.toFixed(4)}`}
                                                    >
                                                        {/* Upper Half */}
                                                        <div style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                                            {isPositive && (
                                                                <div style={{ 
                                                                    height: `${heightPct * 2}%`,
                                                                    backgroundColor: item.color,
                                                                    borderRadius: '2px 2px 0 0',
                                                                    boxShadow: item.color === 'lime' ? '0 0 4px rgba(46, 204, 113, 0.4)' : 'none',
                                                                    transition: 'height 0.4s ease'
                                                                }}></div>
                                                            )}
                                                        </div>
                                                        {/* Lower Half */}
                                                        <div style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                            {!isPositive && (
                                                                <div style={{ 
                                                                    height: `${heightPct * 2}%`,
                                                                    backgroundColor: item.color,
                                                                    borderRadius: '0 0 2px 2px',
                                                                    boxShadow: item.color === 'maroon' ? '0 0 4px rgba(139, 0, 0, 0.4)' : 'none',
                                                                    transition: 'height 0.4s ease'
                                                                }}></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Dynamic descriptive analysis */}
                                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {stochRsiData.macd_color === 'lime' ? '🚀' : stochRsiData.macd_color === 'green' ? '📈' : stochRsiData.macd_color === 'maroon' ? '🚨' : '📉'}
                                    </span>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                            {stochRsiData.macd_color === 'lime' ? 'แนวโน้มขาขึ้นมีแรงขับเคลื่อนเต็มเปี่ยม' : 
                                             stochRsiData.macd_color === 'green' ? 'แนวโน้มขาขึ้นเริ่มชะลอแรงเหวี่ยง' : 
                                             stochRsiData.macd_color === 'maroon' ? 'แนวโน้มขาลงกำลังเทขายอย่างรุนแรง' : 
                                             'แนวโน้มขาลงเริ่มอ่อนกำลังหรือมีแรงดีดกลับ'}
                                        </strong>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '10.5px', lineHeight: '1.4' }}>
                                            {stochRsiData.macd_color === 'lime' 
                                                ? 'โมเมนตัมกำลังเพิ่มขึ้นในแดนบวกอย่างมีนัยสำคัญ แรงซื้อได้เปรียบสูง แนะนำถือฝั่ง BUY หรือพิจารณาเข้าตามเทรน' 
                                                : stochRsiData.macd_color === 'green' 
                                                ? 'แม้ราคาอยู่แดนบวกแต่แท่งสีจางลง แสดงว่าพลังฝั่งซื้อเริ่มแผ่ว ควรระวังการไล่ราคา BUY และเฝ้ารอการพักตัว' 
                                                : stochRsiData.macd_color === 'maroon' 
                                                ? 'โมเมนตัมเร่งตัวลงใต้เส้น Zero อย่างมีพลัง แรงเทขายรุนแรง แนะนำถือฝั่ง SELL หรือชะลอการ BUY ทุกกรณี' 
                                                : 'แรงขายเริ่มเบาบางลงใต้เส้น Zero เกิดการดีดกลับชั่วคราวหรือสิ้นสุดรอบเทขาย ลุ้นเกิด Bullish Reversal'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
                                ⚠️ ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์ MACD 4C ในกรอบเวลานี้
                            </div>
                        )}

                        {/* Explanation Help Link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                            <button 
                                onClick={openMacdSettings}
                                style={{ 
                                    background: 'rgba(46, 204, 113, 0.06)', 
                                    border: '1px solid rgba(46, 204, 113, 0.15)', 
                                    color: 'var(--bull-green)', 
                                    fontSize: '10.5px', 
                                    cursor: 'pointer', 
                                    fontWeight: 600, 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.12)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.06)'}
                            >
                                <span>⚙️ ตั้งค่าอินดิเคเตอร์ (Fast/Slow)</span>
                            </button>
                            <button 
                                onClick={() => alert('4-Color MACD (MACD 4C) คือ ออสซิลเลเตอร์ที่ปรับปรุงการแสดงผลโมเมนตัมแบบ 4 สีมิติ โดยแท่งเหนือ Zero (สีเขียวสว่าง/สีเขียวเข้ม) และใต้ Zero (สีแดงเข้ม/สีแดงสว่าง) จะช่วยแยกแยะว่าทิศทางคลื่นอยู่ในช่วงเร่งความเร็วหรือเริ่มชะลอตัว ช่วยให้เข้าต้นเทรนได้เร็วและออกได้คมกว่า MACD ทั่วไป')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '10.5px', cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span>📊 MACD 4C คืออะไร?</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SETTINGS / MT5 CONNECTION MODAL --- */}
            <div className={`modal-overlay ${settingsOpen ? 'active' : ''}`}>
                <div className="modal-container" style={{ width: '680px', maxWidth: '95%' }}>
                    <div className="modal-header">
                        <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
                            <Icon name="server" size={18} style={{ color: 'var(--accent-gold)' }} />
                            <span>ระบบจัดการพอร์ต MT5 TRADER ความปลอดภัยสูง (Multi-Account Manager)</span>
                        </h3>
                        <button className="modal-close-btn" onClick={() => { setSettingsOpen(false); setAccountFormOpen(false); }}>
                            <Icon name="close" size={20} />
                        </button>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        {settingsAlert && (
                            <div className={`form-alert ${settingsAlert.type}`}>
                                <Icon name={settingsAlert.type === 'success' ? 'check' : 'alert'} size={16} />
                                <span>{settingsAlert.text}</span>
                            </div>
                        )}

                        {/* Connection status summary widget */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            padding: '14px',
                            marginBottom: '18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>สถานะการเชื่อมต่อปัจจุบัน (Current Status)</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div className={`pulse-dot ${!connectionStatus.is_simulated && connectionStatus.is_connected ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: !connectionStatus.is_simulated && connectionStatus.is_connected ? 'var(--bull-green)' : 'var(--text-muted)' }}></div>
                                    <strong style={{ fontSize: '15px', color: !connectionStatus.is_simulated && connectionStatus.is_connected ? 'var(--bull-green)' : 'var(--text-primary)' }}>
                                        {!connectionStatus.is_simulated && connectionStatus.is_connected 
                                            ? `บัญชีจริง #${connectionStatus.login}` 
                                            : 'โหมดจำลอง (Simulation Mode)'}
                                    </strong>
                                </div>
                                {!connectionStatus.is_simulated && connectionStatus.is_connected && (
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                        Server: {connectionStatus.server}
                                    </span>
                                )}
                            </div>
                            
                            {!connectionStatus.is_simulated && (
                                <button 
                                    className="btn-secondary" 
                                    style={{ borderColor: 'var(--bear-red)', color: 'var(--bear-red)', fontSize: '11px', padding: '6px 12px', margin: 0, height: 'fit-content' }} 
                                    onClick={handleDisconnectLive}
                                >
                                    ตัดการเชื่อมต่อ (กลับโหมดจำลอง)
                                </button>
                            )}
                        </div>

                        {/* Top Bar for Saved Accounts section */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                                <Icon name="lock" size={14} style={{ color: 'var(--accent-gold)' }} />
                                <span>รายชื่อพอร์ตการเทรดที่บันทึกปลอดภัย ({accounts.length})</span>
                            </h4>
                            {!accountFormOpen && (
                                <button 
                                    className="btn-primary" 
                                    style={{ 
                                        margin: 0, 
                                        padding: '6px 14px', 
                                        fontSize: '11px', 
                                        background: 'linear-gradient(135deg, var(--accent-gold), #f39c12)', 
                                        color: '#000', 
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: 'var(--glow-gold)'
                                    }}
                                    onClick={() => {
                                        setAccountForm({ id: null, login: "", password: "", server: "MT5-Real", auto_connect: true, is_active: false });
                                        setAccountFormOpen(true);
                                    }}
                                >
                                    <Icon name="plus" size={12} />
                                    <span>เพิ่มบัญชีพอร์ตใหม่</span>
                                </button>
                            )}
                        </div>

                        {/* Sub-modal or Inline form for Add / Edit Account */}
                        {accountFormOpen && (
                            <div style={{
                                background: 'rgba(255, 183, 3, 0.02)',
                                border: '1px solid rgba(255, 183, 3, 0.15)',
                                borderRadius: '10px',
                                padding: '16px',
                                marginBottom: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}>
                                <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                                    <Icon name="edit" size={14} />
                                    <span>{accountForm.id ? `แก้ไขข้อมูลบัญชี #${accountForm.login}` : "กรอกข้อมูลบัญชี MT5 Trader ใหม่"}</span>
                                </h5>

                                <form onSubmit={handleSaveAccount}>
                                    <div style={{ display: 'grid', gridTemplateColumns: accountForm.id ? '1fr 1.2fr' : '1fr 1fr 1.2fr', gap: '12px' }}>
                                        {!accountForm.id && (
                                            <div className="input-group" style={{ margin: 0 }}>
                                                <label style={{ fontSize: '11px', marginBottom: '4px' }}>เลขบัญชีเทรด (MT5 ID)</label>
                                                <input 
                                                    type="number" 
                                                    className="numeric-input" 
                                                    required 
                                                    placeholder="เช่น 14234509"
                                                    value={accountForm.login}
                                                    onChange={(e) => setAccountForm({ ...accountForm, login: e.target.value })}
                                                    style={{ height: '36px', fontSize: '12px' }}
                                                />
                                            </div>
                                        )}

                                        <div className="input-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '11px', marginBottom: '4px' }}>
                                                {accountForm.id ? "รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)" : "รหัสผ่านเทรด (Password)"}
                                            </label>
                                            <input 
                                                type="password" 
                                                className="numeric-input" 
                                                required={!accountForm.id}
                                                placeholder={accountForm.id ? "ปล่อยว่างไว้หากไม่แก้ไข" : "รหัสผ่าน MT5 ของท่าน"}
                                                value={accountForm.password}
                                                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                                                style={{ height: '36px', fontSize: '12px' }}
                                            />
                                        </div>

                                        <div className="input-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '11px', marginBottom: '4px' }}>MT5 Server Name</label>
                                            <input 
                                                type="text" 
                                                className="numeric-input" 
                                                required 
                                                placeholder="เช่น MT5Trader-Trial7 หรือ MT5Trader-Real"
                                                value={accountForm.server}
                                                onChange={(e) => setAccountForm({ ...accountForm, server: e.target.value })}
                                                style={{ height: '36px', fontSize: '12px' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <input 
                                                type="checkbox" 
                                                id="form-autoconnect"
                                                checked={accountForm.auto_connect}
                                                onChange={(e) => setAccountForm({ ...accountForm, auto_connect: e.target.checked })}
                                                style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer', width: '15px', height: '15px' }}
                                            />
                                            <label htmlFor="form-autoconnect" style={{ margin: 0, cursor: 'pointer', fontSize: '11px', textTransform: 'none', fontWeight: 500 }}>
                                                เชื่อมต่ออัตโนมัติเมื่อสตาร์ท (Auto-Connect)
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                                        <button 
                                            type="button" 
                                            className="btn-secondary" 
                                            style={{ margin: 0, padding: '6px 14px', fontSize: '11px' }} 
                                            onClick={() => setAccountFormOpen(false)}
                                        >
                                            ยกเลิก
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn-primary" 
                                            style={{ margin: 0, padding: '6px 20px', fontSize: '11px', background: 'var(--accent-gold)', color: '#000', fontWeight: 700 }}
                                            disabled={accountFormLoading}
                                        >
                                            {accountFormLoading ? "กำลังประมวลผล..." : accountForm.id ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มบัญชีและเข้ารหัสลับ"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* List of accounts table */}
                        {accounts.length === 0 ? (
                            <div style={{
                                border: '1px dashed rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.01)'
                            }}>
                                <Icon name="lock" size={36} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '10px' }} />
                                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>ยังไม่มีบัญชี MT5 Trader บันทึกในคลังความปลอดภัยฐานข้อมูล</div>
                                <div style={{ fontSize: '10.5px', marginTop: '4px' }}>คลิกปุ่ม "เพิ่มบัญชีพอร์ตใหม่" ด้านขวาบนเพื่อเริ่มต้นการใช้งานพอร์ตแบบปลอดภัยสูงสุด</div>
                            </div>
                        ) : (
                            <div className="backtest-table-wrapper" style={{ maxHeight: '350px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflowY: 'auto' }}>
                                <table className="trading-table">
                                    <thead>
                                        <tr>
                                            <th>เลขบัญชีเทรด (MT5 ID)</th>
                                            <th>Server</th>
                                            <th style={{ textAlign: 'center' }}>สถานะพอร์ต</th>
                                            <th style={{ textAlign: 'center' }}>Auto-Connect</th>
                                            <th style={{ textAlign: 'center' }}>จัดการคำสั่ง</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accounts.map((acc) => (
                                            <tr key={acc.id} style={{ 
                                                background: acc.is_active ? 'rgba(255,183,3,0.03)' : 'transparent',
                                                borderLeft: acc.is_active ? '3px solid var(--accent-gold)' : 'none'
                                            }}>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: acc.is_active ? 'var(--accent-gold)' : 'var(--text-primary)', paddingLeft: acc.is_active ? '9px' : '12px' }}>
                                                    #{acc.login}
                                                </td>
                                                <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                    {acc.server}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {acc.is_active ? (
                                                        <span style={{
                                                            fontSize: '9px',
                                                            background: 'rgba(46, 204, 113, 0.08)',
                                                            color: 'var(--bull-green)',
                                                            border: '1px solid rgba(46, 204, 113, 0.25)',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontWeight: 'bold',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--bull-green)', display: 'inline-block' }}></span>
                                                            ACTIVE
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className="chatbot-chip"
                                                            style={{ 
                                                                margin: 0, 
                                                                padding: '2px 8px', 
                                                                fontSize: '9.5px', 
                                                                borderColor: 'rgba(255,255,255,0.15)',
                                                                color: 'var(--text-secondary)',
                                                                background: 'rgba(255,255,255,0.02)',
                                                                cursor: settingsLoading ? 'not-allowed' : 'pointer'
                                                            }}
                                                            disabled={settingsLoading}
                                                            onClick={() => handleActivateAccount(acc.id, acc.login)}
                                                        >
                                                            {settingsLoading ? "กำลังเชื่อมต่อ..." : "สลับเข้าใช้งาน"}
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <div 
                                                            className={`toggle-switch-container ${acc.auto_connect ? 'active' : ''}`}
                                                            style={{ transform: 'scale(0.8)', cursor: 'pointer' }}
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch(`/api/mt5/accounts/${acc.id}`, {
                                                                        method: "PUT",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ auto_connect: !acc.auto_connect })
                                                                    });
                                                                    if (res.ok) {
                                                                        fetchAccounts();
                                                                    }
                                                                } catch (err) {
                                                                    console.error("Failed to toggle auto_connect:", err);
                                                                }
                                                            }}
                                                        >
                                                            <div className="toggle-switch"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <button 
                                                            className="btn-edit-bot-icon"
                                                            style={{ width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onClick={() => {
                                                                setAccountForm({ id: acc.id, login: acc.login, password: "", server: acc.server, auto_connect: acc.auto_connect, is_active: acc.is_active });
                                                                setAccountFormOpen(true);
                                                            }}
                                                            title="แก้ไขพอร์ตนี้"
                                                        >
                                                            <Icon name="edit" size={12} />
                                                        </button>
                                                        <button 
                                                            className="btn-delete-bot-icon"
                                                            style={{ width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onClick={() => handleDeleteAccount(acc.id, acc.login)}
                                                            title="ลบพอร์ตนี้"
                                                        >
                                                            <Icon name="trash" size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                        { id: 'pj_indicator', name: 'PJ Indicator 🔮', desc: 'กลยุทธ์ตามแนวโน้มและ Confluence Score จาก Pine Script' },
                                        { id: 'stoch_rsi', name: 'Stochastic RSI (StochRSI)', desc: 'จับสัญญาณซื้อขายและจุดกลับตัวได้รวดเร็วกว่า RSI ทั่วไป โดยใช้ออสซิลเลเตอร์คำนวณซ้ำบน RSI' },
                                        { id: 'macd_4c', name: 'MACD 4 Color (4C) Momentum', desc: 'ตรวจจับแรงขับเคลื่อนเทรนด้วยแท่งสีโมเมนตัม 4 มิติ (Pine Script 4-Color MACD)' },
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
                                                                       single === "pj_indicator" ? "PJ Indicator" :
                                                                       single === "stoch_rsi" ? "StochRSI Fast Reversal" :
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

                            {selectedAlgos.includes('pj_indicator') && (
                                <div className="bot-form-grid" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                    <div className="input-group" style={{ gridColumn: 'span 2', margin: 0 }}>
                                        <label style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>PJ Take Profit Target (เป้าหมายกำไรจาก Indicator)</label>
                                        <select 
                                            className="numeric-input"
                                            style={{ appearance: 'auto' }}
                                            value={botForm.pj_tp_target || 'manual'}
                                            onChange={(e) => setBotForm({ ...botForm, pj_tp_target: e.target.value })}
                                        >
                                            <option value="manual">Manual TP Points (ใช้ระยะ TP ด้านบน)</option>
                                            <option value="tp1">TP Target 1 (ระยะ TP1 ตามสูตร PJ)</option>
                                            <option value="tp1_5">TP Target 1.5 (ระยะ TP1.5 ตามสูตร PJ)</option>
                                            <option value="tp2">TP Target 2 (ระยะ TP2 ตามสูตร PJ)</option>
                                            <option value="tp2_5">TP Target 2.5 (ระยะ TP2.5 ตามสูตร PJ)</option>
                                            <option value="tp3">TP Target 3 (ระยะ TP3 ตามสูตร PJ)</option>
                                        </select>
                                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                            * เมื่อเลือกเป้าหมายกำไรที่ไม่ใช่ Manual ระบบจะละทิ้งระยะ TP ด้านบน และใช้ระดับราคา TP จากอินดิเคเตอร์ PJ แทน
                                        </span>
                                    </div>
                                </div>
                            )}

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

                                {/* 3. AI News & Geopolitical Risk Filter Box */}
                                <div style={{
                                    background: botForm.use_news_filter ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: botForm.use_news_filter ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: botForm.use_news_filter ? '0 0 10px rgba(212, 175, 55, 0.05)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setBotForm({ ...botForm, use_news_filter: !botForm.use_news_filter })}>
                                        <input 
                                            type="checkbox" 
                                            id="chk-news-filter"
                                            checked={botForm.use_news_filter || false}
                                            onChange={(e) => setBotForm({ ...botForm, use_news_filter: e.target.checked })}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="chk-news-filter" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                            🛡️ เปิดระบบ AI กรองข่าวด่วนและสงครามภูมิรัฐศาสตร์ (AI Geopolitical Risk Filter)
                                        </label>
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', lineHeight: '1.3' }}>
                                        * กรองและบล็อกคำสั่งซื้อขายอัตโนมัติเมื่อตรวจพบระดับความรุนแรงสูง (High Threat เช่น ความตึงเครียดทางสงคราม) หรือมีปัจจัยข่าวสารระดับ High Impact ที่ขัดแย้งกับการเปิดสถานะ เพื่อความปลอดภัยสูงสุดของทุนในพอร์ต
                                    </span>
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

            {/* --- STOCHASTIC RSI CONFIGURATION MODAL --- */}
            {stochRsiSettingsOpen && (
                <div className="modal-overlay active" style={{ display: 'flex' }}>
                    <div className="modal-container" style={{ width: '380px', background: '#1c2030', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8f9fa', fontFamily: 'Outfit' }}>Stoch RSI</h3>
                            <button onClick={() => setStochRsiSettingsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        
                        {/* Modal Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', background: 'rgba(0,0,0,0.05)' }}>
                            {['Inputs', 'Style', 'Visibility'].map((tab) => (
                                <div 
                                    key={tab} 
                                    style={{ 
                                        padding: '12px 16px', 
                                        color: tab === 'Inputs' ? 'var(--accent-gold)' : '#94a3b8', 
                                        fontWeight: 600, 
                                        fontSize: '13px', 
                                        cursor: 'pointer',
                                        borderBottom: tab === 'Inputs' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                        marginBottom: '-1px'
                                    }}
                                    onClick={() => tab !== 'Inputs' && alert(`${tab} ทำงานในโหมดพรีเมียมอัตโนมัติเรียบร้อยแล้ว`)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#1c2030' }}>
                            {/* Input K */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>K</label>
                                <input 
                                    type="number" 
                                    value={stochRsiForm.k} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, k: parseInt(e.target.value) || 3 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>

                            {/* Input D */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>D</label>
                                <input 
                                    type="number" 
                                    value={stochRsiForm.d} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, d: parseInt(e.target.value) || 3 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>

                            {/* Input RSI Length */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>RSI Length</label>
                                <input 
                                    type="number" 
                                    value={stochRsiForm.rsiLength} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, rsiLength: parseInt(e.target.value) || 13 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>

                            {/* Input Stochastic Length */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Stochastic Length</label>
                                <input 
                                    type="number" 
                                    value={stochRsiForm.stochasticLength} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, stochasticLength: parseInt(e.target.value) || 13 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>

                            {/* Input RSI Source */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>RSI Source</label>
                                <select 
                                    value={stochRsiForm.rsiSource} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, rsiSource: e.target.value })}
                                    style={{ width: '100px', padding: '6px 8px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', outline: 'none', appearance: 'auto' }}
                                >
                                    {['Close', 'Open', 'High', 'Low'].map(src => (
                                        <option key={src} value={src}>{src}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Heading CALCULATION */}
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.8px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                                CALCULATION
                            </div>

                            {/* Input Timeframe */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Timeframe</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <select 
                                        value={stochRsiForm.timeframe} 
                                        onChange={(e) => setStochRsiForm({ ...stochRsiForm, timeframe: e.target.value })}
                                        style={{ width: '100px', padding: '6px 8px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', outline: 'none', appearance: 'auto' }}
                                    >
                                        {['Chart', 'M1', 'M5', 'M15', 'M30', 'H1', 'D1'].map(tf => (
                                            <option key={tf} value={tf}>{tf === 'Chart' ? 'Chart' : tf}</option>
                                        ))}
                                    </select>
                                    <span 
                                        title="ใช้กรอบเวลาเดียวกันกับหน้าต่างกราฟหลัก หรือบังคับให้ใช้กรอบเวลาเฉพาะเจาะจง" 
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '11px', cursor: 'help', fontWeight: 'bold' }}
                                    >
                                        ?
                                    </span>
                                </div>
                            </div>

                            {/* Checkbox Wait for closes */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <input 
                                    type="checkbox" 
                                    id="wait-closes-chk"
                                    checked={stochRsiForm.waitClose} 
                                    onChange={(e) => setStochRsiForm({ ...stochRsiForm, waitClose: e.target.checked })}
                                    style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer', width: '15px', height: '15px' }}
                                />
                                <label htmlFor="wait-closes-chk" style={{ fontSize: '12px', color: '#f8f9fa', cursor: 'pointer', userSelect: 'none' }}>
                                    Wait for timeframe closes
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                            {/* Defaults Button */}
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => {
                                        setStochRsiForm({
                                            k: 3,
                                            d: 3,
                                            rsiLength: 13,
                                            stochasticLength: 13,
                                            rsiSource: "Close",
                                            timeframe: "Chart",
                                            waitClose: true
                                        });
                                        alert('รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
                                    }} 
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <span>Defaults</span>
                                    <span style={{ fontSize: '9px' }}>▼</span>
                                </button>
                            </div>

                            {/* Cancel / OK */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setStochRsiSettingsOpen(false)} 
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#f8f9fa', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setStochRsiSettings({ ...stochRsiForm });
                                        setStochRsiSettingsOpen(false);
                                    }} 
                                    style={{ background: '#fff', border: 'none', color: '#000', padding: '6px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MACD 4C CONFIGURATION MODAL --- */}
            {macdSettingsOpen && (
                <div className="modal-overlay active" style={{ display: 'flex' }}>
                    <div className="modal-container" style={{ width: '380px', background: '#1c2030', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8f9fa', fontFamily: 'Outfit' }}>MACD 4C</h3>
                            <button onClick={() => setMacdSettingsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        
                        {/* Modal Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', background: 'rgba(0,0,0,0.05)' }}>
                            {['Inputs', 'Style', 'Visibility'].map((tab) => (
                                <div 
                                    key={tab} 
                                    style={{ 
                                        padding: '12px 16px', 
                                        color: tab === 'Inputs' ? 'var(--bull-green)' : '#94a3b8', 
                                        fontWeight: 600, 
                                        fontSize: '13px', 
                                        cursor: 'pointer',
                                        borderBottom: tab === 'Inputs' ? '2px solid var(--bull-green)' : '2px solid transparent',
                                        marginBottom: '-1px'
                                    }}
                                    onClick={() => tab !== 'Inputs' && alert(`${tab} ทำงานในโหมดพรีเมียมอัตโนมัติเรียบร้อยแล้ว`)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#1c2030' }}>
                            {/* Input Fast EMA */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Fast moving average</label>
                                <input 
                                    type="number" 
                                    value={macdForm.fastPeriod} 
                                    onChange={(e) => setMacdForm({ ...macdForm, fastPeriod: parseInt(e.target.value) || 12 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>

                            {/* Input Slow EMA */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Slow moving average</label>
                                <input 
                                    type="number" 
                                    value={macdForm.slowPeriod} 
                                    onChange={(e) => setMacdForm({ ...macdForm, slowPeriod: parseInt(e.target.value) || 26 })}
                                    style={{ width: '100px', padding: '6px 10px', background: '#131722', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f9fa', fontSize: '13px', textAlign: 'center', outline: 'none' }}
                                    min="1" max="100"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                            {/* Defaults Button */}
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => {
                                        setMacdForm({
                                            fastPeriod: 12,
                                            slowPeriod: 26
                                        });
                                        alert('รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
                                    }} 
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <span>Defaults</span>
                                    <span style={{ fontSize: '9px' }}>▼</span>
                                </button>
                            </div>

                            {/* Cancel / OK */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setMacdSettingsOpen(false)} 
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#f8f9fa', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setMacdSettings({
                                            ...macdSettings,
                                            fastPeriod: macdForm.fastPeriod,
                                            slowPeriod: macdForm.slowPeriod
                                        });
                                        setMacdSettingsOpen(false);
                                    }} 
                                    style={{ background: '#fff', border: 'none', color: '#000', padding: '6px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                className="chatbot-action-btn"
                                onClick={() => window.open('/?popout=chatbot', '_blank', 'width=450,height=750,menubar=no,toolbar=no,location=no,status=no')}
                                title="ขยายหน้าต่างแชทแยก (Popout Window)"
                            >
                                <Icon name="external-link" size={14} />
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
