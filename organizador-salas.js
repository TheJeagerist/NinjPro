// Aplicación Unificada: Organizador de Salas
class OrganizadorSalasApp {
    constructor() {
        this.currentModule = 'selection';
        this.organizadorPuestos = null;
        this.gestorSalas = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        console.log('Inicializando Organizador de Salas...');
        this.showSelectionScreen();
        this.checkForData();
    }
    
    checkForData() {
        // Verificar si hay datos de cursos disponibles
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        
        if (Object.keys(cursosData).length === 0) {
            // Mostrar mensaje informativo
            setTimeout(() => {
                const mensaje = `
ℹ️ No hay cursos cargados en el sistema.

Para usar el Organizador de Salas necesitas tener cursos con estudiantes.

Opciones:
1. Ve a "Gestión de Estudiantes" y carga un archivo Excel
2. Usa datos de prueba ejecutando: cargarDatosPrueba() en la consola
3. O haz clic en "Cargar Datos de Prueba" abajo

¿Quieres cargar datos de prueba ahora?`;
                
                if (confirm(mensaje)) {
                    cargarDatosPrueba();
                }
            }, 1000);
        }
    }
    
    showSelectionScreen() {
        this.hideAllModules();
        document.getElementById('selectionScreen').style.display = 'flex';
        this.currentModule = 'selection';
    }
    
    showOrganizadorPuestos() {
        this.hideAllModules();
        document.getElementById('organizadorPuestosContainer').classList.remove('hidden');
        this.currentModule = 'organizador';
        
        // Inicializar organizador de puestos si no existe
        if (!this.organizadorPuestos) {
            this.initializeOrganizadorPuestos();
        }
    }
    
    showGestorSalas() {
        this.hideAllModules();
        document.getElementById('gestorSalasContainer').classList.remove('hidden');
        this.currentModule = 'gestor';
        
        // Inicializar gestor de salas si no existe
        if (!this.gestorSalas) {
            this.initializeGestorSalas();
        }
    }
    
    hideAllModules() {
        document.getElementById('selectionScreen').style.display = 'none';
        document.getElementById('organizadorPuestosContainer').classList.add('hidden');
        document.getElementById('gestorSalasContainer').classList.add('hidden');
    }
    
    initializeOrganizadorPuestos() {
        // Esperar un poco para asegurar que el DOM esté listo
        setTimeout(() => {
            this.organizadorPuestos = new OrganizadorPuestosModule();
        }, 100);
    }
    
    initializeGestorSalas() {
        // Importar y adaptar la funcionalidad del gestor de salas
        this.gestorSalas = new GestorSalasModule();
    }
}

// Módulo del Organizador de Puestos (adaptado)
class OrganizadorPuestosModule {
    constructor() {
        this.students = [];
        this.gridCells = [];
        this.gridColumns = 3;
        this.gridRows = 3;
        this.isDragging = false;
        this.currentDragElement = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGrid();
        this.loadAvailableCourses();
    }
    
    initializeElements() {
        console.log('🔧 Inicializando elementos del organizador de puestos...');
        
        // Elementos específicos del organizador de puestos
        this.studentTextArea = document.getElementById('studentTextArea');
        this.addStudentsBtn = document.getElementById('addStudentsBtn');
        this.studentsList = document.getElementById('studentsList');
        this.studentCount = document.getElementById('studentCount');
        this.clearStudents = document.getElementById('clearStudents');
        this.canvas = document.getElementById('canvas');
        this.gridContainer = document.getElementById('gridContainer');
        this.gridColumnsInput = document.getElementById('gridColumns');
        this.gridRowsInput = document.getElementById('gridRows');
        this.updateGridBtn = document.getElementById('updateGrid');
        this.clearCanvas = document.getElementById('clearCanvas');
        this.saveLayout = document.getElementById('saveLayout');
        this.exportPDF = document.getElementById('exportPDF');
        this.organizePairs = document.getElementById('organizePairs');
        this.organizeTrios = document.getElementById('organizeTrios');
        
        // Elementos de gestión de cursos
        this.courseSelect = document.getElementById('courseSelect');
        this.loadStudentsBtn = document.getElementById('loadStudentsBtn');
        this.refreshCoursesBtn = document.getElementById('refreshCoursesBtn');
        this.courseInfo = document.getElementById('courseInfo');
        this.courseInfoText = document.getElementById('courseInfoText');
        
        // Elementos de métodos de input
        this.loadFromCoursesBtn = document.getElementById('loadFromCoursesBtn');
        this.addManualBtn = document.getElementById('addManualBtn');
        this.addFileBtn = document.getElementById('addFileBtn');
        this.coursesInput = document.getElementById('coursesInput');
        this.manualInput = document.getElementById('manualInput');
        this.fileInput = document.getElementById('fileInput');
        this.fileDropArea = document.getElementById('fileDropArea');
        this.fileInputElement = document.getElementById('fileInputElement');
        
        // Debug: verificar elementos críticos
        const criticalElements = {
            'courseSelect': this.courseSelect,
            'loadStudentsBtn': this.loadStudentsBtn,
            'studentsList': this.studentsList,
            'gridContainer': this.gridContainer,
            'updateGridBtn': this.updateGridBtn
        };
        
        let missingElements = [];
        Object.keys(criticalElements).forEach(key => {
            if (!criticalElements[key]) {
                missingElements.push(key);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('❌ Elementos no encontrados:', missingElements);
        } else {
            console.log('✅ Todos los elementos críticos encontrados');
        }
    }
    
    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Event listeners básicos del organizador de puestos
        if (this.loadFromCoursesBtn) {
            this.loadFromCoursesBtn.addEventListener('click', () => this.switchInputMethod('courses'));
        }
        if (this.addManualBtn) {
            this.addManualBtn.addEventListener('click', () => this.switchInputMethod('manual'));
        }
        if (this.addFileBtn) {
            this.addFileBtn.addEventListener('click', () => this.switchInputMethod('file'));
        }
        
        if (this.courseSelect) {
            this.courseSelect.addEventListener('change', () => this.handleCourseSelection());
        }
        if (this.loadStudentsBtn) {
            this.loadStudentsBtn.addEventListener('click', () => this.loadStudentsFromCourse());
            console.log('✅ Event listener agregado a loadStudentsBtn');
        } else {
            console.error('❌ loadStudentsBtn no encontrado para event listener');
        }
        if (this.refreshCoursesBtn) {
            this.refreshCoursesBtn.addEventListener('click', () => this.refreshCourses());
        }
        
        if (this.addStudentsBtn) {
            this.addStudentsBtn.addEventListener('click', () => this.addStudentsFromText());
        }
        if (this.clearStudents) {
            this.clearStudents.addEventListener('click', () => this.clearStudentsList());
        }
        
        if (this.updateGridBtn) {
            this.updateGridBtn.addEventListener('click', () => this.updateGridLayout());
            console.log('✅ Event listener agregado a updateGridBtn');
        } else {
            console.error('❌ updateGridBtn no encontrado para event listener');
        }
        if (this.clearCanvas) {
            this.clearCanvas.addEventListener('click', () => this.clearCanvasStudents());
        }
        if (this.saveLayout) {
            this.saveLayout.addEventListener('click', () => this.showSaveLayoutModal());
        }
        if (this.exportPDF) {
            this.exportPDF.addEventListener('click', () => this.exportToPDF());
        }
        if (this.organizePairs) {
            this.organizePairs.addEventListener('click', () => this.organizeInGroups(2));
        }
        if (this.organizeTrios) {
            this.organizeTrios.addEventListener('click', () => this.organizeInGroups(3));
        }
        
        // Event listener para drag & drop en la lista de estudiantes
        if (this.studentsList) {
            this.studentsList.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.studentsList.classList.add('drag-over');
            });
            
            this.studentsList.addEventListener('dragleave', (e) => {
                if (!this.studentsList.contains(e.relatedTarget)) {
                    this.studentsList.classList.remove('drag-over');
                }
            });
            
            this.studentsList.addEventListener('drop', (e) => {
                e.preventDefault();
                this.studentsList.classList.remove('drag-over');
                
                const source = e.dataTransfer.getData('source');
                if (source === 'grid') {
                    const cellIndex = parseInt(e.dataTransfer.getData('cellIndex'));
                    this.moveStudentBackToList(cellIndex);
                }
            });
        }
        
