Para levantar el docker: docker compose up -d (y tener iniciado docker desktop antes iniciado)

Para borrar todo y empezar de cero: docker compose down -v. Resetea

Para pararlo simplemente: docker compose down y sudo systemctl stop docker
(aunque este ultimo no hace falta)

EN OTRA TERMINAL
en cd backend
npm run start:dev

To run your project, navigate to the directory and run one of the following npm commands.

en cd frontend

- npm run android
- npm run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
- npm run web
o en general npx expo start


App de ejemplo
app/
├── (tabs)/           # Rutas con tabs de navegación
│   ├── index.tsx     # Pantalla principal → ruta: "/"
│   └── profile.tsx   # Ejemplo → ruta: "/profile"
├── modal.tsx         # Pantalla modal → ruta: "/modal"
└── _layout.tsx       # Layout raíz (configura navegación)

frontend/
├── .env                           # Variables de entorno (API_URL)
├── app/
│   ├── _layout.tsx               # ✅ NUEVO: Layout raíz con protección de rutas
│   ├── login.tsx                 # ✅ NUEVO: Pantalla de login
│   ├── (tabs)/                   # Rutas protegidas (requieren autenticación)
│   │   ├── _layout.tsx           # Layout de tabs
│   │   ├── index.tsx             # Pantalla inicial con avatar
│   │   ├── profile.tsx           # Perfil del usuario
│   │   ├── shop.tsx              # Tienda (gastar FP en items)
│   │   ├── routines.tsx          # Selección de rutinas
│   │   └── memorials.tsx         # Cromos educativos desbloqueados
│   ├── session/
│   │   ├── [id].tsx              # Pantalla de sesión activa
│   │   ├── wellness-initial.tsx  # Cuestionario bienestar inicial
│   │   └── wellness-final.tsx    # Cuestionario bienestar final
│   └── modal.tsx                 # Modales generales
├── components/
│   ├── ThemedView.tsx
│   ├── ThemedText.tsx
│   ├── AvatarDisplay.tsx         # ✅ NUEVO: Mostrar avatar personalizable
│   ├── ItemCard.tsx              # ✅ NUEVO: Card para items de tienda
│   └── WellnessForm.tsx          # ✅ NUEVO: Formulario bienestar (1-5 scale)
├── services/
│   ├── authService.ts            # ✅ NUEVO: Login, logout, refresh tokens
│   ├── userService.ts            # ✅ NUEVO: Gestión de User/Avatar
│   ├── sessionService.ts         # ✅ NUEVO: CRUD sesiones + wellness tests
│   ├── shopService.ts            # ✅ NUEVO: Obtener items, comprar (descontar FP)
│   └── apiClient.ts              # ✅ NUEVO: Cliente HTTP con interceptor para refresh token
└── types/
    ├── user.ts                   # ✅ NUEVO: Tipos User, Avatar
    ├── session.ts                # ✅ NUEVO: Tipos Session, WellnessTest
    └── shop.ts                   # ✅ NUEVO: Tipos Item, Keep


backend/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    # ✅ NUEVO: POST /auth/login, /auth/refresh
│   │   ├── auth.service.ts       # ✅ NUEVO: Validar user, generar tokens JWT
│   │   ├── jwt.strategy.ts       # ✅ NUEVO: Estrategia Passport JWT
│   │   └── dto/
│   │       └── login.dto.ts      # ✅ NUEVO: Validación username/password
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts    # GET /users/me, PATCH /users/:id
│   │   ├── user.service.ts       # Lógica CRUD User
│   │   └── entities/
│   │       ├── user.entity.ts    # User (id, username, password, streak)
│   │       └── avatar.entity.ts  # Avatar (id, avatar_name, FP, user FK)
│   ├── session/
│   │   ├── session.module.ts
│   │   ├── session.controller.ts # POST /sessions, GET /sessions/:id
│   │   ├── session.service.ts    # Crear sesión con 2 wellness tests (transacción)
│   │   └── entities/
│   │       ├── session.entity.ts         # Session (id, date TIMESTAMP, user FK)
│   │       └── wellness-test.entity.ts   # WellnessTest (session FK, test_type, pain, mood, fatigue, sleepiness)
│   ├── shop/
│   │   ├── shop.module.ts
│   │   ├── shop.controller.ts    # GET /shop/items, POST /shop/buy
│   │   ├── shop.service.ts       # Validar FP >= price, descontar FP (transacción)
│   │   └── entities/
│   │       ├── item.entity.ts    # Item (name PK, type, price, is_premium)
│   │       └── keep.entity.ts    # Keep (item FK, avatar FK, is_wearing BOOLEAN)
│   ├── steps/
│   │   ├── steps.module.ts
│   │   ├── steps.controller.ts   # POST /steps, GET /steps/daily
│   │   ├── steps.service.ts      # Validar (date, user) única por día
│   │   └── entities/
│   │       └── steps.entity.ts   # Steps (date DATE, user FK, num_steps, is_reached)
│   ├── challenge/
│   │   ├── challenge.module.ts
│   │   ├── challenge.controller.ts # GET /challenges, POST /challenges/:name/complete
│   │   ├── challenge.service.ts    # Calcular sum_steps (vista o query), actualizar total_steps
│   │   └── entities/
│   │       ├── coop-challenge.entity.ts # CoopChallenge (name PK, start_date, end_date, total_steps)
│   │       └── complete.entity.ts       # Complete (challenge FK, avatar FK, contributed_steps)
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts # ✅ NUEVO: Guard para proteger rutas
│   │   ├── interceptors/
│   │   │   └── transaction.interceptor.ts # ✅ NUEVO: Gestionar transacciones automáticas
│   │   └── decorators/
│   │       └── current-user.decorator.ts  # ✅ NUEVO: Obtener user desde JWT
│   └── main.ts
├── .env                           # DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
└── package.json