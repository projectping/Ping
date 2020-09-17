// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');

 // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDL95wtKCKX6INRTY85ubJ7yqY6BKX7LO8",
    authDomain: "ping-597e3.firebaseapp.com",
    databaseURL: "https://ping-597e3.firebaseio.com",
    projectId: "ping-597e3",
    storageBucket: "ping-597e3.appspot.com",
    messagingSenderId: "601106983079",
    appId: "1:601106983079:web:5ea260b94db58598ea1382",
    measurementId: "G-B3S5PMXK92"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);



// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'You have new message';
    const notificationOptions = {
        body: payload.data.message,
        icon: payload.data.icon
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});



