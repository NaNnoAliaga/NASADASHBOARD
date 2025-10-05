// Variables globales
let allPublications = [];
let extractedKeywordsData = {};
let publicationsAnalytics = {};
let filteredPublications = [];

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

/**
 * Muestra la pestaña seleccionada y oculta las demás
 * @param {string} tabId - ID de la pestaña a mostrar
 */
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

/**
 * Intenta cargar automáticamente el archivo CSV desde el servidor
 */
function fetchCSVFile() {
    // Mostrar mensaje de carga automática
    updateHomeStatus('⏳ Intentando cargar archivo CSV automáticamente...');
    
    const csvFilePath = '/SB_publication_PMC.csv'; // Ruta actualizada al directorio raíz
    
    fetch(csvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo CSV');
            }
            return response.text();
        })
        .then(text => {
            parseCSV(text);
            updateHomeStatus(`✅ Archivo cargado automáticamente: ${allPublications.length} publicaciones`);
        })
        .catch(error => {
            updateHomeStatus('⚠️ No se pudo cargar automáticamente. Use la carga manual de archivos.');
            console.log('Info: Carga automática no disponible, usar carga manual:', error.message);
        });
}

/**
 * Actualiza el estado en la página de inicio
 * @param {string} message - Mensaje a mostrar
 */
