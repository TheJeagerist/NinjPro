// Variables globales
let cursosDisponibles = [];
let rubricasDisponibles = [];
let estudiantesDelCurso = [];
let conjuntosGruposDisponibles = [];
let gruposDisponibles = [];
let evaluacionActual = null;
let rubricaActual = null;
let estudianteActual = null;
let conjuntoGruposActual = null;
let grupoActual = null;
let grupoActualIndex = 0; // Índice del grupo actual para navegación
let cursoActual = null;
let modoEvaluacion = 'individual'; // 'individual' o 'grupo'

// Elementos del DOM
let elements = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    inicializarEventListeners();
    cargarDatosIniciales();
    inicializarSistemaTemas();
});

// Función para inicializar elementos del DOM
function inicializarElementos() {
    elements = {
        // Selectors
        cursoSelect: document.getElementById('eval-curso-select'),
        rubricaSelect: document.getElementById('eval-rubrica-select'),
        modeSelect: document.getElementById('eval-mode-select'),
        estudianteSelect: document.getElementById('eval-estudiante-select'),
        conjuntoSelect: document.getElementById('eval-conjunto-select'),
        grupoSelect: document.getElementById('eval-grupo-select'),
        
        // Buttons
        iniciarEvaluacionBtn: document.getElementById('iniciar-evaluacion'),
        verRubricaBtn: document.getElementById('ver-rubrica'),
        exportarCursoPdfBtn: document.getElementById('exportar-curso-pdf'),
        guardarEvaluacionBtn: document.getElementById('guardar-evaluacion'),
        siguienteEstudianteBtn: document.getElementById('siguiente-estudiante'),
        siguienteGrupoBtn: document.getElementById('siguiente-grupo'),
        limpiarEvaluacionBtn: document.getElementById('limpiar-evaluacion'),
        finalizarEvaluacionBtn: document.getElementById('finalizar-evaluacion'),
        closeSidebarBtn: document.getElementById('close-sidebar'),
        closeModalBtn: document.getElementById('close-modal'),
        
        // Areas
        evaluationArea: document.getElementById('evaluation-area'),
        studentsSidebar: document.getElementById('students-sidebar'),
        rubricaModal: document.getElementById('rubrica-modal'),
        
        // Student/Group info
        studentName: document.getElementById('student-name'),
        groupInfo: document.getElementById('group-info'),
        groupName: document.getElementById('group-name'),
        groupMembers: document.getElementById('group-members'),
        studentCourse: document.getElementById('student-course'),
        rubricaTitle: document.getElementById('rubrica-title'),
        
        // Evaluation
        evaluationTable: document.getElementById('evaluation-table'),
        
        // Results
        totalScore: document.getElementById('total-score'),
        maxScore: document.getElementById('max-score'),
        percentageScore: document.getElementById('percentage-score'),
        finalGrade: document.getElementById('final-grade'),
        progressFill: document.getElementById('progress-fill'),
        evaluationComments: document.getElementById('evaluation-comments'),
        
        // Status
        evaluationStatus: document.getElementById('evaluation-status'),
        
        // Lists
        studentsList: document.getElementById('students-list'),
        studentsSearch: document.getElementById('students-search'),
        
        // Preview
        rubricaPreview: document.getElementById('rubrica-preview')
    };
}

// Función para inicializar event listeners
function inicializarEventListeners() {
    // Navigation
    const volverLauncherBtn = document.getElementById('volver-launcher');
    volverLauncherBtn?.addEventListener('click', volverAlLauncher);
    
    // Selectors
    elements.cursoSelect?.addEventListener('change', manejarCambioCurso);
    elements.rubricaSelect?.addEventListener('change', manejarCambioRubrica);
    elements.modeSelect?.addEventListener('change', manejarCambioModo);
    elements.estudianteSelect?.addEventListener('change', manejarCambioEstudiante);
    elements.conjuntoSelect?.addEventListener('change', manejarCambioConjunto);
    elements.grupoSelect?.addEventListener('change', manejarCambioGrupo);
    
    // Buttons
    elements.iniciarEvaluacionBtn?.addEventListener('click', iniciarEvaluacion);
    elements.verRubricaBtn?.addEventListener('click', mostrarVistaRubrica);
    elements.exportarCursoPdfBtn?.addEventListener('click', exportarCursoPDF);
    elements.guardarEvaluacionBtn?.addEventListener('click', guardarEvaluacion);
    elements.siguienteEstudianteBtn?.addEventListener('click', siguienteEstudiante);
    elements.siguienteGrupoBtn?.addEventListener('click', siguienteGrupo);
    elements.limpiarEvaluacionBtn?.addEventListener('click', limpiarEvaluacion);
    elements.finalizarEvaluacionBtn?.addEventListener('click', finalizarEvaluacion);
    elements.closeSidebarBtn?.addEventListener('click', cerrarSidebar);
    elements.closeModalBtn?.addEventListener('click', cerrarModal);
    
    // Search
    elements.studentsSearch?.addEventListener('input', filtrarEstudiantes);
    
    // Modal clicks
    elements.rubricaModal?.addEventListener('click', (e) => {
        if (e.target === elements.rubricaModal) {
            cerrarModal();
        }
    });
}

// Función para cargar datos iniciales
function cargarDatosIniciales() {
    cargarCursos();
    cargarRubricas();
    
    // Listener para detectar cambios en los cursos desde gestión de estudiantes
    window.addEventListener('cursosActualizados', function(event) {
        console.log('Cursos actualizados detectados, recargando...');
        cargarCursos();
    });
    
    // También detectar cambios en localStorage
    window.addEventListener('storage', function(event) {
        if (event.key === 'cursosData') {
            console.log('Cambios en cursosData detectados, recargando...');
            cargarCursos();
        }
        if (event.key === 'rubricas') {
            console.log('Cambios en rúbricas detectados, recargando...');
            cargarRubricas();
        }
    });
}

