function ir(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activo'));
  document.getElementById(id).classList.add('activo');
  document.getElementById('sidebar').classList.add('collapsed');
  if (id === 'papelera') renderPapelera();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

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

function copiar(texto, el) {
  try {
    navigator.clipboard.writeText(texto).then(() => {
      el.textContent = '✅';
      setTimeout(() => el.textContent = '📋', 1500);
    });
  } catch(e) { alert('No se pudo copiar'); }
}

function fechaHoraAhora() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,'0');
  const mm  = String(now.getMonth()+1).padStart(2,'0');
  const hh  = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${now.getFullYear()} ${hh}:${min}`;
}

function crearVinetaRespuesta() {
  const wrap = document.createElement('div');
  wrap.className = 'item-respuesta';
  const prefix = document.createElement('span');
  prefix.className = 'item-respuesta-prefix';
  prefix.textContent = 'NC:';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'NC';
  input.className = 'item-respuesta-input';
  const result = document.createElement('span');
  result.className = 'item-respuesta-result';
  input.addEventListener('input', () => {
    const val = input.value.trim();
    result.textContent = val ? `1-${val}` : '';
  });
  wrap.appendChild(prefix);
  wrap.appendChild(input);
  wrap.appendChild(result);
  return wrap;
}

function crearItem(texto, fechaHora, onDel, onEdit) {
  const div = document.createElement('div');
  div.className = 'item';
  const header = document.createElement('div');
  header.className = 'item-header';
  const leftSide = document.createElement('div');
  leftSide.className = 'item-left';
  const bullet = document.createElement('span');
  bullet.className = 'item-bullet';
  const c = document.createElement('button');
  c.className = 'copy';
  c.textContent = '📋';
  c.title = 'Copiar';
  c.onclick = () => copiar(div.querySelector('.item-body').innerText, c);
  leftSide.appendChild(bullet);
  leftSide.appendChild(c);
  const fechaSpan = document.createElement('span');
  fechaSpan.className = 'item-fecha';
  fechaSpan.textContent = fechaHora || '';
  const rightSide = document.createElement('div');
  rightSide.className = 'item-right';
  const sep = document.createElement('span');
  sep.className = 'item-sep';
  sep.textContent = '|';
  const e = document.createElement('button');
  e.className = 'edit';
  e.textContent = '✏️';
  e.title = 'Editar';
  e.onclick = () => onEdit(div);
  const d = document.createElement('button');
  d.className = 'delete';
  d.textContent = '🗑';
  d.title = 'Eliminar';
  d.onclick = onDel;
  rightSide.appendChild(sep);
  rightSide.appendChild(e);
  rightSide.appendChild(d);
  header.appendChild(leftSide);
  header.appendChild(fechaSpan);
  header.appendChild(rightSide);
  const body = document.createElement('div');
  body.className = 'item-body';
  body.innerText = texto;
  const respuesta = crearVinetaRespuesta();
  div.appendChild(header);
  div.appendChild(body);
  div.appendChild(respuesta);
  return div;
}

async function renderHist(seccion, genTexto) {
  const cont = document.getElementById('hist_' + seccion);
  cont.innerHTML = '<div class="loader">Cargando...</div>';
  const registros = await apiFetch('GET', seccion);
  cont.innerHTML = '';
  registros.forEach((reg) => {
    const txt = genTexto(reg);
    const fecha = reg._fecha || '';
    const item = crearItem(txt, fecha,
      async () => {
        await apiFetch('DELETE', `${seccion}/${reg._id}`);
        renderHist(seccion, genTexto);
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
        itemDiv.appendChild(ta);
        itemDiv.appendChild(btnOk);
        itemDiv.appendChild(btnCancel);
        btnOk.onclick = async () => {
          await apiFetch('PUT', `${seccion}/${reg._id}`, { _textoEditado: ta.value });
          bodyEl.innerText = ta.value;
          bodyEl.style.display = '';
          ta.remove();
          btnOk.remove();
          btnCancel.remove();
        };
        btnCancel.onclick = () => {
          bodyEl.style.display = '';
          ta.remove();
          btnOk.remove();
          btnCancel.remove();
        };
      }
    );
    cont.appendChild(item);
  });
}

async function borrarTodo(seccion) {
  const nombres = { obsitel: 'Obsitel', tienda: 'Venta Tienda', delivery: 'Venta Delivery' };
  if (!confirm(`Borrar todo el historial de ${nombres[seccion]}?`)) return;
  await apiFetch('DELETE', seccion);
  const renders = { obsitel: renderObsitel, tienda: renderTienda, delivery: renderDelivery };
  renders[seccion]();
}

async function apiFetch(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`https://obsitel-descuento.onrender.com/api/${path}`, opts);
    if (!res.ok) { console.error('API error', res.status); return []; }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

