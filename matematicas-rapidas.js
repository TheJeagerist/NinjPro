// Matemáticas Rápidas - Lógica del Juego
class MatematicasRapidas {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            currentNumberIndex: 0,
            numbers: [],
            totalNumbers: 5,
            interval: 3000, // milisegundos
            minNumber: 1,
            maxNumber: 50,
            correctAnswer: 0,
            userAnswer: null,
            gameTimer: null,
            countdownTimer: null,
            currentCountdown: 0
        };

        this.elements = {};
        this.audioContext = null;
        this.toggleInProgress = false; // Para evitar llamadas duplicadas del checkbox
        this.init();
    }

    init() {
        console.log('🎮 Inicializando Matemáticas Rápidas...');
        this.cacheElements();
        this.setupEventListeners();
        this.initializeAudio();
        this.updateSliderDisplays();
        
        // Verificar elementos críticos
        this.debugElements();
        
        console.log('✅ Matemáticas Rápidas inicializado correctamente');
    }

    cacheElements() {
        console.log('🔍 Detectando contexto de la aplicación...');
        
        // Detectar si estamos en index.html (con prefijo math-) o matematicas-rapidas.html (sin prefijo)
        const isInIndex = document.getElementById('math-setup-panel') !== null;
        const prefix = isInIndex ? 'math-' : '';
        
        console.log('📍 Contexto detectado:', isInIndex ? 'index.html (con prefijo math-)' : 'matematicas-rapidas.html (sin prefijo)');
        
        // Setup panel elements
        this.elements.setupPanel = document.getElementById(prefix + 'setup-panel');
        this.elements.numCountSlider = document.getElementById(prefix + 'num-count');
        this.elements.numCountDisplay = document.getElementById(prefix + 'num-count-display');
        this.elements.intervalSlider = document.getElementById(prefix + 'interval');
        this.elements.intervalDisplay = document.getElementById(prefix + 'interval-display');
        this.elements.minNumberInput = document.getElementById(prefix + 'min-number');
        this.elements.maxNumberInput = document.getElementById(prefix + 'max-number');
        this.elements.includeNegativesCheckbox = document.getElementById(prefix + 'include-negatives');
        this.elements.soundEnabledCheckbox = document.getElementById(prefix + 'sound-enabled');
        this.elements.startBtn = document.getElementById(prefix + 'start-btn');

        // Game panel elements
        this.elements.gamePanel = document.getElementById(prefix + 'game-panel');
        this.elements.progressFill = document.getElementById(prefix + 'progress-fill');
        this.elements.currentNumberSpan = document.getElementById(prefix + 'current-number');
        this.elements.totalNumbersSpan = document.getElementById(prefix + 'total-numbers');
        this.elements.countdownSpan = document.getElementById(prefix + 'countdown');
        this.elements.displayNumber = document.getElementById(prefix + 'display-number');
        this.elements.pauseBtn = document.getElementById(prefix + 'pause-btn');
        this.elements.stopBtn = document.getElementById(prefix + 'stop-btn');

        // Results panel elements
        this.elements.resultsPanel = document.getElementById(prefix + 'results-panel');
        this.elements.numbersList = document.getElementById(prefix + 'numbers-list');
        this.elements.calculationDisplay = document.getElementById(prefix + 'calculation-display');
        this.elements.userAnswerInput = document.getElementById(prefix + 'user-answer');
        this.elements.revealBtn = document.getElementById(prefix + 'reveal-btn');
        this.elements.resultDisplay = document.getElementById(prefix + 'result-display');
        this.elements.correctAnswerSpan = document.getElementById(prefix + 'correct-answer');
        this.elements.resultStatus = document.getElementById(prefix + 'result-status');
        this.elements.playAgainBtn = document.getElementById(prefix + 'play-again-btn');
        this.elements.newConfigBtn = document.getElementById(prefix + 'new-config-btn');

        // Pause overlay elements
        this.elements.pauseOverlay = document.getElementById(prefix + 'pause-overlay');
        this.elements.resumeBtn = document.getElementById(prefix + 'resume-btn');
        
        console.log('✅ Elementos cacheados con prefijo:', prefix || '(sin prefijo)');
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Slider updates
        if (this.elements.numCountSlider) {
        this.elements.numCountSlider.addEventListener('input', () => {
            this.updateSliderDisplays();
        });
        }

        if (this.elements.intervalSlider) {
        this.elements.intervalSlider.addEventListener('input', () => {
            this.updateSliderDisplays();
        });
        }

        // Game controls
        if (this.elements.startBtn) {
        this.elements.startBtn.addEventListener('click', () => {
            this.startGame();
        });
        }

        if (this.elements.pauseBtn) {
        this.elements.pauseBtn.addEventListener('click', () => {
            this.pauseGame();
        });
        }

        if (this.elements.stopBtn) {
        this.elements.stopBtn.addEventListener('click', () => {
            this.stopGame();
        });
        }

        if (this.elements.resumeBtn) {
        this.elements.resumeBtn.addEventListener('click', () => {
            this.resumeGame();
        });
        }

        // Results controls
        if (this.elements.revealBtn) {
        this.elements.revealBtn.addEventListener('click', () => {
            this.revealAnswer();
        });
        }

        if (this.elements.playAgainBtn) {
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.playAgain();
        });
        }

        if (this.elements.newConfigBtn) {
        this.elements.newConfigBtn.addEventListener('click', () => {
            this.newConfiguration();
        });
        }

        // Enter key for user answer
        if (this.elements.userAnswerInput) {
        this.elements.userAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.revealAnswer();
            }
        });
        }

        // Number input validation
        if (this.elements.minNumberInput) {
        this.elements.minNumberInput.addEventListener('change', () => {
            this.validateNumberRange();
        });
        }

        if (this.elements.maxNumberInput) {
        this.elements.maxNumberInput.addEventListener('change', () => {
            this.validateNumberRange();
        });
        }

        // Custom checkbox for negative numbers
        this.setupCustomCheckbox();
        
        console.log('✅ Event listeners configurados');
    }

    setupCustomCheckbox() {
        const hiddenCheckbox = this.elements.includeNegativesCheckbox;
        
        console.log('🔍 === DEBUGGING CHECKBOX ===');
        console.log('hiddenCheckbox encontrado:', !!hiddenCheckbox);
        if (hiddenCheckbox) {
            console.log('hiddenCheckbox ID:', hiddenCheckbox.id);
            console.log('hiddenCheckbox estado inicial:', hiddenCheckbox.checked);
        }
        
        if (hiddenCheckbox) {
            // Detectar si estamos en index.html para manejar el checkbox personalizado
            const isInIndex = document.getElementById('math-setup-panel') !== null;
            const customCheckbox = isInIndex ? document.getElementById('math-checkbox') : null;
            
            console.log('Contexto detectado:', isInIndex ? 'index.html' : 'matematicas-rapidas.html');
            console.log('customCheckbox encontrado:', !!customCheckbox);
            
            if (isInIndex && customCheckbox) {
                // Configuración para index.html con checkbox personalizado
                console.log('🎯 Configurando checkbox personalizado para index.html');
                
            const toggleCheckbox = (event) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                    
                    // Evitar llamadas múltiples con un debounce simple
                    if (this.toggleInProgress) {
                        console.log('⚠️ Toggle ya en progreso, ignorando llamada duplicada');
                        return;
                    }
                    
                    this.toggleInProgress = true;
                    
                    console.log('🔄 Estado ANTES del toggle:', hiddenCheckbox.checked);
                
                hiddenCheckbox.checked = !hiddenCheckbox.checked;
                    
                    console.log('🔄 Estado DESPUÉS del toggle:', hiddenCheckbox.checked);
                    
                    // Usar setTimeout para asegurar que el estado se actualice antes de procesar
                    setTimeout(() => {
                        this.updateCustomCheckboxDisplay(customCheckbox, hiddenCheckbox);
                this.updateNumberRangeForNegatives();
                        console.log('📋 Checkbox números negativos (personalizado) FINAL:', hiddenCheckbox.checked);
                        
                        // Liberar el lock después de un breve delay
                        setTimeout(() => {
                            this.toggleInProgress = false;
                        }, 100);
                    }, 0);
                };

                // Event listeners para el checkbox personalizado
                customCheckbox.addEventListener('click', toggleCheckbox);
                
                // NO agregar listener al label para evitar eventos duplicados
                // El label ya está asociado al checkbox oculto via "for" attribute
                const label = document.querySelector('label[for="math-include-negatives"]');
                if (label) {
                    console.log('✅ Label encontrado pero NO se agregará listener para evitar duplicados');
                    // Remover el atributo "for" para evitar que active automáticamente el checkbox oculto
                    label.removeAttribute('for');
                    // Agregar cursor pointer para mantener la UX
                    label.style.cursor = 'pointer';
                    // Hacer que el label active el checkbox personalizado
                    label.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log('🏷️ Click en label - activando checkbox personalizado');
                        customCheckbox.click(); // Simular click en el checkbox personalizado
                    });
                }
                
                // Inicializar estado del checkbox personalizado
                this.updateCustomCheckboxDisplay(customCheckbox, hiddenCheckbox);
                
                console.log('✅ Checkbox personalizado configurado (index.html)');
        } else {
                // Configuración para matematicas-rapidas.html con checkbox nativo
                console.log('🎯 Configurando checkbox nativo para matematicas-rapidas.html');
                
                const toggleCheckbox = (event) => {
                    console.log('📋 Checkbox números negativos (nativo) cambiado a:', hiddenCheckbox.checked);
                    this.updateNumberRangeForNegatives();
                };

                // Event listener para el checkbox nativo
                hiddenCheckbox.addEventListener('change', toggleCheckbox);
                
                console.log('✅ Checkbox nativo configurado (matematicas-rapidas.html)');
            }
            
            // Inicializar estado
            this.updateNumberRangeForNegatives();
            console.log('🔍 === FIN DEBUGGING CHECKBOX ===');
        } else {
            console.warn('⚠️ No se encontró el checkbox de números negativos');
            console.log('🔍 Elementos disponibles con "negativ" en el ID:');
            const allElements = document.querySelectorAll('[id*="negativ"]');
            allElements.forEach(el => console.log('- ID:', el.id, 'Elemento:', el.tagName));
        }

        // Configurar checkbox de sonido
        this.setupSoundCheckbox();
    }

    updateCustomCheckboxDisplay(customCheckbox, hiddenCheckbox) {
        if (!customCheckbox || !hiddenCheckbox) {
            console.warn('⚠️ updateCustomCheckboxDisplay: elementos faltantes', {
                customCheckbox: !!customCheckbox,
                hiddenCheckbox: !!hiddenCheckbox
            });
            return;
        }

        console.log('🎨 Actualizando display del checkbox personalizado:', {
            estadoCheckbox: hiddenCheckbox.checked,
            customCheckboxId: customCheckbox.id,
            tieneClaseChecked: customCheckbox.classList.contains('checked')
        });

            const checkmark = customCheckbox.querySelector('span');
        console.log('🔍 Checkmark encontrado:', !!checkmark);
            
            if (hiddenCheckbox.checked) {
            console.log('✅ Activando checkbox personalizado');
                customCheckbox.classList.add('checked');
            if (checkmark) {
                checkmark.style.display = 'block';
                console.log('✅ Checkmark mostrado');
            } else {
                // Si no existe el span, crearlo
                const newCheckmark = document.createElement('span');
                newCheckmark.textContent = '✓';
                newCheckmark.style.display = 'block';
                customCheckbox.appendChild(newCheckmark);
                console.log('✅ Checkmark creado dinámicamente');
            }
        } else {
            console.log('❌ Desactivando checkbox personalizado');
                customCheckbox.classList.remove('checked');
            if (checkmark) {
                checkmark.style.display = 'none';
                console.log('❌ Checkmark ocultado');
            }
        }

        console.log('✅ Display del checkbox personalizado actualizado. Estado final:', {
            checked: hiddenCheckbox.checked,
            tieneClaseChecked: customCheckbox.classList.contains('checked')
        });
    }

    setupSoundCheckbox() {
        const hiddenSoundCheckbox = this.elements.soundEnabledCheckbox;
        
        console.log('🔊 === CONFIGURANDO CHECKBOX DE SONIDO ===');
        console.log('hiddenSoundCheckbox encontrado:', !!hiddenSoundCheckbox);
        
        if (hiddenSoundCheckbox) {
            // Detectar si estamos en index.html para manejar el checkbox personalizado
            const isInIndex = document.getElementById('math-setup-panel') !== null;
            const customSoundCheckbox = isInIndex ? document.getElementById('math-sound-checkbox') : null;
            
            console.log('Contexto detectado:', isInIndex ? 'index.html' : 'matematicas-rapidas.html');
            console.log('customSoundCheckbox encontrado:', !!customSoundCheckbox);
            
            if (isInIndex && customSoundCheckbox) {
                // Configuración para index.html con checkbox personalizado
                console.log('🎯 Configurando checkbox de sonido personalizado para index.html');
                
                const toggleSoundCheckbox = (event) => {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    
                    // Evitar llamadas múltiples con un debounce simple
                    if (this.soundToggleInProgress) {
                        console.log('⚠️ Toggle de sonido ya en progreso, ignorando llamada duplicada');
                        return;
                    }
                    
                    this.soundToggleInProgress = true;
                    
                    console.log('🔄 Estado ANTES del toggle de sonido:', hiddenSoundCheckbox.checked);
                    
                    hiddenSoundCheckbox.checked = !hiddenSoundCheckbox.checked;
                    
                    console.log('🔄 Estado DESPUÉS del toggle de sonido:', hiddenSoundCheckbox.checked);
                    
                    // Usar setTimeout para asegurar que el estado se actualice antes de procesar
                    setTimeout(() => {
                        this.updateCustomCheckboxDisplay(customSoundCheckbox, hiddenSoundCheckbox);
                        console.log('🔊 Checkbox sonido (personalizado) FINAL:', hiddenSoundCheckbox.checked);
                        
                        // Liberar el lock después de un breve delay
                        setTimeout(() => {
                            this.soundToggleInProgress = false;
                        }, 100);
                    }, 0);
                };

                // Event listeners para el checkbox personalizado de sonido
                customSoundCheckbox.addEventListener('click', toggleSoundCheckbox);
                
                // Configurar el label del sonido
                const soundLabel = document.querySelector('label[for="math-sound-enabled"]');
                if (soundLabel) {
                    console.log('✅ Label de sonido encontrado');
                    // Remover el atributo "for" para evitar que active automáticamente el checkbox oculto
                    soundLabel.removeAttribute('for');
                    // Agregar cursor pointer para mantener la UX
                    soundLabel.style.cursor = 'pointer';
                    // Hacer que el label active el checkbox personalizado
                    soundLabel.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log('🏷️ Click en label de sonido - activando checkbox personalizado');
                        customSoundCheckbox.click(); // Simular click en el checkbox personalizado
                    });
                }
                
                // Inicializar estado del checkbox personalizado de sonido
                this.updateCustomCheckboxDisplay(customSoundCheckbox, hiddenSoundCheckbox);
                
                console.log('✅ Checkbox de sonido personalizado configurado (index.html)');
            } else {
                // Configuración para matematicas-rapidas.html con checkbox nativo
                console.log('🎯 Configurando checkbox de sonido nativo para matematicas-rapidas.html');
                
                const toggleSoundCheckbox = (event) => {
                    console.log('🔊 Checkbox sonido (nativo) cambiado a:', hiddenSoundCheckbox.checked);
                };

                // Event listener para el checkbox nativo
                hiddenSoundCheckbox.addEventListener('change', toggleSoundCheckbox);
                
                console.log('✅ Checkbox de sonido nativo configurado (matematicas-rapidas.html)');
            }
            
            console.log('🔊 === FIN CONFIGURACIÓN CHECKBOX DE SONIDO ===');
        } else {
            console.warn('⚠️ No se encontró el checkbox de sonido');
        }
    }

    updateSliderDisplays() {
        if (!this.elements.numCountSlider || !this.elements.intervalSlider || 
            !this.elements.numCountDisplay || !this.elements.intervalDisplay) {
            console.warn('⚠️ Elementos de sliders no encontrados, saltando actualización');
            return;
        }
        
        const numCountValue = this.elements.numCountSlider.value;
        const intervalValue = this.elements.intervalSlider.value;
        
        this.elements.numCountDisplay.textContent = numCountValue;
        this.elements.intervalDisplay.textContent = intervalValue;
        
        console.log('📊 Sliders actualizados:', {
            cantidad: numCountValue,
            intervalo: intervalValue
        });
    }

    initializeAudio() {
        // Inicializar contexto de audio para generar pitidos
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API no disponible:', error);
            this.audioContext = null;
        }
    }

    resumeAudioContext() {
        // Los navegadores modernos requieren interacción del usuario para activar el audio
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(error => {
                console.warn('Error al reanudar contexto de audio:', error);
            });
        }
    }

    playBeep(frequency = 800, duration = 200) {
        if (!this.audioContext) return;

        try {
            // Crear oscilador para generar el tono
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Configurar el oscilador
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Configurar el volumen con fade in/out suave
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            // Conectar nodos
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Reproducir el sonido
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Error al reproducir pitido:', error);
        }
    }

    validateNumberRange() {
        if (!this.elements.minNumberInput || !this.elements.maxNumberInput || !this.elements.includeNegativesCheckbox) {
            console.warn('⚠️ Elementos de validación no encontrados');
            return;
        }
        
        const min = parseInt(this.elements.minNumberInput.value) || 1;
        const max = parseInt(this.elements.maxNumberInput.value) || 50;
        const includeNegatives = this.elements.includeNegativesCheckbox.checked;

        console.log('🔢 Validando rango de números:', { min, max, includeNegatives });

        // Asegurar que min < max
        if (min >= max) {
            this.elements.maxNumberInput.value = min + 1;
            console.log('⚠️ Máximo ajustado a:', min + 1);
        }

        // Validar límites según si se incluyen negativos o no
        const minLimit = includeNegatives ? -100 : 1;
        const maxLimit = 100;

        if (min < minLimit) {
            this.elements.minNumberInput.value = minLimit;
            console.log('⚠️ Mínimo ajustado a:', minLimit);
        }

        if (max > maxLimit) {
            this.elements.maxNumberInput.value = maxLimit;
            console.log('⚠️ Máximo ajustado a:', maxLimit);
        }

        if (max < minLimit) {
            this.elements.maxNumberInput.value = minLimit + 1;
            console.log('⚠️ Máximo ajustado a:', minLimit + 1);
        }

        console.log('✅ Validación completada. Rango final:', {
            min: this.elements.minNumberInput.value,
            max: this.elements.maxNumberInput.value
        });
    }

    updateNumberRangeForNegatives() {
        if (!this.elements.includeNegativesCheckbox || !this.elements.minNumberInput || !this.elements.maxNumberInput) {
            console.warn('⚠️ Elementos de rango no encontrados');
            return;
        }
        
        const includeNegatives = this.elements.includeNegativesCheckbox.checked;
        const minInput = this.elements.minNumberInput;
        const maxInput = this.elements.maxNumberInput;
        
        console.log('🔢 Actualizando rango de números. Negativos permitidos:', includeNegatives);
        
        if (includeNegatives) {
            // Permitir números negativos
            minInput.min = '-100';
            maxInput.min = '-100';
            
            // Si el valor actual es muy alto y no incluía negativos, ajustar
            if (parseInt(minInput.value) > 0 && parseInt(maxInput.value) > 0) {
                minInput.value = '-10';
                maxInput.value = '50';
            }
        } else {
            // Solo números positivos
            minInput.min = '1';
            maxInput.min = '1';
            
            // Si hay números negativos, ajustar a positivos
            if (parseInt(minInput.value) < 1) {
                minInput.value = '1';
            }
            if (parseInt(maxInput.value) < 1) {
                maxInput.value = '50';
            }
        }
        
        // Validar rango después del cambio
        this.validateNumberRange();
        
        console.log('📊 Nuevo rango:', {
            min: minInput.value,
            max: maxInput.value,
            negativos: includeNegatives
        });
    }

    startGame() {
        console.log('🎮 Iniciando juego de matemáticas rápidas...');
        
        // Verificar que todos los elementos necesarios estén disponibles
        if (!this.elements.numCountSlider || !this.elements.intervalSlider || 
            !this.elements.minNumberInput || !this.elements.maxNumberInput || 
            !this.elements.includeNegativesCheckbox) {
            console.error('❌ No se pueden obtener los valores de configuración');
            alert('Error: No se pueden obtener los valores de configuración');
            return;
        }
        
        // Reanud contexto de audio
        this.resumeAudioContext();

        // Get configuration values
        this.gameState.totalNumbers = parseInt(this.elements.numCountSlider.value);
        this.gameState.interval = parseInt(this.elements.intervalSlider.value) * 1000; // Convert to milliseconds
        this.gameState.minNumber = parseInt(this.elements.minNumberInput.value);
        this.gameState.maxNumber = parseInt(this.elements.maxNumberInput.value);

        // Validate configuration
        if (this.gameState.minNumber >= this.gameState.maxNumber) {
            alert('El número mínimo debe ser menor que el máximo');
            return;
        }

        // Reset game state
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.currentNumberIndex = 0;
        this.gameState.numbers = [];
        this.gameState.correctAnswer = 0;
        this.gameState.userAnswer = null;

        // Generate numbers
        this.generateNumbers();

        // Show game panel
        this.showPanel('game');

        // Update display
        this.elements.totalNumbersSpan.textContent = this.gameState.totalNumbers;

        console.log('🎮 Configuración del juego:', {
            totalNumbers: this.gameState.totalNumbers,
            interval: this.gameState.interval,
            numbers: this.gameState.numbers,
            correctAnswer: this.gameState.correctAnswer
        });

        // Start showing numbers
        this.startNumberSequence();
    }

    generateNumbers() {
        this.gameState.numbers = [];
        this.gameState.correctAnswer = 0;
        
        const totalNumbers = this.gameState.totalNumbers;
        const minNum = this.gameState.minNumber;
        const maxNum = this.gameState.maxNumber;
        const includeNegatives = this.elements.includeNegativesCheckbox.checked;
        
        console.log('🎲 Generando números:', {
            cantidad: totalNumbers,
            rango: `${minNum} a ${maxNum}`,
            negativos: includeNegatives
        });

        for (let i = 0; i < totalNumbers; i++) {
            let randomNumber;
            
            if (includeNegatives) {
                // Permitir todo el rango incluyendo negativos
                randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            } else {
                // Solo números positivos
                const adjustedMin = Math.max(1, minNum);
                const adjustedMax = Math.max(adjustedMin, maxNum);
                randomNumber = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin;
            }
            
            this.gameState.numbers.push(randomNumber);
            this.gameState.correctAnswer += randomNumber;
        }

        console.log('✅ Números generados:', this.gameState.numbers);
        console.log('🧮 Respuesta correcta:', this.gameState.correctAnswer);
    }

    startNumberSequence() {
        console.log('🔢 Iniciando secuencia de número:', {
            índice: this.gameState.currentNumberIndex,
            total: this.gameState.totalNumbers,
            isPlaying: this.gameState.isPlaying,
            isPaused: this.gameState.isPaused
        });

        // Verificar si el juego sigue activo
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            console.log('⏸️ Juego pausado o detenido, cancelando secuencia');
            return;
        }

        // Verificar si hemos llegado al final
        if (this.gameState.currentNumberIndex >= this.gameState.totalNumbers) {
            console.log('🏁 Fin del juego - todos los números mostrados');
            this.endGame();
            return;
        }

        // Limpiar cualquier timer existente para evitar duplicados
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
            this.gameState.gameTimer = null;
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
            this.gameState.countdownTimer = null;
        }

        // Show current number
        const currentNumber = this.gameState.numbers[this.gameState.currentNumberIndex];
        this.elements.displayNumber.textContent = currentNumber;

        console.log('👁️ Mostrando número:', currentNumber, 'Posición:', this.gameState.currentNumberIndex + 1);

        // Reproducir pitido cuando aparece el número si el sonido está habilitado
        if (this.elements.soundEnabledCheckbox && this.elements.soundEnabledCheckbox.checked) {
            console.log('🔊 Reproduciendo pitido para número:', currentNumber);
            this.playBeep(800, 150); // Frecuencia 800Hz, duración 150ms
        }

        // Update progress and info
        this.updateGameInfo();
        this.updateProgress();

        // Start countdown
        this.gameState.currentCountdown = this.gameState.interval / 1000;
        this.startCountdown();

        // Schedule next number - SOLO si no estamos en el último número
        if (this.gameState.currentNumberIndex < this.gameState.totalNumbers - 1) {
        this.gameState.gameTimer = setTimeout(() => {
                // Verificar nuevamente el estado antes de avanzar
                if (this.gameState.isPlaying && !this.gameState.isPaused) {
            this.nextNumber();
                }
        }, this.gameState.interval);
        } else {
            // Si es el último número, programar el fin del juego
            this.gameState.gameTimer = setTimeout(() => {
                if (this.gameState.isPlaying && !this.gameState.isPaused) {
                    console.log('🏁 Último número mostrado, finalizando juego');
                    this.endGame();
                }
            }, this.gameState.interval);
        }
    }

    nextNumber() {
        console.log('➡️ nextNumber() llamado. Estado actual:', {
            índice: this.gameState.currentNumberIndex,
            isPlaying: this.gameState.isPlaying,
            isPaused: this.gameState.isPaused
        });

        // Verificar estado del juego
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            console.log('⏸️ Juego no activo, cancelando nextNumber()');
            return;
        }

        // Reproducir pitido si el sonido está habilitado
        if (this.elements.soundEnabledCheckbox && this.elements.soundEnabledCheckbox.checked) {
            console.log('🔊 Reproduciendo pitido para cambio de número');
            this.playBeep(800, 150); // Frecuencia 800Hz, duración 150ms
        }

        // Avanzar al siguiente número
            this.gameState.currentNumberIndex++;
        
        console.log('➡️ Avanzando al siguiente número. Nuevo índice:', this.gameState.currentNumberIndex);
        
        // Continuar con la secuencia
            this.startNumberSequence();
    }

    startCountdown() {
        // Limpiar cualquier countdown existente
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
            this.gameState.countdownTimer = null;
        }

        this.updateCountdownDisplay();
        
        this.gameState.countdownTimer = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.isPlaying) {
                this.gameState.currentCountdown--;
                this.updateCountdownDisplay();

                if (this.gameState.currentCountdown <= 0) {
                    clearInterval(this.gameState.countdownTimer);
                    this.gameState.countdownTimer = null;
                }
            }
        }, 1000);
    }

    updateCountdownDisplay() {
        this.elements.countdownSpan.textContent = Math.max(0, this.gameState.currentCountdown);
    }

    updateGameInfo() {
        const displayNumber = this.gameState.currentNumberIndex + 1;
        this.elements.currentNumberSpan.textContent = displayNumber;
        this.elements.totalNumbersSpan.textContent = this.gameState.totalNumbers;
        
        console.log('📊 Actualizando info del juego:', {
            mostrando: `${displayNumber}/${this.gameState.totalNumbers}`,
            índiceInterno: this.gameState.currentNumberIndex
        });
    }

    updateProgress() {
        const progress = ((this.gameState.currentNumberIndex + 1) / this.gameState.totalNumbers) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }

    pauseGame() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            console.log('⚠️ No se puede pausar: juego no activo o ya pausado');
            return;
        }

        console.log('⏸️ Pausando juego en índice:', this.gameState.currentNumberIndex);

        this.gameState.isPaused = true;
        this.elements.pauseOverlay.style.display = 'flex';

        // Clear timers
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
            this.gameState.gameTimer = null;
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
            this.gameState.countdownTimer = null;
        }
    }

    resumeGame() {
        if (!this.gameState.isPlaying || !this.gameState.isPaused) {
            console.log('⚠️ No se puede reanudar: juego no activo o no pausado');
            return;
        }

        console.log('▶️ Reanudando juego en índice:', this.gameState.currentNumberIndex);

        this.gameState.isPaused = false;
        this.elements.pauseOverlay.style.display = 'none';

        // Resume countdown
        this.startCountdown();
        
        // Resume game timer con el tiempo restante
        const remainingTime = this.gameState.currentCountdown * 1000;
        
        if (this.gameState.currentNumberIndex < this.gameState.totalNumbers - 1) {
            // Hay más números por mostrar
        this.gameState.gameTimer = setTimeout(() => {
                if (this.gameState.isPlaying && !this.gameState.isPaused) {
            this.nextNumber();
                }
        }, remainingTime);
        } else {
            // Es el último número
            this.gameState.gameTimer = setTimeout(() => {
                if (this.gameState.isPlaying && !this.gameState.isPaused) {
                    console.log('🏁 Último número completado tras pausa, finalizando juego');
                    this.endGame();
                }
            }, remainingTime);
        }
    }

    stopGame() {
        console.log('⏹️ Deteniendo juego');
        
        this.gameState.isPlaying = false;
        this.gameState.isPaused = false;

        // Clear ALL timers
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
            this.gameState.gameTimer = null;
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
            this.gameState.countdownTimer = null;
        }

        // Hide pause overlay if visible
        this.elements.pauseOverlay.style.display = 'none';

        // Reset display
        this.elements.displayNumber.textContent = '0';
        this.elements.countdownSpan.textContent = '0';
        this.elements.progressFill.style.width = '0%';

        // Show setup panel
        this.showPanel('setup');
        
        console.log('✅ Juego detenido completamente');
    }

    endGame() {
        this.gameState.isPlaying = false;
        this.gameState.isPaused = false;

        // Clear timers
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
        }

        // Show results panel
        this.showPanel('results');
        this.displayResults();
    }

    displayResults() {
        // Mostrar números en formato de chips
        this.elements.numbersList.innerHTML = '';
        this.gameState.numbers.forEach(num => {
            const chip = document.createElement('div');
            chip.className = 'number-chip';
            chip.textContent = num;
            this.elements.numbersList.appendChild(chip);
        });

        // Mostrar cálculo SIN el resultado - solo los números a sumar
        const calculation = this.gameState.numbers.join(' + ') + ' = ?';
        this.elements.calculationDisplay.textContent = calculation;

        // Limpiar input de respuesta
        this.elements.userAnswerInput.value = '';
        this.elements.resultDisplay.style.display = 'none';
        
        // Mostrar panel de resultados
        this.showPanel('results');
        
        // Enfocar input de respuesta
        setTimeout(() => {
            this.elements.userAnswerInput.focus();
        }, 100);
    }

    revealAnswer() {
        const userAnswer = parseInt(this.elements.userAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            alert('Por favor ingresa un número válido');
            return;
        }

        this.gameState.userAnswer = userAnswer;

        // Actualizar el cálculo para mostrar el resultado correcto
        const calculationWithResult = this.gameState.numbers.join(' + ') + ' = ' + this.gameState.correctAnswer;
        this.elements.calculationDisplay.textContent = calculationWithResult;

        // Show correct answer
        this.elements.correctAnswerSpan.textContent = this.gameState.correctAnswer;

        // Show result status
        const isCorrect = userAnswer === this.gameState.correctAnswer;
        this.elements.resultStatus.textContent = isCorrect ? '¡Correcto! 🎉' : '¡Incorrecto! 😔';
        this.elements.resultStatus.className = `result-status ${isCorrect ? 'correct' : 'incorrect'}`;

        // Show result display
        this.elements.resultDisplay.style.display = 'block';

        // Disable reveal button
        this.elements.revealBtn.disabled = true;
        this.elements.revealBtn.textContent = 'Respuesta Revelada';
    }

    playAgain() {
        // Reset reveal button
        this.elements.revealBtn.disabled = false;
        this.elements.revealBtn.textContent = '🎯 Revelar Respuesta';

        // Reset calculation display
        this.elements.calculationDisplay.textContent = '';
        this.elements.resultDisplay.style.display = 'none';

        // Start new game with same configuration
        this.startGame();
    }

    newConfiguration() {
        // Reset reveal button
        this.elements.revealBtn.disabled = false;
        this.elements.revealBtn.textContent = '🎯 Revelar Respuesta';

        // Reset calculation display
        this.elements.calculationDisplay.textContent = '';
        this.elements.resultDisplay.style.display = 'none';

        // Show setup panel
        this.showPanel('setup');
    }

    showPanel(panelName) {
        // Ocultar todos los paneles
        this.elements.setupPanel.style.display = 'none';
        this.elements.gamePanel.style.display = 'none';
        this.elements.resultsPanel.style.display = 'none';
        
        // Mostrar el panel solicitado
        switch(panelName) {
            case 'setup':
                this.elements.setupPanel.style.display = 'block';
                break;
            case 'game':
                this.elements.gamePanel.style.display = 'block';
                break;
            case 'results':
                this.elements.resultsPanel.style.display = 'block';
                break;
        }
    }

    debugElements() {
        console.log('🔍 === DEBUG: Verificando elementos del DOM ===');
        
        const criticalElements = [
            'setupPanel', 'gamePanel', 'resultsPanel',
            'numCountSlider', 'intervalSlider', 'numCountDisplay', 'intervalDisplay',
            'includeNegativesCheckbox', 'minNumberInput', 'maxNumberInput', 'startBtn',
            'pauseBtn', 'stopBtn', 'resumeBtn', 'revealBtn', 'playAgainBtn', 'newConfigBtn'
        ];
        
        let foundElements = 0;
        let missingElements = [];
        
        criticalElements.forEach(elementName => {
            if (this.elements[elementName]) {
                console.log(`✅ ${elementName}: ENCONTRADO`);
                foundElements++;
            } else {
                console.error(`❌ ${elementName}: NO ENCONTRADO`);
                missingElements.push(elementName);
            }
        });
        
        console.log(`📊 Resumen: ${foundElements}/${criticalElements.length} elementos encontrados`);
        
        if (missingElements.length > 0) {
            console.error('❌ Elementos faltantes:', missingElements);
            console.log('🔍 Verificando IDs en el DOM...');
            
            // Verificar qué IDs existen realmente en el DOM
            const allElements = document.querySelectorAll('[id]');
            const existingIds = Array.from(allElements).map(el => el.id);
            console.log('📋 IDs disponibles en el DOM:', existingIds);
        }
        
        console.log('🔍 === FIN DEBUG ===');
    }
}