        console.log('✅ Event listeners configurados');
    }
    
    // Métodos básicos del organizador de puestos
    switchInputMethod(method) {
        // Resetear botones
        this.loadFromCoursesBtn?.classList.remove('active');
        this.addManualBtn?.classList.remove('active');
        this.addFileBtn?.classList.remove('active');
        
        // Ocultar secciones
        this.coursesInput?.classList.add('hidden');
        this.manualInput?.classList.add('hidden');
        this.fileInput?.classList.add('hidden');
        
        // Mostrar sección apropiada
        if (method === 'courses') {
            this.loadFromCoursesBtn?.classList.add('active');
            this.coursesInput?.classList.remove('hidden');
        } else if (method === 'manual') {
            this.addManualBtn?.classList.add('active');
            this.manualInput?.classList.remove('hidden');
        } else if (method === 'file') {
            this.addFileBtn?.classList.add('active');
            this.fileInput?.classList.remove('hidden');
        }
    }
    
    loadAvailableCourses() {
        if (!this.courseSelect) return;
        
        this.courseSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        try {
            // Cargar cursos desde localStorage (gestión de estudiantes)
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const cursos = Object.keys(cursosData);
            
            if (cursos.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay cursos cargados';
                option.disabled = true;
                this.courseSelect.appendChild(option);
                console.log('⚠️ No hay cursos disponibles en localStorage');
                return;
            }
            
            // Agregar opciones de cursos reales
            cursos.forEach(nombreCurso => {
                const estudiantes = cursosData[nombreCurso] || [];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = nombreCurso;
                option.textContent = `${nombreCurso} (${cantidadEstudiantes} estudiantes)`;
                option.dataset.students = cantidadEstudiantes;
                option.dataset.courseName = nombreCurso;
                this.courseSelect.appendChild(option);
            });
            
            console.log('✅ Cursos cargados en organizador de puestos:', cursos.length);
            
        } catch (error) {
            console.error('❌ Error al cargar cursos:', error);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error al cargar cursos';
            option.disabled = true;
            this.courseSelect.appendChild(option);
        }
    }
    
    handleCourseSelection() {
        if (!this.courseSelect || !this.loadStudentsBtn) return;
        
        if (this.courseSelect.value) {
            this.loadStudentsBtn.disabled = false;
            if (this.courseInfo && this.courseInfoText) {
                const selectedOption = this.courseSelect.selectedOptions[0];
                this.courseInfoText.textContent = selectedOption.textContent;
                this.courseInfo.style.display = 'flex';
            }
        } else {
            this.loadStudentsBtn.disabled = true;
            if (this.courseInfo) {
                this.courseInfo.style.display = 'none';
            }
        }
    }
    
    loadStudentsFromCourse() {
        if (!this.courseSelect || !this.courseSelect.value) {
            console.log('⚠️ No hay curso seleccionado');
            return;
        }
        
        const cursoSeleccionado = this.courseSelect.value;
        
        try {
            // Cargar estudiantes desde localStorage
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const estudiantesDelCurso = cursosData[cursoSeleccionado] || [];
            
            if (estudiantesDelCurso.length === 0) {
                console.log('⚠️ No hay estudiantes en el curso:', cursoSeleccionado);
                alert(`No hay estudiantes cargados en el curso ${cursoSeleccionado}`);
                return;
            }
            
            // Limpiar lista actual de estudiantes
            this.students = [];
            
            // Agregar estudiantes del curso
            estudiantesDelCurso.forEach(estudiante => {
                let nombreEstudiante;
                
                if (typeof estudiante === 'object' && estudiante !== null) {
                    // Es un objeto con propiedades
                    nombreEstudiante = estudiante.nombre || estudiante.Nombre || `Estudiante ${estudiante.id || ''}`;
                } else if (typeof estudiante === 'string') {
                    // Es un string directo
                    nombreEstudiante = estudiante;
                } else {
                    // Fallback
                    nombreEstudiante = `Estudiante ${this.students.length + 1}`;
                }
                
                this.students.push(nombreEstudiante);
            });
            
            // Actualizar la interfaz
            this.renderStudentsList();
            
            // Cargar salas del curso si están disponibles
            this.loadRoomsForCurrentCourse(cursoSeleccionado);
            
            console.log(`✅ Cargados ${this.students.length} estudiantes del curso ${cursoSeleccionado}`);
            
            // Mostrar mensaje de éxito
            if (this.students.length > 0) {
                alert(`✅ Se cargaron ${this.students.length} estudiantes del curso ${cursoSeleccionado}`);
            }
            
        } catch (error) {
            console.error('❌ Error al cargar estudiantes del curso:', error);
            alert('Error al cargar estudiantes del curso');
        }
    }
    
    refreshCourses() {
        console.log('🔄 Actualizando lista de cursos...');
        this.loadAvailableCourses();
        
        // Limpiar selección actual
        if (this.courseSelect) {
            this.courseSelect.value = '';
        }
        if (this.loadStudentsBtn) {
            this.loadStudentsBtn.disabled = true;
        }
        if (this.courseInfo) {
            this.courseInfo.style.display = 'none';
        }
        
        // Ocultar información de salas
        this.hideRoomInfo();
        
        console.log('✅ Lista de cursos actualizada');
    }
    
    addStudentsFromText() {
        if (!this.studentTextArea) return;
        
        const text = this.studentTextArea.value.trim();
        if (!text) return;
        
        const names = text.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        this.students.push(...names);
        this.studentTextArea.value = '';
        this.renderStudentsList();
    }
    
    renderStudentsList() {
        if (!this.studentsList || !this.studentCount) return;
        
        this.studentCount.textContent = this.students.length;
        this.studentsList.innerHTML = '';
        
        this.students.forEach((student, index) => {
            const studentElement = document.createElement('div');
            studentElement.className = 'student-item';
            studentElement.draggable = true;
            
            // Event listeners para drag & drop
            studentElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', student);
                e.dataTransfer.setData('source', 'list');
                studentElement.classList.add('dragging');
            });
            
            studentElement.addEventListener('dragend', () => {
                studentElement.classList.remove('dragging');
            });
            
            studentElement.innerHTML = `
                <span>${student}</span>
                <button class="btn-icon" onclick="organizadorApp.organizadorPuestos.removeStudent(${index})" title="Eliminar estudiante">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.studentsList.appendChild(studentElement);
        });
    }
    
    removeStudent(index) {
        this.students.splice(index, 1);
        this.renderStudentsList();
    }
    
    clearStudentsList() {
        this.students = [];
        this.renderStudentsList();
    }
    
    initializeGrid() {
        this.updateGridLayout();
    }
    
    updateGridLayout() {
        if (!this.gridContainer) return;
        
        this.gridColumns = parseInt(this.gridColumnsInput?.value || 3);
        this.gridRows = parseInt(this.gridRowsInput?.value || 3);
        
        this.createGridCells();
    }
    
    createGridCells() {
        if (!this.gridContainer) {
            console.error('❌ gridContainer no encontrado');
            return;
        }
        
        this.gridContainer.innerHTML = '';
        this.gridContainer.style.gridTemplateColumns = `repeat(${this.gridColumns}, 1fr)`;
        
        const totalCells = this.gridColumns * this.gridRows;
        this.gridCells = [];
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.innerHTML = `<span class="grid-cell-number">${i + 1}</span>`;
            
            // Agregar event listeners para drag & drop
            cell.addEventListener('dragover', (e) => this.handleDragOver(e));
            cell.addEventListener('drop', (e) => this.handleDrop(e, i));
            cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            
            this.gridContainer.appendChild(cell);
            this.gridCells.push({
                element: cell,
                student: null,
                index: i
            });
        }
        

        
        console.log(`✅ Grid creado: ${this.gridColumns}x${this.gridRows} = ${totalCells} celdas`);
    }
    
    // Funciones de drag & drop
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    handleDrop(e, cellIndex) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const studentName = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source');
        const sourceCellIndex = e.dataTransfer.getData('cellIndex');
        
        if (!studentName) return;
        
        const cell = this.gridCells[cellIndex];
        if (!cell || cell.student) return; // Celda ocupada
        
        // Si viene desde otra celda del grid, limpiar la celda original
        if (source === 'grid' && sourceCellIndex !== '') {
            const sourceIndex = parseInt(sourceCellIndex);
            const sourceCell = this.gridCells[sourceIndex];
            if (sourceCell && sourceCell.student === studentName) {
                // Limpiar celda original
                sourceCell.student = null;
                sourceCell.element.classList.remove('occupied');
                const sourceStudentElement = sourceCell.element.querySelector('.grid-student');
                if (sourceStudentElement) {
                    sourceStudentElement.remove();
                }
            }
        } else {
            // Si viene desde la lista, remover de la lista
            const studentIndex = this.students.indexOf(studentName);
            if (studentIndex > -1) {
                this.students.splice(studentIndex, 1);
            }
        }
        
        // Agregar estudiante a la celda destino
        const studentElement = document.createElement('div');
        studentElement.className = 'grid-student';
        studentElement.textContent = studentName;
        studentElement.draggable = true;
        
        // Event listener para drag desde el grid
        studentElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', studentName);
            e.dataTransfer.setData('source', 'grid');
            e.dataTransfer.setData('cellIndex', cellIndex.toString());
            studentElement.classList.add('dragging');
        });
        
        studentElement.addEventListener('dragend', () => {
            studentElement.classList.remove('dragging');
        });
        
        cell.element.appendChild(studentElement);
        cell.student = studentName;
        cell.element.classList.add('occupied');
        
        // Actualizar lista de estudiantes
        this.renderStudentsList();
    }
    
    clearCanvasStudents() {
        this.gridCells.forEach(cell => {
            if (cell.student) {
                this.students.push(cell.student);
                cell.student = null;
                cell.element.classList.remove('occupied');
                const studentElement = cell.element.querySelector('.grid-student');
                if (studentElement) {
                    studentElement.remove();
                }
            }
        });
        this.renderStudentsList();
    }
    
    // Función para mover estudiante del grid de vuelta a la lista
    moveStudentBackToList(cellIndex) {
        const cell = this.gridCells[cellIndex];
        if (!cell || !cell.student) return;
        
        // Agregar estudiante de vuelta a la lista
        this.students.push(cell.student);
        
        // Limpiar celda
        cell.student = null;
        cell.element.classList.remove('occupied');
        const studentElement = cell.element.querySelector('.grid-student');
        if (studentElement) {
            studentElement.remove();
        }
        
        // Actualizar interfaz
        this.renderStudentsList();
    }
    
    loadRoomsForCurrentCourse(cursoId) {
        try {
            // Cargar salas del curso desde localStorage
            const savedRooms = localStorage.getItem(`courseRooms_${cursoId}`);
            
            if (savedRooms) {
                const courseRooms = JSON.parse(savedRooms);
                this.populateRoomSelector(courseRooms);
                this.showRoomInfo();
                console.log(`✅ Salas cargadas para el curso ${cursoId}:`, courseRooms.length);
            } else {
                // No hay salas guardadas, ocultar selector
                this.hideRoomInfo();
                console.log(`ℹ️ No hay salas configuradas para el curso ${cursoId}`);
            }
        } catch (error) {
            console.error('❌ Error al cargar salas del curso:', error);
            this.hideRoomInfo();
        }
    }
    
    populateRoomSelector(rooms) {
        const roomSelect = document.getElementById('roomSelect');
        if (!roomSelect) return;
        
        roomSelect.innerHTML = '<option value="">Seleccionar sala...</option>';
        
        // Ordenar salas por orden
        const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
        
        sortedRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.name} (Capacidad: ${room.capacity})`;
            option.dataset.capacity = room.capacity;
            option.dataset.name = room.name;
            roomSelect.appendChild(option);
        });
        
        // Agregar event listener para cambio de sala
        roomSelect.addEventListener('change', () => this.handleRoomSelection());
    }
    
    handleRoomSelection() {
        const roomSelect = document.getElementById('roomSelect');
        const roomDetails = document.getElementById('roomDetails');
        const roomCapacityText = document.getElementById('roomCapacityText');
        
        if (!roomSelect || !roomDetails || !roomCapacityText) return;
        
        if (roomSelect.value) {
            const selectedOption = roomSelect.selectedOptions[0];
            const capacity = selectedOption.dataset.capacity;
            const roomName = selectedOption.dataset.name;
            
            roomCapacityText.textContent = `${capacity} estudiantes`;
            
            // Verificar si hay más estudiantes que capacidad
            if (this.students.length > parseInt(capacity)) {
                roomCapacityText.style.color = '#dc3545';
                roomCapacityText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${capacity} estudiantes (${this.students.length - capacity} exceden)`;
                
                // Mostrar alerta
                setTimeout(() => {
                    alert(`⚠️ Atención: Hay ${this.students.length} estudiantes pero la sala "${roomName}" solo tiene capacidad para ${capacity}.\n\nConsideración: ${this.students.length - capacity} estudiantes exceden la capacidad.`);
                }, 500);
            } else {
                roomCapacityText.style.color = '#667eea';
                roomCapacityText.innerHTML = `<i class="fas fa-users"></i> ${capacity} estudiantes`;
            }
        } else {
            roomCapacityText.textContent = '-';
            roomCapacityText.style.color = '#667eea';
        }
    }
    
    showRoomInfo() {
        const roomInfoSection = document.getElementById('roomInfoSection');
        if (roomInfoSection) {
            roomInfoSection.style.display = 'flex';
        }
    }
    
    hideRoomInfo() {
        const roomInfoSection = document.getElementById('roomInfoSection');
        if (roomInfoSection) {
            roomInfoSection.style.display = 'none';
        }
    }
    

    
    organizeInGroups(groupSize) {
        console.log(`Organizando en grupos de ${groupSize} con pasillos...`);
        
        if (this.students.length === 0) {
            alert('No hay estudiantes para organizar');
            return;
        }
        
        // Limpiar canvas primero
        this.clearCanvasStudents();
        
        // Calcular el patrón de organización con pasillos
        const studentsToPlace = [...this.students]; // Copia para no modificar el original
        let currentRow = 0;
        let currentCol = 0;
        let studentsInCurrentGroup = 0;
        let placedStudents = 0;
        
        while (studentsToPlace.length > 0 && currentRow < this.gridRows) {
            // Calcular índice de celda actual
            const cellIndex = currentRow * this.gridColumns + currentCol;
            
            if (cellIndex >= this.gridCells.length) break;
            
            const cell = this.gridCells[cellIndex];
            const student = studentsToPlace.shift();
            
            // Crear elemento de estudiante en la celda
            const studentElement = document.createElement('div');
            studentElement.className = 'grid-student';
            studentElement.textContent = student;
            studentElement.draggable = true;
            
            // Event listener para drag desde el grid
            studentElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', student);
                e.dataTransfer.setData('source', 'grid');
                e.dataTransfer.setData('cellIndex', cellIndex.toString());
                studentElement.classList.add('dragging');
            });
            
            studentElement.addEventListener('dragend', () => {
                studentElement.classList.remove('dragging');
            });
            
            cell.element.appendChild(studentElement);
            cell.student = student;
            cell.element.classList.add('occupied');
            
            // Remover estudiante de la lista original
            const originalIndex = this.students.indexOf(student);
            if (originalIndex > -1) {
                this.students.splice(originalIndex, 1);
            }
            
            studentsInCurrentGroup++;
            placedStudents++;
            
            // Avanzar posición
            if (studentsInCurrentGroup === groupSize) {
                // Grupo completo, saltar una columna (pasillo) y continuar
                currentCol += 2; // +1 para la siguiente posición + 1 para el pasillo
                studentsInCurrentGroup = 0;
                
                // Si no cabe el siguiente grupo en esta fila, pasar a la siguiente
                if (currentCol + groupSize > this.gridColumns) {
                    currentRow++;
                    currentCol = 0;
                }
            } else {
                // Continuar en el mismo grupo
                currentCol++;
            }
        }
        
        // Actualizar lista de estudiantes restantes
        this.renderStudentsList();
        
        const groupsFormed = Math.floor(placedStudents / groupSize);
        const remainingStudents = placedStudents % groupSize;
        
        let message = `✅ Organizados ${placedStudents} estudiantes:\n`;
        message += `• ${groupsFormed} grupos completos de ${groupSize}\n`;
        if (remainingStudents > 0) {
            message += `• 1 grupo incompleto de ${remainingStudents}\n`;
        }
        message += `• Pasillos automáticos entre grupos`;
        
        console.log(message);
        
        // Mostrar resumen
        setTimeout(() => {
            alert(message);
        }, 500);
    }
    
    // Funciones para guardar disposición
    showSaveLayoutModal() {
        // Verificar que hay estudiantes organizados
        const studentsInGrid = this.gridCells.filter(cell => cell.student).length;
        if (studentsInGrid === 0) {
            alert('⚠️ No hay estudiantes organizados para guardar');
            return;
        }
        
        // Verificar que hay un curso seleccionado
        if (!this.courseSelect || !this.courseSelect.value) {
            alert('⚠️ Debes seleccionar un curso antes de guardar la disposición');
            return;
        }
        
        const modal = document.getElementById('saveModal');
        const layoutNameInput = document.getElementById('layoutName');
        
        if (modal && layoutNameInput) {
            // Sugerir un nombre por defecto
            const courseName = this.courseSelect.value;
            const currentDate = new Date().toLocaleDateString();
            layoutNameInput.value = `${courseName} - ${currentDate}`;
            
            modal.classList.remove('hidden');
            layoutNameInput.focus();
            layoutNameInput.select();
            
            // Configurar event listeners del modal
            this.setupSaveModalListeners();
        }
    }
    
    setupSaveModalListeners() {
        const modal = document.getElementById('saveModal');
        const confirmSaveBtn = document.getElementById('confirmSave');
        const cancelSaveBtn = document.getElementById('cancelSave');
        const modalClose = modal.querySelector('.modal-close');
        
        // Limpiar event listeners previos
        const newConfirmBtn = confirmSaveBtn.cloneNode(true);
        const newCancelBtn = cancelSaveBtn.cloneNode(true);
        const newCloseBtn = modalClose.cloneNode(true);
        
        confirmSaveBtn.parentNode.replaceChild(newConfirmBtn, confirmSaveBtn);
        cancelSaveBtn.parentNode.replaceChild(newCancelBtn, cancelSaveBtn);
        modalClose.parentNode.replaceChild(newCloseBtn, modalClose);
        
        // Agregar nuevos event listeners
        newConfirmBtn.addEventListener('click', () => this.saveCurrentLayout());
        newCancelBtn.addEventListener('click', () => this.hideSaveLayoutModal());
        newCloseBtn.addEventListener('click', () => this.hideSaveLayoutModal());
        
        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideSaveLayoutModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    hideSaveLayoutModal() {
        const modal = document.getElementById('saveModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    saveCurrentLayout() {
        const layoutNameInput = document.getElementById('layoutName');
        const layoutName = layoutNameInput.value.trim();
        
        if (!layoutName) {
            alert('⚠️ Debes ingresar un nombre para la disposición');
            return;
        }
        
        const courseName = this.courseSelect.value;
        
        // Recopilar datos de la disposición
        const layoutData = {
            id: Date.now().toString(),
            name: layoutName,
            course: courseName,
            createdAt: new Date().toISOString(),
            gridColumns: this.gridColumns,
            gridRows: this.gridRows,
            students: [],
            totalStudents: 0
        };
        
        // Recopilar estudiantes y sus posiciones
        this.gridCells.forEach((cell, index) => {
            if (cell.student) {
                layoutData.students.push({
                    name: cell.student,
                    position: index,
                    row: Math.floor(index / this.gridColumns),
                    column: index % this.gridColumns
                });
            }
        });
        
        layoutData.totalStudents = layoutData.students.length;
        
        // Guardar en localStorage
        try {
            const savedLayouts = JSON.parse(localStorage.getItem('courseLayouts') || '{}');
            
            if (!savedLayouts[courseName]) {
                savedLayouts[courseName] = [];
            }
            
            savedLayouts[courseName].push(layoutData);
            localStorage.setItem('courseLayouts', JSON.stringify(savedLayouts));
            
            console.log('✅ Disposición guardada:', layoutData);
            
            this.hideSaveLayoutModal();
            
            // Mostrar confirmación
            alert(`✅ Disposición "${layoutName}" guardada exitosamente\n\n` +
                  `📊 Detalles:\n` +
                  `• Curso: ${courseName}\n` +
                  `• Estudiantes: ${layoutData.totalStudents}\n` +
                  `• Grid: ${this.gridColumns}x${this.gridRows}\n\n` +
                  `Puedes ver esta disposición desde el Gestor de Salas.`);
            
        } catch (error) {
            console.error('❌ Error al guardar disposición:', error);
            alert('❌ Error al guardar la disposición. Inténtalo de nuevo.');
        }
    }
    
    // Función para exportar a PDF
    async exportToPDF() {
        // Verificar que hay estudiantes organizados
        const studentsInGrid = this.gridCells.filter(cell => cell.student).length;
        if (studentsInGrid === 0) {
            alert('⚠️ No hay estudiantes organizados para exportar');
            return;
        }
        
        // Verificar que las librerías están disponibles
        if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert('❌ Error: Librería jsPDF no disponible. Verifica que el archivo jspdf.umd.min.js esté cargado.');
            return;
        }
        
        if (typeof html2canvas === 'undefined') {
            alert('❌ Error: Librería html2canvas no disponible. Verifica que el archivo html2canvas.min.js esté cargado.');
            return;
        }
        
        // Mostrar mensaje de carga
        const originalText = this.exportPDF.innerHTML;
        this.exportPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
        this.exportPDF.disabled = true;
        
        try {
            
            // Obtener información del curso
            const courseName = this.courseSelect?.value || 'Sin curso';
            const currentDate = new Date().toLocaleDateString('es-ES');
            const currentTime = new Date().toLocaleTimeString('es-ES');
            
            // Crear el PDF
            const jsPDFClass = window.jspdf?.jsPDF || window.jsPDF || jsPDF;
            const pdf = new jsPDFClass('landscape', 'mm', 'a4'); // Formato horizontal
            
            // Configuración del PDF
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            
            // Título principal
            pdf.setFontSize(20);
            pdf.setFont(undefined, 'bold');
            pdf.text('Disposición de Puestos - NinjPro', margin, margin);
            
            // Información del curso
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Curso: ${courseName}`, margin, margin + 15);
            pdf.text(`Fecha: ${currentDate} - ${currentTime}`, margin, margin + 25);
            pdf.text(`Estudiantes: ${studentsInGrid}`, margin, margin + 35);
            pdf.text(`Dimensiones: ${this.gridColumns} columnas × ${this.gridRows} filas`, margin, margin + 45);
            
            // Capturar el grid como imagen
            const gridContainer = document.getElementById('gridContainer');
            if (gridContainer) {
                // Crear una copia temporal del grid para el PDF
                const tempGrid = await this.createPDFGrid();
                document.body.appendChild(tempGrid);
                
                // Capturar la imagen
                const canvas = await html2canvas(tempGrid, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                });
                
                // Remover el grid temporal
                document.body.removeChild(tempGrid);
                
                // Calcular dimensiones para el PDF
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Verificar si cabe en la página
                const availableHeight = pageHeight - margin - 60; // 60mm para el header
                const finalHeight = Math.min(imgHeight, availableHeight);
                const finalWidth = (canvas.width * finalHeight) / canvas.height;
                
                // Centrar la imagen
                const xPos = (pageWidth - finalWidth) / 2;
                const yPos = margin + 60;
                
                // Agregar la imagen al PDF
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
            }
            
            // Agregar lista de estudiantes en una nueva página si hay muchos
            if (studentsInGrid > 20) {
                pdf.addPage();
                pdf.setFontSize(16);
                pdf.setFont(undefined, 'bold');
                pdf.text('Lista de Estudiantes por Posición', margin, margin);
                
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
                
                let yPos = margin + 15;
                const lineHeight = 6;
                
                this.gridCells.forEach((cell, index) => {
                    if (cell.student) {
                        const row = Math.floor(index / this.gridColumns) + 1;
                        const col = (index % this.gridColumns) + 1;
                        const text = `Posición ${index + 1} (Fila ${row}, Columna ${col}): ${cell.student}`;
                        
                        if (yPos > pageHeight - margin) {
                            pdf.addPage();
                            yPos = margin;
                        }
                        
                        pdf.text(text, margin, yPos);
                        yPos += lineHeight;
                    }
                });
            }
            
            // Generar nombre del archivo
            const fileName = `Disposicion_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;
            
            // Descargar el PDF
            pdf.save(fileName);
            
            console.log('✅ PDF generado exitosamente');
            
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
        } finally {
            // Restaurar botón
            this.exportPDF.innerHTML = originalText;
            this.exportPDF.disabled = false;
        }
    }
    
    // Función auxiliar para crear un grid optimizado para PDF
    async createPDFGrid() {
        const tempGrid = document.createElement('div');
        tempGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${this.gridColumns}, 1fr);
            gap: 8px;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 800px;
        `;
        
        // Crear celdas para el PDF
        for (let i = 0; i < this.gridCells.length; i++) {
            const cell = this.gridCells[i];
            const pdfCell = document.createElement('div');
            
            pdfCell.style.cssText = `
                min-height: 60px;
                border: 2px solid #ddd;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 500;
                text-align: center;
                padding: 8px;
                position: relative;
                background: ${cell.student ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f8f9fa'};
                color: ${cell.student ? 'white' : '#666'};
            `;
            
            if (cell.student) {
                pdfCell.innerHTML = `
                    <div style="font-size: 10px; color: rgba(255,255,255,0.8); margin-bottom: 4px;">
                        Pos. ${i + 1}
                    </div>
                    <div style="font-weight: bold; line-height: 1.2;">
                        ${cell.student}
                    </div>
                `;
            } else {
                pdfCell.innerHTML = `
                    <div style="font-size: 14px; color: #ccc;">
                        ${i + 1}
                    </div>
                `;
            }
            
            tempGrid.appendChild(pdfCell);
        }
        
        return tempGrid;
    }
}

