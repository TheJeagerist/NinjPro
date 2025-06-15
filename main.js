const container = document.getElementById('rows-container');
const saveBtn = document.getElementById('saveTpl');
const select = document.getElementById('tplSelect');
const delBtn = document.getElementById('delTpl');

let initial = [];
function initRows() { for(let i=0;i<4;i++) addRow(); initial = Array.from(container.children).map(r=>r.innerHTML); }
function addRow(data) { const row = document.createElement('div'); row.className='row'; row.innerHTML = data || `<input type="number" class="grade" step="0.1" min="1" max="7"><input type="number" class="weight" min="1" max="100"><div class="percent">%</div>`; container.appendChild(row); }
function removeRow() { const rows=container.querySelectorAll('.row'); if(rows.length>1) container.removeChild(rows[rows.length-1]); else alert('Debe quedar al menos una fila.'); }
function resetAll() { container.innerHTML=''; initial.forEach(html=>{const r=document.createElement('div');r.className='row';r.innerHTML=html;container.appendChild(r);}); }
function saveTemplate() { const name=document.getElementById('tplName').value.trim(); if(!name)return alert('Nombre requerido'); const data=Array.from(container.children).map(r=>({grade:r.querySelector('.grade').value,weight:r.querySelector('.weight').value})); const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); tpl[name]=data; localStorage.setItem('templates',JSON.stringify(tpl)); loadTemplates(); }
function loadTemplates() { select.innerHTML='<option value="">Seleccionar ramo</option>'; const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); Object.keys(tpl).forEach(name=>select.innerHTML+=`<option value="${name}">${name}</option>`); }
function applyTemplate() { const name=select.value; if(!name)return; resetAll(); const tpl=JSON.parse(localStorage.getItem('templates'))[name]; container.innerHTML=''; tpl.forEach(({grade,weight})=>addRow(`<input type="number" class="grade" value="${grade}" step="0.1" min="1" max="7"><input type="number" class="weight" value="${weight}" min="1" max="100"><div class="percent">%</div>`)); }
function deleteTemplate() { const name=select.value; if(!name)return; const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); delete tpl[name]; localStorage.setItem('templates',JSON.stringify(tpl)); loadTemplates(); }
saveBtn.addEventListener('click', function() {
  saveTemplate();
  // Oculta el panel con animación y muestra el botón Agregar Ramo
  const panel = document.getElementById('ramo-panel');
  panel.classList.remove('visible');
  setTimeout(() => {
    panel.style.display = 'none';
    document.getElementById('show-ramo-panel').style.display = '';
  }, 450); // tiempo igual a la animación CSS
});

select.addEventListener('change',applyTemplate);
delBtn.addEventListener('click',deleteTemplate);

function animateNumber(element, start, end, duration = 800, decimals = 2) {
  if (isNaN(start)) start = 0;
  if (isNaN(end)) end = 0;
  const range = end - start;
  if (range === 0) {
    element.textContent = end.toFixed(decimals);
    return;
  }
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = start + range * progress;
    element.textContent = current.toFixed(decimals);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = end.toFixed(decimals);
    }
  }
  requestAnimationFrame(step);
}

function calculateAverage() {
  let total = 0, sum = 0;
  let grades = [];
  let weights = [];
  let emptyGradeIndex = -1;
  let emptyGrades = 0;

  document.querySelectorAll('.row').forEach((r, i) => {
    let g = r.querySelector('.grade').value;
    let w = r.querySelector('.weight').value;
    grades.push(g);
    weights.push(w);
    if (g === "") {
      emptyGrades++;
      emptyGradeIndex = i;
    }
    if (w === "") {
      showError("Completa todas las ponderaciones");
      return;
    }
    g = parseFloat(g);
    w = parseFloat(w);
    if (!isNaN(g) && !isNaN(w)) {
      if (g >= 10) g /= 10;
      total += w;
      sum += g * w;
    }
  });

  const panel = document.getElementById('result-panel');
  const neededPanel = document.getElementById('needed-panel');

  // Si hay alguna ponderación vacía, no seguimos
  if (weights.some(w => w === "")) {
    showError("Completa todas las ponderaciones");
    neededPanel.style.display = "none";
    neededPanel.style.color = getComputedStyle(document.body).getPropertyValue('--needed-panel-text');
    return;
  }

  // Todas las notas llenas: mostrar promedio
  if (emptyGrades === 0) {
    if (total !== 100 && !confirm(`La suma de las ponderaciones es ${total}%. ¿Calcular igual?`)) {
      neededPanel.style.display = "none";
      return;
    }
    const avg = (sum / total).toFixed(2);
    animateNumber(document.getElementById('result-value'),
    parseFloat(document.getElementById('result-value').textContent) || 0,
    parseFloat(avg), 800, 2);

    if (parseFloat(avg) >= 4) {
      panel.className = 'result-panel blue';
      document.getElementById('result-status').textContent = 'Aprobado';
    } else {
      panel.className = 'result-panel red';
      document.getElementById('result-status').textContent = 'Reprobado';
    }
    neededPanel.style.display = "none";
    return;
  }

  // Solo una nota vacía: calcular la nota necesaria
  if (emptyGrades === 1) {
    let idx = emptyGradeIndex;
    let w = parseFloat(weights[idx]);
    if (isNaN(w) || w <= 0) {
      showError("La ponderación de la nota faltante no es válida");
      neededPanel.style.display = "none";
      return;
    }
    // Suma de las otras ponderaciones y notas
    let partialSum = 0;
    let partialTotal = 0;
    for (let i = 0; i < grades.length; i++) {
      if (i !== idx) {
        let g = parseFloat(grades[i]);
        let ww = parseFloat(weights[i]);
        if (!isNaN(g) && !isNaN(ww)) {
          if (g >= 10) g /= 10;
          partialSum += g * ww;
          partialTotal += ww;
        }
      }
    }
    // Total ponderaciones actuales
    let totalW = partialTotal + w;
    if (totalW !== 100 && !confirm(`La suma de las ponderaciones es ${totalW}%. ¿Calcular igual?`)) {
      neededPanel.style.display = "none";
      return;
    }
    // (partialSum + x*w)/totalW >= 4 --> x >= (4*totalW - partialSum)/w
    let needed = (4 * totalW - partialSum) / w;
    needed = Math.round(needed * 100) / 100;
    neededPanel.style.display = "";
    animateNumber(
      document.getElementById('needed-value'),
      parseFloat(document.getElementById('needed-value').textContent) || 0,
      needed < 1 ? 1 : needed,
      800, 2
    );

    if (needed <= 7 && needed >= 1) {
      neededPanel.style.background = getComputedStyle(document.body).getPropertyValue('--needed-panel-bg');
    } else {
      neededPanel.style.background = '#ff4b5c'; // Si es inalcanzable, rojo fuerte en todos los modos
    }

    document.getElementById('needed-title').innerHTML =
      (needed > 7)
        ? `Nota mínima necesaria<br><span style="font-size:1rem;display:block;margin-top:8px;">No es posible aprobar.</span>`
        : "Nota mínima necesaria";
    // Mostrar mensaje informativo en el panel de resultado
    panel.className = 'result-panel';
    document.getElementById('result-value').textContent = "-";
    document.getElementById('result-status').textContent = "Falta una nota";
    return;
  }

  // Más de una nota vacía
  showError("Completa todas las notas menos una");
  neededPanel.style.display = "none";
}

// Mensaje de error estándar
function showError(msg) {
  const panel = document.getElementById('result-panel');
  panel.className = 'result-panel red';
  document.getElementById('result-value').textContent = "-";
  document.getElementById('result-status').textContent = msg;
}

// Tema
function setTheme(theme) {
  console.log(`🎨 Cambiando al tema: ${theme}`);
  
  // Normalizar el nombre del tema (asegurar que tenga el prefijo 'theme-')
  const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
  
  // Cambiar clase del body
          document.body.classList.remove('theme-light', 'theme-dark', 'theme-rosa', 'theme-neon');
  document.body.classList.add(normalizedTheme);
  localStorage.setItem('theme', normalizedTheme);

  // Usar el sistema de fondos animados
  if (window.animatedBackgrounds) {
    const themeKey = normalizedTheme.replace('theme-', '');
    window.animatedBackgrounds.switchTheme(themeKey);
    console.log(`✅ Fondo animado activado para ${normalizedTheme}`);
  } else {
    // Si el sistema de fondos animados no está disponible aún, intentar más tarde
  setTimeout(() => {
      if (window.animatedBackgrounds) {
        const themeKey = normalizedTheme.replace('theme-', '');
        window.animatedBackgrounds.switchTheme(themeKey);
        console.log(`✅ Fondo animado activado para ${normalizedTheme} (retry)`);
    } else {
        console.warn(`⚠️ Sistema de fondos animados no disponible para ${normalizedTheme}`);
    }
    }, 100);
  }
}