// ===== FONDO ANIMADO EXCLUSIVO MATEMÁTICAS RÁPIDAS =====
class MathBackground {
    constructor(intensity = 'medium') {
        console.log('🎨 Inicializando fondo matemático exclusivo...');
        
        // Lista de símbolos matemáticos
        this.mathSymbols = [
            '+', '−', '×', '÷', '=', '≠', '≈', '∞',
            '√', '∑', '∫', 'π', 'α', 'β', 'γ', 'δ',
            '∆', '∇', '∂', '∈', '∉', '⊂', '⊃', '∪',
            '∩', '∧', '∨', '¬', '∀', '∃', '∅', '℘',
            '≤', '≥', '±', '∓', '°', '%', '‰', '∝',
            '∴', '∵', '⊥', '∥', '∠', '∡', '⌒', '⊙',
            '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
            'x', 'y', 'z', 'n', 'f', 'g', 'h'
        ];
        
        this.symbols = [];
        this.particles = [];
        this.isActive = false;
        this.animationFrame = null;
        this.intensity = intensity;
        this.container = null;
        
        // Configuración de intensidad
        this.config = {
            low: { symbolCount: 30, particleCount: 10 },
            medium: { symbolCount: 50, particleCount: 20 },
            high: { symbolCount: 80, particleCount: 30 }
        };
        
        // Crear contenedor y verificar éxito
        if (this.createContainer()) {
            this.createSymbols();
            this.createParticles();
            this.startAnimation();
            console.log('✅ Fondo matemático inicializado correctamente');
            console.log('🚀 Animación iniciada inmediatamente con elementos visibles');
        } else {
            console.error('❌ Error al crear el contenedor del fondo matemático');
        }
    }

