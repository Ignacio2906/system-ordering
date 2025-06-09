import PedidoModel from "../model/PedidoModel.js";

const clienteSelect = document.getElementById("clienteId");
const productoSelect = document.getElementById("productoId");
const cantidadInput = document.getElementById("cantidad");
const pedidoContainer = document.getElementById("pedido-container");
const btnRegistrar = document.getElementById("btn-registrar");

// Mapas para guardar clientes y productos por sus claves
let clientesMap = {};
let productosMap = {};

// Cargar clientes y llenar el select
async function cargarClientes() {
  const clientes = await PedidoModel.obtenerClientes();
  clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
  clientes.forEach(cliente => {
    clienteSelect.innerHTML += `<option value="${cliente.dni}">${cliente.nombre} (${cliente.dni})</option>`;
    clientesMap[cliente.dni] = cliente; // Guardamos por DNI
  });
}

// Cargar productos y llenar el select
async function cargarProductos() {
  const productos = await PedidoModel.obtenerProductos();
  productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
  productos.forEach(producto => {
    productoSelect.innerHTML += `<option value="${producto.id}">${producto.nombre}</option>`;
    productosMap[producto.id] = producto; // Guardamos por ID
  });
}

// Mostrar la tabla de pedidos con nombres
async function mostrarPedidos() {
  const pedidos = await PedidoModel.obtenerPedidos();
  pedidoContainer.innerHTML = "";

  pedidos.forEach(pedido => {
    // Convertir fecha Firestore Timestamp a string legible
    const fecha = pedido.fecha?.toDate?.()?.toLocaleDateString() || "Sin fecha";

    // Obtener nombre de cliente y producto usando los mapas
    const clienteNombre = clientesMap[pedido.cliente]?.nombre || "(Cliente no definido)";
    const productoNombre = productosMap[pedido.producto]?.nombre || "(Producto no definido)";

    pedidoContainer.innerHTML += `
      <tr>
        <td>${pedido.id || "-"}</td>
        <td>${clienteNombre}</td>
        <td>${productoNombre}</td>
        <td>${pedido.cantidad || "-"}</td>
        <td>${fecha}</td>
        <td>
          <button onclick="editarPedido('${pedido.id}')" class="btn btn-primary btn-sm">Editar</button>
          <button onclick="cambiarEstado('${pedido.id}')" class="btn btn-danger btn-sm">Inactivar</button>
        </td>
      </tr>
    `;
  });
}

// Registrar un nuevo pedido
async function registrarPedido() {
  const cliente = clienteSelect.value;
  const producto = productoSelect.value;
  const cantidad = parseInt(cantidadInput.value);

  if (!cliente || !producto || !cantidad || cantidad <= 0) {
    alert("Complete todos los campos correctamente.");
    return;
  }

  try {
    await PedidoModel.agregarPedido({ cliente, producto, cantidad });
    alert("Pedido registrado con éxito.");
    clienteSelect.value = "";
    productoSelect.value = "";
    cantidadInput.value = "";
    mostrarPedidos();
  } catch (error) {
    console.error("Error al registrar pedido:", error);
    alert("Hubo un error al registrar el pedido.");
  }
}

// Función para editar pedido (puedes agregar un modal o formulario aparte)
async function editarPedido(id) {
  const pedido = await PedidoModel.obtenerPedidoPorId(id);
  if (!pedido) {
    alert("Pedido no encontrado");
    return;
  }

  // Ejemplo simple: cargar datos en el formulario para editar
  clienteSelect.value = pedido.cliente;
  productoSelect.value = pedido.producto;
  cantidadInput.value = pedido.cantidad;

  // Cambiar botón registrar a actualizar
  btnRegistrar.textContent = "Actualizar Pedido";
  btnRegistrar.onclick = async () => {
    const cliente = clienteSelect.value;
    const producto = productoSelect.value;
    const cantidad = parseInt(cantidadInput.value);

    if (!cliente || !producto || !cantidad || cantidad <= 0) {
      alert("Complete todos los campos correctamente.");
      return;
    }

    try {
      await PedidoModel.actualizarPedido(id, { cliente, producto, cantidad });
      alert("Pedido actualizado con éxito.");
      clienteSelect.value = "";
      productoSelect.value = "";
      cantidadInput.value = "";
      btnRegistrar.textContent = "Realizar Pedido";
      btnRegistrar.onclick = registrarPedido;
      mostrarPedidos();
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      alert("Hubo un error al actualizar el pedido.");
    }
  };
}

// Cambiar estado a inactivo (soft delete)
async function cambiarEstado(id) {
  try {
    await PedidoModel.inactivarPedido(id);
    alert("Pedido inactivado correctamente");
    mostrarPedidos();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    alert("Hubo un error al inactivar el pedido.");
  }
}

// Inicialización al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  cargarProductos();
  mostrarPedidos();

  btnRegistrar.addEventListener("click", registrarPedido);
});

// Exponer funciones para usarlas en HTML
window.editarPedido = editarPedido;
window.cambiarEstado = cambiarEstado;
