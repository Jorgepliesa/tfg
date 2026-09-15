-- =============================================================================
-- Rutinas del libro (Sección 7.5): "Fuerza y flexibilidad" y "Aeróbico y equilibrio"
-- Adaptadas al modelo de datos de Health Game (exercise / routine / plan)
-- + catálogo de grupo muscular, equipamiento, audiovisual y parámetros medidos
-- =============================================================================
-- NOTAS DE DISEÑO:
-- 1) category_type se usa como "fase" además de "tipo de entrenamiento":
--      calentamiento -> ejercicios de calentamiento (van primero)
--      aerobic / strength / flexibility / balance -> bloque principal
--      estiramiento -> vuelta a la calma / relajación (van al final)
--    El ORDER BY sobre una columna enum en Postgres respeta el orden de
--    declaración del tipo, por eso el PASO 0 inserta 'calentamiento' ANTES
--    de 'aerobic' y 'estiramiento' DESPUÉS de 'balance'.
-- 2) "duration" en `plan` son minutos totales del ejercicio (todas sus series);
--    "rest" es descanso en segundos entre series.
-- 3) No reutilizo "Marcha en el sitio" (ya existe con category='aerobic' y la
--    usan otras rutinas) para no cambiarle la categoría a algo compartido.
--    En su lugar creo ejercicios de calentamiento específicos para estas rutinas.
-- 4) Las URLs de `audiovisual` son PLACEHOLDER (no hay vídeos reales aún);
--    sustitúyelas por las URLs definitivas cuando las tengas.
-- 5) Los grupos musculares / equipamiento / parámetros son una propuesta
--    razonable basada en la descripción de cada ejercicio, ya que las tablas
--    estaban vacías en tu dump: revísalos y ajusta si no encajan con tu criterio.
-- 6) Los INSERT llevan ON CONFLICT DO NOTHING para poder ejecutar el script
--    varias veces sin error si ya insertaste algo.
-- =============================================================================

-- ============================= COMMIT AQUÍ ==================================
-- (ejecuta hasta esta línea en su propia transacción antes de continuar)
-- =============================================================================


BEGIN;

