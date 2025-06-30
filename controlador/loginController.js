// controlador/loginController.js
import { auth, db } from '../conexion/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

window.loginUser = async function (event) {
  event.preventDefault();

  const email = document.getElementById("txtusuario").value.trim();
  const password = document.getElementById("txtpassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, "usuario", uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("Datos del usuario desde Firestore:", userData);

      if (userData.rol) {
        localStorage.setItem("rol", userData.rol);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("uid", uid);
        window.location.href = "vista/index.html";
      } else {
        alert("El usuario no tiene rol asignado.");
        console.warn("userData.rol no existe:", userData);
      }
    } else {
      alert("No se encontraron datos del usuario en Firestore.");
      console.warn("Usuario sin documento:", uid);
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error.code, error.message);
    switch (error.code) {
      case "auth/user-not-found":
        alert("El usuario no está registrado.");
        break;
      case "auth/wrong-password":
        alert("Contraseña incorrecta.");
        break;
      case "auth/invalid-email":
        alert("Correo inválido.");
        break;
      default:
        alert("Error al iniciar sesión. Intenta nuevamente.");
    }
  }
};
