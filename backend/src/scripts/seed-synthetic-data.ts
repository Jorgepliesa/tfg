import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import { UserAccount } from '../entities/UserAccount';
import { Avatar } from '../entities/Avatar';
import { ClinicalProfile, BiologicalSex } from '../entities/ClinicalProfile';
import { Session } from '../entities/Session';
import { WellnessTest, WellnessTestType } from '../entities/WellnessTest';
import { Steps } from '../entities/Steps';
import { Execute } from '../entities/Execute';
import { Item } from '../entities/Item';
import { Keep } from '../entities/Keep';
import { Routine } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Exercise } from '../entities/Exercise';
import { Memorial } from '../entities/Memorial';
import { SupervisorNote } from '../entities/SupervisorNote';
import { CoopChallenge, CoopChallengeStatus } from '../entities/CoopChallenge';
import { Complete } from '../entities/Complete';
import { Audiovisual } from '../entities/Audiovisual';
import { MuscleGroup } from '../entities/MuscleGroup';
import { Equipment } from '../entities/Equipment';
import { MeasurementParameter } from '../entities/MeasurementParameter';
import { Has } from '../entities/Has';

dotenv.config();

// ─── Configuración ──────────────────────────────────────────────────────────
const SYNTHETIC_ID_BASE = 900000; // IDs >= esto se consideran sintéticos (no toca al 821011)
const NUM_USERS = parseInt(process.env.SEED_NUM_USERS || '12', 10);
const DAYS_HISTORY = parseInt(process.env.SEED_DAYS_HISTORY || '42', 10); // 6 semanas
const CLEAN_ONLY = process.argv.includes('--clean');

const HOSPITALS = [
    'Hospital La Paz', 'Hospital Niño Jesús', 'Hospital Sant Joan de Déu',
    'Hospital Vall d\'Hebron', 'Hospital Gregorio Marañón',
];
const DIAGNOSES = [
    'Leucemia linfoblástica aguda', 'Linfoma de Hodgkin', 'Neuroblastoma',
    'Tumor de Wilms', 'Osteosarcoma', 'Meduloblastoma', 'Rabdomiosarcoma',
];
const NOTE_TEMPLATES = [
    'Sesión completada sin incidencias.',
    'Refirió cansancio mayor de lo habitual, se acortó la rutina.',
    'Muy motivado hoy, pidió repetir ejercicios.',
    'Náuseas leves tras el ejercicio, controladas.',
    'Faltó a la sesión programada por revisión médica.',
    'Buen progreso en flexibilidad esta semana.',
    'Familia reporta mejor calidad de sueño esta semana.',
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(val)));
const chance = (p: number) => Math.random() < p;

function dateAt(daysAgo: number, hour: number, minute: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d;
}

function midnight(daysAgo: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
}

