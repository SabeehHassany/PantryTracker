// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
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
const firestore = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  // Conditionally import and initialize analytics
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { firestore };