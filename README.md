# MOD XCLUSIVE - Plataforma E-Commerce de Ropa

## Descripción
MOD XCLUSIVE es una plataforma de comercio electrónico de ropa moderna, diseñada con una arquitectura distribuida basada en microservicios. Este proyecto académico demuestra habilidades en el desarrollo Full Stack, implementando un backend escalable, un frontend moderno y despliegue automatizado.

## Arquitectura

El proyecto sigue una arquitectura de microservicios con las siguientes partes:

* **API Gateway**: Punto de entrada centralizado que enruta las solicitudes hacia los microservicios correspondientes y valida la autenticación.
* **Microservicio de Usuarios (ms-usuarios)**: Maneja el registro, inicio de sesión (JWT) y perfiles de los usuarios usando una API REST.
* **Microservicio de Productos (ms-productos)**: Gestiona el inventario, categorías y detalles de los productos usando una API REST.
* **Microservicio de Pedidos (ms-pedidos)**: Gestiona el proceso de compras y el historial de pedidos utilizando GraphQL.
* **Frontend**: Aplicación web desarrollada en React y TypeScript que consume los servicios a través del Gateway.

## Tecnologías

* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios
* **Backend**: Node.js, Express, GraphQL, Firebase Admin SDK, JWT, dotenv
* **Base de Datos y Autenticación**: Firebase Firestore, Firebase Authentication
* **CI/CD**: GitHub Actions
* **Despliegue**: Firebase Hosting (Frontend), Railway/Render (Backend)

## Estructura de Carpetas

```
mod-xclusive/
├── frontend/        # Aplicación React
├── gateway/         # API Gateway
├── ms-usuarios/     # Microservicio REST para Usuarios (Puerto 3001)
├── ms-productos/    # Microservicio REST para Productos (Puerto 3002)
├── ms-pedidos/      # Microservicio GraphQL para Pedidos (Puerto 3003)
├── .gitignore
└── README.md
```

## Autor
Martha Gonzales Chumacero
