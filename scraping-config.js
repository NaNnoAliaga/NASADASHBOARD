// ============================================================================
// CONFIGURACIÓN DE WEB SCRAPING NASA
// ============================================================================

const SCRAPING_CONFIG = {
    // Configuración de proxy CORS
    proxy: {
        // Proxies públicos disponibles (en producción usar proxy propio)
        urls: [
            'https://api.allorigins.win/get?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://api.codetabs.com/v1/proxy?quest='
        ],
        timeout: 10000, // 10 segundos
        retries: 2
    },
    
    // Selectores CSS para cada sitio
    selectors: {
        osdr: {
            container: '.search-result, .result-item, .data-item, article, .content-item',
            title: 'h3, h2, .title, a[href*="data"]',
            link: 'a[href]',
            description: '.description, .excerpt, p',
            maxResults: 10
        },
        nslsl: {
            container: '.experiment, .project, .research-item, [class*="result"], .content-item',
            title: 'h3, h2, .title, strong, a',
            link: 'a[href]', 
            description: '.summary, .description, p',
            maxResults: 8
        },
        taskbook: {
            container: 'form[name="list"], .search-form, table',
            searchForm: 'form[name="list"]',
            searchButton: 'input[type="submit"][value*="Search"]',
            keywordInput: 'input[name*="keyword"], input[name*="title"]',
            programSelect: 'select[name*="program"], input[name*="division"]',
            results: 'table tr, .result-item, .task-item',
            title: 'td a, .title, strong',
            link: 'a[href*="task"], a[href*="project"], a[href]',
            description: '.pi, .investigator, td:nth-child(2), td:nth-child(3)',
            maxResults: 15
        }
    },
    
    // URLs de búsqueda para cada sitio
    searchUrls: {
        osdr: 'https://www.nasa.gov/osdr/data/search/?q=',
        nslsl: 'https://public.ksc.nasa.gov/nslsl/search?q=',
        taskbook: 'https://taskbook.nasaprs.com/tbp/index.cfm'
    },
    
    // URLs base para enlaces relativos
    baseUrls: {
        osdr: 'https://www.nasa.gov',
        nslsl: 'https://public.ksc.nasa.gov',
        taskbook: 'https://taskbook.nasaprs.com'
    },
    
    // Configuración de rate limiting
    rateLimit: {
        requestsPerMinute: 30,
        delayBetweenRequests: 2000 // 2 segundos
    },
    

};

// Exportar configuración (para uso en script.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCRAPING_CONFIG;
}