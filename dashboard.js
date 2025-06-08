// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {

    // Inicializar el dashboard si estamos en la página principal
    initializeDashboard();

    // Event listeners para las tarjetas
    setupToolCardListeners();

    // Event listeners para búsqueda y filtros
    setupSearchAndFilters();

    // Event listeners para temas
    setupThemeListeners();

    // Event listener para botón de usuario
    setupUserButton();
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
    // Listeners para tarjetas del sistema anterior (si existen)
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            navigateToTool(tool);
        });
    });
    
    // Listeners para las nuevas tarjetas del launcher
    const launcherAppLinks = document.querySelectorAll('.launcher-app-link');
    launcherAppLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
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
    // Botones de temas en las tarjetas (mini)
    const miniThemeBtns = document.querySelectorAll('.mini-theme-btn');
    
    miniThemeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se active el click de la tarjeta
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
            
            // Actualizar estado activo de todos los botones de temas
            updateThemeButtonsState(theme);
        });
    });
    
    // Botones de temas en el header
    const headerThemeBtns = document.querySelectorAll('.header-theme-btn');
    
    headerThemeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
            
            // Actualizar estado activo de todos los botones de temas
            updateThemeButtonsState(theme);
        });
    });
}

function updateThemeButtonsState(activeTheme) {
    // Actualizar botones mini
    const miniThemeBtns = document.querySelectorAll('.mini-theme-btn');
    miniThemeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar botones del header
    const headerThemeBtns = document.querySelectorAll('.header-theme-btn');
    headerThemeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function navigateToTool(tool) {
    
    // Ocultar inmediatamente el botón de créditos
    hideCreditsButton();
    
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
                window.location.href = 'word-counter.html';
                break;
            case 'rubricas':
                showPanel('rubricas-panel');
                updateActiveMenuItem('menu-rubricas');
                window.location.hash = 'rubricas';
                break;
            case 'grupos-aleatorios':
                window.location.href = 'grupos-aleatorios.html';
                break;
            case 'config':
                showPanel('config');
                updateActiveMenuItem('menu-config');
                window.location.hash = 'config';
                break;
            case 'libro-clases':
                window.location.href = 'libro-clases.html';
                break;
            case 'matematicas-rapidas':
                window.location.href = 'matematicas-rapidas.html';
                break;
            // case 'themes': - ELIMINADO
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
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0) scale(1)';
        
        setTimeout(() => {
            panel.classList.add('visible');
        }, 50);
    }
}

function hideAllPanels() {
    const panels = [
        'calc-panel', 'escala-panel', 'multi-panel', 
        'calendario-panel', 'rubricas-panel',
        'config'
    ];
    
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'none';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px) scale(0.95)';
            panel.classList.remove('visible');
        }
    });
}

function updateActiveMenuItem(menuId) {
    // Función para actualizar el menú activo si es necesario
}

function showDashboard() {
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
        dashboardMain.style.display = 'block';
        dashboardMain.classList.remove('hiding');
        setTimeout(() => {
            dashboardMain.classList.add('showing');
        }, 50);
    }
    hideBackButton();
    showCreditsButton();
}

function hideDashboard() {
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
        dashboardMain.style.display = 'none';
        dashboardMain.classList.remove('showing', 'hiding');
    }
    hideCreditsButton();
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
    showCreditsButton();
    window.location.hash = '';
}

