document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let events = {};

    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventForm = document.getElementById('event-form');
    const eventList = document.getElementById('event-list');

    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Actualizar el título del mes y año
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthYear.textContent = `${months[month]} ${year}`;

        // Limpiar el calendario
        while (calendar.firstChild) {
            calendar.removeChild(calendar.firstChild);
        }

        // Agregar encabezados de días
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // Obtener el primer día del mes
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay();

        // Obtener el último día del mes
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Agregar días vacíos al principio
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendar.appendChild(emptyDay);
        }

        // Agregar los días del mes
        for (let day = 1; day <= lastDay; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Verificar si hay eventos para este día
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            if (events[dateStr]) {
                dayElement.classList.add('has-event');
                const eventIndicator = document.createElement('div');
                eventIndicator.className = 'event-indicator';
                dayElement.appendChild(eventIndicator);
            }

            dayElement.addEventListener('click', () => showEventForm(year, month, day));
            calendar.appendChild(dayElement);
        }
    }

    function showEventForm(year, month, day) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dateInput = document.getElementById('event-date');
        dateInput.value = dateStr;
        eventForm.style.display = 'block';
        updateEventList(dateStr);
    }

    function updateEventList(dateStr) {
        eventList.innerHTML = '';
        if (events[dateStr]) {
            events[dateStr].forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                eventItem.innerHTML = `
                    <span>${event.title}</span>
                    <button class="delete-event" data-date="${dateStr}" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;
                eventList.appendChild(eventItem);
            });
        }
    }

    // Event Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateStr = document.getElementById('event-date').value;
        const title = document.getElementById('event-title').value;
        const time = document.getElementById('event-time').value;

        if (!events[dateStr]) {
            events[dateStr] = [];
        }
        events[dateStr].push({ title, time });

        // Limpiar el formulario
        document.getElementById('event-title').value = '';
        document.getElementById('event-time').value = '';
        
        updateCalendar();
        updateEventList(dateStr);
    });

    eventList.addEventListener('click', (e) => {
        if (e.target.closest('.delete-event')) {
            const button = e.target.closest('.delete-event');
            const dateStr = button.dataset.date;
            const index = parseInt(button.dataset.index);
            
            events[dateStr].splice(index, 1);
            if (events[dateStr].length === 0) {
                delete events[dateStr];
            }
            
            updateCalendar();
            updateEventList(dateStr);
        }
    });

    // Inicializar el calendario
    updateCalendar();
}); 