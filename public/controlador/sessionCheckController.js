// controlador/sessionCheckController.js
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { app } from "../conexion/firebase.js";

// Detectar si se volvió desde caché (botón atrás del navegador)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    console.log("🔁 Volviendo desde caché, recargando...");
    location.reload();
  }
});

const auth = getAuth(app);
const db = getFirestore(app);

export async function aplicarPermisos() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      const btnLogin = document.getElementById("btn-login");
      const btnLogout = document.getElementById("btn-logout");

      if (!user) {
        if (btnLogin) btnLogin.classList.remove("d-none");
        if (btnLogout) btnLogout.classList.add("d-none");
        window.location.href = "/vista/MntLogin/Login.html";
        return reject("No autenticado");
      }

      const uid = user.uid;
      const docRef = doc(db, "usuario", uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.warn("⚠️ Usuario sin datos en Firestore. Cerrando sesión.");
        signOut(auth);
        window.location.href = "/vista/MntLogin/Login.html";
        return reject("Sin rol");
      }

      const data = snap.data();
      const rol = data.rol;

      if (btnLogin) btnLogin.classList.add("d-none");
      if (btnLogout) btnLogout.classList.remove("d-none");

      if (btnLogout) {
        btnLogout.addEventListener("click", async (e) => {
          e.preventDefault();
          await signOut(auth);
          window.location.href = "/vista/MntLogin/Login.html";
        });
      }

      const permisos = {
        "menu-inicio": ["admin", "mozo", "cocinero"],
        "menu-mozos": ["admin"],
        "menu-producto": ["admin"],
        "menu-pedido": ["admin", "mozo"],
        "menu-detalle": ["admin", "mozo", "cocinero"]
      };

      for (const [id, roles] of Object.entries(permisos)) {
        const el = document.getElementById(id);
        if (el) {
          if (!roles.includes(rol)) {
            el.style.display = "none";
          }
        }
      }

      const wrapper = document.getElementById("navbar-wrapper");
      if (wrapper) wrapper.style.display = "block";
      resolve(rol);
    });
  });
}

