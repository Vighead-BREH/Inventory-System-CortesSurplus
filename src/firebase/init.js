import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMC1HsPidpBcBZ_VYVuBiofQS32vX3lTU",
  authDomain: "cortes-surplus-db.firebaseapp.com",
  projectId: "cortes-surplus-db",
  storageBucket: "cortes-surplus-db.firebasestorage.app",
  messagingSenderId: "735201352084",
  appId: "1:735201352084:web:5d83c0d27a8426b87a5781"
};

initializeApp(firebaseConfig);
const db = getFirestore();
export default db;
