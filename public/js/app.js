/* ════════════════════════════════════════════════════════
   app.js  –  Lógica frontend Obsitel
   Sin autenticación. Backend en Render + MongoDB.
   Integra el motor genérico de Google Forms.
   ════════════════════════════════════════════════════════ */

const API = 'https://obsitel-descuento.onrender.com/api';

/* ── Navegación ─────────────────────────────────────────── */
function ir(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activo'));
  document.getElementById(id).classList.add('activo');
  document.getElementById('sidebar').classList.add('collapsed');
  if (id === 'papelera') renderPapelera();
  if (id === 'configuracion') renderConfiguracion();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

/* ── Toggle recibo NC / OCC / DEVOLUCIÓN (solo Obsitel) ─── */
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
    navigator.clipboard.writeText(texto).then(() => {
      el.textContent = '✅';
      setTimeout(() => el.textContent = '📋', 1500);
    });
  } catch(e) { alert('No se pudo copiar'); }
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

/* ── Footer Ventas: Accesorio + Promo LLAA + ícono Forms ─── */
function crearFooterVentas(reg, seccion, voucherParaForm) {
  const wrap = document.createElement('div');
  wrap.className = 'item-respuesta item-respuesta-ventas';

  const accInput = document.createElement('input');
  accInput.type = 'text';
  accInput.placeholder = 'Accesorio S/1';
  accInput.className = 'item-respuesta-input item-respuesta-input-corto';
  accInput.setAttribute('list', 'si_no_list');
  accInput.value = reg._accesorio || '';

  const promoInput = document.createElement('input');
  promoInput.type = 'text';
  promoInput.placeholder = 'Promo LLAA';
  promoInput.className = 'item-respuesta-input';
  promoInput.value = reg._promoLLAA || '';

  let debounceAcc, debouncePromo;
  accInput.addEventListener('input', () => {
    reg._accesorio = accInput.value.trim();
    clearTimeout(debounceAcc);
    debounceAcc = setTimeout(() => {
      if (reg._id) apiFetch('PUT', `${seccion}/${reg._id}`, { _accesorio: reg._accesorio });
    }, 800);
  });
  promoInput.addEventListener('input', () => {
    reg._promoLLAA = promoInput.value.trim();
    clearTimeout(debouncePromo);
    debouncePromo = setTimeout(() => {
      if (reg._id) apiFetch('PUT', `${seccion}/${reg._id}`, { _promoLLAA: reg._promoLLAA });
    }, 800);
  });

  const iconBtn = document.createElement('div');
  iconBtn.className = 'item-respuesta-icon';
  iconBtn.title = 'Enviar a Google Forms';
  if (reg._formEnviado) iconBtn.classList.add('enviado');

  iconBtn.addEventListener('click', () => {
    const voucher = {
      ...voucherParaForm(),
      accesorio: accInput.value.trim(),
      promoLLAA: promoInput.value.trim()
    };
    enviarAGoogleForms('ventas', voucher, iconBtn);
    if (reg._id) {
      setTimeout(() => apiFetch('PUT', `${seccion}/${reg._id}`, { _formEnviado: true }), 500);
    }
  });

  wrap.appendChild(accInput);
  wrap.appendChild(promoInput);
  wrap.appendChild(iconBtn);
  return wrap;
}

/* ── Viñeta SS (solo Descuentos) + ícono Google Forms ────── */
function crearVinetaSS(reg, seccion, voucherParaForm) {
  const wrap = document.createElement('div');
  wrap.className = 'item-respuesta';

  const prefix = document.createElement('span');
  prefix.className = 'item-respuesta-prefix';
  prefix.textContent = 'SS:';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'SS';
  input.className = 'item-respuesta-input';
  input.value = reg._nc || '';

  let debounceTimer;
  input.addEventListener('input', () => {
    const val = input.value.trim();
    reg._nc = val;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (reg._id) apiFetch('PUT', `${seccion}/${reg._id}`, { _nc: val });
    }, 800);
  });

  const iconBtn = document.createElement('div');
  iconBtn.className = 'item-respuesta-icon';
  iconBtn.title = 'Enviar a Google Forms';
  if (reg._formEnviado) iconBtn.classList.add('enviado');

  iconBtn.addEventListener('click', () => {
    const voucher = { ...voucherParaForm(), nc: input.value.trim() };
    enviarAGoogleForms('descuentos', voucher, iconBtn);
    if (reg._id) {
      setTimeout(() => apiFetch('PUT', `${seccion}/${reg._id}`, { _formEnviado: true }), 500);
    }
  });

  wrap.appendChild(prefix);
  wrap.appendChild(input);
  wrap.appendChild(iconBtn);
  return wrap;
}

