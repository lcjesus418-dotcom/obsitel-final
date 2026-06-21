/* ════════════════════════════════════════════════════════
   app.js  –  Lógica frontend Obsitel v2
   MongoDB + Google Forms + Viñeta NC
   ════════════════════════════════════════════════════════ */

const API = 'const API = 'https://obsitel-descuento.onrender.com/api';

// Configuración Google Forms
const GOOGLE_FORMS = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSey7MiTjSTNtl0H1pP39cZLQIvtQZlPtVN4gykdzeiVzDPfTQ/viewform',
  entries: {
    url:        'entry.710025431',
    modalidad:  'entry.692017987',
    motivo:     'entry.679986135',
    monto:      'entry.471539355',
    nc:         'entry.1673361831',
    asesor:     'entry.1628070971'
  },
  asesor: 'Bernilla Carrillo Martin Daniel'
};

/* ── Navegación ─────────────────────────────────────────── */
function ir(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activo'));
  document.getElementById(id).classList.add('activo');
  document.getElementById('sidebar').classList.add('collapsed');
  if (id === 'papelera') renderPapelera();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

/* ── Toggle recibo NC / OCC / DEVOLUCIÓN ──────────────── */
function toggleRecibo() {
  const mod = (document.getElementById('modalidad').value || '').toUpperCase().trim();
  const nc  = document.getElementById('recibo_nc');
  const occ = document.getElementById('recibo_occ');
  
  if (mod === 'OCC') {
    nc.style.display  = 'none';  nc.value = ''; nc.removeAttribute('required');
    occ.style.display = 'block'; occ.setAttribute('required', '');
  } else if (mod === 'DEVOLUCIÓN DE SALDO') {
    nc.style.display  = 'none';  nc.value = ''; nc.removeAttribute('required');
    occ.style.display = 'none'; occ.value = ''; occ.removeAttribute('required');
  } else {
    occ.style.display = 'none';  occ.value = ''; occ.removeAttribute('required');
    nc.style.display  = 'block'; nc.setAttribute('required', '');
  }
}

/* ── Copiar al portapapeles ──────────────────────────────── */
function copiar(texto, el) {
  try {
    if (navigator.clipboard && location.protocol !== 'file:') {
      navigator.clipboard.writeText(texto);
    } else {
      const ta = document.createElement('textarea');
      ta.value = texto; ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    el.textContent = '✅';
    setTimeout(() => el.textContent = '📋', 1500);
  } catch(e) { alert('No se pudo copiar'); }
}

/* ── Normalizar texto ────────────────────────────────────── */
function normalizar(texto) {
  return (texto || '').toUpperCase().trim();
}

/* ── Fecha/hora formateada ───────────────────────────────── */
function fechaHoraAhora() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,'0');
  const mm  = String(now.getMonth()+1).padStart(2,'0');
  const hh  = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${now.getFullYear()} ${hh}:${min}`;
}

/* ── Enviar a Google Forms ───────────────────────────────── */
function enviarAForms(reg, ncValue, iconEl) {
  const params = new URLSearchParams({
    [GOOGLE_FORMS.entries.url]:       reg.link || '',
    [GOOGLE_FORMS.entries.modalidad]: normalizar(reg.modalidad),
    [GOOGLE_FORMS.entries.motivo]:    normalizar(reg.motivo),
    [GOOGLE_FORMS.entries.monto]:     reg.monto || '',
    [GOOGLE_FORMS.entries.nc]:        ncValue || '',
    [GOOGLE_FORMS.entries.asesor]:    GOOGLE_FORMS.asesor
  });
  
  window.open(`${GOOGLE_FORMS.url}?${params.toString()}`, '_blank');
  
  // Marcar como enviado después de 500ms
  setTimeout(() => {
    if (iconEl) {
      iconEl.classList.add('enviado');
      // Guardar en BD
      const id = iconEl.closest('.item').dataset.id;
      if (id) apiFetch('PUT', `obsitel/${id}`, { _formEnviado: true });
    }
  }, 500);
}

/* ── Crear viñeta de respuesta NC (solo para Obsitel) ────── */
function crearVinetaRespuesta(registro) {
  const wrap = document.createElement('div');
  wrap.className = 'item-respuesta';

  const prefix = document.createElement('span');
  prefix.className = 'item-respuesta-prefix';
  prefix.textContent = 'NC:';

  const input = document.createElement('input');
  input.type        = 'text';
  input.placeholder = 'NC';
  input.className   = 'item-respuesta-input';
  input.value       = registro._nc || '';

  const result = document.createElement('span');
  result.className = 'item-respuesta-result';
  result.textContent = input.value ? `1-${input.value}` : '';

  // Debounce para guardar
  let debounceTimer;
  input.addEventListener('input', () => {
    const val = input.value.trim();
    result.textContent = val ? `1-${val}` : '';
    
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const id = wrap.closest('.item').dataset.id;
      if (id) apiFetch('PUT', `obsitel/${id}`, { _nc: val });
    }, 800);
  });

  // Ícono Google Forms
  const iconBtn = document.createElement('div');
  iconBtn.className = 'item-respuesta-icon';
  iconBtn.style.backgroundImage = 'url(/assets/google-forms.png)';
  if (registro._formEnviado) iconBtn.classList.add('enviado');
  
  iconBtn.addEventListener('click', () => {
    const ncVal = input.value.trim();
    enviarAForms(registro, ncVal, iconBtn);
  });

  wrap.appendChild(prefix);
  wrap.appendChild(input);
  wrap.appendChild(result);
  wrap.appendChild(iconBtn);
  return wrap;
}

/* ── Crear item del baucher ──────────────────────────────── */
function crearItem(registro, onDel, onEdit, seccion) {
  const div = document.createElement('div');
  div.className = 'item';
  div.dataset.id = registro._id;

  /* Cabecera */
  const header = document.createElement('div');
  header.className = 'item-header';

  /* Izquierda: viñeta + copiar */
  const leftSide = document.createElement('div');
  leftSide.className = 'item-left';

  const bullet = document.createElement('span');
  bullet.className = 'item-bullet';

  const c = document.createElement('button');
  c.className = 'copy'; c.textContent = '📋'; c.title = 'Copiar';
  c.onclick = () => {
    const txt = div.querySelector('.item-body').innerText;
    copiar(txt, c);
  };

  leftSide.appendChild(bullet);
  leftSide.appendChild(c);

  /* Centro: fecha */
  const fechaSpan = document.createElement('span');
  fechaSpan.className = 'item-fecha';
  fechaSpan.textContent = registro._fecha || '';

  /* Derecha: | editar eliminar */
  const rightSide = document.createElement('div');
  rightSide.className = 'item-right';

  const sep = document.createElement('span');
  sep.className = 'item-sep'; sep.textContent = '|';

  const e = document.createElement('button');
  e.className = 'edit'; e.textContent = '✏️'; e.title = 'Editar';
  e.onclick = () => onEdit(div, registro);

  const d = document.createElement('button');
  d.className = 'delete'; d.textContent = '🗑'; d.title = 'Eliminar';
  d.onclick = onDel;

  rightSide.appendChild(sep);
  rightSide.appendChild(e);
  rightSide.appendChild(d);

  header.appendChild(leftSide);
  header.appendChild(fechaSpan);
  header.appendChild(rightSide);

  /* Cuerpo */
  const body = document.createElement('div');
  body.className = 'item-body';
  body.innerText = registro._textoEditado || '';

  /* Descripción */
  const desc = document.createElement('textarea');
  desc.className = 'item-descripcion';
  desc.placeholder = 'Descripción o notas opcionales';
  desc.value = registro._descripcion || '';
  
  desc.addEventListener('blur', () => {
    const id = div.dataset.id;
    if (id && desc.value !== (registro._descripcion || '')) {
      apiFetch('PUT', `${seccion}/${id}`, { _descripcion: desc.value });
    }
  });

  div.appendChild(header);
  div.appendChild(body);
  div.appendChild(desc);

  /* Viñeta NC solo para obsitel */
  if (seccion === 'obsitel') {
    div.appendChild(crearVinetaRespuesta(registro));
  }

  return div;
}

/* ── Render historial genérico ───────────────────────────── */
async function renderHist(seccion, genTexto) {
  const cont = document.getElementById('hist_' + seccion);
  cont.innerHTML = '<div class="loader"><span class="spinner"></span>Cargando...</div>';

  const registros = await apiFetch('GET', seccion);
  cont.innerHTML = '';

  if (registros.length === 0) {
    cont.innerHTML = '<div class="loader">Sin registros</div>';
    return;
  }

  registros.forEach((reg) => {
    const txt = genTexto(reg);
    const item = crearItem(
      { ...reg, _textoEditado: txt },
      async () => {
        if (!confirm('¿Eliminar este registro?')) return;
        await apiFetch('DELETE', `${seccion}/${reg._id}`);
        renderHist(seccion, genTexto);
      },
      (itemDiv, originalReg) => {
        const bodyEl = itemDiv.querySelector('.item-body');
        const ta = document.createElement('textarea');
        ta.value = bodyEl.innerText;
        ta.className = 'item-descripcion';
        ta.style.cssText = 'margin:8px 0;min-height:120px;';

        const btnOk = document.createElement('button');
        btnOk.textContent = 'Guardar';
        btnOk.style.cssText = 'margin-top:5px;padding:5px 12px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;font-size:13px;';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancelar';
        btnCancel.style.cssText = 'margin-top:5px;margin-left:6px;padding:5px 12px;background:#94a3b8;color:white;border:none;border-radius:5px;cursor:pointer;font-size:13px;';

        bodyEl.style.display = 'none';
        itemDiv.appendChild(ta); itemDiv.appendChild(btnOk); itemDiv.appendChild(btnCancel);

        btnOk.onclick = async () => {
          await apiFetch('PUT', `${seccion}/${reg._id}`, { _textoEditado: ta.value });
          bodyEl.innerText = ta.value; bodyEl.style.display = '';
          ta.remove(); btnOk.remove(); btnCancel.remove();
        };
        btnCancel.onclick = () => {
          bodyEl.style.display = '';
          ta.remove(); btnOk.remove(); btnCancel.remove();
        };
      },
      seccion
    );
    cont.appendChild(item);
  });
}

/* ── Borrar todo historial ───────────────────────────────── */
async function borrarTodo(seccion) {
  const nombres = { obsitel: 'Obsitel', tienda: 'Venta Tienda', delivery: 'Venta Delivery' };
  if (!confirm(`¿Borrar todo el historial de ${nombres[seccion]}?`)) return;
  await apiFetch('DELETE', seccion);
  const renders = { obsitel: renderObsitel, tienda: renderTienda, delivery: renderDelivery };
  renders[seccion]();
}

/* ── API helper ──────────────────────────────────────────── */
async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API}/${path}`, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API error:', err);
    alert('Error al conectar con el servidor');
    return [];
  }
}

