/* ===== CALCULADORA DE NOTAS PARCIALES - PROFENINJA ===== */

class CalculadoraNotasParciales {
    constructor() {
        this.estudiantes = [];
        this.cursos = [];
        this.numeroNotasGlobal = 1;
        this.porcentajeGlobal = 100;
        
        this.init();
    }

    init() {
        this.detectarTema();
        this.configurarEventListeners();
        this.cargarDatosGuardados();
        this.agregarEstudianteInicial();
        this.configurarAtajosTeclado();
        this.configurarDetectorCambiosCursos();
        
        console.log('📊 Calculadora de Notas Parciales iniciada');
    }

    detectarTema() {
        const temaGuardado = localStorage.getItem('theme') || 'dark';
        document.body.className = `theme-${temaGuardado}`;
        
        // Sincronizar con fondos animados si existen
        if (window.AnimatedBackgrounds) {
            window.AnimatedBackgrounds.setTheme(temaGuardado);
        }
        
        // Observar cambios de tema
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const nuevoTema = document.body.className.replace('theme-', '');
                    if (window.AnimatedBackgrounds) {
                        window.AnimatedBackgrounds.setTheme(nuevoTema);
                    }
                    
                    // Actualizar colores de promedios según el nuevo tema
                    this.actualizarColoresPromedios();
                }
            });
        });
        
        observer.observe(document.body, { attributes: true });
    }

    configurarEventListeners() {
        // Botón volver al launcher
        document.getElementById('btn-volver-launcher').addEventListener('click', () => {
            // Usar función optimizada si está disponible, sino usar método tradicional
            if (window.fastReturnToLauncher) {
                window.fastReturnToLauncher();
            } else {
                window.location.href = 'index.html';
            }
        });

        // Controles superiores
        document.getElementById('btn-cargar-curso').addEventListener('click', () => {
            this.cargarCurso();
        });

        document.getElementById('btn-recargar-cursos').addEventListener('click', () => {
            this.recargarCursosDesdeGestion();
        });

        document.getElementById('btn-limpiar-todo').addEventListener('click', () => {
            this.limpiarTodo();
        });

        // Botones de acción
        document.getElementById('btn-agregar-estudiante').addEventListener('click', () => {
            this.agregarEstudiante();
        });

        document.getElementById('btn-eliminar-estudiante').addEventListener('click', () => {
            this.eliminarUltimoEstudiante();
        });

        // Controles de notas
        document.getElementById('btn-aplicar-notas').addEventListener('click', () => {
            this.aplicarNumeroNotas();
        });

        document.getElementById('btn-aplicar-porcentaje').addEventListener('click', () => {
            this.aplicarPorcentaje();
        });

        document.getElementById('btn-resetear-todos').addEventListener('click', () => {
            this.resetearTodos();
        });

        // Botón calcular promedios
        document.getElementById('btn-calcular-promedios').addEventListener('click', () => {
            this.calcularTodosLosPromedios();
        });



        // Selector de curso
        document.getElementById('selector-curso').addEventListener('change', (e) => {
            if (e.target.value) {
                this.seleccionarCurso(e.target.value);
            }
        });
    }

    configurarAtajosTeclado() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.agregarEstudiante();
                        break;
                    case '2':
                        e.preventDefault();
                        this.eliminarUltimoEstudiante();
                        break;
                    case 's':
                        e.preventDefault();
                        this.guardarDatos();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetearTodos();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.recargarCursosDesdeGestion();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.calcularTodosLosPromedios();
                        break;
                }
            }
        });
    }

    configurarDetectorCambiosCursos() {
        // Detectar cambios en localStorage para cursosData
        window.addEventListener('storage', (e) => {
            if (e.key === 'cursosData') {
                console.log('🔄 Detectado cambio en cursosData, recargando...');
                this.cargarCursosDesdeGestion();
                this.mostrarNotificacion('Cursos actualizados automáticamente', 'info');
            }
        });

        // Detectar cambios cuando la ventana recibe foco (útil para cambios en la misma pestaña)
        window.addEventListener('focus', () => {
            // Verificar si hay cambios en cursosData cada vez que la ventana recibe foco
            const cursosActuales = JSON.stringify(this.cursos.map(c => c.nombre).sort());
            const cursosEnStorage = JSON.stringify(Object.keys(JSON.parse(localStorage.getItem('cursosData') || '{}')).sort());
            
            if (cursosActuales !== cursosEnStorage) {
                console.log('🔄 Detectados cambios en cursos al enfocar ventana');
                this.cargarCursosDesdeGestion();
            }
        });
    }

    actualizarColoresPromedios() {
        const isLightTheme = document.body.classList.contains('theme-light');
        const promedioElements = document.querySelectorAll('.estudiante-promedio');
        
        promedioElements.forEach(element => {
            if (isLightTheme) {
                element.style.color = '#000000';
            } else {
                element.style.color = '';
            }
        });
    }

    agregarEstudianteInicial() {
        if (this.estudiantes.length === 0) {
            this.agregarEstudiante('Estudiante 1');
            this.agregarEstudiante('Estudiante 2');
        }
    }

    agregarEstudiante(nombre = null) {
        const numeroEstudiante = this.estudiantes.length + 1;
        const nombreEstudiante = nombre || `Estudiante ${numeroEstudiante}`;
        
        const estudiante = {
            id: Date.now() + Math.random(),
            nombre: nombreEstudiante,
            notas: Array(this.numeroNotasGlobal).fill(''),
            porcentajes: Array(this.numeroNotasGlobal).fill(this.porcentajeGlobal / this.numeroNotasGlobal),
            promedio: 0
        };

        this.estudiantes.push(estudiante);
        this.renderizarEstudiantes();
        this.guardarDatos();
        this.mostrarNotificacion(`Estudiante "${nombreEstudiante}" agregado`, 'success');
    }

    eliminarUltimoEstudiante() {
        if (this.estudiantes.length > 0) {
            const estudianteEliminado = this.estudiantes.pop();
            this.renderizarEstudiantes();
            this.guardarDatos();
            this.mostrarNotificacion(`Estudiante "${estudianteEliminado.nombre}" eliminado`, 'warning');
        }
    }

    eliminarEstudiante(id) {
        const index = this.estudiantes.findIndex(est => est.id === id);
        if (index !== -1) {
            const estudianteEliminado = this.estudiantes.splice(index, 1)[0];
            this.renderizarEstudiantes();
            this.guardarDatos();
            this.mostrarNotificacion(`Estudiante "${estudianteEliminado.nombre}" eliminado`, 'warning');
        }
    }

    aplicarNumeroNotas() {
        const numeroNotas = parseInt(document.getElementById('numero-notas').value);
        if (numeroNotas >= 1 && numeroNotas <= 10) {
            this.numeroNotasGlobal = numeroNotas;
            
            this.estudiantes.forEach(estudiante => {
                // Ajustar arrays de notas
                if (estudiante.notas.length < numeroNotas) {
                    // Agregar notas vacías
                    while (estudiante.notas.length < numeroNotas) {
                        estudiante.notas.push('');
                    }
                } else if (estudiante.notas.length > numeroNotas) {
                    // Recortar notas
                    estudiante.notas = estudiante.notas.slice(0, numeroNotas);
                }

                // Ajustar porcentajes
                if (estudiante.porcentajes.length < numeroNotas) {
                    const porcentajeDefecto = this.porcentajeGlobal / numeroNotas;
                    while (estudiante.porcentajes.length < numeroNotas) {
                        estudiante.porcentajes.push(porcentajeDefecto);
                    }
                } else if (estudiante.porcentajes.length > numeroNotas) {
                    estudiante.porcentajes = estudiante.porcentajes.slice(0, numeroNotas);
                }
            });

            this.renderizarEstudiantes();
            this.guardarDatos();
            this.mostrarNotificacion(`Número de notas actualizado a ${numeroNotas}`, 'success');
        } else {
            this.mostrarNotificacion('El número de notas debe estar entre 1 y 10', 'error');
        }
    }

    aplicarPorcentaje() {
        const porcentaje = parseInt(document.getElementById('porcentaje-dividir').value);
        if (porcentaje >= 1 && porcentaje <= 100) {
            this.porcentajeGlobal = porcentaje;
            const porcentajePorNota = porcentaje / this.numeroNotasGlobal;
            
            this.estudiantes.forEach(estudiante => {
                estudiante.porcentajes = Array(this.numeroNotasGlobal).fill(porcentajePorNota);
            });

            this.renderizarEstudiantes();
            this.guardarDatos();
            this.mostrarNotificacion(`Porcentaje actualizado a ${porcentaje}%`, 'success');
        } else {
            this.mostrarNotificacion('El porcentaje debe estar entre 1 y 100', 'error');
        }
    }

    resetearTodos() {
        this.estudiantes.forEach(estudiante => {
            estudiante.notas = Array(this.numeroNotasGlobal).fill('');
            estudiante.promedio = 0;
        });

        this.renderizarEstudiantes();
        this.guardarDatos();
        this.mostrarNotificacion('Todas las notas han sido reseteadas', 'success');
    }

    calcularTodosLosPromedios() {
        let estudiantesCalculados = 0;
        let estudiantesSinNotas = 0;

        this.estudiantes.forEach(estudiante => {
            const promedioAnterior = estudiante.promedio;
            estudiante.promedio = this.calcularPromedio(estudiante);
            
            if (estudiante.promedio > 0) {
                estudiantesCalculados++;
            } else {
                estudiantesSinNotas++;
            }
        });

        // Actualizar todos los displays de promedio con animación
        this.estudiantes.forEach((estudiante, index) => {
            setTimeout(() => {
                const promedioElement = document.querySelector(`[data-estudiante-id="${estudiante.id}"] .estudiante-promedio`);
                if (promedioElement) {
                    // Detectar tema actual
                    const isLightTheme = document.body.classList.contains('theme-light');
                    
                    // Efecto de highlight
                    promedioElement.style.transition = 'all 0.3s ease';
                    promedioElement.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    promedioElement.style.borderRadius = '8px';
                    promedioElement.style.padding = '0.25rem 0.5rem';
                    
                    // Asegurar color correcto según el tema
                    if (isLightTheme) {
                        promedioElement.style.color = '#000000';
                    } else {
                        promedioElement.style.color = 'inherit';
                    }
                    
                    promedioElement.textContent = `Promedio: ${estudiante.promedio.toFixed(2)}`;
                    
                    // Actualizar estado emocional
                    this.toggleEstadoEstudiante(estudiante.id);
                    
                    // Remover highlight después de 2 segundos
                    setTimeout(() => {
                        promedioElement.style.backgroundColor = 'transparent';
                        promedioElement.style.padding = '0';
                        // Mantener el color correcto después del highlight
                        if (isLightTheme) {
                            promedioElement.style.color = '#000000';
                        } else {
                            promedioElement.style.color = '';
                        }
                    }, 2000);
                }
            }, index * 100); // Efecto cascada
        });

        this.guardarDatos();

        // Mostrar resumen
        let mensaje = `Promedios calculados: ${estudiantesCalculados} estudiantes`;
        if (estudiantesSinNotas > 0) {
            mensaje += ` (${estudiantesSinNotas} sin notas)`;
        }

        this.mostrarNotificacion(mensaje, 'success');
        
        // Mostrar estadísticas adicionales
        if (estudiantesCalculados > 0) {
            this.mostrarEstadisticasGenerales();
        }

        console.log(`📊 Promedios calculados para ${estudiantesCalculados} estudiantes`);
    }

    mostrarEstadisticasGenerales() {
        const estudiantesConNotas = this.estudiantes.filter(est => est.promedio > 0);
        
        if (estudiantesConNotas.length === 0) return;

        const promedios = estudiantesConNotas.map(est => est.promedio);
        const promedioGeneral = promedios.reduce((sum, p) => sum + p, 0) / promedios.length;
        const aprobados = promedios.filter(p => p >= 4.0).length;
        const reprobados = promedios.length - aprobados;

        console.log('📈 === ESTADÍSTICAS GENERALES ===');
        console.log(`👥 Total estudiantes con notas: ${estudiantesConNotas.length}`);
        console.log(`📊 Promedio general del curso: ${promedioGeneral.toFixed(2)}`);
        console.log(`✅ Aprobados: ${aprobados} (${((aprobados/promedios.length)*100).toFixed(1)}%)`);
        console.log(`❌ Reprobados: ${reprobados} (${((reprobados/promedios.length)*100).toFixed(1)}%)`);
        console.log(`🏆 Nota más alta: ${Math.max(...promedios).toFixed(2)}`);
        console.log(`📉 Nota más baja: ${Math.min(...promedios).toFixed(2)}`);
    }

    procesarValorNota(valor) {
        // Si está vacío, devolver vacío
        if (!valor || valor.trim() === '') {
            return '';
        }
        
        // Convertir a string y limpiar espacios
        const valorLimpio = valor.toString().trim();
        
        // Verificar si es un número de exactamente 2 dígitos (10-99)
        if (/^\d{2}$/.test(valorLimpio)) {
            const numero = parseInt(valorLimpio);
            
            // Dividir por 10 para convertir a nota decimal
            // Ejemplos: 67 → 6.7, 45 → 4.5, 12 → 1.2, 70 → 7.0
            const notaConvertida = (numero / 10).toFixed(1);
            
            // Validar que la nota convertida esté en rango válido (1.0 - 7.0)
            const notaFloat = parseFloat(notaConvertida);
            if (notaFloat >= 1.0 && notaFloat <= 7.0) {
                console.log(`🔄 Convertido: ${numero} → ${notaConvertida}`);
                return notaConvertida;
            } else {
                console.log(`⚠️ Nota fuera de rango: ${numero} → ${notaConvertida} (no convertido)`);
                return valorLimpio; // Devolver original si está fuera de rango
            }
        }
        
        // Verificar si ya es una nota decimal válida (1.0 - 7.0)
        if (/^\d\.\d$/.test(valorLimpio)) {
            const nota = parseFloat(valorLimpio);
            if (nota >= 1.0 && nota <= 7.0) {
                return valorLimpio;
            }
        }
        
        // Verificar si es un número entero válido (1-7)
        if (/^\d$/.test(valorLimpio)) {
            const numero = parseInt(valorLimpio);
            if (numero >= 1 && numero <= 7) {
                return valorLimpio;
            }
        }
        
        // Para cualquier otro caso, devolver el valor original
        return valorLimpio;
    }

    manejarNavegacionAutomatica(inputActual, estudianteId, indiceNota) {
        const valor = inputActual.value;
        
        // Verificar si es un número de 2 dígitos (ej: 67, 45, 12, etc.) o ya fue convertido
        if (/^\d{2}$/.test(valor) || /^\d\.\d$/.test(valor)) {
            this.navegarAlSiguienteCampo(estudianteId, indiceNota);
        }
    }

    navegarAlSiguienteCampo(estudianteId, indiceNota) {
        // Buscar el siguiente campo de nota en el mismo estudiante
        const cardEstudiante = document.querySelector(`[data-estudiante-id="${estudianteId}"]`);
        const notaInputs = cardEstudiante.querySelectorAll('.nota-input');
        
        // Si hay más campos de nota en el mismo estudiante
        if (indiceNota + 1 < notaInputs.length) {
            const siguienteInput = notaInputs[indiceNota + 1];
            if (siguienteInput) {
                siguienteInput.focus();
                siguienteInput.select();
                return;
            }
        }
        
        // Si no hay más campos en el mismo estudiante, pasar al siguiente estudiante
        const indiceEstudianteActual = this.estudiantes.findIndex(est => est.id === estudianteId);
        if (indiceEstudianteActual !== -1 && indiceEstudianteActual + 1 < this.estudiantes.length) {
            const siguienteEstudiante = this.estudiantes[indiceEstudianteActual + 1];
            const siguienteCard = document.querySelector(`[data-estudiante-id="${siguienteEstudiante.id}"]`);
            
            if (siguienteCard) {
                const primerInputSiguiente = siguienteCard.querySelector('.nota-input');
                if (primerInputSiguiente) {
                    primerInputSiguiente.focus();
                    primerInputSiguiente.select();
                }
            }
        } else {
            // Si llegamos al final de todos los estudiantes, enfocar el botón calcular promedios
            const btnCalcular = document.getElementById('btn-calcular-promedios');
            if (btnCalcular) {
                btnCalcular.focus();
            }
        }
    }

    calcularPromedio(estudiante) {
        const notasValidas = estudiante.notas
            .map((nota, index) => ({
                valor: parseFloat(nota) || 0,
                porcentaje: estudiante.porcentajes[index] || 0
            }))
            .filter(item => item.valor > 0);

        if (notasValidas.length === 0) return 0;

        const sumaProductos = notasValidas.reduce((suma, item) => {
            return suma + (item.valor * item.porcentaje / 100);
        }, 0);

        return Math.round(sumaProductos * 100) / 100;
    }

    actualizarPromedio(estudianteId) {
        const estudiante = this.estudiantes.find(est => est.id === estudianteId);
        if (estudiante) {
            estudiante.promedio = this.calcularPromedio(estudiante);
            
            // Actualizar el display del promedio
            const promedioElement = document.querySelector(`[data-estudiante-id="${estudianteId}"] .estudiante-promedio`);
            if (promedioElement) {
                promedioElement.textContent = `Promedio: ${estudiante.promedio.toFixed(2)}`;
                
                // Asegurar color correcto según el tema
                const isLightTheme = document.body.classList.contains('theme-light');
                if (isLightTheme) {
                    promedioElement.style.color = '#000000';
                }
            }
            
            this.guardarDatos();
        }
    }

    renderizarEstudiantes() {
        const container = document.getElementById('estudiantes-container');
        container.innerHTML = '';

        this.estudiantes.forEach(estudiante => {
            const card = this.crearTarjetaEstudiante(estudiante);
            container.appendChild(card);
        });

        // Asegurar colores correctos después de renderizar
        setTimeout(() => {
            this.actualizarColoresPromedios();
        }, 100);
    }

    crearTarjetaEstudiante(estudiante) {
        const card = document.createElement('div');
        card.className = 'estudiante-card';
        card.setAttribute('data-estudiante-id', estudiante.id);

        const notasHTML = estudiante.notas.map((nota, index) => `
            <div class="nota-grupo">
                <input 
                    type="number" 
                    class="nota-input" 
                    value="${nota}" 
                    placeholder="Nota ${index + 1}"
                    min="1" 
                    max="7" 
                    step="0.1"
                    data-nota-index="${index}"
                >
                <input 
                    type="number" 
                    class="porcentaje-input" 
                    value="${estudiante.porcentajes[index] || 0}" 
                    placeholder="%" 
                    min="0" 
                    max="100"
                    data-porcentaje-index="${index}"
                >
            </div>
        `).join('');

        card.innerHTML = `
            <div class="estudiante-header">
                <div>
                    <div class="estudiante-nombre" contenteditable="true">${estudiante.nombre}</div>
                    <div class="estudiante-promedio">Promedio: ${estudiante.promedio.toFixed(2)}</div>
                </div>
                <div class="estudiante-acciones">
                    <button class="btn-accion-estudiante btn-agregar-nota" title="Agregar nota">+</button>
                    <button class="btn-accion-estudiante btn-eliminar-nota" title="Eliminar nota">-</button>
                    <button class="btn-accion-estudiante btn-estado" title="Estado">↻</button>
                </div>
            </div>
            <div class="estudiante-notas">
                ${notasHTML}
            </div>
        `;

        this.configurarEventosEstudiante(card, estudiante);
        return card;
    }

    configurarEventosEstudiante(card, estudiante) {
        // Editar nombre
        const nombreElement = card.querySelector('.estudiante-nombre');
        nombreElement.addEventListener('blur', (e) => {
            estudiante.nombre = e.target.textContent.trim() || `Estudiante ${this.estudiantes.indexOf(estudiante) + 1}`;
            this.guardarDatos();
        });

        // Inputs de notas
        const notaInputs = card.querySelectorAll('.nota-input');
        notaInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                // Procesar el valor antes de guardarlo
                const valorProcesado = this.procesarValorNota(e.target.value);
                
                // Si el valor cambió (se dividió por 10), actualizar el input
                if (valorProcesado !== e.target.value) {
                    e.target.value = valorProcesado;
                    
                    // Efecto visual para indicar la conversión
                    e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                    e.target.style.transition = 'background-color 0.3s ease';
                    
                    setTimeout(() => {
                        e.target.style.backgroundColor = '';
                    }, 800);
                }
                
                estudiante.notas[index] = valorProcesado;
                this.actualizarPromedio(estudiante.id);
                
                // Navegación automática para números de 2 dígitos
                this.manejarNavegacionAutomatica(e.target, estudiante.id, index);
            });

            // Navegación con Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.navegarAlSiguienteCampo(estudiante.id, index);
                }
            });
        });

        // Inputs de porcentajes
        const porcentajeInputs = card.querySelectorAll('.porcentaje-input');
        porcentajeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                estudiante.porcentajes[index] = parseFloat(e.target.value) || 0;
                this.actualizarPromedio(estudiante.id);
            });
        });

        // Botones de acción
        card.querySelector('.btn-agregar-nota').addEventListener('click', () => {
            this.agregarNotaEstudiante(estudiante.id);
        });

        card.querySelector('.btn-eliminar-nota').addEventListener('click', () => {
            this.eliminarNotaEstudiante(estudiante.id);
        });

        card.querySelector('.btn-estado').addEventListener('click', () => {
            this.toggleEstadoEstudiante(estudiante.id);
        });
    }

    agregarNotaEstudiante(estudianteId) {
        const estudiante = this.estudiantes.find(est => est.id === estudianteId);
        if (estudiante && estudiante.notas.length < 10) {
            estudiante.notas.push('');
            estudiante.porcentajes.push(0);
            this.renderizarEstudiantes();
            this.guardarDatos();
        }
    }

    eliminarNotaEstudiante(estudianteId) {
        const estudiante = this.estudiantes.find(est => est.id === estudianteId);
        if (estudiante && estudiante.notas.length > 1) {
            estudiante.notas.pop();
            estudiante.porcentajes.pop();
            this.actualizarPromedio(estudianteId);
            this.renderizarEstudiantes();
            this.guardarDatos();
        }
    }

    toggleEstadoEstudiante(estudianteId) {
        const estudiante = this.estudiantes.find(est => est.id === estudianteId);
        if (estudiante) {
            const promedio = estudiante.promedio;
            let emoji = '↻';
            
            if (promedio >= 6.0) emoji = '🎉';
            else if (promedio >= 5.0) emoji = '😊';
            else if (promedio >= 4.0) emoji = '😐';
            else if (promedio > 0) emoji = '😰';
            else emoji = '↻'; // Sin notas, mostrar reset
            
            const btnEstado = document.querySelector(`[data-estudiante-id="${estudianteId}"] .btn-estado`);
            if (btnEstado) {
                btnEstado.textContent = emoji;
            }
        }
    }

    cargarCurso() {
        const selector = document.getElementById('selector-curso');
        const cursoSeleccionado = selector.value;
        
        if (cursoSeleccionado) {
            this.seleccionarCurso(cursoSeleccionado);
        } else {
            this.mostrarNotificacion('Selecciona un curso primero', 'warning');
        }
    }

    recargarCursosDesdeGestion() {
        // Recargar cursos desde gestión de estudiantes
        this.cargarCursosDesdeGestion();
        
        // Verificar si hay cursos disponibles
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const cantidadCursos = Object.keys(cursosData).length;
        
        if (cantidadCursos > 0) {
            this.mostrarNotificacion(`Cursos actualizados: ${cantidadCursos} cursos disponibles`, 'success');
        } else {
            this.mostrarNotificacion('No hay cursos en Gestión de Estudiantes. Ve a Inicio → Gestión de Estudiantes para cargar cursos.', 'warning');
        }
        
        console.log('🔄 Cursos recargados desde gestión de estudiantes');
    }

    seleccionarCurso(nombreCurso) {
        const curso = this.cursos.find(c => c.nombre === nombreCurso);
        if (curso) {
            // Crear una copia profunda de los estudiantes del curso
            this.estudiantes = curso.estudiantes.map(estudiante => ({
                ...estudiante,
                notas: Array(this.numeroNotasGlobal).fill(''),
                porcentajes: Array(this.numeroNotasGlobal).fill(this.porcentajeGlobal / this.numeroNotasGlobal),
                promedio: 0
            }));
            
            this.renderizarEstudiantes();
            this.guardarDatos();
            this.mostrarNotificacion(`Curso "${nombreCurso}" cargado con ${this.estudiantes.length} estudiantes`, 'success');
            
            console.log(`📚 Curso cargado: ${nombreCurso} con ${this.estudiantes.length} estudiantes`);
        } else {
            this.mostrarNotificacion(`No se encontró el curso "${nombreCurso}"`, 'error');
        }
    }

    limpiarTodo() {
        this.estudiantes = [];
        this.renderizarEstudiantes();
        this.agregarEstudianteInicial();
        
        // Recargar cursos desde gestión
        this.cargarCursosDesdeGestion();
        
        this.guardarDatos();
        this.mostrarNotificacion('Todos los datos han sido limpiados y cursos actualizados', 'success');
    }



    guardarDatos() {
        const datos = {
            estudiantes: this.estudiantes,
            cursos: this.cursos,
            numeroNotasGlobal: this.numeroNotasGlobal,
            porcentajeGlobal: this.porcentajeGlobal,
            fecha: new Date().toISOString()
        };

        localStorage.setItem('multiples-promedios-data', JSON.stringify(datos));
    }

    cargarDatosGuardados() {
        try {
            const datosGuardados = localStorage.getItem('multiples-promedios-data');
            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);
                this.estudiantes = datos.estudiantes || [];
                this.cursos = datos.cursos || [];
                this.numeroNotasGlobal = datos.numeroNotasGlobal || 1;
                this.porcentajeGlobal = datos.porcentajeGlobal || 100;

                // Actualizar inputs
                document.getElementById('numero-notas').value = this.numeroNotasGlobal;
                document.getElementById('porcentaje-dividir').value = this.porcentajeGlobal;
            }
            
            // Cargar cursos desde gestión de estudiantes
            this.cargarCursosDesdeGestion();
            
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
        }
    }

    cargarCursosDesdeGestion() {
        try {
            // Cargar cursos desde gestión de estudiantes
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const nombresCursos = Object.keys(cursosData);
            
            // Convertir al formato interno de la aplicación
            this.cursos = nombresCursos.map(nombreCurso => {
                const estudiantesDelCurso = cursosData[nombreCurso] || [];
                
                // Convertir estudiantes al formato interno
                const estudiantesFormateados = estudiantesDelCurso.map((estudiante, index) => {
                    let nombreEstudiante;
                    
                    if (typeof estudiante === 'object' && estudiante !== null) {
                        nombreEstudiante = estudiante.nombre || `Estudiante ${index + 1}`;
                    } else if (typeof estudiante === 'string') {
                        nombreEstudiante = estudiante;
                    } else {
                        nombreEstudiante = `Estudiante ${index + 1}`;
                    }
                    
                    return {
                        id: Date.now() + Math.random() + index,
                        nombre: nombreEstudiante,
                        notas: Array(this.numeroNotasGlobal).fill(''),
                        porcentajes: Array(this.numeroNotasGlobal).fill(this.porcentajeGlobal / this.numeroNotasGlobal),
                        promedio: 0
                    };
                });
                
                return {
                    nombre: nombreCurso,
                    estudiantes: estudiantesFormateados
                };
            });
            
            this.actualizarSelectorCursos();
            
            if (nombresCursos.length > 0) {
                console.log(`✅ Cargados ${nombresCursos.length} cursos desde gestión de estudiantes`);
            } else {
                console.log('⚠️ No hay cursos disponibles en gestión de estudiantes');
            }
            
        } catch (error) {
            console.error('❌ Error al cargar cursos desde gestión:', error);
            this.cursos = [];
            this.actualizarSelectorCursos();
        }
    }

    actualizarSelectorCursos() {
        const selector = document.getElementById('selector-curso');
        selector.innerHTML = '<option value="">Seleccionar Curso</option>';
        
        if (this.cursos.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay cursos cargados';
            option.disabled = true;
            selector.appendChild(option);
            return;
        }
        
        this.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.nombre;
            option.textContent = `${curso.nombre} (${curso.estudiantes.length} estudiantes)`;
            selector.appendChild(option);
        });
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        
        // Estilos de la notificación
        Object.assign(notificacion.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        });

        // Colores según tipo
        const colores = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notificacion.style.background = colores[tipo] || colores.info;

        // Agregar al DOM
        document.body.appendChild(notificacion);

        // Animación de entrada
        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    // Métodos de utilidad para debugging
    exportarDatos() {
        return {
            estudiantes: this.estudiantes,
            cursos: this.cursos,
            numeroNotasGlobal: this.numeroNotasGlobal,
            porcentajeGlobal: this.porcentajeGlobal
        };
    }

    importarDatos(datos) {
        this.estudiantes = datos.estudiantes || [];
        this.cursos = datos.cursos || [];
        this.numeroNotasGlobal = datos.numeroNotasGlobal || 1;
        this.porcentajeGlobal = datos.porcentajeGlobal || 100;
        
        this.renderizarEstudiantes();
        this.actualizarSelectorCursos();
        this.guardarDatos();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calculadoraNotasParciales = new CalculadoraNotasParciales();
});

