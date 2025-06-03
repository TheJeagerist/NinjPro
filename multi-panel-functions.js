console.log('🚀 multi-panel-functions.js cargado correctamente');

// Variables globales para controlar alertas de validación
// Esta variable debe coincidir con la definida en main.js
if (typeof aplicandoCantidadNotas === 'undefined') {
    window.aplicandoCantidadNotas = false;
}

if (typeof aplicandoPorcentaje === 'undefined') {
    window.aplicandoPorcentaje = false;
}

// Función de verificación inmediata
(function verificacionInmediata() {
    console.log('🔧 Verificando elementos del multi-panel...');
    
    // Verificar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(verificarElementos, 500);
        });
    } else {
        setTimeout(verificarElementos, 500);
    }
    
    function verificarElementos() {
        const btnCargarCurso = document.getElementById('btn-cargar-curso-multi');
        const cursoSelect = document.getElementById('curso-select-multi');
        const sectionsContainer = document.getElementById('sections-container');
        
        console.log('📋 Verificación automática:');
        console.log('  - Botón Cargar Curso:', !!btnCargarCurso ? '✅ Encontrado' : '❌ No encontrado');
        console.log('  - Selector Curso:', !!cursoSelect ? '✅ Encontrado' : '❌ No encontrado');
        console.log('  - Contenedor Secciones:', !!sectionsContainer ? '✅ Encontrado' : '❌ No encontrado');
        
        if (btnCargarCurso && !btnCargarCurso.title.includes('DEBUG')) {
            console.log('⚠️ El botón no tiene el debug configurado. Puede que los event listeners no estén funcionando.');
        }
    }
})();

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
        
        // Limpiar opciones existentes
        selector.innerHTML = '<option value="">Seleccionar Curso</option>';
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const cursos = Object.keys(cursosData);
        
        if (cursos.length === 0) {
            // Si no hay cursos cargados
            const optionSinCursos = document.createElement('option');
            optionSinCursos.value = "";
            optionSinCursos.textContent = "No hay cursos - Ve a Configuración";
            optionSinCursos.disabled = true;
            selector.appendChild(optionSinCursos);
        } else {
            // Agregar cada curso como opción
            cursos.forEach(curso => {
                const estudiantes = cursosData[curso];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = curso;
                option.textContent = `${curso} (${cantidadEstudiantes} estudiantes)`;
                selector.appendChild(option);
            });
        }
        
        // Restaurar valor anterior si aún existe
        if (valorActual && cursosData[valorActual]) {
            selector.value = valorActual;
        }
    });
    
    // También actualizar el selector del contador de palabras si existe
    const wordCounterCourseSelect = document.getElementById('course-select');
    if (wordCounterCourseSelect) {
        const valorActualWC = wordCounterCourseSelect.value;
        wordCounterCourseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const cursos = Object.keys(cursosData);
        
        if (cursos.length === 0) {
            wordCounterCourseSelect.innerHTML = '<option value="">No hay cursos cargados - Ve a Configuración</option>';
            wordCounterCourseSelect.disabled = true;
        } else {
            wordCounterCourseSelect.disabled = false;
            cursos.forEach(curso => {
                const estudiantes = cursosData[curso];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = curso;
                option.textContent = `${curso} (${cantidadEstudiantes} estudiantes)`;
                wordCounterCourseSelect.appendChild(option);
            });
            
            if (valorActualWC && cursosData[valorActualWC]) {
                wordCounterCourseSelect.value = valorActualWC;
            }
        }
    }
}

