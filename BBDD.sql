CREATE TABLE Item (
    name VARCHAR(255) PRIMARY KEY,
    type ENUM('head', 'body','legs', 'feet', 'arms', 'accessory', 'face'),
    image VARCHAR(255),
    cost NUMBER(3)
);

CREATE TABLE keep (
    item VARCHAR(255),
    avatar NUMBER,
    is_wearing BOOLEAN,
    PRIMARY KEY (item, avatar),
    FOREIGN KEY (item) REFERENCES Item(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Coop_challenge (
    name VARCHAR(255) PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'inactive'),
    total_steps NUMBER(10),
    sum_steps NUMBER(10),
);

CREATE TABLE complete (
    challenge VARCHAR(255),
    avatar NUMBER,
    PRIMARY KEY (challenge, avatar),
    FOREIGN KEY (challenge) REFERENCES Coop_challenge(name),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Avatar (
    id NUMBER PRIMARY KEY,
    FP NUMBER
);

CREATE TABLE User (
    id NUMBER PRIMARY KEY,
    avatar NUMBER,
    streak NUMBER,
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);

CREATE TABLE Steps (
    date DATE,
    num_steps NUMBER(10),
    is_reached BOOLEAN,
    user NUMBER,
    PRIMARY KEY (date, user),
    FOREIGN KEY (user) REFERENCES User(id)
);

CREATE TABLE Notification (
    date TIMESTAMP,
    status ENUM('read', 'unread'),
    text VARCHAR(255),
    type ENUM('session completed', 'reaction'),
    icon VARCHAR(255),
    u_sender NUMBER,
    u_receiver NUMBER,
    PRIMARY KEY (date, u_sender, u_receiver),
    FOREIGN KEY (u_sender) REFERENCES User(id),
    FOREIGN KEY (u_receiver) REFERENCES User(id)
);

-- friends
CREATE TABLE add (
    user1 NUMBER,
    user2 NUMBER,
    PRIMARY KEY (user1, user2),
    FOREIGN KEY (user1) REFERENCES User(id),
    FOREIGN KEY (user2) REFERENCES User(id)
);

CREATE TABLE Memorial (
    name VARCHAR(255) PRIMARY KEY,
    description TEXT,
    image VARCHAR(255)
);

CREATE TABLE has (
    memorial VARCHAR(255),
    user NUMBER,
    PRIMARY KEY (memorial, user),
    FOREIGN KEY (memorial) REFERENCES Memorial(name),
    FOREIGN KEY (user) REFERENCES User(id)
);


CREATE TABLE Routine (
    name VARCHAR(255) PRIMARY KEY,
    -- description TEXT
);

CREATE TABLE Session (
    date TIMESTAMP,
    user NUMBER,
    duration NUMBER(5), -- in minutes
    routine VARCHAR(255),
    is_coop BOOLEAN,
    PRIMARY KEY (date, user),
    FOREIGN KEY (user) REFERENCES User(id)
);

CREATE TABLE Wellness_test (
    session TIMESTAMP,
    user NUMBER,
    type ENUM('initial', 'final'),
    pain NUMBER(1), -- 1-5 scale
    sleepiness NUMBER(1),
    mood NUMBER(1), 
    fatigue NUMBER(1),
    PRIMARY KEY (session, user, type),
    FOREIGN KEY (session, user) REFERENCES Session(date, user)
);

CREATE TABLE Exercise (
    name VARCHAR(255) PRIMARY KEY,
    description TEXT,
    category ENUM('aerobic', 'strength', 'flexibility', 'balance'),
    difficulty ENUM('easy', 'medium', 'hard'),
);

CREATE TABLE plan (
    routine VARCHAR(255),
    exercise VARCHAR(255),
    num_reps NUMBER(3),
    num_series NUMBER(3),
    duration NUMBER(5), -- in minutes
    rest NUMBER(5), -- in seconds
    PRIMARY KEY (routine, exercise),
    FOREIGN KEY (routine) REFERENCES Routine(name),
    FOREIGN KEY (exercise) REFERENCES Exercise(name)
);

CREATE TABLE execute (
    session TIMESTAMP,
    exercise VARCHAR(255),
    num_reps_done NUMBER(3),
    time_initial TIMESTAMP,
    time_final TIMESTAMP,
    PRIMARY KEY (session, exercise),
    FOREIGN KEY (session) REFERENCES Session(date),
    FOREIGN KEY (exercise) REFERENCES Exercise(name)
);

CREATE TABLE Muscle_group (
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE train (
    exercise VARCHAR(255),
    muscle_group VARCHAR(255),
    PRIMARY KEY (exercise, muscle_group),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (muscle_group) REFERENCES Muscle_group(name)
);

CREATE TABLE Audiovisual(
    URL VARCHAR(255) PRIMARY KEY,
);

CREATE TABLE contains (
    exercise VARCHAR(255),
    audiovisual VARCHAR(255),
    PRIMARY KEY (exercise, audiovisual),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (audiovisual) REFERENCES Audiovisual(URL)
);

CREATE TABLE Measurement_parameter (
    name VARCHAR(255) PRIMARY KEY,
);

CREATE TABLE use (
    exercise VARCHAR(255),
    measure_param VARCHAR(255),
    PRIMARY KEY (exercise, measure_param),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (measure_param) REFERENCES Measurement_parameter(name)
);

CREATE TABLE Equipment (
    name VARCHAR(255) PRIMARY KEY,
);

CREATE TABLE need (
    exercise VARCHAR(255),
    equipment VARCHAR(255),
    PRIMARY KEY (exercise, equipment),
    FOREIGN KEY (exercise) REFERENCES Exercise(name),
    FOREIGN KEY (equipment) REFERENCES Equipment(name)
);