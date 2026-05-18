from fixtures import (
    print_test_header, print_test_result, make_request,
    login_user, get_auth_headers, get_account_number, TestStats
)
from config import CLIENT_CREDENTIALS


def run_transferencia_tests() -> TestStats:
    """Ejecuta todas las pruebas de transferencias."""
    print_test_header("PRUEBAS DE TRANSFERENCIAS")
    stats = TestStats()
    
    token, _ = login_user(CLIENT_CREDENTIALS['email'], CLIENT_CREDENTIALS['password'])
    if not token:
        print("❌ No se pudo obtener token para las pruebas de transferencias")
        return stats
    
    headers = get_auth_headers(token)
  
    cuenta_destino = "2368629145555604" 
    
    # Test 1: Transferencia exitosa con monto válido
    try:
        response = make_request(
            'POST',
            '/api/transferencias',
            headers=headers,
            json_data={
                'cuentaDestino': cuenta_destino,
                'monto': 100.50,
                'concepto': 'Prueba de transferencia'
            }
        )
        passed = response.status_code == 201
        stats.add_result(passed)
        
        if passed:
            data = response.json()
            importe = data.get('transferencia', {}).get('Importe')
            print_test_result("Transferencia válida", passed, f"Importe: ${importe}")
        else:
            print_test_result("Transferencia válida", passed, response.json().get('message', ''))
    except Exception as e:
        stats.add_result(False)
        print_test_result("Transferencia válida", False, str(e))
    
    # Test 2: Rechazo de monto negativo
    try:
        response = make_request(
            'POST',
            '/api/transferencias',
            headers=headers,
            json_data={
                'cuentaDestino': cuenta_destino,
                'monto': -50,
                'concepto': 'Monto negativo'
            }
        )
        passed = response.status_code in [400, 500]
        stats.add_result(passed)
        print_test_result(
            "Rechazo de monto negativo", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Rechazo de monto negativo", False, str(e))
    
    # Test 3: Rechazo de cuenta destino inválida
    try:
        response = make_request(
            'POST',
            '/api/transferencias',
            headers=headers,
            json_data={
                'cuentaDestino': '9999999999999999',
                'monto': 50,
                'concepto': 'Cuenta inexistente'
            }
        )
        passed = response.status_code == 404
        stats.add_result(passed)
        print_test_result(
            "Rechazo de cuenta inexistente", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Rechazo de cuenta inexistente", False, str(e))
    
    # Test 4: Rechazo de transferencia a cuenta propia
    try:
        mi_cuenta = get_account_number(token)
        if mi_cuenta:
            response = make_request(
                'POST',
                '/api/transferencias',
                headers=headers,
                json_data={
                    'cuentaDestino': mi_cuenta,
                    'monto': 50,
                    'concepto': 'A mi misma cuenta'
                }
            )
            passed = response.status_code == 400
            stats.add_result(passed)
            print_test_result(
                "Rechazo de transferencia a cuenta propia", 
                passed, 
                f"Status: {response.status_code}"
            )
        else:
            stats.add_result(False)
            print_test_result(
                "Rechazo de transferencia a cuenta propia", 
                False, 
                "No se pudo obtener número de cuenta"
            )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Rechazo de transferencia a cuenta propia", False, str(e))
    
    # Test 5: Validación de límite diario (7000 MXN)
    try:
        response = make_request(
            'POST',
            '/api/transferencias',
            headers=headers,
            json_data={
                'cuentaDestino': cuenta_destino,
                'monto': 7500,  # Excede el límite
                'concepto': 'Excede límite diario'
            }
        )
        passed = response.status_code == 400
        stats.add_result(passed)
        print_test_result(
            "Validación de límite diario", 
            passed, 
            response.json().get('message', '')
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Validación de límite diario", False, str(e))
    
    # Test 6: Rechazo por concepto vacío
    try:
        response = make_request(
            'POST',
            '/api/transferencias',
            headers=headers,
            json_data={
                'cuentaDestino': cuenta_destino,
                'monto': 50,
                'concepto': ''
            }
        )
        passed = response.status_code in [400, 500]
        stats.add_result(passed)
        print_test_result(
            "Validación de concepto requerido", 
            passed, 
            f"Status: {response.status_code}"
        )
    except Exception as e:
        stats.add_result(False)
        print_test_result("Validación de concepto requerido", False, str(e))
    
    return stats


if __name__ == "__main__":
    stats = run_transferencia_tests()
    stats.print_summary()