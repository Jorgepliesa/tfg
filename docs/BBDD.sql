CREATE TABLE Item (
    name VARCHAR(255),
    type ENUM('head', 'body','legs', 'feet', 'arms', 'accessory', 'face') NOT NULL,
    image VARCHAR(255) NOT NULL,
    cost NUMBER(3) NOT NULL,
    PRIMARY KEY (name),
    CHECK (cost > 0)
);

CREATE TABLE keep (
    item VARCHAR(255),
    avatar NUMBER,
    is_wearing BOOLEAN NOT NULL,
    PRIMARY KEY (item, avatar),
    FOREIGN KEY (item) REFERENCES Item(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Coop_challenge (
    name VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'inactive'),
    total_steps NUMBER(10) NOT NULL,
    PRIMARY KEY (name),
    CHECK (total_steps >= 0),
    CHECK (end_date > start_date)
);

CREATE TABLE complete (
    challenge VARCHAR(255),
    avatar NUMBER,
    PRIMARY KEY (challenge, avatar),
    FOREIGN KEY (challenge) REFERENCES Coop_challenge(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Avatar (
    id NUMBER,
    FP NUMBER NOT NULL,
    PRIMARY KEY (id),
    CHECK (FP >= 0)
);

CREATE TABLE User (
    id NUMBER,
    avatar NUMBER NOT NULL,
    streak NUMBER NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (avatar) REFERENCES Avatar(id),
    CHECK (streak >= 0)
);

CREATE TABLE Steps (
    date DATE,
    num_steps NUMBER(10) NOT NULL,
    is_reached BOOLEAN NOT NULL,
    user NUMBER,
    PRIMARY KEY (date, user),
    FOREIGN KEY (user) REFERENCES User(id),
    CHECK (num_steps >= 0)
);

CREATE TABLE Memorial (
    name VARCHAR(255),
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE has (
    memorial VARCHAR(255),
    user NUMBER,
    PRIMARY KEY (memorial, user),
    FOREIGN KEY (memorial) REFERENCES Memorial(name),
    FOREIGN KEY (user) REFERENCES User(id)
);


CREATE TABLE Routine (
    name VARCHAR(255),
    PRIMARY KEY (name)
    -- description TEXT
);

CREATE TABLE Session (
    date TIMESTAMP,
    user NUMBER,
    duration NUMBER(5) NOT NULL, -- in minutes
    routine VARCHAR(255) NOT NULL,
    is_coop BOOLEAN NOT NULL,
    PRIMARY KEY (date, user),
    FOREIGN KEY (user) REFERENCES User(id),
    CHECK (duration > 0)
);

CREATE TABLE Wellness_test (
    session TIMESTAMP,
    user NUMBER,
    type ENUM('initial', 'final'),
    pain NUMBER(1) NOT NULL, -- 1-5 scale
    sleepiness NUMBER(1) NOT NULL,
    mood NUMBER(1) NOT NULL, 
    fatigue NUMBER(1) NOT NULL,
    PRIMARY KEY (session, user, type),
    FOREIGN KEY (session, user) REFERENCES Session(date, user),
    CONSTRAINT c_pain CHECK (pain >= 1 AND pain <= 5),
    CONSTRAINT c_sleepiness CHECK (sleepiness >= 1 AND sleepiness <= 5),
    CONSTRAINT c_mood CHECK (mood >= 1 AND mood <= 5),
    CONSTRAINT c_fatigue CHECK (fatigue >= 1 AND fatigue <= 5
);

CREATE TABLE Exercise (
    name VARCHAR(255),
    description TEXT NOT NULL,
    category ENUM('aerobic', 'strength', 'flexibility', 'balance') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE plan (
    routine VARCHAR(255),
    exercise VARCHAR(255),
    num_reps NUMBER(3) NOT NULL,
    num_series NUMBER(3) NOT NULL,
    duration NUMBER(5) NOT NULL, -- in minutes
    rest NUMBER(5) NOT NULL, -- in seconds
    PRIMARY KEY (routine, exercise),
    FOREIGN KEY (routine) REFERENCES Routine(name),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    CHECK (num_reps > 0),
    CHECK (num_series > 0),
    CHECK (duration > 0),
    CHECK (rest >= 0)
);

CREATE TABLE execute (
    session TIMESTAMP,
    exercise VARCHAR(255),
    num_reps_done NUMBER(3) NOT NULL,
    t_initial TIMESTAMP NOT NULL,
    t_final TIMESTAMP NOT NULL,
    PRIMARY KEY (session, exercise),
    FOREIGN KEY (session) REFERENCES Session(date),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    CHECK (num_reps_done >= 0),
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