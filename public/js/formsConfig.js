/* ════════════════════════════════════════════════════════
   formsConfig.js  –  Configuración centralizada de formularios
   
   Para agregar un nuevo formulario en el futuro:
   1. Copia un bloque completo (ej. "descuentos")
   2. Cambia la url, los entries y las reglas
   3. Dale un nombre nuevo (ej. "reportes")
   4. ¡Listo! No hay que tocar el motor (googleFormsEngine.js)
   ════════════════════════════════════════════════════════ */

const FORMS_CONFIG = {

  /* ──────────────────────────────────────────────────────
     FORMULARIO: DESCUENTOS (Obsitel)
     ────────────────────────────────────────────────────── */
  descuentos: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSey7MiTjSTNtl0H1pP39cZLQIvtQZlPtVN4gykdzeiVzDPfTQ/viewform',

    // Mapeo: campo interno del voucher -> entry de Google Forms
    entries: {
      link:      'entry.710025431',
      modalidad: 'entry.692017987',
      motivo:    'entry.679986135',
      monto:     'entry.471539355',
      nc:        'entry.1673361831',
      asesor:    'entry.1628070971'
    },

    // Campos obligatorios para poder enviar (deben tener valor)
    camposObligatorios: ['link', 'modalidad', 'motivo', 'monto'],

    // Opciones válidas para ciertos campos (validación estricta)
    // Si el valor no coincide EXACTO con una de estas opciones, no se envía
    opcionesValidas: {
      modalidad: ['NC', 'OCC', 'DEVOLUCIÓN DE SALDO']
    },

    // Reglas de conversión: se aplican antes de enviar
    reglas: {
      modalidad: (valor) => normalizarTexto(valor).toUpperCase(),
      motivo:    (valor) => normalizarTexto(valor).toUpperCase(),
      link:      (valor) => asegurarProtocolo(valor),
      // El asesor SIEMPRE se lee desde Configuración, nunca desde el voucher
      asesor:    (valor, voucher, config) => config.usuarioSiebel || ''
    }
  },

  /* ──────────────────────────────────────────────────────
     FORMULARIO: VENTAS (Tienda + Delivery)
     
     ⚠️ IMPORTANTE: Reemplaza la URL y los "entry.XXXXXXX" con
     los valores REALES de tu Google Form de Ventas.
     Puedes obtenerlos abriendo el formulario, click en los
     3 puntos > "Obtener enlace precompletado", llenas cualquier
     dato y Google te genera la URL con los entry correctos.
     ────────────────────────────────────────────────────── */
  ventas: {
    url: 'https://docs.google.com/forms/d/e/REEMPLAZAR_CON_TU_FORM_ID/viewform',

    entries: {
      // ── Primera página (compartida Tienda / Delivery) ──
      tipoVenta:         'entry.REEMPLAZAR_1',
      fechaEntrega:      'entry.REEMPLAZAR_2',
      horario:           'entry.REEMPLAZAR_3',
      dni:               'entry.REEMPLAZAR_4',
      orden:             'entry.REEMPLAZAR_5',
      operadorLogistico: 'entry.REEMPLAZAR_6',

      // ── Segunda página (solo Tienda) ──
      tienda:            'entry.REEMPLAZAR_7',
      pdv:               'entry.REEMPLAZAR_8',
      pickup:            'entry.REEMPLAZAR_9',

      // ── Última página (compartida) ──
      nombre:            'entry.REEMPLAZAR_10',
      equipo:            'entry.REEMPLAZAR_11',
      usuarioSiebel:     'entry.REEMPLAZAR_12',
      supervisor:        'entry.REEMPLAZAR_13'
    },

    camposObligatorios: ['tipoVenta', 'fechaEntrega', 'dni', 'orden'],

    opcionesValidas: {
      tipoVenta: ['Renovep', 'Renocontado', 'Renovep + Linea', 'Renocontado + Linea']
    },

    reglas: {
      tipoVenta:    (valor) => normalizarTexto(valor),
      nombre:       (valor) => normalizarTexto(valor),
      dni:          (valor) => normalizarTexto(valor),

      // Regla clave: Operador Logístico depende del ORIGEN del voucher
      operadorLogistico: (valor, voucher) => {
        return voucher._seccion === 'delivery' ? 'Logixtal' : 'Tienda';
      },

      // Usuario Siebel y Supervisor SIEMPRE vienen de Configuración
      usuarioSiebel: (valor, voucher, config) => config.usuarioSiebel || '',
      supervisor:    (valor, voucher, config) => config.supervisor || ''
    }
  }

};

/* ════════════════════════════════════════════════════════
   Helpers de limpieza / normalización de texto
   Usados por las reglas de conversión de arriba
   ════════════════════════════════════════════════════════ */

function normalizarTexto(texto) {
  if (!texto) return '';
  return String(texto)
    .trim()                    // quita espacios al inicio/final
    .replace(/\s+/g, ' ');     // colapsa espacios múltiples en uno
}

function asegurarProtocolo(url) {
  if (!url) return '';
  url = normalizarTexto(url);
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}
