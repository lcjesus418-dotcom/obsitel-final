# Motor Genérico de Integración con Google Forms

## ¿Qué se agregó?

3 archivos nuevos en `public/js/`:

| Archivo | Qué hace |
|---|---|
| `formsConfig.js` | Configuración de cada formulario (URL, entries, reglas, validaciones) |
| `googleFormsEngine.js` | El motor: UNA función `enviarAGoogleForms(tipo, voucher)` que hace todo |
| `configApp.js` | Sección "Configuración" — Usuario Siebel y Supervisor (guardados en localStorage) |

---

## ⚠️ ACCIÓN REQUERIDA: Configurar el formulario de Ventas

Abre `public/js/formsConfig.js` y busca el bloque `ventas:`.

Ahí verás placeholders como `entry.REEMPLAZAR_1`. Necesitas reemplazarlos con los
valores REALES de tu Google Form de Ventas.

### Cómo obtener la URL y los entry reales:

1. Abre tu Google Form de Ventas
2. Click en los 3 puntos (⋮) arriba a la derecha
3. Click en **"Obtener enlace precompletado"**
4. Llena cualquier valor de prueba en cada campo
5. Click **"Obtener enlace"**
6. Copia la URL que te da. Se ve así:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLS.../viewform?usp=pp_url&entry.111111111=A&entry.222222222=B...
   ```
7. La parte antes de `?` es tu `url`.
8. Cada `entry.XXXXXXX=valor` te dice qué entry corresponde a qué campo (compara con el orden en que llenaste el formulario).

Reemplaza cada `entry.REEMPLAZAR_X` en `formsConfig.js` con el entry real correspondiente.

---

## Cómo agregar un formulario nuevo en el futuro

1. Abre `formsConfig.js`
2. Copia el bloque `descuentos: { ... }` completo
3. Pégalo con un nombre nuevo, ej: `reportes: { ... }`
4. Cambia la `url`, los `entries`, `camposObligatorios`, `opcionesValidas` y `reglas`
5. **No toques `googleFormsEngine.js`** — el motor ya sabe leer cualquier configuración nueva

En `app.js`, decide qué tipo de formulario usar según la sección:
```javascript
const tipoForm = (seccion === 'tienda' || seccion === 'delivery') ? 'ventas' : 'descuentos';
```//
Si agregas un tercer tipo de sección, solo agrega una condición más ahí.

---

## Reglas de conversión (editables en código)

En `formsConfig.js`, cada formulario tiene un objeto `reglas`. Cada regla es una función:

```javascript
reglas: {
  modalidad: (valor) => normalizarTexto(valor).toUpperCase(),
  operadorLogistico: (valor, voucher) => voucher._seccion === 'delivery' ? 'Logixtal' : 'Tienda',
  usuarioSiebel: (valor, voucher, config) => config.usuarioSiebel || ''
}
```

Para agregar una nueva regla, simplemente agrega una función más siguiendo el mismo patrón.

---

## Configuración de Usuario (Usuario Siebel / Supervisor)

- Se guarda en **localStorage** (persiste entre sesiones, pero es por dispositivo/navegador)
- El motor SIEMPRE lee estos valores desde ahí, nunca del voucher
- Para agregar más nombres a los desplegables, edita los arrays en `configApp.js`:

```javascript
const OPCIONES_USUARIO_SIEBEL = [
  'Bernilla Carrillo Martin Daniel',
  'Nuevo Nombre Aqui'
];
```

---

## Validaciones que aplica el motor automáticamente

1. **Campos obligatorios** — si falta uno, muestra qué falta y no abre el formulario
2. **Formato de URL** — verifica que el link tenga estructura válida
3. **Opciones válidas** — si un valor no coincide EXACTO con las opciones del `datalist` real de Google Forms, no lo envía
4. **Limpieza de texto** — quita espacios extra al inicio/final y colapsa espacios dobles
5. **Campos no usados** — si un formulario no usa un dato del voucher, simplemente lo ignora (no rompe nada)
