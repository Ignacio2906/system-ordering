// layoutLoaderController.js
import { aplicarPermisos } from "/controlador/sessionCheckController.js";

async function cargarLayout() {
  try {
    // Oculta el navbar al inicio si existe el contenedor
    const navbarWrapper = document.getElementById("navbar-wrapper");
    if (navbarWrapper) navbarWrapper.style.display = "none";

    // Cargar navbar (top) y footer (bottom)
    const navbarHTML = await fetch("../../vista/Main/maintop.html").then(res => res.text());
    const footerHTML = await fetch("../../vista/Main/mainbottom.html").then(res => res.text());

    document.getElementById("navbar-placeholder").innerHTML = navbarHTML;
    document.getElementById("footer-placeholder").innerHTML = footerHTML;

    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 0));

    // Aplicar permisos si es necesario
    await aplicarPermisos();

    // Mostrar el navbar después de aplicar permisos
    if (navbarWrapper) navbarWrapper.style.display = "block";

  } catch (err) {
    console.error("❌ Error al cargar layout:", err);
  }
}

cargarLayout();
