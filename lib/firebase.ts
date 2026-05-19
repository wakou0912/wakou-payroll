import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDodKhfeIupTNpZOZBfnIWgwrGqMiGgPro",
  authDomain: "kabusikigaisya-wakou.firebaseapp.com",
  projectId: "kabusikigaisya-wakou",
  storageBucket: "kabusikigaisya-wakou.firebasestorage.app",
  messagingSenderId: "729487067137",
  appId: "1:729487067137:web:ab3cddf7311d4fb28a9800",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
