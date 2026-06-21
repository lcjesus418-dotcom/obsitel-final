# Descuento Obsitel — Deploy Frontend en Netlify

## 📦 Archivos que necesitas (carpeta `public/`)

```
public/
├── index.html
├── assets/
│   └── google-forms.png
├── css/
│   └── styles.css
└── js/
    └── app.js
```

---

## ⚙️ IMPORTANTE: Configurar API Backend

Antes de subir a Netlify, abre **`public/js/app.js`** y busca la línea:

```javascript
const API = window.location.origin + '/api';
```

**Cámbiala a:**

```javascript
const API = 'https://obsitel-descuento.onrender.com/api';
```

(Usa la URL que Render te dará después de desplegar)

---

## 🚀 Opción 1: Drag & Drop (Más Rápido)

1. Ve a https://app.netlify.com/ (lógueate si es necesario)
2. **Arrastra la carpeta `public/` completa** a la pantalla
3. Netlify sube automáticamente y te da una URL (ej: `https://obsitel-xxx.netlify.app`)

**Listo.** El frontend funciona (apunta a tu backend en Render).

---

## 🔗 Opción 2: Conectar con GitHub (Opcional)

Si quieres auto-deploy cada vez que hagas push:

1. Ve a https://app.netlify.com/
2. **Add new site > Import an existing project**
3. Selecciona tu repo GitHub `obsitel-final`
4. **Netlify settings**:
   - Base directory: `public`
   - Build command: (dejar vacío)
   - Publish directory: `.`
5. Click **Deploy site**

Cada vez que hagas `git push`, Netlify redeploy automáticamente.

---

## 📍 URLs finales

**Backend (Render):**
```
https://obsitel-descuento.onrender.com
```

**Frontend (Netlify):**
```
https://obsitel-xxx.netlify.app  (varía según tu deploy)
```

El frontend hace fetch a `https://obsitel-descuento.onrender.com/api`.

---

## ✅ Verificación

Abre el frontend en Netlify y:
1. Crea un Descuento Obsitel (llena los campos)
2. Verifica que aparece en el historial
3. Escribr un número en la viñeta NC (ej: 123456)
4. Click en el ícono morado de Google Forms
5. Debería abrir Google Forms con los datos autocompletados

Si no funciona, abre **DevTools (F12) → Console** y busca errores de conexión.

---

## 🔐 Notas de Seguridad

- La contraseña de MongoDB está en **Render**, no en el código
- El frontend en Netlify es **público** (código visible, normal)
- Solo la API en Render accede a MongoDB

---

## 📞 Soporte

- Netlify docs: https://docs.netlify.com/
- Render docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

