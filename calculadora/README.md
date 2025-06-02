# Calculadora de Promedio Ponderado

## Descripción
Calculadora independiente para calcular promedios ponderados y determinar la nota mínima necesaria para aprobar un ramo.

## Características

### 🧮 Funcionalidades Principales
- **Cálculo de Promedio Ponderado**: Calcula automáticamente el promedio considerando las ponderaciones
- **Nota Mínima Necesaria**: Determina qué nota necesitas en una evaluación para aprobar
- **Gestión de Ramos**: Guarda y carga configuraciones de diferentes ramos
- **Validación Inteligente**: Verifica que los datos ingresados sean correctos

### 🎨 Temas Visuales
- **Neón** (por defecto): Tema oscuro con colores vibrantes
- **Claro**: Tema claro y minimalista
- **Rosa**: Tema con tonalidades rosadas
- **Oscuro**: Tema oscuro profesional

### ⌨️ Atajos de Teclado
- `Ctrl + Enter`: Calcular promedio
- `Ctrl + R`: Reiniciar calculadora
- `Ctrl + =` o `Ctrl + +`: Agregar fila
- `Ctrl + -`: Eliminar fila

## Uso

### Cálculo Básico
1. Ingresa las notas en la columna "Nota" (escala 1.0-7.0)
2. Ingresa las ponderaciones en la columna "Ponderación" (%)
3. Haz clic en "Calcular Promedio"

### Calcular Nota Necesaria
1. Deja vacía la nota que quieres calcular
2. Completa todas las demás notas y ponderaciones
3. La calculadora mostrará automáticamente la nota mínima necesaria

### Gestión de Ramos
1. Configura las ponderaciones de un ramo
2. Haz clic en "+ Agregar Ramo"
3. Ingresa el nombre del ramo y guarda
4. Selecciona ramos guardados desde el dropdown

## Archivos del Proyecto

```
calculadora/
├── index.html          # Interfaz de usuario
├── calculadora.css     # Estilos y temas
├── calculadora.js      # Lógica de la aplicación
└── README.md          # Esta documentación
```

## Tecnologías Utilizadas
- **HTML5**: Estructura semántica
- **CSS3**: Estilos con variables CSS y grid/flexbox
- **JavaScript ES6+**: Lógica de la aplicación
- **LocalStorage**: Persistencia de datos

## Compatibilidad
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- 📱 Responsive (móviles y tablets)

## Instalación
1. Descarga todos los archivos de la carpeta `calculadora/`
2. Abre `index.html` en tu navegador
3. ¡Listo para usar!

## Notas Técnicas
- Los datos se guardan localmente en el navegador
- No requiere conexión a internet
- Soporta notas en escala 1.0-7.0 (sistema chileno)
- Automáticamente convierte notas en escala 10-100 a 1.0-7.0

## Ejemplos de Uso

### Ejemplo 1: Promedio Simple
- Prueba 1: 6.5 (40%)
- Prueba 2: 5.8 (60%)
- **Resultado**: 6.08

### Ejemplo 2: Nota Necesaria
- Prueba 1: 5.5 (30%)
- Prueba 2: [vacía] (70%)
- **Nota necesaria**: 3.6 para aprobar con 4.0

## Contribuciones
Este es un proyecto independiente. Para mejoras o sugerencias, modifica directamente los archivos según tus necesidades. 