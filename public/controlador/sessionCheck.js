// controlador/sessionCheck.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { app } from "../conexion/firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

export async function aplicarPermisos() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("⚠️ Usuario no autenticado");
        window.location.href = "/login.html";
        return reject("No autenticado");
      }

      const uid = user.uid;
      const docRef = doc(db, "usuario", uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.warn("⚠️ Usuario sin rol en Firestore. Redirigiendo.");
        auth.signOut();
        window.location.href = "/login.html";
        return reject("Sin rol");
      }

      const rol = snap.data().rol;

      const permisos = {
        "menu-inicio": ["admin", "mozo", "cocinero"],
        "menu-mozos": ["admin"],
        "menu-producto": ["admin"],
        "menu-pedido": ["admin", "mozo"],
        "menu-detalle": ["admin", "mozo", "cocinero"]
      };

      for (const [id, roles] of Object.entries(permisos)) {
        const el = document.getElementById(id);
        if (el && !roles.includes(rol)) {
          el.style.display = "none";
        }
      }

      const wrapper = document.getElementById("navbar-wrapper");
      if (wrapper) wrapper.style.display = "block";

      resolve();
    });
  });
}
