/**
 * ================================
 * APLICACIÓN DE LÍNEAS DE TIEMPO
 * ================================
 */

class TimelineApp {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.timeline = {
      events: [],
      startYear: this.currentYear - 50,
      endYear: this.currentYear + 50,
      name: 'Nueva Línea de Tiempo'
    };
    this.viewportPosition = 0;
    this.scale = 1;
    this.isDragging = false;
    this.selectedEvent = null;
    this.isEditing = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateYearDisplay();
    this.renderTimeline();
    this.loadSampleEvents();
  }

  bindEvents() {
    // Botones de control principal
    document.getElementById('new-timeline-btn').addEventListener('click', () => this.newTimeline());
    document.getElementById('save-timeline-btn').addEventListener('click', () => this.openSaveModal());
    document.getElementById('load-timeline-btn').addEventListener('click', () => this.openLoadModal());

    // Navegación de años
    document.getElementById('prev-decade').addEventListener('click', () => this.changeYear(-10));
    document.getElementById('prev-year').addEventListener('click', () => this.changeYear(-1));
    document.getElementById('next-year').addEventListener('click', () => this.changeYear(1));
    document.getElementById('next-decade').addEventListener('click', () => this.changeYear(10));

    // Botón añadir evento
    document.getElementById('add-event-btn').addEventListener('click', () => this.openEventForm());

    // Formulario de eventos
    document.getElementById('event-form').addEventListener('submit', (e) => this.saveEvent(e));
    document.getElementById('cancel-event-btn').addEventListener('click', () => this.closeEventForm());
    document.getElementById('delete-event-btn').addEventListener('click', () => this.deleteEvent());

    // Modal
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('timeline-modal').addEventListener('click', (e) => {
      if (e.target.id === 'timeline-modal') this.closeModal();
    });

    // Scroll de la línea de tiempo
    const viewport = document.getElementById('timeline-viewport');
    viewport.addEventListener('scroll', () => this.updateNavigatorViewport());

    // Navegador inferior
    this.setupNavigator();

    // Teclas de atajo
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  // ========== GESTIÓN DE AÑOS ==========
  changeYear(delta) {
    this.currentYear += delta;
    this.updateYearDisplay();
    this.centerOnYear(this.currentYear);
  }

  updateYearDisplay() {
    document.getElementById('current-year').textContent = this.currentYear;
    // Animación suave del año
    const yearElement = document.getElementById('current-year');
    yearElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
      yearElement.style.transform = 'scale(1)';
    }, 200);
  }

  centerOnYear(year) {
    const viewport = document.getElementById('timeline-viewport');
    const timelineContent = document.getElementById('timeline-content');
    const yearPosition = this.calculateYearPosition(year);
    const scrollLeft = yearPosition - (viewport.clientWidth / 2);
    viewport.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  calculateYearPosition(year) {
    const totalYears = this.timeline.endYear - this.timeline.startYear;
    const yearOffset = year - this.timeline.startYear;
    const contentWidth = document.getElementById('timeline-content').clientWidth;
    return (yearOffset / totalYears) * contentWidth * 0.9 + contentWidth * 0.05;
  }

  // ========== RENDERIZADO DE LÍNEA DE TIEMPO ==========
  renderTimeline() {
    this.renderYearMarkers();
    this.renderEvents();
    this.renderNavigator();
  }

  renderYearMarkers() {
    const timelineLine = document.getElementById('timeline-line');
    const existingMarkers = timelineLine.querySelectorAll('.year-marker');
    existingMarkers.forEach(marker => marker.remove());

    const yearInterval = Math.max(1, Math.floor((this.timeline.endYear - this.timeline.startYear) / 20));
    
    for (let year = this.timeline.startYear; year <= this.timeline.endYear; year += yearInterval) {
      const marker = document.createElement('div');
      marker.className = 'year-marker';
      marker.setAttribute('data-year', year);
      marker.style.left = this.calculateYearPosition(year) + 'px';
      timelineLine.appendChild(marker);
    }
  }

  renderEvents() {
    const timelineLine = document.getElementById('timeline-line');
    const existingEvents = timelineLine.querySelectorAll('.timeline-event');
    existingEvents.forEach(event => event.remove());

    this.timeline.events.forEach((event, index) => {
      const eventElement = this.createEventElement(event, index);
      timelineLine.appendChild(eventElement);
    });
  }

  createEventElement(event, index) {
    const eventDiv = document.createElement('div');
    eventDiv.className = `timeline-event ${index % 2 === 0 ? 'above' : 'below'}`;
    eventDiv.style.left = this.calculateYearPosition(event.year) + 'px';
    eventDiv.setAttribute('data-index', index);

    const eventDate = new Date(event.date);
    
    eventDiv.innerHTML = `
      <div class="event-marker ${event.category} ${event.importance}"></div>
      <div class="event-info">
        <h4>${event.title}</h4>
        <div class="event-date">${eventDate.toLocaleDateString('es-ES', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}</div>
        <div class="event-description">${event.description}</div>
        <div class="event-category ${event.category}">${event.category}</div>
      </div>
    `;

    eventDiv.addEventListener('click', () => this.editEvent(index));
    
    return eventDiv;
  }

  // ========== GESTIÓN DE EVENTOS ==========
  openEventForm(eventIndex = null) {
    this.isEditing = eventIndex !== null;
    this.selectedEvent = eventIndex;
    
    const panel = document.getElementById('event-info-panel');
    const formTitle = document.getElementById('event-form-title');
    const deleteBtn = document.getElementById('delete-event-btn');
    
    if (this.isEditing) {
      const event = this.timeline.events[eventIndex];
      formTitle.textContent = 'Editar Evento';
      document.getElementById('event-title').value = event.title;
      document.getElementById('event-date').value = event.date;
      document.getElementById('event-description').value = event.description;
      document.getElementById('event-category').value = event.category;
      document.getElementById('event-importance').value = event.importance;
      deleteBtn.style.display = 'block';
    } else {
      formTitle.textContent = 'Nuevo Evento';
      document.getElementById('event-form').reset();
      document.getElementById('event-date').value = `${this.currentYear}-01-01`;
      deleteBtn.style.display = 'none';
    }
    
    panel.classList.add('open');
  }

  closeEventForm() {
    document.getElementById('event-info-panel').classList.remove('open');
    this.selectedEvent = null;
    this.isEditing = false;
  }

  saveEvent(e) {
    e.preventDefault();
    
    const eventData = {
      title: document.getElementById('event-title').value,
      date: document.getElementById('event-date').value,
      description: document.getElementById('event-description').value,
      category: document.getElementById('event-category').value,
      importance: document.getElementById('event-importance').value,
      year: new Date(document.getElementById('event-date').value).getFullYear()
    };

    if (this.isEditing) {
      this.timeline.events[this.selectedEvent] = eventData;
    } else {
      this.timeline.events.push(eventData);
    }

    this.timeline.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.renderTimeline();
    this.closeEventForm();
    this.showNotification(this.isEditing ? 'Evento actualizado' : 'Evento creado');
  }

  editEvent(index) {
    this.openEventForm(index);
  }

  deleteEvent() {
    if (this.selectedEvent !== null) {
      this.timeline.events.splice(this.selectedEvent, 1);
      this.renderTimeline();
      this.closeEventForm();
      this.showNotification('Evento eliminado');
    }
  }

  // ========== NAVEGADOR INFERIOR ==========
  setupNavigator() {
    const navigatorTimeline = document.getElementById('navigator-timeline');
    navigatorTimeline.addEventListener('click', (e) => this.handleNavigatorClick(e));
    
    // Crear viewport del navegador
    const viewport = document.createElement('div');
    viewport.className = 'navigator-viewport';
    navigatorTimeline.appendChild(viewport);
    
    this.setupNavigatorDrag(viewport);
  }

  setupNavigatorDrag(viewport) {
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;

    viewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startLeft = parseInt(viewport.style.left) || 0;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const navigatorWidth = document.getElementById('navigator-timeline').clientWidth;
      const viewportWidth = viewport.clientWidth;
      const maxLeft = navigatorWidth - viewportWidth;
      
      let newLeft = Math.max(0, Math.min(maxLeft, startLeft + deltaX));
      viewport.style.left = newLeft + 'px';
      
      // Sincronizar con la línea de tiempo principal
      const timelineViewport = document.getElementById('timeline-viewport');
      const scrollRatio = newLeft / maxLeft;
      const maxScroll = timelineViewport.scrollWidth - timelineViewport.clientWidth;
      timelineViewport.scrollLeft = scrollRatio * maxScroll;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  handleNavigatorClick(e) {
    const navigatorTimeline = document.getElementById('navigator-timeline');
    const rect = navigatorTimeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    const timelineViewport = document.getElementById('timeline-viewport');
    const maxScroll = timelineViewport.scrollWidth - timelineViewport.clientWidth;
    timelineViewport.scrollTo({ left: percentage * maxScroll, behavior: 'smooth' });
  }

  renderNavigator() {
    const navigatorTimeline = document.getElementById('navigator-timeline');
    const existingEvents = navigatorTimeline.querySelectorAll('.navigator-event');
    existingEvents.forEach(event => event.remove());

    this.timeline.events.forEach(event => {
      const navEvent = document.createElement('div');
      navEvent.className = `navigator-event ${event.category}`;
      
      const yearRange = this.timeline.endYear - this.timeline.startYear;
      const yearOffset = event.year - this.timeline.startYear;
      const position = (yearOffset / yearRange) * 90 + 5; // 5% margen a cada lado
      
      navEvent.style.left = position + '%';
      navEvent.style.background = this.getCategoryColor(event.category);
      navigatorTimeline.appendChild(navEvent);
    });
  }

  updateNavigatorViewport() {
    const timelineViewport = document.getElementById('timeline-viewport');
    const navigatorViewport = document.querySelector('.navigator-viewport');
    const navigatorTimeline = document.getElementById('navigator-timeline');
    
    const scrollRatio = timelineViewport.scrollLeft / (timelineViewport.scrollWidth - timelineViewport.clientWidth);
    const navigatorWidth = navigatorTimeline.clientWidth;
    const viewportWidth = (timelineViewport.clientWidth / timelineViewport.scrollWidth) * navigatorWidth;
    const viewportLeft = scrollRatio * (navigatorWidth - viewportWidth);
    
    navigatorViewport.style.width = viewportWidth + 'px';
    navigatorViewport.style.left = viewportLeft + 'px';
  }

  // ========== GESTIÓN DE LÍNEAS DE TIEMPO ==========
  newTimeline() {
    if (this.timeline.events.length > 0) {
      if (!confirm('¿Estás seguro de que quieres crear una nueva línea de tiempo? Se perderán los cambios no guardados.')) {
        return;
      }
    }
    
    this.timeline = {
      events: [],
      startYear: this.currentYear - 50,
      endYear: this.currentYear + 50,
      name: 'Nueva Línea de Tiempo'
    };
    
    this.renderTimeline();
    this.showNotification('Nueva línea de tiempo creada');
  }

  openSaveModal() {
    const modal = document.getElementById('timeline-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Guardar Línea de Tiempo';
    modalBody.innerHTML = `
      <div class="save-timeline-form">
        <input type="text" id="timeline-name" placeholder="Nombre de la línea de tiempo" value="${this.timeline.name}">
        <button type="button" onclick="timelineApp.saveTimeline()">Guardar</button>
      </div>
    `;
    
    modal.classList.add('open');
    document.getElementById('timeline-name').focus();
  }

  openLoadModal() {
    const modal = document.getElementById('timeline-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Cargar Línea de Tiempo';
    
    const savedTimelines = this.getSavedTimelines();
    
    if (savedTimelines.length === 0) {
      modalBody.innerHTML = '<p>No hay líneas de tiempo guardadas.</p>';
    } else {
      const timelinesHTML = savedTimelines.map((timeline, index) => `
        <div class="saved-timeline-item" onclick="timelineApp.loadTimeline(${index})">
          <h4>${timeline.name}</h4>
          <p>Creada: ${new Date(timeline.created).toLocaleDateString('es-ES')}</p>
          <div class="timeline-stats">
            <span>${timeline.events.length} eventos</span>
            <span>${timeline.startYear} - ${timeline.endYear}</span>
          </div>
        </div>
      `).join('');
      
      modalBody.innerHTML = timelinesHTML;
    }
    
    modal.classList.add('open');
  }

  saveTimeline() {
    const name = document.getElementById('timeline-name').value.trim();
    if (!name) {
      alert('Por favor, ingresa un nombre para la línea de tiempo.');
      return;
    }
    
    this.timeline.name = name;
    
    const savedTimelines = this.getSavedTimelines();
    const timelineData = {
      ...this.timeline,
      created: new Date().toISOString(),
      id: Date.now()
    };
    
    savedTimelines.push(timelineData);
    localStorage.setItem('profeninja_timelines', JSON.stringify(savedTimelines));
    
    this.closeModal();
    this.showNotification('Línea de tiempo guardada correctamente');
  }

  loadTimeline(index) {
    const savedTimelines = this.getSavedTimelines();
    if (index >= 0 && index < savedTimelines.length) {
      this.timeline = { ...savedTimelines[index] };
      this.currentYear = this.timeline.events.length > 0 ? 
        this.timeline.events[0].year : new Date().getFullYear();
      
      this.updateYearDisplay();
      this.renderTimeline();
      this.closeModal();
      this.showNotification(`Línea de tiempo "${this.timeline.name}" cargada`);
    }
  }

  getSavedTimelines() {
    const saved = localStorage.getItem('profeninja_timelines');
    return saved ? JSON.parse(saved) : [];
  }

  // ========== EVENTOS DE MUESTRA ==========
  loadSampleEvents() {
    if (this.timeline.events.length === 0) {
      this.timeline.events = [
        {
          title: 'Descubrimiento de América',
          date: '1492-10-12',
          description: 'Cristóbal Colón llega al continente americano.',
          category: 'politico',
          importance: 'critica',
          year: 1492
        },
        {
          title: 'Independencia de Chile',
          date: '1810-09-18',
          description: 'Primera Junta Nacional de Gobierno.',
          category: 'politico',
          importance: 'critica',
          year: 1810
        },
        {
          title: 'Revolución Industrial',
          date: '1760-01-01',
          description: 'Inicio de la Revolución Industrial en Inglaterra.',
          category: 'economico',
          importance: 'critica',
          year: 1760
        },
        {
          title: 'Primera Guerra Mundial',
          date: '1914-07-28',
          description: 'Inicio de la Primera Guerra Mundial.',
          category: 'militar',
          importance: 'critica',
          year: 1914
        },
        {
          title: 'Llegada del hombre a la Luna',
          date: '1969-07-20',
          description: 'Neil Armstrong pisa la superficie lunar.',
          category: 'cientifico',
          importance: 'critica',
          year: 1969
        }
      ];
      
      this.timeline.startYear = 1400;
      this.timeline.endYear = 2100;
      this.renderTimeline();
    }
  }

  // ========== UTILIDADES ==========
  getCategoryColor(category) {
    const colors = {
      politico: '#e74c3c',
      social: '#3498db',
      cultural: '#9b59b6',
      cientifico: '#2ecc71',
      economico: '#f39c12',
      militar: '#34495e',
      otro: '#95a5a6'
    };
    return colors[category] || colors.otro;
  }

  closeModal() {
    document.getElementById('timeline-modal').classList.remove('open');
  }

  showNotification(message) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  handleKeyboard(e) {
    // Solo funcionar si estamos en el panel de timeline
    if (!document.getElementById('timeline-panel').style.display === 'none') return;
    
    switch(e.key) {
      case 'ArrowLeft':
        if (e.ctrlKey) this.changeYear(-10);
        else this.changeYear(-1);
        break;
      case 'ArrowRight':
        if (e.ctrlKey) this.changeYear(10);
        else this.changeYear(1);
        break;
      case 'n':
        if (e.ctrlKey) {
          e.preventDefault();
          this.openEventForm();
        }
        break;
      case 's':
        if (e.ctrlKey) {
          e.preventDefault();
          this.openSaveModal();
        }
        break;
      case 'Escape':
        this.closeEventForm();
        this.closeModal();
        break;
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
let timelineApp;

// Función para inicializar desde dashboard.js
function initTimeline() {
  if (!timelineApp) {
    timelineApp = new TimelineApp();
  }
}

// Auto-inicializar si el panel está visible
document.addEventListener('DOMContentLoaded', () => {
  // La inicialización se hará desde dashboard.js cuando se abra el panel
}); 