// Función para cargar curso en el multi-panel
function cargarCursoMulti() {
    console.log('=== INICIANDO cargarCursoMulti ===');
    
    const cursoSelect = document.getElementById('curso-select-multi');
    console.log('Selector encontrado:', !!cursoSelect);
    
    if (!cursoSelect) {
        console.error('❌ No se encontró el selector curso-select-multi');
        mostrarNotificacion('Error: No se encontró el selector de cursos', 'error');
        return;
    }
    
    const cursoSeleccionado = cursoSelect.value;
    console.log('Curso seleccionado:', cursoSeleccionado);
    
    if (!cursoSeleccionado) {
        console.log('❌ No hay curso seleccionado');
        mostrarNotificacion('Por favor selecciona un curso primero', 'error');
        return;
    }
    
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    console.log('Datos de cursos desde localStorage:', cursosData);
    
    if (!cursosData[cursoSeleccionado]) {
        console.error('❌ Curso no encontrado en datos:', cursoSeleccionado);
        mostrarNotificacion('El curso seleccionado no existe en los datos guardados', 'error');
        actualizarSelectoresCurso(); // Actualizar por si hay desincronización
        return;
    }
    
    const estudiantes = cursosData[cursoSeleccionado];
    console.log('Estudiantes encontrados:', estudiantes);
    
    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
        console.error('❌ No hay estudiantes en el curso');
        mostrarNotificacion('No hay estudiantes en este curso', 'error');
        return;
    }
    
    console.log('Cargando curso:', cursoSeleccionado, 'con estudiantes:', estudiantes);
    
    // Confirmar si ya hay secciones
    const sectionsContainer = document.getElementById('sections-container');
    console.log('Contenedor de secciones encontrado:', !!sectionsContainer);
    console.log('Secciones existentes:', sectionsContainer ? sectionsContainer.children.length : 'N/A');
    
    if (sectionsContainer && sectionsContainer.children.length > 0) {
        const confirmacion = confirm(
            `Ya hay ${sectionsContainer.children.length} secciones creadas.\n\n` +
            `¿Deseas limpiar todo y cargar ${estudiantes.length} secciones individuales para cada estudiante del curso ${cursoSeleccionado}?`
        );
        console.log('Confirmación del usuario:', confirmacion);
        if (!confirmacion) {
            return;
        }
    }
    
    // Limpiar secciones existentes
    console.log('Limpiando secciones existentes...');
    limpiarSecciones();
    
    // Mostrar mensaje de proceso
    mostrarNotificacion(`⏳ Creando secciones para ${estudiantes.length} estudiantes...`, 'info');
    
    // Crear una sección individual por cada estudiante
    let estudiantesCreados = 0;
    console.log('Iniciando creación de secciones...');
    
    estudiantes.forEach((estudiante, index) => {
        try {
            // Manejar diferentes formatos de estudiante
            let nombreEstudiante;
            
            if (typeof estudiante === 'string') {
                nombreEstudiante = estudiante;
            } else if (typeof estudiante === 'object' && estudiante !== null) {
                nombreEstudiante = estudiante.nombre || estudiante.Nombre || `Estudiante ${index + 1}`;
            } else {
                nombreEstudiante = `Estudiante ${index + 1}`;
            }
            
            // Limpiar nombre y validar
            nombreEstudiante = nombreEstudiante.toString().trim();
            if (nombreEstudiante === '') {
                nombreEstudiante = `Estudiante ${index + 1}`;
            }
            
            console.log(`Creando sección para estudiante ${index + 1}:`, nombreEstudiante);
            
            // Crear la sección individual para este estudiante
            // Solo mostrar el nombre del estudiante (sin el curso para hacer más limpio)
            addSectionWithName(nombreEstudiante);
            estudiantesCreados++;
            
        } catch (error) {
            console.warn(`Error al procesar estudiante en índice ${index}:`, error);
        }
    });
    
    console.log('Proceso completado. Estudiantes creados:', estudiantesCreados);
    
    if (estudiantesCreados > 0) {
        // Mostrar mensaje de éxito detallado
        const mensaje = `✅ ¡Curso "${cursoSeleccionado}" cargado!\n${estudiantesCreados} secciones creadas (una por estudiante)`;
        
        setTimeout(() => {
            mostrarNotificacion(mensaje, 'success');
        }, 500);
        
        console.log('Secciones creadas exitosamente:', estudiantesCreados);
        
        // Scroll suave hacia el contenedor de secciones
        const sectionsContainer = document.getElementById('sections-container');
        if (sectionsContainer && sectionsContainer.firstElementChild) {
            setTimeout(() => {
                sectionsContainer.firstElementChild.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 200);
        }
    } else {
        mostrarNotificacion('❌ No se pudieron crear secciones para los estudiantes', 'error');
        console.error('No se crearon secciones para los estudiantes');
    }
    
    console.log('=== FIN cargarCursoMulti ===');
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
    
    // Verificar si hay datos disponibles
    verificarDatosDisponibles();
    
    // Event listeners para los nuevos controles del curso
    const btnCargarCurso = document.getElementById('btn-cargar-curso-multi');
    const btnLimpiarTodo = document.getElementById('btn-limpiar-todo-multi');
    
    console.log('=== DEBUG MULTI-PANEL ===');
    console.log('btnCargarCurso encontrado:', !!btnCargarCurso);
    console.log('btnLimpiarTodo encontrado:', !!btnLimpiarTodo);
    
    if (btnCargarCurso) {
        console.log('Configurando event listener para botón cargar curso');
        btnCargarCurso.addEventListener('click', function() {
            console.log('¡CLICK EN BOTÓN CARGAR CURSO!');
            cargarCursoMulti();
        });
        
        // También agregar debug visual al botón
        btnCargarCurso.title = 'DEBUG: Botón configurado correctamente';
        btnCargarCurso.style.border = '2px solid green'; // Indicador visual de que está configurado
    } else {
        console.error('❌ No se encontró el botón btn-cargar-curso-multi');
    }
    
    if (btnLimpiarTodo) {
        btnLimpiarTodo.addEventListener('click', limpiarSecciones);
    }
    
    // Debug: Verificar datos de cursos
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    console.log('Datos de cursos disponibles:', cursosData);
    console.log('Cantidad de cursos:', Object.keys(cursosData).length);
    
    // Actualizar selector cuando se vuelve al panel multi
    const menuMulti = document.getElementById('menu-multi');
    if (menuMulti) {
        menuMulti.addEventListener('click', function() {
            console.log('Navegando al panel multi - actualizando selectores');
            setTimeout(() => {
                actualizarSelectoresCurso();
                verificarDatosDisponibles(); // También verificar datos al cambiar de panel
            }, 100);
        });
    }
    
    // Listener para detectar cambios en localStorage (cuando se cargan nuevos cursos)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cursosData') {
            // Se han actualizado los datos de cursos, actualizar todos los selectores
            actualizarSelectoresCurso();
            
            // Mostrar notificación de actualización
            mostrarNotificacion('📚 Cursos actualizados en todos los paneles', 'success');
        }
    });
    
    // Listener para eventos personalizados de actualización de cursos
    window.addEventListener('cursosActualizados', function(e) {
        actualizarSelectoresCurso();
        mostrarNotificacion('📚 Cursos sincronizados', 'success');
    });
    
    window.addEventListener('selectoresCursosActualizados', function(e) {
        // Este evento se dispara desde script.js, asegurarse de que estén sincronizados
        setTimeout(() => {
            actualizarSelectoresCurso();
        }, 100);
    });
    
    // También escuchar cambios locales en cursosData mediante un observer personalizado
    let lastCursosData = localStorage.getItem('cursosData');
    
    setInterval(() => {
        const currentCursosData = localStorage.getItem('cursosData');
        if (currentCursosData !== lastCursosData) {
            lastCursosData = currentCursosData;
            actualizarSelectoresCurso();
        }
    }, 1000); // Verificar cada segundo
});

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? 'var(--btn-add)' : tipo === 'error' ? 'var(--btn-remove)' : 'var(--card-bg)'};
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

