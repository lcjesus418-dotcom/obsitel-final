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

    entries: {
      link:      'entry.710025431',
      modalidad: 'entry.692017987',
      motivo:    'entry.679986135',
      monto:     'entry.471539355',
      nc:        'entry.1673361831',
      asesor:    'entry.1628070971'
    },

    camposObligatorios: ['link', 'modalidad', 'motivo', 'monto'],

    opcionesValidas: {
      modalidad: ['NC', 'OCC', 'DEVOLUCIÓN DE SALDO']
    },

    reglas: {
      modalidad: (valor) => normalizarTexto(valor).toUpperCase(),
      motivo:    (valor) => normalizarTexto(valor).toUpperCase(),
      link:      (valor) => asegurarProtocolo(valor),
      asesor:    (valor, voucher, config) => config.usuarioSiebel || ''
    }
  },

  /* ──────────────────────────────────────────────────────
     FORMULARIO: VENTAS (Tienda + Delivery)
     Una sola URL compartida. El campo "operadorLogistico"
     decide qué sección ve Google Forms (Tienda o Logixtal).
     ────────────────────────────────────────────────────── */
  ventas: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc3Do1gjNqAjComOWaag63Ktv-l1v3V1jWPbnsiKgO4RSfZhw/viewform',

    entries: {
      // ── Primera página (compartida Tienda / Delivery) ──
      link:              'entry.430850105',
      dni:               'entry.1802650898',
      orden:             'entry.1831883',
      tipo_venta:        'entry.522329256',
      fecha:             'entry.1644009475',
      horario:           'entry.756982391',
      operadorLogistico: 'entry.2107675316',

      // ── Segunda página (solo Tienda) ──
      supervisor:        'entry.284304021',
      usuarioSiebel:     'entry.233648853',

      // ── Última página (compartida) ──
      sku:               'entry.1620499627',
      accesorio:         'entry.919354596',
      promoLLAA:         'entry.695687517'
    },

    camposObligatorios: ['link', 'dni', 'orden', 'tipo_venta', 'fecha'],

    opcionesValidas: {
      tipo_venta: [
        'Reno - Financiado con Entel-Oferta regular',
        'Reno - Oferta tarjeta de crédito sin intereses',
        'Porta - Línea Nueva',
        'Porta - Línea Adicional',
        'Venta Regular - Línea Nueva',
        'Venta Regular - Línea Adicional',
        'Accesorio'
      ],
      accesorio: ['Sí', 'No']
    },

    reglas: {
      dni:        (valor) => normalizarTexto(valor),
      tipo_venta: (valor) => normalizarTexto(valor),
      link:       (valor) => asegurarProtocolo(valor),

      // Operador Logístico depende del ORIGEN del voucher (tienda o delivery)
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
   ════════════════════════════════════════════════════════ */

function normalizarTexto(texto) {
  if (!texto) return '';
  return String(texto)
    .trim()
    .replace(/\s+/g, ' ');
}

function asegurarProtocolo(url) {
  if (!url) return '';
  url = normalizarTexto(url);
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}
