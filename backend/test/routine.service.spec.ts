import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from 'inspector';
import { ClinicalProfile } from 'src/entities/ClinicalProfile';
import { Execute } from 'src/entities/Execute';
import { Exercise } from 'src/entities/Exercise';
import { Plan } from 'src/entities/Plan';
import { Routine } from 'src/entities/Routine';
import { UserAccount } from 'src/entities/UserAccount';
import { WellnessTest } from 'src/entities/WellnessTest';
import { RoutineService } from 'src/services/routine.service';


describe('RoutineService.getRoutinesForUser', () => {
    let service: RoutineService;

    const CURRENT_USER = 821011;
    const OTHER_USER = 999999;

    const mockRoutines = [
        { name: 'Cardio Suave', category: 'aerobic', difficulty: 'easy', assignedUserId: null, plans: [{ exerciseEntity: { difficulty: 'easy' } }] },
        { name: 'Cardio a medida', category: 'aerobic', difficulty: 'medium', assignedUserId: CURRENT_USER, plans: [{ exerciseEntity: { difficulty: 'medium' } }] },
        { name: 'Cardio de otro usuario', category: 'aerobic', difficulty: 'easy', assignedUserId: OTHER_USER, plans: [] },
        { name: 'Fuerza Básica', category: 'strength', difficulty: 'easy', assignedUserId: null, plans: [] },
    ];

    const mockRoutineRepo = { find: jest.fn().mockResolvedValue(mockRoutines) };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                RoutineService,
                { provide: getRepositoryToken(Routine), useValue: mockRoutineRepo },
                { provide: getRepositoryToken(Plan), useValue: {} },
                { provide: getRepositoryToken(Exercise), useValue: {} },
                { provide: getRepositoryToken(Session), useValue: {} },
                { provide: getRepositoryToken(WellnessTest), useValue: {} },
                { provide: getRepositoryToken(Execute), useValue: {} },
                { provide: getRepositoryToken(ClinicalProfile), useValue: {} },
                { provide: getRepositoryToken(UserAccount), useValue: {} },
            ],
        }).compile();

        service = module.get(RoutineService);
    });

    it('devuelve solo rutinas visibles para el usuario (genéricas + suyas), nunca de otros', async () => {
        const result = await service.getRoutinesForUser(CURRENT_USER);
        const names = result.map((r) => r.name);

        expect(names).toContain('Cardio Suave');
        expect(names).toContain('Cardio a medida');
        expect(names).not.toContain('Cardio de otro usuario');
    });

    it('filtra además por categoría cuando se especifica', async () => {
        const result = await service.getRoutinesForUser(CURRENT_USER, 'aerobic' as any);

        expect(result.every((r) => r.category === 'aerobic')).toBe(true);
        expect(result.map((r) => r.name)).not.toContain('Fuerza Básica');
    });

    it('marca correctamente isPersonal según assignedUserId', async () => {
        const result = await service.getRoutinesForUser(CURRENT_USER);

        expect(result.find((r) => r.name === 'Cardio a medida')?.isPersonal).toBe(true);
        expect(result.find((r) => r.name === 'Cardio Suave')?.isPersonal).toBe(false);
    });
});

describe('scoreRoutine', () => {
    it('da la máxima puntuación de dificultad cuando coincide exactamente con el objetivo', () => {
        const result = scoreRoutine(
            { name: 'Fuerza Básica', category: 'strength', difficulty: Difficulty.EASY, usesEquipment: false },
            { targetDifficulty: Difficulty.EASY, lastCategory: null, hasEquipment: false, usedEquipmentFallback: false, recentRoutineCounts: new Map() },
        );
        expect(result.difficultyPoints).toBe(SCORING_WEIGHTS.DIFFICULTY_MATCH);
    });

    it('penaliza una rutina repetida en las últimas sesiones proporcionalmente a las veces repetida', () => {
        const result = scoreRoutine(
            { name: 'Cardio Suave', category: 'aerobic', difficulty: Difficulty.EASY, usesEquipment: false },
            { targetDifficulty: Difficulty.EASY, lastCategory: null, hasEquipment: false, usedEquipmentFallback: false, recentRoutineCounts: new Map([['Cardio Suave', 2]]) },
        );
        expect(result.recentPenalty).toBe(SCORING_WEIGHTS.RECENT_PENALTY * 2);
    });

    it('no premia rotación de categoría si no hay rutina anterior', () => {
        const result = scoreRoutine(
            { name: 'X', category: 'strength', difficulty: Difficulty.EASY, usesEquipment: false },
            { targetDifficulty: Difficulty.EASY, lastCategory: null, hasEquipment: false, usedEquipmentFallback: false, recentRoutineCounts: new Map() },
        );
        expect(result.categoryRotationPoints).toBe(0);
    });

    it('premia el cambio de categoría respecto a la última rutina', () => {
        const result = scoreRoutine(
            { name: 'X', category: 'strength', difficulty: Difficulty.EASY, usesEquipment: false },
            { targetDifficulty: Difficulty.EASY, lastCategory: 'aerobic', hasEquipment: false, usedEquipmentFallback: false, recentRoutineCounts: new Map() },
        );
        expect(result.categoryRotationPoints).toBe(SCORING_WEIGHTS.CATEGORY_ROTATION);
    });
});