-- -----------------------------------------------------------------------------
-- 1) EJERCICIOS NUEVOS
-- -----------------------------------------------------------------------------
INSERT INTO public.exercise (name, description, category, difficulty) VALUES
  -- calentamiento (Sesión 1)
  ('Marcha o bicicleta de calentamiento',
   'Caminata ligera o bicicleta estática durante 3-5 minutos para activar el cuerpo.',
   'warmup', 'easy'),

  ('Movilidad articular suave',
   'Movimientos articulares suaves para preparar las articulaciones antes del ejercicio.',
   'warmup', 'easy'),

  -- Bloque de fuerza (Sesión 1)
  ('Flexiones de brazos modificadas',
   'Flexiones de brazos apoyando las rodillas en el suelo para reducir la carga sobre el tren superior.',
   'strength', 'medium'),

  ('Sentadilla de pared',
   'Sentadilla apoyando la espalda contra la pared, bajando y subiendo de forma controlada.',
   'strength', 'medium'),

  ('Elevación de talones',
   'Ponerse de puntillas y bajar de forma controlada para fortalecer los gemelos.',
   'strength', 'easy'),

  ('Plancha frontal',
   'Mantener la posición de plancha frontal apoyando antebrazos y pies, activando el core, durante 20-30 segundos.',
   'strength', 'medium'),

  ('Resistencia con bandas elásticas',
   'Ejercicios de resistencia con bandas elásticas para brazos y piernas.',
   'strength', 'medium'),

  -- Bloque de flexibilidad (Sesión 1, bloque de entrenamiento, NO vuelta a la calma)
  ('Estiramientos estáticos generales',
   'Estiramientos estáticos de brazos, piernas y espalda, manteniendo cada postura 20-30 segundos.',
   'flexibility', 'easy'),

  ('Yoga suave de relajación',
   'Posturas de yoga suaves para mejorar la flexibilidad y relajar el cuerpo.',
   'flexibility', 'easy'),

  -- Vuelta a la calma (Sesión 1)
  ('Caminata de vuelta a la calma',
   'Caminar o trotar suavemente para bajar progresivamente el ritmo cardíaco.',
   'stretching', 'easy'),

  ('Respiración profunda y relajación',
   'Ejercicios de respiración profunda y relajación para finalizar la sesión.',
   'stretching', 'easy'),

  -- warmup (Sesión 2)
  ('Marcha o baile de calentamiento',
   'Marcha en el sitio o baile suave durante 3-5 minutos para elevar la frecuencia cardíaca.',
   'warmup', 'easy'),

  ('Coordinación de rodillas y brazos',
   'Levantar las rodillas alternativamente y hacer círculos con los brazos para activar la coordinación.',
   'warmup', 'easy'),

  -- Bloque aeróbico (Sesión 2)
  ('Caminata rápida o trote ligero',
   'Caminata rápida o trote ligero de forma continua; alternativamente, bicicleta estática o elíptica.',
   'aerobic', 'medium'),

  -- Bloque de equilibrio y coordinación (Sesión 2)
  ('Pasos laterales con cambio de dirección',
   'Pasos laterales alternando la dirección para trabajar el equilibrio dinámico.',
   'balance', 'medium'),

  ('Levantamiento de piernas alternas con ojos cerrados',
   'Levantar una pierna de forma alterna manteniendo los ojos cerrados para desafiar el equilibrio.',
   'balance', 'medium'),

  -- Vuelta a la calma (Sesión 2)
  ('Caminata de enfriamiento cardiovascular',
   'Caminar lentamente para disminuir progresivamente la frecuencia cardíaca.',
   'stretching', 'easy'),

  ('Respiración profunda y estiramiento de relajación',
   'Ejercicios de respiración profunda y estiramientos suaves para relajar los músculos y reducir el estrés.',
   'stretching', 'easy')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2) RUTINAS NUEVAS
-- -----------------------------------------------------------------------------
INSERT INTO public.routine (name, category, difficulty) VALUES
  ('Fuerza y Flexibilidad Adolescente', 'strength', 'medium'),
  ('Aeróbico y Equilibrio Adolescente', 'aerobic', 'medium')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3) PLAN — Sesión 1: Fuerza y flexibilidad (~30 min)
-- -----------------------------------------------------------------------------
INSERT INTO public.plan (routine, exercise, num_reps, num_series, duration, rest) VALUES
  ('Fuerza y Flexibilidad Adolescente', 'Marcha o bicicleta de calentamiento',    1,  1, 3, 15),
  ('Fuerza y Flexibilidad Adolescente', 'Movilidad articular suave',              10, 1, 2, 15),
  ('Fuerza y Flexibilidad Adolescente', 'Flexiones de brazos modificadas',        10, 2, 4, 60),
  ('Fuerza y Flexibilidad Adolescente', 'Sentadilla de pared',                    12, 2, 4, 60),
  ('Fuerza y Flexibilidad Adolescente', 'Elevación de talones',                   12, 2, 3, 45),
  ('Fuerza y Flexibilidad Adolescente', 'Plancha frontal',                        1,  2, 1, 30),
  ('Fuerza y Flexibilidad Adolescente', 'Resistencia con bandas elásticas',       11, 2, 4, 60),
  ('Fuerza y Flexibilidad Adolescente', 'Estiramientos estáticos generales',      3,  1, 2, 20),
  ('Fuerza y Flexibilidad Adolescente', 'Yoga suave de relajación',               1,  1, 3, 15),
  ('Fuerza y Flexibilidad Adolescente', 'Caminata de vuelta a la calma',          1,  1, 3, 15),
  ('Fuerza y Flexibilidad Adolescente', 'Respiración profunda y relajación',      1,  1, 2, 0)