/* ── Crear baucher ───────────────────────────────────────── */
function crearItem(reg, texto, onDel, onEdit, seccion, voucherParaForm) {
  const div = document.createElement('div');
  div.className = 'item';
  div.dataset.id = reg._id;

  const header = document.createElement('div');
  header.className = 'item-header';

  const leftSide = document.createElement('div');
  leftSide.className = 'item-left';

  const bullet = document.createElement('span');
  bullet.className = 'item-bullet';

  const c = document.createElement('button');
  c.className = 'copy'; c.textContent = '📋'; c.title = 'Copiar';
  c.onclick = () => copiar(div.querySelector('.item-body').innerText, c);

  leftSide.appendChild(bullet);
  leftSide.appendChild(c);

  const fechaSpan = document.createElement('span');
  fechaSpan.className = 'item-fecha';
  fechaSpan.textContent = reg._fecha || '';

  const rightSide = document.createElement('div');
  rightSide.className = 'item-right';

  const sep = document.createElement('span');
  sep.className = 'item-sep'; sep.textContent = '|';

  const e = document.createElement('button');
  e.className = 'edit'; e.textContent = '✏️'; e.title = 'Editar';
  e.onclick = () => onEdit(div);

  const d = document.createElement('button');
  d.className = 'delete'; d.textContent = '🗑'; d.title = 'Eliminar';
  d.onclick = onDel;

  rightSide.appendChild(sep);
  rightSide.appendChild(e);
  rightSide.appendChild(d);

  header.appendChild(leftSide);
  header.appendChild(fechaSpan);
  header.appendChild(rightSide);

  const desc = document.createElement('textarea');
  desc.className = 'item-descripcion';
  desc.placeholder = 'Descripción o notas opcionales';
  desc.value = reg._descripcion || '';
  desc.addEventListener('blur', () => {
    if (reg._id && desc.value !== (reg._descripcion || '')) {
      reg._descripcion = desc.value;
      apiFetch('PUT', `${seccion}/${reg._id}`, { _descripcion: desc.value });
    }
  });

  const body = document.createElement('div');
  body.className = 'item-body';
  body.innerText = texto;

  // Descuentos -> viñeta SS + ícono. Tienda/Delivery -> Accesorio + Promo LLAA + ícono.
  const footer = (seccion === 'obsitel')
    ? crearVinetaSS(reg, seccion, voucherParaForm)
    : crearFooterVentas(reg, seccion, voucherParaForm);

  div.appendChild(header);
  div.appendChild(desc);
  div.appendChild(body);
  div.appendChild(footer);
  return div;
}

