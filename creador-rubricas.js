// Variables globales
let rubricaActual = null;
let currentRubricaId = null;
let rubricasGuardadas = [];

// Elementos del DOM
let elements = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    inicializarEventListeners();
    cargarRubricasGuardadas();
    mostrarRubricaVacia();
    inicializarSistemaTemas();
});

// Función para inicializar elementos del DOM
function inicializarElementos() {
    elements = {
        // Header
        nuevaRubricaBtn: document.getElementById('nueva-rubrica'),
        cargarRubricaBtn: document.getElementById('cargar-rubrica'),
        descargarPlantillaWordBtn: document.getElementById('descargar-plantilla-word'),
        descargarPlantillaExcelBtn: document.getElementById('descargar-plantilla-excel'),
        
        // Editor
        rubricaTitulo: document.getElementById('rubrica-titulo'),
        rubricaDescripcion: document.getElementById('rubrica-descripcion'),
        guardarRubricaBtn: document.getElementById('guardar-rubrica'),
        exportarWordBtn: document.getElementById('exportar-word'),
        exportarExcelBtn: document.getElementById('exportar-excel'),
        
        // Toolbar
        agregarCriterioBtn: document.getElementById('agregar-criterio'),
        agregarNivelBtn: document.getElementById('agregar-nivel'),
        
        // Table
        rubricaTable: document.getElementById('rubrica-table'),
        
        // Sidebar
        listaRubricas: document.getElementById('lista-rubricas')
    };

    // Crear input de archivo oculto
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = '.docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    document.body.appendChild(fileInput);
    elements.fileInput = fileInput;
}

// Función para inicializar event listeners
function inicializarEventListeners() {
    // Navigation
    const volverLauncherBtn = document.getElementById('volver-launcher');
    volverLauncherBtn?.addEventListener('click', volverAlLauncher);
    
    // Header buttons
    elements.nuevaRubricaBtn?.addEventListener('click', nuevaRubrica);
    elements.cargarRubricaBtn?.addEventListener('click', () => elements.fileInput.click());
    elements.descargarPlantillaWordBtn?.addEventListener('click', descargarPlantillaWord);
    elements.descargarPlantillaExcelBtn?.addEventListener('click', descargarPlantillaRubricaExcel);
    
    // Editor buttons
    elements.guardarRubricaBtn?.addEventListener('click', guardarRubrica);
    elements.exportarWordBtn?.addEventListener('click', exportarRubricaWord);
    elements.exportarExcelBtn?.addEventListener('click', exportarRubricaExcel);
    
    // Toolbar buttons
    elements.agregarCriterioBtn?.addEventListener('click', agregarCriterio);
    elements.agregarNivelBtn?.addEventListener('click', agregarNivel);
    
    // File input
    elements.fileInput?.addEventListener('change', manejarArchivoSeleccionado);
    
    // Auto-save en título y descripción
    elements.rubricaTitulo?.addEventListener('input', debounce(autoGuardar, 1000));
    elements.rubricaDescripcion?.addEventListener('input', debounce(autoGuardar, 1000));
}

// Función para crear una nueva rúbrica
function nuevaRubrica() {
    currentRubricaId = null;
    rubricaActual = {
        id: generarId(),
        titulo: '',
        descripcion: '',
        criterios: [],
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
    };
    
    mostrarRubricaVacia();
    elements.rubricaTitulo.focus();
}

// Función para mostrar una rúbrica vacía
function mostrarRubricaVacia() {
    elements.rubricaTitulo.value = rubricaActual?.titulo || '';
    elements.rubricaDescripcion.value = rubricaActual?.descripcion || '';
    
    // Crear tabla básica con un criterio y dos niveles
    const thead = elements.rubricaTable.querySelector('thead tr');
    const tbody = elements.rubricaTable.querySelector('tbody');
    
    // Limpiar tabla
    thead.innerHTML = '<th class="criterio-header">Criterios</th>';
    tbody.innerHTML = '';
    
    if (!rubricaActual || rubricaActual.criterios.length === 0) {
        // Agregar niveles por defecto
        agregarNivelATabla('Excelente', 4);
        agregarNivelATabla('Bueno', 3);
        
        // Agregar criterio por defecto
        agregarCriterioATabla('Criterio 1');
    } else {
        // Cargar rúbrica existente
        cargarRubricaEnTabla(rubricaActual);
    }
}

