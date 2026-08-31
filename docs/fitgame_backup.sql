pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: hypertable
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: chunk
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: continuous_agg
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

\restrict SvGV3wDBRoKAd6q6bD1wG2H3Nb2COsV1gCUiN9OR4YgweBcZSbVFdan1ngAPkHY

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wellness_test DROP CONSTRAINT IF EXISTS wellness_test_session_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_account DROP CONSTRAINT IF EXISTS user_account_avatar_fkey;
ALTER TABLE IF EXISTS ONLY public.use DROP CONSTRAINT IF EXISTS use_measure_param_fkey;
ALTER TABLE IF EXISTS ONLY public.use DROP CONSTRAINT IF EXISTS use_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.train DROP CONSTRAINT IF EXISTS train_muscle_group_fkey;
ALTER TABLE IF EXISTS ONLY public.train DROP CONSTRAINT IF EXISTS train_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_note DROP CONSTRAINT IF EXISTS supervisor_note_clinical_profile_fkey;
ALTER TABLE IF EXISTS ONLY public.steps DROP CONSTRAINT IF EXISTS steps_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.routine DROP CONSTRAINT IF EXISTS routine_assigned_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.restricts DROP CONSTRAINT IF EXISTS restricts_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.restricts DROP CONSTRAINT IF EXISTS restricts_contraindication_fkey;
ALTER TABLE IF EXISTS ONLY public.presents DROP CONSTRAINT IF EXISTS presents_contraindication_fkey;
ALTER TABLE IF EXISTS ONLY public.presents DROP CONSTRAINT IF EXISTS presents_clinical_profile_fkey;
ALTER TABLE IF EXISTS ONLY public.plan DROP CONSTRAINT IF EXISTS plan_routine_fkey;
ALTER TABLE IF EXISTS ONLY public.plan DROP CONSTRAINT IF EXISTS plan_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.need DROP CONSTRAINT IF EXISTS need_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.need DROP CONSTRAINT IF EXISTS need_equipment_fkey;
ALTER TABLE IF EXISTS ONLY public.keep DROP CONSTRAINT IF EXISTS keep_item_fkey;
ALTER TABLE IF EXISTS ONLY public.keep DROP CONSTRAINT IF EXISTS keep_avatar_fkey;
ALTER TABLE IF EXISTS ONLY public.has DROP CONSTRAINT IF EXISTS has_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.has DROP CONSTRAINT IF EXISTS has_memorial_fkey;
ALTER TABLE IF EXISTS ONLY public.execute DROP CONSTRAINT IF EXISTS execute_session_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.execute DROP CONSTRAINT IF EXISTS execute_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.coop_challenge DROP CONSTRAINT IF EXISTS coop_challenge_memorial_fkey;
ALTER TABLE IF EXISTS ONLY public.contains DROP CONSTRAINT IF EXISTS contains_exercise_fkey;
ALTER TABLE IF EXISTS ONLY public.contains DROP CONSTRAINT IF EXISTS contains_audiovisual_fkey;
ALTER TABLE IF EXISTS ONLY public.complete DROP CONSTRAINT IF EXISTS complete_challenge_fkey;
ALTER TABLE IF EXISTS ONLY public.complete DROP CONSTRAINT IF EXISTS complete_avatar_fkey;
ALTER TABLE IF EXISTS ONLY public.clinical_profile DROP CONSTRAINT IF EXISTS clinical_profile_user_account_fkey;
ALTER TABLE IF EXISTS ONLY public.wellness_test DROP CONSTRAINT IF EXISTS wellness_test_pkey;
ALTER TABLE IF EXISTS ONLY public.user_account DROP CONSTRAINT IF EXISTS user_account_pkey;
ALTER TABLE IF EXISTS ONLY public.use DROP CONSTRAINT IF EXISTS use_pkey;
ALTER TABLE IF EXISTS ONLY public.train DROP CONSTRAINT IF EXISTS train_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_note DROP CONSTRAINT IF EXISTS supervisor_note_pkey;
ALTER TABLE IF EXISTS ONLY public.steps DROP CONSTRAINT IF EXISTS steps_pkey;
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS session_pkey;
ALTER TABLE IF EXISTS ONLY public.routine DROP CONSTRAINT IF EXISTS routine_pkey;
ALTER TABLE IF EXISTS ONLY public.restricts DROP CONSTRAINT IF EXISTS restricts_pkey;
ALTER TABLE IF EXISTS ONLY public.presents DROP CONSTRAINT IF EXISTS presents_pkey;
ALTER TABLE IF EXISTS ONLY public.plan DROP CONSTRAINT IF EXISTS plan_pkey;
ALTER TABLE IF EXISTS ONLY public.need DROP CONSTRAINT IF EXISTS need_pkey;
ALTER TABLE IF EXISTS ONLY public.muscle_group DROP CONSTRAINT IF EXISTS muscle_group_pkey;
ALTER TABLE IF EXISTS ONLY public.memorial DROP CONSTRAINT IF EXISTS memorial_pkey;
ALTER TABLE IF EXISTS ONLY public.measurement_parameter DROP CONSTRAINT IF EXISTS measurement_parameter_pkey;
ALTER TABLE IF EXISTS ONLY public.keep DROP CONSTRAINT IF EXISTS keep_pkey;
ALTER TABLE IF EXISTS ONLY public.item DROP CONSTRAINT IF EXISTS item_pkey;
ALTER TABLE IF EXISTS ONLY public.has DROP CONSTRAINT IF EXISTS has_pkey;
ALTER TABLE IF EXISTS ONLY public.exercise DROP CONSTRAINT IF EXISTS exercise_pkey;
ALTER TABLE IF EXISTS ONLY public.execute DROP CONSTRAINT IF EXISTS execute_pkey;
ALTER TABLE IF EXISTS ONLY public.equipment DROP CONSTRAINT IF EXISTS equipment_pkey;
ALTER TABLE IF EXISTS ONLY public.coop_challenge DROP CONSTRAINT IF EXISTS coop_challenge_unique_memorial;
ALTER TABLE IF EXISTS ONLY public.coop_challenge DROP CONSTRAINT IF EXISTS coop_challenge_pkey;
ALTER TABLE IF EXISTS ONLY public.contraindication DROP CONSTRAINT IF EXISTS contraindication_pkey;
ALTER TABLE IF EXISTS ONLY public.contains DROP CONSTRAINT IF EXISTS contains_pkey;
ALTER TABLE IF EXISTS ONLY public.complete DROP CONSTRAINT IF EXISTS complete_pkey;
ALTER TABLE IF EXISTS ONLY public.clinical_profile DROP CONSTRAINT IF EXISTS clinical_profile_pkey;
ALTER TABLE IF EXISTS ONLY public.clinical_profile DROP CONSTRAINT IF EXISTS clinical_profile_omop_person_id_key;
ALTER TABLE IF EXISTS ONLY public.avatar DROP CONSTRAINT IF EXISTS avatar_pkey;
ALTER TABLE IF EXISTS ONLY public.audiovisual DROP CONSTRAINT IF EXISTS audiovisual_pkey;
ALTER TABLE IF EXISTS public.avatar ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.wellness_test;
DROP TABLE IF EXISTS public.user_account;
DROP TABLE IF EXISTS public.use;
DROP TABLE IF EXISTS public.train;
DROP TABLE IF EXISTS public.supervisor_note;
DROP TABLE IF EXISTS public.steps;
DROP TABLE IF EXISTS public.session;
DROP TABLE IF EXISTS public.routine;
DROP TABLE IF EXISTS public.restricts;
DROP TABLE IF EXISTS public.presents;
DROP TABLE IF EXISTS public.plan;
DROP TABLE IF EXISTS public.need;
DROP TABLE IF EXISTS public.muscle_group;
DROP TABLE IF EXISTS public.memorial;
DROP TABLE IF EXISTS public.measurement_parameter;
DROP TABLE IF EXISTS public.keep;
DROP TABLE IF EXISTS public.item;
DROP TABLE IF EXISTS public.has;
DROP TABLE IF EXISTS public.exercise;
DROP TABLE IF EXISTS public.execute;
DROP TABLE IF EXISTS public.equipment;
DROP TABLE IF EXISTS public.coop_challenge;
DROP TABLE IF EXISTS public.contraindication;
DROP TABLE IF EXISTS public.contains;
DROP TABLE IF EXISTS public.complete;
DROP TABLE IF EXISTS public.clinical_profile;
DROP SEQUENCE IF EXISTS public.avatar_id_seq;
DROP TABLE IF EXISTS public.avatar;
DROP TABLE IF EXISTS public.audiovisual;
DROP TYPE IF EXISTS public.wellness_type;
DROP TYPE IF EXISTS public.tanner_stage_type;
DROP TYPE IF EXISTS public.item_type;
DROP TYPE IF EXISTS public.gender_type;
DROP TYPE IF EXISTS public.difficulty_type;
DROP TYPE IF EXISTS public.challenge_type;
DROP TYPE IF EXISTS public.category_type;
DROP TYPE IF EXISTS public.biological_sex_type;
DROP EXTENSION IF EXISTS timescaledb;
--
-- Name: timescaledb; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA public;


--
-- Name: EXTENSION timescaledb; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION timescaledb IS 'Enables scalable inserts and complex queries for time-series data (Community Edition)';


--
-- Name: biological_sex_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.biological_sex_type AS ENUM (
    'male',
    'female'
);


ALTER TYPE public.biological_sex_type OWNER TO admin_821011;

