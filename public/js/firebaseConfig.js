/* ════════════════════════════════════════════════════════
   firebaseConfig.js  –  Configuración e inicialización de Firebase
   
   Usa el SDK "compat" (vía CDN) para no necesitar un build step
   (webpack/vite). Esto expone el objeto global `firebase`.
   ════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyAYVr1sxX0viEY-R-2yLsB6Tuwyc7NGigk",
  authDomain: "baucher-f0634.firebaseapp.com",
  projectId: "baucher-f0634",
  storageBucket: "baucher-f0634.firebasestorage.app",
  messagingSenderId: "513467121711",
  appId: "1:513467121711:web:024acfeabe264832d586da",
  measurementId: "G-MVB53ZSJ3F"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
