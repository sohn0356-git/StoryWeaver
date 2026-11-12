import { initializeApp } from 'firebase/app';
import { initializeAuth,indexedDBLocalPersistence,browserLocalPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged } from 'firebase/auth';
const e=import.meta.env||{};
export const configured=!!(e.VITE_FIREBASE_API_KEY&&e.VITE_FIREBASE_AUTH_DOMAIN&&e.VITE_FIREBASE_PROJECT_ID&&e.VITE_FIREBASE_APP_ID);
export const firebaseApp=configured?initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,projectId:e.VITE_FIREBASE_PROJECT_ID,storageBucket:e.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:e.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:e.VITE_FIREBASE_APP_ID}):null;
// Restore durable login across restarts, with localStorage fallback and no tab-scoped persistence.
export const auth=firebaseApp?initializeAuth(firebaseApp,{persistence:[indexedDBLocalPersistence,browserLocalPersistence],popupRedirectResolver:browserPopupRedirectResolver}):null;
export { GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged };
