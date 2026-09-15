import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Concept IDs del vocabulario OMOP
const CONCEPT = {
    HEART_RATE: 3027018,
    STEPS: 40758552,
    RESP_RATE: 3024171,
    SPO2: 40762499,
};

async function seedOmopData() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'admin_821011',
        password: process.env.DB_PASSWORD || '0000',
        database: process.env.DB_NAME || 'fitgame',
        synchronize: false,
        entities: [],
    });

    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos para poblar OMOP');

    try {
        // ── 1. Crear esquemas si no existen ──────────────────────────────────────
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS omop_cdm;`);
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS omop_modified;`);
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS custom;`);

        // ── 2. Crear tablas OMOP necesarias ──────────────────────────────────────
        await dataSource.query(`
            CREATE TABLE IF NOT EXISTS omop_modified.person (
                person_id               INTEGER PRIMARY KEY,
                gender_concept_id       INTEGER,
                year_of_birth           INTEGER NOT NULL,
                month_of_birth          INTEGER,
                day_of_birth            INTEGER,
                race_concept_id         INTEGER,
                ethnicity_concept_id    INTEGER
            );
        `);

        await dataSource.query(`
            CREATE SEQUENCE IF NOT EXISTS omop_modified.measurement_id_seq;
        `);

        await dataSource.query(`
            CREATE TABLE IF NOT EXISTS omop_modified.measurement (
                measurement_id              INTEGER PRIMARY KEY DEFAULT nextval('omop_modified.measurement_id_seq'),
                person_id                   INTEGER NOT NULL REFERENCES omop_modified.person(person_id),
                measurement_concept_id      INTEGER NOT NULL,
                measurement_date            DATE NOT NULL,
                measurement_datetime        TIMESTAMPTZ,
                measurement_type_concept_id INTEGER,
                value_as_number             NUMERIC,
                unit_concept_id             INTEGER,
                range_low                   NUMERIC,
                range_high                  NUMERIC,
                measurement_source_value    VARCHAR(50),
                unit_source_value           VARCHAR(50)
            );
        `);

        await dataSource.query(`
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
        `);

        console.log('  ✓ Esquemas y tablas OMOP verificados');

        // ── 3. Obtener usuarios y asegurar perfiles clínicos y vínculo omop_person_id ──
        const users: { id: number }[] = await dataSource.query(`SELECT id FROM user_account`);
        if (users.length === 0) {
            console.log('⚠️ No hay usuarios en la base de datos. Ejecuta primero los seeds de usuarios.');
            return;
        }

        for (const u of users) {
            const userId = u.id;
            const omopPersonId = userId; // Vinculamos 1:1 person_id con user_id

            // Asegurar perfil clínico
            await dataSource.query(`
                INSERT INTO clinical_profile (id, omop_person_id, age, biological_sex, height, weight, birth_date, diagnosis, treatment_end_date, hospital)
                VALUES ($1, $2, 12, 'male', 145, 38, '2012-05-15', 'Leucemia linfoblástica aguda', '2026-12-31', 'Hospital Niño Jesús')
                ON CONFLICT (id) DO UPDATE SET omop_person_id = $2;
            `, [userId, omopPersonId]);

            // Asegurar registro en omop_modified.person
            await dataSource.query(`
                INSERT INTO omop_modified.person (person_id, year_of_birth, month_of_birth, day_of_birth)
                VALUES ($1, 2012, 5, 15)
                ON CONFLICT (person_id) DO NOTHING;
            `, [omopPersonId]);
        }

        console.log(`  ✓ Vinculados ${users.length} usuarios con omop_person_id`);

        // ── 4. Limpiar mediciones previas de OMOP para evitar duplicados ──────────
        await dataSource.query(`DELETE FROM omop_modified.measurement`);
        await dataSource.query(`DELETE FROM custom.daily_summary`);

        // ── 5. Generar mediciones de frecuencia cardíaca durante las sesiones ─────
        for (const u of users) {
            const userId = u.id;
            const omopPersonId = userId;

            // Buscar sesiones del usuario
            const sessions: { date: Date; duration: number; routine: string }[] = await dataSource.query(`
                SELECT date, duration, routine FROM session WHERE user_id = $1 ORDER BY date DESC
            `, [userId]);

            if (sessions.length === 0) {
                // Si el usuario no tiene sesiones, creamos algunas sesiones de prueba recientes
                const now = new Date();
                for (let s = 0; s < 5; s++) {
                    const sessionDate = new Date(now.getTime() - (s * 2 + 1) * 24 * 3600 * 1000);
                    sessionDate.setHours(17, 30, 0, 0);
                    const duration = 25; // 25 min

                    await dataSource.query(`
                        INSERT INTO session (date, user_id, routine, is_coop, duration)
                        VALUES ($1, $2, 'Rutina de Fuerza y Resistencia', false, $3)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, duration]);

                    // Añadir test inicial y final de bienestar
                    await dataSource.query(`
                        INSERT INTO wellness_test (session, user_id, type, pain, fatigue, sleepiness, mood)
                        VALUES ($1, $2, 'initial', $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, 3, 4, 3, 2 + (s % 3)]);

                    await dataSource.query(`
                        INSERT INTO wellness_test (session, user_id, type, pain, fatigue, sleepiness, mood)
                        VALUES ($1, $2, 'final', $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, 2, 3, 2, 4 + (s % 2)]);

                    sessions.push({ date: sessionDate, duration, routine: 'Rutina de Fuerza y Resistencia' });
                }
            }

            // Para cada sesión, generar serie de frecuencia cardíaca realista
            for (const s of sessions) {
                const startTime = new Date(s.date);
                const durationMinutes = Math.max(s.duration || 20, 10);
                const totalSeconds = durationMinutes * 60;

                // Generar puntos de FC cada 30 segundos
                let currentHr = 85 + Math.floor(Math.random() * 10); // reposo previo

                for (let sec = 0; sec <= totalSeconds; sec += 30) {
                    const sampleTime = new Date(startTime.getTime() + sec * 1000);
                    const sampleDateStr = sampleTime.toISOString().slice(0, 10);

                    // Curva realista de FC durante el ejercicio:
                    // Primer tercio: sube progresivamente hasta 130-150 bpm
                    // Segundo tercio: se mantiene alta con ligeras fluctuaciones (135-160 bpm)
                    // Último tercio (enfriamiento): baja progresivamente hasta 95-105 bpm
                    const progress = sec / totalSeconds;
                    let targetHr = 90;

                    if (progress < 0.2) {
                        targetHr = 90 + progress * 5 * 40; // 90 -> 130
                    } else if (progress < 0.8) {
                        targetHr = 135 + Math.sin(progress * 10) * 15; // 120-150
                    } else {
                        targetHr = 140 - (progress - 0.8) * 5 * 45; // 140 -> 95
                    }

                    const noise = (Math.random() - 0.5) * 6;
                    currentHr = Math.round(targetHr + noise);

                    await dataSource.query(`
                        INSERT INTO omop_modified.measurement (person_id, measurement_concept_id, measurement_date, measurement_datetime, value_as_number, unit_source_value)
                        VALUES ($1, $2, $3, $4, $5, 'bpm');
                    `, [omopPersonId, CONCEPT.HEART_RATE, sampleDateStr, sampleTime, currentHr]);

                    // SpO2 (~97-99%)
                    if (sec % 60 === 0) {
                        const spo2 = Math.round(97 + Math.random() * 2);
                        await dataSource.query(`
                            INSERT INTO omop_modified.measurement (person_id, measurement_concept_id, measurement_date, measurement_datetime, value_as_number, unit_source_value)
                            VALUES ($1, $2, $3, $4, $5, '%');
                        `, [omopPersonId, CONCEPT.SPO2, sampleDateStr, sampleTime, spo2]);
                    }
                }
            }

            // ── 6. Generar resúmenes diarios (pasos, HR min/max/avg) para los últimos 14 días ──
            const now = new Date();
            for (let d = 0; d < 14; d++) {
                const dateObj = new Date(now.getTime() - d * 24 * 3600 * 1000);
                const dateStr = dateObj.toISOString().slice(0, 10);
                const steps = Math.floor(3500 + Math.random() * 4500);
                const minHr = Math.floor(62 + Math.random() * 8);
                const maxHr = Math.floor(145 + Math.random() * 20);
                const avgHr = Math.floor(78 + Math.random() * 12);
                const spo2Avg = Number((97.5 + Math.random() * 1.5).toFixed(1));

                await dataSource.query(`
                    INSERT INTO custom.daily_summary (date, person_id, steps, min_hr_bpm, max_hr_bpm, avg_hr_bpm, sleep_duration_minutes, min_rr_bpm, max_rr_bpm, spo2_avg)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 14, 22, $8)
                    ON CONFLICT (date, person_id) DO UPDATE SET
                        steps = EXCLUDED.steps,
                        avg_hr_bpm = EXCLUDED.avg_hr_bpm;
                `, [dateStr, omopPersonId, steps, minHr, maxHr, avgHr, 480, spo2Avg]);
            }

            console.log(`  ✓ Generados datos OMOP de frecuencia cardíaca y resumen diario para el usuario ${userId}`);
        }

        console.log('\n🎉 ¡Base de datos OMOP poblada correctamente con éxito!');
    } catch (err) {
        console.error('❌ Error al poblar OMOP:', err);
    } finally {
        await dataSource.destroy();
    }
}

seedOmopData();
