# Sistema de Barra de Carga Global

## Descripción
Sistema implementado para mostrar una barra de carga elegante cuando se navega a aplicaciones externas desde el launcher principal. Mejora significativamente la experiencia de usuario al proporcionar feedback visual durante las transiciones.

## Archivos Implementados

### 1. Estilos CSS (`dashboard-styles.css`)
- **Overlay de carga**: Fondo semitransparente con blur
- **Contenedor**: Diseño moderno con glassmorphism
- **Spinner**: Animación de carga rotativa
- **Barra de progreso**: Con efecto shimmer animado
- **Temas**: Adaptación automática a todos los temas del sistema
- **Responsive**: Optimizado para móviles y tablets

### 2. HTML (`index.html`)
```html
<div id="loading-overlay" class="loading-overlay">
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <h3 class="loading-text" id="loading-text">Cargando aplicación...</h3>
    <p class="loading-subtext" id="loading-subtext">Por favor espera un momento</p>
    <div class="loading-progress">
      <div class="loading-progress-bar" id="loading-progress-bar"></div>
    </div>
  </div>
</div>
```

### 3. JavaScript Principal (`dashboard.js`)
Funciones implementadas:
- `showLoadingBar(text, subtext)`: Muestra la barra de carga
- `hideLoadingBar()`: Oculta la barra de carga
- `updateLoadingProgress(percentage)`: Actualiza el progreso
- `updateLoadingText(text, subtext)`: Cambia los textos
- `simulateLoadingProgress()`: Simula progreso realista

### 4. Script para Páginas Externas (`loading-handler.js`)
- Auto-detección de carga completa
- Comunicación con ventana principal
- Progreso automático durante la carga
- Fallback con localStorage para comunicación

## Aplicaciones Configuradas

Las siguientes aplicaciones ya tienen el sistema implementado:
- ✅ PAES (`paes.html`)
- ✅ SIMCE (`simce.html`)
- ✅ Creador de Rúbricas (`creador-rubricas.html`)
- ✅ Evaluador de Rúbricas (`evalua-rubricas.html`)
- ✅ Contador de Palabras (`word-counter.html`)
- ✅ Grupos Aleatorios (`grupos-aleatorios.html`)

## Cómo Funciona

### 1. Navegación desde Launcher
```javascript
// En dashboard.js - función navigateToTool()
case 'paes':
    showLoadingBar('Cargando PAES...', 'Preparando evaluación PAES');
    setTimeout(() => {
        window.location.href = 'paes.html';
    }, 1500);
    break;
```

### 2. Carga de Página Externa
```javascript
// En loading-handler.js - auto-ejecutado
document.addEventListener('DOMContentLoaded', function() {
    updateExternalLoadingProgress(30, 'Cargando recursos...', 'Inicializando componentes');
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            hideExternalLoadingBar();
        }, 500);
    });
});
```

### 3. Comunicación Entre Ventanas
- **Método principal**: `window.opener.dashboardFunctions`
- **Fallback**: localStorage para comunicación asíncrona
- **Auto-detección**: Listeners en ambas ventanas

## Personalización

### Textos Personalizados
```javascript
showLoadingBar(
    'Cargando Mi Aplicación...', 
    'Preparando datos específicos'
);
```

### Progreso Manual
```javascript
// Desde página externa
window.loadingHandler.setProgress(50, 'Cargando datos...', 'Procesando información');
window.loadingHandler.complete('Aplicación lista', 'Todo configurado');
```

### Nuevas Aplicaciones
Para agregar el sistema a una nueva aplicación:

1. **Agregar script en HTML**:
```html
<script src="loading-handler.js"></script>
```

2. **Configurar navegación en dashboard.js**:
```javascript
case 'mi-nueva-app':
    showLoadingBar('Cargando Mi App...', 'Preparando interfaz');
    setTimeout(() => {
        window.location.href = 'mi-nueva-app.html';
    }, 1500);
    break;
```

## Características Técnicas

### Animaciones
- **Spinner**: Rotación suave 1s linear infinite
- **Shimmer**: Efecto de brillo en barra de progreso
- **Transiciones**: Fade in/out suaves (0.3s)

### Temas Soportados
- 🌙 Dark Theme
- ☀️ Light Theme  
- 🌸 Rosa Theme
- 🎇 Neon Theme
- 🎨 Custom Theme

### Responsive Design
- **Desktop**: Contenedor 400px máximo
- **Tablet**: Ajustes de padding y tamaños
- **Mobile**: Optimización para pantallas pequeñas

### Rendimiento
- **Z-index**: 99999 para estar sobre todo
- **Backdrop-filter**: Blur optimizado
- **GPU**: Animaciones aceleradas por hardware
- **Memory**: Limpieza automática de listeners

## Debugging

### Console Logs
```javascript
// Mostrar barra
🔄 Barra de carga mostrada: Cargando PAES...

// Página externa
🔄 Página externa cargando...
✅ Página externa completamente cargada
✅ Barra de carga ocultada desde página externa

// Ocultar barra
✅ Barra de carga ocultada
```

### Verificación Manual
```javascript
// En consola del navegador
window.dashboardFunctions.showLoadingBar('Test', 'Probando sistema');
window.dashboardFunctions.hideLoadingBar();
```

## Beneficios

1. **UX Mejorada**: Feedback visual durante navegación
2. **Profesional**: Apariencia moderna y pulida
3. **Consistente**: Mismo estilo en todas las aplicaciones
4. **Responsive**: Funciona en todos los dispositivos
5. **Temático**: Se adapta automáticamente a los temas
6. **Performante**: Optimizado para rendimiento
7. **Extensible**: Fácil de agregar a nuevas aplicaciones

## Solución de Problemas

### Error: "No se encontró el fondo para theme-light"
**Problema**: Las aplicaciones externas mostraban errores de `theme-manager.js` buscando elementos de fondo que no existen.

**Solución**: Se creó `external-theme-manager.js` - una versión simplificada que no busca elementos de fondo específicos.

**Aplicaciones que usan `external-theme-manager.js`**:
- ✅ PAES
- ✅ SIMCE
- ✅ Creador de Rúbricas
- ✅ Evaluador de Rúbricas
- ✅ Contador de Palabras
- ✅ Grupos Aleatorios
- ✅ Preguntas Rápidas

**Aplicaciones que siguen usando `theme-manager.js`**:
- ✅ Matemáticas Rápidas (integrado en index.html)
- ✅ Todas las aplicaciones internas del dashboard

## Mantenimiento

### Agregar Nueva Aplicación Externa
1. Incluir `loading-handler.js` en el HTML
2. Incluir `external-theme-manager.js` en lugar de `theme-manager.js`
3. Configurar caso en `navigateToTool()`
4. Personalizar textos según la aplicación

### Agregar Nueva Aplicación Interna
1. Usar `theme-manager.js` (versión completa)
2. Agregar panel al HTML principal
3. Configurar caso en `navigateToTool()`

### Modificar Estilos
- Editar sección "BARRA DE CARGA GLOBAL" en `dashboard-styles.css`
- Mantener compatibilidad con todos los temas
- Probar en diferentes resoluciones

### Debugging
- Verificar console.log en ambas ventanas
- Comprobar comunicación entre ventanas
- Validar fallback con localStorage
- Verificar que se use el theme manager correcto 