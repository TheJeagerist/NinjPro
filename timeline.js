/**
 * TIMELINE.JS - Aplicación de Líneas de Tiempo
 * Sistema completo para crear, gestionar y visualizar líneas de tiempo históricas
 */

class TimelineApp {
    constructor() {
        this.events = [];
        this.savedTimelines = [];
        this.currentTimeline = null;
        this.editingEventId = null;
        this.eventFiles = {}; // Almacenar archivos por evento
        
        // Elementos del DOM
        this.panel = document.getElementById('timeline-panel');
        this.eventsContainer = document.getElementById('timeline-events');
        this.modal = document.getElementById('event-modal');
        this.form = document.getElementById('event-form');
        
        // Inicializar la aplicación
        this.init();
    }
    
    init() {
        this.loadDefaultEvents();
        this.setupEventListeners();
        this.updateStats();
        this.loadSavedTimelines();
        this.loadEventFiles(); // Cargar archivos guardados
        this.renderEvents();
        this.createPresentationModal(); // Crear modal para presentaciones
    }
    
    // ================================
    // EVENTOS PREDETERMINADOS
    // ================================
    loadDefaultEvents() {
        const defaultEvents = [
            {
                id: 'caida-imperio-romano',
                title: 'Caída del Imperio Romano',
                description: 'Odoacro depone al último emperador romano de Occidente, marcando el fin del Imperio Romano',
                date: '0476-09-04',
                year: 476,
                era: 'dc',
                category: 'historical',
                location: 'Roma, Italia'
            },
            {
                id: 'democracia-atenas',
                title: 'Democracia en Atenas',
                description: 'Clístenes establece las reformas democráticas en Atenas, creando la primera democracia',
                date: '0508-01-01',
                year: 508,
                era: 'ac',
                category: 'political',
                location: 'Atenas, Grecia'
            },
            {
                id: 'nacimiento-buda',
                title: 'Nacimiento de Buda',
                description: 'Siddhartha Gautama nace en Nepal, fundador del budismo',
                date: '0563-01-01',
                year: 563,
                era: 'ac',
                category: 'religious',
                location: 'Nepal'
            },
            {
                id: 'nacimiento-islam',
                title: 'Nacimiento del Islam',
                description: 'Mahoma recibe las primeras revelaciones del Corán, marcando el inicio del Islam',
                date: '0610-01-01',
                year: 610,
                era: 'dc',
                category: 'religious',
                location: 'Meca, Arabia Saudí'
            }
        ];
        
        this.events = [...defaultEvents];
    }
    
    // ================================
    // CONFIGURACIÓN DE EVENTOS
    // ================================
    setupEventListeners() {
        // Botones principales
        document.getElementById('add-event-btn').addEventListener('click', () => this.openModal());
        document.getElementById('save-timeline-btn').addEventListener('click', () => this.saveTimeline());
        document.getElementById('load-timeline-btn').addEventListener('click', () => this.showLoadTimelineDialog());
        
        // Modal
        document.querySelector('#event-modal .close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-event').addEventListener('click', () => this.closeModal());
        document.getElementById('event-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Filtros
        document.getElementById('period-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('category-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-events').addEventListener('input', () => this.applyFilters());
        
        // Cerrar modal al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    // ================================
    // GESTIÓN DE EVENTOS
    // ================================
    openModal(eventId = null) {
        this.editingEventId = eventId;
        const modalTitle = document.getElementById('modal-title');
        const saveBtn = document.getElementById('save-event');
        
        if (eventId) {
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                modalTitle.textContent = 'Editar Evento';
                saveBtn.textContent = 'Actualizar Evento';
                this.populateForm(event);
            }
        } else {
            modalTitle.textContent = 'Agregar Evento';
            saveBtn.textContent = 'Guardar Evento';
            this.form.reset();
            
            // Configurar fecha actual
            const today = new Date();
            document.getElementById('event-date').value = today.toISOString().split('T')[0];
            document.getElementById('event-year').value = today.getFullYear();
        }
        
        this.modal.style.display = 'block';
        document.getElementById('event-title').focus();
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.editingEventId = null;
        this.form.reset();
    }
    
    populateForm(event) {
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-category').value = event.category;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-year').value = Math.abs(event.year);
        document.getElementById('era-select').value = event.era;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-location').value = event.location || '';
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const eventData = {
            title: document.getElementById('event-title').value.trim(),
            category: document.getElementById('event-category').value,
            date: document.getElementById('event-date').value,
            year: parseInt(document.getElementById('event-year').value),
            era: document.getElementById('era-select').value,
            description: document.getElementById('event-description').value.trim(),
            location: document.getElementById('event-location').value.trim()
        };
        
        // Validar datos
        if (!this.validateEventData(eventData)) {
            return;
        }
        
        // Convertir año a negativo si es a.C.
        if (eventData.era === 'ac') {
            eventData.year = -Math.abs(eventData.year);
        }
        
        if (this.editingEventId) {
            this.updateEvent(this.editingEventId, eventData);
        } else {
            this.addEvent(eventData);
        }
        
        this.closeModal();
    }
    
    validateEventData(data) {
        if (!data.title) {
            alert('Por favor, ingresa un título para el evento.');
            return false;
        }
        
        if (!data.category) {
            alert('Por favor, selecciona una categoría.');
            return false;
        }
        
        if (!data.description) {
            alert('Por favor, ingresa una descripción.');
            return false;
        }
        
        if (!data.year || data.year < 1) {
            alert('Por favor, ingresa un año válido.');
            return false;
        }
        
        return true;
    }
    
    addEvent(eventData) {
        const event = {
            id: this.generateId(),
            ...eventData,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(event);
        this.sortEventsByYear();
        this.renderEvents();
        this.updateStats();
        
        // Mostrar notificación
        this.showNotification('Evento agregado exitosamente', 'success');
    }
    
    updateEvent(eventId, eventData) {
        const index = this.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...eventData };
            this.sortEventsByYear();
            this.renderEvents();
            this.updateStats();
            
            // Mostrar notificación
            this.showNotification('Evento actualizado exitosamente', 'success');
        }
    }
    
