CREATE TABLE IF NOT EXISTS custom.person_info (
    person_id   INTEGER PRIMARY KEY REFERENCES omop_cdm.person(person_id),
    email       VARCHAR(255),
    name        VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS custom.user_device (
    user_id     INTEGER NOT NULL,
    device_id   VARCHAR(50) NOT NULL REFERENCES custom.device(device_id),
    last_sync_date TIMESTAMPTZ,
    PRIMARY KEY (user_id, device_id)
);

CREATE TABLE IF NOT EXISTS custom.daily_summary (
    date                    DATE NOT NULL,
    person_id               INTEGER NOT NULL,
    steps                   INTEGER,
    min_hr_bpm              NUMERIC(5,2),
    max_hr_bpm              NUMERIC(5,2),
    avg_hr_bpm              NUMERIC(5,2),
    sleep_duration_minutes  INTEGER,
    min_rr_bpm              NUMERIC(5,2),
    max_rr_bpm              NUMERIC(5,2),
    spo2_avg                NUMERIC(5,2),
    summary                 JSONB DEFAULT '{}',
    PRIMARY KEY (date, person_id)
);

-- omop_modified: person y measurement
CREATE TABLE IF NOT EXISTS omop_modified.person (
    person_id               INTEGER PRIMARY KEY,
    gender_concept_id       INTEGER REFERENCES omop_cdm.concept(concept_id),
    year_of_birth           INTEGER NOT NULL,
    month_of_birth          INTEGER,
    day_of_birth            INTEGER,
    race_concept_id         INTEGER REFERENCES omop_cdm.concept(concept_id),
    ethnicity_concept_id    INTEGER REFERENCES omop_cdm.concept(concept_id)
);

CREATE SEQUENCE IF NOT EXISTS omop_modified.measurement_id_seq;

CREATE TABLE IF NOT EXISTS omop_modified.measurement (
    measurement_id              INTEGER PRIMARY KEY DEFAULT nextval('omop_modified.measurement_id_seq'),
    person_id                   INTEGER NOT NULL REFERENCES omop_modified.person(person_id),
    measurement_concept_id      INTEGER NOT NULL REFERENCES omop_cdm.concept(concept_id),
    measurement_date            DATE NOT NULL,
    measurement_datetime        TIMESTAMPTZ,
    measurement_type_concept_id INTEGER REFERENCES omop_cdm.concept(concept_id),
    value_as_number             NUMERIC,
    unit_concept_id             INTEGER REFERENCES omop_cdm.concept(concept_id),
    range_low                   NUMERIC,
    range_high                  NUMERIC,
    measurement_source_value    VARCHAR(50),
    unit_source_value           VARCHAR(50)
);

-- Convertir measurement en hypertable de TimescaleDB
SELECT create_hypertable(
    'omop_modified.measurement',
    'measurement_datetime',
    if_not_exists => TRUE
);