// Función para cargar datos de prueba si no hay cursos
function cargarDatosPrueba() {
    const cursosData = {
        "8°A": [
            { nombre: "Juan Pérez", id: 1 },
            { nombre: "María García", id: 2 },
            { nombre: "Pedro López", id: 3 },
            { nombre: "Ana Martínez", id: 4 }
        ],
        "8°B": [
            { nombre: "Carlos Ruiz", id: 5 },
            { nombre: "Laura Fernández", id: 6 },
            { nombre: "Diego Morales", id: 7 }
        ],
        "7°A": [
            { nombre: "Sofía Castillo", id: 8 },
            { nombre: "Miguel Torres", id: 9 },
            { nombre: "Valentina Soto", id: 10 }
        ]
    };
    
    localStorage.setItem('cursosData', JSON.stringify(cursosData));
    console.log('✅ Datos de prueba cargados:', cursosData);
    
    // Actualizar selectores
    actualizarSelectoresCurso();
    
    // Notificar
    mostrarNotificacion('📚 Datos de prueba cargados: 3 cursos con estudiantes', 'success');
}

// Verificar si hay datos y ofrecer cargar datos de prueba
function verificarDatosDisponibles() {
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    
    if (Object.keys(cursosData).length === 0) {
        console.log('⚠️ No hay datos de cursos. Ofreciendo cargar datos de prueba...');
        
        // Crear botón temporal para datos de prueba
        const multiPanel = document.getElementById('multi-panel');
        if (multiPanel) {
            const btnPrueba = document.createElement('button');
            btnPrueba.id = 'btn-datos-prueba';
            btnPrueba.innerHTML = '🧪 Cargar Datos de Prueba';
            btnPrueba.style.cssText = `
                background: #ff9800;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                margin: 10px;
                cursor: pointer;
                font-weight: bold;
            `;
            
            btnPrueba.addEventListener('click', function() {
                cargarDatosPrueba();
                btnPrueba.remove(); // Remover botón después de usar
            });
            
            // Insertar al inicio del panel
            const container = multiPanel.querySelector('.container');
            if (container) {
                container.insertBefore(btnPrueba, container.firstChild);
            }
        }
        
        return false;
    }
    
    return true;
}