    createContainer() {
        console.log('🎨 Creando contenedor de fondo matemático...');
        
        // Buscar el panel de matemáticas rápidas específicamente
        const mathPanel = document.getElementById('matematicas-rapidas-panel');
        if (!mathPanel) {
            console.error('❌ No se encontró el panel de matemáticas rápidas');
            return false;
        }
        
        this.container = document.createElement('div');
        this.container.id = 'math-background-container';
        this.container.className = 'math-background';
        
        // Agregar estilos inline como fallback
        this.container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            overflow: hidden;
            background: linear-gradient(350deg, rgb(0 2 10) 0%, rgb(96 24 169) 100%);
            pointer-events: none;
        `;
        
        // Agregar al panel de matemáticas rápidas, no al body
        mathPanel.appendChild(this.container);
        
        console.log('✅ Contenedor de fondo matemático creado:', this.container);
        console.log('📍 Posición en DOM:', this.container.parentElement);
        console.log('🎨 Estilos aplicados:', this.container.style.cssText);
        
        return true;
    }

    // Función de prueba visual mejorada
    createVisualTest() {
        console.log('🎨 Creando prueba visual del fondo...');
        
        // Crear overlay temporal para mostrar el fondo
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            pointer-events: none;
        `;
        overlay.innerHTML = `
            <div>
                <div>🎨 FONDO MATEMÁTICO ACTIVO</div>
                <div style="font-size: 1rem; margin-top: 1rem;">
                    Símbolos flotando: ${this.symbols.length}<br>
                    Estado: ${this.isActive ? 'Activo' : 'Inactivo'}<br>
                    <div style="margin-top: 1rem; font-size: 0.8rem;">
                        Este mensaje desaparecerá en 3 segundos
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                console.log('🗑️ Overlay de prueba removido');
            }
        }, 3000);
        
        console.log('✅ Prueba visual creada');
    }

    createSymbols() {
        const count = this.config[this.intensity].symbolCount;
        console.log(`🔢 Creando ${count} símbolos matemáticos...`);
        
        for (let i = 0; i < count; i++) {
            // Los primeros 10 símbolos aparecen inmediatamente para efecto visual instantáneo
            const immediateStart = i < 10;
            this.createSymbol(immediateStart);
        }
        
        console.log(`✅ ${this.symbols.length} símbolos creados`);
    }

    createSymbol(immediateStart = false) {
        if (!this.container) return;
        
        const symbol = document.createElement('div');
        symbol.className = 'math-symbol';
        
        // Seleccionar símbolo aleatorio
        const randomSymbol = this.mathSymbols[Math.floor(Math.random() * this.mathSymbols.length)];
        symbol.textContent = randomSymbol;
        
        // Propiedades aleatorias
        const size = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
        const speed = ['slow', 'medium-speed', 'fast'][Math.floor(Math.random() * 3)];
        const effect = Math.random() < 0.3 ? ['glow', 'pulse', 'drift-left', 'drift-right'][Math.floor(Math.random() * 4)] : '';
        
        symbol.classList.add(size, speed);
        if (effect) symbol.classList.add(effect);
        
        // Posición inicial aleatoria
        symbol.style.left = Math.random() * 100 + '%';
        symbol.style.top = Math.random() * 100 + '%';
        
        // Delay: inmediato para los primeros símbolos, aleatorio para el resto
        symbol.style.animationDelay = immediateStart ? '0s' : (Math.random() * 2 + 's');
        
        this.container.appendChild(symbol);
        this.symbols.push(symbol);
    }

    createParticles() {
        const count = this.config[this.intensity].particleCount;
        console.log(`✨ Creando ${count} partículas matemáticas...`);
        
        for (let i = 0; i < count; i++) {
            // Las primeras 5 partículas aparecen inmediatamente
            const immediateStart = i < 5;
            this.createParticle(immediateStart);
        }
        
        console.log(`✅ ${this.particles.length} partículas creadas`);
    }

    createParticle(immediateStart = false) {
        if (!this.container) return;
        
        const particle = document.createElement('div');
        particle.className = 'math-particle';
        
        // Seleccionar símbolo pequeño aleatorio
        const smallSymbols = ['+', '−', '×', '÷', '=', '·', '°', '%'];
        const randomSymbol = smallSymbols[Math.floor(Math.random() * smallSymbols.length)];
        particle.textContent = randomSymbol;
        
        // Posición inicial aleatoria
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Delay: inmediato para las primeras partículas, aleatorio para el resto
        particle.style.animationDelay = immediateStart ? '0s' : (Math.random() * 3 + 's');
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    startAnimation() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('▶️ Iniciando animación de fondo matemático');
        this.animate();
    }

    animate() {
        if (!this.isActive) return;
        
        // Aquí podrías agregar lógica de animación adicional si es necesaria
        // Por ahora, las animaciones están manejadas por CSS
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    stopAnimation() {
        if (!this.isActive) return;
        
        this.isActive = false;
        console.log('⏹️ Deteniendo animación de fondo matemático');
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        console.log('🗑️ Destruyendo fondo matemático');
        
        this.stopAnimation();
        
        // Limpiar símbolos y partículas
        this.symbols = [];
        this.particles = [];
        
        // Remover contenedor del DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.container = null;
        console.log('✅ Fondo matemático destruido');
    }
}



// Instancia global del fondo matemático
let mathBackground = null;

// Función para inicializar el fondo matemático
function initMathBackground() {
    if (!mathBackground) {
        mathBackground = new MathBackground();
    }
}

// Función para destruir el fondo matemático
function destroyMathBackground() {
    if (mathBackground) {
        mathBackground.destroy();
        mathBackground = null;
    }
}

// Exponer funciones globalmente
window.initMathBackground = initMathBackground;
window.destroyMathBackground = destroyMathBackground;

// Función de prueba global
window.testMathBackground = function() {
    console.log('🧪 === TEST MANUAL DEL FONDO MATEMÁTICO ===');
    console.log('🔍 Estado actual del mathBackground:', window.mathBackground);
    
    if (window.mathBackground) {
        console.log('⚠️ Ya existe una instancia, destruyendo primero...');
        window.mathBackground.destroy();
    }
    
    console.log('🚀 Creando nueva instancia...');
    window.mathBackground = new MathBackground();
    
    console.log('📊 Estado después de inicializar:', window.mathBackground);
    console.log('🎨 Contenedor creado:', window.mathBackground.container);
    console.log('🧪 === FIN TEST ===');
    
    // Crear prueba visual
    if (window.mathBackground) {
        setTimeout(() => {
            window.mathBackground.createVisualTest();
        }, 1000);
    }
};

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 === INICIALIZACIÓN MATEMÁTICAS RÁPIDAS ===');
    console.log('📄 URL actual:', window.location.href);
    console.log('📄 Título de la página:', document.title);
    
    // Verificar qué elementos existen
    const setupPanel = document.getElementById('setup-panel');
    const mathPanel = document.getElementById('matematicas-rapidas-panel');
    
    console.log('🔍 Verificando elementos de inicialización:');
    console.log('- setup-panel:', setupPanel);
    console.log('- matematicas-rapidas-panel:', mathPanel);
    
    // Mostrar todos los IDs disponibles
    const allElements = document.querySelectorAll('[id]');
    const existingIds = Array.from(allElements).map(el => el.id);
    console.log('📋 TODOS los IDs disponibles en el DOM:', existingIds);
    
    // Inicializar si estamos en matematicas-rapidas.html o si existe el panel en index.html
    if (setupPanel || mathPanel) {
        console.log('🚀 Inicializando Matemáticas Rápidas...');
        window.matematicasRapidas = new MatematicasRapidas();
        
        // Inicializar el fondo matemático exclusivo
        console.log('🎨 Activando fondo matemático exclusivo...');
        console.log('🔍 Verificando disponibilidad de funciones:');
        console.log('- initMathBackground:', typeof initMathBackground);
        console.log('- window.initMathBackground:', typeof window.initMathBackground);
        
        try {
            initMathBackground();
            console.log('✅ Fondo matemático inicializado exitosamente');
        } catch (error) {
            console.error('❌ Error al inicializar fondo matemático:', error);
        }
    } else {
        console.log('⚠️ Elementos de Matemáticas Rápidas no encontrados en esta página');
        console.log('💡 Asegúrate de estar en matematicas-rapidas.html o que el panel exista en index.html');
    }
    
    console.log('🔍 === FIN INICIALIZACIÓN ===');
});

// Add some utility functions for better UX
document.addEventListener('keydown', (e) => {
    // ESC key to pause/resume game
    if (e.key === 'Escape') {
        const game = window.matematicasRapidas;
        if (game && game.gameState.isPlaying) {
            if (game.gameState.isPaused) {
                game.resumeGame();
            } else {
                game.pauseGame();
            }
        }
    }
});

// Prevent accidental page refresh during game
window.addEventListener('beforeunload', (e) => {
    const game = window.matematicasRapidas;
    if (game && game.gameState.isPlaying) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Se perderá el progreso del juego.';
        return e.returnValue;
    }
}); 