// Función para cargar cursos
function cargarCursos() {
    try {
        // Cargar cursos desde localStorage (compartido con gestión de estudiantes)
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        
        // Convertir cursosData a formato esperado
        cursosDisponibles = [];
        Object.keys(cursosData).forEach(nombreCurso => {
            cursosDisponibles.push({
                nombre: nombreCurso,
                estudiantes: cursosData[nombreCurso] || []
            });
        });
        
        // Limpiar y llenar selector de cursos
        elements.cursoSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        cursosDisponibles.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.nombre;
            option.textContent = `${curso.nombre} (${curso.estudiantes.length} estudiantes)`;
            elements.cursoSelect.appendChild(option);
        });
        
        if (cursosDisponibles.length === 0) {
            mostrarMensaje('No hay cursos disponibles. Cargue cursos desde la gestión de estudiantes.', 'warning');
        }
        
        console.log('Cursos cargados:', cursosDisponibles);
        
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarMensaje('Error al cargar cursos', 'error');
    }
}

// Función para cargar rúbricas
function cargarRubricas() {
    try {
        // Cargar rúbricas desde localStorage
        const rubricasGuardadas = JSON.parse(localStorage.getItem('rubricas') || '[]');
        rubricasDisponibles = rubricasGuardadas;
        
        // Limpiar y llenar selector de rúbricas
        elements.rubricaSelect.innerHTML = '<option value="">Seleccionar rúbrica...</option>';
        
        rubricasDisponibles.forEach(rubrica => {
            const option = document.createElement('option');
            option.value = rubrica.id;
            option.textContent = `${rubrica.titulo} (${rubrica.criterios.length} criterios)`;
            elements.rubricaSelect.appendChild(option);
        });
        
        if (rubricasDisponibles.length === 0) {
            mostrarMensaje('No hay rúbricas disponibles. Cree rúbricas desde el creador de rúbricas.', 'warning');
        }
        
    } catch (error) {
        console.error('Error al cargar rúbricas:', error);
        mostrarMensaje('Error al cargar rúbricas', 'error');
    }
}

// Función para manejar cambio de curso
function manejarCambioCurso() {
    const cursoNombre = elements.cursoSelect.value;
    
    if (!cursoNombre) {
        elements.estudianteSelect.disabled = true;
        elements.estudianteSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
        elements.grupoSelect.disabled = true;
        elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
        estudiantesDelCurso = [];
        gruposDisponibles = [];
        cursoActual = null;
        verificarDatosCompletos();
        return;
    }
    
    // Encontrar curso seleccionado
    cursoActual = cursosDisponibles.find(c => c.nombre === cursoNombre);
    
    if (cursoActual) {
        estudiantesDelCurso = cursoActual.estudiantes || [];
        
        // Llenar selector de estudiantes
        elements.estudianteSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
        estudiantesDelCurso.forEach((estudiante, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = estudiante.nombre;
            elements.estudianteSelect.appendChild(option);
        });
        
        elements.estudianteSelect.disabled = false;
        
        // Cargar grupos si el modo es grupal
        if (modoEvaluacion === 'grupo') {
            cargarGruposDelCurso();
        }
    }
    
    verificarDatosCompletos();
}

// Función para manejar cambio de rúbrica
function manejarCambioRubrica() {
    const rubricaId = elements.rubricaSelect.value;
    
    if (!rubricaId) {
        rubricaActual = null;
        elements.verRubricaBtn.disabled = true;
        verificarDatosCompletos();
        return;
    }
    
    // Encontrar rúbrica seleccionada
    rubricaActual = rubricasDisponibles.find(r => r.id === rubricaId);
    elements.verRubricaBtn.disabled = false;
    
    verificarDatosCompletos();
}

// Función para manejar cambio de modo de evaluación
function manejarCambioModo() {
    modoEvaluacion = elements.modeSelect.value;
    
    const estudianteGroup = document.getElementById('estudiante-group');
    const grupoGroup = document.getElementById('grupo-group');
    const grupoEspecificoGroup = document.getElementById('grupo-especifico-group');
    
    if (modoEvaluacion === 'grupo') {
        estudianteGroup.style.display = 'none';
        grupoGroup.style.display = 'block';
        grupoEspecificoGroup.style.display = 'block';
        elements.estudianteSelect.disabled = true;
        
        // Cargar conjuntos de grupos si hay un curso seleccionado
        if (cursoActual) {
            cargarConjuntosGruposDelCurso();
        }
    } else {
        estudianteGroup.style.display = 'block';
        grupoGroup.style.display = 'none';
        grupoEspecificoGroup.style.display = 'none';
        elements.conjuntoSelect.disabled = true;
        elements.grupoSelect.disabled = true;
        
        // Rehabilitar selector de estudiantes si hay curso
        if (cursoActual) {
            elements.estudianteSelect.disabled = false;
        }
    }
    
    verificarDatosCompletos();
}

// Función para manejar cambio de estudiante
function manejarCambioEstudiante() {
    const estudianteIndex = elements.estudianteSelect.value;
    
    if (estudianteIndex === '') {
        estudianteActual = null;
        verificarDatosCompletos();
        return;
    }
    
    estudianteActual = estudiantesDelCurso[parseInt(estudianteIndex)];
    verificarDatosCompletos();
}

// Función para manejar cambio de grupo específico
function manejarCambioGrupo() {
    const grupoIndex = elements.grupoSelect.value;
    
    if (grupoIndex !== '' && conjuntoGruposActual) {
        grupoActualIndex = parseInt(grupoIndex);
        grupoActual = conjuntoGruposActual.groups[grupoActualIndex];
    } else {
        grupoActual = null;
        grupoActualIndex = 0;
    }
    
    verificarDatosCompletos();
}

