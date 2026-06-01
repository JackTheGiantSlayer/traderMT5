import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Server Settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8000))

# Database Settings
DATABASE_URL = os.getenv("DATABASE_URL")

# Encryption Key for secure password storage
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
if not ENCRYPTION_KEY:
    try:
        from cryptography.fernet import Fernet
        new_key = Fernet.generate_key().decode()
        ENCRYPTION_KEY = new_key
        # Append to .env
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(env_path):
            with open(env_path, "a") as f:
                f.write(f"\n# Secure MT5 Account Encryption Key\nENCRYPTION_KEY={new_key}\n")
            print("Config: Successfully generated and appended new ENCRYPTION_KEY to .env")
    except Exception as e:
        print(f"Config: Failed to generate/write ENCRYPTION_KEY: {e}")

def encrypt_password(password: str) -> str:
    """Encrypts a plain-text password using the system ENCRYPTION_KEY."""
    if not password:
        return ""
    try:
        from cryptography.fernet import Fernet
        f = Fernet(ENCRYPTION_KEY.encode())
        return f.encrypt(password.encode()).decode()
    except Exception as e:
        print(f"Config: Error encrypting password: {e}")
        return ""

def decrypt_password(encrypted_password: str) -> str:
    """Decrypts an encrypted password using the system ENCRYPTION_KEY."""
    if not encrypted_password:
        return ""
    try:
        from cryptography.fernet import Fernet
        f = Fernet(ENCRYPTION_KEY.encode())
        return f.decrypt(encrypted_password.encode()).decode()
    except Exception as e:
        print(f"Config: Error decrypting password: {e}")
        return ""

# MT5 Trader Default Credentials
MT5_LOGIN = os.getenv("MT5_LOGIN", "")
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "")
MT5_SERVER = os.getenv("MT5_SERVER", "")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")


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