function updateHomeStatus(message) {
    // Solo actualizar si el elemento existe (compatibilidad)
    const statusElement = document.getElementById('csvLoadStatus');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="alert alert-info">
                ${message}
            </div>
        `;
    }
}

/**
 * Maneja la carga manual de archivos CSV
 * @param {Event} event - Evento del input file
 */
function loadPublicationsCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    if (!validateFile(file)) return;

    // Mostrar progreso de carga
    showUploadProgress();
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
        updateProgress(10, 'Iniciando lectura del archivo...');
    };
    
    reader.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentLoaded = Math.round((e.loaded / e.total) * 60) + 20;
            updateProgress(percentLoaded, 'Leyendo archivo...');
        }
    };
    
    reader.onload = function(e) {
        updateProgress(80, 'Procesando datos...');
        
        setTimeout(() => {
            const text = e.target.result;
            parseCSV(text);
            updateProgress(100, 'Procesamiento completado');
            
            setTimeout(() => {
                showUploadResult('success', file);
            }, 500);
        }, 500);
    };
    
    reader.onerror = () => {
        showUploadResult('error', file, 'Error al leer el archivo');
    };
    
    reader.readAsText(file);
}

/**
 * Valida el archivo antes de procesarlo
 * @param {File} file - Archivo a validar
 * @returns {boolean} True si es válido
 */
function validateFile(file) {
    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showUploadResult('error', file, 'El archivo debe ser de tipo CSV');
        return false;
    }
    
    // Validar tamaño (50MB máximo)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showUploadResult('error', file, 'El archivo es demasiado grande (máximo 50MB)');
        return false;
    }
    
    return true;
}

/**
 * Muestra la barra de progreso
 */
function showUploadProgress() {
    document.getElementById('fileDropZone').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'block';
    document.getElementById('clearUploadBtn').style.display = 'none';
}

/**
 * Actualiza el progreso de carga
 * @param {number} percentage - Porcentaje completado
 * @param {string} message - Mensaje descriptivo
 */
function updateProgress(percentage, message) {
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('progressBarFill').style.width = `${percentage}%`;
    document.getElementById('progressDetails').textContent = message;
}

/**
 * Muestra el resultado de la carga
 * @param {string} type - 'success', 'error', 'warning'
 * @param {File} file - Archivo procesado
 * @param {string} errorMessage - Mensaje de error opcional
 */
function showUploadResult(type, file, errorMessage = null) {
    document.getElementById('uploadProgress').style.display = 'none';
    
    const resultDiv = document.getElementById('uploadResult');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');
    const resultStats = document.getElementById('resultStats');
    
    // Limpiar clases anteriores
    resultDiv.className = 'upload-result';
    
    if (type === 'success') {
        resultDiv.classList.add('success');
        resultIcon.textContent = '✅';
        resultTitle.textContent = 'Archivo cargado exitosamente';
        resultDescription.textContent = `${file.name} (${formatFileSize(file.size)}) ha sido procesado correctamente`;
        
        // Mostrar estadísticas
        resultStats.innerHTML = `
            <span class="stat-badge">📄 ${allPublications.length} publicaciones</span>
            <span class="stat-badge">🏷️ ${Object.keys(extractedKeywordsData).length} keywords</span>
            <span class="stat-badge">🔗 ${allPublications.filter(p => p.pmcid).length} con PMCID</span>
        `;
        
        document.getElementById('clearUploadBtn').style.display = 'inline-block';
        
    } else if (type === 'error') {
        resultDiv.classList.add('error');
        resultIcon.textContent = '❌';
        resultTitle.textContent = 'Error al procesar archivo';
        resultDescription.textContent = errorMessage || 'Ha ocurrido un error inesperado';
        resultStats.innerHTML = '';
        
    } else if (type === 'warning') {
        resultDiv.classList.add('warning');
        resultIcon.textContent = '⚠️';
        resultTitle.textContent = 'Archivo procesado con advertencias';
        resultDescription.textContent = errorMessage || 'El archivo fue procesado pero con algunas advertencias';
    }
    
    resultDiv.style.display = 'flex';
}

/**
 * Formatea el tamaño del archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Limpia la carga y permite subir otro archivo
 */
function clearUpload() {
    // Limpiar datos
    allPublications = [];
    extractedKeywordsData = {};
    filteredPublications = [];
    
    // Resetear métricas
    document.getElementById('totalPublications').textContent = '0';
    document.getElementById('uniqueKeywords').textContent = '0';
    document.getElementById('withPMCID').textContent = '0';
    document.getElementById('publicationsStatus').textContent = 'Esperando carga de archivo CSV...';
    
    // Limpiar listas
    document.getElementById('publicationsList').innerHTML = '';
    document.getElementById('extractedKeywords').innerHTML = '';
    document.getElementById('wordCloudContainer').innerHTML = '';
    
    // Mostrar zona de drop de nuevo
    document.getElementById('uploadResult').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('fileDropZone').style.display = 'block';
    document.getElementById('clearUploadBtn').style.display = 'none';
    
    // Limpiar input
    document.getElementById('csvFileInput').value = '';
}

/**
 * Parsea el contenido del archivo CSV
 * @param {string} text - Contenido del archivo CSV
 */
function parseCSV(text) {
    const lines = text.split('\n');
    allPublications = [];
    
    // Procesar líneas
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = parseCSVLine(lines[i]);
        if (values.length >= 2) {
            const publication = {
                title: values[0] || '',
                link: values[1] || '',
                pmcid: extractPMCID(values[1] || ''),
                wordCount: values[0] ? values[0].split(' ').length : 0
            };
            allPublications.push(publication);
        }
    }

    filteredPublications = [...allPublications];
    
    // Extraer keywords y generar estadísticas de forma asíncrona
    setTimeout(() => {
        extractKeywords();
        generateStatistics();
        
        // Actualizar status y métricas
        document.getElementById('publicationsStatus').textContent = 
            `${allPublications.length} publicaciones cargadas y procesadas`;
        
        document.getElementById('totalPublications').textContent = allPublications.length;
        
        // Mostrar publicaciones
        displayAllPublications();
        
        // Mensaje de éxito en la consola
        console.log(`✅ Procesamiento completado: ${allPublications.length} publicaciones, ${Object.keys(extractedKeywordsData).length} keywords únicas`);
        
    }, 100);
}

/**
 * Parsea una línea individual del CSV manejando comillas
 * @param {string} line - Línea del CSV a parsear
 * @returns {Array} Array con los valores parseados
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

/**
 * Extrae el PMCID del enlace
 * @param {string} link - Enlace del artículo
 * @returns {string} PMCID extraído o cadena vacía
 */
function extractPMCID(link) {
    const match = link.match(/PMC\d+/);
    return match ? match[0] : '';
}

/**
 * Genera estadísticas de las publicaciones cargadas
 */
function generateStatistics() {
    if (allPublications.length === 0) {
        alert('No hay publicaciones cargadas');
        return;
    }

    const stats = {
        total: allPublications.length,
        withPMCID: allPublications.filter(p => p.pmcid).length,
        avgWordCount: Math.round(
            allPublications.reduce((sum, p) => sum + p.wordCount, 0) / allPublications.length
        ),
        uniqueKeywords: Object.keys(extractedKeywordsData).length
    };

    publicationsAnalytics = stats;

    document.getElementById('totalPubsStats').textContent = stats.total;
    document.getElementById('uniqueKeywordsStats').textContent = stats.uniqueKeywords;
    document.getElementById('avgTitleLength').textContent = stats.avgWordCount;
    document.getElementById('withPMCIDStats').textContent = stats.withPMCID;
    document.getElementById('uniqueKeywords').textContent = stats.uniqueKeywords;
    document.getElementById('withPMCID').textContent = stats.withPMCID;
}

/**
 * Exporta las estadísticas como archivo de texto
 */
function exportStatistics() {
    if (Object.keys(publicationsAnalytics).length === 0) {
        alert('Genera estadísticas primero');
        return;
    }

    const report = `ANÁLISIS ESTADÍSTICO - PUBLICACIONES PMC NASA
==============================================

Total de Publicaciones: ${publicationsAnalytics.total}
Publicaciones con PMCID: ${publicationsAnalytics.withPMCID}
Promedio de Palabras por Título: ${publicationsAnalytics.avgWordCount}
Keywords Únicas Extraídas: ${publicationsAnalytics.uniqueKeywords}

TOP 20 KEYWORDS MÁS FRECUENTES:
${Object.entries(extractedKeywordsData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([kw, freq], i) => `${i + 1}. ${kw}: ${freq} apariciones`)
    .join('\n')}

Generado: ${new Date().toLocaleString()}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nasa_statistics.txt';
    a.click();
}

