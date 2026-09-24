"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('GET /api/v1/health', () => {
    it('should return 200 OK with consistent health payload structure', async () => {
        const response = await (0, supertest_1.default)(app_1.app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: 'Usafi API is running',
            data: {
                environment: expect.any(String),
            },
        });
    });
});