function filterTools(searchTerm) {
    // Filtrar tarjetas del sistema anterior
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        const titleElement = card.querySelector('.tool-title') || card.querySelector('h3');
        const descElement = card.querySelector('.tool-description') || card.querySelector('p');
        
        if (titleElement && descElement) {
            const title = titleElement.textContent.toLowerCase();
            const description = descElement.textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
    
    // Filtrar nuevas tarjetas del launcher
    const launcherAppItems = document.querySelectorAll('.launcher-app-item');
    launcherAppItems.forEach(item => {
        const titleElement = item.querySelector('.launcher-app-title');
        const descElement = item.querySelector('.launcher-app-description');
        
        if (titleElement && descElement) {
            const title = titleElement.textContent.toLowerCase();
            const description = descElement.textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

function filterToolsByCategory(category) {
    // Filtrar tarjetas del sistema anterior
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
    
    // Filtrar nuevas tarjetas del launcher
    const launcherAppItems = document.querySelectorAll('.launcher-app-item');
    launcherAppItems.forEach(item => {
        if (category === 'all') {
            item.style.display = 'block';
        } else {
            const itemCategory = item.getAttribute('data-category');
            if (itemCategory === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

function changeTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-rosa', 'theme-oscuro');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme); // Cambiar a 'theme' para consistencia
    console.log('Tema cambiado a:', theme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme'); // Cambiar a 'theme' para consistencia
    if (savedTheme) {
        changeTheme(savedTheme);
        
        // Actualizar estado de todos los botones de temas
        updateThemeButtonsState(savedTheme);
    }
}

document.addEventListener('DOMContentLoaded', loadSavedTheme);

function setupUserButton() {
    const userBtn = document.getElementById('user-btn');
    
    if (userBtn) {
        userBtn.addEventListener('click', async function() {
            console.log('Botón de usuario clickeado');
            
            // Verificar si AuthManager está disponible
            if (window.authManager && typeof window.authManager.init === 'function') {
                try {
                    // Inicializar AuthManager si no está inicializado
                    if (!window.authManager.initialized) {
                        await window.authManager.init();
                    }
                    
                    // Verificar si el usuario está autenticado
                    if (window.authManager.isAuthenticated()) {
                        // Usuario ya autenticado, mostrar opciones
                        showUserMenu();
                    } else {
                        // Usuario no autenticado, mostrar modal de login
                        window.authManager.showAuthModal();
                    }
                } catch (error) {
                    console.error('Error al inicializar AuthManager:', error);
                    // Fallback: mostrar modal sin verificar estado
                    window.authManager.showAuthModal();
                }
            } else {
                console.warn('AuthManager no disponible');
                // Fallback: mostrar mensaje
                alert('Sistema de autenticación no disponible');
            }
        });
        
        // Actualizar el estado del botón basado en la autenticación
        updateUserButtonState();
    }
}

function updateUserButtonState() {
    const userBtn = document.getElementById('user-btn');
    const userText = userBtn?.querySelector('.user-text');
    const userIcon = userBtn?.querySelector('.user-icon');
    
    if (userBtn && userText && userIcon) {
        // Verificar si el usuario está autenticado
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            const userName = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
            
            userText.textContent = userName;
            userIcon.textContent = '👤';
            userBtn.title = 'Menú de usuario';
        } else {
            userText.textContent = 'Iniciar Sesión';
            userIcon.textContent = '🔑';
            userBtn.title = 'Iniciar sesión o registrarse';
        }
    }
}

function showUserMenu() {
    // Implementar menú desplegable para usuario autenticado
    const user = window.authManager.getCurrentUser();
    const userName = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
    
    // Crear menú temporal (se puede mejorar con un modal más elaborado)
    const options = [
        'Sincronizar datos',
        'Configuración de cuenta',
        'Cerrar sesión'
    ];
    
    const choice = confirm(`¡Hola ${userName}!\n\n¿Deseas cerrar sesión?`);
    
    if (choice) {
        window.authManager.logout().then(() => {
            updateUserButtonState();
        });
    }
}

// Escuchar cambios en el estado de autenticación para actualizar el botón
document.addEventListener('DOMContentLoaded', function() {
    // Configurar un listener para cambios de autenticación
    if (window.authManager) {
        const originalOnLogin = window.authManager.onLogin;
        const originalOnLogout = window.authManager.onLogout;
        
        window.authManager.onLogin = function(user) {
            if (originalOnLogin) {
                originalOnLogin.call(this, user);
            }
            updateUserButtonState();
        };
        
        window.authManager.onLogout = function() {
            if (originalOnLogout) {
                originalOnLogout.call(this);
            }
            updateUserButtonState();
        };
    }
});

// Funciones para controlar la visibilidad del botón de créditos
function showCreditsButton() {
    document.body.classList.remove('app-active');
    document.body.classList.add('dashboard-active');
    console.log('Botón de créditos mostrado - dashboard activo');
}

function hideCreditsButton() {
    document.body.classList.remove('dashboard-active');
    document.body.classList.add('app-active');
    console.log('Botón de créditos ocultado - app activa');
}

function closeAllModals() {
    // Solo cerrar modales que realmente están interfiriendo
    const problematicModals = document.querySelectorAll('.modal');
    let modalsClosed = 0;
    
    problematicModals.forEach(modal => {
        const computedStyle = window.getComputedStyle(modal);
        const rect = modal.getBoundingClientRect();
        
        // Solo cerrar si está realmente visible y tiene tamaño significativo
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' && 
                         parseFloat(computedStyle.opacity) > 0.1 &&
                         rect.width > 100 && rect.height > 100;
        
        if (isVisible) {
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.classList.remove('show', 'visible', 'active');
            modalsClosed++;
        }
    });
    
    // Restaurar scroll del body solo si es necesario
    if (modalsClosed > 0) {
        document.body.style.overflow = '';
        document.body.style.overflowY = 'auto';
        console.log(`✅ ${modalsClosed} modales cerrados`);
    }
}



window.dashboardFunctions = {
    showDashboard,
    hideDashboard,
    navigateToTool,
    returnToDashboard,
    updateUserButtonState,
    showCreditsButton,
    hideCreditsButton,
    closeAllModals
}; 