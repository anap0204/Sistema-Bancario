import sys
from test_auth import run_auth_tests
from test_cuenta import run_cuenta_tests
from test_transferencia import run_transferencia_tests
from test_admin import run_admin_tests
from fixtures import TestStats
from config import Colors


def main():
    """Ejecuta todas las pruebas"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("      prueba COMPLETA DE PRUEBAS - SISTEMA BANCARIO       ")
    print(f"{Colors.END}")
    
    global_stats = TestStats()
    
    pruebas = [
        ("Autenticación", run_auth_tests),
        ("Cuenta", run_cuenta_tests),
        ("Transferencias", run_transferencia_tests),
        ("Administración", run_admin_tests)
    ]
    
    for prueba_name, prueba_func in pruebas:
        try:
            stats = prueba_func()
            global_stats.total += stats.total
            global_stats.passed += stats.passed
            global_stats.failed += stats.failed
        except Exception as e:
            print(f"{Colors.RED}Error ejecutando  {prueba_name}: {e}{Colors.END}")
            continue
    
    global_stats.print_summary()
    
    sys.exit(0 if global_stats.failed == 0 else 1)


if __name__ == "__main__":
    main()