ON CONFLICT (routine, exercise) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4) PLAN — Sesión 2: Aeróbico y equilibrio (~30 min)
-- -----------------------------------------------------------------------------
INSERT INTO public.plan (routine, exercise, num_reps, num_series, duration, rest) VALUES
  ('Aeróbico y Equilibrio Adolescente', 'Marcha o baile de calentamiento',                      1,  1, 3,  15),
  ('Aeróbico y Equilibrio Adolescente', 'Coordinación de rodillas y brazos',                    10, 1, 2,  15),
  ('Aeróbico y Equilibrio Adolescente', 'Caminata rápida o trote ligero',                        1,  1, 15, 60),
  ('Aeróbico y Equilibrio Adolescente', 'Pasos laterales con cambio de dirección',               10, 2, 3,  30),
  ('Aeróbico y Equilibrio Adolescente', 'Levantamiento de piernas alternas con ojos cerrados',   10, 2, 2,  30),
  ('Aeróbico y Equilibrio Adolescente', 'Caminata de enfriamiento cardiovascular',               1,  1, 3,  15),
  ('Aeróbico y Equilibrio Adolescente', 'Respiración profunda y estiramiento de relajación',     1,  1, 2,  0)
ON CONFLICT (routine, exercise) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7) CONTENIDO AUDIOVISUAL (placeholder — sustituir por URLs reales)
-- -----------------------------------------------------------------------------
INSERT INTO public.audiovisual (url) VALUES
  ('https://youtube.com/shorts/TGCyPixSwzc?si=gAd5xAskQhtUNQHo'),
  ('https://youtu.be/im6DZ48Cy3A?si=9oEu5Ta-h-m_7FmH'),
  ('https://youtu.be/-qXuHrdmk4g?si=8YDZkR-665UVAZ3f'),
  ('https://youtu.be/xDrezw4UkoE?si=gna5PPD1oCRs7iII'),
  ('https://youtu.be/zRElVWcYx_M?si=8oeM4-iF5hQvTPMr'),
  ('https://youtu.be/z61K1daZydo?si=Ozq__MBbxtQBYsX3'),
  ('https://youtu.be/KmPDJDQgRXE?si=qcgxXqarF6nHUHWf'),
  ('https://youtu.be/qMzk83G5JgY?si=p2uC1UXrrgM1ADx3'),
  ('https://youtu.be/RBlNaHMQljs?si=lU4TMuQdx_fzfdQ8'),
  ('https://youtu.be/_lOpSbsm9y4?si=-bSU_LqFJpuRCpgx'),
  ('https://youtu.be/0e4251eQAE8?si=SOcuGmcLwtpaYu-a'),
  ('https://youtu.be/c9XUgbxjHQw?si=jjJmrxfl3NRTzX1Z'),
  ('https://youtu.be/Dsko_XBS9ng?si=tK4-39KSEDaNHJ6c'),
  ('https://youtu.be/j9GmDMiPL54?si=o3P-UeQghz5Uv0gv')
ON CONFLICT (url) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9) TRAIN — ejercicio ⇄ grupo muscular
-- -----------------------------------------------------------------------------
INSERT INTO public.train (exercise, muscle_group) VALUES
  ('Marcha o bicicleta de calentamiento', 'Cuádriceps'),
  ('Movilidad articular suave', 'Dorsal'),
  ('Flexiones de brazos modificadas', 'Pectoral'),
  ('Sentadilla de pared', 'Cuádriceps'),
  ('Sentadilla de pared', 'Glúteos'),
  ('Plancha frontal', 'Core'),
  ('Resistencia con bandas elásticas', 'Bíceps'),
  ('Resistencia con bandas elásticas', 'Cuádriceps'),
  ('Estiramientos estáticos generales', 'Dorsal'),
  ('Yoga suave de relajación', 'Dorsal'),
  ('Yoga suave de relajación', 'Core'),
  ('Caminata de vuelta a la calma', 'Cuádriceps'),
  ('Marcha o baile de calentamiento', 'Cuádriceps'),
  ('Coordinación de rodillas y brazos', 'Cuádriceps'),
  ('Caminata rápida o trote ligero', 'Cuádriceps'),
  ('Caminata rápida o trote ligero', 'Glúteos'),
  ('Pasos laterales con cambio de dirección', 'Glúteos'),
  ('Pasos laterales con cambio de dirección', 'Cuádriceps'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'Core'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'Glúteos'),
  ('Caminata de enfriamiento cardiovascular', 'Cuádriceps'),
  ('Respiración profunda y estiramiento de relajación', 'Dorsal')