// Módulo del Gestor de Salas (adaptado)
class GestorSalasModule {
    constructor() {
        this.currentCourse = null;
        this.courseRooms = [];
        this.editingRoomIndex = -1;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadCourses();
    }
    
    initializeElements() {
        // Elementos específicos del gestor de salas
        this.courseSelectGestor = document.getElementById('courseSelectGestor');
        this.selectCourseGestor = document.getElementById('selectCourseGestor');
        this.refreshCoursesGestor = document.getElementById('refreshCoursesGestor');
        this.courseInfoGestor = document.getElementById('courseInfoGestor');
        this.courseInfoTextGestor = document.getElementById('courseInfoTextGestor');
        this.selectedCourseInfoGestor = document.getElementById('selectedCourseInfoGestor');
        this.selectedCourseNameGestor = document.getElementById('selectedCourseNameGestor');
        this.totalStudentsGestor = document.getElementById('totalStudentsGestor');
        this.totalRoomsGestor = document.getElementById('totalRoomsGestor');
        this.totalLayoutsGestor = document.getElementById('totalLayoutsGestor');
        this.addRoom = document.getElementById('addRoom');
        this.saveRooms = document.getElementById('saveRooms');
        this.noRoomsMessageGestor = document.getElementById('noRoomsMessageGestor');
        this.roomsListGestor = document.getElementById('roomsListGestor');
        
        // Elementos de pestañas y disposiciones
        this.roomsTab = document.getElementById('roomsTab');
        this.layoutsTab = document.getElementById('layoutsTab');
        this.roomsContent = document.getElementById('roomsContent');
        this.layoutsContent = document.getElementById('layoutsContent');
        this.noLayoutsMessageGestor = document.getElementById('noLayoutsMessageGestor');
        this.layoutsListGestor = document.getElementById('layoutsListGestor');
    }
    
