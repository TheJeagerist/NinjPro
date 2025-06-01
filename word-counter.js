document.addEventListener('DOMContentLoaded', function() {
    // Elementos principales
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const textContent = document.getElementById('text-content');
    const wordCount = document.getElementById('word-count');
    const mispronounced = document.getElementById('mispronounced-count');
    const errorPercentage = document.getElementById('error-percentage');
    const closeButton = document.getElementById('close-word-counter');
    const panel = document.getElementById('word-counter-panel');

    // Elementos del panel de estudiantes
    const courseSelect = document.getElementById('course-select');
    const studentSelect = document.getElementById('student-select');
    const currentCourseName = document.getElementById('current-course-name');
    const currentStudentName = document.getElementById('current-student-name');
    const currentStudentInfo = document.getElementById('current-student-info');
    const studentReadingsCount = document.getElementById('student-readings-count');

    // Elementos del timer
    const startTimerBtn = document.getElementById('start-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerDisplay = document.getElementById('timer-display');

    // Elementos de guardado y exportación
    const saveReadingBtn = document.getElementById('save-reading-data');
    const exportReadingsBtn = document.getElementById('export-readings');

    // Variables del timer
    let timer = null;
    let startTime = 0;
    let elapsed = 0;
    let timerRunning = false;
    
    // Variables de datos
    let currentCourse = null;
    let currentStudent = null;
    let readingsData = JSON.parse(localStorage.getItem('readingsData') || '{}');

    // Inicializar cuando se abre el panel
    function initWordCounter() {
        loadCoursesFromConfig();
        updateUI();
    }

    // Cargar cursos desde los datos de configuración
    function loadCoursesFromConfig() {
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const courses = Object.keys(cursosData);
        
        // Llenar el selector de cursos
        courseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = `${course} (${cursosData[course].length} estudiantes)`;
            courseSelect.appendChild(option);
        });

        // Habilitar selector de cursos si hay cursos
        courseSelect.disabled = courses.length === 0;
        
        if (courses.length === 0) {
            courseSelect.innerHTML = '<option value="">No hay cursos cargados - Ve a Ajustes</option>';
            studentSelect.innerHTML = '<option value="">No hay cursos disponibles</option>';
        } else {
            studentSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
        }
        
        // Resetear selección de estudiantes
        studentSelect.disabled = true;
        currentCourse = null;
        currentStudent = null;
    }

    // Cargar estudiantes de un curso específico
    function loadStudentsFromCourse(courseName) {
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const students = cursosData[courseName] || [];
        
        // Llenar el selector de estudiantes
        studentSelect.innerHTML = '<option value="">Seleccionar estudiante</option>';
        students.forEach((estudiante, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = estudiante.nombre || estudiante;
            studentSelect.appendChild(option);
        });

        // Habilitar selector de estudiantes
        studentSelect.disabled = students.length === 0;
        
        if (students.length === 0) {
            studentSelect.innerHTML = '<option value="">No hay estudiantes en este curso</option>';
        }
    }

    // Actualizar interfaz de usuario
    function updateUI() {
        const hasStudent = currentStudent !== null;
        const hasText = textContent.textContent.trim().length > 0;
        const canSave = hasStudent && hasText && (elapsed > 0 || getSelectedWords() > 0);

        // Habilitar/deshabilitar controles del timer
        startTimerBtn.disabled = !hasStudent || !hasText;
        stopTimerBtn.disabled = !hasStudent || !hasText;
        resetTimerBtn.disabled = !hasStudent || !hasText;

        // Habilitar/deshabilitar botón de guardar
        saveReadingBtn.disabled = !canSave;

        // Habilitar/deshabilitar botón de exportar
        exportReadingsBtn.disabled = Object.keys(readingsData).length === 0;

        // Mostrar/ocultar información del estudiante
        if (currentStudent && currentCourse) {
            currentStudentInfo.style.display = 'block';
            currentCourseName.textContent = currentCourse;
            currentStudentName.textContent = currentStudent.nombre;
            const readings = readingsData[currentStudent.id] || [];
            studentReadingsCount.textContent = readings.length;
            } else {
            currentStudentInfo.style.display = 'none';
        }
    }

    // Funciones del timer
    function updateTimerDisplay() {
            const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = Math.floor((elapsed % 1000) / 100);
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
    }

    function startTimer() {
        if (!timerRunning) {
            startTime = Date.now() - elapsed;
            timer = setInterval(() => {
                elapsed = Date.now() - startTime;
                updateTimerDisplay();
            }, 100);
            timerRunning = true;
            startTimerBtn.textContent = '▶ Corriendo...';
            startTimerBtn.disabled = true;
            stopTimerBtn.disabled = false;
        }
    }

    function stopTimer() {
        if (timerRunning) {
            clearInterval(timer);
            timerRunning = false;
            startTimerBtn.textContent = '▶ Continuar';
            startTimerBtn.disabled = false;
            stopTimerBtn.disabled = true;
            updateTimerDisplay();
        }
    }

    function resetTimer() {
        stopTimer();
        elapsed = 0;
        startTimerBtn.textContent = '▶ Iniciar';
        updateTimerDisplay();
        updateUI();
    }

    // Event listeners del timer
    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Control con barra espaciadora
    document.addEventListener('keydown', function(e) {
        if (panel.style.display !== 'none' && e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            if (timerRunning) {
                stopTimer();
            } else if (!startTimerBtn.disabled) {
                startTimer();
            }
        }
    });

    // Selección de curso
    courseSelect.addEventListener('change', function() {
        const selectedCourse = this.value;
        currentCourse = selectedCourse;
        currentStudent = null;
        
        if (selectedCourse) {
            loadStudentsFromCourse(selectedCourse);
        } else {
            studentSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            studentSelect.disabled = true;
        }
        
        resetTimer();
        updateUI();
    });

    // Selección de estudiante
    studentSelect.addEventListener('change', function() {
        const selectedIndex = this.value;
        
        if (selectedIndex !== '' && currentCourse) {
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const estudiantes = cursosData[currentCourse] || [];
            const estudiante = estudiantes[parseInt(selectedIndex)];
            
            if (estudiante) {
                currentStudent = {
                    id: `${currentCourse}_${estudiante.nombre || estudiante}`.replace(/\s+/g, '_'),
                    nombre: estudiante.nombre || estudiante,
                    curso: currentCourse,
                    index: selectedIndex
                };
            }
        } else {
            currentStudent = null;
        }
        
        resetTimer();
        updateUI();
    });

    // Obtener número de palabras seleccionadas
    function getSelectedWords() {
        return parseInt(wordCount.textContent) || 0;
    }

    // Obtener número de palabras mal pronunciadas
    function getMispronounced() {
        return parseInt(mispronounced.textContent) || 0;
    }

    // Obtener porcentaje de errores
    function getErrorPercentage() {
        return parseFloat(errorPercentage.textContent.replace('%', '')) || 0;
    }

    // Guardar datos de lectura
    saveReadingBtn.addEventListener('click', function() {
        if (!currentStudent || !currentCourse) {
            alert('Selecciona un curso y un estudiante primero');
            return;
        }

        const readingData = {
            fecha: new Date().toISOString(),
            fechaLegible: new Date().toLocaleDateString('es-ES'),
            horaLegible: new Date().toLocaleTimeString('es-ES'),
            curso: currentCourse,
            palabrasLeidas: getSelectedWords(),
            palabrasMalPronunciadas: getMispronounced(),
            porcentajeErrores: getErrorPercentage(),
            tiempoSegundos: Math.round(elapsed / 1000 * 10) / 10,
            tiempoFormateado: timerDisplay.textContent,
            textoLeido: textContent.textContent.substring(0, 100) + '...' // Primeros 100 caracteres
        };

        // Inicializar array si no existe
        if (!readingsData[currentStudent.id]) {
            readingsData[currentStudent.id] = [];
        }

        // Agregar nueva lectura
        readingsData[currentStudent.id].push(readingData);

        // Guardar en localStorage
        localStorage.setItem('readingsData', JSON.stringify(readingsData));

        // Resetear counters y timer
        resetAllCounters();
        
        // Actualizar UI
        updateUI();

        alert(`Lectura guardada para ${currentStudent.nombre} del curso ${currentCourse}`);
    });

    // Exportar todos los datos a Excel
    exportReadingsBtn.addEventListener('click', function() {
        if (Object.keys(readingsData).length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const wb = XLSX.utils.book_new();
        const data = [];

        // Encabezados
        data.push([
            'Estudiante',
            'Curso', 
            'Fecha',
            'Hora',
            'Palabras Leídas',
            'Palabras Mal Pronunciadas',
            'Porcentaje de Errores',
            'Tiempo (segundos)',
            'Tiempo Formateado',
            'Texto Leído (muestra)'
        ]);

        // Obtener información de estudiantes
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const studentsInfo = {};
        
        Object.entries(cursosData).forEach(([courseName, students]) => {
            students.forEach((estudiante) => {
                const id = `${courseName}_${estudiante.nombre || estudiante}`.replace(/\s+/g, '_');
                studentsInfo[id] = {
                    nombre: estudiante.nombre || estudiante,
                    curso: courseName
                };
            });
        });

        // Agregar datos de cada estudiante
        Object.entries(readingsData).forEach(([studentId, readings]) => {
            const studentInfo = studentsInfo[studentId] || { nombre: 'Desconocido', curso: 'Desconocido' };
            
            readings.forEach(reading => {
                data.push([
                    studentInfo.nombre,
                    reading.curso || studentInfo.curso,
                    reading.fechaLegible,
                    reading.horaLegible,
                    reading.palabrasLeidas,
                    reading.palabrasMalPronunciadas,
                    reading.porcentajeErrores + '%',
                    reading.tiempoSegundos,
                    reading.tiempoFormateado,
                    reading.textoLeido
                ]);
            });
        });

        // Crear hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 20 }, // Estudiante
            { wch: 15 }, // Curso
            { wch: 12 }, // Fecha
            { wch: 10 }, // Hora
            { wch: 15 }, // Palabras Leídas
            { wch: 20 }, // Palabras Mal Pronunciadas
            { wch: 18 }, // Porcentaje de Errores
            { wch: 15 }, // Tiempo (segundos)
            { wch: 15 }, // Tiempo Formateado
            { wch: 30 }  // Texto Leído
        ];
        ws['!cols'] = colWidths;

        // Agregar hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Lecturas');

        // Generar archivo
        const fileName = `lecturas_estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    });

    // Resetear todos los contadores
    function resetAllCounters() {
        wordCount.textContent = '0';
        mispronounced.textContent = '0';
        errorPercentage.textContent = '0%';
        
        // Limpiar selecciones en el texto
        const spans = textContent.querySelectorAll('span');
        spans.forEach(span => {
            span.classList.remove('selected', 'mispronounced');
        });
        
        resetTimer();
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
        uploadArea.style.backgroundColor = '#f0f0f0';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        uploadArea.style.backgroundColor = '';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
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

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                displayText(e.target.result);
            };
            reader.readAsText(file);
        } else if (fileName.endsWith('.docx')) {
            // Aquí necesitarías una librería como mammoth.js para procesar DOCX
            alert('La funcionalidad de DOCX requiere la librería mammoth.js');
        } else {
            alert('Formato de archivo no soportado. Use .txt o .docx');
        }
    }

    // Mostrar texto en pantalla
    function displayText(text) {
        const words = text.split(/\s+/).filter(word => word.trim().length > 0);
        textContent.innerHTML = '';
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.dataset.index = index;
            
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
            
            textContent.appendChild(span);
        });
        
        resetAllCounters();
        updateUI();
    }

    // Seleccionar palabras desde la primera hasta el índice especificado
    function selectWordsUpTo(index) {
        const spans = textContent.querySelectorAll('span');
        
        spans.forEach((span, i) => {
            if (i <= index) {
                span.classList.add('selected');
                // No remover la clase mispronounced si ya la tiene
            } else {
                span.classList.remove('selected');
            }
        });

        updateStats();
    }

    // Alternar palabra como mal pronunciada
    function toggleMispronounced(element) {
        element.classList.toggle('mispronounced');
        // Si se marca como mal pronunciada, también debe estar seleccionada
        if (element.classList.contains('mispronounced')) {
            element.classList.add('selected');
        }
        updateStats();
    }

    // Actualizar estadísticas
    function updateStats() {
        const selectedSpans = textContent.querySelectorAll('span.selected');
        const mispronuncedSpans = textContent.querySelectorAll('span.mispronounced');
        
        const selectedCount = selectedSpans.length;
        const mispronuncedCount = mispronuncedSpans.length;
        
        wordCount.textContent = selectedCount;
        mispronounced.textContent = mispronuncedCount;
        
        if (selectedCount > 0) {
            const errorRate = (mispronuncedCount / selectedCount * 100).toFixed(1);
            errorPercentage.textContent = errorRate + '%';
        } else {
            errorPercentage.textContent = '0%';
        }
        
        updateUI();
    }

    // Cerrar panel
    closeButton.addEventListener('click', function() {
        panel.style.display = 'none';
        stopTimer();
    });

    // Inicializar cuando se muestre el panel
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (panel.style.display !== 'none' && panel.style.display !== '') {
                    initWordCounter();
                }
            }
        });
    });

    observer.observe(panel, { attributes: true });

    // Inicializar si el panel ya está visible
    if (panel.style.display !== 'none') {
        initWordCounter();
    }
}); 