/**
 * Extrae palabras clave de los títulos de las publicaciones
 */
function extractKeywords() {
    if (allPublications.length === 0) return;

    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were'
    ]);

    const keywordFreq = {};

    allPublications.forEach(pub => {
        const words = pub.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        words.forEach(word => {
            keywordFreq[word] = (keywordFreq[word] || 0) + 1;
        });
    });

    extractedKeywordsData = keywordFreq;
    displayExtractedKeywords();
    createWordCloud();
}

/**
 * Muestra las palabras clave extraídas en el panel de análisis
 */
function displayExtractedKeywords() {
    const sortedKeywords = Object.entries(extractedKeywordsData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    sortedKeywords.forEach(([keyword, freq]) => {
        html += `
            <div class="keyword-item" onclick="filterByKeyword('${keyword}')">
                ${keyword}
                <span class="keyword-frequency">${freq}</span>
            </div>
        `;
    });
    html += '</div>';

    document.getElementById('extractedKeywords').innerHTML = html;
}

/**
 * Crea la nube de palabras visual
 */
function createWordCloud() {
    const sortedKeywords = Object.entries(extractedKeywordsData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 40);

    if (sortedKeywords.length === 0) return;

    const maxFreq = sortedKeywords[0][1];
    const minFreq = sortedKeywords[sortedKeywords.length - 1][1];

    let html = '';
    sortedKeywords.forEach(([keyword, freq]) => {
        const size = 0.8 + ((freq - minFreq) / (maxFreq - minFreq)) * 2;
        const opacity = 0.6 + ((freq - minFreq) / (maxFreq - minFreq)) * 0.4;
        
        html += `
            <div class="word-item" 
                 style="font-size: ${size}rem; opacity: ${opacity}; color: #1465bb; font-weight: bold; padding: 5px 10px;"
                 onclick="filterByKeyword('${keyword}')"
                 title="${freq} apariciones">
                ${keyword}
            </div>
        `;
    });

    document.getElementById('wordCloudContainer').innerHTML = html;
}

/**
 * Filtra publicaciones por palabra clave
 * @param {string} keyword - Palabra clave para filtrar
 */
function filterByKeyword(keyword) {
    document.getElementById('publicationsSearch').value = keyword;
    searchPublications();
    showTab('publications');
}

/**
 * Descarga las palabras clave como archivo CSV
 */
function downloadKeywords() {
    if (Object.keys(extractedKeywordsData).length === 0) {
        alert('Extrae keywords primero');
        return;
    }

    let csv = 'Keyword,Frequency\n';
    Object.entries(extractedKeywordsData)
        .sort((a, b) => b[1] - a[1])
        .forEach(([kw, freq]) => {
            csv += `"${kw}",${freq}\n`;
        });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords.csv';
    a.click();
}

/**
 * Muestra todas las publicaciones en la interfaz
 * @param {Array} publications - Array opcional de publicaciones a mostrar
 */
function displayAllPublications(publications = filteredPublications) {
    if (publications.length === 0 && allPublications.length === 0) {
        document.getElementById('publicationsList').innerHTML = `
            <div class="alert alert-info">
                📄 No hay publicaciones para mostrar. Carga un archivo CSV para comenzar.
            </div>
        `;
        return;
    }

    const localCount = publications.filter(p => !p.source).length;
    const externalCount = publications.filter(p => p.source).length;
    
    let html = `
        <h3>📄 ${publications.length} resultados encontrados</h3>
        ${externalCount > 0 ? `
            <div class="alert alert-success">
                🌐 <strong>${localCount}</strong> resultados locales + <strong>${externalCount}</strong> resultados de APIs NASA
            </div>
        ` : ''}
    `;

    publications.slice(0, 50).forEach((pub, i) => {
        const sourceIcon = pub.source ? getSourceIcon(pub.source) : '📄';
        const sourceBadge = pub.source ? `<span class="badge badge-info">${pub.source}</span>` : '';
        
        html += `
            <div class="paper-card ${pub.source ? 'external-result' : ''}">
                <div class="paper-title">${sourceIcon} ${i + 1}. ${pub.title}</div>
                ${pub.description ? `<p class="paper-description">${pub.description}</p>` : ''}
                <div class="paper-meta">
                    ${sourceBadge}
                    <span class="badge badge-primary">${pub.pmcid || 'No PMCID'}</span>
                    <a href="${pub.link}" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 5px 15px;">
                        🔗 Ver ${pub.source ? 'Recurso' : 'Artículo'}
                    </a>
                </div>
            </div>
        `;
    });

    if (publications.length > 50) {
        html += `<div class="alert alert-warning">📊 Mostrando los primeros 50 de ${publications.length} resultados</div>`;
    }

    document.getElementById('publicationsList').innerHTML = html;
}

/**
 * Busca publicaciones según el término ingresado (local y APIs externas)
 */
async function searchPublications() {
    const query = document.getElementById('publicationsSearch').value.toLowerCase().trim();
    
    if (!query) {
        filteredPublications = [...allPublications];
        displayAllPublications();
        hideScrapingStatus();
        return;
    }

    // Mostrar indicador de carga
    showScrapingStatus('Iniciando búsqueda...', 0);
    
    document.getElementById('publicationsList').innerHTML = `
        <div class="alert alert-info">
            <strong>🔍 Buscando...</strong> Consultando bases de datos locales y APIs de la NASA...
            <div class="scraping-indicators">
                <span class="external-source-badge">📄 Local</span>
                <span class="external-source-badge">🧬 OSDR</span>
                <span class="external-source-badge">🔬 NSLSL</span>
                <span class="external-source-badge">📋 Taskbook</span>
            </div>
        </div>
    `;

    // Búsqueda local rápida
    filteredPublications = allPublications.filter(pub => 
        pub.title.toLowerCase().includes(query) ||
        (pub.pmcid?.toLowerCase().includes(query))
    );
    
    updateScrapingStatus('Búsqueda local completada', 25);

    // Búsqueda en APIs externas
    try {
        updateScrapingStatus('Consultando APIs externas...', 40);
        const externalResults = await searchExternalSources(query);
        
        // Combinar resultados
        const combinedResults = [...filteredPublications, ...externalResults];
        
        updateScrapingStatus('Procesando resultados...', 90);
        
        // Actualizar vista
        displayAllPublications(combinedResults);
        
        updateScrapingStatus(`✅ Búsqueda completada: ${combinedResults.length} resultados`, 100);
        
        // Ocultar indicador después de 3 segundos
        setTimeout(() => hideScrapingStatus(), 3000);
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        updateScrapingStatus('❌ Error en búsqueda externa - mostrando resultados locales', 100);
        displayAllPublications();
        setTimeout(() => hideScrapingStatus(), 5000);
    }
}

/**
 * Busca en fuentes externas de la NASA
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados de búsqueda externa
 */
async function searchExternalSources(query) {
    const results = [];
    
    try {
        // Búsqueda paralela en todas las fuentes
        const searchPromises = [
            searchOSDR(query),
            searchNSLSL(query),
            searchTaskbook(query)
        ];
        
        const allResults = await Promise.allSettled(searchPromises);
        
        allResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                results.push(...result.value);
            } else if (result.status === 'rejected') {
                console.warn(`Error en búsqueda ${index}:`, result.reason);
            }
        });
        
    } catch (error) {
        console.error('Error en búsqueda externa:', error);
    }
    
    return results;
}

