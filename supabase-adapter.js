// Adaptador de Supabase para NinjPro
// Reemplaza localStorage con funciones de Supabase manteniendo la misma interfaz
// ============================================================================

class SupabaseAdapter {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
        this.cache = new Map(); // Cache local para mejorar rendimiento
        this.fallbackToLocalStorage = true; // Fallback a localStorage si Supabase falla
    }

    // Inicializar el adaptador
    async init() {
        if (typeof window.SupabaseConfig === 'undefined') {
            console.error('❌ SupabaseConfig not found. Make sure to load supabase-config.js first');
            return false;
        }

        this.client = window.SupabaseConfig.getClient();
        if (!this.client) {
            console.error('❌ Supabase client not initialized');
            return false;
        }

        // Obtener usuario actual
        const { data: { user } } = await this.client.auth.getUser();
        this.currentUser = user;

        if (!this.currentUser && this.fallbackToLocalStorage) {
            console.log('⚠️ No authenticated user, using localStorage as fallback');
        }

        this.initialized = true;
        console.log('✅ SupabaseAdapter initialized');
        return true;
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Función genérica para guardar datos
    async setItem(key, value, tableName = 'configuraciones') {
        if (!this.initialized) {
            console.warn('⚠️ SupabaseAdapter not initialized, using localStorage');
            return localStorage.setItem(key, value);
        }

        if (!this.isAuthenticated() && this.fallbackToLocalStorage) {
            return localStorage.setItem(key, value);
        }

        try {
            let data;
            if (typeof value === 'string') {
                try {
                    data = JSON.parse(value);
                } catch {
                    data = value;
                }
            } else {
                data = value;
            }

            const { error } = await this.client
                .from(tableName)
                .upsert({
                    usuario_id: this.currentUser.id,
                    clave: key,
                    valor: data
                });

            if (error) throw error;

            // Actualizar cache
            this.cache.set(`${tableName}:${key}`, data);
            console.log(`✅ Saved ${key} to ${tableName}`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving ${key}:`, error);
            if (this.fallbackToLocalStorage) {
                return localStorage.setItem(key, value);
            }
            throw error;
        }
    }

    // Función genérica para obtener datos
    async getItem(key, tableName = 'configuraciones') {
        if (!this.initialized) {
            console.warn('⚠️ SupabaseAdapter not initialized, using localStorage');
            return localStorage.getItem(key);
        }

        if (!this.isAuthenticated() && this.fallbackToLocalStorage) {
            return localStorage.getItem(key);
        }

        // Verificar cache primero
        const cacheKey = `${tableName}:${key}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            return typeof cached === 'object' ? JSON.stringify(cached) : cached;
        }

        try {
            const { data, error } = await this.client
                .from(tableName)
                .select('valor')
                .eq('usuario_id', this.currentUser.id)
                .eq('clave', key)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found, return null (same as localStorage behavior)
                    return null;
                }
                throw error;
            }

            const value = data?.valor;
            if (value !== undefined) {
                // Actualizar cache
                this.cache.set(cacheKey, value);
                return typeof value === 'object' ? JSON.stringify(value) : value;
            }

            return null;
        } catch (error) {
            console.error(`❌ Error getting ${key}:`, error);
            if (this.fallbackToLocalStorage) {
                return localStorage.getItem(key);
            }
            return null;
        }
    }

    // Eliminar un elemento
    async removeItem(key, tableName = 'configuraciones') {
        if (!this.initialized || !this.isAuthenticated()) {
            if (this.fallbackToLocalStorage) {
                return localStorage.removeItem(key);
            }
            return;
        }

        try {
            const { error } = await this.client
                .from(tableName)
                .delete()
                .eq('usuario_id', this.currentUser.id)
                .eq('clave', key);

            if (error) throw error;

            // Remover del cache
            this.cache.delete(`${tableName}:${key}`);
            console.log(`✅ Removed ${key} from ${tableName}`);
        } catch (error) {
            console.error(`❌ Error removing ${key}:`, error);
            if (this.fallbackToLocalStorage) {
                return localStorage.removeItem(key);
            }
        }
    }

    // Funciones específicas para diferentes tipos de datos

    // Gestión de cursos
    async saveCursosData(cursosData) {
        if (!this.isAuthenticated()) {
            return localStorage.setItem('cursosData', JSON.stringify(cursosData));
        }

        try {
            // Convertir el formato localStorage a formato Supabase
            const cursosArray = Object.entries(cursosData).map(([nombre, data]) => ({
                usuario_id: this.currentUser.id,
                nombre: nombre,
                descripcion: data.descripcion || '',
                ano: data.ano || new Date().getFullYear(),
                semestre: data.semestre || 1,
                estudiantes: data.estudiantes || []
            }));

            // Primero, eliminar cursos existentes para este usuario
            await this.client
                .from('cursos')
                .delete()
                .eq('usuario_id', this.currentUser.id);

            // Insertar nuevos cursos
            const { data: insertedCursos, error: cursosError } = await this.client
                .from('cursos')
                .insert(cursosArray)
                .select();

            if (cursosError) throw cursosError;

            // Para cada curso, insertar estudiantes
            for (const curso of insertedCursos) {
                const estudiantes = cursosArray.find(c => c.nombre === curso.nombre)?.estudiantes || [];
                
                if (estudiantes.length > 0) {
                    const estudiantesData = estudiantes.map(est => ({
                        curso_id: curso.id,
                        rut: est.rut || '',
                        nombre: est.nombre || '',
                        apellido: est.apellido || '',
                        email: est.email || ''
                    }));

                    const { error: estudiantesError } = await this.client
                        .from('estudiantes')
                        .insert(estudiantesData);

                    if (estudiantesError) throw estudiantesError;
                }
            }

            console.log('✅ Cursos data saved to Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error saving cursos data:', error);
            if (this.fallbackToLocalStorage) {
                return localStorage.setItem('cursosData', JSON.stringify(cursosData));
            }
            throw error;
        }
    }

    async getCursosData() {
        if (!this.isAuthenticated()) {
            const localData = localStorage.getItem('cursosData');
            return localData ? JSON.parse(localData) : {};
        }

        try {
            // Obtener cursos con estudiantes
            const { data: cursos, error: cursosError } = await this.client
                .from('cursos')
                .select(`
                    *,
                    estudiantes (*)
                `)
                .eq('usuario_id', this.currentUser.id);

            if (cursosError) throw cursosError;

            // Convertir a formato localStorage
            const cursosData = {};
            cursos.forEach(curso => {
                cursosData[curso.nombre] = {
                    descripcion: curso.descripcion,
                    ano: curso.ano,
                    semestre: curso.semestre,
                    estudiantes: curso.estudiantes || []
                };
            });

            return cursosData;
        } catch (error) {
            console.error('❌ Error getting cursos data:', error);
            if (this.fallbackToLocalStorage) {
                const localData = localStorage.getItem('cursosData');
                return localData ? JSON.parse(localData) : {};
            }
            return {};
        }
    }

    // Gestión de rúbricas
    async saveRubricas(rubricas) {
        if (!this.isAuthenticated()) {
            return localStorage.setItem('rubricas_guardadas', JSON.stringify(rubricas));
        }

        try {
            // Eliminar rúbricas existentes
            await this.client
                .from('rubricas')
                .delete()
                .eq('usuario_id', this.currentUser.id);

            // Insertar nuevas rúbricas
            const rubricasData = rubricas.map(rubrica => ({
                usuario_id: this.currentUser.id,
                nombre: rubrica.nombre || rubrica.title,
                descripcion: rubrica.descripcion || '',
                criterios: rubrica.criterios || rubrica,
                configuracion: rubrica.configuracion || {}
            }));

            const { error } = await this.client
                .from('rubricas')
                .insert(rubricasData);

            if (error) throw error;

            console.log('✅ Rúbricas saved to Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error saving rúbricas:', error);
            if (this.fallbackToLocalStorage) {
                return localStorage.setItem('rubricas_guardadas', JSON.stringify(rubricas));
            }
            throw error;
        }
    }

    async getRubricas() {
        if (!this.isAuthenticated()) {
            const localData = localStorage.getItem('rubricas_guardadas');
            return localData ? JSON.parse(localData) : [];
        }

        try {
            const { data, error } = await this.client
                .from('rubricas')
                .select('*')
                .eq('usuario_id', this.currentUser.id);

            if (error) throw error;

            return data.map(rubrica => ({
                id: rubrica.id,
                nombre: rubrica.nombre,
                title: rubrica.nombre, // Compatibilidad
                descripcion: rubrica.descripcion,
                criterios: rubrica.criterios,
                configuracion: rubrica.configuracion,
                created_at: rubrica.created_at
            }));
        } catch (error) {
            console.error('❌ Error getting rúbricas:', error);
            if (this.fallbackToLocalStorage) {
                const localData = localStorage.getItem('rubricas_guardadas');
                return localData ? JSON.parse(localData) : [];
            }
            return [];
        }
    }

    // Gestión de plantillas
    async saveTemplates(templates) {
        if (!this.isAuthenticated()) {
            return localStorage.setItem('templates', JSON.stringify(templates));
        }

        try {
            // Eliminar plantillas existentes
            await this.client
                .from('plantillas_notas')
                .delete()
                .eq('usuario_id', this.currentUser.id);

            // Insertar nuevas plantillas
            const plantillasData = Object.entries(templates).map(([nombre, configuracion]) => ({
                usuario_id: this.currentUser.id,
                nombre: nombre,
                configuracion: configuracion
            }));

            const { error } = await this.client
                .from('plantillas_notas')
                .insert(plantillasData);

            if (error) throw error;

            console.log('✅ Templates saved to Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error saving templates:', error);
            if (this.fallbackToLocalStorage) {
                return localStorage.setItem('templates', JSON.stringify(templates));
            }
            throw error;
        }
    }

    async getTemplates() {
        if (!this.isAuthenticated()) {
            const localData = localStorage.getItem('templates');
            return localData ? JSON.parse(localData) : {};
        }

        try {
            const { data, error } = await this.client
                .from('plantillas_notas')
                .select('*')
                .eq('usuario_id', this.currentUser.id);

            if (error) throw error;

            const templates = {};
            data.forEach(plantilla => {
                templates[plantilla.nombre] = plantilla.configuracion;
            });

            return templates;
        } catch (error) {
            console.error('❌ Error getting templates:', error);
            if (this.fallbackToLocalStorage) {
                const localData = localStorage.getItem('templates');
                return localData ? JSON.parse(localData) : {};
            }
            return {};
        }
    }

    // Gestión de timeline
    async saveTimelineData(timelineData) {
        if (!this.isAuthenticated()) {
            return localStorage.setItem('timeline-current-events', JSON.stringify(timelineData));
        }

        try {
            // Eliminar eventos existentes
            await this.client
                .from('timeline_eventos')
                .delete()
                .eq('usuario_id', this.currentUser.id);

            // Insertar nuevos eventos
            const eventosData = timelineData.map(evento => ({
                usuario_id: this.currentUser.id,
                titulo: evento.titulo || evento.title,
                descripcion: evento.descripcion || evento.description,
                fecha_inicio: evento.fecha_inicio || evento.start,
                fecha_fin: evento.fecha_fin || evento.end,
                categoria: evento.categoria || evento.category,
                color: evento.color,
                archivos: evento.archivos || evento.files || {}
            }));

            const { error } = await this.client
                .from('timeline_eventos')
                .insert(eventosData);

            if (error) throw error;

            console.log('✅ Timeline data saved to Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error saving timeline data:', error);
            if (this.fallbackToLocalStorage) {
                return localStorage.setItem('timeline-current-events', JSON.stringify(timelineData));
            }
            throw error;
        }
    }

    async getTimelineData() {
        if (!this.isAuthenticated()) {
            const localData = localStorage.getItem('timeline-current-events');
            return localData ? JSON.parse(localData) : [];
        }

        try {
            const { data, error } = await this.client
                .from('timeline_eventos')
                .select('*')
                .eq('usuario_id', this.currentUser.id)
                .order('fecha_inicio', { ascending: true });

            if (error) throw error;

            return data.map(evento => ({
                id: evento.id,
                titulo: evento.titulo,
                title: evento.titulo, // Compatibilidad
                descripcion: evento.descripcion,
                description: evento.descripcion, // Compatibilidad
                fecha_inicio: evento.fecha_inicio,
                start: evento.fecha_inicio, // Compatibilidad
                fecha_fin: evento.fecha_fin,
                end: evento.fecha_fin, // Compatibilidad
                categoria: evento.categoria,
                category: evento.categoria, // Compatibilidad
                color: evento.color,
                archivos: evento.archivos,
                files: evento.archivos, // Compatibilidad
                created_at: evento.created_at
            }));
        } catch (error) {
            console.error('❌ Error getting timeline data:', error);
            if (this.fallbackToLocalStorage) {
                const localData = localStorage.getItem('timeline-current-events');
                return localData ? JSON.parse(localData) : [];
            }
            return [];
        }
    }

    // Función para sincronizar datos locales a Supabase
    async syncLocalToSupabase() {
        if (!this.isAuthenticated()) {
            console.log('⚠️ Cannot sync - user not authenticated');
            return false;
        }

        console.log('🔄 Starting sync from localStorage to Supabase...');

        try {
            // Sincronizar cursos
            const cursosData = localStorage.getItem('cursosData');
            if (cursosData) {
                await this.saveCursosData(JSON.parse(cursosData));
            }

            // Sincronizar rúbricas
            const rubricas = localStorage.getItem('rubricas_guardadas');
            if (rubricas) {
                await this.saveRubricas(JSON.parse(rubricas));
            }

            // Sincronizar plantillas
            const templates = localStorage.getItem('templates');
            if (templates) {
                await this.saveTemplates(JSON.parse(templates));
            }

            // Sincronizar timeline
            const timeline = localStorage.getItem('timeline-current-events');
            if (timeline) {
                await this.saveTimelineData(JSON.parse(timeline));
            }

            // Sincronizar configuraciones básicas
            const theme = localStorage.getItem('theme');
            if (theme) {
                await this.setItem('theme', theme);
            }

            const menuCollapsed = localStorage.getItem('menu-collapsed');
            if (menuCollapsed) {
                await this.setItem('menu-collapsed', menuCollapsed);
            }

            console.log('✅ Local data synced to Supabase successfully');
            return true;
        } catch (error) {
            console.error('❌ Error syncing local data to Supabase:', error);
            return false;
        }
    }

    // Limpiar cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }
}

// Crear instancia global
window.supabaseAdapter = new SupabaseAdapter();

console.log('📦 SupabaseAdapter loaded'); 