/**
 * Configuration settings for the website archiving system
 * This file is used to store the configuration settings for the website archiving system.
 * Or any Magic numbers that need to be configured for different use cases.
*/

// Crawling settings
const CRAWL_CONFIG = {
    // Maximum number of concurrent requests to avoid overwhelming the target server
    MAX_CONCURRENT_REQUESTS: 5,
    
    // Maximum depth for recursive crawling
    MAX_CRAWL_DEPTH: 1,
    
   
};

// Export the configuration
module.exports = {
    CRAWL_CONFIG
};