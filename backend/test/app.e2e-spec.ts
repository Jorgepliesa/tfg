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
    expect(Array.isArray(res.body.explanation)).toBe(true);
  });

  it('la rutina recomendada tiene ejercicios accesibles sin contraindicaciones', async () => {
    const recommendRes = await request(app.getHttpServer())
      .get('/routine/recommend?hasEquipment=false')
      .set('Authorization', `Bearer ${accessToken}`);

    const detailsRes = await request(app.getHttpServer())
      .get(`/routine/${encodeURIComponent(recommendRes.body.routineName)}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(detailsRes.body.length).toBeGreaterThan(0);
  });
});