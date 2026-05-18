from fixtures import (
    print_test_header, print_test_result, make_request,
    login_user, get_auth_headers, TestStats
)
from config import ADMIN_CREDENTIALS, CLIENT_CREDENTIALS


def run_admin_tests() -> TestStats:
    """Ejecuta todas las pruebas del panel de administración."""
    print_test_header("PRUEBAS DE ADMINISTRACIÓN")
    stats = TestStats()
    
    admin_token, _ = login_user(ADMIN_CREDENTIALS['email'], ADMIN_CREDENTIALS['password'])
    client_token, _ = login_user(CLIENT_CREDENTIALS['email'], CLIENT_CREDENTIALS['password'])
    
    if not admin_token:
        print("❌ No se pudo obtener token de admin")
        return stats
    
    admin_headers = get_auth_headers(admin_token)
    
    try:
        response = make_request('GET', '/api/admin/usuarios', headers=admin_headers)
        passed = response.status_code == 200 and 'usuarios' in response.json()
        stats.add_result(passed)
        
        if passed:
            usuarios = response.json().get('usuarios', [])
            print_test_result(
                "Obtener lista de usuarios (admin)", 
                passed, 
                f"Usuarios: {len(usuarios)}"
            )
        else:
            print_test_result("Obtener lista de usuarios (admin)", passed)
    except Exception as e:
        stats.add_result(False)
        print_test_result("Obtener lista de usuarios (admin)", False, str(e))
    
    if client_token:
        try:
            client_headers = get_auth_headers(client_token)
            response = make_request('GET', '/api/admin/usuarios', headers=client_headers)
            passed = response.status_code == 403
            stats.add_result(passed)
            print_test_result(
                "Protección de endpoint admin", 
                passed, 
                f"Status: {response.status_code}"
            )
        except Exception as e:
            stats.add_result(False)
            print_test_result("Protección de endpoint admin", False, str(e))
    else:
        stats.add_result(False)
        print_test_result("Protección de endpoint admin", False, "No se pudo obtener token de cliente")
    
    try:
        response = make_request('GET', '/api/admin/usuarios')
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
    
    try:
        response = make_request('GET', '/api/admin/usuarios', headers=admin_headers)
        if response.status_code == 200:
            usuarios = response.json().get('usuarios', [])
            cliente = next((u for u in usuarios if u.get('rol') == 'cliente' and not u.get('cuentaBloqueada')), None)
            
            if cliente:
                user_id = cliente.get('id')
                response = make_request(
                    'PATCH',
                    f'/api/admin/usuario/{user_id}/bloqueo',
                    headers=admin_headers,
                    json_data={'bloqueado': True}
                )
                passed = response.status_code == 200
                stats.add_result(passed)
                print_test_result("Bloquear cuenta de usuario", passed, f"Status: {response.status_code}")
                
                if passed:
                    make_request(
                        'PATCH',
                        f'/api/admin/usuario/{user_id}/bloqueo',
                        headers=admin_headers,
                        json_data={'bloqueado': False}
                    )
            else:
                stats.add_result(False)
                print_test_result("Bloquear cuenta de usuario", False, "No se encontró cliente válido")
        else:
            stats.add_result(False)
            print_test_result("Bloquear cuenta de usuario", False, "No se pudo obtener lista de usuarios")
    except Exception as e:
        stats.add_result(False)
        print_test_result("Bloquear cuenta de usuario", False, str(e))
    
    return stats


if __name__ == "__main__":
    stats = run_admin_tests()
    stats.print_summary()