/**
 * Busca en OSDR (Open Science Data Repository)
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados de OSDR
 */
async function searchOSDR(query) {
    try {
        // Intentar scraping real de OSDR
        const results = await scrapeOSDR(query);
        if (results.length > 0) {
            return results;
        }
        
        // Si no hay resultados del scraping, devolver array vacío
        return [];
        
    } catch (error) {
        console.error('Error buscando en OSDR:', error);
        return [];
    }
}

/**
 * Busca en NSLSL (NASA Space Life Sciences Laboratory)
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados de NSLSL
 */
async function searchNSLSL(query) {
    try {
        // Intentar scraping real de NSLSL
        const results = await scrapeNSLSL(query);
        if (results.length > 0) {
            return results;
        }
        
        // Si no hay resultados del scraping, devolver array vacío
        return [];
        
    } catch (error) {
        console.error('Error buscando en NSLSL:', error);
        return [];
    }
}

/**
 * Busca en NASA Taskbook
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados del Taskbook
 */
async function searchTaskbook(query) {
    try {
        // Intentar scraping real del Taskbook
        const results = await scrapeTaskbook(query);
        if (results.length > 0) {
            return results;
        }
        
        // Si no hay resultados del scraping, devolver array vacío
        return [];
        
    } catch (error) {
        console.error('Error buscando en Taskbook:', error);
        return [];
    }
}