// ===== FUNCIONES DE PRUEBA PARA CONSOLA =====
// Estas funciones se pueden ejecutar directamente desde la consola del navegador

// Función principal de diagnóstico
window.diagnosticarMultiPanel = function() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO MULTI-PANEL ===');
    
    // 1. Verificar elementos del DOM
    const btnCargarCurso = document.getElementById('btn-cargar-curso-multi');
    const cursoSelect = document.getElementById('curso-select-multi');
    const sectionsContainer = document.getElementById('sections-container');
    const multiPanel = document.getElementById('multi-panel');
    
    console.log('📋 VERIFICACIÓN DE ELEMENTOS DOM:');
    console.log('  - Botón Cargar Curso:', !!btnCargarCurso, btnCargarCurso ? '✅' : '❌');
    console.log('  - Selector de Curso:', !!cursoSelect, cursoSelect ? '✅' : '❌');
    console.log('  - Contenedor Secciones:', !!sectionsContainer, sectionsContainer ? '✅' : '❌');
    console.log('  - Panel Multi:', !!multiPanel, multiPanel ? '✅' : '❌');
    
    if (multiPanel) {
        console.log('  - Panel Multi visible:', multiPanel.style.display !== 'none' ? '✅' : '❌');
    }
    
    // 2. Verificar datos
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    console.log('\n📚 VERIFICACIÓN DE DATOS:');
    console.log('  - Datos en localStorage:', Object.keys(cursosData).length > 0 ? '✅' : '❌');
    console.log('  - Cantidad de cursos:', Object.keys(cursosData).length);
    console.log('  - Cursos disponibles:', Object.keys(cursosData));
    
    // 3. Verificar selector
    if (cursoSelect) {
        console.log('\n🎯 VERIFICACIÓN DEL SELECTOR:');
        console.log('  - Opciones en selector:', cursoSelect.options.length);
        console.log('  - Valor seleccionado:', cursoSelect.value || 'ninguno');
        console.log('  - Opciones disponibles:');
        for (let i = 0; i < cursoSelect.options.length; i++) {
            console.log(`    ${i}: ${cursoSelect.options[i].text} (valor: "${cursoSelect.options[i].value}")`);
        }
    }
    
    // 4. Verificar event listeners
    console.log('\n⚡ VERIFICACIÓN DE EVENT LISTENERS:');
    if (btnCargarCurso) {
        console.log('  - Botón tiene title debug:', btnCargarCurso.title.includes('DEBUG') ? '✅' : '❌');
        console.log('  - Botón tiene borde verde:', btnCargarCurso.style.border.includes('green') ? '✅' : '❌');
    }
    
    console.log('\n🔧 === FIN DIAGNÓSTICO ===\n');
    
    return {
        elementos: { btnCargarCurso, cursoSelect, sectionsContainer, multiPanel },
        datos: cursosData,
        estado: 'Diagnóstico completado'
    };
};

// Función para probar los datos
window.probarDatos = function() {
    console.log('📊 === PRUEBA DE DATOS ===');
    const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
    
    if (Object.keys(cursosData).length === 0) {
        console.log('❌ No hay datos de cursos');
        console.log('💡 Ejecuta: cargarDatosPrueba() para cargar datos de ejemplo');
        return false;
    }
    
    Object.keys(cursosData).forEach(curso => {
        console.log(`📚 Curso: ${curso}`);
        console.log(`   👥 Estudiantes (${cursosData[curso].length}):`);
        cursosData[curso].forEach((estudiante, index) => {
            const nombre = typeof estudiante === 'string' ? estudiante : estudiante.nombre || estudiante.Nombre || 'Sin nombre';
            console.log(`     ${index + 1}. ${nombre}`);
        });
    });
    
    return cursosData;
};

// Función para probar el selector
window.probarSelector = function() {
    console.log('🎯 === PRUEBA DEL SELECTOR ===');
    const cursoSelect = document.getElementById('curso-select-multi');
    
    if (!cursoSelect) {
        console.log('❌ Selector no encontrado');
        return false;
    }
    
    console.log(`📋 Selector encontrado con ${cursoSelect.options.length} opciones:`);
    for (let i = 0; i < cursoSelect.options.length; i++) {
        const option = cursoSelect.options[i];
        console.log(`  ${i}: "${option.text}" (valor: "${option.value}")`);
    }
    
    console.log(`🎯 Valor actual: "${cursoSelect.value}"`);
    
    return {
        selector: cursoSelect,
        opciones: cursoSelect.options.length,
        valorActual: cursoSelect.value
    };
};