// Función para cargar conjuntos de grupos del curso seleccionado
function cargarConjuntosGruposDelCurso() {
    if (!cursoActual) {
        elements.conjuntoSelect.disabled = true;
        elements.conjuntoSelect.innerHTML = '<option value="">Seleccionar conjunto...</option>';
        elements.grupoSelect.disabled = true;
        elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
        return;
    }
    
    try {
        // Cargar grupos guardados desde localStorage
        const savedGroups = JSON.parse(localStorage.getItem('savedGroups') || '[]');
        
        // Filtrar conjuntos de grupos que pertenezcan al curso actual
        conjuntosGruposDisponibles = savedGroups.filter(savedGroup => 
            savedGroup.course === cursoActual.nombre
        ).map(savedGroup => ({
            id: savedGroup.id,
            name: savedGroup.name,
            description: savedGroup.description,
            course: savedGroup.course,
            groups: savedGroup.groups,
            createdAt: savedGroup.createdAt
        }));
        
        // Limpiar y llenar selector de conjuntos
        elements.conjuntoSelect.innerHTML = '<option value="">Seleccionar conjunto...</option>';
        
        if (conjuntosGruposDisponibles.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay conjuntos de grupos disponibles para este curso';
            option.disabled = true;
            elements.conjuntoSelect.appendChild(option);
            elements.conjuntoSelect.disabled = true;
            mostrarMensaje(`No hay grupos guardados para el curso "${cursoActual.nombre}". Cree grupos desde la aplicación Grupos Aleatorios.`, 'warning');
        } else {
            conjuntosGruposDisponibles.forEach(conjunto => {
                const option = document.createElement('option');
                option.value = conjunto.id;
                const totalStudents = conjunto.groups.reduce((total, g) => total + g.students.length, 0);
                option.textContent = `${conjunto.name} (${conjunto.groups.length} grupos, ${totalStudents} estudiantes)`;
                elements.conjuntoSelect.appendChild(option);
            });
            elements.conjuntoSelect.disabled = false;
        }
        
        // Limpiar selector de grupos específicos
        elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
        elements.grupoSelect.disabled = true;
        
        console.log('Conjuntos de grupos cargados para el curso:', conjuntosGruposDisponibles);
        
    } catch (error) {
        console.error('Error al cargar conjuntos de grupos:', error);
        mostrarMensaje('Error al cargar conjuntos de grupos del curso', 'error');
        elements.conjuntoSelect.disabled = true;
        elements.grupoSelect.disabled = true;
    }
}

// Función para manejar cambio de conjunto de grupos
function manejarCambioConjunto() {
    const conjuntoId = elements.conjuntoSelect.value;
    
    if (!conjuntoId) {
        conjuntoGruposActual = null;
        gruposDisponibles = [];
        elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
        elements.grupoSelect.disabled = true;
        verificarDatosCompletos();
        return;
    }
    
    // Encontrar conjunto seleccionado
    conjuntoGruposActual = conjuntosGruposDisponibles.find(conjunto => conjunto.id === conjuntoId);
    
    if (conjuntoGruposActual) {
        // Cargar grupos específicos del conjunto
        cargarGruposEspecificos();
    }
    
    verificarDatosCompletos();
}

