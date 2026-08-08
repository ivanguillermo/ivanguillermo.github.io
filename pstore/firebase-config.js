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

const VAPID_KEY = "BIsvsKQYY5veWnIxbC-K7EGRkLhqS7aRWbefB9PU-F0D_Kfg8wCKJMt_n8AEiPld1aKV5Bg4wLKZ2K7c-nMI-_w"; 

export async function pedirPermisoPush() {
  try {
    // 1. Registrar explícitamente el Service Worker de Firebase
    const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    console.log('✅ Service Worker de Firebase registrado en:', registration.scope);

    // 2. Pedir Permisos
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // 3. Pasar el serviceWorkerRegistration al getToken
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration 
      });
      
      console.log('🔥 TOKEN FCM OBTENIDO EXITOSAMENTE:');
      console.log(token);
      return token;
    } else {
      console.warn('⚠️ Permiso de notificaciones denegado por el usuario.');
    }
  } catch (err) {
    console.error('❌ Error al configurar Push:', err);
  }
}

onMessage(messaging, (payload) => {
  if (payload.notification) {
    alert(`📢 ${payload.notification.title}\n${payload.notification.body}`);
  }
});

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    pedirPermisoPush();
  }
});
