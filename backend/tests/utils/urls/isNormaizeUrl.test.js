const { normalizeUrl } = require('../../../src/utils/urlUtils');

describe('normalizeUrl', () => {
    test('removes hash fragments', () => {
        expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page/');
    });

    test('removes search parameters', () => {
        expect(normalizeUrl('https://example.com/page?param=value')).toBe('https://example.com/page/');
    });

    test('removes both hash and search parameters', () => {
        expect(normalizeUrl('https://example.com/page?param=value#section')).toBe('https://example.com/page/');
    });

    test('adds trailing slash to directory paths', () => {
        expect(normalizeUrl('https://example.com/directory')).toBe('https://example.com/directory/');
    });

    test('keeps trailing slash for directory paths that already have it', () => {
        expect(normalizeUrl('https://example.com/directory/')).toBe('https://example.com/directory/');
    });

    test('does not add trailing slash to file paths', () => {
        expect(normalizeUrl('https://example.com/file.html')).toBe('https://example.com/file.html');
    });

    test('handles URLs with different protocols', () => {
        expect(normalizeUrl('http://example.com/page')).toBe('http://example.com/page/');
        expect(normalizeUrl('https://example.com/page')).toBe('https://example.com/page/');
    });

    test('handles URLs with ports', () => {
        expect(normalizeUrl('https://example.com:8080/page')).toBe('https://example.com:8080/page/');
    });

    test('handles URLs with subdomains', () => {
        expect(normalizeUrl('https://sub.example.com/page')).toBe('https://sub.example.com/page/');
    });

    // test('handles invalid URLs by returning original string', () => {
    //     const invalidUrl = 'not-a-valid-url';
    //     expect(normalizeUrl(invalidUrl)).toBe(invalidUrl);
    // });

    test('handles URLs with multiple slashes', () => {
        expect(normalizeUrl('https://example.com//path//to//page')).toBe('https://example.com//path//to//page/');
    });

    test('handles URLs with various file extensions', () => {
        expect(normalizeUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf');
        expect(normalizeUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
        expect(normalizeUrl('https://example.com/script.js')).toBe('https://example.com/script.js');
    });
});