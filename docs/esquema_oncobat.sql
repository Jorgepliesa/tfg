--
-- PostgreSQL database dump
--

\restrict 11lgthB50axuevYg0TAQe1Osnyi84Rso47EJ2MY1EpHYeCcWHQhMev1YBJvUMKJ

-- Dumped from database version 16.11
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: timescaledb; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA public;


--
-- Name: EXTENSION timescaledb; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION timescaledb IS 'Enables scalable inserts and complex queries for time-series data (Community Edition)';


--
-- Name: category_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.category_type AS ENUM (
    'aerobic',
    'strength',
    'flexibility',
    'balance'
);


--
-- Name: challenge_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.challenge_type AS ENUM (
    'active',
    'inactive'
);


--
-- Name: difficulty_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.difficulty_type AS ENUM (
    'easy',
    'medium',
    'hard'
);


--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: item_type; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: wellness_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.wellness_type AS ENUM (
    'initial',
    'final'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audiovisual; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audiovisual (
    url character varying(255) NOT NULL
);


--
-- Name: avatar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avatar (
    id integer NOT NULL,
    fp integer NOT NULL,
    CONSTRAINT avatar_fp_check CHECK ((fp >= 0))
);


--
-- Name: avatar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.avatar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: avatar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.avatar_id_seq OWNED BY public.avatar.id;


--
-- Name: clinical_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinical_profile (
    id integer NOT NULL,
    age integer,
    gender public.gender_type,
    height integer,
    weight integer,
    birth_date date,
    diagnosis character varying(100),
    treatment_end_date date,
    hospital character varying(255),
    CONSTRAINT clinical_profile_age_check CHECK (((age >= 0) AND (age < 100))),
    CONSTRAINT clinical_profile_birth_date_check CHECK ((birth_date < CURRENT_DATE)),
    CONSTRAINT clinical_profile_height_check CHECK (((height >= 0) AND (height < 200))),
    CONSTRAINT clinical_profile_weight_check CHECK (((weight >= 0) AND (weight < 1000)))
);


--
-- Name: clinical_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinical_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clinical_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinical_profile_id_seq OWNED BY public.clinical_profile.id;


--
-- Name: complete; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complete (
    challenge character varying(255) NOT NULL,
    avatar integer NOT NULL
);


--
-- Name: contains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contains (
    exercise character varying(255) NOT NULL,
    audiovisual character varying(255) NOT NULL
);


--
-- Name: coop_challenge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coop_challenge (
    name character varying(255) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status public.challenge_type NOT NULL,
    total_steps integer NOT NULL,
    CONSTRAINT coop_challenge_check CHECK ((end_date > start_date)),
    CONSTRAINT coop_challenge_total_steps_check CHECK (((total_steps >= 0) AND (total_steps < 1000000)))
);


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    name character varying(255) NOT NULL
);


--
-- Name: execute; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: exercise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise (
    name character varying(255) NOT NULL,
    description text NOT NULL,
    category public.category_type NOT NULL,
    difficulty public.difficulty_type NOT NULL
);


