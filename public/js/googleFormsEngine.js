/* ════════════════════════════════════════════════════════
   googleFormsEngine.js  –  Motor genérico de integración
   
   Una única función central: enviarAGoogleForms(tipo, voucher)
   Todo lo demás (validar, limpiar, convertir, construir URL)
   sucede aquí, leyendo SIEMPRE desde FORMS_CONFIG.
   ════════════════════════════════════════════════════════ */

/**
 * Función central del motor.
 * @param {string} tipoFormulario - 'descuentos' | 'ventas' | ... (clave en FORMS_CONFIG)
 * @param {object} voucher        - datos del voucher (sin nada de Google Forms adentro)
 * @param {HTMLElement} iconEl    - (opcional) ícono que disparó la acción, para feedback visual
 */
function enviarAGoogleForms(tipoFormulario, voucher, iconEl) {
  const config = FORMS_CONFIG[tipoFormulario];

  if (!config) {
    alert(`Error interno: no existe configuración para "${tipoFormulario}"`);
    return;
  }

  const userConfig = obtenerConfiguracionUsuario();

  /* ── 1. Validar campos obligatorios ────────────────────── */
  const faltantes = validarCamposObligatorios(config, voucher);
  if (faltantes.length > 0) {
    mostrarErrorValidacion(faltantes);
    return;
  }

  /* ── 2. Validar URL ─────────────────────────────────────── */
  if (voucher.link && !validarURL(asegurarProtocolo(voucher.link))) {
    alert('El link ingresado no tiene un formato de URL válido.');
    return;
  }

  /* ── 3. Construir los valores finales (aplicando reglas) ─ */
  const valoresFinales = {};
  for (const campo of Object.keys(config.entries)) {
    const valorOriginal = voucher[campo];
    const regla = config.reglas ? config.reglas[campo] : null;

    let valorFinal;
    if (regla) {
      valorFinal = regla(valorOriginal, voucher, userConfig);
    } else if (valorOriginal !== undefined) {
      valorFinal = normalizarTexto(valorOriginal);
    } else {
      // El voucher no trae este campo: se ignora (no rompe nada)
      continue;
    }

    valoresFinales[campo] = valorFinal;
  }

  /* ── 4. Validar que las opciones coincidan exactamente ──── */
  if (config.opcionesValidas) {
    for (const campo of Object.keys(config.opcionesValidas)) {
      const valor = valoresFinales[campo];
      const opciones = config.opcionesValidas[campo];
      if (valor && !opciones.includes(valor)) {
        alert(
          `El valor "${valor}" del campo "${campo}" no coincide con ninguna ` +
          `opción válida del formulario.\n\nOpciones válidas: ${opciones.join(', ')}`
        );
        return;
      }
    }
  }

  /* ── 5. Construir la URL final con los entry ────────────── */
  const params = new URLSearchParams();
  for (const campo of Object.keys(valoresFinales)) {
    const entryId = config.entries[campo];
    if (!entryId) continue;
    params.set(entryId, valoresFinales[campo] ?? '');
  }

  const urlFinal = `${config.url}?${params.toString()}`;

  /* ── 6. Abrir Google Forms ──────────────────────────────── */
  window.open(urlFinal, '_blank');

  /* ── 7. Feedback visual (ícono se colorea) ──────────────── */
  if (iconEl) {
    setTimeout(() => iconEl.classList.add('enviado'), 400);
  }
}

/* ════════════════════════════════════════════════════════
   Validaciones
   ════════════════════════════════════════════════════════ */

function validarCamposObligatorios(config, voucher) {
  const faltantes = [];
  for (const campo of config.camposObligatorios || []) {
    const valor = voucher[campo];
    if (!valor || String(valor).trim() === '') {
      faltantes.push(campo);
    }
  }
  return faltantes;
}

function validarURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function mostrarErrorValidacion(camposFaltantes) {
  const lista = camposFaltantes.map(c => `• ${c}`).join('\n');
  alert(
    'No es posible enviar el formulario porque existen campos ' +
    'obligatorios sin completar.\n\n' +
    'Complete los siguientes campos para continuar:\n\n' +
    lista
  );
}

/* ════════════════════════════════════════════════════════
   Configuración del usuario (Usuario Siebel, Supervisor)
   Persistida en localStorage, leída siempre por el motor
   ════════════════════════════════════════════════════════ */

const CONFIG_STORAGE_KEY = 'obsitel_config_usuario';

function obtenerConfiguracionUsuario() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { usuarioSiebel: '', supervisor: '' };
  } catch {
    return { usuarioSiebel: '', supervisor: '' };
  }
}

function guardarConfiguracionUsuario(nuevaConfig) {
  const actual = obtenerConfiguracionUsuario();
  const actualizada = { ...actual, ...nuevaConfig };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(actualizada));
  return actualizada;
}
