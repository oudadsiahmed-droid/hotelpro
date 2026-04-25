import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuYweYblET3t8U2bkxeKN2b7nIWjgFS-w",
  authDomain: "hotelpro-fdb70.firebaseapp.com",
  projectId: "hotelpro-fdb70",
  storageBucket: "hotelpro-fdb70.firebasestorage.app",
  messagingSenderId: "716513276401",
  appId: "1:716513276401:web:1e001a911e4c3360991450",
  measurementId: "G-T7WT7SZP3J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);