// Funciones globales para debugging
window.exportarMultiplesPromedios = () => {
    if (window.calculadoraNotasParciales) {
        const datos = window.calculadoraNotasParciales.exportarDatos();
        console.log('Datos exportados:', datos);
        return datos;
    }
};

window.importarMultiplesPromedios = (datos) => {
    if (window.calculadoraNotasParciales) {
        window.calculadoraNotasParciales.importarDatos(datos);
        console.log('Datos importados correctamente');
    }
};

// Función de demostración para la conversión de notas
window.demostrarConversionNotas = () => {
    if (window.calculadoraNotasParciales) {
        console.log('🎯 === DEMOSTRACIÓN DE CONVERSIÓN DE NOTAS ===');
        const ejemplos = ['67', '45', '12', '70', '35', '60', '7', '6.5', '80', '05'];
        
        ejemplos.forEach(ejemplo => {
            const resultado = window.calculadoraNotasParciales.procesarValorNota(ejemplo);
            console.log(`📝 ${ejemplo} → ${resultado}`);
        });
        
        console.log('💡 Los números de 2 dígitos se dividen automáticamente por 10');
        console.log('✅ Solo se procesan notas en rango válido (1.0 - 7.0)');
    }
};

console.log('📊 Múltiples Promedios - Sistema cargado correctamente');
console.log('⌨️ Atajos de teclado disponibles:');
console.log('  Ctrl+1: Agregar estudiante');
console.log('  Ctrl+2: Eliminar último estudiante');
console.log('  Ctrl+S: Guardar datos');
console.log('  Ctrl+R: Resetear todas las notas');
console.log('  Ctrl+U: Actualizar cursos desde Gestión de Estudiantes');
console.log('  Ctrl+Enter: Calcular todos los promedios');
console.log('  Enter: Navegar al siguiente campo (dentro de inputs de notas)');
console.log('🔄 Navegación automática: Se avanza automáticamente al siguiente campo al escribir números de 2 dígitos o decimales');
console.log('🔢 Conversión automática: Los números de 2 dígitos se dividen por 10 (ej: 67 → 6.7, 45 → 4.5, 12 → 1.2)'); 