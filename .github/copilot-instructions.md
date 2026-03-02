LEER_AL_INICIO: Sí

Instrucciones de contexto para nuevas conversaciones — Proyecto Health-Game Pediátrico

Resumen (qué soy/léeme al iniciar la conversación):
- Lee este archivo al empezar cada chat. Está escrito en español y resume el dominio, el stack y las reglas de negocio más importantes.

Contexto del proyecto (TFG):
- Trabajo de Fin de Grado que desarrolla una aplicación "Phygital" para fomentar la actividad física en niños de 5-12 años supervivientes de cáncer.
- Objetivo de negocio: promover ejercicio físico mediante gamificación, personalización de avatares, retos cooperativos y educación sobre el cuerpo humano y el cáncer.
- Flujo principal: el niño inicia sesión → ve su avatar personalizable en pantalla inicial → elige rutina de ejercicios → completa 2 cuestionarios de bienestar (antes/después) → obtiene puntos de esfuerzo (FP) → gasta FP en tienda para personalizar avatar → desbloquea cromos educativos (Memorial) al cumplir objetivos.
- Este proyecto se alinea con la estrategia de salud digital propuesta por ecosistemas como PILLAR y MAGENT, centrados en el seguimiento a largo plazo de supervivientes de cáncer pediátrico. Mientras que estas plataformas gestionan el historial clínico y los riesgos tardíos, la presente aplicación cubre el 'gap' de la adherencia diaria, utilizando la gamificación para capturar datos de actividad física y bienestar que pueden ser integrados en dichos sistemas mediante estándares de interoperabilidad como OMOP CDM.

Metodología y herramientas:
- Desarrollo Ágil e Iterativo con desarrollo paralelo de frontend y backend.
- Frontend: React Native + Expo (app híbrida multiplataforma iOS/Android).
- Backend: Node.js + NestJS.
- BBDD: PostgreSQL existente con modelo OMOP extendido y TimeScaleDB.
- Estudio del Arte inicial de aplicaciones existentes para benchmarking.
- Integración con sistemas MAGENT y PILLAR. 
- La base de datos está mapeada a OMOP CDM para asegurar la interoperabilidad.
- Uso de Swagger para documentación de API y Postman para pruebas.

Cronograma (fases del TFG):
- Fase I: Estudio del arte y trabajos relacionados.
- Fase II: Análisis, diseño y preparación de datos (modelo de gamificación, extensión OMOP para rutinas).
- Fase III: Implementación del backend (API NestJS, conexión PostgreSQL, lógica de juego) y frontend (app móvil + panel de supervisión).
- Fase IV: Validación End-to-End del flujo completo.
- Fase V: Redacción y documentación final.

Stack y tecnologías (asumir por defecto si no indicado):
- Backend: NestJS + TypeORM (Node.js)
- Frontend: React Native (mobile)
- BBDD: PostgreSQL (preferido). Usar TIMESTAMP para eventos y DATE para agregados diarios, salvo indicación contraria.

Entidades y reglas clave (resumen accionable):
- User vs Avatar: User = cuenta (password, streak), Avatar = progreso/juego (FP). No mezclar responsabilidades.
- FP (Effort Points): siempre >= 0. Actualizaciones del FP deben realizarse en transacciones con los registros de Reward/XP.
- Steps: clave primaria compuesta (date, user). Un único registro por usuario y día.
- Session: identificada por (date TIMESTAMP, user) o preferible un id numérico; cada sesión tiene exactamente 2 Wellness_test (initial, final).
- Wellness_test: entidad débil dependiente de Session. Identificar test por (session_date, session_user, test_type) o con id autonum + FK a Session.
- Tienda/keep: Item = catálogo; keep (item, avatar) controla inventario y is_wearing; solo 1 item por type puede estar equipado a la vez (enforce en la lógica/constraints).
- Coop_challenge: total_steps es el objetivo; sum_steps es atributo calculado (usar vista o cálculo on-demand). Validar CHECKs (total_steps >= 0) y rango de fechas.
- Variables en camelCase

Validaciones y constraints (prácticas obligatorias):
- Usa NOT NULL para columnas obligatorias; usa CHECK para rangos (ej. pain, mood, fatigue: 1-5).
- Prefiere claves compuestas naturales para relaciones temporales (ej: @PrimaryColumn en TypeORM para composite keys).
- Para atributos calculados, preferir VISTAS o columnas generadas según el SGBD; evitar redundancia salvo que haya razones de rendimiento y sincronización (entonces usar triggers/transacciones).

Modelado de Wellness_test (regla práctica):
- Opción simple y recomendada: en `Wellness_test` usar (session_date TIMESTAMP, session_user NUMBER, test_type ENUM('initial','final')) como PK y FK a Session(date,user). Esto garantiza 0/1 initial y 0/1 final por sesión.
- Alternativa: dar a Session un id autonumérico y en Wellness_test usar session_id como FK y PK parcial; Session contiene initial_test_id y final_test_id si se quiere navegación directa 1:1.

Decisiones preferidas por defecto (si falta especificación):
- Prefiere TIMESTAMP para eventos (sessions, tests), DATE para agregados diarios (steps).
- Prefiere id autonumérico solo cuando la clave natural sea torpe; las claves compuestas son válidas y se usan en este proyecto.
- Evita usar CHECK redundantes para NOT NULL; usa NOT NULL.

Generación de código (cuando te pidan crear servicios/entidades):
- Incluir DTOs y validaciones (rango 1-5, >=0 donde corresponda).
- Incluir transacciones al mutar FP y crear rewards.
- Al crear endpoints/servicios, validar reglas clínicas mínimas (ej.: si pain alto bloquear/exigir alerta antes de permitir ejercicios).
- Escribir tests unitarios mínimo: happy path + 1 edge case (p. ej. pain elevado / steps repetidos).

Estilo y formato:
- Escribe el SQL con tipos Postgres por defecto (TIMESTAMP, INTEGER, BOOLEAN, TEXT, VARCHAR).
- Mantén nombres en CamelCase o snake_case de forma consistente según el fichero existente (usar la convención ya presente en el repo).

Notas operativas y de usabilidad:
- UI móvil: botones con área de pulsación mínima 44x44dp.
- La clave primaria de `Steps` debe ser (date, user) — un registro por usuario/día.
- Para `Coop_challenge.sum_steps` usar vista o cálculo bajo demanda; si se almacena, actualizar con triggers/transactions.

Si algo está poco especificado, aplicar estas 2 asunciones por defecto:
1) BBDD: PostgreSQL. 2) Usar TIMESTAMP para eventos donde se necesite hora, DATE cuando sea solo día.

Si necesitas que ajuste estas instrucciones (idioma, nivel de detalle, formatos de salida), indica exactamente qué cambiar y lo aplicaré.

-- Fin de instrucciones resumidas --