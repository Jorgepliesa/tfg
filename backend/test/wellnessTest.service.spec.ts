/**
 * Tests unitarios del WellnessTestService.
 *
 * Cubre:
 *  1. create()                   – duplicado same-type → BadRequestException
 *  2. createForCurrentSession()  – sin sesión activa → BadRequestException
 *                                – con sesión activa → delega a create()
 *  3. create() happy path        – guarda y devuelve DTO correctamente
 *  4. findByUser()               – devuelve el listado mapeado a DTO
 *  5. findBySession()            – devuelve los tests de una sesión
 *  6. getInitialTest()           – devuelve null si no existe; DTO si existe
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { WellnessTest, WellnessTestType } from '../src/entities/WellnessTest';
import { Session } from '../src/entities/Session';
import { WellnessTestService } from '../src/services/wellnessTest.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTest(overrides: Partial<WellnessTest> = {}): WellnessTest {
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

const CREATE_DTO = {
    pain: 3,
    sleepiness: 3,
    mood: 3,
    fatigue: 3,
    type: WellnessTestType.INITIAL,
};

// ─── Setup ───────────────────────────────────────────────────────────────────

describe('WellnessTestService', () => {
    let service: WellnessTestService;

    const mockWellnessRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve(x)),
    };
    const mockSessionRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                WellnessTestService,
                { provide: getRepositoryToken(WellnessTest), useValue: mockWellnessRepo },
                { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
            ],
        }).compile();

        service = module.get(WellnessTestService);
        jest.clearAllMocks();
    });

    // ─── 1. create() – duplicado ──────────────────────────────────────────────

    describe('create() – detección de duplicados', () => {
        it('rechaza un segundo test del mismo tipo (initial) en la misma sesión', async () => {
            mockWellnessRepo.findOne.mockResolvedValue(makeTest());

            await expect(
                service.create(new Date(), 821011, CREATE_DTO),
            ).rejects.toThrow(BadRequestException);
        });

        it('rechaza un segundo test de tipo final en la misma sesión', async () => {
            mockWellnessRepo.findOne.mockResolvedValue(
                makeTest({ type: WellnessTestType.FINAL }),
            );

            await expect(
                service.create(new Date(), 821011, { ...CREATE_DTO, type: WellnessTestType.FINAL }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ─── 2. create() – happy path ────────────────────────────────────────────

    describe('create() – creación correcta', () => {
        it('devuelve un DTO con los campos correctos cuando no hay duplicado', async () => {
            mockWellnessRepo.findOne.mockResolvedValue(null); // no existe test previo
            const sessionDate = new Date('2026-01-15T10:00:00Z');

            const result = await service.create(sessionDate, 821011, CREATE_DTO);

            expect(result.userId).toBe(821011);
            expect(result.pain).toBe(CREATE_DTO.pain);
            expect(result.mood).toBe(CREATE_DTO.mood);
            expect(result.type).toBe(WellnessTestType.INITIAL);
            expect(mockWellnessRepo.save).toHaveBeenCalledTimes(1);
        });

        it('llama a save() exactamente una vez al crear', async () => {
            mockWellnessRepo.findOne.mockResolvedValue(null);

            await service.create(new Date(), 821011, CREATE_DTO);

            expect(mockWellnessRepo.save).toHaveBeenCalledTimes(1);
        });
    });

    // ─── 3. createForCurrentSession() ───────────────────────────────────────

    describe('createForCurrentSession()', () => {
        it('lanza BadRequestException si el usuario no tiene sesión activa', async () => {
            mockSessionRepo.findOne.mockResolvedValue(null);

            await expect(
                service.createForCurrentSession(821011, CREATE_DTO),
            ).rejects.toThrow(BadRequestException);
        });

        it('usa la fecha de la sesión activa para crear el test', async () => {
            const sessionDate = new Date('2026-01-15T10:00:00Z');
            mockSessionRepo.findOne.mockResolvedValue({ date: sessionDate, userId: 821011 } as Session);
            mockWellnessRepo.findOne.mockResolvedValue(null); // sin duplicado

            const result = await service.createForCurrentSession(821011, CREATE_DTO);

            // La sesión debe usarse como referencia temporal
            expect(result.session).toEqual(sessionDate);
        });
    });

    // ─── 4. findByUser() ─────────────────────────────────────────────────────

    describe('findByUser()', () => {
        it('devuelve lista vacía si el usuario no tiene tests', async () => {
            mockWellnessRepo.find.mockResolvedValue([]);

            const result = await service.findByUser(821011);

            expect(result).toEqual([]);
        });

        it('devuelve todos los tests del usuario mapeados a DTO', async () => {
            const tests = [
                makeTest({ type: WellnessTestType.INITIAL }),
                makeTest({ type: WellnessTestType.FINAL }),
            ];
            mockWellnessRepo.find.mockResolvedValue(tests);

            const result = await service.findByUser(821011);

            expect(result).toHaveLength(2);
            expect(result[0].type).toBe(WellnessTestType.INITIAL);
            expect(result[1].type).toBe(WellnessTestType.FINAL);
        });
    });

    // ─── 5. findBySession() ──────────────────────────────────────────────────

    describe('findBySession()', () => {
        it('devuelve los tests de una sesión concreta', async () => {
            const sessionDate = new Date('2026-01-15T10:00:00Z');
            const tests = [makeTest({ session: sessionDate, type: WellnessTestType.INITIAL })];
            mockWellnessRepo.find.mockResolvedValue(tests);

            const result = await service.findBySession(sessionDate, 821011);

            expect(result).toHaveLength(1);
            expect(result[0].type).toBe(WellnessTestType.INITIAL);
        });

        it('devuelve lista vacía si no hay tests para esa sesión', async () => {
            mockWellnessRepo.find.mockResolvedValue([]);

            const result = await service.findBySession(new Date(), 821011);

            expect(result).toEqual([]);
        });
    });

    // ─── 6. getInitialTest() ─────────────────────────────────────────────────

    describe('getInitialTest()', () => {
        it('devuelve null si no existe test inicial para esa sesión', async () => {
            mockWellnessRepo.findOne.mockResolvedValue(null);

            const result = await service.getInitialTest(new Date(), 821011);

            expect(result).toBeNull();
        });

        it('devuelve el DTO del test inicial si existe', async () => {
            const sessionDate = new Date('2026-01-15T10:00:00Z');
            mockWellnessRepo.findOne.mockResolvedValue(
                makeTest({ session: sessionDate, type: WellnessTestType.INITIAL, pain: 4 }),
            );

            const result = await service.getInitialTest(sessionDate, 821011);

            expect(result).not.toBeNull();
            expect(result!.type).toBe(WellnessTestType.INITIAL);
            expect(result!.pain).toBe(4);
        });
    });
});