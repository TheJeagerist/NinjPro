/* ===================================
   PAES - APLICACIÓN PRINCIPAL
   =================================== */

// Tablas PAES oficiales
const TABLAS_PAES = {
    'competencia-lectora': {
        0: 100, 1: 186, 2: 210, 3: 232, 4: 253, 5: 271,
        6: 288, 7: 304, 8: 322, 9: 339, 10: 355, 11: 369,
        12: 380, 13: 391, 14: 402, 15: 415, 16: 430, 17: 446,
        18: 460, 19: 471, 20: 479, 21: 486, 22: 494, 23: 502,
        24: 514, 25: 528, 26: 543, 27: 557, 28: 569, 29: 577,
        30: 583, 31: 589, 32: 596, 33: 605, 34: 617, 35: 631,
        36: 647, 37: 660, 38: 671, 39: 680, 40: 687, 41: 694,
        42: 703, 43: 715, 44: 730, 45: 746, 46: 761, 47: 773,
        48: 785, 49: 795, 50: 808, 51: 823, 52: 840, 53: 858,
        54: 876, 55: 893, 56: 911, 57: 931, 58: 954, 59: 978,
        60: 1000
    },
    'm1': {
        0: 100, 1: 173, 2: 199, 3: 222, 4: 244, 5: 265,
        6: 284, 7: 301, 8: 316, 9: 331, 10: 346, 11: 362,
        12: 378, 13: 391, 14: 402, 15: 412, 16: 422, 17: 434,
        18: 447, 19: 462, 20: 476, 21: 487, 22: 496, 23: 503,
        24: 510, 25: 518, 26: 529, 27: 542, 28: 557, 29: 570,
        30: 581, 31: 589, 32: 596, 33: 602, 34: 610, 35: 621,
        36: 634, 37: 648, 38: 662, 39: 674, 40: 683, 41: 691,
        42: 700, 43: 710, 44: 723, 45: 738, 46: 753, 47: 767,
        48: 779, 49: 792, 50: 805, 51: 821, 52: 838, 53: 856,
        54: 875, 55: 894, 56: 915, 57: 938, 58: 964, 59: 992,
        60: 1000
    },
    'm2': {
        0: 100, 1: 161, 2: 192, 3: 220, 4: 245, 5: 268,
        6: 289, 7: 308, 8: 326, 9: 344, 10: 362, 11: 378,
        12: 392, 13: 405, 14: 418, 15: 432, 16: 448, 17: 462,
        18: 475, 19: 486, 20: 495, 21: 506, 22: 519, 23: 533,
        24: 547, 25: 560, 26: 571, 27: 580, 28: 590, 29: 601,
        30: 614, 31: 629, 32: 643, 33: 656, 34: 667, 35: 678,
        36: 690, 37: 704, 38: 719, 39: 735, 40: 750, 41: 765,
        42: 780, 43: 797, 44: 816, 45: 836, 46: 857, 47: 879,
        48: 903, 49: 1000
    },
    'ciencias': {
        0: 100, 1: 105, 2: 123, 3: 144, 4: 164, 5: 183,
        6: 201, 7: 218, 8: 233, 9: 246, 10: 260, 11: 273,
        12: 288, 13: 301, 14: 313, 15: 324, 16: 332, 17: 341,
        18: 351, 19: 363, 20: 376, 21: 388, 22: 399, 23: 406,
        24: 413, 25: 419, 26: 425, 27: 433, 28: 443, 29: 455,
        30: 467, 31: 478, 32: 487, 33: 494, 34: 499, 35: 503,
        36: 508, 37: 515, 38: 523, 39: 535, 40: 547, 41: 559,
        42: 569, 43: 576, 44: 582, 45: 586, 46: 591, 47: 597,
        48: 606, 49: 616, 50: 629, 51: 641, 52: 652, 53: 660,
        54: 667, 55: 673, 56: 680, 57: 689, 58: 700, 59: 713,
        60: 726, 61: 738, 62: 748, 63: 758, 64: 768, 65: 779,
        66: 793, 67: 808, 68: 823, 69: 838, 70: 853, 71: 870,
        72: 889, 73: 909, 74: 931, 75: 1000
    },
    'historia': {
        0: 100, 1: 106, 2: 135, 3: 161, 4: 184, 5: 206,
        6: 227, 7: 248, 8: 266, 9: 282, 10: 297, 11: 311,
        12: 327, 13: 344, 14: 360, 15: 374, 16: 385, 17: 395,
        18: 404, 19: 415, 20: 429, 21: 444, 22: 460, 23: 473,
        24: 484, 25: 492, 26: 499, 27: 506, 28: 515, 29: 527,
        30: 542, 31: 557, 32: 572, 33: 583, 34: 591, 35: 598,
        36: 605, 37: 614, 38: 625, 39: 639, 40: 655, 41: 670,
        42: 683, 43: 693, 44: 703, 45: 712, 46: 724, 47: 739,
        48: 756, 49: 772, 50: 788, 51: 802, 52: 817, 53: 834,
        54: 853, 55: 873, 56: 895, 57: 917, 58: 941, 59: 968,
        60: 1000
    }
};

