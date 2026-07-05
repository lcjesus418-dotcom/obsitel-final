/* ════════════════════════════════════════════════════════
   configApp.js  –  Sección de Configuración de la app
   
   Usuario Siebel y Supervisor PICK UP se guardan en
   localStorage y el motor (googleFormsEngine.js) los lee
   automáticamente. Nunca se piden en cada voucher.
   ════════════════════════════════════════════════════════ */

// Listas de opciones para los desplegables.
// Edita estos arrays para agregar/quitar usuarios o supervisores.
const OPCIONES_USUARIO_SIEBEL = [
  'Bernilla Carrillo Martin Daniel'
  // Agrega más nombres aquí, ej: 'Perez Lopez Juan'
];

const OPCIONES_SUPERVISOR = [
  'Supervisor 1'
  // Agrega más nombres aquí
];

/* ── Renderizar la sección de Configuración ────────────── */
function renderConfiguracion() {
  const cont = document.getElementById('config-form-fields');
  if (!cont) return;

  const actual = obtenerConfiguracionUsuario();

  cont.innerHTML = `
    <label class="config-label">Usuario Siebel</label>
    <select id="config-usuario-siebel" class="config-select">
      <option value="">-- Seleccionar --</option>
      ${OPCIONES_USUARIO_SIEBEL.map(op =>
        `<option value="${op}" ${op === actual.usuarioSiebel ? 'selected' : ''}>${op}</option>`
      ).join('')}
    </select>

    <label class="config-label">Supervisor PICK UP</label>
    <select id="config-supervisor" class="config-select">
      <option value="">-- Seleccionar --</option>
      ${OPCIONES_SUPERVISOR.map(op =>
        `<option value="${op}" ${op === actual.supervisor ? 'selected' : ''}>${op}</option>`
      ).join('')}
    </select>

    <button class="accion" id="btn-guardar-config">Guardar Configuración</button>
    <div id="config-guardado-msg" class="config-guardado-msg"></div>
  `;

  document.getElementById('btn-guardar-config').onclick = guardarConfigDesdeForm;
}

/* ── Guardar configuración desde el formulario ─────────── */
function guardarConfigDesdeForm() {
  const usuarioSiebel = document.getElementById('config-usuario-siebel').value;
  const supervisor    = document.getElementById('config-supervisor').value;

  guardarConfiguracionUsuario({ usuarioSiebel, supervisor });

  const msg = document.getElementById('config-guardado-msg');
  msg.textContent = '✅ Configuración guardada';
  setTimeout(() => { msg.textContent = ''; }, 2000);
}
