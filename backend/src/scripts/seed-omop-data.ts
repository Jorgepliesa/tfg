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
    // ── Conexión 1: fitgame (leer usuarios y sesiones) ────────────────────────
    const mainDS = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'admin_821011',
        password: process.env.DB_PASSWORD || '0000',
        database: process.env.DB_NAME || 'fitgame',
        synchronize: false,
        entities: [],
    });

    // ── Conexión 2: omop_healthgame (escribir mediciones OMOP) ───────────────
    // Extraemos los datos de la URL OMOP o construimos desde variables individuales
    const omopUrl = process.env.OMOP_DATABASE_URL;
    let omopDS: DataSource;
    if (omopUrl) {
        omopDS = new DataSource({ type: 'postgres', url: omopUrl, synchronize: false, entities: [] });
    } else {
        omopDS = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'admin_821011',
            password: process.env.DB_PASSWORD || '0000',
            database: 'omop_healthgame',
            synchronize: false,
            entities: [],
        });
    }

    await mainDS.initialize();
    await omopDS.initialize();
    console.log('✅ Conectado a fitgame (main) y omop_healthgame (OMOP)');


    try {
        console.log('  ✓ Usando esquemas y tablas existentes de omop_healthgame');

        // ── 1. Leer usuarios desde fitgame y vincular omop_person_id ─────────────

        const users: { id: number }[] = await mainDS.query(`SELECT id FROM user_account`);
        if (users.length === 0) {
            console.log('⚠️ No hay usuarios en fitgame. Ejecuta primero los seeds de usuarios.');
            return;
        }

        for (const u of users) {
            const userId = u.id;
            const omopPersonId = userId; // Vinculamos 1:1 person_id con user_id

            // Asegurar perfil clínico en fitgame (mainDS)
            await mainDS.query(`
                INSERT INTO clinical_profile (id, omop_person_id, age, biological_sex, height, weight, birth_date, diagnosis, treatment_end_date, hospital)
                VALUES ($1, $2, 12, 'male', 145, 38, '2012-05-15', 'Leucemia linfoblástica aguda', '2026-12-31', 'Hospital Niño Jesús')
                ON CONFLICT (id) DO UPDATE SET omop_person_id = $2;
            `, [userId, omopPersonId]);

            // Asegurar registro en omop_modified.person en omop_healthgame (omopDS)
            // gender_concept_id=8507 (MALE), race_concept_id=8527 (White), ethnicity_concept_id=8657
            // Son NOT NULL con FK a omop_cdm.concept — usamos IDs válidos de la instancia
            await omopDS.query(`
                INSERT INTO omop_modified.person (person_id, gender_concept_id, year_of_birth, month_of_birth, day_of_birth, race_concept_id, ethnicity_concept_id)
                VALUES ($1, 8507, 2012, 5, 15, 8527, 8657)
                ON CONFLICT (person_id) DO NOTHING;
            `, [omopPersonId]);
        }

        console.log(`  ✓ Vinculados ${users.length} usuarios con omop_person_id`);

        // ── 4. Limpiar mediciones previas en omop_healthgame ─────────────────────
        await omopDS.query(`DELETE FROM omop_modified.measurement`);
        await omopDS.query(`DELETE FROM custom.daily_summary`);

        // ── 5. Generar mediciones de frecuencia cardíaca durante las sesiones ─────
        for (const u of users) {
            const userId = u.id;
            const omopPersonId = userId;

            // Leer sesiones desde fitgame (mainDS)
            let sessions: { date: Date; duration: number; routine: string }[] = await mainDS.query(`
                SELECT date, duration, routine FROM session WHERE user_id = $1 ORDER BY date DESC
            `, [userId]);

            if (sessions.length === 0) {
                // Si el usuario no tiene sesiones, crear algunas de prueba en fitgame
                const now = new Date();
                for (let s = 0; s < 5; s++) {
                    const sessionDate = new Date(now.getTime() - (s * 2 + 1) * 24 * 3600 * 1000);
                    sessionDate.setHours(17, 30, 0, 0);
                    const duration = 25; // 25 min

                    await mainDS.query(`
                        INSERT INTO session (date, user_id, routine, is_coop, duration)
                        VALUES ($1, $2, 'Rutina de Fuerza y Resistencia', false, $3)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, duration]);

                    // Añadir test inicial y final de bienestar
                    await mainDS.query(`
                        INSERT INTO wellness_test (session, user_id, type, pain, fatigue, sleepiness, mood)
                        VALUES ($1, $2, 'initial', $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, 3, 4, 3, 2 + (s % 3)]);

                    await mainDS.query(`
                        INSERT INTO wellness_test (session, user_id, type, pain, fatigue, sleepiness, mood)
                        VALUES ($1, $2, 'final', $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING;
                    `, [sessionDate, userId, 2, 3, 2, 4 + (s % 2)]);

                    sessions.push({ date: sessionDate, duration, routine: 'Rutina de Fuerza y Resistencia' });
                }
            }

            // Para cada sesión, generar serie de FC realista en omop_healthgame (omopDS)
            for (const s of sessions) {
                const startTime = new Date(s.date);
                // Si duration es 0 usar 20 min como mínimo para generar datos útiles
                const durationMinutes = Math.max(s.duration || 20, 20);
                const totalSeconds = durationMinutes * 60;

                let currentHr = 85 + Math.floor(Math.random() * 10);

                for (let sec = 0; sec <= totalSeconds; sec += 30) {
                    const sampleTime = new Date(startTime.getTime() + sec * 1000);
                    const sampleDateStr = sampleTime.toISOString().slice(0, 10);

                    // Curva realista: calentamiento → pico → enfriamiento
                    const progress = sec / totalSeconds;
                    let targetHr = 90;

                    if (progress < 0.2) {
                        targetHr = 90 + progress * 5 * 40; // 90 → 130
                    } else if (progress < 0.8) {
                        targetHr = 135 + Math.sin(progress * 10) * 15; // 120–150
                    } else {
                        targetHr = 140 - (progress - 0.8) * 5 * 45; // 140 → 95
                    }

                    const noise = (Math.random() - 0.5) * 6;
                    currentHr = Math.round(targetHr + noise);

                    await omopDS.query(`
                        INSERT INTO omop_modified.measurement (person_id, measurement_concept_id, measurement_date, measurement_datetime, value_as_number, unit_source_value)
                        VALUES ($1, $2, $3, $4, $5, 'bpm');
                    `, [omopPersonId, CONCEPT.HEART_RATE, sampleDateStr, sampleTime, currentHr]);

                    // SpO2 (~97-99%)
                    if (sec % 60 === 0) {
                        const spo2 = Math.round(97 + Math.random() * 2);
                        await omopDS.query(`
                            INSERT INTO omop_modified.measurement (person_id, measurement_concept_id, measurement_date, measurement_datetime, value_as_number, unit_source_value)
                            VALUES ($1, $2, $3, $4, $5, '%');
                        `, [omopPersonId, CONCEPT.SPO2, sampleDateStr, sampleTime, spo2]);
                    }
                }
            }

            // ── 6. Generar resúmenes diarios en omop_healthgame ──────────────────
            const now = new Date();
            for (let d = 0; d < 14; d++) {
                const dateObj = new Date(now.getTime() - d * 24 * 3600 * 1000);
                const dateStr = dateObj.toISOString().slice(0, 10);
                const steps = Math.floor(3500 + Math.random() * 4500);
                const minHr = Math.floor(62 + Math.random() * 8);
                const maxHr = Math.floor(145 + Math.random() * 20);
                const avgHr = Math.floor(78 + Math.random() * 12);
                const spo2Avg = Number((97.5 + Math.random() * 1.5).toFixed(1));

                await omopDS.query(`
                    INSERT INTO custom.daily_summary (date, person_id, steps, min_hr_bpm, max_hr_bpm, avg_hr_bpm, sleep_duration_minutes, min_rr_bpm, max_rr_bpm, spo2_avg)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 14, 22, $8)
                    ON CONFLICT (date, person_id) DO UPDATE SET
                        steps = EXCLUDED.steps,
                        avg_hr_bpm = EXCLUDED.avg_hr_bpm;
                `, [dateStr, omopPersonId, steps, minHr, maxHr, avgHr, 480, spo2Avg]);
            }

            console.log(`  ✓ Generados datos OMOP para usuario ${userId} en omop_healthgame`);
        }

        console.log('\n🎉 ¡Base de datos OMOP poblada correctamente en omop_healthgame!');
    } catch (err) {
        console.error('❌ Error al poblar OMOP:', err);
    } finally {
        await mainDS.destroy();
        await omopDS.destroy();
    }
}

seedOmopData();
