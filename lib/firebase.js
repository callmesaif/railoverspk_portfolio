import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM-IJrPIDGOLRDOyr1xLoT0geFplkV-t4",
  authDomain: "railspk-official-1de54.firebaseapp.com",
  projectId: "railspk-official-1de54",
  storageBucket: "railspk-official-1de54.firebasestorage.app",
  messagingSenderId: "282037027182",
  appId: "1:282037027182:web:6b4f8bb420eb410374c17f"
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore only — keeps Auth/Storage out of every public page's JS.
// Admin code gets `auth` from '@/lib/firebase-auth'.
export const db = getFirestore(app);
export default app;
