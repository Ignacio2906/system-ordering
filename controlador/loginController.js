import { auth, db } from '../conexion/firebase.js';  // Ruta corregida

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

window.loginUser = async function (event) {
  event.preventDefault(); // <-- Esto es necesario para que no recargue la página

  const email = document.getElementById("txtusuario").value;
  const password = document.getElementById("txtpassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Usuario logueado:", userCredential.user.email);
    alert("Bienvenido " + userCredential.user.email);
    window.location.href = "vista/index.html"; // Asegúrate de que esta ruta exista
  } catch (error) {
    console.error("Error:", error.code, error.message);
    alert("Correo o contraseña incorrectos");
  }
};
