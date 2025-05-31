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
    const studentsExcel = document.getElementById('students-excel');
    const downloadTemplateBtn = document.getElementById('download-template');
    const loadStudentsBtn = document.getElementById('load-students');
    const studentSelect = document.getElementById('student-select');
    const saveProgressBtn = document.getElementById('save-progress');
    const exportResultsBtn = document.getElementById('export-results');
    const currentStudentName = document.getElementById('current-student-name');
    const currentStudentInfo = document.getElementById('current-student-info');

    // Verificar que todos los elementos necesarios existen
    const requiredElements = {
        fileInput, uploadArea, textContent, wordCount, mispronounced, 
        errorPercentage, closeButton, panel, studentsExcel, downloadTemplateBtn,
        loadStudentsBtn, studentSelect, saveProgressBtn, exportResultsBtn, 
        currentStudentName, currentStudentInfo
    };

    // Verificar si algún elemento falta
    const missingElements = Object.entries(requiredElements)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error('Elementos faltantes:', missingElements);
        return; // Detener la ejecución si faltan elementos
    }

    // Datos de estudiantes
    let studentsData = [];
    let currentStudent = null;

    // Variables del timer
    let timer = null;
    let startTime = 0;
    let elapsed = 0;
    let timerRunning = false;
    let timerDisplay = null;
    
    // Función para inicializar el timer
    function initTimer() {
        if (!panel || timerDisplay) return; // Evitar inicialización duplicada
        
        // Crear contenedor del timer
        const timerContainer = document.createElement('div');
        timerContainer.style.display = 'inline-flex';
        timerContainer.style.alignItems = 'center';
        timerContainer.style.marginLeft = '15px';
        timerContainer.style.padding = '4px 12px';
        timerContainer.style.borderRadius = '15px';
        timerContainer.style.backgroundColor = '#f0f0f0';
        timerContainer.style.transition = 'all 0.3s ease';
        
        // Crear indicador de estado
        const statusDot = document.createElement('span');
        statusDot.style.width = '8px';
        statusDot.style.height = '8px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = '#888';
        statusDot.style.marginRight = '8px';
        statusDot.style.transition = 'background-color 0.3s ease';
        
        // Crear display del timer
        timerDisplay = document.createElement('span');
        timerDisplay.id = 'timer-display';
        timerDisplay.style.fontFamily = 'monospace';
        timerDisplay.style.color = '#333';
        timerDisplay.textContent = '0.0s';
        
        // Ensamblar elementos
        timerContainer.appendChild(statusDot);
        timerContainer.appendChild(timerDisplay);
        
        const statsDiv = panel.querySelector('.word-counter-stats p');
        if (statsDiv) {
            statsDiv.appendChild(document.createTextNode(' | '));
            statsDiv.appendChild(timerContainer);
        }

        // Actualizar estado visual cuando el timer cambia
        function updateTimerState() {
            if (timerRunning) {
                statusDot.style.backgroundColor = '#4CAF50';
                timerContainer.style.backgroundColor = '#e8f5e9';
            } else if (elapsed > 0) {
                statusDot.style.backgroundColor = '#FFA000';
                timerContainer.style.backgroundColor = '#fff3e0';
            } else {
                statusDot.style.backgroundColor = '#888';
                timerContainer.style.backgroundColor = '#f0f0f0';
            }
        }

        // Modificar las funciones existentes para actualizar el estado visual
        const originalStartTimer = startTimer;
        startTimer = function() {
            originalStartTimer();
            updateTimerState();
        };

        const originalStopTimer = stopTimer;
        stopTimer = function() {
            originalStopTimer();
            updateTimerState();
        };

        const originalResetTimer = resetTimer;
        resetTimer = function() {
            originalResetTimer();
            updateTimerState();
        };
    }

    function updateTimerDisplay() {
        if (timerDisplay) {
            const minutes = Math.floor(elapsed / 60000);
            const seconds = ((elapsed % 60000) / 1000).toFixed(1);
            timerDisplay.textContent = minutes > 0 ? 
                `${minutes}m ${seconds}s` : 
                `${seconds}s`;
        }
    }

    // Inicializar el timer después de verificar los elementos
    if (!missingElements.length) {
        initTimer();
    }

    function startTimer() {
        if (!timerRunning) {
            startTime = Date.now() - elapsed;
            timer = setInterval(() => {
                elapsed = Date.now() - startTime;
                updateTimerDisplay();
            }, 100);
            timerRunning = true;
        }
    }

    function stopTimer() {
        if (timerRunning) {
            clearInterval(timer);
            timerRunning = false;
            updateTimerDisplay();
        }
    }

    function resetTimer() {
        stopTimer();
        elapsed = 0;
        updateTimerDisplay();
    }

    // Controlar el timer con la barra espaciadora
    document.addEventListener('keydown', function(e) {
        if (panel.style.display !== 'none' && e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            if (timerRunning) {
                stopTimer();
            } else {
                startTimer();
            }
        }
    });

    // Resetear timer al cambiar de estudiante o cargar texto
    function resetAllCounters() {
        wordCount.textContent = '0';
        mispronounced.textContent = '0';
        errorPercentage.textContent = '0%';
        resetTimer();
    }

    // --- FIN TIMER ---

    // Función para descargar la plantilla
    downloadTemplateBtn.addEventListener('click', () => {
        // Crear un nuevo libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Crear los datos de ejemplo
        const exampleData = [
            ['Nombre del Estudiante', 'Tiempo (s)'], // Encabezado
            ['Juan Pérez', ''],           // Ejemplo 1
            ['María García', ''],         // Ejemplo 2
            ['Carlos Rodríguez', '']      // Ejemplo 3
        ];
        
        // Crear una hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(exampleData);
        
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Lista de Estudiantes');
        
        // Generar el archivo y descargarlo
        XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
    });

    // Prevenir el comportamiento por defecto del botón del medio
    document.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // botón del medio
            e.preventDefault();
        }
    });

    // Manejar el arrastrar y soltar
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#1976d2';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // Manejar la selección de archivo
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Cerrar panel
    closeButton.addEventListener('click', () => {
        panel.style.display = 'none';
        const menuWordCounter = document.getElementById('menu-word-counter');
        if (menuWordCounter) {
            menuWordCounter.classList.remove('active');
        }
    });

    // Evento para cargar lista de estudiantes
    loadStudentsBtn.addEventListener('click', () => {
        studentsExcel.click();
    });

    // Función para leer el archivo Excel
    async function readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    // Filtrar filas vacías y omitir la primera fila (encabezado)
                    const validData = jsonData
                        .slice(1) // Omitir la primera fila
                        .filter(row => row.length > 0 && row[0]); // Asegurarse de que la fila tiene datos
                    
                    if (validData.length === 0) {
                        reject(new Error('No se encontraron estudiantes en el archivo'));
                        return;
                    }
                    
                    resolve(validData);
                } catch (error) {
                    reject(new Error('Error al procesar el archivo Excel: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsArrayBuffer(file);
        });
    }

    studentsExcel.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await readExcelFile(file);
                studentsData = data.map(row => ({
                    nombre: row[0],
                    resultados: []
                }));
                
                // Actualizar el selector de estudiantes
                updateStudentSelect();
                
                // Habilitar el selector y botones
                studentSelect.disabled = false;
                saveProgressBtn.disabled = false;
                exportResultsBtn.disabled = false;

                // Mostrar mensaje de éxito
                alert(`Se cargaron ${studentsData.length} estudiantes exitosamente`);
            } catch (error) {
                console.error('Error al cargar el archivo:', error);
                alert('Error al cargar el archivo: ' + error.message);
            }
        }
    });

    // Evento para seleccionar estudiante
    studentSelect.addEventListener('change', () => {
        const selectedValue = studentSelect.value;
        
        // Si hay un estudiante actual, guardar su progreso antes de cambiar
        if (currentStudent) {
            const resultado = {
                fecha: new Date().toLocaleString(),
                palabrasSeleccionadas: parseInt(wordCount.textContent) || 0,
                palabrasMalPronunciadas: parseInt(mispronounced.textContent) || 0,
                porcentajeErrores: parseFloat(errorPercentage.textContent) || 0,
                tiempo: (elapsed / 1000).toFixed(1)
            };
            currentStudent.resultados.push(resultado);
        }
        
        // Actualizar al nuevo estudiante
        if (selectedValue) {
            currentStudent = studentsData.find(s => s.nombre === selectedValue);
            currentStudentName.textContent = currentStudent.nombre;
            currentStudentInfo.style.display = 'block';
            saveProgressBtn.disabled = false;
            resetAllCounters();
            
            // Limpiar las selecciones de palabras si hay texto cargado
            if (textContent.innerHTML) {
                const spans = textContent.getElementsByTagName('span');
                Array.from(spans).forEach(span => {
                    span.classList.remove('selected', 'double-clicked');
                });
            }
        } else {
            currentStudent = null;
            currentStudentInfo.style.display = 'none';
            saveProgressBtn.disabled = true;
            resetAllCounters();
        }
    });

    // Evento para guardar progreso
    saveProgressBtn.addEventListener('click', () => {
        if (currentStudent) {
            const resultado = {
                fecha: new Date().toLocaleString(),
                palabrasSeleccionadas: parseInt(wordCount.textContent) || 0,
                palabrasMalPronunciadas: parseInt(mispronounced.textContent) || 0,
                porcentajeErrores: parseFloat(errorPercentage.textContent) || 0,
                tiempo: (elapsed / 1000).toFixed(1)
            };
            
            currentStudent.resultados.push(resultado);
            alert('Progreso guardado para ' + currentStudent.nombre);
            resetTimer();
        }
    });

    // Evento para exportar resultados
    exportResultsBtn.addEventListener('click', () => {
        const wb = XLSX.utils.book_new();
        
        // Crear un objeto para almacenar el último resultado de cada estudiante
        const ultimosResultados = {};
        
        // Iterar sobre los datos y mantener solo el último resultado de cada estudiante
        studentsData.forEach(student => {
            if (student.resultados.length > 0) {
                // Tomar el último resultado del estudiante
                const ultimoResultado = student.resultados[student.resultados.length - 1];
                ultimosResultados[student.nombre] = {
                    'Nombre': student.nombre,
                    'Fecha': ultimoResultado.fecha,
                    'Palabras Seleccionadas': ultimoResultado.palabrasSeleccionadas,
                    'Palabras Mal Pronunciadas': ultimoResultado.palabrasMalPronunciadas,
                    'Porcentaje de Errores': ultimoResultado.porcentajeErrores + '%',
                    'Tiempo (s)': ultimoResultado.tiempo
                };
            }
        });
        
        // Convertir el objeto de últimos resultados a un array
        const data = Object.values(ultimosResultados);

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Resultados");
        
        // Guardar archivo
        XLSX.writeFile(wb, 'resultados_pronunciacion.xlsx');
    });

    function handleFile(file) {
        if (!file) return;

        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                alert('El procesamiento de archivos .docx requiere una biblioteca adicional. Por favor, usa archivos .txt por ahora.');
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                displayText(text);
            };
            reader.readAsText(file);
        } else {
            alert('Por favor, sube un archivo .docx o .txt');
        }
    }

    function updateStats() {
        const totalWords = textContent.getElementsByTagName('span').length;
        const mispronounceCount = textContent.getElementsByClassName('double-clicked').length;
        const percentage = totalWords > 0 ? ((mispronounceCount / totalWords) * 100).toFixed(1) : 0;
        
        mispronounced.textContent = mispronounceCount;
        errorPercentage.textContent = `${percentage}%`;
    }

    function toggleMispronounced(element) {
        element.classList.toggle('double-clicked');
        updateStats();
    }

    function displayText(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        textContent.innerHTML = words
            .map((word, index) => `<span data-index="${index}">${word}</span>`)
            .join(' ');

        const spans = textContent.getElementsByTagName('span');
        Array.from(spans).forEach(span => {
            let lastClickTime = 0;

            span.addEventListener('click', function(e) {
                const currentTime = new Date().getTime();
                const index = parseInt(this.dataset.index);

                if (currentTime - lastClickTime < 300) {
                    toggleMispronounced(this);
                } else {
                    Array.from(spans).forEach(s => {
                        const sIndex = parseInt(s.dataset.index);
                        if (sIndex <= index) {
                            s.classList.add('selected');
                        } else {
                            s.classList.remove('selected');
                        }
                    });
                    wordCount.textContent = index + 1;
                }

                lastClickTime = currentTime;
            });

            span.addEventListener('mousedown', function(e) {
                if (e.button === 1) {
                    e.preventDefault();
                    toggleMispronounced(this);
                }
            });
        });

        updateStats();
    }

    // Función para actualizar el selector de estudiantes
    function updateStudentSelect() {
        studentSelect.innerHTML = '<option value="">Seleccionar estudiante</option>';
        studentsData.forEach(student => {
            const option = document.createElement('option');
            option.value = student.nombre;
            option.textContent = student.nombre;
            studentSelect.appendChild(option);
        });
    }
}); 