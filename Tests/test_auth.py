from fixtures import (
    print_test_header, print_test_result, make_request, 
    login_user, TestStats
)
from config import ADMIN_CREDENTIALS, CLIENT_CREDENTIALS


def run_auth_tests() -> TestStats:
    """Ejecuta todas las pruebas de autenticación."""
    print_test_header("PRUEBAS DE AUTENTICACIÓN")
    stats = TestStats()
    
    # Test 1: Login exitoso con admin
    try:
        token, rol = login_user(ADMIN_CREDENTIALS['email'], ADMIN_CREDENTIALS['password'])
        passed = token is not None and rol == 'admin'
        stats.add_result(passed)
        print_test_result("Login exitoso (admin)", passed, f"Rol: {rol}")
    except Exception as e:
        stats.add_result(False)
        print_test_result("Login exitoso (admin)", False, str(e))
    
    # Test 2: Login exitoso con cliente
    try:
        token, rol = login_user(CLIENT_CREDENTIALS['email'], CLIENT_CREDENTIALS['password'])
        passed = token is not None and rol == 'cliente'
        stats.add_result(passed)
        print_test_result("Login exitoso (cliente)", passed, f"Rol: {rol}")
    except Exception as e:
        stats.add_result(False)
        print_test_result("Login exitoso (cliente)", False, str(e))
    
    # Test 3: Login con credenciales incorrectas
    try:
        response = make_request(
            'POST',
            '/api/auth/login',
            json_data={'email': 'incorrecto@test.com', 'password': 'wrong'}
        )
        passed = response.status_code == 401
        stats.add_result(passed)
        print_test_result(
            "Rechazo de credenciales incorrectas", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Rechazo de credenciales incorrectas", False, str(e))
    
    # Test 4: Login con campos faltantes
    try:
        response = make_request(
            'POST',
            '/api/auth/login',
            json_data={'email': 'test@test.com'}
        )
        passed = response.status_code == 400
        stats.add_result(passed)
        print_test_result(
            "Validación de campos requeridos", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Validación de campos requeridos", False, str(e))
    
    # Test 5: Logout exitoso
    try:
        token, _ = login_user(CLIENT_CREDENTIALS['email'], CLIENT_CREDENTIALS['password'])
        if token:
            response = make_request(
                'POST',
                '/api/auth/logout',
                headers={'Authorization': f'Bearer {token}'}
            )
            passed = response.status_code == 200
            stats.add_result(passed)
            print_test_result("Logout exitoso", passed, f"Status: {response.status_code}")
        else:
            stats.add_result(False)
            print_test_result("Logout exitoso", False, "No se pudo obtener token")
    except Exception as e:
        stats.add_result(False)
        print_test_result("Logout exitoso", False, str(e))
    
    return stats


if __name__ == "__main__":
    stats = run_auth_tests()
    stats.print_summary()