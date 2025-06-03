const { normalizeUrl, getBaseUrl } = require('../../../src/utils/urlUtils');

describe('getBaseUrl', () => {
    test('extracts base URL from a simple URL', () => {
        expect(getBaseUrl('https://example.com/page')).toBe('https://example.com');
    });

    test('handles URLs with subdomains', () => {
        expect(getBaseUrl('https://sub.example.com/page')).toBe('https://sub.example.com');
    });

    test('handles URLs with ports', () => {
        expect(getBaseUrl('https://example.com:8080/page')).toBe('https://example.com:8080');
    });

    test('handles URLs with different protocols', () => {
        expect(getBaseUrl('http://example.com/page')).toBe('http://example.com');
        expect(getBaseUrl('https://example.com/page')).toBe('https://example.com');
    });

    test('handles URLs with query parameters', () => {
        expect(getBaseUrl('https://example.com/page?param=value')).toBe('https://example.com');
    });

    test('handles URLs with hash fragments', () => {
        expect(getBaseUrl('https://example.com/page#section')).toBe('https://example.com');
    });

    // test('returns null for invalid URLs', () => {
    //     expect(getBaseUrl('not-a-valid-url')).toBeNull();
    // });

    test('handles URLs with authentication', () => {
        expect(getBaseUrl('https://user:pass@example.com/page')).toBe('https://example.com');
    });

    test('handles URLs with special characters in path', () => {
        expect(getBaseUrl('https://example.com/path/with/special/chars')).toBe('https://example.com');
    });
});