const themeBtns = document.querySelectorAll('.theme-btn');
function updateActiveBtn(theme) {
  // Normalizar el tema para la comparación
  const normalizedTheme = theme.startsWith('theme-') ? theme : `theme-${theme}`;
  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === normalizedTheme);
  });
}
themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedTheme = btn.dataset.theme;
    setTheme(selectedTheme);
    updateActiveBtn(selectedTheme);
  });
});
const savedTheme = localStorage.getItem('theme') || 'theme-dark';
setTheme(savedTheme);
updateActiveBtn(savedTheme);

// Mostrar y ocultar el panel de ramos
document.getElementById('show-ramo-panel').onclick = function() {
  const panel = document.getElementById('ramo-panel');
  panel.style.display = 'flex'; // Para activar la transición
  void panel.offsetWidth;       // Fuerza el reflow para la animación
  panel.classList.add('visible');
  this.style.display = 'none';
};
document.getElementById('hide-ramo-panel').onclick = function() {
  const panel = document.getElementById('ramo-panel');
  panel.classList.remove('visible');
  setTimeout(() => {
    panel.style.display = 'none';
    const showBtn = document.getElementById('show-ramo-panel');
    showBtn.style.display = '';
    showBtn.classList.remove('pop-in');
    void showBtn.offsetWidth;
    showBtn.classList.add('pop-in');
  }, 450);
};

// Restricción en tiempo real para Notas (1-99) y Ponderaciones (1-100, solo enteros)
container.addEventListener('input', function(e) {
  const target = e.target;
  // Notas
  if (target.classList.contains('grade')) {
    target.value = target.value.replace(/\D/g, '');
    let v = parseInt(target.value, 10);
    if (isNaN(v)) v = '';
    else if (v < 1) v = 1;
    else if (v > 99) v = 99;
    target.value = v ? v : '';

    // Si el valor tiene 2 dígitos, mover al siguiente input
    if (target.value.length === 2) {
      const currentRow = target.closest('.row');
      const nextRow = currentRow.nextElementSibling;
      if (nextRow) {
        const nextInput = nextRow.querySelector('.grade');
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  }
  // Ponderaciones
  if (target.classList.contains('weight')) {
    target.value = target.value.replace(/\D/g, '');
    let v = parseInt(target.value, 10);
    if (isNaN(v)) v = '';
    else if (v < 1) v = 1;
    else if (v > 100) v = 100;
    target.value = v ? v : '';
  }
});

const sideMenu = document.getElementById('side-menu');
const collapseBtn = document.getElementById('collapse-menu-btn');

// Solo configurar el menú lateral si los elementos existen
if (sideMenu && collapseBtn) {
collapseBtn.addEventListener('click', () => {
  sideMenu.classList.toggle('collapsed');
  localStorage.setItem('menu-collapsed', sideMenu.classList.contains('collapsed') ? '1' : '0');
});
  
if (localStorage.getItem('menu-collapsed') === '1') {
  sideMenu.classList.add('collapsed');
}

// Función para contraer el menú lateral cuando se hace clic fuera
document.addEventListener('click', function(event) {
  // Si el menú está expandido y el clic no fue dentro del menú ni en el botón de colapsar
  if (!sideMenu.classList.contains('collapsed') && 
      !sideMenu.contains(event.target) && 
      !collapseBtn.contains(event.target)) {
    sideMenu.classList.add('collapsed');
    localStorage.setItem('menu-collapsed', '1');
  }
});
}

// Variables globales para elementos del DOM
let calcPanel, escalaPanel, menuCalculadora, menuEscala;

// Función para inicializar los elementos del DOM
function initializeElements() {
  calcPanel = document.getElementById('calc-panel');
  escalaPanel = document.getElementById('escala-panel');
  menuCalculadora = document.getElementById('menu-calculadora');
  menuEscala = document.getElementById('menu-escala');

  // Verificar que todos los elementos existan
  if (!calcPanel || !escalaPanel || !menuCalculadora || !menuEscala) {
    console.error('Error: No se encontraron todos los elementos necesarios');
    return false;
  }
  return true;
}

// Inicializar el panel activo según la URL o mostrar calculadora por defecto
function initializePanels() {
  const elements = {
    calcPanel: document.getElementById('calc-panel'),
    escalaPanel: document.getElementById('escala-panel'),
    multiPanel: document.getElementById('multi-panel'),
    sectionsContainer: document.getElementById('sections-container')
  };

  // Solo verificar que existan los paneles principales
  const requiredPanels = [elements.calcPanel, elements.escalaPanel, elements.multiPanel];
  if (!requiredPanels.every(el => el)) {
    console.warn('No se encontraron todos los paneles principales');
    return;
  }

  const hash = window.location.hash;

  if (hash === '#escala') {
    elements.calcPanel.style.display = "none";
    elements.escalaPanel.style.display = "block";
    elements.multiPanel.style.display = "none";
    generarTablaEscala();
  } else if (hash === '#multi') {
    elements.calcPanel.style.display = "none";
    elements.escalaPanel.style.display = "none";
    elements.multiPanel.style.display = "block";
    if (elements.sectionsContainer && elements.sectionsContainer.children.length === 0) {
      addSection();
    }
  } else if (hash === '#calculator') {
    elements.calcPanel.style.display = "block";
    elements.escalaPanel.style.display = "none";
    elements.multiPanel.style.display = "none";
  } else {
    // Sin hash específico, ocultar todos los paneles (mostrar solo dashboard)
    elements.calcPanel.style.display = "none";
    elements.escalaPanel.style.display = "none";
    elements.multiPanel.style.display = "none";
  }

  // Agregar event listeners para el manejo de inputs en la calculadora múltiple solo si existe sectionsContainer
  if (elements.sectionsContainer && !elements.sectionsContainer.dataset.hasInputListener) {
    elements.sectionsContainer.addEventListener('input', function(e) {
      const target = e.target;
      if (target.classList.contains('grade')) {
        target.value = target.value.replace(/\D/g, '');
        let v = parseInt(target.value, 10);
        if (isNaN(v)) v = '';
        else if (v < 1) v = 1;
        else if (v > 99) v = 99;
        target.value = v ? v : '';

        // Si el valor tiene 2 dígitos, mover al siguiente input
        if (target.value.length === 2) {
          const currentRow = target.closest('.section-row');
          const nextRow = currentRow.nextElementSibling;
          if (nextRow) {
            const nextInput = nextRow.querySelector('.grade');
            if (nextInput) {
              nextInput.focus();
            }
          }
        }
      }
      if (target.classList.contains('weight')) {
        target.value = target.value.replace(/\D/g, '');
        let v = parseInt(target.value, 10);
        if (isNaN(v)) v = '';
        else if (v < 1) v = 1;
        else if (v > 100) v = 100;
        target.value = v ? v : '';
      }
    });
    elements.sectionsContainer.dataset.hasInputListener = 'true';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar elementos principales
  const elements = {
    calcPanel: document.getElementById('calc-panel'),
    escalaPanel: document.getElementById('escala-panel'),
    multiPanel: document.getElementById('multi-panel'),
    sectionsContainer: document.getElementById('sections-container')
  };
  
  // Solo verificar que los paneles principales existan
  const requiredPanels = [elements.calcPanel, elements.escalaPanel, elements.multiPanel];
  if (!requiredPanels.every(el => el)) {
    console.warn('No se encontraron todos los paneles principales');
    // No retornar, continuar con otras inicializaciones
  }

  // Inicializar filas y plantillas
  initRows();
  loadTemplates();
  
  

  // No mostrar ningún panel por defecto, solo el dashboard

  // Configurar event listener para cambios de hash
  window.addEventListener('hashchange', initializePanels);
  // Solo inicializar paneles si hay hash
  if (window.location.hash) {
  initializePanels();
  }

  // Gestión de cursos y estudiantes
  let cursosData = {};

  // Función para inicializar la configuración
  function initConfig() {
      const configBtn = document.getElementById('menu-config');
      const configPanel = document.getElementById('config-panel');
      const btnCargarExcel = document.getElementById('btn-cargar-excel');
      const btnDescargarPlantilla = document.getElementById('btn-descargar-plantilla');

      // Cargar datos guardados
      cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');

      // Event Listeners
      configBtn.addEventListener('click', () => {
          hideAllPanels();
          configPanel.classList.add('visible');
          actualizarListaCursos();
      });

      btnCargarExcel.addEventListener('click', cargarExcelEstudiantes);
      btnDescargarPlantilla.addEventListener('click', descargarPlantillaExcel);
  }

  // Función para cargar el archivo Excel
  async function cargarExcelEstudiantes() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      
      input.onchange = async function(e) {
          const file = e.target.files[0];
          if (file) {
              try {
                  const data = await leerExcelEstudiantes(file);
                  guardarDatosCurso(data);
                  actualizarListaCursos();
              } catch (error) {
                  alert('Error al procesar el archivo: ' + error.message);
              }
          }
      };
      
      input.click();
  }

  // Función para leer el archivo Excel
  async function leerExcelEstudiantes(file) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validar estructura del Excel
      if (!jsonData.length || !jsonData[0].hasOwnProperty('Nombre') || !jsonData[0].hasOwnProperty('Curso')) {
          throw new Error('El archivo no tiene el formato correcto');
      }

      return jsonData;
  }

  // Función para guardar los datos del curso
  function guardarDatosCurso(data) {
      // Agrupar estudiantes por curso
      const cursos = {};
      data.forEach(estudiante => {
          if (!cursos[estudiante.Curso]) {
              cursos[estudiante.Curso] = [];
          }
          cursos[estudiante.Curso].push({
              nombre: estudiante.Nombre,
              id: estudiante.ID || ''
          });
      });

      // Actualizar datos
      cursosData = {...cursosData, ...cursos};
      localStorage.setItem('cursosData', JSON.stringify(cursosData));
  }

  // Función para actualizar la lista de cursos en la interfaz
  function actualizarListaCursos() {
      const listaCursos = document.getElementById('lista-cursos');
      listaCursos.innerHTML = '';

      Object.keys(cursosData).forEach(curso => {
          const cursoElement = document.createElement('div');
          cursoElement.className = 'curso-item';
          cursoElement.innerHTML = `
              <span>${curso} (${cursosData[curso].length} estudiantes)</span>
              <button class="btn-eliminar" onclick="eliminarCurso('${curso}')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
              </button>
          `;
          listaCursos.appendChild(cursoElement);
      });
  }

  // Función para eliminar un curso
  function eliminarCurso(curso) {
      if (confirm(`¿Estás seguro de eliminar el curso ${curso}?`)) {
          delete cursosData[curso];
          localStorage.setItem('cursosData', JSON.stringify(cursosData));
          actualizarListaCursos();
      }
  }

  // Función para descargar la plantilla Excel
  function descargarPlantillaExcel() {
      const ws = XLSX.utils.aoa_to_sheet([
          ['ID', 'Nombre', 'Curso'],
          ['1', 'Ejemplo Estudiante', '8°A'],
      ]);
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
      
      XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
  }

  // Modificar la función existente de inicialización
  document.addEventListener('DOMContentLoaded', function() {
      // ... código existente ...
      initConfig();
  });
});