    setupEventListeners() {
        if (this.courseSelectGestor) {
            this.courseSelectGestor.addEventListener('change', () => this.handleCourseSelection());
        }
        if (this.selectCourseGestor) {
            this.selectCourseGestor.addEventListener('click', () => this.selectCourse());
        }
        if (this.refreshCoursesGestor) {
            this.refreshCoursesGestor.addEventListener('click', () => this.loadCourses());
        }
        if (this.addRoom) {
            this.addRoom.addEventListener('click', () => this.showAddRoomModal());
        }
        if (this.saveRooms) {
            this.saveRooms.addEventListener('click', () => this.saveAllRooms());
        }
        
        // Event listeners para pestañas
        if (this.roomsTab) {
            this.roomsTab.addEventListener('click', () => this.switchTab('rooms'));
        }
        if (this.layoutsTab) {
            this.layoutsTab.addEventListener('click', () => this.switchTab('layouts'));
        }
    }
    
    loadCourses() {
        if (!this.courseSelectGestor) return;
        
        this.courseSelectGestor.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        try {
            // Cargar cursos desde localStorage (gestión de estudiantes)
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const cursos = Object.keys(cursosData);
            
            if (cursos.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay cursos cargados';
                option.disabled = true;
                this.courseSelectGestor.appendChild(option);
                console.log('⚠️ No hay cursos disponibles en localStorage para gestor');
                return;
            }
            
            // Agregar opciones de cursos reales
            cursos.forEach(nombreCurso => {
                const estudiantes = cursosData[nombreCurso] || [];
                const cantidadEstudiantes = Array.isArray(estudiantes) ? estudiantes.length : 0;
                
                const option = document.createElement('option');
                option.value = nombreCurso;
                option.textContent = `${nombreCurso} (${cantidadEstudiantes} estudiantes)`;
                option.dataset.students = cantidadEstudiantes;
                option.dataset.courseName = nombreCurso;
                this.courseSelectGestor.appendChild(option);
            });
            
            console.log('✅ Cursos cargados en gestor de salas:', cursos.length);
            
        } catch (error) {
            console.error('❌ Error al cargar cursos en gestor:', error);
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error al cargar cursos';
            option.disabled = true;
            this.courseSelectGestor.appendChild(option);
        }
    }
    
