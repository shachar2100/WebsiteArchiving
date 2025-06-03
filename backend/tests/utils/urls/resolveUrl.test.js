const { resolveUrl } = require('../../../src/utils/urlUtils');

describe('resolveUrl', () => {
    const baseUrl = 'https://example.com';

    test('resolves relative URLs', () => {
        expect(resolveUrl('/page', baseUrl)).toBe('https://example.com/page');
        expect(resolveUrl('page', baseUrl)).toBe('https://example.com/page');
        expect(resolveUrl('./page', baseUrl)).toBe('https://example.com/page');
        expect(resolveUrl('../page', baseUrl)).toBe('https://example.com/page');
    });

    test('keeps absolute URLs unchanged', () => {
        expect(resolveUrl('https://example.com/page', baseUrl)).toBe('https://example.com/page');
        expect(resolveUrl('http://other.com/page', baseUrl)).toBe('http://other.com/page');
    });

    test('resolves URLs with query parameters', () => {
        expect(resolveUrl('/page?param=value', baseUrl)).toBe('https://example.com/page?param=value');
        expect(resolveUrl('page?param=value', baseUrl)).toBe('https://example.com/page?param=value');
    });

    test('resolves URLs with hash fragments', () => {
        expect(resolveUrl('/page#section', baseUrl)).toBe('https://example.com/page#section');
        expect(resolveUrl('page#section', baseUrl)).toBe('https://example.com/page#section');
    });

    test('resolves URLs with both query parameters and hash fragments', () => {
        expect(resolveUrl('/page?param=value#section', baseUrl))
            .toBe('https://example.com/page?param=value#section');
    });

    test('resolves URLs with multiple path segments', () => {
        expect(resolveUrl('/path/to/page', baseUrl)).toBe('https://example.com/path/to/page');
        expect(resolveUrl('path/to/page', baseUrl)).toBe('https://example.com/path/to/page');
    });

    test('handles base URLs with paths', () => {
        const baseUrlWithPath = 'https://example.com/base/path/';
        expect(resolveUrl('page', baseUrlWithPath)).toBe('https://example.com/base/path/page');
        expect(resolveUrl('/page', baseUrlWithPath)).toBe('https://example.com/page');
    });

    test('handles base URLs with query parameters', () => {
        const baseUrlWithQuery = 'https://example.com?param=value';
        expect(resolveUrl('page', baseUrlWithQuery)).toBe('https://example.com/page');
    });

    test('handles base URLs with hash fragments', () => {
        const baseUrlWithHash = 'https://example.com#section';
        expect(resolveUrl('page', baseUrlWithHash)).toBe('https://example.com/page');
    });

    // test('returns original URL for invalid inputs', () => {
    //     // Invalid base URL
    //     expect(resolveUrl('/page', 'not-a-valid-url')).toBe('/page');
    //     // Invalid relative URL
    //     expect(resolveUrl('://invalid', baseUrl)).toBe('://invalid');
    //     // Both invalid
    //     expect(resolveUrl('://invalid', 'not-a-valid-url')).toBe('://invalid');
    // });

    test('handles empty or undefined inputs', () => {
        expect(resolveUrl('', baseUrl)).toBe(baseUrl + '/');
        expect(resolveUrl(undefined, baseUrl)).toBe(baseUrl + '/undefined');
        expect(resolveUrl('/page', '')).toBe('/page');
        expect(resolveUrl('/page', undefined)).toBe('/page');
    });

    test('handles URLs with special characters', () => {
        expect(resolveUrl('/page with spaces', baseUrl))
            .toBe('https://example.com/page%20with%20spaces');
        expect(resolveUrl('/page?param=value with spaces', baseUrl))
            .toBe('https://example.com/page?param=value%20with%20spaces');
    });
});