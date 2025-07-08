import PedidoModel from "../model/PedidoModel.js";

//  Declarar primero la función antes de usarla
function generarSelectEstado(pedido, rolUsuario) {
  const estadoActual = pedido.estado || "pendiente";
  let estadosPermitidos = [];

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
    estadosPermitidos = [estadoActual];
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

//  Función para mostrar un toast
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

//  Función global para cambio de estado
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
    mostrarToast(" Estado actualizado correctamente.");

    // Si finalizado, liberar mesa
    if (nuevoEstado === "finalizado") {
  const pedido = await PedidoModel.obtenerPedidoPorId(id);
  const numeroMesa = pedido.mesa;

  const mesas = await PedidoModel.obtenerMesas();
  const mesaCorrespondiente = mesas.find(m => parseInt(m.numero_mesa) === numeroMesa);

  if (mesaCorrespondiente) {
    await PedidoModel.actualizarMesa(mesaCorrespondiente.id, "libre"); // 
  }
}

    if (typeof window.mostrarPedidos === "function") {
      window.mostrarPedidos();
    }
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    mostrarToast("❌ Error al actualizar estado", "error");
    selectElement.value = estadoAnterior;
  }
};

//  Exporta correctamente
export default {
  generarSelectEstado
};
