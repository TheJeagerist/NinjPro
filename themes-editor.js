// Editor de Temas Visuales
document.addEventListener('DOMContentLoaded', function() {
    initializeThemesEditor();
});

function initializeThemesEditor() {
    // Event listeners para temas predefinidos
    setupPredefinedThemes();
    
    // Event listeners para el editor de fondos
    setupBackgroundEditor();
    
    // Cargar paletas guardadas
    loadSavedPalettes();
    
    // Inicializar vista previa
    updatePreview();
}

function setupPredefinedThemes() {
    const applyThemeBtns = document.querySelectorAll('.apply-theme-btn');
    
    applyThemeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const themeOption = this.closest('.theme-option');
            const theme = themeOption.getAttribute('data-theme');
            applyTheme(theme);
            
            // Mostrar feedback visual
            showThemeAppliedFeedback(this);
        });
    });
}

function setupBackgroundEditor() {
    // Event listeners para los controles de color
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateColorValue(this);
            updatePreview();
        });
    });
    
    // Event listeners para los controles de rango
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateRangeValue(this);
            updatePreview();
        });
    });
    
    // Event listeners para los radio buttons
    const radioInputs = document.querySelectorAll('input[name="bg-type"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', function() {
            toggleBackgroundTypeControls(this.value);
            updatePreview();
        });
    });
    
    // Event listeners para los botones de acción
    document.getElementById('apply-custom-bg').addEventListener('click', applyCustomBackground);
    document.getElementById('save-custom-theme').addEventListener('click', saveCustomTheme);
    document.getElementById('reset-to-default').addEventListener('click', resetToDefault);
}

function updateColorValue(input) {
    const valueSpan = document.getElementById(input.id.replace('bg-', '').replace('text-', '') + '-value');
    if (valueSpan) {
        valueSpan.textContent = input.value.toUpperCase();
    }
}

function updateRangeValue(input) {
    const valueSpan = document.getElementById(input.id + '-value');
    if (valueSpan) {
        valueSpan.textContent = input.value + '°';
    }
}

function toggleBackgroundTypeControls(type) {
    const gradientControls = document.querySelector('.gradient-controls');
    
    if (type === 'gradient') {
        gradientControls.style.display = 'block';
    } else {
        gradientControls.style.display = 'none';
    }
}

function updatePreview() {
    const previewContainer = document.getElementById('background-preview');
    const bgType = document.querySelector('input[name="bg-type"]:checked').value;
    
    const color1 = document.getElementById('bg-color-1').value;
    const color2 = document.getElementById('bg-color-2').value;
    const color3 = document.getElementById('bg-color-3').value;
    const textColor = document.getElementById('text-color').value;
    
    let backgroundStyle = '';
    
    switch (bgType) {
        case 'solid':
            backgroundStyle = color1;
            break;
        case 'gradient':
            const angle = document.getElementById('gradient-angle').value;
            backgroundStyle = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
            break;
        case 'animated':
            backgroundStyle = `linear-gradient(45deg, ${color1}, ${color2}, ${color3})`;
            previewContainer.style.backgroundSize = '400% 400%';
            previewContainer.style.animation = 'gradientShift 8s ease infinite';
            break;
    }
    
    previewContainer.style.background = backgroundStyle;
    previewContainer.style.color = textColor;
    
    // Actualizar colores del contenido de la vista previa
    const previewCards = previewContainer.querySelectorAll('.preview-tool-card');
    previewCards.forEach(card => {
        card.style.background = `rgba(255, 255, 255, 0.1)`;
        card.style.borderColor = `rgba(255, 255, 255, 0.2)`;
        card.style.color = textColor;
    });
    
    const previewIcons = previewContainer.querySelectorAll('.preview-icon');
    previewIcons.forEach(icon => {
        icon.style.background = `linear-gradient(135deg, ${color3} 0%, ${color2} 100%)`;
    });
}

function applyCustomBackground() {
    const bgType = document.querySelector('input[name="bg-type"]:checked').value;
    const color1 = document.getElementById('bg-color-1').value;
    const color2 = document.getElementById('bg-color-2').value;
    const color3 = document.getElementById('bg-color-3').value;
    const textColor = document.getElementById('text-color').value;
    
    // Crear tema personalizado
    const customTheme = {
        type: bgType,
        colors: {
            primary: color1,
            secondary: color2,
            accent: color3,
            text: textColor
        }
    };
    
    if (bgType === 'gradient') {
        customTheme.gradientAngle = document.getElementById('gradient-angle').value;
    }
    
    // Aplicar al body
    applyCustomThemeToBody(customTheme);
    
    // Guardar en localStorage
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
    
    // Mostrar feedback
    showCustomThemeAppliedFeedback();
}

