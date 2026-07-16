# Configuración de Login con Firebase

## ⚠️ Antes de subir, hay 3 cosas que DEBES configurar

Sin esto, el login no va a funcionar (dará error).

---

## 1️⃣ Habilitar los métodos de acceso en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) → tu proyecto `baucher-f0634`
2. Menú lateral → **Authentication** → pestaña **Sign-in method**
3. Habilita:
   - **Correo electrónico/contraseña** → Habilitar → Guardar
   - **Google** → Habilitar → selecciona un correo de soporte → Guardar

---

## 2️⃣ Autorizar tus dominios

En la misma sección de Authentication → pestaña **Settings** → **Authorized domains**:

Agrega:
- `obsitel-descuento.onrender.com` (tu dominio de Render)
- El dominio de Netlify si lo sigues usando (ej: `tu-sitio.netlify.app`)
- `localhost` (ya debería estar, para pruebas locales)

**Sin esto, el botón "Continuar con Google" va a fallar con error de dominio no autorizado.**

---

## 3️⃣ Generar credenciales para el backend (Render)

El backend necesita verificar que cada usuario esté realmente logueado. Para eso necesita una "llave de servicio":

1. Firebase Console → ⚙️ (ícono de engranaje) → **Configuración del proyecto**
2. Pestaña **Cuentas de servicio**
3. Click **Generar nueva clave privada** → se descarga un archivo `.json`
4. Abre ese archivo — necesitas 3 datos de ahí: `project_id`, `client_email`, `private_key`

### En Render:

Ve a tu servicio → **Environment** → agrega estas 3 variables:

| Variable | Valor (del archivo .json descargado) |
|---|---|
| `FIREBASE_PROJECT_ID` | el valor de `project_id` |
| `FIREBASE_CLIENT_EMAIL` | el valor de `client_email` |
| `FIREBASE_PRIVATE_KEY` | el valor de `private_key` (incluye las comillas y los `\n`, cópialo tal cual) |

⚠️ **Nunca subas ese archivo `.json` a GitHub** — contiene una llave privada. Solo se usa para copiar los 3 valores a Render.

Guarda y Render va a reiniciar el servicio automáticamente.

---

## 📌 Nota importante sobre tus datos actuales

Como ahora cada usuario ve **solo sus propios vouchers**, los registros que ya tenías guardados (antes del login) **no tienen dueño asignado**, así que no van a aparecer para nadie. Es información vieja de prueba, así que no debería ser un problema — pero te aviso para que no pienses que se "perdió" algo.

---

## ✅ Cómo probar

1. Sube los cambios (`git push`) y agrega las 3 variables de entorno en Render
2. Espera a que Render termine de re-desplegar
3. Abre tu web — debería mandarte directo a `/login.html`
4. Crea una cuenta con correo, o entra con Google
5. Deberías ver la app vacía (tus datos empiezan de cero, por usuario)
