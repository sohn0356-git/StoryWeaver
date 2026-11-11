import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
const e=import.meta.env||{};
export const configured=!!(e.VITE_FIREBASE_API_KEY&&e.VITE_FIREBASE_AUTH_DOMAIN&&e.VITE_FIREBASE_PROJECT_ID&&e.VITE_FIREBASE_APP_ID);
export const auth=configured?getAuth(initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,projectId:e.VITE_FIREBASE_PROJECT_ID,storageBucket:e.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:e.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:e.VITE_FIREBASE_APP_ID})):null;
export { GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged };
export const firebaseApp=auth?.app||null;
