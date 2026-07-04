-- Desactivar FK checks temporalmente
SET session_replication_role = replica;

-- 1. Concepto "placeholder" con id=0 (requerido por las FK circulares)
INSERT INTO omop_cdm.concept
  (concept_id, concept_name, domain_id, vocabulary_id, concept_class_id,
   standard_concept, concept_code, valid_start_date, valid_end_date)
VALUES (0, 'No matching concept', 'Metadata', 'None', 'Undefined', NULL, 'No matching concept', '1970-01-01', '2099-12-31')
ON CONFLICT (concept_id) DO NOTHING;

-- 2. Vocabulary
INSERT INTO omop_cdm.vocabulary
  (vocabulary_id, vocabulary_name, vocabulary_reference, vocabulary_version, vocabulary_concept_id)
VALUES
  ('LOINC', 'LOINC',           'https://loinc.org',           '2.76', 0),
  ('UCUM',  'UCUM',            'https://unitsofmeasure.org',  '2.0',  0),
  ('OMOP',  'OMOP Vocabulary', 'https://ohdsi.org',           '5.0',  0),
  ('None',  'None',            '',                            '',     0)
ON CONFLICT (vocabulary_id) DO NOTHING;

-- 3. Domain
INSERT INTO omop_cdm.domain
  (domain_id, domain_name, domain_concept_id)
VALUES
  ('Measurement',  'Measurement',  0),
  ('Observation',  'Observation',  0),
  ('Unit',         'Unit',         0),
  ('Type Concept', 'Type Concept', 0),
  ('Metadata',     'Metadata',     0)
ON CONFLICT (domain_id) DO NOTHING;

-- 4. Concept class
INSERT INTO omop_cdm.concept_class
  (concept_class_id, concept_class_name, concept_class_concept_id)
VALUES
  ('Clinical Observation', 'Clinical Observation', 0),
  ('Meas Type',            'Meas Type',            0),
  ('Unit',                 'Unit',                 0),
  ('Undefined',            'Undefined',            0)
ON CONFLICT (concept_class_id) DO NOTHING;

-- 5. Conceptos reales
INSERT INTO omop_cdm.concept
  (concept_id, concept_name, domain_id, vocabulary_id,
   concept_class_id, standard_concept, concept_code,
   valid_start_date, valid_end_date)
VALUES
  (3027018,  'Heart rate',                                    'Measurement',  'LOINC', 'Clinical Observation', 'S', '8867-4',      '1970-01-01', '2099-12-31'),
  (40758552, 'Number of steps in unspecified time pedometer', 'Measurement',  'LOINC', 'Clinical Observation', 'S', '55423-8',     '1970-01-01', '2099-12-31'),
  (3024171,  'Respiratory rate',                              'Measurement',  'LOINC', 'Clinical Observation', 'S', '9279-1',      '1970-01-01', '2099-12-31'),
  (40762499, 'Oxygen saturation in arterial blood',           'Measurement',  'LOINC', 'Clinical Observation', 'S', '59408-5',     '1970-01-01', '2099-12-31'),
  (1002368,  'Sleep duration',                                'Observation',  'LOINC', 'Clinical Observation', 'S', '93832-4',     '1970-01-01', '2099-12-31'),
  (705183,   'Wearable sensor',                               'Type Concept', 'OMOP',  'Meas Type',            'S', 'OMOP4976890', '1970-01-01', '2099-12-31'),
  (4118124,  'beats/min',                                     'Unit',         'UCUM',  'Unit',                 'S', '/min',        '1970-01-01', '2099-12-31'),
  (4117833,  'breaths/min',                                   'Unit',         'UCUM',  'Unit',                 'S', '/min',        '1970-01-01', '2099-12-31'),
  (4190629,  'percentage unit',                               'Unit',         'UCUM',  'Unit',                 'S', '%',           '1970-01-01', '2099-12-31'),
  (8550,     'min',                                           'Unit',         'UCUM',  'Unit',                 'S', 'min',         '1970-01-01', '2099-12-31'),
  (8532,     'FEMALE',                                        'Type Concept', 'OMOP',  'Clinical Observation', 'S', 'F',           '1970-01-01', '2099-12-31'),
  (8507,     'MALE',                                          'Type Concept', 'OMOP',  'Clinical Observation', 'S', 'M',           '1970-01-01', '2099-12-31'),
  (8527,     'White',                                         'Type Concept', 'OMOP',  'Clinical Observation', 'S', 'W',           '1970-01-01', '2099-12-31'),
  (8657,     'Not Hispanic',                                  'Type Concept', 'OMOP',  'Clinical Observation', 'S', 'NH',          '1970-01-01', '2099-12-31')
ON CONFLICT (concept_id) DO NOTHING;

-- 6. Person
INSERT INTO omop_modified.person
  (person_id, gender_concept_id, year_of_birth, race_concept_id, ethnicity_concept_id)
VALUES (1, 8532, 2016, 8527, 8657)
ON CONFLICT (person_id) DO NOTHING;

-- 7. Person info
INSERT INTO custom.person_info (person_id, email, name)
VALUES (1, 'paciente_ejemplo@oncobat.es', 'Paciente Demo')
ON CONFLICT (person_id) DO NOTHING;

-- 8. Device (uuid correcto)
INSERT INTO custom.device (device_id, manufacturer, model)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Garmin', 'Venu Sq2')
ON CONFLICT (device_id) DO NOTHING;

-- 9. User device (device_id como uuid)
INSERT INTO custom.user_device (user_id, device_id, last_sync_date)
VALUES (1, '00000000-0000-0000-0000-000000000001'::uuid, NOW())
ON CONFLICT DO NOTHING;

-- 10. Mediciones FC (sesión 2026-06-20 10:00-10:30)
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   range_low, range_high, measurement_source_value, unit_source_value)
SELECT
  1, 3027018, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n || ' minutes')::interval),
  705183, 70 + floor(random() * 60)::int,
  4118124, 60, 140, 'heart rate', 'beats/min'
FROM generate_series(0, 29) AS n;

-- 11. Pasos
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   measurement_source_value, unit_source_value)
SELECT
  1, 40758552, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n * 5 || ' minutes')::interval),
  705183, 80 + floor(random() * 40)::int,
  4118124, 'number of steps', 'steps'
FROM generate_series(0, 5) AS n;

-- 12. SpO2
INSERT INTO omop_modified.measurement
  (person_id, measurement_concept_id, measurement_date, measurement_datetime,
   measurement_type_concept_id, value_as_number, unit_concept_id,
   range_low, range_high, measurement_source_value, unit_source_value)
SELECT
  1, 40762499, '2026-06-20',
  ('2026-06-20 10:00:00+00'::timestamptz + (n * 5 || ' minutes')::interval),
  705183, 96 + floor(random() * 4)::int,
  4190629, 88, 100, 'oxygen saturation', '%'
FROM generate_series(0, 5) AS n;

-- Reactivar FK checks
SET session_replication_role = DEFAULT;

-- Verificar
SELECT 'omop_cdm.concept'          AS tabla, COUNT(*) FROM omop_cdm.concept
UNION ALL
SELECT 'omop_modified.person',       COUNT(*) FROM omop_modified.person
UNION ALL
SELECT 'omop_modified.measurement',  COUNT(*) FROM omop_modified.measurement
UNION ALL
SELECT 'custom.daily_summary',       COUNT(*) FROM custom.daily_summary;