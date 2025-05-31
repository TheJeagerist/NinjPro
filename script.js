document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los paneles
    const panels = {
        'calc-panel': document.getElementById('calc-panel'),
        'escala-panel': document.getElementById('escala-panel'),
        'multi-panel': document.getElementById('multi-panel'),
        'calendario-panel': document.getElementById('calendario-panel'),
        'word-counter-panel': document.getElementById('word-counter-panel')
    };

    // Obtener todos los botones del menú
    const menuButtons = {
        'menu-calculadora': document.getElementById('menu-calculadora'),
        'menu-escala': document.getElementById('menu-escala'),
        'menu-multi': document.getElementById('menu-multi'),
        'menu-calendario': document.getElementById('menu-calendario'),
        'menu-word-counter': document.getElementById('menu-word-counter')
    };

    // Mapeo de botones a paneles
    const buttonToPanelMap = {
        'menu-calculadora': 'calc-panel',
        'menu-escala': 'escala-panel',
        'menu-multi': 'multi-panel',
        'menu-calendario': 'calendario-panel',
        'menu-word-counter': 'word-counter-panel'
    };

    // Función para ocultar todos los paneles
    function hideAllPanels() {
        Object.values(panels).forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }

    // Función para remover la clase active de todos los botones
    function removeActiveFromAllButtons() {
        Object.values(menuButtons).forEach(button => {
            if (button) {
                button.classList.remove('active');
            }
        });
    }

    // Agregar eventos click a todos los botones del menú
    Object.entries(menuButtons).forEach(([buttonId, button]) => {
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Ocultar todos los paneles
                hideAllPanels();
                
                // Remover active de todos los botones
                removeActiveFromAllButtons();
                
                // Mostrar el panel correspondiente
                const panelId = buttonToPanelMap[buttonId];
                if (panels[panelId]) {
                    panels[panelId].style.display = 'block';
                }
                
                // Agregar clase active al botón actual
                this.classList.add('active');
            });
        }
    });

    // Mostrar el panel de calculadora por defecto
    hideAllPanels();
    if (panels['calc-panel']) {
        panels['calc-panel'].style.display = 'block';
    }
    if (menuButtons['menu-calculadora']) {
        menuButtons['menu-calculadora'].classList.add('active');
    }
}); 