# Calculadora de Notas Escolar

## Nueva Funcionalidad: Gestión de Rúbricas

### ¿Qué es la Gestión de Rúbricas?

La aplicación ahora incluye un sistema completo para cargar, guardar y usar rúbricas escolares desde el menú de **Configuración**. Las rúbricas cargadas quedan disponibles para usar en la sección de **Rúbricas Escolares**.

### Características Principales

#### 1. **Cargar Rúbricas desde Archivos**
- **Formatos soportados**: Excel (.xlsx, .xls) y Word (.docx)
- **Ubicación**: Menú de Configuración → Gestión de Rúbricas → "Cargar Rúbrica desde Archivo"
- Las rúbricas se guardan automáticamente en el navegador para uso futuro

#### 2. **Plantilla de Rúbrica**
- Descarga una plantilla Excel pre-configurada
- Formato estándar: Criterio, Excelente (4 pts), Bueno (3 pts), Regular (2 pts), Deficiente (1 pt)
- Incluye ejemplos para facilitar la creación

#### 3. **Gestión de Rúbricas Guardadas**
- Ver todas las rúbricas guardadas en el panel de configuración
- Información mostrada: título, fecha de creación, número de criterios
- Acciones disponibles: Ver, Eliminar
- Detección automática de duplicados con opción de reemplazo

#### 4. **Uso en Rúbricas Escolares**
- Selector desplegable para elegir rúbricas guardadas
- Carga instantánea de la rúbrica seleccionada
- Funciona junto con las opciones existentes de crear nuevas rúbricas

#### 5. **🆕 MODO EVALUACIÓN** - Nueva Funcionalidad
- **Modo Normal**: Para crear y editar rúbricas
- **Modo Evaluación**: Para evaluar estudiantes usando rúbricas guardadas

### Modo Evaluación - Características

#### **¿Qué es el Modo Evaluación?**
El Modo Evaluación permite usar las rúbricas guardadas para evaluar estudiantes de forma práctica e interactiva, convirtiendo cada descripción de nivel en botones clickeables con puntajes automáticos.

#### **Características del Modo Evaluación:**
- 🎯 **Selección Intuitiva**: Elige curso, estudiante y rúbrica
- 🔘 **Botones Interactivos**: Cada descripción de nivel se convierte en un botón
- 📊 **Cálculo Automático**: Suma automática de puntajes
- 📈 **Conversión a Nota**: Calcula automáticamente la nota final (1.0 - 7.0)
- 💾 **Guardado Persistente**: Las evaluaciones se guardan en el navegador
- ⚡ **Tiempo Real**: Actualización instantánea de puntajes

#### **Cómo Funciona:**
1. **Un botón por fila**: Solo se puede seleccionar un nivel por criterio
2. **Puntaje acumulativo**: Cada botón suma su puntaje al total
3. **Visualización clara**: Muestra puntaje actual vs máximo posible
4. **Nota automática**: Convierte el puntaje a escala 1.0-7.0

### Cómo Usar el Modo Evaluación

#### **Paso 1: Activar Modo Evaluación** 🔄
1. Ve al panel de **Rúbricas Escolares**
2. Haz clic en **"Modo Evaluación"** (botón azul con ícono de verificación)
3. Se mostrará el panel de evaluación

#### **Paso 2: Configurar Evaluación** ⚙️
1. **Selecciona Curso**: Elige de la lista de cursos cargados
2. **Selecciona Estudiante**: Elige el estudiante a evaluar
3. **Selecciona Rúbrica**: Elige la rúbrica a aplicar
4. Haz clic en **"Iniciar Evaluación"**

#### **Paso 3: Evaluar** 📝
1. **Por cada criterio**: Haz clic en el botón del nivel correspondiente
2. **Observa el puntaje**: Se actualiza automáticamente en tiempo real
3. **Nota final**: Se calcula automáticamente
4. **Solo un botón por fila**: Al seleccionar uno, se deseleccionan los otros

#### **Paso 4: Guardar** 💾
1. Haz clic en **"Guardar Evaluación"**
2. La evaluación se almacena con:
   - Fecha y hora
   - Estudiante y curso
   - Rúbrica utilizada
   - Puntajes y nota final

### Ejemplo de Uso Práctico

```
Criterio: "Presentación"
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Excelente     │      Bueno      │     Regular     │   Deficiente    │
│   [4 puntos]    │   [3 puntos]    │   [2 puntos]    │   [1 punto]     │
│ Muy organizado  │   Organizado    │ Poco organizado │  Desorganizado  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Al hacer clic en "Bueno" (3 puntos):
✅ Se selecciona automáticamente
🔢 Se suma al puntaje total
📊 Se actualiza la nota final
```

### Estados de Notas Finales

- 🟢 **Excelente** (6.0 - 7.0): Verde
- 🔵 **Buena** (5.0 - 5.9): Azul  
- 🟡 **Regular** (4.0 - 4.9): Amarillo
- 🔴 **Insuficiente** (1.0 - 3.9): Rojo

### Cómo Usar (Modo Normal)

#### Paso 1: Cargar una Rúbrica
1. Ve al menú de **Configuración**
2. En la sección "Gestión de Rúbricas", haz clic en **"Cargar Rúbrica desde Archivo"**
3. Selecciona un archivo Excel o Word con tu rúbrica
4. La rúbrica se guardará automáticamente

#### Paso 2: Usar la Rúbrica
1. Ve al panel de **Rúbricas Escolares**
2. En el selector "Usar Rúbrica Guardada", elige la rúbrica deseada
3. Haz clic en **"Cargar"**
4. La rúbrica se cargará lista para usar

#### Paso 3: Gestionar Rúbricas
- **Ver**: Abre la rúbrica en el panel de Rúbricas Escolares
- **Eliminar**: Remueve permanentemente la rúbrica guardada
- **Reemplazar**: Al cargar una rúbrica con el mismo nombre, se ofrece la opción de reemplazar

### Formato de Archivos

#### Excel (.xlsx/.xls)
```
| Criterio     | Excelente | Bueno    | Regular       | Deficiente |
| Puntaje      | 4         | 3        | 2             | 1          |
| Presentación | Muy claro | Claro    | Poco claro    | Confuso    |
| Contenido    | Completo  | Adecuado | Incompleto    | Deficiente |
```

#### Word (.docx)
- Debe contener una tabla con la estructura similar al Excel
- La primera fila son los encabezados de niveles
- Las siguientes filas contienen los criterios y descripciones

### Beneficios

✅ **Reutilización**: Carga una vez, usa múltiples veces  
✅ **Estandarización**: Mantén coherencia en tus evaluaciones  
✅ **Eficiencia**: No necesitas recrear rúbricas desde cero  
✅ **Flexibilidad**: Soporta diferentes formatos de archivo  
✅ **Persistencia**: Las rúbricas se guardan en el navegador  
🆕 **Evaluación Interactiva**: Modo evaluación con botones y cálculo automático  
🆕 **Gestión de Evaluaciones**: Historial de evaluaciones guardadas  
🆕 **Doble Modo**: Normal para edición, Evaluación para aplicar  

### Notas Técnicas

- Las rúbricas se almacenan en localStorage del navegador
- Las evaluaciones se guardan en `evaluaciones_rubricas` 
- Cada rúbrica tiene un ID único para evitar conflictos
- El sistema detecta automáticamente duplicados por nombre
- Compatible con las funcionalidades existentes de rúbricas
- El modo evaluación requiere cursos cargados desde Configuración