function generarTablaEscala() {
  console.log('Generando tabla de escala...');
  
  // Verificar que todos los elementos existan
  const elementos = {
    puntajeMax: document.getElementById('puntajeMax'),
    exigencia: document.getElementById('exigencia'),
    notaMin: document.getElementById('notaMin'),
    notaMax: document.getElementById('notaMax'),
    notaAprob: document.getElementById('notaAprob'),
    tablaEscala: document.getElementById('tablaEscala')
  };

  // Verificar si algún elemento no existe
  for (const [nombre, elemento] of Object.entries(elementos)) {
    if (!elemento) {
      console.error(`Error: No se encontró el elemento ${nombre}`);
      return;
    }
  }

  // Obtener valores
  let puntajeMax = elementos.puntajeMax.value ? parseFloat(elementos.puntajeMax.value) : null;
  let exigencia = elementos.exigencia.value ? parseFloat(elementos.exigencia.value) : null;
  let notaMin = elementos.notaMin.value ? parseFloat(elementos.notaMin.value) : null;
  let notaMax = elementos.notaMax.value ? parseFloat(elementos.notaMax.value) : null;
  let notaAprob = elementos.notaAprob.value ? parseFloat(elementos.notaAprob.value) : null;

  // Si algún campo necesario está vacío, limpiar la tabla y retornar
  if (puntajeMax === null || exigencia === null || notaMin === null || notaMax === null || notaAprob === null) {
    elementos.tablaEscala.innerHTML = '';
    return;
  }

  // Validar y ajustar valores
  puntajeMax = Math.max(1, puntajeMax);
  exigencia = Math.min(100, Math.max(1, exigencia));
  
  // Ajustar notas si son de doble dígito
  if (notaMin >= 10) notaMin = notaMin / 10;
  if (notaMax >= 10) notaMax = notaMax / 10;
  if (notaAprob >= 10) notaAprob = notaAprob / 10;
  
  notaMin = Math.max(1, Math.min(7, notaMin));
  notaMax = Math.max(notaMin + 0.1, Math.min(7, notaMax));
  notaAprob = Math.max(notaMin, Math.min(notaMax, notaAprob));

  // Calcular puntaje de aprobación según la fórmula
  const puntajeAprob = puntajeMax * (exigencia / 100);

  let puntajes = [];
  let notas = [];
  
  // Generar puntajes y notas
  for (let puntaje = puntajeMax; puntaje >= 0; puntaje--) {
    let nota;
    if (puntaje < puntajeAprob) {
      nota = notaMin + (puntaje * (notaAprob - notaMin)) / puntajeAprob;
    } else {
      nota = notaAprob + ((puntaje - puntajeAprob) * (notaMax - notaAprob)) / (puntajeMax - puntajeAprob);
    }
    nota = Math.round(nota * 10) / 10;
    nota = Math.max(notaMin, Math.min(notaMax, nota));
    puntajes.push(puntaje);
    notas.push(nota.toFixed(1));
  }

  // Determinar el número de columnas según el ancho de la ventana
  let numColumnas = 5; // Por defecto 5 columnas
  if (window.innerWidth <= 600) {
    numColumnas = 2;
  } else if (window.innerWidth <= 900) {
    numColumnas = 3;
  } else if (window.innerWidth <= 1200) {
    numColumnas = 4;
  }

  // Calcular filas por columna
  const totalPuntajes = puntajes.length;
  const filasPerColumna = Math.ceil(totalPuntajes / numColumnas);

  // Crear columnas balanceadas
  let columnas = [];
  for (let i = 0; i < numColumnas; i++) {
    const inicio = i * filasPerColumna;
    const fin = Math.min(inicio + filasPerColumna, totalPuntajes);
    if (inicio < totalPuntajes) {
      columnas.push({
        puntajes: puntajes.slice(inicio, fin),
        notas: notas.slice(inicio, fin)
      });
    }
  }

  // Construir HTML
  let tablasHtml = columnas.map(col => {
    let filas = '';
    for (let j = 0; j < col.puntajes.length; j++) {
      let nota = parseFloat(col.notas[j]);
      let cellClass = nota >= notaAprob ? "aprob" : "";
      filas += `
        <tr>
          <td>${col.puntajes[j]}</td>
          <td class='${cellClass}'>${col.notas[j]}</td>
        </tr>`;
    }
    return `
      <table>
        <tr>
          <th>Puntaje</th>
          <th>Nota</th>
        </tr>
        ${filas}
      </table>`;
  }).join('');

  elementos.tablaEscala.innerHTML = `<div class="tabla-multi-inner">${tablasHtml}</div>`;
  console.log('Tabla generada exitosamente');
}

// Agregar event listeners para los inputs y resize
document.addEventListener('DOMContentLoaded', function() {
  const inputs = ['puntajeMax', 'exigencia', 'notaMin', 'notaMax', 'notaAprob'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', generarTablaEscala);
      input.addEventListener('blur', function() {
        // Para puntajeMax y exigencia, aplicar valores por defecto al perder el foco
        if (id === 'puntajeMax' || id === 'exigencia') {
          if (this.value === '') {
            // Aplicar valores por defecto solo al perder el foco
            if (id === 'puntajeMax') {
              this.value = '100';
            } else { // exigencia
              this.value = '60';
            }
          } else {
            // Si hay un valor, validarlo
            let valor = parseFloat(this.value);
            if (!isNaN(valor)) {
              if (id === 'puntajeMax') {
                this.value = Math.max(1, valor);
              } else { // exigencia
                this.value = Math.min(100, Math.max(1, valor));
              }
            }
          }
          generarTablaEscala();
            return;
          }

        // Para el resto de los campos, mantener la validación existente
        if (this.value !== '') {
          let valor = parseFloat(this.value);
          switch(id) {
            case 'notaMin': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                this.value = Math.max(1, Math.min(7, valor)).toFixed(1);
              }
              break;
            case 'notaMax': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                const notaMin = parseFloat(document.getElementById('notaMin').value) || 1.0;
                this.value = Math.max(notaMin + 0.1, Math.min(7, valor)).toFixed(1);
              }
              break;
            case 'notaAprob': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                const notaMin = parseFloat(document.getElementById('notaMin').value) || 1.0;
                const notaMax = parseFloat(document.getElementById('notaMax').value) || 7.0;
                this.value = Math.max(notaMin, Math.min(notaMax, valor)).toFixed(1);
              }
              break;
          }
          generarTablaEscala();
        }
      });
    }
  });

  // Regenerar tabla cuando cambie el tamaño de la ventana
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(generarTablaEscala, 250);
  });
  
  // Generar tabla inicial
  generarTablaEscala();
});

// Variable global para el modo actual
let modoTablaActual = 'normal';
let submodoPaesActual = null;

