INSERT INTO omop_modified.person
  (person_id, gender_concept_id, year_of_birth, race_concept_id, ethnicity_concept_id)
SELECT
  cp.id, 8532, 2016, 8527, 8657
FROM public.user_account ua
JOIN public.clinical_profile cp ON cp.id = ua.clinical_profile
WHERE ua.id = 821011
ON CONFLICT (person_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 3) Mediciones de frecuencia cardiaca para las últimas 5 sesiones
--    del usuario (cada sesión con 10 lecturas cada 2 minutos)
-- ────────────────────────────────────────────────────────────────
WITH target AS (
  SELECT cp.id AS person_id
  FROM public.user_account ua
  JOIN public.clinical_profile cp ON cp.id = ua.clinical_profile
  WHERE ua.id = 821011
),
sessions AS (
  SELECT date AS session_date
  FROM public.session
  WHERE user_id = 821011
  ORDER BY date DESC
  LIMIT 5
)
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   range_low, range_high, measurement_source_value, unit_source_value)
SELECT
  target.person_id,
  3027018,
  sessions.session_date::date,
  sessions.session_date + (n * 2 || ' minutes')::interval,
  705183,
  70 + floor(random() * 50)::int,   -- FC entre 70 y 120 bpm
  4118124,
  60, 140,
  'heart rate',
  'beats/min'
FROM target, sessions, generate_series(0, 9) AS n;