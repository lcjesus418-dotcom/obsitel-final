require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const admin   = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ── Cuando accedes a /, sirve inicio.html (página de redirección) ── */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/inicio.html');
});

app.use(express.static('public'));

/* ── Firebase Admin (verificación de tokens) ─────────────── */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId:  process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  })
});

/* ── Middleware: verifica el token en cada request a /api ── */
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    next();
  } catch (err) {
    console.error('Token inválido:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/* ── MongoDB ──────────────────────────────────────────────── */
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✓ MongoDB conectado'))
.catch(err => {
  console.error('✗ Error MongoDB:', err.message);
  process.exit(1);
});

const RegistroSchema = new mongoose.Schema({
  userId:          { type: String, required: true, index: true },
  _seccion:        { type: String, required: true },
  _fecha:          String,
  _origen:         String,
  _fechaEliminado: String,
  _textoEditado:   String,
  _descripcion:    String,
  _nc:             String,
  _accesorio:      String,
  _promoLLAA:      String,
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

/* ── A partir de aquí, TODAS las rutas /api exigen sesión ── */
app.use('/api', verificarToken);

app.get('/api/:seccion', async (req, res) => {
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

app.post('/api/:seccion', async (req, res) => {
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

app.put('/api/:seccion/:id', async (req, res) => {
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

app.delete('/api/:seccion/:id', async (req, res) => {
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

app.delete('/api/:seccion', async (req, res) => {
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

app.post('/api/papelera/:id/restore', async (req, res) => {
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
