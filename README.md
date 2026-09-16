# MOD XCLUSIVE - Plataforma E-Commerce de Ropa

## Descripción

MOD XCLUSIVE es una plataforma web de comercio electrónico orientada a la venta de ropa y accesorios, desarrollada con una arquitectura distribuida basada en microservicios.

El sistema permite a los clientes registrarse, iniciar sesión, consultar el catálogo de productos, administrar su carrito de compras, realizar pedidos y consultar su historial. Además, incorpora un panel administrativo para la gestión de productos y pedidos.

El proyecto integra APIs REST y GraphQL mediante un API Gateway central, autenticación basada en JWT, control de roles y persistencia de datos en Firebase Firestore.

---

## Arquitectura

MOD XCLUSIVE utiliza una arquitectura basada en microservicios:

### API Gateway

Funciona como punto de entrada principal del sistema.

- Puerto local: `3000`
- Centraliza las solicitudes del frontend.
- Redirige las peticiones hacia los microservicios correspondientes.
- Propaga tokens de autenticación.
- Valida solicitudes mediante JWT.
- Expone endpoints REST y GraphQL.

### Microservicio de Usuarios

`ms-usuarios`

- Puerto local: `3001`
- API REST.
- Registro de usuarios.
- Inicio de sesión.
- Contraseñas protegidas mediante hash con bcrypt.
- Generación de tokens JWT.
- Consulta y actualización de perfil.
- Control de roles `cliente` y `admin`.
- Los nuevos registros públicos reciben automáticamente el rol `cliente`.

### Microservicio de Productos

`ms-productos`

- Puerto local: `3002`
- API REST.
- Listado de productos.
- Consulta individual de productos.
- Registro de productos.
- Edición de productos.
- Eliminación de productos.
- Control de stock.
- Descuento automático de stock durante las compras.
- Operaciones administrativas protegidas mediante JWT y rol de administrador.

### Microservicio de Pedidos

`ms-pedidos`

- Puerto local: `3003`
- API GraphQL.
- Creación de pedidos.
- Consulta de pedidos.
- Historial de compras por usuario.
- Validación de stock antes de realizar una compra.
- Cálculo automático del total.
- Estados de pedido:
  - Pendiente
  - Procesando
  - Enviado
  - Entregado
- Restricción de pedidos según el usuario autenticado.
- Actualización de estados exclusiva para administradores.

### Frontend

`frontend`

Aplicación web desarrollada con React, TypeScript y Vite.

- Puerto local: `5173`
- Catálogo de productos.
- Vista de detalle.
- Carrito de compras.
- Registro e inicio de sesión.
- Perfil del usuario.
- Historial de pedidos.
- Panel administrativo.
- Gestión de productos.
- Gestión de pedidos.
- Protección de rutas según el rol del usuario.

---

## Flujo General

```text
Usuario
   |
   v
Frontend React
   |
   v
API Gateway :3000
   |
   +--------------------+
   |                    |
   v                    v
ms-usuarios          ms-productos
REST :3001           REST :3002
   |
   +--------------------+
   |
   v
ms-pedidos
GraphQL :3003
   |
   v
Firebase Firestore
```

El frontend consume los servicios a través del API Gateway, evitando acceder directamente a los microservicios desde la interfaz de usuario.

---

## Funcionalidades del Cliente

- Registro de cuenta.
- Inicio y cierre de sesión.
- Autenticación mediante JWT.
- Consulta del catálogo.
- Visualización de detalles de productos.
- Selección de cantidades según stock disponible.
- Carrito de compras.
- Creación de pedidos.
- Validación de stock.
- Descuento de inventario al realizar una compra.
- Consulta del perfil.
- Historial de pedidos.
- Restricción de acceso a información perteneciente a otros usuarios.

---

## Funcionalidades del Administrador

