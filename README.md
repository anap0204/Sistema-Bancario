# Sistema-Bancario
Implementación de Sistema Bancario con enfoque en Ingeniería de Software
# Sistema Bancario SAS

Sistema de transferencias electrónicas para el Banco UP.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Base de datos | Firebase Firestore |
| Seguridad | bcrypt |
| HTTP client | Axios |
| Enrutamiento | React Router DOM |

---

## Estructura del proyecto

```
Sistema-Bancario/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cuentaController.js
│   │   ├── transferenciaController.js
│   │   ├── adminController.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── database.js
│   │   ├── usuarioModel.js
│   │   ├── cuentaModel.js
│   │   └── transferenciaModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cuentaRoutes.js
│   │   ├── transferenciaRoutes.js
│   │   └── adminRoutes.js
│   ├── extraHelpers/
│   │   ├── hashHelper.js
│   │   └── validator.js
│   ├── server.js
│   └── .env
│
└── Frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Transfer.jsx
        │   └── AdminPanel.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Modal.jsx
        │   └── Footer.jsx
        ├── App.jsx
        └── main.jsx
```

---

## Backend

El backend sigue arquitectura MVC. La lógica de negocio vive en los controladores, el acceso a Firestore vive exclusivamente en los modelos, y las rutas solo conectan endpoints con controladores.

### `controllers/`

Contiene la lógica de negocio. Ningún controlador escribe queries directamente a Firestore; siempre llama a un modelo.

| Archivo | Responsabilidad |
|---------|----------------|
| `authController.js` | Login y logout. Obtiene el usuario por email via modelo, compara password con `bcrypt.compare()` |
| `cuentaController.js` | Consulta de saldo e historial de movimientos del cliente autenticado |
| `transferenciaController.js` | Validación de fondos, límite diario de $7,000, verificación de cuenta destino y ejecución de la transferencia |
| `adminController.js` | Bloqueo y desbloqueo de cuentas de usuario |
| `roleMiddleware.js` | Middleware que verifica el rol en sesión antes de dar acceso a rutas protegidas |

### `models/`

Único punto de contacto con Firebase Firestore. No contienen lógica de negocio.

| Archivo | Responsabilidad |
|---------|----------------|
| `database.js` | Inicializa y exporta la instancia de Firestore |
| `usuarioModel.js` | `getByEmail()`, `updateLockStatus()`, `incrementFailedAttempts()` |
| `cuentaModel.js` | `getBalance()`, `updateBalance()`, `getByNumeroCuenta()` |
| `transferenciaModel.js` | `create()`, `getByAccount()`, `getTotalDiario()` |

### `routes/`

Define los endpoints HTTP y aplica middlewares. Solo enruta, no contiene lógica.

| Archivo | Endpoints |
|---------|-----------|
| `authRoutes.js` | `POST /auth/login`, `POST /auth/logout` |
| `cuentaRoutes.js` | `GET /cuenta/saldo`, `GET /cuenta/historial` |
| `transferenciaRoutes.js` | `POST /transferencia` |
| `adminRoutes.js` | `GET /admin/usuarios`, `PATCH /admin/usuario/:id/bloqueo` |

### `extraHelpers/`

Utilidades reutilizables sin lógica de negocio ni acceso a BD.

| Archivo | Responsabilidad |
|---------|----------------|
| `hashHelper.js` | Wrappers de `bcrypt.hash()` y `bcrypt.compare()` |
| `validator.js` | Validaciones de formato: montos con 2 decimales, número de cuenta de 16 dígitos |

### `server.js`

Punto de entrada del backend. Inicializa Express, registra todas las rutas e inicia el servidor.

---

## Frontend

La vista está construida en React con Vite. Las páginas no contienen lógica de negocio; solo renderizan datos y delegan las llamadas HTTP a `services/api.js`.

### `pages/`

Una página por pantalla del sistema.

| Archivo | Descripción |
|---------|-------------|
| `Login.jsx` | Formulario de autenticación con email y contraseña |
| `Dashboard.jsx` | Muestra saldo disponible e historial de movimientos del cliente |
| `Transfer.jsx` | Formulario de transferencia: cuenta destino, monto y concepto |
| `AdminPanel.jsx` | Panel de administrador para gestionar cuentas bloqueadas |

### `components/`

Componentes reutilizables sin lógica propia.

| Archivo | Descripción |
|---------|-------------|
| `Navbar.jsx` | Barra de navegación. Muestra el nombre completo del usuario en todo momento (RF 2.1) |
| `Modal.jsx` | Popup de éxito o error para operaciones como transferencias (RF 1.10) |
| `Footer.jsx` | Pie de página |

### `App.jsx`

Configura React Router con las rutas de la aplicación y protección por rol.

### `main.jsx`

Punto de entrada de React. Monta la aplicación en el DOM.

---

## Variables de entorno

Crear un archivo `.env` en `backend/` con las siguientes variables. Este archivo **no se sube al repositorio**.

```env
FIREBASE_PROJECT_ID=********
FIREBASE_PRIVATE_KEY=******
FIREBASE_CLIENT_EMAIL=*****
PORT=****
SESSION_SECRET=******
```

---

## Reglas de negocio importantes de recordar

- Una cuenta bloqueada no puede iniciar sesión. Se bloquea automáticamente al 4to intento fallido de login.
- El monto máximo de transferencias por día es **$7,000 MXN**.
- El saldo máximo permitido por cuenta es **$50,000 MXN**.
- Las transferencias son inmutables: no se pueden modificar, cancelar ni eliminar.
- Solo se permiten transferencias entre cuentas del mismo banco (internas).
- Los números de cuenta son únicos e irrepetibles de **16 dígitos**.

---

## Autores

- Rodrigo Bonilla Gutierrez
- Ana Paula Martinez Rico
- Gabriela Carolina Velasco