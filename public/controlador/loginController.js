// loginController.js
import { auth, db } from "../conexion/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

window.loginUser = async function (event) {
  event.preventDefault();

  const email = document.getElementById("txtusuario").value.trim();
  const password = document.getElementById("txtpassword").value.trim();

  if (!email || !password) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "usuario", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || !docSnap.data().rol) {
      alert("Tu cuenta no tiene un rol válido. Contacta al administrador.");
      return;
    }

    // Redirige a index.html (pequeño retraso para que Firebase guarde sesión)
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 100);

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Correo o contraseña incorrectos.");
  }
};
