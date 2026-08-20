// Firebase initialization for MedStar Hospital
// This file only sets up the connection. All other logic lives in its own file.
const firebaseConfig = {
  apiKey: "AIzaSyAO1NiZMNDoefOZ5xKm5X66540GrdI4zNo",
  authDomain: "medicalservices-d7e3d.firebaseapp.com",
  projectId: "medicalservices-d7e3d",
  storageBucket: "medicalservices-d7e3d.firebasestorage.app",
  messagingSenderId: "935026196015",
  appId: "1:935026196015:web:6040cb5a9b40fb94c250da",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
