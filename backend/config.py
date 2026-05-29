import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Server Settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8000))

# Database Settings
DATABASE_URL = os.getenv("DATABASE_URL")

# Exness MT5 Default Credentials
MT5_LOGIN = os.getenv("MT5_LOGIN", "")
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "")
MT5_SERVER = os.getenv("MT5_SERVER", "")

# Directory settings
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# If DATABASE_URL is not set, use SQLite by default
if not DATABASE_URL:
    db_path = os.path.join(BASE_DIR, "trader.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    IS_SQLITE = True
else:
    IS_SQLITE = DATABASE_URL.startswith("sqlite")
