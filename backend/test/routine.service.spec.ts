/**
 * Tests unitarios del algoritmo de recomendación de rutinas.
 *
 * Estructura:
 *  1. scoreRoutine            – función pura, sin BD. Verifica cada componente
 *                               del ScoreBreakdown con trazabilidad completa.
 *  2. computeTargetDifficulty – lógica de ajuste de dificultad. Mockeamos los
 *                               repositorios de WellnessTest, Execute y Plan.
 *  3. recommendRoutine        – integración de todos los pasos anteriores:
 *                               filtro de equipo, selección del mejor candidato,
 *                               fallback, NotFoundException, desempate aleatorio.
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { Routine, Difficulty, Category } from '../src/entities/Routine';
import { Exercise } from '../src/entities/Exercise';
import { Session } from '../src/entities/Session';
import { Plan } from '../src/entities/Plan';
import { WellnessTest, WellnessTestType } from '../src/entities/WellnessTest';
import { Execute } from '../src/entities/Execute';
import { ClinicalProfile } from '../src/entities/ClinicalProfile';
import { UserAccount } from '../src/entities/UserAccount';

import {
    RoutineService,
    scoreRoutine,
    SCORING_WEIGHTS,
    DIFFICULTY_ORDER,
    ScoreBreakdown,
    ScoringCandidate,
    ScoringContext,
} from '../src/services/routine.service';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers para construir candidatos y contextos de forma legible
// ─────────────────────────────────────────────────────────────────────────────

function makeCandidate(overrides: Partial<ScoringCandidate> = {}): ScoringCandidate {
    return {
        name: 'Rutina Test',
        category: 'strength',
        difficulty: Difficulty.EASY,
        usesEquipment: false,
        ...overrides,
    };
}

function makeContext(overrides: Partial<ScoringContext> = {}): ScoringContext {
    return {
        targetDifficulty: Difficulty.EASY,
        lastCategory: null,
        hasEquipment: false,
        usedEquipmentFallback: false,
        recentRoutineCounts: new Map(),
        ...overrides,
    };
}

/** Muestra el desglose por consola para trazabilidad en CI/CD. */
function logBreakdown(label: string, breakdown: ScoreBreakdown): void {
    console.log(`\n📊 [${label}]`);
    console.log(`  Dificultad:        ${breakdown.difficultyPoints > 0 ? '+' : ''}${breakdown.difficultyPoints}`);
    console.log(`  Rotación categoría:${breakdown.categoryRotationPoints > 0 ? '+' : ''}${breakdown.categoryRotationPoints}`);
    console.log(`  Equipo:            ${breakdown.equipmentPoints > 0 ? '+' : ''}${breakdown.equipmentPoints}`);
    console.log(`  Penalización reciente: ${breakdown.recentPenalty}`);
    console.log(`  ─────────────────────`);
    console.log(`  TOTAL:             ${breakdown.total > 0 ? '+' : ''}${breakdown.total}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. scoreRoutine — función pura (sin dependencias de BD)
// ─────────────────────────────────────────────────────────────────────────────

describe('scoreRoutine – componente dificultad', () => {
    it('exact match (EASY→EASY) → +DIFFICULTY_MATCH (4 pts)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ difficulty: Difficulty.EASY }),
            makeContext({ targetDifficulty: Difficulty.EASY }),
        );
        logBreakdown('dificultad exact match', breakdown);

        expect(breakdown.difficultyPoints).toBe(SCORING_WEIGHTS.DIFFICULTY_MATCH);
        expect(breakdown.total).toBe(SCORING_WEIGHTS.DIFFICULTY_MATCH);
    });

    it('adjacent (MEDIUM→EASY, distancia 1) → +DIFFICULTY_ADJACENT (2 pts)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ difficulty: Difficulty.MEDIUM }),
            makeContext({ targetDifficulty: Difficulty.EASY }),
        );
        logBreakdown('dificultad adjacent', breakdown);

        expect(breakdown.difficultyPoints).toBe(SCORING_WEIGHTS.DIFFICULTY_ADJACENT);
    });

    it('2 niveles de distancia (HARD→EASY) → 0 pts dificultad', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ difficulty: Difficulty.HARD }),
            makeContext({ targetDifficulty: Difficulty.EASY }),
        );
        logBreakdown('dificultad 2 niveles', breakdown);

        expect(breakdown.difficultyPoints).toBe(0);
    });

    it('los tres niveles de DIFFICULTY_ORDER están correctamente indexados', () => {
        expect(DIFFICULTY_ORDER[0]).toBe(Difficulty.EASY);
        expect(DIFFICULTY_ORDER[1]).toBe(Difficulty.MEDIUM);
        expect(DIFFICULTY_ORDER[2]).toBe(Difficulty.HARD);
    });
});

describe('scoreRoutine – componente rotación de categoría', () => {
    it('sin última categoría (primera sesión) → 0 pts rotación', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ category: 'strength' }),
            makeContext({ lastCategory: null }),
        );
        logBreakdown('rotación sin historial', breakdown);

        expect(breakdown.categoryRotationPoints).toBe(0);
    });

    it('misma categoría que la última sesión → 0 pts rotación', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ category: 'aerobic' }),
            makeContext({ lastCategory: 'aerobic' }),
        );
        logBreakdown('rotación misma categoría', breakdown);

        expect(breakdown.categoryRotationPoints).toBe(0);
    });

    it('categoría distinta → +CATEGORY_ROTATION (2 pts)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ category: 'strength' }),
            makeContext({ lastCategory: 'aerobic' }),
        );
        logBreakdown('rotación diferente categoría', breakdown);

        expect(breakdown.categoryRotationPoints).toBe(SCORING_WEIGHTS.CATEGORY_ROTATION);
    });
});

describe('scoreRoutine – componente equipo', () => {
    it('no es fallback y equipo coincide → +EQUIPMENT_MATCH (1 pt)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ usesEquipment: true }),
            makeContext({ hasEquipment: true, usedEquipmentFallback: false }),
        );
        logBreakdown('equipo coincide (no fallback)', breakdown);

        expect(breakdown.equipmentPoints).toBe(SCORING_WEIGHTS.EQUIPMENT_MATCH);
    });

    it('es fallback (sin candidatos originales) → 0 pts equipo aunque coincida', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ usesEquipment: true }),
            makeContext({ hasEquipment: true, usedEquipmentFallback: true }),
        );
        logBreakdown('equipo coincide pero fallback activo', breakdown);

        expect(breakdown.equipmentPoints).toBe(0);
    });

    it('equipo no coincide y sin fallback → 0 pts equipo', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ usesEquipment: false }),
            makeContext({ hasEquipment: true, usedEquipmentFallback: false }),
        );
        logBreakdown('equipo no coincide', breakdown);

        expect(breakdown.equipmentPoints).toBe(0);
    });
});

describe('scoreRoutine – componente penalización reciente', () => {
    it('no aparece en sesiones recientes → 0 penalización', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Cardio Suave' }),
            makeContext({ recentRoutineCounts: new Map() }),
        );
        logBreakdown('sin penalización reciente', breakdown);

        expect(breakdown.recentPenalty).toBe(0);
    });

    it('aparece 1 vez en recientes → RECENT_PENALTY × 1 (−3 pts)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Cardio Suave' }),
            makeContext({ recentRoutineCounts: new Map([['Cardio Suave', 1]]) }),
        );
        logBreakdown('penalización 1 repetición', breakdown);

        expect(breakdown.recentPenalty).toBe(SCORING_WEIGHTS.RECENT_PENALTY * 1);
    });

    it('aparece 2 veces en recientes → RECENT_PENALTY × 2 (−6 pts)', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Cardio Suave' }),
            makeContext({ recentRoutineCounts: new Map([['Cardio Suave', 2]]) }),
        );
        logBreakdown('penalización 2 repeticiones', breakdown);

        expect(breakdown.recentPenalty).toBe(SCORING_WEIGHTS.RECENT_PENALTY * 2);
    });

    it('el nombre del candidato no coincide con ningún reciente → 0', () => {
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Fuerza Intensa' }),
            makeContext({ recentRoutineCounts: new Map([['Cardio Suave', 3]]) }),
        );
        logBreakdown('nombre distinto en recientes', breakdown);

        expect(breakdown.recentPenalty).toBe(0);
    });
});

describe('scoreRoutine – trazabilidad total (caso complejo)', () => {
    it('suma correctamente todos los componentes en un escenario realista', () => {
        // Rutina de fuerza MEDIUM, usuario quiere EASY (adjacent=2),
        // viene de aerobic (rotación=2), tiene equipo y coincide (1),
        // no aparece en recientes (0)
        // → total esperado = 2 + 2 + 1 + 0 = 5
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Fuerza con Pesas', category: 'strength', difficulty: Difficulty.MEDIUM, usesEquipment: true }),
            makeContext({
                targetDifficulty: Difficulty.EASY,
                lastCategory: 'aerobic',
                hasEquipment: true,
                usedEquipmentFallback: false,
                recentRoutineCounts: new Map(),
            }),
        );
        logBreakdown('caso complejo – escenario realista', breakdown);

        expect(breakdown.difficultyPoints).toBe(SCORING_WEIGHTS.DIFFICULTY_ADJACENT);    // 2
        expect(breakdown.categoryRotationPoints).toBe(SCORING_WEIGHTS.CATEGORY_ROTATION); // 2
        expect(breakdown.equipmentPoints).toBe(SCORING_WEIGHTS.EQUIPMENT_MATCH);          // 1
        expect(breakdown.recentPenalty).toBe(0);                                           // 0
        expect(breakdown.total).toBe(5);
    });

    it('penalización puede dejar score negativo si es muy repetida', () => {
        // Rutina exact match (4) + categoría distinta (2) - penalización x3 (-9) = -3
        const breakdown = scoreRoutine(
            makeCandidate({ name: 'Cardio Suave', category: 'strength', difficulty: Difficulty.EASY, usesEquipment: false }),
            makeContext({
                targetDifficulty: Difficulty.EASY,
                lastCategory: 'aerobic',
                hasEquipment: false,
                usedEquipmentFallback: false,
                recentRoutineCounts: new Map([['Cardio Suave', 3]]),
            }),
        );
        logBreakdown('penalización alta → score negativo', breakdown);

        // 4 (match) + 2 (rotación) + 1 (equipo) + (-9 penalización) = -2
        expect(breakdown.recentPenalty).toBe(-9);
        expect(breakdown.total).toBe(-2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. recommendRoutine y computeTargetDifficulty — con repositorios mockeados
// ─────────────────────────────────────────────────────────────────────────────

/** Fábrica de Routine parcial para uso en tests. */
function makeRoutine(overrides: Partial<Routine> = {}): Routine {
    return {
        name: 'Rutina Genérica',
        category: Category.AEROBIC,
        difficulty: Difficulty.EASY,
        assignedUserId: null,
        assignedUser: null,
        plans: [],
        ...overrides,
    } as Routine;
}

/** Fábrica de Session parcial. */
function makeSession(overrides: Partial<Session> = {}): Session {
    return {
        date: new Date('2026-01-15T10:00:00Z'),
        userId: 1,
        duration: 30,
        routine: 'Rutina Genérica',
        isCoop: false,
        ...overrides,
    } as Session;
}

/** Fábrica de WellnessTest parcial. */
function makeWellnessTest(overrides: Partial<WellnessTest> = {}): WellnessTest {
    return {
        userId: 1,
        type: WellnessTestType.INITIAL,
        pain: 1,
        fatigue: 1,
        sleepiness: 1,
        mood: 5,
        ...overrides,
    } as WellnessTest;
}

/** Crea el módulo de testing con todos los repositorios mockeados. */
async function buildServiceWithMocks(overrides: {
    routines?: Routine[];
    sessions?: Session[];
    wellnessTest?: WellnessTest | null;
    executes?: Execute[];
    plans?: Plan[];
    user?: UserAccount | null;
    clinicalProfile?: ClinicalProfile | null;
} = {}): Promise<RoutineService> {
    const {
        routines = [],
        sessions = [],
        wellnessTest = null,
        executes = [],
        plans = [],
        user = { id: 1 } as UserAccount,
        clinicalProfile = null,
    } = overrides;

    const mockRoutineRepo = { find: jest.fn().mockResolvedValue(routines) };
    const mockSessionRepo = { find: jest.fn().mockResolvedValue(sessions) };
    const mockWellnessTestRepo = { findOne: jest.fn().mockResolvedValue(wellnessTest) };
    const mockExecuteRepo = { find: jest.fn().mockResolvedValue(executes) };
    const mockPlanRepo = { find: jest.fn().mockResolvedValue(plans) };
    const mockUserRepo = { findOne: jest.fn().mockResolvedValue(user) };
    const mockClinicalProfileRepo = { findOne: jest.fn().mockResolvedValue(clinicalProfile) };
    const mockExerciseRepo = { find: jest.fn().mockResolvedValue([]) };

    const module = await Test.createTestingModule({
        providers: [
            RoutineService,
            { provide: getRepositoryToken(Routine), useValue: mockRoutineRepo },
            { provide: getRepositoryToken(Plan), useValue: mockPlanRepo },
            { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepo },
            { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
            { provide: getRepositoryToken(WellnessTest), useValue: mockWellnessTestRepo },
            { provide: getRepositoryToken(Execute), useValue: mockExecuteRepo },
            { provide: getRepositoryToken(ClinicalProfile), useValue: mockClinicalProfileRepo },
            { provide: getRepositoryToken(UserAccount), useValue: mockUserRepo },
        ],
    }).compile();

    return module.get(RoutineService);
}

// ─── recommendRoutine – selección del mejor candidato ────────────────────────

describe('recommendRoutine – selección del mejor candidato', () => {
    it('sin rutinas disponibles → lanza NotFoundException', async () => {
        const service = await buildServiceWithMocks({ routines: [] });
        await expect(service.recommendRoutine(1, false)).rejects.toThrow(NotFoundException);
    });

    it('elige la rutina con mayor puntuación total', async () => {
        // Dos rutinas genéricas. Sin historial → target = EASY.
        // R1 = EASY (4 pts dificultad), R2 = HARD (0 pts).
        const routines = [
            makeRoutine({ name: 'R1 Fácil', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R2 Difícil', difficulty: Difficulty.HARD, category: Category.STRENGTH }),
        ];

        const service = await buildServiceWithMocks({ routines, sessions: [] });
        const result = await service.recommendRoutine(1, false);

        console.log('\n🏆 recommendRoutine eligió:', result);
        expect(result.routineName).toBe('R1 Fácil');
    });

    it('sin historial → dificultad objetivo es EASY', async () => {
        // Una sola rutina EASY sin sesiones previas; debe recomendarla.
        const routines = [
            makeRoutine({ name: 'Única Fácil', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
        ];

        const service = await buildServiceWithMocks({ routines, sessions: [] });
        const result = await service.recommendRoutine(1, false);

        expect(result.routineName).toBe('Única Fácil');
        expect(result.difficulty).toBe(Difficulty.EASY);
    });
});

// ─── recommendRoutine – filtro de equipo ─────────────────────────────────────

describe('recommendRoutine – filtro de equipo', () => {
    it('con hasEquipment=true prefiere rutinas con equipo', async () => {
        const routineConEquipo = makeRoutine({
            name: 'Pesas y Poleas',
            difficulty: Difficulty.EASY,
            category: Category.STRENGTH,
            plans: [{ exerciseEntity: { equipment: [{ name: 'mancuerna' }] } }] as any,
        });
        const rutinaSinEquipo = makeRoutine({
            name: 'Calistenia Libre',
            difficulty: Difficulty.EASY,
            category: Category.STRENGTH,
            plans: [{ exerciseEntity: { equipment: [] } }] as any,
        });

        const service = await buildServiceWithMocks({
            routines: [routineConEquipo, rutinaSinEquipo],
            sessions: [],
        });
        const result = await service.recommendRoutine(1, true);

        console.log('\n🏋️ con equipo eligió:', result.routineName);
        expect(result.routineName).toBe('Pesas y Poleas');
    });

    it('fallback: si no hay rutinas con equipo, considera todas', async () => {
        // Solo hay rutinas sin equipo, pero el usuario pide con equipo → fallback a todas
        const rutinaSinEquipo = makeRoutine({
            name: 'Solo Bodyweight',
            difficulty: Difficulty.EASY,
            category: Category.AEROBIC,
            plans: [{ exerciseEntity: { equipment: [] } }] as any,
        });

        const service = await buildServiceWithMocks({
            routines: [rutinaSinEquipo],
            sessions: [],
        });
        const result = await service.recommendRoutine(1, true);

        console.log('\n🔄 fallback eligió:', result.routineName);
        expect(result.routineName).toBe('Solo Bodyweight');
    });
});

// ─── computeTargetDifficulty (vía recommendRoutine) ──────────────────────────

describe('recommendRoutine – computeTargetDifficulty (ajuste de dificultad)', () => {
    const SESSION_DATE = new Date('2026-01-10T10:00:00Z');

    it('dolor ≥ 4 en WellnessTest → baja un nivel de dificultad (MEDIUM → EASY)', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R Medium', difficulty: Difficulty.MEDIUM, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Medium' });
        const wellnessTest = makeWellnessTest({ pain: 4, fatigue: 1 }); // dolor alto

        // Plan para calcular completionRatio (execute lo completa al 100%)
        const plan = { routine: 'R Medium', exercise: 'Sentadilla', numReps: 10, numSeries: 3 } as Plan;
        const execute = { exercise: 'Sentadilla', numRepsDone: 30 } as Execute; // 30/30 = 100%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n😣 dolor alto, target:', result);
        // Aunque la compleción es 100%, el dolor ≥4 obliga a bajar → target = EASY
        expect(result.difficulty).toBe(Difficulty.EASY);
        expect(result.routineName).toBe('R Easy');
    });

    it('fatiga ≥ 4 → baja un nivel de dificultad', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R Medium', difficulty: Difficulty.MEDIUM, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Medium' });
        const wellnessTest = makeWellnessTest({ pain: 1, fatigue: 5 }); // fatiga alta

        const plan = { routine: 'R Medium', exercise: 'Remo', numReps: 12, numSeries: 3 } as Plan;
        const execute = { exercise: 'Remo', numRepsDone: 36 } as Execute;

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n😴 fatiga alta, target:', result);
        expect(result.routineName).toBe('R Easy');
    });

    it('baja compleción (< 60%) → baja un nivel aunque el dolor/fatiga sean bajos', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R Medium', difficulty: Difficulty.MEDIUM, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Medium' });
        const wellnessTest = makeWellnessTest({ pain: 1, fatigue: 1 });

        const plan = { routine: 'R Medium', exercise: 'Burpees', numReps: 10, numSeries: 4 } as Plan; // target=40
        const execute = { exercise: 'Burpees', numRepsDone: 20 } as Execute; // 20/40 = 50% → < 60%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n baja compleción, target:', result);
        expect(result.routineName).toBe('R Easy');
    });

    it('dolor ≤ 2, fatiga ≤ 2 y compleción > 90% → sube un nivel (EASY → MEDIUM)', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R Medium', difficulty: Difficulty.MEDIUM, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Easy' });
        const wellnessTest = makeWellnessTest({ pain: 1, fatigue: 1 });

        const plan = { routine: 'R Easy', exercise: 'Flexiones', numReps: 10, numSeries: 3 } as Plan; // target=30
        const execute = { exercise: 'Flexiones', numRepsDone: 29 } as Execute; // 29/30 ≈ 96.7% → > 90%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n💪 todo bien, target sube:', result);
        expect(result.routineName).toBe('R Medium');
    });

    it('valores normales (dolor 3, fatiga 3, compleción 75%) → mantiene dificultad actual', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'R Medium', difficulty: Difficulty.MEDIUM, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Medium' });
        const wellnessTest = makeWellnessTest({ pain: 3, fatigue: 3 });

        const plan = { routine: 'R Medium', exercise: 'Zancadas', numReps: 12, numSeries: 3 } as Plan; // target=36
        const execute = { exercise: 'Zancadas', numRepsDone: 27 } as Execute; // 27/36 = 75%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n➡️ valores normales, mantiene dificultad:', result);
        expect(result.difficulty).toBe(Difficulty.MEDIUM);
        expect(result.routineName).toBe('R Medium');
    });

    it('no puede bajar de EASY (ya está en el nivel mínimo)', async () => {
        const routines = [
            makeRoutine({ name: 'R Easy', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Easy' });
        const wellnessTest = makeWellnessTest({ pain: 5, fatigue: 5 }); // máximo dolor/fatiga

        const plan = { routine: 'R Easy', exercise: 'Marcha', numReps: 5, numSeries: 2 } as Plan;
        const execute = { exercise: 'Marcha', numRepsDone: 2 } as Execute; // 2/10 = 20%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n🛡️ suelo mínimo EASY:', result);
        expect(result.difficulty).toBe(Difficulty.EASY);
    });

    it('no puede subir de HARD (ya está en el nivel máximo)', async () => {
        const routines = [
            makeRoutine({ name: 'R Hard', difficulty: Difficulty.HARD, category: Category.AEROBIC }),
        ];
        const lastSession = makeSession({ date: SESSION_DATE, routine: 'R Hard' });
        const wellnessTest = makeWellnessTest({ pain: 1, fatigue: 1 }); // mínimo dolor/fatiga

        const plan = { routine: 'R Hard', exercise: 'Sprint', numReps: 10, numSeries: 4 } as Plan;
        const execute = { exercise: 'Sprint', numRepsDone: 40 } as Execute; // 40/40 = 100%

        const service = await buildServiceWithMocks({
            routines,
            sessions: [lastSession],
            wellnessTest,
            executes: [execute],
            plans: [plan],
        });

        const result = await service.recommendRoutine(1, false);
        console.log('\n🔝 techo máximo HARD:', result);
        expect(result.difficulty).toBe(Difficulty.HARD);
    });
});

// ─── recommendRoutine – penalización por repetición reciente ─────────────────

describe('recommendRoutine – penalización por repetición reciente', () => {
    it('la rutina muy repetida pierde frente a una nueva con mismo match de dificultad', async () => {
        const routines = [
            makeRoutine({ name: 'Muy Repetida', difficulty: Difficulty.EASY, category: Category.AEROBIC }),
            makeRoutine({ name: 'Fresca', difficulty: Difficulty.EASY, category: Category.STRENGTH }),
        ];

        // 3 sesiones recientes haciendo "Muy Repetida" → penalización 3 × (−3) = −9
        const sessions = [
            makeSession({ date: new Date('2026-01-14T10:00:00Z'), routine: 'Muy Repetida' }),
            makeSession({ date: new Date('2026-01-13T10:00:00Z'), routine: 'Muy Repetida' }),
            makeSession({ date: new Date('2026-01-12T10:00:00Z'), routine: 'Muy Repetida' }),
        ];

        const service = await buildServiceWithMocks({ routines, sessions });
        const result = await service.recommendRoutine(1, false);

        console.log('\n🔁 penalización repetición:', result.routineName);
        expect(result.routineName).toBe('Fresca');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getRoutinesForUser — Visibilidad de rutinas genéricas vs personales
// ─────────────────────────────────────────────────────────────────────────────

describe('RoutineService.getRoutinesForUser', () => {
    const CURRENT_USER = 821011;
    const OTHER_USER = 999999;

    const mockRoutines = [
        { name: 'Cardio Suave', category: 'aerobic', difficulty: 'easy', assignedUserId: null, plans: [{ exerciseEntity: { difficulty: 'easy' } }] },
        { name: 'Cardio a medida', category: 'aerobic', difficulty: 'medium', assignedUserId: CURRENT_USER, plans: [{ exerciseEntity: { difficulty: 'medium' } }] },
        { name: 'Cardio de otro usuario', category: 'aerobic', difficulty: 'easy', assignedUserId: OTHER_USER, plans: [] },
        { name: 'Fuerza Básica', category: 'strength', difficulty: 'easy', assignedUserId: null, plans: [] },
    ] as Routine[];

    it('devuelve solo rutinas visibles para el usuario (genéricas + suyas), nunca de otros', async () => {
        const service = await buildServiceWithMocks({ routines: mockRoutines });
        const result = await service.getRoutinesForUser(CURRENT_USER);
        const names = result.map((r) => r.name);

        expect(names).toContain('Cardio Suave');
        expect(names).toContain('Cardio a medida');
        expect(names).not.toContain('Cardio de otro usuario');
    });

    it('filtra además por categoría cuando se especifica', async () => {
        const service = await buildServiceWithMocks({ routines: mockRoutines });
        const result = await service.getRoutinesForUser(CURRENT_USER, 'aerobic' as any);

        expect(result.every((r) => r.category === 'aerobic')).toBe(true);
        expect(result.map((r) => r.name)).not.toContain('Fuerza Básica');
    });

    it('marca correctamente isPersonal según assignedUserId', async () => {
        const service = await buildServiceWithMocks({ routines: mockRoutines });
        const result = await service.getRoutinesForUser(CURRENT_USER);

        expect(result.find((r) => r.name === 'Cardio a medida')?.isPersonal).toBe(true);
        expect(result.find((r) => r.name === 'Cardio Suave')?.isPersonal).toBe(false);
    });
});

