document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const cargarRubricaBtn = document.getElementById('cargar-rubrica');
    const nuevaRubricaBtn = document.getElementById('nueva-rubrica');
    const rubricaContent = document.getElementById('rubrica-content');
    
    // Referencias para modo evaluación
    const modoNormalBtn = document.getElementById('tab-normal');
    const modoEvaluacionBtn = document.getElementById('tab-evaluacion');
    const evaluacionPanel = document.getElementById('evaluacion-panel');
    const evalCursoSelect = document.getElementById('eval-curso-select');
    const evalEstudianteSelect = document.getElementById('eval-estudiante-select');
    const evalRubricaSelect = document.getElementById('eval-rubrica-select');
    const iniciarEvaluacionBtn = document.getElementById('iniciar-evaluacion');
    const guardarEvaluacionBtn = document.getElementById('guardar-evaluacion');
    const limpiarEvaluacionBtn = document.getElementById('limpiar-evaluacion');
    const exportarCursoPdfBtn = document.getElementById('exportar-curso-pdf');
    const evaluacionResultado = document.getElementById('evaluacion-resultado');
    
    // Variables para el modo evaluación
    let modoActual = 'normal';
    let rubricaActual = null;
    let evaluacionEnCurso = null;

    // Crear un único input de archivo oculto para reutilizar
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none'; // Ocultarlo
    fileInput.accept = '.docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    document.body.appendChild(fileInput); // Añadirlo al DOM para que funcione

    // Event Listeners para modo evaluación
    if (modoNormalBtn) {
        modoNormalBtn.addEventListener('click', function() {
            cambiarModo('normal');
        });
    }
    
    if (modoEvaluacionBtn) {
        modoEvaluacionBtn.addEventListener('click', function() {
            cambiarModo('evaluacion');
        });
    }
    
    if (evalCursoSelect) {
        evalCursoSelect.addEventListener('change', function() {
            cargarEstudiantesCurso(this.value);
            verificarDatosEvaluacion();
        });
    }
    
    if (evalEstudianteSelect) {
        evalEstudianteSelect.addEventListener('change', verificarDatosEvaluacion);
    }
    
    if (evalRubricaSelect) {
        evalRubricaSelect.addEventListener('change', verificarDatosEvaluacion);
    }
    
    if (iniciarEvaluacionBtn) {
        iniciarEvaluacionBtn.addEventListener('click', iniciarEvaluacion);
    }
    
    if (guardarEvaluacionBtn) {
        guardarEvaluacionBtn.addEventListener('click', guardarEvaluacion);
    }
    
    if (limpiarEvaluacionBtn) {
        limpiarEvaluacionBtn.addEventListener('click', limpiarEvaluacion);
    }
    
    if (exportarCursoPdfBtn) {
        exportarCursoPdfBtn.addEventListener('click', exportarCursoPdf);
    }
    
    // Función para cambiar modo
    function cambiarModo(modo) {
        modoActual = modo;
        
        // Actualizar botones
        modoNormalBtn.classList.toggle('active', modo === 'normal');
        modoEvaluacionBtn.classList.toggle('active', modo === 'evaluacion');
        
        // Mostrar/ocultar paneles
        if (evaluacionPanel) {
            evaluacionPanel.style.display = modo === 'evaluacion' ? 'block' : 'none';
        }
        
        // Mostrar/ocultar selector de rúbricas guardadas
        const rubricasSelector = document.querySelector('.rubricas-selector');
        if (rubricasSelector) {
            rubricasSelector.style.display = modo === 'evaluacion' ? 'none' : 'block';
        }
        
        if (modo === 'evaluacion') {
            inicializarModoEvaluacion();
        } else {
            // Limpiar evaluación si se sale del modo
            limpiarEvaluacion();
        }
        
        // Ajustar contenido de rúbrica según el modo
        if (rubricaActual) {
            mostrarRubrica(rubricaActual);
        }
    }
    
    // Función para inicializar modo evaluación
    function inicializarModoEvaluacion() {
        cargarCursosEvaluacion();
        cargarRubricasEvaluacion();
    }
    
    // Listener para actualizar cuando se carguen nuevos cursos
    window.addEventListener('cursosActualizados', function(event) {
        if (modoActual === 'evaluacion') {
            cargarCursosEvaluacion();
        }
    });
    
    window.addEventListener('selectoresCursosActualizados', function(event) {
        if (modoActual === 'evaluacion') {
            cargarCursosEvaluacion();
        }
    });
    
    // Función para cargar cursos en evaluación
    function cargarCursosEvaluacion() {
        if (!evalCursoSelect) return;
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        evalCursoSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        Object.keys(cursosData).forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            evalCursoSelect.appendChild(option);
        });
    }
    
    // Función para cargar estudiantes del curso
    function cargarEstudiantesCurso(curso) {
        if (!evalEstudianteSelect || !curso) {
            evalEstudianteSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            evalEstudianteSelect.disabled = true;
            return;
        }
        
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const estudiantes = cursosData[curso] || [];
        
        evalEstudianteSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
        estudiantes.forEach(estudiante => {
            const option = document.createElement('option');
            
            // Manejar tanto objetos como strings
            let nombreEstudiante;
            let valorEstudiante;
            
            if (typeof estudiante === 'object' && estudiante !== null) {
                // Es un objeto, extraer el nombre
                nombreEstudiante = estudiante.nombre || estudiante.Nombre || `Estudiante ${estudiante.id || ''}` || '[Sin nombre]';
                valorEstudiante = nombreEstudiante; // Usar el nombre como valor
            } else {
                // Es un string
                nombreEstudiante = estudiante;
                valorEstudiante = estudiante;
            }
            
            option.value = valorEstudiante;
            option.textContent = nombreEstudiante;
            evalEstudianteSelect.appendChild(option);
        });
        
        evalEstudianteSelect.disabled = false;
        
        // Debug para verificar los datos
        console.log('Datos de estudiantes para curso', curso, ':', estudiantes);
        console.log('Tipo del primer estudiante:', typeof estudiantes[0], estudiantes[0]);
    }
    
    // Función para cargar rúbricas en evaluación
    function cargarRubricasEvaluacion() {
        if (!evalRubricaSelect) return;
        
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        evalRubricaSelect.innerHTML = '<option value="">Seleccionar rúbrica...</option>';
        
        rubricas.forEach(rubrica => {
            const option = document.createElement('option');
            option.value = rubrica.id;
            option.textContent = rubrica.titulo;
            evalRubricaSelect.appendChild(option);
        });
    }
    
    // Función para verificar si se pueden habilitar los botones
    function verificarDatosEvaluacion() {
        const cursoSeleccionado = evalCursoSelect?.value;
        const estudianteSeleccionado = evalEstudianteSelect?.value;
        const rubricaSeleccionada = evalRubricaSelect?.value;
        
        const puedeIniciar = cursoSeleccionado && estudianteSeleccionado && rubricaSeleccionada;
        const puedeExportar = cursoSeleccionado && rubricaSeleccionada;
        
        if (iniciarEvaluacionBtn) {
            iniciarEvaluacionBtn.disabled = !puedeIniciar;
        }
        
        if (exportarCursoPdfBtn) {
            exportarCursoPdfBtn.disabled = !puedeExportar;
        }
    }
    
    // Función para iniciar evaluación
    function iniciarEvaluacion() {
        const curso = evalCursoSelect.value;
        const estudiante = evalEstudianteSelect.value;
        const rubricaId = evalRubricaSelect.value;
        
        if (!curso || !estudiante || !rubricaId) {
            alert('Por favor selecciona curso, estudiante y rúbrica');
            return;
        }
        
        // Obtener la rúbrica seleccionada
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        
        if (!rubrica) {
            alert('Rúbrica no encontrada');
            return;
        }
        
        // Inicializar evaluación
        evaluacionEnCurso = {
            curso: curso,
            estudiante: estudiante,
            rubrica: rubrica,
            respuestas: {},
            puntajeTotal: 0,
            puntajeMaximo: 0
        };
        
        // Calcular puntaje máximo
        evaluacionEnCurso.puntajeMaximo = rubrica.criterios.reduce((total, criterio) => {
            const maxPuntos = Math.max(...criterio.niveles.map(nivel => nivel.puntos));
            return total + maxPuntos;
        }, 0);
        
        // Mostrar resultado panel y actualizar info
        mostrarResultadoEvaluacion();
        
        // Mostrar rúbrica en modo evaluación
        mostrarRubricaEvaluacion(rubrica);
        
        // Mostrar botones de evaluación
        if (guardarEvaluacionBtn) guardarEvaluacionBtn.style.display = 'flex';
        if (limpiarEvaluacionBtn) limpiarEvaluacionBtn.style.display = 'flex';
        if (iniciarEvaluacionBtn) iniciarEvaluacionBtn.style.display = 'none';
    }
    
    // Función para mostrar resultado de evaluación
    function mostrarResultadoEvaluacion() {
        if (!evaluacionResultado || !evaluacionEnCurso) return;
        
        const estudianteEvaluado = document.getElementById('estudiante-evaluado');
        const puntajeActual = document.getElementById('puntaje-actual');
        const puntajeMaximo = document.getElementById('puntaje-maximo');
        const notaFinal = document.getElementById('nota-final');
        
        if (estudianteEvaluado) {
            estudianteEvaluado.textContent = `Evaluando a: ${evaluacionEnCurso.estudiante} (${evaluacionEnCurso.curso})`;
        }
        
        if (puntajeActual) {
            puntajeActual.textContent = evaluacionEnCurso.puntajeTotal;
        }
        
        if (puntajeMaximo) {
            puntajeMaximo.textContent = evaluacionEnCurso.puntajeMaximo;
        }
        
        // Calcular nota (escala 1.0 a 7.0)
        const porcentaje = evaluacionEnCurso.puntajeMaximo > 0 ? 
            (evaluacionEnCurso.puntajeTotal / evaluacionEnCurso.puntajeMaximo) * 100 : 0;
        const nota = 1.0 + (porcentaje / 100) * 6.0;
        
        if (notaFinal) {
            notaFinal.textContent = nota.toFixed(1);
            
            // Cambiar clase según la nota
            const notaElement = notaFinal.closest('.nota-final');
            if (notaElement) {
                notaElement.className = 'nota-final';
                if (nota >= 6.0) notaElement.classList.add('excelente');
                else if (nota >= 5.0) notaElement.classList.add('buena');
                else if (nota >= 4.0) notaElement.classList.add('regular');
                else notaElement.classList.add('insuficiente');
            }
        }
        
        evaluacionResultado.style.display = 'block';
    }
    
    // Función para mostrar rúbrica en modo evaluación
    function mostrarRubricaEvaluacion(rubrica) {
        if (!rubricaContent) return;
        
        let html = `
            <div class="rubrica-evaluacion">
                <div class="rubrica-evaluacion-header">
                    <h3>${rubrica.titulo}</h3>
                    <p>${rubrica.descripcion}</p>
                </div>
        `;
        
        rubrica.criterios.forEach((criterio, criterioIndex) => {
            html += `
                <div class="criterio-evaluacion">
                    <div class="criterio-titulo">${criterio.titulo}</div>
                    <div class="niveles-botones" data-criterio="${criterioIndex}">
            `;
            
            criterio.niveles.forEach((nivel, nivelIndex) => {
                const isSelected = evaluacionEnCurso.respuestas[criterioIndex] === nivelIndex;
                html += `
                    <button class="nivel-boton ${isSelected ? 'selected' : ''}" 
                            data-criterio="${criterioIndex}" 
                            data-nivel="${nivelIndex}"
                            data-puntos="${nivel.puntos}">
                        <div class="nivel-nombre">${nivel.nivel}</div>
                        <div class="nivel-descripcion">${nivel.descripcion}</div>
                        <div class="nivel-puntaje">${nivel.puntos} pts</div>
                    </button>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        rubricaContent.innerHTML = html;
        
        // Agregar event listeners a los botones
        const botones = rubricaContent.querySelectorAll('.nivel-boton');
        botones.forEach(boton => {
            boton.addEventListener('click', function() {
                seleccionarNivel(
                    parseInt(this.dataset.criterio),
                    parseInt(this.dataset.nivel),
                    parseInt(this.dataset.puntos)
                );
            });
        });
    }
    
    // Función para seleccionar nivel
    function seleccionarNivel(criterioIndex, nivelIndex, puntos) {
        if (!evaluacionEnCurso) return;
        
        // Deseleccionar otros botones del mismo criterio
        const criterioContainer = rubricaContent.querySelector(`[data-criterio="${criterioIndex}"]`);
        const botones = criterioContainer.querySelectorAll('.nivel-boton');
        botones.forEach(btn => btn.classList.remove('selected'));
        
        // Seleccionar el botón clickeado
        const botonSeleccionado = criterioContainer.querySelector(`[data-criterio="${criterioIndex}"][data-nivel="${nivelIndex}"]`);
        botonSeleccionado.classList.add('selected');
        
        // Actualizar respuesta
        const respuestaAnterior = evaluacionEnCurso.respuestas[criterioIndex];
        evaluacionEnCurso.respuestas[criterioIndex] = nivelIndex;
        
        // Recalcular puntaje total
        evaluacionEnCurso.puntajeTotal = 0;
        Object.keys(evaluacionEnCurso.respuestas).forEach(criterio => {
            const nivelSeleccionado = evaluacionEnCurso.respuestas[criterio];
            const criterioData = evaluacionEnCurso.rubrica.criterios[criterio];
            if (criterioData && criterioData.niveles[nivelSeleccionado]) {
                evaluacionEnCurso.puntajeTotal += criterioData.niveles[nivelSeleccionado].puntos;
            }
        });
        
        // Actualizar visualización del resultado
        mostrarResultadoEvaluacion();
    }
    
    // Función para guardar evaluación
    function guardarEvaluacion() {
        if (!evaluacionEnCurso) {
            alert('No hay evaluación en curso');
            return;
        }
        
        // Verificar que se hayan respondido todos los criterios
        const criteriosRespondidos = Object.keys(evaluacionEnCurso.respuestas).length;
        const totalCriterios = evaluacionEnCurso.rubrica.criterios.length;
        
        if (criteriosRespondidos < totalCriterios) {
            const confirmar = confirm(`Solo has evaluado ${criteriosRespondidos} de ${totalCriterios} criterios. ¿Deseas guardar de todas formas?`);
            if (!confirmar) return;
        }
        
        // Crear objeto de evaluación para guardar
        const evaluacionParaGuardar = {
            id: generarIdUnico(),
            fecha: new Date().toISOString(),
            curso: evaluacionEnCurso.curso,
            estudiante: evaluacionEnCurso.estudiante,
            rubrica: {
                id: evaluacionEnCurso.rubrica.id,
                titulo: evaluacionEnCurso.rubrica.titulo
            },
            respuestas: evaluacionEnCurso.respuestas,
            puntajeTotal: evaluacionEnCurso.puntajeTotal,
            puntajeMaximo: evaluacionEnCurso.puntajeMaximo,
            nota: (1.0 + (evaluacionEnCurso.puntajeTotal / evaluacionEnCurso.puntajeMaximo) * 6.0).toFixed(1)
        };
        
        // Guardar en localStorage
        let evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        evaluaciones.push(evaluacionParaGuardar);
        localStorage.setItem('evaluaciones_rubricas', JSON.stringify(evaluaciones));
        
        alert(`Evaluación guardada exitosamente.\nEstudiante: ${evaluacionEnCurso.estudiante}\nPuntaje: ${evaluacionEnCurso.puntajeTotal}/${evaluacionEnCurso.puntajeMaximo}\nNota: ${evaluacionParaGuardar.nota}`);
        
        // Pasar al siguiente estudiante en lugar de limpiar todo
        pasarASiguienteEstudiante();
    }
    
    // Función para pasar al siguiente estudiante
    function pasarASiguienteEstudiante() {
        if (!evalEstudianteSelect || !evaluacionEnCurso) return;
        
        const estudiantesOptions = Array.from(evalEstudianteSelect.options);
        const estudianteActualIndex = estudiantesOptions.findIndex(option => option.value === evaluacionEnCurso.estudiante);
        
        // Buscar el siguiente estudiante no evaluado
        let siguienteIndex = -1;
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        
        for (let i = estudianteActualIndex + 1; i < estudiantesOptions.length; i++) {
            const option = estudiantesOptions[i];
            if (option.value && option.value !== '') {
                // Verificar si este estudiante ya fue evaluado con esta rúbrica
                const yaEvaluado = evaluaciones.some(eval => 
                    eval.curso === evaluacionEnCurso.curso && 
                    eval.estudiante === option.value && 
                    eval.rubrica.id === evaluacionEnCurso.rubrica.id
                );
                
                if (!yaEvaluado) {
                    siguienteIndex = i;
                    break;
                }
            }
        }
        
        // Si no hay más estudiantes sin evaluar, buscar desde el principio
        if (siguienteIndex === -1) {
            for (let i = 1; i < estudianteActualIndex; i++) {
                const option = estudiantesOptions[i];
                if (option.value && option.value !== '') {
                    const yaEvaluado = evaluaciones.some(eval => 
                        eval.curso === evaluacionEnCurso.curso && 
                        eval.estudiante === option.value && 
                        eval.rubrica.id === evaluacionEnCurso.rubrica.id
                    );
                    
                    if (!yaEvaluado) {
                        siguienteIndex = i;
                        break;
                    }
                }
            }
        }
        
        if (siguienteIndex !== -1) {
            // Hay un siguiente estudiante, seleccionarlo
            evalEstudianteSelect.value = estudiantesOptions[siguienteIndex].value;
            
            // Inicializar nueva evaluación para este estudiante
            const nuevoEstudiante = estudiantesOptions[siguienteIndex].value;
            evaluacionEnCurso = {
                curso: evaluacionEnCurso.curso,
                estudiante: nuevoEstudiante,
                rubrica: evaluacionEnCurso.rubrica,
                respuestas: {},
                puntajeTotal: 0,
                puntajeMaximo: evaluacionEnCurso.puntajeMaximo
            };
            
            // Limpiar selecciones de la rúbrica
            limpiarSeleccionesRubrica();
            
            // Actualizar visualización del resultado
            mostrarResultadoEvaluacion();
            
        } else {
            // No hay más estudiantes sin evaluar
            alert('¡Todos los estudiantes del curso han sido evaluados con esta rúbrica!');
            
            // Preguntar si quiere continuar evaluando o finalizar
            const continuar = confirm('¿Deseas continuar evaluando estudiantes que ya fueron evaluados anteriormente?');
            
            if (continuar) {
                // Buscar el primer estudiante para reiniciar
                if (estudiantesOptions.length > 1 && estudiantesOptions[1].value) {
                    evalEstudianteSelect.value = estudiantesOptions[1].value;
                    
                    evaluacionEnCurso = {
                        curso: evaluacionEnCurso.curso,
                        estudiante: estudiantesOptions[1].value,
                        rubrica: evaluacionEnCurso.rubrica,
                        respuestas: {},
                        puntajeTotal: 0,
                        puntajeMaximo: evaluacionEnCurso.puntajeMaximo
                    };
                    
                    limpiarSeleccionesRubrica();
                    mostrarResultadoEvaluacion();
                }
            } else {
                // Finalizar evaluación
                limpiarEvaluacion();
            }
        }
    }
    
    // Función para limpiar solo las selecciones de la rúbrica
    function limpiarSeleccionesRubrica() {
        if (!rubricaContent) return;
        
        // Quitar la clase 'selected' de todos los botones
        const botonesSeleccionados = rubricaContent.querySelectorAll('.nivel-boton.selected');
        botonesSeleccionados.forEach(boton => {
            boton.classList.remove('selected');
        });
    }
    
    // Función para limpiar evaluación
    function limpiarEvaluacion() {
        evaluacionEnCurso = null;
        
        // Limpiar selectores
        if (evalCursoSelect) evalCursoSelect.value = '';
        if (evalEstudianteSelect) {
            evalEstudianteSelect.value = '';
            evalEstudianteSelect.disabled = true;
            evalEstudianteSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
        }
        if (evalRubricaSelect) evalRubricaSelect.value = '';
        
        // Ocultar paneles
        if (evaluacionResultado) evaluacionResultado.style.display = 'none';
        if (guardarEvaluacionBtn) guardarEvaluacionBtn.style.display = 'none';
        if (limpiarEvaluacionBtn) limpiarEvaluacionBtn.style.display = 'none';
        if (iniciarEvaluacionBtn) iniciarEvaluacionBtn.style.display = 'flex';
        
        // Limpiar contenido de rúbrica
        if (rubricaContent && modoActual === 'evaluacion') {
            rubricaContent.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">Selecciona curso, estudiante y rúbrica para comenzar la evaluación.</p>';
        }
        
        verificarDatosEvaluacion();
    }

    // Asignar el evento onchange una sola vez
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            if (file.name.endsWith('.docx')) {
                mammoth.convertToHtml({arrayBuffer: file})
                    .then(function(result) {
                        const html = result.value;
                        const rubrica = procesarDocx(html);
                        mostrarRubrica(rubrica);
                    })
                    .catch(function(error) {
                        alert('Error al cargar el archivo Word: ' + error.message);
                    });
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.onload = function(event) {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const rubrica = procesarExcel(workbook);
                        mostrarRubrica(rubrica);
                    } catch (error) {
                        alert('Error al cargar el archivo Excel: ' + error.message);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
        // Limpiar el valor del input para permitir cargar el mismo archivo nuevamente
        e.target.value = null;
    };

    // Función para procesar archivo Excel
    function procesarExcel(workbook) {
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Validar estructura del Excel
        if (data.length < 2) {
            throw new Error('El archivo Excel debe contener al menos un criterio además del encabezado');
        }

        // Verificar el encabezado
        const headers = data[0];
        const puntajes = data[1]; // La segunda fila contiene los puntajes
        if (!headers || headers.length < 2 || !puntajes || puntajes.length < 2) {
            throw new Error('El archivo no tiene el formato correcto de encabezados y puntajes');
        }

        const criterios = [];
        
        // Procesar cada fila (excepto el encabezado y puntajes)
        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            if (row && row[0]) { // Si la fila tiene un criterio
                const criterio = {
                    titulo: row[0],
                    niveles: []
                };
                
                // Procesar cada nivel (columna)
                for (let j = 1; j < headers.length - 1; j++) { // -1 para excluir "No presente"
                    if (row[j]) {
                        criterio.niveles.push({
                            nivel: headers[j],
                            puntos: parseInt(puntajes[j]) || 0,
                            descripcion: row[j] || ''
                        });
                    }
                }
                
                criterios.push(criterio);
            }
        }
        
        return {
            titulo: 'Rúbrica Importada',
            descripcion: 'Rúbrica importada desde Excel',
            criterios,
            fechaCreacion: new Date().toISOString()
        };
    }

    // Función para mostrar una rúbrica cargada
    function mostrarRubrica(rubrica = null) {
        // Almacenar la rúbrica actual
        rubricaActual = rubrica;
        
        const container = document.querySelector('.rubrica-content');
        if (!container) {
            console.error('No se encontró el contenedor de la rúbrica');
            return;
        }

        // Si estamos en modo evaluación y hay una evaluación en curso, mostrar la rúbrica de evaluación
        if (modoActual === 'evaluacion' && evaluacionEnCurso && evaluacionEnCurso.rubrica) {
            mostrarRubricaEvaluacion(evaluacionEnCurso.rubrica);
            return;
        }
        
        // Si estamos en modo evaluación pero no hay evaluación en curso, mostrar mensaje
        if (modoActual === 'evaluacion') {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">Selecciona curso, estudiante y rúbrica para comenzar la evaluación.</p>';
            return;
        }

        // Modo normal - mostrar formulario de rúbrica
        container.innerHTML = `
            <form id="nueva-rubrica-form" class="rubrica-form">
                <div class="form-group">
                    <label for="rubrica-titulo">Título de la Rúbrica</label>
                    <input type="text" id="rubrica-titulo" name="rubrica-titulo" required value="${rubrica ? rubrica.titulo : ''}">
                </div>
                <div class="form-group">
                    <label for="rubrica-descripcion">Descripción</label>
                    <textarea id="rubrica-descripcion" name="rubrica-descripcion" rows="3">${rubrica ? rubrica.descripcion : ''}</textarea>
                </div>
                <div class="rubrica-container">
                    <div class="rubrica-table-container">
                        <div class="rubrica-table-wrapper">
                            <table id="rubrica-table" class="rubrica-table">
                                <thead>
                                    <tr id="header-row">
                                        <th>Criterio</th>
                                        ${rubrica ? generarColumnasNiveles(rubrica.criterios[0].niveles) : generarNivelVacioEditable()}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rubrica ? generarFilasCriterios(rubrica.criterios) : generarFilaVacia()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="rubrica-slider">
                        <div class="rubrica-slider-handle"></div>
                    </div>
                </div>
                <div class="rubricas-controls">
                    <button type="button" id="agregar-columna">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Nivel
                    </button>
                    <button type="button" id="agregar-fila">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Criterio
                    </button>
                    <button type="button" id="descargar-plantilla-excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Plantilla Excel
                    </button>
                    <button type="button" id="descargar-plantilla-word">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Plantilla Word
                    </button>
                    <button type="button" id="exportar-excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="8" y1="15" x2="16" y2="15"></line>
                        </svg>
                        Exportar Excel
                    </button>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar Rúbrica</button>
                </div>
            </form>
        `;

        // Funciones auxiliares para generar el HTML
        function generarColumnasNiveles(niveles) {
            return niveles.map((nivel, index) => `
                <th>
                    <div class="nivel-header">
                        <div class="nivel-info">
                            <input type="text" class="nivel-titulo-input" id="nivel-titulo-${index}" 
                                   name="nivel-titulo-${index}" value="${nivel.nivel}" 
                                   placeholder="Nombre del nivel" title="Nombre del nivel">
                            <input type="number" class="nivel-puntos" id="nivel-puntos-${index}" 
                                   name="nivel-puntos-${index}" value="${nivel.puntos}" min="0" max="10" 
                                   title="Puntos para este nivel">
                        </div>
                        <div class="btn-controls">
                            <button type="button" class="btn-eliminar-columna" data-index="${index}">×</button>
                        </div>
                    </div>
                </th>
            `).join('');
        }

        function generarFilasCriterios(criterios) {
            return criterios.map((criterio, criterioIndex) => `
                <tr>
                    <td>
                        <input type="text" class="criterio-input" id="criterio-input-${criterioIndex}" 
                               name="criterio-input-${criterioIndex}" placeholder="Nombre del criterio" 
                               required value="${criterio.titulo}">
                        <button type="button" class="btn-eliminar-fila">×</button>
                    </td>
                    ${criterio.niveles.map((nivel, nivelIndex) => `
                        <td>
                            <textarea class="nivel-descripcion" id="nivel-desc-${nivelIndex}-${criterioIndex}" 
                                      name="nivel-desc-${nivelIndex}-${criterioIndex}" rows="3" 
                                      placeholder="Descripción del nivel">${nivel.descripcion}</textarea>
                        </td>
                    `).join('')}
                </tr>
            `).join('');
        }

        function generarFilaVacia() {
            return `
                <tr>
                    <td>
                        <input type="text" class="criterio-input" id="criterio-input-0" 
                               name="criterio-input-0" placeholder="Nombre del criterio" required>
                        <button type="button" class="btn-eliminar-fila">×</button>
                    </td>
                    <td>
                        <textarea class="nivel-descripcion" id="nivel-desc-0-0" 
                                  name="nivel-desc-0-0" rows="3" 
                                  placeholder="Descripción del nivel"></textarea>
                    </td>
                </tr>
            `;
        }

        function generarNivelVacioEditable() {
            return `
                <th>
                    <div class="nivel-header">
                        <div class="nivel-info">
                            <input type="text" class="nivel-titulo-input" id="nivel-titulo-0" 
                                   name="nivel-titulo-0" value="Nivel 1" 
                                   placeholder="Nombre del nivel" title="Nombre del nivel">
                            <input type="number" class="nivel-puntos" id="nivel-puntos-0" 
                                   name="nivel-puntos-0" value="1" min="0" max="10" 
                                   title="Puntos para este nivel">
                        </div>
                        <div class="btn-controls">
                            <button type="button" class="btn-eliminar-columna" data-index="0">×</button>
                        </div>
                    </div>
                </th>
            `;
        }

        inicializarEventosFormulario();
    }

    // Función para inicializar los eventos del formulario
    function inicializarEventosFormulario() {
        const form = document.getElementById('nueva-rubrica-form');
        const agregarColumnaBtn = document.getElementById('agregar-columna');
        const agregarFilaBtn = document.getElementById('agregar-fila');
        const exportarExcelBtn = document.getElementById('exportar-excel');
        const tabla = document.getElementById('rubrica-table');
        
        if (!form || !agregarColumnaBtn || !agregarFilaBtn || !exportarExcelBtn || !tabla) {
            console.error('No se encontraron todos los elementos necesarios');
            return;
        }

        // Agregar eventos directamente sin intentar removerlos primero
        form.addEventListener('submit', manejarSubmitFormulario);
        agregarColumnaBtn.addEventListener('click', manejarAgregarColumna);
        agregarFilaBtn.addEventListener('click', manejarAgregarFila);
        exportarExcelBtn.addEventListener('click', manejarExportarExcel);
        tabla.addEventListener('click', manejarEventosTabla);

        const slider = document.querySelector('.rubrica-slider');
        const handle = document.querySelector('.rubrica-slider-handle');
        const tableWrapper = document.querySelector('.rubrica-table-wrapper');
        const tableContainer = document.querySelector('.rubrica-table-container');
        
        if (!slider || !handle || !tableWrapper || !tableContainer) {
            console.error('No se encontraron los elementos del slider');
            return;
        }

        let isDragging = false;
        let startX;
        let sliderLeft;
        
        function actualizarPosicionTabla(handlePosition) {
            const tabla = document.getElementById('rubrica-table');
            const containerWidth = tableContainer.offsetWidth;
            const tableWidth = tabla.offsetWidth;
            
            if (tableWidth <= containerWidth) {
                tableWrapper.style.transform = 'translateX(0)';
                handle.style.display = 'none';
                slider.style.display = 'none';
                return;
            }
            
            slider.style.display = 'block';
            handle.style.display = 'block';
            
            const maxScroll = tableWidth - containerWidth;
            const scrollPercentage = handlePosition / (slider.offsetWidth - handle.offsetWidth);
            const translateX = -maxScroll * scrollPercentage;
            
            tableWrapper.style.transform = `translateX(${translateX}px)`;
        }
        
        function iniciarArrastre(e) {
            isDragging = true;
            handle.classList.add('grabbing');
            
            startX = e.pageX - slider.getBoundingClientRect().left;
            sliderLeft = handle.offsetLeft;
            
            e.preventDefault();
        }
        
        function realizarArrastre(e) {
            if (!isDragging) return;
            
            const x = e.pageX - slider.getBoundingClientRect().left;
            const walk = x - startX;
            
            let newLeft = sliderLeft + walk;
            const maxLeft = slider.offsetWidth - handle.offsetWidth;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            handle.style.left = `${newLeft}px`;
            
            actualizarPosicionTabla(newLeft);
        }
        
        function finalizarArrastre() {
            isDragging = false;
            handle.classList.remove('grabbing');
        }
        
        // Inicializar posición del handle
        function inicializarSlider() {
            const tabla = document.getElementById('rubrica-table');
            if (tabla.offsetWidth <= tableContainer.offsetWidth) {
                slider.style.display = 'none';
                handle.style.display = 'none';
                return;
            }
            
            handle.style.left = '0';
            actualizarPosicionTabla(0);
        }
        
        // Eventos del slider
        handle.addEventListener('mousedown', iniciarArrastre);
        document.addEventListener('mousemove', realizarArrastre);
        document.addEventListener('mouseup', finalizarArrastre);
        document.addEventListener('mouseleave', finalizarArrastre);
        
        // Click directo en el slider
        slider.addEventListener('click', (e) => {
            if (e.target === handle) return;
            
            const clickX = e.pageX - slider.getBoundingClientRect().left;
            const handleCenter = handle.offsetWidth / 2;
            let newLeft = clickX - handleCenter;
            
            const maxLeft = slider.offsetWidth - handle.offsetWidth;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            
            handle.style.left = `${newLeft}px`;
            actualizarPosicionTabla(newLeft);
        });
        
        // Observar cambios en el tamaño
        const observer = new ResizeObserver(() => {
            inicializarSlider();
        });
        observer.observe(tabla);
        
        // Inicializar slider
        inicializarSlider();

        const descargarPlantillaExcelBtn = document.getElementById('descargar-plantilla-excel');
        const descargarPlantillaWordBtn = document.getElementById('descargar-plantilla-word');

        if (descargarPlantillaExcelBtn) {
            descargarPlantillaExcelBtn.addEventListener('click', descargarPlantillaExcel);
        }
        if (descargarPlantillaWordBtn) {
            descargarPlantillaWordBtn.addEventListener('click', descargarPlantillaWord);
        }
    }

    // Manejadores de eventos
    function manejarSubmitFormulario(e) {
        e.preventDefault();
        guardarRubrica();
    }

    function manejarExportarExcel() {
        const rubrica = obtenerDatosRubrica();
        exportarAExcel(rubrica);
    }

    function manejarEventosTabla(e) {
        if (e.target.classList.contains('btn-eliminar-columna')) {
            const index = parseInt(e.target.dataset.index) + 1;
            const tabla = document.getElementById('rubrica-table');
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                fila.deleteCell(index);
            });
            
            // Actualizar índices de los botones de eliminar y los IDs
            const encabezados = tabla.querySelectorAll('th');
            encabezados.forEach((th, i) => {
                if (i > 0) {
                    th.innerHTML = `
                        <div class="nivel-header">
                            <div class="nivel-info">
                                <input type="text" class="nivel-titulo-input" id="nivel-titulo-${i-1}" 
                                       name="nivel-titulo-${i-1}" value="Nivel ${i}" 
                                       placeholder="Nombre del nivel" title="Nombre del nivel">
                                <input type="number" class="nivel-puntos" id="nivel-puntos-${i-1}" 
                                       name="nivel-puntos-${i-1}" value="${5-i}" min="0" max="10" 
                                       title="Puntos para este nivel">
                            </div>
                            <div class="btn-controls">
                                <button type="button" class="btn-eliminar-columna" data-index="${i-1}">×</button>
                            </div>
                        </div>
                    `;
                }
            });

            // Actualizar IDs de las descripciones
            const filasTbody = tabla.querySelectorAll('tbody tr');
            filasTbody.forEach((fila, filaIndex) => {
                const celdas = fila.querySelectorAll('.nivel-descripcion');
                celdas.forEach((celda, celdaIndex) => {
                    celda.id = `nivel-desc-${celdaIndex}-${filaIndex}`;
                    celda.name = `nivel-desc-${celdaIndex}-${filaIndex}`;
                });
            });
        } else if (e.target.classList.contains('btn-eliminar-fila')) {
            const fila = e.target.closest('tr');
            fila.remove();
            
            // Actualizar IDs de las filas restantes
            const tabla = document.getElementById('rubrica-table');
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach((fila, filaIndex) => {
                const criterioInput = fila.querySelector('.criterio-input');
                criterioInput.id = `criterio-input-${filaIndex}`;
                criterioInput.name = `criterio-input-${filaIndex}`;
                
                const descripciones = fila.querySelectorAll('.nivel-descripcion');
                descripciones.forEach((desc, descIndex) => {
                    desc.id = `nivel-desc-${descIndex}-${filaIndex}`;
                    desc.name = `nivel-desc-${descIndex}-${filaIndex}`;
                });
            });
        }
    }

    function manejarAgregarColumna() {
        const headerRow = document.getElementById('header-row');
        const numColumnas = headerRow.cells.length;
        
        // Agregar encabezado
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="nivel-header">
                <div class="nivel-info">
                    <input type="text" class="nivel-titulo-input" id="nivel-titulo-${numColumnas-1}" 
                           name="nivel-titulo-${numColumnas-1}" value="Nivel ${numColumnas}" 
                           placeholder="Nombre del nivel" title="Nombre del nivel">
                    <input type="number" class="nivel-puntos" id="nivel-puntos-${numColumnas-1}" 
                           name="nivel-puntos-${numColumnas-1}" value="${Math.max(1, 5-numColumnas+1)}" 
                           min="0" max="10" title="Puntos para este nivel">
                </div>
                <div class="btn-controls">
                    <button type="button" class="btn-eliminar-columna" data-index="${numColumnas - 1}">×</button>
                </div>
            </div>
        `;
        headerRow.appendChild(th);
        
        // Agregar celda a cada fila existente
        const tabla = document.getElementById('rubrica-table');
        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach((fila, filaIndex) => {
            const td = document.createElement('td');
            td.innerHTML = `<textarea class="nivel-descripcion" id="nivel-desc-${numColumnas-1}-${filaIndex}" name="nivel-desc-${numColumnas-1}-${filaIndex}" rows="3" placeholder="Descripción del nivel"></textarea>`;
            fila.appendChild(td);
        });
    }

    function manejarAgregarFila() {
        const tabla = document.getElementById('rubrica-table');
        const tbody = tabla.querySelector('tbody');
        const numFilas = tbody.querySelectorAll('tr').length;
        const numColumnas = document.getElementById('header-row').cells.length;
        const tr = document.createElement('tr');
        
        // Crear celda para el criterio
        let html = `
            <td>
                <input type="text" class="criterio-input" id="criterio-input-${numFilas}" name="criterio-input-${numFilas}" placeholder="Nombre del criterio" required>
                <button type="button" class="btn-eliminar-fila">×</button>
            </td>
        `;
        
        // Crear celdas para cada nivel
        for (let i = 1; i < numColumnas; i++) {
            html += `
                <td>
                    <textarea class="nivel-descripcion" id="nivel-desc-${i-1}-${numFilas}" name="nivel-desc-${i-1}-${numFilas}" rows="3" placeholder="Descripción del nivel"></textarea>
                </td>
            `;
        }
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }

    // Función para obtener los datos de la rúbrica actual
    function obtenerDatosRubrica() {
        const tabla = document.getElementById('rubrica-table');
        const titulo = document.getElementById('rubrica-titulo').value;
        const descripcion = document.getElementById('rubrica-descripcion').value;
        
        // Obtener encabezados (niveles)
        const encabezados = Array.from(tabla.querySelectorAll('th')).slice(1).map(th => {
            const tituloInput = th.querySelector('.nivel-titulo-input');
            const puntosInput = th.querySelector('.nivel-puntos');
            
            return {
                titulo: tituloInput ? tituloInput.value.trim() : 'Nivel',
                puntos: puntosInput ? (parseInt(puntosInput.value) || 0) : 0
            };
        });
        
        // Obtener filas (criterios)
        const filas = tabla.querySelectorAll('tbody tr');
        const criterios = Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll('td');
            const criterio = celdas[0].querySelector('.criterio-input').value;
            const niveles = Array.from(celdas).slice(1).map((celda, index) => ({
                nivel: encabezados[index].titulo,
                puntos: encabezados[index].puntos,
                descripcion: celda.querySelector('.nivel-descripcion').value
            }));
            
            return {
                titulo: criterio,
                niveles: niveles
            };
        });
        
        return {
            titulo,
            descripcion,
            criterios,
            fechaCreacion: new Date().toISOString()
        };
    }

    // Función para guardar la rúbrica
    function guardarRubrica() {
        try {
            const rubrica = obtenerDatosRubrica();
            if (rubrica && rubrica.criterios.length > 0) {
                // Asegurar que tenga un ID único
                if (!rubrica.id) {
                    rubrica.id = generarIdUnico();
                }
                
                // Agregar fecha de creación si no existe
                if (!rubrica.fechaCreacion) {
                    rubrica.fechaCreacion = new Date().toISOString();
                }
                
                // Guardar en localStorage
                let rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
                
                // Verificar si ya existe una rúbrica con el mismo nombre
                const indiceExistente = rubricas.findIndex(r => r.titulo === rubrica.titulo);
                
                if (indiceExistente !== -1) {
                    const confirmar = confirm(`Ya existe una rúbrica con el nombre "${rubrica.titulo}". ¿Desea reemplazarla?`);
                    if (confirmar) {
                        rubricas[indiceExistente] = rubrica;
                    } else {
                        rubrica.titulo = rubrica.titulo + ' (Copia)';
                        rubrica.id = generarIdUnico(); // Nuevo ID para la copia
                        rubricas.push(rubrica);
                    }
                } else {
                    rubricas.push(rubrica);
                }
                
                localStorage.setItem('rubricas_guardadas', JSON.stringify(rubricas));
                
                // Actualizar lista en configuración si está disponible
                if (window.RubricaConfig) {
                    window.RubricaConfig.cargarListaRubricas();
                    window.RubricaConfig.actualizarSelectorRubricas();
                }
                
                alert('Rúbrica guardada exitosamente: ' + rubrica.titulo);
            } else {
                alert('No se puede guardar una rúbrica vacía. Agregue al menos un criterio.');
            }
        } catch (error) {
            console.error('Error al guardar la rúbrica:', error);
            alert('Error al guardar la rúbrica: ' + error.message);
        }
    }

    // Función para exportar a Excel
    function exportarAExcel(rubrica) {
        // Crear el encabezado
        const headers = ['Criterio'];
        const puntajes = ['Puntaje']; // Nueva fila para puntajes
        
        // Obtener los nombres de niveles y puntajes del primer criterio
        if (rubrica.criterios.length > 0) {
            rubrica.criterios[0].niveles.forEach(nivel => {
                headers.push(nivel.nivel);
                puntajes.push(nivel.puntos);
            });
        }
        headers.push('No presente');
        puntajes.push(0);
        
        // Crear la matriz de datos
        const data = [headers, puntajes];
        
        // Agregar los criterios
        rubrica.criterios.forEach(criterio => {
            const row = [
                criterio.titulo, // Criterio
                ...criterio.niveles.map(nivel => nivel.descripcion), // Descripciones de niveles
                '' // No presente
            ];
            data.push(row);
        });
        
        // Crear la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Dar formato a las celdas
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) continue;
                ws[cell_address].s = {
                    font: { bold: R <= 1 }, // Primeras dos filas en negrita
                    alignment: { 
                        vertical: 'top', 
                        wrapText: true,
                        horizontal: R <= 1 ? 'center' : 'left' // Centrar encabezados y puntajes
                    }
                };
            }
        }
        
        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 30 }, // Criterio
            { wch: 40 }, // Excelente
            { wch: 40 }, // Bueno
            { wch: 40 }, // Satisfactorio
            { wch: 40 }, // Insuficiente
            { wch: 20 }  // No presente
        ];
        
        // Crear el libro y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rúbrica');
        
        // Guardar archivo
        XLSX.writeFile(wb, `rubrica_${rubrica.titulo.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
    }

    // Evento para crear una nueva rúbrica
    nuevaRubricaBtn.addEventListener('click', function() {
        mostrarRubrica();
    });

    // Evento para cargar una rúbrica
        cargarRubricaBtn.addEventListener('click', function(event) {
            console.log('Clic en cargarRubricaBtn detectado. Timestamp:', event.timeStamp);
            event.stopPropagation(); 
            
            console.log('Llamando a fileInput.click(). Timestamp:', performance.now());
            fileInput.click();
            console.log('Después de llamar a fileInput.click(). Timestamp:', performance.now());
            
            if (cargarRubricaBtn && typeof cargarRubricaBtn.blur === 'function') {
                cargarRubricaBtn.blur();
                console.log('Foco quitado de cargarRubricaBtn. Timestamp:', performance.now());
            }
        });

    // Función para procesar el contenido de un archivo Word
    function procesarDocx(html) {
        // Crear un elemento temporal para analizar el HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Inicializar la estructura de la rúbrica
        const rubrica = {
            titulo: '',
            descripcion: 'Rúbrica importada desde Word',
            criterios: [],
            fechaCreacion: new Date().toISOString()
        };
        
        // Buscar el título (asumiendo que es el primer encabezado)
        const titulo = temp.querySelector('h1, h2, h3');
        if (titulo) {
            rubrica.titulo = titulo.textContent.trim();
        }
        
        // Buscar tablas en el documento
        const tablas = temp.getElementsByTagName('table');
        if (tablas.length > 0) {
            const tabla = tablas[0]; // Usar la primera tabla encontrada
            
            // Procesar encabezados (niveles)
            const encabezados = tabla.querySelectorAll('tr:first-child td, tr:first-child th');
            const niveles = [];
            encabezados.forEach((encabezado, index) => {
                if (index > 0) { // Ignorar la primera columna (nombres de criterios)
                    niveles.push({
                        nivel: encabezado.textContent.trim(),
                        puntos: 4 - (index - 1) // Asignar puntajes descendentes
                    });
                }
            });
            
            // Procesar filas (criterios)
            const filas = tabla.querySelectorAll('tr:not(:first-child)');
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length > 0) {
                    const criterio = {
                        titulo: celdas[0].textContent.trim(),
                        niveles: []
                    };
                    
                    // Obtener descripciones para cada nivel
                    for (let i = 1; i < celdas.length && i <= niveles.length; i++) {
                        criterio.niveles.push({
                            nivel: niveles[i-1].nivel,
                            puntos: niveles[i-1].puntos,
                            descripcion: celdas[i].textContent.trim()
                        });
                    }
                    
                    rubrica.criterios.push(criterio);
                }
            });
        }
        
        return rubrica;
    }

    // Función para descargar la plantilla de Excel
    function descargarPlantillaExcel() {
        // Crear el encabezado - agregando "FIN" al final
        const headers = ['Criterio', 'Excelente', 'Bueno', 'Regular', 'Deficiente', 'FIN'];
        const puntajes = ['Puntaje', '4', '3', '2', '1', ''];
        
        // Crear datos de ejemplo - agregando columna vacía para "FIN"
        const data = [
            headers,
            puntajes,
            ['Presentación', 'Muy organizado y claro', 'Organizado', 'Poco organizado', 'Desorganizado', ''],
            ['Contenido', 'Contenido completo', 'Contenido casi completo', 'Contenido incompleto', 'Contenido muy incompleto', ''],
            ['Ortografía', 'Sin errores', '1-2 errores', '3-4 errores', '5 o más errores', '']
        ];
        
        // Crear la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Dar formato a las celdas
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) continue;
                ws[cell_address].s = {
                    font: { bold: R <= 1 },
                    alignment: { 
                        vertical: 'top',
                        wrapText: true,
                        horizontal: R <= 1 ? 'center' : 'left'
                    }
                };
            }
        }
        
        // Ajustar ancho de columnas - agregando ancho para columna "FIN"
        ws['!cols'] = [
            { wch: 30 }, // Criterio
            { wch: 40 }, // Excelente
            { wch: 40 }, // Bueno
            { wch: 40 }, // Regular
            { wch: 40 }, // Deficiente
            { wch: 15 }  // FIN
        ];
        
        // Crear el libro y agregar la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Rúbrica');
        
        // Guardar archivo
        XLSX.writeFile(wb, 'plantilla_rubrica.xlsx');
    }

    // Función para descargar la plantilla de Word
    function descargarPlantillaWord() {
        alert('La funcionalidad de plantilla Word estará disponible próximamente.');
    }
    
    // Función para generar ID único
    function generarIdUnico() {
        return 'rubrica_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Event listener para cargar rúbrica guardada desde el selector
    document.addEventListener('cargarRubricaGuardada', function(event) {
        const rubrica = event.detail;
        if (rubrica) {
            mostrarRubrica(rubrica);
        }
    });
    
    // Hacer la función mostrarRubrica disponible globalmente
    window.mostrarRubrica = mostrarRubrica;
    
    // Al inicializar, actualizar el selector de rúbricas guardadas
    if (window.RubricaConfig) {
        window.RubricaConfig.actualizarSelectorRubricas();
    }

    // Función para exportar evaluaciones del curso a PDF
    function exportarCursoPdf() {
        const curso = evalCursoSelect?.value;
        const rubricaId = evalRubricaSelect?.value;
        
        if (!curso || !rubricaId) {
            alert('Por favor selecciona un curso y una rúbrica');
            return;
        }
        
        // Obtener datos necesarios
        const cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');
        const estudiantes = cursosData[curso] || [];
        const rubricas = JSON.parse(localStorage.getItem('rubricas_guardadas') || '[]');
        const rubrica = rubricas.find(r => r.id === rubricaId);
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones_rubricas') || '[]');
        
        if (!rubrica) {
            alert('Rúbrica no encontrada');
            return;
        }
        
        if (estudiantes.length === 0) {
            alert('No hay estudiantes en el curso seleccionado');
            return;
        }
        
        try {
            // Crear PDF usando jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let estudiante_num = 0;
            
            estudiantes.forEach((estudiante, index) => {
                const nombreEstudiante = typeof estudiante === 'object' ? 
                    (estudiante.nombre || estudiante.Nombre || `Estudiante ${estudiante.id || index + 1}`) : 
                    estudiante;
                
                // Buscar evaluación del estudiante
                const evaluacionEstudiante = evaluaciones.find(eval => 
                    eval.curso === curso && 
                    eval.estudiante === nombreEstudiante && 
                    eval.rubrica.id === rubricaId
                );
                
                // Nueva página para cada estudiante (excepto el primero)
                if (index > 0) {
                    doc.addPage();
                }
                
                estudiante_num++;
                
                // Generar página del estudiante
                generarPaginaEstudiante(doc, rubrica, nombreEstudiante, curso, evaluacionEstudiante, estudiante_num);
            });
            
            // Guardar PDF
            const fechaHora = new Date().toLocaleString('es-ES').replace(/[/:]/g, '-');
            doc.save(`Evaluaciones_${curso}_${rubrica.titulo}_${fechaHora}.pdf`);
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF: ' + error.message);
        }
    }
    
    // Función auxiliar para generar página de estudiante
    function generarPaginaEstudiante(doc, rubrica, nombreEstudiante, curso, evaluacion, numeroEstudiante) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Encabezado del documento
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('EVALUACIÓN DE RÚBRICA', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
        
        // Información del estudiante
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Estudiante: ${nombreEstudiante}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Curso: ${curso}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Rúbrica: ${rubrica.titulo}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition);
        yPosition += 15;
        
        // Información de evaluación
        if (evaluacion) {
            const porcentaje = evaluacion.puntajeMaximo > 0 ? 
                (evaluacion.puntajeTotal / evaluacion.puntajeMaximo * 100).toFixed(1) : 0;
            
            doc.setFont('helvetica', 'bold');
            doc.text(`Puntaje: ${evaluacion.puntajeTotal}/${evaluacion.puntajeMaximo} (${porcentaje}%)`, 20, yPosition);
            yPosition += 8;
            doc.text(`Nota: ${evaluacion.nota}`, 20, yPosition);
            yPosition += 15;
        } else {
            doc.setFont('helvetica', 'italic');
            doc.text('SIN EVALUAR', 20, yPosition);
            yPosition += 15;
        }
        
        // Tabla de rúbrica
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('CRITERIOS Y NIVELES DE DESEMPEÑO', 20, yPosition);
        yPosition += 10;
        
        // Calcular anchos de columna dinámicamente
        const tableWidth = pageWidth - 40;
        const criterioWidth = tableWidth * 0.25; // 25% para criterio
        const nivelWidth = (tableWidth - criterioWidth) / rubrica.criterios[0].niveles.length;
        
        // Encabezados de la tabla
        let xPos = 20;
        const headerHeight = 15;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        // Encabezado criterio
        doc.rect(xPos, yPosition, criterioWidth, headerHeight);
        doc.text('CRITERIO', xPos + 2, yPosition + 10);
        xPos += criterioWidth;
        
        // Encabezados de niveles
        rubrica.criterios[0].niveles.forEach(nivel => {
            doc.rect(xPos, yPosition, nivelWidth, headerHeight);
            const headerText = `${nivel.nivel} (${nivel.puntos}pts)`;
            const headerLines = doc.splitTextToSize(headerText, nivelWidth - 4);
            doc.text(headerLines, xPos + 2, yPosition + 7);
            xPos += nivelWidth;
        });
        
        yPosition += headerHeight;
        
        // Función para calcular altura necesaria para una fila
        function calcularAlturaFila(criterio) {
            doc.setFontSize(8);
            let maxHeight = 15; // Altura mínima
            
            // Calcular altura necesaria para el criterio
            const criterioLines = doc.splitTextToSize(criterio.titulo, criterioWidth - 4);
            const criterioHeight = criterioLines.length * 4 + 8;
            maxHeight = Math.max(maxHeight, criterioHeight);
            
            // Calcular altura necesaria para cada nivel
            criterio.niveles.forEach(nivel => {
                // Solo usar la descripción del nivel, sin agregar texto de selección
                const nivelText = nivel.descripcion;
                const nivelLines = doc.splitTextToSize(nivelText, nivelWidth - 4);
                const nivelHeight = nivelLines.length * 4 + 8;
                maxHeight = Math.max(maxHeight, nivelHeight);
            });
            
            return maxHeight;
        }
        
        // Generar filas de criterios
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        rubrica.criterios.forEach((criterio, criterioIndex) => {
            const filaHeight = calcularAlturaFila(criterio);
            
            // Verificar si necesitamos nueva página
            if (yPosition + filaHeight > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                
                // Repetir encabezados en nueva página
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                xPos = 20;
                
                doc.rect(xPos, yPosition, criterioWidth, headerHeight);
                doc.text('CRITERIO', xPos + 2, yPosition + 10);
                xPos += criterioWidth;
                
                rubrica.criterios[0].niveles.forEach(nivel => {
                    doc.rect(xPos, yPosition, nivelWidth, headerHeight);
                    const headerText = `${nivel.nivel} (${nivel.puntos}pts)`;
                    const headerLines = doc.splitTextToSize(headerText, nivelWidth - 4);
                    doc.text(headerLines, xPos + 2, yPosition + 7);
                    xPos += nivelWidth;
                });
                
                yPosition += headerHeight;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
            }
            
            xPos = 20;
            
            // Celda del criterio
            doc.rect(xPos, yPosition, criterioWidth, filaHeight);
            const criterioLines = doc.splitTextToSize(criterio.titulo, criterioWidth - 4);
            doc.text(criterioLines, xPos + 2, yPosition + 6);
            xPos += criterioWidth;
            
            // Celdas de niveles
            criterio.niveles.forEach((nivel, nivelIndex) => {
                doc.rect(xPos, yPosition, nivelWidth, filaHeight);
                
                // Verificar si este nivel fue seleccionado
                const nivelSeleccionado = evaluacion && 
                    evaluacion.respuestas[criterioIndex] === nivelIndex;
                
                if (nivelSeleccionado) {
                    // Resaltar nivel seleccionado solo con fondo verde
                    doc.setFillColor(200, 255, 200);
                    doc.rect(xPos + 1, yPosition + 1, nivelWidth - 2, filaHeight - 2, 'F');
                    doc.rect(xPos, yPosition, nivelWidth, filaHeight);
                }
                
                // Usar solo la descripción del nivel, sin texto de selección
                const nivelText = nivel.descripcion;
                doc.setFont('helvetica', 'normal');
                
                // Dividir texto en líneas que quepan en la celda
                const nivelLines = doc.splitTextToSize(nivelText, nivelWidth - 4);
                
                // Dibujar texto línea por línea
                let textY = yPosition + 6;
                nivelLines.forEach((line) => {
                    doc.text(line, xPos + 2, textY);
                    textY += 4;
                });
                
                xPos += nivelWidth;
            });
            
            yPosition += filaHeight;
        });
        
        // Pie de página
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Página ${numeroEstudiante} - Generado el ${new Date().toLocaleString('es-ES')}`, 
                 pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
});