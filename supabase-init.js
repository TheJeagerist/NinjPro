// Inicializador principal de Supabase para NinjPro
class SupabaseInitializer {
    constructor() {
        this.initialized = false;
    }

    async init() {
        console.log('🚀 Iniciando integración con Supabase...');
        
        // Cargar librería de Supabase si no está disponible
        if (typeof supabase === 'undefined') {
            await this.loadSupabaseLibrary();
        }

        try {
            // Inicializar configuración
            if (window.SupabaseConfig) {
                window.SupabaseConfig.init();
            }

            // Inicializar autenticación
            if (window.authManager) {
                await window.authManager.init();
            }

            // Inicializar adaptador
            if (window.supabaseAdapter) {
                await window.supabaseAdapter.init();
            }

            // Configurar UI
            this.initUI();
            
            // Configurar auto-guardado
            this.setupAutoSave();

            this.initialized = true;
            console.log('✅ Supabase integración completada');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            return false;
        }
    }

    async loadSupabaseLibrary() {
        console.log('📦 Cargando librería de Supabase...');
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('✅ Librería de Supabase cargada');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Error cargando librería de Supabase');
                reject(new Error('Failed to load Supabase library'));
            };
            document.head.appendChild(script);
        });
    }

    initUI() {
        // Añadir botón de autenticación
        this.addAuthButton();
        
        // Añadir panel de sincronización
        this.addSyncPanel();
        
        // Añadir indicador de estado
        this.addStatusIndicator();
    }

    addAuthButton() {
        // Botón de autenticación eliminado - se usa el botón principal del dashboard
        // El botón de usuario principal en el header del dashboard maneja la autenticación
        console.log('🔧 Botón de autenticación de Supabase deshabilitado - usando botón principal del dashboard');
    }

    addSyncPanel() {
        const syncPanel = document.createElement('div');
        syncPanel.id = 'supabase-sync-panel';
        syncPanel.innerHTML = `
            <div style="
                padding: 15px;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            " onclick="
                const content = this.nextElementSibling;
                const isOpen = content.style.display !== 'none';
                content.style.display = isOpen ? 'none' : 'block';
            ">
                <h3 style="margin: 0; font-size: 14px; color: #333;">🔄 Sincronización</h3>
                <span style="font-size: 12px;">▼</span>
            </div>
            <div style="padding: 15px; display: none;">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                    <span id="sync-status-text">Listo para sincronizar</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                    <button id="sync-to-cloud" style="
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background: white;
                        cursor: pointer;
                        font-size: 12px;
                    ">📤 Subir a la nube</button>
                    <button id="sync-from-cloud" style="
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background: white;
                        cursor: pointer;
                        font-size: 12px;
                    ">📥 Descargar de la nube</button>
                </div>
                <div style="text-align: center; color: #666; font-size: 11px;">
                    Los datos se sincronizan automáticamente
                </div>
            </div>
        `;

        syncPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 9998;
            min-width: 250px;
            border: 1px solid #e0e0e0;
        `;

        // Event listeners para botones
        syncPanel.querySelector('#sync-to-cloud').addEventListener('click', () => this.syncToCloud());
        syncPanel.querySelector('#sync-from-cloud').addEventListener('click', () => this.syncFromCloud());

        document.body.appendChild(syncPanel);
    }

    addStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'supabase-status-indicator';
        indicator.innerHTML = `
            <div id="status-dot" style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ffc107;
            "></div>
            <span id="status-text">Conectando...</span>
        `;

        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 9997;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        document.body.appendChild(indicator);

        // Actualizar estado cada 5 segundos
        setInterval(() => {
            const dot = indicator.querySelector('#status-dot');
            const text = indicator.querySelector('#status-text');
            
            if (window.authManager?.isAuthenticated()) {
                dot.style.background = '#28a745';
                text.textContent = 'Conectado a la nube';
            } else {
                dot.style.background = '#6c757d';
                text.textContent = 'Modo local';
            }
        }, 5000);
    }

    async syncToCloud() {
        if (!window.authManager?.isAuthenticated()) {
            alert('Debes iniciar sesión para sincronizar');
            return;
        }

        const statusText = document.getElementById('sync-status-text');
        statusText.textContent = 'Sincronizando...';

        try {
            await window.supabaseAdapter?.syncLocalToSupabase();
            statusText.textContent = '✅ Sincronizado';
            setTimeout(() => {
                statusText.textContent = 'Listo para sincronizar';
            }, 3000);
        } catch (error) {
            console.error('Error syncing:', error);
            statusText.textContent = '❌ Error';
        }
    }

    async syncFromCloud() {
        if (!window.authManager?.isAuthenticated()) {
            alert('Debes iniciar sesión para descargar');
            return;
        }

        const statusText = document.getElementById('sync-status-text');
        statusText.textContent = 'Descargando...';

        try {
            // Descargar datos desde la nube
            const cursosData = await window.supabaseAdapter?.getCursosData();
            if (cursosData) {
                localStorage.setItem('cursosData', JSON.stringify(cursosData));
            }

            statusText.textContent = '✅ Descargado';
            setTimeout(() => {
                statusText.textContent = 'Listo para sincronizar';
                location.reload(); // Recargar para aplicar cambios
            }, 2000);
        } catch (error) {
            console.error('Error downloading:', error);
            statusText.textContent = '❌ Error';
        }
    }

    setupAutoSave() {
        // Interceptar localStorage para auto-sync
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.call(this, key, value);
            
            // Auto-sync datos importantes
            if (window.authManager?.isAuthenticated() && window.supabaseAdapter) {
                if (['cursosData', 'rubricas_guardadas', 'templates'].includes(key)) {
                    setTimeout(() => {
                        switch(key) {
                            case 'cursosData':
                                window.supabaseAdapter.saveCursosData(JSON.parse(value));
                                break;
                            case 'rubricas_guardadas':
                                window.supabaseAdapter.saveRubricas(JSON.parse(value));
                                break;
                            case 'templates':
                                window.supabaseAdapter.saveTemplates(JSON.parse(value));
                                break;
                        }
                    }, 1000);
                }
            }
        };

        console.log('✅ Auto-save configurado');
    }
}

// Inicializar cuando esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        const initializer = new SupabaseInitializer();
        await initializer.init();
        window.supabaseInitializer = initializer;
    }, 1000);
});

console.log('🚀 Supabase Initializer loaded');
