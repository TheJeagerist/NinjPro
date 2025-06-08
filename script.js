document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los paneles
    const panels = {
        'calc-panel': document.getElementById('calc-panel'),
        'escala-panel': document.getElementById('escala-panel'),
        'multi-panel': document.getElementById('multi-panel'),
        'calendario-panel': document.getElementById('calendario-panel'),
        'rubricas-panel': document.getElementById('rubricas-panel'),
        'config': document.getElementById('config')
    };

    // Obtener todos los botones del menú
    const menuButtons = {
        'menu-calculadora': document.getElementById('menu-calculadora'),
        'menu-escala': document.getElementById('menu-escala'),
        'menu-multi': document.getElementById('menu-multi'),
        'menu-calendario': document.getElementById('menu-calendario'),
        'menu-rubricas': document.getElementById('menu-rubricas'),
        'menu-config': document.getElementById('menu-config')
    };

    // Mapeo de botones a paneles
    const buttonToPanelMap = {
        'menu-calculadora': 'calc-panel',
        'menu-escala': 'escala-panel',
        'menu-multi': 'multi-panel',
        'menu-calendario': 'calendario-panel',
        'menu-rubricas': 'rubricas-panel',
        'menu-config': 'config'
    };

    // Función para ocultar todos los paneles
    function hideAllPanels() {
        Object.values(panels).forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
                panel.classList.remove('visible');
            }
        });
    }

    // Función para remover la clase active de todos los botones
    function removeActiveFromAllButtons() {
        Object.values(menuButtons).forEach(button => {
            if (button) {
                button.classList.remove('active');
            }
        });
    }

    // Agregar eventos click a todos los botones del menú
    Object.entries(menuButtons).forEach(([buttonId, button]) => {
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Ocultar todos los paneles
                hideAllPanels();
                
                // Remover active de todos los botones
                removeActiveFromAllButtons();
                
                // Mostrar el panel correspondiente
                const panelId = buttonToPanelMap[buttonId];
                if (panels[panelId]) {
                    panels[panelId].style.display = 'block';
                    panels[panelId].classList.add('visible');
                }
                
                // Agregar clase active al botón actual
                this.classList.add('active');
            });
        }
    });

    // Inicializar la configuración
    const configBtn = document.getElementById('menu-config');
    const configPanel = document.getElementById('config');
    const btnCargarExcel = document.getElementById('btn-cargar-excel-config');
    const btnDescargarPlantilla = document.getElementById('btn-descargar-plantilla-config');

    console.log('=== DEBUG CONFIGURACIÓN ===');
    console.log('configBtn:', configBtn);
    console.log('configPanel:', configPanel);
    console.log('btnCargarExcel:', btnCargarExcel);
    console.log('btnDescargarPlantilla:', btnDescargarPlantilla);
    console.log('XLSX disponible:', typeof XLSX !== 'undefined');

    if (configBtn && configPanel) {
        configBtn.addEventListener('click', () => {
            console.log('Click en botón de configuración');
            hideAllPanels();
            removeActiveFromAllButtons();
            configBtn.classList.add('active');
            configPanel.style.display = 'block';
            configPanel.classList.add('visible');
            actualizarListaCursos();
        });
    }

    // Inicializar botones de configuración
    if (btnCargarExcel) {
        console.log('Inicializando botón cargar excel config');
        btnCargarExcel.addEventListener('click', () => {
            console.log('Click en botón cargar excel config');
            cargarExcelEstudiantes();
        });
    } else {
        console.error('No se encontró el botón de cargar excel config');
    }

    if (btnDescargarPlantilla) {
        console.log('Inicializando botón descargar plantilla config');
        btnDescargarPlantilla.addEventListener('click', () => {
            console.log('Click en botón descargar plantilla config');
            descargarPlantillaExcel();
        });
    } else {
        console.error('No se encontró el botón de descargar plantilla config');
    }

    // Mostrar el panel de calculadora por defecto
    hideAllPanels();
    if (panels['calc-panel']) {
        panels['calc-panel'].style.display = 'block';
        panels['calc-panel'].classList.add('visible');
    }
    if (menuButtons['menu-calculadora']) {
        menuButtons['menu-calculadora'].classList.add('active');
    }

    // Cargar datos iniciales
    actualizarListaCursos();
    actualizarSelectoresCurso();
});

// Variables globales para la gestión de cursos
let cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');

// Función para cargar archivo Excel de estudiantes
async function cargarExcelEstudiantes() {
    // Verificar si la librería XLSX está disponible
    if (typeof XLSX === 'undefined') {
        alert('Error: La librería XLSX no está cargada correctamente');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                console.log('Procesando archivo:', file.name); // Debug
                const data = await leerExcelEstudiantes(file);
                console.log('Datos procesados:', data); // Debug
                guardarDatosCurso(data);
                actualizarListaCursos();
                actualizarSelectoresCurso(); // Actualizar los selectores después de cargar
                alert('Lista de estudiantes cargada exitosamente');
            } catch (error) {
                console.error('Error al procesar el archivo:', error); // Debug
                alert('Error al procesar el archivo: ' + error.message);
            }
        }
    };
    
    input.click();
}

