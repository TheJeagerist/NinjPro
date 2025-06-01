document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let eventos = JSON.parse(localStorage.getItem('eventos') || '{}');

    // Referencias a elementos del DOM con verificación de existencia
    const calendarioGrid = document.getElementById('calendario-grid');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventoModal = document.getElementById('evento-modal');
    const eventoForm = document.getElementById('evento-form');
    const listaEventos = document.getElementById('lista-eventos');
    const btnAgregarEvento = document.querySelector('.btn-agregar');
    const closeModal = document.querySelector('.close');

    // Verificar que los elementos principales existan
    if (!calendarioGrid || !monthYear || !prevMonthBtn || !nextMonthBtn) {
        console.warn('Algunos elementos del calendario no se encontraron en el DOM');
        return;
    }

    function actualizarCalendario() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Actualizar el título del mes y año
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthYear.textContent = `${months[month]} ${year}`;

        // Limpiar el calendario
        calendarioGrid.innerHTML = '';

        // Obtener el primer día del mes
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay();

        // Obtener el último día del mes
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Obtener el mes anterior y siguiente para los días de relleno
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        // Agregar días del mes anterior
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayNumber = daysInPrevMonth - i;
            const dayElement = document.createElement('div');
            dayElement.className = 'dia otro-mes';
            dayElement.textContent = dayNumber;
            calendarioGrid.appendChild(dayElement);
        }

        // Agregar los días del mes actual
        for (let day = 1; day <= lastDay; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'dia';
            dayElement.textContent = day;

            // Verificar si es el día actual
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('hoy');
            }

            // Verificar si hay eventos para este día
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            if (eventos[dateStr] && eventos[dateStr].length > 0) {
                dayElement.classList.add('tiene-eventos');
                dayElement.setAttribute('data-eventos', eventos[dateStr].length);
                
                // Agregar clase del tipo de evento principal
                const tipoEvento = eventos[dateStr][0].tipo || 'general';
                dayElement.classList.add(`evento-${tipoEvento}`);
            }

            dayElement.addEventListener('click', () => mostrarEventosDelDia(year, month, day));
            calendarioGrid.appendChild(dayElement);
        }

        // Agregar días del mes siguiente para completar la grilla
        const totalCells = Math.ceil((startingDay + lastDay) / 7) * 7;
        const remainingCells = totalCells - (startingDay + lastDay);
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'dia otro-mes';
            dayElement.textContent = day;
            calendarioGrid.appendChild(dayElement);
        }
    }

    function mostrarEventosDelDia(year, month, day) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if (eventoModal) {
            const eventoFecha = document.getElementById('evento-fecha');
            if (eventoFecha) {
                eventoFecha.value = dateStr;
            }
            eventoModal.style.display = 'block';
        }
        
        actualizarListaEventos();
    }

    function actualizarListaEventos() {
        if (!listaEventos) return;
        
        listaEventos.innerHTML = '';
        
        // Obtener todos los eventos y ordenarlos por fecha
        const todosLosEventos = [];
        Object.keys(eventos).forEach(fecha => {
            eventos[fecha].forEach(evento => {
                todosLosEventos.push({
                    ...evento,
                    fecha: fecha,
                    fechaObj: new Date(fecha)
                });
            });
        });
        
        // Ordenar por fecha
        todosLosEventos.sort((a, b) => a.fechaObj - b.fechaObj);
        
        // Mostrar eventos
        todosLosEventos.forEach((evento, index) => {
            const eventoItem = document.createElement('div');
            eventoItem.className = `evento-item evento-${evento.tipo || 'general'}`;
            
            const fechaFormateada = new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            eventoItem.innerHTML = `
                <div class="evento-header">
                    <div class="evento-fecha">${fechaFormateada}</div>
                    <button class="btn-eliminar-evento" data-fecha="${evento.fecha}" data-titulo="${evento.titulo}">×</button>
                </div>
                <div class="evento-titulo">${evento.titulo}</div>
                <div class="evento-hora">${evento.hora}</div>
                <div class="evento-descripcion">${evento.descripcion || ''}</div>
                <div class="evento-detalles">
                    <div><strong>Ramo:</strong> ${evento.ramo}</div>
                    <div><strong>Curso:</strong> ${evento.curso}</div>
                    <div><strong>Lugar:</strong> ${evento.lugar}</div>
                </div>
            `;
            listaEventos.appendChild(eventoItem);
        });
    }

    // Event Listeners con verificación
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            actualizarCalendario();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            actualizarCalendario();
        });
    }

    if (eventoForm) {
        eventoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fecha = document.getElementById('evento-fecha')?.value;
            const titulo = document.getElementById('evento-titulo')?.value;
            const hora = document.getElementById('evento-hora')?.value;
            const tipo = document.getElementById('evento-tipo')?.value;
            const ramo = document.getElementById('evento-ramo')?.value;
            const curso = document.getElementById('evento-curso')?.value;
            const lugar = document.getElementById('evento-lugar')?.value;
            const descripcion = document.getElementById('evento-descripcion')?.value;

            if (!fecha || !titulo || !hora || !tipo || !ramo || !curso || !lugar) {
                alert('Por favor completa todos los campos obligatorios');
                return;
            }

            if (!eventos[fecha]) {
                eventos[fecha] = [];
            }
            
            eventos[fecha].push({
                titulo,
                hora,
                tipo,
                ramo,
                curso,
                lugar,
                descripcion
            });

            // Guardar en localStorage
            localStorage.setItem('eventos', JSON.stringify(eventos));

            // Limpiar el formulario
            eventoForm.reset();
            
            // Cerrar modal
            if (eventoModal) {
                eventoModal.style.display = 'none';
            }
            
            actualizarCalendario();
            actualizarListaEventos();
        });
    }

    if (listaEventos) {
        listaEventos.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-evento')) {
                const fecha = e.target.dataset.fecha;
                const titulo = e.target.dataset.titulo;
                
                if (confirm(`¿Estás seguro de que quieres eliminar el evento "${titulo}"?`)) {
                    eventos[fecha] = eventos[fecha].filter(evento => evento.titulo !== titulo);
                    
                    if (eventos[fecha].length === 0) {
                        delete eventos[fecha];
                    }
                    
                    // Guardar en localStorage
                    localStorage.setItem('eventos', JSON.stringify(eventos));
                    
                    actualizarCalendario();
                    actualizarListaEventos();
                }
            }
        });
    }

    // Cerrar modal
    if (closeModal && eventoModal) {
        closeModal.addEventListener('click', () => {
            eventoModal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    if (eventoModal) {
        window.addEventListener('click', (e) => {
            if (e.target === eventoModal) {
                eventoModal.style.display = 'none';
            }
        });
    }

    // Inicializar el calendario
    actualizarCalendario();
    actualizarListaEventos();
}); 