# 🏋️‍♂️ GamificaTFG - Plataforma Gamificada de Promoción del Ejercicio Físico y Salud

[![React Native](https://img.shields.io/badge/React_Native-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **Trabajo de Fin de Grado (TFG)**
> Aplicación multiplataforma (Web y Móvil) para fomentar la adherencia al ejercicio físico mediante dinámicas de gamificación, evaluación del bienestar y supervisión tutelada.

---

## 📋 Tabla de Contenidos

1. [Acerca del Proyecto](#-acerca-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Stack Tecnológico](#-stack-tecnológico)
5. [Requisitos Previos](#-requisitos-previos)
6. [Guía de Instalación y Despliegue](#-guía-de-instalación-y-despliegue)
7. [Estructura del Proyecto](#-estructura-del-proyecto)
8. [Créditos y Licencia](#-créditos-y-licencia)

---

## 🎯 Acerca del Proyecto

**GamificaTFG** es una solución tecnológica integral orientada a incentivar el hábito de realizar actividad física regular. Combina mecánicas de videojuegos (puntos de experiencia/FP, avatares personalizables, tienda virtual, cromos educativos y retos comunitarios) con un riguroso seguimiento del estado de salud y bienestar de los usuarios a través de cuestionarios pre y post entrenamiento. Además, incluye un panel parental de administración para tutores y supervisores.

---

## ✨ Características Principales

- 🏋️ **Gestión y Ejecución de Rutinas**: Catálogo de rutinas deportivas (calentamiento, cardio, fuerza, estiramientos) guiadas mediante vídeos integrados de YouTube y temporización en tiempo real.
- 🧘 **Evaluación de Bienestar (Pre/Post)**: Test de valoración de dolor corporal, somnolencia, fatiga y estado de ánimo antes y después de cada sesión de ejercicios.
- 🎨 **Gamificación & Personalización**:
  - **Puntos de Fitness (FP)** obtenidos al completar sesiones de entrenamiento.
  - **Tienda Virtual**: Compra de atuendos, accesorios e ítems para el avatar.
  - **Inventario**: Equipamiento y personalización visual del avatar.
  - **Cromos Educativos / Memoriales**: Desbloqueo de elementos pedagógicos sobre hábitos saludables.
- 🤝 **Desafíos Cooperativos**: Retos comunitarios de pasos diarios en los que los usuarios suman fuerzas para alcanzar metas globales.
- 👨‍👩‍👧 **Panel Parental / Tutor**: Control de tiempos de uso, monitoreo de sesiones finalizadas y gestión de parámetros de cuenta para tutores.

---

## 🛠 Stack Tecnológico

### **Frontend / Cliente**
- **Framework**: [React Native](https://reactnative.dev/) con [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
- **Web Support**: React Native Web.
- **UI & Iconos**: Lucide React Native, Expo Vector Icons, Modal personalizado Multiplataforma.
- **Comunicación HTTP**: Axios con interceptores de autenticación y renovación de tokens.

### **Backend / API**
- **Framework**: [NestJS](https://nestjs.com/) (Node.js).
- **ORM**: [TypeORM](https://typeorm.io/) con PostgreSQL.
- **Autenticación**: JWT (JSON Web Tokens) & bcrypt.
- **Validación y DTOs**: `class-validator` y `class-transformer`.

### **Infraestructura y Datos**
- **Base de Datos**: PostgreSQL 16 alojado en un contenedor Docker.
- **Contenerización**: Docker & Docker Compose.

---

## 📦 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno de desarrollo:

- [Node.js](https://nodejs.org/) (v18.x o superior)
- [npm](https://www.npmjs.com/) (v9.x o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- App de **Expo Go** en tu dispositivo móvil (opcional para pruebas en celular)

---

## 🚀 Guía de Instalación y Despliegue

Sigue estos pasos para poner en marcha el proyecto completo localmente.

### 1️⃣ Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd tfg
```

### 2️⃣ Iniciar la Base de Datos PostgreSQL (Docker)
```bash
# Iniciar contenedor de PostgreSQL en segundo plano
docker compose up -d

# Para reiniciar la base de datos desde cero si es necesario:
# docker compose down -v && docker compose up -d
```

### 3️⃣ Iniciar el Backend (NestJS API)
Navega a la carpeta `backend/` e instala las dependencias:
```bash
cd backend
npm install
```

Configura tu archivo de variables de entorno `.env` en `backend/` (o revisa el predeterminado):
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/tfg_db
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
```

Genera y puebla la base de datos con datos de prueba/semillas:
```bash
# Cargar datos de prueba sintéticos (usuarios, avatares, rutinas, items)
npm run seed:synthetic
```

Levanta la API REST en modo desarrollo:
```bash
npm run start:dev
```
La API estará disponible en: `http://localhost:3000`

### 4️⃣ Iniciar el Frontend (Expo Router)
En otra terminal, navega a la carpeta `frontend/`:
```bash
cd frontend
npm install
```

Asegúrate de que el `.env` en `frontend/` apunte a la IP de tu servidor backend:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```
> *(Nota: Si estás probando en dispositivo físico a través de red local, usa la IP local de tu ordenador, por ejemplo `http://192.168.1.X:3000`)*.

Ejecuta el cliente según la plataforma elegida:
```bash
# En Navegador Web
npm run web

# En Emulador Android
npm run android

# Servidor Expo general (QR para Expo Go)
npx expo start
```

---

## 📁 Estructura del Proyecto

```text
tfg/
├── README.md                 # Documentación principal del proyecto
├── docker-compose.yml        # Configuración del contenedor PostgreSQL
├── docs/                     # Scripts SQL de semillas y recursos adicionales
│   └── seed_rutinas_libro.sql
├── backend/                  # Servidor API NestJS
│   ├── src/
│   │   ├── auth/             # Módulo de autenticación (JWT, Login)
│   │   ├── user/             # Gestión de Usuarios y Avatares
│   │   ├── session/          # Sesiones de ejercicio y cuestionarios bienestar
│   │   ├── shop/             # Tienda virtual e inventario de ítems
│   │   ├── steps/            # Contador de pasos diarios
│   │   ├── challenge/        # Desafíos cooperativos comunitarios
│   │   └── main.ts           # Punto de entrada de NestJS
│   └── README.md             # Documentación específica del Backend
└── frontend/                 # Aplicación cliente React Native / Expo
    ├── app/                  # Sistema de rutas basado en archivos (Expo Router)
    │   ├── (tabs)/           # Navegación principal por pestañas (Home, Tienda, Rutinas, Perfil)
    │   ├── session/          # Pantallas de sesión activa y test de bienestar
    │   └── parental-dashboard.tsx # Panel de control parental
    ├── components/           # Componentes reutilizables UI (Modales, Cards, Avatares)
    ├── services/             # Servicios HTTP de conexión con el Backend
    └── README.md             # Documentación específica del Frontend
```

---

## 📜 Créditos y Licencia

Este proyecto ha sido desarrollado como **Trabajo de Fin de Grado (TFG)** universitario. Todos los derechos reservados.