/* ── Helper campos ───────────────────────────────────────── */
function v(id)    { return (document.getElementById(id)?.value || '').trim(); }
function clr(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; }); }

function validar(ids) {
  for (const id of ids) {
    if (!v(id)) { alert(`El campo es requerido`); return false; }
  }
  return true;
}

/* ════════════════════════════════════════════════════════
   OBSITEL
   ════════════════════════════════════════════════════════ */
function textoObsitel(d) {
  const recibo = (d.modalidad || '').toUpperCase() === 'OCC'
    ? d.recibo
    : (d.modalidad || '').toUpperCase() === 'DEVOLUCIÓN DE SALDO'
      ? '—'
      : 'S002-' + d.recibo;
  return [
    d.link,
    'Modalidad de ajuste: '                    + (d.modalidad || ''),
    'Numero Entel: '                           + (d.entel || ''),
    'Numero desde el cual llama el cliente: '  + (d.llamada || ''),
    'Motivo/Concepto: '                        + (d.motivo || ''),
    'Monto de ajuste: '                        + (d.monto || ''),
    'Recibo relacionado: '                     + recibo,
    'Periodo de facturacion: '                 + (d.periodo || ''),
    'Tipo de ajuste: Error detectable'
  ].filter(l => l).join('\n');
}

function renderObsitel() { renderHist('obsitel', textoObsitel); }

async function guardarObsitel() {
  if (!validar(['link','modalidad','entel','llamada','motivo','monto','periodo'])) return;
  const mod = v('modalidad').toUpperCase();
  const recibo = mod === 'OCC' ? v('recibo_occ') : (mod === 'DEVOLUCIÓN DE SALDO' ? '' : v('recibo_nc'));
  
  if ((mod === 'NC' || !['OCC','DEVOLUCIÓN DE SALDO'].includes(mod)) && !recibo) {
    alert('Ingresa el recibo relacionado');
    return;
  }

  const btn = document.querySelector('#obsitel button.accion');
  const orig = btn.textContent;
  btn.textContent = '✅ Guardado';
  btn.classList.add('guardando');

  await apiFetch('POST', 'obsitel', {
    _fecha: fechaHoraAhora(),
    link: v('link'), modalidad: v('modalidad'), entel: v('entel'),
    llamada: v('llamada'), motivo: v('motivo'), monto: v('monto'),
    recibo: recibo,
    periodo: v('periodo')
  });

  clr(['link','modalidad','entel','llamada','motivo','monto','recibo_nc','recibo_occ','periodo']);
  toggleRecibo();
  renderObsitel();

  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('guardando');
  }, 1500);
}

/* ════════════════════════════════════════════════════════
   TIENDA
   ════════════════════════════════════════════════════════ */
