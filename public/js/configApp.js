/* ════════════════════════════════════════════════════════
   configApp.js  –  Sección de Configuración de la app
   
   3 campos guardados en localStorage y leídos automáticamente
   por el motor (googleFormsEngine.js):
   - Asesor Descuentos (nombre completo) -> formulario Descuentos
   - Asesor Venta (código SBU_)          -> formulario Ventas
   - Supervisor PICK UP                  -> formulario Ventas

   Estilo: campos tipo "datalist" (igual a los demás inputs
   de la app) — no <select> nativo.
   ════════════════════════════════════════════════════════ */

const OPCIONES_SUPERVISOR = [
  'Jéssica',
  'Mariana',
  'Angela',
  'Luis',
  'Luz',
  'Flavio'
];

// Asesor Venta (Tienda/Delivery) — código Usuario Siebel
const OPCIONES_ASESOR_VENTA = [
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

// Asesor Descuentos (Obsitel) — nombre completo
const OPCIONES_ASESOR_DESCUENTOS = [
  'Zuta Encarnación Mary Isabel','Curihuaman Tucto Jhire Dora','Melany Stefani Mendoza Chavez',
  'Perez Fernandez Stephanie Yajaira','Lastra Zuñiga Jennifer Yomara','Baca Quiquin Johaans Sebastian',
  'De la Cruz Hinostroza Angela Lizeth','Cruz Rojas Eliana Estefani','Vargas Bernilla Shirley Valery',
  'Aroste Sarmiento Jefferson Phol','Purizaca Prieto Adriana Ivett','Peñaloza Chavez Dagianna Judith',
  'Urbano Calderon Elvira Lizbeth','Vasquez Altez Geraldine Brigitte','Hilario De La Cruz Valery Shelly',
  'Espinoza Rubiños Yrene Del Rosario','Medina Alama Luis Alberto','Rojas Medina Ronny Roberto',
  'Hidalgo Chavez Alexander Junior','Tafur Huaman Zuli Scarlet','Portal Villegas Jesús Guillermo',
  'Bernilla Carrillo Martin Daniel','Domador Alberca Claudia Giannella','Saavedra Asencio Yoseli Estrellita',
  'Briones Correa Rodolfo Antonio','Simon Nahui Stefano Alessandro','Broncano Chumpitazi Jorge Adrian',
  'Sofia Elena Ames Puchoc','Puma Poma Thalia','Villanueva Cajamarca Xiomara',
  'Arrunategui Altez Alexandra Arabel','Arismendi Quispe Vanessa','Hernandez Pinto Allison Shirley',
  'Mendoza Chavez Melany Stefani','Sanchez Trujillo Yeico Jesus','Contreras Calle Cristhian Daniel',
  'Valiente Bernilla Marco Antonio','Vargas Villanueva Cinthya Brighit','Maria Isabel Cisneros Vela',
  'Huamani Gomez Janette Lisseth','Lopez Quispe Yonatan Claudio','Cornejo Susanibar Emmy Yuriko',
  'Alessandro Piero Perez Arohuillca','Deysi Roxana Caballero Chinoy','Briones Correa Silvia Margarita',
  'Cubas Vásquez Gian Marco','Soriano Huapaya Clara','Salcedo Machado Jennifer Vanessa',
  'Aguirre Pérez Luis Alberto','Terrones De la Cruz Adriana Antuaneth','Paje Ames Milan Jaime',
  'Linares Perez Álvaro','Suárez Lucho Rosario Natali','Sara Esther Nieto Santiago',
  'Daniela Morey Tantachuco','Angella Gabriella Madrid Burgos','Zully Betty Saturno Gervacio',
  'Brayan Aldair Chavez Unda','Sandy Domitila Mancisidor Alvarado','Legua Jara Rosa Vanessa',
  'Lopez Ugarte Katherine Doris','Marin de la Cruz Jean Paul','Goñi Medrano Maryorit Andrea',
  'Saavedra Ynche Mayra Miluska','Rojas Blas Khiara Maria','Velasquez Oyola Giorgia Melissa',
  'Martinez Sedan Jessica Karina','Andrade Pacheco Yosselin Lucila','Huayta Alzamora Angela Yessenia',
  'Farfan Peña Cristian Daniel','Caja Lazón Cristina Lizeth','Ramirez Valle Mishell Maria',
  'Soriano Pantoja Miguel Angel','Ubaqui Dueñas Jose David','Barros Loza Pierina Pamela',
  'Rojas Lacerna Milagros','Cordero Quispe Liseth Yessenia','Yarango Nolasco Yanina Lissay',
  'Palma Gonzales Winny Linette','Castagnola Lizarbe Andree Martin','Manta Sanchez Jennifer Evelyn',
  'Puescas Obando Nathaly Marleny','Ramirez Pareja Nilda','Carrasco Llanos Liseth',
  'Mogollon Alarcón Ana Lucia','Delgado Vargas Estefani Victoria','Mogollon Alarcón Carolina',
  'Terrones de la Cruz Lidia Elizabeth','Alor Herrera Kely Alexandra','Bustamante Campusano Jhon Jefferson',
  'Farfan Arias Yuliana Paola','Jimenez Garcia Jimmy','Lozano López Vanessa Magaly',
  'Quinde Retete Jazmin Yuri','Conopuma Arenaza Karem Giselle','Cruzado Manihuari Darwin Duverly',
  'Espinoza Hernández Anggi Nicole','Godoy Llajaruna María Pía','Isuiza Flores Jhoana Cristina',
  'Manta Sanchez Milagros Lisseth','Murayari Servan Brillit Alexandra','Muñoz De la Cruz Angie Andrea',
  'Ramos Espinoza Carlos Daniel','Sanchez Trejo Israel','Silva Mendoza Jeremy',
  'Vertiz Montejo Kimberly Monica','Choque Portocarrero Yeremy Katyuska','Romero Díaz Amy Alondra',
  'Rengifo Ferreñan Cadith Aracelly','Díaz Prada Flavio Josué','Cruz Díaz Jhonatan Angel',
  'Ibáñez Mendoza Karen Maite','Obando Quiroga Maria Alondra','Ancho Sanchez María Victoria'
];

/* ── Renderizar la sección de Configuración ────────────── */
function renderConfiguracion() {
  const cont = document.getElementById('config-form-fields');
  if (!cont) return;

  const actual = obtenerConfiguracionUsuario();

  cont.innerHTML = `
    <label class="config-label">Asesor Descuentos</label>
    <input type="text" list="config_asesor_descuentos_list" id="config-asesor-descuentos"
           placeholder="Buscar asesor..." value="${actual.asesorDescuentos || ''}">
    <datalist id="config_asesor_descuentos_list">
      ${OPCIONES_ASESOR_DESCUENTOS.map(op => `<option value="${op}">`).join('')}
    </datalist>

    <label class="config-label">Asesor Venta</label>
    <input type="text" list="config_asesor_venta_list" id="config-asesor-venta"
           placeholder="Buscar asesor..." value="${actual.usuarioSiebel || ''}">
    <datalist id="config_asesor_venta_list">
      ${OPCIONES_ASESOR_VENTA.map(op => `<option value="${op}">`).join('')}
    </datalist>

    <label class="config-label">Supervisor PICK UP</label>
    <input type="text" list="config_supervisor_list" id="config-supervisor"
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
  const asesorDescuentos = document.getElementById('config-asesor-descuentos').value.trim();
  const usuarioSiebel     = document.getElementById('config-asesor-venta').value.trim();
  const supervisor        = document.getElementById('config-supervisor').value.trim();

  guardarConfiguracionUsuario({ asesorDescuentos, usuarioSiebel, supervisor });

  const msg = document.getElementById('config-guardado-msg');
  msg.textContent = '✅ Configuración guardada';
  setTimeout(() => { msg.textContent = ''; }, 2000);
}
