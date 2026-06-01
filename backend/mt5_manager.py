import os
import random
import time
from datetime import datetime
import threading
import logging

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MT5Manager")

class MT5Manager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if not cls._instance:
                cls._instance = super(MT5Manager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.is_connected = False
        self.is_simulated = True  # Start in Simulation mode by default
        self.login_id = None
        self.server = None
        
        # Simulation State
        self.sim_balance = 10000.0
        self.sim_positions = []
        self.sim_ticket_counter = 10000000
        # Cache of simulated current prices for random walks
        self.sim_prices = {
            "XAUUSD": {"bid": 2345.50, "ask": 2346.00},
            "AAPL": {"bid": 185.20, "ask": 185.35},
            "TSLA": {"bid": 178.50, "ask": 178.70},
            "US500": {"bid": 5230.10, "ask": 5230.80},
            "EURUSD": {"bid": 1.0820, "ask": 1.0822},
            "BTCUSD": {"bid": 67500.00, "ask": 67520.00}
        }
        # Historic mock data caches (to prevent jumping lines on chart redraws)
        self.sim_candles_cache = {}
        
        # Start a thread to update simulated prices in the background
        self.sim_thread = threading.Thread(target=self._simulate_prices_loop, daemon=True)
        self.sim_thread.start()
        
        # Attempt real MT5 initialization if library is available
        if MT5_AVAILABLE:
            try:
                # mt5.initialize() returns True if success
                if mt5.initialize():
                    logger.info("MT5 Terminal successfully initialized.")
                    # Keep is_simulated=True until user explicitly logs into their Exness account
                    self.is_simulated = True
                else:
                    logger.warning(f"MT5 Terminal initialize failed: {mt5.last_error()}. Using Simulation Mode.")
                    self.is_simulated = True
            except Exception as e:
                logger.error(f"Error during MT5 initialize: {e}. Falling back to Simulation Mode.")
                self.is_simulated = True
        else:
            logger.warning("MetaTrader5 python module is not available/supported. Operating in pure Simulation Mode.")
            self.is_simulated = True

        self._initialized = True

    def connect(self, login: int, password: str, server: str) -> bool:
        """Connects to the real Exness Account in MT5."""
        if not MT5_AVAILABLE:
            raise Exception("MetaTrader5 library is not available on this platform.")

        logger.info(f"Attempting to login to MT5 Server: {server} with account {login}")
        
        # Make sure MT5 is initialized
        if not mt5.initialize():
            # Try to initialize again
            if not mt5.initialize():
                err = mt5.last_error()
                raise Exception(f"Failed to initialize MT5: {err}")

        # Login
        authorized = mt5.login(login=int(login), password=password, server=server)
        if authorized:
            self.is_connected = True
            self.is_simulated = False
            self.login_id = login
            self.server = server
            logger.info("MT5 Exness Login Succeeded!")
            return True
        else:
            err = mt5.last_error()
            self.is_connected = False
            logger.error(f"MT5 Exness Login Failed: {err}")
            raise Exception(f"MT5 Exness Login Failed: {err[1]} (Error Code: {err[0]})")

    def disconnect(self):
        """Disconnects and returns to simulation mode."""
        self.is_connected = False
        self.is_simulated = True
        self.login_id = None
        self.server = None
        logger.info("Disconnected from real MT5. Returned to Simulation Mode.")

    def _resolve_symbol(self, symbol: str) -> str:
        """Resolves standard symbol name to specific Exness symbols with suffixes (like XAUUSDm)."""
        if not self.is_simulated and self.is_connected:
            # 1. Try exact match
            if mt5.symbol_info(symbol) is not None:
                return symbol
            # 2. Try with 'm' suffix (Exness Standard/Mini)
            suffix_m = symbol + "m"
            if mt5.symbol_info(suffix_m) is not None:
                return suffix_m
            # 3. Try with '.i' suffix
            suffix_i = symbol + ".i"
            if mt5.symbol_info(suffix_i) is not None:
                return suffix_i
            # 4. Search within all symbols starting with name
            all_syms = mt5.symbols_get()
            if all_syms:
                for s in all_syms:
                    if s.name.upper().startswith(symbol.upper()):
                        return s.name
        return symbol

    def _simulate_prices_loop(self):
        """Background thread updating simulated prices to make charts feel alive."""
        while True:
            try:
                time.sleep(1.0) # Tick every second
                for symbol, price in self.sim_prices.items():
                    # Random walk formula
                    change_pct = random.uniform(-0.0008, 0.0008)
                    spread = price["ask"] - price["bid"]
                    
                    new_bid = price["bid"] * (1 + change_pct)
                    new_ask = new_bid + spread
                    
                    self.sim_prices[symbol] = {
                        "bid": round(new_bid, 2 if symbol != "EURUSD" else 5),
                        "ask": round(new_ask, 2 if symbol != "EURUSD" else 5)
                    }
            except Exception as e:
                logger.error(f"Error in simulated price loop: {e}")

    def get_symbol_price(self, symbol: str) -> dict:
        """Fetch current Bid/Ask price for a symbol."""
        resolved_symbol = self._resolve_symbol(symbol)
        if not self.is_simulated and self.is_connected:
            # Fetch tick from real MT5
            tick = mt5.symbol_info_tick(resolved_symbol)
            if tick is None:
                # Return cached simulated price as safety fallback
                return self.sim_prices.get(symbol, {"bid": 0.0, "ask": 0.0})
            return {"bid": tick.bid, "ask": tick.ask}
        else:
            # Simulation mode
            return self.sim_prices.get(symbol, {"bid": 100.0, "ask": 100.1})

    def get_historical_candles(self, symbol: str, timeframe_str: str, count: int = 150) -> list:
        """Fetch candlestick chart data."""
        resolved_symbol = self._resolve_symbol(symbol)
        if not self.is_simulated and self.is_connected:
            # Map string to MT5 timeframe constant
            tf_map = {
                "M1": mt5.TIMEFRAME_M1,
                "M5": mt5.TIMEFRAME_M5,
                "M15": mt5.TIMEFRAME_M15,
                "M30": mt5.TIMEFRAME_M30,
                "H1": mt5.TIMEFRAME_H1,
                "H4": mt5.TIMEFRAME_H4,
                "D1": mt5.TIMEFRAME_D1
            }
            tf = tf_map.get(timeframe_str, mt5.TIMEFRAME_H1)
            
            # Fetch from MT5
            rates = mt5.copy_rates_from_pos(resolved_symbol, tf, 0, count)
            if rates is None or len(rates) == 0:
                logger.warning(f"Could not fetch rates for {resolved_symbol} from MT5, falling back to simulation.")
                return self._generate_simulated_candles(symbol, timeframe_str, count)
            
            candles = []
            for rate in rates:
                # rate is a structured numpy tuple: (time, open, high, low, close, tick_volume, spread, real_volume)
                candles.append({
                    "time": int(rate[0]),  # Unix timestamp
                    "open": float(rate[1]),
                    "high": float(rate[2]),
                    "low": float(rate[3]),
                    "close": float(rate[4]),
                    "volume": float(rate[5])
                })
            return candles
        else:
            return self._generate_simulated_candles(symbol, timeframe_str, count)

    def _generate_simulated_candles(self, symbol: str, timeframe_str: str, count: int) -> list:
        """Generates mock candlestick data for simulation or fallback."""
        cache_key = f"{symbol}_{timeframe_str}"
        
        # Timeframe spacing in seconds
        spacing_map = {"M1": 60, "M5": 300, "M15": 900, "M30": 1800, "H1": 3600, "H4": 14400, "D1": 86400}
        seconds_per_candle = spacing_map.get(timeframe_str, 3600)
        
        current_time = int(time.time())
        # Align time to timeframe boundary
        current_time = current_time - (current_time % seconds_per_candle)
        
        # If cache exists, let's append new candle(s) based on elapsed time
        if cache_key in self.sim_candles_cache:
            cached_data = self.sim_candles_cache[cache_key]
            last_candle_time = cached_data[-1]["time"]
            
            # Calculate how many new candles are needed
            time_diff = current_time - last_candle_time
            new_candles_count = time_diff // seconds_per_candle
            
            if new_candles_count > 0:
                # Generate new candles based on random walk from last close
                current_price = cached_data[-1]["close"]
                for i in range(1, new_candles_count + 1):
                    c_time = last_candle_time + (i * seconds_per_candle)
                    
                    price_dict = self.sim_prices.get(symbol, {"bid": current_price, "ask": current_price + 0.5})
                    # Use current live price for the very last candle
                    target_close = price_dict["bid"] if i == new_candles_count else current_price * (1 + random.uniform(-0.003, 0.003))
                    
                    high = max(current_price, target_close) * (1 + random.uniform(0, 0.002))
                    low = min(current_price, target_close) * (1 - random.uniform(0, 0.002))
                    
                    cached_data.append({
                        "time": c_time,
                        "open": round(current_price, 2),
                        "high": round(high, 2),
                        "low": round(low, 2),
                        "close": round(target_close, 2),
                        "volume": random.randint(100, 1000)
                    })
                    current_price = target_close
                
                # Keep cache bounded to twice requested count
                if len(cached_data) > count * 2:
                    cached_data = cached_data[-count*2:]
                self.sim_candles_cache[cache_key] = cached_data
            
            # Make sure the current candle's CLOSE price matches the active simulated live price!
            price_dict = self.sim_prices.get(symbol, {"bid": cached_data[-1]["close"], "ask": cached_data[-1]["close"]})
            cached_data[-1]["close"] = price_dict["bid"]
            cached_data[-1]["high"] = max(cached_data[-1]["high"], price_dict["bid"])
            cached_data[-1]["low"] = min(cached_data[-1]["low"], price_dict["bid"])
            
            # Return last N requested candles
            return cached_data[-count:]

        # Create brand-new historical sequence
        logger.info(f"Generating new mock historic candles cache for {cache_key}")
        candles = []
        base_price = self.sim_prices.get(symbol, {"bid": 100.0, "ask": 100.5})["bid"]
        
        # Start backwards in time
        start_time = current_time - (count * seconds_per_candle)
        current_price = base_price * 0.95 # start slightly lower
        
        for i in range(count):
            c_time = start_time + (i * seconds_per_candle)
            
            # Random walk
            change = random.uniform(-0.004, 0.0045)  # slightly upward bias
            target_close = current_price * (1 + change)
            
            high = max(current_price, target_close) * (1 + random.uniform(0, 0.002))
            low = min(current_price, target_close) * (1 - random.uniform(0, 0.002))
            
            candles.append({
                "time": c_time,
                "open": round(current_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(target_close, 2),
                "volume": random.randint(100, 1000)
            })
            current_price = target_close
            
        self.sim_candles_cache[cache_key] = candles
        return candles

    def get_account_info(self) -> dict:
        """Fetch account balance, equity, margin info."""
        if not self.is_simulated and self.is_connected:
            acc = mt5.account_info()
            if acc is None:
                return self._get_simulated_account_info()
            return {
                "balance": acc.balance,
                "equity": acc.equity,
                "margin": acc.margin,
                "margin_free": acc.margin_free,
                "profit": acc.profit,
                "margin_level": acc.margin_level if acc.margin > 0 else 0,
                "currency": acc.currency,
                "server": acc.server,
                "login": acc.login,
                "is_demo": "demo" in acc.server.lower() or "trial" in acc.server.lower() or acc.trade_mode == mt5.ACCOUNT_TRADE_MODE_DEMO
            }
        else:
            return self._get_simulated_account_info()

    def _get_simulated_account_info(self) -> dict:
        """Calculate and return mock account details based on active simulated positions."""
        floating_pnl = 0.0
        margin_used = 0.0
        
        for pos in self.sim_positions:
            price_dict = self.sim_prices.get(pos["symbol"], {"bid": pos["open_price"], "ask": pos["open_price"]})
            current_price = price_dict["bid"] if pos["type"] == "buy" else price_dict["ask"]
            
            # Simple pip profit calculation
            # For gold/forex/stocks, let's treat 1.0 unit change as contract multiplier * lot size
            multiplier = 100.0 if "XAU" in pos["symbol"] else 1.0 if "BTC" in pos["symbol"] else 10.0
            
            if pos["type"] == "buy":
                pnl = (current_price - pos["open_price"]) * pos["volume"] * multiplier
            else:
                pnl = (pos["open_price"] - current_price) * pos["volume"] * multiplier
                
            pos["profit"] = round(pnl, 2)
            floating_pnl += pnl
            
            # Standard leverage margin estimate ($1000 margin per 1 lot of gold/stocks)
            margin_used += pos["volume"] * 1000.0
            
        equity = self.sim_balance + floating_pnl
        margin_free = equity - margin_used
        margin_level = (equity / margin_used * 100) if margin_used > 0 else 0.0
        
        return {
            "balance": round(self.sim_balance, 2),
            "equity": round(equity, 2),
            "margin": round(margin_used, 2),
            "margin_free": round(margin_free, 2),
            "profit": round(floating_pnl, 2),
            "margin_level": round(margin_level, 2),
            "currency": "USD",
            "server": "Simulation-Mode-Server",
            "login": 9999999,
            "is_demo": True
        }

    def get_positions(self) -> list:
        """Fetch open trades/positions."""
        if not self.is_simulated and self.is_connected:
            positions = mt5.positions_get()
            if positions is None:
                return []
            
            pos_list = []
            for pos in positions:
                # pos attributes: ticket, time, type (0=buy, 1=sell), volume, price_open, sl, tp, price_current, profit
                pos_list.append({
                    "ticket": pos.ticket,
                    "symbol": pos.symbol,
                    "type": "buy" if pos.type == 0 else "sell",
                    "volume": pos.volume,
                    "open_price": pos.price_open,
                    "current_price": pos.price_current,
                    "sl": pos.sl,
                    "tp": pos.tp,
                    "profit": pos.profit,
                    "comment": pos.comment,
                    "time": datetime.fromtimestamp(pos.time).strftime("%Y-%m-%d %H:%M:%S")
                })
            return pos_list
        else:
            # Force update floating profits in simulation list
            self._get_simulated_account_info()
            return self.sim_positions

    def sanitize_comment(self, comment_str: str) -> str:
        """Sanitizes comment to ensure it is ASCII-only, alphanumeric/underscore/hyphen, and strictly <= 15 characters."""
        if not comment_str:
            return "Bot"
            
        import re
        
        comment_str = str(comment_str)
        
        # Remove non-ASCII characters
        clean = comment_str.encode("ascii", "ignore").decode("ascii")
        
        # Keep only letters, numbers, underscores, and hyphens (NO SPACES for safety)
        clean = re.sub(r'[^a-zA-Z0-9_\-]', '', clean)
        
        if not clean:
            return "GiantSlayer"
            
        # Strictly truncate to 15 characters to avoid any broker/API limits
        return clean[:15]

    def open_position(self, symbol: str, order_type: str, volume: float, sl: float = 0.0, tp: float = 0.0, comment: str = "Manual") -> dict:
        """Opens a BUY or SELL trade."""
        if volume <= 0:
            raise Exception("Volume (Lot size) must be greater than 0.")
            
        resolved_symbol = self._resolve_symbol(symbol)
        if not self.is_simulated and self.is_connected:
            # MT5 Live Trade
            order_type_mt5 = mt5.ORDER_TYPE_BUY if order_type == "buy" else mt5.ORDER_TYPE_SELL
            price = mt5.symbol_info_tick(resolved_symbol).ask if order_type == "buy" else mt5.symbol_info_tick(resolved_symbol).bid
            
            # Set up transaction request
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": resolved_symbol,
                "volume": volume,
                "type": order_type_mt5,
                "price": price,
                "sl": sl,
                "tp": tp,
                "deviation": 20,
                "magic": 234000,
                "comment": self.sanitize_comment(comment),  # Clean comment for Exness/MT5 safety
                "type_time": mt5.ORDER_TIME_GTC,
            }
            
            # Exness standard accounts usually require specific filling types (IOC or FOK)
            # Let's try ORDER_FILLING_IOC first, then FOK, then fall back to normal
            filling_modes = [mt5.ORDER_FILLING_IOC, mt5.ORDER_FILLING_FOK, mt5.ORDER_FILLING_RETURN]
            result = None
            last_err_code = 0
            last_err_str = ""
            
            for fill in filling_modes:
                request["type_filling"] = fill
                logger.info(f"Sending MT5 order request with filling: {fill}")
                res = mt5.order_send(request)
                if res is not None and res.retcode == mt5.TRADE_RETCODE_DONE:
                    result = res
                    break
                else:
                    if res is not None:
                        last_err_code = res.retcode
                        last_err_str = res.comment
                        logger.warning(f"Order failed with filling {fill}: Retcode {res.retcode}, Comment {res.comment}")
                    else:
                        err = mt5.last_error()
                        last_err_code = err[0]
                        last_err_str = err[1]
            
            if result is None:
                raise Exception(f"Failed to place real MT5 order: {last_err_str} (Code: {last_err_code})")
                
            res_dict = {
                "success": True,
                "ticket": result.order,
                "symbol": symbol,
                "type": order_type,
                "volume": volume,
                "open_price": result.price,
                "profit": 0.0,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            self._notify_discord_open(
                ticket=res_dict["ticket"],
                symbol=res_dict["symbol"],
                order_type=res_dict["type"],
                volume=res_dict["volume"],
                open_price=res_dict["open_price"],
                comment=comment,
                is_live=True
            )
            return res_dict
        else:
            # Simulation trade execution
            price_dict = self.sim_prices.get(symbol, {"bid": 100.0, "ask": 100.5})
            open_price = price_dict["ask"] if order_type == "buy" else price_dict["bid"]
            
            self.sim_ticket_counter += 1
            ticket = self.sim_ticket_counter
            
            new_position = {
                "ticket": ticket,
                "symbol": symbol,
                "type": order_type,
                "volume": round(volume, 2),
                "open_price": open_price,
                "current_price": open_price,
                "sl": sl,
                "tp": tp,
                "profit": 0.0,
                "comment": comment,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            self.sim_positions.append(new_position)
            logger.info(f"Simulated position opened successfully: Ticket {ticket}")
            self._notify_discord_open(
                ticket=ticket,
                symbol=symbol,
                order_type=order_type,
                volume=new_position["volume"],
                open_price=new_position["open_price"],
                comment=new_position["comment"],
                is_live=False
            )
            return {"success": True, "ticket": ticket, **new_position}

    def close_position(self, ticket: int) -> dict:
        """Closes an active position by ticket ID."""
        if not self.is_simulated and self.is_connected:
            # Find the position in MT5
            positions = mt5.positions_get(ticket=ticket)
            if positions is None or len(positions) == 0:
                raise Exception(f"Active position with ticket {ticket} not found in MT5.")
            
            position = positions[0]
            close_type = mt5.ORDER_TYPE_SELL if position.type == 0 else mt5.ORDER_TYPE_BUY
            price = mt5.symbol_info_tick(position.symbol).bid if position.type == 0 else mt5.symbol_info_tick(position.symbol).ask
            
            # Store details before closing for notification
            p_symbol = position.symbol
            p_type = "buy" if position.type == 0 else "sell"
            p_volume = position.volume
            p_open_price = position.price_open
            p_profit = position.profit
            p_comment = position.comment
            
            # Request to close (send matching opposite order specifying position ticket)
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": position.symbol,
                "volume": position.volume,
                "type": close_type,
                "position": position.ticket,
                "price": price,
                "deviation": 20,
                "magic": 234000,
                "comment": "CloseBot",
                "type_time": mt5.ORDER_TIME_GTC,
            }
            
            filling_modes = [mt5.ORDER_FILLING_IOC, mt5.ORDER_FILLING_FOK, mt5.ORDER_FILLING_RETURN]
            result = None
            last_err_code = 0
            last_err_str = ""
            
            for fill in filling_modes:
                request["type_filling"] = fill
                res = mt5.order_send(request)
                if res is not None and res.retcode == mt5.TRADE_RETCODE_DONE:
                    result = res
                    break
                else:
                    if res is not None:
                        last_err_code = res.retcode
                        last_err_str = res.comment
                    else:
                        err = mt5.last_error()
                        last_err_code = err[0]
                        last_err_str = err[1]
                        
            if result is None:
                raise Exception(f"Failed to close MT5 position: {last_err_str} (Code: {last_err_code})")
                
            self._notify_discord_close(
                ticket=ticket,
                symbol=p_symbol,
                order_type=p_type,
                volume=p_volume,
                open_price=p_open_price,
                close_price=price,
                profit=p_profit,
                comment=p_comment,
                is_live=True
            )
            return {
                "success": True,
                "ticket": ticket,
                "profit": position.profit,
                "comment": "Closed successfully on Live Server"
            }
        else:
            # Simulation trade close
            target_pos = None
            for pos in self.sim_positions:
                if pos["ticket"] == ticket:
                    target_pos = pos
                    break
                    
            if target_pos is None:
                raise Exception(f"Simulated position with ticket {ticket} not found.")
                
            # Remove from active list
            self.sim_positions.remove(target_pos)
            
            # Recalculate final profit
            price_dict = self.sim_prices.get(target_pos["symbol"], {"bid": target_pos["open_price"], "ask": target_pos["open_price"]})
            close_price = price_dict["bid"] if target_pos["type"] == "buy" else price_dict["ask"]
            
            multiplier = 100.0 if "XAU" in target_pos["symbol"] else 1.0 if "BTC" in target_pos["symbol"] else 10.0
            if target_pos["type"] == "buy":
                profit = (close_price - target_pos["open_price"]) * target_pos["volume"] * multiplier
            else:
                profit = (target_pos["open_price"] - close_price) * target_pos["volume"] * multiplier
                
            profit = round(profit, 2)
            self.sim_balance += profit
            
            logger.info(f"Simulated position {ticket} closed. Profit: ${profit}. New Balance: ${self.sim_balance}")
            
            self._notify_discord_close(
                ticket=ticket,
                symbol=target_pos["symbol"],
                order_type=target_pos["type"],
                volume=target_pos["volume"],
                open_price=target_pos["open_price"],
                close_price=close_price,
                profit=profit,
                comment=target_pos.get("comment", "Manual"),
                is_live=False
            )
            return {
                "success": True,
                "ticket": ticket,
                "symbol": target_pos["symbol"],
                "type": target_pos["type"],
                "volume": target_pos["volume"],
                "open_price": target_pos["open_price"],
                "close_price": close_price,
                "open_time": target_pos["time"],
                "close_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "profit": profit,
                "sl": target_pos.get("sl", 0.0),
                "tp": target_pos.get("tp", 0.0),
                "comment": target_pos.get("comment", "Manual")
            }

    def _notify_discord_open(self, ticket: int, symbol: str, order_type: str, volume: float, open_price: float, comment: str, is_live: bool):
        """Builds and broadcasts a beautifully formatted Discord embed for open order event."""
        mode_str = "🟢 [LIVE ACCOUNT]" if is_live else "🧪 [SIMULATION MODE]"
        title = f"{mode_str} New Order Opened Successfully!"
        
        # Color: Emerald green (#2FCCA1)
        color = 3132577
        
        price_fmt = f"{open_price:,.5f}" if 'EURUSD' in symbol.upper() else f"{open_price:,.2f}"
        
        embed = {
            "title": title,
            "color": color,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "fields": [
                {"name": "Ticket ID", "value": f"`#{ticket}`", "inline": True},
                {"name": "Symbol", "value": f"**{symbol.upper()}**", "inline": True},
                {"name": "Order Type", "value": f"`{order_type.upper()}`", "inline": True},
                {"name": "Volume (Lots)", "value": f"`{volume:.2f} Lots`", "inline": True},
                {"name": "Open Price", "value": f"`{price_fmt}`", "inline": True},
                {"name": "Trigger Source", "value": f"`{comment}`", "inline": True}
            ],
            "footer": {
                "text": "Giant Slayer Trading Dashboard • Auto Alert System"
            }
        }
        self.send_discord_notification(message="", embeds=[embed])

    def _notify_discord_close(self, ticket: int, symbol: str, order_type: str, volume: float, open_price: float, close_price: float, profit: float, comment: str, is_live: bool):
        """Builds and broadcasts a beautifully formatted Discord embed for close order event."""
        mode_str = "🟢 [LIVE ACCOUNT]" if is_live else "🧪 [SIMULATION MODE]"
        
        pnl_emoji = "💰" if profit >= 0 else "📉"
        pnl_sign = "+" if profit >= 0 else ""
        title = f"{mode_str} Position Closed Successfully!"
        
        # Colors: Green for profit (#57F287), Red for loss (#ED4245)
        color = 5763719 if profit >= 0 else 15548997
        
        open_price_fmt = f"{open_price:,.5f}" if 'EURUSD' in symbol.upper() else f"{open_price:,.2f}"
        close_price_fmt = f"{close_price:,.5f}" if 'EURUSD' in symbol.upper() else f"{close_price:,.2f}"
        
        embed = {
            "title": title,
            "color": color,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "fields": [
                {"name": "Ticket ID", "value": f"`#{ticket}`", "inline": True},
                {"name": "Symbol", "value": f"**{symbol.upper()}**", "inline": True},
                {"name": "Order Type", "value": f"`{order_type.upper()}`", "inline": True},
                {"name": "Volume (Lots)", "value": f"`{volume:.2f} Lots`", "inline": True},
                {"name": "Open Price", "value": f"`{open_price_fmt}`", "inline": True},
                {"name": "Close Price", "value": f"`{close_price_fmt}`", "inline": True},
                {"name": f"{pnl_emoji} Net Profit/Loss (PnL)", "value": f"**`{pnl_sign}${profit:,.2f}`**", "inline": False},
                {"name": "Trigger Source", "value": f"`{comment}`", "inline": True}
            ],
            "footer": {
                "text": "Giant Slayer Trading Dashboard • Auto Alert System"
            }
        }
        self.send_discord_notification(message="", embeds=[embed])

    def send_discord_notification(self, message: str, embeds: list = None):
        """Asynchronously sends a notification message to the Discord webhook."""
        from backend.config import DISCORD_WEBHOOK_URL
        if not DISCORD_WEBHOOK_URL:
            return
            
        def _send():
            try:
                import json
                import urllib.request
                
                payload = {"content": message}
                if embeds:
                    payload["embeds"] = embeds
                    
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    DISCORD_WEBHOOK_URL,
                    data=data,
                    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    pass
            except Exception as e:
                logger.error(f"Failed to send Discord notification in background: {e}")
                
        threading.Thread(target=_send, daemon=True).start()
