// Theme Manager para NinjPro
// ========================

// Función principal para cambiar temas
function setTheme(theme) {
  console.log(`🎨 Cambiando al tema: ${theme}`);
  
  // Normalizar el nombre del tema (asegurar que tenga el prefijo 'theme-')
  const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
  
  // Cambiar clase del body
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-rosa', 'theme-oscuro', 'theme-neon');
  document.body.classList.add(normalizedTheme);
  localStorage.setItem('theme', normalizedTheme);

  // Obtener todos los elementos de fondo
  const backgrounds = {
    'theme-light': document.getElementById('bg-wrap'),
    'theme-dark': document.getElementById('bg-wrap-dark'),
    'theme-rosa': document.getElementById('bg-wrap-rosa'),
    'theme-oscuro': document.getElementById('bg-wrap-oscuro')
  };

  // Ocultar todos los fondos primero
  Object.values(backgrounds).forEach(bg => {
    if (bg) {
      bg.style.opacity = '0';
      bg.style.transition = 'opacity 0.6s ease';
    }
  });

  // Mostrar el fondo del tema activo con un pequeño retraso
  setTimeout(() => {
    const activeBg = backgrounds[normalizedTheme];
    if (activeBg) {
      activeBg.style.opacity = '1';
      console.log(`✅ Fondo activado para ${normalizedTheme}`);
    } else {
      console.warn(`⚠️ No se encontró el fondo para ${normalizedTheme}`);
      console.log('🔍 Fondos disponibles:', Object.keys(backgrounds));
      console.log('🔍 Elementos encontrados:', Object.values(backgrounds).map(bg => bg ? bg.id : 'null'));
    }
  }, 50);

  // Actualizar botones de tema si existen
  updateActiveThemeButtons(normalizedTheme);
}

// Función para actualizar el estado activo de los botones de tema
function updateActiveThemeButtons(theme) {
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// Función para inicializar el sistema de temas
function initializeThemeSystem() {
  // Cargar tema guardado o usar tema por defecto
  const savedTheme = localStorage.getItem('theme') || 'theme-dark';
  setTheme(savedTheme);
  
  // Configurar event listeners para botones de tema
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.dataset.theme;
      setTheme(selectedTheme);
    });
  });
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeThemeSystem();
  console.log('🎨 Theme Manager inicializado');
});

// Exportar funciones para uso global
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;
window.isThemeActive = isThemeActive;
window.toggleDarkMode = toggleDarkMode;
window.applySystemTheme = applySystemTheme;

console.log('📦 Theme Manager cargado'); 