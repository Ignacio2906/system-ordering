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

  const email = document.getElementById("txtusuario").value;
  const password = document.getElementById("txtpassword").value;

  try {
    //Inicia sesión con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Usuario logueado:", user.email);
    console.log("UID:", user.uid);

    //Obtiene documento desde Firestore (colección correcta: 'usuario')
    const docRef = doc(db, "usuario", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (!data.rol) {
        alert("Tu cuenta no tiene un rol asignado.");
        return;
      }

      // 💾 Guarda datos en sessionStorage
      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.setItem("uid", user.uid);
      sessionStorage.setItem("rol", data.rol);

      console.log("Rol detectado:", data.rol);

      // Redirige al index principal
      window.location.href = "./vista/index.html";
    } else {
      alert("No se encontró información del usuario en Firestore.");
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Correo o contraseña incorrectos.");
  }
};