// Función para agregar un nivel a la tabla
function agregarNivelATabla(titulo = 'Nuevo Nivel', puntos = 1) {
    const thead = elements.rubricaTable.querySelector('thead tr');
    const tbody = elements.rubricaTable.querySelector('tbody');
    
    // Agregar header del nivel
    const th = document.createElement('th');
    th.innerHTML = `
        <div class="nivel-header">
            <div class="nivel-info">
                <input type="text" class="nivel-titulo-input" value="${titulo}" placeholder="Título del nivel">
                <input type="number" class="nivel-puntos" value="${puntos}" min="0" max="100" placeholder="Puntos">
            </div>
            <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
        </div>
    `;
    thead.appendChild(th);
    
    // Agregar celda a cada fila existente
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
        const td = document.createElement('td');
        td.innerHTML = '<textarea class="nivel-descripcion" placeholder="Descripción del nivel"></textarea>';
        fila.appendChild(td);
    });
    
    // Agregar event listeners
    agregarEventListenersNivel(th);
}

// Función para agregar un criterio a la tabla
function agregarCriterioATabla(titulo = 'Nuevo Criterio') {
    const tbody = elements.rubricaTable.querySelector('tbody');
    const numNiveles = elements.rubricaTable.querySelectorAll('thead th').length - 1;
    
    const tr = document.createElement('tr');
    
    // Celda del criterio
    const tdCriterio = document.createElement('td');
    tdCriterio.innerHTML = `
        <div class="criterio-container">
            <input type="text" class="criterio-input" value="${titulo}" placeholder="Nombre del criterio">
            <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
        </div>
    `;
    tr.appendChild(tdCriterio);
    
    // Celdas de los niveles
    for (let i = 0; i < numNiveles; i++) {
        const td = document.createElement('td');
        td.innerHTML = '<textarea class="nivel-descripcion" placeholder="Descripción del nivel"></textarea>';
        tr.appendChild(td);
    }
    
    tbody.appendChild(tr);
    
    // Agregar event listeners
    agregarEventListenersCriterio(tr);
}

// Función para agregar event listeners a un nivel
function agregarEventListenersNivel(th) {
    const eliminarBtn = th.querySelector('.btn-eliminar-columna');
    const tituloInput = th.querySelector('.nivel-titulo-input');
    const puntosInput = th.querySelector('.nivel-puntos');
    
    eliminarBtn?.addEventListener('click', () => eliminarNivel(th));
    tituloInput?.addEventListener('input', debounce(autoGuardar, 500));
    puntosInput?.addEventListener('input', debounce(autoGuardar, 500));
}

// Función para agregar event listeners a un criterio
function agregarEventListenersCriterio(tr) {
    const eliminarBtn = tr.querySelector('.btn-eliminar-fila');
    const criterioInput = tr.querySelector('.criterio-input');
    const descripciones = tr.querySelectorAll('.nivel-descripcion');
    
    eliminarBtn?.addEventListener('click', () => eliminarCriterio(tr));
    criterioInput?.addEventListener('input', debounce(autoGuardar, 500));
    descripciones.forEach(desc => {
        desc.addEventListener('input', debounce(autoGuardar, 500));
    });
}

// Función para agregar un criterio
function agregarCriterio() {
    agregarCriterioATabla();
    autoGuardar();
}

// Función para agregar un nivel
function agregarNivel() {
    const numNiveles = elements.rubricaTable.querySelectorAll('thead th').length - 1;
    agregarNivelATabla(`Nivel ${numNiveles + 1}`, numNiveles + 1);
    autoGuardar();
}

// Función para eliminar un nivel
function eliminarNivel(th) {
    const index = Array.from(th.parentNode.children).indexOf(th) - 1;
    
    if (elements.rubricaTable.querySelectorAll('thead th').length <= 2) {
        alert('Debe haber al menos un nivel en la rúbrica');
        return;
    }
    
    // Eliminar header
    th.remove();
    
    // Eliminar celdas correspondientes en todas las filas
    const filas = elements.rubricaTable.querySelectorAll('tbody tr');
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas[index + 1]) {
            celdas[index + 1].remove();
        }
    });
    
    autoGuardar();
}

// Función para eliminar un criterio
function eliminarCriterio(tr) {
    if (elements.rubricaTable.querySelectorAll('tbody tr').length <= 1) {
        alert('Debe haber al menos un criterio en la rúbrica');
        return;
    }
    
    tr.remove();
    autoGuardar();
}

