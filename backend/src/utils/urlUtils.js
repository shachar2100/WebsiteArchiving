// backend/src/utils/urlUtils.js
const { URL } = require('url');

/**
 * Normalizes a URL by removing hash, search params, and ensuring consistent slashes.
 * @param {string} urlString
 * @returns {string} Normalized URL.
 */
function normalizeUrl(urlString) {
    try {
        // If the URL doesn't start with http:// or https://, add https://
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'https://' + urlString;
        }

        const url = new URL(urlString);
        url.hash = '';    // Remove hash
        url.search = '';  // Remove search parameters
        let normalized = url.toString();
        // Ensure consistent trailing slash behavior for directories
        if (url.pathname.endsWith('/') && !url.pathname.endsWith('//') && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            // Keep trailing slash if it's a directory path
            return normalized;
        } else if (!url.pathname.endsWith('/') && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            // Add trailing slash if it's a path that typically refers to a directory
            return normalized + '/';
        }
        return normalized;
    } catch (error) {
        console.error(`Error normalizing URL ${urlString}:`, error.message);
        return urlString; // Return original if invalid
    }
}

/**
 * Gets the base URL (protocol + hostname + port) of a URL.
 * @param {string} urlString
 * @returns {string} Base URL.
 */
function getBaseUrl(urlString) {
    try {
        const url = new URL(urlString);
        return `${url.protocol}//${url.host}`;
    } catch (error) {
        console.error(`Error getting base URL for ${urlString}:`, error.message);
        return null;
    }
}

/**
 * Determines if a given URL is on the same domain as the base URL.
 * @param {string} urlString - The URL to check.
 * @param {string} baseUrlString - The base URL (e.g., of the main page).
 * @returns {boolean} True if on the same domain, false otherwise.
 */
function isSameDomain(urlString, baseUrlString) {
    try {
        const url = new URL(urlString, baseUrlString); // Use baseUrlString as base for relative URLs
        const baseUrl = new URL(baseUrlString);
        // console.log(url.hostname, baseUrl.hostname);
        return url.hostname === baseUrl.hostname;
    } catch (error) {
        // If parsing fails, assume not same domain or invalid
        return false;
    }
}

/**
 * Resolves a potentially relative URL to an absolute URL based on a base URL.
 * @param {string} relativeOrAbsoluteUrl - The URL to resolve.
 * @param {string} baseUrl - The base URL to resolve against.
 * @returns {string} The absolute URL.
 */
function resolveUrl(relativeOrAbsoluteUrl, baseUrl) {
    try {
        // Use URL constructor to resolve relative paths
        const resolvedUrl = new URL(relativeOrAbsoluteUrl, baseUrl);
        return resolvedUrl.href;
    } catch (error) {
        console.error(`Error resolving URL ${relativeOrAbsoluteUrl} against ${baseUrl}:`, error.message);
        return relativeOrAbsoluteUrl; // Return original if cannot resolve
    }
}


module.exports = {
    normalizeUrl,
    getBaseUrl,
    isSameDomain,
    resolveUrl
};