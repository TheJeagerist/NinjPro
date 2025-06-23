// ===== GENERADOR DE ESCALA DE NOTAS - PROFENINJA =====

class GeneradorEscalaNotas {
    constructor() {
        this.tablaVisible = true;
        this.escalaData = [];
        this.init();
    }

    init() {
        this.detectarTema();
        this.setupThemeListener();
        this.initAnimatedBackgrounds();
        this.setupEventListeners();
        this.generarTablaEscala();
        this.actualizarConversor();
    }

    // Detectar tema actual
    detectarTema() {
        const temaGuardado = localStorage.getItem('theme');
        if (temaGuardado) {
            document.body.className = `theme-${temaGuardado}`;
        } else {
            document.body.className = 'theme-dark';
        }
    }

    // Escuchar cambios de tema
    setupThemeListener() {
        // Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.detectarTema();
                this.actualizarFondoAnimado(e.newValue);
            }
        });

        // Escuchar eventos personalizados de cambio de tema
        window.addEventListener('themeChanged', (e) => {
            document.body.className = `theme-${e.detail.theme}`;
            this.actualizarFondoAnimado(e.detail.theme);
        });

        // Detectar cambios en el DOM para el tema
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const bodyClass = document.body.className;
                    if (bodyClass.includes('theme-')) {
                        const tema = bodyClass.replace('theme-', '');
                        this.actualizarFondoAnimado(tema);
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Inicializar fondos animados
    initAnimatedBackgrounds() {
        const tema = document.body.className.replace('theme-', '') || 'dark';
        this.actualizarFondoAnimado(tema);
    }

    // Actualizar fondo animado según tema
    actualizarFondoAnimado(tema) {
        if (typeof window.AnimatedBackgrounds !== 'undefined') {
            window.AnimatedBackgrounds.switchTheme(tema);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón volver al launcher
        document.getElementById('btn-volver-launcher').addEventListener('click', () => this.volverAlLauncher());

        // Inputs principales
        document.getElementById('puntaje-maximo').addEventListener('input', () => this.validarPuntajeMaximo());
        document.getElementById('exigencia').addEventListener('input', () => this.actualizarEscala());
        document.getElementById('nota-minima').addEventListener('input', () => this.actualizarEscala());
        document.getElementById('nota-maxima').addEventListener('input', () => this.actualizarEscala());
        document.getElementById('nota-aprobacion').addEventListener('input', () => this.actualizarEscala());



        // Conversor
        document.getElementById('conversor-puntaje').addEventListener('input', () => this.actualizarConversor());

        // Botón ocultar tabla
        document.getElementById('btn-ocultar-tabla').addEventListener('click', () => this.toggleTabla());

        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.manejarTeclado(e));
    }

    // Manejar atajos de teclado
    manejarTeclado(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.toggleTabla();
                    break;

            }
        }
    }





    // Validar puntaje máximo para evitar problemas de rendimiento
    validarPuntajeMaximo() {
        const input = document.getElementById('puntaje-maximo');
        let valor = parseInt(input.value);
        
        if (isNaN(valor) || valor < 1) {
            input.value = 1;
            valor = 1;
        } else if (valor > 1500) {
            input.value = 1500;
            valor = 1500;
            this.mostrarNotificacion(
                'El puntaje máximo está limitado a 1500 puntos para mantener el rendimiento óptimo', 
                'warning'
            );
        }
        
        this.actualizarEscala();
    }

    // Actualizar escala cuando cambian los valores
    actualizarEscala() {
        this.generarTablaEscala();
        this.actualizarConversor();
    }

    // Generar tabla de escala
    generarTablaEscala() {
        let puntajeMax = parseInt(document.getElementById('puntaje-maximo').value) || 100;
        
        // Validación adicional de seguridad
        if (puntajeMax > 1500) {
            puntajeMax = 1500;
            document.getElementById('puntaje-maximo').value = 1500;
        }
        const exigencia = parseInt(document.getElementById('exigencia').value) || 60;
        const notaMin = parseFloat(document.getElementById('nota-minima').value) || 1.0;
        const notaMax = parseFloat(document.getElementById('nota-maxima').value) || 7.0;
        const notaAprob = parseFloat(document.getElementById('nota-aprobacion').value) || 4.0;

        // Calcular puntaje mínimo para aprobar
        const puntajeMinimo = Math.ceil((puntajeMax * exigencia) / 100);

        // Generar datos de la escala
        this.escalaData = [];
        
        for (let puntaje = 0; puntaje <= puntajeMax; puntaje++) {
            let nota;
            
            if (puntaje < puntajeMinimo) {
                // Escala lineal desde nota mínima hasta nota de aprobación
                nota = notaMin + ((notaAprob - notaMin) * puntaje) / puntajeMinimo;
            } else {
                // Escala lineal desde nota de aprobación hasta nota máxima
                nota = notaAprob + ((notaMax - notaAprob) * (puntaje - puntajeMinimo)) / (puntajeMax - puntajeMinimo);
            }

            this.escalaData.push({
                puntaje: puntaje,
                nota: Math.round(nota * 10) / 10,
                porcentaje: Math.round((puntaje / puntajeMax) * 100)
            });
        }

        // Ordenar de mayor a menor puntaje
        this.escalaData.sort((a, b) => b.puntaje - a.puntaje);

        this.renderizarTabla();
    }

    // Renderizar tabla en el DOM
    renderizarTabla() {
        const container = document.getElementById('tabla-escala');
        
        if (!this.tablaVisible) {
            container.innerHTML = '';
            return;
        }

        // Crear 5 columnas separadas como en la imagen
        const totalItems = this.escalaData.length;
        const itemsPorColumna = Math.ceil(totalItems / 5);
        const notaAprobacion = parseFloat(document.getElementById('nota-aprobacion').value) || 4.0;
        
        let html = '';
        
        // Crear 5 columnas separadas
        for (let col = 0; col < 5; col++) {
            html += `
                <div class="tabla-columna">
                    <table>
                        <thead>
                            <tr>
                                <th>Puntaje</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Llenar cada columna
            for (let fila = 0; fila < itemsPorColumna; fila++) {
                const index = fila + (col * itemsPorColumna);
                
                if (index < totalItems) {
                    const item = this.escalaData[index];
                    // Asegurar que la nota tenga decimal
                    const notaFormateada = parseFloat(item.nota).toFixed(1);
                    // Determinar si es reprobatorio
                    const esReprobado = parseFloat(item.nota) < notaAprobacion;
                    const claseNota = esReprobado ? 'col-nota reprobado' : 'col-nota';
                    
                    html += `
                        <tr>
                            <td class="col-puntaje">${item.puntaje}</td>
                            <td class="${claseNota}">${notaFormateada}</td>
                        </tr>
                    `;
                } else {
                    // Fila vacía si no hay más datos
                    html += `
                        <tr>
                            <td class="col-puntaje"></td>
                            <td class="col-nota"></td>
                        </tr>
                    `;
                }
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // Actualizar conversor de puntaje a nota
    actualizarConversor() {
        const puntajeInput = document.getElementById('conversor-puntaje');
        const resultadoDiv = document.getElementById('conversor-resultado');
        
        const puntaje = parseInt(puntajeInput.value);
        
        if (isNaN(puntaje) || puntaje < 0) {
            resultadoDiv.textContent = '--';
            return;
        }

        const puntajeMax = parseInt(document.getElementById('puntaje-maximo').value) || 100;
        
        if (puntaje > puntajeMax) {
            resultadoDiv.textContent = 'Puntaje excede el máximo';
            return;
        }

        // Buscar la nota correspondiente en la escala
        const item = this.escalaData.find(item => item.puntaje === puntaje);
        if (item) {
            resultadoDiv.textContent = parseFloat(item.nota).toFixed(1);
        } else {
            resultadoDiv.textContent = '--';
        }
    }

    // Toggle visibilidad de tabla
    toggleTabla() {
        this.tablaVisible = !this.tablaVisible;
        const btn = document.getElementById('btn-ocultar-tabla');
        const container = document.getElementById('tabla-escala-container');
        
        if (this.tablaVisible) {
            btn.innerHTML = '<span class="tabla-icon">📊</span> Ocultar tabla';
            container.style.display = 'block';
            this.renderizarTabla();
        } else {
            btn.innerHTML = '<span class="tabla-icon">📊</span> Mostrar tabla';
            container.style.display = 'none';
        }

        this.mostrarNotificacion(
            this.tablaVisible ? 'Tabla mostrada' : 'Tabla ocultada', 
            'info'
        );
    }

    // Volver al launcher
    volverAlLauncher() {
        // Usar función optimizada si está disponible, sino usar método tradicional
        if (window.fastReturnToLauncher) {
            window.fastReturnToLauncher();
        } else {
            window.location.href = 'index.html';
        }
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Remover notificación anterior si existe
        const notificacionAnterior = document.querySelector('.escala-notificacion');
        if (notificacionAnterior) {
            notificacionAnterior.remove();
        }

        const notificacion = document.createElement('div');
        notificacion.className = `escala-notificacion ${tipo}`;
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
        if (!document.querySelector('#escala-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'escala-notification-styles';
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

    // Exportar datos de la escala
    exportarEscala() {
        const datos = {
            modo: 'personalizado',
            parametros: {
                puntajeMaximo: parseInt(document.getElementById('puntaje-maximo').value),
                exigencia: parseInt(document.getElementById('exigencia').value),
                notaMinima: parseFloat(document.getElementById('nota-minima').value),
                notaMaxima: parseFloat(document.getElementById('nota-maxima').value),
                notaAprobacion: parseFloat(document.getElementById('nota-aprobacion').value)
            },
            escala: this.escalaData,
            fecha: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escala-notas-personalizada-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.mostrarNotificacion('Escala exportada correctamente', 'success');
    }

    // Buscar nota por puntaje
    buscarNotaPorPuntaje(puntaje) {
        const item = this.escalaData.find(item => item.puntaje === puntaje);
        return item ? item.nota : null;
    }

    // Buscar puntaje por nota
    buscarPuntajePorNota(nota) {
        const item = this.escalaData.find(item => Math.abs(item.nota - nota) < 0.1);
        return item ? item.puntaje : null;
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.escalaNotas = new GeneradorEscalaNotas();
    
    // Exponer funciones útiles globalmente
    window.exportarEscala = () => window.escalaNotas.exportarEscala();
    window.buscarNota = (puntaje) => window.escalaNotas.buscarNotaPorPuntaje(puntaje);
    window.buscarPuntaje = (nota) => window.escalaNotas.buscarPuntajePorNota(nota);
    
    // Funciones de prueba para debugging
    window.probarEscalaNormal = () => {
        console.log('🧮 Probando escala modo Normal...');
        window.escalaNotas.cambiarModo('normal');
        console.log('✅ Modo Normal activado');
    };
    
    window.probarEscalaSIMCE = () => {
        console.log('🧮 Probando escala modo SIMCE...');
        window.escalaNotas.cambiarModo('simce');
        console.log('✅ Modo SIMCE activado');
    };
    
    window.probarEscalaPAES = () => {
        console.log('🧮 Probando escala modo PAES...');
        window.escalaNotas.cambiarModo('paes');
        console.log('✅ Modo PAES activado');
    };
    
    window.probarConversor = () => {
        console.log('🔄 Probando conversor...');
        document.getElementById('conversor-puntaje').value = '75';
        window.escalaNotas.actualizarConversor();
        console.log('✅ Conversor actualizado con puntaje 75');
    };
    
    window.probarToggleTabla = () => {
        console.log('📊 Probando toggle de tabla...');
        window.escalaNotas.toggleTabla();
        console.log('✅ Visibilidad de tabla cambiada');
    };
    
    console.log('🎓 Generador de Escala de Notas inicializado');
    console.log('💡 Funciones de prueba disponibles:');
    console.log('   • window.probarEscalaNormal() - Probar modo Normal');
    console.log('   • window.probarEscalaSIMCE() - Probar modo SIMCE');
    console.log('   • window.probarEscalaPAES() - Probar modo PAES');
    console.log('   • window.probarConversor() - Probar conversor de puntaje');
    console.log('   • window.probarToggleTabla() - Probar ocultar/mostrar tabla');
    console.log('   • window.exportarEscala() - Exportar escala actual');
    console.log('   • window.buscarNota(puntaje) - Buscar nota por puntaje');
    console.log('   • window.buscarPuntaje(nota) - Buscar puntaje por nota');
    console.log('⌨️ Atajos de teclado:');
    console.log('   • Ctrl+H - Ocultar/mostrar tabla');
    console.log('   • Ctrl+1 - Modo Normal');
    console.log('   • Ctrl+2 - Modo SIMCE');
    console.log('   • Ctrl+3 - Modo PAES');
    console.log('🎨 Compatibilidad completa con todos los temas');
    console.log('📱 Diseño responsive optimizado para tablet y móvil');
}); 