// Función para simular selección de curso
window.seleccionarCurso = function(nombreCurso) {
    console.log(`🎯 === SELECCIONANDO CURSO: ${nombreCurso} ===`);
    const cursoSelect = document.getElementById('curso-select-multi');
    
    if (!cursoSelect) {
        console.log('❌ Selector no encontrado');
        return false;
    }
    
    // Buscar la opción
    let opcionEncontrada = false;
    for (let i = 0; i < cursoSelect.options.length; i++) {
        if (cursoSelect.options[i].value === nombreCurso) {
            cursoSelect.value = nombreCurso;
            opcionEncontrada = true;
            console.log(`✅ Curso "${nombreCurso}" seleccionado`);
            break;
        }
    }
    
    if (!opcionEncontrada) {
        console.log(`❌ Curso "${nombreCurso}" no encontrado en las opciones`);
        console.log('📋 Cursos disponibles:');
        for (let i = 0; i < cursoSelect.options.length; i++) {
            if (cursoSelect.options[i].value) {
                console.log(`  - ${cursoSelect.options[i].value}`);
            }
        }
        return false;
    }
    
    return true;
};

// Función para simular click en botón cargar curso
window.simularClickCargarCurso = function() {
    console.log('🖱️ === SIMULANDO CLICK EN BOTÓN CARGAR CURSO ===');
    const btnCargarCurso = document.getElementById('btn-cargar-curso-multi');
    
    if (!btnCargarCurso) {
        console.log('❌ Botón no encontrado');
        return false;
    }
    
    console.log('✅ Botón encontrado, simulando click...');
    btnCargarCurso.click();
    
    return true;
};

// Función para ejecutar cargarCursoMulti directamente
window.ejecutarCargarCursoMulti = function() {
    console.log('⚡ === EJECUTANDO cargarCursoMulti DIRECTAMENTE ===');
    
    if (typeof cargarCursoMulti === 'function') {
        cargarCursoMulti();
        return true;
    } else {
        console.log('❌ Función cargarCursoMulti no encontrada');
        return false;
    }
};

// Función para prueba completa
window.pruebaCompleta = function(nombreCurso = null) {
    console.log('🔥 === PRUEBA COMPLETA DEL SISTEMA ===');
    
    // 1. Diagnóstico
    const diagnostico = window.diagnosticarMultiPanel();
    
    // 2. Verificar datos
    console.log('\n📊 Verificando datos...');
    const datos = window.probarDatos();
    if (!datos) {
        console.log('💡 Cargando datos de prueba...');
        cargarDatosPrueba();
        actualizarSelectoresCurso();
    }
    
    // 3. Verificar selector
    console.log('\n🎯 Verificando selector...');
    window.probarSelector();
    
    // 4. Seleccionar curso automáticamente si no se especifica
    if (!nombreCurso) {
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const cursos = Object.keys(cursosData);
        if (cursos.length > 0) {
            nombreCurso = cursos[0];
            console.log(`🎯 Seleccionando primer curso disponible: ${nombreCurso}`);
        }
    }
    
    if (nombreCurso) {
        console.log(`\n🎯 Seleccionando curso: ${nombreCurso}`);
        window.seleccionarCurso(nombreCurso);
        
        // 5. Simular click
        console.log('\n🖱️ Simulando click en botón...');
        setTimeout(() => {
            window.simularClickCargarCurso();
        }, 1000);
    }
    
    console.log('\n✅ === PRUEBA COMPLETA FINALIZADA ===');
};

// Función para limpiar y reiniciar
window.limpiarYReiniciar = function() {
    console.log('🧹 === LIMPIANDO Y REINICIANDO ===');
    
    // Limpiar secciones
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
        sectionsContainer.innerHTML = '';
        console.log('✅ Secciones limpiadas');
    }
    
    // Reiniciar contador
    window.sectionCounter = 0;
    console.log('✅ Contador reiniciado');
    
    // Actualizar selectores
    actualizarSelectoresCurso();
    console.log('✅ Selectores actualizados');
    
    console.log('✅ === REINICIO COMPLETADO ===');
};

