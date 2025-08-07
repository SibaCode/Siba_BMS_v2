// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyBosWTZV8wyGN_jIgPqPCogoy2bss-BhE4",
  authDomain: "businessmanagmentsystem-c3389.firebaseapp.com",
  projectId: "businessmanagmentsystem-c3389",
  storageBucket: "businessmanagmentsystem-c3389.firebasestorage.app",
  messagingSenderId: "581978849125",
  appId: "1:581978849125:web:acc3cbd2e62be494e3ab8c",
  measurementId: "G-C6L7752QG4"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Analytics (browser only)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export these so you can import them elsewhere in your app
export { db, analytics, auth };