class PaesApp {
    constructor() {
        this.modoActual = null;
        this.cursosDisponibles = [];
        this.estudiantes = [];
        this.configuracion = {};
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('🚀 Inicializando aplicación PAES...');
        this.loadCursos();
        this.loadEventListeners();
        this.debugLocalStorage();
    }

    debugLocalStorage() {
        console.log('🔍 === DEBUG PAES - DATOS DE GESTIÓN ===');
        const cursosData = localStorage.getItem('cursosData');
        console.log('📚 cursosData en localStorage:', cursosData ? 'EXISTE' : 'NO EXISTE');
        
        if (cursosData) {
            try {
                const parsed = JSON.parse(cursosData);
                console.log('📊 Contenido de cursosData:', parsed);
                console.log('📈 Número de cursos:', Object.keys(parsed).length);
            } catch (error) {
                console.error('❌ Error al parsear cursosData:', error);
            }
        }
        
        // Agregar función de prueba para cálculo ensayo
        this.testCalculoEnsayo();
        
        console.log('🔍 === FIN DEBUG ===');
    }

    testCalculoEnsayo() {
        console.log('🧪 === PRUEBA DE CÁLCULO ENSAYO ===');
        
        // Simular configuración de prueba
        const testConfig = {
            totalPreguntas: 40
        };
        
        // Casos de prueba
        const casos = [
            { respuestas: 0, esperado: 100 },
            { respuestas: 20, esperado: 550 },  // 50% = 550 puntos
            { respuestas: 40, esperado: 1000 }  // 100% = 1000 puntos
        ];
        
        casos.forEach(caso => {
            const porcentaje = (caso.respuestas / testConfig.totalPreguntas) * 100;
            const puntajePaes = Math.round(100 + (porcentaje / 100) * 900);
            
            console.log(`📊 Caso: ${caso.respuestas}/${testConfig.totalPreguntas} respuestas`);
            console.log(`   Porcentaje: ${porcentaje.toFixed(1)}%`);
            console.log(`   Puntaje calculado: ${puntajePaes}`);
            console.log(`   Puntaje esperado: ${caso.esperado}`);
            console.log(`   ✅ ${puntajePaes === caso.esperado ? 'CORRECTO' : 'ERROR'}`);
        });
        
        console.log('🧪 === FIN PRUEBA ===');
    }