// Configuración predeterminada para cada modo
const configuracionesModo = {
  normal: {
    puntajeMax: 100,
    exigencia: 60,
    notaMin: 1.0,
    notaMax: 7.0,
    notaAprob: 4.0
  },
  paes: {
    'competencia-lectora': {
      puntajeMax: 1000,
      exigencia: 60,
      notaMin: 1.0,
      notaMax: 7.0,
      notaAprob: 4.0
    },
    'm1': {
      puntajeMax: 1000,
      exigencia: 60,
      notaMin: 1.0,
      notaMax: 7.0,
      notaAprob: 4.0
    },
    'm2': {
      puntajeMax: 1000,
      exigencia: 60,
      notaMin: 1.0,
      notaMax: 7.0,
      notaAprob: 4.0
    },
    'ciencias': {
      puntajeMax: 1000,
      exigencia: 60,
      notaMin: 1.0,
      notaMax: 7.0,
      notaAprob: 4.0
    },
    'historia': {
      puntajeMax: 1000,
      exigencia: 60,
      notaMin: 1.0,
      notaMax: 7.0,
      notaAprob: 4.0
    }
  }
};

// Agregar el mapeo de nombres de modos PAES
const modosPaesNombres = {
  'competencia-lectora': 'Competencia Lectora',
  'm1': 'M1 Matemáticas',
  'm2': 'M2 Matemáticas',
  'ciencias': 'Ciencias',
  'historia': 'Historia'
};

// Función para manejar el menú desplegable de PAES - DESHABILITADA
/*
function togglePaesDropdown(event) {
  const dropdown = document.querySelector('.paes-dropdown');
  const button = document.querySelector('.tabla-mode-btn.has-dropdown');
  
  if (event.type === 'click' && event.target.closest('.tabla-mode-btn.has-dropdown')) {
    dropdown.classList.toggle('show');
    button.classList.toggle('active');
  } else if (event.type === 'click' && !event.target.closest('.paes-dropdown') && !event.target.closest('.tabla-mode-btn.has-dropdown')) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
}
*/

// Modificar la función cambiarModoTabla
function cambiarModoTabla(modo, submodo = null) {
  modoTablaActual = modo;
  submodoPaesActual = submodo;
  
  // Actualizar estado visual de los botones
  document.querySelectorAll('.tabla-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === modo);
  });

  // Actualizar el subtítulo del modo PAES - DESHABILITADO
  /*
  const modoActualElement = document.getElementById('modo-actual');
  const modoPaesTexto = document.getElementById('modo-paes-texto');
  
  if (modo === 'paes' && submodo) {
    modoPaesTexto.textContent = modosPaesNombres[submodo] || '';
    modoActualElement.classList.remove('hidden');
    modoActualElement.classList.add('visible');
  } else {
    modoActualElement.classList.remove('visible');
    modoActualElement.classList.add('hidden');
  }

  // Si es modo PAES, actualizar estado del ítem seleccionado
  if (modo === 'paes' && submodo) {
    document.querySelectorAll('.paes-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.paesMode === submodo);
    });
  }
  */
  
  // Valores por defecto
  const defaultConfig = {
    puntajeMax: 100,
    exigencia: 60,
    notaMin: 1.0,
    notaMax: 7.0,
    notaAprob: 4.0
  };

  // Obtener la configuración del modo seleccionado
  let config = { ...defaultConfig };
  
  try {
    if (modo === 'paes' && submodo && configuracionesModo?.paes?.[submodo]) {
      const paesConfig = configuracionesModo.paes[submodo];
      config = {
        puntajeMax: Number(paesConfig?.puntajeMax) || defaultConfig.puntajeMax,
        exigencia: Number(paesConfig?.exigencia) || defaultConfig.exigencia,
        notaMin: Number(paesConfig?.notaMin) || defaultConfig.notaMin,
        notaMax: Number(paesConfig?.notaMax) || defaultConfig.notaMax,
        notaAprob: Number(paesConfig?.notaAprob) || defaultConfig.notaAprob
      };
    } else if (configuracionesModo?.[modo]) {
      const modoConfig = configuracionesModo[modo];
      config = {
        puntajeMax: Number(modoConfig?.puntajeMax) || defaultConfig.puntajeMax,
        exigencia: Number(modoConfig?.exigencia) || defaultConfig.exigencia,
        notaMin: Number(modoConfig?.notaMin) || defaultConfig.notaMin,
        notaMax: Number(modoConfig?.notaMax) || defaultConfig.notaMax,
        notaAprob: Number(modoConfig?.notaAprob) || defaultConfig.notaAprob
      };
    }
  } catch (error) {
    console.warn('Error al cargar la configuración:', error);
    // Mantener los valores por defecto si hay error
  }

  // Asegurarse de que todos los valores sean números válidos
  config.puntajeMax = Math.max(1, Number(config.puntajeMax) || defaultConfig.puntajeMax);
  config.exigencia = Math.min(100, Math.max(1, Number(config.exigencia) || defaultConfig.exigencia));
  config.notaMin = Math.max(1, Math.min(7, Number(config.notaMin) || defaultConfig.notaMin));
  config.notaMax = Math.max(config.notaMin + 0.1, Math.min(7, Number(config.notaMax) || defaultConfig.notaMax));
  config.notaAprob = Math.max(config.notaMin, Math.min(config.notaMax, Number(config.notaAprob) || defaultConfig.notaAprob));

  // Aplicar la configuración a los inputs con validación
  const elementos = {
    puntajeMax: document.getElementById('puntajeMax'),
    exigencia: document.getElementById('exigencia'),
    notaMin: document.getElementById('notaMin'),
    notaMax: document.getElementById('notaMax'),
    notaAprob: document.getElementById('notaAprob')
  };

  // Actualizar los valores solo si los elementos existen
  if (elementos.puntajeMax) elementos.puntajeMax.value = config.puntajeMax;
  if (elementos.exigencia) elementos.exigencia.value = config.exigencia;
  if (elementos.notaMin) elementos.notaMin.value = config.notaMin.toFixed(1);
  if (elementos.notaMax) elementos.notaMax.value = config.notaMax.toFixed(1);
  if (elementos.notaAprob) elementos.notaAprob.value = config.notaAprob.toFixed(1);
  
  // Regenerar la tabla con la nueva configuración
  generarTablaEscala();
}

// Agregar event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Event listeners para los botones de modo (con soporte táctil)
  document.querySelectorAll('.tabla-mode-btn').forEach(btn => {
    if (!btn.classList.contains('has-dropdown')) {
      // Agregar tanto click como touchend para dispositivos táctiles
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarModoTabla(btn.dataset.mode);
      });
      
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cambiarModoTabla(btn.dataset.mode);
      });
    }
  });

  // Event listener específico para el botón PAES con dropdown - DESHABILITADO
  /*
  const paesButton = document.querySelector('.tabla-mode-btn.has-dropdown');
  if (paesButton) {
    function togglePaesDropdownHandler(event) {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = document.querySelector('.paes-dropdown');
      dropdown.classList.toggle('show');
      paesButton.classList.toggle('active');
      
      console.log('PAES button clicked/touched - dropdown show:', dropdown.classList.contains('show'));
    }
    
    paesButton.addEventListener('click', togglePaesDropdownHandler);
    paesButton.addEventListener('touchend', togglePaesDropdownHandler);
  }

  // Event listeners para los items del dropdown de PAES (con soporte táctil)
  document.querySelectorAll('.paes-dropdown-item').forEach(item => {
    function selectPaesMode(event) {
      event.preventDefault();
      event.stopPropagation();
      cambiarModoTabla('paes', item.dataset.paesMode);
      document.querySelector('.paes-dropdown').classList.remove('show');
      document.querySelector('.tabla-mode-btn.has-dropdown').classList.remove('active');
      
      console.log('PAES item selected:', item.dataset.paesMode);
    }
    
    item.addEventListener('click', selectPaesMode);
    item.addEventListener('touchend', selectPaesMode);
  });

  // Cerrar dropdown al hacer click/touch fuera
  document.addEventListener('click', togglePaesDropdown);
  document.addEventListener('touchend', togglePaesDropdown);
  */
});