function v(id) { return document.getElementById(id).value; }
function clr(ids) { ids.forEach(id => document.getElementById(id).value = ''); }

function textoObsitel(d) {
  const recibo = (d.modalidad || '').toUpperCase() === 'OCC' ? d.recibo : 'S002-' + d.recibo;
  return [d.link, 'Modalidad de ajuste: ' + d.modalidad, 'Numero Entel: ' + d.entel, 'Numero desde el cual llama el cliente: ' + d.llamada, 'Motivo/Concepto: ' + d.motivo, 'Monto de ajuste: ' + d.monto, 'Recibo relacionado: ' + recibo, 'Periodo de facturacion: ' + d.periodo, 'Tipo de ajuste: Error detectable'].join('\n');
}
function renderObsitel() { renderHist('obsitel', textoObsitel); }
async function guardarObsitel() {
  await apiFetch('POST', 'obsitel', {_fecha: fechaHoraAhora(), link: v('link'), modalidad: v('modalidad'), entel: v('entel'), llamada: v('llamada'), motivo: v('motivo'), monto: v('monto'), recibo: v('modalidad').toUpperCase() === 'OCC' ? v('recibo_occ') : v('recibo_nc'), periodo: v('periodo')});
  clr(['link','modalidad','entel','llamada','motivo','monto','recibo_nc','recibo_occ','periodo']);
  toggleRecibo();
  renderObsitel();
}

function textoTienda(d) {
  return [d.link, 'PICK UP: ' + d.pickup, 'Nombre: ' + d.nombre, 'DNI: ' + d.dni, 'Orden: ' + d.orden, 'Numero de referencia: ' + d.referencia, 'Tienda: ' + d.tienda, 'PDV: ' + d.pdv, 'Tipo de venta: ' + d.tipo_venta, 'Fecha y hora que se acercara a la tienda: ' + d.fecha, 'Equipo: ' + d.equipo, 'Canal: S2S - Burns'].join('\n');
}
function renderTienda() { renderHist('tienda', textoTienda); }
async function guardarTienda() {
  await apiFetch('POST', 'tienda', {_fecha: fechaHoraAhora(), link: v('t_link'), pickup: v('t_pickup'), nombre: v('t_nombre'), dni: v('t_dni'), orden: v('t_orden'), referencia: v('t_referencia'), tienda: v('t_tienda'), pdv: v('t_pdv'), tipo_venta: v('t_tipo_venta'), fecha: v('t_fecha'), equipo: v('t_equipo')});
  clr(['t_link','t_pickup','t_nombre','t_dni','t_orden','t_referencia','t_tienda','t_pdv','t_tipo_venta','t_fecha','t_equipo']);
  renderTienda();
}

function textoDelivery(d) {
  return [d.link, 'Direccion: ' + d.dir, 'Referencia direccion: ' + d.ref, 'Coordenadas: ' + d.coord, 'Numero de referencia: ' + d.numref, 'Nombres completos: ' + d.nombres, 'DNI: ' + d.dni, 'Orden: ' + d.orden, 'Tipo de venta: ' + d.tipo, 'Fecha de entrega: ' + d.fecha, 'Rango de horario: ' + d.rango, 'SKU de equipo y accesorio: ' + d.sku].join('\n');
}
function renderDelivery() { renderHist('delivery', textoDelivery); }
async function guardarDelivery() {
  await apiFetch('POST', 'delivery', {_fecha: fechaHoraAhora(), link: v('d_link'), dir: v('d_direccion'), ref: v('d_ref'), coord: v('d_coord'), numref: v('d_numref'), nombres: v('d_nombres'), dni: v('d_dni'), orden: v('d_orden'), tipo: v('d_tipo'), fecha: v('d_fecha'), rango: v('d_rango'), sku: v('d_sku')});
  clr(['d_link','d_direccion','d_ref','d_coord','d_numref','d_nombres','d_dni','d_orden','d_tipo','d_fecha','d_rango','d_sku']);
  renderDelivery();
}

async function renderPapelera() {
  const cont = document.getElementById('hist_papelera');
  cont.innerHTML = '<div class="loader">Cargando...</div>';
  const registros = await apiFetch('GET', 'papelera');
  cont.innerHTML = '';
  if (registros.length === 0) { cont.innerHTML = '<div class="papelera-vacia">La papelera está vacía</div>'; return; }
  registros.forEach((reg) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'papelera-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.id = reg._id;
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
    wrapper.appendChild(cb);
    wrapper.appendChild(bodyWrap);
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

renderObsitel();
renderTienda();
renderDelivery();
