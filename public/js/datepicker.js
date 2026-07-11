/* ════════════════════════════════════════════════════════
   datepicker.js  –  Calendario personalizado con hora
   
   Uso: abrirDatepicker(inputId, callbackGuardar)
   Ejemplo: abrirDatepicker('t_fecha', (fecha, hora) => { ... })
   ════════════════════════════════════════════════════════ */

function abrirDatepicker(inputId, callback) {
  const inputEl = document.getElementById(inputId);
  const valor = inputEl.value || '';
  
  // Parsear valor anterior si existe (formato: "01/01/2026 14:30")
  let fecha = new Date();
  let hora = '08:00';
  
  if (valor) {
    const match = valor.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (match) {
      fecha = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      hora = match[4] + ':' + match[5];
    }
  }

  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'datepicker-modal';
  modal.id = 'datepicker-modal-' + inputId;

  const content = document.createElement('div');
  content.className = 'datepicker-content';

  /* ── Encabezado con mes/año ────────────────────────── */
  const header = document.createElement('div');
  header.className = 'datepicker-header';

  const btnPrev = document.createElement('button');
  btnPrev.textContent = '◀';
  btnPrev.className = 'datepicker-nav-btn';
  btnPrev.onclick = () => cambiarMes(-1);

  const monthYear = document.createElement('div');
  monthYear.className = 'datepicker-month-year';
  monthYear.id = 'datepicker-month-year-' + inputId;

  const btnNext = document.createElement('button');
  btnNext.textContent = '▶';
  btnNext.className = 'datepicker-nav-btn';
  btnNext.onclick = () => cambiarMes(1);

  header.appendChild(btnPrev);
  header.appendChild(monthYear);
  header.appendChild(btnNext);

  /* ── Botones Hoy y otros ───────────────────────────── */
  const botones = document.createElement('div');
  botones.className = 'datepicker-buttons';

  const btnHoy = document.createElement('button');
  btnHoy.textContent = 'Hoy';
  btnHoy.className = 'datepicker-btn-hoy';
  btnHoy.onclick = () => {
    fecha = new Date();
    renderCalendar();
  };

  botones.appendChild(btnHoy);
  content.appendChild(header);
  content.appendChild(botones);

  /* ── Tabla de días ─────────────────────────────────── */
  const tabla = document.createElement('table');
  tabla.className = 'datepicker-tabla';
  tabla.id = 'datepicker-tabla-' + inputId;

  // Encabezado de días de semana
  const encabezado = tabla.createTHead();
  const fila = encabezado.insertRow(0);
  const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  dias.forEach(dia => {
    const th = document.createElement('th');
    th.textContent = dia;
    fila.appendChild(th);
  });

  const tbody = tabla.createTBody();
  tbody.id = 'datepicker-tbody-' + inputId;

  content.appendChild(tabla);

  /* ── Selector de hora ──────────────────────────────── */
  const timeDiv = document.createElement('div');
  timeDiv.className = 'datepicker-time';

  const labelHora = document.createElement('label');
  labelHora.textContent = 'Hora: ';

  const inputHora = document.createElement('input');
  inputHora.type = 'time';
  inputHora.className = 'datepicker-hora-input';
  inputHora.value = hora;
  inputHora.id = 'datepicker-hora-' + inputId;

  timeDiv.appendChild(labelHora);
  timeDiv.appendChild(inputHora);
  content.appendChild(timeDiv);

  /* ── Botones de acción ─────────────────────────────── */
  const acciones = document.createElement('div');
  acciones.className = 'datepicker-acciones';

  const btnGuardar = document.createElement('button');
  btnGuardar.textContent = 'Guardar';
  btnGuardar.className = 'datepicker-btn-guardar';
  btnGuardar.onclick = () => {
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yyyy = fecha.getFullYear();
    const horaVal = document.getElementById('datepicker-hora-' + inputId).value;
    
    inputEl.value = `${dd}/${mm}/${yyyy} ${horaVal}`;
    if (callback) callback(`${dd}/${mm}/${yyyy}`, horaVal);
    cerrarDatepicker(inputId);
  };

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.className = 'datepicker-btn-cancelar';
  btnCancelar.onclick = () => cerrarDatepicker(inputId);

  acciones.appendChild(btnGuardar);
  acciones.appendChild(btnCancelar);
  content.appendChild(acciones);

  modal.appendChild(content);
  document.body.appendChild(modal);

  /* ── Funciones internas ────────────────────────────– */
  function cambiarMes(offset) {
    fecha.setMonth(fecha.getMonth() + offset);
    renderCalendar();
  }

  function renderCalendar() {
    const monthYear = document.getElementById('datepicker-month-year-' + inputId);
    const nombreMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    monthYear.textContent = nombreMeses[fecha.getMonth()] + ' ' + fecha.getFullYear();

    const tbody = document.getElementById('datepicker-tbody-' + inputId);
    tbody.innerHTML = '';

    const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimo = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const diaInicio = primero.getDay();

    let filaActual = tbody.insertRow(0);
    let celdas = 0;

    // Celdas vacías al inicio
    for (let i = 0; i < diaInicio; i++) {
      const td = filaActual.insertCell(0);
      td.className = 'datepicker-celda-vacia';
    }
    celdas = diaInicio;

    // Días del mes
    for (let dia = 1; dia <= ultimo.getDate(); dia++) {
      if (celdas % 7 === 0 && celdas > 0) {
        filaActual = tbody.insertRow(0);
      }

      const td = filaActual.insertCell(0);
      td.textContent = dia;
      td.className = 'datepicker-dia';

      const fechaActual = new Date(fecha.getFullYear(), fecha.getMonth(), dia);
      if (fechaActual.toDateString() === new Date().toDateString()) {
        td.classList.add('datepicker-hoy');
      }
      if (fechaActual.toDateString() === fecha.toDateString()) {
        td.classList.add('datepicker-seleccionado');
      }

      td.onclick = () => {
        fecha = new Date(fecha.getFullYear(), fecha.getMonth(), dia);
        renderCalendar();
      };

      celdas++;
    }
  }

  renderCalendar();
  modal.style.display = 'flex';

  // Cerrar al clickear fuera
  modal.onclick = (e) => {
    if (e.target === modal) cerrarDatepicker(inputId);
  };
}

function cerrarDatepicker(inputId) {
  const modal = document.getElementById('datepicker-modal-' + inputId);
  if (modal) modal.remove();
}