/**
 * Limpia la búsqueda y muestra todas las publicaciones locales
 */
function clearSearch() {
    document.getElementById('publicationsSearch').value = '';
    filteredPublications = [...allPublications];
    displayAllPublications();
}

/**
 * Obtiene el icono correspondiente a la fuente de datos
 * @param {string} source - Nombre de la fuente
 * @returns {string} Emoji correspondiente
 */
function getSourceIcon(source) {
    const icons = {
        'OSDR': '🧬',
        'NSLSL': '🔬', 
        'NASA Taskbook': '📋'
    };
    return icons[source] || '📄';
}

/**
 * Configura búsqueda en tiempo real
 */
function setupRealTimeSearch() {
    const searchInput = document.getElementById('publicationsSearch');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchPublications();
        }, 800); // Esperar 800ms después de que el usuario deje de escribir
    });
}

/**
 * Muestra el estado del scraping
 * @param {string} message - Mensaje a mostrar
 * @param {number} progress - Porcentaje de progreso (0-100)
 */
function showScrapingStatus(message, progress = 0) {
    const statusDiv = document.getElementById('scrapingStatus');
    const statusText = document.getElementById('scrapingStatusText');
    const progressBar = document.getElementById('scrapingProgress');
    
    statusDiv.style.display = 'block';
    statusText.textContent = message;
    progressBar.style.width = `${progress}%`;
}

/**
 * Actualiza el estado del scraping
 * @param {string} message - Mensaje a mostrar
 * @param {number} progress - Porcentaje de progreso (0-100)
 */
function updateScrapingStatus(message, progress) {
    const statusText = document.getElementById('scrapingStatusText');
    const progressBar = document.getElementById('scrapingProgress');
    
    statusText.textContent = message;
    progressBar.style.width = `${progress}%`;
}

/**
 * Oculta el estado del scraping
 */
function hideScrapingStatus() {
    const statusDiv = document.getElementById('scrapingStatus');
    statusDiv.style.display = 'none';
}

// Evento que se ejecuta cuando se carga la página
window.addEventListener('DOMContentLoaded', () => {
    fetchCSVFile();
    setupRealTimeSearch();
    // Inicialización del dashboard sin chatbot
    console.log('🚀 NASA Dashboard inicializado correctamente');
    setupDragAndDrop();
});

/**
 * Configura la funcionalidad de drag & drop
 */
function setupDragAndDrop() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('csvFileInput');
    
    if (!dropZone || !fileInput) return;
    
    // Prevenir comportamiento por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Resaltar zona de drop cuando se arrastra sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Manejar archivos soltados
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Click en zona de drop abre selector de archivo
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            
            // Simular el evento de change del input
            const event = {
                target: {
                    files: [file]
                }
            };
            
            loadPublicationsCSV(event);
        }
    }
}

// ============================================================================
// FUNCIONES DE WEB SCRAPING PARA SITIOS NASA
// ============================================================================

/**
 * Proxy para evitar problemas de CORS
 * @param {string} url - URL a hacer scraping
 * @returns {Promise<string>} HTML de la página
 */
async function fetchWithProxy(url) {
    // Usar un proxy CORS público (en producción usar tu propio proxy)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.contents;
}