function applyCustomThemeToBody(customTheme) {
    const body = document.body;
    
    // Remover temas predefinidos
    body.classList.remove('theme-dark', 'theme-light', 'theme-rosa', 'theme-oscuro');
    body.classList.add('theme-custom');
    
    // Crear o actualizar las variables CSS personalizadas
    const root = document.documentElement;
    
    root.style.setProperty('--custom-bg-primary', customTheme.colors.primary);
    root.style.setProperty('--custom-bg-secondary', customTheme.colors.secondary);
    root.style.setProperty('--custom-accent', customTheme.colors.accent);
    root.style.setProperty('--custom-text', customTheme.colors.text);
    
    let backgroundStyle = '';
    
    switch (customTheme.type) {
        case 'solid':
            backgroundStyle = customTheme.colors.primary;
            break;
        case 'gradient':
            const angle = customTheme.gradientAngle || 135;
            backgroundStyle = `linear-gradient(${angle}deg, ${customTheme.colors.primary} 0%, ${customTheme.colors.secondary} 50%, ${customTheme.colors.accent} 100%)`;
            break;
        case 'animated':
            backgroundStyle = `linear-gradient(45deg, ${customTheme.colors.primary}, ${customTheme.colors.secondary}, ${customTheme.colors.accent})`;
            body.style.backgroundSize = '400% 400%';
            body.style.animation = 'gradientShift 8s ease infinite';
            break;
    }
    
    body.style.background = backgroundStyle;
    body.style.color = customTheme.colors.text;
}

function saveCustomTheme() {
    const themeName = prompt('Nombre para el tema personalizado:');
    if (!themeName || themeName.trim() === '') return;
    
    const bgType = document.querySelector('input[name="bg-type"]:checked').value;
    const color1 = document.getElementById('bg-color-1').value;
    const color2 = document.getElementById('bg-color-2').value;
    const color3 = document.getElementById('bg-color-3').value;
    const textColor = document.getElementById('text-color').value;
    
    const customTheme = {
        name: themeName.trim(),
        type: bgType,
        colors: {
            primary: color1,
            secondary: color2,
            accent: color3,
            text: textColor
        },
        timestamp: new Date().toISOString()
    };
    
    if (bgType === 'gradient') {
        customTheme.gradientAngle = document.getElementById('gradient-angle').value;
    }
    
    // Obtener paletas guardadas o crear array vacío
    let savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
    
    // Agregar la nueva paleta
    savedPalettes.push(customTheme);
    
    // Guardar en localStorage
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
    
    // Recargar la lista de paletas guardadas
    loadSavedPalettes();
    
    // Mostrar feedback
    showThemeSavedFeedback(themeName);
}

function loadSavedPalettes() {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
    const palettesList = document.getElementById('saved-palettes-list');
    
    if (savedPalettes.length === 0) {
        palettesList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; font-style: italic;">No hay paletas guardadas</p>';
        return;
    }
    
    palettesList.innerHTML = '';
    
    savedPalettes.forEach((palette, index) => {
        const paletteElement = createPaletteElement(palette, index);
        palettesList.appendChild(paletteElement);
    });
}

function createPaletteElement(palette, index) {
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'saved-palette';
    
    // Crear vista previa de la paleta
    let previewBackground = '';
    switch (palette.type) {
        case 'solid':
            previewBackground = palette.colors.primary;
            break;
        case 'gradient':
            const angle = palette.gradientAngle || 135;
            previewBackground = `linear-gradient(${angle}deg, ${palette.colors.primary} 0%, ${palette.colors.secondary} 50%, ${palette.colors.accent} 100%)`;
            break;
        case 'animated':
            previewBackground = `linear-gradient(45deg, ${palette.colors.primary}, ${palette.colors.secondary}, ${palette.colors.accent})`;
            break;
    }
    
    paletteDiv.innerHTML = `
        <div class="palette-preview" style="background: ${previewBackground};"></div>
        <div class="palette-name">${palette.name}</div>
        <div class="palette-actions">
            <button class="palette-btn apply" onclick="applyPalette(${index})">Aplicar</button>
            <button class="palette-btn delete" onclick="deletePalette(${index})">Eliminar</button>
        </div>
    `;
    
    return paletteDiv;
}