async function bootstrap() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'admin_821011',
        password: process.env.DB_PASSWORD || '0000',
        database: process.env.DB_NAME || 'fitgame',
        entities: [
            UserAccount, Avatar, ClinicalProfile, Session, WellnessTest, Steps,
            Execute, Item, Keep, Routine, Plan, Exercise, Memorial, Has,
            SupervisorNote, CoopChallenge, Complete, Audiovisual, MuscleGroup,
            Equipment, MeasurementParameter,
        ],
        synchronize: false,
    });

    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const userRepo = dataSource.getRepository(UserAccount);
    const avatarRepo = dataSource.getRepository(Avatar);
    const profileRepo = dataSource.getRepository(ClinicalProfile);
    const sessionRepo = dataSource.getRepository(Session);
    const wellnessRepo = dataSource.getRepository(WellnessTest);
    const stepsRepo = dataSource.getRepository(Steps);
    const executeRepo = dataSource.getRepository(Execute);
    const keepRepo = dataSource.getRepository(Keep);
    const hasRepo = dataSource.getRepository(Has);
    const noteRepo = dataSource.getRepository(SupervisorNote);
    const routineRepo = dataSource.getRepository(Routine);
    const itemRepo = dataSource.getRepository(Item);
    const memorialRepo = dataSource.getRepository(Memorial);
    const challengeRepo = dataSource.getRepository(CoopChallenge);

    try {
        // ── 1. Limpieza de datos sintéticos previos (idempotente) ────────────────
        console.log('\n🧹 Limpiando datos sintéticos previos...');
        const synthUsers = (await userRepo
            .createQueryBuilder('u')
            .where('u.id >= :base', { base: SYNTHETIC_ID_BASE })
            .getMany());

        if (synthUsers.length > 0) {
            const userIds = synthUsers.map((u) => u.id);
            const avatarIds = synthUsers.map((u) => u.avatar);
            const profileIds = userIds;

            await hasRepo.delete({ userId: In(userIds) });
            await wellnessRepo.delete({ userId: In(userIds) });
            await executeRepo.delete({ userId: In(userIds) });
            await sessionRepo.delete({ userId: In(userIds) });
            await noteRepo.delete({ clinicalProfile: In(profileIds) });
            await stepsRepo.delete({ userId: In(userIds) });
            await keepRepo.delete({ avatar: In(avatarIds) });
            await profileRepo.delete({ id: In(profileIds) });
            await userRepo.delete({ id: In(userIds) });
            await avatarRepo.delete({ id: In(avatarIds) });
            console.log(`  ✓ Eliminados ${synthUsers.length} usuarios sintéticos y sus datos asociados`);
        } else {
            console.log('  ✓ No había datos sintéticos previos');
        }

        if (CLEAN_ONLY) {
            console.log('\n✅ Limpieza completada (--clean). No se generan datos nuevos.');
            return;
        }

        // ── 2. Cargar catálogos base (deben existir: npm run seed) ───────────────
        const routines = await routineRepo.find({
            relations: ['plans', 'plans.exerciseEntity'],
        });
        const routinesWithPlans = routines.filter((r) => r.plans && r.plans.length > 0);
        const items = await itemRepo.find();
        const memorials = await memorialRepo.find();

        if (routinesWithPlans.length === 0) {
            throw new Error(
                'No hay rutinas con ejercicios en la BBDD. Ejecuta primero: npm run seed',
            );
        }

        // ── 3. Asegurar un reto cooperativo activo ────────────────────────────────
        let activeChallenge = await challengeRepo.findOne({
            where: { status: CoopChallengeStatus.ACTIVE },
        });
        if (!activeChallenge) {
            const startDate = dateAt(DAYS_HISTORY, 0, 0);
            const endDate = dateAt(-7, 0, 0); // termina dentro de 7 días
            activeChallenge = await challengeRepo.save(
                challengeRepo.create({
                    name: 'El Dragón del Sedentarismo',
                    startDate,
                    endDate,
                    status: CoopChallengeStatus.ACTIVE,
                    totalSteps: 100000,
                }),
            );
            console.log('  ✓ Reto cooperativo activo creado');
        }

        // ── 4. Generar usuarios sintéticos ────────────────────────────────────────
        console.log(`\n👤 Generando ${NUM_USERS} usuarios sintéticos con ${DAYS_HISTORY} días de historial...`);
        const hashedPassword = await bcrypt.hash('1234', 10);

        for (let u = 0; u < NUM_USERS; u++) {
            const userId = SYNTHETIC_ID_BASE + u;
            const age = randInt(5, 12);
            const gender = pick([BiologicalSex.MALE, BiologicalSex.FEMALE]);
            const height = clamp(100 + age * 6 + randInt(-8, 8), 90, 170);
            const weight = clamp(15 + age * 3 + randInt(-5, 5), 12, 60);

            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - age);
            birthDate.setDate(birthDate.getDate() - randInt(0, 364));

            const treatmentEndDate = new Date();
            treatmentEndDate.setDate(treatmentEndDate.getDate() - randInt(-90, 400));

            // Avatar, usuario y perfil clínico
            const avatar = await avatarRepo.save(avatarRepo.create({ fp: 0 }));

            const user = userRepo.create({
                id: userId,
                password: hashedPassword,
                avatar: avatar.id,
            });
            await userRepo.save(user);

            const profile = await profileRepo.save(
                profileRepo.create({
                    id: userId,
                    age,
                    biologicalSex: gender,
                    height,
                    weight,
                    birthDate,
                    diagnosis: pick(DIAGNOSES),
                    treatmentEndDate,
                    hospital: pick(HOSPITALS),
                }),
            );

            // Perfil de "adherencia" del usuario: unos son constantes, otros irregulares
            const adherenceRate = 0.35 + Math.random() * 0.5; // 35%-85% de días con sesión

            let fp = 0;
            let streakCounter = 0;
            let maxStreak = 0;
            let sessionsCount = 0;

            for (let dayIndex = DAYS_HISTORY; dayIndex >= 0; dayIndex--) {
                const isWeekend = [0, 6].includes(midnight(dayIndex).getDay());
                const weekIndex = Math.floor((DAYS_HISTORY - dayIndex) / 7); // 0 = semana más antigua

                // ── Pasos diarios ──
                const baseSteps = isWeekend ? randInt(1500, 6000) : randInt(2500, 9000);
                const numSteps = clamp(baseSteps + randInt(-500, 500), 0, 20000);
                await stepsRepo.save(
                    stepsRepo.create({
                        date: midnight(dayIndex),
                        userId,
                        numSteps,
                        isReached: numSteps >= 6000,
                    }),
                );

                // ── Sesión de ejercicio (probabilidad según adherencia y fin de semana) ──
                const sessionProb = adherenceRate * (isWeekend ? 0.6 : 1);
                if (!chance(sessionProb)) {
                    streakCounter = 0;
                    continue;
                }

                const routine = pick(routinesWithPlans);
                const sessionDate = dateAt(dayIndex, randInt(9, 20), randInt(0, 59));
                const isCoop = chance(0.15);

                // Tendencia de mejora: semanas más recientes -> mejor estado (valores más bajos = mejor,
                // salvo mood que es al revés: más alto = mejor)
                const recoveryFactor = clamp(4 - weekIndex * 0.35, 1, 4); // baja con el tiempo

                const initialPain = clamp(recoveryFactor + randInt(-1, 1), 1, 5);
                const initialSleepiness = clamp(recoveryFactor + randInt(-1, 1), 1, 5);
                const initialFatigue = clamp(recoveryFactor + randInt(-1, 1), 1, 5);
                const initialMood = clamp(6 - recoveryFactor + randInt(-1, 1), 1, 5);

                const session = await sessionRepo.save(
                    sessionRepo.create({
                        date: sessionDate,
                        userId,
                        routine: routine.name,
                        isCoop,
                        duration: 1, // se actualiza al finalizar
                    }),
                );

                await wellnessRepo.save(
                    wellnessRepo.create({
                        session: sessionDate,
                        userId,
                        type: WellnessTestType.INITIAL,
                        pain: initialPain,
                        sleepiness: initialSleepiness,
                        mood: initialMood,
                        fatigue: initialFatigue,
                    }),
                );

                // ── Ejecutar ejercicios de la rutina ──
                let cursor = new Date(sessionDate);
                for (const plan of routine.plans) {
                    const tInitial = new Date(cursor);
                    const activeSeconds = randInt(60, 240);
                    const tFinal = new Date(tInitial.getTime() + activeSeconds * 1000);
                    cursor = new Date(tFinal.getTime() + randInt(10, 60) * 1000);

                    const numRepsDone = clamp(
                        plan.numReps + randInt(-Math.ceil(plan.numReps * 0.2), 0),
                        1,
                        plan.numReps,
                    );
                    const numSeriesDone = clamp(
                        plan.numSeries - (chance(0.2) ? 1 : 0),
                        1,
                        plan.numSeries,
                    );

                    await executeRepo.save(
                        executeRepo.create({
                            session: sessionDate,
                            userId,
                            exercise: plan.exercise,
                            numRepsDone,
                            numSeriesDone,
                            tInitial,
                            tFinal,
                        }),
                    );

                    fp += numRepsDone; // FP proporcional al esfuerzo
                }

                // ── Test final: ligera mejora post-ejercicio ──
                const finalPain = clamp(initialPain - (chance(0.5) ? 1 : 0), 1, 5);
                const finalMood = clamp(initialMood + (chance(0.5) ? 1 : 0), 1, 5);
                const finalFatigue = clamp(initialFatigue + (chance(0.3) ? 1 : 0), 1, 5);
                const finalSleepiness = clamp(initialSleepiness + randInt(-1, 0), 1, 5);

                await wellnessRepo.save(
                    wellnessRepo.create({
                        session: sessionDate,
                        userId,
                        type: WellnessTestType.FINAL,
                        pain: finalPain,
                        sleepiness: finalSleepiness,
                        mood: finalMood,
                        fatigue: finalFatigue,
                    }),
                );

                const durationMinutes = clamp(
                    Math.round((cursor.getTime() - sessionDate.getTime()) / 60000),
                    1,
                    120,
                );
                session.duration = durationMinutes;
                await sessionRepo.save(session);

                fp += 15; // bonus por completar la sesión
                sessionsCount++;
                streakCounter++;
                maxStreak = Math.max(maxStreak, streakCounter);

                // ── Nota del supervisor ocasional ──
                if (chance(0.08)) {
                    await noteRepo.save(
                        noteRepo.create({
                            clinicalProfile: profile.id,
                            content: pick(NOTE_TEMPLATES),
                            date: dateAt(dayIndex, randInt(18, 21), randInt(0, 59)),
                        }),
                    );
                }
            }

            // ── Racha final (días consecutivos hasta hoy) ──
            let finalStreak = 0;
            for (let dayIndex = 0; dayIndex <= DAYS_HISTORY; dayIndex++) {
                const hasSession = await sessionRepo
                    .createQueryBuilder('s')
                    .where('s.user_id = :userId', { userId })
                    .andWhere('s.date >= :start AND s.date < :end', {
                        start: midnight(dayIndex),
                        end: midnight(dayIndex - 1),
                    })
                    .getExists();
                if (!hasSession) break;
                finalStreak++;
            }

            // ── Compras en tienda según FP acumulado ──
            if (items.length > 0) {
                const shuffledItems = [...items].sort(() => Math.random() - 0.5);
                const wornTypes = new Set<string>();
                for (const item of shuffledItems) {
                    if (fp < item.cost) continue;
                    if (chance(0.4)) continue; // no siempre compra lo que puede permitirse
                    fp -= item.cost;
                    const isWearing = !wornTypes.has(item.type);
                    if (isWearing) wornTypes.add(item.type);
                    await keepRepo.save(
                        keepRepo.create({ item: item.name, avatar: avatar.id, isWearing }),
                    );
                }
            }
            avatar.fp = Math.max(0, fp);
            await avatarRepo.save(avatar);

            // ── Cromos desbloqueados según sesiones completadas ──
            if (memorials.length > 0) {
                const unlockedCount = clamp(Math.floor(sessionsCount / 4), 0, memorials.length);
                const shuffledMemorials = [...memorials].sort(() => Math.random() - 0.5);
                for (let m = 0; m < unlockedCount; m++) {
                    await hasRepo.save(
                        hasRepo.create({ memorial: shuffledMemorials[m].name, userId }),
                    );
                }
            }

            console.log(
                `  ✓ Usuario ${userId} — ${sessionsCount} sesiones, racha ${finalStreak}d, ${avatar.fp} FP`,
            );
        }

        console.log(`\n✅ ${NUM_USERS} usuarios sintéticos generados con ${DAYS_HISTORY} días de historial`);
    } catch (error) {
        console.error('❌ Error generando datos sintéticos:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('\n Conexión cerrada');
        }
    }
}

bootstrap();