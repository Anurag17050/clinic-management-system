import oracledb

DB_CONFIG = {
    "user": "clinic_user",
    "password": "clinic123",
    "dsn": "localhost:1539/XEPDB1"
}

def get_connection():
    return oracledb.connect(**DB_CONFIG)
