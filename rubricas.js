// Variables globales
let rubricaContent = null;
let evaluacionPanel = null;
let modoNormalBtn = null;
let modoEvaluacionBtn = null;
    let rubricaActual = null;
let modoActual = 'normal';
let botonesModoInicializados = false;
let rubricasGuardadas = [];
let selectorRubricasGuardadas = null;
let fileInput = null;
let currentRubricaId = null;
    let evaluacionEnCurso = null;
let botonesInicializados = false;
let evalCursoSelect = null;
let evalEstudianteSelect = null;
let evalRubricaSelect = null;
let iniciarEvaluacionBtn = null;
let guardarEvaluacionBtn = null;
let limpiarEvaluacionBtn = null;
let exportarCursoPdfBtn = null;
let evaluacionResultado = null;
let nuevaRubricaBtn = null;
let cargarRubricaBtn = null;
let cargarRubricaEvaluacionBtn = null;

// Funciones generadoras de HTML
function generarNivelVacioEditable() {
    return `
        <th>
            <div class="nivel-header">
                <div class="nivel-info">
                    <input type="text" class="nivel-titulo-input" placeholder="Nivel" value="Nivel 1">
                    <input type="number" class="nivel-puntos" value="1" min="0" max="100">
                </div>
                <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
            </div>
        </th>
    `;
}

function generarFilaVaciaEditable() {
    return `
        <tr>
            <td>
                <div class="criterio-container">
                    <input type="text" class="criterio-input" placeholder="Criterio" value="Criterio 1">
                    <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
                </div>
            </td>
            <td>
                <textarea class="nivel-descripcion" placeholder="Descripción del nivel"></textarea>
            </td>
        </tr>
    `;
}

function generarColumnasNiveles(niveles) {
    return niveles.map((nivel, index) => `
        <th>
            <div class="nivel-header">
                <div class="nivel-info">
                    <input type="text" class="nivel-titulo-input" value="${nivel.nivel}">
                    <input type="number" class="nivel-puntos" value="${nivel.puntos}" min="0" max="100">
                </div>
                <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
            </div>
        </th>
    `).join('');
}

function generarFilasCriterios(criterios) {
    return criterios.map((criterio, index) => `
        <tr>
            <td>
                <div class="criterio-container">
                    <input type="text" class="criterio-input" value="${criterio.titulo}">
                    <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
                </div>
            </td>
            ${criterio.niveles.map(nivel => `
                <td>
                    <textarea class="nivel-descripcion">${nivel.descripcion}</textarea>
                </td>
            `).join('')}
        </tr>
    `).join('');
}

// Función para inicializar los elementos del DOM
function inicializarElementos() {
    console.log('Inicializando elementos...');
    
    // Inicializar elementos del DOM
    console.log('Buscando elementos del DOM...');
    rubricaContent = document.getElementById('rubrica-content');
    console.log('Contenedor de rúbrica:', rubricaContent ? 'encontrado' : 'no encontrado');
    
    evaluacionPanel = document.getElementById('evaluacion-panel');
    console.log('Panel de evaluación:', evaluacionPanel ? 'encontrado' : 'no encontrado');
    
    modoNormalBtn = document.getElementById('modo-normal');
    modoEvaluacionBtn = document.getElementById('modo-evaluacion');
    
    evalCursoSelect = document.getElementById('eval-curso-select');
    evalEstudianteSelect = document.getElementById('eval-estudiante-select');
    evalRubricaSelect = document.getElementById('eval-rubrica-select');
    iniciarEvaluacionBtn = document.getElementById('iniciar-evaluacion');
    guardarEvaluacionBtn = document.getElementById('guardar-evaluacion');
    limpiarEvaluacionBtn = document.getElementById('limpiar-evaluacion');
    exportarCursoPdfBtn = document.getElementById('exportar-curso-pdf');
    evaluacionResultado = document.getElementById('evaluacion-resultado');
    
    // Buscar botones de rúbrica
    nuevaRubricaBtn = document.getElementById('nueva-rubrica');
    console.log('Botón nueva rúbrica:', nuevaRubricaBtn ? 'encontrado' : 'no encontrado');
    
    cargarRubricaBtn = document.getElementById('cargar-rubrica');
    console.log('Botón cargar rúbrica:', cargarRubricaBtn ? 'encontrado' : 'no encontrado');

    cargarRubricaEvaluacionBtn = document.getElementById('cargar-rubrica-evaluacion');
    console.log('Botón cargar rúbrica evaluación:', cargarRubricaEvaluacionBtn ? 'encontrado' : 'no encontrado');

    // Crear input de archivo si no existe
    if (!fileInput) {
        console.log('Creando input de archivo...');
        fileInput = document.createElement('input');
    fileInput.type = 'file';
        fileInput.style.display = 'none';
    fileInput.accept = '.docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
        document.body.appendChild(fileInput);
    }
    
    // Verificar si el panel de rúbricas está visible
    const rubricasPanel = document.getElementById('rubricas-panel');
    console.log('Estado inicial del panel de rúbricas:', rubricasPanel ? rubricasPanel.style.display : 'no encontrado');
}

