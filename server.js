require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const crypto  = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✓ MongoDB conectado');
  seedWhitelist();
})
.catch(err => {
  console.error('✗ Error MongoDB:', err.message);
  process.exit(1);
});

/* ── Schema Whitelist (Lista Blanca) ────────────────────── */
const WhitelistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true }
});
const Whitelist = mongoose.model('Whitelist', WhitelistSchema);

/* ── Schema User ────────────────────────────────────────── */
const UserSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true },
  nombre:    String,
  token:     { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

/* ── Schema Registro ────────────────────────────────────── */
const RegistroSchema = new mongoose.Schema({
  userId:          { type: String, required: true },
  _seccion:        { type: String, required: true },
  _fecha:          String,
  _origen:         String,
  _fechaEliminado: String,
  _textoEditado:   String,
  _descripcion:    String,
  _nc:             String,
  _formEnviado:    { type: Boolean, default: false },

  link: String, modalidad: String, entel: String, llamada: String,
  motivo: String, monto: String, recibo: String, periodo: String,

  pickup: String, nombre: String, dni: String, orden: String,
  referencia: String, tienda: String, pdv: String, tipo_venta: String,
  fecha: String, equipo: String,

  dir: String, ref: String, coord: String, numref: String,
  nombres: String, tipo: String, rango: String, sku: String
}, { strict: false, timestamps: true });

const Registro = mongoose.model('Registro', RegistroSchema);

/* ── Helper functions ───────────────────────────────────── */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function seedWhitelist() {
  try {
    const count = await Whitelist.countDocuments();
    if (count === 0) {
      await Whitelist.create([
        { email: 'lcjesus418@gmail.com' } // Correo del creador por defecto
      ]);
      console.log('✓ Lista blanca inicializada con correos por defecto');
    }
  } catch (err) {
    console.error('✗ Error al inicializar lista blanca:', err);
  }
}

/* ── Middleware: Validar Token del Backend ───────────────── */
async function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Token inválido' });
    req.userId = user._id.toString();
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ── Rutas de Autenticación ─────────────────────────────── */

/* POST /auth/firebase-login
   Verifica el ID token de Firebase, valida contra la Lista Blanca
   y retorna un token de sesión propio. */
app.post('/auth/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken es requerido' });

    // Verificar token contra el endpoint de Google
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Token de Firebase inválido o expirado' });
    }

    const payload = await googleRes.json();
    const email = payload.email?.toLowerCase();
    
    if (!email) {
      return res.status(400).json({ error: 'No se pudo obtener el correo del token' });
    }

    // Verificar si el correo está en la Lista Blanca
    const isAllowed = await Whitelist.findOne({ email });
    if (!isAllowed) {
      return res.status(403).json({ error: 'Acceso denegado: este correo no está en la lista blanca.' });
    }

    // Obtener o crear el usuario en MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        nombre: payload.name || email.split('@')[0]
      });
    }

    // Generar un nuevo token de sesión
    const token = generateToken();
    user.token = token;
    await user.save();

    res.json({ token, nombre: user.nombre, email: user.email });
  } catch (err) {
    console.error('Error en firebase-login:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ── API Routes (Protegidas) ────────────────────────────── */

app.get('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registros = await Registro.find({ _seccion: seccion, userId: req.userId }).sort({ createdAt: -1 });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = new Registro({ ...req.body, _seccion: seccion, userId: req.userId });
    await registro.save();
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/:seccion/:id', validateToken, async (req, res) => {
  try {
    const { seccion, id } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = await Registro.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { ...req.body, _seccion: seccion },
      { new: true }
    );
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:seccion/:id', validateToken, async (req, res) => {
  try {
    const { seccion, id } = req.params;
    if (seccion === 'papelera') {
      await Registro.findOneAndDelete({ _id: id, userId: req.userId });
      return res.json({ ok: true });
    }
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = await Registro.findOne({ _id: id, userId: req.userId });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    
    registro._seccion = 'papelera';
    registro._origen = seccion;
    registro._fechaEliminado = new Date().toLocaleString('es-PE');
    await registro.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    if (seccion === 'papelera') {
      await Registro.deleteMany({ _seccion: 'papelera', userId: req.userId });
      return res.json({ ok: true });
    }
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registros = await Registro.find({ _seccion: seccion, userId: req.userId });
    for (const reg of registros) {
      reg._seccion = 'papelera';
      reg._origen = seccion;
      reg._fechaEliminado = new Date().toLocaleString('es-PE');
      await reg.save();
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/papelera/:id/restore', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await Registro.findOne({ _id: id, userId: req.userId });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    if (registro._seccion !== 'papelera') return res.status(400).json({ error: 'No está en papelera' });
    
    const origen = registro._origen || 'obsitel';
    registro._seccion = origen;
    registro._origen = undefined;
    registro._fechaEliminado = undefined;
    await registro.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Obsitel backend en http://localhost:${PORT}`);
});
