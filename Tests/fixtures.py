import requests
import time
from typing import Dict, Optional, Tuple
from config import BASE_URL, Colors, TIMEOUT, MAX_RETRIES, RETRY_DELAY


def print_test_header(title: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{Colors.END}\n")


def print_test_result(test_name: str, passed: bool, message: str = ""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} - {test_name}")
    if message:
        print(f"  {Colors.YELLOW}→ {message}{Colors.END}")


def make_request(method: str, endpoint: str, headers: Optional[Dict] = None, 
                 json_data: Optional[Dict] = None, timeout: int = TIMEOUT) -> requests.Response:
    """
    Realiza una petición HTTP con manejo de errores.
    
    Args:
        method: Método HTTP (GET, POST, PATCH, etc.)
        endpoint: Endpoint de la API (ej: '/api/auth/login')
        headers: Diccionario de headers HTTP
        json_data: Datos JSON para enviar en el body
        timeout: Timeout en segundos
    
    Returns:
        Response object de requests
    """
    url = f"{BASE_URL}{endpoint}"
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                timeout=timeout
            )
            return response
        except requests.exceptions.RequestException as e:
            if attempt == MAX_RETRIES - 1:
                raise
            print(f"{Colors.YELLOW}Reintentando... (intento {attempt + 2}/{MAX_RETRIES}){Colors.END}")
            time.sleep(RETRY_DELAY)
    
    raise Exception("No se pudo completar la petición después de varios intentos")


def login_user(email: str, password: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Realiza login y retorna el token y rol del usuario.
    
    Args:
        email: Email del usuario
        password: Contraseña del usuario
    
    Returns:
        Tupla (token, rol) o (None, None) si falla
    """
    try:
        response = make_request(
            'POST',
            '/api/auth/login',
            json_data={'email': email, 'password': password}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('token'), data.get('user', {}).get('rol')
        return None, None
    except Exception as e:
        print(f"{Colors.RED}Error en login: {e}{Colors.END}")
        return None, None


def get_auth_headers(token: str) -> Dict[str, str]:
    """Retorna headers con autorización."""
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }


def get_account_number(token: str) -> Optional[str]:
    """
    Obtiene el número de cuenta del usuario autenticado.
    
    Args:
        token: Token de autenticación
    
    Returns:
        Número de cuenta o None si falla
    """
    try:
        response = make_request(
            'GET',
            '/api/cuenta/saldo',
            headers=get_auth_headers(token)
        )
        
        if response.status_code == 200:
            return response.json().get('numeroCuenta')
        return None
    except Exception:
        return None


class TestStats:
    """Clase para llevar estadísticas de las pruebas."""
    
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.start_time = time.time()
    
    def add_result(self, passed: bool):
        """Registra el resultado de una prueba."""
        self.total += 1
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        """Imprime resumen final de las pruebas."""
        elapsed = time.time() - self.start_time
        
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
        print("RESUMEN FINAL DE PRUEBAS")
        print(f"{'='*60}{Colors.END}")
        print(f"\nTotal de pruebas: {self.total}")
        print(f"{Colors.GREEN}Exitosas: {self.passed}{Colors.END}")
        print(f"{Colors.RED}Fallidas: {self.failed}{Colors.END}")
        print(f"\nTiempo total: {elapsed:.2f} segundos")
        
        if self.failed == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}¡TODAS LAS PRUEBAS PASARON!{Colors.END}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}ALGUNAS PRUEBAS FALLARON{Colors.END}")