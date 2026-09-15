# ⚙️ GamificaTFG - API Backend (NestJS & TypeORM)

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Servidor API REST desarrollado con **NestJS**, **TypeORM** y **PostgreSQL**. Gestiona la autenticación, la lógica de negocio de la gamificación (puntos FP, avatares, tienda), las sesiones de ejercicio y los cuestionarios de bienestar.

---

## ⚡️ Módulos y Arquitectura

El backend está estructurado en módulos NestJS independientes y desacoplados:

- 🔑 **Auth Module (`/auth`)**: Registro, inicio de sesión y emisión de tokens JWT. Estrategia de autenticación Passport JWT.
- 👤 **User Module (`/user`)**: Gestión del perfil de usuario, avatares y puntos de experiencia/FP.
- 🏋️ **Session Module (`/session`)**: Registro de sesiones de entrenamiento y transacciones de cuestionarios de bienestar (Pre y Post).
- 🛍 **Shop Module (`/shop`)**: Catálogo de ítems (atuendos/accesorios), verificación de saldo de FP y compra/equipamiento de ítems.
- 👣 **Steps Module (`/steps`)**: Seguimiento de pasos diarios por usuario.
- 🏆 **Challenge Module (`/challenge`)**: Desafíos cooperativos comunitarios basados en la suma agregada de pasos de todos los usuarios.

---

## 📁 Estructura del Backend

```text
backend/
├── src/
│   ├── auth/                         # Módulo de Autenticación
│   │   ├── auth.controller.ts        # Endpoints /auth/login, /auth/refresh
│   │   ├── auth.service.ts           # Verificación de credenciales y firma JWT
│   │   └── jwt.strategy.ts           # Estrategia de validación de tokens
│   ├── user/                         # Módulo de Usuarios
│   │   ├── entities/                 # Entidades User y Avatar
│   │   ├── user.controller.ts        # Endpoints de consulta y actualización de usuario
│   │   └── user.service.ts           # Lógica de negocio de usuarios y avatares
│   ├── session/                      # Módulo de Sesiones de Ejercicio
│   │   ├── entities/                 # Entidades Session y WellnessTest
│   │   ├── session.controller.ts     # Endpoints para iniciar y guardar sesiones
│   │   └── session.service.ts        # Procesamiento transaccional de bienestar
│   ├── shop/                         # Módulo de Tienda e Inventario
│   │   ├── entities/                 # Entidades Item y Keep (pertenencia de ítems)
│   │   ├── shop.controller.ts        # Endpoints para obtener items y comprar
│   │   └── shop.service.ts           # Validación de saldo FP y deducción
│   ├── steps/                        # Módulo de Registro de Pasos
│   ├── challenge/                    # Módulo de Retos Cooperativos
│   ├── scripts/                      # Scripts de inicialización y semillas
│   │   ├── seed-users.ts             # Semilla de usuarios iniciales
│   │   └── seed-synthetic-data.ts    # Carga masiva de datos sintéticos de prueba
│   └── main.ts                       # Punto de entrada de la aplicación NestJS
├── .env                              # Variables de entorno
├── package.json
└── tsconfig.json
```

---

## ⚙️ Configuración del Entorno

Crea un archivo `.env` en el directorio `backend/`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/tfg_db
JWT_SECRET=secreto_super_seguro_para_tfg
JWT_EXPIRES_IN=7d
```

---

## 🚀 Guía de Uso y Scripts

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Poblar la base de datos (Seeds)
Para cargar usuarios de prueba, avatares, ítems de la tienda y rutinas:
```bash
# Poblar con datos sintéticos completos para pruebas
npm run seed:synthetic

# Si deseas limpiar y re-poblar los datos sintéticos:
npm run seed:synthetic:clean
```

### 3️⃣ Iniciar el Servidor de Desarrollo
```bash
npm run start:dev
```
La API estará escuchando en `http://localhost:3000`.

---

## 🧪 Pruebas y Benchmarks

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas e2e
npm run test:e2e

# Cobertura de pruebas
npm run test:cov

# Ejecutar pruebas de carga/benchmark con Autocannon
npm run benchmark
```