// Conversor de puntaje a nota
document.addEventListener('DOMContentLoaded', function() {
  const puntajeInput = document.getElementById('puntaje-input');
  const notaResult = document.getElementById('nota-result');

  if (!puntajeInput || !notaResult) return;

  function obtenerConfiguracionModo() {
    const modo = modoTablaActual;
    let config;

    if (modo === 'paes' && submodoPaesActual) {
      config = configuracionesModo.paes[submodoPaesActual];
    } else {
      config = configuracionesModo[modo];
    }

    // Si no hay configuración específica, usar valores por defecto
    return {
      puntajeMax: config?.puntajeMax || 100,
      exigencia: config?.exigencia || 60,
      notaMin: config?.notaMin || 1.0,
      notaMax: config?.notaMax || 7.0,
      notaAprob: config?.notaAprob || 4.0
    };
  }

  function convertirPuntajeANota(puntaje) {
    // Obtener valores actuales de los inputs (si están modificados por el usuario)
    let puntajeMax = document.getElementById('puntajeMax').value ? parseFloat(document.getElementById('puntajeMax').value) : null;
    let exigencia = document.getElementById('exigencia').value ? parseFloat(document.getElementById('exigencia').value) : null;
    let notaMin = document.getElementById('notaMin').value ? parseFloat(document.getElementById('notaMin').value) : null;
    let notaMax = document.getElementById('notaMax').value ? parseFloat(document.getElementById('notaMax').value) : null;
    let notaAprob = document.getElementById('notaAprob').value ? parseFloat(document.getElementById('notaAprob').value) : null;

    // Si algún campo necesario está vacío, retornar mensaje
    if (puntajeMax === null || exigencia === null || notaMin === null || notaMax === null || notaAprob === null) {
      return 'Completa todos los campos';
    }

    // Validar y ajustar valores EXACTAMENTE igual que en generarTablaEscala
    puntajeMax = Math.max(1, puntajeMax);
    exigencia = Math.min(100, Math.max(1, exigencia));
    
    // Ajustar notas si son de doble dígito
    if (notaMin >= 10) notaMin = notaMin / 10;
    if (notaMax >= 10) notaMax = notaMax / 10;
    if (notaAprob >= 10) notaAprob = notaAprob / 10;

    // Validar rangos de notas (EXACTAMENTE igual que en generarTablaEscala)
    notaMin = Math.max(1, Math.min(7, notaMin));
    notaMax = Math.max(notaMin + 0.1, Math.min(7, notaMax));
    notaAprob = Math.max(notaMin, Math.min(notaMax, notaAprob));
    
    if (isNaN(puntaje) || puntaje > puntajeMax || puntaje < 0) {
      return 'Inválido';
    }
    
    // Calcular puntaje de aprobación según la fórmula (EXACTAMENTE igual que en generarTablaEscala)
    const puntajeAprob = puntajeMax * (exigencia / 100);
    let nota;
    
    // Usar la MISMA lógica que en generarTablaEscala
    if (puntaje < puntajeAprob) {
      nota = notaMin + (puntaje * (notaAprob - notaMin)) / puntajeAprob;
    } else {
      nota = notaAprob + ((puntaje - puntajeAprob) * (notaMax - notaAprob)) / (puntajeMax - puntajeAprob);
    }
    
    // APLICAR EL MISMO REDONDEO que en generarTablaEscala
    nota = Math.round(nota * 10) / 10;
    nota = Math.max(notaMin, Math.min(notaMax, nota));
    
    return nota.toFixed(1);
  }

  function actualizarNota() {
    const puntaje = parseFloat(document.getElementById('puntaje-input').value);
    const notaResult = document.getElementById('nota-result');
    
    if (document.getElementById('puntaje-input').value === '') {
      notaResult.textContent = '-.-';
      notaResult.style.color = 'var(--text-light)';
      return;
    }

    const nota = convertirPuntajeANota(puntaje);
    notaResult.textContent = nota;
    
    if (nota === 'Completa las notas' || nota === 'Inválido') {
      notaResult.style.color = 'var(--del-btn-bgg)';
      return;
    }
    
    const notaAprob = document.getElementById('notaAprob').value ? 
      parseFloat(document.getElementById('notaAprob').value) : 4.0;
    
    if (parseFloat(nota) >= (notaAprob >= 10 ? notaAprob / 10 : notaAprob)) {
      notaResult.style.color = 'var(--text-light)';
    } else {
      notaResult.style.color = 'var(--del-btn-bgg)';
    }
  }

  // Event listener para el input de puntaje
  puntajeInput.addEventListener('input', actualizarNota);
  
  // Event listeners para los parámetros
  ['puntajeMax', 'notaMin', 'notaMax', 'exigencia', 'notaAprob'].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.addEventListener('input', actualizarNota);
    }
  });

  // Event listeners para los botones de modo
  document.querySelectorAll('.tabla-mode-btn').forEach(btn => {
    if (!btn.classList.contains('has-dropdown')) {
      btn.addEventListener('click', actualizarNota);
    }
  });

  // Event listeners para los items del dropdown de PAES
  document.querySelectorAll('.paes-dropdown-item').forEach(item => {
    item.addEventListener('click', actualizarNota);
  });
});

// Control de visibilidad de columnas
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-columnas');
  const tablaEscala = document.getElementById('tablaEscala');
  const columnasBtnTexto = toggleBtn.querySelector('.columnas-texto');
  
  let columnasOcultas = localStorage.getItem('columnasOcultas') === 'true';
  
  function actualizarEstadoColumnas() {
    if (columnasOcultas) {
      tablaEscala.classList.add('columnas-ocultas');
      toggleBtn.classList.add('menos');
      columnasBtnTexto.textContent = 'Mostrar tabla';
    } else {
      tablaEscala.classList.remove('columnas-ocultas');
      toggleBtn.classList.remove('menos');
      columnasBtnTexto.textContent = 'Ocultar tabla';
    }
  }
  
  // Aplicar estado inicial
  actualizarEstadoColumnas();
  
  toggleBtn.addEventListener('click', function() {
    columnasOcultas = !columnasOcultas;
    localStorage.setItem('columnasOcultas', columnasOcultas);
    actualizarEstadoColumnas();
  });
});

// Tabla de conversión PAES Competencia Lectora
const tablaPAESCompetencia = {
  0: 100, 1: 186, 2: 210, 3: 232, 4: 253, 5: 271,
  6: 288, 7: 304, 8: 322, 9: 339, 10: 355, 11: 369,
  12: 380, 13: 391, 14: 402, 15: 415, 16: 430, 17: 446,
  18: 460, 19: 471, 20: 479, 21: 486, 22: 494, 23: 502,
  24: 514, 25: 528, 26: 543, 27: 557, 28: 569, 29: 577,
  30: 583, 31: 589, 32: 596, 33: 505, 34: 617, 35: 631,
  36: 647, 37: 660, 38: 671, 39: 680, 40: 687, 41: 694,
  42: 703, 43: 715, 44: 730, 45: 746, 46: 761, 47: 773,
  48: 785, 49: 795, 50: 808, 51: 823, 52: 840, 53: 858,
  54: 876, 55: 893, 56: 911, 57: 931, 58: 954, 59: 978,
  60: 1000
};

// Tabla de conversión PAES M1 Matemáticas
const tablaPAESM1 = {
  0: 100, 1: 173, 2: 199, 3: 222, 4: 244, 5: 265,
  6: 284, 7: 301, 8: 316, 9: 331, 10: 346, 11: 362,
  12: 378, 13: 391, 14: 402, 15: 412, 16: 422, 17: 434,
  18: 447, 19: 462, 20: 476, 21: 487, 22: 496, 23: 503,
  24: 510, 25: 518, 26: 529, 27: 542, 28: 557, 29: 570,
  30: 581, 31: 589, 32: 596, 33: 602, 34: 610, 35: 621,
  36: 634, 37: 648, 38: 662, 39: 674, 40: 683, 41: 691,
  42: 700, 43: 710, 44: 723, 45: 738, 46: 753, 47: 767,
  48: 779, 49: 792, 50: 805, 51: 821, 52: 838, 53: 856,
  54: 875, 55: 894, 56: 915, 57: 938, 58: 964, 59: 992,
  60: 1000
};

// Tabla de conversión PAES M2 Matemáticas
const tablaPAESM2 = {
  0: 100, 1: 161, 2: 192, 3: 220, 4: 245, 5: 268,
  6: 289, 7: 308, 8: 326, 9: 344, 10: 362, 11: 378,
  12: 392, 13: 405, 14: 418, 15: 432, 16: 448, 17: 462,
  18: 475, 19: 486, 20: 495, 21: 506, 22: 519, 23: 533,
  24: 547, 25: 560, 26: 571, 27: 580, 28: 590, 29: 601,
  30: 614, 31: 629, 32: 643, 33: 656, 34: 667, 35: 678,
  36: 690, 37: 704, 38: 719, 39: 735, 40: 750, 41: 765,
  42: 780, 43: 797, 44: 816, 45: 836, 46: 857, 47: 879,
  48: 903, 49: 1000
};

// Tabla de conversión PAES Ciencias
const tablaPAESCiencias = {
  0: 100, 1: 105, 2: 123, 3: 144, 4: 164, 5: 183,
  6: 201, 7: 218, 8: 233, 9: 246, 10: 260, 11: 273,
  12: 288, 13: 301, 14: 313, 15: 324, 16: 332, 17: 341,
  18: 351, 19: 363, 20: 376, 21: 388, 22: 399, 23: 406,
  24: 413, 25: 419, 26: 425, 27: 433, 28: 443, 29: 455,
  30: 467, 31: 478, 32: 487, 33: 494, 34: 499, 35: 503,
  36: 508, 37: 515, 38: 523, 39: 535, 40: 547, 41: 559,
  42: 569, 43: 576, 44: 582, 45: 586, 46: 591, 47: 597,
  48: 606, 49: 616, 50: 629, 51: 641, 52: 652, 53: 660,
  54: 667, 55: 673, 56: 680, 57: 689, 58: 700, 59: 713,
  60: 726, 61: 738, 62: 748, 63: 758, 64: 768, 65: 779,
  66: 793, 67: 808, 68: 823, 69: 838, 70: 853, 71: 870,
  72: 889, 73: 909, 74: 931, 75: 1000
};

