"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('Express Application Foundation', () => {
    it('should return 404 for undefined route', async () => {
        const response = await (0, supertest_1.default)(app_1.app).get('/api/v1/non-existent-endpoint');
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
        const response = await (0, supertest_1.default)(app_1.app).get('/api/docs.json');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('openapi');
        expect(response.body.info.title).toBe('Usafi Backend API Documentation');
    });
});
