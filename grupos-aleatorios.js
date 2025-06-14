// Generador de Grupos Aleatorios para NinjPro
class GroupGenerator {
    constructor() {
        this.currentCourse = null;
        this.students = [];
        this.groups = [];
        this.numberOfGroups = 4;
    }

    init() {
        this.loadCourses();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadCourses() {
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const courseSelect = document.getElementById('course-select-groups');
        
        if (!courseSelect) return;

        courseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        
        Object.keys(cursosData).forEach(courseName => {
            const students = cursosData[courseName];
            if (students && students.length > 0) {
                const option = document.createElement('option');
                option.value = courseName;
                option.textContent = `${courseName} (${students.length} estudiantes)`;
                courseSelect.appendChild(option);
            }
        });
    }

    setupEventListeners() {
        const courseSelect = document.getElementById('course-select-groups');
        const groupsSelect = document.getElementById('groups-number');
        const generateBtn = document.getElementById('generate-groups-btn');
        const randomizeBtn = document.getElementById('randomize-groups-btn');
        const exportBtn = document.getElementById('export-groups-btn');
        const modalRandomizeBtn = document.getElementById('modal-randomize-btn');
        const modalExportBtn = document.getElementById('modal-export-btn');
        const closeModal = document.getElementById('close-modal');
        const modal = document.getElementById('groups-modal');

        if (courseSelect) {
            courseSelect.addEventListener('change', (e) => this.onCourseChange(e.target.value));
        }

        if (groupsSelect) {
            groupsSelect.addEventListener('change', (e) => {
                this.numberOfGroups = parseInt(e.target.value);
                this.updateDisplay();
            });
        }

        if (generateBtn) generateBtn.addEventListener('click', () => this.generateGroups());
        if (randomizeBtn) randomizeBtn.addEventListener('click', () => this.randomizeGroups());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportGroups());
        if (modalRandomizeBtn) modalRandomizeBtn.addEventListener('click', () => this.randomizeGroups());
        if (modalExportBtn) modalExportBtn.addEventListener('click', () => this.exportGroups());
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    onCourseChange(courseName) {
        if (!courseName) {
            this.clearGroups();
            return;
        }

        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const students = cursosData[courseName];
        
        if (students && students.length > 0) {
            this.currentCourse = courseName;
            this.students = [...students];
            this.updateDisplay();
            this.updateStatus('Curso seleccionado. ¡Listo para generar grupos!');
        }
    }

    updateDisplay() {
        const courseNameEl = document.getElementById('course-name');
        const studentCountEl = document.getElementById('student-count');
        
        if (courseNameEl) {
            courseNameEl.textContent = this.currentCourse || 'Selecciona un curso';
        }
        
        if (studentCountEl) {
            studentCountEl.textContent = `${this.students.length} estudiantes`;
        }
    }

    updateStatus(message) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = message;
        }
    }

    generateGroups() {
        if (this.students.length === 0) {
            this.updateStatus('Selecciona un curso primero');
            return;
        }

        this.updateStatus('Generando grupos...');

        const shuffledStudents = [...this.students].sort(() => Math.random() - 0.5);
        
        this.groups = [];
        const studentsPerGroup = Math.ceil(shuffledStudents.length / this.numberOfGroups);
        
        for (let i = 0; i < this.numberOfGroups; i++) {
            const start = i * studentsPerGroup;
            const end = start + studentsPerGroup;
            const groupStudents = shuffledStudents.slice(start, end);
            
            if (groupStudents.length > 0) {
                this.groups.push({
                    id: i + 1,
                    name: `Grupo ${i + 1}`,
                    students: groupStudents,
                    color: this.getGroupColor(i)
                });
            }
        }

        this.renderGroups();
        this.showModal();
        this.showActionButtons();
        this.updateStatus(`${this.groups.length} grupos generados exitosamente`);
    }

    randomizeGroups() {
        if (this.groups.length === 0) {
            this.generateGroups();
            return;
        }

        this.updateStatus('Reorganizando grupos...');

        const allStudents = [];
        this.groups.forEach(group => allStudents.push(...group.students));

        const shuffledStudents = allStudents.sort(() => Math.random() - 0.5);
        const studentsPerGroup = Math.ceil(shuffledStudents.length / this.groups.length);
        
        this.groups.forEach((group, index) => {
            const start = index * studentsPerGroup;
            const end = start + studentsPerGroup;
            group.students = shuffledStudents.slice(start, end);
        });

        this.renderGroups();
        this.updateStatus('Grupos reorganizados');
    }

    getGroupColor(index) {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
        return colors[index % colors.length];
    }

    renderGroups() {
        const container = document.getElementById('groups-container');
        if (!container) return;

        container.innerHTML = '';

        this.groups.forEach(group => {
            const groupElement = this.createGroupElement(group);
            container.appendChild(groupElement);
        });

        this.setupDragAndDrop();
    }

    createGroupElement(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card';
        groupDiv.dataset.groupId = group.id;
        
        groupDiv.innerHTML = `
            <div class="group-header">
                <h3>👥 ${group.name} (${group.students.length})</h3>
            </div>
            <div class="group-students" data-group-id="${group.id}">
                ${group.students.map(student => this.createStudentElement(student, group.color)).join('')}
            </div>
        `;

        return groupDiv;
    }

    createStudentElement(student, groupColor) {
        const studentName = student.nombre || student.name || 'Sin nombre';
        const studentEmail = student.email || '';
        
        return `
            <div class="student-card" draggable="true" data-student-name="${studentName}">
                <div class="student-avatar" style="background: ${groupColor};">
                    ${studentName.charAt(0).toUpperCase()}
                </div>
                <div class="student-info">
                    <div class="student-name">${studentName}</div>
                    ${studentEmail ? `<div class="student-email">${studentEmail}</div>` : ''}
                </div>
            </div>
        `;
    }

    showModal() {
        const modal = document.getElementById('groups-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('groups-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    showActionButtons() {
        const randomizeBtn = document.getElementById('randomize-groups-btn');
        const exportBtn = document.getElementById('export-groups-btn');
        
        if (randomizeBtn) randomizeBtn.style.display = 'flex';
        if (exportBtn) exportBtn.style.display = 'flex';
    }

    clearGroups() {
        const container = document.getElementById('groups-container');
        const randomizeBtn = document.getElementById('randomize-groups-btn');
        const exportBtn = document.getElementById('export-groups-btn');
        
        if (container) container.innerHTML = '';
        if (randomizeBtn) randomizeBtn.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'none';
        
        this.groups = [];
        this.students = [];
        this.currentCourse = null;
        this.updateDisplay();
        this.updateStatus('Listo para generar grupos');
        this.closeModal();
    }

    exportGroups() {
        if (this.groups.length === 0) return;

        const data = [];
        
        // Agregar encabezados
        data.push(['Grupo', 'Estudiante', 'Email']);
        
        // Agregar datos de estudiantes
        this.groups.forEach(group => {
            group.students.forEach(student => {
                data.push([
                    group.name,
                    student.nombre || student.name || 'Sin nombre',
                    student.email || ''
                ]);
        });
        });

        // Crear y descargar archivo Excel
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Grupos');
        
        const fileName = `grupos_${this.currentCourse || 'aleatorios'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.updateStatus('Grupos exportados exitosamente');
    }

    setupDragAndDrop() {
        const studentCards = document.querySelectorAll('.student-card');
        const groupContainers = document.querySelectorAll('.group-students');
        const groupCards = document.querySelectorAll('.group-card');

        studentCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.onDragStart(e));
            card.addEventListener('dragend', (e) => this.onDragEnd(e));
            
            // Agregar eventos táctiles para móviles
            card.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
            card.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
            card.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        });

        groupContainers.forEach(container => {
            container.addEventListener('dragover', (e) => this.onDragOver(e));
            container.addEventListener('dragenter', (e) => this.onDragEnter(e));
            container.addEventListener('dragleave', (e) => this.onDragLeave(e));
            container.addEventListener('drop', (e) => this.onDrop(e));
        });

        // También agregar eventos a las tarjetas de grupo completas para mejor UX
        groupCards.forEach(card => {
            card.addEventListener('dragover', (e) => this.onDragOverCard(e));
            card.addEventListener('dragenter', (e) => this.onDragEnterCard(e));
            card.addEventListener('dragleave', (e) => this.onDragLeaveCard(e));
            card.addEventListener('drop', (e) => this.onDropCard(e));
        });
    }

    onDragStart(e) {
        const studentName = e.target.dataset.studentName;
        const studentCard = e.target.closest('.student-card');
        
        if (!studentCard || !studentName) return;

        // Guardar información del estudiante que se está arrastrando
        this.draggedStudent = {
            name: studentName,
            element: studentCard,
            sourceGroupId: studentCard.closest('.group-students').dataset.groupId
        };

        e.dataTransfer.setData('text/plain', studentName);
        e.dataTransfer.effectAllowed = 'move';
        
        // Agregar clase de arrastre
        studentCard.classList.add('dragging');
        
        // Agregar efectos visuales a todos los grupos
        document.querySelectorAll('.group-card').forEach(group => {
            const groupId = group.querySelector('.group-students').dataset.groupId;
            if (groupId !== this.draggedStudent.sourceGroupId) {
                group.classList.add('drop-target');
            } else {
                group.classList.add('source-group');
            }
        });

        // Mostrar indicador de arrastre
        this.showDragIndicator();
    }

    onDragEnd(e) {
        const studentCard = e.target.closest('.student-card');
        if (studentCard) {
            studentCard.classList.remove('dragging');
        }

        // Limpiar todos los efectos visuales
        document.querySelectorAll('.group-card').forEach(group => {
            group.classList.remove('drop-target', 'drag-over', 'source-group', 'drop-active');
        });

        document.querySelectorAll('.group-students').forEach(container => {
            container.classList.remove('drag-over');
        });

        this.hideDragIndicator();
        this.draggedStudent = null;
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    onDragEnter(e) {
        e.preventDefault();
        const groupContainer = e.target.closest('.group-students');
        if (groupContainer && this.draggedStudent) {
            const targetGroupId = groupContainer.dataset.groupId;
            if (targetGroupId !== this.draggedStudent.sourceGroupId) {
                groupContainer.classList.add('drag-over');
                groupContainer.closest('.group-card').classList.add('drop-active');
            }
        }
    }

    onDragLeave(e) {
        const groupContainer = e.target.closest('.group-students');
        if (groupContainer) {
            // Solo remover si realmente salimos del contenedor
            const rect = groupContainer.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                groupContainer.classList.remove('drag-over');
                groupContainer.closest('.group-card').classList.remove('drop-active');
            }
        }
    }

    onDragOverCard(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    onDragEnterCard(e) {
        e.preventDefault();
        const groupCard = e.target.closest('.group-card');
        if (groupCard && this.draggedStudent) {
            const groupContainer = groupCard.querySelector('.group-students');
            const targetGroupId = groupContainer.dataset.groupId;
            if (targetGroupId !== this.draggedStudent.sourceGroupId) {
                groupCard.classList.add('drop-active');
                groupContainer.classList.add('drag-over');
            }
        }
    }

    onDragLeaveCard(e) {
        const groupCard = e.target.closest('.group-card');
        if (groupCard) {
            const rect = groupCard.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                groupCard.classList.remove('drop-active');
                groupCard.querySelector('.group-students').classList.remove('drag-over');
            }
        }
    }

    onDrop(e) {
        e.preventDefault();
        this.handleDrop(e);
    }

    onDropCard(e) {
        e.preventDefault();
        this.handleDrop(e);
    }

    handleDrop(e) {
        const studentName = e.dataTransfer.getData('text/plain');
        let targetGroupContainer = e.target.closest('.group-students');
        
        // Si no encontramos el contenedor directamente, buscar en la tarjeta del grupo
        if (!targetGroupContainer) {
            const groupCard = e.target.closest('.group-card');
            if (groupCard) {
                targetGroupContainer = groupCard.querySelector('.group-students');
            }
        }

        if (!targetGroupContainer || !this.draggedStudent) return;

        const targetGroupId = targetGroupContainer.dataset.groupId;
        const sourceGroupId = this.draggedStudent.sourceGroupId;

        // No hacer nada si se suelta en el mismo grupo
        if (targetGroupId === sourceGroupId) {
            this.updateStatus('El estudiante ya está en ese grupo');
            return;
        }

        // Encontrar el estudiante y el grupo origen
        let sourceGroup = null;
        let student = null;
        
        this.groups.forEach(group => {
            const studentIndex = group.students.findIndex(s => 
                (s.nombre || s.name) === studentName
            );
            if (studentIndex !== -1) {
                student = group.students[studentIndex];
                sourceGroup = group;
                group.students.splice(studentIndex, 1);
            }
        });

        // Agregar al grupo destino
        if (student) {
            const targetGroup = this.groups.find(g => g.id == targetGroupId);
            if (targetGroup) {
                targetGroup.students.push(student);
                this.renderGroups();
                this.showMoveNotification(student, sourceGroup, targetGroup);
            }
        }

        // Limpiar efectos visuales
        document.querySelectorAll('.group-card').forEach(group => {
            group.classList.remove('drop-active', 'drag-over');
        });
        document.querySelectorAll('.group-students').forEach(container => {
            container.classList.remove('drag-over');
        });
    }

    // Soporte para dispositivos táctiles
    onTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const studentCard = e.target.closest('.student-card');
        
        if (!studentCard) return;

        this.touchData = {
            startX: touch.clientX,
            startY: touch.clientY,
            studentCard: studentCard,
            studentName: studentCard.dataset.studentName,
            sourceGroupId: studentCard.closest('.group-students').dataset.groupId,
            isDragging: false
        };

        // Prevenir scroll mientras se mantiene presionado
        e.preventDefault();
    }

    onTouchMove(e) {
        if (!this.touchData || e.touches.length !== 1) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchData.startX);
        const deltaY = Math.abs(touch.clientY - this.touchData.startY);

        // Iniciar arrastre si se mueve lo suficiente
        if (!this.touchData.isDragging && (deltaX > 10 || deltaY > 10)) {
            this.touchData.isDragging = true;
            this.touchData.studentCard.classList.add('dragging');
            
            // Agregar efectos visuales
            document.querySelectorAll('.group-card').forEach(group => {
                const groupId = group.querySelector('.group-students').dataset.groupId;
                if (groupId !== this.touchData.sourceGroupId) {
                    group.classList.add('drop-target');
                }
            });

            this.showDragIndicator();
        }

        if (this.touchData.isDragging) {
            e.preventDefault();
            
            // Encontrar elemento bajo el dedo
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const groupCard = elementBelow?.closest('.group-card');
            
            // Limpiar efectos anteriores
            document.querySelectorAll('.group-card').forEach(group => {
                group.classList.remove('drop-active');
            });

            // Agregar efecto al grupo actual
            if (groupCard) {
                const groupContainer = groupCard.querySelector('.group-students');
                const targetGroupId = groupContainer.dataset.groupId;
                if (targetGroupId !== this.touchData.sourceGroupId) {
                    groupCard.classList.add('drop-active');
                }
            }
        }
    }

    onTouchEnd(e) {
        if (!this.touchData) return;

        if (this.touchData.isDragging) {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const groupCard = elementBelow?.closest('.group-card');
            
            if (groupCard) {
                const groupContainer = groupCard.querySelector('.group-students');
                const targetGroupId = groupContainer.dataset.groupId;
                
                if (targetGroupId !== this.touchData.sourceGroupId) {
                    // Simular drop
                    this.handleTouchDrop(this.touchData.studentName, targetGroupId);
                }
            }

            // Limpiar efectos visuales
            this.touchData.studentCard.classList.remove('dragging');
            document.querySelectorAll('.group-card').forEach(group => {
                group.classList.remove('drop-target', 'drop-active');
            });
            this.hideDragIndicator();
        }

        this.touchData = null;
    }

    handleTouchDrop(studentName, targetGroupId) {
        // Encontrar el estudiante y el grupo origen
        let sourceGroup = null;
        let student = null;
        
        this.groups.forEach(group => {
            const studentIndex = group.students.findIndex(s => 
                (s.nombre || s.name) === studentName
            );
            if (studentIndex !== -1) {
                student = group.students[studentIndex];
                sourceGroup = group;
                group.students.splice(studentIndex, 1);
            }
        });

        // Agregar al grupo destino
        if (student) {
            const targetGroup = this.groups.find(g => g.id == targetGroupId);
            if (targetGroup) {
                targetGroup.students.push(student);
                this.renderGroups();
                this.showMoveNotification(student, sourceGroup, targetGroup);
            }
        }
    }

    showDragIndicator() {
        // Crear indicador si no existe
        if (!document.getElementById('drag-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'drag-indicator';
            indicator.innerHTML = '📋 Arrastra a otro grupo';
            indicator.className = 'drag-indicator';
            document.body.appendChild(indicator);
        }
        
        const indicator = document.getElementById('drag-indicator');
        indicator.style.display = 'block';
        setTimeout(() => indicator.classList.add('show'), 10);
    }

    hideDragIndicator() {
        const indicator = document.getElementById('drag-indicator');
        if (indicator) {
            indicator.classList.remove('show');
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 300);
        }
    }

    showMoveNotification(student, sourceGroup, targetGroup) {
        const studentName = student.nombre || student.name || 'Estudiante';
        const message = `${studentName} movido de ${sourceGroup.name} a ${targetGroup.name}`;
        this.updateStatus(message);
        
        // Crear notificación visual
        this.createMoveNotification(message);
        
        setTimeout(() => {
            this.updateStatus(`${this.groups.length} grupos activos`);
        }, 3000);
    }

    createMoveNotification(message) {
        // Remover notificación anterior si existe
        const existingNotification = document.getElementById('move-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'move-notification';
        notification.className = 'move-notification';
        notification.innerHTML = `
            <div class="notification-icon">✨</div>
            <div class="notification-text">${message}</div>
        `;

        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 3000);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const generator = new GroupGenerator();
    generator.init();
    initializeTheme();
    showBackButton();
});

function showBackButton() {
    const backBtn = document.querySelector('.back-to-dashboard');
    if (backBtn) {
        setTimeout(() => {
            backBtn.classList.add('visible');
        }, 500);
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'theme-dark';
    document.body.className = savedTheme;
}

console.log('📦 Generador de grupos aleatorios cargado');

// ================================
// GESTOR DE GRUPOS GUARDADOS
// ================================

class GroupManager {
    constructor() {
        this.savedGroups = this.loadSavedGroups();
        this.currentGroups = null;
        this.setupManagerEventListeners();
    }

    setupManagerEventListeners() {
        // Botón principal de gestionar
        const manageBtn = document.getElementById('manage-groups-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.openManageModal());
        }

        // Botón de guardar en modal de grupos
        const modalSaveBtn = document.getElementById('modal-save-btn');
        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', () => this.openSaveModal());
        }

        // Tabs de navegación
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Modal de gestión
        const manageModal = document.getElementById('manage-groups-modal');
        const closeManageModal = document.getElementById('close-manage-modal');
        if (closeManageModal) {
            closeManageModal.addEventListener('click', () => this.closeManageModal());
        }
        if (manageModal) {
            manageModal.addEventListener('click', (e) => {
                if (e.target === manageModal) this.closeManageModal();
            });
        }

        // Modal de guardado
        const saveModal = document.getElementById('save-groups-modal');
        const closeSaveModal = document.getElementById('close-save-modal');
        const cancelSaveBtn = document.getElementById('cancel-save-btn');
        const confirmSaveBtn = document.getElementById('confirm-save-btn');

        if (closeSaveModal) {
            closeSaveModal.addEventListener('click', () => this.closeSaveModal());
        }
        if (cancelSaveBtn) {
            cancelSaveBtn.addEventListener('click', () => this.closeSaveModal());
        }
        if (confirmSaveBtn) {
            confirmSaveBtn.addEventListener('click', () => this.saveGroups());
        }
        if (saveModal) {
            saveModal.addEventListener('click', (e) => {
                if (e.target === saveModal) this.closeSaveModal();
            });
        }

        // Búsqueda y filtros
        const searchInput = document.getElementById('search-groups');
        const filterSelect = document.getElementById('filter-course');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterSavedGroups());
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterSavedGroups());
        }

        // Importar/Exportar
        const exportAllBtn = document.getElementById('export-all-groups-btn');
        const importBtn = document.getElementById('import-groups-btn');
        const importFile = document.getElementById('import-groups-file');
        const clearAllBtn = document.getElementById('clear-all-groups-btn');

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllGroups());
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importGroups(e));
        }
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllGroups());
        }

        // Cargar grupos seleccionados
        const loadSelectedBtn = document.getElementById('load-selected-btn');
        if (loadSelectedBtn) {
            loadSelectedBtn.addEventListener('click', () => this.loadSelectedGroups());
        }

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeManageModal();
                this.closeSaveModal();
            }
        });
    }

    // Gestión de datos
    loadSavedGroups() {
        return JSON.parse(localStorage.getItem('savedGroups') || '[]');
    }

    saveSavedGroups() {
        localStorage.setItem('savedGroups', JSON.stringify(this.savedGroups));
    }

    // Modales
    openManageModal() {
        this.refreshSavedGroupsList();
        this.refreshAvailableGroupsList();
        this.populateFilterOptions();
        document.getElementById('manage-groups-modal').classList.add('show');
    }

    closeManageModal() {
        document.getElementById('manage-groups-modal').classList.remove('show');
    }

    openSaveModal() {
        // Verificar que hay grupos para guardar
        if (!window.groupGenerator || !window.groupGenerator.groups || window.groupGenerator.groups.length === 0) {
            alert('No hay grupos generados para guardar');
            return;
        }

        this.currentGroups = window.groupGenerator.groups;
        this.renderSavePreview();
        
        // Sugerir nombre basado en el curso actual
        const courseInput = document.getElementById('group-name');
        if (courseInput && window.groupGenerator.currentCourse) {
            const date = new Date().toLocaleDateString();
            courseInput.value = `Grupos ${window.groupGenerator.currentCourse} - ${date}`;
        }

        document.getElementById('save-groups-modal').classList.add('show');
    }

    closeSaveModal() {
        document.getElementById('save-groups-modal').classList.remove('show');
        // Limpiar formulario
        document.getElementById('group-name').value = '';
        document.getElementById('group-description').value = '';
        document.getElementById('group-tags').value = '';
    }

    // Tabs
    switchTab(tabName) {
        // Actualizar botones de tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mostrar contenido correspondiente
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Actualizar contenido según el tab
        if (tabName === 'saved-groups') {
            this.refreshSavedGroupsList();
        } else if (tabName === 'load-groups') {
            this.refreshAvailableGroupsList();
        }
    }

    // Guardar grupos
    saveGroups() {
        const name = document.getElementById('group-name').value.trim();
        const description = document.getElementById('group-description').value.trim();
        const tagsInput = document.getElementById('group-tags').value.trim();
        
        if (!name) {
            alert('Por favor ingresa un nombre para el conjunto de grupos');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const savedGroup = {
            id: Date.now().toString(),
            name: name,
            description: description,
            tags: tags,
            course: window.groupGenerator.currentCourse,
            groups: JSON.parse(JSON.stringify(this.currentGroups)),
            createdAt: new Date().toISOString(),
            studentsCount: this.currentGroups.reduce((total, group) => total + group.students.length, 0)
        };

        this.savedGroups.push(savedGroup);
        this.saveSavedGroups();
        
        this.closeSaveModal();
        alert('Grupos guardados exitosamente');
        
        // Actualizar lista si el modal de gestión está abierto
        if (document.getElementById('manage-groups-modal').classList.contains('show')) {
            this.refreshSavedGroupsList();
        }
    }

    renderSavePreview() {
        const container = document.getElementById('save-groups-preview');
        if (!container || !this.currentGroups) return;

        container.innerHTML = '';

        this.currentGroups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'preview-group';
            
            const studentsText = group.students.map(s => s.nombre || s.name || s).join(', ');
            
            groupDiv.innerHTML = `
                <div class="preview-group-title">${group.name}</div>
                <div class="preview-students">${studentsText}</div>
            `;
            
            container.appendChild(groupDiv);
        });
    }

    // Lista de grupos guardados
    refreshSavedGroupsList() {
        const container = document.getElementById('saved-groups-list');
        if (!container) return;

        if (this.savedGroups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No hay grupos guardados</div>
                    <div class="empty-state-subtext">Genera algunos grupos y guárdalos para usarlos después</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        this.savedGroups.forEach(savedGroup => {
            const groupDiv = this.createSavedGroupElement(savedGroup);
            container.appendChild(groupDiv);
        });
    }

    createSavedGroupElement(savedGroup) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'saved-group-item';
        groupDiv.dataset.groupId = savedGroup.id;
        
        const date = new Date(savedGroup.createdAt).toLocaleDateString();
        const tagsHtml = savedGroup.tags.map(tag => `<span class="group-tag">${tag}</span>`).join('');
        
        groupDiv.innerHTML = `
            <div class="saved-group-header">
                <h3 class="saved-group-title">${savedGroup.name}</h3>
                <span class="saved-group-date">${date}</span>
            </div>
            <div class="saved-group-info">
                <span class="saved-group-course">📚 ${savedGroup.course}</span>
                <span class="saved-group-count">${savedGroup.groups.length} grupos • ${savedGroup.studentsCount} estudiantes</span>
            </div>
            ${savedGroup.description ? `<div class="saved-group-description">${savedGroup.description}</div>` : ''}
            ${savedGroup.tags.length > 0 ? `<div class="saved-group-tags">${tagsHtml}</div>` : ''}
            <div class="saved-group-actions">
                <button class="action-btn load" onclick="groupManager.loadGroups('${savedGroup.id}')">
                    📥 Cargar
                </button>
                <button class="action-btn edit" onclick="groupManager.editGroups('${savedGroup.id}')">
                    ✏️ Editar
                </button>
                <button class="action-btn delete" onclick="groupManager.deleteGroups('${savedGroup.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;
        
        return groupDiv;
    }

    // Acciones de grupos guardados
    loadGroups(groupId) {
        const savedGroup = this.savedGroups.find(g => g.id === groupId);
        if (!savedGroup) return;

        // Verificar que el curso existe
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        if (!cursosData[savedGroup.course]) {
            alert(`El curso "${savedGroup.course}" ya no existe. No se pueden cargar los grupos.`);
            return;
        }

        // Cargar grupos en el generador principal
        if (window.groupGenerator) {
            window.groupGenerator.currentCourse = savedGroup.course;
            window.groupGenerator.students = cursosData[savedGroup.course];
            window.groupGenerator.groups = JSON.parse(JSON.stringify(savedGroup.groups));
            window.groupGenerator.numberOfGroups = savedGroup.groups.length;
            
            // Actualizar interfaz
            const courseSelect = document.getElementById('course-select-groups');
            const groupsSelect = document.getElementById('groups-number');
            
            if (courseSelect) courseSelect.value = savedGroup.course;
            if (groupsSelect) groupsSelect.value = savedGroup.groups.length;
            
            window.groupGenerator.updateDisplay();
            window.groupGenerator.renderGroups();
            window.groupGenerator.showModal();
            window.groupGenerator.showActionButtons();
            window.groupGenerator.updateStatus(`Grupos "${savedGroup.name}" cargados exitosamente`);
        }

        this.closeManageModal();
    }

    editGroups(groupId) {
        const savedGroup = this.savedGroups.find(g => g.id === groupId);
        if (!savedGroup) return;

        const newName = prompt('Nuevo nombre:', savedGroup.name);
        if (newName && newName.trim()) {
            savedGroup.name = newName.trim();
            
            const newDescription = prompt('Nueva descripción:', savedGroup.description || '');
            savedGroup.description = newDescription || '';
            
            const newTags = prompt('Nuevas etiquetas (separadas por comas):', savedGroup.tags.join(', '));
            savedGroup.tags = newTags ? newTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            this.saveSavedGroups();
            this.refreshSavedGroupsList();
        }
    }

    deleteGroups(groupId) {
        const savedGroup = this.savedGroups.find(g => g.id === groupId);
        if (!savedGroup) return;

        if (confirm(`¿Estás seguro de que quieres eliminar "${savedGroup.name}"?`)) {
            this.savedGroups = this.savedGroups.filter(g => g.id !== groupId);
            this.saveSavedGroups();
            this.refreshSavedGroupsList();
        }
    }

    // Filtros y búsqueda
    populateFilterOptions() {
        const filterSelect = document.getElementById('filter-course');
        if (!filterSelect) return;

        const courses = [...new Set(this.savedGroups.map(g => g.course))];
        
        filterSelect.innerHTML = '<option value="">Todos los cursos</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            filterSelect.appendChild(option);
        });
    }

    filterSavedGroups() {
        const searchTerm = document.getElementById('search-groups').value.toLowerCase();
        const selectedCourse = document.getElementById('filter-course').value;
        
        const filteredGroups = this.savedGroups.filter(group => {
            const matchesSearch = !searchTerm || 
                group.name.toLowerCase().includes(searchTerm) ||
                group.description.toLowerCase().includes(searchTerm) ||
                group.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            const matchesCourse = !selectedCourse || group.course === selectedCourse;
            
            return matchesSearch && matchesCourse;
        });

        this.renderFilteredGroups(filteredGroups);
    }

    renderFilteredGroups(groups) {
        const container = document.getElementById('saved-groups-list');
        if (!container) return;

        if (groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">No se encontraron grupos</div>
                    <div class="empty-state-subtext">Intenta con otros términos de búsqueda</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        groups.forEach(savedGroup => {
            const groupDiv = this.createSavedGroupElement(savedGroup);
            container.appendChild(groupDiv);
        });
    }

    // Tab de cargar grupos
    refreshAvailableGroupsList() {
        const container = document.getElementById('available-groups-list');
        if (!container) return;

        if (this.savedGroups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No hay grupos disponibles</div>
                    <div class="empty-state-subtext">Guarda algunos grupos primero</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        this.savedGroups.forEach(savedGroup => {
            const groupDiv = this.createAvailableGroupElement(savedGroup);
            container.appendChild(groupDiv);
        });
    }

    createAvailableGroupElement(savedGroup) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'saved-group-item';
        groupDiv.dataset.groupId = savedGroup.id;
        
        const date = new Date(savedGroup.createdAt).toLocaleDateString();
        
        groupDiv.innerHTML = `
            <div class="saved-group-header">
                <h3 class="saved-group-title">
                    <input type="radio" name="selected-group" value="${savedGroup.id}" style="margin-right: 8px;">
                    ${savedGroup.name}
                </h3>
                <span class="saved-group-date">${date}</span>
            </div>
            <div class="saved-group-info">
                <span class="saved-group-course">📚 ${savedGroup.course}</span>
                <span class="saved-group-count">${savedGroup.groups.length} grupos • ${savedGroup.studentsCount} estudiantes</span>
            </div>
            ${savedGroup.description ? `<div class="saved-group-description">${savedGroup.description}</div>` : ''}
        `;
        
        // Habilitar botón de cargar cuando se seleccione
        const radio = groupDiv.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            const loadBtn = document.getElementById('load-selected-btn');
            if (loadBtn) loadBtn.disabled = false;
        });
        
        return groupDiv;
    }

    loadSelectedGroups() {
        const selectedRadio = document.querySelector('input[name="selected-group"]:checked');
        if (!selectedRadio) {
            alert('Selecciona un conjunto de grupos para cargar');
            return;
        }

        this.loadGroups(selectedRadio.value);
    }

    // Importar/Exportar
    exportAllGroups() {
        if (this.savedGroups.length === 0) {
            alert('No hay grupos guardados para exportar');
            return;
        }

        const dataStr = JSON.stringify(this.savedGroups, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `grupos-guardados-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    importGroups(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedGroups = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedGroups)) {
                    throw new Error('Formato de archivo inválido');
                }

                // Validar estructura básica
                const validGroups = importedGroups.filter(group => 
                    group.id && group.name && group.groups && Array.isArray(group.groups)
                );

                if (validGroups.length === 0) {
                    throw new Error('No se encontraron grupos válidos en el archivo');
                }

                // Evitar duplicados por ID
                const existingIds = new Set(this.savedGroups.map(g => g.id));
                const newGroups = validGroups.filter(g => !existingIds.has(g.id));

                if (newGroups.length === 0) {
                    this.showImportStatus('Todos los grupos ya existen', 'error');
                    return;
                }

                this.savedGroups.push(...newGroups);
                this.saveSavedGroups();
                
                this.showImportStatus(`${newGroups.length} grupos importados exitosamente`, 'success');
                this.refreshSavedGroupsList();
                
            } catch (error) {
                this.showImportStatus(`Error al importar: ${error.message}`, 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Limpiar input
    }

    showImportStatus(message, type) {
        const statusDiv = document.getElementById('import-status');
        if (!statusDiv) return;

        statusDiv.textContent = message;
        statusDiv.className = `import-status ${type}`;
        
        setTimeout(() => {
            statusDiv.className = 'import-status';
        }, 5000);
    }

    clearAllGroups() {
        if (this.savedGroups.length === 0) {
            alert('No hay grupos guardados para eliminar');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar TODOS los grupos guardados? Esta acción no se puede deshacer.')) {
            this.savedGroups = [];
            this.saveSavedGroups();
            this.refreshSavedGroupsList();
            this.refreshAvailableGroupsList();
            alert('Todos los grupos han sido eliminados');
        }
    }
}

// Inicializar gestor de grupos
let groupManager;
document.addEventListener('DOMContentLoaded', function() {
    const generator = new GroupGenerator();
    generator.init();
    
    // Hacer el generador accesible globalmente para el gestor
    window.groupGenerator = generator;
    
    // Inicializar gestor de grupos
    groupManager = new GroupManager();
    window.groupManager = groupManager;
    
    initializeTheme();
    showBackButton();
});