// Tabla de conversión PAES Historia
const tablaPAESHistoria = {
  0: 100, 1: 106, 2: 135, 3: 161, 4: 184, 5: 206,
  6: 227, 7: 248, 8: 266, 9: 282, 10: 297, 11: 311,
  12: 327, 13: 344, 14: 360, 15: 374, 16: 385, 17: 395,
  18: 404, 19: 415, 20: 429, 21: 444, 22: 460, 23: 473,
  24: 484, 25: 492, 26: 499, 27: 506, 28: 515, 29: 527,
  30: 542, 31: 557, 32: 572, 33: 583, 34: 591, 35: 598,
  36: 605, 37: 614, 38: 625, 39: 639, 40: 655, 41: 670,
  42: 683, 43: 693, 44: 703, 45: 712, 46: 724, 47: 739,
  48: 756, 49: 772, 50: 788, 51: 802, 52: 817, 53: 834,
  54: 853, 55: 873, 56: 895, 57: 917, 58: 941, 59: 968,
  60: 1000
};

// Función para mostrar la tabla PAES según el modo
function mostrarTablaPAES() {
  const modo = submodoPaesActual;
  let tabla;
  let titulo;
  
  switch(modo) {
    case 'competencia-lectora':
      tabla = tablaPAESCompetencia;
      titulo = 'Competencia Lectora';
      break;
    case 'm1':
      tabla = tablaPAESM1;
      titulo = 'M1 Matemáticas';
      break;
    case 'm2':
      tabla = tablaPAESM2;
      titulo = 'M2 Matemáticas';
      break;
    case 'ciencias':
      tabla = tablaPAESCiencias;
      titulo = 'Ciencias';
      break;
    case 'historia':
      tabla = tablaPAESHistoria;
      titulo = 'Historia';
      break;
    default:
      return;
  }
  
  const tablaContainer = document.createElement('div');
  tablaContainer.className = 'tabla-paes-container';
  tablaContainer.innerHTML = `
    <h3>Tabla de Conversión - ${titulo}</h3>
    <div class="tabla-paes-scroll">
      <table class="tabla-paes">
        <thead>
          <tr>
            <th>Respuestas Correctas</th>
            <th>Puntaje PAES</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(tabla)
            .map(([correctas, puntaje]) => `
              <tr>
                <td>${correctas}</td>
                <td>${puntaje}</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  const tablaPAESExistente = document.querySelector('.tabla-paes-container');
  if (tablaPAESExistente) {
    tablaPAESExistente.remove();
  }
  
  document.querySelector('.main').appendChild(tablaContainer);
}

// Función para calcular puntaje PAES según el modo
function calcularPuntajePAES(respuestasCorrectas) {
  let tabla;
  switch(submodoPaesActual) {
    case 'competencia-lectora':
      tabla = tablaPAESCompetencia;
      break;
    case 'm1':
      tabla = tablaPAESM1;
      break;
    case 'm2':
      tabla = tablaPAESM2;
      break;
    case 'ciencias':
      tabla = tablaPAESCiencias;
      break;
    case 'historia':
      tabla = tablaPAESHistoria;
      break;
    default:
      return 100;
  }
  return tabla[respuestasCorrectas] || 100;
}

// Conversor de respuestas a puntaje PAES
document.addEventListener('DOMContentLoaded', function() {
  const respuestasInput = document.getElementById('respuestas-input');
  const puntajePaesResult = document.getElementById('puntaje-paes-result');
  const conversorPaes = document.getElementById('conversor-paes');

  if (!respuestasInput || !puntajePaesResult || !conversorPaes) return;

  function actualizarPuntajePaes() {
    const respuestas = parseInt(respuestasInput.value);
    
    if (respuestasInput.value === '' || isNaN(respuestas)) {
      puntajePaesResult.textContent = '-';
      puntajePaesResult.style.color = 'var(--text-light)';
      return;
    }

    let maxRespuestas;
    switch(submodoPaesActual) {
      case 'm2':
        maxRespuestas = 49;
        break;
      case 'ciencias':
        maxRespuestas = 75;
        break;
      case 'historia':
      case 'competencia-lectora':
      case 'm1':
        maxRespuestas = 60;
        break;
      default:
        maxRespuestas = 60;
    }

    if (respuestas < 0 || respuestas > maxRespuestas) {
      puntajePaesResult.textContent = 'Inválido';
      puntajePaesResult.style.color = 'var(--del-btn-bgg)';
      return;
    }

    let tabla;
    switch(submodoPaesActual) {
      case 'competencia-lectora':
        tabla = tablaPAESCompetencia;
        break;
      case 'm1':
        tabla = tablaPAESM1;
        break;
      case 'm2':
        tabla = tablaPAESM2;
        break;
      case 'ciencias':
        tabla = tablaPAESCiencias;
        break;
      case 'historia':
        tabla = tablaPAESHistoria;
        break;
      default:
        return;
    }
    
    const puntaje = tabla[respuestas];
    puntajePaesResult.textContent = puntaje;
    
    if (puntaje >= 500) {
      puntajePaesResult.style.color = 'var(--text-light)';
    } else {
      puntajePaesResult.style.color = 'var(--del-btn-bgg)';
    }
  }

  // Event listener para el input de respuestas
  respuestasInput.addEventListener('input', actualizarPuntajePaes);

  // Mostrar/ocultar el conversor según el modo
  function actualizarVisibilidadConversor() {
    if (modoTablaActual === 'paes' && (submodoPaesActual === 'competencia-lectora' || submodoPaesActual === 'm1' || submodoPaesActual === 'm2' || submodoPaesActual === 'ciencias' || submodoPaesActual === 'historia')) {
      conversorPaes.style.display = 'block';
      // Actualizar el placeholder según el modo
      let maxRespuestas;
      switch(submodoPaesActual) {
        case 'm2':
          maxRespuestas = 49;
          break;
        case 'ciencias':
          maxRespuestas = 75;
          break;
        case 'historia':
        case 'competencia-lectora':
        case 'm1':
          maxRespuestas = 60;
          break;
        default:
          maxRespuestas = 60;
      }
      respuestasInput.placeholder = `0-${maxRespuestas}`;
      respuestasInput.max = maxRespuestas;
    } else {
      conversorPaes.style.display = 'none';
    }
  }

  // Event listeners para los botones de modo
  document.querySelectorAll('.tabla-mode-btn').forEach(btn => {
    if (!btn.classList.contains('has-dropdown')) {
      btn.addEventListener('click', actualizarVisibilidadConversor);
    }
  });

  // Event listeners para los items del dropdown de PAES
  document.querySelectorAll('.paes-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      actualizarVisibilidadConversor();
      actualizarPuntajePaes(); // Actualizar el resultado cuando cambie el modo
    });
  });

  // Inicializar visibilidad
  actualizarVisibilidadConversor();
});

// Modificar la función existente de cambio de modo
document.querySelectorAll('.paes-dropdown-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const modo = this.dataset.paesMode;
    if (modo === 'competencia-lectora' || modo === 'm1' || modo === 'm2' || modo === 'ciencias' || modo === 'historia') {
      // Mostrar la tabla PAES
      mostrarTablaPAES();
      // Cambiar el modo de la calculadora
      document.querySelector('.modo-actual').classList.add('visible');
    } else {
      // Ocultar la tabla si existe
      const tablaPAES = document.querySelector('.tabla-paes-container');
      if (tablaPAES) {
        tablaPAES.remove();
      }
    }
  });
});

// Función para cambiar entre modos
function cambiarModo(modo) {
  const paesInput = document.getElementById('paes-input');
  const notasNormales = document.getElementById('notas-normales');
  const tablaPAES = document.querySelector('.tabla-paes-container');

  if (modo === 'competencia-lectora' || modo === 'm1' || modo === 'm2' || modo === 'ciencias' || modo === 'historia') {
    paesInput.style.display = 'block';
    notasNormales.style.display = 'none';
    mostrarTablaPAES();
  } else {
    paesInput.style.display = 'none';
    notasNormales.style.display = 'block';
    if (tablaPAES) {
      tablaPAES.remove();
    }
  }
}

// Funciones para la calculadora de múltiples promedios
let sectionCounter = 0;

