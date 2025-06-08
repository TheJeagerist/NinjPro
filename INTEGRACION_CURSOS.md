# Integración: Gestión de Cursos ↔ Libro de Clases

## 📚 Descripción General

El sistema ahora integra automáticamente los cursos creados en **Gestión de Cursos** con el **Libro de Clases**, permitiendo una sincronización bidireccional de datos educativos.

## 🔄 Funcionamiento de la Sincronización

### Carga Automática
- Al abrir el Libro de Clases, se cargan automáticamente todos los cursos desde `localStorage.cursosData`
- Los estudiantes asociados a cada curso también se importan automáticamente
- Los datos se convierten del formato de Gestión al formato del Libro de Clases

### Sincronización en Tiempo Real
- **Storage Events**: Detecta cambios en `cursosData` desde otras pestañas/ventanas
- **Custom Events**: Escucha el evento `cursosActualizados` cuando se modifican cursos
- **Sincronización Manual**: Botón "🔄 Sincronizar con Gestión" en la sección de cursos

## 📊 Estructura de Datos

### Formato Gestión de Cursos (`cursosData`)
```javascript
{
  "8°A": [
    { nombre: "Juan Pérez", id: "12345678-9" },
    { nombre: "María González", id: "98765432-1" }
  ],
  "1° Medio B": [
    { nombre: "Carlos López", id: "11111111-1" }
  ]
}
```

### Formato Libro de Clases (`cursos` y `estudiantes`)
```javascript
// Cursos
[
  {
    id: 1640995200000,
    nombre: "8°A",
    nivel: "8°",
    letra: "A",
    materias: ["Matemáticas", "Lenguaje", "Ciencias", "Historia"],
    origen: "gestion"
  }
]

// Estudiantes
[
  {
    id: 1640995200001,
    nombre: "Juan",
    apellido: "Pérez",
    rut: "12345678-9",
    cursoId: 1640995200000,
    cursoNombre: "8°A",
    origen: "gestion"
  }
]
```

## 🎯 Características de la Integración

### Identificación Visual
- **Badge "📚 Desde Gestión"**: Identifica cursos sincronizados
- **Borde azul**: Los cursos sincronizados tienen un borde izquierdo azul
- **Fondo especial**: Gradiente sutil para distinguir cursos sincronizados

### Parseo Inteligente de Nombres
El sistema reconoce automáticamente diferentes formatos de nombres de cursos:
- `8°A` → Nivel: "8°", Letra: "A"
- `1° Básico A` → Nivel: "1° Básico", Letra: "A"
- `2° Medio B` → Nivel: "2° Medio", Letra: "B"

### Prevención de Duplicados
- Verifica si un curso ya existe antes de agregarlo
- Compara por nombre de curso para evitar duplicaciones
- Mantiene la integridad de los datos existentes

## 🔧 Funciones Principales

### `loadCursosFromGestion()`
- Carga cursos desde `localStorage.cursosData`
- Convierte formato de gestión a formato libro de clases
- Agrega estudiantes asociados a cada curso

### `parsearNombreCurso(nombreCurso)`
- Extrae nivel y letra del nombre del curso
- Soporta múltiples formatos de nomenclatura
- Valores por defecto para casos no reconocidos

### `setupSyncListeners()`
- Configura listeners para sincronización automática
- Detecta cambios en localStorage y eventos personalizados
- Agrega botón de sincronización manual

### `syncWithGestion()`
- Sincronización manual bajo demanda
- Muestra estadísticas de elementos sincronizados
- Actualiza todas las vistas del sistema

## 📈 Dashboard Integrado

### Información de Sincronización
- **Actividad Reciente**: Muestra cursos y estudiantes sincronizados
- **Estadísticas**: Incluye datos de cursos sincronizados en contadores
- **Indicadores Visuales**: Diferencia entre datos locales y sincronizados

## 🚀 Flujo de Trabajo Recomendado

1. **Cargar Cursos**: Usar "Gestión de Cursos" para cargar archivos Excel
2. **Abrir Libro de Clases**: Los cursos se sincronizan automáticamente
3. **Gestionar Datos**: Usar Libro de Clases para asistencia, calificaciones y observaciones
4. **Sincronización**: Los cambios en Gestión se reflejan automáticamente

## ⚠️ Consideraciones Importantes

### Origen de Datos
- Cursos marcados con `origen: "gestion"` provienen del sistema de gestión
- Estos cursos mantienen referencia al sistema original
- Se pueden editar en Libro de Clases sin afectar el origen

### Persistencia
- Los datos sincronizados se guardan en `localStorage` del Libro de Clases
- Cambios en Gestión de Cursos se propagan automáticamente
- La sincronización es unidireccional: Gestión → Libro de Clases

### Compatibilidad
- Compatible con todos los formatos de Excel soportados por Gestión de Cursos
- Mantiene compatibilidad con cursos creados directamente en Libro de Clases
- No interfiere con funcionalidades existentes

## 🔍 Debugging y Logs

El sistema incluye logs detallados en la consola:
- `📚 Cargando cursos desde Gestión de Cursos`
- `✅ Curso agregado: [nombre]`
- `✅ Estudiante agregado: [nombre] al curso [curso]`
- `💾 Datos sincronizados con Gestión de Cursos`
- `🔄 Detectado cambio en cursosData, sincronizando...`

## 📝 Notas de Desarrollo

### Eventos Personalizados
```javascript
// Disparar sincronización manual
window.dispatchEvent(new CustomEvent('cursosActualizados', { 
    detail: { cursosData: cursosData } 
}));
```

### Storage Events
```javascript
// Detectar cambios en localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'cursosData') {
        // Sincronizar automáticamente
    }
});
```

Esta integración proporciona una experiencia fluida y automática para gestionar datos educativos entre ambos sistemas, manteniendo la consistencia y facilitando el flujo de trabajo docente. 