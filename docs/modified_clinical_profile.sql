-- Nuevos tipos enum
CREATE TYPE tanner_stage_type AS ENUM ('I', 'II', 'III', 'IV', 'V');

-- Renombrar gender_type existente a solo M/F si prefieres reutilizarlo,
-- o crear uno nuevo para no romper datos existentes:
CREATE TYPE biological_sex_type AS ENUM ('male', 'female');

ALTER TABLE public.clinical_profile
    ADD COLUMN biological_sex biological_sex_type,
    ADD COLUMN tanner_stage tanner_stage_type,
    ADD COLUMN bmi NUMERIC,
    ADD COLUMN bmi_percentile NUMERIC,
    ADD COLUMN prior_conditions TEXT,
    ADD COLUMN current_comorbidities TEXT,
    ADD COLUMN family_history TEXT;

-- Migrar datos existentes de gender -> biological_sex (ignorando 'other')
UPDATE public.clinical_profile
SET biological_sex = gender::text::biological_sex_type
WHERE gender IN ('male', 'female');