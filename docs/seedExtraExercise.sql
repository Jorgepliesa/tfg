-- ── Equipment ──────────────────────────────────────────────
INSERT INTO public.equipment (name) VALUES
('Colchoneta'),
('Bandas elásticas'),
('Mancuernas ligeras'),
('Silla'),
('Bicicleta estática')
ON CONFLICT (name) DO NOTHING;

-- ── Muscle group ───────────────────────────────────────────
INSERT INTO public.muscle_group (name) VALUES
('Cuadriceps'),
('Core'),
('Bíceps'),
('Dorsal'),
('Pectoral'),
('Glúteos')
ON CONFLICT (name) DO NOTHING;

-- ── Audiovisual ────────────────────────────────────────────
INSERT INTO public.audiovisual (url) VALUES
('https://youtu.be/0e4251eQAE8?si=USOipFNxQ7SQQnWz'),
('https://youtu.be/u6hh6vOgXNI?si=hg7SfL1w_F-Ew55_'),
('https://youtu.be/oG5nZ0ykHhs?si=-3B3ea03VyDwEe33')
ON CONFLICT (url) DO NOTHING;

-- ── Measurement parameter ─────────────────────────────────
INSERT INTO public.measurement_parameter (name) VALUES
('Frecuencia cardiaca'),
('Percepción de esfuerzo (RPE)')
ON CONFLICT (name) DO NOTHING;

-- ── train (Exercise - MuscleGroup) ─────────────────────────
INSERT INTO public.train (exercise, muscle_group) VALUES
('Sentadilla con apoyo', 'Cuadriceps'),
('Sentadilla con apoyo', 'Glúteos'),
('Flexiones de pared', 'Pectoral'),
('Flexiones de pared', 'Bíceps'),
('Marcha en el sitio', 'Cuadriceps'),
('Equilibrio monopodal', 'Core'),
('Yoga del guerrero I', 'Cuadriceps'),
('Yoga del guerrero I', 'Core')
ON CONFLICT (exercise, muscle_group) DO NOTHING;

-- ── need (Exercise - Equipment) — la que te falla ─────────
INSERT INTO public.need (exercise, equipment) VALUES
('Bicicleta estática suave', 'Bicicleta estática'),
('Sentadilla con apoyo', 'Silla'),
('Estiramiento de isquiotibiales', 'Colchoneta'),
('Estiramiento de cuádriceps', 'Colchoneta')
ON CONFLICT (exercise, equipment) DO NOTHING;

-- ── contains (Exercise - Audiovisual) ──────────────────────
INSERT INTO public.contains (exercise, audiovisual) VALUES
('Marcha en el sitio', 'https://youtu.be/0e4251eQAE8?si=USOipFNxQ7SQQnWz'),
('Sentadilla con apoyo', 'https://youtu.be/u6hh6vOgXNI?si=hg7SfL1w_F-Ew55_'),
('Equilibrio monopodal', 'https://youtu.be/oG5nZ0ykHhs?si=-3B3ea03VyDwEe33')
ON CONFLICT (exercise, audiovisual) DO NOTHING;

-- ── use (Exercise - MeasurementParameter) ──────────────────
INSERT INTO public.use (exercise, measure_param) VALUES
('Bicicleta estática suave', 'Frecuencia cardiaca'),
('Marcha en el sitio', 'Frecuencia cardiaca'),
('Sentadilla con apoyo', 'Percepción de esfuerzo (RPE)')
ON CONFLICT (exercise, measure_param) DO NOTHING;