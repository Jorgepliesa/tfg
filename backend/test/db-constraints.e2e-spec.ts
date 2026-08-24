// backend/test/db-constraints.e2e-spec.ts
//
// Tests de restricciones CHECK de Postgres.
// Requieren conexión real a la BD (e2e), NO usan mocks.
// Se ejecutan con: npm run test:e2e
//
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { WellnessTest } from '../src/entities/WellnessTest';

describe('Restricciones CHECK de Postgres', () => {
    let app: INestApplication;
    let wellnessTestRepository: Repository<WellnessTest>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        wellnessTestRepository = moduleFixture.get<Repository<WellnessTest>>(
            getRepositoryToken(WellnessTest),
        );
    });

    afterAll(async () => app.close());

    // ─── Wellness_test ───────────────────────────────────────────────────────────

    it('Postgres rechaza pain=6 (fuera de rango 1-5)', async () => {
        await expect(
            wellnessTestRepository.query(
                `INSERT INTO wellness_test (session, user_id, type, pain, sleepiness, mood, fatigue)
                 VALUES (NOW(), 821011, 'initial', 6, 3, 3, 3)`,
            ),
        ).rejects.toThrow();
    });

    it('Postgres rechaza pain=0 (fuera de rango 1-5)', async () => {
        await expect(
            wellnessTestRepository.query(
                `INSERT INTO wellness_test (session, user_id, type, pain, sleepiness, mood, fatigue)
                 VALUES (NOW(), 821011, 'initial', 0, 3, 3, 3)`,
            ),
        ).rejects.toThrow();
    });

    it('Postgres rechaza mood=6 (fuera de rango 1-5)', async () => {
        await expect(
            wellnessTestRepository.query(
                `INSERT INTO wellness_test (session, user_id, type, pain, sleepiness, mood, fatigue)
                 VALUES (NOW(), 821011, 'initial', 3, 3, 6, 3)`,
            ),
        ).rejects.toThrow();
    });

    // ─── Aquí puedes añadir más CHECKs de otras tablas ───────────────────────────
    // Ejemplo: Steps.num_steps < 0, Session.duration >= 1440, etc.
});
