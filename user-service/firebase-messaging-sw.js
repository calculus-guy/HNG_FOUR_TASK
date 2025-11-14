// Firebase Messaging Service Worker
// Note: Do NOT include service account private keys here. This runs in the browser.
// If notifications fail, verify storageBucket value; often it is "push-service-2a2ab.appspot.com".

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAzW7PDd_pXdVKTk1EtFHgjaz_VQ3xzerA",
  authDomain: "push-service-2a2ab.firebaseapp.com",
  projectId: "push-service-2a2ab",
  storageBucket: "push-service-2a2ab.appspot.com",
  messagingSenderId: "834550147223",
  appId: "1:834550147223:web:ba819b5f1a4ec176a3a1d2",
  measurementId: "G-R35YQSNS0D"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages (when page not focused or closed)
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  const notification = payload.notification || {};
  const title = notification.title || 'Notification';
  const options = {
    body: notification.body || 'You have a new message',
    icon: '/favicon.ico',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

// Optional: Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(target));
});