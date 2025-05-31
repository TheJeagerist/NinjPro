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

    // Función para descargar la plantilla
    downloadTemplateBtn.addEventListener('click', () => {
        // Crear un nuevo libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Crear los datos de ejemplo
        const exampleData = [
            ['Nombre del Estudiante'], // Encabezado
            ['Juan Pérez'],           // Ejemplo 1
            ['María García'],         // Ejemplo 2
            ['Carlos Rodríguez']      // Ejemplo 3
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
                porcentajeErrores: parseFloat(errorPercentage.textContent) || 0
            };
            currentStudent.resultados.push(resultado);
        }
        
        // Actualizar al nuevo estudiante
        if (selectedValue) {
            currentStudent = studentsData.find(s => s.nombre === selectedValue);
            currentStudentName.textContent = currentStudent.nombre;
            currentStudentInfo.style.display = 'block';
            saveProgressBtn.disabled = false;
            
            // Resetear el contador y las selecciones
            wordCount.textContent = '0';
            mispronounced.textContent = '0';
            errorPercentage.textContent = '0%';
            
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
        }
    });

    // Evento para guardar progreso
    saveProgressBtn.addEventListener('click', () => {
        if (currentStudent) {
            const resultado = {
                fecha: new Date().toLocaleString(),
                palabrasSeleccionadas: parseInt(wordCount.textContent) || 0,
                palabrasMalPronunciadas: parseInt(mispronounced.textContent) || 0,
                porcentajeErrores: parseFloat(errorPercentage.textContent) || 0
            };
            
            currentStudent.resultados.push(resultado);
            alert('Progreso guardado para ' + currentStudent.nombre);
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
                    'Porcentaje de Errores': ultimoResultado.porcentajeErrores + '%'
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