ON CONFLICT (exercise, muscle_group) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10) NEED — ejercicio ⇄ equipamiento
-- -----------------------------------------------------------------------------
INSERT INTO public.need (exercise, equipment) VALUES
  ('Marcha o bicicleta de calentamiento', 'Bicicleta estática'),
  ('Flexiones de brazos modificadas', 'Colchoneta'),
  ('Plancha frontal', 'Colchoneta'),
  ('Resistencia con bandas elásticas', 'Bandas elásticas'),
  ('Estiramientos estáticos generales', 'Colchoneta'),
  ('Yoga suave de relajación', 'Colchoneta'),
  ('Caminata rápida o trote ligero', 'Bicicleta estática'),
  ('Respiración profunda y estiramiento de relajación', 'Colchoneta')
ON CONFLICT (exercise, equipment) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11) CONTAINS — ejercicio ⇄ audiovisual (1 vídeo por ejercicio)
-- -----------------------------------------------------------------------------
INSERT INTO public.contains (exercise, audiovisual) VALUES
  ('Movilidad articular suave', 'https://youtube.com/shorts/TGCyPixSwzc?si=gAd5xAskQhtUNQHo'),
  ('Flexiones de brazos modificadas', 'https://youtu.be/im6DZ48Cy3A?si=9oEu5Ta-h-m_7FmH'),
  ('Sentadilla de pared', 'https://youtu.be/-qXuHrdmk4g?si=8YDZkR-665UVAZ3f'),
  ('Elevación de talones', 'https://youtu.be/xDrezw4UkoE?si=gna5PPD1oCRs7iII'),
  ('Plancha frontal', 'https://youtu.be/zRElVWcYx_M?si=8oeM4-iF5hQvTPMr'),
  ('Resistencia con bandas elásticas', 'https://youtu.be/z61K1daZydo?si=Ozq__MBbxtQBYsX3'),
  ('Estiramientos estáticos generales', 'https://youtu.be/KmPDJDQgRXE?si=qcgxXqarF6nHUHWf'),
  ('Yoga suave de relajación', 'https://youtu.be/qMzk83G5JgY?si=p2uC1UXrrgM1ADx3'),
  ('Caminata de vuelta a la calma', 'https://youtu.be/RBlNaHMQljs?si=lU4TMuQdx_fzfdQ8'),
  ('Respiración profunda y relajación', 'https://youtu.be/_lOpSbsm9y4?si=-bSU_LqFJpuRCpgx'),
  ('Marcha o baile de calentamiento', 'https://youtu.be/0e4251eQAE8?si=SOcuGmcLwtpaYu-a'),
  ('Coordinación de rodillas y brazos', 'https://youtu.be/c9XUgbxjHQw?si=jjJmrxfl3NRTzX1Z'),
  ('Pasos laterales con cambio de dirección', 'https://youtu.be/Dsko_XBS9ng?si=tK4-39KSEDaNHJ6c'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'https://youtu.be/j9GmDMiPL54?si=o3P-UeQghz5Uv0gv')
