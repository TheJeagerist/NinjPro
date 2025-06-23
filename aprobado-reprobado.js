// ===== CALCULADORA DE PROMEDIO PONDERADO - JAVASCRIPT =====

class CalculadoraPromedio {
    constructor() {
        this.filas = [];
        this.filaIdCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.agregarFilasIniciales();
        this.detectarTema();
        this.initAnimatedBackgrounds();
    }

    // Detectar tema desde el sistema principal de PROFENINJA
    detectarTema() {
        // Detectar desde localStorage (sistema principal de PROFENINJA)
        const temaGuardado = localStorage.getItem('theme') || localStorage.getItem('profeninja-theme');
        
        if (temaGuardado) {
            // Aplicar el tema guardado
            document.body.className = temaGuardado;
            console.log('🎨 Tema aplicado:', temaGuardado);
        } else {
            // Tema por defecto
            document.body.className = 'theme-dark';
            console.log('🎨 Tema por defecto aplicado: theme-dark');
        }
        
        // Escuchar cambios de tema en tiempo real
        this.setupThemeListener();
    }
    
    // Configurar listener para cambios de tema
    setupThemeListener() {
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme' || e.key === 'profeninja-theme') {
                if (e.newValue) {
                    document.body.className = e.newValue;
                    this.actualizarFondoAnimado(e.newValue);
                    console.log('🎨 Tema actualizado:', e.newValue);
                }
            }
        });
        
        // Verificar cambios periódicamente (para cambios en la misma pestaña)
        setInterval(() => {
            const temaActual = localStorage.getItem('theme') || localStorage.getItem('profeninja-theme');
            const temaAplicado = document.body.className.match(/theme-\w+/)?.[0];
            
            if (temaActual && temaActual !== temaAplicado) {
                document.body.className = temaActual;
                this.actualizarFondoAnimado(temaActual);
                console.log('🎨 Tema sincronizado:', temaActual);
            }
        }, 1000);
    }

    // Inicializar fondos animados
    initAnimatedBackgrounds() {
        if (typeof AnimatedBackgrounds !== 'undefined') {
            if (!window.animatedBackgrounds) {
                window.animatedBackgrounds = new AnimatedBackgrounds();
            }
            
            // Inicializar el sistema de fondos
            window.animatedBackgrounds.init();
            
            // Aplicar el tema actual
            const temaActual = document.body.className.match(/theme-(\w+)/)?.[1] || 'dark';
            window.animatedBackgrounds.switchTheme(temaActual);
            
            console.log('🎨 Fondos animados inicializados para calculadora');
        } else {
            console.warn('⚠️ AnimatedBackgrounds no está disponible');
        }
    }

    // Actualizar fondo animado cuando cambia el tema
    actualizarFondoAnimado(tema) {
        if (window.animatedBackgrounds && typeof window.animatedBackgrounds.switchTheme === 'function') {
            const temaLimpio = tema.replace('theme-', '');
            window.animatedBackgrounds.switchTheme(temaLimpio);
            console.log('🎨 Fondo animado actualizado:', temaLimpio);
        }
    }

    // Mostrar indicador de que hay datos pero no se ha calculado
    mostrarIndicadorDatosPendientes() {
        const estadoElement = document.getElementById('estado-resultado');
        const promedioElement = document.getElementById('promedio-valor');
        
        // Verificar si hay datos ingresados
        const tieneAlgunDato = this.tieneValores();
        
        if (tieneAlgunDato) {
            // Mostrar indicador de que hay datos pendientes de calcular
            estadoElement.className = 'estado-resultado pendiente';
            estadoElement.textContent = 'Pendiente de calcular';
            promedioElement.textContent = '--';
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones de control
        document.getElementById('btn-agregar-fila').addEventListener('click', () => this.agregarFila());
        document.getElementById('btn-eliminar-fila').addEventListener('click', () => this.eliminarUltimaFila());
        document.getElementById('btn-limpiar-todo').addEventListener('click', () => this.limpiarTodo());
        
        // Botón calcular
        document.getElementById('btn-calcular').addEventListener('click', () => this.calcularPromedio());
        


        // Botón volver al launcher
        document.getElementById('btn-volver-launcher').addEventListener('click', () => this.volverAlLauncher());

        // Escuchar cambios en los inputs para validar solamente
        document.addEventListener('input', (e) => {
            if (e.target.matches('.input-nota, .input-ponderacion')) {
                this.validarInput(e.target);
                this.mostrarIndicadorDatosPendientes();
                
                // Manejar notas calculadas que se modifican o borran
                if (e.target.matches('.input-nota') && e.target.hasAttribute('data-calculada')) {
                    if (e.target.value.trim() === '') {
                        // Si se borra completamente, volver al estado inicial
                        this.limpiarNotaCalculada(e.target);
                    } else {
                        // Si se modifica, convertir a nota del usuario
                        this.convertirNotaCalculadaAUsuario(e.target);
                    }
                }
                
                // Navegación automática entre campos
                this.manejarNavegacionAutomatica(e.target);
            }
        });

        // Escuchar eventos de blur para aplicar conversiones finales
        document.addEventListener('blur', (e) => {
            if (e.target.matches('.input-nota')) {
                this.validarInput(e.target);
            }
        }, true);

        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.manejarTeclado(e));
    }

    // Manejar atajos de teclado
    manejarTeclado(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.calcularPromedio();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    this.agregarFila();
                    break;
                case '-':
                    e.preventDefault();
                    this.eliminarUltimaFila();
                    break;
                case 'Backspace':
                    e.preventDefault();
                    this.limpiarTodo();
                    break;
            }
        }
    }

    // Agregar filas iniciales
    agregarFilasIniciales() {
        for (let i = 0; i < 4; i++) {
            this.agregarFila();
        }
    }

    // Agregar nueva fila
    agregarFila() {
        const filaId = `fila-${this.filaIdCounter++}`;
        const filaHTML = `
            <div class="fila-nota" id="${filaId}">
                <input 
                    type="number" 
                    class="input-nota" 
                    placeholder="Ej: 6.5" 
                    min="1.0" 
                    max="7.0" 
                    step="0.1"
                    data-fila="${filaId}"
                >
                <div class="ponderacion-group">
                    <input 
                        type="number" 
                        class="input-ponderacion" 
                        placeholder="Ej: 30" 
                        min="0" 
                        max="100" 
                        step="1"
                        data-fila="${filaId}"
                    >
                    <span class="percent-symbol">%</span>
                </div>
            </div>
        `;

        const container = document.getElementById('filas-container');
        container.insertAdjacentHTML('beforeend', filaHTML);
        
        this.filas.push(filaId);
        
        // Animar entrada
        const nuevaFila = document.getElementById(filaId);
        nuevaFila.style.opacity = '0';
        nuevaFila.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            nuevaFila.style.opacity = '1';
            nuevaFila.style.transform = 'translateY(0)';
        }, 10);

        // Enfocar el input de nota
        const inputNota = nuevaFila.querySelector('.input-nota');
        setTimeout(() => inputNota.focus(), 100);
    }

    // Eliminar última fila
    eliminarUltimaFila() {
        if (this.filas.length <= 1) {
            this.mostrarNotificacion('Debe mantener al menos una fila', 'warning');
            return;
        }

        const ultimaFilaId = this.filas.pop();
        const fila = document.getElementById(ultimaFilaId);
        
        if (fila) {
            fila.style.opacity = '0';
            fila.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                fila.remove();
                this.calcularPromedio();
            }, 300);
        }
    }

    // Limpiar todos los datos
    limpiarTodo() {
        // Limpiar todas las filas
        const container = document.getElementById('filas-container');
        container.innerHTML = '';
        this.filas = [];
        this.filaIdCounter = 0;

        // Reiniciar resultado
        this.actualizarResultado(0, 'reprobado', null, false);

        // Agregar filas iniciales
        this.agregarFilasIniciales();

        this.mostrarNotificacion('Datos limpiados correctamente', 'success');
    }

    // Verificar si hay valores ingresados
    tieneValores() {
        const inputs = document.querySelectorAll('.input-nota, .input-ponderacion');
        return Array.from(inputs).some(input => input.value.trim() !== '');
    }

    // Validar input
    validarInput(input) {
        if (input.classList.contains('input-nota')) {
            // Limitar formato de entrada para notas
            let valorTexto = input.value;
            
            // Permitir solo números, un punto decimal y máximo un decimal
            valorTexto = valorTexto.replace(/[^\d.]/g, ''); // Solo números y punto
            
            // Evitar múltiples puntos decimales
            const puntos = valorTexto.split('.');
            if (puntos.length > 2) {
                valorTexto = puntos[0] + '.' + puntos[1];
            }
            
            // Limitar a máximo un decimal después del punto
            if (puntos.length === 2 && puntos[1].length > 1) {
                valorTexto = puntos[0] + '.' + puntos[1].charAt(0);
            }
            
            // Actualizar el valor si fue modificado
            if (input.value !== valorTexto) {
                input.value = valorTexto;
            }
            
            let valor = parseFloat(valorTexto);
            
            // Si el número tiene 2 dígitos (10-99), dividir por 10
            if (valor >= 10 && valor <= 99 && Number.isInteger(valor)) {
                valor = valor / 10;
                input.value = valor.toFixed(1);
                console.log('📝 Nota convertida:', `${valor * 10} → ${valor}`);
            }
            
            if (isNaN(valor) || valor < 1.0 || valor > 7.0) {
                input.style.borderColor = '#ef4444';
                input.setCustomValidity('La nota debe estar entre 1.0 y 7.0');
            } else {
                input.style.borderColor = 'rgba(255, 235, 59, 0.4)';
                input.setCustomValidity('');
            }
        } else if (input.classList.contains('input-ponderacion')) {
            // Limitar entrada para ponderaciones (solo números enteros)
            let valorTexto = input.value.replace(/[^\d]/g, ''); // Solo números
            
            if (input.value !== valorTexto) {
                input.value = valorTexto;
            }
            
            const valor = parseFloat(valorTexto);
            
            if (isNaN(valor) || valor < 0 || valor > 100) {
                input.style.borderColor = '#ef4444';
                input.setCustomValidity('La ponderación debe estar entre 0 y 100');
            } else {
                input.style.borderColor = 'rgba(76, 175, 80, 0.4)';
                input.setCustomValidity('');
            }
        }
    }

    // Calcular promedio ponderado
    calcularPromedio() {
        const filas = document.querySelectorAll('.fila-nota');
        let sumaNotas = 0;
        let sumaPonderaciones = 0;
        let filasValidas = 0;
        let filasConNota = 0;
        let filasConPonderacion = 0;
        let totalFilas = 0;
        let filasConDatos = 0;

        // Primero, limpiar cualquier nota mínima calculada anteriormente
        this.limpiarNotasMinimas();

        // Arrays para el cálculo de notas mínimas
        let filasConNotaYPonderacion = [];
        let filasSoloPonderacion = [];

        for (const fila of filas) {
            const inputNota = fila.querySelector('.input-nota');
            const inputPonderacion = fila.querySelector('.input-ponderacion');
            
            const nota = parseFloat(inputNota.value);
            const ponderacion = parseFloat(inputPonderacion.value);

            totalFilas++;

            // Contar filas que tienen al menos un campo lleno
            if (!isNaN(nota) || !isNaN(ponderacion)) {
                filasConDatos++;
            }

            // Verificar si la nota es calculada o del usuario
            const esNotaCalculada = inputNota.hasAttribute('data-calculada');
            const tieneNotaUsuario = !isNaN(nota) && !esNotaCalculada;
            const tienePonderacion = !isNaN(ponderacion) && ponderacion > 0;

            // Clasificar filas para cálculo de notas mínimas
            if (tieneNotaUsuario && tienePonderacion) {
                // Fila con nota del usuario y ponderación válida
                filasConNotaYPonderacion.push({ fila, nota, ponderacion, inputNota, inputPonderacion });
                filasConNota++;
                filasConPonderacion++;
            } else if (!tieneNotaUsuario && tienePonderacion) {
                // Fila solo con ponderación (sin nota del usuario)
                filasSoloPonderacion.push({ fila, ponderacion, inputNota, inputPonderacion });
                filasConPonderacion++;
            }

            // Incluir en el cálculo si tiene nota y ponderación válidas
            // (incluyendo notas calculadas para el promedio actual)
            if (!isNaN(nota) && !isNaN(ponderacion) && nota >= 1.0 && nota <= 7.0 && ponderacion > 0) {
                sumaNotas += nota * ponderacion;
                sumaPonderaciones += ponderacion;
                filasValidas++;
            }
        }

        // Calcular notas mínimas necesarias si hay filas con solo ponderación
        // REQUISITO: Necesitamos al menos 2 notas del usuario para calcular notas faltantes
        if (filasSoloPonderacion.length > 0 && filasConNotaYPonderacion.length >= 2) {
            this.calcularNotasMinimas(filasConNotaYPonderacion, filasSoloPonderacion);
        } else if (filasSoloPonderacion.length > 0 && filasConNotaYPonderacion.length === 1) {
            console.log('⚠️ Se necesitan al menos 2 notas para calcular las notas faltantes');
            this.mostrarNotificacion('Ingresa al menos 2 notas para calcular las notas faltantes', 'warning');
        }

        let promedio = 0;
        if (sumaPonderaciones > 0) {
            promedio = sumaNotas / sumaPonderaciones;
        }

        const estado = promedio >= 4.0 ? 'aprobado' : 'reprobado';
        
        // Verificar si todos los campos con datos están completos
        const todosLosCamposCompletos = this.verificarCamposCompletos();
        
        this.actualizarResultado(promedio, estado, null, todosLosCamposCompletos);

        return {
            promedio: promedio.toFixed(2),
            estado,
            filasValidas,
            sumaPonderaciones,
            todosCompletos: todosLosCamposCompletos
        };
    }

    // Calcular notas mínimas necesarias para aprobar
    calcularNotasMinimas(filasConNota, filasSinNota) {
        console.log('🔢 Iniciando cálculo de notas mínimas...');
        console.log('📊 Filas con nota del usuario:', filasConNota.length);
        console.log('📝 Filas sin nota (solo ponderación):', filasSinNota.length);

        // Validación: necesitamos al menos 2 notas del usuario
        if (filasConNota.length < 2) {
            console.log('❌ ERROR: Se necesitan al menos 2 notas del usuario para calcular');
            this.mostrarNotificacion('Se requieren mínimo 2 notas para calcular las faltantes', 'error');
            return;
        }

        // Calcular suma actual de notas ponderadas (solo notas del usuario)
        let sumaActual = 0;
        let sumaPonderacionesConNota = 0;
        
        filasConNota.forEach(({ nota, ponderacion }) => {
            sumaActual += nota * ponderacion;
            sumaPonderacionesConNota += ponderacion;
            console.log(`   • Nota ${nota} × ${ponderacion}% = ${(nota * ponderacion).toFixed(2)}`);
        });

        // Calcular suma de ponderaciones faltantes
        let sumaPonderacionesFaltantes = 0;
        filasSinNota.forEach(({ ponderacion }) => {
            sumaPonderacionesFaltantes += ponderacion;
            console.log(`   • Ponderación faltante: ${ponderacion}%`);
        });

        const sumaPonderacionesTotal = sumaPonderacionesConNota + sumaPonderacionesFaltantes;
        console.log(`📈 Suma actual ponderada: ${sumaActual.toFixed(2)}`);
        console.log(`📊 Ponderaciones totales: ${sumaPonderacionesTotal}%`);

        // Para aprobar necesitamos un promedio de 4.0
        const notaObjetivo = 4.0;
        const sumaObjetivo = notaObjetivo * sumaPonderacionesTotal;
        const sumaFaltante = sumaObjetivo - sumaActual;

        console.log(`🎯 Suma objetivo (4.0): ${sumaObjetivo.toFixed(2)}`);
        console.log(`📉 Suma faltante: ${sumaFaltante.toFixed(2)}`);

        // Si ya está aprobado con las notas actuales
        if (sumaFaltante <= 0) {
            console.log('✅ Ya estás aprobado con las notas actuales');
            filasSinNota.forEach(({ inputNota }) => {
                this.mostrarNotaMinima(inputNota, 1.0, true); // Nota mínima posible
            });
            return;
        }

        // Verificar si es matemáticamente imposible aprobar
        let esImposibleAprobar = false;
        
        if (filasSinNota.length === 1) {
            // Solo falta una nota
            const notaMinima = sumaFaltante / filasSinNota[0].ponderacion;
            console.log(`📝 Una nota faltante: ${notaMinima.toFixed(2)}`);
            
            if (notaMinima > 7.0) {
                esImposibleAprobar = true;
                this.mostrarMensajeImposibleAprobar(notaMinima);
            }
            this.mostrarNotaMinima(filasSinNota[0].inputNota, notaMinima, false);
        } else {
            // Faltan múltiples notas - distribuir equitativamente
            const notaMinimaPorFila = sumaFaltante / sumaPonderacionesFaltantes;
            console.log(`📝 Múltiples notas faltantes: ${notaMinimaPorFila.toFixed(2)} cada una`);
            
            if (notaMinimaPorFila > 7.0) {
                esImposibleAprobar = true;
                this.mostrarMensajeImposibleAprobar(notaMinimaPorFila);
            }
            
            filasSinNota.forEach(({ inputNota, ponderacion }) => {
                this.mostrarNotaMinima(inputNota, notaMinimaPorFila, false);
            });
        }

        if (esImposibleAprobar) {
            console.log(`❌ IMPOSIBLE APROBAR: Se necesita nota ${(sumaFaltante / sumaPonderacionesFaltantes).toFixed(1)} (máximo posible: 7.0)`);
        } else {
            console.log(`✅ Notas mínimas calculadas correctamente`);
        }
    }

    // Mostrar nota mínima en el input
    mostrarNotaMinima(inputNota, notaMinima, yaAprobado) {
        // Limitar la nota entre 1.0 y 7.0
        const notaLimitada = Math.max(1.0, Math.min(7.0, notaMinima));
        
        // Mostrar la nota calculada
        inputNota.value = notaLimitada.toFixed(1);
        inputNota.classList.add('nota-minima-calculada');
        
        // Agregar atributo para identificar que es calculada
        inputNota.setAttribute('data-calculada', 'true');
        
        // Color diferente según si ya está aprobado o no
        if (yaAprobado) {
            inputNota.classList.add('ya-aprobado');
        } else if (notaLimitada >= 7.0) {
            inputNota.classList.add('imposible-aprobar');
        }

        // Tooltip informativo
        const mensaje = yaAprobado 
            ? 'Ya estás aprobado - esta es la nota mínima posible'
            : notaLimitada >= 7.0 
                ? 'Imposible aprobar - nota requerida excede 7.0'
                : `Nota mínima necesaria para aprobar: ${notaLimitada.toFixed(1)}`;
        
        inputNota.title = mensaje;
    }

    // Limpiar notas mínimas calculadas
    limpiarNotasMinimas() {
        const notasCalculadas = document.querySelectorAll('.input-nota[data-calculada="true"]');
        notasCalculadas.forEach(input => {
            input.value = '';
            input.classList.remove('nota-minima-calculada', 'ya-aprobado', 'imposible-aprobar');
            input.removeAttribute('data-calculada');
            input.title = '';
        });
        
        // Limpiar mensaje de imposible aprobar si existe
        const mensajeImposible = document.querySelector('.mensaje-imposible-aprobar');
        if (mensajeImposible) {
            mensajeImposible.remove();
        }
    }

    // Convertir nota calculada en nota del usuario
    convertirNotaCalculadaAUsuario(input) {
        // Remover todos los estilos y atributos de nota calculada
        input.classList.remove('nota-minima-calculada', 'ya-aprobado', 'imposible-aprobar');
        input.removeAttribute('data-calculada');
        input.title = '';
        
        // Aplicar estilos normales de input-nota
        input.style.background = 'rgba(255, 235, 59, 0.3)';
        input.style.borderColor = 'rgba(255, 235, 59, 0.4)';
        input.style.color = 'inherit';
        input.style.fontWeight = '500';
        input.style.fontStyle = 'normal';
        input.style.boxShadow = 'none';
        input.style.animation = 'none';
        
        console.log('📝 Nota calculada convertida a nota del usuario:', input.value);
    }

    // Limpiar nota calculada cuando se borra completamente
    limpiarNotaCalculada(input) {
        // Remover todos los estilos y atributos de nota calculada
        input.classList.remove('nota-minima-calculada', 'ya-aprobado', 'imposible-aprobar');
        input.removeAttribute('data-calculada');
        input.title = '';
        
        // Volver a estilos iniciales (sin estilos inline)
        input.style.background = '';
        input.style.borderColor = '';
        input.style.color = '';
        input.style.fontWeight = '';
        input.style.fontStyle = '';
        input.style.boxShadow = '';
        input.style.animation = '';
        
        console.log('🗑️ Nota calculada borrada, campo vuelve al estado inicial');
    }

    // Manejar navegación automática entre campos
    manejarNavegacionAutomatica(input) {
        const valor = input.value.trim();
        
        // Solo navegar si el campo está completo
        if (!valor) return;
        
        if (input.classList.contains('input-nota')) {
            // Si es un campo de nota y tiene exactamente 2 dígitos O 3 caracteres (X.X), navegar
            const es2Digitos = valor.length === 2 && /^\d{2}$/.test(valor);
            const es3CaracteresDecimal = valor.length === 3 && /^\d\.\d$/.test(valor);
            
            if (es2Digitos) {
                console.log(`🔄 Navegación automática: Nota "${valor}" (2 dígitos) → navegando...`);
                this.navegarSiguienteCampo(input, 'nota');
            } else if (es3CaracteresDecimal) {
                console.log(`🔄 Navegación automática: Nota "${valor}" (formato X.X) → navegando...`);
                this.navegarSiguienteCampo(input, 'nota');
            } else if (valor.length === 1) {
                console.log(`⏳ Esperando más caracteres en nota: "${valor}"`);
            } else if (valor.length === 2 && valor.includes('.')) {
                console.log(`⏳ Esperando decimal en nota: "${valor}"`);
            }
        } else if (input.classList.contains('input-ponderacion')) {
            // Si es un campo de ponderación y tiene 2 dígitos, navegar
            if (valor.length === 2 && /^\d{2}$/.test(valor)) {
                const ponderacion = parseFloat(valor);
                if (ponderacion >= 10 && ponderacion <= 99) {
                    console.log(`🔄 Navegación automática: Ponderación "${valor}" (2 dígitos) → navegando...`);
                    this.navegarSiguienteCampo(input, 'ponderacion');
                }
            } else if (valor.length === 1) {
                console.log(`⏳ Esperando segundo dígito en ponderación: "${valor}"`);
            }
        }
    }

    // Navegar al siguiente campo disponible
    navegarSiguienteCampo(currentInput, tipoActual) {
        const filas = Array.from(document.querySelectorAll('.fila-nota'));
        const filaActual = currentInput.closest('.fila-nota');
        const indiceFilaActual = filas.indexOf(filaActual);
        
        if (tipoActual === 'nota') {
            // Buscar la siguiente nota vacía en la columna de notas
            for (let i = indiceFilaActual + 1; i < filas.length; i++) {
                const siguienteNota = filas[i].querySelector('.input-nota');
                if (!siguienteNota.value.trim() && !siguienteNota.hasAttribute('data-calculada')) {
                    setTimeout(() => siguienteNota.focus(), 50);
                    return;
                }
            }
            
            // Si todas las notas están llenas, ir a la primera ponderación vacía
            for (let i = 0; i < filas.length; i++) {
                const ponderacion = filas[i].querySelector('.input-ponderacion');
                if (!ponderacion.value.trim()) {
                    setTimeout(() => ponderacion.focus(), 50);
                    return;
                }
            }
        } else if (tipoActual === 'ponderacion') {
            // Buscar la siguiente ponderación vacía
            for (let i = indiceFilaActual + 1; i < filas.length; i++) {
                const siguientePonderacion = filas[i].querySelector('.input-ponderacion');
                if (!siguientePonderacion.value.trim()) {
                    setTimeout(() => siguientePonderacion.focus(), 50);
                    return;
                }
            }
            
            // Si todas las ponderaciones están llenas, ir a la primera nota vacía
            for (let i = 0; i < filas.length; i++) {
                const nota = filas[i].querySelector('.input-nota');
                if (!nota.value.trim() && !nota.hasAttribute('data-calculada')) {
                    setTimeout(() => nota.focus(), 50);
                    return;
                }
            }
        }
        
        console.log('🔄 Navegación automática: Todos los campos disponibles están llenos');
    }

    // Mostrar mensaje de imposible aprobar
    mostrarMensajeImposibleAprobar(notaRequerida) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-imposible-aprobar');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        // Crear el mensaje
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-imposible-aprobar';
        mensaje.innerHTML = `
            <div class="icono-imposible">❌</div>
            <div class="texto-imposible">
                <h3>Imposible aprobar: se requiere nota <strong>${notaRequerida.toFixed(1)}</strong> (máx. 7.0)</h3>
            </div>
        `;

        // Insertar dentro del contenedor principal, después del panel de la calculadora
        const calculatorContainer = document.querySelector('.calculator-container');
        calculatorContainer.appendChild(mensaje);

        // Animar entrada
        setTimeout(() => {
            mensaje.classList.add('mostrar');
        }, 100);

        // También mostrar notificación
        this.mostrarNotificacion('❌ Es matemáticamente imposible aprobar este ramo', 'error');
        
        console.log(`❌ ALERTA: Imposible aprobar - se requiere nota ${notaRequerida.toFixed(1)} (máximo: 7.0)`);
    }

    // Verificar que todos los campos con datos estén completos
    verificarCamposCompletos() {
        const filas = document.querySelectorAll('.fila-nota');
        let filasConDatosIncompletos = 0;
        let filasCompletas = 0;

        for (const fila of filas) {
            const inputNota = fila.querySelector('.input-nota');
            const inputPonderacion = fila.querySelector('.input-ponderacion');
            
            const tieneNota = inputNota.value.trim() !== '';
            const tienePonderacion = inputPonderacion.value.trim() !== '';

            // Si tiene al menos un campo lleno, debe tener ambos
            if (tieneNota || tienePonderacion) {
                if (tieneNota && tienePonderacion) {
                    filasCompletas++;
                } else {
                    filasConDatosIncompletos++;
                }
            }
        }

        // Solo está completo si no hay filas con datos incompletos y hay al menos una fila completa
        return filasConDatosIncompletos === 0 && filasCompletas > 0;
    }

    // Actualizar resultado en pantalla
    actualizarResultado(promedio, estado, advertencia = null, todosCompletos = false) {
        const valorElement = document.getElementById('promedio-valor');
        const estadoElement = document.getElementById('estado-resultado');
        
        // Animar cambio de valor
        valorElement.style.transform = 'scale(0.8)';
        setTimeout(() => {
            valorElement.textContent = promedio.toFixed(2);
            valorElement.style.transform = 'scale(1)';
        }, 150);

        // Actualizar estado
        estadoElement.className = `estado-resultado ${estado}`;
        estadoElement.textContent = estado === 'aprobado' ? 'Aprobado' : 'Reprobado';

        // Efectos especiales para aprobado SOLO si todos los campos están completos
        if (estado === 'aprobado' && promedio >= 4.0 && todosCompletos) {
            this.celebrarAprobacion();
            console.log('🎉 Celebrando aprobación - todos los campos completos');
        } else if (estado === 'aprobado' && promedio >= 4.0 && !todosCompletos) {
            console.log('⚠️ Aprobado pero faltan campos por completar - sin confeti');
        }
    }

    // Celebrar aprobación
    celebrarAprobacion() {
        const resultadoContainer = document.querySelector('.resultado-container');
        resultadoContainer.style.animation = 'pulse 0.6s ease-in-out';
        
        setTimeout(() => {
            resultadoContainer.style.animation = '';
        }, 600);

        // Crear confetti (opcional)
        this.crearConfetti();
    }

    // Nuevo sistema de confeti avanzado
    crearConfetti() {
        // Inicializar el manager de confeti si no existe
        if (!window.confettiManager) {
            this.initConfettiManager();
        }
        
        // Configuración personalizada para la calculadora
        const config = {
            confettiesNumber: 200,
            confettiRadius: 8,
            confettiColors: [
                "#fcf403", "#62fc03", "#f4fc03", "#03e7fc", 
                "#03fca5", "#a503fc", "#fc03ad", "#fc03c2",
                "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"
            ],
            emojies: [],
            svgIcon: null
        };
        
        // Activar el confeti
        window.confettiManager.addConfetti(config);
        console.log('🎉 Nuevo efecto de confeti activado');
    }

    // Inicializar el manager de confeti
    initConfettiManager() {
        // Utility functions
        const Utils = {
            parsePx: (value) => parseFloat(value.replace(/px/, "")),
            getRandomInRange: (min, max, precision = 0) => {
                const multiplier = Math.pow(10, precision);
                const randomValue = Math.random() * (max - min) + min;
                return Math.floor(randomValue * multiplier) / multiplier;
            },
            getRandomItem: (array) => array[Math.floor(Math.random() * array.length)],
            getScaleFactor: () => Math.log(window.innerWidth) / Math.log(1920),
            debounce: (func, delay) => {
                let timeout;
                return (...args) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func(...args), delay);
                };
            },
        };

        const DEG_TO_RAD = Math.PI / 180;

        // Confetti class
        class Confetti {
            constructor({ initialPosition, direction, radius, colors, emojis, svgIcon }) {
                const speedFactor = Utils.getRandomInRange(0.9, 1.7, 3) * Utils.getScaleFactor();
                this.speed = { x: speedFactor, y: speedFactor };
                this.finalSpeedX = Utils.getRandomInRange(0.2, 0.6, 3);
                this.rotationSpeed = emojis.length || svgIcon ? 0.01 : Utils.getRandomInRange(0.03, 0.07, 3) * Utils.getScaleFactor();
                this.dragCoefficient = Utils.getRandomInRange(0.0005, 0.0009, 6);
                this.radius = { x: radius, y: radius };
                this.initialRadius = radius;
                this.rotationAngle = direction === "left" ? Utils.getRandomInRange(0, 0.2, 3) : Utils.getRandomInRange(-0.2, 0, 3);
                this.emojiRotationAngle = Utils.getRandomInRange(0, 2 * Math.PI);
                this.radiusYDirection = "down";

                const angle = direction === "left" ? Utils.getRandomInRange(82, 15) * DEG_TO_RAD : Utils.getRandomInRange(-15, -82) * DEG_TO_RAD;
                this.absCos = Math.abs(Math.cos(angle));
                this.absSin = Math.abs(Math.sin(angle));

                const offset = Utils.getRandomInRange(-150, 0);
                const position = {
                    x: initialPosition.x + (direction === "left" ? -offset : offset) * this.absCos,
                    y: initialPosition.y - offset * this.absSin
                };

                this.position = { ...position };
                this.initialPosition = { ...position };
                this.color = emojis.length || svgIcon ? null : Utils.getRandomItem(colors);
                this.emoji = emojis.length ? Utils.getRandomItem(emojis) : null;
                this.svgIcon = null;

                if (svgIcon) {
                    this.svgImage = new Image();
                    this.svgImage.src = svgIcon;
                    this.svgImage.onload = () => {
                        this.svgIcon = this.svgImage;
                    };
                }

                this.createdAt = Date.now();
                this.direction = direction;
            }

            draw(context) {
                const { x, y } = this.position;
                const { x: radiusX, y: radiusY } = this.radius;
                const scale = window.devicePixelRatio;

                if (this.svgIcon) {
                    context.save();
                    context.translate(scale * x, scale * y);
                    context.rotate(this.emojiRotationAngle);
                    context.drawImage(this.svgIcon, -radiusX, -radiusY, radiusX * 2, radiusY * 2);
                    context.restore();
                } else if (this.color) {
                    context.fillStyle = this.color;
                    context.beginPath();
                    context.ellipse(x * scale, y * scale, radiusX * scale, radiusY * scale, this.rotationAngle, 0, 2 * Math.PI);
                    context.fill();
                } else if (this.emoji) {
                    context.font = `${radiusX * scale}px serif`;
                    context.save();
                    context.translate(scale * x, scale * y);
                    context.rotate(this.emojiRotationAngle);
                    context.textAlign = "center";
                    context.fillText(this.emoji, 0, radiusY / 2);
                    context.restore();
                }
            }

            updatePosition(deltaTime, currentTime) {
                const elapsed = currentTime - this.createdAt;

                if (this.speed.x > this.finalSpeedX) {
                    this.speed.x -= this.dragCoefficient * deltaTime;
                }

                this.position.x += this.speed.x * (this.direction === "left" ? -this.absCos : this.absCos) * deltaTime;
                this.position.y = this.initialPosition.y - this.speed.y * this.absSin * elapsed + 0.00125 * Math.pow(elapsed, 2) / 2;

                if (!this.emoji && !this.svgIcon) {
                    this.rotationSpeed -= 1e-5 * deltaTime;
                    this.rotationSpeed = Math.max(this.rotationSpeed, 0);

                    if (this.radiusYDirection === "down") {
                        this.radius.y -= deltaTime * this.rotationSpeed;
                        if (this.radius.y <= 0) {
                            this.radius.y = 0;
                            this.radiusYDirection = "up";
                        }
                    } else {
                        this.radius.y += deltaTime * this.rotationSpeed;
                        if (this.radius.y >= this.initialRadius) {
                            this.radius.y = this.initialRadius;
                            this.radiusYDirection = "down";
                        }
                    }
                }
            }

            isVisible(canvasHeight) {
                return this.position.y < canvasHeight + 100;
            }
        }

        // ConfettiManager class
        class ConfettiManager {
            constructor() {
                this.canvas = document.createElement("canvas");
                this.canvas.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; pointer-events: none;";
                document.body.appendChild(this.canvas);
                this.context = this.canvas.getContext("2d");
                this.confetti = [];
                this.lastUpdated = Date.now();
                window.addEventListener("resize", Utils.debounce(() => this.resizeCanvas(), 200));
                this.resizeCanvas();
                requestAnimationFrame(() => this.loop());
            }

            resizeCanvas() {
                this.canvas.width = window.innerWidth * window.devicePixelRatio;
                this.canvas.height = window.innerHeight * window.devicePixelRatio;
            }

            addConfetti(config = {}) {
                const defaultConfig = {
                    confettiesNumber: 250,
                    confettiRadius: 6,
                    confettiColors: [
                        "#fcf403", "#62fc03", "#f4fc03", "#03e7fc", "#03fca5", "#a503fc", "#fc03ad", "#fc03c2"
                    ],
                    emojies: [],
                    svgIcon: null
                };

                const { confettiesNumber, confettiRadius, confettiColors, emojies, svgIcon } = {
                    ...defaultConfig,
                    ...config,
                };

                const baseY = (5 * window.innerHeight) / 7;
                for (let i = 0; i < confettiesNumber / 2; i++) {
                    this.confetti.push(new Confetti({
                        initialPosition: { x: 0, y: baseY },
                        direction: "right",
                        radius: confettiRadius,
                        colors: confettiColors,
                        emojis: emojies,
                        svgIcon,
                    }));
                    this.confetti.push(new Confetti({
                        initialPosition: { x: window.innerWidth, y: baseY },
                        direction: "left",
                        radius: confettiRadius,
                        colors: confettiColors,
                        emojis: emojies,
                        svgIcon,
                    }));
                }
            }

            loop() {
                const currentTime = Date.now();
                const deltaTime = currentTime - this.lastUpdated;
                this.lastUpdated = currentTime;

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.confetti = this.confetti.filter((item) => {
                    item.updatePosition(deltaTime, currentTime);
                    item.draw(this.context);
                    return item.isVisible(this.canvas.height);
                });

                requestAnimationFrame(() => this.loop());
            }
        }

        // Crear el manager global
        window.confettiManager = new ConfettiManager();
        console.log('🎨 Sistema de confeti avanzado inicializado');
    }



    // Volver al launcher
    volverAlLauncher() {
        // Usar función optimizada si está disponible, sino usar método tradicional
        if (window.fastReturnToLauncher) {
            window.fastReturnToLauncher();
        } else {
            // Navegación simple de regreso al launcher
            window.location.href = 'index.html';
        }
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Remover notificación anterior si existe
        const notificacionAnterior = document.querySelector('.calculadora-notificacion');
        if (notificacionAnterior) {
            notificacionAnterior.remove();
        }

        const notificacion = document.createElement('div');
        notificacion.className = `calculadora-notificacion ${tipo}`;
        notificacion.textContent = mensaje;
        
        const colores = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colores[tipo] || colores.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInNotification 0.3s ease-out;
        `;

        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInNotification {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificacion);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideInNotification 0.3s ease-out reverse';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // Exportar datos
    exportarDatos() {
        const resultado = this.calcularPromedio();
        const datos = {
            promedio: resultado.promedio,
            estado: resultado.estado,
            filas: this.obtenerDatosFilas(),
            fecha: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promedio-calculadora-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.mostrarNotificacion('Datos exportados correctamente', 'success');
    }

    // Obtener datos de todas las filas
    obtenerDatosFilas() {
        const filas = document.querySelectorAll('.fila-nota');
        const datos = [];

        filas.forEach(fila => {
            const nota = fila.querySelector('.input-nota').value;
            const ponderacion = fila.querySelector('.input-ponderacion').value;
            
            if (nota && ponderacion) {
                datos.push({
                    nota: parseFloat(nota),
                    ponderacion: parseFloat(ponderacion)
                });
            }
        });

        return datos;
    }

    // Cargar datos desde archivo
    cargarDatos(datos) {
        try {
            this.limpiarTodo();

            if (datos.filas && Array.isArray(datos.filas)) {
                // Remover filas iniciales
                document.getElementById('filas-container').innerHTML = '';
                this.filas = [];

                // Agregar filas con datos
                datos.filas.forEach(filaData => {
                    this.agregarFila();
                    const ultimaFila = document.getElementById(this.filas[this.filas.length - 1]);
                    ultimaFila.querySelector('.input-nota').value = filaData.nota;
                    ultimaFila.querySelector('.input-ponderacion').value = filaData.ponderacion;
                });

                this.calcularPromedio();
                this.mostrarNotificacion('Datos cargados correctamente', 'success');
            }
        } catch (error) {
            this.mostrarNotificacion('Error al cargar los datos', 'error');
            console.error(error);
        }
    }
}

// Inicializar calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calculadora = new CalculadoraPromedio();
    
    // Exponer funciones útiles globalmente
    window.exportarDatos = () => window.calculadora.exportarDatos();
    window.cargarArchivo = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const datos = JSON.parse(e.target.result);
                    window.calculadora.cargarDatos(datos);
                } catch (error) {
                    window.calculadora.mostrarNotificacion('Archivo inválido', 'error');
                }
            };
            reader.readAsText(file);
        }
    };

    // Función de prueba para debugging
    window.probarCalculadora = () => {
        console.log('🧮 Probando calculadora...');
        
        // Llenar datos de prueba
        const filas = document.querySelectorAll('.fila-nota');
        if (filas.length >= 3) {
            // Nota 1: 65 (se convertirá a 6.5), Ponderación: 30%
            filas[0].querySelector('.input-nota').value = '65';
            filas[0].querySelector('.input-ponderacion').value = '30';
            
            // Nota 2: 58 (se convertirá a 5.8), Ponderación: 40%
            filas[1].querySelector('.input-nota').value = '58';
            filas[1].querySelector('.input-ponderacion').value = '40';
            
            // Nota 3: 4.5 (se mantiene), Ponderación: 30%
            filas[2].querySelector('.input-nota').value = '4.5';
            filas[2].querySelector('.input-ponderacion').value = '30';
            
            // Aplicar validaciones para convertir números
            setTimeout(() => {
                filas[0].querySelector('.input-nota').dispatchEvent(new Event('input'));
                filas[1].querySelector('.input-nota').dispatchEvent(new Event('input'));
                filas[2].querySelector('.input-nota').dispatchEvent(new Event('input'));
                
                setTimeout(() => {
                    // Simular clic en el botón calcular
                    document.getElementById('btn-calcular').click();
                    console.log('✅ Datos de prueba cargados - presiona "Calcular Promedio" para ver el resultado');
                }, 200);
            }, 500);
        }
    };

    // Función de prueba con campos incompletos
    window.probarCamposIncompletos = () => {
        console.log('🧮 Probando con campos incompletos...');
        
        const filas = document.querySelectorAll('.fila-nota');
        if (filas.length >= 2) {
            // Fila 1: Completa
            filas[0].querySelector('.input-nota').value = '60'; // Se convertirá a 6.0
            filas[0].querySelector('.input-ponderacion').value = '50';
            
            // Fila 2: Incompleta (solo nota)
            filas[1].querySelector('.input-nota').value = '55'; // Se convertirá a 5.5
            filas[1].querySelector('.input-ponderacion').value = ''; // Vacío
            
                         setTimeout(() => {
                 filas[0].querySelector('.input-nota').dispatchEvent(new Event('input'));
                 filas[1].querySelector('.input-nota').dispatchEvent(new Event('input'));
                 
                 setTimeout(() => {
                     // Simular clic en el botón calcular
                     document.getElementById('btn-calcular').click();
                     console.log('⚠️ Datos cargados con campos incompletos - presiona "Calcular Promedio"');
                     console.log('🎉 Confeti: NO se muestra porque hay campos incompletos');
                 }, 200);
             }, 500);
                 }
     };

         // Función de prueba para el confeti
    window.probarConfeti = () => {
        console.log('🎉 Probando nuevo efecto de confeti...');
        
        if (window.calculadora) {
            window.calculadora.crearConfetti();
            console.log('✨ Efecto de confeti activado - observa la pantalla');
        } else {
            console.error('❌ Calculadora no disponible');
        }
    };

    // Función de prueba para notas mínimas
    window.probarNotasMinimas = () => {
        console.log('📊 Probando cálculo de notas mínimas...');
        
        // Limpiar datos existentes
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            if (filas.length >= 4) {
                // Configurar 2 notas conocidas y 2 ponderaciones sin notas
                filas[0].querySelector('.input-nota').value = '5.5';
                filas[0].querySelector('.input-ponderacion').value = '30';
                
                filas[1].querySelector('.input-nota').value = '6.2';
                filas[1].querySelector('.input-ponderacion').value = '25';
                
                // Solo ponderaciones para las notas faltantes
                filas[2].querySelector('.input-ponderacion').value = '20';
                filas[3].querySelector('.input-ponderacion').value = '25';
                
                // Calcular
                setTimeout(() => {
                    document.getElementById('btn-calcular').click();
                    console.log('✅ Ejemplo cargado: 2 notas conocidas, 2 notas por calcular');
                    console.log('📝 Las notas azules son las mínimas necesarias para aprobar');
                }, 200);
            }
        }, 500);
    };

    // Función de prueba para caso ya aprobado
    window.probarYaAprobado = () => {
        console.log('✅ Probando caso ya aprobado...');
        
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            if (filas.length >= 3) {
                // Notas muy altas que ya aprueban
                filas[0].querySelector('.input-nota').value = '6.8';
                filas[0].querySelector('.input-ponderacion').value = '40';
                
                filas[1].querySelector('.input-nota').value = '6.5';
                filas[1].querySelector('.input-ponderacion').value = '35';
                
                // Solo ponderación para la nota faltante
                filas[2].querySelector('.input-ponderacion').value = '25';
                
                setTimeout(() => {
                    document.getElementById('btn-calcular').click();
                    console.log('✅ Ya estás aprobado - nota verde muestra el mínimo posible');
                }, 200);
            }
        }, 500);
    };

    // Función de prueba para caso imposible aprobar
    window.probarImposibleAprobar = () => {
        console.log('❌ Probando caso imposible de aprobar...');
        
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            if (filas.length >= 3) {
                // Notas muy bajas que hacen imposible aprobar
                filas[0].querySelector('.input-nota').value = '2.5';
                filas[0].querySelector('.input-ponderacion').value = '40';
                
                filas[1].querySelector('.input-nota').value = '3.0';
                filas[1].querySelector('.input-ponderacion').value = '35';
                
                // Solo ponderación para la nota faltante (pequeña ponderación = nota muy alta requerida)
                filas[2].querySelector('.input-ponderacion').value = '25';
                
                setTimeout(() => {
                    document.getElementById('btn-calcular').click();
                    console.log('❌ Caso imposible - se requiere nota > 7.0 para aprobar');
                    console.log('🚨 Debería aparecer mensaje de "IMPOSIBLE APROBAR"');
                }, 200);
            }
        }, 500);
    };

    // Función de prueba para modificación de notas calculadas
    window.probarModificacionNotas = () => {
        console.log('✏️ Probando modificación de notas calculadas...');
        
        // Primero generar notas calculadas
        window.probarNotasMinimas();
        
        setTimeout(() => {
            console.log('📝 Ahora modifica manualmente las notas azules calculadas');
            console.log('🔄 Luego presiona "Calcular Promedio" nuevamente');
            console.log('✅ Las notas modificadas deben mantenerse como notas del usuario');
            console.log('🎯 Solo se calcularán notas para campos vacíos');
        }, 2000);
    };

    // Función de prueba específica para debugging del cálculo
    window.debugCalculoNotas = () => {
        console.log('🐛 DEBUG: Analizando cálculo de notas...');
        
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            console.log('🔍 Configurando caso de prueba específico...');
            
            // Caso: 6.0 (30%) + 5.5 (40%) + ? (30%) = 4.0
            // Suma actual: 6.0*30 + 5.5*40 = 180 + 220 = 400
            // Suma objetivo: 4.0 * 100 = 400
            // Suma faltante: 400 - 400 = 0 → Nota mínima = 0/30 = 0 → 1.0 (mínimo)
            
            filas[0].querySelector('.input-nota').value = '6.0';
            filas[0].querySelector('.input-ponderacion').value = '30';
            
            filas[1].querySelector('.input-nota').value = '5.5';
            filas[1].querySelector('.input-ponderacion').value = '40';
            
            filas[2].querySelector('.input-ponderacion').value = '30';
            
            console.log('📊 Configuración:');
            console.log('   • Fila 1: 6.0 × 30% = 180');
            console.log('   • Fila 2: 5.5 × 40% = 220');
            console.log('   • Fila 3: ? × 30% = ?');
            console.log('   • Suma actual: 400');
            console.log('   • Objetivo: 4.0 × 100% = 400');
            console.log('   • Esperado: Ya aprobado, nota mínima = 1.0');
            
            setTimeout(() => {
                document.getElementById('btn-calcular').click();
            }, 1000);
        }, 500);
    };

    // Función de prueba para caso con solo una nota (debe fallar)
    window.probarSoloUnaNota = () => {
        console.log('⚠️ Probando caso con solo una nota (debe mostrar error)...');
        
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            
            // Solo una nota del usuario
            filas[0].querySelector('.input-nota').value = '6.0';
            filas[0].querySelector('.input-ponderacion').value = '40';
            
            // Solo ponderaciones para las demás
            filas[1].querySelector('.input-ponderacion').value = '30';
            filas[2].querySelector('.input-ponderacion').value = '30';
            
            console.log('📊 Configuración (DEBE FALLAR):');
            console.log('   • Fila 1: 6.0 × 40% (única nota del usuario)');
            console.log('   • Fila 2: ? × 30% (solo ponderación)');
            console.log('   • Fila 3: ? × 30% (solo ponderación)');
            console.log('   • Esperado: ERROR - Se necesitan al menos 2 notas');
            
            setTimeout(() => {
                document.getElementById('btn-calcular').click();
            }, 1000);
        }, 500);
    };

    // Función de prueba para navegación automática
    window.probarNavegacionAutomatica = () => {
        console.log('🔄 Probando navegación automática entre campos...');
        
        window.calculadora.limpiarTodo();
        
        setTimeout(() => {
            const filas = document.querySelectorAll('.fila-nota');
            const primerCampoNota = filas[0].querySelector('.input-nota');
            
            console.log('📝 Instrucciones para probar navegación automática:');
            console.log('1. 🎯 El cursor está en el primer campo de nota');
            console.log('2. ✏️ Escribe "65" (2 dígitos → se convierte a 6.5 y navega)');
            console.log('3. ✏️ Escribe "5.8" (3 caracteres X.X → navega directamente)');
            console.log('4. ✏️ Escribe "72" (2 dígitos → se convierte a 7.2... pero es > 7.0)');
            console.log('5. ✏️ Escribe "45" (2 dígitos → se convierte a 4.5 y navega)');
            console.log('6. 🔄 Navega con: 2 dígitos (XX) o 3 caracteres (X.X)');
            console.log('7. 📊 Cuando llenes columna de notas, pasará a ponderaciones');
            console.log('8. 📊 En ponderaciones: 30, 25, 20, etc. (2 dígitos cada uno)');
            console.log('9. ⚠️ Solo 1 decimal permitido (6.55 → se limita a 6.5)');
            
            // Enfocar el primer campo
            primerCampoNota.focus();
            primerCampoNota.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
            
            setTimeout(() => {
                primerCampoNota.style.boxShadow = '';
            }, 3000);
            
        }, 500);
    };

    // Función de prueba para borrado de notas calculadas
    window.probarBorradoNotasCalculadas = () => {
        console.log('🗑️ Probando borrado de notas calculadas...');
        
        // Primero generar notas calculadas
        window.probarNotasMinimas();
        
        setTimeout(() => {
            console.log('📝 Instrucciones para probar borrado de notas calculadas:');
            console.log('1. 🔍 Observa las notas azules calculadas automáticamente');
            console.log('2. 🗑️ Borra completamente una nota azul (seleccionar todo y delete)');
            console.log('3. ✅ El campo debe volver al estado inicial (sin color amarillo)');
            console.log('4. ✏️ Modifica parcialmente otra nota azul (ej: cambiar 3.2 → 3.5)');
            console.log('5. 🟡 Esa nota debe volverse amarilla (nota del usuario)');
            console.log('6. 🔄 Presiona "Calcular Promedio" para ver el comportamiento');
            console.log('7. 🎯 Solo se calcularán notas para campos realmente vacíos');
        }, 2000);
    };
    
    console.log('🎓 Calculadora "Aprobado o Reprobado" inicializada');
    console.log('💡 Funciones de prueba disponibles:');
    console.log('   • window.probarCalculadora() - Prueba con datos completos');
    console.log('   • window.probarCamposIncompletos() - Prueba con campos incompletos');
    console.log('   • window.probarConfeti() - Prueba el nuevo efecto de confeti');
    console.log('   • window.probarNotasMinimas() - Prueba cálculo de notas mínimas');
    console.log('   • window.probarYaAprobado() - Prueba caso ya aprobado');
    console.log('   • window.probarImposibleAprobar() - Prueba caso imposible aprobar');
    console.log('   • window.probarModificacionNotas() - Prueba modificación de notas calculadas');
    console.log('   • window.debugCalculoNotas() - Debug detallado del cálculo');
    console.log('   • window.probarSoloUnaNota() - Prueba caso con solo una nota (error)');
    console.log('   • window.probarNavegacionAutomatica() - Prueba navegación automática');
    console.log('   • window.probarBorradoNotasCalculadas() - Prueba borrado de notas calculadas');
    console.log('📝 Notas de 2 dígitos (10-99) se dividen automáticamente por 10');
    console.log('🧮 El cálculo SOLO se ejecuta al presionar "Calcular Promedio"');
    console.log('🎉 Nuevo sistema de confeti avanzado integrado');
    console.log('📊 ¡NUEVO! Cálculo automático de notas mínimas necesarias para aprobar');
    console.log('🚨 ¡NUEVO! Detección automática de casos imposibles de aprobar');
    console.log('✏️ ¡NUEVO! Las notas calculadas se convierten en notas del usuario al editarlas');
    console.log('🐛 ¡NUEVO! Función de debugging para analizar el cálculo paso a paso');
    console.log('⚠️ ¡NUEVO! Validación: se requieren mínimo 2 notas para calcular faltantes');
    console.log('🔄 ¡NUEVO! Navegación automática entre campos al completar datos');
    console.log('🗑️ ¡NUEVO! Borrado correcto de notas calculadas sin dejar estilos residuales');
});

// Prevenir envío de formulario al presionar Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input')) {
        e.preventDefault();
    }
}); 