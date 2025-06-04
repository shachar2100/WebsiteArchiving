const fs = require('fs/promises');
const path = require('path');
const fileStorageService = require('../../src/services/fileStorageService');

jest.mock('fs/promises');

describe('fileStorageService.getAllDomains', function() {
    afterEach(function() {
        jest.clearAllMocks();
    });

    test('should return real list of domain directories', async function() {
        // Do NOT mock fs.readdir here!
        const result = await fileStorageService.getAllDomains();
        console.log('result:',result); // Should show actual directories in your archives folder
        // You can add assertions based on your real folder contents
    });

    // test('should return empty array if no directories', async function() {
    //     fs.readdir.mockResolvedValue([
    //         { name: 'file.txt', isDirectory: () => false }
    //     ]);
    //     const result = await fileStorageService.getAllDomains();
    //     expect(result).toEqual([]);
    // });

    // test('should throw if fs.readdir fails', async function() {
    //     fs.readdir.mockRejectedValue(new Error('FS error'));
    //     await expect(fileStorageService.getAllDomains()).rejects.toThrow('FS error');
    // });
});