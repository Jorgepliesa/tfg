// backend/test/session-lifecycle.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Flujo de datos end-to-end: ciclo completo de una sesión', () => {
    let app: INestApplication;
    let accessToken: string;
    let fpBefore: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ id: 821011, password: '1234' });
        accessToken = loginRes.body.accessToken;
    });

    afterAll(async () => app.close());

    it('el FP ganado en una sesión completa se refleja correctamente en avatar y dashboard', async () => {
        // 1. Estado inicial: leer FP antes de empezar
        const fpBeforeRes = await request(app.getHttpServer())
            .get('/user/fp')
            .set('Authorization', `Bearer ${accessToken}`);
        fpBefore = fpBeforeRes.body.fp;

        // 2. Iniciar sesión + test inicial (como hace la app real)
        await request(app.getHttpServer())
            .post('/session/start')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ routine: 'Cardio Suave', isCoop: false })
            .expect(201);

        await request(app.getHttpServer())
            .post('/wellness-test/create')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ pain: 2, sleepiness: 2, mood: 4, fatigue: 2, type: 'initial' })
            .expect(201);

        // 3. Registrar ejecución de un ejercicio real de esa rutina
        const tInitial = new Date().toISOString();
        const tFinal = new Date(Date.now() + 60000).toISOString();
        await request(app.getHttpServer())
            .post('/execute/create')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ exercise: 'Marcha en el sitio', numRepsDone: 20, numSeriesDone: 2, tInitial, tFinal })
            .expect(201);

        // 4. Test final + cierre de sesión + FP (así lo hace wellnessTest.tsx)
        await request(app.getHttpServer())
            .post('/wellness-test/create')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ pain: 2, sleepiness: 2, mood: 5, fatigue: 2, type: 'final' })
            .expect(201);

        await request(app.getHttpServer())
            .patch('/session/end')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ duration: 5 })
            .expect(200);

        const FP_EARNED = 20; // SESSION_BASE_POINTS, sin bonus coop
        await request(app.getHttpServer())
            .patch('/avatar/add-fp')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ amount: FP_EARNED })
            .expect(200);

        // 5. TRAZABILIDAD: el dato debe llegar intacto hasta el otro extremo (dashboard parental)
        const fpAfterRes = await request(app.getHttpServer())
            .get('/user/fp')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(fpAfterRes.body.fp).toBe(fpBefore + FP_EARNED);

        const dashboardRes = await request(app.getHttpServer())
            .get('/clinical-profile/dashboard')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        expect(dashboardRes.body.stats.fp).toBe(fpBefore + FP_EARNED);
    });
});