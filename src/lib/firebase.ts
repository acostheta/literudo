import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "literudo",
  appId: "1:131764175022:web:a621977334fdf035cc2d3f",
  storageBucket: "literudo.firebasestorage.app",
  apiKey: "AIzaSyBj9FROJiYDTe9CufVl5p7G2nvfos74wkw",
  authDomain: "literudo.firebaseapp.com",
  messagingSenderId: "131764175022",
};

// Evita reinicializar en hot reload de Next.js
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