function textoTienda(d) {
  return [
    d.link,
    'PICK UP: '                                     + (d.pickup || ''),
    'Nombre: '                                      + (d.nombre || ''),
    'DNI: '                                         + (d.dni || ''),
    'Orden: '                                       + (d.orden || ''),
    'Numero de referencia: '                        + (d.referencia || ''),
    'Tienda: '                                      + (d.tienda || ''),
    'PDV: '                                         + (d.pdv || ''),
    'Tipo de venta: '                               + (d.tipo_venta || ''),
    'Fecha y hora que se acercara a la tienda: '    + (d.fecha || ''),
    'Equipo: '                                      + (d.equipo || ''),
    'Canal: S2S - Burns'
  ].filter(l => l).join('\n');
}

function renderTienda() { renderHist('tienda', textoTienda); }

async function guardarTienda() {
  if (!validar(['t_link','t_pickup','t_nombre','t_dni','t_orden','t_referencia','t_tienda','t_pdv','t_tipo_venta','t_fecha','t_equipo'])) return;

  const btn = document.querySelector('#tienda button.accion');
  const orig = btn.textContent;
  btn.textContent = '✅ Guardado';
  btn.classList.add('guardando');

  await apiFetch('POST', 'tienda', {
    _fecha: fechaHoraAhora(),
    link: v('t_link'), pickup: v('t_pickup'), nombre: v('t_nombre'),
    dni: v('t_dni'), orden: v('t_orden'), referencia: v('t_referencia'),
    tienda: v('t_tienda'), pdv: v('t_pdv'), tipo_venta: v('t_tipo_venta'),
    fecha: v('t_fecha'), equipo: v('t_equipo')
  });

  clr(['t_link','t_pickup','t_nombre','t_dni','t_orden','t_referencia','t_tienda','t_pdv','t_tipo_venta','t_fecha','t_equipo']);
  renderTienda();

  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('guardando');
  }, 1500);
}

/* ════════════════════════════════════════════════════════
   DELIVERY
   ════════════════════════════════════════════════════════ */
function textoDelivery(d) {
  return [
    d.link,
    'Direccion: '                   + (d.dir || ''),
    'Referencia direccion: '        + (d.ref || ''),
    'Coordenadas: '                 + (d.coord || ''),
    'Numero de referencia: '        + (d.numref || ''),
    'Nombres completos: '           + (d.nombres || ''),
    'DNI: '                         + (d.dni || ''),
    'Orden: '                       + (d.orden || ''),
    'Tipo de venta: '               + (d.tipo || ''),
    'Fecha de entrega: '            + (d.fecha || ''),
    'Rango de horario: '            + (d.rango || ''),
    'SKU de equipo y accesorio: '   + (d.sku || '')
  ].filter(l => l).join('\n');
}

function renderDelivery() { renderHist('delivery', textoDelivery); }

