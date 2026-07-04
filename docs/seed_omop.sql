-- ── 1. Vocabularios ─────────────────────────────────────────────
INSERT INTO omop_cdm.vocabulary
  (vocabulary_id, vocabulary_name, vocabulary_reference,
   vocabulary_version, vocabulary_concept_id)
VALUES
  ('LOINC',  'LOINC',          'https://loinc.org', '2.76', 0),
  ('UCUM',   'UCUM',           'https://unitsofmeasure.org', '2.0', 0),
  ('OMOP',   'OMOP Vocabulary', 'https://ohdsi.org', '5.0', 0)
ON CONFLICT (vocabulary_id) DO NOTHING;

-- ── 2. Dominios ─────────────────────────────────────────────────
INSERT INTO omop_cdm.domain
  (domain_id, domain_name, domain_concept_id)
VALUES
  ('Measurement', 'Measurement', 0),
  ('Observation', 'Observation', 0),
  ('Unit',        'Unit',        0),
  ('Type Concept','Type Concept',0)
ON CONFLICT (domain_id) DO NOTHING;

-- ── 3. Clases de concepto ────────────────────────────────────────
INSERT INTO omop_cdm.concept_class
  (concept_class_id, concept_class_name, concept_class_concept_id)
VALUES
  ('Clinical Observation', 'Clinical Observation', 0),
  ('Meas Type',            'Meas Type',            0),
  ('Unit',                 'Unit',                 0)
ON CONFLICT (concept_class_id) DO NOTHING;

-- ── 4. Conceptos ────────────────────────────────────────────────
INSERT INTO omop_cdm.concept
  (concept_id, concept_name, domain_id, vocabulary_id,
   concept_class_id, standard_concept, concept_code,
   valid_start_date, valid_end_date)
VALUES
  (3027018,  'Heart rate',                                    'Measurement', 'LOINC', 'Clinical Observation', 'S', '8867-4',    '1970-01-01', '2099-12-31'),
  (40758552, 'Number of steps in unspecified time pedometer', 'Measurement', 'LOINC', 'Clinical Observation', 'S', '55423-8',   '1970-01-01', '2099-12-31'),
  (3024171,  'Respiratory rate',                              'Measurement', 'LOINC', 'Clinical Observation', 'S', '9279-1',    '1970-01-01', '2099-12-31'),
  (40762499, 'Oxygen saturation in arterial blood',           'Measurement', 'LOINC', 'Clinical Observation', 'S', '59408-5',   '1970-01-01', '2099-12-31'),
  (1002368,  'Sleep duration',                                'Observation', 'LOINC', 'Clinical Observation', 'S', '93832-4',   '1970-01-01', '2099-12-31'),
  (705183,   'Wearable sensor',                               'Type Concept','OMOP',  'Meas Type',            'S', 'OMOP4976890','1970-01-01','2099-12-31'),
  (4118124,  'beats/min',                                     'Unit',        'UCUM',  'Unit',                 'S', '/min',       '1970-01-01', '2099-12-31'),
  (4117833,  'breaths/min',                                   'Unit',        'UCUM',  'Unit',                 'S', '/min',       '1970-01-01', '2099-12-31'),
  (4190629,  'percentage unit',                               'Unit',        'UCUM',  'Unit',                 'S', '%',          '1970-01-01', '2099-12-31'),
  (8550,     'min',                                           'Unit',        'UCUM',  'Unit',                 'S', 'min',        '1970-01-01', '2099-12-31'),
  (8532,     'FEMALE',                                        'Type Concept','OMOP',  'Clinical Observation', 'S', 'F',          '1970-01-01', '2099-12-31'),
  (8507,     'MALE',                                          'Type Concept','OMOP',  'Clinical Observation', 'S', 'M',          '1970-01-01', '2099-12-31'),
  (8527,     'White',                                         'Type Concept','OMOP',  'Clinical Observation', 'S', 'W',          '1970-01-01', '2099-12-31'),
  (8657,     'Not Hispanic',                                  'Type Concept','OMOP',  'Clinical Observation', 'S', 'NH',         '1970-01-01', '2099-12-31')
ON CONFLICT (concept_id) DO NOTHING;

-- ── 5. Persona ──────────────────────────────────────────────────
INSERT INTO omop_modified.person
  (person_id, gender_concept_id, year_of_birth, race_concept_id, ethnicity_concept_id)
VALUES (1, 8532, 2016, 8527, 8657)
ON CONFLICT (person_id) DO NOTHING;

-- ── 6. Info persona ─────────────────────────────────────────────
INSERT INTO custom.person_info (person_id, email, name)
VALUES (1, 'paciente_ejemplo@oncobat.es', 'Paciente Demo')
ON CONFLICT (person_id) DO NOTHING;

-- ── 7. Dispositivo ───────────────────────────────────────────────
INSERT INTO custom.device (device_id, manufacturer, model)
VALUES ('00000000-0000-0000-0000-000000000001', 'Garmin', 'Venu Sq2')
ON CONFLICT (device_id) DO NOTHING;

INSERT INTO custom.user_device (user_id, device_id, last_sync_date)
VALUES (1, '00000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT DO NOTHING;

-- ── 8. Mediciones FC durante sesión (2026-06-20 10:00-10:30) ────
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   range_low, range_high, measurement_source_value, unit_source_value)
SELECT
  1, 3027018, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n || ' minutes')::interval),
  705183,
  70 + floor(random() * 60)::int,
  4118124, 60, 140, 'heart rate', 'beats/min'
FROM generate_series(0, 29) AS n;

-- ── 9. Pasos ─────────────────────────────────────────────────────
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   measurement_source_value, unit_source_value)
SELECT
  1, 40758552, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n * 5 || ' minutes')::interval),
  705183,
  80 + floor(random() * 40)::int,
  4118124, 'number of steps', 'steps'
FROM generate_series(0, 5) AS n;

-- ── 10. SpO2 ─────────────────────────────────────────────────────
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   range_low, range_high, measurement_source_value, unit_source_value)
SELECT
  1, 40762499, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n * 5 || ' minutes')::interval),
  705183,
  96 + floor(random() * 4)::int,
  4190629, 88, 100, 'oxygen saturation', '%'
FROM generate_series(0, 5) AS n;

-- ── 11. Resumen diario ───────────────────────────────────────────
INSERT INTO custom.daily_summary
  (date, person_id, steps, min_hr_bpm, max_hr_bpm, avg_hr_bpm,
   sleep_duration_minutes, min_rr_bpm, max_rr_bpm, spo2_avg, summary)
VALUES
  ('2026-06-20', 1, 4820, 68, 128, 92, 420, 12, 18, 97.5, '{}'),
  ('2026-06-19', 1, 3200, 65, 110, 82, 380, 13, 17, 98.0, '{}'),
  ('2026-06-18', 1, 5100, 70, 135, 95, 450, 12, 19, 97.8, '{}')
ON CONFLICT DO NOTHING;