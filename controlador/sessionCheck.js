// controlador/sessionCheck.js

export function validarRol(rolesPermitidos) {
  const rol = localStorage.getItem("rol");
  const user = localStorage.getItem("userEmail");

  if (!rol || !user || !rolesPermitidos.includes(rol)) {
    alert("Acceso denegado. Inicia sesión con los permisos adecuados.");
    window.location.href = "../login.html";
  }
}
