# Descuento Obsitel v2 — MongoDB + Google Forms + Frontend Netlify

## 📋 Estructura

```
obsitel-final/
├── server.js              ← Backend (Express + MongoDB)
├── package.json
├── .env.example           ← Copiar a .env (sin subir a GitHub)
├── .gitignore
└── public/
    ├── index.html         ← Frontend
    ├── assets/
    │   └── google-forms.png   ← Ícono Google Forms
    ├── css/
    │   └── styles.css
    └── js/
        └── app.js
```

---

## 🚀 Instalación Local (opcional, para probar)

```bash
# 1. Clonar/descargar el proyecto
cd obsitel-final

# 2. Instalar dependencias
npm install

# 3. Crear .env con tu MongoDB URI
cat > .env << EOF
MONGODB_URI=mongodb+srv://lcjesus418_db_user:961258912Lc...@entel-descuento.tghcyzd.mongodb.net/?appName=entel-descuento
PORT=3000
NODE_ENV=production
EOF

# 4. Iniciar servidor
npm start
```

Abre http://localhost:3000

---

## 📦 Desplegar en Render (Backend)

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/lcjesus418-dotcom/obsitel-final.git
git push -u origin main
```

(Reemplaza `lcjesus418-dotcom/obsitel-final.git` con tu repo)

### Paso 2: Conectar a Render

1. Ve a https://render.com/
2. **Nuevo > Web Service**
3. Conecta tu repo GitHub de `obsitel-final`
4. Elige la rama `main`
5. Configuración:
   - **Name**: `obsitel-descuento`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: Node
   - **Build**: `npm install`
   - **Start**: `npm start`

6. **Environment Variables** — Agregar:
   ```
   MONGODB_URI = mongodb+srv://lcjesus418_db_user:961258912Lc...@entel-descuento.tghcyzd.mongodb.net/?appName=entel-descuento
   NODE_ENV = production
   ```

7. Click **Create Web Service**

**Render URL**: https://obsitel-descuento.onrender.com

---

## 🌐 Desplegar Frontend en Netlify

### Opción A: Drag & Drop (más simple)

1. Ve a https://app.netlify.com/
2. Drag & drop la carpeta `public/` a la pantalla
3. Listo (se asigna URL automática)

### Opción B: Conectar GitHub

1. Ve a https://app.netlify.com/
2. **Add new site > Import an existing project**
3. Conecta tu repo
4. Build settings:
   - **Base directory**: `public`
   - **Build command**: (dejar vacío)
   - **Publish directory**: `.`
5. Click **Deploy site**

**Importante**: Si usas Netlify, actualiza `API` en `app.js`:
```javascript
const API = 'https://obsitel-descuento.onrender.com/api';
```

---

## 🔐 Seguridad

- **NUNCA** subas `.env` a GitHub (ya está en `.gitignore`)
- La contraseña de MongoDB solo va en Render Environment Variables
- Si comprometes la contraseña, cambia en MongoDB Atlas

---

## 📊 API Endpoints

| Método | Ruta                          | Descripción |
|--------|-------------------------------|-------------|
| GET    | `/api/:seccion`               | Obtener registros |
| POST   | `/api/:seccion`               | Guardar registro |
| PUT    | `/api/:seccion/:id`           | Editar registro |
| DELETE | `/api/:seccion/:id`           | Mover a papelera |
| DELETE | `/api/:seccion`               | Vaciar sección |
| POST   | `/api/papelera/:id/restore`   | Restaurar |
| DELETE | `/api/papelera/:id`           | Eliminar permanente |
| DELETE | `/api/papelera`               | Vaciar papelera |

Secciones: `obsitel`, `tienda`, `delivery`, `papelera`

---

## ✨ Features v2

✅ MongoDB Atlas — datos persistentes  
✅ Google Forms — integración automática  
✅ Viñeta NC — persiste y envía a Forms  
✅ Descripción — campo opcional por registro  
✅ Restauración desde papelera  
✅ Ícono morado que se activa al enviar Forms  
✅ Datalist inteligentes (Modalidad, Motivo, etc.)  
✅ Validación de campos  
✅ Feedback visual "Guardado"  

---

## 🐛 Troubleshooting

**¿Los datos no aparecen?**
- Verifica que la MONGODB_URI esté correcta en Render
- Revisa la consola del navegador (F12)

**¿El ícono Google Forms no aparece?**
- Verifica que `public/assets/google-forms.png` exista en tu repo

**¿Netlify no ve la web?**
- Asegúrate de usar `const API = 'https://obsitel-descuento.onrender.com/api'`
- El archivo `index.html` debe estar en `public/`

---

## 📝 Contraseña MongoDB

```
Usuario:   lcjesus418_db_user
Password:  961258912Lc...
Cluster:   entel-descuento.tghcyzd.mongodb.net
```

(Usa esta en Render Environment Variables)

