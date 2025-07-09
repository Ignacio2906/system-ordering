import { auth, db } from "../conexion/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Función principal del login
window.loginUser = async function (event) {
  event.preventDefault();

  const email = document.getElementById("txtusuario").value.trim();
  const password = document.getElementById("txtpassword").value.trim();

  if (!email || !password) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    //  Inicia sesión con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    //  Obtiene rol desde Firestore (colección 'usuario')
    const docRef = doc(db, "usuario", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("No se encontró información del usuario en Firestore.");
      return;
    }

    const data = docSnap.data();

    if (!data.rol) {
      alert("Tu cuenta no tiene un rol asignado. Contacta al administrador.");
      return;
    }

    // Guarda información en sessionStorage
    sessionStorage.setItem("userEmail", user.email);
    sessionStorage.setItem("uid", user.uid);
    sessionStorage.setItem("rol", data.rol);

    // Redirige a la página principal
    window.location.href = "/index.html";

  } catch (error) {
    console.error(" Error al iniciar sesión:", error);
    alert("Correo o contraseña incorrectos.");
  }
};
