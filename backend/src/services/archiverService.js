// backend/src/services/archiverService.js
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs/promises'); // For async file operations
const { URL } = require('url');

const fileStorageService = require('./fileStorageService');
const { normalizeUrl, getBaseUrl, isSameDomain, resolveUrl } = require('../utils/urlUtils');
const { rewriteHtmlUrls } = require('../utils/htmlRewriter');

// Set a reasonable concurrency limit to avoid overwhelming the target server
const MAX_CONCURRENT_REQUESTS = 5;
// Set a reasonable depth limit for the recursive crawl
const MAX_CRAWL_DEPTH = 3; // Adjust as needed

class ArchiverService {
    constructor() {
        this.requestQueue = [];
        this.visitedUrls = new Set();
        this.activeRequests = 0;
        this.baseUrl = ''; // Base URL for the current archiving session
        this.currentDomain = ''; // Domain of the current archiving session
        this.currentTimestamp = 0; // Timestamp for the current archiving session
        this.outputBasePath = ''; // Base path for this specific archive (e.g., archives/example.com/timestamp)
        this.archiveMetadata = {}; // Metadata for the current archive session
    }

    /**
     * Initializes and starts the archiving process for a given URL.
     * @param {string} initialUrl - The URL to start archiving from.
     * @returns {Promise<object>} Metadata about the completed archive.
     */
    async archiveWebsite(initialUrl) {
        this.resetState(); // Clear state from previous archiving sessions

        try {
            const urlObj = new URL(initialUrl);
            this.currentDomain = urlObj.hostname.replace(/[^a-z0-9.]/gi, '_'); // Sanitize domain for folder name
            this.currentTimestamp = Date.now();
            this.outputBasePath = path.join(fileStorageService.archivesBaseDir, this.currentDomain, String(this.currentTimestamp));
            this.baseUrl = getBaseUrl(initialUrl);

            // Ensure the base archive directory exists
            await fs.mkdir(this.outputBasePath, { recursive: true });
            console.log(`Initialized archive at: ${this.outputBasePath}`);

            const initialPage = {
                url: normalizeUrl(initialUrl),
                depth: 0,
                isAsset: false
            };
            this.requestQueue.push(initialPage);
            this.visitedUrls.add(initialPage.url);

            this.archiveMetadata = {
                url: initialUrl,
                timestamp: this.currentTimestamp,
                domain: this.currentDomain,
                path: this.outputBasePath,
                capturedPages: [],
                capturedAssets: [],
                errors: []
            };

            // Start processing the queue
            await this._processQueue();

            console.log(`Archiving for ${initialUrl} complete!`);
            return this.archiveMetadata;

        } catch (error) {
            console.error(`Failed to initiate archive for ${initialUrl}:`, error.message);
            throw new Error(`Failed to archive website: ${error.message}`);
        }
    }

    /**
     * Resets the internal state for a new archiving session.
     */
    resetState() {
        this.requestQueue = [];
        this.visitedUrls = new Set();
        this.activeRequests = 0;
        this.baseUrl = '';
        this.currentDomain = '';
        this.currentTimestamp = 0;
        this.outputBasePath = '';
        this.archiveMetadata = {};
    }

    /**
     * Manages the concurrent processing of the request queue.
     */
    async _processQueue() {
        if (this.requestQueue.length === 0 && this.activeRequests === 0) return;
    
        while (this.requestQueue.length > 0 && this.activeRequests < MAX_CONCURRENT_REQUESTS) {
            const page = this.requestQueue.shift();
            this.activeRequests++;
            this._fetchAndProcessPage(page).finally(() => {
                this.activeRequests--;
                this._processQueue(); // Try again when done
            });
        }
    }