    loadEventListeners() {
        // Botón volver al launcher
        document.getElementById('volver-launcher')?.addEventListener('click', () => this.volverAlLauncher());

        // Botón cambiar modo en header
        document.getElementById('cambiar-modo-header')?.addEventListener('click', () => this.volverSeleccionModo());

        // Botones de modo
        document.getElementById('modo-oficial')?.addEventListener('click', () => this.seleccionarModo('oficial'));
        document.getElementById('modo-ensayo')?.addEventListener('click', () => this.seleccionarModo('ensayo'));

        // Configuración oficial
        document.getElementById('paes-tipo')?.addEventListener('change', () => this.validateConfiguracionOficial());
        document.getElementById('curso-select-oficial')?.addEventListener('change', () => this.validateConfiguracionOficial());
        document.getElementById('cargar-estudiantes-oficial')?.addEventListener('click', () => this.cargarEstudiantesOficial());

        // Configuración ensayo
        document.getElementById('nombre-prueba')?.addEventListener('input', () => this.validateConfiguracionEnsayo());
        document.getElementById('total-preguntas-ensayo')?.addEventListener('input', () => this.validateConfiguracionEnsayo());
        document.getElementById('curso-select-ensayo')?.addEventListener('change', () => this.validateConfiguracionEnsayo());
        document.getElementById('cargar-estudiantes-ensayo')?.addEventListener('click', () => this.cargarEstudiantesEnsayo());

        // Botones de exportación
        document.getElementById('exportar-excel-oficial')?.addEventListener('click', () => this.exportarExcel('oficial'));
        document.getElementById('exportar-pdf-oficial')?.addEventListener('click', () => this.exportarPDF('oficial'));
        document.getElementById('exportar-excel-ensayo')?.addEventListener('click', () => this.exportarExcel('ensayo'));
        document.getElementById('exportar-pdf-ensayo')?.addEventListener('click', () => this.exportarPDF('ensayo'));
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
            const cursosData = localStorage.getItem('cursosData');
            
            if (cursosData) {
                const cursosParseados = JSON.parse(cursosData);
                console.log('📚 Datos de cursos cargados:', cursosParseados);
                
                this.cursosDisponibles = [];
                
                if (typeof cursosParseados === 'object' && cursosParseados !== null) {
                    Object.keys(cursosParseados).forEach(nombreCurso => {
                        const estudiantesDelCurso = cursosParseados[nombreCurso] || [];
                        
                        const estudiantesFormateados = estudiantesDelCurso.map((estudiante, index) => {
                            if (typeof estudiante === 'string') {
                                const partes = estudiante.split(' ');
                                return {
                                    id: index + 1,
                                    nombre: partes[0] || estudiante,
                                    apellido: partes.slice(1).join(' ') || ''
                                };
                            } else if (typeof estudiante === 'object' && estudiante !== null) {
                                return {
                                    id: estudiante.id || index + 1,
                                    nombre: estudiante.nombre || 'Sin nombre',
                                    apellido: estudiante.apellido || ''
                                };
                            } else {
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
                    
                    console.log('✅ Cursos convertidos para PAES:', this.cursosDisponibles);
                } else {
                    console.warn('Los datos de cursos no tienen el formato esperado');
                    this.cursosDisponibles = [];
                }
            } else {
                console.log('📝 No hay datos de cursos, usando ejemplos');
                this.cursosDisponibles = [
                    {
                        id: 'ejemplo1',
                        nombre: '4° Medio A (Ejemplo)',
                        estudiantes: [
                            { id: 1, nombre: 'Ana García', apellido: 'López' },
                            { id: 2, nombre: 'Carlos', apellido: 'Martínez' },
                            { id: 3, nombre: 'María', apellido: 'González' }
                        ]
                    }
                ];
            }
            
            this.populateCursoSelects();
            
        } catch (error) {
            console.error('❌ Error al cargar cursos:', error);
            this.showNotification('Error al cargar cursos', 'error');
            this.cursosDisponibles = [];
        }
    }

    populateCursoSelects() {
        const selectOficial = document.getElementById('curso-select-oficial');
        const selectEnsayo = document.getElementById('curso-select-ensayo');
        
        [selectOficial, selectEnsayo].forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Seleccionar curso...</option>';
                this.cursosDisponibles.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.id;
                    option.textContent = `${curso.nombre} (${curso.estudiantes.length} estudiantes)`;
                    select.appendChild(option);
                });
            }
        });
    }

    seleccionarModo(modo) {
        this.modoActual = modo;
        
        // Ocultar selección de modo
        document.getElementById('mode-selection').style.display = 'none';
        
        // Mostrar botón cambiar modo en header
        document.getElementById('cambiar-modo-header').style.display = 'flex';
        
        // Mostrar panel correspondiente
        if (modo === 'oficial') {
            document.getElementById('modo-oficial-panel').style.display = 'block';
            document.querySelector('.mode-text').textContent = 'Modo OFICIAL';
        } else if (modo === 'ensayo') {
            document.getElementById('modo-ensayo-panel').style.display = 'block';
            document.querySelector('.mode-text').textContent = 'Modo ENSAYO PAES';
        }
        
        console.log(`✅ Modo seleccionado: ${modo}`);
    }

    volverSeleccionModo() {
        // Verificar si hay datos no guardados
        if (this.hayDatosNoGuardados()) {
            if (!confirm('¿Estás seguro de que quieres volver a la selección de modo? Los datos de evaluación no guardados se perderán.')) {
                return;
            }
        }
        
        // Ocultar paneles
        document.getElementById('modo-oficial-panel').style.display = 'none';
        document.getElementById('modo-ensayo-panel').style.display = 'none';
        document.getElementById('evaluation-area-oficial').style.display = 'none';
        document.getElementById('evaluation-area-ensayo').style.display = 'none';
        document.getElementById('results-summary').style.display = 'none';
        
        // Ocultar botón cambiar modo en header
        document.getElementById('cambiar-modo-header').style.display = 'none';
        
        // Mostrar selección de modo
        document.getElementById('mode-selection').style.display = 'flex';
        document.querySelector('.mode-text').textContent = 'Selecciona un modo';
        
        // Resetear datos
        this.modoActual = null;
        this.estudiantes = [];
        this.configuracion = {};
        
        // Mostrar notificación
        this.showNotification('Has vuelto a la selección de modo PAES', 'info');
    }

    validateConfiguracionOficial() {
        const paesType = document.getElementById('paes-tipo').value;
        const curso = document.getElementById('curso-select-oficial').value;
        const cargarBtn = document.getElementById('cargar-estudiantes-oficial');
        
        if (paesType && curso) {
            cargarBtn.disabled = false;
        } else {
            cargarBtn.disabled = true;
        }
    }

    validateConfiguracionEnsayo() {
        const nombrePrueba = document.getElementById('nombre-prueba').value.trim();
        const totalPreguntas = document.getElementById('total-preguntas-ensayo').value;
        const curso = document.getElementById('curso-select-ensayo').value;
        const cargarBtn = document.getElementById('cargar-estudiantes-ensayo');
        
        if (nombrePrueba && totalPreguntas && curso && parseInt(totalPreguntas) > 0) {
            cargarBtn.disabled = false;
        } else {
            cargarBtn.disabled = true;
        }
    }

    cargarEstudiantesOficial() {
        const paesType = document.getElementById('paes-tipo').value;
        const cursoId = document.getElementById('curso-select-oficial').value;
        
        const curso = this.cursosDisponibles.find(c => c.id === cursoId);
        if (!curso) {
            this.showNotification('Curso no encontrado', 'error');
            return;
        }

        this.configuracion = {
            tipo: 'oficial',
            paesType: paesType,
            curso: curso
        };

        this.estudiantes = curso.estudiantes.map(est => ({
            ...est,
            respuestasCorrectas: null,
            puntajePaes: null,
            evaluado: false
        }));

        this.showEvaluationAreaOficial();
        this.renderStudentsTableOficial();
        this.enableExportButtons('oficial');
    }

    cargarEstudiantesEnsayo() {
        console.log('📚 Cargando estudiantes para modo ensayo...');
        
        const nombrePrueba = document.getElementById('nombre-prueba').value.trim();
        const totalPreguntas = parseInt(document.getElementById('total-preguntas-ensayo').value);
        const cursoId = document.getElementById('curso-select-ensayo').value;
        
        console.log('📋 Datos de configuración:', {
            nombrePrueba: nombrePrueba,
            totalPreguntas: totalPreguntas,
            cursoId: cursoId
        });
        
        const curso = this.cursosDisponibles.find(c => c.id === cursoId);
        if (!curso) {
            console.error('❌ Curso no encontrado:', cursoId);
            this.showNotification('Curso no encontrado', 'error');
            return;
        }

        this.configuracion = {
            tipo: 'ensayo',
            nombrePrueba: nombrePrueba,
            totalPreguntas: totalPreguntas,
            curso: curso
        };
        
        console.log('⚙️ Configuración guardada:', this.configuracion);

        this.estudiantes = curso.estudiantes.map(est => ({
            ...est,
            respuestasCorrectas: null,
            porcentaje: null,
            puntajePaes: null,
            evaluado: false
        }));
        
        console.log('👥 Estudiantes cargados:', this.estudiantes);

        this.showEvaluationAreaEnsayo();
        this.renderStudentsTableEnsayo();
        this.enableExportButtons('ensayo');
        
        console.log('✅ Carga de estudiantes ensayo completada');
    }

    showEvaluationAreaOficial() {
        const area = document.getElementById('evaluation-area-oficial');
        area.style.display = 'block';
        
        // Actualizar información
        document.getElementById('curso-nombre-oficial').textContent = this.configuracion.curso.nombre;
        document.getElementById('paes-tipo-info').textContent = this.getPaesTypeLabel(this.configuracion.paesType);
        document.getElementById('total-estudiantes-oficial').textContent = `${this.estudiantes.length} estudiantes`;
        document.getElementById('total-estudiantes-count-oficial').textContent = this.estudiantes.length;
        
        this.updateProgress('oficial');
    }

    showEvaluationAreaEnsayo() {
        const area = document.getElementById('evaluation-area-ensayo');
        area.style.display = 'block';
        
        // Actualizar información
        document.getElementById('nombre-prueba-display').textContent = this.configuracion.nombrePrueba;
        document.getElementById('curso-nombre-ensayo').textContent = this.configuracion.curso.nombre;
        document.getElementById('preguntas-info-ensayo').textContent = `${this.configuracion.totalPreguntas} preguntas totales`;
        document.getElementById('total-estudiantes-ensayo').textContent = `${this.estudiantes.length} estudiantes`;
        document.getElementById('total-estudiantes-count-ensayo').textContent = this.estudiantes.length;
        
        this.updateProgress('ensayo');
    }

    getPaesTypeLabel(type) {
        const labels = {
            'competencia-lectora': 'Competencia Lectora',
            'm1': 'M1 Matemáticas',
            'm2': 'M2 Matemáticas',
            'ciencias': 'Ciencias',
            'historia': 'Historia'
        };
        return labels[type] || type;
    }

    renderStudentsTableOficial() {
        const tbody = document.getElementById('students-tbody-oficial');
        tbody.innerHTML = '';

        this.estudiantes.forEach((estudiante, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="student-name">${estudiante.nombre} ${estudiante.apellido}</td>
                <td>
                    <input type="number" 
                           class="student-input" 
                           min="0" 
                           max="${this.getMaxRespuestas(this.configuracion.paesType)}"
                           placeholder="0"
                           data-index="${index}">
                </td>
                <td class="student-result student-paes-score" id="paes-${index}">-</td>
                <td>
                    <span class="student-status status-pending" id="status-${index}">Pendiente</span>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Event listeners para inputs
        tbody.querySelectorAll('.student-input').forEach(input => {
            input.addEventListener('input', (e) => this.updateStudentResultOficial(e.target));
        });
    }

    renderStudentsTableEnsayo() {
        console.log('🎨 Renderizando tabla de estudiantes para ensayo...');
        
        const tbody = document.getElementById('students-tbody-ensayo');
        if (!tbody) {
            console.error('❌ Elemento students-tbody-ensayo no encontrado');
            return;
        }
        
        tbody.innerHTML = '';

        this.estudiantes.forEach((estudiante, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="student-name">${estudiante.nombre} ${estudiante.apellido}</td>
                <td>
                    <input type="number" 
                           class="student-input" 
                           min="0" 
                           max="${this.configuracion.totalPreguntas}"
                           placeholder="0"
                           data-index="${index}"
                           id="input-${index}">
                </td>
                <td class="student-result student-percentage" id="percentage-${index}">-</td>
                <td class="student-result student-paes-score" id="paes-${index}">-</td>
                <td>
                    <span class="student-status status-pending" id="status-${index}">Pendiente</span>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Event listeners para inputs con debugging
        const inputs = tbody.querySelectorAll('.student-input');
        console.log(`📝 Agregando event listeners a ${inputs.length} inputs`);
        
        inputs.forEach((input, inputIndex) => {
            console.log(`🔗 Agregando listener al input ${inputIndex}:`, input);
            
            // Agregar múltiples tipos de eventos para asegurar que funcione
            input.addEventListener('input', (e) => {
                console.log('🎯 Evento input disparado:', e.target);
                this.updateStudentResultEnsayo(e.target);
            });
            
            input.addEventListener('change', (e) => {
                console.log('🎯 Evento change disparado:', e.target);
                this.updateStudentResultEnsayo(e.target);
            });
            
            input.addEventListener('keyup', (e) => {
                console.log('🎯 Evento keyup disparado:', e.target);
                this.updateStudentResultEnsayo(e.target);
            });
        });
        
        console.log('✅ Tabla de ensayo renderizada con event listeners');
    }

    getMaxRespuestas(paesType) {
        const maxValues = {
            'competencia-lectora': 60,
            'm1': 60,
            'm2': 49,
            'ciencias': 75,
            'historia': 60
        };
        return maxValues[paesType] || 60;
    }

    updateStudentResultOficial(input) {
        const index = parseInt(input.dataset.index);
        const respuestasCorrectas = parseInt(input.value) || 0;
        
        if (respuestasCorrectas < 0 || respuestasCorrectas > this.getMaxRespuestas(this.configuracion.paesType)) {
            input.value = '';
            return;
        }

        // Calcular puntaje PAES oficial
        const puntajePaes = this.calcularPuntajePaesOficial(respuestasCorrectas);
        
        // Actualizar estudiante
        this.estudiantes[index].respuestasCorrectas = respuestasCorrectas;
        this.estudiantes[index].puntajePaes = puntajePaes;
        this.estudiantes[index].evaluado = input.value !== '';

        // Actualizar UI
        document.getElementById(`paes-${index}`).textContent = input.value !== '' ? puntajePaes : '-';
        
        const statusElement = document.getElementById(`status-${index}`);
        if (input.value !== '') {
            statusElement.textContent = 'Completado';
            statusElement.className = 'student-status status-completed';
        } else {
            statusElement.textContent = 'Pendiente';
            statusElement.className = 'student-status status-pending';
        }

        this.updateProgress('oficial');
        this.updateResultsSummary();
    }

    updateStudentResultEnsayo(input) {
        console.log('🔄 Actualizando resultado ensayo para input:', input);
        
        const index = parseInt(input.dataset.index);
        const inputValue = input.value.trim();
        
        console.log('📊 Datos de entrada:', {
            index: index,
            inputValue: inputValue,
            totalPreguntas: this.configuracion.totalPreguntas
        });
        
        // Si el input está vacío, limpiar resultados
        if (inputValue === '') {
            this.estudiantes[index].respuestasCorrectas = null;
            this.estudiantes[index].porcentaje = null;
            this.estudiantes[index].puntajePaes = null;
            this.estudiantes[index].evaluado = false;

            // Limpiar UI
            document.getElementById(`percentage-${index}`).textContent = '-';
            document.getElementById(`paes-${index}`).textContent = '-';
            
            const statusElement = document.getElementById(`status-${index}`);
            statusElement.textContent = 'Pendiente';
            statusElement.className = 'student-status status-pending';

            this.updateProgress('ensayo');
            this.updateResultsSummary();
            return;
        }
        
        const respuestasCorrectas = parseInt(inputValue);
        
        // Validar rango
        if (isNaN(respuestasCorrectas) || respuestasCorrectas < 0 || respuestasCorrectas > this.configuracion.totalPreguntas) {
            console.warn('⚠️ Valor fuera de rango:', respuestasCorrectas);
            this.showNotification(`Valor debe estar entre 0 y ${this.configuracion.totalPreguntas}`, 'warning');
            input.value = '';
            return;
        }

        // Calcular porcentaje y puntaje PAES ensayo
        const porcentaje = (respuestasCorrectas / this.configuracion.totalPreguntas) * 100;
        const puntajePaes = Math.round(100 + (porcentaje / 100) * 900); // 100-1000 puntos
        
        console.log('📈 Cálculos:', {
            respuestasCorrectas: respuestasCorrectas,
            porcentaje: porcentaje,
            puntajePaes: puntajePaes
        });
        
        // Actualizar estudiante
        this.estudiantes[index].respuestasCorrectas = respuestasCorrectas;
        this.estudiantes[index].porcentaje = porcentaje;
        this.estudiantes[index].puntajePaes = puntajePaes;
        this.estudiantes[index].evaluado = true;

        // Actualizar UI
        const percentageElement = document.getElementById(`percentage-${index}`);
        const paesElement = document.getElementById(`paes-${index}`);
        
        if (percentageElement) {
            percentageElement.textContent = `${porcentaje.toFixed(1)}%`;
            console.log('✅ Porcentaje actualizado:', percentageElement.textContent);
        } else {
            console.error('❌ Elemento percentage no encontrado:', `percentage-${index}`);
        }
        
        if (paesElement) {
            paesElement.textContent = puntajePaes;
            console.log('✅ Puntaje PAES actualizado:', paesElement.textContent);
        } else {
            console.error('❌ Elemento paes no encontrado:', `paes-${index}`);
        }
        
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.textContent = 'Completado';
            statusElement.className = 'student-status status-completed';
            console.log('✅ Estado actualizado a completado');
        } else {
            console.error('❌ Elemento status no encontrado:', `status-${index}`);
        }

        this.updateProgress('ensayo');
        this.updateResultsSummary();
        
        console.log('✅ Actualización completada para estudiante:', this.estudiantes[index]);
    }

    calcularPuntajePaesOficial(respuestasCorrectas) {
        const tabla = TABLAS_PAES[this.configuracion.paesType];
        return tabla[respuestasCorrectas] || 100;
    }

    updateProgress(modo) {
        const evaluados = this.estudiantes.filter(est => est.evaluado).length;
        const total = this.estudiantes.length;
        const porcentaje = total > 0 ? (evaluados / total) * 100 : 0;

        const suffix = modo === 'oficial' ? '-oficial' : '-ensayo';
        
        document.getElementById(`estudiantes-evaluados${suffix}`).textContent = evaluados;
        document.getElementById(`progress-fill${suffix}`).style.width = `${porcentaje}%`;
    }

    updateResultsSummary() {
        const estudiantesEvaluados = this.estudiantes.filter(est => est.evaluado);
        
        if (estudiantesEvaluados.length === 0) {
            document.getElementById('results-summary').style.display = 'none';
            return;
        }

        const puntajes = estudiantesEvaluados.map(est => est.puntajePaes);
        const promedio = puntajes.reduce((sum, val) => sum + val, 0) / puntajes.length;
        const maximo = Math.max(...puntajes);
        const minimo = Math.min(...puntajes);

        // Actualizar estadísticas
        document.getElementById('promedio-paes').textContent = promedio.toFixed(1);
        document.getElementById('maximo-paes').textContent = maximo;
        document.getElementById('minimo-paes').textContent = minimo;
        document.getElementById('total-evaluados-paes').textContent = estudiantesEvaluados.length;

        // Generar gráfico
        this.generateChart(puntajes);

        // Mostrar resumen
        document.getElementById('results-summary').style.display = 'block';
    }

    generateChart(puntajes) {
        const chartBars = document.getElementById('chart-bars-paes');
        chartBars.innerHTML = '';

        // Crear rangos de puntajes
        const rangos = [
            { min: 100, max: 299, label: '100-299' },
            { min: 300, max: 499, label: '300-499' },
            { min: 500, max: 699, label: '500-699' },
            { min: 700, max: 849, label: '700-849' },
            { min: 850, max: 1000, label: '850-1000' }
        ];

        const maxCount = Math.max(...rangos.map(rango => 
            puntajes.filter(p => p >= rango.min && p <= rango.max).length
        ));

        rangos.forEach(rango => {
            const count = puntajes.filter(p => p >= rango.min && p <= rango.max).length;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}%`;
            bar.setAttribute('data-value', count);
            bar.title = `${rango.label}: ${count} estudiantes`;
            
            chartBars.appendChild(bar);
        });
    }

    enableExportButtons(modo) {
        const suffix = modo === 'oficial' ? '-oficial' : '-ensayo';
        document.getElementById(`exportar-excel${suffix}`).disabled = false;
        document.getElementById(`exportar-pdf${suffix}`).disabled = false;
    }

    exportarExcel(modo) {
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
                ['EVALUACIÓN PAES'],
                ['Modo:', modo === 'oficial' ? 'OFICIAL' : 'ENSAYO PAES'],
                ['Curso:', this.configuracion.curso.nombre],
                ['Fecha:', new Date().toLocaleDateString()],
                ['']
            ];

            if (modo === 'oficial') {
                data.push(['Tipo PAES:', this.getPaesTypeLabel(this.configuracion.paesType)]);
                data.push(['']);
                data.push(['Estudiante', 'Respuestas Correctas', 'Puntaje PAES']);
                
                estudiantesEvaluados.forEach(estudiante => {
                    data.push([
                        `${estudiante.nombre} ${estudiante.apellido}`,
                        estudiante.respuestasCorrectas,
                        estudiante.puntajePaes
                    ]);
                });
            } else {
                data.push(['Nombre Prueba:', this.configuracion.nombrePrueba]);
                data.push(['Total Preguntas:', this.configuracion.totalPreguntas]);
                data.push(['']);
                data.push(['Estudiante', 'Respuestas Correctas', 'Porcentaje', 'Puntaje PAES']);
                
                estudiantesEvaluados.forEach(estudiante => {
                    data.push([
                        `${estudiante.nombre} ${estudiante.apellido}`,
                        estudiante.respuestasCorrectas,
                        `${estudiante.porcentaje.toFixed(1)}%`,
                        estudiante.puntajePaes
                    ]);
                });
            }

            // Agregar estadísticas
            const puntajes = estudiantesEvaluados.map(est => est.puntajePaes);
            const promedio = puntajes.reduce((sum, val) => sum + val, 0) / puntajes.length;
            const maximo = Math.max(...puntajes);
            const minimo = Math.min(...puntajes);

            data.push(['']);
            data.push(['ESTADÍSTICAS']);
            data.push(['Promedio:', promedio.toFixed(1)]);
            data.push(['Puntaje Máximo:', maximo]);
            data.push(['Puntaje Mínimo:', minimo]);
            data.push(['Estudiantes Evaluados:', estudiantesEvaluados.length]);

            // Crear workbook y worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);

            // Agregar worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Resultados PAES');

            // Generar archivo
            const filename = `PAES_${modo}_${this.configuracion.curso.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

            this.showNotification('Archivo Excel exportado correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            this.showNotification('Error al exportar archivo Excel', 'error');
        }
    }

    exportarPDF(modo) {
        console.log('🔍 Iniciando exportación PDF PAES...');
        
        // Verificar diferentes formas de acceso a jsPDF
        let jsPDFClass = null;
        
        if (window.jsPDF && window.jsPDF.jsPDF) {
            jsPDFClass = window.jsPDF.jsPDF;
            console.log('✅ Usando window.jsPDF.jsPDF (UMD)');
        } else if (window.jsPDF) {
            jsPDFClass = window.jsPDF;
            console.log('✅ Usando window.jsPDF (directo)');
        } else {
            console.error('❌ jsPDF no encontrado');
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
            doc.text('EVALUACIÓN PAES', 20, 30);

            // Información
            doc.setFontSize(12);
            doc.text(`Modo: ${modo === 'oficial' ? 'OFICIAL' : 'ENSAYO PAES'}`, 20, 50);
            doc.text(`Curso: ${this.configuracion.curso.nombre}`, 20, 60);
            
            if (modo === 'oficial') {
                doc.text(`Tipo PAES: ${this.getPaesTypeLabel(this.configuracion.paesType)}`, 20, 70);
            } else {
                doc.text(`Nombre Prueba: ${this.configuracion.nombrePrueba}`, 20, 70);
                doc.text(`Total Preguntas: ${this.configuracion.totalPreguntas}`, 20, 80);
            }
            
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, modo === 'oficial' ? 80 : 90);

            // Tabla de resultados
            let yPosition = modo === 'oficial' ? 100 : 110;
            doc.setFontSize(14);
            doc.text('RESULTADOS POR ESTUDIANTE', 20, yPosition);
            
            yPosition += 20;
            doc.setFontSize(10);
            
            // Headers
            doc.text('Estudiante', 20, yPosition);
            doc.text('Resp. Correctas', 80, yPosition);
            
            if (modo === 'ensayo') {
                doc.text('Porcentaje', 130, yPosition);
                doc.text('Puntaje PAES', 160, yPosition);
            } else {
                doc.text('Puntaje PAES', 130, yPosition);
            }
            
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
                
                if (modo === 'ensayo') {
                    doc.text(`${estudiante.porcentaje.toFixed(1)}%`, 130, yPosition);
                    doc.text(estudiante.puntajePaes.toString(), 160, yPosition);
                } else {
                    doc.text(estudiante.puntajePaes.toString(), 130, yPosition);
                }
                
                yPosition += 10;
            });

            // Estadísticas
            const puntajes = estudiantesEvaluados.map(est => est.puntajePaes);
            const promedio = puntajes.reduce((sum, val) => sum + val, 0) / puntajes.length;
            const maximo = Math.max(...puntajes);
            const minimo = Math.min(...puntajes);

            yPosition += 20;
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }

            doc.setFontSize(14);
            doc.text('ESTADÍSTICAS', 20, yPosition);
            
            yPosition += 20;
            doc.setFontSize(12);
            doc.text(`Promedio: ${promedio.toFixed(1)}`, 20, yPosition);
            doc.text(`Puntaje Máximo: ${maximo}`, 20, yPosition + 10);
            doc.text(`Puntaje Mínimo: ${minimo}`, 20, yPosition + 20);
            doc.text(`Estudiantes Evaluados: ${estudiantesEvaluados.length}`, 20, yPosition + 30);

            // Guardar PDF
            const filename = `PAES_${modo}_${this.configuracion.curso.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('💾 Guardando PDF como:', filename);
            
            doc.save(filename);
            console.log('✅ PDF exportado exitosamente');

            this.showNotification('Archivo PDF exportado correctamente', 'success');
        } catch (error) {
            console.error('❌ Error detallado al exportar PDF:', error);
            
            let errorMessage = 'Error al exportar archivo PDF';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    showNotification(message, type = 'info') {
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

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.paesApp = new PaesApp();
});

// Función para navegación desde el launcher
function navigateToPaes() {
    window.location.href = 'paes.html';
} 