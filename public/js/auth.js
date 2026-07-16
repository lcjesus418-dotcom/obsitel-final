/* ════════════════════════════════════════════════════════
   auth.js  –  Lógica de autenticación con Firebase
   
   Maneja: login por correo, registro, login con Google,
   logout, y la protección de rutas (login.html <-> index.html).
   ════════════════════════════════════════════════════════ */

/* ── Guard de rutas: redirige según el estado de sesión ─── */
auth.onAuthStateChanged((user) => {
  const pathname = window.location.pathname;
  const enPaginaLogin = pathname.endsWith('login.html');
  const enInicio = pathname === '/' || pathname.endsWith('inicio.html');

  if (user && (enPaginaLogin || enInicio)) {
    // Ya hay sesión y está en login/inicio -> ir a la app
    window.location.href = '/index.html';
  } else if (!user && !enPaginaLogin && !enInicio) {
    // No hay sesión y está en la app -> ir a login
    window.location.href = '/login.html';
  } else if (!user && (enPaginaLogin || enInicio)) {
    // Sin sesión en login/inicio -> ocultar loading y dejar que se vea la página de login
    const loadingOverlay = document.getElementById('auth-loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  } else if (user && !enPaginaLogin && !enInicio) {
    // Sesión activa en la app -> mostrar nombre/correo y cargar datos
    
    // Ocultar la pantalla de carga
    const loadingOverlay = document.getElementById('auth-loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    
    const nombreEl = document.getElementById('usuario-actual');
    if (nombreEl) nombreEl.textContent = user.displayName || user.email;
    
    // Mostrar todo el contenido de la app (que estaba oculto con display: none)
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.style.display = 'block';
    
    if (typeof iniciarApp === 'function') iniciarApp();
  }
});

/* ── Obtener el token actual (para llamadas al backend) ──── */
async function obtenerTokenAuth() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/* ════════════════════════════════════════════════════════
   Funciones usadas en login.html
   ════════════════════════════════════════════════════════ */

function mostrarErrorAuth(mensaje) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = mensaje;
  el.style.display = 'block';
}

function limpiarErrorAuth() {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function traducirErrorFirebase(error) {
  const codigo = error.code || '';
  const mapa = {
    'auth/invalid-email':            'El correo no es válido.',
    'auth/user-disabled':            'Esta cuenta ha sido deshabilitada.',
    'auth/user-not-found':           'No existe una cuenta con este correo.',
    'auth/wrong-password':           'Contraseña incorrecta.',
    'auth/invalid-credential':       'Correo o contraseña incorrectos.',
    'auth/email-already-in-use':     'Ya existe una cuenta con este correo.',
    'auth/weak-password':            'La contraseña debe tener al menos 6 caracteres.',
    'auth/popup-closed-by-user':     'Se cerró la ventana de Google antes de terminar.',
    'auth/network-request-failed':   'Error de conexión. Verifica tu internet.'
  };
  return mapa[codigo] || 'Ocurrió un error. Intenta nuevamente.';
}

/* ── Login con correo y contraseña ───────────────────────── */
async function loginConCorreo() {
  limpiarErrorAuth();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;

  if (!email || !pass) {
    mostrarErrorAuth('Completa correo y contraseña.');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // onAuthStateChanged se encarga de la redirección
  } catch (error) {
    mostrarErrorAuth(traducirErrorFirebase(error));
  }
}

/* ── Registro con correo y contraseña ────────────────────── */
async function registrarConCorreo() {
  limpiarErrorAuth();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;

  if (!email || !pass) {
    mostrarErrorAuth('Completa correo y contraseña.');
    return;
  }
  if (pass.length < 6) {
    mostrarErrorAuth('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, pass);
    // onAuthStateChanged se encarga de la redirección
  } catch (error) {
    mostrarErrorAuth(traducirErrorFirebase(error));
  }
}

/* ── Login con Google ────────────────────────────────────── */
async function loginConGoogle() {
  limpiarErrorAuth();
  try {
    await auth.signInWithPopup(googleProvider);
    // onAuthStateChanged se encarga de la redirección
  } catch (error) {
    mostrarErrorAuth(traducirErrorFirebase(error));
  }
}

/* ── Alternar entre modo Login / Registro ────────────────── */
let modoRegistro = false;
function alternarModoAuth() {
  modoRegistro = !modoRegistro;
  limpiarErrorAuth();

  const titulo   = document.getElementById('auth-titulo');
  const btnMain  = document.getElementById('btn-auth-principal');
  const btnToggle = document.getElementById('btn-auth-toggle');

  if (modoRegistro) {
    titulo.textContent = 'Crear cuenta';
    btnMain.textContent = 'Registrarme';
    btnMain.onclick = registrarConCorreo;
    btnToggle.textContent = '¿Ya tienes cuenta? Inicia sesión';
  } else {
    titulo.textContent = 'Iniciar sesión';
    btnMain.textContent = 'Ingresar';
    btnMain.onclick = loginConCorreo;
    btnToggle.textContent = '¿No tienes cuenta? Regístrate';
  }
}

/* ════════════════════════════════════════════════════════
   Logout (usado desde index.html)
   ════════════════════════════════════════════════════════ */
async function cerrarSesion() {
  if (!confirm('¿Cerrar sesión?')) return;
  await auth.signOut();
  // onAuthStateChanged redirige a login.html
}
