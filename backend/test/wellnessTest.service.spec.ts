// backend/src/services/wellnessTest.service.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, Session } from '@nestjs/common';
import { WellnessTest } from 'src/entities/WellnessTest';
import { WellnessTestService } from 'src/services/wellnessTest.service';

describe('WellnessTestService', () => {
    let service: WellnessTestService;
    const mockWellnessRepo = { findOne: jest.fn(), create: jest.fn((x) => x), save: jest.fn((x) => Promise.resolve(x)) };
    const mockSessionRepo = { findOne: jest.fn() };

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

    it('rechaza un segundo test del mismo tipo para la misma sesión', async () => {
        mockWellnessRepo.findOne.mockResolvedValue({ session: new Date(), userId: 821011, type: 'initial' });
        await expect(
            service.create(new Date(), 821011, { pain: 3, sleepiness: 3, mood: 3, fatigue: 3, type: 'initial' as any }),
        ).rejects.toThrow(BadRequestException);
    });
});