ON CONFLICT (exercise, audiovisual) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12) USE — ejercicio ⇄ parámetro de medición
-- -----------------------------------------------------------------------------
INSERT INTO public.use (exercise, measure_param) VALUES
  ('Marcha o bicicleta de calentamiento', 'Frecuencia cardiaca'),
  ('Flexiones de brazos modificadas', 'VO2 Max'),
  ('Sentadilla de pared', 'VO2 Max'),
  ('Plancha frontal', 'VO2 Max'),
  ('Resistencia con bandas elásticas', 'VO2 Max'),
  ('Yoga suave de relajación', 'Sp02'),
  ('Caminata de vuelta a la calma', 'Frecuencia cardiaca'),
  ('Respiración profunda y relajación', 'Sp02'),
  ('Marcha o baile de calentamiento', 'Frecuencia cardiaca'),
  ('Caminata rápida o trote ligero', 'Frecuencia cardiaca'),
  ('Caminata de enfriamiento cardiovascular', 'Frecuencia cardiaca'),
  ('Respiración profunda y estiramiento de relajación', 'Sp02')
ON CONFLICT (exercise, measure_param) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13) CONTRAINDICATION (catálogo) + RESTRICTS — ejercicio ⇄ contraindicación
-- Criterio: solo se marca la/las contraindicación(es) DOMINANTE(s) de cada
-- ejercicio (máx. 1-2), no todo lo remotamente relacionado. Los ejercicios de
-- estiramiento/relajación/yoga suave quedan sin restricciones (son la opción
-- "segura" de la sesión, coherente con el diseño del libro).
-- -----------------------------------------------------------------------------

INSERT INTO public.restricts (exercise, contraindication) VALUES
  -- calentamiento (Sesión 1)
  ('Marcha o bicicleta de calentamiento', 'lower_limb'),
  ('Marcha o bicicleta de calentamiento', 'cardiotoxicity_severe'),
  ('Movilidad articular suave', 'upper_limb'),

  -- Bloque de fuerza (Sesión 1) — carga articular / peso corporal
  ('Flexiones de brazos modificadas', 'upper_limb'),
  ('Flexiones de brazos modificadas', 'osteoporosis_severe'),
  ('Sentadilla de pared', 'lower_limb'),
  ('Sentadilla de pared', 'osteoporosis_severe'),
  ('Elevación de talones', 'lower_limb'),
  ('Elevación de talones', 'neuropathy'),
  ('Plancha frontal', 'upper_limb'),
  ('Resistencia con bandas elásticas', 'upper_limb'),
  ('Resistencia con bandas elásticas', 'lower_limb'),

  -- Bloque de flexibilidad (Sesión 1): estiramientos y yoga suave -> sin restricciones

  -- Vuelta a la calma (Sesión 1)
  ('Caminata de vuelta a la calma', 'lower_limb'),
  -- Respiración profunda y relajación -> sin restricciones

  -- calentamiento (Sesión 2)
  ('Marcha o baile de calentamiento', 'hearing'),
  ('Marcha o baile de calentamiento', 'cardiotoxicity_severe'),
  ('Coordinación de rodillas y brazos', 'balance'),
  ('Coordinación de rodillas y brazos', 'vision'),

  -- Bloque aeróbico (Sesión 2)
  ('Caminata rápida o trote ligero', 'lower_limb'),
  ('Caminata rápida o trote ligero', 'cardiotoxicity_severe'),

  -- Bloque de equilibrio y coordinación (Sesión 2) — el de más riesgo de caída
  ('Pasos laterales con cambio de dirección', 'balance'),
  ('Pasos laterales con cambio de dirección', 'neuropathy'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'balance'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'vision'),
  ('Levantamiento de piernas alternas con ojos cerrados', 'neuropathy'),

  -- Vuelta a la calma (Sesión 2)
  ('Caminata de enfriamiento cardiovascular', 'lower_limb')
  -- Respiración profunda y estiramiento de relajación -> sin restricciones
ON CONFLICT (exercise, contraindication) DO NOTHING;

COMMIT;
