import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Recomendación de rutinas (integración)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ id: 821011, password: '1234' }); // usuario de pruebas del seed

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => app.close());

  it('devuelve una rutina recomendada con desglose de puntuación', async () => {
    const res = await request(app.getHttpServer())
      .get('/routine/recommend?hasEquipment=false')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('routineName');
    // El campo real se llama `allScores` (array con la puntuación de cada rutina candidata)
    expect(Array.isArray(res.body.allScores)).toBe(true);
  });

  it('la rutina recomendada tiene ejercicios accesibles para el usuario', async () => {
    const recommendRes = await request(app.getHttpServer())
      .get('/routine/recommend?hasEquipment=false')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const routineName = recommendRes.body.routineName;

    // El servicio ya excluye rutinas sin ejercicios del algoritmo de recomendación,
    // así que edit-view siempre devolverá al menos 1 ejercicio.
    const detailsRes = await request(app.getHttpServer())
      .get(`/routine/${encodeURIComponent(routineName)}/edit-view`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(detailsRes.body.exercises.length).toBeGreaterThan(0);
  });
});