    handleCourseSelection() {
        if (!this.courseSelectGestor || !this.selectCourseGestor) return;
        
        if (this.courseSelectGestor.value) {
            this.selectCourseGestor.disabled = false;
            if (this.courseInfoGestor && this.courseInfoTextGestor) {
                const selectedOption = this.courseSelectGestor.selectedOptions[0];
                this.courseInfoTextGestor.textContent = selectedOption.textContent;
                this.courseInfoGestor.style.display = 'flex';
            }
        } else {
            this.selectCourseGestor.disabled = true;
            if (this.courseInfoGestor) {
                this.courseInfoGestor.style.display = 'none';
            }
        }
    }
    
    selectCourse() {
        const selectedOption = this.courseSelectGestor.selectedOptions[0];
        if (!selectedOption) return;
        
        this.currentCourse = {
            id: this.courseSelectGestor.value, // Ahora es el nombre del curso
            name: selectedOption.dataset.courseName || this.courseSelectGestor.value,
            students: parseInt(selectedOption.dataset.students || 0)
        };
        
        this.updateSelectedCourseInfo();
        this.loadCourseRooms();
        
        if (this.addRoom) this.addRoom.disabled = false;
        if (this.saveRooms) this.saveRooms.disabled = false;
        
        console.log('✅ Curso seleccionado:', this.currentCourse);
    }
    
