import PedidoModel from "../model/PedidoModel.js";

function generarSelectEstado(pedido, rolUsuario) {
  const estadoActual = pedido.estado || "pendiente";
  let estadosPermitidos = [];

  // Lógica de estados permitidos por rol y estado actual
  if (rolUsuario === "admin") {
    estadosPermitidos = ["pendiente", "creado", "entregado", "finalizado"];
  } else if (rolUsuario === "cocinero") {
    if (estadoActual === "pendiente") {
      estadosPermitidos = ["pendiente", "creado"];
    } else {
      estadosPermitidos = [estadoActual];
    }
  } else if (rolUsuario === "mozo") {
    if (estadoActual === "creado") {
      estadosPermitidos = ["creado", "entregado"];
    } else if (estadoActual === "entregado") {
      estadosPermitidos = ["entregado", "finalizado"];
    } else {
      estadosPermitidos = [estadoActual];
    }
  } else {
    estadosPermitidos = [estadoActual]; // Rol desconocido solo puede ver
  }

  const puedeEditar = estadosPermitidos.length > 1 && estadoActual !== "finalizado";

  const opciones = estadosPermitidos.map((estado) => {
    const selected = estado === estadoActual ? "selected" : "";
    return `<option value="${estado}" ${selected}>${estado}</option>`;
  }).join("");

  const disabled = !puedeEditar ? "disabled" : "";

  return `
    <select data-actual="${estadoActual}" onchange="cambiarEstadoPedido('${pedido.id}', this)" ${disabled}>
      ${opciones}
    </select>
  `;
}

// ✅ Toast flotante
function mostrarToast(mensaje, tipo = "success") {
  const toast = document.createElement("div");
  toast.innerText = mensaje;
  Object.assign(toast.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    backgroundColor: tipo === "success" ? "#4caf50" : "#f44336",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: "9999",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ✅ Función que actualiza el estado en Firebase
window.cambiarEstadoPedido = async function (id, selectElement) {
  const nuevoEstado = selectElement.value;
  const estadoAnterior = selectElement.getAttribute("data-actual");

  const confirmar = confirm(`¿Deseas cambiar el estado a: ${nuevoEstado}?`);
  if (!confirmar) {
    selectElement.value = estadoAnterior;
    return;
  }

  try {
    await PedidoModel.actualizarEstado(id, nuevoEstado);
    mostrarToast("✅ Estado actualizado correctamente.");

    // Vuelve a cargar la tabla si existe esta función
    if (typeof window.mostrarPedidos === "function") {
      window.mostrarPedidos();
    }
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    mostrarToast("❌ Error al actualizar estado", "error");
    selectElement.value = estadoAnterior;
  }
};

export default {
  generarSelectEstado
};
