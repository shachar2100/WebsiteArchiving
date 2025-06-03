// backend/src/utils/htmlRewriter.js
const cheerio = require('cheerio');
const { resolveUrl, isSameDomain } = require('./urlUtils');

/**
 * Rewrites URLs within HTML content to point to local archived paths.
 * @param {string} htmlContent - The original HTML string.
 * @param {string} originalPageUrl - The URL of the page being archived.
 * @param {string} relativeLocalPathPrefix - The prefix to add to local asset paths (e.g., './').
 * This allows the browser to find local assets relative to the current HTML file.
 * @returns {string} The modified HTML string.
 */
function rewriteHtmlUrls(htmlContent, originalPageUrl, relativeLocalPathPrefix) {
    const $ = cheerio.load(htmlContent);
    const baseUrl = new URL(originalPageUrl); // For resolving relative paths

    // Attributes to check for URLs
    const urlAttributes = {
        'a': 'href',
        'link': 'href',
        'script': 'src',
        'img': 'src',
        'source': 'src',
        'video': 'src',
        'audio': 'src',
        'iframe': 'src',
        'form': 'action',
        'meta[property="og:image"]': 'content', // Open Graph images
        'meta[name="twitter:image"]': 'content', // Twitter card images
        'meta[name="og:url"]': 'content', // Open Graph URL
        'meta[name="twitter:url"]': 'content', // Twitter card URL
    };

    Object.entries(urlAttributes).forEach(([selector, attribute]) => {
        $(selector).each((i, element) => {
            const $el = $(element);
            let originalUrl = $el.attr(attribute);

            if (originalUrl) {
                const resolvedUrl = resolveUrl(originalUrl, originalPageUrl);
                const isExternal = isSameDomain(resolvedUrl, originalPageUrl);

                // For internal links and assets, rewrite to relative local path
                if (isExternal) {
                    try {
                        const parsedOriginal = new URL(resolvedUrl);
                        // Get path relative to the original base domain
                        const pathFromRoot = parsedOriginal.pathname + parsedOriginal.search + parsedOriginal.hash;

                        // Create a new relative path for the local file system.
                        // We assume all assets will be saved in a structure reflecting their original paths.
                        // The prefix handles the relative depth from the HTML file.
                        const newRelativePath = `${relativeLocalPathPrefix}${pathFromRoot.startsWith('/') ? pathFromRoot.substring(1) : pathFromRoot}`;
                        $el.attr(attribute, newRelativePath);
                    } catch (e) {
                        console.warn(`Could not parse URL for rewriting: ${resolvedUrl}`);
                        // Keep original if parsing fails
                    }
                }
                // Note: We deliberately leave external links as absolute to their original source
                // unless they are specifically part of the "same domain" capture.
            }
        });
    });

    // Handle inline styles with url()
    $('style').each((i, element) => {
        const $el = $(element);
        let cssContent = $el.html();
        if (cssContent) {
            cssContent = cssContent.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
                const resolvedUrl = resolveUrl(url, originalPageUrl);
                if (isSameDomain(resolvedUrl, originalPageUrl)) {
                    try {
                        const parsedOriginal = new URL(resolvedUrl);
                        const pathFromRoot = parsedOriginal.pathname + parsedOriginal.search + parsedOriginal.hash;
                        const newRelativePath = `${relativeLocalPathPrefix}${pathFromRoot.startsWith('/') ? pathFromRoot.substring(1) : pathFromRoot}`;
                        return `url('${newRelativePath}')`;
                    } catch (e) {
                        console.warn(`Could not parse CSS URL for rewriting: ${resolvedUrl}`);
                        return match; // Keep original if parsing fails
                    }
                }
                return match; // Keep external URLs as is
            });
            $el.html(cssContent);
        }
    });

    // Handle `srcset` attributes for responsive images
    $('img[srcset], source[srcset]').each((i, element) => {
        const $el = $(element);
        let srcset = $el.attr('srcset');
        if (srcset) {
            const rewrittenSrcset = srcset.split(',').map(entry => {
                const parts = entry.trim().split(/\s+/);
                if (parts.length > 0) {
                    let url = parts[0];
                    const resolvedUrl = resolveUrl(url, originalPageUrl);
                    if (isSameDomain(resolvedUrl, originalPageUrl)) {
                        try {
                            const parsedOriginal = new URL(resolvedUrl);
                            const pathFromRoot = parsedOriginal.pathname + parsedOriginal.search + parsedOriginal.hash;
                            const newRelativePath = `${relativeLocalPathPrefix}${pathFromRoot.startsWith('/') ? pathFromRoot.substring(1) : pathFromRoot}`;
                            return `${newRelativePath} ${parts.slice(1).join(' ')}`;
                        } catch (e) {
                            console.warn(`Could not parse srcset URL for rewriting: ${resolvedUrl}`);
                            return entry;
                        }
                    }
                }
                return entry;
            }).join(', ');
            $el.attr('srcset', rewrittenSrcset);
        }
    });


    return $.html();
}

module.exports = {
    rewriteHtmlUrls
};