// Función para leer el archivo Excel
async function leerExcelEstudiantes(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                console.log('Archivo leído correctamente'); // Debug
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                console.log('Datos del Excel:', jsonData); // Debug
                
                // Verificar estructura del archivo
                if (!jsonData || jsonData.length < 2) {
                    throw new Error('El archivo debe contener al menos un encabezado y un estudiante');
                }
                
                // Procesar datos
                const headers = jsonData[0];
                if (!headers || !headers.includes('Nombre') || !headers.includes('Curso')) {
                    throw new Error('El archivo debe contener las columnas "Nombre" y "Curso"');
                }
                
                const nombreIndex = headers.indexOf('Nombre');
                const cursoIndex = headers.indexOf('Curso');
                
                const estudiantes = {};
                
                // Procesar cada fila
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row && row[nombreIndex] && row[cursoIndex]) {
                        const curso = row[cursoIndex].toString().trim();
                        const nombre = row[nombreIndex].toString().trim();
                        
                        if (curso && nombre) {
                            if (!estudiantes[curso]) {
                                estudiantes[curso] = [];
                            }
                            estudiantes[curso].push({
                                nombre: nombre,
                                id: i
                            });
                        }
                    }
                }
                
                if (Object.keys(estudiantes).length === 0) {
                    throw new Error('No se encontraron datos válidos en el archivo');
                }
                
                console.log('Estudiantes procesados:', estudiantes); // Debug
                resolve(estudiantes);
            } catch (error) {
                console.error('Error al procesar Excel:', error); // Debug
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            console.error('Error al leer el archivo:', error); // Debug
            reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// Función para guardar datos del curso
function guardarDatosCurso(data) {
    cursosData = { ...cursosData, ...data };
    localStorage.setItem('cursosData', JSON.stringify(cursosData));
    
    // Actualizar todos los selectores de cursos en la aplicación
    if (typeof actualizarSelectoresCurso === 'function') {
        actualizarSelectoresCurso();
    }
    
    // También disparar evento personalizado para que otros módulos se actualicen
    window.dispatchEvent(new CustomEvent('cursosActualizados', { 
        detail: { cursosData: cursosData } 
    }));
}

// Función para actualizar la lista de cursos en el panel
function actualizarListaCursos() {
    const listaCursos = document.getElementById('lista-cursos');
    if (!listaCursos) return;
    
    console.log('Actualizando lista de cursos. Datos disponibles:', cursosData); // Debug
    
    listaCursos.innerHTML = '';
    
    if (Object.keys(cursosData).length === 0) {
        listaCursos.innerHTML = '<p>No hay cursos cargados</p>';
        return;
    }
    
    Object.keys(cursosData).forEach(curso => {
        console.log('Creando curso:', curso, 'con', cursosData[curso].length, 'estudiantes'); // Debug
        
        const cursoDiv = document.createElement('div');
        cursoDiv.className = 'curso-item';
        
        const cursoInfo = document.createElement('div');
        cursoInfo.className = 'curso-info';
        cursoInfo.innerHTML = `<span>${curso} - ${cursosData[curso].length} estudiantes</span>`;
        
        // Agregar evento click para mostrar estudiantes
        cursoInfo.addEventListener('click', function() {
            console.log('Click en curso:', curso); // Debug
            mostrarEstudiantesCurso(curso);
        });
        
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.onclick = function(e) {
            e.stopPropagation(); // Evitar que se dispare el click del curso
            eliminarCurso(curso);
        };
        btnEliminar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        
        cursoDiv.appendChild(cursoInfo);
        cursoDiv.appendChild(btnEliminar);
        listaCursos.appendChild(cursoDiv);
    });
}

// Función para mostrar estudiantes de un curso en el nuevo panel lateral
function mostrarEstudiantesCurso(curso) {
    console.log('Intentando mostrar estudiantes del curso:', curso); // Debug
    
    const estudiantesSidebar = document.getElementById('estudiantes-sidebar');
    const sidebarTitulo = document.getElementById('estudiantes-sidebar-titulo');
    const sidebarCount = document.getElementById('estudiantes-sidebar-count');
    const sidebarLista = document.getElementById('estudiantes-sidebar-lista');
    const configPanel = document.getElementById('config');
    
    console.log('Elementos encontrados:', {
        estudiantesSidebar: !!estudiantesSidebar,
        sidebarTitulo: !!sidebarTitulo,
        sidebarCount: !!sidebarCount,
        sidebarLista: !!sidebarLista,
        configPanel: !!configPanel
    }); // Debug
    
    console.log('Datos del curso:', cursosData[curso]); // Debug
    
    if (!estudiantesSidebar) {
        console.error('No se encontró el elemento estudiantes-sidebar');
        return;
    }
    
    if (!cursosData[curso]) {
        console.error('No se encontraron datos para el curso:', curso);
        return;
    }
    
    // Mostrar el panel lateral
    estudiantesSidebar.classList.add('visible');
    console.log('Panel lateral mostrado'); // Debug
    
    // Ajustar el panel de configuración
    if (configPanel) {
        configPanel.classList.add('sidebar-open');
    }
    
    // Actualizar título y contador
    if (sidebarTitulo) {
        sidebarTitulo.textContent = `Estudiantes del curso: ${curso}`;
    }
    
    const estudiantes = cursosData[curso];
    if (sidebarCount) {
        sidebarCount.textContent = `${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''}`;
    }
    
    // Limpiar y llenar lista de estudiantes
    if (sidebarLista) {
        sidebarLista.innerHTML = '';
        
        estudiantes.forEach((estudiante, index) => {
            const estudianteDiv = document.createElement('div');
            estudianteDiv.className = 'estudiante-sidebar-item';
            
            const nombreEstudiante = estudiante.nombre || estudiante;
            estudianteDiv.innerHTML = `
                <span class="estudiante-sidebar-numero">${index + 1}</span>
                <span class="estudiante-sidebar-nombre">${nombreEstudiante}</span>
            `;
            
            sidebarLista.appendChild(estudianteDiv);
        });
        
        console.log('Lista de estudiantes actualizada con', estudiantes.length, 'estudiantes'); // Debug
    }
}

// Función para cerrar el panel lateral de estudiantes
function cerrarEstudiantesSidebar() {
    const estudiantesSidebar = document.getElementById('estudiantes-sidebar');
    const configPanel = document.getElementById('config');
    
    if (estudiantesSidebar) {
        estudiantesSidebar.classList.remove('visible');
    }
    
    if (configPanel) {
        configPanel.classList.remove('sidebar-open');
    }
}

// Event listeners para el nuevo panel lateral
document.addEventListener('DOMContentLoaded', function() {
    // Botón cerrar del panel lateral
    const cerrarSidebar = document.getElementById('cerrar-estudiantes-sidebar');
    if (cerrarSidebar) {
        cerrarSidebar.addEventListener('click', cerrarEstudiantesSidebar);
    }
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const estudiantesSidebar = document.getElementById('estudiantes-sidebar');
            if (estudiantesSidebar && estudiantesSidebar.classList.contains('visible')) {
                cerrarEstudiantesSidebar();
            }
        }
    });
    
    // Mantener el evento para el panel anterior (compatibilidad)
    const cerrarEstudiantes = document.getElementById('cerrar-estudiantes');
    if (cerrarEstudiantes) {
        cerrarEstudiantes.addEventListener('click', function() {
            const estudiantesPanel = document.getElementById('estudiantes-panel');
            if (estudiantesPanel) {
                estudiantesPanel.style.display = 'none';
            }
        });
    }
});