    deleteEvent(eventId) {
        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.renderEvents();
            this.updateStats();
            
            // Mostrar notificación
            this.showNotification('Evento eliminado exitosamente', 'success');
        }
    }
    
    // ================================
    // RENDERIZADO
    // ================================
    renderEvents() {
        const container = this.eventsContainer;
        
        if (this.events.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        const sortedEvents = [...this.events].sort((a, b) => {
            // Ordenar por año (los años negativos van primero)
            return a.year - b.year;
        });
        
        container.innerHTML = sortedEvents.map(event => this.createEventHTML(event)).join('');
        
        // Aplicar animaciones con delay
        const eventElements = container.querySelectorAll('.timeline-event');
        eventElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            
            // Agregar event listener para mostrar panel de archivos
            element.addEventListener('click', (e) => {
                // Solo si no se hizo click en los botones de acción
                if (!e.target.closest('.event-actions')) {
                    this.toggleFilesPanel(element, event.id);
                }
            });
        });
    }
    
    createEventHTML(event) {
        const displayYear = Math.abs(event.year);
        const eraText = event.era === 'ac' ? 'a.C.' : 'd.C.';
        const dateFormatted = this.formatDate(event.date);
        const hasFiles = this.eventFiles[event.id] && this.eventFiles[event.id].length > 0;
        
        return `
            <div class="timeline-event ${hasFiles ? 'event-has-files' : ''}" data-category="${event.category}" data-event-id="${event.id}">
                <div class="event-header">
                    <h3 class="event-title">${event.title}</h3>
                    <span class="event-date">${dateFormatted}</span>
                </div>
                
                <span class="event-category ${event.category}">${this.getCategoryDisplayName(event.category)}</span>
                
                <p class="event-description">${event.description}</p>
                
                ${hasFiles ? `
                    <div class="files-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        ${this.eventFiles[event.id].length} archivo(s) adjunto(s)
                    </div>
                ` : ''}
                
                <div class="event-meta">
                    <div class="event-location">
                        ${event.location ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.location}
                        ` : ''}
                    </div>
                    
                    <div class="event-actions">
                        <button class="edit-btn" onclick="timelineApp.openModal('${event.id}')" title="Editar evento">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="delete-btn" onclick="timelineApp.deleteEvent('${event.id}')" title="Eliminar evento">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Panel de archivos (inicialmente oculto) -->
                <div class="event-files-panel" id="files-panel-${event.id}">
                    <div class="files-panel-header">
                        <h4 class="files-panel-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Archivos de Presentación
                        </h4>
                        <button class="close-files-panel" onclick="timelineApp.closeFilesPanel('${event.id}')">✕</button>
                    </div>
                    
                    <div class="file-upload-area" onclick="timelineApp.triggerFileUpload('${event.id}')">
                        <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <div class="upload-text">Haz clic para cargar archivos PowerPoint</div>
                        <div class="upload-hint">Soporta archivos .pptx (máximo 50MB)</div>
                        <input type="file" id="file-input-${event.id}" class="file-input-hidden" accept=".pptx,.ppt" multiple>
                    </div>
                    
                    <div class="attached-files-list" id="files-list-${event.id}">
                        <!-- Los archivos se mostrarán aquí -->
                    </div>
                </div>
            </div>
        `;
    }
    
    getEmptyStateHTML() {
        return `
            <div class="timeline-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 9V2"></path>
                    <path d="M12 15v7"></path>
                    <path d="M9 12H2"></path>
                    <path d="M15 12h7"></path>
                    <circle cx="12" cy="2" r="1"></circle>
                    <circle cx="12" cy="22" r="1"></circle>
                    <circle cx="2" cy="12" r="1"></circle>
                    <circle cx="22" cy="12" r="1"></circle>
                </svg>
                <h3>No hay eventos en la línea de tiempo</h3>
                <p>Comienza agregando tu primer evento histórico</p>
                <button class="btn-primary" onclick="timelineApp.openModal()">Agregar Primer Evento</button>
            </div>
        `;
    }
    
    // ================================
    // FILTROS Y BÚSQUEDA
    // ================================
    applyFilters() {
        const periodFilter = document.getElementById('period-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const searchQuery = document.getElementById('search-events').value.toLowerCase().trim();
        
        const eventElements = this.eventsContainer.querySelectorAll('.timeline-event');
        
        eventElements.forEach(element => {
            const eventId = element.dataset.eventId;
            const event = this.events.find(e => e.id === eventId);
            
            if (!event) return;
            
            let show = true;
            
            // Filtro por período
            if (periodFilter !== 'all') {
                show = show && this.matchesPeriod(event, periodFilter);
            }
            
            // Filtro por categoría
            if (categoryFilter !== 'all') {
                show = show && event.category === categoryFilter;
            }
            
            // Búsqueda por texto
            if (searchQuery) {
                const searchText = `${event.title} ${event.description} ${event.location || ''}`.toLowerCase();
                show = show && searchText.includes(searchQuery);
            }
            
            // Aplicar visibilidad
            if (show) {
                element.classList.remove('filtered-out');
                element.classList.add('filtered-in');
            } else {
                element.classList.add('filtered-out');
                element.classList.remove('filtered-in');
            }
        });
        
        this.updateVisibleStats();
    }
    
    matchesPeriod(event, period) {
        const year = event.year;
        
        switch (period) {
            case 'ancient':
                return year < 500;
            case 'medieval':
                return year >= 500 && year < 1500;
            case 'modern':
                return year >= 1500 && year < 1800;
            case 'contemporary':
                return year >= 1800;
            default:
                return true;
        }
    }
    
    // ================================
    // GESTIÓN DE LÍNEAS DE TIEMPO
    // ================================
    saveTimeline() {
        const name = prompt('Nombre para esta línea de tiempo:');
        if (!name || !name.trim()) return;
        
        const timeline = {
            id: this.generateId(),
            name: name.trim(),
            events: [...this.events],
            createdAt: new Date().toISOString(),
            eventCount: this.events.length
        };
        
        this.savedTimelines.push(timeline);
        this.saveToLocalStorage();
        this.renderSavedTimelines();
        
        this.showNotification(`Línea de tiempo "${name}" guardada exitosamente`, 'success');
    }
    
    loadTimeline(timelineId) {
        const timeline = this.savedTimelines.find(t => t.id === timelineId);
        if (!timeline) return;
        
        this.events = [...timeline.events];
        this.currentTimeline = timeline;
        
        this.renderEvents();
        this.updateStats();
        this.clearFilters();
        
        this.showNotification(`Línea de tiempo "${timeline.name}" cargada`, 'success');
    }
    
    deleteTimeline(timelineId) {
        const timeline = this.savedTimelines.find(t => t.id === timelineId);
        if (!timeline) return;
        
        if (confirm(`¿Eliminar la línea de tiempo "${timeline.name}"?`)) {
            this.savedTimelines = this.savedTimelines.filter(t => t.id !== timelineId);
            this.saveToLocalStorage();
            this.renderSavedTimelines();
            
            this.showNotification('Línea de tiempo eliminada', 'success');
        }
    }
    
    showLoadTimelineDialog() {
        if (this.savedTimelines.length === 0) {
            alert('No hay líneas de tiempo guardadas.');
            return;
        }
        
        const timelinesList = this.savedTimelines.map(timeline => 
            `${timeline.name} (${timeline.eventCount} eventos - ${this.formatDate(timeline.createdAt)})`
        ).join('\n');
        
        alert(`Líneas de tiempo guardadas:\n\n${timelinesList}\n\nSelecciona una de la lista en el panel lateral.`);
    }
    
    renderSavedTimelines() {
        const container = document.getElementById('saved-timelines-list');
        
        if (this.savedTimelines.length === 0) {
            container.innerHTML = '<p style="color: #718096; font-size: 0.9rem; text-align: center; padding: 1rem;">No hay líneas de tiempo guardadas</p>';
            return;
        }
        
        container.innerHTML = this.savedTimelines.map(timeline => `
            <div class="saved-timeline-item" onclick="timelineApp.loadTimeline('${timeline.id}')">
                <h4>${timeline.name}</h4>
                <p>${timeline.eventCount} eventos • ${this.formatDate(timeline.createdAt)}</p>
                <button class="delete-btn" onclick="event.stopPropagation(); timelineApp.deleteTimeline('${timeline.id}')" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: #e53e3e; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
    }
    
    // ================================
    // UTILIDADES
    // ================================
    updateStats() {
        const eventsCount = document.getElementById('events-count');
        const timelineRange = document.getElementById('timeline-range');
        
        const count = this.events.length;
        eventsCount.textContent = `${count} evento${count !== 1 ? 's' : ''} histórico${count !== 1 ? 's' : ''}`;
        
        if (count > 0) {
            const years = this.events.map(e => e.year).sort((a, b) => a - b);
            const earliest = years[0];
            const latest = years[years.length - 1];
            
            const earliestText = earliest < 0 ? `${Math.abs(earliest)} a.C.` : `${earliest} d.C.`;
            const latestText = latest < 0 ? `${Math.abs(latest)} a.C.` : `${latest} d.C.`;
            
            timelineRange.textContent = `Desde ${earliestText} hasta ${latestText}`;
        } else {
            timelineRange.textContent = 'Sin eventos';
        }
    }
    
    updateVisibleStats() {
        const visibleEvents = this.eventsContainer.querySelectorAll('.timeline-event.filtered-in').length;
        const eventsCount = document.getElementById('events-count');
        
        if (visibleEvents !== this.events.length) {
            eventsCount.textContent = `${visibleEvents} de ${this.events.length} eventos mostrados`;
        } else {
            this.updateStats();
        }
    }
    
    sortEventsByYear() {
        this.events.sort((a, b) => a.year - b.year);
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString('es-ES', options);
    }
    
    getCategoryDisplayName(category) {
        const categories = {
            historical: 'Histórico',
            cultural: 'Cultural',
            scientific: 'Científico',
            political: 'Político',
            religious: 'Religioso',
            artistic: 'Artístico'
        };
        
        return categories[category] || category;
    }
    
    clearFilters() {
        document.getElementById('period-filter').value = 'all';
        document.getElementById('category-filter').value = 'all';
        document.getElementById('search-events').value = '';
        this.applyFilters();
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#48bb78' : '#667eea'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInNotification 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ================================
    // PERSISTENCIA
    // ================================
    saveToLocalStorage() {
        try {
            localStorage.setItem('timeline-saved-timelines', JSON.stringify(this.savedTimelines));
            localStorage.setItem('timeline-current-events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }
    
    loadSavedTimelines() {
        try {
            const saved = localStorage.getItem('timeline-saved-timelines');
            if (saved) {
                this.savedTimelines = JSON.parse(saved);
                this.renderSavedTimelines();
            }
            
            const currentEvents = localStorage.getItem('timeline-current-events');
            if (currentEvents) {
                const events = JSON.parse(currentEvents);
                if (events.length > this.events.length) {
                    this.events = events;
                }
            }
        } catch (error) {
            console.error('Error al cargar desde localStorage:', error);
        }
    }

    // ================================
    // GESTIÓN DE ARCHIVOS POWERPOINT
    // ================================
    
    toggleFilesPanel(eventElement, eventId) {
        const allPanels = document.querySelectorAll('.event-files-panel.visible');
        allPanels.forEach(panel => {
            panel.classList.remove('visible');
            panel.closest('.timeline-event').classList.remove('expanded');
        });
        
        const panel = eventElement.querySelector('.event-files-panel');
        const isVisible = panel.classList.contains('visible');
        
        if (!isVisible) {
            panel.classList.add('visible');
            eventElement.classList.add('expanded');
            this.renderFilesList(eventId);
            this.setupFileUpload(eventId);
        }
    }
    
    closeFilesPanel(eventId) {
        const panel = document.getElementById(`files-panel-${eventId}`);
        const eventElement = panel.closest('.timeline-event');
        
        panel.classList.remove('visible');
        eventElement.classList.remove('expanded');
    }
    
    setupFileUpload(eventId) {
        const fileInput = document.getElementById(`file-input-${eventId}`);
        const uploadArea = fileInput.parentElement;
        
        // Event listeners para drag & drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(eventId, files);
        });
        
        // Event listener para input file
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(eventId, files);
        });
    }
    
    triggerFileUpload(eventId) {
        const fileInput = document.getElementById(`file-input-${eventId}`);
        fileInput.click();
    }
    
    handleFileUpload(eventId, files) {
        const validFiles = files.filter(file => {
            const isValidType = file.type.includes('presentation') || 
                               file.name.toLowerCase().endsWith('.pptx') || 
                               file.name.toLowerCase().endsWith('.ppt');
            const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
            
            if (!isValidType) {
                this.showNotification(`${file.name} no es un archivo PowerPoint válido`, 'error');
                return false;
            }
            
            if (!isValidSize) {
                this.showNotification(`${file.name} excede el tamaño máximo de 50MB`, 'error');
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length === 0) return;
        
        validFiles.forEach(file => {
            this.processAndSaveFile(eventId, file);
        });
    }
    
    processAndSaveFile(eventId, file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result, // Base64 data
                uploadDate: new Date().toISOString()
            };
            
            // Inicializar array si no existe
            if (!this.eventFiles[eventId]) {
                this.eventFiles[eventId] = [];
            }
            
            this.eventFiles[eventId].push(fileData);
            this.saveEventFiles();
            this.renderFilesList(eventId);
            this.updateEventFileIndicator(eventId);
            
            this.showNotification(`${file.name} subido exitosamente`, 'success');
        };
        
        reader.onerror = () => {
            this.showNotification(`Error al cargar ${file.name}`, 'error');
        };
        
        reader.readAsDataURL(file);
    }
    
    renderFilesList(eventId) {
        const filesList = document.getElementById(`files-list-${eventId}`);
        const files = this.eventFiles[eventId] || [];
        
        if (files.length === 0) {
            filesList.innerHTML = `
                <div class="no-files-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p>No hay archivos adjuntos</p>
                </div>
            `;
            return;
        }
        
        const filesHTML = `
            <div class="attached-files-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Archivos Adjuntos (${files.length})
            </div>
            ${files.map(file => this.createFileItemHTML(eventId, file)).join('')}
        `;
        
        filesList.innerHTML = filesHTML;
    }
    
    createFileItemHTML(eventId, file) {
        const sizeFormatted = this.formatFileSize(file.size);
        const dateFormatted = new Date(file.uploadDate).toLocaleDateString('es-ES');
        
        return `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-info">
                    <div class="file-icon">PPT</div>
                    <div class="file-details">
                        <h5 class="file-name">${file.name}</h5>
                        <div class="file-meta">
                            <span class="file-size">${sizeFormatted}</span>
                            <span class="file-date">${dateFormatted}</span>
                        </div>
                    </div>
                </div>
                
                <div class="file-actions">
                    <button class="file-action-btn view-btn" onclick="timelineApp.viewPresentation('${eventId}', '${file.id}')" title="Ver presentación">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    
                    <button class="file-action-btn download-btn" onclick="timelineApp.downloadFile('${eventId}', '${file.id}')" title="Descargar archivo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    
                    <button class="file-action-btn delete-btn" onclick="timelineApp.deleteFile('${eventId}', '${file.id}')" title="Eliminar archivo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    
    updateEventFileIndicator(eventId) {
        const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
        const hasFiles = this.eventFiles[eventId] && this.eventFiles[eventId].length > 0;
        
        if (hasFiles) {
            eventElement.classList.add('event-has-files');
            
            // Actualizar o crear indicador
            let indicator = eventElement.querySelector('.files-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'files-indicator';
                eventElement.querySelector('.event-description').insertAdjacentElement('afterend', indicator);
            }
            
            indicator.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                ${this.eventFiles[eventId].length} archivo(s) adjunto(s)
            `;
        } else {
            eventElement.classList.remove('event-has-files');
            const indicator = eventElement.querySelector('.files-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
    
    viewPresentation(eventId, fileId) {
        const file = this.eventFiles[eventId]?.find(f => f.id === fileId);
        if (!file) return;
        
        this.showPresentationModal(file);
    }
    
    downloadFile(eventId, fileId) {
        const file = this.eventFiles[eventId]?.find(f => f.id === fileId);
        if (!file) return;
        
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Descargando ${file.name}`, 'success');
    }
    
    deleteFile(eventId, fileId) {
        const file = this.eventFiles[eventId]?.find(f => f.id === fileId);
        if (!file) return;
        
        if (confirm(`¿Eliminar el archivo "${file.name}"?`)) {
            this.eventFiles[eventId] = this.eventFiles[eventId].filter(f => f.id !== fileId);
            
            if (this.eventFiles[eventId].length === 0) {
                delete this.eventFiles[eventId];
            }
            
            this.saveEventFiles();
            this.renderFilesList(eventId);
            this.updateEventFileIndicator(eventId);
            
            this.showNotification('Archivo eliminado', 'success');
        }
    }
    
    // ================================
    // MODAL DE PRESENTACIONES
    // ================================
    
    createPresentationModal() {
        const modalHTML = `
            <div id="presentation-modal" class="presentation-modal">
                <div class="presentation-content">
                    <div class="presentation-header">
                        <h3 class="presentation-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                            <span id="presentation-file-name">Presentación</span>
                        </h3>
                        
                        <div class="presentation-controls">
                            <button class="presentation-control-btn close-presentation" onclick="timelineApp.closePresentationModal()">✕</button>
                        </div>
                    </div>
                    
                    <div class="presentation-viewer" id="presentation-viewer">
                        <div class="presentation-preview">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                            <h3>Vista previa de presentación PowerPoint</h3>
                            <p>Para una experiencia completa, descarga el archivo y ábrelo en PowerPoint.</p>
                            <a id="download-presentation-link" class="download-link" href="#" download>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Descargar Presentación
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Event listener para cerrar modal al hacer clic fuera
        const modal = document.getElementById('presentation-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePresentationModal();
            }
        });
    }
    
    showPresentationModal(file) {
        const modal = document.getElementById('presentation-modal');
        const fileName = document.getElementById('presentation-file-name');
        const downloadLink = document.getElementById('download-presentation-link');
        
        fileName.textContent = file.name;
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    
    closePresentationModal() {
        const modal = document.getElementById('presentation-modal');
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    // ================================
    // UTILIDADES PARA ARCHIVOS
    // ================================
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    saveEventFiles() {
        try {
            localStorage.setItem('timeline_event_files', JSON.stringify(this.eventFiles));
        } catch (error) {
            console.error('Error al guardar archivos:', error);
            this.showNotification('Error al guardar archivos. Espacio de almacenamiento insuficiente.', 'error');
        }
    }
    
    loadEventFiles() {
        try {
            const saved = localStorage.getItem('timeline_event_files');
            if (saved) {
                this.eventFiles = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            this.eventFiles = {};
        }
    }
}

// ================================
// INTEGRACIÓN CON DASHBOARD
// ================================

// Agregar estilos de animación para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInNotification {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutNotification {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Instancia global de la aplicación
let timelineApp;

// Inicializar cuando se muestre el panel
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el panel de timeline existe
    const timelinePanel = document.getElementById('timeline-panel');
    if (timelinePanel) {
        // Inicializar la aplicación cuando se muestre el panel
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = timelinePanel.style.display;
                    if (display === 'block' && !timelineApp) {
                        timelineApp = new TimelineApp();
                    }
                }
            });
        });
        
        observer.observe(timelinePanel, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
});

// Exportar para uso global
window.TimelineApp = TimelineApp; 