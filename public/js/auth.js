// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAYVr1sxX0viEY-R-2yLsB6Tuwyc7NGigk",
  authDomain: "baucher-f0634.firebaseapp.com",
  projectId: "baucher-f0634",
  storageBucket: "baucher-f0634.firebasestorage.app",
  messagingSenderId: "513467121711",
  appId: "1:513467121711:web:024acfeabe264832d586da",
  measurementId: "G-MVB53ZSJ3F"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Cambiar de pestaña (Login / Registro)
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('activo'));
  document.getElementById(`${tab}-tab`).classList.add('activo');
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

// Iniciar sesión con Firebase
async function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Ingresa correo y contraseña.';
    return;
  }

  try {
    const btn = document.querySelector('#login-tab button');
    btn.disabled = true;
    btn.textContent = 'Ingresando...';

    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    errorEl.textContent = obtenerMensajeError(err.code);
    const btn = document.querySelector('#login-tab button');
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

// Registrar usuario con Firebase
async function register() {
  const nombre = document.getElementById('register-nombre').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;
  const errorEl = document.getElementById('register-error');
  errorEl.textContent = '';

  if (!nombre || !email || !password || !passwordConfirm) {
    errorEl.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  try {
    const btn = document.querySelector('#register-tab button');
    btn.disabled = true;
    btn.textContent = 'Registrando...';

    // Creamos el usuario en Firebase
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    // Guardar el nombre en el perfil del usuario de Firebase
    await userCredential.user.updateProfile({ displayName: nombre });
  } catch (err) {
    console.error(err);
    errorEl.textContent = obtenerMensajeError(err.code);
    const btn = document.querySelector('#register-tab button');
    btn.disabled = false;
    btn.textContent = 'Crear Cuenta';
  }
}

// Cerrar sesión
async function logout() {
  try {
    await firebase.auth().signOut();
    localStorage.removeItem('obsitel_token');
    localStorage.removeItem('obsitel_nombre');
    location.reload();
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
  }
}
window.logout = logout;

// Escuchar cambios de estado en Firebase Auth
firebase.auth().onAuthStateChanged(async (user) => {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  const userNameEl = document.getElementById('user-name');

  if (user) {
    try {
      // Obtener el ID Token de Firebase
      const idToken = await user.getIdToken(true);

      // Enviar token al backend para validar contra la lista blanca y obtener token de sesión
      const res = await fetch('/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No autorizado en lista blanca.');
      }

      const data = await res.json();
      
      // Guardar el token del backend y los datos del usuario
      localStorage.setItem('obsitel_token', data.token);
      localStorage.setItem('obsitel_nombre', data.nombre);

      if (userNameEl) {
        userNameEl.textContent = `Usuario: ${data.nombre}`;
      }

      // Ocultar login y mostrar app
      authScreen.style.display = 'none';
      appScreen.style.display = 'block';

      // Inicializar el historial de la app
      if (window.initApp) window.initApp();

    } catch (err) {
      console.error('Error de autenticación con backend:', err);
      alert(err.message || 'Error al validar el correo.');
      
      // Forzar logout en Firebase si el backend lo rechaza (ej. no está en lista blanca)
      await firebase.auth().signOut();
      localStorage.removeItem('obsitel_token');
      localStorage.removeItem('obsitel_nombre');
      
      // Reset botones del formulario
      const loginBtn = document.querySelector('#login-tab button');
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
      }
      const regBtn = document.querySelector('#register-tab button');
      if (regBtn) {
        regBtn.disabled = false;
        regBtn.textContent = 'Crear Cuenta';
      }
    }
  } else {
    // Si no está autenticado, mostrar pantalla de login
    authScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
});

// Traducir códigos de error de Firebase
function obtenerMensajeError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'El formato de correo no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada.';
    case 'auth/user-not-found':
      return 'No hay ningún usuario registrado con este correo.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado por otro usuario.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    default:
      return 'Ocurrió un error. Inténtalo de nuevo.';
  }
}