// Función para eliminar un curso
function eliminarCurso(curso) {
    if (confirm(`¿Estás seguro de que deseas eliminar el curso ${curso}?`)) {
        delete cursosData[curso];
        localStorage.setItem('cursosData', JSON.stringify(cursosData));
        actualizarListaCursos();
        actualizarSelectoresCurso();
    }
}

// Función para descargar plantilla Excel
function descargarPlantillaExcel() {
    const headers = ['Nombre', 'Curso'];
    const data = [
        headers,
        ['Juan Pérez', '8°A'],
        ['María García', '8°A'],
        ['Pedro López', '8°B']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
    
    XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
}

// Función para actualizar los selectores de curso en toda la aplicación
function actualizarSelectoresCurso() {
    // Selectores básicos
    const selectores = document.querySelectorAll('.curso-select, .curso-select-multi');
    selectores.forEach(selector => {
        const valorActual = selector.value;
        selector.innerHTML = '<option value="">Seleccionar Curso</option>';
        
        if (Object.keys(cursosData).length === 0) {
            const optionSinCursos = document.createElement('option');
            optionSinCursos.value = "";
            optionSinCursos.textContent = "No hay cursos - Ve a Configuración";
            optionSinCursos.disabled = true;
            selector.appendChild(optionSinCursos);
        } else {
            Object.keys(cursosData).forEach(curso => {
                const estudiantes = cursosData[curso];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = curso;
                option.textContent = `${curso} (${cantidadEstudiantes} estudiantes)`;
                selector.appendChild(option);
            });
        }
        
        if (valorActual && cursosData[valorActual]) {
            selector.value = valorActual;
        }
    });
    
    // Selector específico del contador de palabras
    const wordCounterCourseSelect = document.getElementById('course-select');
    if (wordCounterCourseSelect) {
        const valorActualWC = wordCounterCourseSelect.value;
        wordCounterCourseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        
        if (Object.keys(cursosData).length === 0) {
            wordCounterCourseSelect.innerHTML = '<option value="">No hay cursos cargados - Ve a Configuración</option>';
            wordCounterCourseSelect.disabled = true;
        } else {
            wordCounterCourseSelect.disabled = false;
            Object.keys(cursosData).forEach(curso => {
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
    
    // Disparar evento personalizado para notificar a otros módulos
    window.dispatchEvent(new CustomEvent('selectoresCursosActualizados', {
        detail: { cursosData: cursosData }
    }));
} 