// Mostrar ayuda con todas las funciones disponibles
window.ayudaMultiPanel = function() {
    console.log(`
🆘 === AYUDA - FUNCIONES DE PRUEBA MULTI-PANEL ===

📋 FUNCIONES DISPONIBLES:

1. diagnosticarMultiPanel()     - Diagnóstico completo del sistema
2. probarDatos()               - Verificar datos de cursos
3. probarSelector()            - Verificar selector de cursos
4. seleccionarCurso("8°A")     - Seleccionar un curso específico
5. simularClickCargarCurso()   - Simular click en botón
6. ejecutarCargarCursoMulti()  - Ejecutar función directamente
7. pruebaCompleta()            - Prueba automática completa
8. limpiarYReiniciar()         - Limpiar secciones y reiniciar
9. cargarDatosPrueba()         - Cargar datos de ejemplo
10. ayudaMultiPanel()          - Mostrar esta ayuda

🔥 PRUEBA RÁPIDA:
   pruebaCompleta()            - Ejecuta todas las pruebas automáticamente

💡 EJEMPLOS:
   diagnosticarMultiPanel()    - Para ver estado general
   pruebaCompleta("8°A")       - Prueba completa con curso específico
   seleccionarCurso("8°B")     - Seleccionar curso 8°B
   
🛠️ RESOLUCIÓN DE PROBLEMAS:
   Si no hay datos: cargarDatosPrueba()
   Si hay errores: limpiarYReiniciar()
    `);
};

console.log('🔧 === FUNCIONES DE PRUEBA CARGADAS ===');
console.log('💡 Ejecuta ayudaMultiPanel() para ver todas las funciones disponibles');
console.log('🔥 Ejecuta pruebaCompleta() para una prueba automática completa');

// ================================
// FUNCIONES PARA CONTROLES DE NOTAS Y PORCENTAJES
// ================================

/**
 * Aplica la cantidad específica de notas a todos los estudiantes
 */
function aplicarCantidadNotas() {
    console.log('🔢 === APLICANDO CANTIDAD DE NOTAS ===');
    
    const cantidadInput = document.getElementById('cantidad-notas');
    if (!cantidadInput) {
        console.error('❌ No se encontró el input cantidad-notas');
        mostrarNotificacion('Error: No se encontró el campo de cantidad de notas', 'error');
        return;
    }
    
    const cantidad = parseInt(cantidadInput.value);
    console.log('Cantidad de notas solicitada:', cantidad);
    
    // Validar la cantidad
    if (isNaN(cantidad) || cantidad < 1 || cantidad > 20) {
        console.error('❌ Cantidad inválida:', cantidad);
        mostrarNotificacion('Por favor ingresa una cantidad válida entre 1 y 20 notas', 'error');
        return;
    }
    
    const sections = document.querySelectorAll('.section-panel');
    console.log('Secciones encontradas:', sections.length);
    
    if (sections.length === 0) {
        console.error('❌ No hay estudiantes cargados');
        mostrarNotificacion('No hay estudiantes cargados. Primero carga un curso.', 'error');
        return;
    }
    
    // Activar variable de control para evitar alertas de validación
    window.aplicandoCantidadNotas = true;
    
    let estudiantesActualizados = 0;
    
    sections.forEach((section, index) => {
        try {
            const estudianteNombre = section.querySelector('.section-title').textContent;
            console.log(`Actualizando estudiante ${index + 1}: ${estudianteNombre}`);
            
            const rowsContainer = section.querySelector('.section-rows-container');
            if (!rowsContainer) {
                console.warn(`⚠️ No se encontró contenedor de filas para ${estudianteNombre}`);
                return;
            }
            
            // Obtener las filas actuales y sus valores
            const existingRows = Array.from(rowsContainer.querySelectorAll('.section-row'));
            const existingData = existingRows.map(row => ({
                grade: row.querySelector('.grade')?.value || '',
                weight: row.querySelector('.weight')?.value || ''
            }));
            
            console.log(`  - Filas existentes: ${existingRows.length}`);
            console.log(`  - Nueva cantidad: ${cantidad}`);
            
            // Limpiar el contenedor
            rowsContainer.innerHTML = '';
            
            // Crear la nueva cantidad de filas
            for (let i = 0; i < cantidad; i++) {
                const row = document.createElement('div');
                row.className = 'section-row';
                
                // Si había datos previos y están dentro del rango, preservarlos
                const existingGrade = (i < existingData.length) ? existingData[i].grade : '';
                const existingWeight = (i < existingData.length) ? existingData[i].weight : '';
                
                row.innerHTML = `
                    <input type="number" class="grade" step="0.1" min="1" max="7" placeholder="Nota" value="${existingGrade}">
                    <input type="number" class="weight" min="1" max="100" placeholder="Ponderación" value="${existingWeight}">
                    <div class="percent">%</div>
                `;
                
                rowsContainer.appendChild(row);
            }
            
            console.log(`  ✅ ${estudianteNombre}: ${cantidad} notas aplicadas`);
            estudiantesActualizados++;
            
        } catch (error) {
            console.error(`❌ Error procesando estudiante ${index + 1}:`, error);
        }
    });
    
    console.log(`✅ Proceso completado. Estudiantes actualizados: ${estudiantesActualizados}`);
    
    if (estudiantesActualizados > 0) {
        mostrarNotificacion(
            `✅ ${cantidad} notas aplicadas a ${estudiantesActualizados} estudiante(s)`, 
            'success'
        );
        
        // Actualizar los promedios si existe la función
        if (typeof calculateMultipleAverages === 'function') {
            setTimeout(() => {
                calculateMultipleAverages();
                // Desactivar variable de control DESPUÉS de calcular promedios
                setTimeout(() => {
                    window.aplicandoCantidadNotas = false;
                }, 50); // Pequeño delay adicional para asegurar que termine calculateMultipleAverages
            }, 100);
        } else {
            // Desactivar variable de control si no se puede calcular promedios
            setTimeout(() => {
                window.aplicandoCantidadNotas = false;
            }, 50); // Pequeño delay adicional para asegurar que termine calculateMultipleAverages
        }
    } else {
        mostrarNotificacion('❌ No se pudieron actualizar las notas de los estudiantes', 'error');
        // Desactivar variable de control en caso de error
        setTimeout(() => {
            window.aplicandoCantidadNotas = false;
        }, 50); // Pequeño delay adicional para asegurar que termine calculateMultipleAverages
    }
}

