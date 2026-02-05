# Fullstack Monorepo

Monorepo moderno con npm workspaces que incluye React, NestJS y AWS CDK.

## 📋 Stack

### Frontend (`apps/web`)
- **React 18** - Librería UI
- **Vite** - Bundler rápido y moderno
- **Redux Toolkit** - Gestión de estado
- **TypeScript** - Tipado estático
- **Jest** - Framework de testing

### Backend (`apps/api`)
- **NestJS** - Framework Node.js empresarial
- **TypeScript** - Tipado estático
- **Jest** - Framework de testing
- **Arquitectura Hexagonal** - Código limpio y mantenible
  - `domain/` - Lógica de negocio pura (sin dependencias de frameworks)
  - `application/` - Casos de uso y ports (interfaces)
  - `infrastructure/` - Adapters (HTTP, DB, servicios externos)

### Infrastructure (`infra/cdk`)
- **AWS CDK** - Infrastructure as Code
- **TypeScript** - Definiciones de infraestructura con tipos

---

## 📁 Estructura del Proyecto

```
.
├── apps/
│   ├── api/                         # Backend NestJS
│   │   ├── src/
│   │   │   ├── domain/              # Capa de dominio (lógica de negocio pura)
│   │   │   ├── application/         # Capa de aplicación (casos de uso y ports)
│   │   │   ├── infrastructure/      # Capa de infraestructura (adapters)
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.controller.spec.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                         # Frontend React
│       ├── src/
│       │   ├── store/
│       │   │   └── index.ts         # Redux store configurado
│       │   ├── __tests__/
│       │   │   └── App.test.tsx     # Test smoke del componente
│       │   ├── App.tsx              # Componente principal
│       │   ├── App.css
│       │   ├── main.tsx
│       │   ├── setupTests.ts
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       └── jest.config.js
│
├── infra/
│   └── cdk/                         # Infraestructura AWS CDK
│       ├── bin/
│       │   └── cdk.ts               # Entry point de CDK
│       ├── lib/
│       │   └── cdk-stack.ts         # Stack principal (vacío por ahora)
│       ├── package.json
│       ├── tsconfig.json
│       └── cdk.json
│
├── package.json                     # Configuración raíz del workspace
├── .eslintrc.js                     # Configuración ESLint
├── .prettierrc                      # Configuración Prettier
├── .gitignore
└── README.md
```


---

## 🚀 Inicio Rápido

### Prerequisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Instalación

```bash
# Instalar todas las dependencias del monorepo
npm install
```

### Desarrollo

#### Ejecutar Frontend (React + Vite)
```bash
npm run dev:web
```
- Se abre en `http://localhost:5173`
- Hot Module Replacement habilitado
- Muestra "App inicializada"
 
#### Ejecutar Backend (NestJS)
```bash
npm run dev:api
```
- Corre en `http://localhost:3000`
- Health check disponible en: `GET http://localhost:3000/health`
- Watch mode habilitado

### Build

#### Compilar Frontend
```bash
npm run build:web
```

#### Compilar Backend
```bash
npm run build:api
```

#### Compilar Todo
```bash
npm run build
```

### Testing

#### Ejecutar Todos los Tests
```bash
npm run test
```

#### Ejecutar Tests con Coverage
```bash
npm run test:cov
```

Los tests incluyen:
- **Backend**: Test smoke del HealthController
- **Frontend**: Test smoke del componente App

### Calidad de Código

#### Lint
```bash
npm run lint
```

#### Formatear con Prettier
```bash
npm run format
```

---

## 📐 Principios de Arquitectura

### Arquitectura Hexagonal (Backend)

El backend sigue el patrón de Arquitectura Hexagonal (Ports & Adapters):

#### Capa de Dominio (`src/domain/`)
- Lógica de negocio pura **SIN dependencias de frameworks**
- Entidades, value objects y reglas de negocio
- Interfaces de dominio (ports)

#### Capa de Aplicación (`src/application/`)
- Casos de uso y lógica de orquestación
- Definición de ports (interfaces abstractas)
- DTOs y respuestas a nivel de aplicación
- Conoce el dominio pero **NO** HTTP/DB/frameworks

