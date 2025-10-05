# 🚀 NASA Biosciences AI Dashboard

## 📖 Descripción

El **NASA Biosciences AI Dashboard** es una plataforma web integrada para el análisis de investigación espacial que permite:

- 📊 **Análisis de publicaciones científicas** relacionadas con ciencias espaciales
- 🔍 **Búsqueda en tiempo real** en bases de datos oficiales de NASA (OSDR, NSLSL, Taskbook)
- 📈 **Visualización de tendencias** de investigación en biomedicina espacial
- 🎯 **Extracción automática de keywords** y análisis estadísticos
- 📋 **Gestión de proyectos** de investigación espacial

## 🌐 Demo en Vivo

**🔗 [Ver Dashboard en Vivo](https://tu-usuario.github.io/nasa-dashboard)**

## ✨ Características Principales

### 📁 **Gestión de Datos**
- Carga de archivos CSV con publicaciones científicas
- Procesamiento automático de metadatos
- Análisis de keywords y estadísticas en tiempo real

### 🔍 **Búsqueda Integrada**
- **OSDR** (Open Science Data Repository) - Datos experimentales espaciales
- **NSLSL** (NASA Space Life Sciences Laboratory) - Experimentos de laboratorio
- **NASA Taskbook** - Base de datos oficial de proyectos de investigación

### 📊 **Análisis Avanzado**
- Extracción automática de palabras clave
- Generación de nubes de palabras
- Estadísticas de tendencias de investigación
- Métricas de publicaciones por año

### 💬 **Asistente IA**
- Chatbot especializado en ciencias espaciales (Tidio + Lyro AI)
- Respuestas contextuales sobre el dashboard
- Guía paso a paso para usuarios

## 🚀 Despliegue en GitHub Pages

### Opción 1: Despliegue Automático (Recomendado)

1. **Fork o clona este repositorio**
2. **Ve a Settings → Pages**
3. **Selecciona source: "Deploy from a branch"**
4. **Elige branch: "main" y folder: "/ (root)"**
5. **¡Listo! Tu sitio estará disponible en pocos minutos**

### Opción 2: Despliegue con GitHub Actions

Si prefieres usar GitHub Actions para despliegue automático, ya está configurado el workflow en `.github/workflows/deploy.yml`.

## 📂 Estructura del Proyecto

```
nasa-dashboard/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica JavaScript
├── scraping-config.js      # Configuración de scraping
├── README.md               # Este archivo
├── .github/
│   └── workflows/
│       └── deploy.yml      # Workflow de GitHub Actions
└── docs/
    ├── KNOWLEDGE-BASE-NASA.md
    ├── GUIA-PERSONALIZACION-TIDIO.md
    └── CONFIGURACION-TIDIO-PASO-A-PASO.md
```

## 🔧 Configuración Local

### Prerequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor HTTP local (opcional, para desarrollo)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/nasa-dashboard.git
cd nasa-dashboard

# Opción 1: Abrir directamente
open index.html

# Opción 2: Servidor local con Python
python3 -m http.server 8000
# Ir a http://localhost:8000

# Opción 3: Servidor local con Node.js
npx http-server
```

## 📖 Guía de Uso

### 1. **Cargar Datos**
- Ve a la pestaña "📁 Datos"
- Arrastra tu archivo CSV al área de carga
- Espera el procesamiento automático

### 2. **Explorar Publicaciones**
- Pestaña "📚 Publicaciones" para ver todos los datos cargados
- Usa el buscador para filtrar por keywords
- Las búsquedas también consultan APIs de NASA en tiempo real

### 3. **Buscar en NASA Taskbook**
- Pestaña "📋 Taskbook" para proyectos oficiales de NASA
- Filtra por programa, investigador, año fiscal
- Enlaces directos a proyectos completos

### 4. **Análisis de Keywords**
- Pestaña "📊 Análisis" para ver tendencias
- Nube de palabras interactiva
- Estadísticas de frecuencia

## 🔍 APIs Integradas

- **NASA Taskbook**: `https://taskbook.nasaprs.com/tbp/index.cfm`
- **OSDR**: `https://www.nasa.gov/osdr/`
- **NSLSL**: `https://public.ksc.nasa.gov/nslsl/`

## 🎯 Formato de Datos CSV

El dashboard espera archivos CSV con las siguientes columnas:

```csv
Title,Authors,Year,Keywords,Link
"Microgravity Effects on Plant Growth","Smith, J.; Doe, A.","2024","microgravity, plants, ISS","https://..."
```

## 🤖 Configuración del Chatbot

El dashboard incluye un chatbot inteligente configurado con conocimiento específico sobre:
- Funcionamiento del dashboard
- Información sobre OSDR, NSLSL, NASA Taskbook
- Guías de uso paso a paso
- Resolución de problemas comunes

Ver `docs/CONFIGURACION-TIDIO-PASO-A-PASO.md` para configuración avanzada.

## 🔒 Consideraciones de Seguridad

- **Solo frontend**: No hay backend, todos los datos se procesan localmente
- **Privacy first**: Los archivos CSV no se envían a servidores externos
- **CORS proxy**: Para evitar restricciones de navegador en APIs públicas

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**: NASA Taskbook, OSDR, NSLSL
- **Chatbot**: Tidio + Lyro AI
- **Despliegue**: GitHub Pages
- **Proxy CORS**: APIs públicas para evitar restricciones

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 📖 **Documentación**: Ver archivos en `docs/`
- 💬 **Chatbot**: Usar el widget integrado en el dashboard
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/nasa-dashboard/issues)

## 🎯 Roadmap

- [ ] Integración con más APIs de NASA
- [ ] Exportación de análisis a PDF
- [ ] Modo offline con Service Workers
- [ ] Dashboard administrativo
- [ ] Autenticación opcional

---

**Desarrollado con ❤️ para la comunidad de investigación espacial**

🚀 **[Ver Demo](https://tu-usuario.github.io/nasa-dashboard)** | 📚 **[Documentación](./docs/)** | 🐛 **[Issues](https://github.com/tu-usuario/nasa-dashboard/issues)**