/**
 * Aplica el porcentaje común distribuido entre todas las notas de todos los estudiantes
 */
function aplicarPorcentajeComun() {
    console.log('📊 === APLICANDO PORCENTAJE COMÚN ===');
    
    const porcentajeInput = document.getElementById('porcentaje-comun');
    if (!porcentajeInput) {
        console.error('❌ No se encontró el input porcentaje-comun');
        mostrarNotificacion('Error: No se encontró el campo de porcentaje común', 'error');
        return;
    }
    
    const porcentaje = parseInt(porcentajeInput.value);
    console.log('Porcentaje común solicitado:', porcentaje);
    
    // Validar el porcentaje
    if (isNaN(porcentaje) || porcentaje < 1 || porcentaje > 100) {
        console.error('❌ Porcentaje inválido:', porcentaje);
        mostrarNotificacion('Por favor ingresa un porcentaje válido entre 1 y 100', 'error');
        return;
    }
    
    const sections = document.querySelectorAll('.section-panel');
    console.log('Secciones encontradas:', sections.length);
    
    if (sections.length === 0) {
        console.error('❌ No hay estudiantes cargados');
        mostrarNotificacion('No hay estudiantes cargados. Primero carga un curso.', 'error');
        return;
    }
    
    // Activar variable de control para evitar alertas de validación
    window.aplicandoPorcentaje = true;
    
    let estudiantesActualizados = 0;
    
    sections.forEach((section, index) => {
        try {
            const estudianteNombre = section.querySelector('.section-title').textContent;
            console.log(`Aplicando porcentaje a estudiante ${index + 1}: ${estudianteNombre}`);
            
            const weightInputs = section.querySelectorAll('.weight');
            const cantidadNotas = weightInputs.length;
            
            if (cantidadNotas === 0) {
                console.warn(`⚠️ ${estudianteNombre}: No tiene notas para aplicar porcentaje`);
                return;
            }
            
            console.log(`  - Notas encontradas: ${cantidadNotas}`);
            
            // Distribución simple y exacta
            const parteEntera = Math.floor(porcentaje / cantidadNotas);
            const resto = porcentaje % cantidadNotas;
            
            weightInputs.forEach((input, noteIndex) => {
                // Las primeras 'resto' notas reciben 1 punto adicional
                const valor = parteEntera + (noteIndex < resto ? 1 : 0);
                input.value = valor;
                console.log(`    Nota ${noteIndex + 1}: ${valor}%`);
                
                // Disparar evento de input para actualizar cálculos en tiempo real
                const event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                input.dispatchEvent(event);
            });
            
            console.log(`  ✅ ${estudianteNombre}: Porcentajes aplicados (total: ${porcentaje}%)`);
            estudiantesActualizados++;
            
        } catch (error) {
            console.error(`❌ Error procesando estudiante ${index + 1}:`, error);
        }
    });
    
    console.log(`✅ Proceso completado. Estudiantes actualizados: ${estudiantesActualizados}`);
    
    if (estudiantesActualizados > 0) {
        mostrarNotificacion(
            `✅ Porcentaje ${porcentaje}% aplicado a ${estudiantesActualizados} estudiante(s)`, 
            'success'
        );
        
        // Actualizar los promedios si existe la función
        if (typeof calculateMultipleAverages === 'function') {
            setTimeout(() => {
                calculateMultipleAverages();
                // Desactivar variable de control DESPUÉS de calcular promedios
                setTimeout(() => {
                    window.aplicandoPorcentaje = false;
                }, 50); // Pequeño delay adicional para asegurar que termine calculateMultipleAverages
            }, 100);
        } else {
            // Desactivar variable de control si no se puede calcular promedios
            setTimeout(() => {
                window.aplicandoPorcentaje = false;
            }, 50);
        }
    } else {
        mostrarNotificacion('❌ No se pudieron aplicar los porcentajes a los estudiantes', 'error');
        // Desactivar variable de control en caso de error
        setTimeout(() => {
            window.aplicandoPorcentaje = false;
        }, 50);
    }
}

