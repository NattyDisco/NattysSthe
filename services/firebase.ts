
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3pWpi4ORY7qSgSH_XDW1wIUhVw1u5V5s",
  authDomain: "studio-8916844400-78d62.firebaseapp.com",
  projectId: "studio-8916844400-78d62",
  storageBucket: "studio-8916844400-78d62.firebasestorage.app",
  messagingSenderId: "249559549946",
  appId: "1:249559549946:web:e41b8d3bfd9d5dd935c643"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