async function guardarDelivery() {
  if (!validar(['d_link','d_direccion','d_ref','d_coord','d_numref','d_nombres','d_dni','d_orden','d_tipo','d_fecha','d_rango','d_sku'])) return;

  const btn = document.querySelector('#delivery button.accion');
  const orig = btn.textContent;
  btn.textContent = '✅ Guardado';
  btn.classList.add('guardando');

  await apiFetch('POST', 'delivery', {
    _fecha: fechaHoraAhora(),
    link: v('d_link'), dir: v('d_direccion'), ref: v('d_ref'),
    coord: v('d_coord'), numref: v('d_numref'), nombres: v('d_nombres'),
    dni: v('d_dni'), orden: v('d_orden'), tipo: v('d_tipo'),
    fecha: v('d_fecha'), rango: v('d_rango'), sku: v('d_sku')
  });

  clr(['d_link','d_direccion','d_ref','d_coord','d_numref','d_nombres','d_dni','d_orden','d_tipo','d_fecha','d_rango','d_sku']);
  renderDelivery();

  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('guardando');
  }, 1500);
}

/* ════════════════════════════════════════════════════════
   PAPELERA
   ════════════════════════════════════════════════════════ */
async function renderPapelera() {
  const cont = document.getElementById('hist_papelera');
  cont.innerHTML = '<div class="loader"><span class="spinner"></span>Cargando...</div>';
  
  const registros = await apiFetch('GET', 'papelera');
  cont.innerHTML = '';

  if (registros.length === 0) {
    cont.innerHTML = '<div class="papelera-vacia">La papelera está vacía</div>';
    return;
  }

  registros.forEach((reg) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'papelera-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.dataset.id = reg._id;

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'papelera-item-body';

    const meta = document.createElement('div');
    meta.className = 'papelera-item-meta';
    const origenLabel = { obsitel:'Obsitel', tienda:'Venta Tienda', delivery:'Venta Delivery' }[reg._origen] || reg._origen || '';
    meta.textContent = origenLabel + (reg._fecha ? '  ·  ' + reg._fecha : '');

    const txt = document.createElement('div');
    const fns = { obsitel: textoObsitel, tienda: textoTienda, delivery: textoDelivery };
    txt.textContent = reg._textoEditado || (fns[reg._origen] ? fns[reg._origen](reg) : JSON.stringify(reg));

    bodyWrap.appendChild(meta);
    bodyWrap.appendChild(txt);

    const actions = document.createElement('div');
    actions.className = 'papelera-item-actions';

    const btnRestore = document.createElement('button');
    btnRestore.className = 'papelera-btn-restore';
    btnRestore.textContent = 'Restaurar';
    btnRestore.onclick = async () => {
      await apiFetch('POST', `papelera/${reg._id}/restore`, {});
      renderPapelera();
    };

    const btnDel = document.createElement('button');
    btnDel.className = 'papelera-btn-delete';
    btnDel.textContent = 'Eliminar';
    btnDel.onclick = async () => {
      if (!confirm('¿Eliminar permanentemente?')) return;
      await apiFetch('DELETE', `papelera/${reg._id}`);
      renderPapelera();
    };

    actions.appendChild(btnRestore);
    actions.appendChild(btnDel);

    wrapper.appendChild(cb);
    wrapper.appendChild(bodyWrap);
    wrapper.appendChild(actions);
    cont.appendChild(wrapper);
  });
}

async function vaciarPapelera() {
  const registros = await apiFetch('GET', 'papelera');
  if (registros.length === 0) return;
  if (!confirm('¿Vaciar toda la papelera? Esta acción no se puede deshacer.')) return;
  await apiFetch('DELETE', 'papelera');
  renderPapelera();
}

async function eliminarSeleccion() {
  const checks = document.querySelectorAll('#hist_papelera input[type=checkbox]:checked');
  if (checks.length === 0) { alert('Selecciona al menos un elemento.'); return; }
  
  const promises = Array.from(checks).map(cb =>
    apiFetch('DELETE', `papelera/${cb.dataset.id}`)
  );
  await Promise.all(promises);
  renderPapelera();
}

/* ── Init ────────────────────────────────────────────────── */
renderObsitel();
renderTienda();
renderDelivery();
