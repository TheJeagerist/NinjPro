// ================================
// EVALUACIÓN SIMPLE - JAVASCRIPT
// ================================

class EvaluacionSimpleApp {
    constructor() {
        this.cursos = [];
        this.estudiantesActuales = [];
        this.configuracion = {
            puntajeMaximo: 70,
            exigencia: 60,
            notaMinima: 1.0,
            notaMaxima: 7.0,
            notaAprobacion: 4.0
        };
        
        this.init();
    }

    init() {
        this.cargarCursos();
        this.setupEventListeners();
        this.actualizarEstadoEvaluacion();
        
        // Listener para detectar cambios en los cursos desde gestión de estudiantes
        window.addEventListener('cursosActualizados', (event) => {
            console.log('Cursos actualizados detectados, recargando...');
            this.cargarCursos();
        });
        
        // También detectar cambios en localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'cursosData') {
                console.log('Cambios en cursosData detectados, recargando...');
                this.cargarCursos();
            }
        });
    }

    setupEventListeners() {
        // Botón volver
        document.getElementById('volver-launcher').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Configuración
        document.getElementById('curso-select').addEventListener('change', this.onCursoChange.bind(this));
        document.getElementById('cargar-estudiantes').addEventListener('click', this.cargarEstudiantes.bind(this));
        document.getElementById('limpiar-evaluacion').addEventListener('click', this.limpiarEvaluacion.bind(this));

        // Acciones rápidas
        document.getElementById('calcular-todas').addEventListener('click', this.calcularTodasLasNotas.bind(this));
        document.getElementById('marcar-evaluados').addEventListener('click', this.marcarComoEvaluados.bind(this));
        document.getElementById('limpiar-puntajes').addEventListener('click', this.limpiarPuntajes.bind(this));
        document.getElementById('exportar-excel').addEventListener('click', this.exportarExcel.bind(this));

        // Configuración de escala - actualización en tiempo real
        ['puntaje-maximo', 'exigencia', 'nota-minima', 'nota-maxima', 'nota-aprobacion'].forEach(id => {
            document.getElementById(id).addEventListener('input', this.onConfiguracionChange.bind(this));
        });
    }

    cargarCursos() {
        try {
            // Cargar cursos desde localStorage (compartido con gestión de estudiantes)
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            
            // Convertir cursosData a formato esperado
            this.cursos = [];
            Object.keys(cursosData).forEach(nombreCurso => {
                // Verificar y convertir el formato de estudiantes si es necesario
                const estudiantesCurso = cursosData[nombreCurso] || [];
                const estudiantesFormateados = estudiantesCurso.map(estudiante => {
                    // Si el estudiante ya tiene el formato correcto (con nombre y apellido), mantenerlo
                    if (typeof estudiante === 'object' && estudiante.nombre) {
                        return {
                            nombre: estudiante.nombre,
                            apellido: estudiante.apellido || '',
                            id: estudiante.id || Math.random().toString(36).substr(2, 9)
                        };
                    }
                    // Si es solo un string, convertirlo al formato esperado
                    else if (typeof estudiante === 'string') {
                        const partesNombre = estudiante.trim().split(' ');
                        return {
                            nombre: partesNombre[0] || estudiante,
                            apellido: partesNombre.slice(1).join(' ') || '',
                            id: Math.random().toString(36).substr(2, 9)
                        };
                    }
                    // Si tiene formato básico con solo nombre
                    else {
                        return {
                            nombre: estudiante.nombre || 'Estudiante',
                            apellido: '',
                            id: estudiante.id || Math.random().toString(36).substr(2, 9)
                        };
                    }
                });
                
                this.cursos.push({
                    nombre: nombreCurso,
                    estudiantes: estudiantesFormateados
                });
            });
            
            const select = document.getElementById('curso-select');
            select.innerHTML = '<option value="">Seleccionar curso...</option>';
            
            this.cursos.forEach((curso, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${curso.nombre} (${curso.estudiantes.length} estudiantes)`;
                select.appendChild(option);
            });

            if (this.cursos.length === 0) {
                this.mostrarNotificacion('No hay cursos disponibles. Crea cursos desde Gestión de Estudiantes.', 'warning');
            }
            
            console.log('Cursos cargados:', this.cursos);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            this.mostrarNotificacion('Error al cargar cursos', 'error');
        }
    }

    onCursoChange() {
        const select = document.getElementById('curso-select');
        const loadButton = document.getElementById('cargar-estudiantes');
        
        if (select.value !== '') {
            loadButton.disabled = false;
            loadButton.classList.add('btn-primary');
        } else {
            loadButton.disabled = true;
            loadButton.classList.remove('btn-primary');
        }
    }

    onConfiguracionChange() {
        this.configuracion = {
            puntajeMaximo: parseFloat(document.getElementById('puntaje-maximo').value) || 70,
            exigencia: parseFloat(document.getElementById('exigencia').value) || 60,
            notaMinima: parseFloat(document.getElementById('nota-minima').value) || 1.0,
            notaMaxima: parseFloat(document.getElementById('nota-maxima').value) || 7.0,
            notaAprobacion: parseFloat(document.getElementById('nota-aprobacion').value) || 4.0
        };

        this.actualizarInfoEscala();
        this.recalcularTodasLasNotas();
    }

    cargarEstudiantes() {
        const select = document.getElementById('curso-select');
        const cursoIndex = parseInt(select.value);
        
        if (isNaN(cursoIndex) || !this.cursos[cursoIndex]) {
            this.mostrarNotificacion('Selecciona un curso válido', 'error');
            return;
        }

        const curso = this.cursos[cursoIndex];
        this.estudiantesActuales = curso.estudiantes.map(est => ({
            ...est,
            puntaje: null,
            nota: null,
            porcentaje: null,
            evaluado: false
        }));

        this.mostrarAreaEvaluacion();
        this.actualizarInfoCurso(curso);
        this.renderizarTablaEstudiantes();
        this.habilitarAcciones();
        this.mostrarNotificacion(`${curso.estudiantes.length} estudiantes cargados correctamente`, 'success');
    }

    mostrarAreaEvaluacion() {
        document.getElementById('evaluation-area').style.display = 'block';
        document.getElementById('results-summary').style.display = 'block';
    }

    actualizarInfoCurso(curso) {
        document.getElementById('curso-nombre').textContent = curso.nombre;
        document.getElementById('total-estudiantes').textContent = `${curso.estudiantes.length} estudiantes`;
        document.getElementById('total-estudiantes-count').textContent = curso.estudiantes.length;
        this.actualizarInfoEscala();
    }

    actualizarInfoEscala() {
        const puntajeAprobacion = Math.ceil((this.configuracion.puntajeMaximo * this.configuracion.exigencia) / 100);
        document.getElementById('escala-info').textContent = 
            `Escala: 0 - ${this.configuracion.puntajeMaximo} pts (${this.configuracion.exigencia}% exigencia = ${puntajeAprobacion} pts para aprobar)`;
    }

    renderizarTablaEstudiantes() {
        const tbody = document.getElementById('students-tbody');
        tbody.innerHTML = '';

        this.estudiantesActuales.forEach((estudiante, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="student-name">${estudiante.nombre} ${estudiante.apellido}</td>
                <td>
                    <input type="number" 
                           class="score-input" 
                           data-index="${index}"
                           min="0" 
                           max="${this.configuracion.puntajeMaximo}"
                           placeholder="0-${this.configuracion.puntajeMaximo}"
                           value="${estudiante.puntaje || ''}"
                           onchange="app.onPuntajeChange(${index}, this.value)">
                </td>
                <td class="percentage-display" id="percentage-${index}">
                    ${estudiante.porcentaje ? estudiante.porcentaje.toFixed(1) + '%' : '-'}
                </td>
                <td>
                    <span class="grade-display ${this.getGradeClass(estudiante.nota)}" id="grade-${index}">
                        ${estudiante.nota ? estudiante.nota.toFixed(1) : '-'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getStatusClass(estudiante)}" id="status-${index}">
                        ${this.getStatusText(estudiante)}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    onPuntajeChange(index, puntaje) {
        if (index < 0 || index >= this.estudiantesActuales.length) return;

        const estudiante = this.estudiantesActuales[index];
        const puntajeNum = parseFloat(puntaje);

        if (isNaN(puntajeNum) || puntaje === '') {
            estudiante.puntaje = null;
            estudiante.nota = null;
            estudiante.porcentaje = null;
            estudiante.evaluado = false;
        } else {
            if (puntajeNum < 0 || puntajeNum > this.configuracion.puntajeMaximo) {
                this.mostrarNotificacion(`Puntaje debe estar entre 0 y ${this.configuracion.puntajeMaximo}`, 'error');
                return;
            }
            
            estudiante.puntaje = puntajeNum;
            estudiante.porcentaje = (puntajeNum / this.configuracion.puntajeMaximo) * 100;
            estudiante.nota = this.calcularNota(puntajeNum);
            estudiante.evaluado = true;
        }

        this.actualizarFilaEstudiante(index);
        this.actualizarProgreso();
        this.actualizarEstadisticas();
    }

    calcularNota(puntaje) {
        // Usar más precisión para evitar errores de punto flotante
        const puntajeNum = Number(puntaje);
        const puntajeMaximo = Number(this.configuracion.puntajeMaximo);
        const porcentajeExigencia = Number(this.configuracion.exigencia);
        const notaMinima = Number(this.configuracion.notaMinima);
        const notaMaxima = Number(this.configuracion.notaMaxima);
        const notaAprobacion = Number(this.configuracion.notaAprobacion);
        
        // Calcular porcentaje con más precisión
        const porcentaje = (puntajeNum * 100) / puntajeMaximo;
        
        let nota;
        
        if (porcentaje < porcentajeExigencia) {
            // Zona de reprobación
            const factor = porcentaje / porcentajeExigencia;
            nota = notaMinima + (notaAprobacion - notaMinima) * factor;
        } else {
            // Zona de aprobación
            const factor = (porcentaje - porcentajeExigencia) / (100 - porcentajeExigencia);
            nota = notaAprobacion + (notaMaxima - notaAprobacion) * factor;
        }
        
        // Redondear a 2 decimales internamente para evitar errores de precisión,
        // luego redondear a 1 decimal para mostrar
        return Math.round(nota * 100) / 100;
    }

    actualizarFilaEstudiante(index) {
        const estudiante = this.estudiantesActuales[index];
        
        // Actualizar porcentaje
        const percentageElement = document.getElementById(`percentage-${index}`);
        if (percentageElement) {
            percentageElement.textContent = estudiante.porcentaje ? estudiante.porcentaje.toFixed(1) + '%' : '-';
        }

        // Actualizar nota
        const gradeElement = document.getElementById(`grade-${index}`);
        if (gradeElement) {
            gradeElement.textContent = estudiante.nota ? this.formatearNota(estudiante.nota) : '-';
            gradeElement.className = `grade-display ${this.getGradeClass(estudiante.nota)}`;
        }

        // Actualizar estado
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.textContent = this.getStatusText(estudiante);
            statusElement.className = `status-badge ${this.getStatusClass(estudiante)}`;
        }
    }

    getGradeClass(nota) {
        if (!nota) return '';
        return nota >= this.configuracion.notaAprobacion ? 'grade-approved' : 'grade-failed';
    }

    getStatusClass(estudiante) {
        if (!estudiante.evaluado) return 'status-empty';
        return estudiante.nota >= this.configuracion.notaAprobacion ? 'status-evaluated' : 'status-pending';
    }

    getStatusText(estudiante) {
        if (!estudiante.evaluado) return 'Sin evaluar';
        return estudiante.nota >= this.configuracion.notaAprobacion ? 'Aprobado' : 'Reprobado';
    }

    formatearNota(nota) {
        // Redondear correctamente a 1 decimal
        return (Math.round(nota * 10) / 10).toFixed(1);
    }

    actualizarProgreso() {
        const evaluados = this.estudiantesActuales.filter(est => est.evaluado).length;
        const total = this.estudiantesActuales.length;
        const porcentaje = total > 0 ? (evaluados / total) * 100 : 0;

        document.getElementById('estudiantes-evaluados').textContent = evaluados;
        document.getElementById('progress-fill').style.width = `${porcentaje}%`;
    }

    actualizarEstadisticas() {
        const evaluados = this.estudiantesActuales.filter(est => est.evaluado);
        
        if (evaluados.length === 0) {
            document.getElementById('promedio-nota').textContent = '0.0';
            document.getElementById('maximo-nota').textContent = '0.0';
            document.getElementById('minimo-nota').textContent = '0.0';
            document.getElementById('total-evaluados').textContent = '0';
            document.getElementById('total-aprobados').textContent = '0';
            document.getElementById('total-reprobados').textContent = '0';
            return;
        }

        const notas = evaluados.map(est => est.nota);
        const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
        const maximo = Math.max(...notas);
        const minimo = Math.min(...notas);
        const aprobados = evaluados.filter(est => est.nota >= this.configuracion.notaAprobacion).length;
        const reprobados = evaluados.length - aprobados;

        document.getElementById('promedio-nota').textContent = this.formatearNota(promedio);
        document.getElementById('maximo-nota').textContent = this.formatearNota(maximo);
        document.getElementById('minimo-nota').textContent = this.formatearNota(minimo);
        document.getElementById('total-evaluados').textContent = evaluados.length;
        document.getElementById('total-aprobados').textContent = aprobados;
        document.getElementById('total-reprobados').textContent = reprobados;

        this.actualizarGrafico(notas);
    }

    actualizarGrafico(notas) {
        const chartContainer = document.getElementById('chart-bars');
        chartContainer.innerHTML = '';

        // Crear rangos de notas específicos
        const rangos = [
            { min: 1.0, max: 1.9, label: '1.0 - 1.9', count: 0, color: '#ff6b6b' },
            { min: 2.0, max: 2.9, label: '2.0 - 2.9', count: 0, color: '#ffa726' },
            { min: 3.0, max: 3.9, label: '3.0 - 3.9', count: 0, color: '#ffeb3b' },
            { min: 4.0, max: 4.9, label: '4.0 - 4.9', count: 0, color: '#4caf50' },
            { min: 5.0, max: 5.9, label: '5.0 - 5.9', count: 0, color: '#2196f3' },
            { min: 6.0, max: 7.0, label: '6.0 - 7.0', count: 0, color: '#9c27b0' }
        ];

        // Contar notas por rango
        notas.forEach(nota => {
            for (let rango of rangos) {
                if (nota >= rango.min && nota <= rango.max) {
                    rango.count++;
                    break;
                }
            }
        });

        const total = notas.length;
        if (total === 0) {
            chartContainer.innerHTML = '<p style="text-align: center; color: #8594a6; padding: 2rem;">No hay datos para mostrar</p>';
            return;
        }

        // Crear gráfico de torta SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 200 200');
        svg.setAttribute('class', 'pie-chart');

        let currentAngle = 0;
        const centerX = 100;
        const centerY = 100;
        const radius = 80;

        // Crear las porciones del gráfico
        rangos.forEach((rango, index) => {
            if (rango.count > 0) {
                const percentage = (rango.count / total) * 100;
                const angle = (rango.count / total) * 360;
                
                // Calcular coordenadas del arco
                const startAngle = currentAngle * Math.PI / 180;
                const endAngle = (currentAngle + angle) * Math.PI / 180;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const largeArc = angle > 180 ? 1 : 0;
                
                // Crear path del arco
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');
                
                path.setAttribute('d', pathData);
                path.setAttribute('fill', rango.color);
                path.setAttribute('class', 'pie-slice');
                path.setAttribute('data-label', rango.label);
                path.setAttribute('data-count', rango.count);
                path.setAttribute('data-percentage', percentage.toFixed(1));
                path.title = `${rango.label}: ${rango.count} estudiante${rango.count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`;
                
                // Agregar eventos de hover
                path.addEventListener('mouseenter', (e) => {
                    this.mostrarTooltipGrafico(e, rango.label, rango.count, percentage.toFixed(1));
                });
                
                path.addEventListener('mouseleave', () => {
                    this.ocultarTooltipGrafico();
                });
                
                svg.appendChild(path);
                currentAngle += angle;
            }
        });

        chartContainer.appendChild(svg);

        // Crear leyenda
        const legend = document.createElement('div');
        legend.className = 'pie-legend';
        
        rangos.forEach(rango => {
            if (rango.count > 0) {
                const percentage = ((rango.count / total) * 100).toFixed(1);
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color" style="background-color: ${rango.color}"></div>
                    <div class="legend-text">
                        <span class="legend-label">${rango.label}</span>
                        <span class="legend-value">${rango.count} (${percentage}%)</span>
                    </div>
                `;
                legend.appendChild(legendItem);
            }
        });

        chartContainer.appendChild(legend);
    }

    // Acciones rápidas
    calcularTodasLasNotas() {
        let calculadas = 0;
        this.estudiantesActuales.forEach((estudiante, index) => {
            if (estudiante.puntaje !== null && !isNaN(estudiante.puntaje)) {
                estudiante.porcentaje = (estudiante.puntaje / this.configuracion.puntajeMaximo) * 100;
                estudiante.nota = this.calcularNota(estudiante.puntaje);
                estudiante.evaluado = true;
                this.actualizarFilaEstudiante(index);
                calculadas++;
            }
        });

        this.actualizarProgreso();
        this.actualizarEstadisticas();
        this.mostrarNotificacion(`${calculadas} notas calculadas`, 'success');
    }

    marcarComoEvaluados() {
        let marcados = 0;
        this.estudiantesActuales.forEach((estudiante, index) => {
            if (estudiante.nota !== null) {
                estudiante.evaluado = true;
                this.actualizarFilaEstudiante(index);
                marcados++;
            }
        });

        this.actualizarProgreso();
        this.mostrarNotificacion(`${marcados} estudiantes marcados como evaluados`, 'success');
    }

    limpiarPuntajes() {
        if (!confirm('¿Estás seguro de que deseas limpiar todos los puntajes?')) {
            return;
        }

        this.estudiantesActuales.forEach((estudiante, index) => {
            estudiante.puntaje = null;
            estudiante.nota = null;
            estudiante.porcentaje = null;
            estudiante.evaluado = false;
            
            const input = document.querySelector(`input[data-index="${index}"]`);
            if (input) input.value = '';
            
            this.actualizarFilaEstudiante(index);
        });

        this.actualizarProgreso();
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Todos los puntajes han sido limpiados', 'success');
    }

    recalcularTodasLasNotas() {
        if (this.estudiantesActuales.length === 0) return;

        this.estudiantesActuales.forEach((estudiante, index) => {
            if (estudiante.puntaje !== null && !isNaN(estudiante.puntaje)) {
                estudiante.porcentaje = (estudiante.puntaje / this.configuracion.puntajeMaximo) * 100;
                estudiante.nota = this.calcularNota(estudiante.puntaje);
                this.actualizarFilaEstudiante(index);
            }
        });

        this.actualizarProgreso();
        this.actualizarEstadisticas();
    }

    limpiarEvaluacion() {
        if (!confirm('¿Estás seguro de que deseas limpiar toda la evaluación?')) {
            return;
        }

        this.estudiantesActuales = [];
        document.getElementById('curso-select').value = '';
        document.getElementById('evaluation-area').style.display = 'none';
        document.getElementById('results-summary').style.display = 'none';
        
        this.deshabilitarAcciones();
        this.actualizarEstadoEvaluacion();
        this.mostrarNotificacion('Evaluación limpiada', 'success');
    }

    habilitarAcciones() {
        const botones = ['calcular-todas', 'marcar-evaluados', 'limpiar-puntajes', 'exportar-excel'];
        botones.forEach(id => {
            document.getElementById(id).disabled = false;
        });
    }

    deshabilitarAcciones() {
        const botones = ['calcular-todas', 'marcar-evaluados', 'limpiar-puntajes', 'exportar-excel'];
        botones.forEach(id => {
            document.getElementById(id).disabled = true;
        });
    }

    actualizarEstadoEvaluacion() {
        const status = document.getElementById('evaluation-status');
        const statusText = status.querySelector('.status-text');
        
        if (this.estudiantesActuales.length === 0) {
            statusText.textContent = 'Sin evaluación configurada';
        } else {
            const evaluados = this.estudiantesActuales.filter(est => est.evaluado).length;
            statusText.textContent = `${evaluados}/${this.estudiantesActuales.length} evaluados`;
        }
    }

    exportarExcel() {
        if (this.estudiantesActuales.length === 0) {
            this.mostrarNotificacion('No hay datos para exportar', 'error');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Hoja de resultados
            const datosResultados = [
                ['Evaluación Simple - Resultados'],
                [''],
                ['Estudiante', 'Puntaje', 'Porcentaje', 'Nota', 'Estado'],
                ...this.estudiantesActuales.map(est => [
                    `${est.nombre} ${est.apellido}`,
                    est.puntaje || '',
                    est.porcentaje ? `${est.porcentaje.toFixed(1)}%` : '',
                    est.nota ? this.formatearNota(est.nota) : '',
                    this.getStatusText(est)
                ])
            ];

            const wsResultados = XLSX.utils.aoa_to_sheet(datosResultados);
            XLSX.utils.book_append_sheet(wb, wsResultados, "Resultados");

            // Hoja de estadísticas
            const evaluados = this.estudiantesActuales.filter(est => est.evaluado);
            const notas = evaluados.map(est => est.nota);
            const promedio = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
            const aprobados = evaluados.filter(est => est.nota >= this.configuracion.notaAprobacion).length;

            const datosEstadisticas = [
                ['Evaluación Simple - Estadísticas'],
                [''],
                ['Configuración'],
                ['Puntaje Máximo', this.configuracion.puntajeMaximo],
                ['Exigencia', `${this.configuracion.exigencia}%`],
                ['Nota Mínima', this.configuracion.notaMinima],
                ['Nota Máxima', this.configuracion.notaMaxima],
                ['Nota de Aprobación', this.configuracion.notaAprobacion],
                [''],
                ['Estadísticas'],
                ['Total Estudiantes', this.estudiantesActuales.length],
                ['Estudiantes Evaluados', evaluados.length],
                ['Promedio', this.formatearNota(promedio)],
                ['Aprobados', aprobados],
                ['Reprobados', evaluados.length - aprobados],
                ['% Aprobación', evaluados.length > 0 ? `${((aprobados / evaluados.length) * 100).toFixed(1)}%` : '0%']
            ];

            const wsEstadisticas = XLSX.utils.aoa_to_sheet(datosEstadisticas);
            XLSX.utils.book_append_sheet(wb, wsEstadisticas, "Estadísticas");

            // Exportar
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `evaluacion_simple_${fecha}.xlsx`;
            XLSX.writeFile(wb, nombreArchivo);

            this.mostrarNotificacion('Excel exportado correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            this.mostrarNotificacion('Error al exportar Excel', 'error');
        }
    }

    mostrarTooltipGrafico(event, label, count, percentage) {
        // Remover tooltip existente si hay alguno
        this.ocultarTooltipGrafico();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-label">${label}</div>
            <div class="tooltip-value">${count} estudiante${count !== 1 ? 's' : ''}</div>
            <div class="tooltip-percentage">${percentage}%</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = event.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 10;
        
        // Ajustar si se sale de la pantalla
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = rect.bottom + 10;
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('show');
    }

    ocultarTooltipGrafico() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        notification.className = `notification ${tipo}`;
        notificationText.textContent = mensaje;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EvaluacionSimpleApp();
});

// Función global para cambio de puntaje (llamada desde HTML)
window.app = {
    onPuntajeChange: (index, value) => {
        if (app) app.onPuntajeChange(index, value);
    }
};