// Función para inicializar los event listeners
function inicializarEventListeners() {
    console.log('Inicializando event listeners...');
    
    // Event listeners para botones de rúbrica
    if (nuevaRubricaBtn) {
        console.log('Botón nueva rúbrica encontrado, agregando event listener');
        nuevaRubricaBtn.addEventListener('click', function() {
            console.log('Click en nueva rúbrica');
            // Verificar si el panel de rúbricas está visible
            const rubricasPanel = document.getElementById('rubricas-panel');
            console.log('Estado del panel antes de mostrar rúbrica:', rubricasPanel ? rubricasPanel.style.display : 'no encontrado');
            
            // Asegurarse de que el panel esté visible
            if (rubricasPanel && rubricasPanel.style.display === 'none') {
                console.log('Haciendo visible el panel de rúbricas...');
                rubricasPanel.style.display = 'block';
            }
            
            // Limpiar rúbrica actual
            currentRubricaId = null;
            rubricaActual = null;
            
            // Esperar un momento para que el DOM se actualice
            setTimeout(() => {
                console.log('Llamando a mostrarRubrica...');
                mostrarRubrica();
            }, 100);
        });
    } else {
        console.error('No se encontró el botón nueva rúbrica');
    }

    if (cargarRubricaBtn) {
        cargarRubricaBtn.addEventListener('click', function() {
            console.log('Click en cargar rúbrica');
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // Event listener para el input de archivo
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            console.log('Archivo seleccionado:', file.name, file.type);

            const reader = new FileReader();
            
            if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                reader.onload = function(e) {
                    try {
                        mammoth.convertToHtml({arrayBuffer: e.target.result})
                            .then(function(result) {
                                const rubrica = procesarDocx(result.value);
                                if (rubrica) {
                                    mostrarRubrica(rubrica);
                                    alert('Rúbrica cargada exitosamente desde Word');
                                }
                            })
                            .catch(function(error) {
                                console.error('Error al procesar archivo Word:', error);
                                alert('Error al procesar el archivo Word');
                            });
                    } catch (error) {
                        console.error('Error al leer archivo Word:', error);
                        alert('Error al leer el archivo Word');
                    }
                };
                reader.readAsArrayBuffer(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.type === 'application/vnd.ms-excel') {
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const rubrica = procesarExcel(workbook);
                        if (rubrica) {
                            mostrarRubrica(rubrica);
                            alert('Rúbrica cargada exitosamente desde Excel');
                        }
                    } catch (error) {
                        console.error('Error al procesar archivo Excel:', error);
                        alert('Error al procesar el archivo Excel');
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert('Formato de archivo no soportado. Use archivos .docx o .xlsx');
            }

            // Limpiar el input para permitir cargar el mismo archivo nuevamente
            this.value = '';
        });
    }

    // Event listeners para modo evaluación
    if (evalCursoSelect) {
        evalCursoSelect.addEventListener('change', function() {
            cargarEstudiantesCurso(this.value);
            verificarDatosEvaluacion();
        });
    }
    
    if (evalEstudianteSelect) {
        evalEstudianteSelect.addEventListener('change', verificarDatosEvaluacion);
    }
    
    if (evalRubricaSelect) {
        evalRubricaSelect.addEventListener('change', verificarDatosEvaluacion);
    }
    
    if (iniciarEvaluacionBtn) {
        iniciarEvaluacionBtn.addEventListener('click', iniciarEvaluacion);
    }
    
    if (guardarEvaluacionBtn) {
        guardarEvaluacionBtn.addEventListener('click', guardarEvaluacion);
    }
    
    if (limpiarEvaluacionBtn) {
        limpiarEvaluacionBtn.addEventListener('click', limpiarEvaluacion);
    }
    
    if (exportarCursoPdfBtn) {
        exportarCursoPdfBtn.addEventListener('click', function() {
            // Implementar exportación a PDF
            console.log('Exportar curso a PDF - función por implementar');
        });
    }

    if (cargarRubricaEvaluacionBtn) {
        cargarRubricaEvaluacionBtn.addEventListener('click', function() {
            const rubricaId = evalRubricaSelect?.value;
            if (!rubricaId) {
                alert('Por favor selecciona una rúbrica primero');
                return;
            }

            // Obtener la rúbrica seleccionada
            const rubricas = JSON.parse(localStorage.getItem('rubricasGuardadas') || '[]');
            const rubrica = rubricas.find(r => r.id === rubricaId);

            if (!rubrica) {
                alert('Rúbrica no encontrada');
                return;
            }

            // Cambiar a modo edición temporalmente para mostrar la rúbrica
            const modoAnterior = modoActual;
            modoActual = 'normal';
            
            // Mostrar el contenedor de rúbrica
            if (rubricaContent) rubricaContent.style.display = 'block';
            
            // Mostrar la rúbrica en modo solo lectura
            mostrarRubricaEnModoLectura(rubrica);
            
            // Restaurar el modo anterior
            modoActual = modoAnterior;
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando inicialización...');
    
    // Asegurarse de que el panel de rúbricas esté visible temporalmente para inicializar
    const rubricasPanel = document.getElementById('rubricas-panel');
    if (rubricasPanel) {
        console.log('Panel de rúbricas encontrado, haciendo visible temporalmente...');
        const displayOriginal = rubricasPanel.style.display;
        rubricasPanel.style.display = 'block';
        
        // Inicializar elementos mientras el panel está visible
        inicializarElementos();
        inicializarEventListeners();
        
        // Restaurar el estado original del panel
        rubricasPanel.style.display = displayOriginal;
        
        // Configurar el observador
        observer.observe(rubricasPanel, {
            attributes: true,
            attributeFilter: ['style']
        });
    } else {
        console.error('No se encontró el panel de rúbricas');
    }
    
    // Event listener para cargar rúbrica guardada desde el selector
    document.addEventListener('cargarRubricaGuardada', function(event) {
        const rubrica = event.detail;
        if (rubrica) {
            mostrarRubrica(rubrica);
        }
    });
    
    // Hacer la función mostrarRubrica disponible globalmente
    window.mostrarRubrica = mostrarRubrica;
    
    // Al inicializar, actualizar el selector de rúbricas guardadas
    if (window.RubricaConfig) {
        window.RubricaConfig.actualizarSelectorRubricas();
    }
});
    
    // Función para cambiar modo
    function cambiarModo(modo) {
    console.log('Cambiando a modo:', modo);
    
    // Verificar que los botones estén inicializados
    if (!modoNormalBtn || !modoEvaluacionBtn) {
        console.error('Los botones de modo no están inicializados');
        return;
    }
    
    // Actualizar modo actual y estado de los botones
    modoActual = modo;
        modoNormalBtn.classList.toggle('active', modo === 'normal');
        modoEvaluacionBtn.classList.toggle('active', modo === 'evaluacion');
        
    // Obtener elementos del panel
    const rubricasPanel = document.getElementById('rubricas-panel');
    const rubricaContent = document.getElementById('rubrica-content');
    const evaluacionPanel = document.getElementById('evaluacion-panel');
    const selectorRubricas = document.getElementById('selector-rubricas-guardadas');
    
    // Asegurarse de que el panel de rúbricas esté visible
    if (rubricasPanel) {
        rubricasPanel.style.display = 'block';
    }
    
    if (modo === 'normal') {
        // En modo normal:
        // - Mostrar el editor de rúbricas
        // - Ocultar el panel de evaluación
        // - Ocultar el selector de rúbricas guardadas
        if (rubricaContent) rubricaContent.style.display = 'block';
        if (evaluacionPanel) evaluacionPanel.style.display = 'none';
        if (selectorRubricas) selectorRubricas.style.display = 'none';
        
        // Limpiar evaluación si existe
        if (evaluacionEnCurso) {
            limpiarEvaluacion();
        }
        
        // Mostrar la rúbrica actual o un formulario vacío
        if (rubricaActual) {
            mostrarRubrica(rubricaActual);
        } else {
            mostrarRubrica();
        }
    } else {
        // En modo evaluación:
        // - Ocultar solo el editor de rúbricas
        // - Mostrar el panel de evaluación
        // - Mostrar el selector de rúbricas guardadas
        if (rubricaContent) rubricaContent.style.display = 'none';
        if (evaluacionPanel) evaluacionPanel.style.display = 'block';
        if (selectorRubricas) selectorRubricas.style.display = 'block';
        
        // Inicializar modo evaluación y actualizar rúbricas
        inicializarModoEvaluacion();
        
        // Asegurarse de que las rúbricas estén actualizadas
        setTimeout(() => {
            cargarRubricasEvaluacion();
            verificarDatosEvaluacion();
        }, 100);
        }
    }
    
    // Función para inicializar modo evaluación
    function inicializarModoEvaluacion() {
        cargarCursosEvaluacion();
        cargarRubricasEvaluacion();
    }
    
    // Listener para actualizar cuando se carguen nuevos cursos
    window.addEventListener('cursosActualizados', function(event) {
        if (modoActual === 'evaluacion') {
            cargarCursosEvaluacion();
        }
    });
    
    window.addEventListener('selectoresCursosActualizados', function(event) {
        if (modoActual === 'evaluacion') {
            cargarCursosEvaluacion();
        }
    });
    
    // Función para cargar cursos en evaluación
    function cargarCursosEvaluacion() {
        if (!evalCursoSelect) return;
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        evalCursoSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        Object.keys(cursosData).forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            evalCursoSelect.appendChild(option);
        });
    }
    
    // Función para cargar estudiantes del curso
    function cargarEstudiantesCurso(curso) {
        if (!evalEstudianteSelect || !curso) {
            evalEstudianteSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            evalEstudianteSelect.disabled = true;
            return;
        }
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const estudiantes = cursosData[curso] || [];
        
        evalEstudianteSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
        estudiantes.forEach(estudiante => {
            const option = document.createElement('option');
            
            // Manejar tanto objetos como strings
            let nombreEstudiante;
            let valorEstudiante;
            
            if (typeof estudiante === 'object' && estudiante !== null) {
                // Es un objeto, extraer el nombre
                nombreEstudiante = estudiante.nombre || estudiante.Nombre || `Estudiante ${estudiante.id || ''}` || '[Sin nombre]';
                valorEstudiante = nombreEstudiante; // Usar el nombre como valor
            } else {
                // Es un string
                nombreEstudiante = estudiante;
                valorEstudiante = estudiante;
            }
            
            option.value = valorEstudiante;
            option.textContent = nombreEstudiante;
            evalEstudianteSelect.appendChild(option);
        });
        
        evalEstudianteSelect.disabled = false;
        
        // Marcar estudiantes que ya tienen evaluación guardada
        actualizarEstilosEstudiantesEvaluados();
        
        // Debug para verificar los datos
        console.log('Datos de estudiantes para curso', curso, ':', estudiantes);
        console.log('Tipo del primer estudiante:', typeof estudiantes[0], estudiantes[0]);
    }
    
    // Función para actualizar los estilos de estudiantes que ya tienen evaluación
    function actualizarEstilosEstudiantesEvaluados() {
        if (!evalEstudianteSelect || !evalCursoSelect || !evalRubricaSelect) return;
        
        const curso = evalCursoSelect.value;
        const rubricaId = evalRubricaSelect.value;
        
        // Si no hay curso y rúbrica seleccionados, no podemos verificar
        if (!curso || !rubricaId) return;
        
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        
        // Recorrer todas las opciones de estudiantes
        Array.from(evalEstudianteSelect.options).forEach(option => {
            if (option.value && option.value !== '') {
                // Verificar si este estudiante ya fue evaluado con esta rúbrica en este curso
                const yaEvaluado = evaluaciones.some(eval => 
                    eval.curso === curso && 
                    eval.estudiante === option.value && 
                    eval.rubrica.id === rubricaId
                );
                
                // Agregar o quitar la clase según corresponda
                if (yaEvaluado) {
                    option.classList.add('estudiante-evaluado');
                } else {
                    option.classList.remove('estudiante-evaluado');
                }
            }
        });
    }
    
    // Función para cargar rúbricas en evaluación
    function cargarRubricasEvaluacion() {
        if (!evalRubricaSelect) return;
        
        const rubricas = JSON.parse(localStorage.getItem('rubricasGuardadas') || '[]');
        evalRubricaSelect.innerHTML = '<option value="">Seleccionar rúbrica...</option>';
        
        if (rubricas.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay rúbricas guardadas';
            option.disabled = true;
            evalRubricaSelect.appendChild(option);
            evalRubricaSelect.disabled = true;
        } else {
        rubricas.forEach(rubrica => {
            const option = document.createElement('option');
            option.value = rubrica.id;
            option.textContent = rubrica.titulo;
            evalRubricaSelect.appendChild(option);
        });
            evalRubricaSelect.disabled = false;
        }
        
        console.log('Rúbricas cargadas para evaluación:', rubricas.length);
    }
    
    // Función para verificar si se pueden habilitar los botones
    function verificarDatosEvaluacion() {
        const cursoSeleccionado = evalCursoSelect?.value;
        const estudianteSeleccionado = evalEstudianteSelect?.value;
        const rubricaSeleccionada = evalRubricaSelect?.value;
        
        const puedeIniciar = cursoSeleccionado && estudianteSeleccionado && rubricaSeleccionada;
        const puedeExportar = cursoSeleccionado && rubricaSeleccionada;
        
        if (iniciarEvaluacionBtn) {
            iniciarEvaluacionBtn.disabled = !puedeIniciar;
        }
        
        if (exportarCursoPdfBtn) {
            exportarCursoPdfBtn.disabled = !puedeExportar;
        }
        
        // Actualizar estilos de estudiantes evaluados cuando cambie la rúbrica
        actualizarEstilosEstudiantesEvaluados();
    }
    
    // Función para iniciar evaluación
    function iniciarEvaluacion() {
        const curso = evalCursoSelect.value;
        const estudiante = evalEstudianteSelect.value;
        const rubricaId = evalRubricaSelect.value;
        
        if (!curso || !estudiante || !rubricaId) {
            alert('Por favor selecciona curso, estudiante y rúbrica');
            return;
        }
        
        // Obtener la rúbrica seleccionada
        const rubricas = JSON.parse(localStorage.getItem('rubricasGuardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        
        if (!rubrica) {
            alert('Rúbrica no encontrada');
            return;
        }
        
        // Inicializar evaluación
        evaluacionEnCurso = {
            curso: curso,
            estudiante: estudiante,
            rubrica: rubrica,
            respuestas: {},
            puntajeTotal: 0,
            puntajeMaximo: 0
        };
        
        // Calcular puntaje máximo
        evaluacionEnCurso.puntajeMaximo = rubrica.criterios.reduce((total, criterio) => {
            const maxPuntos = Math.max(...criterio.niveles.map(nivel => nivel.puntos));
            return total + maxPuntos;
        }, 0);
        
        // Mostrar resultado panel y actualizar info
        mostrarResultadoEvaluacion();
        
        // Mostrar rúbrica en modo evaluación
        mostrarRubricaEvaluacion(rubrica);
        
        // Mostrar botones de evaluación
        if (guardarEvaluacionBtn) guardarEvaluacionBtn.style.display = 'flex';
        if (limpiarEvaluacionBtn) limpiarEvaluacionBtn.style.display = 'flex';
        if (iniciarEvaluacionBtn) iniciarEvaluacionBtn.style.display = 'none';
    }
    
    // Función para mostrar resultado de evaluación
    function mostrarResultadoEvaluacion() {
        if (!evaluacionResultado || !evaluacionEnCurso) return;
        
        const estudianteEvaluado = document.getElementById('estudiante-evaluado');
        const puntajeActual = document.getElementById('puntaje-actual');
        const puntajeMaximo = document.getElementById('puntaje-maximo');
        const notaFinal = document.getElementById('nota-final');
        
        if (estudianteEvaluado) {
            estudianteEvaluado.textContent = `Evaluando a: ${evaluacionEnCurso.estudiante} (${evaluacionEnCurso.curso})`;
        }
        
        if (puntajeActual) {
            puntajeActual.textContent = evaluacionEnCurso.puntajeTotal;
        }
        
        if (puntajeMaximo) {
            puntajeMaximo.textContent = evaluacionEnCurso.puntajeMaximo;
        }
        
        // Calcular nota (escala 1.0 a 7.0)
        const porcentaje = evaluacionEnCurso.puntajeMaximo > 0 ? 
            (evaluacionEnCurso.puntajeTotal / evaluacionEnCurso.puntajeMaximo) * 100 : 0;
        const nota = 1.0 + (porcentaje / 100) * 6.0;
        
        if (notaFinal) {
            notaFinal.textContent = nota.toFixed(1);
            
            // Cambiar clase según la nota
            const notaElement = notaFinal.closest('.nota-final');
            if (notaElement) {
                notaElement.className = 'nota-final';
                if (nota >= 6.0) notaElement.classList.add('excelente');
                else if (nota >= 5.0) notaElement.classList.add('buena');
                else if (nota >= 4.0) notaElement.classList.add('regular');
                else notaElement.classList.add('insuficiente');
            }
        }
        
        evaluacionResultado.style.display = 'block';
    }
    
    // Función para mostrar rúbrica en modo evaluación
    function mostrarRubricaEvaluacion(rubrica) {
        if (!rubricaContent) return;
        
        let html = `
            <div class="rubrica-evaluacion">
                <div class="rubrica-evaluacion-header">
                    <h3>${rubrica.titulo}</h3>
                    <p>${rubrica.descripcion}</p>
                </div>
        `;
        
        rubrica.criterios.forEach((criterio, criterioIndex) => {
            html += `
                <div class="criterio-evaluacion">
                    <div class="criterio-titulo">${criterio.titulo}</div>
                    <div class="niveles-botones" data-criterio="${criterioIndex}">
            `;
            
            criterio.niveles.forEach((nivel, nivelIndex) => {
                const isSelected = evaluacionEnCurso.respuestas[criterioIndex] === nivelIndex;
                html += `
                    <button class="nivel-boton ${isSelected ? 'selected' : ''}" 
                            data-criterio="${criterioIndex}" 
                            data-nivel="${nivelIndex}"
                            data-puntos="${nivel.puntos}">
                        <div class="nivel-nombre">${nivel.nivel}</div>
                        <div class="nivel-descripcion">${nivel.descripcion}</div>
                        <div class="nivel-puntaje">${nivel.puntos} pts</div>
                    </button>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        rubricaContent.innerHTML = html;
        
        // Agregar event listeners a los botones
        const botones = rubricaContent.querySelectorAll('.nivel-boton');
        botones.forEach(boton => {
            boton.addEventListener('click', function() {
                seleccionarNivel(
                    parseInt(this.dataset.criterio),
                    parseInt(this.dataset.nivel),
                    parseInt(this.dataset.puntos)
                );
            });
        });
    }
    
    // Función para seleccionar nivel
    function seleccionarNivel(criterioIndex, nivelIndex, puntos) {
        if (!evaluacionEnCurso) return;
        
        // Deseleccionar otros botones del mismo criterio
        const criterioContainer = rubricaContent.querySelector(`[data-criterio="${criterioIndex}"]`);
        const botones = criterioContainer.querySelectorAll('.nivel-boton');
        botones.forEach(btn => btn.classList.remove('selected'));
        
        // Seleccionar el botón clickeado
        const botonSeleccionado = criterioContainer.querySelector(`[data-criterio="${criterioIndex}"][data-nivel="${nivelIndex}"]`);
        botonSeleccionado.classList.add('selected');
        
        // Actualizar respuesta
        const respuestaAnterior = evaluacionEnCurso.respuestas[criterioIndex];
        evaluacionEnCurso.respuestas[criterioIndex] = nivelIndex;
        
        // Recalcular puntaje total
        evaluacionEnCurso.puntajeTotal = 0;
        Object.keys(evaluacionEnCurso.respuestas).forEach(criterio => {
            const nivelSeleccionado = evaluacionEnCurso.respuestas[criterio];
            const criterioData = evaluacionEnCurso.rubrica.criterios[criterio];
            if (criterioData && criterioData.niveles[nivelSeleccionado]) {
                evaluacionEnCurso.puntajeTotal += criterioData.niveles[nivelSeleccionado].puntos;
            }
        });
        
        // Actualizar visualización del resultado
        mostrarResultadoEvaluacion();
    }
    
    // Función para guardar evaluación
    function guardarEvaluacion() {
        if (!evaluacionEnCurso) {
            alert('No hay evaluación en curso');
            return;
        }
        
        // Verificar que se hayan respondido todos los criterios
        const criteriosRespondidos = Object.keys(evaluacionEnCurso.respuestas).length;
        const totalCriterios = evaluacionEnCurso.rubrica.criterios.length;
        
        if (criteriosRespondidos < totalCriterios) {
            const confirmar = confirm(`Solo has evaluado ${criteriosRespondidos} de ${totalCriterios} criterios. ¿Deseas guardar de todas formas?`);
            if (!confirmar) return;
        }
        
        // Crear objeto de evaluación para guardar
        const evaluacionParaGuardar = {
            id: generarIdUnico(),
            fecha: new Date().toISOString(),
            curso: evaluacionEnCurso.curso,
            estudiante: evaluacionEnCurso.estudiante,
            rubrica: {
                id: evaluacionEnCurso.rubrica.id,
                titulo: evaluacionEnCurso.rubrica.titulo
            },
            respuestas: evaluacionEnCurso.respuestas,
            puntajeTotal: evaluacionEnCurso.puntajeTotal,
            puntajeMaximo: evaluacionEnCurso.puntajeMaximo,
            nota: (1.0 + (evaluacionEnCurso.puntajeTotal / evaluacionEnCurso.puntajeMaximo) * 6.0).toFixed(1)
        };
        
        // Guardar en localStorage
        let evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        evaluaciones.push(evaluacionParaGuardar);
        localStorage.setItem('evaluaciones_rubricas', JSON.stringify(evaluaciones));
        
        // Actualizar estilos de estudiantes evaluados
        actualizarEstilosEstudiantesEvaluados();
        
        alert(`Evaluación guardada exitosamente.\nEstudiante: ${evaluacionEnCurso.estudiante}\nPuntaje: ${evaluacionEnCurso.puntajeTotal}/${evaluacionEnCurso.puntajeMaximo}\nNota: ${evaluacionParaGuardar.nota}`);
        
        // Pasar al siguiente estudiante en lugar de limpiar todo
        pasarASiguienteEstudiante();
    }
    
    // Función para pasar al siguiente estudiante
    function pasarASiguienteEstudiante() {
        if (!evalEstudianteSelect || !evaluacionEnCurso) return;
        
        const estudiantesOptions = Array.from(evalEstudianteSelect.options);
        const estudianteActualIndex = estudiantesOptions.findIndex(option => option.value === evaluacionEnCurso.estudiante);
        
        // Buscar el siguiente estudiante no evaluado
        let siguienteIndex = -1;
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        
        for (let i = estudianteActualIndex + 1; i < estudiantesOptions.length; i++) {
            const option = estudiantesOptions[i];
            if (option.value && option.value !== '') {
                // Verificar si este estudiante ya fue evaluado con esta rúbrica
                const yaEvaluado = evaluaciones.some(eval => 
                    eval.curso === evaluacionEnCurso.curso && 
                    eval.estudiante === option.value && 
                    eval.rubrica.id === evaluacionEnCurso.rubrica.id
                );
                
                if (!yaEvaluado) {
                    siguienteIndex = i;
                    break;
                }
            }
        }
        
        // Si no hay más estudiantes sin evaluar, buscar desde el principio
        if (siguienteIndex === -1) {
            for (let i = 1; i < estudianteActualIndex; i++) {
                const option = estudiantesOptions[i];
                if (option.value && option.value !== '') {
                    const yaEvaluado = evaluaciones.some(eval => 
                        eval.curso === evaluacionEnCurso.curso && 
                        eval.estudiante === option.value && 
                        eval.rubrica.id === evaluacionEnCurso.rubrica.id
                    );
                    
                    if (!yaEvaluado) {
                        siguienteIndex = i;
                        break;
                    }
                }
            }
        }
        
        if (siguienteIndex !== -1) {
            // Hay un siguiente estudiante, seleccionarlo
            evalEstudianteSelect.value = estudiantesOptions[siguienteIndex].value;
            
            // Inicializar nueva evaluación para este estudiante
            const nuevoEstudiante = estudiantesOptions[siguienteIndex].value;
            evaluacionEnCurso = {
                curso: evaluacionEnCurso.curso,
                estudiante: nuevoEstudiante,
                rubrica: evaluacionEnCurso.rubrica,
                respuestas: {},
                puntajeTotal: 0,
                puntajeMaximo: evaluacionEnCurso.puntajeMaximo
            };
            
            // Limpiar selecciones de la rúbrica
            limpiarSeleccionesRubrica();
            
            // Actualizar visualización del resultado
            mostrarResultadoEvaluacion();
            
        } else {
            // No hay más estudiantes sin evaluar
            alert('¡Todos los estudiantes del curso han sido evaluados con esta rúbrica!');
            
            // Preguntar si quiere continuar evaluando o finalizar
            const continuar = confirm('¿Deseas continuar evaluando estudiantes que ya fueron evaluados anteriormente?');
            
            if (continuar) {
                // Buscar el primer estudiante para reiniciar
                if (estudiantesOptions.length > 1 && estudiantesOptions[1].value) {
                    evalEstudianteSelect.value = estudiantesOptions[1].value;
                    
                    evaluacionEnCurso = {
                        curso: evaluacionEnCurso.curso,
                        estudiante: estudiantesOptions[1].value,
                        rubrica: evaluacionEnCurso.rubrica,
                        respuestas: {},
                        puntajeTotal: 0,
                        puntajeMaximo: evaluacionEnCurso.puntajeMaximo
                    };
                    
                    limpiarSeleccionesRubrica();
                    mostrarResultadoEvaluacion();
                }
            } else {
                // Finalizar evaluación
                limpiarEvaluacion();
            }
        }
    }
    
    // Función para limpiar solo las selecciones de la rúbrica
    function limpiarSeleccionesRubrica() {
        if (!rubricaContent) return;
        
        // Quitar la clase 'selected' de todos los botones
        const botonesSeleccionados = rubricaContent.querySelectorAll('.nivel-boton.selected');
        botonesSeleccionados.forEach(boton => {
            boton.classList.remove('selected');
        });
    }
    
    // Función para limpiar evaluación
    function limpiarEvaluacion() {
        evaluacionEnCurso = null;
        
        // Limpiar selectores
        if (evalCursoSelect) evalCursoSelect.value = '';
        if (evalEstudianteSelect) {
            evalEstudianteSelect.value = '';
            evalEstudianteSelect.disabled = true;
            evalEstudianteSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
        }
        if (evalRubricaSelect) evalRubricaSelect.value = '';
        
        // Ocultar paneles
        if (evaluacionResultado) evaluacionResultado.style.display = 'none';
        if (guardarEvaluacionBtn) guardarEvaluacionBtn.style.display = 'none';
        if (limpiarEvaluacionBtn) limpiarEvaluacionBtn.style.display = 'none';
        if (iniciarEvaluacionBtn) iniciarEvaluacionBtn.style.display = 'flex';
        
        // Limpiar contenido de rúbrica
        if (rubricaContent && modoActual === 'evaluacion') {
            rubricaContent.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">Selecciona curso, estudiante y rúbrica para comenzar la evaluación.</p>';
        }
        
        verificarDatosEvaluacion();
    }

// Función para procesar archivo Word
function procesarDocx(html) {
    console.log('Procesando archivo Word...');
    // Crear un elemento temporal para parsear el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extraer el contenido de las tablas
    const tablas = tempDiv.getElementsByTagName('table');
    if (tablas.length === 0) {
        throw new Error('No se encontraron tablas en el documento');
    }
    
    const tabla = tablas[0];
    const filas = tabla.getElementsByTagName('tr');
    
    // Crear estructura de rúbrica
    const rubrica = {
        id: generarId(),
        titulo: 'Rúbrica Importada de Word',
        descripcion: 'Rúbrica importada desde archivo Word',
        fechaCreacion: new Date().toISOString(),
        criterios: []
    };
    
    // Procesar filas (ignorar la primera que suele ser el encabezado)
    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName('td');
        if (celdas.length < 2) continue;
        
        const criterio = {
            titulo: celdas[0].textContent.trim(),
            niveles: []
        };
        
        // Procesar niveles (columnas)
        for (let j = 1; j < celdas.length; j++) {
            const contenido = celdas[j].textContent.trim();
            const [nivel, descripcion] = contenido.split('\n').map(s => s.trim());
            
            criterio.niveles.push({
                nivel: nivel || `Nivel ${j}`,
                descripcion: descripcion || '',
                puntos: j
            });
        }
        
        rubrica.criterios.push(criterio);
    }
    
    return rubrica;
}

    // Función para procesar archivo Excel
    function procesarExcel(workbook) {
    console.log('Procesando archivo Excel...');
    const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(primeraHoja, { header: 1 });
    
    if (datos.length < 2) {
        throw new Error('El archivo Excel no contiene suficientes datos');
    }
    
    // Crear estructura de rúbrica
    const rubrica = {
        id: generarId(),
        titulo: datos[0][0] || 'Rúbrica Importada de Excel',
        descripcion: datos[0][1] || 'Rúbrica importada desde archivo Excel',
        fechaCreacion: new Date().toISOString(),
        criterios: []
    };
    
    // Procesar filas (ignorar la primera que suele ser el encabezado)
    for (let i = 1; i < datos.length; i++) {
        const fila = datos[i];
        if (!fila || fila.length < 2) continue;
        
                const criterio = {
            titulo: fila[0] || `Criterio ${i}`,
                    niveles: []
                };
                
        // Procesar niveles (columnas)
        for (let j = 1; j < fila.length; j++) {
            const valor = fila[j];
            if (!valor) continue;
            
            const [nivel, descripcion, puntos] = String(valor).split('\n').map(s => s.trim());
            
                        criterio.niveles.push({
                nivel: nivel || `Nivel ${j}`,
                descripcion: descripcion || '',
                puntos: parseInt(puntos) || j
            });
        }
        
        rubrica.criterios.push(criterio);
    }
    
    return rubrica;
}

// Función auxiliar para generar IDs únicos
function generarId() {
    return 'rubrica_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Función para mostrar una rúbrica cargada
    function mostrarRubrica(rubrica = null) {
    console.log('Mostrando rúbrica...', rubrica);
    
    // Verificar si el panel de rúbricas está visible
    const rubricasPanel = document.getElementById('rubricas-panel');
    console.log('Estado del panel de rúbricas:', rubricasPanel ? rubricasPanel.style.display : 'no encontrado');
    
    // Verificar que el contenedor existe
    if (!rubricaContent) {
            console.error('No se encontró el contenedor de la rúbrica');
        rubricaContent = document.getElementById('rubrica-content');
        console.log('Búsqueda del contenedor:', rubricaContent ? 'encontrado' : 'no encontrado');
        if (!rubricaContent) {
            console.error('No se pudo encontrar el contenedor de la rúbrica después de reintentar');
            // Intentar hacer visible el panel de rúbricas si está oculto
            if (rubricasPanel && rubricasPanel.style.display === 'none') {
                console.log('Intentando hacer visible el panel de rúbricas...');
                rubricasPanel.style.display = 'block';
                // Reintentar obtener el contenedor después de hacer visible el panel
                rubricaContent = document.getElementById('rubrica-content');
                if (!rubricaContent) {
                    console.error('Aún no se pudo encontrar el contenedor después de hacer visible el panel');
            return;
        }
            } else {
            return;
            }
        }
    }

    // Si estamos en modo evaluación, mostrar la rúbrica en ese modo
    if (modoActual === 'evaluacion' && rubrica) {
        mostrarRubricaEvaluacion(rubrica);
            return;
        }

        // Actualizar ID de rúbrica actual
        currentRubricaId = rubrica ? rubrica.id : null;

        // Generar contenido de la tabla
        let headerContent = '<th>Criterio</th>';
        let bodyContent = '';

        if (rubrica && rubrica.criterios && rubrica.criterios.length > 0) {
            // Rúbrica existente
            const primeraFila = rubrica.criterios[0];
            if (primeraFila.niveles) {
                headerContent += primeraFila.niveles.map(nivel => `
                    <th>
                        <div class="nivel-header">
                            <div class="nivel-info">
                                <input type="text" class="nivel-titulo-input" value="${nivel.nivel}">
                                <input type="number" class="nivel-puntos" value="${nivel.puntos}" min="0" max="100">
                            </div>
                            <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
                        </div>
                    </th>
                `).join('');
            }

            bodyContent = rubrica.criterios.map(criterio => `
                <tr>
                    <td>
                        <div class="criterio-container">
                            <input type="text" class="criterio-input" value="${criterio.titulo}">
                            <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
                        </div>
                    </td>
                    ${criterio.niveles.map(nivel => `
                        <td>
                            <textarea class="nivel-descripcion">${nivel.descripcion}</textarea>
                        </td>
                    `).join('')}
                </tr>
            `).join('');
        } else {
            // Nueva rúbrica - crear estructura básica con 4 niveles
            for (let i = 1; i <= 4; i++) {
                headerContent += `
                    <th>
                        <div class="nivel-header">
                            <div class="nivel-info">
                                <input type="text" class="nivel-titulo-input" value="Nivel ${i}">
                                <input type="number" class="nivel-puntos" value="${i}" min="0" max="100">
                            </div>
                            <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
                        </div>
                    </th>
                `;
            }

            // Crear 2 criterios por defecto
            for (let i = 1; i <= 2; i++) {
                bodyContent += `
                    <tr>
                        <td>
                            <div class="criterio-container">
                                <input type="text" class="criterio-input" value="Criterio ${i}">
                                <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
                            </div>
                        </td>
                        <td><textarea class="nivel-descripcion" placeholder="Descripción del nivel 1"></textarea></td>
                        <td><textarea class="nivel-descripcion" placeholder="Descripción del nivel 2"></textarea></td>
                        <td><textarea class="nivel-descripcion" placeholder="Descripción del nivel 3"></textarea></td>
                        <td><textarea class="nivel-descripcion" placeholder="Descripción del nivel 4"></textarea></td>
                    </tr>
                `;
            }
        }

        // Modo normal - mostrar formulario de rúbrica
        console.log('Mostrando formulario de rúbrica en el contenedor:', rubricaContent);
        rubricaContent.innerHTML = `
            <form id="nueva-rubrica-form" class="rubrica-form">
                <div class="form-group">
                    <label for="rubrica-titulo">Título de la Rúbrica</label>
                    <input type="text" id="rubrica-titulo" name="rubrica-titulo" required value="${rubrica ? rubrica.titulo : ''}">
                </div>
                <div class="form-group">
                    <label for="rubrica-descripcion">Descripción</label>
                    <textarea id="rubrica-descripcion" name="rubrica-descripcion" rows="3">${rubrica ? rubrica.descripcion : ''}</textarea>
                </div>
                <div class="rubrica-container">
                    <div class="rubrica-table-container">
                        <div class="rubrica-table-wrapper">
                            <table id="rubrica-table" class="rubrica-table">
                                <thead>
                                    <tr id="header-row">
                                        ${headerContent}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bodyContent}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="rubricas-controls">
                    <button type="button" id="agregar-columna">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Nivel
                    </button>
                    <button type="button" id="agregar-fila">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Criterio
                    </button>
                    <button type="button" id="descargar-plantilla-excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Plantilla Excel
                    </button>
                    <button type="button" id="exportar-excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="8" y1="15" x2="16" y2="15"></line>
                        </svg>
                        Exportar Excel
                    </button>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar Rúbrica</button>
                </div>
            </form>
        `;

    // Inicializar event listeners para el formulario
    inicializarEventListenersRubrica();
    
    // Agregar event listeners para eliminar columnas y filas
    agregarEventListenersEliminacion();
}

// Función para agregar event listeners de eliminación
function agregarEventListenersEliminacion() {
    // Event listeners para eliminar columnas
    document.querySelectorAll('.btn-eliminar-columna').forEach(btn => {
        btn.addEventListener('click', function() {
            const columna = this.closest('th');
            eliminarColumna(columna);
        });
    });

    // Event listeners para eliminar filas
    document.querySelectorAll('.btn-eliminar-fila').forEach(btn => {
        btn.addEventListener('click', function() {
            const fila = this.closest('tr');
            eliminarFila(fila);
        });
    });
}

// Función para inicializar los event listeners de la rúbrica
function inicializarEventListenersRubrica() {
        const form = document.getElementById('nueva-rubrica-form');
    if (!form) return;

    // Event listener para el formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        guardarRubrica();
    });

    // Event listeners para los botones de control
        const agregarColumnaBtn = document.getElementById('agregar-columna');
        const agregarFilaBtn = document.getElementById('agregar-fila');
    const descargarExcelBtn = document.getElementById('descargar-plantilla-excel');
    const descargarWordBtn = document.getElementById('descargar-plantilla-word');
        const exportarExcelBtn = document.getElementById('exportar-excel');

    if (agregarColumnaBtn) {
        agregarColumnaBtn.addEventListener('click', agregarColumna);
    }
    if (agregarFilaBtn) {
        agregarFilaBtn.addEventListener('click', agregarFila);
    }
    if (descargarExcelBtn) {
        descargarExcelBtn.addEventListener('click', descargarPlantillaExcel);
    }
    if (descargarWordBtn) {
        descargarWordBtn.addEventListener('click', descargarPlantillaWord);
    }
    if (exportarExcelBtn) {
        exportarExcelBtn.addEventListener('click', exportarRubricaExcel);
    }
}

// Función para inicializar los botones de modo
function inicializarBotonesModo() {
    console.log('Inicializando botones de modo...');
    
    // Si ya están inicializados, no hacer nada
    if (botonesModoInicializados) {
        console.log('Los botones ya están inicializados');
                return;
            }
            
    // Buscar los botones
    modoNormalBtn = document.getElementById('tab-normal');
    modoEvaluacionBtn = document.getElementById('tab-evaluacion');
    
    console.log('Botones encontrados:', {
        modoNormal: modoNormalBtn ? 'sí' : 'no',
        modoEvaluacion: modoEvaluacionBtn ? 'sí' : 'no'
    });
    
    if (modoNormalBtn && modoEvaluacionBtn) {
        console.log('Agregando event listeners a los botones...');
        
        // Remover event listeners existentes para evitar duplicados
        modoNormalBtn.replaceWith(modoNormalBtn.cloneNode(true));
        modoEvaluacionBtn.replaceWith(modoEvaluacionBtn.cloneNode(true));
        
        // Obtener las nuevas referencias después de clonar
        modoNormalBtn = document.getElementById('tab-normal');
        modoEvaluacionBtn = document.getElementById('tab-evaluacion');
        
        // Agregar event listeners
        modoNormalBtn.addEventListener('click', () => {
            console.log('Click en modo normal');
            cambiarModo('normal');
        });
        
        modoEvaluacionBtn.addEventListener('click', () => {
            console.log('Click en modo evaluación');
            cambiarModo('evaluacion');
        });
        
        botonesModoInicializados = true;
        console.log('Botones inicializados correctamente');
        
        // Asegurarse de que el modo actual esté activo
        cambiarModo(modoActual);
    } else {
        console.error('No se encontraron los botones de modo');
    }
}

// Observador para detectar cuando el panel de rúbricas se muestra
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'rubricas-panel' && 
            mutation.type === 'attributes' && 
            mutation.attributeName === 'style') {
            const display = mutation.target.style.display;
            if (display === 'block') {
                console.log('Panel de rúbricas visible, inicializando botones...');
                inicializarBotonesModo();
            }
        }
    });
});

// Iniciar observación del panel de rúbricas
document.addEventListener('DOMContentLoaded', function() {
    const rubricasPanel = document.getElementById('rubricas-panel');
    if (rubricasPanel) {
        observer.observe(rubricasPanel, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
    
    // Inicializar otros elementos
    inicializarElementos();
    inicializarEventListeners();
});

// Funciones para manejar la estructura de la rúbrica
function agregarColumna() {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

    const headerRow = tabla.querySelector('thead tr');
    const bodyRows = tabla.querySelectorAll('tbody tr');
    
    // Contar niveles existentes para el nuevo número
    const numNiveles = headerRow.children.length;
    
    // Agregar nueva columna al encabezado
    const nuevaColumna = document.createElement('th');
    nuevaColumna.innerHTML = `
            <div class="nivel-header">
                <div class="nivel-info">
                <input type="text" class="nivel-titulo-input" value="Nivel ${numNiveles}">
                <input type="number" class="nivel-puntos" value="${numNiveles}" min="0" max="100">
                </div>
            <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
            </div>
        `;
    headerRow.appendChild(nuevaColumna);
    
    // Agregar celda a cada fila del cuerpo
    bodyRows.forEach(row => {
        const nuevaCelda = document.createElement('td');
        nuevaCelda.innerHTML = `<textarea class="nivel-descripcion" placeholder="Descripción del nivel ${numNiveles}"></textarea>`;
        row.appendChild(nuevaCelda);
    });

    // Reinicializar event listeners
    agregarEventListenersEliminacion();
}

function agregarFila() {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

        const tbody = tabla.querySelector('tbody');
    const numColumnas = tabla.querySelector('thead tr').children.length;
    const numCriterios = tbody.children.length + 1;
    
    // Crear nueva fila
    const nuevaFila = document.createElement('tr');
    
    // Crear celda de criterio
    let filaCells = `
        <td>
            <div class="criterio-container">
                <input type="text" class="criterio-input" value="Criterio ${numCriterios}">
                <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
            </div>
            </td>
        `;
        
    // Agregar celdas para cada nivel (excluyendo la primera columna que es "Criterio")
        for (let i = 1; i < numColumnas; i++) {
        filaCells += `<td><textarea class="nivel-descripcion" placeholder="Descripción del nivel ${i}"></textarea></td>`;
    }
    
    nuevaFila.innerHTML = filaCells;
    tbody.appendChild(nuevaFila);
    
    // Reinicializar event listeners
    agregarEventListenersEliminacion();
}

function eliminarColumna(columna) {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

    const headerRow = tabla.querySelector('thead tr');
    const bodyRows = tabla.querySelectorAll('tbody tr');
    
    // Verificar que queden al menos 2 columnas (Criterio + 1 nivel)
    if (headerRow.children.length <= 2) {
        alert('La rúbrica debe tener al menos 1 nivel');
        return;
    }
    
    // Obtener el índice de la columna a eliminar
    const columnIndex = Array.from(headerRow.children).indexOf(columna);
    
    // Eliminar columna del encabezado
    headerRow.removeChild(columna);
    
    // Eliminar celda correspondiente de cada fila
    bodyRows.forEach(row => {
        if (row.children[columnIndex]) {
            row.removeChild(row.children[columnIndex]);
        }
    });

    // Actualizar los números de nivel
    actualizarNumerosNivel();
    
    // Reinicializar event listeners
    agregarEventListenersEliminacion();
}

function eliminarFila(fila) {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

    const tbody = tabla.querySelector('tbody');
    
    // Verificar que queden al menos 1 fila
    if (tbody.children.length <= 1) {
        alert('La rúbrica debe tener al menos 1 criterio');
        return;
    }
    
    tbody.removeChild(fila);
    actualizarNumerosCriterio();
    
    // Reinicializar event listeners
    agregarEventListenersEliminacion();
}

function actualizarNumerosNivel() {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

    const headerRow = tabla.querySelector('thead tr');
    const inputs = headerRow.querySelectorAll('.nivel-titulo-input');
    
    inputs.forEach((input, index) => {
        input.value = `Nivel ${index + 1}`;
    });
}

function actualizarNumerosCriterio() {
    const tabla = document.querySelector('.rubrica-table');
    if (!tabla) return;

    const inputs = tabla.querySelectorAll('.criterio-input');
    
    inputs.forEach((input, index) => {
        input.value = `Criterio ${index + 1}`;
    });
}

// Funciones para descargar plantillas
async function descargarPlantillaWord() {
    try {
        // Crear un documento de Word usando mammoth
        const docx = await mammoth.createDocument({
            title: "Plantilla de Rúbrica",
            sections: [{
                properties: {},
                children: [{
                    type: "paragraph",
                    children: [{
                        type: "text",
                        text: "Plantilla de Rúbrica",
                        bold: true,
                        size: 24
                    }]
                }, {
                    type: "table",
                    rows: [
                        // Fila de encabezado
                        {
                            cells: [
                                { text: "Criterio" },
                                { text: "Nivel 1 (1 punto)" },
                                { text: "Nivel 2 (2 puntos)" },
                                { text: "Nivel 3 (3 puntos)" },
                                { text: "Nivel 4 (4 puntos)" }
                            ]
                        },
                        // Filas de ejemplo
                        {
                            cells: [
                                { text: "Criterio 1" },
                                { text: "Descripción del nivel 1 para criterio 1" },
                                { text: "Descripción del nivel 2 para criterio 1" },
                                { text: "Descripción del nivel 3 para criterio 1" },
                                { text: "Descripción del nivel 4 para criterio 1" }
                            ]
                        },
                        {
                            cells: [
                                { text: "Criterio 2" },
                                { text: "Descripción del nivel 1 para criterio 2" },
                                { text: "Descripción del nivel 2 para criterio 2" },
                                { text: "Descripción del nivel 3 para criterio 2" },
                                { text: "Descripción del nivel 4 para criterio 2" }
                            ]
                        }
                    ]
                }]
            }]
        });

        // Convertir el documento a blob
        const blob = await docx.save();
        
        // Crear un enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_rubrica.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error al generar la plantilla de Word:', error);
        alert('Error al generar la plantilla de Word. Por favor, intente nuevamente.');
    }
}

async function descargarPlantillaExcel() {
    try {
        // Crear un libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Crear datos de ejemplo
        const datos = [
            ['Criterio', 'Nivel 1 (1 punto)', 'Nivel 2 (2 puntos)', 'Nivel 3 (3 puntos)', 'Nivel 4 (4 puntos)'],
            ['Criterio 1', 'Descripción del nivel 1 para criterio 1', 'Descripción del nivel 2 para criterio 1', 'Descripción del nivel 3 para criterio 1', 'Descripción del nivel 4 para criterio 1'],
            ['Criterio 2', 'Descripción del nivel 1 para criterio 2', 'Descripción del nivel 2 para criterio 2', 'Descripción del nivel 3 para criterio 2', 'Descripción del nivel 4 para criterio 2']
        ];
        
        // Crear hoja de cálculo
        const ws = XLSX.utils.aoa_to_sheet(datos);
        
        // Ajustar ancho de columnas
        const wscols = [
            {wch: 20}, // Criterio
            {wch: 40}, // Nivel 1
            {wch: 40}, // Nivel 2
            {wch: 40}, // Nivel 3
            {wch: 40}  // Nivel 4
        ];
        ws['!cols'] = wscols;
        
        // Agregar hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Rúbrica");
        
        // Generar archivo y descargar
        XLSX.writeFile(wb, 'plantilla_rubrica.xlsx');
    } catch (error) {
        console.error('Error al generar la plantilla de Excel:', error);
        alert('Error al generar la plantilla de Excel. Por favor, intente nuevamente.');
    }
}

// Funciones para exportar rúbricas
async function exportarRubricaExcel() {
    try {
        const tabla = document.querySelector('.rubrica-table');
        if (!tabla) {
            alert('No hay rúbrica para exportar');
            return;
        }
        
        // Obtener datos de la tabla
        const datos = [];
        
        // Obtener encabezados (niveles)
        const headers = Array.from(tabla.querySelectorAll('thead th')).map(th => {
            const titulo = th.querySelector('.nivel-titulo-input')?.value || 'Nivel';
            const puntos = th.querySelector('.nivel-puntos')?.value || '0';
            return `${titulo} (${puntos} puntos)`;
        });
        datos.push(headers);
        
        // Obtener filas (criterios)
        const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
            const criterio = fila.querySelector('.criterio-input')?.value || 'Criterio';
            const descripciones = Array.from(fila.querySelectorAll('.nivel-descripcion')).map(td => td.value || '');
            datos.push([criterio, ...descripciones]);
        });

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datos);
        
        // Ajustar ancho de columnas
        const wscols = datos[0].map(() => ({wch: 40}));
        ws['!cols'] = wscols;
        
        // Agregar hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Rúbrica");
        
        // Generar nombre del archivo
        const nombreRubrica = document.querySelector('.rubrica-titulo')?.value || 'rubrica';
        const nombreArchivo = `${nombreRubrica.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
        
        // Descargar archivo
        XLSX.writeFile(wb, nombreArchivo);
        } catch (error) {
        console.error('Error al exportar la rúbrica a Excel:', error);
        alert('Error al exportar la rúbrica a Excel. Por favor, intente nuevamente.');
    }
}

async function exportarRubricaWord() {
    try {
        const tabla = document.querySelector('.rubrica-table');
        if (!tabla) {
            alert('No hay rúbrica para exportar');
            return;
        }

        // Obtener título de la rúbrica
        const tituloRubrica = document.querySelector('.rubrica-titulo')?.value || 'Rúbrica';
        
        // Preparar filas para la tabla
        const rows = [];
        
        // Agregar fila de encabezado
        const headerRow = {
            cells: Array.from(tabla.querySelectorAll('thead th')).map(th => {
                const titulo = th.querySelector('.nivel-titulo-input')?.value || 'Nivel';
                const puntos = th.querySelector('.nivel-puntos')?.value || '0';
                return { text: `${titulo} (${puntos} puntos)` };
            })
        };
        rows.push(headerRow);
        
        // Agregar filas de criterios
        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach(fila => {
            const criterio = fila.querySelector('.criterio-input')?.value || 'Criterio';
            const descripciones = Array.from(fila.querySelectorAll('.nivel-descripcion')).map(td => td.value || '');
            rows.push({
                cells: [
                    { text: criterio },
                    ...descripciones.map(text => ({ text }))
                ]
            });
        });

        // Crear documento de Word
        const docx = await mammoth.createDocument({
            title: tituloRubrica,
            sections: [{
                properties: {},
                children: [
                    {
                        type: "paragraph",
                        children: [{
                            type: "text",
                            text: tituloRubrica,
                            bold: true,
                            size: 24
                        }]
                    },
                    {
                        type: "table",
                        rows: rows
                    }
                ]
            }]
        });

        // Convertir el documento a blob
        const blob = await docx.save();
        
        // Generar nombre del archivo
        const nombreArchivo = `${tituloRubrica.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error al exportar la rúbrica a Word:', error);
        alert('Error al exportar la rúbrica a Word. Por favor, intente nuevamente.');
    }
}

// Función para guardar la rúbrica
function guardarRubrica() {
    try {
        const form = document.getElementById('nueva-rubrica-form');
        if (!form) {
            alert('No se encontró el formulario de rúbrica');
            return;
        }
        
        // Obtener datos básicos
        const titulo = document.getElementById('rubrica-titulo').value.trim();
        const descripcion = document.getElementById('rubrica-descripcion').value.trim();

        if (!titulo) {
            alert('Por favor, ingrese un título para la rúbrica');
            return;
        }
        
        // Obtener datos de la tabla
        const tabla = document.querySelector('.rubrica-table');
        if (!tabla) {
            alert('No se encontró la tabla de rúbrica');
            return;
        }
        
        // Obtener niveles del encabezado
        const headerCells = tabla.querySelectorAll('thead th');
        const niveles = [];
        
        // Saltar la primera celda (Criterio)
        for (let i = 1; i < headerCells.length; i++) {
            const cell = headerCells[i];
            const tituloInput = cell.querySelector('.nivel-titulo-input');
            const puntosInput = cell.querySelector('.nivel-puntos');
            
            if (tituloInput && puntosInput) {
                niveles.push({
                    nivel: tituloInput.value.trim() || `Nivel ${i}`,
                    puntos: parseInt(puntosInput.value) || i
                });
            }
        }

        // Obtener criterios de las filas
        const criterios = [];
        const bodyRows = tabla.querySelectorAll('tbody tr');
        
        bodyRows.forEach((row, index) => {
            const criterioInput = row.querySelector('.criterio-input');
            const descripcionCells = row.querySelectorAll('.nivel-descripcion');
            
            if (criterioInput) {
                const criterio = {
                    titulo: criterioInput.value.trim() || `Criterio ${index + 1}`,
                    niveles: []
                };

                descripcionCells.forEach((cell, nivelIndex) => {
                    criterio.niveles.push({
                        nivel: niveles[nivelIndex]?.nivel || `Nivel ${nivelIndex + 1}`,
                        puntos: niveles[nivelIndex]?.puntos || nivelIndex + 1,
                        descripcion: cell.value.trim() || ''
                    });
                });

                criterios.push(criterio);
            }
        });

        if (criterios.length === 0) {
            alert('La rúbrica debe tener al menos un criterio');
            return;
        }

        // Crear objeto de rúbrica
        const rubrica = {
            id: currentRubricaId || generarId(),
            titulo: titulo,
            descripcion: descripcion,
            criterios: criterios,
            fechaCreacion: currentRubricaId ? (rubricaActual?.fechaCreacion || new Date().toISOString()) : new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        };

        // Guardar en localStorage
        let rubricasGuardadas = JSON.parse(localStorage.getItem('rubricasGuardadas') || '[]');
        
        // Si es una rúbrica existente, actualizarla
        if (currentRubricaId) {
            const index = rubricasGuardadas.findIndex(r => r.id === currentRubricaId);
            if (index !== -1) {
                rubricasGuardadas[index] = rubrica;
            } else {
                rubricasGuardadas.push(rubrica);
            }
        } else {
            rubricasGuardadas.push(rubrica);
        }

        localStorage.setItem('rubricasGuardadas', JSON.stringify(rubricasGuardadas));
        
        // Actualizar variables globales
        rubricaActual = rubrica;
        currentRubricaId = rubrica.id;

        // Actualizar selector de rúbricas en modo evaluación
        cargarRubricasEvaluacion();

        alert('Rúbrica guardada exitosamente');
        console.log('Rúbrica guardada:', rubrica);

    } catch (error) {
        console.error('Error al guardar la rúbrica:', error);
        alert('Error al guardar la rúbrica. Por favor, intente nuevamente.');
    }
}

// Función para actualizar las rúbricas en modo evaluación cuando se guarde una nueva
function actualizarRubricasEvaluacion() {
    if (modoActual === 'evaluacion') {
        cargarRubricasEvaluacion();
        verificarDatosEvaluacion();
    }
}

// Función para mostrar rúbrica en modo solo lectura
function mostrarRubricaEnModoLectura(rubrica) {
    if (!rubricaContent || !rubrica) return;

    // Generar contenido de la tabla en modo lectura
    let headerContent = '<th>Criterio</th>';
    let bodyContent = '';

    if (rubrica.criterios && rubrica.criterios.length > 0) {
        const primeraFila = rubrica.criterios[0];
        if (primeraFila.niveles) {
            headerContent += primeraFila.niveles.map(nivel => `
                <th>
                    <div class="nivel-header-readonly">
                        <div class="nivel-info">
                            <span class="nivel-titulo">${nivel.nivel}</span>
                            <span class="nivel-puntos">${nivel.puntos} puntos</span>
                        </div>
                    </div>
                </th>
            `).join('');
        }

        bodyContent = rubrica.criterios.map(criterio => `
            <tr>
                <td>
                    <div class="criterio-container-readonly">
                        <span class="criterio-titulo">${criterio.titulo}</span>
                    </div>
                </td>
                ${criterio.niveles.map(nivel => `
                    <td>
                        <div class="nivel-descripcion-readonly">${nivel.descripcion}</div>
                    </td>
                `).join('')}
            </tr>
        `).join('');
    }

    rubricaContent.innerHTML = `
        <div class="rubrica-readonly">
            <div class="rubrica-header">
                <h3>${rubrica.titulo}</h3>
                <p class="rubrica-descripcion">${rubrica.descripcion || ''}</p>
                <div class="rubrica-info">
                    <span class="rubrica-fecha">Creada: ${new Date(rubrica.fechaCreacion).toLocaleDateString()}</span>
                    ${rubrica.fechaModificacion !== rubrica.fechaCreacion ? 
                        `<span class="rubrica-fecha">Modificada: ${new Date(rubrica.fechaModificacion).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="rubrica-container">
                <div class="rubrica-table-container">
                    <div class="rubrica-table-wrapper">
                        <table class="rubrica-table rubrica-table-readonly">
                            <thead>
                                <tr>
                                    ${headerContent}
                                </tr>
                            </thead>
                            <tbody>
                                ${bodyContent}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="rubrica-actions-readonly">
                <button type="button" id="cerrar-vista-rubrica" class="btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cerrar
                </button>
                <button type="button" id="editar-rubrica-desde-evaluacion" class="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                </button>
            </div>
        </div>
    `;

    // Agregar event listeners para los botones
    const cerrarBtn = document.getElementById('cerrar-vista-rubrica');
    const editarBtn = document.getElementById('editar-rubrica-desde-evaluacion');

    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', function() {
            // Ocultar el contenedor de rúbrica
            if (rubricaContent) rubricaContent.style.display = 'none';
        });
    }

    if (editarBtn) {
        editarBtn.addEventListener('click', function() {
            // Cambiar a modo edición
            cambiarModo('normal');
            // Mostrar la rúbrica para edición
            mostrarRubrica(rubrica);
        });
    }
}