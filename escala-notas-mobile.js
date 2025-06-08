/* ===================================
   ESCALA DE NOTAS - MEJORAS MÓVILES
   JavaScript específico para optimización móvil
   =================================== */

// Variables globales para móvil
let isMobile = false;
let isTablet = false;
let touchStartY = 0;
let touchEndY = 0;

// Detectar tipo de dispositivo
function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  isMobile = window.innerWidth <= 768 && isTouchDevice;
  isTablet = window.innerWidth > 768 && window.innerWidth <= 1024 && isTouchDevice;
  
  // Agregar clases al body para CSS específico
  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-tablet', isTablet);
  document.body.classList.toggle('is-touch', isTouchDevice);
}

// Mejorar dropdown PAES para móviles
function enhancePaesDropdownMobile() {
  const dropdown = document.querySelector('.paes-dropdown');
  const button = document.querySelector('.tabla-mode-btn.has-dropdown');
  
  if (!dropdown || !button) {
    console.log('❌ Dropdown o botón PAES no encontrado');
    return;
  }

  console.log('✅ Inicializando mejoras móviles para PAES');

  // Observer para detectar cuando el dropdown se abre/cierra
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('paes-dropdown')) {
          if (isMobile) {
                         if (target.classList.contains('show')) {
               console.log('📱 Dropdown PAES abierto en móvil');
               // Overlay removido - no es necesario
             } else {
               console.log('📱 Dropdown PAES cerrado en móvil');
               // Overlay removido - no es necesario
             }
          }
        }
      }
    });
  });

  // Observar cambios en el dropdown
  observer.observe(dropdown, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Función de overlay deshabilitada - no es necesaria
  function addMobileOverlay() {
    // Overlay removido - no es necesario en móvil
    console.log('📱 Overlay deshabilitado');
  }

  // Esta función ya no es necesaria, se maneja desde main.js

  function closePaesDropdown() {
    dropdown.classList.remove('show');
    button.classList.remove('active');
    removeMobileOverlay();
  }
  
  function removeMobileOverlay() {
    // Función de overlay deshabilitada - no es necesaria
    console.log('📱 Overlay removal deshabilitado');
  }

  // Solo agregar mejoras móviles específicas para dispositivos táctiles
  if (isMobile) {
    console.log('📱 Agregando mejoras táctiles para PAES');
    
    // Agregar soporte para gestos de swipe para cerrar
    dropdown.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    
    dropdown.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      
      // Si swipe hacia arriba > 50px, cerrar dropdown
      if (swipeDistance > 50) {
        closePaesDropdown();
      }
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('show')) {
        closePaesDropdown();
      }
    });
  }
}

// Mejorar inputs para dispositivos táctiles
function enhanceInputsForTouch() {
  const inputs = document.querySelectorAll('#escala-panel input[type="number"]');
  
  inputs.forEach(input => {
    // Agregar feedback visual mejorado
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');
      
      // En móvil, hacer scroll suave al input
      if (isMobile) {
        setTimeout(() => {
          this.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300); // Esperar a que aparezca el teclado
      }
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focused');
    });
    
    // Mejorar validación en tiempo real
    input.addEventListener('input', function() {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = setTimeout(() => {
        validateInputValue(this);
      }, 500);
    });
  });
}

// Validación mejorada de inputs
function validateInputValue(input) {
  const value = parseFloat(input.value);
  const id = input.id;
  
  if (isNaN(value) && input.value !== '') {
    showInputError(input, 'Valor inválido');
    return;
  }
  
  let isValid = true;
  let errorMessage = '';
  
  switch (id) {
    case 'puntajeMax':
      if (value < 1) {
        isValid = false;
        errorMessage = 'Mínimo: 1';
      }
      break;
    case 'exigencia':
      if (value < 1 || value > 100) {
        isValid = false;
        errorMessage = 'Rango: 1-100';
      }
      break;
    case 'notaMin':
    case 'notaMax':
    case 'notaAprob':
      const adjustedValue = value >= 10 ? value / 10 : value;
      if (adjustedValue < 1 || adjustedValue > 7) {
        isValid = false;
        errorMessage = 'Rango: 1.0-7.0';
      }
      break;
  }
  
  if (isValid) {
    clearInputError(input);
  } else {
    showInputError(input, errorMessage);
  }
}