function addSection() {
  sectionCounter++;
  const section = document.createElement('div');
  section.className = 'section-panel';
  section.id = `section-${sectionCounter}`;
  
  section.innerHTML = `
    <div class="section-header">
      <div class="section-title">Estudiante ${sectionCounter}</div>
      <div class="section-title-container" style="display: flex; align-items: center; gap: 8px;">
        <div class="section-title" style="margin-right: 0;">Estudiante ${sectionCounter}</div>
        <button class="btn-edit-name" onclick="editSectionName(this.previousElementSibling)" style="background: none; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; color: var(--text-light); opacity: 0.7; transition: opacity 0.2s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      <div class="section-result">Promedio: <span>0.00</span></div>
    </div>
    <div class="section-controls">
      <button class="btn-add" onclick="addRowToSection(this)">+</button>
      <button class="btn-remove" onclick="removeRowFromSection(this)">-</button>
      <button class="btn-reset" onclick="resetSection(this)">↻</button>
    </div>
    <div class="section-rows-container">
      <div class="section-row">
        <input type="number" class="grade" step="0.1" min="1" max="7">
        <input type="number" class="weight" min="1" max="100">
        <div class="percent">%</div>
      </div>
    </div>
  `;
  document.getElementById('sections-container').appendChild(section);
}

function removeSection() {
  const sections = document.getElementById('sections-container');
  if (sections.children.length > 1) {
    sections.removeChild(sections.lastChild);
    sectionCounter--;
  } else {
    alert('Debe quedar al menos una Estudiante.');
  }
}

function addRowToSection(btn) {
  const container = btn.closest('.section-panel').querySelector('.section-rows-container');
  const row = document.createElement('div');
  row.className = 'section-row';
  row.innerHTML = `
    <input type="number" class="grade" step="0.1" min="1" max="7">
    <input type="number" class="weight" min="1" max="100">
    <div class="percent">%</div>
  `;
  container.appendChild(row);
}

function removeRowFromSection(btn) {
  const container = btn.closest('.section-panel').querySelector('.section-rows-container');
  const rows = container.querySelectorAll('.section-row');
  if (rows.length > 1) {
    container.removeChild(rows[rows.length - 1]);
  } else {
    alert('Debe quedar al menos una fila.');
  }
}

function resetSection(btn) {
  const container = btn.closest('.section-panel').querySelector('.section-rows-container');
  const rows = container.querySelectorAll('.section-row');
  rows.forEach(row => {
    row.querySelector('.grade').value = '';
    row.querySelector('.weight').value = '';
  });
  updateSectionAverage(container.closest('.section-panel'));
}

function updateSectionAverage(section) {
  let total = 0;
  let sum = 0;
  const rows = section.querySelectorAll('.section-row');
  
  rows.forEach(row => {
    let g = row.querySelector('.grade').value;
    let w = row.querySelector('.weight').value;
    g = parseFloat(g);
    w = parseFloat(w);
    
    if (!isNaN(g) && !isNaN(w)) {
      if (g >= 10) g /= 10;
      total += w;
      sum += g * w;
    }
  });
  
  const avg = total > 0 ? (sum / total).toFixed(2) : '0.00';
  section.querySelector('.section-result span').textContent = avg;
  return { average: parseFloat(avg), total };
}

// Variable global para controlar si se está aplicando porcentaje
window.aplicandoPorcentaje = false;

// Variable global para controlar si se está aplicando cantidad de notas
window.aplicandoCantidadNotas = false;

function aplicarPorcentajeComun() {
  const porcentaje = parseInt(document.getElementById('porcentaje-comun').value);
  // Si el valor no es válido, no hacer nada
  if (isNaN(porcentaje) || porcentaje < 1 || porcentaje > 100) {
    return;
  }

  window.aplicandoPorcentaje = true;
  const sections = document.querySelectorAll('.section-panel');
  sections.forEach(section => {
    const weightInputs = section.querySelectorAll('.weight');
    const cantidadNotas = weightInputs.length;
    
    // Si hay notas, distribuir el porcentaje
    if (cantidadNotas > 0) {
      // Distribución simple y exacta
      const parteEntera = Math.floor(porcentaje / cantidadNotas);
      const resto = porcentaje % cantidadNotas;
      
      weightInputs.forEach((input, index) => {
        // Las primeras 'resto' notas reciben 1 punto adicional
        input.value = parteEntera + (index < resto ? 1 : 0);
      });
        
        // Disparar evento de input para actualizar cálculos
      weightInputs.forEach(input => {
        const event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(event);
      });
    }
  });

  // Actualizar los promedios con delay para evitar alertas
  setTimeout(() => {
    calculateMultipleAverages();
    // Desactivar variable de control DESPUÉS de calcular promedios
    setTimeout(() => {
      window.aplicandoPorcentaje = false;
    }, 50);
  }, 100);
}

function calculateMultipleAverages() {
  const sections = document.querySelectorAll('.section-panel');
  let totalWeight = 0;
  let weightedSum = 0;
  let allValid = true;
  
  sections.forEach(section => {
    const { average, total } = updateSectionAverage(section);
    if (total !== 100 && !window.aplicandoPorcentaje && !window.aplicandoCantidadNotas) {
      allValid = false;
      alert(`La suma de las ponderaciones en la ${section.querySelector('.section-title').textContent} debe ser 100%.`);
      return;
    }
    if (!isNaN(average)) {
      weightedSum += average;
      totalWeight++;
    }
  });

  if (!allValid) return;

  const finalAverage = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '0.00';
  const resultPanel = document.getElementById('multi-result-panel');
  const resultValue = document.getElementById('multi-result-value');
  const resultStatus = document.getElementById('multi-result-status');
  
  animateNumber(resultValue, parseFloat(resultValue.textContent), parseFloat(finalAverage));
  
  if (parseFloat(finalAverage) >= 4.0) {
    resultPanel.className = 'result-panel blue';
    resultStatus.textContent = 'Aprobado';
  } else {
    resultPanel.className = 'result-panel red';
    resultStatus.textContent = 'Reprobado';
  }
}

// Inicializar la primera sección al cargar
document.addEventListener('DOMContentLoaded', function() {
  // Agregar event listener para el menú de múltiples promedios
  const menuMulti = document.getElementById('menu-multi');
  const sectionsContainer = document.getElementById('sections-container');
  
  if (menuMulti) {
    menuMulti.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = 'multi';
      document.getElementById('calc-panel').style.display = "none";
      document.getElementById('escala-panel').style.display = "none";
      document.getElementById('multi-panel').style.display = "block";
    this.classList.add('active');
      document.getElementById('menu-calculadora').classList.remove('active');
      document.getElementById('menu-escala').classList.remove('active');
      
      // Si no hay secciones, agregar la primera
      if (sectionsContainer && sectionsContainer.children.length === 0) {
        addSection();
      }
    });
  }
  
  // Agregar el event listener para el manejo de inputs en la calculadora múltiple
  if (sectionsContainer) {
    sectionsContainer.addEventListener('input', function(e) {
      const target = e.target;
      if (target.classList.contains('grade')) {
        target.value = target.value.replace(/\D/g, '');
        let v = parseInt(target.value, 10);
        if (isNaN(v)) v = '';
        else if (v < 1) v = 1;
        else if (v > 99) v = 99;
        target.value = v ? v : '';

        // Si el valor tiene 2 dígitos, mover al siguiente input
        if (target.value.length === 2) {
          const currentRow = target.closest('.section-row');
          const nextRow = currentRow.nextElementSibling;
          if (nextRow) {
            const nextInput = nextRow.querySelector('.grade');
            if (nextInput) {
              nextInput.focus();
      }
          }
        }
      }
      if (target.classList.contains('weight')) {
        target.value = target.value.replace(/\D/g, '');
        let v = parseInt(target.value, 10);
        if (isNaN(v)) v = '';
        else if (v < 1) v = 1;
        else if (v > 100) v = 100;
        target.value = v ? v : '';
    }
    });
  }

  // Actualizar event listeners
  window.addEventListener('hashchange', initializePanels);
  initializePanels();

  // Gestión de cursos y estudiantes
  let cursosData = {};

  // Función para inicializar la configuración
  function initConfig() {
      const configBtn = document.getElementById('menu-config');
      const configPanel = document.getElementById('config-panel');
      const btnCargarExcel = document.getElementById('btn-cargar-excel');
      const btnDescargarPlantilla = document.getElementById('btn-descargar-plantilla');

      // Cargar datos guardados
      cursosData = JSON.parse(localStorage.getItem('cursosData') || '{}');

      // Event Listeners
      configBtn.addEventListener('click', () => {
          hideAllPanels();
          configPanel.classList.add('visible');
          actualizarListaCursos();
      });

      btnCargarExcel.addEventListener('click', cargarExcelEstudiantes);
      btnDescargarPlantilla.addEventListener('click', descargarPlantillaExcel);
  }

  // Función para cargar el archivo Excel
  async function cargarExcelEstudiantes() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      
      input.onchange = async function(e) {
          const file = e.target.files[0];
          if (file) {
              try {
                  const data = await leerExcelEstudiantes(file);
                  guardarDatosCurso(data);
                  actualizarListaCursos();
              } catch (error) {
                  alert('Error al procesar el archivo: ' + error.message);
              }
          }
      };
      
      input.click();
  }

  // Función para leer el archivo Excel
  async function leerExcelEstudiantes(file) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validar estructura del Excel
      if (!jsonData.length || !jsonData[0].hasOwnProperty('Nombre') || !jsonData[0].hasOwnProperty('Curso')) {
          throw new Error('El archivo no tiene el formato correcto');
      }

      return jsonData;
  }

  // Función para guardar los datos del curso
  function guardarDatosCurso(data) {
      // Agrupar estudiantes por curso
      const cursos = {};
      data.forEach(estudiante => {
          if (!cursos[estudiante.Curso]) {
              cursos[estudiante.Curso] = [];
          }
          cursos[estudiante.Curso].push({
              nombre: estudiante.Nombre,
              id: estudiante.ID || ''
          });
      });

      // Actualizar datos
      cursosData = {...cursosData, ...cursos};
      localStorage.setItem('cursosData', JSON.stringify(cursosData));
  }

  // Función para actualizar la lista de cursos en la interfaz
  function actualizarListaCursos() {
      const listaCursos = document.getElementById('lista-cursos');
      listaCursos.innerHTML = '';

      Object.keys(cursosData).forEach(curso => {
          const cursoElement = document.createElement('div');
          cursoElement.className = 'curso-item';
          cursoElement.innerHTML = `
              <span>${curso} (${cursosData[curso].length} estudiantes)</span>
              <button class="btn-eliminar" onclick="eliminarCurso('${curso}')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
              </button>
          `;
          listaCursos.appendChild(cursoElement);
      });
  }

  // Función para eliminar un curso
  function eliminarCurso(curso) {
      if (confirm(`¿Estás seguro de eliminar el curso ${curso}?`)) {
          delete cursosData[curso];
          localStorage.setItem('cursosData', JSON.stringify(cursosData));
          actualizarListaCursos();
      }
  }

  // Función para descargar la plantilla Excel
  function descargarPlantillaExcel() {
      const ws = XLSX.utils.aoa_to_sheet([
          ['ID', 'Nombre', 'Curso'],
          ['1', 'Ejemplo Estudiante', '8°A'],
      ]);
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
      
      XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
  }

  // Modificar la función existente de inicialización
  document.addEventListener('DOMContentLoaded', function() {
      // ... código existente ...
      initConfig();
  });
});

