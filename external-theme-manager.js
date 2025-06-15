// Theme Manager Simplificado para Aplicaciones Externas
// =====================================================

// Función principal para cambiar temas (versión simplificada)
function setTheme(theme) {
  console.log(`🎨 Cambiando al tema: ${theme}`);
  
  // Normalizar el nombre del tema (asegurar que tenga el prefijo 'theme-')
  const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
  
  // Cambiar clase del body
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-rosa', 'theme-neon', 'theme-custom');
  document.body.classList.add(normalizedTheme);
  localStorage.setItem('theme', normalizedTheme);

  console.log(`✅ Tema aplicado: ${normalizedTheme}`);

  // Notificar al sistema de fondos animados sobre el cambio (si existe)
  if (window.animatedBackgrounds && window.animatedBackgrounds.switchTheme) {
    window.animatedBackgrounds.switchTheme(normalizedTheme);
  }

  // Actualizar botones de tema si existen
  updateActiveThemeButtons(normalizedTheme);
}

// Función para actualizar el estado activo de los botones de tema
function updateActiveThemeButtons(theme) {
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    if (btn.dataset && btn.dataset.theme) {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    }
  });
}

// Función para inicializar el sistema de temas (versión simplificada)
function initializeThemeSystem() {
  // Cargar tema guardado o usar tema por defecto
  const savedTheme = localStorage.getItem('theme') || 'theme-dark';
  setTheme(savedTheme);
  
  // Configurar event listeners para botones de tema (si existen)
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.dataset.theme;
      if (selectedTheme) {
        setTheme(selectedTheme);
      }
    });
  });
  
  console.log('🎨 Theme Manager Externo inicializado');
}

// Función para obtener el tema actual
function getCurrentTheme() {
  return localStorage.getItem('theme') || 'theme-dark';
}

// Función para verificar si un tema específico está activo
function isThemeActive(theme) {
  const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
  return getCurrentTheme() === normalizedTheme;
}

// Función para cambiar entre temas claro/oscuro
function toggleDarkMode() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'theme-light' ? 'theme-dark' : 'theme-light';
  setTheme(newTheme);
}

// Función para aplicar tema basado en preferencias del sistema
function applySystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('theme-dark');
  } else {
    setTheme('theme-light');
  }
}

// Event listener para cambios en las preferencias del sistema
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applySystemTheme();
    }
  });
}

// Listener para cambios de tema desde otras ventanas/pestañas
window.addEventListener('storage', function(e) {
  if (e.key === 'theme' && e.newValue) {
    // Solo cambiar la clase del body, sin buscar elementos de fondo
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-rosa', 'theme-neon', 'theme-custom');
    document.body.classList.add(e.newValue);
    
    // Notificar al sistema de fondos animados si existe
    if (window.animatedBackgrounds && window.animatedBackgrounds.switchTheme) {
      window.animatedBackgrounds.switchTheme(e.newValue);
    }
    
    console.log(`🔄 Tema sincronizado desde otra ventana: ${e.newValue}`);
  }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeThemeSystem();
});

// Exportar funciones para uso global
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;
window.isThemeActive = isThemeActive;
window.toggleDarkMode = toggleDarkMode;
window.applySystemTheme = applySystemTheme;

console.log('📦 Theme Manager Externo cargado'); 