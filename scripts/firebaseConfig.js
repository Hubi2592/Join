/**
 * Firebase configuration for the Join application.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBBqXuaXjnWIvN5to5PuH5jif1FhT_9KKw",
  authDomain: "joindb-ccbc2.firebaseapp.com",
  databaseURL:
    "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "joindb-ccbc2",
  storageBucket: "joindb-ccbc2.firebasestorage.app",
  messagingSenderId: "1070762316786",
  appId: "1:1070762316786:web:ff0016d25f4f9c225f116b",
};

firebase.initializeApp(firebaseConfig);

window.joinAuth = firebase.auth();
window.joinDatabase = firebase.database();