// Libro de Clases - Sistema Educativo
class LibroClases {
    constructor() {
        // Inicialización segura de arrays
        this.cursos = this.safeParseArray('cursos');
        this.estudiantes = this.safeParseArray('estudiantes');
        this.asistencias = this.safeParseArray('asistencias');
        this.calificaciones = this.safeParseArray('calificaciones');
        this.observaciones = this.safeParseArray('observaciones');
        
        this.currentSection = 'dashboard';
        this.currentEstudiante = null;
        this.editingCursoId = null;
        
        this.init();
        this.loadSampleData();
        this.setupSyncListeners();
    }
    
    safeParseArray(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return [];
            
            const parsed = JSON.parse(data);
            
            // Verificar que sea un array
            if (Array.isArray(parsed)) {
                return parsed;
            } else {
                console.warn(`⚠️ Datos en localStorage.${key} no son un array, reinicializando...`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Error al parsear localStorage.${key}:`, error);
            return [];
        }
    }
    
    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderDashboard();
        // Sincronizar antes de renderizar por primera vez
        this.loadCursosFromGestion();
        this.renderCursos();
        this.renderEstudiantes();
    }
    
    loadSampleData() {
        // Cargar cursos desde el sistema de gestión existente
        this.loadCursosFromGestion();
        
        // Solo cargar datos de ejemplo si no hay cursos cargados
        if (this.cursos.length === 0) {
            this.cursos = [
                { id: 1, nombre: '1° Básico A', nivel: '1° Básico', letra: 'A', materias: ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia'] },
                { id: 2, nombre: '2° Básico B', nivel: '2° Básico', letra: 'B', materias: ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia'] },
                { id: 3, nombre: '3° Básico A', nivel: '3° Básico', letra: 'A', materias: ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia'] }
            ];
            this.saveData();
        }
        
        if (this.estudiantes.length === 0) {
            this.estudiantes = [
                { id: 1, nombre: 'María', apellido: 'González', rut: '12.345.678-9', cursoId: 1, email: 'maria@email.com', telefono: '+56912345678' },
                { id: 2, nombre: 'Juan', apellido: 'Pérez', rut: '98.765.432-1', cursoId: 1, email: 'juan@email.com', telefono: '+56987654321' },
                { id: 3, nombre: 'Ana', apellido: 'Martínez', rut: '11.222.333-4', cursoId: 2, email: 'ana@email.com', telefono: '+56911222333' },
                { id: 4, nombre: 'Carlos', apellido: 'López', rut: '55.666.777-8', cursoId: 2, email: 'carlos@email.com', telefono: '+56955666777' }
            ];
            this.saveData();
        }
    }
    
    loadCursosFromGestion() {
        try {
            // Cargar cursos desde el sistema de gestión existente
            const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
            const cursosExistentes = Object.keys(cursosData);
            
            console.log('🔍 Verificando cursos en Gestión de Cursos:', cursosExistentes);
            
            if (cursosExistentes.length > 0) {
                console.log('📚 Sincronizando cursos desde Gestión de Cursos:', cursosExistentes);
                
                let cursosAgregados = 0;
                let estudiantesAgregados = 0;
                
                // Convertir cursos del formato de gestión al formato del libro de clases
                cursosExistentes.forEach(nombreCurso => {
                    const estudiantesDelCurso = cursosData[nombreCurso] || [];
                    
                    // Verificar si el curso ya existe en el libro de clases
                    let cursoExistente = this.cursos.find(c => c.nombre === nombreCurso);
                    
                    if (!cursoExistente) {
                        // Parsear el nombre del curso para extraer nivel y letra
                        const { nivel, letra } = this.parsearNombreCurso(nombreCurso);
                        
                        const nuevoCurso = {
                            id: Date.now() + Math.random(), // ID único
                            nombre: nombreCurso,
                            nivel: nivel,
                            letra: letra,
                            materias: ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia', 'Inglés', 'Educación Física'],
                            origen: 'gestion' // Marcar que viene del sistema de gestión
                        };
                        
                        this.cursos.push(nuevoCurso);
                        cursoExistente = nuevoCurso;
                        cursosAgregados++;
                        console.log('✅ Curso agregado:', nombreCurso);
                    } else {
                        // Actualizar el curso existente si no tiene origen marcado
                        if (!cursoExistente.origen) {
                            cursoExistente.origen = 'gestion';
                            console.log('🔄 Curso actualizado con origen gestión:', nombreCurso);
                        }
                    }
                    
                    // Cargar estudiantes del curso
                    estudiantesDelCurso.forEach(estudiante => {
                        // Buscar estudiante por nombre completo y curso
                        const nombreCompleto = estudiante.nombre;
                        const estudianteExistente = this.estudiantes.find(e => {
                            const nombreEstudianteCompleto = `${e.nombre} ${e.apellido}`.trim();
                            return nombreEstudianteCompleto === nombreCompleto && e.cursoId === cursoExistente.id;
                        });
                        
                        if (!estudianteExistente) {
                            const partesNombre = nombreCompleto.split(' ');
                            const nombre = partesNombre[0] || nombreCompleto;
                            const apellido = partesNombre.slice(1).join(' ') || '';
                            
                            const nuevoEstudiante = {
                                id: Date.now() + Math.random(),
                                nombre: nombre,
                                apellido: apellido,
                                rut: estudiante.id || '',
                                cursoId: cursoExistente.id,
                                cursoNombre: nombreCurso,
                                email: '',
                                telefono: '',
                                origen: 'gestion'
                            };
                            
                            this.estudiantes.push(nuevoEstudiante);
                            estudiantesAgregados++;
                            console.log('✅ Estudiante agregado:', nombreCompleto, 'al curso', nombreCurso);
                        }
                    });
                });
                
                // Guardar los datos actualizados si hubo cambios
                if (cursosAgregados > 0 || estudiantesAgregados > 0) {
                    this.saveData();
                    console.log(`💾 Sincronización completada: ${cursosAgregados} cursos y ${estudiantesAgregados} estudiantes agregados`);
                } else {
                    console.log('✅ Datos ya sincronizados, no hay cambios');
                }
                
                return { cursosAgregados, estudiantesAgregados };
            } else {
                console.log('ℹ️ No hay cursos en Gestión de Cursos para sincronizar');
                return { cursosAgregados: 0, estudiantesAgregados: 0 };
            }
        } catch (error) {
            console.error('❌ Error al cargar cursos desde gestión:', error);
            return { cursosAgregados: 0, estudiantesAgregados: 0 };
        }
    }
    
    parsearNombreCurso(nombreCurso) {
        // Intentar parsear nombres como "8°A", "1° Básico A", "2° Medio B", etc.
        const patterns = [
            /^(\d+°)\s*([A-Z])$/i, // "8°A"
            /^(\d+°\s*Básico)\s*([A-Z])$/i, // "1° Básico A"
            /^(\d+°\s*Medio)\s*([A-Z])$/i, // "1° Medio A"
            /^([A-Z]+)\s*(\d+)$/i, // "A8" o similar
        ];
        
        for (const pattern of patterns) {
            const match = nombreCurso.match(pattern);
            if (match) {
                return {
                    nivel: match[1].trim(),
                    letra: match[2].trim().toUpperCase()
                };
            }
        }
        
        // Si no coincide con ningún patrón, usar valores por defecto
        return {
            nivel: nombreCurso,
            letra: 'A'
        };
    }
    
    setupSyncListeners() {
        // Listener para cambios en cursosData desde otras ventanas/pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'cursosData') {
                console.log('🔄 Detectado cambio en cursosData, sincronizando...');
                this.loadCursosFromGestion();
                this.renderCursos();
                this.renderEstudiantes();
                this.updateStats();
                this.showNotification('Cursos sincronizados desde Gestión de Cursos', 'success');
            }
        });
        
        // Listener para eventos personalizados de actualización de cursos
        window.addEventListener('cursosActualizados', (e) => {
            console.log('🔄 Evento cursosActualizados recibido, sincronizando...');
            this.loadCursosFromGestion();
            this.renderCursos();
            this.renderEstudiantes();
            this.updateStats();
            this.showNotification('Cursos sincronizados desde Gestión de Cursos', 'success');
        });
        
        // Botón para sincronización manual
        this.addSyncButton();
    }
    
    addSyncButton() {
        // Agregar botón de sincronización en la sección de cursos
        const cursosSection = document.getElementById('cursos-section');
        if (cursosSection) {
            const sectionHeader = cursosSection.querySelector('.section-header');
            if (sectionHeader) {
                const syncButton = document.createElement('button');
                syncButton.className = 'btn-secondary';
                syncButton.innerHTML = '🔄 Sincronizar con Gestión';
                syncButton.title = 'Sincronizar cursos desde Gestión de Cursos';
                syncButton.addEventListener('click', () => {
                    this.syncWithGestion();
                });
                
                // Botón de debug temporal
                const debugButton = document.createElement('button');
                debugButton.className = 'btn-warning';
                debugButton.innerHTML = '🔍 Debug Datos';
                debugButton.title = 'Mostrar datos de gestión en consola';
                debugButton.addEventListener('click', () => {
                    this.debugGestionData();
                });
                
                // Botón de reset temporal
                const resetButton = document.createElement('button');
                resetButton.className = 'btn-danger';
                resetButton.innerHTML = '🔄 Reset Datos';
                resetButton.title = 'Reiniciar datos del Libro de Clases';
                resetButton.addEventListener('click', () => {
                    if (confirm('¿Estás seguro de que quieres reiniciar todos los datos del Libro de Clases?')) {
                        this.resetLibroClasesData();
                    }
                });
                
                sectionHeader.appendChild(syncButton);
                sectionHeader.appendChild(debugButton);
                sectionHeader.appendChild(resetButton);
            }
        }
    }
    
    debugGestionData() {
        console.log('🔍 === DEBUG DATOS DE GESTIÓN ===');
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        console.log('📚 cursosData desde localStorage:', cursosData);
        console.log('📊 Número de cursos en gestión:', Object.keys(cursosData).length);
        
        const cursosLibro = this.cursos;
        console.log('📖 Cursos en Libro de Clases:', cursosLibro);
        console.log('📊 Número de cursos en libro:', Array.isArray(cursosLibro) ? cursosLibro.length : 'NO ES ARRAY');
        
        const estudiantesLibro = this.estudiantes;
        console.log('👥 Estudiantes en Libro de Clases:', estudiantesLibro);
        console.log('📊 Número de estudiantes en libro:', Array.isArray(estudiantesLibro) ? estudiantesLibro.length : 'NO ES ARRAY');
        
        // Verificar tipos de datos
        console.log('🔍 Tipos de datos:');
        console.log('- this.cursos es array:', Array.isArray(this.cursos));
        console.log('- this.estudiantes es array:', Array.isArray(this.estudiantes));
        console.log('- this.asistencias es array:', Array.isArray(this.asistencias));
        console.log('- this.calificaciones es array:', Array.isArray(this.calificaciones));
        console.log('- this.observaciones es array:', Array.isArray(this.observaciones));
        
        // Verificar si hay diferencias (solo si son arrays)
        if (Array.isArray(cursosLibro)) {
            const cursosGestion = Object.keys(cursosData);
            const cursosEnLibro = cursosLibro.map(c => c.nombre);
            
            console.log('🔄 Cursos en Gestión:', cursosGestion);
            console.log('🔄 Cursos en Libro:', cursosEnLibro);
            
            const cursosFaltantes = cursosGestion.filter(c => !cursosEnLibro.includes(c));
            if (cursosFaltantes.length > 0) {
                console.log('⚠️ Cursos faltantes en Libro de Clases:', cursosFaltantes);
            } else {
                console.log('✅ Todos los cursos están sincronizados');
            }
        }
        
        console.log('🔍 === FIN DEBUG ===');
        
        // Mostrar también en una notificación
        const cursosCount = Array.isArray(cursosLibro) ? cursosLibro.length : 'ERROR';
        this.showNotification(`Debug: ${Object.keys(cursosData).length} cursos en gestión, ${cursosCount} en libro`, 'info');
    }
    
    resetLibroClasesData() {
        console.log('🔄 Reiniciando datos del Libro de Clases...');
        
        // Limpiar localStorage del libro de clases
        localStorage.removeItem('cursos');
        localStorage.removeItem('estudiantes');
        localStorage.removeItem('asistencias');
        localStorage.removeItem('calificaciones');
        localStorage.removeItem('observaciones');
        
        // Reinicializar arrays
        this.cursos = [];
        this.estudiantes = [];
        this.asistencias = [];
        this.calificaciones = [];
        this.observaciones = [];
        
        // Cargar datos desde gestión
        this.loadSampleData();
        
        // Renderizar todo de nuevo
        this.renderDashboard();
        this.renderCursos();
        this.renderEstudiantes();
        this.updateStats();
        
        this.showNotification('Datos del Libro de Clases reiniciados correctamente', 'success');
        console.log('✅ Reinicio completado');
    }
    
    syncWithGestion() {
        console.log('🔄 Sincronización manual iniciada...');
        
        const resultado = this.loadCursosFromGestion();
        this.renderCursos();
        this.renderEstudiantes();
        this.updateStats();
        this.updateSyncInfo();
        
        let mensaje = 'Sincronización completada';
        if (resultado.cursosAgregados > 0 || resultado.estudiantesAgregados > 0) {
            mensaje += `: ${resultado.cursosAgregados} cursos y ${resultado.estudiantesAgregados} estudiantes agregados`;
        } else {
            mensaje += ': Los datos ya estaban sincronizados';
        }
        
        this.showNotification(mensaje, 'success');
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.navigateToSection(action);
            });
        });
        
        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Forms
        this.setupForms();
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    setupForms() {
        // Curso form
        const cursoForm = document.getElementById('curso-form');
        if (cursoForm) {
            cursoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCurso();
            });
        }
        
        // Estudiante form
        const estudianteForm = document.getElementById('estudiante-form');
        if (estudianteForm) {
            estudianteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEstudiante();
            });
        }
        
        // Observacion form
        const observacionForm = document.getElementById('observacion-form');
        if (observacionForm) {
            observacionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveObservacion();
            });
        }
        
        // Calificacion form
        const calificacionForm = document.getElementById('calificacion-form');
        if (calificacionForm) {
            calificacionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCalificacion();
            });
        }
        
        // Add buttons
        document.getElementById('add-curso-btn')?.addEventListener('click', () => {
            this.openModal('curso-modal');
        });
        
        document.getElementById('add-estudiante-btn')?.addEventListener('click', () => {
            this.openModal('estudiante-modal');
            this.populateEstudianteCursos();
        });
        
        document.getElementById('add-calificacion-btn')?.addEventListener('click', () => {
            this.openModal('calificacion-modal');
            this.populateCalificacionCursos();
        });
        
        // Filters
        document.getElementById('curso-filter')?.addEventListener('change', (e) => {
            this.filterEstudiantes(e.target.value);
        });
        
        document.getElementById('curso-asistencia')?.addEventListener('change', (e) => {
            this.loadAsistencia(e.target.value);
        });
        
        document.getElementById('fecha-asistencia')?.addEventListener('change', (e) => {
            const cursoId = document.getElementById('curso-asistencia').value;
            if (cursoId) {
                this.loadAsistencia(cursoId);
            }
        });
        
        document.getElementById('curso-calificaciones')?.addEventListener('change', (e) => {
            this.loadMaterias(e.target.value);
            this.loadCalificaciones(e.target.value);
        });
        
        document.getElementById('materia-calificaciones')?.addEventListener('change', (e) => {
            const cursoId = document.getElementById('curso-calificaciones').value;
            if (cursoId) {
                this.loadCalificaciones(cursoId, e.target.value);
            }
        });

        // Importación/Exportación
        this.setupImportExport();

        // Gestión Avanzada
        this.setupGestionAvanzada();

        // Informes Upload
        this.setupInformesUpload();

        // Tabs de anotaciones
        this.setupAnotacionesTabs();
    }
    
    navigateToSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Update active section
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            cursos: 'Gestión de Cursos',
            estudiantes: 'Gestión de Estudiantes',
            asistencia: 'Control de Asistencia',
            calificaciones: 'Registro de Calificaciones'
        };
        
        const subtitles = {
            dashboard: 'Resumen general del sistema educativo',
            cursos: 'Administra los cursos y materias',
            estudiantes: 'Gestiona la información de los estudiantes',
            asistencia: 'Controla la asistencia diaria',
            calificaciones: 'Registra y consulta las calificaciones'
        };
        
        document.querySelector('.page-title').textContent = titles[section];
        document.querySelector('.page-subtitle').textContent = subtitles[section];
        
        this.currentSection = section;
        
        // Load section-specific data
        switch (section) {
            case 'cursos':
                // Sincronizar con gestión antes de renderizar
                this.loadCursosFromGestion();
                this.renderCursos();
                break;
            case 'estudiantes':
                // Sincronizar antes de mostrar estudiantes
                this.loadCursosFromGestion();
                this.renderEstudiantes();
                this.populateEstudianteFilters();
                break;
            case 'asistencia':
                this.setupAsistencia();
                break;
            case 'calificaciones':
                this.setupCalificaciones();
                break;
        }
        
        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('active');
    }
    
    updateStats() {
        const totalEstudiantes = this.estudiantes.length;
        const cursosActivos = this.cursos.length;
        
        // Calculate today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = this.asistencias.filter(a => a.fecha === today);
        const presentToday = todayAttendance.filter(a => a.estado === 'presente').length;
        const attendancePercentage = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 89;
        
        // Calculate pending grades
        const pendingGrades = Math.floor(Math.random() * 20) + 5; // Simulated
        
        // Update DOM
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = cursosActivos;
            statNumbers[1].textContent = totalEstudiantes;
            statNumbers[2].textContent = `${attendancePercentage}%`;
            statNumbers[3].textContent = pendingGrades;
        }
    }
    
    renderDashboard() {
        this.updateStats();
        this.updateSyncInfo();
    }
    
    updateSyncInfo() {
        // Agregar información sobre cursos sincronizados en el dashboard
        const activityList = document.querySelector('.activity-list');
        if (activityList && Array.isArray(this.cursos) && Array.isArray(this.estudiantes)) {
            const cursosFromGestion = this.cursos.filter(c => c.origen === 'gestion').length;
            const estudiantesFromGestion = this.estudiantes.filter(e => e.origen === 'gestion').length;
            
            if (cursosFromGestion > 0) {
                // Verificar si ya existe el item de sincronización
                const existingSyncItem = activityList.querySelector('.sync-info-item');
                if (existingSyncItem) {
                    existingSyncItem.remove();
                }
                
                const syncInfoItem = document.createElement('div');
                syncInfoItem.className = 'activity-item sync-info-item';
                syncInfoItem.innerHTML = `
                    <div class="activity-content">
                        <h4>📚 Cursos sincronizados</h4>
                        <p>${cursosFromGestion} cursos y ${estudiantesFromGestion} estudiantes desde Gestión</p>
                    </div>
                    <span class="activity-time">Automático</span>
                `;
                
                // Insertar al principio de la lista
                activityList.insertBefore(syncInfoItem, activityList.firstChild);
            }
        }
    }
    
    renderCursos() {
        const container = document.getElementById('cursos-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Verificar que cursos sea un array
        if (!Array.isArray(this.cursos)) {
            console.error('❌ this.cursos no es un array:', this.cursos);
            this.cursos = [];
            return;
        }
        
        this.cursos.forEach(curso => {
            const estudiantesCurso = this.estudiantes.filter(e => e.cursoId === curso.id);
            const promedioGeneral = this.calculateCursoPromedio(curso.id);
            const asistenciaPromedio = this.calculateCursoAsistencia(curso.id);
            
            const cursoCard = document.createElement('div');
            cursoCard.className = 'curso-card';
            
            // Agregar clase especial si viene del sistema de gestión
            if (curso.origen === 'gestion') {
                cursoCard.classList.add('curso-from-gestion');
            }
            
            const origenBadge = curso.origen === 'gestion' 
                ? '<span class="curso-origen-badge">📚 Desde Gestión</span>' 
                : '';
            
            cursoCard.innerHTML = `
                <div class="curso-header">
                    <div class="curso-title-container">
                        <h3 class="curso-title">${curso.nombre}</h3>
                        ${origenBadge}
                    </div>
                    <div class="curso-actions">
                        <button class="btn-warning" onclick="libroClases.editCurso(${curso.id})">✏️</button>
                        <button class="btn-danger" onclick="libroClases.deleteCurso(${curso.id})" 
                                ${curso.origen === 'gestion' ? 'title="Este curso viene de Gestión de Cursos"' : ''}>🗑️</button>
                    </div>
                </div>
                <div class="curso-info">
                    <p><strong>Nivel:</strong> ${curso.nivel}</p>
                    <p><strong>Materias:</strong> ${curso.materias.join(', ')}</p>
                </div>
                <div class="curso-stats">
                    <div class="curso-stat">
                        <div class="curso-stat-number">${estudiantesCurso.length}</div>
                        <div class="curso-stat-label">Estudiantes</div>
                    </div>
                    <div class="curso-stat">
                        <div class="curso-stat-number">${promedioGeneral.toFixed(1)}</div>
                        <div class="curso-stat-label">Promedio</div>
                    </div>
                    <div class="curso-stat">
                        <div class="curso-stat-number">${asistenciaPromedio}%</div>
                        <div class="curso-stat-label">Asistencia</div>
                    </div>
                </div>
            `;
            
            container.appendChild(cursoCard);
        });
    }
    
    renderEstudiantes() {
        const tbody = document.getElementById('estudiantes-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Verificar que estudiantes sea un array
        if (!Array.isArray(this.estudiantes)) {
            console.error('❌ this.estudiantes no es un array:', this.estudiantes);
            this.estudiantes = [];
            return;
        }
        
        this.estudiantes.forEach(estudiante => {
            const curso = this.cursos.find(c => c.id === estudiante.cursoId);
            const observaciones = this.observaciones.filter(o => o.estudianteId === estudiante.id);
            const promedio = this.calculateEstudiantePromedio(estudiante.id);
            const asistencia = this.calculateEstudianteAsistencia(estudiante.id);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="estudiante-nombre" style="cursor: pointer; color: var(--primary-color); text-decoration: underline;" onclick="libroClases.openFichaEstudiante(${estudiante.id})">${estudiante.nombres || estudiante.nombre} ${estudiante.apellidoPaterno || estudiante.apellido}</div>
                    <div class="estudiante-rut">${estudiante.rut}</div>
                </td>
                <td>
                    <div class="estudiante-curso">${curso ? curso.nombre : 'Sin curso'}</div>
                </td>
                <td>
                    <div class="observaciones-badges">
                        ${this.renderObservacionesBadges(observaciones)}
                    </div>
                </td>
                <td>
                    <span class="promedio-badge ${this.getPromedioClass(promedio)}">${promedio.toFixed(1)}</span>
                </td>
                <td>
                    <span class="asistencia-percentage ${this.getAsistenciaClass(asistencia)}">${asistencia}%</span>
                </td>
                <td>
                    <button class="btn-info btn-sm" onclick="libroClases.openFichaEstudiante(${estudiante.id})" style="margin-right: 0.5rem;" title="Ver Ficha">👤</button>
                    <button class="btn-primary btn-sm" onclick="libroClases.addObservacion(${estudiante.id})" style="margin-right: 0.5rem;" title="Agregar Observación">📝</button>
                    <button class="btn-warning btn-sm" onclick="libroClases.editEstudiante(${estudiante.id})" style="margin-right: 0.5rem;" title="Editar">✏️</button>
                    <button class="btn-danger btn-sm" onclick="libroClases.deleteEstudiante(${estudiante.id})" title="Eliminar">🗑️</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    renderObservacionesBadges(observaciones) {
        const positivas = observaciones.filter(o => o.tipo === 'positiva').length;
        const negativas = observaciones.filter(o => o.tipo === 'negativa').length;
        const neutrales = observaciones.filter(o => o.tipo === 'neutral').length;
        
        let badges = '';
        if (positivas > 0) badges += `<span class="observacion-badge positiva">+${positivas}</span>`;
        if (negativas > 0) badges += `<span class="observacion-badge negativa">-${negativas}</span>`;
        if (neutrales > 0) badges += `<span class="observacion-badge neutral">${neutrales}</span>`;
        
        return badges || '<span class="text-muted">Sin observaciones</span>';
    }
    
    getPromedioClass(promedio) {
        if (promedio >= 6.0) return 'excelente';
        if (promedio >= 5.0) return 'bueno';
        if (promedio >= 4.0) return 'regular';
        return 'insuficiente';
    }
    
    getAsistenciaClass(asistencia) {
        if (asistencia >= 85) return 'alta';
        if (asistencia >= 70) return 'media';
        return 'baja';
    }
    
    calculateEstudiantePromedio(estudianteId) {
        const califs = this.calificaciones.filter(c => c.estudianteId === estudianteId);
        if (califs.length === 0) return 0;
        
        const suma = califs.reduce((acc, cal) => acc + cal.nota, 0);
        return suma / califs.length;
    }
    
    calculateEstudianteAsistencia(estudianteId) {
        const asists = this.asistencias.filter(a => a.estudianteId === estudianteId);
        if (asists.length === 0) return 100;
        
        const presentes = asists.filter(a => a.estado === 'presente' || a.estado === 'justificado').length;
        return Math.round((presentes / asists.length) * 100);
    }
    
    calculateCursoPromedio(cursoId) {
        const estudiantesCurso = this.estudiantes.filter(e => e.cursoId === cursoId);
        if (estudiantesCurso.length === 0) return 0;
        
        const promedios = estudiantesCurso.map(e => this.calculateEstudiantePromedio(e.id));
        const suma = promedios.reduce((acc, p) => acc + p, 0);
        return suma / promedios.length;
    }
    
    calculateCursoAsistencia(cursoId) {
        const estudiantesCurso = this.estudiantes.filter(e => e.cursoId === cursoId);
        if (estudiantesCurso.length === 0) return 100;
        
        const asistencias = estudiantesCurso.map(e => this.calculateEstudianteAsistencia(e.id));
        const suma = asistencias.reduce((acc, a) => acc + a, 0);
        return Math.round(suma / asistencias.length);
    }
    
    // Modal functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
    
    // CRUD Operations
    saveCurso() {
        const nombre = document.getElementById('curso-nombre').value.trim();
        const nivel = document.getElementById('curso-nivel').value;
        const letra = document.getElementById('curso-letra').value.trim();
        const materiasText = document.getElementById('curso-materias').value.trim();

        if (!nombre || !nivel || !letra || !materiasText) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        const materias = materiasText.split(',').map(m => m.trim()).filter(m => m);

        if (this.editingCursoId) {
            // Editar curso existente
            const cursoIndex = this.cursos.findIndex(c => c.id === this.editingCursoId);
            if (cursoIndex !== -1) {
                this.cursos[cursoIndex] = {
                    ...this.cursos[cursoIndex],
                    nombre,
                    nivel,
                    letra,
                    materias
                };
                this.showNotification('Curso actualizado exitosamente', 'success');
            }
            this.editingCursoId = null;
        } else {
            // Crear nuevo curso
            const curso = {
                id: Date.now(),
                nombre,
                nivel,
                letra,
                materias,
                origen: 'manual'
            };
            this.cursos.push(curso);
            this.showNotification('Curso agregado exitosamente', 'success');
        }

        this.saveData();
        this.renderCursos();
        this.closeModal('curso-modal');
        
        // Limpiar formulario y resetear título
        document.getElementById('curso-form').reset();
        document.getElementById('curso-modal-title').textContent = 'Agregar Curso';
    }
    
    saveEstudiante() {
        const nombres = document.getElementById('estudiante-nombres').value;
        const apellidoPaterno = document.getElementById('estudiante-apellido-paterno').value;
        const apellidoMaterno = document.getElementById('estudiante-apellido-materno').value;
        const rut = document.getElementById('estudiante-rut').value;
        const cursoId = parseInt(document.getElementById('estudiante-curso').value);
        const email = document.getElementById('estudiante-email').value;
        const telefono = document.getElementById('estudiante-telefono').value;
        const telefonoMadre = document.getElementById('estudiante-telefono-madre').value;
        const telefonoPadre = document.getElementById('estudiante-telefono-padre').value;
        
        if (this.editingEstudianteId) {
            // Editar estudiante existente
            const index = this.estudiantes.findIndex(e => e.id === this.editingEstudianteId);
            if (index !== -1) {
                this.estudiantes[index] = {
                    ...this.estudiantes[index],
                    nombres,
                    apellidoPaterno,
                    apellidoMaterno,
                    rut,
                    cursoId,
                    email,
                    telefono,
                    telefonoMadre,
                    telefonoPadre
                };
                this.showNotification('Estudiante actualizado exitosamente', 'success');
            }
            this.editingEstudianteId = null;
        } else {
            // Crear nuevo estudiante
            const estudiante = {
                id: Date.now(),
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                rut,
                cursoId,
                email,
                telefono,
                telefonoMadre,
                telefonoPadre
            };
            this.estudiantes.push(estudiante);
            this.showNotification('Estudiante agregado exitosamente', 'success');
        }
        
        this.saveData();
        this.renderEstudiantes();
        this.updateStats();
        this.closeModal('estudiante-modal');
        
        // Resetear el título del modal
        document.getElementById('estudiante-modal-title').textContent = 'Agregar Estudiante';
    }
    
    addObservacion(estudianteId) {
        this.currentEstudiante = estudianteId;
        this.openModal('observacion-modal');
        
        // Set today's date
        document.getElementById('observacion-fecha').value = new Date().toISOString().split('T')[0];
    }
    
    saveObservacion() {
        const tipo = document.getElementById('observacion-tipo').value;
        const descripcion = document.getElementById('observacion-descripcion').value;
        const fecha = document.getElementById('observacion-fecha').value;
        
        const observacion = {
            id: Date.now(),
            estudianteId: this.currentEstudiante,
            tipo,
            descripcion,
            fecha,
            timestamp: new Date().toISOString()
        };
        
        this.observaciones.push(observacion);
        this.saveData();
        this.renderEstudiantes();
        this.closeModal('observacion-modal');
        this.showNotification('Observación agregada exitosamente', 'success');
    }
    
    // Setup functions
    setupAsistencia() {
        this.populateAsistenciaCursos();
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-asistencia').value = today;
    }
    
    setupCalificaciones() {
        this.populateCalificacionesCursos();
    }
    
    populateEstudianteCursos() {
        const select = document.getElementById('estudiante-curso');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar curso</option>';
        this.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    }
    
    populateEstudianteFilters() {
        const select = document.getElementById('curso-filter');
        if (!select) return;
        
        select.innerHTML = '<option value="">Todos los cursos</option>';
        
        // Verificar que cursos sea un array
        if (!Array.isArray(this.cursos)) {
            console.error('❌ this.cursos no es un array en populateEstudianteFilters:', this.cursos);
            return;
        }
        
        this.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    }
    
    populateAsistenciaCursos() {
        const select = document.getElementById('curso-asistencia');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar curso</option>';
        
        // Verificar que cursos sea un array
        if (!Array.isArray(this.cursos)) {
            console.error('❌ this.cursos no es un array en populateAsistenciaCursos:', this.cursos);
            return;
        }
        
        this.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    }
    
    populateCalificacionesCursos() {
        const select = document.getElementById('curso-calificaciones');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar curso</option>';
        
        // Verificar que cursos sea un array
        if (!Array.isArray(this.cursos)) {
            console.error('❌ this.cursos no es un array en populateCalificacionesCursos:', this.cursos);
            return;
        }
        
        this.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    }
    
    loadAsistencia(cursoId) {
        const container = document.getElementById('asistencia-container');
        const fecha = document.getElementById('fecha-asistencia').value;
        
        if (!container || !cursoId || !fecha) return;
        
        const curso = this.cursos.find(c => c.id == cursoId);
        const estudiantes = this.estudiantes.filter(e => e.cursoId == cursoId);
        
        container.innerHTML = `
            <div class="asistencia-header">
                <div class="asistencia-info">
                    <h3>${curso.nombre}</h3>
                    <p>Fecha: ${new Date(fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <div class="asistencia-summary">
                    <span>Total: ${estudiantes.length}</span>
                    <span id="presentes-count">Presentes: 0</span>
                    <span id="ausentes-count">Ausentes: 0</span>
                </div>
            </div>
            <div class="asistencia-list" id="asistencia-list">
                ${estudiantes.map(estudiante => this.renderAsistenciaItem(estudiante, fecha)).join('')}
            </div>
        `;
        
        this.updateAsistenciaSummary();
    }
    
    renderAsistenciaItem(estudiante, fecha) {
        const asistencia = this.asistencias.find(a => 
            a.estudianteId === estudiante.id && a.fecha === fecha
        );
        
        const estado = asistencia ? asistencia.estado : '';
        
        return `
            <div class="asistencia-item">
                <div class="estudiante-info">
                    <div class="estudiante-avatar">${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}</div>
                    <div class="estudiante-details">
                        <h4>${estudiante.nombre} ${estudiante.apellido}</h4>
                        <p>${estudiante.rut}</p>
                    </div>
                </div>
                <div class="asistencia-controls">
                    <button class="asistencia-btn presente ${estado === 'presente' ? 'active' : ''}" 
                            onclick="libroClases.markAsistencia(${estudiante.id}, '${fecha}', 'presente')">
                        Presente
                    </button>
                    <button class="asistencia-btn ausente ${estado === 'ausente' ? 'active' : ''}" 
                            onclick="libroClases.markAsistencia(${estudiante.id}, '${fecha}', 'ausente')">
                        Ausente
                    </button>
                    <button class="asistencia-btn justificado ${estado === 'justificado' ? 'active' : ''}" 
                            onclick="libroClases.markAsistencia(${estudiante.id}, '${fecha}', 'justificado')">
                        Justificado
                    </button>
                </div>
            </div>
        `;
    }
    
    markAsistencia(estudianteId, fecha, estado) {
        // Remove existing attendance record
        this.asistencias = this.asistencias.filter(a => 
            !(a.estudianteId === estudianteId && a.fecha === fecha)
        );
        
        // Add new attendance record
        this.asistencias.push({
            id: Date.now(),
            estudianteId,
            fecha,
            estado,
            timestamp: new Date().toISOString()
        });
        
        this.saveData();
        
        // Update UI
        const cursoId = document.getElementById('curso-asistencia').value;
        this.loadAsistencia(cursoId);
        this.updateStats();
    }
    
    updateAsistenciaSummary() {
        const fecha = document.getElementById('fecha-asistencia').value;
        const cursoId = document.getElementById('curso-asistencia').value;
        
        if (!fecha || !cursoId) return;
        
        const estudiantes = this.estudiantes.filter(e => e.cursoId == cursoId);
        const asistenciasHoy = this.asistencias.filter(a => a.fecha === fecha);
        
        const presentes = asistenciasHoy.filter(a => a.estado === 'presente').length;
        const ausentes = asistenciasHoy.filter(a => a.estado === 'ausente').length;
        
        document.getElementById('presentes-count').textContent = `Presentes: ${presentes}`;
        document.getElementById('ausentes-count').textContent = `Ausentes: ${ausentes}`;
    }
    
    // Utility functions
    saveData() {
        localStorage.setItem('cursos', JSON.stringify(this.cursos));
        localStorage.setItem('estudiantes', JSON.stringify(this.estudiantes));
        localStorage.setItem('asistencias', JSON.stringify(this.asistencias));
        localStorage.setItem('calificaciones', JSON.stringify(this.calificaciones));
        localStorage.setItem('observaciones', JSON.stringify(this.observaciones));
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    filterEstudiantes(cursoId) {
        const rows = document.querySelectorAll('#estudiantes-tbody tr');
        
        rows.forEach(row => {
            if (!cursoId) {
                row.style.display = '';
            } else {
                const estudiante = this.estudiantes.find(e => 
                    `${e.nombre} ${e.apellido}` === row.querySelector('.estudiante-nombre').textContent
                );
                
                if (estudiante && estudiante.cursoId == cursoId) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }
    
    // Delete functions
    editCurso(cursoId) {
        const curso = this.cursos.find(c => c.id === cursoId);
        if (!curso) {
            this.showNotification('Curso no encontrado', 'error');
            return;
        }

        // Llenar el formulario con los datos del curso
        document.getElementById('curso-nombre').value = curso.nombre;
        document.getElementById('curso-nivel').value = curso.nivel;
        document.getElementById('curso-letra').value = curso.letra;
        document.getElementById('curso-materias').value = curso.materias.join(', ');

        // Cambiar el título del modal
        document.getElementById('curso-modal-title').textContent = 'Editar Curso';
        
        // Guardar el ID para la edición
        this.editingCursoId = cursoId;
        
        this.openModal('curso-modal');
    }

    deleteCurso(cursoId) {
        if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            this.cursos = this.cursos.filter(c => c.id !== cursoId);
            this.saveData();
            this.renderCursos();
            this.showNotification('Curso eliminado exitosamente', 'success');
        }
    }
    
    editEstudiante(estudianteId) {
        const estudiante = this.estudiantes.find(e => e.id === estudianteId);
        if (!estudiante) {
            this.showNotification('Estudiante no encontrado', 'error');
            return;
        }

        // Llenar el formulario con los datos del estudiante
        document.getElementById('estudiante-nombres').value = estudiante.nombres || estudiante.nombre || '';
        document.getElementById('estudiante-apellido-paterno').value = estudiante.apellidoPaterno || estudiante.apellido || '';
        document.getElementById('estudiante-apellido-materno').value = estudiante.apellidoMaterno || '';
        document.getElementById('estudiante-rut').value = estudiante.rut || '';
        document.getElementById('estudiante-email').value = estudiante.email || '';
        document.getElementById('estudiante-telefono').value = estudiante.telefono || '';
        document.getElementById('estudiante-telefono-madre').value = estudiante.telefonoMadre || '';
        document.getElementById('estudiante-telefono-padre').value = estudiante.telefonoPadre || '';

        // Configurar el curso
        this.populateEstudianteCursos();
        setTimeout(() => {
            document.getElementById('estudiante-curso').value = estudiante.cursoId;
        }, 100);

        // Cambiar el título del modal
        document.getElementById('estudiante-modal-title').textContent = 'Editar Estudiante';
        
        // Guardar el ID para la edición
        this.editingEstudianteId = estudianteId;
        
        this.openModal('estudiante-modal');
    }

    deleteEstudiante(estudianteId) {
        if (confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
            this.estudiantes = this.estudiantes.filter(e => e.id !== estudianteId);
            this.saveData();
            this.renderEstudiantes();
            this.showNotification('Estudiante eliminado exitosamente', 'success');
        }
    }

    // ========================================
    // FICHA DE ESTUDIANTE
    // ========================================

    openFichaEstudiante(estudianteId) {
        const estudiante = this.estudiantes.find(e => e.id === estudianteId);
        if (!estudiante) {
            this.showNotification('Estudiante no encontrado', 'error');
            return;
        }

        this.currentEstudiante = estudiante;
        this.loadFichaEstudiante(estudiante);
        this.openModal('ficha-estudiante-modal');
    }

    loadFichaEstudiante(estudiante) {
        const curso = this.cursos.find(c => c.id === estudiante.cursoId);
        
        // Cargar información personal
        document.getElementById('ficha-nombres').textContent = estudiante.nombres || estudiante.nombre || '-';
        document.getElementById('ficha-apellido-paterno').textContent = estudiante.apellidoPaterno || estudiante.apellido || '-';
        document.getElementById('ficha-apellido-materno').textContent = estudiante.apellidoMaterno || '-';
        document.getElementById('ficha-rut').textContent = estudiante.rut || '-';
        document.getElementById('ficha-curso').textContent = curso ? curso.nombre : '-';
        document.getElementById('ficha-email').textContent = estudiante.email || '-';
        document.getElementById('ficha-telefono-madre').textContent = estudiante.telefonoMadre || '-';
        document.getElementById('ficha-telefono-padre').textContent = estudiante.telefonoPadre || '-';

        // Cargar anotaciones
        this.loadAnotacionesEstudiante(estudiante.id);
        
        // Cargar notas
        this.loadNotasEstudiante(estudiante.id);
        
        // Cargar informes
        this.loadInformesEstudiante(estudiante.id);

        // Configurar título del modal
        const nombreCompleto = `${estudiante.nombres || estudiante.nombre} ${estudiante.apellidoPaterno || estudiante.apellido}`.trim();
        document.getElementById('ficha-estudiante-title').textContent = `Ficha de ${nombreCompleto}`;
    }

    loadAnotacionesEstudiante(estudianteId) {
        const anotaciones = this.observaciones.filter(o => o.estudianteId === estudianteId);
        
        const positivas = anotaciones.filter(a => a.tipo === 'positiva');
        const negativas = anotaciones.filter(a => a.tipo === 'negativa');
        const neutrales = anotaciones.filter(a => a.tipo === 'neutral');

        // Actualizar contadores
        document.getElementById('count-positivas').textContent = positivas.length;
        document.getElementById('count-negativas').textContent = negativas.length;
        document.getElementById('count-neutrales').textContent = neutrales.length;

        // Renderizar listas
        this.renderAnotacionesList('anotaciones-positivas', positivas);
        this.renderAnotacionesList('anotaciones-negativas', negativas);
        this.renderAnotacionesList('anotaciones-neutrales', neutrales);
    }

    renderAnotacionesList(containerId, anotaciones) {
        const container = document.getElementById(containerId);
        
        if (anotaciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay anotaciones de este tipo.</p>';
            return;
        }

        container.innerHTML = anotaciones.map(anotacion => `
            <div class="anotacion-item">
                <div class="anotacion-header">
                    <span class="anotacion-fecha">${new Date(anotacion.fecha).toLocaleDateString()}</span>
                    <span class="anotacion-tipo ${anotacion.tipo}">${anotacion.tipo.toUpperCase()}</span>
                </div>
                <div class="anotacion-descripcion">${anotacion.descripcion}</div>
            </div>
        `).join('');
    }

    loadNotasEstudiante(estudianteId) {
        const calificaciones = this.calificaciones.filter(c => c.estudianteId === estudianteId);
        const curso = this.cursos.find(c => c.id === this.currentEstudiante.cursoId);
        const materias = curso ? curso.materias : [];

        const container = document.getElementById('notas-container');
        
        if (materias.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay materias configuradas para este curso.</p>';
            return;
        }

        container.innerHTML = materias.map(materia => {
            const notasMateria = calificaciones.filter(c => c.materia === materia);
            const promedio = this.calculatePromedioMateria(notasMateria);
            const promedioClass = this.getPromedioClass(promedio);

            return `
                <div class="asignatura-card">
                    <div class="asignatura-header">
                        <span class="asignatura-nombre">${materia}</span>
                        <span class="asignatura-promedio ${promedioClass}">${promedio.toFixed(1)}</span>
                    </div>
                    <div class="notas-list">
                        ${notasMateria.length === 0 ? 
                            '<p class="text-muted">Sin calificaciones</p>' :
                            notasMateria.map(nota => `
                                <div class="nota-item">
                                    <span class="nota-evaluacion">${nota.evaluacion}</span>
                                    <span class="nota-valor">${nota.nota}</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    calculatePromedioMateria(notas) {
        if (notas.length === 0) return 0;
        const suma = notas.reduce((acc, nota) => acc + parseFloat(nota.nota), 0);
        return suma / notas.length;
    }

    loadInformesEstudiante(estudianteId) {
        // Cargar informes desde localStorage
        const informes = JSON.parse(localStorage.getItem(`informes_${estudianteId}`) || '[]');
        const container = document.getElementById('informes-container');

        if (informes.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay informes cargados.</p>';
            return;
        }

        container.innerHTML = informes.map(informe => `
            <div class="informe-item">
                <div class="informe-info">
                    <span class="informe-icon">📄</span>
                    <div class="informe-details">
                        <h5>${informe.nombre}</h5>
                        <p>Subido el ${new Date(informe.fecha).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="informe-actions">
                    <button class="btn-secondary btn-sm" onclick="libroClases.downloadInforme('${informe.id}')">📥 Descargar</button>
                    <button class="btn-danger btn-sm" onclick="libroClases.deleteInforme('${estudianteId}', '${informe.id}')">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // ========================================
    // IMPORTACIÓN/EXPORTACIÓN EXCEL
    // ========================================

    setupImportExport() {
        // Descargar plantilla
        document.getElementById('download-template-btn').addEventListener('click', () => {
            this.downloadTemplate();
        });

        // Importar Excel
        document.getElementById('import-excel-btn').addEventListener('click', () => {
            document.getElementById('import-excel-input').click();
        });

        document.getElementById('import-excel-input').addEventListener('change', (e) => {
            this.importExcel(e.target.files[0]);
        });

        // Exportar Excel
        document.getElementById('export-excel-btn').addEventListener('click', () => {
            this.exportExcel();
        });
    }

    downloadTemplate() {
        const templateData = [
            {
                'Nombres': 'Juan Carlos',
                'Apellido Paterno': 'González',
                'Apellido Materno': 'Pérez',
                'RUT': '12.345.678-9',
                'Curso': '1° Básico A',
                'Email': 'juan.gonzalez@email.com',
                'Teléfono': '+56912345678',
                'Anotaciones Positivas': 'Excelente comportamiento en clase; Participación activa',
                'Anotaciones Negativas': '',
                'Anotaciones Neutrales': 'Llegó tarde el 15/03',
                'Matemáticas': '6.5;5.8;7.0',
                'Lenguaje': '6.0;6.2;5.9',
                'Ciencias': '7.0;6.8',
                'Historia': '6.5;6.0;6.3'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Estudiantes');
        
        XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
        this.showNotification('Plantilla descargada correctamente', 'success');
    }

    importExcel(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                this.processImportedData(jsonData);
            } catch (error) {
                console.error('Error al importar Excel:', error);
                this.showNotification('Error al importar el archivo Excel', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    processImportedData(data) {
        let estudiantesImportados = 0;
        let errores = [];

        data.forEach((row, index) => {
            try {
                // Validar datos requeridos
                if (!row.Nombres || !row['Apellido Paterno'] || !row.RUT || !row.Curso) {
                    errores.push(`Fila ${index + 2}: Faltan datos requeridos`);
                    return;
                }

                // Buscar curso
                const curso = this.cursos.find(c => c.nombre === row.Curso);
                if (!curso) {
                    errores.push(`Fila ${index + 2}: Curso "${row.Curso}" no encontrado`);
                    return;
                }

                // Crear estudiante
                const estudiante = {
                    id: Date.now() + Math.random(),
                    nombres: row.Nombres,
                    apellidoPaterno: row['Apellido Paterno'],
                    apellidoMaterno: row['Apellido Materno'] || '',
                    rut: row.RUT,
                    cursoId: curso.id,
                    email: row.Email || '',
                    telefono: row.Teléfono || ''
                };

                // Verificar si ya existe
                const existente = this.estudiantes.find(e => e.rut === estudiante.rut);
                if (existente) {
                    errores.push(`Fila ${index + 2}: Estudiante con RUT ${estudiante.rut} ya existe`);
                    return;
                }

                this.estudiantes.push(estudiante);

                // Importar anotaciones
                this.importAnotaciones(estudiante.id, row);

                // Importar notas
                this.importNotas(estudiante.id, row, curso.materias);

                estudiantesImportados++;
            } catch (error) {
                errores.push(`Fila ${index + 2}: ${error.message}`);
            }
        });

        this.saveData();
        this.renderEstudiantes();
        this.updateStats();

        // Mostrar resultado
        let mensaje = `${estudiantesImportados} estudiantes importados correctamente`;
        if (errores.length > 0) {
            mensaje += `\n\nErrores encontrados:\n${errores.join('\n')}`;
        }
        
        this.showNotification(mensaje, estudiantesImportados > 0 ? 'success' : 'warning');
    }

    importAnotaciones(estudianteId, row) {
        const tipos = ['Positivas', 'Negativas', 'Neutrales'];
        
        tipos.forEach(tipo => {
            const anotaciones = row[`Anotaciones ${tipo}`];
            if (anotaciones && anotaciones.trim()) {
                const lista = anotaciones.split(';').map(a => a.trim()).filter(a => a);
                
                lista.forEach(descripcion => {
                    this.observaciones.push({
                        id: Date.now() + Math.random(),
                        estudianteId: estudianteId,
                        tipo: tipo.toLowerCase().slice(0, -1), // Remover 's' final
                        descripcion: descripcion,
                        fecha: new Date().toISOString()
                    });
                });
            }
        });
    }

    importNotas(estudianteId, row, materias) {
        materias.forEach(materia => {
            const notas = row[materia];
            if (notas && notas.trim()) {
                const lista = notas.split(';').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                
                lista.forEach((nota, index) => {
                    this.calificaciones.push({
                        id: Date.now() + Math.random(),
                        estudianteId: estudianteId,
                        materia: materia,
                        evaluacion: `Evaluación ${index + 1}`,
                        nota: nota,
                        fecha: new Date().toISOString()
                    });
                });
            }
        });
    }

    exportExcel() {
        const data = this.estudiantes.map(estudiante => {
            const curso = this.cursos.find(c => c.id === estudiante.cursoId);
            const anotaciones = this.observaciones.filter(o => o.estudianteId === estudiante.id);
            const calificaciones = this.calificaciones.filter(c => c.estudianteId === estudiante.id);

            const row = {
                'Nombres': estudiante.nombres || estudiante.nombre || '',
                'Apellido Paterno': estudiante.apellidoPaterno || estudiante.apellido || '',
                'Apellido Materno': estudiante.apellidoMaterno || '',
                'RUT': estudiante.rut || '',
                'Curso': curso ? curso.nombre : '',
                'Email': estudiante.email || '',
                'Teléfono': estudiante.telefono || '',
                'Anotaciones Positivas': anotaciones.filter(a => a.tipo === 'positiva').map(a => a.descripcion).join('; '),
                'Anotaciones Negativas': anotaciones.filter(a => a.tipo === 'negativa').map(a => a.descripcion).join('; '),
                'Anotaciones Neutrales': anotaciones.filter(a => a.tipo === 'neutral').map(a => a.descripcion).join('; ')
            };

            // Agregar notas por materia
            if (curso && curso.materias) {
                curso.materias.forEach(materia => {
                    const notasMateria = calificaciones.filter(c => c.materia === materia).map(c => c.nota);
                    row[materia] = notasMateria.join(';');
                });
            }

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
        
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `estudiantes_${fecha}.xlsx`);
        
        this.showNotification('Datos exportados correctamente', 'success');
    }

    // ========================================
    // GESTIÓN DE INFORMES PDF
    // ========================================

    setupInformesUpload() {
        document.getElementById('upload-informe-btn').addEventListener('click', () => {
            document.getElementById('upload-informe').click();
        });

        document.getElementById('upload-informe').addEventListener('change', (e) => {
            this.uploadInforme(e.target.files[0]);
        });
    }

    uploadInforme(file) {
        if (!file || !this.currentEstudiante) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const informe = {
                id: Date.now().toString(),
                nombre: file.name,
                fecha: new Date().toISOString(),
                data: e.target.result
            };

            const informes = JSON.parse(localStorage.getItem(`informes_${this.currentEstudiante.id}`) || '[]');
            informes.push(informe);
            localStorage.setItem(`informes_${this.currentEstudiante.id}`, JSON.stringify(informes));

            this.loadInformesEstudiante(this.currentEstudiante.id);
            this.showNotification('Informe subido correctamente', 'success');
        };
        reader.readAsDataURL(file);
    }

    downloadInforme(informeId) {
        if (!this.currentEstudiante) return;

        const informes = JSON.parse(localStorage.getItem(`informes_${this.currentEstudiante.id}`) || '[]');
        const informe = informes.find(i => i.id === informeId);

        if (informe) {
            const link = document.createElement('a');
            link.href = informe.data;
            link.download = informe.nombre;
            link.click();
        }
    }

    deleteInforme(estudianteId, informeId) {
        if (confirm('¿Estás seguro de que quieres eliminar este informe?')) {
            const informes = JSON.parse(localStorage.getItem(`informes_${estudianteId}`) || '[]');
            const nuevosInformes = informes.filter(i => i.id !== informeId);
            localStorage.setItem(`informes_${estudianteId}`, JSON.stringify(nuevosInformes));

            this.loadInformesEstudiante(estudianteId);
            this.showNotification('Informe eliminado correctamente', 'success');
        }
    }

    // ========================================
    // GESTIÓN AVANZADA
    // ========================================

    setupGestionAvanzada() {
        // Botón para abrir gestión avanzada
        document.getElementById('gestion-avanzada-btn').addEventListener('click', () => {
            this.openModal('gestion-avanzada-modal');
        });

        // Descargar plantilla avanzada
        document.getElementById('download-advanced-template-btn').addEventListener('click', () => {
            this.downloadAdvancedTemplate();
        });

        // Importar Excel avanzado
        document.getElementById('import-advanced-excel-btn').addEventListener('click', () => {
            document.getElementById('import-advanced-excel-input').click();
        });

        document.getElementById('import-advanced-excel-input').addEventListener('change', (e) => {
            this.importAdvancedExcel(e.target.files[0]);
        });

        // Exportar Excel avanzado
        document.getElementById('export-advanced-excel-btn').addEventListener('click', () => {
            this.exportAdvancedExcel();
        });
    }

    downloadAdvancedTemplate() {
        const templateData = [
            {
                'Nombres': 'Juan Carlos',
                'Apellido Paterno': 'González',
                'Apellido Materno': 'Pérez',
                'RUT': '12.345.678-9',
                'Curso': '1° Básico A',
                'Email': 'juan.gonzalez@email.com',
                'Teléfono Estudiante': '+56912345678',
                'Teléfono Madre': '+56987654321',
                'Teléfono Padre': '+56911223344',
                'Anotaciones Positivas': 'Excelente comportamiento en clase; Participación activa',
                'Anotaciones Negativas': '',
                'Anotaciones Neutrales': 'Llegó tarde el 15/03',
                'Matemáticas': '6.5;5.8;7.0',
                'Lenguaje': '6.0;6.2;5.9',
                'Ciencias': '7.0;6.8',
                'Historia': '6.5;6.0;6.3'
            },
            {
                'Nombres': 'María Fernanda',
                'Apellido Paterno': 'López',
                'Apellido Materno': 'Silva',
                'RUT': '98.765.432-1',
                'Curso': '1° Básico A',
                'Email': 'maria.lopez@email.com',
                'Teléfono Estudiante': '+56923456789',
                'Teléfono Madre': '+56976543210',
                'Teléfono Padre': '+56922334455',
                'Anotaciones Positivas': 'Muy responsable con las tareas',
                'Anotaciones Negativas': 'Conversó durante la clase',
                'Anotaciones Neutrales': '',
                'Matemáticas': '7.0;6.8;6.9',
                'Lenguaje': '6.8;7.0;6.5',
                'Ciencias': '6.5;6.7',
                'Historia': '6.8;6.9;7.0'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        
        // Configurar ancho de columnas
        const colWidths = [
            { wch: 15 }, // Nombres
            { wch: 15 }, // Apellido Paterno
            { wch: 15 }, // Apellido Materno
            { wch: 12 }, // RUT
            { wch: 12 }, // Curso
            { wch: 25 }, // Email
            { wch: 15 }, // Teléfono Estudiante
            { wch: 15 }, // Teléfono Madre
            { wch: 15 }, // Teléfono Padre
            { wch: 30 }, // Anotaciones Positivas
            { wch: 30 }, // Anotaciones Negativas
            { wch: 30 }, // Anotaciones Neutrales
            { wch: 15 }, // Matemáticas
            { wch: 15 }, // Lenguaje
            { wch: 15 }, // Ciencias
            { wch: 15 }  // Historia
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Estudiantes Avanzada');
        
        XLSX.writeFile(wb, 'plantilla_estudiantes_avanzada.xlsx');
        this.showNotification('Plantilla avanzada descargada correctamente', 'success');
    }

    importAdvancedExcel(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                this.processAdvancedImportedData(jsonData);
            } catch (error) {
                console.error('Error al importar Excel avanzado:', error);
                this.showNotification('Error al importar el archivo Excel', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    processAdvancedImportedData(data) {
        let estudiantesImportados = 0;
        let estudiantesActualizados = 0;
        let errores = [];

        // Mostrar estado de importación
        document.getElementById('import-status').style.display = 'block';
        const statusContent = document.getElementById('status-content');
        statusContent.innerHTML = '<p>🔄 Procesando datos...</p>';

        data.forEach((row, index) => {
            try {
                // Validar datos requeridos
                if (!row.Nombres || !row['Apellido Paterno'] || !row.RUT || !row.Curso) {
                    errores.push(`Fila ${index + 2}: Faltan datos requeridos (Nombres, Apellido Paterno, RUT, Curso)`);
                    return;
                }

                // Buscar curso
                const curso = this.cursos.find(c => c.nombre === row.Curso);
                if (!curso) {
                    errores.push(`Fila ${index + 2}: Curso "${row.Curso}" no encontrado`);
                    return;
                }

                // Verificar si el estudiante ya existe
                const existente = this.estudiantes.find(e => e.rut === row.RUT);
                
                const estudianteData = {
                    nombres: row.Nombres,
                    apellidoPaterno: row['Apellido Paterno'],
                    apellidoMaterno: row['Apellido Materno'] || '',
                    rut: row.RUT,
                    cursoId: curso.id,
                    email: row.Email || '',
                    telefono: row['Teléfono Estudiante'] || '',
                    telefonoMadre: row['Teléfono Madre'] || '',
                    telefonoPadre: row['Teléfono Padre'] || ''
                };

                if (existente) {
                    // Actualizar estudiante existente
                    Object.assign(existente, estudianteData);
                    estudiantesActualizados++;
                } else {
                    // Crear nuevo estudiante
                    const estudiante = {
                        id: Date.now() + Math.random(),
                        ...estudianteData
                    };
                    this.estudiantes.push(estudiante);
                    estudiantesImportados++;
                }

                // Importar anotaciones
                this.importAnotaciones(existente ? existente.id : this.estudiantes[this.estudiantes.length - 1].id, row);

                // Importar notas
                this.importNotas(existente ? existente.id : this.estudiantes[this.estudiantes.length - 1].id, row, curso.materias);

            } catch (error) {
                errores.push(`Fila ${index + 2}: ${error.message}`);
            }
        });

        this.saveData();
        this.renderEstudiantes();
        this.updateStats();

        // Mostrar resultado detallado
        let mensaje = `
            <div class="import-results">
                <h6>📊 Resultados de la Importación:</h6>
                <ul>
                    <li>✅ <strong>${estudiantesImportados}</strong> estudiantes nuevos importados</li>
                    <li>🔄 <strong>${estudiantesActualizados}</strong> estudiantes actualizados</li>
                    <li>❌ <strong>${errores.length}</strong> errores encontrados</li>
                </ul>
        `;

        if (errores.length > 0) {
            mensaje += `
                <h6>⚠️ Errores encontrados:</h6>
                <ul class="error-list">
                    ${errores.slice(0, 10).map(error => `<li>${error}</li>`).join('')}
                    ${errores.length > 10 ? `<li>... y ${errores.length - 10} errores más</li>` : ''}
                </ul>
            `;
        }

        mensaje += '</div>';
        
        statusContent.innerHTML = mensaje;
        
        const notificationType = errores.length === 0 ? 'success' : 
                               (estudiantesImportados + estudiantesActualizados > 0 ? 'warning' : 'error');
        
        this.showNotification(
            `Importación completada: ${estudiantesImportados + estudiantesActualizados} estudiantes procesados`, 
            notificationType
        );
    }

    exportAdvancedExcel() {
        const data = this.estudiantes.map(estudiante => {
            const curso = this.cursos.find(c => c.id === estudiante.cursoId);
            const anotaciones = this.observaciones.filter(o => o.estudianteId === estudiante.id);
            const calificaciones = this.calificaciones.filter(c => c.estudianteId === estudiante.id);

            const row = {
                'Nombres': estudiante.nombres || estudiante.nombre || '',
                'Apellido Paterno': estudiante.apellidoPaterno || estudiante.apellido || '',
                'Apellido Materno': estudiante.apellidoMaterno || '',
                'RUT': estudiante.rut || '',
                'Curso': curso ? curso.nombre : '',
                'Email': estudiante.email || '',
                'Teléfono Estudiante': estudiante.telefono || '',
                'Teléfono Madre': estudiante.telefonoMadre || '',
                'Teléfono Padre': estudiante.telefonoPadre || '',
                'Anotaciones Positivas': anotaciones.filter(a => a.tipo === 'positiva').map(a => a.descripcion).join('; '),
                'Anotaciones Negativas': anotaciones.filter(a => a.tipo === 'negativa').map(a => a.descripcion).join('; '),
                'Anotaciones Neutrales': anotaciones.filter(a => a.tipo === 'neutral').map(a => a.descripcion).join('; ')
            };

            // Agregar notas por materia
            if (curso && curso.materias) {
                curso.materias.forEach(materia => {
                    const notasMateria = calificaciones.filter(c => c.materia === materia).map(c => c.nota);
                    row[materia] = notasMateria.join(';');
                });
            }

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        
        // Configurar ancho de columnas
        const colWidths = [
            { wch: 15 }, // Nombres
            { wch: 15 }, // Apellido Paterno
            { wch: 15 }, // Apellido Materno
            { wch: 12 }, // RUT
            { wch: 12 }, // Curso
            { wch: 25 }, // Email
            { wch: 15 }, // Teléfono Estudiante
            { wch: 15 }, // Teléfono Madre
            { wch: 15 }, // Teléfono Padre
            { wch: 30 }, // Anotaciones Positivas
            { wch: 30 }, // Anotaciones Negativas
            { wch: 30 }, // Anotaciones Neutrales
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes Completo');
        
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `estudiantes_completo_${fecha}.xlsx`);
        
        this.showNotification('Datos completos exportados correctamente', 'success');
    }

    // ========================================
    // TABS DE ANOTACIONES
    // ========================================

    setupAnotacionesTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Actualizar botones
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Actualizar contenido
                document.querySelectorAll('.anotaciones-list').forEach(list => list.classList.remove('active'));
                document.getElementById(`anotaciones-${tab}`).classList.add('active');
            });
        });
    }
}

// Initialize the application
let libroClases;

document.addEventListener('DOMContentLoaded', () => {
    libroClases = new LibroClases();
});

// Global functions for onclick handlers
window.closeModal = function(modalId) {
    libroClases.closeModal(modalId);
};

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        font-weight: 500;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style); 