// Función para cargar grupos específicos del conjunto seleccionado
function cargarGruposEspecificos() {
    if (!conjuntoGruposActual) {
        elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
        elements.grupoSelect.disabled = true;
        return;
    }
    
    // Limpiar y llenar selector de grupos específicos
    elements.grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
    
    conjuntoGruposActual.groups.forEach((grupo, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${grupo.name} (${grupo.students.length} estudiantes)`;
        elements.grupoSelect.appendChild(option);
    });
    
    elements.grupoSelect.disabled = false;
    grupoActual = null; // Limpiar selección anterior
}

// Función para verificar si todos los datos están completos
function verificarDatosCompletos() {
    let datosCompletos = false;
    
    if (modoEvaluacion === 'grupo') {
        datosCompletos = cursoActual && rubricaActual && conjuntoGruposActual && grupoActual;
    } else {
        datosCompletos = cursoActual && rubricaActual && estudianteActual;
    }
    
    elements.iniciarEvaluacionBtn.disabled = !datosCompletos;
    elements.exportarCursoPdfBtn.disabled = !cursoActual || !rubricaActual;
}

// Función para iniciar evaluación
function iniciarEvaluacion() {
    if (modoEvaluacion === 'grupo') {
        if (!cursoActual || !rubricaActual || !conjuntoGruposActual || !grupoActual) {
            mostrarMensaje('Seleccione curso, rúbrica, conjunto de grupos y grupo específico', 'warning');
            return;
        }
        iniciarEvaluacionGrupal();
    } else {
        if (!cursoActual || !rubricaActual || !estudianteActual) {
            mostrarMensaje('Seleccione curso, rúbrica y estudiante', 'warning');
            return;
        }
        iniciarEvaluacionIndividual();
    }
}

// Función para iniciar evaluación individual
function iniciarEvaluacionIndividual() {
    // Crear nueva evaluación
    evaluacionActual = {
        id: generarId(),
        tipo: 'individual',
        curso: cursoActual.nombre,
        estudiante: estudianteActual.nombre,
        rubrica: rubricaActual.id,
        rubricaTitulo: rubricaActual.titulo,
        criterios: {},
        puntajeTotal: 0,
        puntajeMaximo: 0,
        porcentaje: 0,
        nota: 0,
        fecha: new Date().toISOString(),
        completada: false
    };
    
    // Ocultar botones de navegación
    elements.siguienteEstudianteBtn.style.display = 'none';
    elements.siguienteGrupoBtn.style.display = 'none';
    
    // Mostrar área de evaluación
    elements.evaluationArea.style.display = 'block';
    
    // Mostrar información del estudiante, ocultar información del grupo
    elements.studentName.style.display = 'block';
    elements.groupInfo.style.display = 'none';
    
    // Actualizar información del estudiante
    elements.studentName.textContent = estudianteActual.nombre;
    elements.studentCourse.textContent = cursoActual.nombre;
    elements.rubricaTitle.textContent = rubricaActual.titulo;
    
    // Generar tabla de evaluación
    generarTablaEvaluacion();
    
    // Actualizar estado
    actualizarEstadoEvaluacion();
    
    // Scroll hacia el área de evaluación
    elements.evaluationArea.scrollIntoView({ behavior: 'smooth' });
    
    mostrarMensaje('Evaluación individual iniciada', 'success');
}

// Función para iniciar evaluación grupal
function iniciarEvaluacionGrupal() {
    // Crear nueva evaluación grupal
    evaluacionActual = {
        id: generarId(),
        tipo: 'grupo',
        curso: cursoActual.nombre,
        conjunto: {
            id: conjuntoGruposActual.id,
            name: conjuntoGruposActual.name,
            description: conjuntoGruposActual.description
        },
        grupo: {
            name: grupoActual.name,
            students: grupoActual.students
        },
        estudiantes: [],
        rubrica: rubricaActual.id,
        rubricaTitulo: rubricaActual.titulo,
        criterios: {},
        puntajeTotal: 0,
        puntajeMaximo: 0,
        porcentaje: 0,
        nota: 0,
        fecha: new Date().toISOString(),
        completada: false
    };
    
    // Ocultar botones de navegación
    elements.siguienteEstudianteBtn.style.display = 'none';
    elements.siguienteGrupoBtn.style.display = 'none';
    
    // Recopilar todos los estudiantes del grupo específico
    grupoActual.students.forEach(student => {
        const studentName = student.nombre || student.name || student;
        if (!evaluacionActual.estudiantes.includes(studentName)) {
            evaluacionActual.estudiantes.push(studentName);
        }
    });
    
    // Mostrar área de evaluación
    elements.evaluationArea.style.display = 'block';
    
    // Ocultar información del estudiante, mostrar información del grupo
    elements.studentName.style.display = 'none';
    elements.groupInfo.style.display = 'block';
    
    // Actualizar información del grupo
    elements.groupName.textContent = grupoActual.name;
    elements.studentCourse.textContent = cursoActual.nombre;
    elements.rubricaTitle.textContent = rubricaActual.titulo;
    
    // Mostrar miembros del grupo
    mostrarMiembrosGrupo();
    
    // Generar tabla de evaluación
    generarTablaEvaluacion();
    
    // Actualizar estado
    actualizarEstadoEvaluacion();
    
    // Scroll hacia el área de evaluación
    elements.evaluationArea.scrollIntoView({ behavior: 'smooth' });
    
    mostrarMensaje(`Evaluación grupal iniciada para "${grupoActual.name}" (${evaluacionActual.estudiantes.length} estudiantes)`, 'success');
}

// Función para mostrar miembros del grupo
function mostrarMiembrosGrupo() {
    if (!grupoActual || !elements.groupMembers) return;
    
    elements.groupMembers.innerHTML = '';
    
    // Mostrar solo los estudiantes del grupo específico seleccionado
    grupoActual.students.forEach((student, studentIndex) => {
        const studentName = student.nombre || student.name || student;
        const studentEmail = student.email || student.correo || '';
        
        const memberDiv = document.createElement('div');
        memberDiv.className = 'group-member';
        
        // Generar iniciales para el avatar
        const initials = studentName.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
        
        memberDiv.innerHTML = `
            <div class="member-avatar">${initials}</div>
            <div class="member-info">
                <div class="member-name">${studentName}</div>
                ${studentEmail ? `<div class="member-email">${studentEmail}</div>` : ''}
            </div>
            <div class="member-status pending">Pendiente</div>
        `;
        
        elements.groupMembers.appendChild(memberDiv);
    });
    
    // Agregar indicador de evaluación grupal
    const indicator = document.createElement('div');
    indicator.className = 'group-evaluation-indicator';
    indicator.textContent = 'La evaluación se aplicará a todos los miembros del grupo';
    elements.groupMembers.appendChild(indicator);
}

// Función para generar tabla de evaluación
function generarTablaEvaluacion() {
    if (!rubricaActual || !rubricaActual.criterios) return;
    
    const table = elements.evaluationTable;
    table.innerHTML = '';
    
    // Obtener niveles únicos
    const nivelesUnicos = [];
    rubricaActual.criterios.forEach(criterio => {
        criterio.niveles.forEach(nivel => {
            if (!nivelesUnicos.find(n => n.nivel === nivel.nivel)) {
                nivelesUnicos.push({
                    nivel: nivel.nivel,
                    puntos: nivel.puntos
                });
            }
        });
    });
    
    // Ordenar niveles por puntos (descendente)
    nivelesUnicos.sort((a, b) => b.puntos - a.puntos);
    
    // Crear header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Header de criterios
    const criterioTh = document.createElement('th');
    criterioTh.className = 'criterio-header';
    criterioTh.textContent = 'Criterios';
    headerRow.appendChild(criterioTh);
    
    // Headers de niveles
    nivelesUnicos.forEach(nivel => {
        const th = document.createElement('th');
        th.className = 'nivel-header';
        th.innerHTML = `
            <div class="nivel-title">${nivel.nivel}</div>
            <div class="nivel-points">${nivel.puntos} pts</div>
        `;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Crear body
    const tbody = document.createElement('tbody');
    
    rubricaActual.criterios.forEach((criterio, criterioIndex) => {
        const row = document.createElement('tr');
        
        // Celda del criterio
        const criterioTd = document.createElement('td');
        criterioTd.className = 'criterio-cell';
        criterioTd.textContent = criterio.titulo;
        row.appendChild(criterioTd);
        
        // Celdas de niveles
        nivelesUnicos.forEach((nivelUnico, nivelIndex) => {
            const td = document.createElement('td');
            td.className = 'nivel-cell';
            
            // Encontrar descripción para este nivel en este criterio
            const nivelCriterio = criterio.niveles.find(n => n.nivel === nivelUnico.nivel);
            const descripcion = nivelCriterio ? nivelCriterio.descripcion : '';
            
            td.innerHTML = `
                <input type="radio" name="criterio-${criterioIndex}" value="${nivelIndex}" class="nivel-radio" data-puntos="${nivelUnico.puntos}">
                <div class="nivel-descripcion">${descripcion}</div>
            `;
            
            // Event listener para selección
            const radio = td.querySelector('.nivel-radio');
            radio.addEventListener('change', () => manejarSeleccionNivel(criterioIndex, nivelIndex, nivelUnico.puntos));
            
            // Event listener para click en celda
            td.addEventListener('click', (e) => {
                if (e.target !== radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            });
            
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Calcular puntaje máximo
    evaluacionActual.puntajeMaximo = rubricaActual.criterios.length * Math.max(...nivelesUnicos.map(n => n.puntos));
    actualizarResultados();
}

// Función para manejar selección de nivel
function manejarSeleccionNivel(criterioIndex, nivelIndex, puntos) {
    if (!evaluacionActual) return;
    
    // Guardar selección
    evaluacionActual.criterios[criterioIndex] = {
        nivelIndex: nivelIndex,
        puntos: puntos
    };
    
    // Actualizar estilos visuales
    const row = elements.evaluationTable.querySelectorAll('tbody tr')[criterioIndex];
    const celdas = row.querySelectorAll('.nivel-cell');
    
    celdas.forEach((celda, index) => {
        celda.classList.toggle('selected', index === nivelIndex);
    });
    
    // Calcular puntaje total
    evaluacionActual.puntajeTotal = Object.values(evaluacionActual.criterios)
        .reduce((total, criterio) => total + criterio.puntos, 0);
    
    actualizarResultados();
}

// Función para actualizar resultados
function actualizarResultados() {
    if (!evaluacionActual) return;
    
    const { puntajeTotal, puntajeMaximo } = evaluacionActual;
    const porcentaje = puntajeMaximo > 0 ? (puntajeTotal / puntajeMaximo) * 100 : 0;
    const nota = (porcentaje / 100) * 7; // Escala 1-7
    
    evaluacionActual.porcentaje = porcentaje;
    evaluacionActual.nota = nota;
    
    // Actualizar UI
    elements.totalScore.textContent = puntajeTotal;
    elements.maxScore.textContent = puntajeMaximo;
    elements.percentageScore.textContent = `${porcentaje.toFixed(1)}%`;
    elements.finalGrade.textContent = nota.toFixed(1);
    elements.progressFill.style.width = `${porcentaje}%`;
    
    // Cambiar color de la nota según el rendimiento
    const gradeElement = elements.finalGrade;
    gradeElement.className = 'score-value grade';
    
    if (nota >= 6.0) {
        gradeElement.style.color = 'var(--success-color)';
    } else if (nota >= 4.0) {
        gradeElement.style.color = 'var(--warning-color)';
    } else {
        gradeElement.style.color = 'var(--danger-color)';
    }
}

// Función para guardar evaluación
function guardarEvaluacion() {
    if (!evaluacionActual) return;
    
    try {
        // Verificar que todos los criterios estén evaluados
        const criteriosEvaluados = Object.keys(evaluacionActual.criterios).length;
        const totalCriterios = rubricaActual.criterios.length;
        
        if (criteriosEvaluados < totalCriterios) {
            mostrarMensaje(`Faltan ${totalCriterios - criteriosEvaluados} criterios por evaluar`, 'warning');
            return;
        }
        
        evaluacionActual.completada = true;
        evaluacionActual.fechaCompletada = new Date().toISOString();
        evaluacionActual.comentarios = elements.evaluationComments.value.trim();
        
        if (evaluacionActual.tipo === 'grupo') {
            guardarEvaluacionGrupal();
        } else {
            guardarEvaluacionIndividual();
        }
        
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        mostrarMensaje('Error al guardar evaluación', 'error');
    }
}

// Función para guardar evaluación individual
function guardarEvaluacionIndividual() {
    // Guardar en localStorage
    let evaluaciones = JSON.parse(localStorage.getItem('evaluaciones') || '[]');
    
    // Verificar si ya existe una evaluación para este estudiante y rúbrica
    const existingIndex = evaluaciones.findIndex(e => 
        e.curso === evaluacionActual.curso && 
        e.estudiante === evaluacionActual.estudiante && 
        e.rubrica === evaluacionActual.rubrica
    );
    
    if (existingIndex >= 0) {
        if (confirm('Ya existe una evaluación para este estudiante. ¿Desea sobrescribirla?')) {
            evaluaciones[existingIndex] = evaluacionActual;
        } else {
            return;
        }
    } else {
        evaluaciones.push(evaluacionActual);
    }
    
    localStorage.setItem('evaluaciones', JSON.stringify(evaluaciones));
    
    mostrarMensaje('Evaluación guardada exitosamente', 'success');
    
    // Mostrar botón de siguiente estudiante si hay más estudiantes
    const estudianteIndex = estudiantesDelCurso.findIndex(e => e.nombre === estudianteActual.nombre);
    if (estudianteIndex < estudiantesDelCurso.length - 1) {
        elements.siguienteEstudianteBtn.style.display = 'inline-flex';
    }
}

// Función para guardar evaluación grupal
function guardarEvaluacionGrupal() {
    let evaluaciones = JSON.parse(localStorage.getItem('evaluaciones') || '[]');
    
    // Crear una evaluación individual para cada estudiante del grupo con la misma nota
    const evaluacionesGrupales = [];
    let evaluacionesExistentes = [];
    
    evaluacionActual.estudiantes.forEach(estudianteNombre => {
        // Verificar si ya existe una evaluación para este estudiante y rúbrica
        const existingIndex = evaluaciones.findIndex(e => 
            e.curso === evaluacionActual.curso && 
            e.estudiante === estudianteNombre && 
            e.rubrica === evaluacionActual.rubrica
        );
        
        if (existingIndex >= 0) {
            evaluacionesExistentes.push(estudianteNombre);
        }
        
        // Crear evaluación individual basada en la evaluación grupal
        const evaluacionIndividual = {
            id: generarId(),
            tipo: 'individual',
            origenGrupal: true,
            grupoOriginal: {
                id: evaluacionActual.grupo.id,
                name: evaluacionActual.grupo.name
            },
            curso: evaluacionActual.curso,
            estudiante: estudianteNombre,
            rubrica: evaluacionActual.rubrica,
            rubricaTitulo: evaluacionActual.rubricaTitulo,
            criterios: { ...evaluacionActual.criterios },
            puntajeTotal: evaluacionActual.puntajeTotal,
            puntajeMaximo: evaluacionActual.puntajeMaximo,
            porcentaje: evaluacionActual.porcentaje,
            nota: evaluacionActual.nota,
            fecha: evaluacionActual.fecha,
            fechaCompletada: evaluacionActual.fechaCompletada,
            comentarios: evaluacionActual.comentarios,
            completada: true
        };
        
        evaluacionesGrupales.push(evaluacionIndividual);
    });
    
    // Confirmar sobrescritura si hay evaluaciones existentes
    if (evaluacionesExistentes.length > 0) {
        const mensaje = `Ya existen evaluaciones para ${evaluacionesExistentes.length} estudiante(s): ${evaluacionesExistentes.join(', ')}. ¿Desea sobrescribirlas?`;
        if (!confirm(mensaje)) {
            return;
        }
    }
    
    // Guardar todas las evaluaciones
    evaluacionesGrupales.forEach(evaluacionIndividual => {
        const existingIndex = evaluaciones.findIndex(e => 
            e.curso === evaluacionIndividual.curso && 
            e.estudiante === evaluacionIndividual.estudiante && 
            e.rubrica === evaluacionIndividual.rubrica
        );
        
        if (existingIndex >= 0) {
            evaluaciones[existingIndex] = evaluacionIndividual;
        } else {
            evaluaciones.push(evaluacionIndividual);
        }
    });
    
    localStorage.setItem('evaluaciones', JSON.stringify(evaluaciones));
    
    // Actualizar estado visual de los miembros
    const memberElements = elements.groupMembers.querySelectorAll('.group-member');
    memberElements.forEach(memberEl => {
        const statusEl = memberEl.querySelector('.member-status');
        if (statusEl) {
            statusEl.textContent = 'Evaluado';
            statusEl.className = 'member-status evaluated';
        }
    });
    
    mostrarMensaje(`Evaluación grupal guardada exitosamente para ${evaluacionActual.estudiantes.length} estudiantes`, 'success');
    
    // Mostrar botón siguiente grupo si hay más grupos
    if (conjuntoGruposActual && grupoActualIndex < conjuntoGruposActual.groups.length - 1) {
        elements.siguienteGrupoBtn.style.display = 'inline-flex';
    }
    
    // Mostrar resumen de evaluación grupal
    mostrarResumenEvaluacionGrupal();
}

// Función para mostrar resumen de evaluación grupal
function mostrarResumenEvaluacionGrupal() {
    if (!evaluacionActual || evaluacionActual.tipo !== 'grupo') return;
    
    // Crear elemento de resumen si no existe
    let summaryElement = document.querySelector('.group-evaluation-summary');
    if (!summaryElement) {
        summaryElement = document.createElement('div');
        summaryElement.className = 'group-evaluation-summary';
        elements.groupMembers.appendChild(summaryElement);
    }
    
    summaryElement.innerHTML = `
        <h4>Resumen de Evaluación Grupal</h4>
        <div class="group-summary-grid">
            <div class="summary-item">
                <div class="summary-label">Estudiantes Evaluados</div>
                <div class="summary-value">${evaluacionActual.estudiantes.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Puntaje Obtenido</div>
                <div class="summary-value">${evaluacionActual.puntajeTotal}/${evaluacionActual.puntajeMaximo}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Porcentaje</div>
                <div class="summary-value">${evaluacionActual.porcentaje.toFixed(1)}%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Nota Final</div>
                <div class="summary-value">${evaluacionActual.nota.toFixed(1)}</div>
            </div>
        </div>
    `;
}

// Función para ir al siguiente estudiante
function siguienteEstudiante() {
    const estudianteIndex = estudiantesDelCurso.findIndex(e => e.nombre === estudianteActual.nombre);
    
    if (estudianteIndex < estudiantesDelCurso.length - 1) {
        // Seleccionar siguiente estudiante
        const siguienteIndex = estudianteIndex + 1;
        elements.estudianteSelect.value = siguienteIndex;
        manejarCambioEstudiante();
        
        // Iniciar nueva evaluación
        iniciarEvaluacion();
        
        elements.siguienteEstudianteBtn.style.display = 'none';
    } else {
        mostrarMensaje('No hay más estudiantes en el curso', 'info');
    }
}

// Función para ir al siguiente grupo
function siguienteGrupo() {
    if (!conjuntoGruposActual || !conjuntoGruposActual.groups.length) {
        mostrarMensaje('No hay grupos disponibles', 'warning');
        return;
    }
    
    if (grupoActualIndex < conjuntoGruposActual.groups.length - 1) {
        // Seleccionar siguiente grupo
        grupoActualIndex = grupoActualIndex + 1;
        grupoActual = conjuntoGruposActual.groups[grupoActualIndex];
        
        // Actualizar selector
        elements.grupoSelect.value = grupoActualIndex.toString();
        
        // Iniciar nueva evaluación grupal
        iniciarEvaluacion();
        
        elements.siguienteGrupoBtn.style.display = 'none';
        
        mostrarMensaje(`Evaluando grupo: ${grupoActual.name}`, 'info');
    } else {
        mostrarMensaje('No hay más grupos en el conjunto', 'info');
    }
}

// Función para limpiar evaluación
function limpiarEvaluacion() {
    if (!evaluacionActual) return;
    
    if (confirm('¿Está seguro de que desea limpiar la evaluación actual?')) {
        // Limpiar selecciones
        const radios = elements.evaluationTable.querySelectorAll('.nivel-radio');
        radios.forEach(radio => {
            radio.checked = false;
        });
        
        const celdas = elements.evaluationTable.querySelectorAll('.nivel-cell');
        celdas.forEach(celda => {
            celda.classList.remove('selected');
        });
        
        // Reiniciar evaluación
        evaluacionActual.criterios = {};
        evaluacionActual.puntajeTotal = 0;
        evaluacionActual.porcentaje = 0;
        evaluacionActual.nota = 0;
        
        // Limpiar comentarios
        elements.evaluationComments.value = '';
        
        actualizarResultados();
        mostrarMensaje('Evaluación limpiada', 'info');
    }
}

// Función para finalizar evaluación
function finalizarEvaluacion() {
    if (confirm('¿Está seguro de que desea finalizar la evaluación?')) {
        elements.evaluationArea.style.display = 'none';
        evaluacionActual = null;
        rubricaActual = null;
        estudianteActual = null;
        grupoActual = null;
        cursoActual = null;
        
        // Limpiar selectors
        elements.cursoSelect.value = '';
        elements.rubricaSelect.value = '';
        elements.modeSelect.value = 'individual';
        elements.estudianteSelect.value = '';
        elements.grupoSelect.value = '';
        elements.estudianteSelect.disabled = true;
        elements.grupoSelect.disabled = true;
        
        // Resetear modo de evaluación
        modoEvaluacion = 'individual';
        document.getElementById('estudiante-group').style.display = 'block';
        document.getElementById('grupo-group').style.display = 'none';
        
        actualizarEstadoEvaluacion();
        verificarDatosCompletos();
        
        mostrarMensaje('Evaluación finalizada', 'info');
    }
}

// Función para mostrar vista de rúbrica
function mostrarVistaRubrica() {
    if (!rubricaActual) return;
    
    // Generar vista previa de la rúbrica
    let html = `
        <div style="margin-bottom: 1.5rem;">
            <h2>${rubricaActual.titulo}</h2>
            ${rubricaActual.descripcion ? `<p>${rubricaActual.descripcion}</p>` : ''}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Criterios</th>
    `;
    
    // Obtener niveles únicos
    const nivelesUnicos = [];
    rubricaActual.criterios.forEach(criterio => {
        criterio.niveles.forEach(nivel => {
            if (!nivelesUnicos.find(n => n.nivel === nivel.nivel)) {
                nivelesUnicos.push({
                    nivel: nivel.nivel,
                    puntos: nivel.puntos
                });
            }
        });
    });
    
    nivelesUnicos.sort((a, b) => b.puntos - a.puntos);
    
    // Headers de niveles
    nivelesUnicos.forEach(nivel => {
        html += `<th>${nivel.nivel}<br><small>${nivel.puntos} pts</small></th>`;
    });
    
    html += `
                </tr>
            </thead>
            <tbody>
    `;
    
    // Filas de criterios
    rubricaActual.criterios.forEach(criterio => {
        html += `<tr><td><strong>${criterio.titulo}</strong></td>`;
        
        nivelesUnicos.forEach(nivelUnico => {
            const nivelCriterio = criterio.niveles.find(n => n.nivel === nivelUnico.nivel);
            const descripcion = nivelCriterio ? nivelCriterio.descripcion : '';
            html += `<td>${descripcion}</td>`;
        });
        
        html += '</tr>';
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    elements.rubricaPreview.innerHTML = html;
    elements.rubricaModal.style.display = 'flex';
}

// Función para cerrar modal
function cerrarModal() {
    elements.rubricaModal.style.display = 'none';
}

// Función para cerrar sidebar
function cerrarSidebar() {
    elements.studentsSidebar.classList.remove('open');
}

// Función para filtrar estudiantes
function filtrarEstudiantes() {
    const filtro = elements.studentsSearch.value.toLowerCase();
    const items = elements.studentsList.querySelectorAll('.student-item');
    
    items.forEach(item => {
        const nombre = item.querySelector('.student-name').textContent.toLowerCase();
        item.style.display = nombre.includes(filtro) ? 'block' : 'none';
    });
}

// Función para exportar curso a PDF
function exportarCursoPDF() {
    if (!cursoActual || !rubricaActual) {
        mostrarMensaje('Seleccione curso y rúbrica', 'warning');
        return;
    }
    
    try {
        // Cargar evaluaciones guardadas
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones') || '[]');
        const evaluacionesCurso = evaluaciones.filter(e => 
            e.curso === cursoActual.nombre && e.rubrica === rubricaActual.id
        );
        
        if (evaluacionesCurso.length === 0) {
            mostrarMensaje('No hay evaluaciones guardadas para este curso y rúbrica', 'warning');
            return;
        }
        
        // Generar PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración de fuentes y colores
        const colorPrimario = [0, 112, 209]; // #0070D1
        const colorSecundario = [0, 67, 156]; // #00439C
        const colorTexto = [51, 51, 51];
        const colorSeleccionado = [40, 167, 69]; // Verde para niveles seleccionados
        
        evaluacionesCurso.forEach((evaluacion, index) => {
            // Nueva página para cada estudiante (excepto el primero)
            if (index > 0) {
                doc.addPage();
            }
            
            let yPos = 20;
            
            // Encabezado
            doc.setTextColor(...colorPrimario);
            doc.setFontSize(18);
            doc.text('EVALUACIÓN CON RÚBRICA', 20, yPos);
            
            yPos += 15;
            doc.setTextColor(...colorTexto);
            doc.setFontSize(12);
            doc.text(`Estudiante: ${evaluacion.estudiante}`, 20, yPos);
            doc.text(`Curso: ${evaluacion.curso}`, 120, yPos);
            
            yPos += 8;
            doc.text(`Rúbrica: ${evaluacion.rubricaTitulo}`, 20, yPos);
            doc.text(`Fecha: ${new Date(evaluacion.fechaCompletada || evaluacion.fecha).toLocaleDateString('es-ES')}`, 120, yPos);
            
            yPos += 15;
            
            // Resultados generales
            doc.setFillColor(...colorSecundario);
            doc.rect(20, yPos, 170, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.text('RESULTADOS', 25, yPos + 7);
            doc.text(`Puntaje: ${evaluacion.puntajeTotal}/${evaluacion.puntajeMaximo}`, 25, yPos + 14);
            doc.text(`Porcentaje: ${evaluacion.porcentaje.toFixed(1)}%`, 90, yPos + 14);
            doc.text(`Nota: ${evaluacion.nota.toFixed(1)}`, 150, yPos + 14);
            
            yPos += 30;
            
            // Tabla de rúbrica
            doc.setTextColor(...colorTexto);
            doc.setFontSize(14);
            doc.text('DETALLE DE EVALUACIÓN', 20, yPos);
            yPos += 10;
            
            // Obtener niveles únicos ordenados
            const nivelesUnicos = [];
            rubricaActual.criterios.forEach(criterio => {
                criterio.niveles.forEach(nivel => {
                    if (!nivelesUnicos.find(n => n.nivel === nivel.nivel)) {
                        nivelesUnicos.push({
                            nivel: nivel.nivel,
                            puntos: nivel.puntos
                        });
                    }
                });
            });
            nivelesUnicos.sort((a, b) => b.puntos - a.puntos);
            
            // Configuración de la tabla
            const anchoColumna = 170 / (nivelesUnicos.length + 1);
            const alturaFila = 25;
            
            // Encabezado de la tabla
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos, anchoColumna, alturaFila, 'F');
            doc.setFontSize(10);
            doc.setTextColor(...colorTexto);
            doc.text('CRITERIO', 22, yPos + 8);
            
            nivelesUnicos.forEach((nivel, index) => {
                const x = 20 + anchoColumna * (index + 1);
                doc.rect(x, yPos, anchoColumna, alturaFila, 'F');
                doc.text(`${nivel.nivel}`, x + 2, yPos + 6);
                doc.text(`(${nivel.puntos} pts)`, x + 2, yPos + 12);
            });
            
            yPos += alturaFila;
            
            // Filas de criterios
            rubricaActual.criterios.forEach((criterio, criterioIndex) => {
                const alturaFilaCriterio = Math.max(alturaFila, Math.ceil(criterio.titulo.length / 15) * 8 + 10);
                
                // Columna de criterio
                doc.rect(20, yPos, anchoColumna, alturaFilaCriterio);
                doc.setFontSize(9);
                doc.setTextColor(...colorTexto);
                
                // Dividir texto largo en múltiples líneas
                const lineasTitulo = doc.splitTextToSize(criterio.titulo, anchoColumna - 4);
                doc.text(lineasTitulo, 22, yPos + 6);
                
                // Columnas de niveles
                nivelesUnicos.forEach((nivelUnico, index) => {
                    const x = 20 + anchoColumna * (index + 1);
                    
                    // Verificar si este nivel fue seleccionado para este criterio
                    const nivelSeleccionado = evaluacion.criterios[criterioIndex];
                    const esSeleccionado = nivelSeleccionado && 
                        criterio.niveles[nivelSeleccionado.nivelIndex] && 
                        criterio.niveles[nivelSeleccionado.nivelIndex].nivel === nivelUnico.nivel;
                    
                    // Color de fondo si está seleccionado
                    if (esSeleccionado) {
                        doc.setFillColor(...colorSeleccionado);
                        doc.rect(x, yPos, anchoColumna, alturaFilaCriterio, 'F');
                        doc.setTextColor(255, 255, 255);
                    } else {
                        doc.setTextColor(...colorTexto);
                    }
                    
                    // Borde
                    doc.rect(x, yPos, anchoColumna, alturaFilaCriterio);
                    
                    // Descripción del nivel
                    const nivelCriterio = criterio.niveles.find(n => n.nivel === nivelUnico.nivel);
                    if (nivelCriterio) {
                        const lineasDescripcion = doc.splitTextToSize(nivelCriterio.descripcion, anchoColumna - 4);
                        doc.setFontSize(8);
                        doc.text(lineasDescripcion, x + 2, yPos + 6);
                    }
                    
                    // Marcar si está seleccionado
                    if (esSeleccionado) {
                        doc.setFontSize(12);
                        doc.text('✓', x + anchoColumna - 10, yPos + 8);
                    }
                });
                
                yPos += alturaFilaCriterio;
                
                // Verificar si necesitamos nueva página
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
            });
            
            // Comentarios adicionales si existen
            if (evaluacion.comentarios) {
                yPos += 10;
                doc.setFontSize(12);
                doc.setTextColor(...colorPrimario);
                doc.text('COMENTARIOS:', 20, yPos);
                yPos += 8;
                doc.setFontSize(10);
                doc.setTextColor(...colorTexto);
                const lineasComentarios = doc.splitTextToSize(evaluacion.comentarios, 170);
                doc.text(lineasComentarios, 20, yPos);
            }
        });
        
        // Guardar PDF
        const nombreArchivo = `Evaluaciones_${cursoActual.nombre}_${rubricaActual.titulo}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
        doc.save(nombreArchivo);
        mostrarMensaje(`PDF exportado: ${evaluacionesCurso.length} estudiantes`, 'success');
        
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        mostrarMensaje('Error al exportar PDF: ' + error.message, 'error');
    }
}

// Función para actualizar estado de evaluación
function actualizarEstadoEvaluacion() {
    const statusElement = elements.evaluationStatus;
    const statusText = statusElement.querySelector('.status-text');
    
    if (evaluacionActual) {
        statusElement.classList.add('active');
        statusText.textContent = `Evaluando: ${estudianteActual.nombre}`;
    } else {
        statusElement.classList.remove('active');
        statusText.textContent = 'Sin evaluación activa';
    }
}

// Funciones utilitarias
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${tipo}`;
    messageEl.textContent = mensaje;
    
    // Estilos del mensaje
    Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    // Colores según tipo
    const colores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    messageEl.style.backgroundColor = colores[tipo] || colores.info;
    
    document.body.appendChild(messageEl);
    
    // Animación de entrada
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Función para volver al launcher
function volverAlLauncher() {
    // Verificar si hay una evaluación en progreso
    if (evaluacionActual) {
        const confirmar = confirm('¿Está seguro de que desea volver al launcher? Se perderá la evaluación actual si no la ha guardado.');
        if (!confirmar) {
            return;
        }
    }
    
    // Navegar al launcher (index.html)
    window.location.href = 'index.html';
}

// Función para inicializar el sistema de temas
function inicializarSistemaTemas() {
    // Esperar a que el theme manager esté disponible
    if (typeof initializeThemeSystem === 'function') {
        initializeThemeSystem();
        console.log('✅ Sistema de temas inicializado en Evalúa con Rúbrica');
    } else {
        // Intentar nuevamente después de un breve retraso
        setTimeout(() => {
            if (typeof initializeThemeSystem === 'function') {
                initializeThemeSystem();
                console.log('✅ Sistema de temas inicializado en Evalúa con Rúbrica (retry)');
            } else {
                console.warn('⚠️ Theme Manager no disponible en Evalúa con Rúbrica');
            }
        }, 100);
    }
}