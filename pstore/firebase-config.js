// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

// Tu configuración de Firebase extraída del panel
const firebaseConfig = {
  apiKey: "AIzaSyDk3HfCEalNjDbvx67HHdMybaAIpNw1IWY",
  authDomain: "pstorechat.firebaseapp.com",
  projectId: "pstorechat",
  storageBucket: "pstorechat.firebasestorage.app",
  messagingSenderId: "274979276949",
  appId: "1:274979276949:web:9d1b9412db8b627d2bb39c",
  measurementId: "G-904HWSPGTP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Función para solicitar permiso de notificaciones push
export async function solicitarPermisoNotificaciones(vapidKey) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: vapidKey });
      console.log('✅ Token del cliente para Push:', token);
      return token;
    } else {
      console.warn('⚠️ Permiso de notificaciones denegado.');
    }
  } catch (error) {
    console.error('❌ Error al obtener token de notificaciones:', error);
  }
}

// Escuchar mensajes cuando el usuario tiene la PWA abierta (Primer Plano)
onMessage(messaging, (payload) => {
  console.log('🔔 Notificación en primer plano:', payload);
  if (payload.notification) {
    alert(`📢 ${payload.notification.title}\n${payload.notification.body}`);
  }
});
