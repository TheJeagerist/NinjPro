// Función para agregar sección con nombre específico
function addSectionWithName(nombre) {
  if (typeof sectionCounter === 'undefined') {
    window.sectionCounter = 0;
  }
  window.sectionCounter++;
  
  const section = document.createElement('div');
  section.className = 'section-panel';
  section.id = `section-${window.sectionCounter}`;
  
  section.innerHTML = `
    <div class="section-header">
      <div class="section-title">${nombre}</div>
      <div class="section-result" id="result-${window.sectionCounter}">
        <span class="section-result-value">0.00</span>
        <span class="section-result-status">-</span>
      </div>
    </div>
    <div class="section-controls">
      <button class="btn-add" onclick="addRowToSection(this)">+</button>
      <button class="btn-remove" onclick="removeRowFromSection(this)">-</button>
      <button class="btn-reset" onclick="resetSection(this)">↻</button>
    </div>
    <div class="section-rows-container">
      <div class="section-row">
        <input type="number" class="grade" step="0.1" min="1" max="7" placeholder="Nota">
        <input type="number" class="weight" min="1" max="100" placeholder="Ponderación">
        <div class="percent">%</div>
      </div>
    </div>
  `;
  
  const container = document.getElementById('sections-container');
  if (container) {
    container.appendChild(section);
  }
}

// Función para limpiar todas las secciones
function limpiarSecciones() {
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
        sectionsContainer.innerHTML = '';
    }
    
    // Reiniciar contador
    window.sectionCounter = 0;
    
    // Limpiar resultados
    const resultValue = document.getElementById('multi-result-value');
    const resultStatus = document.getElementById('multi-result-status');
    const resultPanel = document.getElementById('multi-result-panel');
    
    if (resultValue) resultValue.textContent = '0.00';
    if (resultStatus) resultStatus.textContent = '-';
    if (resultPanel) resultPanel.className = 'result-panel';
}

// Función para actualizar los selectores de curso
function actualizarSelectoresCurso() {
    const selectores = document.querySelectorAll('.curso-select, .curso-select-multi');
    selectores.forEach(selector => {
        const valorActual = selector.value;
        selector.innerHTML = '<option value="">Seleccionar Curso</option>';
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        Object.keys(cursosData).forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = `${curso} (${cursosData[curso].length} estudiantes)`;
            selector.appendChild(option);
        });
        
        if (valorActual && cursosData[valorActual]) {
            selector.value = valorActual;
        }
    });
}

// Función para cargar curso en el multi-panel
function cargarCursoMulti() {
    const cursoSelect = document.getElementById('curso-select-multi');
    const cursoSeleccionado = cursoSelect.value;
    
    if (!cursoSeleccionado) {
        alert('Por favor selecciona un curso primero');
        return;
    }
    
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    const estudiantes = cursosData[cursoSeleccionado];
    
    if (!estudiantes || estudiantes.length === 0) {
        alert('No hay estudiantes en este curso');
        return;
    }
    
    // Confirmar si ya hay secciones
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer.children.length > 0) {
        if (!confirm(`Ya hay ${sectionsContainer.children.length} secciones creadas. ¿Deseas limpiar todo y cargar los estudiantes del curso ${cursoSeleccionado}?`)) {
            return;
        }
    }
    
    // Limpiar secciones existentes
    limpiarSecciones();
    
    // Crear una sección por cada estudiante
    estudiantes.forEach(estudiante => {
        const nombreEstudiante = estudiante.nombre || estudiante;
        addSectionWithName(`${nombreEstudiante} (${cursoSeleccionado})`);
    });
    
    // Mostrar mensaje de éxito
    const mensaje = `✅ Curso ${cursoSeleccionado} cargado exitosamente. Se crearon ${estudiantes.length} secciones.`;
    
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--btn-add);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: 500;
        max-width: 350px;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = mensaje;
    
    document.body.appendChild(notification);
    
    // Remover notificación después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Agregar animaciones CSS necesarias si no existen
if (!document.getElementById('multi-panel-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'multi-panel-animations';
    styleSheet.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    `;
    document.head.appendChild(styleSheet);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar selectores de curso cuando se carga la página
    actualizarSelectoresCurso();
    
    // Actualizar selector cuando se vuelve al panel multi
    const menuMulti = document.getElementById('menu-multi');
    if (menuMulti) {
        menuMulti.addEventListener('click', function() {
            setTimeout(() => {
                actualizarSelectoresCurso();
            }, 100);
        });
    }
});

// Función para actualizar el elemento activo del menú
function updateActiveMenuItem(activeMenuId) {
  // Lista de todos los elementos del menú
  const menuItems = [
    'menu-calculadora',
    'menu-escala', 
    'menu-multi',
    'menu-calendario',
    'menu-word-counter',
    'menu-rubricas',
    'menu-config'
  ];
  
  // Remover la clase 'active' de todos los elementos del menú
  menuItems.forEach(menuId => {
    const element = document.getElementById(menuId);
    if (element) {
      element.classList.remove('active');
    }
  });
  
  // Agregar la clase 'active' al elemento seleccionado
  const activeElement = document.getElementById(activeMenuId);
  if (activeElement) {
    activeElement.classList.add('active');
  }
} 