function applyPalette(index) {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
    const palette = savedPalettes[index];
    
    if (!palette) return;
    
    // Actualizar los controles del editor
    document.getElementById('bg-color-1').value = palette.colors.primary;
    document.getElementById('bg-color-2').value = palette.colors.secondary;
    document.getElementById('bg-color-3').value = palette.colors.accent;
    document.getElementById('text-color').value = palette.colors.text;
    
    updateColorValue(document.getElementById('bg-color-1'));
    updateColorValue(document.getElementById('bg-color-2'));
    updateColorValue(document.getElementById('bg-color-3'));
    updateColorValue(document.getElementById('text-color'));
    
    // Actualizar tipo de fondo
    const bgTypeRadio = document.querySelector(`input[name="bg-type"][value="${palette.type}"]`);
    if (bgTypeRadio) {
        bgTypeRadio.checked = true;
        toggleBackgroundTypeControls(palette.type);
    }
    
    // Actualizar ángulo si es degradado
    if (palette.type === 'gradient' && palette.gradientAngle) {
        document.getElementById('gradient-angle').value = palette.gradientAngle;
        updateRangeValue(document.getElementById('gradient-angle'));
    }
    
    // Actualizar vista previa
    updatePreview();
    
    // Aplicar al tema
    applyCustomThemeToBody(palette);
    
    showPaletteAppliedFeedback(palette.name);
}

function deletePalette(index) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta paleta?')) return;
    
    let savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
    savedPalettes.splice(index, 1);
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
    
    loadSavedPalettes();
    showPaletteDeletedFeedback();
}

function resetToDefault() {
    if (!confirm('¿Restaurar la configuración predeterminada? Se perderán los cambios no guardados.')) return;
    
    // Restaurar valores predeterminados
    document.getElementById('bg-color-1').value = '#1a1e2e';
    document.getElementById('bg-color-2').value = '#232636';
    document.getElementById('bg-color-3').value = '#667eea';
    document.getElementById('text-color').value = '#ffffff';
    document.getElementById('gradient-angle').value = '135';
    
    // Actualizar valores mostrados
    updateColorValue(document.getElementById('bg-color-1'));
    updateColorValue(document.getElementById('bg-color-2'));
    updateColorValue(document.getElementById('bg-color-3'));
    updateColorValue(document.getElementById('text-color'));
    updateRangeValue(document.getElementById('gradient-angle'));
    
    // Seleccionar color sólido
    document.querySelector('input[name="bg-type"][value="solid"]').checked = true;
    toggleBackgroundTypeControls('solid');
    
    // Actualizar vista previa
    updatePreview();
    
    // Aplicar tema oscuro predeterminado
    applyTheme('theme-dark');
    
    showResetFeedback();
}

function applyTheme(theme) {
    // Usar la función existente del dashboard
    if (typeof changeTheme === 'function') {
        changeTheme(theme);
    } else {
        // Fallback si no está disponible
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-rosa', 'theme-oscuro', 'theme-custom');
        document.body.classList.add(theme);
        localStorage.setItem('selectedTheme', theme);
    }
}

// Funciones de feedback
function showThemeAppliedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Aplicado';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function showCustomThemeAppliedFeedback() {
    const button = document.getElementById('apply-custom-bg');
    const originalText = button.innerHTML;
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ✓ Aplicado
    `;
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
}

function showThemeSavedFeedback(themeName) {
    const button = document.getElementById('save-custom-theme');
    const originalText = button.innerHTML;
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Guardado
    `;
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
}

function showPaletteAppliedFeedback(paletteName) {
    console.log(`Paleta "${paletteName}" aplicada correctamente`);
}

function showPaletteDeletedFeedback() {
    console.log('Paleta eliminada correctamente');
}

function showResetFeedback() {
    const button = document.getElementById('reset-to-default');
    const originalText = button.innerHTML;
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Restaurado
    `;
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
}

// Añadir estilos CSS para la animación del fondo animado
const style = document.createElement('style');
style.textContent = `
    @keyframes gradientShift {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    
    .theme-custom {
        background-size: 400% 400% !important;
    }
`;
document.head.appendChild(style);

// Exportar funciones para uso global
window.themesEditor = {
    applyPalette,
    deletePalette,
    applyCustomBackground,
    saveCustomTheme,
    resetToDefault
}; 