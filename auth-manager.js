// Gestor de Autenticación para NinjPro con Supabase
class AuthManager {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        if (typeof window.SupabaseConfig === 'undefined') {
            console.error('❌ SupabaseConfig not found');
            return false;
        }

        this.client = window.SupabaseConfig.getClient();
        if (!this.client) {
            console.error('❌ Supabase client not initialized');
            return false;
        }

        // Escuchar cambios en el estado de autenticación
        this.client.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth state changed:', event);
            
            if (session?.user) {
                this.currentUser = session.user;
                this.onLogin(this.currentUser);
            } else {
                this.currentUser = null;
                this.onLogout();
            }
        });

        // Verificar sesión actual
        const { data: { session } } = await this.client.auth.getSession();
        if (session?.user) {
            this.currentUser = session.user;
            console.log('✅ User already authenticated:', this.currentUser.email);
        }

        this.initialized = true;
        console.log('✅ AuthManager initialized');
        return true;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    async login(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            console.log('✅ User logged in successfully:', email);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async signup(email, password, userData = {}) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nombre: userData.nombre || '',
                        apellido: userData.apellido || '',
                        institucion: userData.institucion || ''
                    }
                }
            });

            if (error) throw error;
            console.log('✅ User registered successfully:', email);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            console.log('✅ User logged out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    onLogin(user) {
        console.log('👤 User logged in:', user.email);
        
        // Inicializar adaptador de Supabase
        if (window.supabaseAdapter) {
            window.supabaseAdapter.init();
        }

        this.hideAuthModal();
        this.showWelcomeMessage(user);
    }

    onLogout() {
        console.log('👋 User logged out');
        
        if (window.supabaseAdapter) {
            window.supabaseAdapter.clearCache();
        }
    }

    showWelcomeMessage(user) {
        const userName = user.user_metadata?.nombre || user.email.split('@')[0];
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div>
                <h3>¡Bienvenido, ${userName}! 👋</h3>
                <p>Tus datos se sincronizarán automáticamente</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 4000);
    }

    showAuthModal() {
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                <div style="background: white; border-radius: 15px; padding: 30px; max-width: 400px; width: 90%;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="margin: 0 0 10px 0; color: #333;">🎓 NinjPro</h2>
                        <p style="margin: 0; color: #666;">Inicia sesión para sincronizar</p>
                    </div>
                    
                    <div style="display: flex; margin-bottom: 20px;">
                        <button class="auth-tab active" data-tab="login" style="flex: 1; padding: 10px; border: none; background: none; cursor: pointer;">Iniciar Sesión</button>
                        <button class="auth-tab" data-tab="register" style="flex: 1; padding: 10px; border: none; background: none; cursor: pointer;">Registrarse</button>
                    </div>

                    <form id="login-form" class="auth-form active">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">Email</label>
                            <input type="email" id="login-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">Contraseña</label>
                            <input type="password" id="login-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Iniciar Sesión</button>
                    </form>

                    <form id="register-form" class="auth-form" style="display: none;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">Email</label>
                            <input type="email" id="register-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">Contraseña</label>
                            <input type="password" id="register-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">Nombre</label>
                            <input type="text" id="register-nombre" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Registrarse</button>
                    </form>

                    <div style="text-align: center; margin-top: 20px;">
                        <button class="offline-mode-btn" style="padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 5px; cursor: pointer;">Continuar sin cuenta</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            z-index: 10000;
        `;

        this.setupAuthModalListeners(modal);
        return modal;
    }

    setupAuthModalListeners(modal) {
        // Tabs
        modal.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                modal.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
                modal.getElementById(`${targetTab}-form`).style.display = 'block';
            });
        });

        // Login
        modal.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = modal.getElementById('login-email').value;
            const password = modal.getElementById('login-password').value;
            
            const result = await this.login(email, password);
            if (!result.success) {
                alert('Error: ' + result.error);
            }
        });

        // Register
        modal.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = modal.getElementById('register-email').value;
            const password = modal.getElementById('register-password').value;
            const userData = {
                nombre: modal.getElementById('register-nombre').value
            };
            
            const result = await this.signup(email, password, userData);
            if (result.success) {
                alert('¡Registro exitoso! Revisa tu email.');
            } else {
                alert('Error: ' + result.error);
            }
        });

        // Offline mode
        modal.querySelector('.offline-mode-btn').addEventListener('click', () => {
            this.hideAuthModal();
        });
    }
}

window.authManager = new AuthManager();
console.log('🔐 AuthManager loaded');