/* ── Render historial genérico ───────────────────────────── */
async function renderHist(seccion, genTexto, genVoucherForm) {
  const cont = document.getElementById('hist_' + seccion);
  cont.innerHTML = '<div class="loader">Cargando...</div>';

  const registros = await apiFetch('GET', seccion);
  cont.innerHTML = '';

  registros.forEach((reg) => {
    const txt = genTexto(reg);
    const regCompleto = { ...reg, _seccion: seccion };

    const item = crearItem(
      regCompleto,
      txt,
      async () => {
        await apiFetch('DELETE', `${seccion}/${reg._id}`);
        renderHist(seccion, genTexto, genVoucherForm);
      },
      (itemDiv) => {
        const bodyEl = itemDiv.querySelector('.item-body');
        const ta = document.createElement('textarea');
        ta.value = bodyEl.innerText;
        ta.style.cssText = 'width:100%;min-height:120px;font-size:13px;border-radius:5px;border:1px solid #94a3b8;padding:6px;resize:vertical;font-family:Arial;';

        const btnOk = document.createElement('button');
        btnOk.textContent = 'Guardar';
        btnOk.style.cssText = 'margin-top:5px;padding:5px 12px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancelar';
        btnCancel.style.cssText = 'margin-top:5px;margin-left:6px;padding:5px 12px;background:#94a3b8;color:white;border:none;border-radius:5px;cursor:pointer;';

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
      seccion,
      () => genVoucherForm(regCompleto)
    );
    cont.appendChild(item);
  });
}

/* ── Borrar todo historial ───────────────────────────────── */
async function borrarTodo(seccion) {
  const nombres = { obsitel: 'Obsitel', tienda: 'Venta Tienda', delivery: 'Venta Delivery' };
  if (!confirm(`Borrar todo el historial de ${nombres[seccion]}?`)) return;
  await apiFetch('DELETE', seccion);
  const renders = { obsitel: renderObsitel, tienda: renderTienda, delivery: renderDelivery };
  renders[seccion]();
}

/* ── API helper (incluye token de Firebase en cada llamada) ─ */
async function apiFetch(method, path, body) {
  const token = await obtenerTokenAuth();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API}/${path}`, opts);
    if (!res.ok) { console.error('API error', res.status); return []; }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

/* ── Helper campos ───────────────────────────────────────── */
function v(id) { return document.getElementById(id).value; }
function clr(ids) { ids.forEach(id => document.getElementById(id).value = ''); }

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
    'Modalidad de ajuste: ' + (d.modalidad || ''),
    'Numero Entel: ' + (d.entel || ''),
    'Numero desde el cual llama el cliente: ' + (d.llamada || ''),
    'Motivo/Concepto: ' + (d.motivo || ''),
    'Monto de ajuste: ' + (d.monto || ''),
    'Recibo relacionado: ' + recibo,
    'Periodo de facturacion: ' + (d.periodo || ''),
    'Tipo de ajuste: Error detectable'
  ].join('\n');
}

// Voucher plano que se le pasa al motor (sin nada de Google Forms adentro)
function voucherObsitel(d) {
  return {
    _seccion: 'obsitel',
    link: d.link, modalidad: d.modalidad, motivo: d.motivo, monto: d.monto,
    asesor: ''  // Se completa automáticamente desde config.usuarioSiebel (Configuración)
  };
}

function renderObsitel() { renderHist('obsitel', textoObsitel, voucherObsitel); }

async function guardarObsitel() {
  const mod = v('modalidad').toUpperCase();
  await apiFetch('POST', 'obsitel', {
    _fecha: fechaHoraAhora(),
    link: v('link'), modalidad: v('modalidad'), entel: v('entel'),
    llamada: v('llamada'), motivo: v('motivo'), monto: v('monto'),
    recibo: mod === 'OCC' ? v('recibo_occ') : v('recibo_nc'),
    periodo: v('periodo')
  });
  clr(['link','modalidad','entel','llamada','motivo','monto','recibo_nc','recibo_occ','periodo']);
  toggleRecibo();
  renderObsitel();
}

/* ════════════════════════════════════════════════════════
   TIENDA
   ════════════════════════════════════════════════════════ */
function textoTienda(d) {
  return [
    d.link,
    'PICK UP: ' + (d.pickup || ''),
    'Nombre: ' + (d.nombre || ''),
    'DNI: ' + (d.dni || ''),
    'Orden: ' + (d.orden || ''),
    'Numero de referencia: ' + (d.referencia || ''),
    'Tienda: ' + (d.tienda || ''),
    'PDV: ' + (d.pdv || ''),
    'Tipo de venta: ' + (d.tipo_venta || ''),
    'Fecha y hora que se acercara a la tienda: ' + (d.fecha || ''),
    'SKU de equipo, accesorio o SIM: ' + (d.equipo || ''),
    'Canal: S2S - Burns'
  ].join('\n');
}

// Mapea los campos de Tienda a los nombres canónicos que espera formsConfig.ventas
function voucherTienda(d) {
  return {
    _seccion:   'tienda',
    link:       d.link,
    dni:        d.dni,
    orden:      d.orden,
    tipo_venta: d.tipo_venta,
    fecha:      d.fecha,
    horario:    extraerHora(d.fecha), // Tienda guarda fecha+hora juntos; se separa la hora aquí
    sku:        d.equipo
  };
}

// Extrae "08:00" desde "10/07/2026 08:00"
function extraerHora(fechaHoraTexto) {
  if (!fechaHoraTexto) return '';
  const match = String(fechaHoraTexto).match(/(\d{2}:\d{2})/);
  return match ? match[1] : '';
}

function renderTienda() { renderHist('tienda', textoTienda, voucherTienda); }

async function guardarTienda() {
  await apiFetch('POST', 'tienda', {
    _fecha: fechaHoraAhora(),
    link: v('t_link'), pickup: v('t_pickup'), nombre: v('t_nombre'),
    dni: v('t_dni'), orden: v('t_orden'), referencia: v('t_referencia'),
    tienda: v('t_tienda'), pdv: v('t_pdv'), tipo_venta: v('t_tipo_venta'),
    fecha: v('t_fecha'), equipo: v('t_equipo')
  });
  clr(['t_link','t_pickup','t_nombre','t_dni','t_orden','t_referencia','t_tienda','t_pdv',
       't_tipo_venta','t_fecha','t_equipo']);
  renderTienda();
}

/* ════════════════════════════════════════════════════════
   DELIVERY
   ════════════════════════════════════════════════════════ */
function textoDelivery(d) {
  return [
    d.link,
    'Direccion: ' + (d.dir || ''),
    'Referencia direccion: ' + (d.ref || ''),
    'Coordenadas: ' + (d.coord || ''),
    'Numero de referencia: ' + (d.numref || ''),
    'Nombres completos: ' + (d.nombres || ''),
    'DNI: ' + (d.dni || ''),
    'Orden: ' + (d.orden || ''),
    'Tipo de venta: ' + (d.tipo || ''),
    'Fecha de entrega: ' + (d.fecha || ''),
    'Rango de horario: ' + (d.rango || ''),
    'SKU de equipo, accesorio o SIM: ' + (d.sku || '')
  ].join('\n');
}

function voucherDelivery(d) {
  return {
    _seccion:   'delivery',
    link:       d.link,
    dni:        d.dni,
    orden:      d.orden,
    tipo_venta: d.tipo,
    fecha:      d.fecha,
    horario:    d.rango,
    sku:        d.sku
  };
}

function renderDelivery() { renderHist('delivery', textoDelivery, voucherDelivery); }

async function guardarDelivery() {
  await apiFetch('POST', 'delivery', {
    _fecha: fechaHoraAhora(),
    link: v('d_link'), dir: v('d_direccion'), ref: v('d_ref'),
    coord: v('d_coord'), numref: v('d_numref'), nombres: v('d_nombres'),
    dni: v('d_dni'), orden: v('d_orden'), tipo: v('d_tipo'),
    fecha: v('d_fecha'), rango: v('d_rango'), sku: v('d_sku')
  });
  clr(['d_link','d_direccion','d_ref','d_coord','d_numref','d_nombres','d_dni','d_orden',
       'd_tipo','d_fecha','d_rango','d_sku']);
  renderDelivery();
}

/* ════════════════════════════════════════════════════════
   PAPELERA
   ════════════════════════════════════════════════════════ */
async function renderPapelera() {
  const cont = document.getElementById('hist_papelera');
  cont.innerHTML = '<div class="loader">Cargando...</div>';
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
  for (const cb of checks) {
    await apiFetch('DELETE', `papelera/${cb.dataset.id}`);
  }
  renderPapelera();
}

/* ── Init (llamado desde auth.js una vez confirmada la sesión) ─ */
function iniciarApp() {
  renderObsitel();
  renderTienda();
  renderDelivery();
}