- Inicio de sesión mediante la misma plataforma.
- Acceso a panel administrativo según rol.
- Registro de productos.
- Edición de productos.
- Eliminación de productos.
- Consulta de pedidos.
- Gestión del estado de los pedidos.
- Protección de operaciones administrativas tanto en frontend como backend.

---

## Seguridad

El sistema implementa diferentes mecanismos de seguridad:

- Autenticación mediante JSON Web Token (JWT).
- Hash de contraseñas con bcrypt.
- Separación de roles entre clientes y administradores.
- Registro público restringido automáticamente al rol `cliente`.
- Protección de endpoints administrativos.
- Protección de rutas del frontend.
- Validación de identidad del usuario en operaciones de pedidos.
- Validación de stock desde el backend.
- Variables sensibles almacenadas mediante archivos `.env`.
- Archivos `.env` excluidos del repositorio mediante `.gitignore`.

---

## Tecnologías

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express
- GraphQL
- Apollo Server
- Axios
- JSON Web Token (JWT)
- bcrypt
- dotenv

### Base de Datos

- Firebase Firestore
- Firebase Admin SDK

### Arquitectura

- Microservicios
- API Gateway
- REST
- GraphQL

### DevOps

- Git
- GitHub
- GitHub Actions

---

## CI - Integración Continua

El proyecto incorpora un workflow de GitHub Actions ubicado en:

```text
.github/workflows/ci.yml
```

El workflow está preparado para ejecutarse automáticamente ante cambios enviados a la rama `main` y pull requests dirigidos a esta rama.

Las verificaciones incluyen:

- Instalación automática de dependencias.
- Lint del frontend.
- Build de producción del frontend.
- Verificación de sintaxis del API Gateway.
- Verificación de sintaxis de `ms-usuarios`.
- Verificación de sintaxis de `ms-productos`.
- Verificación de sintaxis de `ms-pedidos`.

---

## Estructura del Proyecto

```text
mod-xclusive/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── frontend/
│   └── src/
│
├── gateway/
│   └── src/
│
├── ms-usuarios/
│   └── src/
│
├── ms-productos/
│   └── src/
│
├── ms-pedidos/
│   └── src/
│
├── .gitignore
└── README.md
```

---

## Puertos de Desarrollo

| Servicio                | Puerto |
| ----------------------- | -----: |
| Frontend                |   5173 |
| API Gateway             |   3000 |
| Microservicio Usuarios  |   3001 |
| Microservicio Productos |   3002 |
| Microservicio Pedidos   |   3003 |

---

## Ejecución Local

Cada componente debe instalar sus dependencias utilizando:

```bash
npm install
```

Posteriormente se ejecutan los servicios correspondientes.

### Frontend

```bash
cd frontend
npm run dev
```

### API Gateway

```bash
cd gateway
npm start
```

### Usuarios

```bash
cd ms-usuarios
npm start
```

### Productos

```bash
cd ms-productos
npm start
```

### Pedidos

```bash
cd ms-pedidos
npm start
```

---

## Estado del Proyecto

Actualmente se encuentran implementados:

- Arquitectura de microservicios.
- API Gateway.
- APIs REST para usuarios y productos.
- GraphQL para pedidos.
- Autenticación JWT.
- Roles cliente y administrador.
- Catálogo y carrito de compras.
- Registro e inicio de sesión.
- Creación e historial de pedidos.
- Control y descuento de stock.
- Panel administrativo.
- CRUD de productos.
- Gestión de estados de pedidos.
- Persistencia mediante Firebase Firestore.
- Workflow de Integración Continua preparado con GitHub Actions.

### Próximas tareas

- Ejecutar y validar el workflow de GitHub Actions en GitHub.
- Configurar despliegue/CD.
- Publicar el frontend.
- Desplegar los servicios backend.
- Realizar pruebas de carga y rendimiento.
- Mejorar la interfaz visual del catálogo.
- Completar pruebas y evidencias finales.

---

## Autor

**Martha Gonzales Chumacero**
