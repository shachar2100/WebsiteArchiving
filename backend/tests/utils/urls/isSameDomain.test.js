const { isSameDomain } = require('../../../src/utils/urlUtils');


describe('isSameDomain', () => {
    // --- Positive Test Cases (Should return true) ---

    test('should return true for the exact same domain', () => {
        expect(isSameDomain('https://www.example.com', 'https://www.example.com')).toBe(true);
    });

    test('should return true for different protocols on the same domain', () => {
        expect(isSameDomain('http://www.example.com', 'https://www.example.com')).toBe(true);
    });

    test('should return true for different paths/queries/hashes on the same domain', () => {
        expect(isSameDomain('https://www.example.com/about?id=1#section', 'https://www.example.com/contact')).toBe(true);
    });

    // test('should return true for a subdomain and its root domain', () => {
    //     expect(isSameDomain('https://blog.example.com', 'https://example.com')).toBe(true);
    // });

    // test('should return true for www subdomain and root domain', () => {
    //     expect(isSameDomain('https://www.example.com', 'https://example.com')).toBe(true);
    // });

    test('should return true for two different subdomains of the same root domain', () => {
        expect(isSameDomain('https://blog.example.com', 'https://shop.example.com')).toBe(true);
    });

    test('should return true for a relative URL on the same domain as the base', () => {
        expect(isSameDomain('/path/to/page', 'https://www.example.com/base')).toBe(true);
    });

    test('should return true for IP addresses on the same domain (hostname)', () => {
        expect(isSameDomain('http://192.168.1.1/path', 'http://192.168.1.1:8080')).toBe(true);
    });

    test('should return true for localhost with different ports', () => {
        expect(isSameDomain('http://localhost:3000', 'http://localhost:8080')).toBe(true);
    });

    // test('should return true for complex public suffix list domains like .co.uk', () => {
    //     expect(isSameDomain('https://sub.example.co.uk', 'https://www.example.co.uk')).toBe(true);
    // });

    // --- Negative Test Cases (Should return false) ---

    test('should return false for completely different domains', () => {
        expect(isSameDomain('https://www.google.com', 'https://www.example.com')).toBe(false);
    });

    test('should return false for a subdomain of a different root domain', () => {
        expect(isSameDomain('https://blog.anothersite.com', 'https://www.example.com')).toBe(false);
    });

    test('should return false for different public suffix list domains', () => {
        expect(isSameDomain('https://example.co.uk', 'https://example.com')).toBe(false);
    });

    // test('should return false for invalid urlString', () => {
    //     expect(isSameDomain('invalid-url-string', 'https://www.example.com')).toBe(false);
    // });

    test('should return false for invalid baseUrlString', () => {
        expect(isSameDomain('https://www.example.com', 'another-invalid-url')).toBe(false);
    });

    test('should return false when one URL is valid and the other is not', () => {
        expect(isSameDomain('validurl.com', 'invalid')).toBe(false);
        expect(isSameDomain('invalid', 'validurl.com')).toBe(false);
    });
});