import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCHpal-ryJpJEgSPoQ_QV3ykK1bNdAZsgI",
  authDomain: "gravli2466.firebaseapp.com",
  projectId: "gravli2466",
  storageBucket: "gravli2466.firebasestorage.app",
  messagingSenderId: "606121352619",
  appId: "1:606121352619:web:e576c701a556b14ab046ee",
  measurementId: "G-4X8R7PHE8Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
