import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Same Firebase project as mikeandadam (shared fitness data)
const firebaseConfig = {
  apiKey: "AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0",
  authDomain: "trip-planner-5cc84.firebaseapp.com",
  projectId: "trip-planner-5cc84",
  storageBucket: "trip-planner-5cc84.firebasestorage.app",
  messagingSenderId: "803115812045",
  appId: "1:803115812045:web:d49aa3df4ee4038c5fd584",
  measurementId: "G-2P92RPZ3KG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export default app;
