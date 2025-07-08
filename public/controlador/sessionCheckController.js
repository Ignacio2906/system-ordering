// controlador/sessionCheck.js
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

const auth = getAuth(app);
const db = getFirestore(app);

export async function aplicarPermisos() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      const btnLogin = document.getElementById("btn-login");
      const btnLogout = document.getElementById("btn-logout");

      if (!user) {
        console.warn("⚠️ Usuario no autenticado");

        // Mostrar solo botón de login
        if (btnLogin) btnLogin.classList.remove("d-none");
        if (btnLogout) btnLogout.classList.add("d-none");

        window.location.href = "/vista/MntLogin/Login.html";
        return reject("No autenticado");
      }

      const uid = user.uid;
      console.log("🔐 Usuario autenticado. UID:", uid);

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
      console.log(" Rol obtenido desde Firestore:", rol);

      // Mostrar botón de logout y ocultar login
      if (btnLogin) btnLogin.classList.add("d-none");
      if (btnLogout) btnLogout.classList.remove("d-none");

      // Asignar evento al botón de logout
      if (btnLogout) {
        btnLogout.addEventListener("click", async (e) => {
          e.preventDefault();
          await signOut(auth);
          window.location.href = "/vista/MntLogin/Login.html";
        });
      }

      // Control de visibilidad de menús por rol
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
            console.log(`🚫 Ocultando menú '${id}' para rol '${rol}'`);
          } else {
            console.log(` Mostrando menú '${id}' para rol '${rol}'`);
          }
        } else {
          console.warn(`⚠️ Elemento con ID '${id}' no encontrado en el DOM`);
        }
      }

      // Mostrar navbar si está oculto
      const wrapper = document.getElementById("navbar-wrapper");
      if (wrapper) {
        wrapper.style.display = "block";
        console.log(" Navbar mostrado.");
      } else {
        console.warn("⚠️ No se encontró 'navbar-wrapper' en el DOM");
      }

      resolve();
    });
  });
}
