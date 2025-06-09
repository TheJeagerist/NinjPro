// Script de debugging para fondos animados
console.log('🎨 Iniciando sistema de fondos animados...');

// Verificar que los elementos existen
function checkBackgroundElements() {
    const backgrounds = [
        'bg-wrap',
        'bg-wrap-dark', 
        'bg-wrap-rosa',
        'bg-wrap-oscuro'
    ];
    
    backgrounds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${id} encontrado`);
        } else {
            console.error(`❌ ${id} NO encontrado`);
        }
    });
}

// Función para forzar la activación del fondo correcto
function forceActivateBackground(theme) {
    console.log(`🔧 forceActivateBackground llamado con tema: "${theme}"`);
    
    // Normalizar el tema
    const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
    console.log(`🔧 Tema normalizado: "${normalizedTheme}"`);
    
    // Ocultar todos los fondos
    const allBackgrounds = ['bg-wrap', 'bg-wrap-dark', 'bg-wrap-rosa', 'bg-wrap-oscuro'];
    allBackgrounds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.opacity = '0';
            console.log(`🔧 Ocultando fondo: ${id}`);
        }
    });
    
    // Activar el fondo correcto
    const mapping = {
        'theme-light': 'bg-wrap',
        'theme-dark': 'bg-wrap-dark',
        'theme-rosa': 'bg-wrap-rosa',
        'theme-oscuro': 'bg-wrap-oscuro'
    };
    
    const activeBackgroundId = mapping[normalizedTheme];
    console.log(`🔧 ID de fondo a activar: ${activeBackgroundId}`);
    
    if (activeBackgroundId) {
        const activeElement = document.getElementById(activeBackgroundId);
        if (activeElement) {
            activeElement.style.opacity = '1';
            console.log(`🎯 Fondo activado: ${activeBackgroundId} para tema ${normalizedTheme}`);
        } else {
            console.error(`❌ No se encontró el elemento con ID: ${activeBackgroundId}`);
        }
    } else {
        console.error(`❌ No hay mapeo para el tema: ${normalizedTheme}`);
        console.log(`🔧 Mapeos disponibles:`, Object.keys(mapping));
    }
}

// Verificar y reparar el sistema al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Verificando fondos animados...');
    
    // Verificar elementos
    checkBackgroundElements();
    
    // Obtener tema actual
    const currentTheme = localStorage.getItem('theme') || 'theme-dark';
    console.log(`🎨 Tema guardado en localStorage: ${currentTheme}`);
    
    // Verificar clase del body
    const bodyClasses = Array.from(document.body.classList);
    console.log(`🎨 Clases del body: ${bodyClasses.join(', ')}`);
    
    // Verificar qué fondos están visibles actualmente
    const allBackgrounds = ['bg-wrap', 'bg-wrap-dark', 'bg-wrap-rosa', 'bg-wrap-oscuro'];
    allBackgrounds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const opacity = window.getComputedStyle(element).opacity;
            console.log(`🎨 Fondo ${id}: opacity = ${opacity}`);
        }
    });
    
    // Forzar activación del fondo correcto
    setTimeout(() => {
        console.log('🔧 Ejecutando forceActivateBackground...');
        forceActivateBackground(currentTheme);
    }, 100);
});

// Función de test rápido
function quickTest() {
    console.log('🧪 Ejecutando test rápido de fondos...');
    
    // Test de cada tema
    const themes = ['theme-light', 'theme-dark', 'theme-rosa', 'theme-oscuro'];
    
    themes.forEach((theme, index) => {
        setTimeout(() => {
            console.log(`🧪 Probando ${theme}...`);
            if (window.setTheme) {
                window.setTheme(theme);
            } else {
                forceActivateBackground(theme);
            }
        }, index * 2000);
    });
}

// Exponer funciones globalmente para debugging
window.debugBackgrounds = {
    check: checkBackgroundElements,
    forceActivate: forceActivateBackground,
    quickTest: quickTest,
    
    // Función para verificar estado actual
    status: function() {
        console.log('📊 Estado actual de fondos:');
        checkBackgroundElements();
        
        const currentTheme = localStorage.getItem('theme');
        console.log(`🎨 Tema en localStorage: ${currentTheme}`);
        
        const bodyClasses = Array.from(document.body.classList);
        console.log(`🎨 Clases del body: ${bodyClasses.join(', ')}`);
        
        const allBackgrounds = ['bg-wrap', 'bg-wrap-dark', 'bg-wrap-rosa', 'bg-wrap-oscuro'];
        allBackgrounds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const opacity = window.getComputedStyle(element).opacity;
                console.log(`🎨 ${id}: opacity = ${opacity}`);
            }
        });
    }
};

console.log('✅ Sistema de debugging de fondos cargado.');
console.log('🔧 Comandos disponibles:');
console.log('   window.debugBackgrounds.check() - Verificar elementos');
console.log('   window.debugBackgrounds.status() - Estado actual');
console.log('   window.debugBackgrounds.forceActivate("theme-light") - Forzar tema');
console.log('   window.debugBackgrounds.quickTest() - Test automático de todos los temas'); 