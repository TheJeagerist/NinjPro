// ================================
// APLICACIÓN SIMCE
// ================================

class SimceApp {
    constructor() {
        this.totalPreguntas = 0;
        this.cursoSeleccionado = null;
        this.estudiantes = [];
        this.resultados = [];
        this.cursosDisponibles = [];
        
        this.initializeApp();
        this.loadEventListeners();
        this.loadCursos();
    }

    initializeApp() {
        // Inicializar tema
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
        
        // Inicializar fondo animado
        if (typeof initAnimatedBackground === 'function') {
            initAnimatedBackground();
        }
        
        console.log('🎯 Aplicación SIMCE inicializada');
        this.debugLocalStorage();
    }

    debugLocalStorage() {
        console.log('🔍 === DEBUG SIMCE - DATOS DE GESTIÓN ===');
        
        // Verificar cursosData
        const cursosData = localStorage.getItem('cursosData');
        console.log('📚 cursosData en localStorage:', cursosData ? 'EXISTE' : 'NO EXISTE');
        
        if (cursosData) {
            try {
                const parsed = JSON.parse(cursosData);
                console.log('📊 Contenido de cursosData:', parsed);
                console.log('📈 Número de cursos:', Object.keys(parsed).length);
                
                Object.keys(parsed).forEach(curso => {
                    const estudiantes = parsed[curso];
                    console.log(`📝 Curso "${curso}":`, estudiantes.length, 'estudiantes');
                    if (estudiantes.length > 0) {
                        console.log('👤 Primer estudiante:', estudiantes[0]);
                    }
                });
            } catch (error) {
                console.error('❌ Error al parsear cursosData:', error);
            }
        }
        
        // Verificar otros formatos posibles
        const cursos = localStorage.getItem('cursos');
        console.log('📚 cursos en localStorage:', cursos ? 'EXISTE' : 'NO EXISTE');
        
        // Verificar librerías
        this.debugLibraries();
        
        console.log('🔍 === FIN DEBUG ===');
    }

    debugLibraries() {
        console.log('📚 === DEBUG LIBRERÍAS ===');
        
        // Verificar jsPDF
        console.log('📄 window.jsPDF:', typeof window.jsPDF);
        console.log('📄 window.jsPDF.jsPDF:', typeof (window.jsPDF && window.jsPDF.jsPDF));
        console.log('📄 window.jspdf:', typeof window.jspdf);
        
        // Verificar XLSX
        console.log('📊 window.XLSX:', typeof window.XLSX);
        
        // Probar creación de PDF
        this.testPDFCreation();
    }

    testPDFCreation() {
        console.log('🧪 === PRUEBA DE CREACIÓN PDF ===');
        
        try {
            let jsPDFClass = null;
            
            if (window.jsPDF && window.jsPDF.jsPDF) {
                jsPDFClass = window.jsPDF.jsPDF;
            } else if (window.jsPDF) {
                jsPDFClass = window.jsPDF;
            } else if (window.jspdf && window.jspdf.jsPDF) {
                jsPDFClass = window.jspdf.jsPDF;
            }
            
            if (jsPDFClass) {
                const testDoc = new jsPDFClass();
                testDoc.text('Prueba SIMCE', 20, 20);
                console.log('✅ PDF de prueba creado exitosamente');
                console.log('📄 Objeto PDF:', testDoc);
            } else {
                console.error('❌ No se pudo encontrar jsPDF para la prueba');
            }
            
        } catch (error) {
            console.error('❌ Error en prueba de PDF:', error);
        }
    }



    loadEventListeners() {
        // Botón volver al launcher
        const volverBtn = document.getElementById('volver-launcher');
        if (volverBtn) {
            volverBtn.addEventListener('click', () => this.volverAlLauncher());
        }

        // Configuración
        const totalPreguntasInput = document.getElementById('total-preguntas');
        const cursoSelect = document.getElementById('curso-select');
        
        if (totalPreguntasInput) {
            totalPreguntasInput.addEventListener('input', () => this.validateConfiguration());
        }
        
        if (cursoSelect) {
            cursoSelect.addEventListener('change', () => this.validateConfiguration());
        }

        // Botones de acción
        const cargarBtn = document.getElementById('cargar-estudiantes');
        const limpiarBtn = document.getElementById('limpiar-evaluacion');
        const calcularBtn = document.getElementById('calcular-resultados');
        const exportarExcelBtn = document.getElementById('exportar-excel');
        const exportarPdfBtn = document.getElementById('exportar-pdf');

        if (cargarBtn) {
            cargarBtn.addEventListener('click', () => this.cargarEstudiantes());
        }
        
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', () => this.limpiarEvaluacion());
        }
        
