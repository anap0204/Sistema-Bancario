from fixtures import (
    print_test_header, print_test_result, make_request,
    login_user, get_auth_headers, TestStats
)
from config import CLIENT_CREDENTIALS


def run_cuenta_tests() -> TestStats:
    """Ejecuta todas las pruebas de cuenta."""
    print_test_header("PRUEBAS DE CUENTA")
    stats = TestStats()
    
    token, _ = login_user(CLIENT_CREDENTIALS['email'], CLIENT_CREDENTIALS['password'])
    if not token:
        print("❌ No se pudo obtener token para las pruebas de cuenta")
        return stats
    
    headers = get_auth_headers(token)
    
    # Test 1: Consultar saldo
    try:
        response = make_request('GET', '/api/cuenta/saldo', headers=headers)
        passed = response.status_code == 200 and 'saldo' in response.json()
        stats.add_result(passed)
        
        if passed:
            saldo = response.json().get('saldo')
            print_test_result("Consulta de saldo", passed, f"Saldo: ${saldo}")
        else:
            print_test_result("Consulta de saldo", passed)
    except Exception as e:
        stats.add_result(False)
        print_test_result("Consulta de saldo", False, str(e))
    
    # Test 2: Consultar historial
    try:
        response = make_request('GET', '/api/cuenta/historial', headers=headers)
        passed = response.status_code == 200 and isinstance(response.json(), list)
        stats.add_result(passed)
        
        if passed:
            movimientos = response.json()
            print_test_result(
                "Consulta de historial", 
                passed, 
                f"Movimientos: {len(movimientos)}"
            )
        else:
            print_test_result("Consulta de historial", passed)
    except Exception as e:
        stats.add_result(False)
        print_test_result("Consulta de historial", False, str(e))
    
    # Test 3: Acceso sin token
    try:
        response = make_request('GET', '/api/cuenta/saldo')
        passed = response.status_code == 401
        stats.add_result(passed)
        print_test_result(
            "Protección de endpoint sin token", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Protección de endpoint sin token", False, str(e))
    
    # Test 4: Acceso con token inválido
    try:
        response = make_request(
            'GET',
            '/api/cuenta/saldo',
            headers={'Authorization': 'Bearer token_invalido'}
        )
        passed = response.status_code == 401
        stats.add_result(passed)
        print_test_result(
            "Rechazo de token inválido", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Rechazo de token inválido", False, str(e))
    
    return stats


if __name__ == "__main__":
    stats = run_cuenta_tests()
    stats.print_summary()