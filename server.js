require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

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

/* ── Schema y Model ─────────────────────────────────────── */
const RegistroSchema = new mongoose.Schema({
  _seccion:        { type: String, required: true },  // obsitel, tienda, delivery
  _fecha:          String,
  _origen:         String,        // para papelera
  _fechaEliminado: String,
  _textoEditado:   String,
  _descripcion:    String,        // Nuevo: descripción opcional
  _nc:             String,        // Nuevo: valor NC persistido
  _formEnviado:    { type: Boolean, default: false },  // Nuevo: si se envió a Forms
  
  // Campos flexibles para obsitel, tienda, delivery
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

/* ── API Routes ─────────────────────────────────────────── */

/* GET todos los registros de una sección */
app.get('/api/:seccion', async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registros = await Registro.find({ _seccion: seccion }).sort({ createdAt: -1 });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST nuevo registro */
app.post('/api/:seccion', async (req, res) => {
  try {
    const { seccion } = req.params;
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = new Registro({
      ...req.body,
      _seccion: seccion
    });
    await registro.save();
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT editar registro */
app.put('/api/:seccion/:id', async (req, res) => {
  try {
    const { seccion, id } = req.params;
    if (!['obsitel', 'tienda', 'delivery', 'papelera'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    const registro = await Registro.findByIdAndUpdate(
      id,
      { ...req.body, _seccion: seccion },
      { new: true }
    );
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE mover a papelera */
app.delete('/api/:seccion/:id', async (req, res) => {
  try {
    const { seccion, id } = req.params;
    
    if (seccion === 'papelera') {
      // Eliminar definitivamente
      await Registro.findByIdAndDelete(id);
      return res.json({ ok: true });
    }
    
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    
    // Mover a papelera
    const registro = await Registro.findById(id);
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
app.delete('/api/:seccion', async (req, res) => {
  try {
    const { seccion } = req.params;
    
    if (seccion === 'papelera') {
      await Registro.deleteMany({ _seccion: 'papelera' });
      return res.json({ ok: true });
    }
    
    if (!['obsitel', 'tienda', 'delivery'].includes(seccion)) {
      return res.status(400).json({ error: 'Sección inválida' });
    }
    
    // Mover todos a papelera
    const registros = await Registro.find({ _seccion: seccion });
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
app.post('/api/papelera/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await Registro.findById(id);
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
