CREATE TYPE item_type AS ENUM ('head', 'body','legs', 'feet', 'arms', 'accessory', 'face');
CREATE TYPE challenge_type AS ENUM ('active', 'inactive');
CREATE TYPE wellness_type AS ENUM ('initial', 'final');
CREATE TYPE category_type AS ENUM ('aerobic', 'strength', 'flexibility', 'balance', 'warmup', 'stretching');
CREATE TYPE difficulty_type AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE biological_sex_type AS ENUM ('male', 'female');
CREATE TYPE tanner_stage_type AS ENUM ('I', 'II', 'III', 'IV', 'V');

CREATE TABLE Item (
    name VARCHAR(255),
    type item_type NOT NULL,
    image VARCHAR(255) NOT NULL,
    cost INT NOT NULL,
    PRIMARY KEY (name),
    CHECK (cost > 0 AND cost < 1000)
);

CREATE TABLE Avatar (
    id SERIAL,
    FP INT NOT NULL,
    PRIMARY KEY (id),
    CHECK (FP >= 0)
);

CREATE TABLE keep (
    item VARCHAR(255),
    avatar INT,
    is_wearing BOOLEAN NOT NULL,
    PRIMARY KEY (item, avatar),
    FOREIGN KEY (item) REFERENCES Item(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Coop_challenge (
    name VARCHAR(255),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status challenge_type NOT NULL,
    total_steps INT NOT NULL,
    PRIMARY KEY (name),
    CHECK (total_steps >= 0 AND total_steps < 1000000),
    CHECK (end_date > start_date)
);

CREATE TABLE complete (
    challenge VARCHAR(255),
    avatar INT,
    PRIMARY KEY (challenge, avatar),
    FOREIGN KEY (challenge) REFERENCES Coop_challenge(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Clinical_Profile (
    id SERIAL,
    age INT,
    biological_sex biological_sex_type,
    height INT,
    weight INT,
    bmi INT,
    bmi_percentile INT,
    birth_date DATE,
    diagnosis VARCHAR(100),
    tanner_stage tanner_stage_type,
    treatment_end_date DATE,
    hospital VARCHAR(255),
    prior_conditions TEXT,
    current_comorbidities TEXT,
    family_history TEXT,
    PRIMARY KEY (id),
    CHECK (age >= 0 AND age < 100),
    CHECK (height >= 0 AND height < 200),
    CHECK (weight >= 0 AND weight < 1000),
    CHECK (birth_date < CURRENT_DATE)
);

CREATE TABLE contraindication (
    name VARCHAR(255),
    description TEXT,
    PRIMARY KEY (name)
);

CREATE TABLE presents (
    clinical_profile INT NOT NULL,
    contraindication VARCHAR(255) NOT NULL,
    PRIMARY KEY (clinical_profile, contraindication),
    FOREIGN KEY (clinical_profile) REFERENCES Clinical_Profile(id),
    FOREIGN KEY (contraindication) REFERENCES contraindication(name)
);

CREATE TABLE restricts (
    exercise VARCHAR(255),
    contraindication VARCHAR(255) NOT NULL,
    PRIMARY KEY (exercise, contraindication),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (contraindication) REFERENCES contraindication(name)
);

CREATE TABLE User_Account (
    id INT,
    avatar INT NOT NULL,
    streak INT NOT NULL,
    clinical_profile INT UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (avatar) REFERENCES Avatar(id),
    FOREIGN KEY (clinical_profile) REFERENCES Clinical_Profile(id),
    CHECK (streak >= 0)
);

CREATE TABLE Supervisor_Note (
    clinical_profile INT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(clinical_profile, date),
    FOREIGN KEY (clinical_profile) REFERENCES Clinical_Profile(id)
);

CREATE TABLE Steps (
    date TIMESTAMPTZ,
    num_steps INT NOT NULL,
    is_reached BOOLEAN NOT NULL,
    user_id INT,
    PRIMARY KEY (date, user_id),
    FOREIGN KEY (user_id) REFERENCES User_Account(id),
    CHECK (num_steps >= 0 AND num_steps < 1000000)
);

CREATE TABLE Memorial (
    name VARCHAR(255),
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE has (
    memorial VARCHAR(255),
    user_id INT,
    PRIMARY KEY (memorial, user_id),
    FOREIGN KEY (memorial) REFERENCES Memorial(name),
    FOREIGN KEY (user_id) REFERENCES User_Account(id)
);


CREATE TABLE Routine (
    name VARCHAR(255),
    category category_type NOT NULL,
    difficulty difficulty_type NOT NULL,
    PRIMARY KEY (name)
    -- description TEXT
);

CREATE TABLE Session (
    date TIMESTAMPTZ,
    user_id INT,
    duration NUMERIC NOT NULL, -- in minutes
    routine VARCHAR(255) NOT NULL,
    is_coop BOOLEAN NOT NULL,
    PRIMARY KEY (date, user_id),
    FOREIGN KEY (user_id) REFERENCES User_Account(id),
    CHECK (duration >= 0 AND duration < 1440) -- no puede durar más de un día
);

CREATE TABLE Wellness_test (
    session TIMESTAMPTZ,
    user_id INT,
    type wellness_type NOT NULL,
    pain INT NOT NULL, -- 1-5 scale
    sleepiness INT NOT NULL,
    mood INT NOT NULL, 
    fatigue INT NOT NULL,
    PRIMARY KEY (session, user_id, type),
    FOREIGN KEY (session, user_id) REFERENCES Session(date, user_id),
    CONSTRAINT c_pain CHECK (pain >= 1 AND pain <= 5),
    CONSTRAINT c_sleepiness CHECK (sleepiness >= 1 AND sleepiness <= 5),
    CONSTRAINT c_mood CHECK (mood >= 1 AND mood <= 5),
    CONSTRAINT c_fatigue CHECK (fatigue >= 1 AND fatigue <= 5)
);

CREATE TABLE Exercise (
    name VARCHAR(255),
    description TEXT NOT NULL,
    category category_type NOT NULL,
    difficulty difficulty_type NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE plan (
    routine VARCHAR(255),
    exercise VARCHAR(255),
    num_reps INT NOT NULL,
    num_series INT NOT NULL,
    duration NUMERIC, -- in minutes
    rest INT NOT NULL, -- in seconds
    PRIMARY KEY (routine, exercise),
    FOREIGN KEY (routine) REFERENCES Routine(name),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    CHECK (num_reps > 0 AND num_reps < 1000),
    CHECK (num_series > 0 AND num_series < 100),
    CHECK (duration > 0 AND duration < 1440),
    CHECK (rest >= 0 AND rest < 3600)
);

CREATE TABLE execute (
    session TIMESTAMPTZ,
    user_id INT,
    exercise VARCHAR(255),
    num_reps_done INT NOT NULL,
    num_series_done INT NOT NULL,
    t_initial TIMESTAMPTZ NOT NULL,
    t_final TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (session, user_id, exercise),
    FOREIGN KEY (session, user_id) REFERENCES Session(date, user_id),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    CHECK (num_reps_done >= 0 AND num_reps_done < 1000),
    CHECK (t_final > t_initial)
);

CREATE TABLE Muscle_group (
    name VARCHAR(255),
    PRIMARY KEY (name)
);

CREATE TABLE train (
    exercise VARCHAR(255),
    muscle_group VARCHAR(255),
    PRIMARY KEY (exercise, muscle_group),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (muscle_group) REFERENCES Muscle_group(name)
);

CREATE TABLE Audiovisual(
    URL VARCHAR(255),
    PRIMARY KEY (URL)
);

CREATE TABLE contains (
    exercise VARCHAR(255),
    audiovisual VARCHAR(255),
    PRIMARY KEY (exercise, audiovisual),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (audiovisual) REFERENCES Audiovisual(URL)
);

CREATE TABLE Measurement_parameter (
    name VARCHAR(255),
    PRIMARY KEY (name)
);

CREATE TABLE use (
    exercise VARCHAR(255),
    measure_param VARCHAR(255),
    PRIMARY KEY (exercise, measure_param),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (measure_param) REFERENCES Measurement_parameter(name)
);

CREATE TABLE Equipment (
    name VARCHAR(255),
    PRIMARY KEY (name)
);

CREATE TABLE need (
    exercise VARCHAR(255),
    equipment VARCHAR(255),
    PRIMARY KEY (exercise, equipment),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (equipment) REFERENCES Equipment(name)
);