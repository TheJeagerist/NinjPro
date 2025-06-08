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
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateSliderDisplays();
        this.initializeThemes();
        this.initializeAudio();
    }

    cacheElements() {
        // Setup panel elements
        this.elements.setupPanel = document.getElementById('setup-panel');
        this.elements.numCountSlider = document.getElementById('num-count');
        this.elements.numCountDisplay = document.getElementById('num-count-display');
        this.elements.intervalSlider = document.getElementById('interval');
        this.elements.intervalDisplay = document.getElementById('interval-display');
        this.elements.minNumberInput = document.getElementById('min-number');
        this.elements.maxNumberInput = document.getElementById('max-number');
        this.elements.includeNegativesCheckbox = document.getElementById('include-negatives');
        this.elements.startBtn = document.getElementById('start-btn');

        // Game panel elements
        this.elements.gamePanel = document.getElementById('game-panel');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.currentNumberSpan = document.getElementById('current-number');
        this.elements.totalNumbersSpan = document.getElementById('total-numbers');
        this.elements.countdownSpan = document.getElementById('countdown');
        this.elements.displayNumber = document.getElementById('display-number');
        this.elements.pauseBtn = document.getElementById('pause-btn');
        this.elements.stopBtn = document.getElementById('stop-btn');

        // Results panel elements
        this.elements.resultsPanel = document.getElementById('results-panel');
        this.elements.numbersList = document.getElementById('numbers-list');
        this.elements.calculationDisplay = document.getElementById('calculation-display');
        this.elements.userAnswerInput = document.getElementById('user-answer');
        this.elements.revealBtn = document.getElementById('reveal-btn');
        this.elements.resultDisplay = document.getElementById('result-display');
        this.elements.correctAnswerSpan = document.getElementById('correct-answer');
        this.elements.resultStatus = document.getElementById('result-status');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
        this.elements.newConfigBtn = document.getElementById('new-config-btn');

        // Pause overlay elements
        this.elements.pauseOverlay = document.getElementById('pause-overlay');
        this.elements.resumeBtn = document.getElementById('resume-btn');
    }

    setupEventListeners() {
        // Slider updates
        this.elements.numCountSlider.addEventListener('input', () => {
            this.updateSliderDisplays();
        });

        this.elements.intervalSlider.addEventListener('input', () => {
            this.updateSliderDisplays();
        });

        // Game controls
        this.elements.startBtn.addEventListener('click', () => {
            this.startGame();
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            this.pauseGame();
        });

        this.elements.stopBtn.addEventListener('click', () => {
            this.stopGame();
        });

        this.elements.resumeBtn.addEventListener('click', () => {
            this.resumeGame();
        });

        // Results controls
        this.elements.revealBtn.addEventListener('click', () => {
            this.revealAnswer();
        });

        this.elements.playAgainBtn.addEventListener('click', () => {
            this.playAgain();
        });

        this.elements.newConfigBtn.addEventListener('click', () => {
            this.newConfiguration();
        });

        // Enter key for user answer
        this.elements.userAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.revealAnswer();
            }
        });

        // Number input validation
        this.elements.minNumberInput.addEventListener('change', () => {
            this.validateNumberRange();
        });

        this.elements.maxNumberInput.addEventListener('change', () => {
            this.validateNumberRange();
        });

        // Checkbox for negative numbers
        this.elements.includeNegativesCheckbox.addEventListener('change', () => {
            this.updateNumberRangeForNegatives();
        });
    }

    updateSliderDisplays() {
        this.elements.numCountDisplay.textContent = this.elements.numCountSlider.value;
        this.elements.intervalDisplay.textContent = this.elements.intervalSlider.value;
    }

    initializeThemes() {
        // Aplicar tema guardado o por defecto
        const savedTheme = localStorage.getItem('theme') || 'theme-dark';
        document.body.className = savedTheme;
        
        // Configurar botones de tema
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            // Marcar botón activo
            if (btn.dataset.theme === savedTheme) {
                btn.classList.add('active');
            }
            
            // Agregar event listener
            btn.addEventListener('click', () => {
                this.changeTheme(btn.dataset.theme);
            });
        });
        
        // Esperar a que los fondos animados estén listos y luego aplicar el tema
        const initializeBackgrounds = () => {
            if (window.animatedBackgrounds && window.animatedBackgrounds.isInitialized) {
                // Aplicar tema inicial
                this.changeTheme(savedTheme);
                console.log(`🎨 Tema inicial aplicado: ${savedTheme}`);
            } else {
                // Reintentar en 100ms si los fondos no están listos
                setTimeout(initializeBackgrounds, 100);
            }
        };
        
        // Inicializar inmediatamente o esperar a que estén listos
        setTimeout(initializeBackgrounds, 50);
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

    changeTheme(theme) {
        // Actualizar clase del body
        document.body.className = theme;
        
        // Guardar tema
        localStorage.setItem('theme', theme);
        
        // Actualizar botones activos
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Cambiar fondo animado usando múltiples métodos para asegurar compatibilidad
        if (window.setTheme) {
            window.setTheme(theme);
        }
        
        // Usar la API de fondos animados directamente
        if (window.backgroundsAPI && window.backgroundsAPI.switchTheme) {
            window.backgroundsAPI.switchTheme(theme);
        }
        
        // Usar la instancia global de fondos animados
        if (window.animatedBackgrounds && window.animatedBackgrounds.switchTheme) {
            window.animatedBackgrounds.switchTheme(theme);
        }
        
        // Disparar evento personalizado para asegurar que todos los sistemas se enteren
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme }
        }));
        
        // Debug: verificar que los fondos estén cambiando
        setTimeout(() => {
            const activeBackgrounds = document.querySelectorAll('.animated-background.active');
            console.log(`🎨 Tema cambiado a: ${theme}`);
            console.log(`🔍 Fondos activos encontrados:`, activeBackgrounds.length);
            if (activeBackgrounds.length > 0) {
                console.log(`✅ Fondo activo:`, activeBackgrounds[0].id);
            } else {
                console.warn(`⚠️ No se encontraron fondos activos para el tema: ${theme}`);
            }
        }, 200);
    }

    validateNumberRange() {
        const min = parseInt(this.elements.minNumberInput.value);
        const max = parseInt(this.elements.maxNumberInput.value);
        const includeNegatives = this.elements.includeNegativesCheckbox.checked;

        if (min >= max) {
            this.elements.maxNumberInput.value = min + 1;
        }

        // Validar límites según si se incluyen negativos o no
        const minLimit = includeNegatives ? -100 : 1;
        const maxLimit = 100;

        if (min < minLimit) {
            this.elements.minNumberInput.value = minLimit;
        }

        if (max > maxLimit) {
            this.elements.maxNumberInput.value = maxLimit;
        }

        if (max < minLimit) {
            this.elements.maxNumberInput.value = minLimit + 1;
        }
    }

    updateNumberRangeForNegatives() {
        const includeNegatives = this.elements.includeNegativesCheckbox.checked;
        
        if (includeNegatives) {
            // Permitir números negativos
            this.elements.minNumberInput.min = '-100';
            this.elements.maxNumberInput.min = '-100';
            
            // Si los valores actuales son muy restrictivos, ajustarlos
            const currentMin = parseInt(this.elements.minNumberInput.value);
            const currentMax = parseInt(this.elements.maxNumberInput.value);
            
            if (currentMin > 0 && currentMax > 0) {
                // Sugerir un rango que incluya negativos
                this.elements.minNumberInput.value = '-20';
                this.elements.maxNumberInput.value = '20';
            }
        } else {
            // Solo números positivos
            this.elements.minNumberInput.min = '1';
            this.elements.maxNumberInput.min = '1';
            
            // Si hay números negativos, ajustar a positivos
            const currentMin = parseInt(this.elements.minNumberInput.value);
            const currentMax = parseInt(this.elements.maxNumberInput.value);
            
            if (currentMin < 1) {
                this.elements.minNumberInput.value = '1';
            }
            if (currentMax < 1) {
                this.elements.maxNumberInput.value = '50';
            }
        }
        
        this.validateNumberRange();
    }

    startGame() {
        // Get configuration
        this.gameState.totalNumbers = parseInt(this.elements.numCountSlider.value);
        this.gameState.interval = parseInt(this.elements.intervalSlider.value) * 1000;
        this.gameState.minNumber = parseInt(this.elements.minNumberInput.value);
        this.gameState.maxNumber = parseInt(this.elements.maxNumberInput.value);
        this.gameState.includeNegatives = this.elements.includeNegativesCheckbox.checked;

        // Validate configuration
        if (this.gameState.minNumber >= this.gameState.maxNumber) {
            alert('El número mínimo debe ser menor que el máximo');
            return;
        }

        // Validate negative numbers setting
        if (!this.gameState.includeNegatives && this.gameState.minNumber < 1) {
            alert('Para usar números negativos, activa la opción "Incluir números negativos"');
            return;
        }

        // Activar contexto de audio (requerido por navegadores modernos)
        this.resumeAudioContext();

        // Generate random numbers
        this.generateNumbers();

        // Initialize game state
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.currentNumberIndex = 0;
        this.gameState.currentCountdown = this.gameState.interval / 1000;

        // Update UI
        this.showPanel('game');
        this.updateGameInfo();
        this.startNumberSequence();
    }

    generateNumbers() {
        this.gameState.numbers = [];
        this.gameState.correctAnswer = 0;

        for (let i = 0; i < this.gameState.totalNumbers; i++) {
            const number = Math.floor(Math.random() * (this.gameState.maxNumber - this.gameState.minNumber + 1)) + this.gameState.minNumber;
            this.gameState.numbers.push(number);
            this.gameState.correctAnswer += number;
        }
    }

    startNumberSequence() {
        if (this.gameState.currentNumberIndex >= this.gameState.totalNumbers) {
            this.endGame();
            return;
        }

        // Show current number
        const currentNumber = this.gameState.numbers[this.gameState.currentNumberIndex];
        this.elements.displayNumber.textContent = currentNumber;

        // Reproducir pitido cuando aparece el número
        this.playBeep();

        // Update progress and info
        this.updateGameInfo();
        this.updateProgress();

        // Start countdown
        this.gameState.currentCountdown = this.gameState.interval / 1000;
        this.startCountdown();

        // Schedule next number
        this.gameState.gameTimer = setTimeout(() => {
            if (this.gameState.isPlaying && !this.gameState.isPaused) {
                this.gameState.currentNumberIndex++;
                this.startNumberSequence();
            }
        }, this.gameState.interval);
    }

    startCountdown() {
        this.updateCountdownDisplay();
        
        this.gameState.countdownTimer = setInterval(() => {
            if (!this.gameState.isPaused) {
                this.gameState.currentCountdown--;
                this.updateCountdownDisplay();

                if (this.gameState.currentCountdown <= 0) {
                    clearInterval(this.gameState.countdownTimer);
                }
            }
        }, 1000);
    }

    updateCountdownDisplay() {
        this.elements.countdownSpan.textContent = Math.max(0, this.gameState.currentCountdown);
    }

    updateGameInfo() {
        this.elements.currentNumberSpan.textContent = this.gameState.currentNumberIndex + 1;
        this.elements.totalNumbersSpan.textContent = this.gameState.totalNumbers;
    }

    updateProgress() {
        const progress = ((this.gameState.currentNumberIndex + 1) / this.gameState.totalNumbers) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }

    pauseGame() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;

        this.gameState.isPaused = true;
        this.elements.pauseOverlay.style.display = 'flex';

        // Clear timers
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
        }
    }

    resumeGame() {
        if (!this.gameState.isPlaying || !this.gameState.isPaused) return;

        this.gameState.isPaused = false;
        this.elements.pauseOverlay.style.display = 'none';

        // Resume countdown and game timer
        this.startCountdown();
        
        const remainingTime = this.gameState.currentCountdown * 1000;
        this.gameState.gameTimer = setTimeout(() => {
            if (this.gameState.isPlaying && !this.gameState.isPaused) {
                this.gameState.currentNumberIndex++;
                this.startNumberSequence();
            }
        }, remainingTime);
    }

    stopGame() {
        this.gameState.isPlaying = false;
        this.gameState.isPaused = false;

        // Clear timers
        if (this.gameState.gameTimer) {
            clearTimeout(this.gameState.gameTimer);
        }
        if (this.gameState.countdownTimer) {
            clearInterval(this.gameState.countdownTimer);
        }

        // Hide pause overlay if visible
        this.elements.pauseOverlay.style.display = 'none';

        // Show results
        this.endGame();
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
        // Show numbers
        this.elements.numbersList.innerHTML = '';
        this.gameState.numbers.forEach(number => {
            const numberItem = document.createElement('span');
            numberItem.className = 'number-item';
            numberItem.textContent = number;
            this.elements.numbersList.appendChild(numberItem);
        });

        // Show calculation
        const calculation = this.gameState.numbers.join(' + ') + ' = ?';
        this.elements.calculationDisplay.textContent = calculation;

        // Reset result display
        this.elements.resultDisplay.style.display = 'none';
        this.elements.userAnswerInput.value = '';
        this.elements.userAnswerInput.focus();
    }

    revealAnswer() {
        const userAnswer = parseInt(this.elements.userAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            alert('Por favor ingresa un número válido');
            return;
        }

        this.gameState.userAnswer = userAnswer;

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

        // Start new game with same configuration
        this.startGame();
    }

    newConfiguration() {
        // Reset reveal button
        this.elements.revealBtn.disabled = false;
        this.elements.revealBtn.textContent = '🎯 Revelar Respuesta';

        // Show setup panel
        this.showPanel('setup');
    }

    showPanel(panelName) {
        // Hide all panels
        this.elements.setupPanel.style.display = 'none';
        this.elements.gamePanel.style.display = 'none';
        this.elements.resultsPanel.style.display = 'none';

        // Show selected panel
        switch (panelName) {
            case 'setup':
                this.elements.setupPanel.style.display = 'flex';
                break;
            case 'game':
                this.elements.gamePanel.style.display = 'block';
                break;
            case 'results':
                this.elements.resultsPanel.style.display = 'flex';
                break;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MatematicasRapidas();
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

// Store game instance globally for debugging and utility functions
window.matematicasRapidas = null;
document.addEventListener('DOMContentLoaded', () => {
    window.matematicasRapidas = new MatematicasRapidas();
}); 