/**
 * Scraping real de OSDR
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados extraídos
 */
async function scrapeOSDR(query) {
    try {
        const searchUrl = `https://www.nasa.gov/osdr/data/search/?q=${encodeURIComponent(query)}`;
        const html = await fetchWithProxy(searchUrl);
        
        // Crear un parser DOM temporal
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const results = [];
        
        // Buscar elementos de resultados (ajustar selectores según estructura real)
        const resultElements = doc.querySelectorAll('.search-result, .result-item, .data-item, article, .content-item');
        
        resultElements.forEach((element, index) => {
            if (index >= 10) return; // Limitar a 10 resultados
            
            const titleElement = element.querySelector('h3, h2, .title, a[href*="data"]');
            const linkElement = element.querySelector('a[href]');
            const descElement = element.querySelector('.description, .excerpt, p');
            
            if (titleElement) {
                const title = titleElement.textContent?.trim();
                const link = linkElement?.href || searchUrl;
                const description = descElement?.textContent?.trim() || 'Datos de investigación espacial';
                
                if (title && title.length > 5) {
                    results.push({
                        title: `[OSDR] ${title}`,
                        link: link.startsWith('http') ? link : `https://www.nasa.gov${link}`,
                        pmcid: `OSDR-${Date.now()}-${index}`,
                        wordCount: title.split(' ').length,
                        source: 'OSDR',
                        description: description.substring(0, 150) + '...'
                    });
                }
            }
        });
        
        return results;
        
    } catch (error) {
        console.warn('Scraping OSDR falló:', error);
        return [];
    }
}

/**
 * Scraping real de NSLSL
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados extraídos
 */
async function scrapeNSLSL(query) {
    try {
        const searchUrl = `https://public.ksc.nasa.gov/nslsl/search?q=${encodeURIComponent(query)}`;
        const html = await fetchWithProxy(searchUrl);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const results = [];
        
        // Buscar experimentos y proyectos
        const resultElements = doc.querySelectorAll('.experiment, .project, .research-item, [class*="result"], .content-item');
        
        resultElements.forEach((element, index) => {
            if (index >= 8) return;
            
            const titleElement = element.querySelector('h3, h2, .title, strong, a');
            const linkElement = element.querySelector('a[href]');
            const descElement = element.querySelector('.summary, .description, p');
            
            if (titleElement) {
                const title = titleElement.textContent?.trim();
                const link = linkElement?.href || searchUrl;
                const description = descElement?.textContent?.trim() || 'Experimento del laboratorio espacial';
                
                if (title && title.length > 5) {
                    results.push({
                        title: `[NSLSL] ${title}`,
                        link: link.startsWith('http') ? link : `https://public.ksc.nasa.gov${link}`,
                        pmcid: `NSLSL-${Date.now()}-${index}`,
                        wordCount: title.split(' ').length,
                        source: 'NSLSL',
                        description: description.substring(0, 150) + '...'
                    });
                }
            }
        });
        
        return results;
        
    } catch (error) {
        console.warn('Scraping NSLSL falló:', error);
        return [];
    }
}

/**
 * Scraping real de NASA Taskbook
 * @param {string} query - Término de búsqueda
 * @returns {Array} Resultados extraídos
 */
async function scrapeTaskbook(query) {
    try {
        const searchUrl = `https://taskbook.nasaprs.com/tbp/search.cfm?query=${encodeURIComponent(query)}`;
        const html = await fetchWithProxy(searchUrl);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const results = [];
        
        // Buscar proyectos en el taskbook
        const resultElements = doc.querySelectorAll('.task, .project, .research, tr[class*="row"], .result-row');
        
        resultElements.forEach((element, index) => {
            if (index >= 12) return;
            
            const titleElement = element.querySelector('td a, .title, h3, strong');
            const linkElement = element.querySelector('a[href*="task"], a[href*="project"], a[href]');
            const piElement = element.querySelector('.pi, .investigator, td:nth-child(2)');
            
            if (titleElement) {
                const title = titleElement.textContent?.trim();
                const link = linkElement?.href || searchUrl;
                const pi = piElement?.textContent?.trim() || 'NASA Researcher';
                
                if (title && title.length > 5) {
                    results.push({
                        title: `[Taskbook] ${title}`,
                        link: link.startsWith('http') ? link : `https://taskbook.nasaprs.com${link}`,
                        pmcid: `TB-${Date.now()}-${index}`,
                        wordCount: title.split(' ').length,
                        source: 'NASA Taskbook',
                        description: `Investigador Principal: ${pi}. Proyecto de investigación activo.`
                    });
                }
            }
        });
        
        return results;
        
    } catch (error) {
        console.warn('Scraping Taskbook falló:', error);
        return [];
    }
}

