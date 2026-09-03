/**
 * Tests unitarios del SessionService.
 *
 * Cubre:
 *  1. canStartSession()   – devuelve true si no hay sesión completada hoy
 *                         – devuelve false si ya completó una sesión hoy
 *  2. startSession()      – elimina sesiones incompletas previas antes de crear
 *                         – devuelve DTO de la sesión recién creada
 *  3. getActiveSession()  – lanza NotFoundException si no existe sesión
 *                         – devuelve el DTO de la sesión más reciente
 *  4. endSession()        – lanza NotFoundException si no hay sesión
 *                         – actualiza la duración y devuelve el DTO
 *  5. getRecentSessions() – devuelve las últimas N sesiones
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Session } from '../src/entities/Session';
import { WellnessTest } from '../src/entities/WellnessTest';
import { Execute } from '../src/entities/Execute';
import { SessionService } from '../src/services/session.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<Session> = {}): Session {
    return {
        date: new Date('2026-01-15T10:00:00Z'),
        userId: 821011,
        routine: 'Cardio Suave',
        isCoop: false,
        duration: 0,
        wellnessTests: [],
        executes: [],
        ...overrides,
    } as Session;
}

// ─── Setup ───────────────────────────────────────────────────────────────────

async function buildService(overrides: {
    sessionFindOne?: Session | null;
    sessionFind?: Session[];
    sessionCount?: number;
} = {}): Promise<{ service: SessionService; mocks: Record<string, jest.Mock> }> {
    const mocks = {
        sessionFindOne: jest.fn().mockResolvedValue(overrides.sessionFindOne ?? null),
        sessionFind: jest.fn().mockResolvedValue(overrides.sessionFind ?? []),
        sessionCreate: jest.fn((x) => x),
        sessionSave: jest.fn((x) => Promise.resolve(x)),
        sessionDelete: jest.fn().mockResolvedValue(undefined),
        wellnessFind: jest.fn().mockResolvedValue([]),
        wellnessDelete: jest.fn().mockResolvedValue(undefined),
        executeFind: jest.fn().mockResolvedValue([]),
        executeDelete: jest.fn().mockResolvedValue(undefined),
    };

    const mockSessionRepo = {
        findOne: mocks.sessionFindOne,
        find: mocks.sessionFind,
        create: mocks.sessionCreate,
        save: mocks.sessionSave,
        delete: mocks.sessionDelete,
    };
    const mockWellnessRepo = {
        find: mocks.wellnessFind,
        delete: mocks.wellnessDelete,
    };
    const mockExecuteRepo = {
        find: mocks.executeFind,
        delete: mocks.executeDelete,
    };

    const module = await Test.createTestingModule({
        providers: [
            SessionService,
            { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
            { provide: getRepositoryToken(WellnessTest), useValue: mockWellnessRepo },
            { provide: getRepositoryToken(Execute), useValue: mockExecuteRepo },
        ],
    }).compile();

    return { service: module.get(SessionService), mocks };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. canStartSession
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionService.canStartSession()', () => {
    it('devuelve true si no hay sesión completada hoy (findOne devuelve null)', async () => {
        const { service } = await buildService({ sessionFindOne: null });

        const result = await service.canStartSession(821011);

        expect(result).toBe(true);
    });

    it('devuelve false si ya existe una sesión completada hoy', async () => {
        const todaySession = makeSession({ duration: 30 });
        const { service } = await buildService({ sessionFindOne: todaySession });

        const result = await service.canStartSession(821011);

        expect(result).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. startSession
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionService.startSession()', () => {
    it('elimina las sesiones incompletas (duration=0) antes de crear la nueva', async () => {
        const incompleteSession = makeSession({ duration: 0 });
        // find devuelve incompletas, findOne para la nueva devuelve null inicialmente
        const { service, mocks } = await buildService();
        mocks.sessionFind.mockResolvedValue([incompleteSession]);
        mocks.sessionFindOne.mockResolvedValue(null);

        await service.startSession(821011, { routine: 'Cardio Suave', isCoop: false });

        expect(mocks.sessionDelete).toHaveBeenCalledTimes(1);
        expect(mocks.wellnessDelete).toHaveBeenCalledTimes(1);
        expect(mocks.executeDelete).toHaveBeenCalledTimes(1);
    });

    it('crea una nueva sesión con duration=0 y devuelve su DTO', async () => {
        const { service, mocks } = await buildService();
        mocks.sessionFind.mockResolvedValue([]); // sin incompletas
        mocks.wellnessFind.mockResolvedValue([]);
        mocks.executeFind.mockResolvedValue([]);

        const result = await service.startSession(821011, { routine: 'Fuerza Básica', isCoop: false });

        expect(result.routine).toBe('Fuerza Básica');
        expect(result.duration).toBe(0);
        expect(result.userId).toBe(821011);
        expect(mocks.sessionSave).toHaveBeenCalledTimes(1);
    });

    it('crea una sesión cooperativa cuando isCoop=true', async () => {
        const { service, mocks } = await buildService();
        mocks.sessionFind.mockResolvedValue([]);
        mocks.wellnessFind.mockResolvedValue([]);
        mocks.executeFind.mockResolvedValue([]);

        const result = await service.startSession(821011, { routine: 'Reto Coop', isCoop: true });

        expect(result.isCoop).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getActiveSession
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionService.getActiveSession()', () => {
    it('lanza NotFoundException si el usuario no tiene ninguna sesión', async () => {
        const { service } = await buildService({ sessionFindOne: null });

        await expect(service.getActiveSession(821011)).rejects.toThrow(NotFoundException);
    });

    it('devuelve el DTO de la sesión más reciente del usuario', async () => {
        const session = makeSession({ routine: 'Flexibilidad', duration: 0 });
        const { service, mocks } = await buildService({ sessionFindOne: session });
        mocks.wellnessFind.mockResolvedValue([]);
        mocks.executeFind.mockResolvedValue([]);

        const result = await service.getActiveSession(821011);

        expect(result.routine).toBe('Flexibilidad');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. endSession
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionService.endSession()', () => {
    it('lanza NotFoundException si no hay sesión para el usuario', async () => {
        const { service } = await buildService({ sessionFindOne: null });

        await expect(service.endSession(821011, 30)).rejects.toThrow(NotFoundException);
    });

    it('actualiza la duración de la sesión y devuelve el DTO con el nuevo valor', async () => {
        const session = makeSession({ duration: 0 });
        const { service, mocks } = await buildService({ sessionFindOne: session });
        mocks.wellnessFind.mockResolvedValue([]);
        mocks.executeFind.mockResolvedValue([]);

        const result = await service.endSession(821011, 45);

        expect(result.duration).toBe(45);
        expect(mocks.sessionSave).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. getRecentSessions
// ─────────────────────────────────────────────────────────────────────────────

describe('SessionService.getRecentSessions()', () => {
    it('devuelve las últimas N sesiones del usuario', async () => {
        const sessions = [
            makeSession({ date: new Date('2026-01-15T10:00:00Z') }),
            makeSession({ date: new Date('2026-01-14T10:00:00Z') }),
            makeSession({ date: new Date('2026-01-13T10:00:00Z') }),
        ];
        const { service, mocks } = await buildService();
        mocks.sessionFind.mockResolvedValue(sessions);

        const result = await service.getRecentSessions(821011, 3);

        expect(result).toHaveLength(3);
    });

    it('devuelve lista vacía si el usuario no tiene sesiones', async () => {
        const { service, mocks } = await buildService();
        mocks.sessionFind.mockResolvedValue([]);

        const result = await service.getRecentSessions(821011, 5);

        expect(result).toEqual([]);
    });
});
