// === Firebase Setup for RuneXO ===
// Import Firebase libraries directly from CDN (no npm needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === Your Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyCGp4vQaH3xjzeq9dZkiRE3QmbTADuhDeI",
  authDomain: "runexo-154e8.firebaseapp.com",
  projectId: "runexo-154e8",
  storageBucket: "runexo-154e8.firebasestorage.app",
  messagingSenderId: "847710710262",
  appId: "1:847710710262:web:91e2087d000086670d7fd7",
  measurementId: "G-R6P14ECJ6P"
};

// === Initialize Firebase ===
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithPopup, signOut, doc, getDoc, setDoc, updateDoc };
