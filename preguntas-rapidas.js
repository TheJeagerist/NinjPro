// Preguntas Rápidas - JavaScript

class PreguntasRapidas {
    constructor() {
        this.currentPanel = 'menu';
        this.questions = [];
        this.students = [];
        this.selectedStudents = [];
        this.currentQuestionIndex = 0;
        this.currentStudentIndex = 0;
        this.questionTime = 30;
        this.timer = null;
        this.timeLeft = 0;
        this.gameResults = [];
        this.isPaused = false;
        this.currentDeck = null;
        
        this.init();
    }

    init() {
        this.loadStudents();
        this.loadDecks();
        this.setupEventListeners();
        this.setupThemeManager();
        this.showPanel('menu');
    }

    setupEventListeners() {
        // Función helper para agregar event listeners de forma segura
        const addEventListenerSafe = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Elemento no encontrado: ${id}`);
            }
        };

        // Menu principal
        addEventListenerSafe('new-quiz-btn', 'click', () => this.showPanel('setup'));
        addEventListenerSafe('manage-decks-btn', 'click', () => this.showPanel('decks'));
        addEventListenerSafe('manage-students-btn', 'click', () => this.showPanel('students'));
        addEventListenerSafe('play-quiz-btn', 'click', () => this.showPlayQuizDialog());

        // Setup panel
        addEventListenerSafe('excel-file', 'change', (e) => this.handleFileUpload(e));
        addEventListenerSafe('question-time', 'input', (e) => this.updateTimeDisplay(e));
        addEventListenerSafe('select-all-students', 'click', () => this.selectAllStudents());
        addEventListenerSafe('deselect-all-students', 'click', () => this.deselectAllStudents());
        addEventListenerSafe('save-deck-btn', 'click', () => this.saveDeck());
        addEventListenerSafe('start-quiz-btn', 'click', () => this.startQuiz());
        addEventListenerSafe('back-menu-btn', 'click', () => this.showPanel('menu'));

        // Students panel
        addEventListenerSafe('add-student-btn', 'click', () => this.addStudent());
        const newStudentName = document.getElementById('new-student-name');
        if (newStudentName) {
            newStudentName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addStudent();
            });
        }
        addEventListenerSafe('import-from-courses-btn', 'click', () => this.importFromCourses());
        addEventListenerSafe('back-from-students-btn', 'click', () => this.showPanel('menu'));

        // Decks panel
        addEventListenerSafe('back-from-decks-btn', 'click', () => this.showPanel('menu'));

        // Game panel
        addEventListenerSafe('correct-btn', 'click', () => this.answerQuestion(true));
        addEventListenerSafe('incorrect-btn', 'click', () => this.answerQuestion(false));
        addEventListenerSafe('next-question-btn', 'click', () => this.nextQuestion());
        addEventListenerSafe('pause-btn', 'click', () => this.pauseGame());
        addEventListenerSafe('stop-btn', 'click', () => this.stopGame());
        addEventListenerSafe('resume-btn', 'click', () => this.resumeGame());

        // Results panel
        addEventListenerSafe('export-results-btn', 'click', () => this.exportResults());
        addEventListenerSafe('new-quiz-results-btn', 'click', () => this.showPanel('setup'));
        addEventListenerSafe('back-menu-results-btn', 'click', () => this.showPanel('menu'));

        // Modal
        addEventListenerSafe('modal-close', 'click', () => this.hideModal());
        addEventListenerSafe('modal-cancel', 'click', () => this.hideModal());
    }

    setupThemeManager() {
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'theme-dark';
        document.body.className = savedTheme;
        
        // Marcar botón activo
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === savedTheme) {
                btn.classList.add('active');
            }
        });

        // Event listeners para cambio de tema
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.body.className = theme;
                localStorage.setItem('theme', theme);
                
                // Actualizar botón activo
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    showPanel(panelName) {
        // Ocultar todos los paneles
        const panels = ['menu-panel', 'setup-panel', 'decks-panel', 'students-panel', 'game-panel', 'results-panel'];
        panels.forEach(panel => {
            const element = document.getElementById(panel);
            if (element) element.style.display = 'none';
        });

        // Mostrar panel solicitado
        const targetPanel = document.getElementById(`${panelName}-panel`);
        if (targetPanel) {
            targetPanel.style.display = 'flex';
            this.currentPanel = panelName;
        }

        // Acciones específicas por panel
        switch (panelName) {
            case 'setup':
                this.loadStudentsInSetup();
                break;
            case 'students':
                this.renderStudentsManagement();
                break;
            case 'decks':
                this.renderDecks();
                break;
        }
    }

    // Gestión de archivos Excel
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                this.parseQuestions(jsonData);
                this.showFileInfo(file.name, this.questions.length);
            } catch (error) {
                this.showNotification('Error al leer el archivo Excel', 'error');
                console.error('Error:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    parseQuestions(data) {
        this.questions = [];
        // Asumiendo que la primera fila son headers y las siguientes son preguntas
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[0] && row[0].trim()) { // Si hay contenido en la primera columna
                this.questions.push({
                    id: i,
                    text: row[0].trim(),
                    category: row[1] || 'General',
                    difficulty: row[2] || 'Normal'
                });
            }
        }
    }

    showFileInfo(fileName, questionCount) {
        const fileInfo = document.getElementById('file-info');
        fileInfo.innerHTML = `📄 ${fileName} - ${questionCount} preguntas cargadas`;
        fileInfo.style.display = 'block';
    }

    updateTimeDisplay(event) {
        const value = event.target.value;
        document.getElementById('time-display').textContent = value;
        this.questionTime = parseInt(value);
    }

    // Gestión de estudiantes
    loadStudents() {
        const saved = localStorage.getItem('preguntasRapidas_students');
        this.students = saved ? JSON.parse(saved) : [];
    }

    saveStudents() {
        localStorage.setItem('preguntasRapidas_students', JSON.stringify(this.students));
    }

    addStudent() {
        const nameInput = document.getElementById('new-student-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNotification('Por favor ingresa un nombre', 'error');
            return;
        }

        if (this.students.find(s => s.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('Este estudiante ya existe', 'error');
            return;
        }

        this.students.push({
            id: Date.now(),
            name: name,
            addedDate: new Date().toISOString()
        });

        this.saveStudents();
        nameInput.value = '';
        this.renderStudentsManagement();
        this.showNotification('Estudiante agregado correctamente', 'success');
    }

    removeStudent(studentId) {
        this.students = this.students.filter(s => s.id !== studentId);
        this.saveStudents();
        this.renderStudentsManagement();
        this.showNotification('Estudiante eliminado', 'success');
    }

    importFromCourses() {
        // Intentar importar desde gestión de cursos
        try {
            const coursesData = localStorage.getItem('courses');
            if (coursesData) {
                const courses = JSON.parse(coursesData);
                let importedCount = 0;
                
                courses.forEach(course => {
                    if (course.students) {
                        course.students.forEach(student => {
                            if (!this.students.find(s => s.name.toLowerCase() === student.name.toLowerCase())) {
                                this.students.push({
                                    id: Date.now() + Math.random(),
                                    name: student.name,
                                    addedDate: new Date().toISOString(),
                                    importedFrom: course.name
                                });
                                importedCount++;
                            }
                        });
                    }
                });

                if (importedCount > 0) {
                    this.saveStudents();
                    this.renderStudentsManagement();
                    this.showNotification(`${importedCount} estudiantes importados`, 'success');
                } else {
                    this.showNotification('No se encontraron estudiantes nuevos para importar', 'warning');
                }
            } else {
                this.showNotification('No se encontraron datos de gestión de cursos', 'warning');
            }
        } catch (error) {
            this.showNotification('Error al importar estudiantes', 'error');
            console.error('Error:', error);
        }
    }

    renderStudentsManagement() {
        const container = document.getElementById('students-management-list');
        
        if (this.students.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay estudiantes registrados</p>';
            return;
        }

        container.innerHTML = this.students.map(student => `
            <div class="student-item">
                <span class="student-name">${student.name}</span>
                <button class="remove-student-btn" onclick="app.removeStudent(${student.id})">🗑️</button>
            </div>
        `).join('');
    }

    loadStudentsInSetup() {
        const container = document.getElementById('students-list');
        
        if (this.students.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay estudiantes registrados. Ve a "Gestionar Estudiantes" para agregar algunos.</p>';
            return;
        }

        container.innerHTML = this.students.map(student => `
            <label class="student-checkbox">
                <input type="checkbox" value="${student.id}" onchange="app.updateSelectedStudents()">
                <span>${student.name}</span>
            </label>
        `).join('');
    }

    updateSelectedStudents() {
        const checkboxes = document.querySelectorAll('#students-list input[type="checkbox"]');
        this.selectedStudents = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => this.students.find(s => s.id == cb.value));
    }

    selectAllStudents() {
        const checkboxes = document.querySelectorAll('#students-list input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        this.updateSelectedStudents();
    }

    deselectAllStudents() {
        const checkboxes = document.querySelectorAll('#students-list input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        this.updateSelectedStudents();
    }

    // Gestión de mazos
    loadDecks() {
        const saved = localStorage.getItem('preguntasRapidas_decks');
        this.decks = saved ? JSON.parse(saved) : [];
    }

    saveDecks() {
        localStorage.setItem('preguntasRapidas_decks', JSON.stringify(this.decks));
    }

    saveDeck() {
        const deckName = document.getElementById('deck-name').value.trim();
        
        if (!deckName) {
            this.showNotification('Por favor ingresa un nombre para el mazo', 'error');
            return;
        }

        if (this.questions.length === 0) {
            this.showNotification('Por favor carga un archivo Excel con preguntas', 'error');
            return;
        }

        const deck = {
            id: Date.now(),
            name: deckName,
            questions: [...this.questions],
            questionTime: this.questionTime,
            createdDate: new Date().toISOString(),
            questionCount: this.questions.length
        };

        if (!this.decks) this.decks = [];
        this.decks.push(deck);
        this.saveDecks();
        
        this.showNotification('Mazo guardado correctamente', 'success');
        document.getElementById('deck-name').value = '';
    }

    renderDecks() {
        const container = document.getElementById('decks-list');
        
        if (!this.decks || this.decks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay mazos guardados</p>';
            return;
        }

        container.innerHTML = this.decks.map(deck => `
            <div class="deck-item">
                <div class="deck-info">
                    <h3>${deck.name}</h3>
                    <p>${deck.questionCount} preguntas • Creado: ${new Date(deck.createdDate).toLocaleDateString()}</p>
                </div>
                <div class="deck-actions">
                    <button class="deck-btn play-deck-btn" onclick="app.playDeck(${deck.id})">▶️ Jugar</button>
                    <button class="deck-btn edit-deck-btn" onclick="app.editDeck(${deck.id})">✏️ Editar</button>
                    <button class="deck-btn delete-deck-btn" onclick="app.deleteDeck(${deck.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    playDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        this.currentDeck = deck;
        this.questions = [...deck.questions];
        this.questionTime = deck.questionTime;
        
        // Actualizar UI
        document.getElementById('question-time').value = this.questionTime;
        document.getElementById('time-display').textContent = this.questionTime;
        
        this.showPanel('setup');
        this.showNotification(`Mazo "${deck.name}" cargado`, 'success');
    }

    editDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        this.currentDeck = deck;
        this.questions = [...deck.questions];
        this.questionTime = deck.questionTime;
        
        // Cargar datos en el formulario
        document.getElementById('deck-name').value = deck.name;
        document.getElementById('question-time').value = this.questionTime;
        document.getElementById('time-display').textContent = this.questionTime;
        
        this.showFileInfo(`${deck.name}.xlsx`, deck.questionCount);
        this.showPanel('setup');
    }

    deleteDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        this.showModal(
            'Eliminar Mazo',
            `¿Estás seguro de que quieres eliminar el mazo "${deck.name}"?`,
            () => {
                this.decks = this.decks.filter(d => d.id !== deckId);
                this.saveDecks();
                this.renderDecks();
                this.showNotification('Mazo eliminado', 'success');
            }
        );
    }

    showPlayQuizDialog() {
        if (!this.decks || this.decks.length === 0) {
            this.showNotification('No hay mazos guardados. Crea uno primero.', 'warning');
            return;
        }

        // Crear lista de mazos para seleccionar
        const deckOptions = this.decks.map(deck => 
            `<option value="${deck.id}">${deck.name} (${deck.questionCount} preguntas)</option>`
        ).join('');

        this.showModal(
            'Seleccionar Mazo',
            `<div style="margin-bottom: 1rem;">
                <label for="deck-select" style="display: block; margin-bottom: 0.5rem;">Selecciona un mazo:</label>
                <select id="deck-select" style="width: 100%; padding: 0.5rem; border-radius: 0.25rem; border: 1px solid var(--border); background: var(--surface-light); color: var(--text-primary);">
                    ${deckOptions}
                </select>
            </div>`,
            () => {
                const selectedDeckId = parseInt(document.getElementById('deck-select').value);
                this.playDeck(selectedDeckId);
            }
        );
    }

    // Lógica del juego
    startQuiz() {
        if (this.questions.length === 0) {
            this.showNotification('Por favor carga preguntas desde un archivo Excel', 'error');
            return;
        }

        if (this.selectedStudents.length === 0) {
            this.showNotification('Por favor selecciona al menos un estudiante', 'error');
            return;
        }

        // Mezclar preguntas y estudiantes
        this.questions = this.shuffleArray([...this.questions]);
        this.selectedStudents = this.shuffleArray([...this.selectedStudents]);

        // Inicializar variables del juego
        this.currentQuestionIndex = 0;
        this.currentStudentIndex = 0;
        this.gameResults = [];
        this.isPaused = false;

        this.showPanel('game');
        this.startQuestion();
    }

    startQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const student = this.selectedStudents[this.currentStudentIndex % this.selectedStudents.length];

        // Actualizar UI
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.questions.length;
        document.getElementById('current-student').textContent = student.name;
        document.getElementById('question-text').textContent = question.text;

        // Actualizar barra de progreso
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        // Ocultar sección de respuesta
        document.getElementById('answer-section').style.display = 'none';

        // Iniciar temporizador
        this.timeLeft = this.questionTime;
        this.updateCountdown();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateCountdown();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateCountdown() {
        document.getElementById('countdown').textContent = this.timeLeft;
        
        // Cambiar color según tiempo restante
        const countdownElement = document.getElementById('countdown');
        if (this.timeLeft <= 5) {
            countdownElement.style.color = 'var(--danger-color)';
        } else if (this.timeLeft <= 10) {
            countdownElement.style.color = 'var(--warning-color)';
        } else {
            countdownElement.style.color = 'var(--primary-color)';
        }
    }

    timeUp() {
        clearInterval(this.timer);
        document.getElementById('answer-section').style.display = 'flex';
        this.showNotification('¡Tiempo agotado! Marca la respuesta del estudiante', 'warning');
    }

    answerQuestion(isCorrect) {
        clearInterval(this.timer);
        
        const question = this.questions[this.currentQuestionIndex];
        const student = this.selectedStudents[this.currentStudentIndex % this.selectedStudents.length];
        
        // Guardar resultado
        this.gameResults.push({
            questionId: question.id,
            questionText: question.text,
            studentId: student.id,
            studentName: student.name,
            isCorrect: isCorrect,
            timeUsed: this.questionTime - this.timeLeft,
            timestamp: new Date().toISOString()
        });

        // Mostrar feedback
        const message = isCorrect ? '✅ Respuesta correcta' : '❌ Respuesta incorrecta';
        this.showNotification(message, isCorrect ? 'success' : 'error');

        // Mostrar botón de siguiente pregunta
        document.getElementById('next-question-btn').style.display = 'block';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.currentStudentIndex++;
        
        document.getElementById('next-question-btn').style.display = 'none';
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
        } else {
            this.startQuestion();
        }
    }

    pauseGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.isPaused = true;
            document.getElementById('pause-overlay').style.display = 'flex';
        }
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-overlay').style.display = 'none';
        
        if (this.timeLeft > 0) {
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateCountdown();
                
                if (this.timeLeft <= 0) {
                    this.timeUp();
                }
            }, 1000);
        }
    }

    stopGame() {
        this.showModal(
            'Detener Cuestionario',
            '¿Estás seguro de que quieres detener el cuestionario? Se perderán los resultados actuales.',
            () => {
                clearInterval(this.timer);
                this.showPanel('menu');
            }
        );
    }

    endQuiz() {
        clearInterval(this.timer);
        this.showResults();
        this.showPanel('results');
    }

    showResults() {
        const totalQuestions = this.gameResults.length;
        const correctAnswers = this.gameResults.filter(r => r.isCorrect).length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

        // Resumen general
        const summaryHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center;">
                <div style="background: var(--success-color); color: white; padding: 1rem; border-radius: 0.5rem;">
                    <div style="font-size: 2rem; font-weight: bold;">${correctAnswers}</div>
                    <div>Correctas</div>
                </div>
                <div style="background: var(--danger-color); color: white; padding: 1rem; border-radius: 0.5rem;">
                    <div style="font-size: 2rem; font-weight: bold;">${incorrectAnswers}</div>
                    <div>Incorrectas</div>
                </div>
                <div style="background: var(--primary-color); color: white; padding: 1rem; border-radius: 0.5rem;">
                    <div style="font-size: 2rem; font-weight: bold;">${accuracy}%</div>
                    <div>Precisión</div>
                </div>
            </div>
        `;

        document.getElementById('results-summary').innerHTML = summaryHtml;

        // Detalles por resultado
        const detailsHtml = this.gameResults.map(result => `
            <div class="student-result ${result.isCorrect ? 'correct' : 'incorrect'}">
                <div>
                    <strong>${result.studentName}</strong><br>
                    <small style="color: var(--text-secondary);">${result.questionText.substring(0, 50)}...</small>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2rem;">${result.isCorrect ? '✅' : '❌'}</div>
                    <small style="color: var(--text-secondary);">${result.timeUsed}s</small>
                </div>
            </div>
        `).join('');

        document.getElementById('results-details').innerHTML = detailsHtml;
    }

    exportResults() {
        if (this.gameResults.length === 0) {
            this.showNotification('No hay resultados para exportar', 'warning');
            return;
        }

        // Crear datos para Excel
        const data = [
            ['Estudiante', 'Pregunta', 'Respuesta', 'Tiempo (s)', 'Fecha/Hora']
        ];

        this.gameResults.forEach(result => {
            data.push([
                result.studentName,
                result.questionText,
                result.isCorrect ? 'Correcta' : 'Incorrecta',
                result.timeUsed,
                new Date(result.timestamp).toLocaleString()
            ]);
        });

        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

        // Descargar archivo
        const fileName = `resultados_preguntas_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.showNotification('Resultados exportados correctamente', 'success');
    }

    // Utilidades
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Agregar estilos de animación si no existen
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showModal(title, message, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').innerHTML = message;
        document.getElementById('modal-overlay').style.display = 'flex';

        // Limpiar event listeners anteriores
        const confirmBtn = document.getElementById('modal-confirm');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Agregar nuevo event listener
        newConfirmBtn.addEventListener('click', () => {
            this.hideModal();
            if (onConfirm) onConfirm();
        });
    }

    hideModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PreguntasRapidas();
});
