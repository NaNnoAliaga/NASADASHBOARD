# 🚀 Instrucciones de Despliegue en GitHub Pages

## 📋 Pasos para Desplegar

### 1. **Crear Repositorio en GitHub**

```bash
# En tu terminal, dentro del directorio nasa-dashboard
git init
git add .
git commit -m "🚀 Initial commit: NASA Biosciences AI Dashboard"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/nasa-dashboard.git
git branch -M main
git push -u origin main
```

### 2. **Configurar GitHub Pages**

1. **Ve a tu repositorio en GitHub**
2. **Settings → Pages** (en la barra lateral izquierda)
3. **Source**: Selecciona "Deploy from a branch"
4. **Branch**: Selecciona "main"
5. **Folder**: Selecciona "/ (root)"
6. **Save**

### 3. **URL de tu Dashboard**

Una vez configurado, tu dashboard estará disponible en:
```
https://tu-usuario.github.io/nasa-dashboard
```

## ⚡ Despliegue Automático

El proyecto ya incluye **GitHub Actions** que despliega automáticamente cada vez que haces push a la rama `main`.

### Ver el progreso:
1. Ve a tu repositorio
2. Click en la pestaña **"Actions"**
3. Verás el workflow "Deploy NASA Dashboard to GitHub Pages"

## 🔧 Troubleshooting

### ❌ **Si el sitio no carga:**
- Espera 5-10 minutos después de la configuración inicial
- Verifica que el branch sea "main" y folder sea "/ (root)"
- Revisa la pestaña Actions para ver si hay errores

### ❌ **Si hay errores en GitHub Actions:**
- Verifica que los permisos de Pages estén habilitados en Settings → Pages
- Asegúrate de que el repositorio sea público (o tienes GitHub Pro para privados)

### ❌ **Si falta el chatbot:**
- Verifica tu código de Tidio en `index.html`
- Asegúrate de que tu cuenta Tidio esté activa

## 🎯 Personalización de URL

Para usar un dominio personalizado:
1. **Settings → Pages → Custom domain**
2. **Agrega tu dominio** (ej: `nasa-dashboard.tudominio.com`)
3. **Crea un archivo CNAME** en el directorio raíz con tu dominio

## 📊 Monitoreo

Una vez desplegado, puedes:
- **Ver estadísticas** en Settings → Insights → Traffic
- **Monitorear errores** en la consola del navegador
- **Revisar logs** en Actions para problemas de despliegue

## 🚀 ¡Listo!

Tu NASA Dashboard ya está live en Internet! 🎉

Comparte la URL con tu equipo y comunidad de investigación espacial.

---

**¿Problemas?** Abre un issue en el repositorio con detalles del error.