// Función para obtener datos de la rúbrica desde la tabla
function obtenerDatosRubrica() {
    const titulo = elements.rubricaTitulo.value.trim();
    const descripcion = elements.rubricaDescripcion.value.trim();
    
    // Obtener niveles
    const nivelesHeaders = elements.rubricaTable.querySelectorAll('thead th:not(.criterio-header)');
    const niveles = Array.from(nivelesHeaders).map(th => ({
        nivel: th.querySelector('.nivel-titulo-input').value.trim(),
        puntos: parseInt(th.querySelector('.nivel-puntos').value) || 0
    }));
    
    // Obtener criterios
    const filasBody = elements.rubricaTable.querySelectorAll('tbody tr');
    const criterios = Array.from(filasBody).map(fila => {
        const criterioInput = fila.querySelector('.criterio-input');
        const descripciones = fila.querySelectorAll('.nivel-descripcion');
        
        return {
            titulo: criterioInput.value.trim(),
            niveles: Array.from(descripciones).map((desc, index) => ({
                nivel: niveles[index]?.nivel || '',
                puntos: niveles[index]?.puntos || 0,
                descripcion: desc.value.trim()
            }))
        };
    });
    
    return {
        id: currentRubricaId || generarId(),
        titulo: titulo || 'Rúbrica sin título',
        descripcion,
        criterios,
        fechaCreacion: rubricaActual?.fechaCreacion || new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
    };
}

// Función para guardar rúbrica
function guardarRubrica() {
    try {
        const rubrica = obtenerDatosRubrica();
        
        if (!rubrica.titulo.trim()) {
            alert('Por favor, ingrese un título para la rúbrica');
            elements.rubricaTitulo.focus();
            return;
        }
        
        if (rubrica.criterios.length === 0) {
            alert('La rúbrica debe tener al menos un criterio');
            return;
        }
        
        // Guardar en localStorage
        let rubricas = JSON.parse(localStorage.getItem('rubricas') || '[]');
        
        const index = rubricas.findIndex(r => r.id === rubrica.id);
        if (index >= 0) {
            rubricas[index] = rubrica;
        } else {
            rubricas.push(rubrica);
        }
        
        localStorage.setItem('rubricas', JSON.stringify(rubricas));
        
        rubricaActual = rubrica;
        currentRubricaId = rubrica.id;
        
        cargarRubricasGuardadas();
        
        // Mostrar mensaje de éxito
        mostrarMensaje('Rúbrica guardada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al guardar rúbrica:', error);
        mostrarMensaje('Error al guardar la rúbrica', 'error');
    }
}

// Función para auto-guardar
function autoGuardar() {
    if (currentRubricaId) {
        guardarRubrica();
    }
}

// Función para cargar rúbricas guardadas
function cargarRubricasGuardadas() {
    try {
        rubricasGuardadas = JSON.parse(localStorage.getItem('rubricas') || '[]');
        mostrarListaRubricas();
    } catch (error) {
        console.error('Error al cargar rúbricas:', error);
        rubricasGuardadas = [];
    }
}

