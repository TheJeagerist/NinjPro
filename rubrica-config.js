// Gestión de Rúbricas en Configuración
document.addEventListener('DOMContentLoaded', function() {
    
    // Referencias a elementos del DOM - GESTIÓN DE RÚBRICAS ELIMINADA
    // const btnCargarRubricaConfig = document.getElementById('btn-cargar-rubrica-config');
    // const btnDescargarPlantillaRubrica = document.getElementById('btn-descargar-plantilla-rubrica');
    // const listaRubricas = document.getElementById('lista-rubricas');
    
    // Referencias al panel de rúbricas
    const rubricasGuardadasSelect = document.getElementById('rubricas-guardadas-select');
    const btnCargarRubricaGuardada = document.getElementById('cargar-rubrica-guardada');
    
    // Input de archivo oculto para cargar rúbricas
    let fileInputRubrica = document.createElement('input');
    fileInputRubrica.type = 'file';
    fileInputRubrica.style.display = 'none';
    fileInputRubrica.accept = '.docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    document.body.appendChild(fileInputRubrica);
    
    // Inicializar al cargar la página - GESTIÓN DE RÚBRICAS ELIMINADA
    // cargarListaRubricas();
    actualizarSelectorRubricas();
    
    // Event Listeners - COMENTADOS PORQUE LOS ELEMENTOS FUERON ELIMINADOS
    // if (btnCargarRubricaConfig) {
    //     btnCargarRubricaConfig.addEventListener('click', function() {
    //         fileInputRubrica.click();
    //     });
    // }
    
    // if (btnDescargarPlantillaRubrica) {
    //     btnDescargarPlantillaRubrica.addEventListener('click', descargarPlantillaRubrica);
    // }
    
    if (rubricasGuardadasSelect) {
        rubricasGuardadasSelect.addEventListener('change', function() {
            const btnCargar = document.getElementById('cargar-rubrica-guardada');
            if (btnCargar) {
                btnCargar.disabled = !this.value;
            }
        });
    }
    
    if (btnCargarRubricaGuardada) {
        btnCargarRubricaGuardada.addEventListener('click', cargarRubricaSeleccionada);
    }
    
    // Manejar carga de archivo
    fileInputRubrica.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            procesarArchivoRubrica(file);
        }
        e.target.value = null;
    });
    
    // Función para procesar archivo de rúbrica
    async function procesarArchivoRubrica(file) {
        try {
            let rubrica;
            
            if (file.name.endsWith('.docx')) {
                // Procesar archivo Word
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                rubrica = procesarDocxRubrica(result.value);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                // Procesar archivo Excel
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                rubrica = procesarExcelRubrica(workbook);
            } else {
                throw new Error('Formato de archivo no soportado. Use .docx, .xlsx o .xls');
            }
            
            // Asignar nombre basado en el archivo si no tiene título
            if (!rubrica.titulo || rubrica.titulo.trim() === '') {
                rubrica.titulo = file.name.replace(/\.[^/.]+$/, "");
            }
            
            // Guardar la rúbrica
            guardarRubricaEnLocalStorage(rubrica);
            
            // Actualizar la lista - GESTIÓN DE RÚBRICAS ELIMINADA
            // cargarListaRubricas();
            actualizarSelectorRubricas();
            
            alert('Rúbrica cargada y guardada exitosamente: ' + rubrica.titulo);
            
        } catch (error) {
            console.error('Error al procesar archivo:', error);
            alert('Error al procesar el archivo: ' + error.message);
        }
    }
    
    // Función para procesar archivo Excel
    function procesarExcelRubrica(workbook) {
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (data.length < 2) {
            throw new Error('El archivo Excel debe contener al menos un criterio además del encabezado');
        }

        const headers = data[0];
        const puntajes = data[1];
        
        if (!headers || headers.length < 2 || !puntajes || puntajes.length < 2) {
            throw new Error('El archivo no tiene el formato correcto de encabezados y puntajes');
        }

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
            titulo: 'Rúbrica Importada desde Excel',
            descripcion: 'Rúbrica importada desde archivo Excel',
            criterios,
            fechaCreacion: new Date().toISOString(),
            id: generarIdUnico()
        };
    }
    
    // Función para procesar archivo Word
    function procesarDocxRubrica(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        const rubrica = {
            titulo: '',
            descripcion: 'Rúbrica importada desde Word',
            criterios: [],
            fechaCreacion: new Date().toISOString(),
            id: generarIdUnico()
        };
        
        // Buscar el título
        const titulo = temp.querySelector('h1, h2, h3');
        if (titulo) {
            rubrica.titulo = titulo.textContent.trim();
        }
        
        // Buscar tablas
        const tablas = temp.getElementsByTagName('table');
        if (tablas.length > 0) {
            const tabla = tablas[0];
            
            // Procesar encabezados
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
            
            // Procesar filas
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
    
    // Función para guardar rúbrica en localStorage
    function guardarRubricaEnLocalStorage(rubrica) {
        let rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        
        // Asegurar que tenga un ID único
        if (!rubrica.id) {
            rubrica.id = generarIdUnico();
        }
        
        // Verificar si ya existe una rúbrica con el mismo nombre
        const indiceExistente = rubricas.findIndex(r => r.titulo === rubrica.titulo);
        
        if (indiceExistente !== -1) {
            const confirmar = confirm(`Ya existe una rúbrica con el nombre "${rubrica.titulo}". ¿Desea reemplazarla?`);
            if (confirmar) {
                rubricas[indiceExistente] = rubrica;
            } else {
                rubrica.titulo = rubrica.titulo + ' (Copia)';
                rubricas.push(rubrica);
            }
        } else {
            rubricas.push(rubrica);
        }
        
        localStorage.setItem('rubricas_guardadas', JSON.stringify(rubricas));
    }
    
    // Función para cargar lista de rúbricas - ELIMINADA PORQUE SE QUITÓ LA GESTIÓN DE RÚBRICAS
    /*
    function cargarListaRubricas() {
        if (!listaRubricas) return;
        
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        
        if (rubricas.length === 0) {
            listaRubricas.innerHTML = '<div class="no-rubricas-message">No hay rúbricas guardadas. Carga una rúbrica desde un archivo para comenzar.</div>';
            return;
        }
        
        listaRubricas.innerHTML = rubricas.map(rubrica => `
            <div class="rubrica-item" data-id="${rubrica.id}">
                <div class="rubrica-info">
                    <div class="rubrica-titulo">${rubrica.titulo}</div>
                    <div class="rubrica-fecha">Creada: ${formatearFecha(rubrica.fechaCreacion)}</div>
                    <div class="rubrica-fecha">${rubrica.criterios.length} criterios</div>
                </div>
                <div class="rubrica-acciones">
                    <button class="btn-rubrica-accion btn-ver-rubrica" onclick="verRubrica('${rubrica.id}')">
                        Ver
                    </button>
                    <button class="btn-rubrica-accion btn-eliminar-rubrica" onclick="eliminarRubrica('${rubrica.id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    */
    
    // Función para actualizar selector de rúbricas
    function actualizarSelectorRubricas() {
        if (!rubricasGuardadasSelect) return;
        
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        
        rubricasGuardadasSelect.innerHTML = '<option value="">Seleccionar rúbrica guardada...</option>';
        
        rubricas.forEach(rubrica => {
            const option = document.createElement('option');
            option.value = rubrica.id;
            option.textContent = rubrica.titulo;
            rubricasGuardadasSelect.appendChild(option);
        });
        
        // Habilitar/deshabilitar botón
        if (btnCargarRubricaGuardada) {
            btnCargarRubricaGuardada.disabled = !rubricasGuardadasSelect.value;
        }
    }
    
    // Función para cargar rúbrica seleccionada
    function cargarRubricaSeleccionada() {
        const rubricaId = rubricasGuardadasSelect.value;
        if (!rubricaId) return;
        
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        
        if (rubrica) {
            // Usar la función mostrarRubrica del archivo rubricas.js
            if (typeof mostrarRubrica === 'function') {
                mostrarRubrica(rubrica);
            } else {
                // Si no está disponible, llamar directamente al evento
                const event = new CustomEvent('cargarRubricaGuardada', { detail: rubrica });
                document.dispatchEvent(event);
            }
        }
    }
    
    // Función para ver rúbrica
    window.verRubrica = function(rubricaId) {
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        
        if (rubrica) {
            // Cambiar al panel de rúbricas y cargar la rúbrica
            const rubricasPanel = document.getElementById('rubricas-panel');
            if (rubricasPanel) {
                // Ocultar otros paneles
                document.querySelectorAll('.panel, .config-panel').forEach(panel => {
                    panel.style.display = 'none';
                });
                
                rubricasPanel.style.display = 'block';
                
                // Cargar la rúbrica
                setTimeout(() => {
                    if (typeof mostrarRubrica === 'function') {
                        mostrarRubrica(rubrica);
                    } else {
                        const event = new CustomEvent('cargarRubricaGuardada', { detail: rubrica });
                        document.dispatchEvent(event);
                    }
                }, 100);
            }
        }
    };
    
    // Función para eliminar rúbrica
    window.eliminarRubrica = function(rubricaId) {
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        
        if (rubrica && confirm(`¿Está seguro de que desea eliminar la rúbrica "${rubrica.titulo}"?`)) {
            const nuevasRubricas = rubricas.filter(r => r.id !== rubricaId);
            localStorage.setItem('rubricas_guardadas', JSON.stringify(nuevasRubricas));
            
            // cargarListaRubricas();
            actualizarSelectorRubricas();
        }
    };
    
    // Función para descargar plantilla de rúbrica
    function descargarPlantillaRubrica() {
        // Crear el encabezado
        const headers = ['Criterio', 'Excelente', 'Bueno', 'Regular', 'Deficiente'];
        const puntajes = ['Puntaje', '4', '3', '2', '1'];
        
        // Crear datos de ejemplo
        const data = [
            headers,
            puntajes,
            ['Presentación', 'Muy organizado y claro', 'Organizado', 'Poco organizado', 'Desorganizado'],
            ['Contenido', 'Contenido completo y relevante', 'Contenido casi completo', 'Contenido incompleto', 'Contenido muy incompleto'],
            ['Ortografía y Gramática', 'Sin errores', '1-2 errores menores', '3-4 errores', '5 o más errores'],
            ['Creatividad', 'Muy creativo e innovador', 'Creativo', 'Poco creativo', 'Sin creatividad']
        ];
        
        // Crear la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Dar formato a las celdas
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) continue;
                ws[cell_address].s = {
                    font: { bold: R <= 1 },
                    alignment: { 
                        vertical: 'top',
                        wrapText: true,
                        horizontal: R <= 1 ? 'center' : 'left'
                    }
                };
            }
        }
        
        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 30 }, // Criterio
            { wch: 40 }, // Excelente
            { wch: 40 }, // Bueno
            { wch: 40 }, // Regular
            { wch: 40 }  // Deficiente
        ];
        
        // Crear el libro y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Rúbrica');
        
        // Guardar archivo
        XLSX.writeFile(wb, 'plantilla_rubrica.xlsx');
    }
    
    // Función para formatear fecha
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
    
    // Función para generar ID único
    function generarIdUnico() {
        return 'rubrica_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Exponer funciones globalmente para que puedan ser usadas por otros archivos
    window.RubricaConfig = {
        // cargarListaRubricas, // ELIMINADA
        actualizarSelectorRubricas,
        guardarRubricaEnLocalStorage
    };
}); 