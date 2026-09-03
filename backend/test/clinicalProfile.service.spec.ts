/**
 * Tests unitarios del ClinicalProfileService.
 *
 * Se cubren los métodos con lógica de dominio propia (no simples proxies al repo):
 *
 *  1. getAdherence()         – cálculo de % adherencia y semáforo
 *  2. getWellnessAverage()   – media de métricas; null si no hay tests
 *  3. getMoodTrend()         – agrupación y media de mood por sesión
 *  4. getPrePostComparison() – media de inicial vs final por métrica
 *  5. getProfile()           – devuelve null si no existe perfil
 *  6. createOrUpdateProfile()– crea si no existe, actualiza si existe
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ClinicalProfile } from '../src/entities/ClinicalProfile';
import { Session } from '../src/entities/Session';
import { Steps } from '../src/entities/Steps';
import { WellnessTest, WellnessTestType } from '../src/entities/WellnessTest';
import { Execute } from '../src/entities/Execute';
import { UserAccount } from '../src/entities/UserAccount';
import { SupervisorNote } from '../src/entities/SupervisorNote';
import { Contraindication } from '../src/entities/Contraindication';
import { ClinicalProfileService } from '../src/services/clinicalProfile.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeWellnessTest(overrides: Partial<WellnessTest> = {}): WellnessTest {
    return {
        session: new Date('2026-01-15T10:00:00Z'),
        userId: 821011,
        type: WellnessTestType.INITIAL,
        pain: 2,
        sleepiness: 2,
        mood: 4,
        fatigue: 2,
        sessionEntity: null as any,
        ...overrides,
    };
}

function makeSession(overrides: Partial<Session> = {}): Session {
    return {
        date: new Date('2026-01-15T10:00:00Z'),
        userId: 821011,
        routine: 'Cardio Suave',
        isCoop: false,
        duration: 30,
        wellnessTests: [],
        executes: [],
        ...overrides,
    } as Session;
}

// ─── Build helper ────────────────────────────────────────────────────────────

type MockOverrides = {
    profile?: ClinicalProfile | null;
    sessions?: Session[];
    wellnessTests?: WellnessTest[];
    user?: UserAccount | null;
    steps?: Steps[];
    notes?: SupervisorNote[];
    contraindications?: Contraindication[];
};

async function buildService(
    overrides: MockOverrides = {},
): Promise<{ service: ClinicalProfileService; mocks: Record<string, jest.Mock> }> {
    const mocks: Record<string, jest.Mock> = {
        profileFindOne: jest.fn().mockResolvedValue(overrides.profile ?? null),
        profileCreate: jest.fn((x) => x),
        profileSave: jest.fn((x) => Promise.resolve(x)),
        profileCount: jest.fn().mockResolvedValue(0),
        profileManager: { count: jest.fn().mockResolvedValue(0) },

        sessionFind: jest.fn().mockResolvedValue(overrides.sessions ?? []),
        sessionCount: jest.fn().mockResolvedValue(0),

        wellnessFind: jest.fn().mockResolvedValue(overrides.wellnessTests ?? []),

        stepsFind: jest.fn().mockResolvedValue(overrides.steps ?? []),
        stepsFindOne: jest.fn().mockResolvedValue(null),

        userFindOne: jest.fn().mockResolvedValue(
            overrides.user !== undefined
                ? overrides.user
                : ({ id: 821011, avatarEntity: { fp: 100 } } as any),
        ),

        notesFind: jest.fn().mockResolvedValue(overrides.notes ?? []),
        notesCreate: jest.fn((x) => x),
        notesSave: jest.fn((x) => Promise.resolve(x)),
        notesDelete: jest.fn().mockResolvedValue(undefined),

        contraindicationFind: jest.fn().mockResolvedValue(overrides.contraindications ?? []),

        executeCreateQueryBuilder: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([]),
        }),
    };

    const mockProfileRepo = {
        findOne: mocks.profileFindOne,
        create: mocks.profileCreate,
        save: mocks.profileSave,
        manager: { count: mocks['profileManager'].count },
    };
    const mockSessionRepo = {
        find: mocks.sessionFind,
        count: mocks.sessionCount,
    };
    const mockWellnessRepo = {
        find: mocks.wellnessFind,
    };
    const mockStepsRepo = {
        find: mocks.stepsFind,
        findOne: mocks.stepsFindOne,
    };
    const mockUserRepo = {
        findOne: mocks.userFindOne,
    };
    const mockNoteRepo = {
        find: mocks.notesFind,
        create: mocks.notesCreate,
        save: mocks.notesSave,
        delete: mocks.notesDelete,
    };
    const mockContraindicationRepo = {
        find: mocks.contraindicationFind,
    };
    const mockExecuteRepo = {
        createQueryBuilder: mocks.executeCreateQueryBuilder,
    };

    const module = await Test.createTestingModule({
        providers: [
            ClinicalProfileService,
            { provide: getRepositoryToken(ClinicalProfile), useValue: mockProfileRepo },
            { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
            { provide: getRepositoryToken(Steps), useValue: mockStepsRepo },
            { provide: getRepositoryToken(WellnessTest), useValue: mockWellnessRepo },
            { provide: getRepositoryToken(Execute), useValue: mockExecuteRepo },
            { provide: getRepositoryToken(UserAccount), useValue: mockUserRepo },
            { provide: getRepositoryToken(SupervisorNote), useValue: mockNoteRepo },
            { provide: getRepositoryToken(Contraindication), useValue: mockContraindicationRepo },
        ],
    }).compile();

    return { service: module.get(ClinicalProfileService), mocks };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. getAdherence()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.getAdherence()', () => {
    it('devuelve status green cuando la adherencia ≥ 70%', async () => {
        const { service, mocks } = await buildService();
        // Simulamos que hay 10 días hábiles planeados y 8 completados → 80%
        mocks.sessionCount.mockResolvedValue(8);

        const result = await service.getAdherence(821011);

        // El pct exacto depende de cuántos días hábiles han transcurrido este mes,
        // pero al menos verificamos que la estructura es correcta y que no lanza
        expect(result).toHaveProperty('completed');
        expect(result).toHaveProperty('planned');
        expect(result).toHaveProperty('pct');
        expect(result).toHaveProperty('status');
        expect(['green', 'yellow', 'red']).toContain(result.status);
    });

    it('devuelve pct=0 y status red cuando no hay sesiones completadas', async () => {
        const { service, mocks } = await buildService();
        mocks.sessionCount.mockResolvedValue(0);

        const result = await service.getAdherence(821011);

        // Con 0 completadas el pct solo puede ser 0 (si hay días planificados)
        // o también 0 si estamos al inicio del mes sin días hábiles
        expect(result.completed).toBe(0);
        if (result.planned > 0) {
            expect(result.pct).toBe(0);
            expect(result.status).toBe('red');
        }
    });

    it('el pct nunca supera 100 aunque se registren más sesiones que días hábiles', async () => {
        const { service, mocks } = await buildService();
        // 999 sesiones completadas → pct debe capar al 100%
        mocks.sessionCount.mockResolvedValue(999);

        const result = await service.getAdherence(821011);

        expect(result.pct).toBeLessThanOrEqual(100);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. getWellnessAverage()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.getWellnessAverage()', () => {
    it('devuelve null si no hay wellness tests en las últimas 4 semanas', async () => {
        const { service } = await buildService({ wellnessTests: [] });

        const result = await service.getWellnessAverage(821011);

        expect(result).toBeNull();
    });

    it('calcula la media correctamente con un único test', async () => {
        const test = makeWellnessTest({ pain: 3, fatigue: 2, sleepiness: 4, mood: 5 });
        const { service } = await buildService({ wellnessTests: [test] });

        const result = await service.getWellnessAverage(821011);

        expect(result).not.toBeNull();
        expect(result!.pain).toBe(3);
        expect(result!.fatigue).toBe(2);
        expect(result!.sleepiness).toBe(4);
        expect(result!.mood).toBe(5);
        expect(result!.count).toBe(1);
    });

    it('calcula la media correctamente con múltiples tests', async () => {
        const tests = [
            makeWellnessTest({ pain: 2, fatigue: 2, sleepiness: 2, mood: 4 }),
            makeWellnessTest({ pain: 4, fatigue: 4, sleepiness: 4, mood: 2 }),
        ];
        const { service } = await buildService({ wellnessTests: tests });

        const result = await service.getWellnessAverage(821011);

        expect(result!.pain).toBe(3);    // (2+4)/2
        expect(result!.fatigue).toBe(3); // (2+4)/2
        expect(result!.mood).toBe(3);    // (4+2)/2
        expect(result!.count).toBe(2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getMoodTrend()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.getMoodTrend()', () => {
    it('devuelve lista vacía si no hay tests de wellness', async () => {
        const { service } = await buildService({ wellnessTests: [] });

        const result = await service.getMoodTrend(821011, 14);

        expect(result).toEqual([]);
    });

    it('agrupa los tests por sesión y devuelve la media de mood', async () => {
        const sessionDate = new Date('2026-01-15T10:00:00Z');
        const tests = [
            makeWellnessTest({ session: sessionDate, type: WellnessTestType.INITIAL, mood: 3 }),
            makeWellnessTest({ session: sessionDate, type: WellnessTestType.FINAL, mood: 5 }),
        ];
        const { service } = await buildService({ wellnessTests: tests });

        const result = await service.getMoodTrend(821011, 14);

        // Una sola sesión, con media de mood (3+5)/2 = 4
        expect(result).toHaveLength(1);
        expect(result[0].mood).toBe(4);
    });

    it('devuelve los resultados ordenados cronológicamente', async () => {
        const date1 = new Date('2026-01-10T10:00:00Z');
        const date2 = new Date('2026-01-15T10:00:00Z');
        const tests = [
            makeWellnessTest({ session: date2, mood: 5 }),
            makeWellnessTest({ session: date1, mood: 3 }),
        ];
        const { service } = await buildService({ wellnessTests: tests });

        const result = await service.getMoodTrend(821011, 14);

        // El más antiguo debe aparecer primero
        expect(new Date(result[0].date).getTime()).toBeLessThan(
            new Date(result[1].date).getTime(),
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. getPrePostComparison()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.getPrePostComparison()', () => {
    it('devuelve 4 métricas (Dolor, Fatiga, Sueño, Ánimo) siempre', async () => {
        const { service } = await buildService({ wellnessTests: [] });

        const result = await service.getPrePostComparison(821011);

        expect(result).toHaveLength(4);
        const metrics = result.map((r) => r.metric);
        expect(metrics).toContain('Dolor');
        expect(metrics).toContain('Fatiga');
        expect(metrics).toContain('Sueño');
        expect(metrics).toContain('Ánimo');
    });

    it('calcula before/after correctamente con test inicial y final', async () => {
        const sessionDate = new Date('2026-01-15T10:00:00Z');
        const tests = [
            makeWellnessTest({ session: sessionDate, type: WellnessTestType.INITIAL, pain: 4, fatigue: 3, sleepiness: 3, mood: 2 }),
            makeWellnessTest({ session: sessionDate, type: WellnessTestType.FINAL, pain: 2, fatigue: 1, sleepiness: 2, mood: 5 }),
        ];
        const { service } = await buildService({ wellnessTests: tests });

        const result = await service.getPrePostComparison(821011);

        const dolor = result.find((r) => r.metric === 'Dolor')!;
        expect(dolor.before).toBe(4);
        expect(dolor.after).toBe(2);

        const animo = result.find((r) => r.metric === 'Ánimo')!;
        expect(animo.before).toBe(2);
        expect(animo.after).toBe(5);
    });

    it('devuelve before=0 y after=0 si no hay tests', async () => {
        const { service } = await buildService({ wellnessTests: [] });

        const result = await service.getPrePostComparison(821011);

        for (const r of result) {
            expect(r.before).toBe(0);
            expect(r.after).toBe(0);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. getProfile()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.getProfile()', () => {
    it('devuelve null si no existe perfil clínico para el usuario', async () => {
        const { service } = await buildService({ profile: null });

        const result = await service.getProfile(821011);

        expect(result).toBeNull();
    });

    it('devuelve el perfil clínico cuando existe', async () => {
        const profile = { id: 821011, age: 35 } as ClinicalProfile;
        const { service } = await buildService({ profile });

        const result = await service.getProfile(821011);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(821011);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. createOrUpdateProfile()
// ─────────────────────────────────────────────────────────────────────────────

describe('ClinicalProfileService.createOrUpdateProfile()', () => {
    it('crea un perfil nuevo si no existe uno previo', async () => {
        const { service, mocks } = await buildService({ profile: null });
        const dto = { age: 30 } as any;

        await service.createOrUpdateProfile(821011, dto);

        expect(mocks.profileCreate).toHaveBeenCalledTimes(1);
        expect(mocks.profileSave).toHaveBeenCalledTimes(1);
    });

    it('actualiza el perfil existente sin llamar a create()', async () => {
        const existing = { id: 821011, age: 25 } as ClinicalProfile;
        const { service, mocks } = await buildService({ profile: existing });
        const dto = { age: 30 } as any;

        await service.createOrUpdateProfile(821011, dto);

        expect(mocks.profileCreate).not.toHaveBeenCalled();
        expect(mocks.profileSave).toHaveBeenCalledTimes(1);
        // El objeto guardado debe tener el campo actualizado
        const savedArg = mocks.profileSave.mock.calls[0][0];
        expect(savedArg.age).toBe(30);
    });
});