// Función para mostrar lista de rúbricas
function mostrarListaRubricas() {
    const lista = elements.listaRubricas;
    
    if (rubricasGuardadas.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>No hay rúbricas</h3>
                <p>Crea tu primera rúbrica</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = rubricasGuardadas.map(rubrica => `
        <div class="rubrica-item ${rubrica.id === currentRubricaId ? 'active' : ''}" data-id="${rubrica.id}">
            <div class="rubrica-titulo">${rubrica.titulo}</div>
            <div class="rubrica-fecha">${formatearFecha(rubrica.fechaModificacion)}</div>
            <div class="rubrica-acciones">
                <button class="btn-rubrica-accion btn-ver-rubrica" onclick="cargarRubrica('${rubrica.id}')">
                    Ver
                </button>
                <button class="btn-rubrica-accion btn-eliminar-rubrica" onclick="eliminarRubrica('${rubrica.id}')">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Función para cargar una rúbrica específica
function cargarRubrica(id) {
    const rubrica = rubricasGuardadas.find(r => r.id === id);
    if (!rubrica) return;
    
    rubricaActual = rubrica;
    currentRubricaId = id;
    
    cargarRubricaEnTabla(rubrica);
    mostrarListaRubricas(); // Actualizar estado activo
}

// Función para cargar rúbrica en la tabla
function cargarRubricaEnTabla(rubrica) {
    elements.rubricaTitulo.value = rubrica.titulo;
    elements.rubricaDescripcion.value = rubrica.descripcion || '';
    
    const thead = elements.rubricaTable.querySelector('thead tr');
    const tbody = elements.rubricaTable.querySelector('tbody');
    
    // Limpiar tabla
    thead.innerHTML = '<th class="criterio-header">Criterios</th>';
    tbody.innerHTML = '';
    
    if (rubrica.criterios.length === 0) return;
    
    // Obtener niveles únicos
    const nivelesUnicos = [];
    rubrica.criterios.forEach(criterio => {
        criterio.niveles.forEach(nivel => {
            if (!nivelesUnicos.find(n => n.nivel === nivel.nivel)) {
                nivelesUnicos.push({
                    nivel: nivel.nivel,
                    puntos: nivel.puntos
                });
            }
        });
    });
    
    // Agregar headers de niveles
    nivelesUnicos.forEach(nivel => {
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="nivel-header">
                <div class="nivel-info">
                    <input type="text" class="nivel-titulo-input" value="${nivel.nivel}" placeholder="Título del nivel">
                    <input type="number" class="nivel-puntos" value="${nivel.puntos}" min="0" max="100" placeholder="Puntos">
                </div>
                <button type="button" class="btn-eliminar-columna" title="Eliminar nivel">×</button>
            </div>
        `;
        thead.appendChild(th);
        agregarEventListenersNivel(th);
    });
    
    // Agregar filas de criterios
    rubrica.criterios.forEach(criterio => {
        const tr = document.createElement('tr');
        
        // Celda del criterio
        const tdCriterio = document.createElement('td');
        tdCriterio.innerHTML = `
            <div class="criterio-container">
                <input type="text" class="criterio-input" value="${criterio.titulo}" placeholder="Nombre del criterio">
                <button type="button" class="btn-eliminar-fila" title="Eliminar criterio">×</button>
            </div>
        `;
        tr.appendChild(tdCriterio);
        
        // Celdas de niveles
        nivelesUnicos.forEach(nivelUnico => {
            const td = document.createElement('td');
            const nivelCriterio = criterio.niveles.find(n => n.nivel === nivelUnico.nivel);
            td.innerHTML = `<textarea class="nivel-descripcion" placeholder="Descripción del nivel">${nivelCriterio?.descripcion || ''}</textarea>`;
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
        agregarEventListenersCriterio(tr);
    });
}

// Función para eliminar rúbrica
function eliminarRubrica(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta rúbrica?')) return;
    
    rubricasGuardadas = rubricasGuardadas.filter(r => r.id !== id);
    localStorage.setItem('rubricas', JSON.stringify(rubricasGuardadas));
    
    if (currentRubricaId === id) {
        nuevaRubrica();
    }
    
    mostrarListaRubricas();
    mostrarMensaje('Rúbrica eliminada', 'success');
}

// Función para manejar archivo seleccionado
function manejarArchivoSeleccionado(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    procesarArchivo(file);
    e.target.value = null;
}

// Función para procesar archivo
async function procesarArchivo(file) {
    try {
        let rubrica;
        
        if (file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            rubrica = procesarDocx(result.value);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            rubrica = procesarExcel(workbook);
        } else {
            throw new Error('Formato de archivo no soportado');
        }
        
        if (!rubrica.titulo) {
            rubrica.titulo = file.name.replace(/\.[^/.]+$/, "");
        }
        
        rubricaActual = rubrica;
        currentRubricaId = rubrica.id;
        
        cargarRubricaEnTabla(rubrica);
        mostrarMensaje('Archivo cargado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al procesar archivo:', error);
        mostrarMensaje('Error al procesar el archivo: ' + error.message, 'error');
    }
}

// Función para procesar archivo Word
function procesarDocx(html) {
    // Implementación similar a la original
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const rubrica = {
        id: generarId(),
        titulo: '',
        descripcion: 'Rúbrica importada desde Word',
        criterios: [],
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
    };
    
    const titulo = temp.querySelector('h1, h2, h3');
    if (titulo) {
        rubrica.titulo = titulo.textContent.trim();
    }
    
    const tablas = temp.getElementsByTagName('table');
    if (tablas.length > 0) {
        const tabla = tablas[0];
        
        const encabezados = tabla.querySelectorAll('tr:first-child td, tr:first-child th');
        const niveles = [];
        encabezados.forEach((encabezado, index) => {
            if (index > 0) {
                niveles.push({
                    nivel: encabezado.textContent.trim(),
                    puntos: 4 - (index - 1)
                });
            }
        });
        
        const filas = tabla.querySelectorAll('tr:not(:first-child)');
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length > 0) {
                const criterio = {
                    titulo: celdas[0].textContent.trim(),
                    niveles: []
                };
                
                for (let i = 1; i < celdas.length && i <= niveles.length; i++) {
                    criterio.niveles.push({
                        nivel: niveles[i-1].nivel,
                        puntos: niveles[i-1].puntos,
                        descripcion: celdas[i].textContent.trim()
                    });
                }
                
                rubrica.criterios.push(criterio);
            }
        });
    }
    
    return rubrica;
}