// ============================================================================
// FUNCIONES MEJORADAS PARA NASA TASKBOOK
// ============================================================================

/**
 * Scraping avanzado de NASA Taskbook con múltiples parámetros
 */
async function scrapeTaskbookAdvanced(params) {
    try {
        // URL base del Taskbook
        const baseUrl = 'https://taskbook.nasaprs.com/tbp/index.cfm';
        
        // Construir parámetros de búsqueda
        const searchParams = new URLSearchParams();
        
        if (params.keywords) {
            searchParams.append('keywords', params.keywords);
        }
        if (params.investigator) {
            searchParams.append('investigator_last', params.investigator);
        }
        if (params.program) {
            searchParams.append('program', params.program);
        }
        if (params.year) {
            searchParams.append('fiscal_year', params.year);
        }
        
        const searchUrl = `${baseUrl}?${searchParams.toString()}`;
        console.log('🔍 Buscando en NASA Taskbook:', searchUrl);
        
        // Intentar hacer scraping real con proxy
        const html = await fetchWithProxy(searchUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const results = [];
        
        // Buscar resultados en diferentes formatos
        const selectors = [
            'table tr:not(:first-child)', // Filas de tabla excepto header
            '.result-item',
            '.task-item', 
            '.project-row',
            'form[name="list"] tr'
        ];
        
        for (const selector of selectors) {
            const elements = doc.querySelectorAll(selector);
            
            elements.forEach((element, index) => {
                if (results.length >= 15) return; // Límite de resultados
                
                try {
                    const cells = element.querySelectorAll('td');
                    if (cells.length >= 2) {
                        // Formato de tabla estándar
                        const title = cells[0]?.textContent?.trim() || '';
                        const pi = cells[1]?.textContent?.trim() || '';
                        const institution = cells[2]?.textContent?.trim() || '';
                        
                        if (title.length > 10) {
                            const linkElement = element.querySelector('a[href]');
                            const link = linkElement?.href || searchUrl;
                            
                            results.push({
                                title: title,
                                investigator: pi,
                                institution: institution,
                                program: params.program || 'NASA Research',
                                year: params.year || '2024',
                                center: extractCenter(institution) || 'NASA',
                                description: `Proyecto de investigación dirigido por ${pi} en ${institution}`,
                                keywords: params.keywords || 'space research',
                                link: link.startsWith('http') ? link : `https://taskbook.nasaprs.com${link}`,
                                source: 'NASA Taskbook'
                            });
                        }
                    }
                } catch (err) {
                    console.warn('Error procesando elemento:', err);
                }
            });
            
            if (results.length > 0) break; // Si encontramos resultados, no seguir buscando
        }
        
        // Si no hay resultados del scraping, devolver array vacío
        if (results.length === 0) {
            console.warn('⚠️ Scraping no devolvió resultados');
            return [];
        }
        
        console.log(`✅ Encontrados ${results.length} proyectos en NASA Taskbook`);
        return results;
        
    } catch (error) {
        console.error('❌ Error en scraping avanzado de Taskbook:', error);
        return [];
    }
}

/**
 * Extrae el centro NASA de una institución
 */
function extractCenter(institution) {
    if (!institution) return null;
    
    const centers = {
        'JSC': ['Johnson', 'JSC'],
        'ARC': ['Ames', 'ARC'], 
        'MSFC': ['Marshall', 'MSFC'],
        'KSC': ['Kennedy', 'KSC'],
        'GRC': ['Glenn', 'GRC'],
        'LaRC': ['Langley', 'LaRC'],
        'JPL': ['JPL', 'Jet Propulsion']
    };
    
    const institutionLower = institution.toLowerCase();
    
    for (const [center, keywords] of Object.entries(centers)) {
        if (keywords.some(keyword => institutionLower.includes(keyword.toLowerCase()))) {
            return `NASA ${center}`;
        }
    }
    
    return null;
}

/**
 * Busca en NASA Taskbook con múltiples parámetros (función actualizada)
 */
async function searchTaskbookAdvanced() {
    const keywords = document.getElementById('taskbookKeywords').value.trim();
    const investigator = document.getElementById('taskbookInvestigator').value.trim();
    const program = document.getElementById('taskbookProgram').value;
    const year = document.getElementById('taskbookYear').value;
    
    // Mostrar estado de carga
    const statusDiv = document.getElementById('taskbookStatus');
    const statusText = document.getElementById('taskbookStatusText');
    const progressBar = document.getElementById('taskbookProgress');
    
    statusDiv.style.display = 'block';
    statusText.textContent = `Buscando proyectos en NASA Taskbook...`;
    progressBar.style.width = '20%';
    
    try {
        // Construir query de búsqueda
        let searchQuery = '';
        if (keywords) searchQuery += keywords + ' ';
        if (investigator) searchQuery += investigator + ' ';
        if (program) searchQuery += program + ' ';
        if (year) searchQuery += year;
        
        if (!searchQuery.trim()) {
            searchQuery = 'space research'; // Búsqueda por defecto
        }
        
        progressBar.style.width = '50%';
        statusText.textContent = `Procesando resultados de "${searchQuery.trim()}"...`;
        
        // Intentar scraping del Taskbook oficial
        const results = await scrapeTaskbookAdvanced({
            keywords,
            investigator, 
            program,
            year,
            query: searchQuery.trim()
        });
        
        progressBar.style.width = '100%';
        statusText.textContent = `Encontrados ${results.length} proyectos`;
        
        // Mostrar resultados
        displayTaskbookResults(results);
        
        // Ocultar estado después de 2 segundos
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 2000);
        
        return results;
        
    } catch (error) {
        console.error('Error buscando en Taskbook:', error);
        statusText.textContent = 'Error en la búsqueda - sin resultados disponibles';
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#ff6b6b';
        
        // Mostrar mensaje de error
        displayTaskbookResults([]);
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
            progressBar.style.backgroundColor = '#4CAF50';
        }, 3000);
    }
}