#### Capa de Infraestructura (`src/infrastructure/`)
- Controllers HTTP y rutas
- Clientes de base de datos y repositorios
- Integraciones con servicios externos
- Código específico de frameworks (decoradores NestJS, módulos)
- Implementación de los ports

---

## 📦 Workspaces

Este proyecto usa **npm workspaces** para gestión de monorepo:

```json
{
  "workspaces": [
    "apps/web",
    "apps/api",
    "infra/cdk"
  ]
}
```

Ejecutar comandos en un workspace específico:
```bash
npm run <script> --workspace=apps/web
npm run <script> --workspace=apps/api
npm run <script> --workspace=infra/cdk
```

---

## ✅ Health Check

Una vez que la API esté corriendo, puedes probarla:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

---

## 📋 Feature: Monorepo Bootstrap

### Alcance Implementado

✅ **Configuración del Monorepo**
- npm workspaces configurado en el package.json raíz
- ESLint y Prettier configurados para todo el proyecto
- Scripts consolidados para desarrollo, build y testing

✅ **Frontend (`apps/web`)**
- React 18 con Vite como bundler
- Redux Toolkit configurado con store vacío
- TypeScript configurado
- Jest configurado para testing
- Componente App básico que muestra "App inicializada"
- Test smoke del componente App

✅ **Backend (`apps/api`)**
- NestJS con TypeScript
- Estructura hexagonal lista (carpetas domain, application, infrastructure)
- HealthController con endpoint `/health` para pruebas
- Jest configurado para testing
- Test smoke del HealthController

✅ **Infraestructura (`infra/cdk`)**
- AWS CDK configurado con TypeScript
- Stack vacío preparado para futuros recursos
- Comentarios indicando recursos a agregar en features futuros

### Fuera de Alcance (NO implementado)

❌ Base de datos (DynamoDB, etc.)
❌ Integraciones con proveedores de pago
❌ Funcionalidades de checkout
❌ Product page o catálogo
❌ Deploy real a AWS
❌ Lógica de negocio funcional
❌ Adapters de infraestructura reales

### Próximos Pasos

Los siguientes features agregarán:
- Integración con proveedores de pago
- Catálogo de productos
- Flujo de checkout
- Persistencia en base de datos
- Pipelines de deployment

---

## 📋 Feature: Product Page

### Qué hace

Muestra un producto con su stock en la UI, consumiendo un endpoint real del backend. Incluye un botón visible de pago sin lógica adicional.

### Endpoint

- `GET /products/:id`
- Respuesta 200:
```json
{
  "id": "product-1",
  "name": "Demo Product",
  "description": "Producto de ejemplo para pruebas locales",
  "price": 20000,
  "stock": 12
}
```
- Respuesta 404:
```json
{
  "message": "Product not found"
}
```

### Cómo probar local

1) Iniciar backend:
```bash
npm run dev:api
```
2) Probar endpoint:
```bash
curl http://localhost:3000/products/product-1
```
3) Iniciar frontend:
```bash
npm run dev:web
```
4) Abrir en el navegador `http://localhost:5173` y verificar:
- Se renderiza el producto
- Se ve el stock
- Se ve el botón "Pay with credit card"
5) Validar error (opcional):
```bash
curl http://localhost:3000/products/unknown
```

### Tests agregados y comandos

- Backend:
  - Unit test del caso de uso `GetProductByIdUseCase`
  - Test básico del `ProductsController`
  - Ejecutar: `npm run test --workspace=apps/api`
- Frontend:
  - Test unitario del reducer `productSlice`
  - Test de render de `ProductPage`
  - Ejecutar: `npm run test --workspace=apps/web`

---

## 🛠 Solución de problemas

### Puerto ya en uso
- **Frontend**: Cambiar `server.port` en [apps/web/vite.config.ts](apps/web/vite.config.ts)
- **Backend**: Cambiar la variable de entorno `PORT` al ejecutar `npm run dev:api`

### Dependencias no se instalan
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Tests fallan
```bash
# Asegurarse de estar en el directorio raíz
cd e:\Laboral\Wompi\fullstack-test-front-back-jsps
npm run test
```

---