        if (calcularBtn) {
            calcularBtn.addEventListener('click', () => this.calcularResultados());
        }
        
        if (exportarExcelBtn) {
            exportarExcelBtn.addEventListener('click', () => this.exportarExcel());
        }
        
        if (exportarPdfBtn) {
            exportarPdfBtn.addEventListener('click', () => this.exportarPDF());
        }


    }

    volverAlLauncher() {
        if (this.hayDatosNoGuardados()) {
            if (confirm('¿Estás seguro de que quieres volver al launcher? Los datos no guardados se perderán.')) {
                window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'index.html';
        }
    }

    hayDatosNoGuardados() {
        return this.estudiantes.length > 0 && this.estudiantes.some(est => est.respuestasCorrectas !== null);
    }

    loadCursos() {
        try {
            // Cargar cursos desde localStorage (gestión de estudiantes)
            // El formato correcto es 'cursosData' no 'cursos'
            const cursosData = localStorage.getItem('cursosData');
            
            if (cursosData) {
                const cursosParseados = JSON.parse(cursosData);
                console.log('📚 Datos de cursos cargados:', cursosParseados);
                
                // Convertir del formato de gestión al formato esperado por SIMCE
                this.cursosDisponibles = [];
                
                if (typeof cursosParseados === 'object' && cursosParseados !== null) {
                    Object.keys(cursosParseados).forEach(nombreCurso => {
                        const estudiantesDelCurso = cursosParseados[nombreCurso] || [];
                        
                        // Convertir estudiantes al formato esperado
                        const estudiantesFormateados = estudiantesDelCurso.map((estudiante, index) => {
                            if (typeof estudiante === 'string') {
                                // Si es string, dividir en nombre y apellido
                                const partes = estudiante.split(' ');
                                return {
                                    id: index + 1,
                                    nombre: partes[0] || estudiante,
                                    apellido: partes.slice(1).join(' ') || ''
                                };
                            } else if (typeof estudiante === 'object' && estudiante !== null) {
                                // Si es objeto, usar los datos existentes
                                return {
                                    id: estudiante.id || index + 1,
                                    nombre: estudiante.nombre || 'Sin nombre',
                                    apellido: estudiante.apellido || ''
                                };
                            } else {
                                // Fallback
                                return {
                                    id: index + 1,
                                    nombre: `Estudiante ${index + 1}`,
                                    apellido: ''
                                };
                            }
                        });
                        
                        this.cursosDisponibles.push({
                            id: nombreCurso.replace(/\s+/g, '_').toLowerCase(),
                            nombre: nombreCurso,
                            estudiantes: estudiantesFormateados
                        });
                    });
                    
                    console.log('✅ Cursos convertidos para SIMCE:', this.cursosDisponibles);
                } else {
                    console.warn('Los datos de cursos no tienen el formato esperado');
                    this.cursosDisponibles = [];
                }
            } else {
                console.log('📝 No hay datos de cursos, usando ejemplos');
                // Datos de ejemplo si no hay cursos guardados
                this.cursosDisponibles = [
                    {
                        id: 'ejemplo1',
                        nombre: '8° Básico A (Ejemplo)',
                        estudiantes: [
                            { id: 1, nombre: 'Ana García', apellido: 'López' },
                            { id: 2, nombre: 'Carlos', apellido: 'Martínez' },
                            { id: 3, nombre: 'María', apellido: 'González' },
                            { id: 4, nombre: 'Pedro', apellido: 'Rodríguez' },
                            { id: 5, nombre: 'Sofía', apellido: 'Hernández' }
                        ]
                    },
                    {
                        id: 'ejemplo2',
                        nombre: '8° Básico B (Ejemplo)',
                        estudiantes: [
                            { id: 6, nombre: 'Diego', apellido: 'Silva' },
                            { id: 7, nombre: 'Valentina', apellido: 'Torres' },
                            { id: 8, nombre: 'Mateo', apellido: 'Vargas' },
                            { id: 9, nombre: 'Isabella', apellido: 'Morales' }
                        ]
                    }
                ];
            }
            
            // Validar que tengamos cursos disponibles
            if (!Array.isArray(this.cursosDisponibles) || this.cursosDisponibles.length === 0) {
                this.showNotification('No hay cursos disponibles. Configura cursos en Gestión de Estudiantes.', 'info');
                this.cursosDisponibles = [];
            }
            
            this.populateCursoSelect();
            
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            this.showNotification('Error al cargar los cursos. Usando datos de ejemplo.', 'warning');
            
            // Usar datos de ejemplo en caso de error
            this.cursosDisponibles = [
                {
                    id: 'ejemplo1',
                    nombre: '8° Básico A (Ejemplo)',
                    estudiantes: [
                        { id: 1, nombre: 'Ana García', apellido: 'López' },
                        { id: 2, nombre: 'Carlos', apellido: 'Martínez' },
                        { id: 3, nombre: 'María', apellido: 'González' }
                    ]
                }
            ];
            this.populateCursoSelect();
        }
    }

    populateCursoSelect() {
        const cursoSelect = document.getElementById('curso-select');
        if (!cursoSelect) return;

        // Limpiar opciones existentes
        cursoSelect.innerHTML = '<option value="">Seleccionar curso...</option>';

        if (!Array.isArray(this.cursosDisponibles) || this.cursosDisponibles.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay cursos disponibles - Configura en Gestión de Estudiantes';
            option.disabled = true;
            cursoSelect.appendChild(option);
            console.log('⚠️ No hay cursos disponibles para mostrar');
            return;
        }

        // Agregar cursos disponibles
        this.cursosDisponibles.forEach(curso => {
            // Validar que el curso tenga las propiedades necesarias
            if (!curso || !curso.id || !curso.nombre) {
                console.warn('⚠️ Curso inválido encontrado:', curso);
                return;
            }

            // Validar que tenga estudiantes
            const estudiantes = curso.estudiantes || [];
            const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;

            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.nombre} (${cantidadEstudiantes} estudiantes)`;
            cursoSelect.appendChild(option);
            
            console.log(`✅ Curso agregado: ${curso.nombre} con ${cantidadEstudiantes} estudiantes`);
        });
        
        console.log(`📊 Total de cursos disponibles: ${this.cursosDisponibles.length}`);
    }

    validateConfiguration() {
        const totalPreguntas = parseInt(document.getElementById('total-preguntas').value);
        const cursoId = document.getElementById('curso-select').value;
        const cargarBtn = document.getElementById('cargar-estudiantes');

        const isValid = totalPreguntas > 0 && cursoId;
        
        if (cargarBtn) {
            cargarBtn.disabled = !isValid;
        }

        return isValid;
    }

    cargarEstudiantes() {
        if (!this.validateConfiguration()) {
            this.showNotification('Por favor completa la configuración', 'warning');
            return;
        }

        this.totalPreguntas = parseInt(document.getElementById('total-preguntas').value);
        const cursoId = document.getElementById('curso-select').value;
        
        // Encontrar el curso seleccionado
        this.cursoSeleccionado = this.cursosDisponibles.find(curso => curso.id === cursoId);
        
        if (!this.cursoSeleccionado) {
            this.showNotification('Curso no encontrado', 'error');
            return;
        }

        // Validar que el curso tenga estudiantes
        const estudiantesCurso = this.cursoSeleccionado.estudiantes || [];
        if (!Array.isArray(estudiantesCurso) || estudiantesCurso.length === 0) {
            this.showNotification('El curso seleccionado no tiene estudiantes', 'warning');
            return;
        }

        // Preparar estudiantes para evaluación
        this.estudiantes = estudiantesCurso.map(estudiante => ({
            ...estudiante,
            respuestasCorrectas: null,
            porcentaje: 0,
            resultadoSimce: 0,
            evaluado: false
        }));

        this.updateEvaluationStatus();
        this.renderStudentsTable();
        this.showEvaluationArea();
        this.enableActionButtons();
        
        this.showNotification(`${this.estudiantes.length} estudiantes cargados correctamente`, 'success');
    }

    updateEvaluationStatus() {
        const statusElement = document.getElementById('evaluation-status');
        const statusText = document.querySelector('.status-text');
        
        if (statusElement && statusText) {
            statusElement.classList.add('active');
            statusText.textContent = `Evaluación configurada - ${this.totalPreguntas} preguntas`;
        }

        // Actualizar información del curso
        const cursoNombre = document.getElementById('curso-nombre');
        const totalEstudiantes = document.getElementById('total-estudiantes');
        const preguntasInfo = document.getElementById('preguntas-info');

        if (cursoNombre) cursoNombre.textContent = this.cursoSeleccionado.nombre;
        if (totalEstudiantes) totalEstudiantes.textContent = `${this.estudiantes.length} estudiantes`;
        if (preguntasInfo) preguntasInfo.textContent = `${this.totalPreguntas} preguntas totales`;
    }

    showEvaluationArea() {
        const evaluationArea = document.getElementById('evaluation-area');
        if (evaluationArea) {
            evaluationArea.style.display = 'block';
        }
    }

    renderStudentsTable() {
        const tbody = document.getElementById('students-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.estudiantes.forEach((estudiante, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${estudiante.nombre} ${estudiante.apellido}</strong>
                </td>
                <td>
                    <input type="number" 
                           class="student-input" 
                           id="input-${index}"
                           min="0" 
                           max="${this.totalPreguntas}" 
                           placeholder="0"
                           value="${estudiante.respuestasCorrectas || ''}"
                           data-student-index="${index}">
                    <small>/ ${this.totalPreguntas}</small>
                </td>
                <td class="percentage-cell" id="percentage-${index}">
                    ${estudiante.porcentaje.toFixed(1)}%
                </td>
                <td class="simce-result" id="simce-${index}">
                    ${estudiante.resultadoSimce.toFixed(1)}
                </td>
                <td>
                    <span class="status-badge ${estudiante.evaluado ? 'status-completed' : 'status-pending'}" 
                          id="status-${index}">
                        ${estudiante.evaluado ? 'Evaluado' : 'Pendiente'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);

            // Agregar event listener al input
            const input = row.querySelector('.student-input');
            if (input) {
                input.addEventListener('input', (e) => this.updateStudentResult(index, e.target.value));
                input.addEventListener('blur', (e) => this.validateStudentInput(index, e.target.value));
            }
        });
    }

    updateStudentResult(index, value) {
        const respuestasCorrectas = parseInt(value) || 0;
        
        if (respuestasCorrectas > this.totalPreguntas) {
            this.showNotification(`No puede ser mayor a ${this.totalPreguntas} preguntas`, 'warning');
            return;
        }

        const estudiante = this.estudiantes[index];
        estudiante.respuestasCorrectas = respuestasCorrectas;
        estudiante.porcentaje = (respuestasCorrectas / this.totalPreguntas) * 100;
        estudiante.resultadoSimce = estudiante.porcentaje * 4; // Multiplicar por 4 según especificación
        estudiante.evaluado = respuestasCorrectas > 0;

        // Actualizar UI
        const percentageCell = document.getElementById(`percentage-${index}`);
        const simceCell = document.getElementById(`simce-${index}`);
        const statusBadge = document.getElementById(`status-${index}`);

        if (percentageCell) percentageCell.textContent = `${estudiante.porcentaje.toFixed(1)}%`;
        if (simceCell) simceCell.textContent = estudiante.resultadoSimce.toFixed(1);
        
        if (statusBadge) {
            statusBadge.textContent = estudiante.evaluado ? 'Evaluado' : 'Pendiente';
            statusBadge.className = `status-badge ${estudiante.evaluado ? 'status-completed' : 'status-pending'}`;
        }

        this.updateProgress();
    }

    validateStudentInput(index, value) {
        const input = document.getElementById(`input-${index}`);
        const respuestasCorrectas = parseInt(value) || 0;

        if (respuestasCorrectas > this.totalPreguntas) {
            if (input) input.value = this.totalPreguntas;
            this.updateStudentResult(index, this.totalPreguntas);
        } else if (respuestasCorrectas < 0) {
            if (input) input.value = 0;
            this.updateStudentResult(index, 0);
        }
    }

    updateProgress() {
        const evaluados = this.estudiantes.filter(est => est.evaluado).length;
        const total = this.estudiantes.length;
        const porcentaje = (evaluados / total) * 100;

        const estudiantesEvaluados = document.getElementById('estudiantes-evaluados');
        const totalEstudiantesCount = document.getElementById('total-estudiantes-count');
        const progressFill = document.getElementById('progress-fill');

        if (estudiantesEvaluados) estudiantesEvaluados.textContent = evaluados;
        if (totalEstudiantesCount) totalEstudiantesCount.textContent = total;
        if (progressFill) progressFill.style.width = `${porcentaje}%`;

        // Habilitar botón de calcular si hay al menos un estudiante evaluado
        const calcularBtn = document.getElementById('calcular-resultados');
        if (calcularBtn) {
            calcularBtn.disabled = evaluados === 0;
        }
    }

    calcularResultados() {
        const estudiantesEvaluados = this.estudiantes.filter(est => est.evaluado);
        
        if (estudiantesEvaluados.length === 0) {
            this.showNotification('No hay estudiantes evaluados', 'warning');
            return;
        }

        // Calcular estadísticas
        const resultadosSimce = estudiantesEvaluados.map(est => est.resultadoSimce);
        const promedio = resultadosSimce.reduce((sum, val) => sum + val, 0) / resultadosSimce.length;
        const maximo = Math.max(...resultadosSimce);
        const minimo = Math.min(...resultadosSimce);

        // Actualizar resumen
        this.updateResultsSummary(promedio, maximo, minimo, estudiantesEvaluados.length);
        this.generateChart(resultadosSimce);
        this.showResultsSummary();
        this.enableExportButtons();

        this.showNotification('Resultados calculados correctamente', 'success');
    }

    updateResultsSummary(promedio, maximo, minimo, totalEvaluados) {
        const promedioElement = document.getElementById('promedio-simce');
        const maximoElement = document.getElementById('maximo-simce');
        const minimoElement = document.getElementById('minimo-simce');
        const totalEvaluadosElement = document.getElementById('total-evaluados');

        if (promedioElement) promedioElement.textContent = promedio.toFixed(1);
        if (maximoElement) maximoElement.textContent = maximo.toFixed(1);
        if (minimoElement) minimoElement.textContent = minimo.toFixed(1);
        if (totalEvaluadosElement) totalEvaluadosElement.textContent = totalEvaluados;
    }

    generateChart(resultados) {
        const chartBars = document.getElementById('chart-bars');
        if (!chartBars) return;

        // Crear rangos para el gráfico
        const rangos = [
            { label: '0-100', min: 0, max: 100 },
            { label: '101-200', min: 101, max: 200 },
            { label: '201-300', min: 201, max: 300 },
            { label: '301-400', min: 301, max: 400 }
        ];

        const distribucion = rangos.map(rango => {
            const count = resultados.filter(resultado => 
                resultado >= rango.min && resultado <= rango.max
            ).length;
            return { ...rango, count };
        });

        const maxCount = Math.max(...distribucion.map(d => d.count));
        
        chartBars.innerHTML = '';
        
        distribucion.forEach(item => {
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar';
            
            const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            barContainer.innerHTML = `
                <div class="chart-bar-label">${item.label}</div>
                <div class="chart-bar-fill" style="width: ${width}%"></div>
                <div class="chart-bar-value">${item.count}</div>
            `;
            
            chartBars.appendChild(barContainer);
        });
    }

    showResultsSummary() {
        const resultsSummary = document.getElementById('results-summary');
        if (resultsSummary) {
            resultsSummary.style.display = 'block';
        }
    }

    enableActionButtons() {
        const calcularBtn = document.getElementById('calcular-resultados');
        if (calcularBtn) {
            calcularBtn.disabled = false;
        }
    }

    enableExportButtons() {
        const exportarExcelBtn = document.getElementById('exportar-excel');
        const exportarPdfBtn = document.getElementById('exportar-pdf');
        
        if (exportarExcelBtn) exportarExcelBtn.disabled = false;
        if (exportarPdfBtn) exportarPdfBtn.disabled = false;
    }

    limpiarEvaluacion() {
        if (this.estudiantes.length > 0) {
            if (!confirm('¿Estás seguro de que quieres limpiar toda la evaluación?')) {
                return;
            }
        }

        // Resetear datos
        this.totalPreguntas = 0;
        this.cursoSeleccionado = null;
        this.estudiantes = [];
        this.resultados = [];

        // Resetear UI
        document.getElementById('total-preguntas').value = '';
        document.getElementById('curso-select').value = '';
        
        const statusElement = document.getElementById('evaluation-status');
        const statusText = document.querySelector('.status-text');
        
        if (statusElement) statusElement.classList.remove('active');
        if (statusText) statusText.textContent = 'Sin evaluación configurada';

        // Ocultar áreas
        const evaluationArea = document.getElementById('evaluation-area');
        const resultsSummary = document.getElementById('results-summary');
        
        if (evaluationArea) evaluationArea.style.display = 'none';
        if (resultsSummary) resultsSummary.style.display = 'none';

        // Deshabilitar botones
        this.disableAllButtons();

        this.showNotification('Evaluación limpiada correctamente', 'info');
    }

    disableAllButtons() {
        const buttons = [
            'cargar-estudiantes',
            'calcular-resultados', 
            'exportar-excel',
            'exportar-pdf'
        ];

        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) button.disabled = true;
        });
    }

    exportarExcel() {
        if (!window.XLSX) {
            this.showNotification('Librería de Excel no disponible', 'error');
            return;
        }

        try {
            const estudiantesEvaluados = this.estudiantes.filter(est => est.evaluado);
            
            if (estudiantesEvaluados.length === 0) {
                this.showNotification('No hay datos para exportar', 'warning');
                return;
            }

            // Preparar datos para Excel
            const data = [
                ['EVALUACIÓN SIMCE'],
                ['Curso:', this.cursoSeleccionado.nombre],
                ['Total de Preguntas:', this.totalPreguntas],
                ['Fecha:', new Date().toLocaleDateString()],
                [''],
                ['Estudiante', 'Respuestas Correctas', 'Porcentaje', 'Resultado SIMCE']
            ];

            estudiantesEvaluados.forEach(estudiante => {
                data.push([
                    `${estudiante.nombre} ${estudiante.apellido}`,
                    estudiante.respuestasCorrectas,
                    `${estudiante.porcentaje.toFixed(1)}%`,
                    estudiante.resultadoSimce.toFixed(1)
                ]);
            });

            // Agregar estadísticas
            const resultadosSimce = estudiantesEvaluados.map(est => est.resultadoSimce);
            const promedio = resultadosSimce.reduce((sum, val) => sum + val, 0) / resultadosSimce.length;
            const maximo = Math.max(...resultadosSimce);
            const minimo = Math.min(...resultadosSimce);

            data.push(['']);
            data.push(['ESTADÍSTICAS']);
            data.push(['Promedio SIMCE:', promedio.toFixed(1)]);
            data.push(['Resultado Máximo:', maximo.toFixed(1)]);
            data.push(['Resultado Mínimo:', minimo.toFixed(1)]);
            data.push(['Estudiantes Evaluados:', estudiantesEvaluados.length]);

            // Crear workbook y worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);

            // Agregar worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Resultados SIMCE');

            // Generar archivo
            const filename = `SIMCE_${this.cursoSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

            this.showNotification('Archivo Excel exportado correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            this.showNotification('Error al exportar archivo Excel', 'error');
        }
    }

    exportarPDF() {
        console.log('🔍 Iniciando exportación PDF...');
        console.log('📦 window.jsPDF disponible:', !!window.jsPDF);
        console.log('📦 Tipo de window.jsPDF:', typeof window.jsPDF);
        
        // Verificar diferentes formas de acceso a jsPDF
        let jsPDFClass = null;
        
        if (window.jsPDF && window.jsPDF.jsPDF) {
            // Formato UMD moderno
            jsPDFClass = window.jsPDF.jsPDF;
            console.log('✅ Usando window.jsPDF.jsPDF (UMD)');
        } else if (window.jsPDF) {
            // Formato directo
            jsPDFClass = window.jsPDF;
            console.log('✅ Usando window.jsPDF (directo)');
        } else if (window.jspdf && window.jspdf.jsPDF) {
            // Formato alternativo
            jsPDFClass = window.jspdf.jsPDF;
            console.log('✅ Usando window.jspdf.jsPDF');
        } else {
            console.error('❌ jsPDF no encontrado en ningún formato');
            this.showNotification('Librería de PDF no disponible. Recargue la página e intente nuevamente.', 'error');
            return;
        }

        try {
            const estudiantesEvaluados = this.estudiantes.filter(est => est.evaluado);
            
            if (estudiantesEvaluados.length === 0) {
                this.showNotification('No hay datos para exportar', 'warning');
                return;
            }

            console.log('📊 Creando documento PDF...');
            const doc = new jsPDFClass();

            // Título
            doc.setFontSize(20);
            doc.text('EVALUACIÓN SIMCE', 20, 30);

            // Información del curso
            doc.setFontSize(12);
            doc.text(`Curso: ${this.cursoSeleccionado.nombre}`, 20, 50);
            doc.text(`Total de Preguntas: ${this.totalPreguntas}`, 20, 60);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 70);

            // Tabla de resultados
            let yPosition = 90;
            doc.setFontSize(14);
            doc.text('RESULTADOS POR ESTUDIANTE', 20, yPosition);
            
            yPosition += 20;
            doc.setFontSize(10);
            
            // Headers
            doc.text('Estudiante', 20, yPosition);
            doc.text('Resp. Correctas', 80, yPosition);
            doc.text('Porcentaje', 130, yPosition);
            doc.text('Resultado SIMCE', 160, yPosition);
            
            yPosition += 10;
            
            // Línea separadora
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;

            // Datos de estudiantes
            estudiantesEvaluados.forEach(estudiante => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                doc.text(`${estudiante.nombre} ${estudiante.apellido}`, 20, yPosition);
                doc.text(estudiante.respuestasCorrectas.toString(), 80, yPosition);
                doc.text(`${estudiante.porcentaje.toFixed(1)}%`, 130, yPosition);
                doc.text(estudiante.resultadoSimce.toFixed(1), 160, yPosition);
                
                yPosition += 10;
            });

            // Estadísticas
            const resultadosSimce = estudiantesEvaluados.map(est => est.resultadoSimce);
            const promedio = resultadosSimce.reduce((sum, val) => sum + val, 0) / resultadosSimce.length;
            const maximo = Math.max(...resultadosSimce);
            const minimo = Math.min(...resultadosSimce);

            yPosition += 20;
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }

            doc.setFontSize(14);
            doc.text('ESTADÍSTICAS', 20, yPosition);
            
            yPosition += 20;
            doc.setFontSize(12);
            doc.text(`Promedio SIMCE: ${promedio.toFixed(1)}`, 20, yPosition);
            doc.text(`Resultado Máximo: ${maximo.toFixed(1)}`, 20, yPosition + 10);
            doc.text(`Resultado Mínimo: ${minimo.toFixed(1)}`, 20, yPosition + 20);
            doc.text(`Estudiantes Evaluados: ${estudiantesEvaluados.length}`, 20, yPosition + 30);

            // Guardar PDF
            const filename = `SIMCE_${this.cursoSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('💾 Guardando PDF como:', filename);
            
            doc.save(filename);
            console.log('✅ PDF exportado exitosamente');

            this.showNotification('Archivo PDF exportado correctamente', 'success');
        } catch (error) {
            console.error('❌ Error detallado al exportar PDF:', error);
            console.error('❌ Stack trace:', error.stack);
            
            // Mensaje de error más específico
            let errorMessage = 'Error al exportar archivo PDF';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Colores según tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// ================================
// INICIALIZACIÓN
// ================================

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.simceApp = new SimceApp();
});

// Función para navegación desde el launcher
function navigateToSimce() {
    window.location.href = 'simce.html';
} 