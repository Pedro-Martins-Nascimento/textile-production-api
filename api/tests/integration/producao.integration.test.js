const request = require('supertest');

const BASE_URL = 'http://localhost:3000/api';

describe('producao.integration', () => {

  test('GET /producoes deve retornar lista paginada com status 200', async () => {
    const res = await request(BASE_URL).get('/producoes?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /producoes deve criar registro e retornar 201', async () => {
    const res = await request(BASE_URL)
      .post('/producoes')
      .send({
        data_producao: '2026-01-01T10:00:00',
        numero_tear: 'T-099',
        codigo_produto: 'MAL-099',
        turno: 1,
        qualidade: 1,
        quilos: 10,
        pecas: 100
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    global.__idCriado = res.body.id;
  });

  test('GET /producoes/:id deve retornar registro existente com status 200', async () => {
    const res = await request(BASE_URL).get(`/producoes/${global.__idCriado}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', global.__idCriado);
  });

  test('GET /producoes/:id inexistente deve retornar 404', async () => {
    const res = await request(BASE_URL).get('/producoes/999999');

    expect(res.status).toBe(404);
  });

  test('PUT /producoes/:id deve atualizar registro e retornar 200', async () => {
    const res = await request(BASE_URL)
      .put(`/producoes/${global.__idCriado}`)
      .send({
        data_producao: '2026-01-01T10:00:00',
        numero_tear: 'T-099',
        codigo_produto: 'MAL-099',
        turno: 2,
        qualidade: 2,
        quilos: 12,
        pecas: 120
      });

    expect(res.status).toBe(200);
    expect(res.body.turno).toBe(2);
  });

  test('DELETE /producoes/:id deve remover registro e retornar 200', async () => {
    const res = await request(BASE_URL).delete(`/producoes/${global.__idCriado}`);

    expect(res.status).toBe(200);
  });

});
