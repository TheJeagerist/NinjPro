document.addEventListener('DOMContentLoaded', function() {
    // Elementos principales
    const fileInput = document.getElementById('word-counter-file-input');
    const uploadArea = document.getElementById('word-counter-upload-area');
    const textContent = document.getElementById('text-content');
    const wordCount = document.getElementById('word-count');
    const errorCount = document.getElementById('error-count');
    const errorPercentage = document.getElementById('error-percentage');
    const finalTime = document.getElementById('final-time');
    const statusText = document.getElementById('status-text');
    
    // Modal elements
    const contentModal = document.getElementById('content-modal');
    const closeModal = document.getElementById('close-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Verificar elementos esenciales
    if (!fileInput || !uploadArea || !textContent) {
        console.error('❌ Elementos esenciales del contador de palabras no encontrados');
        return;
    }

    console.log('✅ Contador de palabras inicializado correctamente');

    // Variables globales para el cronómetro
    let timerInterval = null;
    let startTime = null;
    let elapsedTime = 0;
    let isRunning = false;

    // Datos de sesión
    let sessionData = {
        fileName: '',
        startTime: null,
        endTime: null,
        totalWords: 0,
        selectedWords: 0,
        errors: 0,
        accuracy: 100,
        duration: 0,
        wpm: 0
    };

    // Inicializar componentes
    initWordCounter();
    initTimer();
    initExport();
    initModal();
    initCourseSelectors();
    
    // Configurar botón de guardar sesión
    setupSaveButton();

    // Inicializar contador
    function initWordCounter() {
        resetAllCounters();
        updateStatus('Haz clic en "Ver Contenido" para cargar un archivo');
        console.log('📊 Contador de palabras inicializado');
    }

    // Inicializar modal
    function initModal() {
        if (closeModal) {
            closeModal.addEventListener('click', hideModal);
        }
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', hideModal);
        }
        
        // Cerrar modal al hacer click fuera
        if (contentModal) {
            contentModal.addEventListener('click', function(e) {
                if (e.target === contentModal) {
                    hideModal();
                }
            });
        }
    }

    // Inicializar selectores de curso y estudiante
    function initCourseSelectors() {
        const courseSelect = document.getElementById('course-select');
        const studentSelect = document.getElementById('student-select');
        const refreshBtn = document.getElementById('refresh-courses');
        
        if (!courseSelect || !studentSelect) {
            console.log('⚠️ Selectores de curso no encontrados');
            return;
        }
        
        console.log('✅ Inicializando selectores de curso y estudiante');
        
        // Cargar cursos al inicializar
        loadCourses();
        
        // Event listener para cambio de curso
        courseSelect.addEventListener('change', function() {
            const selectedCourse = this.value;
            loadStudents(selectedCourse);
            
            // Actualizar datos de sesión
            if (selectedCourse) {
                sessionData.course = selectedCourse;
                console.log('📚 Curso seleccionado:', selectedCourse);
            }
            
            // Actualizar título del modal
            updateModalTitle();
        });
        
        // Event listener para cambio de estudiante
        studentSelect.addEventListener('change', function() {
            const selectedStudent = this.value;
            if (selectedStudent) {
                sessionData.student = selectedStudent;
                console.log('👤 Estudiante seleccionado:', selectedStudent);
                
                // Actualizar título del modal
                updateModalTitle();
            }
        });
        
        // Event listener para botón de actualizar
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                console.log('🔄 Actualizando lista de cursos...');
                
                // Guardar selecciones actuales
                const currentCourse = courseSelect.value;
                const currentStudent = studentSelect.value;
                
                // Recargar cursos
                loadCourses();
                
                // Intentar restaurar selecciones si aún existen
                setTimeout(() => {
                    if (currentCourse && courseSelect.querySelector(`option[value="${currentCourse}"]`)) {
                        courseSelect.value = currentCourse;
                        loadStudents(currentCourse);
                        
                        setTimeout(() => {
                            if (currentStudent && studentSelect.querySelector(`option[value="${currentStudent}"]`)) {
                                studentSelect.value = currentStudent;
                            }
                        }, 100);
                    }
                }, 100);
                
                // Feedback visual
                refreshBtn.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    refreshBtn.style.transform = '';
                }, 300);
                
                console.log('✅ Lista de cursos actualizada');
            });
        }
    }
    
    // Cargar cursos desde localStorage
    function loadCourses() {
        const courseSelect = document.getElementById('course-select');
        if (!courseSelect) return;
        
        try {
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const cursos = Object.keys(cursosData);
            
            // Limpiar opciones existentes
            courseSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
            
            if (cursos.length === 0) {
                courseSelect.innerHTML = '<option value="">No hay cursos cargados</option>';
                courseSelect.disabled = true;
                console.log('⚠️ No hay cursos disponibles');
                return;
            }
            
            courseSelect.disabled = false;
            
            // Agregar opciones de cursos
            cursos.forEach(curso => {
                const estudiantes = cursosData[curso];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = curso;
                option.textContent = `${curso} (${cantidadEstudiantes} estudiantes)`;
                courseSelect.appendChild(option);
            });
            
            console.log('✅ Cursos cargados:', cursos.length);
            
        } catch (error) {
            console.error('❌ Error al cargar cursos:', error);
            courseSelect.innerHTML = '<option value="">Error al cargar cursos</option>';
            courseSelect.disabled = true;
        }
    }
    
    // Cargar estudiantes del curso seleccionado
    function loadStudents(curso) {
        const studentSelect = document.getElementById('student-select');
        if (!studentSelect) return;
        
        if (!curso) {
            studentSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            studentSelect.disabled = true;
            return;
        }
        
        try {
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const estudiantes = cursosData[curso] || [];
            
            // Limpiar opciones existentes
            studentSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
            
            if (estudiantes.length === 0) {
                studentSelect.innerHTML = '<option value="">No hay estudiantes en este curso</option>';
                studentSelect.disabled = true;
                console.log('⚠️ No hay estudiantes en el curso:', curso);
            return;
        }

            studentSelect.disabled = false;
            
            // Agregar opciones de estudiantes
            estudiantes.forEach((estudiante, index) => {
                const option = document.createElement('option');
                option.value = estudiante.nombre;
                option.textContent = `${index + 1}. ${estudiante.nombre}`;
                if (estudiante.id) {
                    option.textContent += ` (ID: ${estudiante.id})`;
                }
                studentSelect.appendChild(option);
            });
            
            console.log('✅ Estudiantes cargados para', curso + ':', estudiantes.length);
            
        } catch (error) {
            console.error('❌ Error al cargar estudiantes:', error);
            studentSelect.innerHTML = '<option value="">Error al cargar estudiantes</option>';
            studentSelect.disabled = true;
        }
    }
    
    // Función para configurar el botón de guardar sesión
    function setupSaveButton() {
        const saveSessionModalBtn = document.getElementById('save-session-modal');
        if (saveSessionModalBtn) {
            console.log('✅ Configurando botón guardar sesión');
            saveSessionModalBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Click en botón guardar sesión detectado');
                saveSession();
                return false;
            };
            console.log('✅ Event listener del botón guardar sesión configurado con onclick');
        } else {
            console.error('❌ Botón save-session-modal no encontrado');
        }
    }

    // Mostrar modal
    function showModal() {
        if (contentModal) {
            // Si no hay contenido cargado, mostrar mensaje de carga
            if (sessionData.totalWords === 0) {
                showEmptyModal();
            }
            contentModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Asegurar que el botón de guardar sesión esté configurado
            setTimeout(setupSaveButton, 50);
        }
    }

    // Mostrar modal vacío para cargar archivo
    function showEmptyModal() {
        if (textContent) {
            textContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 20px; opacity: 0.7;">📄</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">No hay contenido cargado</h3>
                    <p style="margin-bottom: 24px; line-height: 1.6;">
                        Carga un archivo de texto (.txt) para comenzar a usar el contador de palabras.
                    </p>
                    <div class="empty-upload-area" onclick="document.getElementById('word-counter-file-input').click()" 
                         style="
                            cursor: pointer;
                            border: 2px dashed var(--border-color);
                            border-radius: 12px;
                            padding: 24px;
                            background: var(--input-bg);
                            transition: all 0.2s ease;
                            margin: 0 auto;
                            max-width: 300px;
                         "
                         onmouseover="this.style.borderColor='var(--primary-color)'; this.style.background='var(--button-hover)'"
                         onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--input-bg)'">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📁</div>
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Seleccionar Archivo</div>
                        <div style="font-size: 0.85rem;">Haz clic aquí para cargar un archivo .txt</div>
                    </div>
                </div>
            `;
        }
    }

    // Ocultar modal
    function hideModal() {
        if (contentModal) {
            contentModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Actualizar estado
    function updateStatus(message) {
        if (statusText) {
            statusText.textContent = message;
        }
    }

    // Resetear todos los contadores
    function resetAllCounters() {
        if (wordCount) wordCount.textContent = '0';
        if (errorCount) errorCount.textContent = '0';
        if (errorPercentage) {
            errorPercentage.textContent = '100%';
            errorPercentage.classList.remove('error', 'success');
        }
        if (finalTime) finalTime.textContent = '00:00.0';
        
        // Limpiar selecciones en el texto
        if (textContent) {
        const spans = textContent.querySelectorAll('span');
        spans.forEach(span => {
            span.classList.remove('selected', 'mispronounced');
                // Limpiar estilos inline también
                span.style.backgroundColor = '';
                span.style.color = '';
            });
        }
        
        // Deshabilitar botones al inicio (excepto Ver Contenido)
        const viewContentBtn = document.getElementById('view-content');
        const exportBtn = document.getElementById('export-excel');
        const saveSessionModalBtn = document.getElementById('save-session-modal');
        
        // Ver Contenido siempre disponible
        if (viewContentBtn) viewContentBtn.disabled = false;
        if (exportBtn) exportBtn.disabled = true;
        if (saveSessionModalBtn) saveSessionModalBtn.disabled = true;
    }

    // Manejar carga de archivos
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    uploadArea.addEventListener('click', function() {
        fileInput.click();
        });
        
    // Procesar archivo
    function handleFile(file) {
        const fileName = file.name.toLowerCase();
        
        // Guardar nombre del archivo en sessionData
        sessionData.fileName = file.name;
        
        // Actualizar UI de carga
        const uploadTitle = uploadArea.querySelector('.upload-title');
        const uploadSubtitle = uploadArea.querySelector('.upload-subtitle');
        
        if (uploadTitle && uploadSubtitle) {
            uploadTitle.textContent = file.name;
            uploadSubtitle.textContent = 'Archivo cargado correctamente';
            uploadArea.classList.add('file-loaded');
        }

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                displayText(e.target.result);
                updateStatus('Archivo cargado - Presiona el cronómetro para comenzar');
            };
            reader.readAsText(file);
        } else if (fileName.endsWith('.docx')) {
            // Aquí necesitarías una librería como mammoth.js para procesar DOCX
            updateStatus('Formato DOCX no soportado actualmente');
            alert('La funcionalidad de DOCX requiere la librería mammoth.js');
        } else {
            updateStatus('Formato de archivo no soportado');
            alert('Formato de archivo no soportado. Use .txt o .docx');
        }
    }

    // Mostrar texto en pantalla
    function displayText(text) {
        const words = text.split(/\s+/).filter(word => word.trim().length > 0);
        textContent.innerHTML = '';
        
        if (words.length === 0) {
            textContent.innerHTML = `
                <p style="color: var(--text-secondary); text-align: center; margin: 60px 0; font-style: italic;">
                    El archivo está vacío o no contiene texto válido.
                </p>
            `;
            return;
        }
        
        // Crear contenedor para el texto
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            line-height: 1.8;
            font-size: 1rem;
            text-align: justify;
            margin-bottom: 20px;
        `;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.dataset.index = index;
            span.style.cssText = `
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            `;
            
            // Event listener para click izquierdo (seleccionar hasta esa palabra)
            span.addEventListener('click', function() {
                selectWordsUpTo(index);
            });
            
            // Event listener para click del botón de la rueda (marcar como mal pronunciada)
            span.addEventListener('mousedown', function(e) {
                if (e.button === 1) { // Botón de la rueda
                    e.preventDefault();
                    toggleMispronounced(this);
                }
            });
            
            // Prevenir el comportamiento por defecto del botón de la rueda
            span.addEventListener('auxclick', function(e) {
                if (e.button === 1) {
                    e.preventDefault();
                }
            });
            
            // Hover effects
            span.addEventListener('mouseenter', function() {
                if (!this.classList.contains('selected') && !this.classList.contains('mispronounced')) {
                    this.style.backgroundColor = 'var(--button-hover)';
                }
            });
            
            span.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected') && !this.classList.contains('mispronounced')) {
                    this.style.backgroundColor = '';
                }
            });
            
            textContainer.appendChild(span);
        });
        
        // Agregar instrucciones
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            margin-top: 24px;
            padding: 16px;
            background: var(--accent-color);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 0.85rem;
            line-height: 1.5;
        `;
        instructions.innerHTML = `
            <strong style="color: var(--text-primary);">📖 Instrucciones:</strong><br>
            • <strong>Click izquierdo</strong> en una palabra para seleccionar hasta esa posición<br>
            • <strong>Click con rueda del mouse</strong> para marcar errores de pronunciación<br>
            • Las palabras seleccionadas aparecen en <span style="color: var(--success-color); font-weight: 600;">verde</span><br>
            • Los errores aparecen en <span style="color: var(--error-color); font-weight: 600;">rojo</span>
        `;
        
        textContent.appendChild(textContainer);
        textContent.appendChild(instructions);
        
        // Actualizar sessionData
        sessionData.totalWords = words.length;
        
        // Habilitar botones
        const viewContentBtn = document.getElementById('view-content');
        const saveSessionModalBtn = document.getElementById('save-session-modal');
        if (viewContentBtn) {
            viewContentBtn.disabled = false;
        }
        if (saveSessionModalBtn) {
            saveSessionModalBtn.disabled = false;
        }
        
        resetAllCounters();
        showModal(); // Mostrar el modal con el contenido
        console.log(`📄 Texto cargado: ${words.length} palabras`);
    }

    // Seleccionar palabras desde la primera hasta el índice especificado
    function selectWordsUpTo(index) {
        const spans = textContent.querySelectorAll('span[data-index]');
        
        spans.forEach((span, i) => {
            if (i <= index) {
                span.classList.add('selected');
                span.style.backgroundColor = 'var(--success-color)';
                span.style.color = 'white';
                // No remover la clase mispronounced si ya la tiene
            } else {
                span.classList.remove('selected');
                if (!span.classList.contains('mispronounced')) {
                    span.style.backgroundColor = '';
                    span.style.color = '';
                }
                }
            });

        updateStats();
    }

    // Alternar palabra como mal pronunciada
    function toggleMispronounced(element) {
        element.classList.toggle('mispronounced');
        
        if (element.classList.contains('mispronounced')) {
            element.classList.add('selected');
            element.style.backgroundColor = 'var(--error-color)';
            element.style.color = 'white';
        } else {
            if (element.classList.contains('selected')) {
                element.style.backgroundColor = 'var(--success-color)';
                element.style.color = 'white';
            } else {
                element.style.backgroundColor = '';
                element.style.color = '';
            }
        }
        updateStats();
    }

    // Actualizar estadísticas
    function updateStats() {
        const selectedSpans = textContent.querySelectorAll('span.selected');
        const mispronuncedSpans = textContent.querySelectorAll('span.mispronounced');
        
        const selectedCount = selectedSpans.length;
        const errorCount_val = mispronuncedSpans.length;
        const accuracy = selectedCount > 0 ? Math.round(((selectedCount - errorCount_val) / selectedCount) * 100) : 100;
        
        // Actualizar UI
        if (wordCount) wordCount.textContent = selectedCount.toString();
        if (errorCount) errorCount.textContent = errorCount_val.toString();
        if (errorPercentage) {
            errorPercentage.textContent = accuracy + '%';
            errorPercentage.classList.remove('error', 'success');
            if (accuracy >= 90) {
                errorPercentage.classList.add('success');
            } else if (accuracy < 70) {
                errorPercentage.classList.add('error');
            }
        }
        
        // Actualizar sessionData
        sessionData.selectedWords = selectedCount;
        sessionData.errors = errorCount_val;
        sessionData.accuracy = accuracy;
        
        updateSessionData();
        console.log(`📊 Stats: ${selectedCount} palabras, ${errorCount_val} errores, ${accuracy}% precisión`);
    }

    // Inicializar cronómetro
    function initTimer() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');
        const timerDisplay = document.getElementById('timer-display');

        if (!startBtn || !pauseBtn || !resetBtn || !timerDisplay) {
            console.warn('⚠️ Elementos del cronómetro no encontrados');
            return;
        }

        // Event listeners
        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);

        // Control con teclado (barra espaciadora)
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                if (isRunning) {
                    pauseTimer();
        } else {
                    startTimer();
                }
            }
        });

        console.log('⏱️ Cronómetro inicializado');
    }

    // Inicializar exportación
    function initExport() {
        const exportBtn = document.getElementById('export-excel');
        const viewContentBtn = document.getElementById('view-content');

        if (exportBtn) {
            exportBtn.addEventListener('click', exportToExcel);
        }

        if (viewContentBtn) {
            viewContentBtn.addEventListener('click', function() {
                showModal();
            });
        }

        console.log('📊 Funciones de exportación inicializadas');
    }

    // Iniciar cronómetro
    function startTimer() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const exportBtn = document.getElementById('export-excel');
        const saveSessionModalBtn = document.getElementById('save-session-modal');
        const modalTimerDisplay = document.querySelector('.modal-timer-display');

        if (!isRunning) {
            startTime = Date.now() - elapsedTime;
            sessionData.startTime = new Date();
            
            timerInterval = setInterval(updateTimerDisplay, 100);
            isRunning = true;

            // Actualizar UI
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.querySelector('.btn-text').textContent = 'Corriendo...';
            }
            if (pauseBtn) pauseBtn.disabled = false;
            if (exportBtn) exportBtn.disabled = false;
            if (saveSessionModalBtn) saveSessionModalBtn.disabled = false;
            if (modalTimerDisplay) modalTimerDisplay.classList.add('timer-running');

            updateStatus('Cronómetro iniciado - Selecciona palabras mientras lees');
            console.log('▶️ Cronómetro iniciado');
        }
    }

    // Pausar cronómetro
    function pauseTimer() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const modalTimerDisplay = document.querySelector('.modal-timer-display');

        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;

            // Actualizar UI
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.querySelector('.btn-text').textContent = 'Continuar';
            }
            if (pauseBtn) pauseBtn.disabled = true;
            if (modalTimerDisplay) modalTimerDisplay.classList.remove('timer-running');

            updateStatus('Cronómetro pausado - Presiona Iniciar para continuar');
            console.log('⏸️ Cronómetro pausado');
        }
    }

    // Reiniciar cronómetro
    function resetTimer() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const exportBtn = document.getElementById('export-excel');
        const saveSessionModalBtn = document.getElementById('save-session-modal');
        const viewContentBtn = document.getElementById('view-content');
        const timerDisplay = document.getElementById('timer-display');
        const modalTimerDisplay = document.querySelector('.modal-timer-display');

        clearInterval(timerInterval);
        isRunning = false;
        elapsedTime = 0;
        startTime = null;

        // Actualizar UI
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.querySelector('.btn-text').textContent = 'Iniciar';
        }
        if (pauseBtn) pauseBtn.disabled = true;
        if (exportBtn) exportBtn.disabled = true;
        if (saveSessionModalBtn) saveSessionModalBtn.disabled = true;
        // El botón de ver contenido siempre permanece habilitado
        if (viewContentBtn) {
            viewContentBtn.disabled = false;
        }
        if (timerDisplay) timerDisplay.textContent = '00:00.0';
        if (finalTime) finalTime.textContent = '00:00.0';
        if (modalTimerDisplay) modalTimerDisplay.classList.remove('timer-running');

        // Resetear sessionData
        sessionData.startTime = null;
        sessionData.endTime = null;
        sessionData.duration = 0;
        sessionData.wpm = 0;

        updateStatus('Cronómetro reiniciado - Listo para comenzar');
        console.log('🔄 Cronómetro reiniciado');
    }

    // Actualizar display del cronómetro
    function updateTimerDisplay() {
        if (startTime) {
            elapsedTime = Date.now() - startTime;
            const timerDisplay = document.getElementById('timer-display');
            
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(elapsedTime);
            }
            
            updateFinalTime();
            updateSessionData();
        }
    }

    // Actualizar tiempo final en stats
    function updateFinalTime() {
        if (finalTime) {
            finalTime.textContent = formatTime(elapsedTime);
        }
    }

    // Formatear tiempo
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const deciseconds = Math.floor((ms % 1000) / 100);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${deciseconds}`;
    }

    // Guardar sesión
    function saveSession() {
        console.log('🔍 Función saveSession iniciada');
        
        try {
            // Actualizar datos de sesión
            sessionData.endTime = new Date();
            sessionData.duration = elapsedTime;
            
            // Obtener datos de curso y estudiante seleccionados
            const courseSelect = document.getElementById('course-select');
            const studentSelect = document.getElementById('student-select');
            
            if (courseSelect && courseSelect.value) {
                sessionData.course = courseSelect.value;
            }
            if (studentSelect && studentSelect.value) {
                sessionData.student = studentSelect.value;
            }
            
            // Validar que hay datos para guardar
            if (sessionData.totalWords === 0) {
                alert('⚠️ No hay contenido cargado para guardar');
                console.warn('⚠️ Intento de guardar sesión sin contenido');
                return;
            }
            
            // Obtener sesiones existentes
            const sessions = JSON.parse(localStorage.getItem('wordCounterSessions') || '[]');
            
            // Crear nueva sesión
            const newSession = {
                ...sessionData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            };
            
            sessions.push(newSession);
            
            // Guardar en localStorage
            localStorage.setItem('wordCounterSessions', JSON.stringify(sessions));
            
            // Feedback visual
            updateStatus('✅ Sesión guardada correctamente');
            
            // Crear mensaje de confirmación con información del curso y estudiante
            let confirmMessage = `✅ Sesión guardada correctamente!\n\nArchivo: ${sessionData.fileName}`;
            if (sessionData.course) {
                confirmMessage += `\nCurso: ${sessionData.course}`;
            }
            if (sessionData.student) {
                confirmMessage += `\nEstudiante: ${sessionData.student}`;
            }
            confirmMessage += `\nPalabras: ${sessionData.selectedWords}\nPrecisión: ${sessionData.accuracy}%\nTiempo: ${formatTime(sessionData.duration)}`;
            
            // Mostrar alerta de confirmación
            alert(confirmMessage);
            
            console.log('💾 Sesión guardada exitosamente:', newSession);
            
            // Verificar si hay más estudiantes para continuar automáticamente
            const shouldContinue = checkAndConfirmNextStudent();
            if (shouldContinue) {
                // Reiniciar cronómetro y pasar al siguiente estudiante
                resetTimerAndNextStudent();
            }
            
        } catch (error) {
            console.error('❌ Error al guardar sesión:', error);
            alert('❌ Error al guardar la sesión. Revisa la consola para más detalles.');
            updateStatus('❌ Error al guardar sesión');
        }
    }

    // Verificar y confirmar si continuar con el siguiente estudiante
    function checkAndConfirmNextStudent() {
        const studentSelect = document.getElementById('student-select');
        const courseSelect = document.getElementById('course-select');
        
        if (!studentSelect || !courseSelect || !courseSelect.value) {
            return false;
        }
        
        const currentIndex = studentSelect.selectedIndex;
        const totalStudents = studentSelect.options.length - 1;
        
        // Si solo hay un estudiante, no hay siguiente
        if (totalStudents <= 1) {
            return false;
        }
        
        let nextStudentName = '';
        let isRestart = false;
        
        if (currentIndex < totalStudents) {
            // Hay siguiente estudiante
            nextStudentName = studentSelect.options[currentIndex + 1].text;
        } else {
            // Es el último, volvería al primero
            nextStudentName = studentSelect.options[1].text;
            isRestart = true;
        }
        
        const message = isRestart 
            ? `🔄 Has completado la lista de estudiantes.\n\n¿Quieres reiniciar con el primer estudiante?\n\nSiguiente: ${nextStudentName}`
            : `➡️ ¿Continuar con el siguiente estudiante?\n\nSiguiente: ${nextStudentName}`;
        
        return confirm(message);
    }

    // Reiniciar cronómetro y pasar al siguiente estudiante
    function resetTimerAndNextStudent() {
        console.log('🔄 Iniciando proceso de reinicio y cambio de estudiante...');
        
        // 1. Resetear selecciones de palabras y contadores PRIMERO
        resetWordSelections();
        
        // 2. Reiniciar el cronómetro
        resetTimer();
        
        // 3. Pasar al siguiente estudiante
        moveToNextStudent();
        
        // 4. Actualizar estado final
        updateStatus('✅ Sesión guardada - Listo para el siguiente estudiante');
        
        console.log('✅ Proceso completo: cronómetro reiniciado, contadores reseteados y siguiente estudiante seleccionado');
    }
    
    // Pasar al siguiente estudiante en la lista
    function moveToNextStudent() {
        const studentSelect = document.getElementById('student-select');
        const courseSelect = document.getElementById('course-select');
        
        if (!studentSelect || !courseSelect || !courseSelect.value) {
            console.log('⚠️ No hay curso seleccionado para avanzar al siguiente estudiante');
            return;
        }
        
        const currentStudentIndex = studentSelect.selectedIndex;
        const totalOptions = studentSelect.options.length;
        
        // Si hay más estudiantes después del actual (excluyendo la primera opción que es el placeholder)
        if (currentStudentIndex < totalOptions - 1) {
            // Pasar al siguiente estudiante
            studentSelect.selectedIndex = currentStudentIndex + 1;
            
            // Actualizar datos de sesión
            const selectedStudent = studentSelect.value;
            if (selectedStudent) {
                sessionData.student = selectedStudent;
                console.log('👤 Siguiente estudiante seleccionado:', selectedStudent);
                
                // Mostrar notificación visual
                showStudentChangeNotification(selectedStudent);
            }
        } else {
            // Si era el último estudiante, volver al primero (después del placeholder)
            if (totalOptions > 1) {
                studentSelect.selectedIndex = 1; // Índice 1 es el primer estudiante real
                const selectedStudent = studentSelect.value;
                if (selectedStudent) {
                    sessionData.student = selectedStudent;
                    console.log('🔄 Volviendo al primer estudiante:', selectedStudent);
                    
                    // Mostrar notificación de reinicio de lista
                    showStudentChangeNotification(selectedStudent, true);
                }
            } else {
                console.log('⚠️ No hay estudiantes disponibles');
                studentSelect.selectedIndex = 0; // Volver al placeholder
                sessionData.student = '';
            }
        }
    }
    
    // Mostrar notificación visual del cambio de estudiante
    function showStudentChangeNotification(studentName, isRestart = false) {
        const statusText = document.getElementById('status-text');
        const studentSelect = document.getElementById('student-select');
        
        if (statusText) {
            const message = isRestart 
                ? `🔄 Lista completada - Reiniciando con: ${studentName}`
                : `➡️ Siguiente estudiante: ${studentName}`;
            
            statusText.textContent = message;
            statusText.style.color = 'var(--success-color)';
            statusText.style.fontWeight = '600';
            
            // Restaurar estilo normal después de 3 segundos
            setTimeout(() => {
                statusText.style.color = '';
                statusText.style.fontWeight = '';
            }, 3000);
        }
        
        // Actualizar título del modal con progreso
        updateModalTitle();
    }
    
    // Actualizar título del modal con información de progreso
    function updateModalTitle() {
        const modalTitle = document.querySelector('.modal-header h3');
        const studentSelect = document.getElementById('student-select');
        const courseSelect = document.getElementById('course-select');
        
        if (modalTitle && studentSelect && courseSelect) {
            const currentIndex = studentSelect.selectedIndex;
            const totalStudents = studentSelect.options.length - 1; // -1 para excluir el placeholder
            const courseName = courseSelect.value;
            const studentName = studentSelect.value;
            
            if (courseName && studentName && currentIndex > 0) {
                modalTitle.textContent = `Panel de Lectura - ${courseName} (${currentIndex}/${totalStudents})`;
            } else {
                modalTitle.textContent = 'Panel de Lectura';
            }
        }
        
        // Actualizar texto del botón de guardar sesión
        updateSaveButtonText();
    }
    
    // Actualizar texto del botón de guardar sesión
    function updateSaveButtonText() {
        const saveBtn = document.getElementById('save-session-modal');
        const studentSelect = document.getElementById('student-select');
        
        if (saveBtn && studentSelect) {
            const currentIndex = studentSelect.selectedIndex;
            const totalStudents = studentSelect.options.length - 1;
            
            if (currentIndex > 0 && totalStudents > 1) {
                if (currentIndex < totalStudents) {
                    // Hay más estudiantes después
                    saveBtn.innerHTML = '💾 Guardar y Siguiente';
                } else {
                    // Es el último estudiante
                    saveBtn.innerHTML = '💾 Guardar y Reiniciar';
                }
            } else {
                // Solo un estudiante o ninguno seleccionado
                saveBtn.innerHTML = '💾 Guardar Sesión';
            }
        }
    }
    
    // Resetear selecciones de palabras
    function resetWordSelections() {
        console.log('🔄 Iniciando reseteo de selecciones de palabras...');
        
        // Limpiar selecciones visuales en el texto de forma agresiva
        if (textContent) {
            const spans = textContent.querySelectorAll('span');
            spans.forEach(span => {
                // Remover todas las clases CSS
                span.classList.remove('selected', 'mispronounced');
                
                // Limpiar todos los estilos inline de forma agresiva
                span.style.backgroundColor = '';
                span.style.color = '';
                span.style.removeProperty('background-color');
                span.style.removeProperty('color');
                
                // Asegurar que no queden atributos de estilo
                if (span.style.length === 0) {
                    span.removeAttribute('style');
                }
            });
            console.log(`✅ Limpiadas ${spans.length} selecciones visuales (clases y estilos) de forma agresiva`);
            
            // Verificación adicional - contar palabras que aún tienen clases
            const stillSelected = textContent.querySelectorAll('span.selected, span.mispronounced');
            if (stillSelected.length > 0) {
                console.warn(`⚠️ Aún quedan ${stillSelected.length} palabras con clases. Limpiando de nuevo...`);
                stillSelected.forEach(span => {
                    span.className = '';
                    span.removeAttribute('style');
                });
            }
        }
        
        // Resetear contadores en sessionData
        sessionData.selectedWords = 0;
        sessionData.errors = 0;
        sessionData.accuracy = 100;
        
        // Actualizar contadores visuales en la interfaz con efecto visual
        if (wordCount) {
            wordCount.style.color = 'var(--success-color)';
            wordCount.style.fontWeight = 'bold';
            wordCount.textContent = '0';
            setTimeout(() => {
                wordCount.style.color = '';
                wordCount.style.fontWeight = '';
            }, 2000);
        }
        if (errorCount) {
            errorCount.style.color = 'var(--success-color)';
            errorCount.style.fontWeight = 'bold';
            errorCount.textContent = '0';
            setTimeout(() => {
                errorCount.style.color = '';
                errorCount.style.fontWeight = '';
            }, 2000);
        }
        if (errorPercentage) {
            errorPercentage.style.color = 'var(--success-color)';
            errorPercentage.style.fontWeight = 'bold';
            errorPercentage.textContent = '100%';
            errorPercentage.classList.remove('error');
            errorPercentage.classList.add('success');
            setTimeout(() => {
                errorPercentage.style.color = '';
                errorPercentage.style.fontWeight = '';
            }, 2000);
        }
        
        // Actualizar estadísticas completas
        updateStats();
        
        console.log('✅ Selecciones de palabras y contadores reseteados completamente');
        console.log('📊 Estado actual:', {
            selectedWords: sessionData.selectedWords,
            errors: sessionData.errors,
            accuracy: sessionData.accuracy
        });
        
        // Verificación final del estado visual
        setTimeout(() => {
            verifyResetComplete();
        }, 100);
    }

    // Verificar que el reseteo se completó correctamente
    function verifyResetComplete() {
        if (!textContent) return;
        
        const selectedSpans = textContent.querySelectorAll('span.selected');
        const mispronuncedSpans = textContent.querySelectorAll('span.mispronounced');
        const styledSpans = textContent.querySelectorAll('span[style*="background"], span[style*="color"]');
        
        console.log('🔍 Verificación de reseteo:');
        console.log(`   - Spans con clase 'selected': ${selectedSpans.length}`);
        console.log(`   - Spans con clase 'mispronounced': ${mispronuncedSpans.length}`);
        console.log(`   - Spans con estilos inline: ${styledSpans.length}`);
        
        if (selectedSpans.length === 0 && mispronuncedSpans.length === 0 && styledSpans.length === 0) {
            console.log('✅ Verificación exitosa: Todas las palabras están limpias');
        } else {
            console.warn('⚠️ Verificación falló: Aún hay palabras marcadas');
            
            // Limpieza de emergencia
            [...selectedSpans, ...mispronuncedSpans, ...styledSpans].forEach(span => {
                span.className = '';
                span.removeAttribute('style');
            });
            
            console.log('🚨 Limpieza de emergencia aplicada');
        }
    }

    // Exportar a Excel
    function exportToExcel() {
        if (typeof XLSX === 'undefined') {
            alert('Librería XLSX no disponible');
            return;
        }

        const data = [
            ['Reporte de Contador de Palabras'],
            [''],
            ['Archivo:', sessionData.fileName],
            ['Fecha:', new Date().toLocaleDateString()],
            ['Hora:', new Date().toLocaleTimeString()],
            [''],
            ['=== INFORMACIÓN DEL ESTUDIANTE ==='],
            ['Curso:', sessionData.course || 'No especificado'],
            ['Estudiante:', sessionData.student || 'No especificado'],
            [''],
            ['=== ESTADÍSTICAS ==='],
            ['Total de palabras:', sessionData.totalWords],
            ['Palabras seleccionadas:', sessionData.selectedWords],
            ['Errores de pronunciación:', sessionData.errors],
            ['Precisión:', sessionData.accuracy + '%'],
            ['Tiempo transcurrido:', formatTime(sessionData.duration)],
            ['Palabras por minuto:', calculateWPM()],
            [''],
            ['=== ANÁLISIS DE RENDIMIENTO ==='],
            ['Velocidad de lectura:', calculateWPM() > 200 ? 'Excelente' : calculateWPM() > 150 ? 'Buena' : 'Regular'],
            ['Nivel de precisión:', sessionData.accuracy >= 95 ? 'Excelente' : sessionData.accuracy >= 85 ? 'Buena' : 'Necesita mejorar'],
            ['Recomendación:', sessionData.accuracy < 85 ? 'Practicar más la pronunciación' : 'Continuar con el buen trabajo']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

        const fileName = `contador_palabras_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        updateStatus('Reporte exportado a Excel correctamente');
        console.log('📊 Reporte exportado:', fileName);
    }

    // Actualizar datos de sesión
    function updateSessionData() {
        sessionData.duration = elapsedTime;
        sessionData.wpm = calculateWPM();
    }

    // Calcular palabras por minuto
    function calculateWPM() {
        if (elapsedTime === 0 || sessionData.selectedWords === 0) return 0;
        const minutes = elapsedTime / (1000 * 60);
        return Math.round(sessionData.selectedWords / minutes);
    }
}); 