    updateSelectedCourseInfo() {
        if (this.selectedCourseInfoGestor && this.selectedCourseNameGestor && 
            this.totalStudentsGestor && this.totalRoomsGestor && this.totalLayoutsGestor) {
            this.selectedCourseNameGestor.textContent = this.currentCourse.name;
            this.totalStudentsGestor.textContent = this.currentCourse.students;
            this.totalRoomsGestor.textContent = this.courseRooms.length;
            
            // Contar disposiciones guardadas
            const savedLayouts = JSON.parse(localStorage.getItem('courseLayouts') || '{}');
            const courseLayouts = savedLayouts[this.currentCourse.id] || [];
            this.totalLayoutsGestor.textContent = courseLayouts.length;
            
            this.selectedCourseInfoGestor.style.display = 'block';
        }
    }
    
    loadCourseRooms() {
        // Cargar salas desde localStorage
        const savedRooms = localStorage.getItem(`courseRooms_${this.currentCourse.id}`);
        
        if (savedRooms) {
            try {
                this.courseRooms = JSON.parse(savedRooms);
            } catch (error) {
                console.error('Error al cargar salas:', error);
                this.courseRooms = [];
            }
        } else {
            // Crear sala por defecto
            this.courseRooms = [{
                id: this.generateRoomId(),
                name: 'Sala Principal',
                description: 'Sala principal del curso',
                capacity: Math.ceil(this.currentCourse.students * 1.2),
                order: 1
            }];
        }
        
        this.renderRoomsList();
        this.updateSelectedCourseInfo();
    }
    
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    renderRoomsList() {
        if (!this.roomsListGestor || !this.noRoomsMessageGestor) return;
        
        if (this.courseRooms.length === 0) {
            this.roomsListGestor.style.display = 'none';
            this.noRoomsMessageGestor.style.display = 'flex';
            return;
        }
        
        this.noRoomsMessageGestor.style.display = 'none';
        this.roomsListGestor.style.display = 'flex';
        
        const sortedRooms = [...this.courseRooms].sort((a, b) => a.order - b.order);
        
        this.roomsListGestor.innerHTML = sortedRooms.map((room, index) => `
            <div class="room-item" data-room-id="${room.id}">
                <div class="room-header">
                    <div class="room-info">
                        <div class="room-name">
                            <span class="room-order">#${room.order}</span>
                            ${room.name}
                        </div>
                        ${room.description ? `<div class="room-description">${room.description}</div>` : ''}
                        <div class="room-capacity">
                            <i class="fas fa-users"></i>
                            Capacidad: ${room.capacity} estudiantes
                        </div>
                    </div>
                    <div class="room-actions">
                        <button class="btn-edit" onclick="organizadorApp.gestorSalas.editRoom(${index})" title="Editar sala">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="organizadorApp.gestorSalas.deleteRoom(${index})" title="Eliminar sala">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showAddRoomModal() {
        console.log('Mostrar modal para agregar sala');
        // Implementación del modal
    }
    
    editRoom(index) {
        console.log('Editar sala:', index);
        // Implementación de edición
    }
    
    deleteRoom(index) {
        if (confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
            this.courseRooms.splice(index, 1);
            this.courseRooms.forEach((room, idx) => {
                room.order = idx + 1;
            });
            this.renderRoomsList();
            this.updateSelectedCourseInfo();
        }
    }
    
    saveAllRooms() {
        if (!this.currentCourse) return;
        
        try {
            localStorage.setItem(`courseRooms_${this.currentCourse.id}`, JSON.stringify(this.courseRooms));
            console.log('Salas guardadas correctamente');
        } catch (error) {
            console.error('Error al guardar salas:', error);
        }
    }
    
    // Funciones para manejar pestañas
    switchTab(tabName) {
        // Actualizar botones de pestañas
        this.roomsTab?.classList.remove('active');
        this.layoutsTab?.classList.remove('active');
        
        // Ocultar contenidos
        this.roomsContent?.classList.add('hidden');
        this.layoutsContent?.classList.add('hidden');
        
        if (tabName === 'rooms') {
            this.roomsTab?.classList.add('active');
            this.roomsContent?.classList.remove('hidden');
        } else if (tabName === 'layouts') {
            this.layoutsTab?.classList.add('active');
            this.layoutsContent?.classList.remove('hidden');
            this.loadCourseLayouts();
        }
    }
    
    // Funciones para manejar disposiciones
    loadCourseLayouts() {
        if (!this.currentCourse) {
            this.showNoLayoutsMessage();
            return;
        }
        
        try {
            const savedLayouts = JSON.parse(localStorage.getItem('courseLayouts') || '{}');
            const courseLayouts = savedLayouts[this.currentCourse.id] || [];
            
            if (courseLayouts.length === 0) {
                this.showNoLayoutsMessage();
            } else {
                this.renderLayoutsList(courseLayouts);
            }
            
            console.log(`✅ Disposiciones cargadas para ${this.currentCourse.name}:`, courseLayouts.length);
            
        } catch (error) {
            console.error('❌ Error al cargar disposiciones:', error);
            this.showNoLayoutsMessage();
        }
    }
    
    showNoLayoutsMessage() {
        if (this.noLayoutsMessageGestor && this.layoutsListGestor) {
            this.noLayoutsMessageGestor.style.display = 'flex';
            this.layoutsListGestor.style.display = 'none';
        }
    }
    
    renderLayoutsList(layouts) {
        if (!this.layoutsListGestor || !this.noLayoutsMessageGestor) return;
        
        this.noLayoutsMessageGestor.style.display = 'none';
        this.layoutsListGestor.style.display = 'flex';
        this.layoutsListGestor.innerHTML = '';
        
        // Ordenar disposiciones por fecha (más recientes primero)
        const sortedLayouts = [...layouts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        sortedLayouts.forEach((layout, index) => {
            const layoutElement = this.createLayoutElement(layout, index);
            this.layoutsListGestor.appendChild(layoutElement);
        });
    }
    
    createLayoutElement(layout, index) {
        const layoutDiv = document.createElement('div');
        layoutDiv.className = 'layout-item';
        
        const createdDate = new Date(layout.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Crear preview de estudiantes
        const studentNames = layout.students.map(s => s.name).slice(0, 5);
        const preview = studentNames.join(', ') + (layout.students.length > 5 ? '...' : '');
        
        layoutDiv.innerHTML = `
            <div class="layout-header">
                <div class="layout-info">
                    <div class="layout-name">${layout.name}</div>
                    <div class="layout-date">Creado: ${createdDate}</div>
                    <div class="layout-stats">
                        <span class="layout-stat">
                            <i class="fas fa-users"></i>
                            ${layout.totalStudents} estudiantes
                        </span>
                        <span class="layout-stat">
                            <i class="fas fa-th"></i>
                            ${layout.gridColumns}x${layout.gridRows}
                        </span>
                    </div>
                </div>
                <div class="layout-actions">
                    <button class="btn-view" onclick="organizadorApp.gestorSalas.viewLayout('${layout.id}')" title="Ver disposición">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-delete" onclick="organizadorApp.gestorSalas.deleteLayout('${layout.id}')" title="Eliminar disposición">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="layout-preview">
                <strong>Estudiantes:</strong> ${preview}
            </div>
        `;
        
        return layoutDiv;
    }
    
    viewLayout(layoutId) {
        try {
            const savedLayouts = JSON.parse(localStorage.getItem('courseLayouts') || '{}');
            const courseLayouts = savedLayouts[this.currentCourse.id] || [];
            const layout = courseLayouts.find(l => l.id === layoutId);
            
            if (!layout) {
                alert('❌ Disposición no encontrada');
                return;
            }
            
            // Crear ventana modal para mostrar la disposición
            this.showLayoutModal(layout);
            
        } catch (error) {
            console.error('❌ Error al ver disposición:', error);
            alert('❌ Error al cargar la disposición');
        }
    }
    
    showLayoutModal(layout) {
        // Crear modal dinámico
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-th"></i> ${layout.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1rem;">
                        <strong>Curso:</strong> ${layout.course}<br>
                        <strong>Creado:</strong> ${new Date(layout.createdAt).toLocaleString('es-ES')}<br>
                        <strong>Estudiantes:</strong> ${layout.totalStudents}<br>
                        <strong>Dimensiones:</strong> ${layout.gridColumns} columnas × ${layout.gridRows} filas
                    </div>
                    <div id="layoutPreviewGrid" style="
                        display: grid;
                        grid-template-columns: repeat(${layout.gridColumns}, 1fr);
                        gap: 4px;
                        max-width: 100%;
                        margin: 1rem 0;
                    "></div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-info" onclick="organizadorApp.gestorSalas.loadLayoutInOrganizer('${layout.id}')">
                        <i class="fas fa-chair"></i> Cargar en Organizador
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Crear grid de preview
        const previewGrid = modal.querySelector('#layoutPreviewGrid');
        const totalCells = layout.gridColumns * layout.gridRows;
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.style.cssText = `
                min-height: 40px;
                border: 1px solid #ddd;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                background: #f8f9fa;
                position: relative;
            `;
            
            // Buscar estudiante en esta posición
            const student = layout.students.find(s => s.position === i);
            if (student) {
                cell.textContent = student.name;
                cell.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                cell.style.color = 'white';
                cell.style.fontWeight = '500';
            } else {
                cell.innerHTML = `<span style="color: #ccc; font-size: 0.6rem;">${i + 1}</span>`;
            }
            
            previewGrid.appendChild(cell);
        }
        
        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    loadLayoutInOrganizer(layoutId) {
        // Guardar el ID de la disposición para cargar en el organizador
        localStorage.setItem('loadLayoutId', layoutId);
        
        // Cambiar al organizador de puestos
        showOrganizadorPuestos();
        
        // Mostrar mensaje
        setTimeout(() => {
            alert('✅ Cambiando al Organizador de Puestos para cargar la disposición...');
        }, 500);
    }
    
    deleteLayout(layoutId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta disposición?')) {
            return;
        }
        
        try {
            const savedLayouts = JSON.parse(localStorage.getItem('courseLayouts') || '{}');
            const courseLayouts = savedLayouts[this.currentCourse.id] || [];
            
            const updatedLayouts = courseLayouts.filter(l => l.id !== layoutId);
            savedLayouts[this.currentCourse.id] = updatedLayouts;
            
            localStorage.setItem('courseLayouts', JSON.stringify(savedLayouts));
            
            // Recargar la lista
            this.loadCourseLayouts();
            this.updateSelectedCourseInfo();
            
            console.log('✅ Disposición eliminada');
            
        } catch (error) {
            console.error('❌ Error al eliminar disposición:', error);
            alert('❌ Error al eliminar la disposición');
        }
    }
}

// Funciones globales para la navegación
function showSelectionScreen() {
    organizadorApp.showSelectionScreen();
}

function showOrganizadorPuestos() {
    organizadorApp.showOrganizadorPuestos();
}

function showGestorSalas() {
    organizadorApp.showGestorSalas();
}

// Función para cargar datos de prueba
function cargarDatosPrueba() {
    const cursosData = {
        "8°A": [
            { nombre: "Juan Pérez", id: 1 },
            { nombre: "María García", id: 2 },
            { nombre: "Pedro López", id: 3 },
            { nombre: "Ana Martínez", id: 4 },
            { nombre: "Carmen Silva", id: 5 },
            { nombre: "Roberto Díaz", id: 6 }
        ],
        "8°B": [
            { nombre: "Carlos Ruiz", id: 7 },
            { nombre: "Laura Fernández", id: 8 },
            { nombre: "Diego Morales", id: 9 },
            { nombre: "Sofía Castillo", id: 10 },
            { nombre: "Miguel Torres", id: 11 }
        ],
        "7°A": [
            { nombre: "Valentina Soto", id: 12 },
            { nombre: "Andrés Vega", id: 13 },
            { nombre: "Isabella Cruz", id: 14 },
            { nombre: "Mateo Herrera", id: 15 }
        ]
    };
    
    localStorage.setItem('cursosData', JSON.stringify(cursosData));
    console.log('✅ Datos de prueba cargados:', cursosData);
    
    // Actualizar selectores en ambos módulos
    if (organizadorApp && organizadorApp.organizadorPuestos) {
        organizadorApp.organizadorPuestos.loadAvailableCourses();
    }
    if (organizadorApp && organizadorApp.gestorSalas) {
        organizadorApp.gestorSalas.loadCourses();
    }
    
    alert('✅ Datos de prueba cargados: 3 cursos con estudiantes');
}

// Función de debug para verificar datos
function debugCursosData() {
    console.log('🔍 === DEBUG ORGANIZADOR DE SALAS ===');
    
    const cursosData = localStorage.getItem('cursosData');
    console.log('📚 cursosData en localStorage:', cursosData ? 'EXISTE' : 'NO EXISTE');
    
    if (cursosData) {
        try {
            const parsed = JSON.parse(cursosData);
            console.log('📊 Contenido de cursosData:', parsed);
            console.log('📈 Número de cursos:', Object.keys(parsed).length);
            
            Object.keys(parsed).forEach(curso => {
                const estudiantes = parsed[curso];
                console.log(`📝 Curso "${curso}":`, estudiantes.length, 'estudiantes');
                if (estudiantes.length > 0) {
                    console.log('👤 Primer estudiante:', estudiantes[0]);
                }
            });
        } catch (error) {
            console.error('❌ Error al parsear cursosData:', error);
        }
    } else {
        console.log('💡 No hay datos. Puedes cargar datos de prueba con: cargarDatosPrueba()');
        console.log('💡 O ve a Gestión de Estudiantes y carga un archivo Excel');
    }
    
    console.log('🔍 === FIN DEBUG ===');
}

// Inicializar la aplicación
let organizadorApp;

document.addEventListener('DOMContentLoaded', () => {
    organizadorApp = new OrganizadorSalasApp();
    
    // Debug automático
    setTimeout(() => {
        debugCursosData();
        debugPDFLibraries();
    }, 1000);
});

// Función para verificar librerías PDF
function debugPDFLibraries() {
    console.log('🔍 === DEBUG LIBRERÍAS PDF ===');
    
    // Verificar diferentes formas de acceso a jsPDF
    console.log('window.jsPDF:', typeof window.jsPDF);
    console.log('window.jspdf:', typeof window.jspdf);
    console.log('jsPDF global:', typeof jsPDF);
    console.log('html2canvas:', typeof html2canvas);
    
    // Verificar si podemos crear una instancia
    let jsPDFClass = null;
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF;
        console.log('✅ jsPDF encontrado en window.jspdf.jsPDF');
    } else if (typeof window.jsPDF !== 'undefined') {
        jsPDFClass = window.jsPDF;
        console.log('✅ jsPDF encontrado en window.jsPDF');
    } else if (typeof jsPDF !== 'undefined') {
        jsPDFClass = jsPDF;
        console.log('✅ jsPDF encontrado como variable global');
    } else {
        console.log('❌ jsPDF no encontrado en ninguna ubicación');
    }
    
    if (jsPDFClass) {
        try {
            const testPdf = new jsPDFClass();
            console.log('✅ jsPDF constructor funciona correctamente');
        } catch (error) {
            console.log('❌ Error al crear instancia de jsPDF:', error);
        }
    }
    
    if (typeof html2canvas !== 'undefined') {
        console.log('✅ html2canvas cargado correctamente');
    } else {
        console.log('❌ html2canvas no está disponible');
    }
    
    console.log('🔍 === FIN DEBUG LIBRERÍAS ===');
}

// Exponer funciones globalmente
window.debugCursosData = debugCursosData;
window.cargarDatosPrueba = cargarDatosPrueba;
window.debugPDFLibraries = debugPDFLibraries;

console.log('Organizador de Salas - JavaScript cargado'); 