--
-- Name: category_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.category_type AS ENUM (
    'aerobic',
    'strength',
    'flexibility',
    'balance',
    'warmup',
    'stretching'
);


ALTER TYPE public.category_type OWNER TO admin_821011;

--
-- Name: challenge_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.challenge_type AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.challenge_type OWNER TO admin_821011;

--
-- Name: difficulty_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.difficulty_type AS ENUM (
    'easy',
    'medium',
    'hard'
);


ALTER TYPE public.difficulty_type OWNER TO admin_821011;

--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.gender_type OWNER TO admin_821011;

--
-- Name: item_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.item_type AS ENUM (
    'head',
    'body',
    'legs',
    'feet',
    'arms',
    'accessory',
    'face'
);


ALTER TYPE public.item_type OWNER TO admin_821011;

--
-- Name: tanner_stage_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.tanner_stage_type AS ENUM (
    'I',
    'II',
    'III',
    'IV',
    'V'
);


ALTER TYPE public.tanner_stage_type OWNER TO admin_821011;

--
-- Name: wellness_type; Type: TYPE; Schema: public; Owner: admin_821011
--

CREATE TYPE public.wellness_type AS ENUM (
    'initial',
    'final'
);


ALTER TYPE public.wellness_type OWNER TO admin_821011;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audiovisual; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.audiovisual (
    url character varying(255) NOT NULL
);


ALTER TABLE public.audiovisual OWNER TO admin_821011;

--
-- Name: avatar; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.avatar (
    id integer NOT NULL,
    fp integer NOT NULL,
    CONSTRAINT avatar_fp_check CHECK ((fp >= 0))
);


ALTER TABLE public.avatar OWNER TO admin_821011;

--
-- Name: avatar_id_seq; Type: SEQUENCE; Schema: public; Owner: admin_821011
--

CREATE SEQUENCE public.avatar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avatar_id_seq OWNER TO admin_821011;

--
-- Name: avatar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin_821011
--

ALTER SEQUENCE public.avatar_id_seq OWNED BY public.avatar.id;


--
-- Name: clinical_profile; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.clinical_profile (
    id integer NOT NULL,
    age integer,
    height numeric,
    weight numeric,
    birth_date date,
    diagnosis character varying(100),
    treatment_end_date date,
    hospital character varying(255),
    biological_sex public.biological_sex_type,
    tanner_stage public.tanner_stage_type,
    bmi numeric,
    bmi_percentile numeric,
    prior_conditions text,
    current_comorbidities text,
    family_history text,
    omop_person_id integer,
    CONSTRAINT clinical_profile_age_check CHECK (((age >= 0) AND (age < 100))),
    CONSTRAINT clinical_profile_birth_date_check CHECK ((birth_date < CURRENT_DATE)),
    CONSTRAINT clinical_profile_height_check CHECK (((height >= (0)::numeric) AND (height < (200)::numeric))),
    CONSTRAINT clinical_profile_weight_check CHECK (((weight >= (0)::numeric) AND (weight < (1000)::numeric)))
);


ALTER TABLE public.clinical_profile OWNER TO admin_821011;

--
-- Name: complete; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.complete (
    challenge character varying(255) NOT NULL,
    avatar integer NOT NULL
);


ALTER TABLE public.complete OWNER TO admin_821011;

--
-- Name: contains; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.contains (
    exercise character varying(255) NOT NULL,
    audiovisual character varying(255) NOT NULL
);


ALTER TABLE public.contains OWNER TO admin_821011;

--
-- Name: contraindication; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.contraindication (
    name character varying(255) NOT NULL,
    description text
);


ALTER TABLE public.contraindication OWNER TO admin_821011;

--
-- Name: coop_challenge; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.coop_challenge (
    name character varying(255) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status public.challenge_type NOT NULL,
    total_steps integer NOT NULL,
    memorial character varying(255) NOT NULL,
    CONSTRAINT coop_challenge_check CHECK ((end_date > start_date)),
    CONSTRAINT coop_challenge_total_steps_check CHECK (((total_steps >= 0) AND (total_steps < 1000000)))
);


ALTER TABLE public.coop_challenge OWNER TO admin_821011;

--
-- Name: equipment; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.equipment (
    name character varying(255) NOT NULL
);


ALTER TABLE public.equipment OWNER TO admin_821011;

--
-- Name: execute; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.execute (
    session timestamp with time zone NOT NULL,
    user_id integer NOT NULL,
    exercise character varying(255) NOT NULL,
    num_reps_done integer NOT NULL,
    t_initial timestamp with time zone NOT NULL,
    t_final timestamp with time zone NOT NULL,
    num_series_done integer DEFAULT 1 NOT NULL,
    CONSTRAINT execute_check CHECK ((t_final > t_initial)),
    CONSTRAINT execute_num_reps_done_check CHECK (((num_reps_done >= 0) AND (num_reps_done < 1000)))
);


ALTER TABLE public.execute OWNER TO admin_821011;

--
-- Name: exercise; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.exercise (
    name character varying(255) NOT NULL,
    description text NOT NULL,
    category public.category_type NOT NULL,
    difficulty public.difficulty_type NOT NULL
);


ALTER TABLE public.exercise OWNER TO admin_821011;

