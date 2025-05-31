document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const cargarRubricaBtn = document.getElementById('cargar-rubrica');
    const nuevaRubricaBtn = document.getElementById('nueva-rubrica');
    const rubricaContent = document.getElementById('rubrica-content');

    // Crear un único input de archivo oculto para reutilizar
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none'; // Ocultarlo
    fileInput.accept = '.docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    document.body.appendChild(fileInput); // Añadirlo al DOM para que funcione

    // Asignar el evento onchange una sola vez
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            if (file.name.endsWith('.docx')) {
                mammoth.convertToHtml({arrayBuffer: file})
                    .then(function(result) {
                        const html = result.value;
                        const rubrica = procesarDocx(html);
                        mostrarRubrica(rubrica);
                    })
                    .catch(function(error) {
                        alert('Error al cargar el archivo Word: ' + error.message);
                    });
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.onload = function(event) {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const rubrica = procesarExcel(workbook);
                        mostrarRubrica(rubrica);
                    } catch (error) {
                        alert('Error al cargar el archivo Excel: ' + error.message);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
        // Limpiar el valor del input para permitir cargar el mismo archivo nuevamente
        e.target.value = null;
    };

    // Función para procesar archivo Excel
    function procesarExcel(workbook) {
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Validar estructura del Excel
        if (data.length < 2) {
            throw new Error('El archivo Excel debe contener al menos un criterio además del encabezado');
        }

        // Verificar el encabezado
        const headers = data[0];
        const puntajes = data[1]; // La segunda fila contiene los puntajes
        if (!headers || headers.length < 2 || !puntajes || puntajes.length < 2) {
            throw new Error('El archivo no tiene el formato correcto de encabezados y puntajes');
        }

        const criterios = [];
        
        // Procesar cada fila (excepto el encabezado y puntajes)
        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            if (row && row[0]) { // Si la fila tiene un criterio
                const criterio = {
                    titulo: row[0],
                    niveles: []
                };
                
                // Procesar cada nivel (columna)
                for (let j = 1; j < headers.length - 1; j++) { // -1 para excluir "No presente"
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
            titulo: 'Rúbrica Importada',
            descripcion: 'Rúbrica importada desde Excel',
            criterios,
            fechaCreacion: new Date().toISOString()
        };
    }

    // Función para mostrar una rúbrica cargada
    function mostrarRubrica(rubrica = null) {
        const container = document.querySelector('.rubrica-content');
        if (!container) {
            console.error('No se encontró el contenedor de la rúbrica');
            return;
        }

        container.innerHTML = `
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
                                        <th>Criterio</th>
                                        ${rubrica ? generarColumnasNiveles(rubrica.criterios[0].niveles) : '<th>Nivel 1</th>'}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rubrica ? generarFilasCriterios(rubrica.criterios) : generarFilaVacia()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="rubrica-slider">
                        <div class="rubrica-slider-handle"></div>
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
                    <button type="button" id="descargar-plantilla-word">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Plantilla Word
                    </button>
                    <button type="button" id="exportar-excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
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

        // Funciones auxiliares para generar el HTML
        function generarColumnasNiveles(niveles) {
            return niveles.map((nivel, index) => `
                <th>
                    <div class="nivel-header">
                        <div class="nivel-info">
                            <span class="nivel-titulo">${nivel.nivel}</span>
                            <input type="number" class="nivel-puntos" id="nivel-puntos-${index}" 
                                   name="nivel-puntos-${index}" value="${nivel.puntos}" min="0" max="10" 
                                   title="Puntos para este nivel">
                        </div>
                        <div class="btn-controls">
                            <button type="button" class="btn-eliminar-columna" data-index="${index}">×</button>
                        </div>
                    </div>
                </th>
            `).join('');
        }

        function generarFilasCriterios(criterios) {
            return criterios.map((criterio, criterioIndex) => `
                <tr>
                    <td>
                        <input type="text" class="criterio-input" id="criterio-input-${criterioIndex}" 
                               name="criterio-input-${criterioIndex}" placeholder="Nombre del criterio" 
                               required value="${criterio.titulo}">
                        <button type="button" class="btn-eliminar-fila">×</button>
                    </td>
                    ${criterio.niveles.map((nivel, nivelIndex) => `
                        <td>
                            <textarea class="nivel-descripcion" id="nivel-desc-${nivelIndex}-${criterioIndex}" 
                                      name="nivel-desc-${nivelIndex}-${criterioIndex}" rows="3" 
                                      placeholder="Descripción del nivel">${nivel.descripcion}</textarea>
                        </td>
                    `).join('')}
                </tr>
            `).join('');
        }

        function generarFilaVacia() {
            return `
                <tr>
                    <td>
                        <input type="text" class="criterio-input" id="criterio-input-0" 
                               name="criterio-input-0" placeholder="Nombre del criterio" required>
                        <button type="button" class="btn-eliminar-fila">×</button>
                    </td>
                    <td>
                        <textarea class="nivel-descripcion" id="nivel-desc-0-0" 
                                  name="nivel-desc-0-0" rows="3" 
                                  placeholder="Descripción del nivel"></textarea>
                    </td>
                </tr>
            `;
        }

        inicializarEventosFormulario();
    }

    // Función para inicializar los eventos del formulario
    function inicializarEventosFormulario() {
        const form = document.getElementById('nueva-rubrica-form');
        const agregarColumnaBtn = document.getElementById('agregar-columna');
        const agregarFilaBtn = document.getElementById('agregar-fila');
        const exportarExcelBtn = document.getElementById('exportar-excel');
        const tabla = document.getElementById('rubrica-table');
        
        if (!form || !agregarColumnaBtn || !agregarFilaBtn || !exportarExcelBtn || !tabla) {
            console.error('No se encontraron todos los elementos necesarios');
            return;
        }

        // Agregar eventos directamente sin intentar removerlos primero
        form.addEventListener('submit', manejarSubmitFormulario);
        agregarColumnaBtn.addEventListener('click', manejarAgregarColumna);
        agregarFilaBtn.addEventListener('click', manejarAgregarFila);
        exportarExcelBtn.addEventListener('click', manejarExportarExcel);
        tabla.addEventListener('click', manejarEventosTabla);

        const slider = document.querySelector('.rubrica-slider');
        const handle = document.querySelector('.rubrica-slider-handle');
        const tableWrapper = document.querySelector('.rubrica-table-wrapper');
        const tableContainer = document.querySelector('.rubrica-table-container');
        
        if (!slider || !handle || !tableWrapper || !tableContainer) {
            console.error('No se encontraron los elementos del slider');
            return;
        }

        let isDragging = false;
        let startX;
        let sliderLeft;
        
        function actualizarPosicionTabla(handlePosition) {
            const tabla = document.getElementById('rubrica-table');
            const containerWidth = tableContainer.offsetWidth;
            const tableWidth = tabla.offsetWidth;
            
            if (tableWidth <= containerWidth) {
                tableWrapper.style.transform = 'translateX(0)';
                handle.style.display = 'none';
                slider.style.display = 'none';
                return;
            }
            
            slider.style.display = 'block';
            handle.style.display = 'block';
            
            const maxScroll = tableWidth - containerWidth;
            const scrollPercentage = handlePosition / (slider.offsetWidth - handle.offsetWidth);
            const translateX = -maxScroll * scrollPercentage;
            
            tableWrapper.style.transform = `translateX(${translateX}px)`;
        }
        
        function iniciarArrastre(e) {
            isDragging = true;
            handle.classList.add('grabbing');
            
            startX = e.pageX - slider.getBoundingClientRect().left;
            sliderLeft = handle.offsetLeft;
            
            e.preventDefault();
        }
        
        function realizarArrastre(e) {
            if (!isDragging) return;
            
            const x = e.pageX - slider.getBoundingClientRect().left;
            const walk = x - startX;
            
            let newLeft = sliderLeft + walk;
            const maxLeft = slider.offsetWidth - handle.offsetWidth;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            handle.style.left = `${newLeft}px`;
            
            actualizarPosicionTabla(newLeft);
        }
        
        function finalizarArrastre() {
            isDragging = false;
            handle.classList.remove('grabbing');
        }
        
        // Inicializar posición del handle
        function inicializarSlider() {
            const tabla = document.getElementById('rubrica-table');
            if (tabla.offsetWidth <= tableContainer.offsetWidth) {
                slider.style.display = 'none';
                handle.style.display = 'none';
                return;
            }
            
            handle.style.left = '0';
            actualizarPosicionTabla(0);
        }
        
        // Eventos del slider
        handle.addEventListener('mousedown', iniciarArrastre);
        document.addEventListener('mousemove', realizarArrastre);
        document.addEventListener('mouseup', finalizarArrastre);
        document.addEventListener('mouseleave', finalizarArrastre);
        
        // Click directo en el slider
        slider.addEventListener('click', (e) => {
            if (e.target === handle) return;
            
            const clickX = e.pageX - slider.getBoundingClientRect().left;
            const handleCenter = handle.offsetWidth / 2;
            let newLeft = clickX - handleCenter;
            
            const maxLeft = slider.offsetWidth - handle.offsetWidth;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            
            handle.style.left = `${newLeft}px`;
            actualizarPosicionTabla(newLeft);
        });
        
        // Observar cambios en el tamaño
        const observer = new ResizeObserver(() => {
            inicializarSlider();
        });
        observer.observe(tabla);
        
        // Inicializar slider
        inicializarSlider();

        const descargarPlantillaExcelBtn = document.getElementById('descargar-plantilla-excel');
        const descargarPlantillaWordBtn = document.getElementById('descargar-plantilla-word');

        if (descargarPlantillaExcelBtn) {
            descargarPlantillaExcelBtn.addEventListener('click', descargarPlantillaExcel);
        }
        if (descargarPlantillaWordBtn) {
            descargarPlantillaWordBtn.addEventListener('click', descargarPlantillaWord);
        }
    }

    // Manejadores de eventos
    function manejarSubmitFormulario(e) {
        e.preventDefault();
        guardarRubrica();
    }

    function manejarExportarExcel() {
        const rubrica = obtenerDatosRubrica();
        exportarAExcel(rubrica);
    }

    function manejarEventosTabla(e) {
        if (e.target.classList.contains('btn-eliminar-columna')) {
            const index = parseInt(e.target.dataset.index) + 1;
            const tabla = document.getElementById('rubrica-table');
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                fila.deleteCell(index);
            });
            
            // Actualizar índices de los botones de eliminar y los IDs
            const encabezados = tabla.querySelectorAll('th');
            encabezados.forEach((th, i) => {
                if (i > 0) {
                    th.innerHTML = `
                        <div class="nivel-header">
                            <div class="nivel-info">
                                <span class="nivel-titulo">Nivel ${i}</span>
                                <input type="number" class="nivel-puntos" id="nivel-puntos-${i-1}" name="nivel-puntos-${i-1}" value="${5-i}" min="0" max="10" title="Puntos para este nivel">
                            </div>
                            <div class="btn-controls">
                                <button type="button" class="btn-eliminar-columna" data-index="${i-1}">×</button>
                            </div>
                        </div>
                    `;
                }
            });

            // Actualizar IDs de las descripciones
            const filasTbody = tabla.querySelectorAll('tbody tr');
            filasTbody.forEach((fila, filaIndex) => {
                const celdas = fila.querySelectorAll('.nivel-descripcion');
                celdas.forEach((celda, celdaIndex) => {
                    celda.id = `nivel-desc-${celdaIndex}-${filaIndex}`;
                    celda.name = `nivel-desc-${celdaIndex}-${filaIndex}`;
                });
            });
        } else if (e.target.classList.contains('btn-eliminar-fila')) {
            const fila = e.target.closest('tr');
            fila.remove();
            
            // Actualizar IDs de las filas restantes
            const tabla = document.getElementById('rubrica-table');
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach((fila, filaIndex) => {
                const criterioInput = fila.querySelector('.criterio-input');
                criterioInput.id = `criterio-input-${filaIndex}`;
                criterioInput.name = `criterio-input-${filaIndex}`;
                
                const descripciones = fila.querySelectorAll('.nivel-descripcion');
                descripciones.forEach((desc, descIndex) => {
                    desc.id = `nivel-desc-${descIndex}-${filaIndex}`;
                    desc.name = `nivel-desc-${descIndex}-${filaIndex}`;
                });
            });
        } else if (e.target.classList.contains('nivel-titulo')) {
            const header = e.target.closest('.nivel-header');
            const titulo = e.target;
            const textoActual = titulo.textContent;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = textoActual;
            input.className = 'nivel-titulo-input';
            
            input.addEventListener('blur', function() {
                titulo.textContent = this.value;
                header.classList.remove('editando');
            });
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });
            
            titulo.replaceWith(input);
            header.classList.add('editando');
            input.focus();
            input.select();
        }
    }

    function manejarAgregarColumna() {
        const headerRow = document.getElementById('header-row');
        const numColumnas = headerRow.cells.length;
        
        // Agregar encabezado
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="nivel-header">
                <div class="nivel-info">
                    <span class="nivel-titulo">Nivel ${numColumnas}</span>
                    <input type="number" class="nivel-puntos" id="nivel-puntos-${numColumnas-1}" name="nivel-puntos-${numColumnas-1}" value="${Math.max(1, 5-numColumnas+1)}" min="0" max="10" title="Puntos para este nivel">
                </div>
                <div class="btn-controls">
                    <button type="button" class="btn-eliminar-columna" data-index="${numColumnas - 1}">×</button>
                </div>
            </div>
        `;
        headerRow.appendChild(th);
        
        // Agregar celda a cada fila existente
        const tabla = document.getElementById('rubrica-table');
        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach((fila, filaIndex) => {
            const td = document.createElement('td');
            td.innerHTML = `<textarea class="nivel-descripcion" id="nivel-desc-${numColumnas-1}-${filaIndex}" name="nivel-desc-${numColumnas-1}-${filaIndex}" rows="3" placeholder="Descripción del nivel"></textarea>`;
            fila.appendChild(td);
        });
    }

    function manejarAgregarFila() {
        const tabla = document.getElementById('rubrica-table');
        const tbody = tabla.querySelector('tbody');
        const numFilas = tbody.querySelectorAll('tr').length;
        const numColumnas = document.getElementById('header-row').cells.length;
        const tr = document.createElement('tr');
        
        // Crear celda para el criterio
        let html = `
            <td>
                <input type="text" class="criterio-input" id="criterio-input-${numFilas}" name="criterio-input-${numFilas}" placeholder="Nombre del criterio" required>
                <button type="button" class="btn-eliminar-fila">×</button>
            </td>
        `;
        
        // Crear celdas para cada nivel
        for (let i = 1; i < numColumnas; i++) {
            html += `
                <td>
                    <textarea class="nivel-descripcion" id="nivel-desc-${i-1}-${numFilas}" name="nivel-desc-${i-1}-${numFilas}" rows="3" placeholder="Descripción del nivel"></textarea>
                </td>
            `;
        }
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }

    // Función para obtener los datos de la rúbrica actual
    function obtenerDatosRubrica() {
        const tabla = document.getElementById('rubrica-table');
        const titulo = document.getElementById('rubrica-titulo').value;
        const descripcion = document.getElementById('rubrica-descripcion').value;
        
        // Obtener encabezados (niveles)
        const encabezados = Array.from(tabla.querySelectorAll('th')).slice(1).map(th => ({
            titulo: th.querySelector('.nivel-titulo').textContent.trim(),
            puntos: parseInt(th.querySelector('.nivel-puntos').value) || 0
        }));
        
        // Obtener filas (criterios)
        const filas = tabla.querySelectorAll('tbody tr');
        const criterios = Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll('td');
            const criterio = celdas[0].querySelector('.criterio-input').value;
            const niveles = Array.from(celdas).slice(1).map((celda, index) => ({
                nivel: encabezados[index].titulo,
                puntos: encabezados[index].puntos,
                descripcion: celda.querySelector('.nivel-descripcion').value
            }));
            
            return {
                titulo: criterio,
                niveles: niveles
            };
        });
        
        return {
            titulo,
            descripcion,
            criterios,
            fechaCreacion: new Date().toISOString()
        };
    }

    // Función para guardar la rúbrica
    function guardarRubrica() {
        // Por ahora solo obtiene los datos
        // Aquí podrías agregar lógica para guardar en localStorage o en un servidor
        obtenerDatosRubrica();
    }

    // Función para exportar a Excel
    function exportarAExcel(rubrica) {
        // Crear el encabezado
        const headers = ['Criterio'];
        const puntajes = ['Puntaje']; // Nueva fila para puntajes
        
        // Obtener los nombres de niveles y puntajes del primer criterio
        if (rubrica.criterios.length > 0) {
            rubrica.criterios[0].niveles.forEach(nivel => {
                headers.push(nivel.nivel);
                puntajes.push(nivel.puntos);
            });
        }
        headers.push('No presente');
        puntajes.push(0);
        
        // Crear la matriz de datos
        const data = [headers, puntajes];
        
        // Agregar los criterios
        rubrica.criterios.forEach(criterio => {
            const row = [
                criterio.titulo, // Criterio
                ...criterio.niveles.map(nivel => nivel.descripcion), // Descripciones de niveles
                '' // No presente
            ];
            data.push(row);
        });
        
        // Crear la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Dar formato a las celdas
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) continue;
                ws[cell_address].s = {
                    font: { bold: R <= 1 }, // Primeras dos filas en negrita
                    alignment: { 
                        vertical: 'top', 
                        wrapText: true,
                        horizontal: R <= 1 ? 'center' : 'left' // Centrar encabezados y puntajes
                    }
                };
            }
        }
        
        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 30 }, // Criterio
            { wch: 40 }, // Excelente
            { wch: 40 }, // Bueno
            { wch: 40 }, // Satisfactorio
            { wch: 40 }, // Insuficiente
            { wch: 20 }  // No presente
        ];
        
        // Crear el libro y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rúbrica');
        
        // Guardar archivo
        XLSX.writeFile(wb, `rubrica_${rubrica.titulo.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
    }

    // Evento para crear una nueva rúbrica
    nuevaRubricaBtn.addEventListener('click', function() {
        mostrarRubrica();
    });

    // Evento para cargar una rúbrica
        cargarRubricaBtn.addEventListener('click', function(event) {
            console.log('Clic en cargarRubricaBtn detectado. Timestamp:', event.timeStamp);
            event.stopPropagation(); 
            
            console.log('Llamando a fileInput.click(). Timestamp:', performance.now());
            fileInput.click();
            console.log('Después de llamar a fileInput.click(). Timestamp:', performance.now());
            
            if (cargarRubricaBtn && typeof cargarRubricaBtn.blur === 'function') {
                cargarRubricaBtn.blur();
                console.log('Foco quitado de cargarRubricaBtn. Timestamp:', performance.now());
            }
        });

    // Función para procesar el contenido de un archivo Word
    function procesarDocx(html) {
        // Crear un elemento temporal para analizar el HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Inicializar la estructura de la rúbrica
        const rubrica = {
            titulo: '',
            descripcion: 'Rúbrica importada desde Word',
            criterios: [],
            fechaCreacion: new Date().toISOString()
        };
        
        // Buscar el título (asumiendo que es el primer encabezado)
        const titulo = temp.querySelector('h1, h2, h3');
        if (titulo) {
            rubrica.titulo = titulo.textContent.trim();
        }
        
        // Buscar tablas en el documento
        const tablas = temp.getElementsByTagName('table');
        if (tablas.length > 0) {
            const tabla = tablas[0]; // Usar la primera tabla encontrada
            
            // Procesar encabezados (niveles)
            const encabezados = tabla.querySelectorAll('tr:first-child td, tr:first-child th');
            const niveles = [];
            encabezados.forEach((encabezado, index) => {
                if (index > 0) { // Ignorar la primera columna (nombres de criterios)
                    niveles.push({
                        nivel: encabezado.textContent.trim(),
                        puntos: 4 - (index - 1) // Asignar puntajes descendentes
                    });
                }
            });
            
            // Procesar filas (criterios)
            const filas = tabla.querySelectorAll('tr:not(:first-child)');
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length > 0) {
                    const criterio = {
                        titulo: celdas[0].textContent.trim(),
                        niveles: []
                    };
                    
                    // Obtener descripciones para cada nivel
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

    // Función para descargar la plantilla de Excel
    function descargarPlantillaExcel() {
        // Crear el encabezado
        const headers = ['Criterio', 'Excelente', 'Bueno', 'Regular', 'Deficiente'];
        const puntajes = ['Puntaje', '4', '3', '2', '1'];
        
        // Crear datos de ejemplo
        const data = [
            headers,
            puntajes,
            ['Presentación', 'Muy organizado y claro', 'Organizado', 'Poco organizado', 'Desorganizado'],
            ['Contenido', 'Contenido completo', 'Contenido casi completo', 'Contenido incompleto', 'Contenido muy incompleto'],
            ['Ortografía', 'Sin errores', '1-2 errores', '3-4 errores', '5 o más errores']
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

    // Función para descargar la plantilla de Word
    function descargarPlantillaWord() {
        // Crear un elemento <a> con la ruta relativa al archivo
        const link = document.createElement('a');
        link.href = 'Plantillas/Plantilla Revision de Cuadernos.docx';
        link.download = 'Plantilla Revision de Cuadernos.docx';
        
        // Agregar el enlace al documento, hacer clic y luego removerlo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});