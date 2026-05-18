import os

BASE_URL = os.getenv('API_URL', 'http://localhost:3000')

ADMIN_CREDENTIALS = {
    'email': 'admin@bancoup.mx',
    'password': 'Admin#1234'
}

CLIENT_CREDENTIALS = {
    'email': 'ana.martinez@bancoup.mx',
    'password': 'Cliente#5678'
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

TIMEOUT = 8

MAX_RETRIES = 1
RETRY_DELAY = 1