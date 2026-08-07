import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDk3HfCEalNjDbvx67HHdMybaAIpNw1IWY",
  authDomain: "pstorechat.firebaseapp.com",
  projectId: "pstorechat",
  storageBucket: "pstorechat.firebasestorage.app",
  messagingSenderId: "274979276949",
  appId: "1:274979276949:web:9d1b9412db8b627d2bb39c",
  measurementId: "G-904HWSPGTP"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// AQUÍ PEGAS TU VAPID KEY
const VAPID_KEY = "BIsvsKQYY5veWnIxbC-K7EGRkLhqS7aRWbefB9PU-F0D_Kfg8wCKJMt_n8AEiPld1aKV5Bg4wLKZ2K7c-nMI-_w"; 

export async function pedirPermisoPush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('✅ Token FCM registrado:', token);
      return token;
    } else {
      console.warn('⚠️ Permiso denegado.');
    }
  } catch (err) {
    console.error('❌ Error Push:', err);
  }
}

// Escuchar si la app está abierta
onMessage(messaging, (payload) => {
  if (payload.notification) {
    alert(`📢 ${payload.notification.title}\n${payload.notification.body}`);
  }
});

// Pedir permiso automáticamente cuando abra la web
window.addEventListener('load', () => {
  pedirPermisoPush();
});
