// Configuración de Supabase para NinjPro
// ============================================

// IMPORTANTE: Reemplaza estas URLs y claves con las de tu proyecto Supabase
const SUPABASE_CONFIG = {
    url: 'TU_SUPABASE_URL_AQUI', // Ejemplo: 'https://xyzcompany.supabase.co'
    anonKey: 'TU_SUPABASE_ANON_KEY_AQUI', // Tu clave anónima de Supabase
    
    // Configuración adicional
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        db: {
            schema: 'public'
        }
    }
};

// Cliente de Supabase - se inicializa después de cargar la librería
let supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Make sure to include the Supabase JS library.');
        return false;
    }
    
    try {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, SUPABASE_CONFIG.options);
        console.log('✅ Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

// Función para verificar la conexión
async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.error('❌ Supabase client not initialized');
        return false;
    }
    
    try {
        const { data, error } = await supabaseClient.from('usuarios').select('count', { count: 'exact', head: true });
        if (error && error.code === 'PGRST116') {
            console.log('⚠️ Table "usuarios" does not exist yet - this is normal for first setup');
            return true;
        }
        if (error) {
            console.error('❌ Supabase connection test failed:', error);
            return false;
        }
        console.log('✅ Supabase connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
    }
}

// Función para crear las tablas necesarias (SQL para ejecutar en Supabase)
function getCreateTablesSQL() {
    return `
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    nombre TEXT,
    apellido TEXT,
    institucion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    ano INTEGER,
    semestre INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    rut TEXT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'nota', 'rubrica', 'paes'
    fecha DATE,
    ponderacion DECIMAL(5,2),
    configuracion JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de notas
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES evaluaciones(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
    nota DECIMAL(4,2),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(evaluacion_id, estudiante_id)
);

-- Tabla de rúbricas
CREATE TABLE IF NOT EXISTS rubricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    criterios JSONB NOT NULL,
    configuracion JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de plantillas de notas
CREATE TABLE IF NOT EXISTS plantillas_notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    configuracion JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de configuraciones de usuario
CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    clave TEXT NOT NULL,
    valor JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(usuario_id, clave)
);

-- Tabla de timeline/eventos
CREATE TABLE IF NOT EXISTS timeline_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    categoria TEXT,
    color TEXT,
    archivos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_usuario_id ON cursos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_curso_id ON estudiantes(curso_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_curso_id ON evaluaciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_notas_evaluacion_id ON notas(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_notas_estudiante_id ON notas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_rubricas_usuario_id ON rubricas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_configuraciones_usuario_id ON configuraciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_timeline_eventos_usuario_id ON timeline_eventos(usuario_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (los usuarios solo pueden ver sus propios datos)
CREATE POLICY "Usuarios pueden ver solo sus propios datos" ON usuarios
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden ver solo sus cursos" ON cursos
    FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden ver estudiantes de sus cursos" ON estudiantes
    FOR ALL USING (
        curso_id IN (
            SELECT id FROM cursos WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden ver evaluaciones de sus cursos" ON evaluaciones
    FOR ALL USING (
        curso_id IN (
            SELECT id FROM cursos WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden ver notas de sus evaluaciones" ON notas
    FOR ALL USING (
        evaluacion_id IN (
            SELECT e.id FROM evaluaciones e
            JOIN cursos c ON e.curso_id = c.id
            WHERE c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden ver solo sus rúbricas" ON rubricas
    FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden ver solo sus plantillas" ON plantillas_notas
    FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden ver solo sus configuraciones" ON configuraciones
    FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden ver solo sus eventos" ON timeline_eventos
    FOR ALL USING (usuario_id = auth.uid());
`;
}

// Exportar funciones y configuración
window.SupabaseConfig = {
    init: initSupabase,
    test: testSupabaseConnection,
    getClient: () => supabaseClient,
    getCreateTablesSQL: getCreateTablesSQL,
    config: SUPABASE_CONFIG
};

console.log('📦 Supabase configuration module loaded'); 