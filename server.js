require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const crypto  = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/* ── MongoDB Connection ─────────────────────────────────── */
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ MongoDB conectado'))
.catch(err => {
  console.error('✗ Error MongoDB:', err.message);
  process.exit(1);
});

/* ── Schema User ────────────────────────────────────────── */
const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  nombre:   { type: String, required: true },
  token:    { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

/* ── Schema Registro (con userId) ────────────────────────── */
const RegistroSchema = new mongoose.Schema({
  userId:          { type: String, required: true },  // ID del usuario
  _seccion:        { type: String, required: true },  // obsitel, tienda, delivery
  _fecha:          String,
  _origen:         String,
  _fechaEliminado: String,
  _textoEditado:   String,
  _descripcion:    String,
  _nc:             String,
  _formEnviado:    { type: Boolean, default: false },
  
  link:       String,
  modalidad:  String,
  entel:      String,
  llamada:    String,
  motivo:     String,
  monto:      String,
  recibo:     String,
  periodo:    String,
  
  pickup:     String,
  nombre:     String,
  dni:        String,
  orden:      String,
  referencia: String,
  tienda:     String,
  pdv:        String,
  tipo_venta: String,
  fecha:      String,
  equipo:     String,
  
  dir:        String,
  ref:        String,
  coord:      String,
  numref:     String,
  nombres:    String,
  tipo:       String,
  rango:      String,
  sku:        String
}, { strict: false, timestamps: true });

const Registro = mongoose.model('Registro', RegistroSchema);

/* ── Helper: Hash password ──────────────────────────────── */
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* ── Middleware: Validar token ──────────────────────────── */
function validateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  User.findOne({ token }).then(user => {
    if (!user) return res.status(401).json({ error: 'Token inválido' });
    req.userId = user._id;
    next();
  }).catch(err => res.status(500).json({ error: err.message }));
}

/* ── AUTH ROUTES ────────────────────────────────────────– */

/* POST /auth/register */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Email, password y nombre son requeridos' });
    }
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'El email ya existe' });
    
    const token = generateToken();
    const user = new User({
      email,
      password: hashPassword(password),
      nombre,
      token
    });
    
    await user.save();
    res.json({ token, nombre, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /auth/login */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email no encontrado' });
    
    const validPwd = user.password === hashPassword(password);
    if (!validPwd) return res.status(401).json({ error: 'Contraseña incorrecta' });
    
    const token = generateToken();
    user.token = token;
    await user.save();
    
    res.json({ token, nombre: user.nombre, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /auth/logout */
app.post('/auth/logout', validateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { token: null });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── API Routes (con autenticación) ─────────────────────── */

/* GET todos los registros de una sección (del usuario) */
app.get('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registros = await Registro.find({
      userId: req.userId,
      _seccion: seccion
    }).sort({ createdAt: -1 });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST nuevo registro */
app.post('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = new Registro({
      ...req.body,
      userId: req.userId,
      _seccion: seccion
    });
    await registro.save();
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT editar registro */
app.put('/api/:seccion/:id', validateToken, async (req, res) => {
  try {
    const { seccion, id } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = await Registro.findOne({ _id: id, userId: req.userId });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    
    Object.assign(registro, req.body);
    registro._seccion = seccion;
    await registro.save();
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE mover a papelera */
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

/* DELETE vaciar sección o papelera */
app.delete('/api/:seccion', validateToken, async (req, res) => {
  try {
    const { seccion } = req.params;
    
    if (seccion === 'papelera') {
      await Registro.deleteMany({ userId: req.userId, _seccion: 'papelera' });
      return res.json({ ok: true });
    }
    
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    
    const registros = await Registro.find({ userId: req.userId, _seccion: seccion });
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

/* POST restaurar desde papelera */
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

/* Server start */
app.listen(PORT, () => {
  console.log(`🚀 Obsitel backend en http://localhost:${PORT}`);
});
