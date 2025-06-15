# Aplicaciones de Rúbricas Separadas

Se han creado dos aplicaciones independientes para el manejo de rúbricas, separando las funcionalidades de creación y evaluación.

## 📝 Creador de Rúbricas

**Archivo:** `creador-rubricas.html`
**Funcionalidad:** Modo edición completo para crear y editar rúbricas

### Características:
- **Interfaz moderna y limpia** con diseño similar al estilo PlayStation 4
- **Uso completo de la pantalla** disponible
- **Sidebar lateral** con lista de rúbricas guardadas
- **Editor visual** con tabla interactiva
- **Funciones de importación/exportación**:
  - Cargar desde Word (.docx)
  - Cargar desde Excel (.xlsx, .xls)
  - Exportar a Word
  - Exportar a Excel
  - Descargar plantillas

### Funcionalidades principales:
- Crear nuevas rúbricas desde cero
- Agregar/eliminar criterios dinámicamente
- Agregar/eliminar niveles de evaluación
- Edición en tiempo real con auto-guardado
- Gestión de rúbricas guardadas
- Vista previa y edición visual

### Archivos relacionados:
- `creador-rubricas.html` - Estructura HTML
- `creador-rubricas.css` - Estilos modernos
- `creador-rubricas.js` - Lógica de la aplicación

## ✅ Evalúa con Rúbrica

**Archivo:** `evalua-rubricas.html`
**Funcionalidad:** Modo evaluación para evaluar estudiantes

### Características:
- **Interfaz moderna y funcional** con diseño similar al estilo PlayStation 4
- **Uso completo de la pantalla** disponible
- **Integración con gestión de cursos** - carga automáticamente los cursos disponibles
- **Sistema de evaluación interactivo**
- **Panel de resultados en tiempo real**

### Funcionalidades principales:
- Selección de curso, rúbrica y estudiante
- Evaluación interactiva con selección de niveles
- Cálculo automático de puntajes y notas
- Guardado de evaluaciones
- Navegación entre estudiantes
- Vista previa de rúbricas
- Exportación de reportes en PDF
- Seguimiento del progreso de evaluación

### Archivos relacionados:
- `evalua-rubricas.html` - Estructura HTML
- `evalua-rubricas.css` - Estilos modernos
- `evalua-rubricas.js` - Lógica de evaluación

## 🔗 Integración con el Sistema

### Datos Compartidos:
- **Cursos:** Se cargan desde `localStorage` (gestión de cursos)
- **Rúbricas:** Se comparten entre ambas aplicaciones
- **Evaluaciones:** Se guardan en `localStorage` para reportes

### Acceso desde el Dashboard:
Las aplicaciones están disponibles como tarjetas independientes en el launcher principal:
- **Creador de Rúbricas** - Icono 📝
- **Evalúa con Rúbrica** - Icono ✅

## 🎨 Diseño y Estilo

Ambas aplicaciones utilizan:
- **Colores PlayStation 4**: Azul principal (#0070D1), azul oscuro (#00439C), azul más oscuro (#00246E)
- **Diseño moderno**: Bordes redondeados, sombras suaves, transiciones fluidas
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Tipografía moderna**: Sistema de fuentes nativo
- **Iconografía SVG**: Iconos vectoriales escalables

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar y área principal
- **Tablet**: Adaptación del layout manteniendo funcionalidad
- **Mobile**: Diseño vertical optimizado para pantallas pequeñas

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS y flexbox/grid
- **JavaScript ES6+**: Lógica moderna con async/await
- **LocalStorage**: Persistencia de datos
- **Librerías externas**:
  - Mammoth.js (lectura de Word)
  - XLSX.js (manejo de Excel)
  - jsPDF (generación de PDF)
  - DocX.js (creación de Word)
  - FileSaver.js (descarga de archivos)

## 🚀 Funcionalidades Avanzadas

### Creador de Rúbricas:
- Auto-guardado mientras se edita
- Validación de datos en tiempo real
- Gestión de plantillas
- Importación inteligente de archivos
- Exportación con formato personalizado

### Evalúa con Rúbrica:
- Cálculo automático de notas
- Sistema de progreso visual
- Navegación fluida entre estudiantes
- Reportes detallados en PDF
- Filtrado y búsqueda de estudiantes

## 📊 Almacenamiento de Datos

### LocalStorage Keys:
- `rubricas`: Array de rúbricas creadas
- `cursos`: Array de cursos con estudiantes
- `evaluaciones`: Array de evaluaciones completadas

### Estructura de Datos:

```javascript
// Rúbrica
{
  id: string,
  titulo: string,
  descripcion: string,
  criterios: [{
    titulo: string,
    niveles: [{
      nivel: string,
      puntos: number,
      descripcion: string
    }]
  }],
  fechaCreacion: string,
  fechaModificacion: string
}

// Evaluación
{
  id: string,
  curso: string,
  estudiante: string,
  rubrica: string,
  rubricaTitulo: string,
  criterios: {
    [index]: {
      nivelIndex: number,
      puntos: number
    }
  },
  puntajeTotal: number,
  puntajeMaximo: number,
  porcentaje: number,
  nota: number,
  fecha: string,
  completada: boolean
}
```

## 🔄 Migración desde la Aplicación Original

Las nuevas aplicaciones mantienen compatibilidad con:
- Rúbricas creadas en la aplicación original
- Cursos cargados en gestión de estudiantes
- Formatos de importación/exportación existentes

## 🎯 Beneficios de la Separación

1. **Especialización**: Cada app se enfoca en su función específica
2. **Rendimiento**: Carga más rápida al no cargar funcionalidades innecesarias
3. **Usabilidad**: Interfaz más limpia y enfocada
4. **Mantenimiento**: Código más organizado y fácil de mantener
5. **Escalabilidad**: Facilita futuras mejoras y nuevas funcionalidades 