// Función para procesar archivo Excel
function procesarExcel(workbook) {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    if (data.length < 2) {
        throw new Error('El archivo Excel debe contener al menos un criterio además del encabezado');
    }

    const headers = data[0];
    const puntajes = data[1];
    
    const criterios = [];
    
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (row && row[0]) {
            const criterio = {
                titulo: row[0],
                niveles: []
            };
            
            for (let j = 1; j < headers.length - 1; j++) {
                if (row[j]) {
                    criterio.niveles.push({
                        nivel: headers[j],
                        puntos: parseInt(puntajes[j]) || 0,
                        descripcion: row[j] || ''
                    });
                }
            }
            
            criterios.push(criterio);
        }
    }
    
    return {
        id: generarId(),
        titulo: 'Rúbrica Importada desde Excel',
        descripcion: 'Rúbrica importada desde archivo Excel',
        criterios,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
    };
}

// Funciones de exportación
async function exportarRubricaWord() {
    try {
        const rubrica = obtenerDatosRubrica();
        // Implementar exportación a Word usando docx.js
        mostrarMensaje('Funcionalidad de exportación a Word en desarrollo', 'info');
    } catch (error) {
        console.error('Error al exportar a Word:', error);
        mostrarMensaje('Error al exportar a Word', 'error');
    }
}

async function exportarRubricaExcel() {
    try {
        const rubrica = obtenerDatosRubrica();
        
        const wb = XLSX.utils.book_new();
        const wsData = [];
        
        // Headers
        const headers = ['Criterio'];
        const puntos = [''];
        
        if (rubrica.criterios.length > 0) {
            rubrica.criterios[0].niveles.forEach(nivel => {
                headers.push(nivel.nivel);
                puntos.push(nivel.puntos);
            });
        }
        
        wsData.push(headers);
        wsData.push(puntos);
        
        // Criterios
        rubrica.criterios.forEach(criterio => {
            const row = [criterio.titulo];
            criterio.niveles.forEach(nivel => {
                row.push(nivel.descripcion);
            });
            wsData.push(row);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Rúbrica');
        
        XLSX.writeFile(wb, `${rubrica.titulo}.xlsx`);
        mostrarMensaje('Rúbrica exportada a Excel exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        mostrarMensaje('Error al exportar a Excel', 'error');
    }
}

// Funciones de plantillas
async function descargarPlantillaWord() {
    mostrarMensaje('Funcionalidad de plantilla Word en desarrollo', 'info');
}

async function descargarPlantillaRubricaExcel() {
    try {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Criterio', 'Excelente', 'Bueno', 'Regular', 'Deficiente'],
            ['', '4', '3', '2', '1'],
            ['Criterio 1', 'Descripción excelente', 'Descripción buena', 'Descripción regular', 'Descripción deficiente'],
            ['Criterio 2', 'Descripción excelente', 'Descripción buena', 'Descripción regular', 'Descripción deficiente']
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Rúbrica');
        
        XLSX.writeFile(wb, 'Plantilla_Rubrica.xlsx');
        mostrarMensaje('Plantilla Excel descargada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al descargar plantilla:', error);
        mostrarMensaje('Error al descargar plantilla', 'error');
    }
}

// Funciones utilitarias
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// Función para volver al launcher
function volverAlLauncher() {
    // Verificar si hay cambios sin guardar
    const rubricaActualData = obtenerDatosRubrica();
    const hayTitulo = rubricaActualData.titulo.trim() !== '';
    const hayCriterios = rubricaActualData.criterios.length > 0;
    
    if ((hayTitulo || hayCriterios) && !currentRubricaId) {
        const confirmar = confirm('¿Está seguro de que desea volver al launcher? Hay cambios sin guardar que se perderán.');
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
        console.log('✅ Sistema de temas inicializado en Creador de Rúbricas');
    } else {
        // Intentar nuevamente después de un breve retraso
        setTimeout(() => {
            if (typeof initializeThemeSystem === 'function') {
                initializeThemeSystem();
                console.log('✅ Sistema de temas inicializado en Creador de Rúbricas (retry)');
            } else {
                console.warn('⚠️ Theme Manager no disponible en Creador de Rúbricas');
            }
        }, 100);
    }
}