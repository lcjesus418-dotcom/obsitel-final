/* ════════════════════════════════════════════════════════
   auth.js  –  Lógica de Login/Registro
   ════════════════════════════════════════════════════════ */

const API = 'https://obsitel-descuento.onrender.com';
let TOKEN = localStorage.getItem('obsitel_token');
let USER_NAME = localStorage.getItem('obsitel_nombre');

/* ── Cambiar entre Login y Registro ────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('activo'));
  document.getElementById(tab + '-tab').classList.add('activo');
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

/* ── Limpiar campos ────────────────────────────────────── */
function clearAuthFields() {
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('register-nombre').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-password-confirm').value = '';
}

/* ── LOGIN ─────────────────────────────────────────────── */
async function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  if (!email || !password) {
    errorDiv.textContent = 'Email y contraseña son requeridos';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorDiv.textContent = data.error || 'Error en el login';
      return;
    }

    // Guardar token y nombre
    localStorage.setItem('obsitel_token', data.token);
    localStorage.setItem('obsitel_nombre', data.nombre);
    TOKEN = data.token;
    USER_NAME = data.nombre;

    // Mostrar app
    clearAuthFields();
    showApp();
  } catch (err) {
    errorDiv.textContent = 'Error de conexión: ' + err.message;
  }
}

/* ── REGISTRO ──────────────────────────────────────────── */
async function register() {
  const nombre = document.getElementById('register-nombre').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-password-confirm').value;
  const errorDiv = document.getElementById('register-error');

  if (!nombre || !email || !password || !confirm) {
    errorDiv.textContent = 'Todos los campos son requeridos';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  if (password !== confirm) {
    errorDiv.textContent = 'Las contraseñas no coinciden';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre })
    });

    const data = await res.json();

    if (!res.ok) {
      errorDiv.textContent = data.error || 'Error en el registro';
      return;
    }

    // Guardar token y nombre
    localStorage.setItem('obsitel_token', data.token);
    localStorage.setItem('obsitel_nombre', data.nombre);
    TOKEN = data.token;
    USER_NAME = data.nombre;

    // Mostrar app
    clearAuthFields();
    showApp();
  } catch (err) {
    errorDiv.textContent = 'Error de conexión: ' + err.message;
  }
}

/* ── LOGOUT ────────────────────────────────────────────– */
async function logout() {
  if (!confirm('¿Salir de tu cuenta?')) return;

  try {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
  } catch (err) {
    console.error('Error logout:', err);
  }

  // Limpiar
  localStorage.removeItem('obsitel_token');
  localStorage.removeItem('obsitel_nombre');
  TOKEN = null;
  USER_NAME = null;

  // Mostrar login
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  switchTab('login');
  clearAuthFields();
}

/* ── Mostrar App ───────────────────────────────────────– */
function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  document.getElementById('user-name').textContent = USER_NAME;
}

/* ── Verificar si hay token ────────────────────────────– */
window.addEventListener('load', () => {
  if (TOKEN && USER_NAME) {
    showApp();
  }
});