// Mostrar error en input
function showInputError(input, message) {
  clearInputError(input);
  
  const errorElement = document.createElement('div');
  errorElement.className = 'input-error-message';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ff4757;
    color: white;
    padding: 4px 8px;
    border-radius: 0 0 4px 4px;
    font-size: 0.75rem;
    z-index: 10;
    animation: slideDown 0.2s ease;
  `;
  
  input.parentElement.style.position = 'relative';
  input.parentElement.appendChild(errorElement);
  input.classList.add('input-error');
}

// Limpiar error en input
function clearInputError(input) {
  const errorElement = input.parentElement.querySelector('.input-error-message');
  if (errorElement) {
    errorElement.remove();
  }
  input.classList.remove('input-error');
}

// Mejorar botones para touch
function enhanceButtonsForTouch() {
  const buttons = document.querySelectorAll('#escala-panel button');
  
  buttons.forEach(button => {
    // Agregar efecto ripple en touch
    button.addEventListener('touchstart', function(e) {
      if (!isMobile) return;
      
      const ripple = document.createElement('div');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches[0].clientX - rect.left - size / 2;
      const y = e.touches[0].clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
    
    // Prevenir doble tap zoom en botones
    button.addEventListener('touchend', function(e) {
      e.preventDefault();
    });
  });
}

// Optimizar tabla para móvil
function optimizeTableForMobile() {
  const tablaMulti = document.querySelector('.tabla-multi');
  if (!tablaMulti) return;
  
  // Agregar indicador de scroll horizontal en móvil
  if (isMobile) {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'mobile-scroll-indicator';
    scrollIndicator.innerHTML = '← Desliza para ver más →';
    scrollIndicator.style.cssText = `
      text-align: center;
      padding: 8px;
      background: var(--primary-color, #4facfe);
      color: white;
      font-size: 0.8rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      opacity: 0.8;
    `;
    
    tablaMulti.insertBefore(scrollIndicator, tablaMulti.firstChild);
    
    // Ocultar indicador después de primer scroll
    let hasScrolled = false;
    const tablaInner = document.querySelector('.tabla-multi-inner');
    if (tablaInner) {
      tablaInner.addEventListener('scroll', function() {
        if (!hasScrolled) {
          hasScrolled = true;
          scrollIndicator.style.opacity = '0';
          setTimeout(() => {
            if (scrollIndicator.parentNode) {
              scrollIndicator.parentNode.removeChild(scrollIndicator);
            }
          }, 300);
        }
      });
    }
  }
}

// Mejorar conversor para móvil
function enhanceConversorForMobile() {
  const conversores = document.querySelectorAll('.conversor-container');
  
  conversores.forEach(conversor => {
    const inputs = conversor.querySelectorAll('input');
    
    inputs.forEach(input => {
      // Agregar teclado numérico en móvil
      if (isMobile) {
        input.setAttribute('inputmode', 'decimal');
        input.setAttribute('pattern', '[0-9]*');
      }
      
      // Mejorar UX de focus
      input.addEventListener('focus', function() {
        conversor.classList.add('conversor-focused');
      });
      
      input.addEventListener('blur', function() {
        conversor.classList.remove('conversor-focused');
      });
    });
  });
}

// Gestión de orientación en móvil
function handleOrientationChange() {
  if (!isMobile) return;
  
  // Detectar cambio de orientación
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      // Recalcular layout después del cambio
      detectDevice();
      
      // Regenerar tabla si es necesario
      if (typeof generarTablaEscala === 'function') {
        generarTablaEscala();
      }
      
      // Cerrar dropdown si está abierto
      const dropdown = document.querySelector('.paes-dropdown');
      if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        const button = document.querySelector('.tabla-mode-btn.has-dropdown');
        if (button) button.classList.remove('active');
      }
    }, 100);
  });
}

// Mejorar accesibilidad en móvil
function enhanceAccessibilityForMobile() {
  if (!isMobile) return;
  
  // Agregar labels más descriptivos
  const inputs = document.querySelectorAll('#escala-panel input[type="number"]');
  inputs.forEach(input => {
    const label = input.parentElement.querySelector('label');
    if (label && !input.getAttribute('aria-label')) {
      input.setAttribute('aria-label', label.textContent);
    }
  });
  
  // Mejorar navegación por teclado
  const focusableElements = document.querySelectorAll('#escala-panel input, #escala-panel button');
  focusableElements.forEach((element, index) => {
    element.setAttribute('tabindex', index + 1);
  });
}

// Optimizar rendimiento en móvil
function optimizePerformanceForMobile() {
  if (!isMobile) return;
  
  // Debounce para resize events
  let resizeTimeout;
  const originalResizeHandler = window.addEventListener;
  
  // Reducir frecuencia de eventos resize
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      detectDevice();
    }, 250);
  });
  
  // Optimizar scroll events
  const scrollElements = document.querySelectorAll('.tabla-multi-inner, .paes-dropdown');
  scrollElements.forEach(element => {
    let scrollTimeout;
    element.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Procesar scroll después de que termine
      }, 100);
    }, { passive: true });
  });
}

// Agregar estilos CSS dinámicos para móvil
function addMobileDynamicStyles() {
  if (!isMobile) return;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .input-focused {
      transform: scale(1.02);
      z-index: 10;
    }
    
    .conversor-focused {
      transform: scale(1.01);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .input-error {
      border-color: #ff4757 !important;
      box-shadow: 0 0 0 2px rgba(255, 71, 87, 0.3) !important;
    }
  `;
  
  document.head.appendChild(style);
}

// Inicialización principal
function initEscalaNotasMobile() {
  detectDevice();
  
  if (isMobile || isTablet) {
    console.log('🔧 Inicializando optimizaciones móviles para Escala de Notas');
    
    addMobileDynamicStyles();
    enhancePaesDropdownMobile();
    enhanceInputsForTouch();
    enhanceButtonsForTouch();
    optimizeTableForMobile();
    enhanceConversorForMobile();
    handleOrientationChange();
    enhanceAccessibilityForMobile();
    optimizePerformanceForMobile();
    
    console.log('✅ Optimizaciones móviles aplicadas');
  }
}

// Auto-inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEscalaNotasMobile);
} else {
  initEscalaNotasMobile();
}

// Re-inicializar en cambios de tamaño significativos
window.addEventListener('resize', function() {
  const wasMobile = isMobile;
  const wasTablet = isTablet;
  
  detectDevice();
  
  // Si cambió el tipo de dispositivo, re-inicializar
  if (wasMobile !== isMobile || wasTablet !== isTablet) {
    initEscalaNotasMobile();
  }
});

// Exportar funciones para uso externo si es necesario
window.EscalaNotasMobile = {
  detectDevice,
  enhancePaesDropdownMobile,
  enhanceInputsForTouch,
  optimizeTableForMobile,
  isMobile: () => isMobile,
  isTablet: () => isTablet
}; 