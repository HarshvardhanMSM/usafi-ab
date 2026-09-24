import request from 'supertest';
import { app } from '../src/app';

describe('Express Application Foundation', () => {
  it('should return 404 for undefined route', async () => {
    const response = await request(app).get('/api/v1/non-existent-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route not found: GET /api/v1/non-existent-endpoint',
      error: {
        code: 'NOT_FOUND',
      },
    });
  });

  it('should return OpenAPI json spec at /api/docs.json', async () => {
    const response = await request(app).get('/api/docs.json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body.info.title).toBe('Usafi Backend API Documentation');
  });
});