/**
 * Limpia la búsqueda de Taskbook
 */
function clearTaskbookSearch() {
    document.getElementById('taskbookKeywords').value = '';
    document.getElementById('taskbookInvestigator').value = '';
    document.getElementById('taskbookProgram').value = '';
    document.getElementById('taskbookYear').value = '';
    document.getElementById('taskbookResults').innerHTML = '';
    document.getElementById('taskbookStatus').style.display = 'none';
}



/**
 * Muestra los resultados del Taskbook en formato organizado
 */
function displayTaskbookResults(results) {
    const container = document.getElementById('taskbookResults');
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <strong>📭 Sin resultados:</strong> No se encontraron proyectos con los criterios de búsqueda.
                <br><small>Intenta con términos más generales como "microgravity", "space biology" o "bone loss"</small>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="results-header">
            <h3>📊 Resultados NASA Taskbook</h3>
            <span class="results-count">${results.length} proyectos encontrados</span>
        </div>
        <div class="taskbook-grid">
    `;
    
    results.forEach((project, index) => {
        html += `
            <div class="taskbook-card" data-index="${index}">
                <div class="taskbook-header">
                    <h4 class="taskbook-title">${project.title || 'Proyecto sin título'}</h4>
                    <div class="taskbook-badges">
                        ${project.program ? `<span class="badge badge-primary">${project.program}</span>` : ''}
                        ${project.year ? `<span class="badge badge-info">FY${project.year}</span>` : ''}
                        ${project.center ? `<span class="badge badge-secondary">${project.center}</span>` : ''}
                    </div>
                </div>
                <div class="taskbook-content">
                    ${project.investigator ? `<p><strong>👨‍🔬 PI:</strong> ${project.investigator}</p>` : ''}
                    ${project.coInvestigator ? `<p><strong>🤝 Co-I:</strong> ${project.coInvestigator}</p>` : ''}
                    ${project.institution ? `<p><strong>🏛️ Institución:</strong> ${project.institution}</p>` : ''}
                    ${project.description ? `<p class="taskbook-description">${project.description}</p>` : ''}
                    ${project.keywords ? `<p><strong>🏷️ Keywords:</strong> ${project.keywords}</p>` : ''}
                </div>
                <div class="taskbook-footer">
                    ${project.link ? `
                        <a href="${project.link}" target="_blank" class="btn btn-outline">
                            🔗 Ver Proyecto Completo
                        </a>
                    ` : ''}
                    <span class="taskbook-source">📋 NASA Taskbook</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

