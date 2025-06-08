# 🚀 Configuración de Supabase para NinjPro

Esta guía te ayudará a configurar Supabase para sincronizar los datos de NinjPro en la nube.

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta si no tienes una
3. Click en "New Project"
4. Completa los datos:
   - **Nombre del proyecto**: NinjPro
   - **Contraseña de la base de datos**: (genera una segura)
   - **Región**: Selecciona la más cercana a tu ubicación

### 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia estos datos:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Anon public key**: La clave que empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar las Credenciales

1. Abre el archivo `supabase-config.js`
2. Reemplaza estas líneas:

```javascript
const SUPABASE_CONFIG = {
    url: 'TU_SUPABASE_URL_AQUI', // ← Pega tu Project URL aquí
    anonKey: 'TU_SUPABASE_ANON_KEY_AQUI', // ← Pega tu Anon public key aquí
    // ... resto de la configuración
};
```

**Ejemplo:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjkxNzYwMCwiZXhwIjoxOTYyNDkzNjAwfQ.xyz123...',
    // ... resto de la configuración
};
```

### 4. Crear las Tablas en la Base de Datos

1. Ve a tu proyecto de Supabase
2. Click en **SQL Editor**
3. Copia y pega el siguiente SQL (también disponible en la función `getCreateTablesSQL()` del código):

```sql
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
```

4. Click en **Run** para ejecutar el SQL

### 5. Habilitar Autenticación por Email

1. Ve a **Authentication** → **Settings**
2. En **Auth Providers**, asegúrate de que **Email** esté habilitado
3. Configura las URLs de redirección si es necesario

## 🎯 Uso de la Integración

### Primera Vez

1. Abre NinjPro en tu navegador
2. Verás un botón "👤 Iniciar Sesión" en la esquina superior izquierda
3. Click en el botón y regístrate con tu email
4. Confirma tu email (revisa tu bandeja de entrada)
5. Inicia sesión

### Sincronización Automática

Una vez autenticado:
- ✅ Los datos se sincronizan automáticamente a la nube
- ✅ Puedes usar el panel de sincronización (esquina inferior derecha)
- ✅ El indicador de estado muestra tu conexión

### Funciones Disponibles

- **📤 Subir a la nube**: Sincroniza datos locales con Supabase
- **📥 Descargar de la nube**: Descarga datos desde Supabase
- **🔄 Sincronización automática**: Los cambios se guardan automáticamente
- **👋 Modo offline**: Sigue funcionando sin conexión

## 🛠️ Troubleshooting

### Error: "Supabase client not initialized"
- Verifica que hayas configurado correctamente la URL y clave en `supabase-config.js`

### Error: "Table does not exist"
- Asegúrate de haber ejecutado el SQL de creación de tablas

### Error: "RLS policy violation"
- Verifica que las políticas RLS estén configuradas correctamente

### Los datos no se sincronizan
- Verifica tu conexión a internet
- Asegúrate de estar autenticado
- Revisa la consola del navegador para errores

## 📊 Datos que se Sincronizan

- **Cursos y estudiantes**: Todos los datos de tus cursos
- **Rúbricas**: Rúbricas creadas y configuraciones
- **Plantillas de notas**: Plantillas guardadas
- **Timeline/Eventos**: Eventos del timeline
- **Configuraciones**: Temas, preferencias, etc.

## 🔒 Seguridad

- **Row Level Security (RLS)**: Cada usuario solo ve sus propios datos
- **Autenticación JWT**: Tokens seguros para la autenticación
- **HTTPS**: Todas las conexiones son encriptadas
- **Políticas de acceso**: Control granular de permisos

## 🌐 Modo Offline

NinjPro sigue funcionando completamente sin conexión:
- Los datos se guardan en localStorage
- Al volver a conectarse, se sincronizan automáticamente
- Indicador visual del estado de conexión

---

¡Ahora NinjPro está completamente integrado con Supabase! 🎉

Para soporte adicional, revisa la documentación de [Supabase](https://supabase.com/docs) o contacta al desarrollador. 