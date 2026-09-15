# 📱 GamificaTFG - Cliente Frontend (React Native & Expo)

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Aplicación móvil y web desarrollada con **React Native**, **Expo Router** y **TypeScript**. Sirve como la interfaz de usuario interactiva para la plataforma gamificada de ejercicio físico.

---

## 🚀 Características del Cliente

- 📱 **Multiplataforma**: Funciona nativamente en iOS, Android y Navegadores Web.
- 🗺 **Navegación declarativa por archivos**: Uso de **Expo Router v6** con pestañas inferiores (*tabs*), modales y rutas dinámicas.
- 🎨 **Interfaz Responsiva y Personalizada**:
  - Modal global personalizado (`appAlert`) compatible con Web y Móvil para notificaciones y confirmaciones.
  - Reproducción integrada de vídeos instructivos de YouTube mediante iframe.
  - Animaciones y retroalimentación hática (*haptics*).
- 🔐 **Gestión de Sesión y Autenticación**: Almacenamiento seguro de tokens JWT con renovación automática (`apiClient` con interceptores Axios).

---

## 📁 Estructura del Frontend

```text
frontend/
├── app/                              # Rutas de Expo Router
│   ├── _layout.tsx                  # Layout raíz con proveedor de autenticación y modales
│   ├── login.tsx                    # Pantalla de inicio de sesión
│   ├── parental-dashboard.tsx       # Panel de control parental / supervisión
│   ├── routine-builder.tsx          # Creador y editor de rutinas personalizadas
│   ├── (tabs)/                      # Pestañas principales
│   │   ├── _layout.tsx              # Configuración de la barra de pestañas
│   │   ├── home.tsx                 # Pantalla principal (Avatar, Estado, Desafíos)
│   │   ├── routines.tsx             # Catálogo y selección de rutinas
│   │   ├── shop.tsx                 # Tienda virtual de atuendos e ítems
│   │   ├── inventory.tsx            # Inventario del avatar y equipamiento
│   │   ├── memorials.tsx            # Cromos educativos e informativos
│   │   └── profile.tsx              # Perfil de usuario y estadísticas
│   └── session/                     # Flujo de ejecución de ejercicio
│       ├── wellnessTest.tsx         # Test de bienestar inicial (Pre-entrenamiento)
│       ├── exercises/               # Guía paso a paso de ejercicios de la rutina
│       └── finalWellnessTest.tsx    # Test de bienestar final (Post-entrenamiento)
├── components/                      # Componentes UI reutilizables
│   ├── AvatarDisplay.tsx            # Renderizado gráfico del avatar
│   ├── CustomAlertModal.tsx         # Modal multiplataforma para alertas
│   ├── ItemCard.tsx                 # Card para objetos de la tienda
│   └── WellnessForm.tsx             # Formulario graduado de dolor/fatiga
├── services/                        # Capa de integración con la API REST
│   ├── apiClient.ts                 # Instancia Axios con interceptores
│   ├── authService.ts               # Autenticación y gestión de tokens
│   ├── sessionService.ts            # CRUD de sesiones y tests de bienestar
│   ├── shopService.ts               # Compras en tienda y gestión de FP
│   └── userService.ts               # Datos de usuario y avatar
├── types/                           # Declaraciones de tipos TypeScript
│   ├── user.ts                      # Interfaces de Usuario y Avatar
│   ├── session.ts                   # Interfaces de Sesiones y Bienestar
│   └── shop.ts                      # Interfaces de Items e Inventario
└── package.json
```

---

## ⚙️ Configuración del Entorno

Crea o edita el archivo `.env` en la raíz del directorio `frontend/`:

```env
# Dirección URL de la API REST Backend
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> ⚠️ **Nota para pruebas en móvil físico con Expo Go**:  
> Sustituye `localhost` por la IP privada de tu ordenador en la red local (ejemplo: `http://192.168.1.50:3000`).

---

## 🛠️ Comandos de Ejecución

Instalar dependencias:
```bash
npm install
```

### Ejecutar en Navegador Web
```bash
npm run web
```

### Ejecutar con Expo (Android / iOS / Expo Go)
```bash
# Iniciar servidor de desarrollo Expo
npx expo start

# Para conexiones a través de túnel seguro (si hay problemas de red)
npx expo start --tunnel
```

### Comprobar sintaxis y tipos
```bash
npm run lint
```
