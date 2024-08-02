// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDK6ECtFLXz7dI6gOVmDlziHkSfnJyoE3M",
  authDomain: "inventory-manager-6daaa.firebaseapp.com",
  projectId: "inventory-manager-6daaa",
  storageBucket: "inventory-manager-6daaa.appspot.com",
  messagingSenderId: "830962650485",
  appId: "1:830962650485:web:4cbc6a83dcd78b6d05573c",
  measurementId: "G-FMDY841J4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore}

