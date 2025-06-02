// Calculadora de Promedio Ponderado - JavaScript
// Variables globales
const container = document.getElementById('rows-container');
const saveBtn = document.getElementById('saveTpl');
const select = document.getElementById('tplSelect');
const delBtn = document.getElementById('delTpl');

let initial = [];

// Funciones de gestión de filas
function initRows() { 
  for(let i=0;i<4;i++) addRow(); 
  initial = Array.from(container.children).map(r=>r.innerHTML); 
}

function addRow(data) { 
  const row = document.createElement('div'); 
  row.className='row'; 
  row.innerHTML = data || `<input type="number" class="grade" step="0.1" min="1" max="7"><input type="number" class="weight" min="1" max="100"><div class="percent">%</div>`; 
  container.appendChild(row); 
}

function removeRow() { 
  const rows=container.querySelectorAll('.row'); 
  if(rows.length>1) container.removeChild(rows[rows.length-1]); 
  else alert('Debe quedar al menos una fila.'); 
}

function resetAll() { 
  container.innerHTML=''; 
  initial.forEach(html=>{
    const r=document.createElement('div');
    r.className='row';
    r.innerHTML=html;
    container.appendChild(r);
  }); 
}

// Funciones de plantillas/ramos
function saveTemplate() { 
  const name=document.getElementById('tplName').value.trim(); 
  if(!name)return alert('Nombre requerido'); 
  const data=Array.from(container.children).map(r=>({
    grade:r.querySelector('.grade').value,
    weight:r.querySelector('.weight').value
  })); 
  const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); 
  tpl[name]=data; 
  localStorage.setItem('templates',JSON.stringify(tpl)); 
  loadTemplates(); 
}

function loadTemplates() { 
  select.innerHTML='<option value="">Seleccionar ramo</option>'; 
  const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); 
  Object.keys(tpl).forEach(name=>select.innerHTML+=`<option value="${name}">${name}</option>`); 
}

function applyTemplate() { 
  const name=select.value; 
  if(!name)return; 
  resetAll(); 
  const tpl=JSON.parse(localStorage.getItem('templates'))[name]; 
  container.innerHTML=''; 
  tpl.forEach(({grade,weight})=>addRow(`<input type="number" class="grade" value="${grade}" step="0.1" min="1" max="7"><input type="number" class="weight" value="${weight}" min="1" max="100"><div class="percent">%</div>`)); 
}

function deleteTemplate() { 
  const name=select.value; 
  if(!name)return; 
  const tpl=JSON.parse(localStorage.getItem('templates')||'{}'); 
  delete tpl[name]; 
  localStorage.setItem('templates',JSON.stringify(tpl)); 
  loadTemplates(); 
}

// Función de animación de números
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

// Función principal de cálculo
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

// Función para mostrar errores
function showError(msg) {
  const panel = document.getElementById('result-panel');
  panel.className = 'result-panel red';
  document.getElementById('result-value').textContent = "-";
  document.getElementById('result-status').textContent = msg;
}

// Función para cambiar tema
function setTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-rosa', 'theme-oscuro');
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);
  
  // Actualizar botones activos
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
}

// Función PAES (si se necesita)
function calcularPuntajePAES() {
  const respuestas = parseInt(document.getElementById('respuestas-correctas').value);
  if (isNaN(respuestas) || respuestas < 0 || respuestas > 60) {
    alert('Ingrese un número válido entre 0 y 60');
    return;
  }
  
  // Conversión simplificada de respuestas correctas a puntaje PAES
  // Esta es una aproximación básica
  let puntaje = Math.round(150 + (respuestas / 60) * 700);
  if (puntaje > 850) puntaje = 850;
  if (puntaje < 150) puntaje = 150;
  
  alert(`Respuestas correctas: ${respuestas}\nPuntaje PAES aproximado: ${puntaje}`);
}

// Event Listeners para plantillas
if (saveBtn) {
  saveBtn.addEventListener('click', function() {
    saveTemplate();
    // Oculta el panel de ramos
    const panel = document.getElementById('ramo-panel');
    if (panel) {
      panel.style.display = 'none';
      const showBtn = document.getElementById('show-ramo-panel');
      if (showBtn) showBtn.style.display = '';
    }
  });
}

if (select) {
  select.addEventListener('change', applyTemplate);
}

if (delBtn) {
  delBtn.addEventListener('click', deleteTemplate);
}

// Event Listeners para el panel de ramos
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar/ocultar panel de ramos
  const showRamoBtn = document.getElementById('show-ramo-panel');
  const hideRamoBtn = document.getElementById('hide-ramo-panel');
  const ramoPanel = document.getElementById('ramo-panel');
  
  if (showRamoBtn) {
    showRamoBtn.addEventListener('click', function() {
      if (ramoPanel) {
        ramoPanel.style.display = 'block';
        showRamoBtn.style.display = 'none';
      }
    });
  }
  
  if (hideRamoBtn) {
    hideRamoBtn.addEventListener('click', function() {
      if (ramoPanel) {
        ramoPanel.style.display = 'none';
        if (showRamoBtn) showRamoBtn.style.display = '';
      }
    });
  }

  // Inicialización
  if (container) {
    initRows();
    loadTemplates();
  }
  
  // Aplicar tema guardado
  const savedTheme = localStorage.getItem('theme') || 'theme-dark';
  setTheme(savedTheme);
  
  // Event listeners para botones de tema (si existen)
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setTheme(this.dataset.theme);
    });
  });
  
  // Auto-cálculo al cambiar valores (opcional)
  if (container) {
    container.addEventListener('input', function() {
      // Debounce para evitar cálculos excesivos
      clearTimeout(container.autoCalcTimeout);
      container.autoCalcTimeout = setTimeout(() => {
        // Solo auto-calcular si hay datos suficientes
        const rows = container.querySelectorAll('.row');
        let hasData = false;
        rows.forEach(row => {
          const grade = row.querySelector('.grade').value;
          const weight = row.querySelector('.weight').value;
          if (grade && weight) hasData = true;
        });
        if (hasData) {
          // calculateAverage(); // Descomenta si quieres auto-cálculo
        }
      }, 1500);
    });
  }
  
  // Atajos de teclado
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
      switch(e.key) {
        case 'Enter':
          e.preventDefault();
          calculateAverage();
          break;
        case 'r':
          e.preventDefault();
          resetAll();
          break;
        case '=':
        case '+':
          e.preventDefault();
          addRow();
          break;
        case '-':
          e.preventDefault();
          removeRow();
          break;
      }
    }
  });
}); 