    /**
     * Fetches a page/asset, processes its content, and adds new links to the queue.
     * @param {object} page - The page object { url, depth, isAsset }.
     */
    async _fetchAndProcessPage(page) {
        const { url, depth, isAsset } = page;
        console.log(`Fetching [Depth ${depth}]: ${url}`);

        try {
            const response = await axios.get(url, { responseType: isAsset ? 'arraybuffer' : 'text', timeout: 10000 }); // 10s timeout

            // Determine content type for saving
            const contentType = response.headers['content-type'] || 'application/octet-stream';
            let fileExtension = '.html';
            if (contentType.includes('text/html')) {
                fileExtension = '.html';
            } else if (contentType.includes('text/css')) {
                fileExtension = '.css';
            } else if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
                fileExtension = '.js';
            } else if (contentType.includes('image/')) {
                fileExtension = `.${contentType.split('/')[1]}`; // e.g., .png, .jpeg
            } else {
                // Generic handling for other types, or specific to known types
                const urlParsed = new URL(url);
                fileExtension = path.extname(urlParsed.pathname) || '.unknown';
            }

            // Construct local path. For HTML, it's relative to the domain root in archive.
            // For assets, we try to preserve their original relative path.
            let localRelativePath;
            if (isAsset) {
                // For assets, take the path part of the URL relative to the domain
                const urlParsed = new URL(url);
                localRelativePath = urlParsed.pathname.substring(1); // Remove leading slash
                if (!localRelativePath) localRelativePath = 'index'; // Handle root assets
                // Add extension if not present in path
                if (!path.extname(localRelativePath) && fileExtension !== '.unknown') {
                    localRelativePath += fileExtension;
                }
            } else {
                // For HTML pages, ensure a canonical path, like /path/to/page/index.html
                const urlParsed = new URL(url);
                const pathname = urlParsed.pathname === '/' ? 'index' : urlParsed.pathname.substring(1);
                localRelativePath = `${pathname.replace(/\/$/, '')}/index.html`;
                // Handle cases like example.com/page.html
                if (path.extname(pathname)) {
                     localRelativePath = pathname;
                }
            }

            const fullLocalPath = fileStorageService.getArchiveFilePath(
                this.currentDomain,
                this.currentTimestamp,
                localRelativePath
            );

            let contentToSave = response.data;

            // If it's an HTML page, parse it, extract links/assets, and rewrite URLs
            if (contentType.includes('text/html') && !isAsset && depth <= MAX_CRAWL_DEPTH) {
                const relativeLocalPathPrefix = path.relative(path.dirname(fullLocalPath), this.outputBasePath).replace(/\\/g, '/') + '/';
                const rewrittenHtml = rewriteHtmlUrls(contentToSave.toString(), url, relativeLocalPathPrefix);
                contentToSave = rewrittenHtml;
                this._extractAndQueueLinks(rewrittenHtml, url, depth + 1);
            } 

            await fileStorageService.saveFile(fullLocalPath, contentToSave);

            // Record the capture
            if (isAsset) {
                this.archiveMetadata.capturedAssets.push({ url, localPath: localRelativePath, contentType });
            } else {
                this.archiveMetadata.capturedPages.push({ url, localPath: localRelativePath, contentType, depth });
            }

        } catch (error) {
            console.error(`Error fetching or processing ${url}:`, error.message);
            this.archiveMetadata.errors.push({ url, error: error.message });
        }
    }

    /**
     * Extracts internal links and asset URLs from HTML and adds them to the queue.
     * @param {string} html - The HTML content string.
     * @param {string} currentPageUrl - The URL of the page the HTML belongs to.
     * @param {number} nextDepth - The depth for the newly found links.
     */
    _extractAndQueueLinks(html, currentPageUrl, nextDepth) {
        const $ = cheerio.load(html);
        const elementsWithUrls = [
            { selector: 'a', attr: 'href', isAsset: false },
            { selector: 'link[rel="stylesheet"]', attr: 'href', isAsset: true },
            { selector: 'script[src]', attr: 'src', isAsset: true },
            { selector: 'img[src]', attr: 'src', isAsset: true },
            { selector: 'source[src]', attr: 'src', isAsset: true }, // for video/audio elements
        ];

        elementsWithUrls.forEach(({ selector, attr, isAsset }) => {
            $(selector).each((i, el) => {
                const originalUrl = $(el).attr(attr);
                if (originalUrl) {
                    const resolvedUrl = resolveUrl(originalUrl, currentPageUrl);
                    const normalized = normalizeUrl(resolvedUrl);

                    if (isSameDomain(normalized, this.baseUrl) && !this.visitedUrls.has(normalized)) {
                        if (nextDepth <= MAX_CRAWL_DEPTH || isAsset) { // Always fetch assets regardless of depth
                            this.visitedUrls.add(normalized);
                            this.requestQueue.push({ url: normalized, depth: nextDepth, isAsset });
                            // console.log(`Queued [${isAsset ? 'Asset' : 'Page'}]: ${normalized}`);
                        }
                    }
                }
            });
        });

        // Basic handling for inline styles with url()
        $('style').each((i, el) => {
            const cssContent = $(el).html();
            if (cssContent) {
                const urlsInCss = cssContent.match(/url\(['"]?(.*?)['"]?\)/g);
                if (urlsInCss) {
                    urlsInCss.forEach(match => {
                        const url = match.match(/url\(['"]?(.*?)['"]?\)/)[1];
                        const resolvedUrl = resolveUrl(url, currentPageUrl);
                        const normalized = normalizeUrl(resolvedUrl);
                        if (isSameDomain(normalized, this.baseUrl) && !this.visitedUrls.has(normalized)) {
                             this.visitedUrls.add(normalized);
                             this.requestQueue.push({ url: normalized, depth: nextDepth, isAsset: true });
                        }
                    });
                }
            }
        });
    }
}

module.exports = new ArchiverService();