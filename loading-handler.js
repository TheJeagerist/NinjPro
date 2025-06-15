// ================================
// MANEJADOR DE BARRA DE CARGA PARA PÁGINAS EXTERNAS
// ================================

/**
 * Script que debe incluirse en todas las páginas externas
 * para ocultar automáticamente la barra de carga cuando la página termine de cargar
 */

// Función para ocultar la barra de carga desde páginas externas
function hideExternalLoadingBar() {
    try {
        // Intentar acceder a la ventana padre (index.html)
        if (window.opener && window.opener.dashboardFunctions) {
            window.opener.dashboardFunctions.hideLoadingBar();
            console.log('✅ Barra de carga ocultada desde página externa');
        } else if (parent && parent.dashboardFunctions) {
            parent.dashboardFunctions.hideLoadingBar();
            console.log('✅ Barra de carga ocultada desde iframe');
        } else {
            // Si no hay ventana padre, buscar en el localStorage una señal
            localStorage.setItem('hideLoadingBar', Date.now().toString());
            console.log('📡 Señal enviada para ocultar barra de carga');
        }
    } catch (error) {
        console.warn('No se pudo ocultar la barra de carga:', error);
    }
}

// Función para mostrar progreso de carga específico
function updateExternalLoadingProgress(percentage, text, subtext) {
    try {
        if (window.opener && window.opener.dashboardFunctions) {
            if (percentage !== undefined) {
                window.opener.dashboardFunctions.updateLoadingProgress(percentage);
            }
            if (text || subtext) {
                window.opener.dashboardFunctions.updateLoadingText(text, subtext);
            }
        } else if (parent && parent.dashboardFunctions) {
            if (percentage !== undefined) {
                parent.dashboardFunctions.updateLoadingProgress(percentage);
            }
            if (text || subtext) {
                parent.dashboardFunctions.updateLoadingText(text, subtext);
            }
        }
    } catch (error) {
        console.warn('No se pudo actualizar el progreso de carga:', error);
    }
}

// Auto-ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Página externa cargando...');
    
    // Simular progreso de carga inicial
    updateExternalLoadingProgress(30, 'Cargando recursos...', 'Inicializando componentes');
    
    // Cuando todos los recursos estén cargados
    window.addEventListener('load', function() {
        console.log('✅ Página externa completamente cargada');
        
        // Pequeño delay para que el usuario vea que la carga terminó
        setTimeout(() => {
            hideExternalLoadingBar();
        }, 500);
    });
    
    // Progreso intermedio después de que el DOM esté listo
    setTimeout(() => {
        updateExternalLoadingProgress(70, 'Configurando interfaz...', 'Casi listo');
    }, 200);
});

// Listener para señales desde localStorage (fallback)
window.addEventListener('storage', function(e) {
    if (e.key === 'showLoadingBar') {
        // Otra página está pidiendo mostrar la barra de carga
        console.log('📡 Señal recibida para mostrar barra de carga');
    }
});

// Función de utilidad para páginas que necesiten control manual
window.loadingHandler = {
    hide: hideExternalLoadingBar,
    updateProgress: updateExternalLoadingProgress,
    
    // Función para mostrar progreso específico de la aplicación
    setProgress: function(percentage, text, subtext) {
        updateExternalLoadingProgress(percentage, text, subtext);
    },
    
    // Función para completar la carga
    complete: function(text = 'Carga completada', subtext = 'Aplicación lista') {
        updateExternalLoadingProgress(100, text, subtext);
        setTimeout(hideExternalLoadingBar, 300);
    }
};

console.log('📋 Loading Handler inicializado para página externa'); 