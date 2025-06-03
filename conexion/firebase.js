// conexion/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAL823U39GIKcJD4Lp1-83dFfGrle05Vlw",
  authDomain: "system-ordering.firebaseapp.com",
  projectId: "system-ordering",
  storageBucket: "system-ordering.appspot.com",
  messagingSenderId: "584142204471",
  appId: "1:584142204471:web:9502c13c0e759b3d7199b2",
  measurementId: "G-1LNN86M1L1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✔️ asegúrate que esto esté aquí
