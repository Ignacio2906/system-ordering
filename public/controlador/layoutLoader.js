// controlador/layoutLoader.js
import { aplicarPermisos } from "./sessionCheck.js";

async function cargarLayout() {
  try {
    // Oculta el navbar al inicio
    const navbarWrapper = document.getElementById("navbar-wrapper");
    if (navbarWrapper) navbarWrapper.style.display = "none";

    const navbarHTML = await fetch("../maintop.html").then(res => res.text());
    const footerHTML = await fetch("../mainbottom.html").then(res => res.text());

    document.getElementById("navbar-placeholder").innerHTML = navbarHTML;
    document.getElementById("footer-placeholder").innerHTML = footerHTML;

    // Esperar 1 ciclo de render
    await new Promise(resolve => setTimeout(resolve, 0));

    await aplicarPermisos(); // Espera que se lean los permisos

    // ✅ Mostrar navbar solo cuando todo esté listo
    if (navbarWrapper) navbarWrapper.style.display = "block";

  } catch (err) {
    console.error("❌ Error en cargarLayout:", err);
  }
}

cargarLayout();