--
-- Name: has; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.has (
    memorial character varying(255) NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.has OWNER TO admin_821011;

--
-- Name: item; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.item (
    name character varying(255) NOT NULL,
    type public.item_type NOT NULL,
    image character varying(255) NOT NULL,
    cost integer NOT NULL,
    CONSTRAINT item_cost_check CHECK (((cost > 0) AND (cost < 1000)))
);


ALTER TABLE public.item OWNER TO admin_821011;

--
-- Name: keep; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.keep (
    item character varying(255) NOT NULL,
    avatar integer NOT NULL,
    is_wearing boolean NOT NULL
);


ALTER TABLE public.keep OWNER TO admin_821011;

--
-- Name: measurement_parameter; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.measurement_parameter (
    name character varying(255) NOT NULL
);


ALTER TABLE public.measurement_parameter OWNER TO admin_821011;

--
-- Name: memorial; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.memorial (
    name character varying(255) NOT NULL,
    description text NOT NULL,
    image character varying(255) NOT NULL
);


ALTER TABLE public.memorial OWNER TO admin_821011;

--
-- Name: muscle_group; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.muscle_group (
    name character varying(255) NOT NULL
);


ALTER TABLE public.muscle_group OWNER TO admin_821011;

--
-- Name: need; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.need (
    exercise character varying(255) NOT NULL,
    equipment character varying(255) NOT NULL
);


ALTER TABLE public.need OWNER TO admin_821011;

--
-- Name: plan; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.plan (
    routine character varying(255) NOT NULL,
    exercise character varying(255) NOT NULL,
    num_reps integer NOT NULL,
    num_series integer NOT NULL,
    duration numeric,
    rest integer NOT NULL,
    CONSTRAINT plan_duration_check CHECK (((duration > (0)::numeric) AND (duration < (1440)::numeric))),
    CONSTRAINT plan_num_reps_check CHECK (((num_reps > 0) AND (num_reps < 1000))),
    CONSTRAINT plan_num_series_check CHECK (((num_series > 0) AND (num_series < 100))),
    CONSTRAINT plan_rest_check CHECK (((rest >= 0) AND (rest < 3600)))
);


ALTER TABLE public.plan OWNER TO admin_821011;

--
-- Name: presents; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.presents (
    clinical_profile integer NOT NULL,
    contraindication character varying(255) NOT NULL
);


ALTER TABLE public.presents OWNER TO admin_821011;

--
-- Name: restricts; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.restricts (
    exercise character varying(255) NOT NULL,
    contraindication character varying(255) NOT NULL
);


ALTER TABLE public.restricts OWNER TO admin_821011;

--
-- Name: routine; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.routine (
    name character varying(255) NOT NULL,
    category public.category_type NOT NULL,
    difficulty public.difficulty_type NOT NULL,
    assigned_user_id integer
);


ALTER TABLE public.routine OWNER TO admin_821011;

--
-- Name: session; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.session (
    date timestamp with time zone NOT NULL,
    user_id integer NOT NULL,
    duration numeric NOT NULL,
    routine character varying(255) NOT NULL,
    is_coop boolean NOT NULL,
    CONSTRAINT session_duration_check CHECK (((duration >= (0)::numeric) AND (duration < (1440)::numeric)))
);


ALTER TABLE public.session OWNER TO admin_821011;

--
-- Name: steps; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.steps (
    date timestamp with time zone NOT NULL,
    num_steps integer NOT NULL,
    is_reached boolean NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT steps_num_steps_check CHECK (((num_steps >= 0) AND (num_steps < 1000000)))
);


ALTER TABLE public.steps OWNER TO admin_821011;

--
-- Name: supervisor_note; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.supervisor_note (
    clinical_profile integer NOT NULL,
    content text NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.supervisor_note OWNER TO admin_821011;

--
-- Name: train; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.train (
    exercise character varying(255) NOT NULL,
    muscle_group character varying(255) NOT NULL
);


ALTER TABLE public.train OWNER TO admin_821011;

--
-- Name: use; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.use (
    exercise character varying(255) NOT NULL,
    measure_param character varying(255) NOT NULL
);


ALTER TABLE public.use OWNER TO admin_821011;

--
-- Name: user_account; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.user_account (
    id integer NOT NULL,
    avatar integer NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.user_account OWNER TO admin_821011;

--
-- Name: wellness_test; Type: TABLE; Schema: public; Owner: admin_821011
--

CREATE TABLE public.wellness_test (
    session timestamp with time zone NOT NULL,
    user_id integer NOT NULL,
    type public.wellness_type NOT NULL,
    pain integer NOT NULL,
    sleepiness integer NOT NULL,
    mood integer NOT NULL,
    fatigue integer NOT NULL,
    CONSTRAINT c_fatigue CHECK (((fatigue >= 1) AND (fatigue <= 5))),
    CONSTRAINT c_mood CHECK (((mood >= 1) AND (mood <= 5))),
    CONSTRAINT c_pain CHECK (((pain >= 1) AND (pain <= 5))),
    CONSTRAINT c_sleepiness CHECK (((sleepiness >= 1) AND (sleepiness <= 5)))
);


ALTER TABLE public.wellness_test OWNER TO admin_821011;

--
-- Name: avatar id; Type: DEFAULT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.avatar ALTER COLUMN id SET DEFAULT nextval('public.avatar_id_seq'::regclass);


--
-- Data for Name: hypertable; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.hypertable (id, schema_name, table_name, associated_schema_name, associated_table_prefix, num_dimensions, chunk_sizing_func_schema, chunk_sizing_func_name, chunk_target_size, compression_state, compressed_hypertable_id, status) FROM stdin;
\.


--
-- Data for Name: bgw_job; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.bgw_job (id, application_name, schedule_interval, max_runtime, max_retries, retry_period, proc_schema, proc_name, owner, scheduled, fixed_schedule, initial_start, hypertable_id, config, check_schema, check_name, timezone) FROM stdin;
\.


--
-- Data for Name: chunk; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.chunk (id, hypertable_id, schema_name, table_name, compressed_chunk_id, dropped, status, osm_chunk, creation_time) FROM stdin;
\.


--
-- Data for Name: chunk_column_stats; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.chunk_column_stats (id, hypertable_id, chunk_id, column_name, range_start, range_end, valid) FROM stdin;
\.


--
-- Data for Name: dimension; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.dimension (id, hypertable_id, column_name, column_type, aligned, num_slices, partitioning_func_schema, partitioning_func, interval_length, compress_interval_length, integer_now_func_schema, integer_now_func) FROM stdin;
\.


--
-- Data for Name: dimension_slice; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.dimension_slice (id, dimension_id, range_start, range_end) FROM stdin;
\.


--
-- Data for Name: chunk_constraint; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.chunk_constraint (chunk_id, dimension_slice_id, constraint_name, hypertable_constraint_name) FROM stdin;
\.


--
-- Data for Name: compression_chunk_size; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.compression_chunk_size (chunk_id, compressed_chunk_id, uncompressed_heap_size, uncompressed_toast_size, uncompressed_index_size, compressed_heap_size, compressed_toast_size, compressed_index_size, numrows_pre_compression, numrows_post_compression, numrows_frozen_immediately) FROM stdin;
\.


--
-- Data for Name: compression_settings; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.compression_settings (relid, compress_relid, segmentby, orderby, orderby_desc, orderby_nullsfirst, index) FROM stdin;
\.


--
-- Data for Name: continuous_agg; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_agg (mat_hypertable_id, raw_hypertable_id, parent_mat_hypertable_id, user_view_schema, user_view_name, partial_view_schema, partial_view_name, direct_view_schema, direct_view_name, materialized_only) FROM stdin;
\.


--
-- Data for Name: continuous_agg_migrate_plan; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_agg_migrate_plan (mat_hypertable_id, start_ts, end_ts, user_view_definition) FROM stdin;
\.


--
-- Data for Name: continuous_agg_migrate_plan_step; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_agg_migrate_plan_step (mat_hypertable_id, step_id, status, start_ts, end_ts, type, config) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_bucket_function; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_bucket_function (mat_hypertable_id, bucket_func, bucket_width, bucket_origin, bucket_offset, bucket_timezone, bucket_fixed_width) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_hypertable_invalidation_log; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_hypertable_invalidation_log (hypertable_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_invalidation_threshold; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_invalidation_threshold (hypertable_id, watermark) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_materialization_invalidation_log; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_materialization_invalidation_log (materialization_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_materialization_ranges; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_materialization_ranges (materialization_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_watermark; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.continuous_aggs_watermark (mat_hypertable_id, watermark) FROM stdin;
\.


--
-- Data for Name: metadata; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.metadata (key, value, include_in_telemetry) FROM stdin;
install_timestamp	2026-04-18 14:36:47.890206+00	t
timescaledb_version	2.25.2	f
exported_uuid	3a285203-30d8-4289-a219-25750add090f	t
\.


--
-- Data for Name: tablespace; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: admin_821011
--

COPY _timescaledb_catalog.tablespace (id, hypertable_id, tablespace_name) FROM stdin;
\.


--
-- Data for Name: audiovisual; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.audiovisual (url) FROM stdin;
https://youtu.be/0e4251eQAE8?si=USOipFNxQ7SQQnWz
https://youtu.be/u6hh6vOgXNI?si=hg7SfL1w_F-Ew55_
https://youtu.be/oG5nZ0ykHhs?si=-3B3ea03VyDwEe33
https://www.youtube.com/watch?v=885PHIF-ebk
https://www.youtube.com/shorts/UBAiYoPFeYg
https://www.youtube.com/watch?v=velMsAINaWw
https://www.youtube.com/watch?v=3NbsVovAzFY
https://www.youtube.com/shorts/DsuwbRpqOuE
https://www.youtube.com/watch?v=dz7ggVmCj9U
\.


--
-- Data for Name: avatar; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.avatar (id, fp) FROM stdin;
2	140
3	80
\.


--
-- Data for Name: clinical_profile; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.clinical_profile (id, age, height, weight, birth_date, diagnosis, treatment_end_date, hospital, biological_sex, tanner_stage, bmi, bmi_percentile, prior_conditions, current_comorbidities, family_history, omop_person_id) FROM stdin;
821011	\N	\N	\N	2002-10-18	\N	\N	\N	male	\N	\N	\N	\N	\N	\N	\N
900000	8	169	50	2001-10-19	Osteosarcoma	2026-08-11	Hospital virgen de la concha	male	III	\N	\N	Diabetes	Nauseas	\N	\N
\.


--
-- Data for Name: complete; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.complete (challenge, avatar) FROM stdin;
\.


--
-- Data for Name: contains; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.contains (exercise, audiovisual) FROM stdin;
Marcha en el sitio	https://youtu.be/0e4251eQAE8?si=USOipFNxQ7SQQnWz
Sentadilla con apoyo	https://youtu.be/u6hh6vOgXNI?si=hg7SfL1w_F-Ew55_
Equilibrio monopodal	https://youtu.be/oG5nZ0ykHhs?si=-3B3ea03VyDwEe33
Rotación de hombros	https://www.youtube.com/watch?v=885PHIF-ebk
Pasos laterales	https://www.youtube.com/shorts/UBAiYoPFeYg
Saltos de tijera suaves	https://www.youtube.com/watch?v=velMsAINaWw
Estiramiento de mariposa	https://www.youtube.com/watch?v=3NbsVovAzFY
Postura de la semilla (Niño)	https://www.youtube.com/shorts/DsuwbRpqOuE
Marcha suave	https://www.youtube.com/watch?v=dz7ggVmCj9U
\.


--
-- Data for Name: contraindication; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.contraindication (name, description) FROM stdin;
upper_limb	Limitaciones de movilidad o fuerza en miembros superiores.
lower_limb	Limitaciones de movilidad o soporte de carga en miembros inferiores.
vision	Dificultades visuales o pérdida parcial/total de visión.
hearing	Dificultades auditivas o pérdida parcial/total de audición.
balance	Problemas de equilibrio, coordinación o control postural.
neuropathy	Neuropatía periférica que causa dolor, hormigueo o debilidad.
cardiotoxicity_severe	Cardiotoxicidad severa o disfunción cardíaca debida a tratamientos.
osteoporosis_severe	Osteoporosis severa con alto riesgo de fracturas óseas.
\.


--
-- Data for Name: coop_challenge; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.coop_challenge (name, start_date, end_date, status, total_steps, memorial) FROM stdin;
El Dragón del Sedentarismo	2026-06-07 17:29:26.872+00	2026-06-14 17:29:26.872+00	inactive	100000	El corazón en forma
El Dragón del Sedentarismo (2026-07-31)	2026-07-31 19:39:26.408+00	2026-08-14 19:39:26.408+00	inactive	100000	Flexibilidad es libertad
La Serpiente del Sofá (2026-08-15)	2026-08-15 11:24:26.156+00	2026-08-29 11:24:26.156+00	active	100000	Pulmones de acero
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.equipment (name) FROM stdin;
Colchoneta
Bandas elásticas
Mancuernas ligeras
Silla
Bicicleta estática
Esterilla
\.


--
-- Data for Name: execute; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.execute (session, user_id, exercise, num_reps_done, t_initial, t_final, num_series_done) FROM stdin;
2026-06-11 08:59:49.297+00	821011	Bicicleta estática suave	1	2026-06-11 09:00:30.222+00	2026-06-11 09:00:31.085+00	1
2026-06-11 08:59:49.297+00	821011	Marcha en el sitio	20	2026-06-11 09:00:53.706+00	2026-06-11 09:00:53.908+00	1
2026-06-11 11:53:40.166+00	821011	Bicicleta estática suave	1	2026-06-11 12:05:33.969+00	2026-06-11 12:05:33.995+00	1
2026-06-11 11:53:40.166+00	821011	Marcha en el sitio	20	2026-06-11 12:05:38.117+00	2026-06-11 12:05:38.622+00	1
2026-06-11 21:58:12.76+00	821011	Bicicleta estática suave	1	2026-06-11 21:58:26.988+00	2026-06-11 21:58:27.963+00	1
2026-06-12 15:44:14.992+00	821011	Bicicleta estática suave	1	2026-06-12 15:44:15.109+00	2026-06-12 15:47:16.253+00	1
2026-06-12 15:44:14.992+00	821011	Marcha en el sitio	30	2026-06-12 15:47:16.335+00	2026-06-12 15:49:24.236+00	2
2026-06-12 15:49:33.258+00	821011	Bicicleta estática suave	1	2026-06-12 15:49:33.406+00	2026-06-12 15:49:46.298+00	1
2026-06-12 15:49:33.258+00	821011	Marcha en el sitio	40	2026-06-12 15:49:46.394+00	2026-06-12 15:54:23.62+00	2
2026-06-12 16:03:54.708+00	821011	Bicicleta estática suave	1	2026-06-12 16:03:54.715+00	2026-06-12 16:03:58.207+00	1
2026-06-12 16:03:54.708+00	821011	Marcha en el sitio	40	2026-06-12 16:03:58.332+00	2026-06-12 16:04:14.681+00	2
2026-07-03 17:45:50.302+00	821011	Bicicleta estática suave	1	2026-07-03 17:45:50.177+00	2026-07-03 17:46:00.47+00	1
2026-07-03 17:45:50.302+00	821011	Marcha en el sitio	40	2026-07-03 17:46:00.687+00	2026-07-03 17:46:08.723+00	2
2026-07-04 23:27:09.51+00	821011	Caminar en línea recta	9	2026-07-04 23:27:09.571+00	2026-07-04 23:27:15.547+00	2
2026-07-04 23:27:09.51+00	821011	Equilibrio monopodal	15	2026-07-04 23:27:15.604+00	2026-07-04 23:27:19.282+00	3
2026-07-05 21:48:36.956+00	821011	Caminar en línea recta	10	2026-07-05 21:48:37.08+00	2026-07-05 21:48:39.503+00	2
2026-07-05 21:48:36.956+00	821011	Equilibrio monopodal	15	2026-07-05 21:48:39.552+00	2026-07-05 21:48:42.854+00	3
2026-07-05 22:01:44.126+00	821011	Caminar en línea recta	10	2026-07-05 22:01:44.186+00	2026-07-05 22:01:46.995+00	2
2026-07-05 22:01:44.126+00	821011	Equilibrio monopodal	15	2026-07-05 22:01:47.073+00	2026-07-05 22:01:49.648+00	3
2026-07-08 10:22:53.898+00	821011	Caminar en línea recta	8	2026-07-08 10:22:54.482+00	2026-07-08 10:23:17.07+00	2
2026-07-08 10:22:53.898+00	821011	Equilibrio monopodal	15	2026-07-08 10:23:17.648+00	2026-07-08 10:24:22.695+00	3
2026-07-12 23:54:26.446+00	821011	Caminar en línea recta	10	2026-07-12 23:54:26.539+00	2026-07-12 23:54:32.697+00	2
2026-07-12 23:54:26.446+00	821011	Equilibrio monopodal	15	2026-07-12 23:54:32.751+00	2026-07-12 23:55:57.761+00	3
2026-07-20 11:35:50.701+00	821011	Caminar en línea recta	10	2026-07-20 11:35:50.682+00	2026-07-20 11:36:07.681+00	2
2026-07-30 12:29:50.091+00	821011	Caminar en línea recta	10	2026-07-30 12:29:50.133+00	2026-07-30 12:29:53.568+00	2
2026-07-30 12:29:50.091+00	821011	Equilibrio monopodal	14	2026-07-30 12:29:53.602+00	2026-07-30 12:30:04.779+00	3
2026-07-30 18:45:27.927+00	821011	Caminar en línea recta	10	2026-07-30 18:45:27.99+00	2026-07-30 18:45:36.754+00	2
2026-07-30 21:28:00.01+00	821011	Caminar en línea recta	10	2026-07-30 21:28:00.102+00	2026-07-30 21:28:18.968+00	2
2026-07-30 21:28:00.01+00	821011	Equilibrio monopodal	15	2026-07-30 21:28:19.285+00	2026-07-30 21:28:30.995+00	3
2026-07-31 19:47:30.427+00	821011	Bicicleta estática suave	1	2026-07-31 19:47:30.628+00	2026-07-31 19:48:54.065+00	1
2026-07-31 19:47:30.427+00	821011	Marcha en el sitio	40	2026-07-31 19:48:54.379+00	2026-07-31 19:49:11.49+00	2
2026-07-31 19:55:53.691+00	821011	Marcha suave	30	2026-07-31 19:55:53.895+00	2026-07-31 19:56:14.152+00	3
2026-07-31 19:55:53.691+00	821011	Bicicleta estática suave	1	2026-07-31 19:56:14.628+00	2026-07-31 19:56:16.979+00	1
2026-07-31 19:55:53.691+00	821011	Marcha en el sitio	40	2026-07-31 19:56:17.226+00	2026-07-31 19:56:21.729+00	2
2026-07-31 19:55:53.691+00	821011	Estirar cuádriceps	30	2026-07-31 19:56:21.877+00	2026-07-31 19:56:59.535+00	3
2026-08-20 12:53:23.753+00	821011	Caminar en línea recta	10	2026-08-20 12:53:24.184+00	2026-08-20 12:53:37.62+00	2
2026-08-20 15:52:57.616+00	821011	Caminar en línea recta	10	2026-08-20 15:52:58.349+00	2026-08-20 15:53:01.636+00	2
2026-08-23 21:40:38.96+00	900000	Marcha suave	1	2026-08-23 21:40:38.966+00	2026-08-23 21:43:46.774+00	1
2026-08-23 21:40:38.96+00	900000	Rotación de hombros	20	2026-08-23 21:44:18.184+00	2026-08-23 21:48:59.437+00	2
2026-08-23 21:40:38.96+00	900000	Bicicleta estática suave	1	2026-08-23 21:49:31.015+00	2026-08-23 21:57:16.98+00	1
2026-08-23 21:40:38.96+00	900000	Marcha en el sitio	1	2026-08-23 21:58:19.924+00	2026-08-23 22:03:33.637+00	1
2026-08-23 21:40:38.96+00	900000	Marcha en el sitio rápida	1	2026-08-23 22:03:43.044+00	2026-08-23 22:04:58.071+00	1
2026-08-23 21:40:38.96+00	900000	Saltos de tijera suaves	30	2026-08-23 22:09:22.495+00	2026-08-23 22:11:13.598+00	2
2026-08-23 21:40:38.96+00	900000	Estiramiento de mariposa	1	2026-08-23 22:11:19.725+00	2026-08-23 22:13:25.022+00	1
2026-08-23 21:40:38.96+00	900000	Postura de la semilla (Niño)	1	2026-08-23 22:13:35.67+00	2026-08-23 22:15:40.978+00	1
2026-08-23 22:45:45.519+00	900000	Círculos de cadera	10	2026-08-23 22:45:45.428+00	2026-08-23 22:47:50.848+00	1
2026-08-23 22:45:45.519+00	900000	Levantamiento de pesas infantiles	24	2026-08-23 22:48:22.288+00	2026-08-23 22:53:00.283+00	2
2026-08-23 22:45:45.519+00	900000	Puente de glúteos	30	2026-08-23 22:53:01.373+00	2026-08-23 22:54:44.261+00	3
2026-08-23 22:45:45.519+00	900000	Remo con banda	36	2026-08-23 22:54:45.077+00	2026-08-23 22:54:50.401+00	3
2026-08-23 22:45:45.519+00	900000	Sentadilla con apoyo	30	2026-08-23 22:54:51.56+00	2026-08-23 22:54:57.045+00	3
2026-08-23 22:45:45.519+00	900000	Abrazo de oso	1	2026-08-23 22:54:57.686+00	2026-08-23 22:54:59.045+00	1
2026-08-23 22:45:45.519+00	900000	Estiramiento pectoral en puerta	2	2026-08-23 22:54:59.961+00	2026-08-23 22:55:03.362+00	2
2026-08-26 10:09:13.836+00	900000	Marcha suave	1	2026-08-26 10:09:13.965+00	2026-08-26 10:09:27.437+00	1
2026-08-26 10:09:13.836+00	900000	Respiraciones de activación	8	2026-08-26 10:09:40.405+00	2026-08-26 10:10:29.054+00	1
2026-08-26 10:09:13.836+00	900000	Caminar en línea recta	3	2026-08-26 10:10:31.535+00	2026-08-26 10:10:49.933+00	3
2026-08-26 10:09:13.836+00	900000	Equilibrio monopodal	4	2026-08-26 10:10:54.546+00	2026-08-26 10:11:20.322+00	4
\.


--
-- Data for Name: exercise; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.exercise (name, description, category, difficulty) FROM stdin;
Marcha en el sitio	Caminar sin desplazarse, levantando las rodillas suavemente.	aerobic	easy
Saltos de tijera suaves	Jumping jacks a bajo impacto, sin despegar los pies del suelo.	aerobic	medium
Sentadilla con apoyo	Sentadilla sujetándose a una silla para mayor estabilidad.	strength	easy
Flexiones de pared	Flexiones apoyando las manos en la pared en lugar del suelo.	strength	easy
Estiramiento de isquiotibiales	Sentado, extender una pierna y alcanzar el pie suavemente.	flexibility	easy
Estiramiento de cuádriceps	De pie, doblar la rodilla y sujetar el tobillo con la mano.	flexibility	easy
Equilibrio monopodal	Mantenerse sobre un pie durante 10-30 segundos.	balance	easy
Caminar en línea recta	Caminar poniendo un pie delante del otro sobre una línea.	balance	easy
Bicicleta estática suave	Pedaleo a ritmo suave durante 10-15 minutos.	aerobic	easy
Yoga del guerrero I	Postura de guerrero I, manteniendo el equilibrio y la respiración.	balance	medium
Marcha suave	Caminar en el sitio elevando rodillas suavemente para activar el cuerpo	warmup	easy
Rotación de hombros	Rotar los hombros lentamente para movilizar la articulación	warmup	easy
Estirar cuádriceps	Sujetar el tobillo detrás y estirar suavemente el muslo delantero	stretching	easy
Giros de tronco helicóptero	De pie, girar suavemente el tronco de un lado a otro.	warmup	easy
Círculos de cadera	Dibujar círculos con la cadera como un hula-hoop	warmup	easy
Respiraciones de activación	Coger el aire elevando braxos al techo y soltar	warmup	easy
Marcha en el sitio rápida	Caminar en el sitio con ritmo enérgico y braceo.	aerobic	easy
Pasos laterales	Dar paso lateral a la derecha, juntar, y cambiar de lado	aerobic	medium
Levantamiento de pesas infantiles	Flexionar codos levantando botellitas de agua.	strength	easy
Puente de glúteos	Tumbado boca arriba, elevar la cadera del suelo.	strength	medium
Remo con banda	Sentado, sujetar banda con los pies y tirar hacia el ombligo.	strength	medium
Caminar de puntillas	Caminar apoyando solo las puntas de los pies.	balance	easy
Estatua a un pie	Caminar y congelarse a la pata coja al parar la música.	balance	hard
Alcance de puntas sentado	Sentado, ir alargando las manos hacia los pies de forma activa y repetida.	flexibility	easy
Movilidad Gato-Vaca	A gatas, arquear la espalda arriba y abajo fluidamente.	flexibility	medium
Zancada de gigante (Lunge)	Dar un paso muy largo hacia adelante y bajar un poco la cadera, alternando piernas.	flexibility	hard
Molino de brazos	Tumbado de lado, abrir el brazo superior hasta tocar el suelo al otro lado (forma de T).	flexibility	easy
Torsión de tronco sentado	Sentado, cruzar una pierna y girar el cuerpo mirando hacia atrás.	flexibility	easy
Estiramiento de mariposa	Sentado, juntar plantas de los pies, dejar caer rodillas y relajar.	stretching	easy
Postura de la semilla (Niño)	De rodillas, sentarse sobre los talones y estirar los brazos por el suelo hacia adelante.	stretching	easy
Abrazo de oso	Cruzar los brazos por delante del cuerpo abrazándose a sí mismo fuertemente.	stretching	easy
Estiramiento pectoral en puerta	Apoyar antebrazo en un marco de puerta y girar el cuerpo suavemente.	stretching	easy
\.


--
-- Data for Name: has; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.has (memorial, user_id) FROM stdin;
Mitocondrias	821011
Mitocondrias	900000
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.item (name, type, image, cost) FROM stdin;
Corona dorada	head		250
Camiseta deportiva	body		80
Capa de superhéroe	body		300
Guantes de boxeo	arms		120
Brazaletes de campeón	arms		90
Pantalón deportivo	legs		70
Mallas de velocidad	legs		150
Zapatillas rocket	feet		200
Botas de montaña	feet		180
Gafas de sol	face		60
Máscara de héroe	face		220
Mochila aventurera	accessory		130
Medalla de oro	accessory		400
Casco de campeón	head	uploads/customs/casco.png	100
\.


--
-- Data for Name: keep; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.keep (item, avatar, is_wearing) FROM stdin;
Casco de campeón	2	t
Casco de campeón	3	t
\.


--
-- Data for Name: measurement_parameter; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.measurement_parameter (name) FROM stdin;
Frecuencia cardiaca
Calorías
Minutos en zona activa
Sp02
VO2 Max
VFC
Electrocardiograma (ECG)
Presión arterial
Temperatura cutánea
Actividad electrodérmica (EDA)
SpO2
\.


--
-- Data for Name: memorial; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.memorial (name, description, image) FROM stdin;
El corazón en forma	El ejercicio regular fortalece el músculo cardíaco, haciendo que el corazón bombee sangre de forma más eficiente. Con tan solo 20 minutos al día de actividad moderada, tu corazón se vuelve más fuerte y resistente.	
Pulmones de acero	La actividad física aumenta la capacidad pulmonar. Con el ejercicio, tus pulmones aprenden a extraer más oxígeno del aire, lo que te da más energía durante el día.	
Huesos fuertes	El ejercicio de impacto moderado estimula la formación de hueso nuevo. Saltar, correr y caminar son actividades que mantienen tus huesos densos y resistentes a las fracturas.	
El secreto del buen humor	Cuando haces ejercicio, tu cerebro libera endorfinas, conocidas como las "hormonas de la felicidad". Por eso te sientes mejor después de una sesión de actividad física.	
Músculos en crecimiento	Los músculos crecen y se fortalecen cuando los ejercitas regularmente. Cada sesión de entrenamiento crea pequeñas fibras musculares nuevas que te hacen más fuerte.	
Dormir mejor	El ejercicio regular mejora la calidad del sueño. Las personas que se mueven durante el día se duermen más fácilmente y descansan más profundamente por la noche.	
El cerebro también entrena	La actividad física mejora la memoria y la concentración. El ejercicio aumenta el flujo de sangre al cerebro y favorece la creación de nuevas conexiones neuronales.	
Sistema inmune activo	El ejercicio moderado refuerza las defensas del cuerpo. Las personas activas tienen menos probabilidad de resfriarse y sus cuerpos combaten mejor las infecciones.	
Energía para todo el día	Aunque parezca contradictorio, gastar energía haciendo ejercicio te da más energía. El cuerpo se vuelve más eficiente produciendo y usando la energía que necesita.	
El poder del equilibrio	Los ejercicios de equilibrio fortalecen los músculos pequeños que rodean las articulaciones. Un buen equilibrio previene caídas y mejora la coordinación en todas las actividades.	
Flexibilidad es libertad	Los estiramientos mantienen los músculos largos y flexibles. Una buena flexibilidad reduce el riesgo de lesiones y hace que los movimientos del día a día sean más cómodos.	
El superhéroe interior	Cada vez que completas una sesión de ejercicio, tu cerebro registra ese logro y genera confianza. Con el tiempo, te sientes más capaz de afrontar cualquier reto.	
Mitocondrias	Forman parte de tus células y gracias a ellas te dan energía para saltar más alto!!	uploads/memorials/mitocondria.svg
\.


--
-- Data for Name: muscle_group; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.muscle_group (name) FROM stdin;
Core
Bíceps
Dorsal
Pectoral
Glúteos
Cuádriceps
\.


--
-- Data for Name: need; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.need (exercise, equipment) FROM stdin;
Bicicleta estática suave	Bicicleta estática
Sentadilla con apoyo	Silla
Estiramiento de isquiotibiales	Colchoneta
Estiramiento de cuádriceps	Colchoneta
Levantamiento de pesas infantiles	Mancuernas ligeras
Puente de glúteos	Esterilla
Remo con banda	Bandas elásticas
Yoga del guerrero I	Esterilla
Alcance de puntas sentado	Esterilla
Movilidad Gato-Vaca	Esterilla
Molino de brazos	Esterilla
Torsión de tronco sentado	Esterilla
Estiramiento de cuádriceps	Silla
Estiramiento de mariposa	Esterilla
Postura de la semilla (Niño)	Esterilla
\.


--
-- Data for Name: plan; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.plan (routine, exercise, num_reps, num_series, duration, rest) FROM stdin;
Cardio suave	Marcha suave	1	1	3	30
Cardio suave	Rotación de hombros	10	2	2	30
Cardio suave	Marcha en el sitio	1	1	5	60
Cardio suave	Pasos laterales	10	2	3	45
Cardio suave	Marcha en el sitio rápida	1	1	4	60
Cardio suave	Bicicleta estática suave	1	1	10	60
Cardio suave	Saltos de tijera suaves	15	2	3	60
Cardio suave	Estiramiento de mariposa	1	1	2	0
Cardio suave	Postura de la semilla (Niño)	1	1	2	0
Fuerza media	Giros de tronco helicóptero	10	1	2	30
Fuerza media	Círculos de cadera	10	1	2	30
Fuerza media	Sentadilla con apoyo	10	3	4	60
Fuerza media	Flexiones de pared	8	3	4	60
Fuerza media	Levantamiento de pesas infantiles	12	2	3	45
Fuerza media	Puente de glúteos	10	3	4	60
Fuerza media	Remo con banda	12	3	4	60
Fuerza media	Abrazo de oso	1	1	1	0
Fuerza media	Estiramiento pectoral en puerta	1	2	2	0
Control y equilibrio	Respiraciones de activación	8	1	2	30
Control y equilibrio	Marcha suave	1	1	3	30
Control y equilibrio	Equilibrio monopodal	1	4	2	30
Control y equilibrio	Caminar en línea recta	1	3	3	45
Control y equilibrio	Yoga del guerrero I	1	2	2	30
Control y equilibrio	Movilidad Gato-Vaca	10	2	3	30
Control y equilibrio	Alcance de puntas sentado	10	2	3	30
Control y equilibrio	Estiramiento de cuádriceps	1	2	2	0
Control y equilibrio	Estiramiento de isquiotibiales	1	2	2	0
Cardio suave (ajustada)	Bicicleta estática suave	1	1	5	60
Cardio suave (ajustada)	Estiramiento de mariposa	1	1	2	0
Cardio suave (ajustada)	Marcha en el sitio	1	1	5	60
Cardio suave (ajustada)	Marcha en el sitio rápida	1	1	4	60
Cardio suave (ajustada)	Marcha suave	1	1	3	30
Cardio suave (ajustada)	Pasos laterales	10	2	3	45
Cardio suave (ajustada)	Postura de la semilla (Niño)	1	1	2	0
Cardio suave (ajustada)	Rotación de hombros	10	2	2	30
Cardio suave (ajustada)	Saltos de tijera suaves	15	1	3	60
\.


--
-- Data for Name: presents; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.presents (clinical_profile, contraindication) FROM stdin;
821011	hearing
900000	osteoporosis_severe
\.


--
-- Data for Name: restricts; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.restricts (exercise, contraindication) FROM stdin;
Marcha suave	lower_limb
Rotación de hombros	upper_limb
Respiraciones de activación	upper_limb
Giros de tronco helicóptero	osteoporosis_severe
Giros de tronco helicóptero	balance
Círculos de cadera	balance
Saltos de tijera suaves	lower_limb
Saltos de tijera suaves	cardiotoxicity_severe
Saltos de tijera suaves	osteoporosis_severe
Marcha en el sitio rápida	lower_limb
Marcha en el sitio rápida	cardiotoxicity_severe
Bicicleta estática suave	lower_limb
Bicicleta estática suave	cardiotoxicity_severe
Pasos laterales	lower_limb
Pasos laterales	balance
Pasos laterales	cardiotoxicity_severe
Flexiones de pared	upper_limb
Flexiones de pared	osteoporosis_severe
Sentadilla con apoyo	lower_limb
Sentadilla con apoyo	neuropathy
Levantamiento de pesas infantiles	upper_limb
Puente de glúteos	lower_limb
Remo con banda	upper_limb
Remo con banda	vision
Equilibrio monopodal	balance
Equilibrio monopodal	lower_limb
Equilibrio monopodal	neuropathy
Caminar en línea recta	balance
Caminar en línea recta	vision
Caminar en línea recta	neuropathy
Caminar en línea recta	lower_limb
Yoga del guerrero I	balance
Yoga del guerrero I	lower_limb
Caminar de puntillas	lower_limb
Caminar de puntillas	neuropathy
Caminar de puntillas	balance
Estatua a un pie	hearing
Estatua a un pie	balance
Estatua a un pie	neuropathy
Estatua a un pie	lower_limb
Alcance de puntas sentado	lower_limb
Alcance de puntas sentado	osteoporosis_severe
Movilidad Gato-Vaca	upper_limb
Movilidad Gato-Vaca	lower_limb
Zancada de gigante (Lunge)	lower_limb
Zancada de gigante (Lunge)	balance
Molino de brazos	upper_limb
Torsión de tronco sentado	osteoporosis_severe
Estiramiento de cuádriceps	lower_limb
Estiramiento de cuádriceps	balance
Estiramiento de mariposa	lower_limb
Postura de la semilla (Niño)	lower_limb
Abrazo de oso	upper_limb
Estiramiento pectoral en puerta	upper_limb
\.


--
-- Data for Name: routine; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.routine (name, category, difficulty, assigned_user_id) FROM stdin;
Cardio Suave	aerobic	easy	\N
Fuerza Básica	strength	easy	\N
Flexibilidad Completa	flexibility	easy	\N
Equilibrio y Coordinación	balance	easy	\N
Cardio suave	aerobic	easy	\N
Fuerza media	strength	medium	\N
Control y equilibrio	balance	easy	\N
Cardio suave (ajustada)	aerobic	easy	900000
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.session (date, user_id, duration, routine, is_coop) FROM stdin;
2026-06-09 19:07:14.807+00	821011	1	Cardio Suave	f
2026-06-09 19:07:41.939+00	821011	1	Cardio Suave	f
2026-06-09 19:07:52.759+00	821011	1	Cardio Suave	f
2026-06-09 19:07:59.319+00	821011	1	Cardio Suave	f
2026-06-09 19:23:27.818+00	821011	1	Cardio Suave	f
2026-06-09 19:23:57.225+00	821011	1	Cardio Suave	f
2026-06-09 19:24:11.838+00	821011	1	Cardio Suave	f
2026-06-09 19:27:39.188+00	821011	1	Cardio Suave	f
2026-06-09 19:28:34.318+00	821011	1	Cardio Suave	f
2026-06-09 19:28:46.71+00	821011	1	Cardio Suave	f
2026-06-11 08:52:08.654+00	821011	1	Cardio Suave	f
2026-06-11 08:59:49.297+00	821011	1	Cardio Suave	f
2026-06-11 09:01:02.96+00	821011	1	Cardio Suave	f
2026-06-11 11:51:25.591+00	821011	1	Cardio Suave	f
2026-06-11 11:53:25.333+00	821011	1	Unknown	f
2026-06-11 11:53:40.166+00	821011	1	Cardio Suave	f
2026-06-11 12:05:43.293+00	821011	1	Cardio Suave	f
2026-06-11 19:37:23.149+00	821011	1	Cardio Suave	f
2026-06-11 20:01:58.475+00	821011	1	Cardio Suave	f
2026-06-11 20:03:32.701+00	821011	1	Unknown	f
2026-06-11 20:08:11.487+00	821011	1	Cardio Suave	f
2026-06-11 20:10:08.513+00	821011	1	Cardio Suave	f
2026-06-11 20:10:10.72+00	821011	1	Cardio Suave	f
2026-06-11 20:12:40.171+00	821011	1	Cardio Suave	f
2026-06-11 20:13:42.143+00	821011	1	Cardio Suave	f
2026-06-11 21:55:15.281+00	821011	1	Cardio Suave	f
2026-06-11 21:57:48.978+00	821011	1	Cardio Suave	f
2026-06-11 21:57:59.131+00	821011	1	Unknown	f
2026-06-11 21:58:12.76+00	821011	1	Cardio Suave	f
2026-06-12 15:44:14.992+00	821011	1	Cardio Suave	f
2026-06-12 15:49:33.258+00	821011	1	Cardio Suave	f
2026-06-12 15:54:33.006+00	821011	1	Cardio Suave	f
2026-06-12 16:03:54.708+00	821011	1	Cardio Suave	f
2026-06-12 16:04:18.002+00	821011	1	Cardio Suave	f
2026-07-03 17:45:50.302+00	821011	1	Cardio Suave	f
2026-07-03 17:46:15.136+00	821011	1	Cardio Suave	f
2026-07-04 23:27:09.51+00	821011	1	Equilibrio y Coordinación	f
2026-07-04 23:27:27.39+00	821011	1	Equilibrio y Coordinación	f
2026-07-05 21:48:36.956+00	821011	1	Equilibrio y Coordinación	f
2026-07-05 21:49:35.845+00	821011	1	Equilibrio y Coordinación	f
2026-07-05 22:01:44.126+00	821011	1	Equilibrio y Coordinación	f
2026-07-05 22:01:54.334+00	821011	1	Equilibrio y Coordinación	f
2026-07-08 10:22:53.898+00	821011	1	Equilibrio y Coordinación	f
2026-07-08 10:25:44.602+00	821011	1	Equilibrio y Coordinación	f
2026-07-12 23:46:27.889+00	821011	1	Equilibrio y Coordinación	f
2026-07-12 23:54:26.446+00	821011	1	Equilibrio y Coordinación	f
2026-07-12 23:56:03.802+00	821011	1	Equilibrio y Coordinación	f
2026-07-20 11:35:50.701+00	821011	1	Equilibrio y Coordinación	f
2026-07-30 12:29:50.091+00	821011	1	Equilibrio y Coordinación	f
2026-07-30 18:45:27.927+00	821011	1	Equilibrio y Coordinación	f
2026-07-30 21:28:00.01+00	821011	1	Equilibrio y Coordinación	f
2026-07-30 21:36:11.28+00	821011	1	Fuerza Básica	f
2026-07-31 19:41:28.965+00	821011	1	Equilibrio y Coordinación	f
2026-07-31 19:46:31.098+00	821011	1	Cardio Suave	f
2026-07-31 19:47:30.427+00	821011	1	Cardio Suave	f
2026-07-31 19:55:53.691+00	821011	1	Cardio Suave	f
2026-08-15 11:24:42.854+00	821011	1	Equilibrio y Coordinación	f
2026-08-20 12:53:23.753+00	821011	1	Equilibrio y Coordinación	t
2026-08-20 15:52:57.616+00	821011	1	Equilibrio y Coordinación	t
2026-08-23 21:03:48.993+00	821011	0	Cardio suave	f
2026-08-23 21:40:38.96+00	900000	36	Cardio suave	f
2026-08-23 22:45:45.519+00	900000	10	Fuerza media	t
2026-08-26 10:09:13.836+00	900000	0	Control y equilibrio	f
\.


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.steps (date, num_steps, is_reached, user_id) FROM stdin;
2026-06-08 22:00:00+00	5000	f	821011
2026-08-22 22:00:00+00	5000	f	900000
\.


--
-- Data for Name: supervisor_note; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.supervisor_note (clinical_profile, content, date) FROM stdin;
900000	Le he visto dolorido a la vira de estirar	2026-08-23 22:31:35.208+00
\.


--
-- Data for Name: train; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.train (exercise, muscle_group) FROM stdin;
Saltos de tijera suaves	Cuádriceps
Saltos de tijera suaves	Core
Marcha en el sitio rápida	Cuádriceps
Marcha en el sitio rápida	Glúteos
Bicicleta estática suave	Cuádriceps
Bicicleta estática suave	Glúteos
Pasos laterales	Cuádriceps
Pasos laterales	Glúteos
Sentadilla con apoyo	Cuádriceps
Sentadilla con apoyo	Glúteos
Flexiones de pared	Pectoral
Flexiones de pared	Bíceps
Levantamiento de pesas infantiles	Bíceps
Equilibrio monopodal	Core
Puente de glúteos	Glúteos
Yoga del guerrero I	Core
Puente de glúteos	Core
Remo con banda	Dorsal
Remo con banda	Bíceps
Marcha suave	Cuádriceps
Marcha suave	Glúteos
Rotación de hombros	Pectoral
Rotación de hombros	Dorsal
Giros de tronco helicóptero	Dorsal
Giros de tronco helicóptero	Core
Círculos de cadera	Core
Círculos de cadera	Glúteos
Respiraciones de activación	Core
Respiraciones de activación	Dorsal
Equilibrio monopodal	Cuádriceps
Caminar en línea recta	Cuádriceps
Caminar en línea recta	Core
Yoga del guerrero I	Cuádriceps
Yoga del guerrero I	Glúteos
Caminar de puntillas	Cuádriceps
Estatua a un pie	Cuádriceps
Estatua a un pie	Core
Alcance de puntas sentado	Dorsal
Movilidad Gato-Vaca	Core
Movilidad Gato-Vaca	Dorsal
Zancada de gigante (Lunge)	Cuádriceps
Zancada de gigante (Lunge)	Glúteos
Molino de brazos	Pectoral
Molino de brazos	Dorsal
Torsión de tronco sentado	Core
Estiramiento de cuádriceps	Cuádriceps
Estiramiento de mariposa	Glúteos
Postura de la semilla (Niño)	Dorsal
Postura de la semilla (Niño)	Core
Abrazo de oso	Dorsal
Estiramiento pectoral en puerta	Pectoral
Estiramiento pectoral en puerta	Bíceps
\.


--
-- Data for Name: use; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.use (exercise, measure_param) FROM stdin;
Bicicleta estática suave	Minutos en zona activa
Bicicleta estática suave	Calorías
Bicicleta estática suave	SpO2
Bicicleta estática suave	Frecuencia cardiaca
Marcha en el sitio	Frecuencia cardiaca
Bicicleta estática suave	VO2 Max
Marcha suave	Frecuencia cardiaca
Marcha suave	Temperatura cutánea
Rotación de hombros	Temperatura cutánea
Rotación de hombros	Frecuencia cardiaca
Giros de tronco helicóptero	Frecuencia cardiaca
Giros de tronco helicóptero	Temperatura cutánea
Círculos de cadera	Temperatura cutánea
Círculos de cadera	Frecuencia cardiaca
Respiraciones de activación	Frecuencia cardiaca
Respiraciones de activación	Temperatura cutánea
Saltos de tijera suaves	Frecuencia cardiaca
Saltos de tijera suaves	Minutos en zona activa
Saltos de tijera suaves	Calorías
Saltos de tijera suaves	Sp02
Saltos de tijera suaves	VO2 Max
Saltos de tijera suaves	Electrocardiograma (ECG)
Marcha en el sitio rápida	Electrocardiograma (ECG)
Marcha en el sitio rápida	VO2 Max
Marcha en el sitio rápida	Sp02
Marcha en el sitio rápida	Calorías
Marcha en el sitio rápida	Minutos en zona activa
Marcha en el sitio rápida	Frecuencia cardiaca
Bicicleta estática suave	Electrocardiograma (ECG)
Pasos laterales	Frecuencia cardiaca
Pasos laterales	Minutos en zona activa
Pasos laterales	Calorías
Pasos laterales	SpO2
Pasos laterales	VO2 Max
Pasos laterales	Electrocardiograma (ECG)
Flexiones de pared	Frecuencia cardiaca
Flexiones de pared	Calorías
Flexiones de pared	Minutos en zona activa
Flexiones de pared	Presión arterial
Sentadilla con apoyo	Frecuencia cardiaca
Sentadilla con apoyo	Calorías
Sentadilla con apoyo	Minutos en zona activa
Sentadilla con apoyo	Presión arterial
Levantamiento de pesas infantiles	Frecuencia cardiaca
Levantamiento de pesas infantiles	Calorías
Levantamiento de pesas infantiles	Minutos en zona activa
Levantamiento de pesas infantiles	Presión arterial
Puente de glúteos	Frecuencia cardiaca
Puente de glúteos	Calorías
Puente de glúteos	Minutos en zona activa
Puente de glúteos	Presión arterial
Remo con banda	Frecuencia cardiaca
Remo con banda	Calorías
Remo con banda	Minutos en zona activa
Remo con banda	Presión arterial
Equilibrio monopodal	Frecuencia cardiaca
Caminar en línea recta	Frecuencia cardiaca
Yoga del guerrero I	Frecuencia cardiaca
Caminar de puntillas	Frecuencia cardiaca
Estatua a un pie	Frecuencia cardiaca
Alcance de puntas sentado	Frecuencia cardiaca
Movilidad Gato-Vaca	Frecuencia cardiaca
Zancada de gigante (Lunge)	Frecuencia cardiaca
Molino de brazos	Frecuencia cardiaca
Torsión de tronco sentado	Frecuencia cardiaca
Estiramiento de cuádriceps	VFC
Estiramiento de cuádriceps	Actividad electrodérmica (EDA)
Estiramiento de cuádriceps	Frecuencia cardiaca
Estiramiento de mariposa	VFC
Estiramiento de mariposa	Actividad electrodérmica (EDA)
Estiramiento de mariposa	Frecuencia cardiaca
Postura de la semilla (Niño)	VFC
Postura de la semilla (Niño)	Actividad electrodérmica (EDA)
Postura de la semilla (Niño)	Frecuencia cardiaca
Abrazo de oso	VFC
Abrazo de oso	Actividad electrodérmica (EDA)
Abrazo de oso	Frecuencia cardiaca
Estiramiento pectoral en puerta	VFC
Estiramiento pectoral en puerta	Actividad electrodérmica (EDA)
Estiramiento pectoral en puerta	Frecuencia cardiaca
\.


--
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.user_account (id, avatar, password) FROM stdin;
821011	2	$2b$10$n6wqwvRFQ8TEtwPBpBcywuyAMJQXKd8tB.rTxuVVukzgpDSHBZzsy
900000	3	$2b$10$JUBioos759S6eZqK50yZoOgRm1M729u3ZrZeOriq3URXcSfZBNJ8C
\.


--
-- Data for Name: wellness_test; Type: TABLE DATA; Schema: public; Owner: admin_821011
--

COPY public.wellness_test (session, user_id, type, pain, sleepiness, mood, fatigue) FROM stdin;
2026-06-09 19:07:14.807+00	821011	initial	5	4	2	3
2026-06-09 19:07:41.939+00	821011	initial	1	2	3	3
2026-06-09 19:07:52.759+00	821011	initial	5	5	5	5
2026-06-09 19:07:59.319+00	821011	initial	4	4	4	4
2026-06-09 19:23:27.818+00	821011	initial	4	2	5	3
2026-06-09 19:23:57.225+00	821011	initial	4	2	5	1
2026-06-09 19:24:11.838+00	821011	initial	2	1	3	3
2026-06-09 19:27:39.188+00	821011	initial	4	3	2	1
2026-06-09 19:28:34.318+00	821011	initial	4	2	1	3
2026-06-09 19:28:46.71+00	821011	initial	1	1	5	2
2026-06-11 08:52:08.654+00	821011	initial	5	5	5	5
2026-06-11 08:59:49.297+00	821011	initial	5	5	5	5
2026-06-11 09:01:02.96+00	821011	initial	5	5	5	5
2026-06-11 11:51:25.591+00	821011	initial	5	5	5	5
2026-06-11 11:53:25.333+00	821011	initial	5	5	5	5
2026-06-11 11:53:40.166+00	821011	initial	5	5	5	5
2026-06-11 12:05:43.293+00	821011	initial	5	5	5	5
2026-06-11 21:57:59.131+00	821011	initial	5	5	5	5
2026-06-11 21:58:12.76+00	821011	initial	5	5	5	5
2026-06-12 15:44:14.992+00	821011	initial	5	5	5	5
2026-06-12 15:49:33.258+00	821011	initial	5	5	5	5
2026-06-12 15:54:33.006+00	821011	initial	5	5	5	5
2026-06-12 16:03:54.708+00	821011	initial	5	5	5	5
2026-06-12 16:04:18.002+00	821011	initial	5	5	5	5
2026-07-03 17:45:50.302+00	821011	initial	4	2	3	5
2026-07-03 17:46:15.136+00	821011	initial	4	4	3	3
2026-07-04 23:27:09.51+00	821011	initial	5	5	5	5
2026-07-04 23:27:27.39+00	821011	initial	3	3	3	3
2026-07-05 21:48:36.956+00	821011	initial	5	5	5	5
2026-07-05 21:49:35.845+00	821011	initial	5	5	5	5
2026-07-05 22:01:44.126+00	821011	initial	4	4	4	4
2026-07-05 22:01:54.334+00	821011	initial	4	3	1	4
2026-07-08 10:22:53.898+00	821011	initial	4	4	3	3
2026-07-08 10:25:44.602+00	821011	initial	4	5	5	5
2026-07-12 23:46:27.889+00	821011	initial	2	2	2	2
2026-07-12 23:54:26.446+00	821011	initial	2	2	2	2
2026-07-12 23:56:03.802+00	821011	initial	4	4	4	4
2026-07-20 11:35:50.701+00	821011	initial	4	4	4	4
2026-07-30 12:29:50.091+00	821011	initial	4	5	5	5
2026-07-30 12:29:50.091+00	821011	final	4	4	4	4
2026-07-30 18:45:27.927+00	821011	initial	5	5	5	5
2026-07-30 21:28:00.01+00	821011	initial	4	4	4	4
2026-07-30 21:28:00.01+00	821011	final	3	3	3	3
2026-07-30 21:36:11.28+00	821011	initial	4	4	4	4
2026-07-31 19:41:28.965+00	821011	initial	4	4	4	4
2026-07-31 19:46:31.098+00	821011	initial	4	4	4	4
2026-07-31 19:47:30.427+00	821011	initial	4	4	4	4
2026-07-31 19:55:53.691+00	821011	initial	4	4	4	4
2026-07-31 19:55:53.691+00	821011	final	4	4	4	4
2026-08-15 11:24:42.854+00	821011	initial	4	4	4	4
2026-08-20 12:53:23.753+00	821011	initial	4	4	4	4
2026-08-20 15:52:57.616+00	821011	initial	4	4	4	4
2026-08-23 21:03:48.993+00	821011	initial	4	4	4	4
2026-08-23 21:40:38.96+00	900000	initial	1	4	4	2
2026-08-23 21:40:38.96+00	900000	final	1	1	3	1
2026-08-23 22:45:45.519+00	900000	initial	3	4	4	2
2026-08-23 22:45:45.519+00	900000	final	4	3	4	3
2026-08-26 10:09:13.836+00	900000	initial	3	4	4	3
\.


--
-- Name: bgw_job_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.bgw_job_id_seq', 1000, false);


--
-- Name: chunk_column_stats_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_column_stats_id_seq', 1, false);


--
-- Name: chunk_constraint_name; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_constraint_name', 1, false);


--
-- Name: chunk_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_id_seq', 1, false);


--
-- Name: continuous_agg_migrate_plan_step_step_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.continuous_agg_migrate_plan_step_step_id_seq', 1, false);


--
-- Name: dimension_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.dimension_id_seq', 1, false);


--
-- Name: dimension_slice_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.dimension_slice_id_seq', 1, false);


--
-- Name: hypertable_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: admin_821011
--

SELECT pg_catalog.setval('_timescaledb_catalog.hypertable_id_seq', 1, false);


--
-- Name: avatar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin_821011
--

SELECT pg_catalog.setval('public.avatar_id_seq', 3, true);


--
-- Name: audiovisual audiovisual_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.audiovisual
    ADD CONSTRAINT audiovisual_pkey PRIMARY KEY (url);


--
-- Name: avatar avatar_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT avatar_pkey PRIMARY KEY (id);


--
-- Name: clinical_profile clinical_profile_omop_person_id_key; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.clinical_profile
    ADD CONSTRAINT clinical_profile_omop_person_id_key UNIQUE (omop_person_id);


--
-- Name: clinical_profile clinical_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.clinical_profile
    ADD CONSTRAINT clinical_profile_pkey PRIMARY KEY (id);


--
-- Name: complete complete_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_pkey PRIMARY KEY (challenge, avatar);


--
-- Name: contains contains_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_pkey PRIMARY KEY (exercise, audiovisual);


--
-- Name: contraindication contraindication_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.contraindication
    ADD CONSTRAINT contraindication_pkey PRIMARY KEY (name);


--
-- Name: coop_challenge coop_challenge_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.coop_challenge
    ADD CONSTRAINT coop_challenge_pkey PRIMARY KEY (name);


--
-- Name: coop_challenge coop_challenge_unique_memorial; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.coop_challenge
    ADD CONSTRAINT coop_challenge_unique_memorial UNIQUE (memorial);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (name);


--
-- Name: execute execute_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_pkey PRIMARY KEY (session, user_id, exercise);


--
-- Name: exercise exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.exercise
    ADD CONSTRAINT exercise_pkey PRIMARY KEY (name);


--
-- Name: has has_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_pkey PRIMARY KEY (memorial, user_id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (name);


--
-- Name: keep keep_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_pkey PRIMARY KEY (item, avatar);


--
-- Name: measurement_parameter measurement_parameter_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.measurement_parameter
    ADD CONSTRAINT measurement_parameter_pkey PRIMARY KEY (name);


--
-- Name: memorial memorial_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.memorial
    ADD CONSTRAINT memorial_pkey PRIMARY KEY (name);


--
-- Name: muscle_group muscle_group_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.muscle_group
    ADD CONSTRAINT muscle_group_pkey PRIMARY KEY (name);


--
-- Name: need need_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_pkey PRIMARY KEY (exercise, equipment);


--
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (routine, exercise);


--
-- Name: presents presents_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.presents
    ADD CONSTRAINT presents_pkey PRIMARY KEY (clinical_profile, contraindication);


--
-- Name: restricts restricts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.restricts
    ADD CONSTRAINT restricts_pkey PRIMARY KEY (exercise, contraindication);


--
-- Name: routine routine_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.routine
    ADD CONSTRAINT routine_pkey PRIMARY KEY (name);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (date, user_id);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (date, user_id);


--
-- Name: supervisor_note supervisor_note_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.supervisor_note
    ADD CONSTRAINT supervisor_note_pkey PRIMARY KEY (clinical_profile, date);


--
-- Name: train train_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_pkey PRIMARY KEY (exercise, muscle_group);


--
-- Name: use use_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_pkey PRIMARY KEY (exercise, measure_param);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: wellness_test wellness_test_pkey; Type: CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.wellness_test
    ADD CONSTRAINT wellness_test_pkey PRIMARY KEY (session, user_id, type);


--
-- Name: clinical_profile clinical_profile_user_account_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.clinical_profile
    ADD CONSTRAINT clinical_profile_user_account_fkey FOREIGN KEY (id) REFERENCES public.user_account(id);


--
-- Name: complete complete_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: complete complete_challenge_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_challenge_fkey FOREIGN KEY (challenge) REFERENCES public.coop_challenge(name);


--
-- Name: contains contains_audiovisual_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_audiovisual_fkey FOREIGN KEY (audiovisual) REFERENCES public.audiovisual(url);


--
-- Name: contains contains_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: coop_challenge coop_challenge_memorial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.coop_challenge
    ADD CONSTRAINT coop_challenge_memorial_fkey FOREIGN KEY (memorial) REFERENCES public.memorial(name);


--
-- Name: execute execute_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: execute execute_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_session_user_id_fkey FOREIGN KEY (session, user_id) REFERENCES public.session(date, user_id);


--
-- Name: has has_memorial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_memorial_fkey FOREIGN KEY (memorial) REFERENCES public.memorial(name);


--
-- Name: has has_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: keep keep_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: keep keep_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_item_fkey FOREIGN KEY (item) REFERENCES public.item(name);


--
-- Name: need need_equipment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_equipment_fkey FOREIGN KEY (equipment) REFERENCES public.equipment(name);


--
-- Name: need need_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: plan plan_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: plan plan_routine_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_routine_fkey FOREIGN KEY (routine) REFERENCES public.routine(name);


--
-- Name: presents presents_clinical_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.presents
    ADD CONSTRAINT presents_clinical_profile_fkey FOREIGN KEY (clinical_profile) REFERENCES public.clinical_profile(id);


--
-- Name: presents presents_contraindication_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.presents
    ADD CONSTRAINT presents_contraindication_fkey FOREIGN KEY (contraindication) REFERENCES public.contraindication(name);


--
-- Name: restricts restricts_contraindication_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.restricts
    ADD CONSTRAINT restricts_contraindication_fkey FOREIGN KEY (contraindication) REFERENCES public.contraindication(name);


--
-- Name: restricts restricts_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.restricts
    ADD CONSTRAINT restricts_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: routine routine_assigned_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.routine
    ADD CONSTRAINT routine_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES public.user_account(id);


--
-- Name: session session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: steps steps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: supervisor_note supervisor_note_clinical_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.supervisor_note
    ADD CONSTRAINT supervisor_note_clinical_profile_fkey FOREIGN KEY (clinical_profile) REFERENCES public.clinical_profile(id);


--
-- Name: train train_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: train train_muscle_group_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_muscle_group_fkey FOREIGN KEY (muscle_group) REFERENCES public.muscle_group(name);


--
-- Name: use use_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: use use_measure_param_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_measure_param_fkey FOREIGN KEY (measure_param) REFERENCES public.measurement_parameter(name);


--
-- Name: user_account user_account_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: wellness_test wellness_test_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin_821011
--

ALTER TABLE ONLY public.wellness_test
    ADD CONSTRAINT wellness_test_session_user_id_fkey FOREIGN KEY (session, user_id) REFERENCES public.session(date, user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict SvGV3wDBRoKAd6q6bD1wG2H3Nb2COsV1gCUiN9OR4YgweBcZSbVFdan1ngAPkHY

