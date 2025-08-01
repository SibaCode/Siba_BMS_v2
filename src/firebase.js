
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBosWTZV8wyGN_jIgPqPCogoy2bss-BhE4",
  authDomain: "businessmanagmentsystem-c3389.firebaseapp.com",
  projectId: "businessmanagmentsystem-c3389",
  storageBucket: "businessmanagmentsystem-c3389.firebasestorage.app",
  messagingSenderId: "581978849125",
  appId: "1:581978849125:web:acc3cbd2e62be494e3ab8c",
  measurementId: "G-C6L7752QG4"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyDKKMW0y7_Vw_9yIwFN_YpcyepGbAtPRqE",
//   authDomain: "bms-kat.firebaseapp.com",
//   projectId: "bms-kat",
//   storageBucket: "bms-kat.firebasestorage.app",
//   messagingSenderId: "126068664770",
//   appId: "1:126068664770:web:764ce5ca37ac03c71a4e5b",
//   measurementId: "G-TVKYE2HYNK"
// };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { db, analytics };
