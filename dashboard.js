// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard cargado');

    // Inicializar el dashboard si estamos en la página principal
    initializeDashboard();

    // Event listeners para las tarjetas
    setupToolCardListeners();

    // Event listeners para búsqueda y filtros
    setupSearchAndFilters();

    // Event listeners para temas
    setupThemeListeners();
});

function initializeDashboard() {
    const dashboardMain = document.getElementById('dashboard-main');
    
    // Mostrar el dashboard por defecto
    if (dashboardMain) {
        document.body.classList.add('dashboard-active');
        showDashboard();
    }
}

function setupToolCardListeners() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            navigateToTool(tool);
        });
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('search-tools');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTools(searchTerm);
        });
    }
    
    // Filtros de categoría
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterToolsByCategory(category);
        });
    });
}

function setupThemeListeners() {
    const miniThemeBtns = document.querySelectorAll('.mini-theme-btn');
    
    miniThemeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se active el click de la tarjeta
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
            
            // Actualizar estado activo de los botones
            miniThemeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function navigateToTool(tool) {
    console.log('Navegando a:', tool);
    
    // Iniciar transición del dashboard
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
        dashboardMain.classList.add('hiding');
    }
    
    // Esperar a que termine la transición del dashboard antes de mostrar la herramienta
    setTimeout(() => {
        // Ocultar dashboard
        hideDashboard();
        
        // Mostrar el panel correspondiente
        hideAllPanels();
        
        switch(tool) {
            case 'calculadora':
                showPanel('calc-panel');
                updateActiveMenuItem('menu-calculadora');
                window.location.hash = 'calculator';
                break;
            case 'escala':
                showPanel('escala-panel');
                updateActiveMenuItem('menu-escala');
                window.location.hash = 'escala';
                if (typeof generarTablaEscala === 'function') {
                    generarTablaEscala();
                }
                break;
            case 'multi':
                showPanel('multi-panel');
                updateActiveMenuItem('menu-multi');
                window.location.hash = 'multi';
                break;
            case 'calendario':
                showPanel('calendario-panel');
                updateActiveMenuItem('menu-calendario');
                window.location.hash = 'calendario';
                break;
            case 'word-counter':
                showPanel('word-counter-panel');
                updateActiveMenuItem('menu-word-counter');
                window.location.hash = 'word-counter';
                break;
            case 'rubricas':
                showPanel('rubricas-panel');
                updateActiveMenuItem('menu-rubricas');
                window.location.hash = 'rubricas';
                break;
            case 'timeline':
                showPanel('timeline-panel');
                updateActiveMenuItem('menu-timeline');
                window.location.hash = 'timeline';
                // Inicializar la aplicación de timeline
                if (typeof initTimeline === 'function') {
                    initTimeline();
                }
                break;
            case 'config':
                showPanel('config');
                updateActiveMenuItem('menu-config');
                window.location.hash = 'config';
                break;
            case 'themes':
                showPanel('themes-panel');
                updateActiveMenuItem('menu-themes');
                window.location.hash = 'themes';
                break;
            default:
                console.warn('Herramienta no reconocida:', tool);
        }
        
        // Mostrar botón de regreso
        showBackButton();
    }, 300);
}

function showPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.style.display = 'block';
        setTimeout(() => {
            panel.classList.add('visible');
        }, 50);
    }
}

function hideAllPanels() {
    const panels = [
        'calc-panel', 'escala-panel', 'multi-panel', 
        'calendario-panel', 'word-counter-panel', 'rubricas-panel',
        'config', 'themes-panel', 'timeline-panel'
    ];
    
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('visible');
        }
    });
}

function updateActiveMenuItem(menuId) {
    console.log('Activando item de menú:', menuId);
}

function showDashboard() {
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
        dashboardMain.style.display = 'block';
        document.body.classList.add('dashboard-active');
        dashboardMain.classList.remove('hiding');
        setTimeout(() => {
            dashboardMain.classList.add('showing');
        }, 50);
    }
    hideBackButton();
}

function hideDashboard() {
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
        dashboardMain.style.display = 'none';
        document.body.classList.remove('dashboard-active');
        dashboardMain.classList.remove('showing', 'hiding');
    }
}

function showBackButton() {
    let backBtn = document.getElementById('back-to-dashboard-btn');
    
    if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.id = 'back-to-dashboard-btn';
        backBtn.className = 'back-to-dashboard';
        backBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
            </svg>
        `;
        
        backBtn.addEventListener('click', function() {
            returnToDashboard();
        });
        
        document.body.appendChild(backBtn);
    }
    
    backBtn.style.display = 'flex';
    setTimeout(() => {
        backBtn.classList.add('visible');
    }, 100);
}

function hideBackButton() {
    const backBtn = document.getElementById('back-to-dashboard-btn');
    if (backBtn) {
        backBtn.style.display = 'none';
        backBtn.classList.remove('visible');
    }
}

function returnToDashboard() {
    const backBtn = document.getElementById('back-to-dashboard-btn');
    if (backBtn) {
        backBtn.classList.remove('visible');
    }
    
    hideAllPanels();
    
    const configPanel = document.querySelector('.config-panel');
    if (configPanel) {
        configPanel.style.display = 'none';
        configPanel.classList.remove('visible');
    }
    
    showDashboard();
    window.location.hash = '';
}

function filterTools(searchTerm) {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const title = card.querySelector('.tool-title').textContent.toLowerCase();
        const description = card.querySelector('.tool-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function filterToolsByCategory(category) {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        if (category === 'all') {
            card.classList.remove('hidden');
        } else {
            const cardCategory = card.getAttribute('data-category');
            if (cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

function changeTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-rosa', 'theme-oscuro');
    document.body.classList.add(theme);
    localStorage.setItem('selectedTheme', theme);
    console.log('Tema cambiado a:', theme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        changeTheme(savedTheme);
        
        const miniThemeBtns = document.querySelectorAll('.mini-theme-btn');
        miniThemeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === savedTheme) {
                btn.classList.add('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', loadSavedTheme);

window.dashboardFunctions = {
    showDashboard,
    hideDashboard,
    navigateToTool,
    returnToDashboard
}; 