--
-- Name: has; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.has (
    memorial character varying(255) NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item (
    name character varying(255) NOT NULL,
    type public.item_type NOT NULL,
    image character varying(255) NOT NULL,
    cost integer NOT NULL,
    CONSTRAINT item_cost_check CHECK (((cost > 0) AND (cost < 1000)))
);


--
-- Name: keep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.keep (
    item character varying(255) NOT NULL,
    avatar integer NOT NULL,
    is_wearing boolean NOT NULL
);


--
-- Name: measurement_parameter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurement_parameter (
    name character varying(255) NOT NULL
);


--
-- Name: memorial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memorial (
    name character varying(255) NOT NULL,
    description text NOT NULL,
    image character varying(255) NOT NULL
);


--
-- Name: muscle_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.muscle_group (
    name character varying(255) NOT NULL
);


--
-- Name: need; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.need (
    exercise character varying(255) NOT NULL,
    equipment character varying(255) NOT NULL
);


--
-- Name: plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan (
    routine character varying(255) NOT NULL,
    exercise character varying(255) NOT NULL,
    num_reps integer NOT NULL,
    num_series integer NOT NULL,
    duration numeric NOT NULL,
    rest integer NOT NULL,
    CONSTRAINT plan_duration_check CHECK (((duration > (0)::numeric) AND (duration < (1440)::numeric))),
    CONSTRAINT plan_num_reps_check CHECK (((num_reps > 0) AND (num_reps < 1000))),
    CONSTRAINT plan_num_series_check CHECK (((num_series > 0) AND (num_series < 100))),
    CONSTRAINT plan_rest_check CHECK (((rest >= 0) AND (rest < 3600)))
);


--
-- Name: routine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routine (
    name character varying(255) NOT NULL,
    category public.category_type NOT NULL,
    difficulty public.difficulty_type NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    date timestamp with time zone NOT NULL,
    user_id integer NOT NULL,
    duration numeric NOT NULL,
    routine character varying(255) NOT NULL,
    is_coop boolean NOT NULL,
    CONSTRAINT session_duration_check CHECK (((duration >= (0)::numeric) AND (duration < (1440)::numeric)))
);


--
-- Name: steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.steps (
    date timestamp with time zone NOT NULL,
    num_steps integer NOT NULL,
    is_reached boolean NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT steps_num_steps_check CHECK (((num_steps >= 0) AND (num_steps < 1000000)))
);


--
-- Name: supervisor_note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisor_note (
    clinical_profile integer NOT NULL,
    content text NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: train; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.train (
    exercise character varying(255) NOT NULL,
    muscle_group character varying(255) NOT NULL
);


--
-- Name: use; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.use (
    exercise character varying(255) NOT NULL,
    measure_param character varying(255) NOT NULL
);


--
-- Name: user_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_account (
    id integer NOT NULL,
    avatar integer NOT NULL,
    streak integer NOT NULL,
    clinical_profile integer NOT NULL,
    password character varying(255) NOT NULL,
    CONSTRAINT user_account_streak_check CHECK ((streak >= 0))
);


--
-- Name: wellness_test; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: avatar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatar ALTER COLUMN id SET DEFAULT nextval('public.avatar_id_seq'::regclass);


--
-- Name: clinical_profile id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_profile ALTER COLUMN id SET DEFAULT nextval('public.clinical_profile_id_seq'::regclass);


--
-- Data for Name: hypertable; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.hypertable (id, schema_name, table_name, associated_schema_name, associated_table_prefix, num_dimensions, chunk_sizing_func_schema, chunk_sizing_func_name, chunk_target_size, compression_state, compressed_hypertable_id, status) FROM stdin;
\.


--
-- Data for Name: bgw_job; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.bgw_job (id, application_name, schedule_interval, max_runtime, max_retries, retry_period, proc_schema, proc_name, owner, scheduled, fixed_schedule, initial_start, hypertable_id, config, check_schema, check_name, timezone) FROM stdin;
\.


--
-- Data for Name: chunk; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.chunk (id, hypertable_id, schema_name, table_name, compressed_chunk_id, dropped, status, osm_chunk, creation_time) FROM stdin;
\.


--
-- Data for Name: chunk_column_stats; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.chunk_column_stats (id, hypertable_id, chunk_id, column_name, range_start, range_end, valid) FROM stdin;
\.


--
-- Data for Name: dimension; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.dimension (id, hypertable_id, column_name, column_type, aligned, num_slices, partitioning_func_schema, partitioning_func, interval_length, compress_interval_length, integer_now_func_schema, integer_now_func) FROM stdin;
\.


--
-- Data for Name: dimension_slice; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.dimension_slice (id, dimension_id, range_start, range_end) FROM stdin;
\.


--
-- Data for Name: chunk_constraint; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.chunk_constraint (chunk_id, dimension_slice_id, constraint_name, hypertable_constraint_name) FROM stdin;
\.


--
-- Data for Name: compression_chunk_size; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.compression_chunk_size (chunk_id, compressed_chunk_id, uncompressed_heap_size, uncompressed_toast_size, uncompressed_index_size, compressed_heap_size, compressed_toast_size, compressed_index_size, numrows_pre_compression, numrows_post_compression, numrows_frozen_immediately) FROM stdin;
\.


--
-- Data for Name: compression_settings; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.compression_settings (relid, compress_relid, segmentby, orderby, orderby_desc, orderby_nullsfirst, index) FROM stdin;
\.


--
-- Data for Name: continuous_agg; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_agg (mat_hypertable_id, raw_hypertable_id, parent_mat_hypertable_id, user_view_schema, user_view_name, partial_view_schema, partial_view_name, direct_view_schema, direct_view_name, materialized_only) FROM stdin;
\.


--
-- Data for Name: continuous_agg_migrate_plan; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_agg_migrate_plan (mat_hypertable_id, start_ts, end_ts, user_view_definition) FROM stdin;
\.


--
-- Data for Name: continuous_agg_migrate_plan_step; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_agg_migrate_plan_step (mat_hypertable_id, step_id, status, start_ts, end_ts, type, config) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_bucket_function; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_bucket_function (mat_hypertable_id, bucket_func, bucket_width, bucket_origin, bucket_offset, bucket_timezone, bucket_fixed_width) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_hypertable_invalidation_log; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_hypertable_invalidation_log (hypertable_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_invalidation_threshold; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_invalidation_threshold (hypertable_id, watermark) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_materialization_invalidation_log; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_materialization_invalidation_log (materialization_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_materialization_ranges; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_materialization_ranges (materialization_id, lowest_modified_value, greatest_modified_value) FROM stdin;
\.


--
-- Data for Name: continuous_aggs_watermark; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.continuous_aggs_watermark (mat_hypertable_id, watermark) FROM stdin;
\.


--
-- Data for Name: metadata; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.metadata (key, value, include_in_telemetry) FROM stdin;
install_timestamp	2026-04-18 14:36:47.890206+00	t
timescaledb_version	2.25.2	f
exported_uuid	3a285203-30d8-4289-a219-25750add090f	t
\.


--
-- Data for Name: tablespace; Type: TABLE DATA; Schema: _timescaledb_catalog; Owner: -
--

COPY _timescaledb_catalog.tablespace (id, hypertable_id, tablespace_name) FROM stdin;
\.


--
-- Data for Name: audiovisual; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audiovisual (url) FROM stdin;
\.


--
-- Data for Name: avatar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.avatar (id, fp) FROM stdin;
2	100
\.


--
-- Data for Name: clinical_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clinical_profile (id, age, gender, height, weight, birth_date, diagnosis, treatment_end_date, hospital) FROM stdin;
1	\N	\N	\N	\N	\N	\N	\N	\N
2	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: complete; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complete (challenge, avatar) FROM stdin;
\.


--
-- Data for Name: contains; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contains (exercise, audiovisual) FROM stdin;
\.


--
-- Data for Name: coop_challenge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coop_challenge (name, start_date, end_date, status, total_steps) FROM stdin;
El Dragón del Sedentarismo	2026-06-07 17:29:26.872+00	2026-06-14 17:29:26.872+00	active	100000
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment (name) FROM stdin;
\.


--
-- Data for Name: execute; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: exercise; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: has; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.has (memorial, user_id) FROM stdin;
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.item (name, type, image, cost) FROM stdin;
Casco de campeón	head		100
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
\.


--
-- Data for Name: keep; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.keep (item, avatar, is_wearing) FROM stdin;
\.


--
-- Data for Name: measurement_parameter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.measurement_parameter (name) FROM stdin;
\.


--
-- Data for Name: memorial; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: muscle_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.muscle_group (name) FROM stdin;
\.


--
-- Data for Name: need; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.need (exercise, equipment) FROM stdin;
\.


--
-- Data for Name: plan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan (routine, exercise, num_reps, num_series, duration, rest) FROM stdin;
Cardio Suave	Marcha en el sitio	20	2	5	60
Cardio Suave	Bicicleta estática suave	1	1	10	120
Fuerza Básica	Sentadilla con apoyo	10	3	3	90
Fuerza Básica	Flexiones de pared	8	3	3	90
Flexibilidad Completa	Estiramiento de isquiotibiales	3	2	4	30
Flexibilidad Completa	Estiramiento de cuádriceps	3	2	4	30
Equilibrio y Coordinación	Equilibrio monopodal	5	3	3	45
Equilibrio y Coordinación	Caminar en línea recta	5	2	3	30
\.


--
-- Data for Name: routine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.routine (name, category, difficulty) FROM stdin;
Cardio Suave	aerobic	easy
Fuerza Básica	strength	easy
Flexibilidad Completa	flexibility	easy
Equilibrio y Coordinación	balance	easy
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.steps (date, num_steps, is_reached, user_id) FROM stdin;
2026-06-08 22:00:00+00	5000	f	821011
\.


--
-- Data for Name: supervisor_note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisor_note (clinical_profile, content, date) FROM stdin;
\.


--
-- Data for Name: train; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.train (exercise, muscle_group) FROM stdin;
\.


--
-- Data for Name: use; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.use (exercise, measure_param) FROM stdin;
\.


--
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_account (id, avatar, streak, clinical_profile, password) FROM stdin;
821011	2	0	2	$2b$10$n6wqwvRFQ8TEtwPBpBcywuyAMJQXKd8tB.rTxuVVukzgpDSHBZzsy
\.


--
-- Data for Name: wellness_test; Type: TABLE DATA; Schema: public; Owner: -
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
\.


--
-- Name: bgw_job_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.bgw_job_id_seq', 1000, false);


--
-- Name: chunk_column_stats_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_column_stats_id_seq', 1, false);


--
-- Name: chunk_constraint_name; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_constraint_name', 1, false);


--
-- Name: chunk_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.chunk_id_seq', 1, false);


--
-- Name: continuous_agg_migrate_plan_step_step_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.continuous_agg_migrate_plan_step_step_id_seq', 1, false);


--
-- Name: dimension_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.dimension_id_seq', 1, false);


--
-- Name: dimension_slice_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.dimension_slice_id_seq', 1, false);


--
-- Name: hypertable_id_seq; Type: SEQUENCE SET; Schema: _timescaledb_catalog; Owner: -
--

SELECT pg_catalog.setval('_timescaledb_catalog.hypertable_id_seq', 1, false);


--
-- Name: avatar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.avatar_id_seq', 2, true);


--
-- Name: clinical_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clinical_profile_id_seq', 2, true);


--
-- Name: audiovisual audiovisual_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audiovisual
    ADD CONSTRAINT audiovisual_pkey PRIMARY KEY (url);


--
-- Name: avatar avatar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT avatar_pkey PRIMARY KEY (id);


--
-- Name: clinical_profile clinical_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_profile
    ADD CONSTRAINT clinical_profile_pkey PRIMARY KEY (id);


--
-- Name: complete complete_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_pkey PRIMARY KEY (challenge, avatar);


--
-- Name: contains contains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_pkey PRIMARY KEY (exercise, audiovisual);


--
-- Name: coop_challenge coop_challenge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coop_challenge
    ADD CONSTRAINT coop_challenge_pkey PRIMARY KEY (name);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (name);


--
-- Name: execute execute_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_pkey PRIMARY KEY (session, user_id, exercise);


--
-- Name: exercise exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise
    ADD CONSTRAINT exercise_pkey PRIMARY KEY (name);


--
-- Name: has has_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_pkey PRIMARY KEY (memorial, user_id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (name);


--
-- Name: keep keep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_pkey PRIMARY KEY (item, avatar);


--
-- Name: measurement_parameter measurement_parameter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_parameter
    ADD CONSTRAINT measurement_parameter_pkey PRIMARY KEY (name);


--
-- Name: memorial memorial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial
    ADD CONSTRAINT memorial_pkey PRIMARY KEY (name);


--
-- Name: muscle_group muscle_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.muscle_group
    ADD CONSTRAINT muscle_group_pkey PRIMARY KEY (name);


--
-- Name: need need_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_pkey PRIMARY KEY (exercise, equipment);


--
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (routine, exercise);


--
-- Name: routine routine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routine
    ADD CONSTRAINT routine_pkey PRIMARY KEY (name);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (date, user_id);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (date, user_id);


--
-- Name: supervisor_note supervisor_note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_note
    ADD CONSTRAINT supervisor_note_pkey PRIMARY KEY (clinical_profile, date);


--
-- Name: train train_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_pkey PRIMARY KEY (exercise, muscle_group);


--
-- Name: use use_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_pkey PRIMARY KEY (exercise, measure_param);


--
-- Name: user_account user_account_clinical_profile_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_clinical_profile_key UNIQUE (clinical_profile);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: wellness_test wellness_test_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wellness_test
    ADD CONSTRAINT wellness_test_pkey PRIMARY KEY (session, user_id, type);


--
-- Name: complete complete_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: complete complete_challenge_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complete
    ADD CONSTRAINT complete_challenge_fkey FOREIGN KEY (challenge) REFERENCES public.coop_challenge(name);


--
-- Name: contains contains_audiovisual_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_audiovisual_fkey FOREIGN KEY (audiovisual) REFERENCES public.audiovisual(url);


--
-- Name: contains contains_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contains
    ADD CONSTRAINT contains_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: execute execute_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: execute execute_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.execute
    ADD CONSTRAINT execute_session_user_id_fkey FOREIGN KEY (session, user_id) REFERENCES public.session(date, user_id);


--
-- Name: has has_memorial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_memorial_fkey FOREIGN KEY (memorial) REFERENCES public.memorial(name);


--
-- Name: has has_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.has
    ADD CONSTRAINT has_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: keep keep_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: keep keep_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.keep
    ADD CONSTRAINT keep_item_fkey FOREIGN KEY (item) REFERENCES public.item(name);


--
-- Name: need need_equipment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_equipment_fkey FOREIGN KEY (equipment) REFERENCES public.equipment(name);


--
-- Name: need need_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: plan plan_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: plan plan_routine_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_routine_fkey FOREIGN KEY (routine) REFERENCES public.routine(name);


--
-- Name: session session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: steps steps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: supervisor_note supervisor_note_clinical_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_note
    ADD CONSTRAINT supervisor_note_clinical_profile_fkey FOREIGN KEY (clinical_profile) REFERENCES public.clinical_profile(id);


--
-- Name: train train_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: train train_muscle_group_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_muscle_group_fkey FOREIGN KEY (muscle_group) REFERENCES public.muscle_group(name);


--
-- Name: use use_exercise_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercise(name);


--
-- Name: use use_measure_param_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.use
    ADD CONSTRAINT use_measure_param_fkey FOREIGN KEY (measure_param) REFERENCES public.measurement_parameter(name);


--
-- Name: user_account user_account_avatar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_avatar_fkey FOREIGN KEY (avatar) REFERENCES public.avatar(id);


--
-- Name: user_account user_account_clinical_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_clinical_profile_fkey FOREIGN KEY (clinical_profile) REFERENCES public.clinical_profile(id);


--
-- Name: wellness_test wellness_test_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wellness_test
    ADD CONSTRAINT wellness_test_session_user_id_fkey FOREIGN KEY (session, user_id) REFERENCES public.session(date, user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 11lgthB50axuevYg0TAQe1Osnyi84Rso47EJ2MY1EpHYeCcWHQhMev1YBJvUMKJ