/**
 * Función de utilidad para validar y aplicar valores a todos los estudiantes
 */
function aplicarValorATodosLosEstudiantes(tipo, valor, callback) {
    console.log(`🔧 Aplicando ${tipo}: ${valor} a todos los estudiantes`);
    
    const sections = document.querySelectorAll('.section-panel');
    
    if (sections.length === 0) {
        mostrarNotificacion('No hay estudiantes cargados', 'error');
        return false;
    }
    
    let exito = 0;
    
    sections.forEach((section, index) => {
        try {
            if (callback(section, valor, index)) {
                exito++;
            }
        } catch (error) {
            console.error(`Error en estudiante ${index + 1}:`, error);
        }
    });
    
    const mensaje = `${tipo} aplicado a ${exito}/${sections.length} estudiante(s)`;
    mostrarNotificacion(mensaje, exito > 0 ? 'success' : 'error');
    
    return exito > 0;
}

/**
 * Función para resetear todas las notas y porcentajes
 */
function resetearTodosLosEstudiantes() {
    console.log('🔄 === RESETEANDO TODOS LOS ESTUDIANTES ===');
    
    const sections = document.querySelectorAll('.section-panel');
    
    if (sections.length === 0) {
        mostrarNotificacion('No hay estudiantes para resetear', 'error');
        return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres resetear todas las notas de ${sections.length} estudiante(s)?`)) {
        return;
    }
    
    let estudiantesReseteados = 0;
    
    sections.forEach((section, index) => {
        try {
            const estudianteNombre = section.querySelector('.section-title').textContent;
            const inputs = section.querySelectorAll('.grade, .weight');
            
            inputs.forEach(input => {
                input.value = '';
            });
            
            // Actualizar el resultado del estudiante
            const resultValue = section.querySelector('.section-result-value');
            const resultStatus = section.querySelector('.section-result-status');
            
            if (resultValue) resultValue.textContent = '0.00';
            if (resultStatus) resultStatus.textContent = '-';
            
            console.log(`✅ ${estudianteNombre}: Reseteado`);
            estudiantesReseteados++;
            
        } catch (error) {
            console.error(`❌ Error reseteando estudiante ${index + 1}:`, error);
        }
    });
    
    console.log(`✅ ${estudiantesReseteados} estudiantes reseteados`);
    mostrarNotificacion(`✅ ${estudiantesReseteados} estudiante(s) reseteado(s)`, 'success');
    
    // Actualizar promedios
    if (typeof calculateMultipleAverages === 'function') {
        setTimeout(() => {
            calculateMultipleAverages();
        }, 100);
    }
}

// Hacer las funciones disponibles globalmente
window.aplicarCantidadNotas = aplicarCantidadNotas;
window.aplicarPorcentajeComun = aplicarPorcentajeComun;
window.resetearTodosLosEstudiantes = resetearTodosLosEstudiantes;

console.log('✅ === FUNCIONES DE CONTROL DE NOTAS CARGADAS ===');
console.log('📝 Funciones disponibles: aplicarCantidadNotas(), aplicarPorcentajeComun(), resetearTodosLosEstudiantes()'); 