function generarTablaEscala() {
  console.log('Generando tabla de escala...');
  
  // Verificar que todos los elementos existan
  const elementos = {
    puntajeMax: document.getElementById('puntajeMax'),
    exigencia: document.getElementById('exigencia'),
    notaMin: document.getElementById('notaMin'),
    notaMax: document.getElementById('notaMax'),
    notaAprob: document.getElementById('notaAprob'),
    tablaEscala: document.getElementById('tablaEscala')
  };

  // Verificar si algún elemento no existe
  for (const [nombre, elemento] of Object.entries(elementos)) {
    if (!elemento) {
      console.error(`Error: No se encontró el elemento ${nombre}`);
      return;
    }
  }

  // Obtener valores
  let puntajeMax = elementos.puntajeMax.value ? parseFloat(elementos.puntajeMax.value) : null;
  let exigencia = elementos.exigencia.value ? parseFloat(elementos.exigencia.value) : null;
  let notaMin = elementos.notaMin.value ? parseFloat(elementos.notaMin.value) : null;
  let notaMax = elementos.notaMax.value ? parseFloat(elementos.notaMax.value) : null;
  let notaAprob = elementos.notaAprob.value ? parseFloat(elementos.notaAprob.value) : null;

  // Si algún campo necesario está vacío, limpiar la tabla y retornar
  if (puntajeMax === null || exigencia === null || notaMin === null || notaMax === null || notaAprob === null) {
    elementos.tablaEscala.innerHTML = '';
    return;
  }

  // Validar y ajustar valores
  puntajeMax = Math.max(1, puntajeMax);
  exigencia = Math.min(100, Math.max(1, exigencia));
  
  // Ajustar notas si son de doble dígito
  if (notaMin >= 10) notaMin = notaMin / 10;
  if (notaMax >= 10) notaMax = notaMax / 10;
  if (notaAprob >= 10) notaAprob = notaAprob / 10;
  
  notaMin = Math.max(1, Math.min(7, notaMin));
  notaMax = Math.max(notaMin + 0.1, Math.min(7, notaMax));
  notaAprob = Math.max(notaMin, Math.min(notaMax, notaAprob));

  // Calcular puntaje de aprobación según la fórmula
  const puntajeAprob = puntajeMax * (exigencia / 100);

  let puntajes = [];
  let notas = [];
  
  // Generar puntajes y notas
  for (let puntaje = puntajeMax; puntaje >= 0; puntaje--) {
    let nota;
    if (puntaje < puntajeAprob) {
      nota = notaMin + (puntaje * (notaAprob - notaMin)) / puntajeAprob;
    } else {
      nota = notaAprob + ((puntaje - puntajeAprob) * (notaMax - notaAprob)) / (puntajeMax - puntajeAprob);
    }
    nota = Math.round(nota * 10) / 10;
    nota = Math.max(notaMin, Math.min(notaMax, nota));
    puntajes.push(puntaje);
    notas.push(nota.toFixed(1));
  }

  // Determinar el número de columnas según el ancho de la ventana
  let numColumnas = 5; // Por defecto 5 columnas
  if (window.innerWidth <= 600) {
    numColumnas = 2;
  } else if (window.innerWidth <= 900) {
    numColumnas = 3;
  } else if (window.innerWidth <= 1200) {
    numColumnas = 4;
  }

  // Calcular filas por columna
  const totalPuntajes = puntajes.length;
  const filasPerColumna = Math.ceil(totalPuntajes / numColumnas);

  // Crear columnas balanceadas
  let columnas = [];
  for (let i = 0; i < numColumnas; i++) {
    const inicio = i * filasPerColumna;
    const fin = Math.min(inicio + filasPerColumna, totalPuntajes);
    if (inicio < totalPuntajes) {
      columnas.push({
        puntajes: puntajes.slice(inicio, fin),
        notas: notas.slice(inicio, fin)
      });
    }
  }

  // Construir HTML
  let tablasHtml = columnas.map(col => {
    let filas = '';
    for (let j = 0; j < col.puntajes.length; j++) {
      let nota = parseFloat(col.notas[j]);
      let cellClass = nota >= notaAprob ? "aprob" : "";
      filas += `
        <tr>
          <td>${col.puntajes[j]}</td>
          <td class='${cellClass}'>${col.notas[j]}</td>
        </tr>`;
    }
    return `
      <table>
        <tr>
          <th>Puntaje</th>
          <th>Nota</th>
        </tr>
        ${filas}
      </table>`;
  }).join('');

  elementos.tablaEscala.innerHTML = `<div class="tabla-multi-inner">${tablasHtml}</div>`;
  console.log('Tabla generada exitosamente');
}

// Agregar event listeners para los inputs y resize
document.addEventListener('DOMContentLoaded', function() {
  const inputs = ['puntajeMax', 'exigencia', 'notaMin', 'notaMax', 'notaAprob'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', generarTablaEscala);
      input.addEventListener('blur', function() {
        // Para puntajeMax y exigencia, aplicar valores por defecto al perder el foco
        if (id === 'puntajeMax' || id === 'exigencia') {
          if (this.value === '') {
            // Aplicar valores por defecto solo al perder el foco
            if (id === 'puntajeMax') {
              this.value = '100';
            } else { // exigencia
              this.value = '60';
            }
          } else {
            // Si hay un valor, validarlo
            let valor = parseFloat(this.value);
            if (!isNaN(valor)) {
              if (id === 'puntajeMax') {
                this.value = Math.max(1, valor);
              } else { // exigencia
                this.value = Math.min(100, Math.max(1, valor));
              }
            }
          }
          generarTablaEscala();
            return;
          }

        // Para el resto de los campos, mantener la validación existente
        if (this.value !== '') {
          let valor = parseFloat(this.value);
          switch(id) {
            case 'notaMin': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                this.value = Math.max(1, Math.min(7, valor)).toFixed(1);
              }
              break;
            case 'notaMax': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                const notaMin = parseFloat(document.getElementById('notaMin').value) || 1.0;
                this.value = Math.max(notaMin + 0.1, Math.min(7, valor)).toFixed(1);
              }
              break;
            case 'notaAprob': 
              if (!isNaN(valor)) {
                if (valor >= 10) valor = valor / 10;
                const notaMin = parseFloat(document.getElementById('notaMin').value) || 1.0;
                const notaMax = parseFloat(document.getElementById('notaMax').value) || 7.0;
                this.value = Math.max(notaMin, Math.min(notaMax, valor)).toFixed(1);
              }
              break;
          }
          generarTablaEscala();
        }
      });
    }
  });

  // Regenerar tabla cuando cambie el tamaño de la ventana
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(generarTablaEscala, 250);
  });
  
  // Generar tabla inicial
  generarTablaEscala();
});

// Función para compatibilidad con llamadas del menú lateral (ahora solo registra en consola)
function updateActiveMenuItem(menuId) {
  // Esta función mantiene compatibilidad con código existente
  // En el nuevo dashboard no es necesaria, pero evita errores
  console.log('Menu item activado:', menuId);
}
