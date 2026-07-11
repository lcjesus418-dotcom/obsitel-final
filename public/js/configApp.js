/* ════════════════════════════════════════════════════════
   configApp.js  –  Sección de Configuración de la app
   
   Usuario Siebel y Supervisor PICK UP se guardan en
   localStorage y el motor (googleFormsEngine.js) los lee
   automáticamente. Nunca se piden en cada voucher.

   Estilo: campos tipo "datalist" (igual a los demás inputs
   de la app) — no <select> nativo. Al escribir, las opciones
   se filtran como sugerencias, pero el campo se ve idéntico
   a cualquier otro input de texto.
   ════════════════════════════════════════════════════════ */

const OPCIONES_SUPERVISOR = [
  'Jéssica',
  'Mariana',
  'Angela',
  'Luis',
  'Luz',
  'Flavio'
];

const OPCIONES_USUARIO_SIEBEL = [
  'SBU_MGARCIAY','SBU_JCRUZC','SBU_VARISMENDI','SBU_AARRUNATEGU','SBU_AHERNANDEZ',
  'SBU_MMENDOZA','SBU_CVARGAS','SBU_YESPINOZAR','SBU_DCABALLEROC','SBU_JLASTRA',
  'SBU_TPPUMA','SBU_SPEREZF','SBU_MVALIENTE','SBU_SORDINOLA','SBU_ESALAZARO',
  'SBU_FHUALINGAF','SBU_LGONZALESL','SBU_NCASAMAYORA','SBU_RMUNOZT','SBU_VPRADAM',
  'SBU_JPORTALV','SBU_YSAAVEDRAA','SBU_DPENALOZAC','SBU_SAMESP','SBU_ACAMAVILCAS',
  'SBU_LDELACRUZ','SBU_YBRONCANOC','SBU_AHIDALGOC','SBU_EURBANO','SBU_RROJAS',
  'SBU_VHILARIO','SBU_RBARBARAN','SBU_GVASQUEZ','SBU_XVILLANUEVA','SBU_JAROSTE',
  'SBU_LMEDINA','SBU_MZUTA','SBU_JCURIHUAMAN','SBU_ADELACRUZ','SBU_CCONTRERAS',
  'SBU_YSANCHEZ','SBU_ITALLEDOB','SBU_MCISNEROSV','SBU_APEREZA','SBU_YLOPEZQ',
  'SBU_GCUBASV','SBU_CSORIANOH','SBU_JSALCEDOM','SBU_MPAJEA','SBU_RIBANEZM',
  'SBU_SNIETOS','SBU_DMOREYT','SBU_ZSATURNOG','SBU_BCHAVEZU','SBU_KLOPEZU',
  'SBU_RLEGUAJ','SBU_CFARFANP','SBU_MGONIM','SBU_KROJASB','SBU_MSORIANOP',
  'SBU_CCAJAL','SBU_MBERNILLA','SBU_CDOMADORA','SBU_ALINARESP','SBU_JMARIND',
  'SBU_PPBARROSL','SBU_MROJASL','SBU_LCORDEROQ','SBU_YLYARANGON','SBU_WPALMAG',
  'SBU_JMANTAS','SBU_NPUESCASO','SBU_JBUSTAMANTC','SBU_EDELGADOV','SBU_VLOZANOL',
  'SBU_LCARRASCOL','SBU_CMOGOLLONA','SBU_LTERRONESD','SBU_AMOGOLLONA','SBU_KALORH',
  'SBU_JJIMENEZG','SBU_YPFARFANA','SBU_JQUINDER','SBU_KCONOPUMAA','SBU_DCRUZADOM',
  'SBU_AESPINOZAH','SBU_MGODOYL','SBU_MMANTAS','SBU_BMURAYARIS','SBU_AMUNOZD',
  'SBU_ISANCHEZT','SBU_JSILVAM','SBU_JISUIZAF','SBU_KMVERTIZM','SBU_YCHOQUEP'
];

/* ── Renderizar la sección de Configuración ────────────── */
function renderConfiguracion() {
  const cont = document.getElementById('config-form-fields');
  if (!cont) return;

  const actual = obtenerConfiguracionUsuario();

  cont.innerHTML = `
    <label class="config-label">Usuario Siebel</label>
    <input list="config_usuario_siebel_list" id="config-usuario-siebel"
           placeholder="Buscar usuario Siebel..." value="${actual.usuarioSiebel || ''}">
    <datalist id="config_usuario_siebel_list">
      ${OPCIONES_USUARIO_SIEBEL.map(op => `<option value="${op}">`).join('')}
    </datalist>

    <label class="config-label">Supervisor PICK UP</label>
    <input list="config_supervisor_list" id="config-supervisor"
           placeholder="Buscar supervisor..." value="${actual.supervisor || ''}">
    <datalist id="config_supervisor_list">
      ${OPCIONES_SUPERVISOR.map(op => `<option value="${op}">`).join('')}
    </datalist>

    <button class="accion" id="btn-guardar-config">Guardar Configuración</button>
    <div id="config-guardado-msg" class="config-guardado-msg"></div>
  `;

  document.getElementById('btn-guardar-config').onclick = guardarConfigDesdeForm;
}

/* ── Guardar configuración desde el formulario ─────────── */
function guardarConfigDesdeForm() {
  const usuarioSiebel = document.getElementById('config-usuario-siebel').value.trim();
  const supervisor    = document.getElementById('config-supervisor').value.trim();

  guardarConfiguracionUsuario({ usuarioSiebel, supervisor });

  const msg = document.getElementById('config-guardado-msg');
  msg.textContent = '✅ Configuración guardada';
  setTimeout(() => { msg.textContent = ''; }, 2000);
}
