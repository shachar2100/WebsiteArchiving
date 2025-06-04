const request = require('supertest');
const express = require('express');
const archiveRoutes = require('../../src/routes/archiveRoutes');
const fileStorageService = require('../../src/services/fileStorageService');

jest.mock('../../src/services/fileStorageService');

const app = express();
app.use(express.json());
app.use('/api/archives', archiveRoutes);

describe('GET /api/archives/domains', function() {
    afterEach(function() {
        jest.clearAllMocks();
    });

    test('should return a list of domains and log them', async function() {
        const mockDomains = ['example.com', 'test.com'];
        fileStorageService.getAllDomains.mockResolvedValue(mockDomains);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const res = await request(app).get('/api/archives/domains');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockDomains);
        expect(logSpy).toHaveBeenCalledWith('domains:');
        expect(logSpy).toHaveBeenCalledWith('domains:', mockDomains);

        logSpy.mockRestore();
    });
});
