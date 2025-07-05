import PedidoModel from "../model/PedidoModel.js";

const mesaContainer = document.getElementById("mesas-container");
const formulario = document.getElementById("formulario-pedido");
const cerrarBtn = document.getElementById("cerrar-formulario");
const mozoselect = document.getElementById("mozosId");
const productoSelect = document.getElementById("productoId");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precioUnitario");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const btnRegistrar = document.getElementById("btn-registrar");
const listaProductos = document.getElementById("lista-productos");
const mesaIdInput = document.getElementById("mesaId");

let mesasMap = {};
let productosMap = {};
let productosPedido = [];

PedidoModel.escucharMesas((mesas) => {
  mesaContainer.innerHTML = "";
  mesas.forEach(mesa => {
    mesasMap[mesa.id] = mesa;
    const div = document.createElement("div");
    div.className = `mesa ${mesa.estado_mesa}`;
    div.textContent = mesa.numero_mesa;

    if (mesa.estado_mesa === "libre") {
      div.addEventListener("click", () => {
        mesaIdInput.value = mesa.id;
        formulario.style.display = "block";
      });
    }

    mesaContainer.appendChild(div);
  });
});

cerrarBtn.addEventListener("click", () => {
  formulario.style.display = "none";
  resetFormulario();
});

async function cargarMozos() {
  const mozos = await PedidoModel.obtenerMozos();
  mozoselect.innerHTML = '<option value="">Seleccione</option>';
  mozos.forEach(mozo => {
    mozoselect.innerHTML += `<option value="${mozo.dni}">${mozo.nombre}</option>`;
  });
}

async function cargarProductos() {
  const productos = await PedidoModel.obtenerProductos();
  productoSelect.innerHTML = '<option value="">Seleccione</option>';
  productos.forEach(p => {
    productoSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    productosMap[p.id] = p;
  });
}

productoSelect.addEventListener("change", () => {
  const producto = productosMap[productoSelect.value];
  precioInput.value = producto ? producto.precio.toFixed(2) : "";
});

btnAgregarProducto.addEventListener("click", () => {
  const id = productoSelect.value;
  const cantidad = parseInt(cantidadInput.value);
  const producto = productosMap[id];

  if (!producto || isNaN(cantidad) || cantidad <= 0) {
    return alert("⚠️ Selecciona un producto y una cantidad válida.");
  }

  const subtotal = producto.precio * cantidad;
  const item = {
    producto: producto.nombre,
    cantidad,
    precio: producto.precio,
    total: subtotal
  };
  productosPedido.push(item);

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${item.producto}</td>
    <td>${item.precio.toFixed(2)}</td>
    <td>${item.cantidad}</td>
    <td>${item.total.toFixed(2)}</td>
    <td><button class="btn btn-sm btn-danger">✕</button></td>
  `;
  fila.querySelector("button").addEventListener("click", () => {
    productosPedido = productosPedido.filter(p => p !== item);
    fila.remove();
  });
  listaProductos.appendChild(fila);
  cantidadInput.value = "";
  precioInput.value = "";
  productoSelect.value = "";
});

btnRegistrar.addEventListener("click", async () => {
  const mozo = mozoselect.value;
  const mesaId = mesaIdInput.value;
  const mesaData = mesasMap[mesaId];

  if (!mozo) return alert("⚠️ Selecciona un mozo.");
  if (!mesaId) return alert("⚠️ Selecciona una mesa.");
  if (productosPedido.length === 0) return alert("⚠️ Agrega al menos un producto.");

  const total = productosPedido.reduce((acc, i) => acc + i.total, 0);
  const pedido = {
    mozos: mozo,
    mesa: parseInt(mesaData.numero_mesa),
    estado: "pendiente",
    items: productosPedido,
    total,
    fecha: new Date()
  };

  try {
    await PedidoModel.agregarPedido(pedido);
    await PedidoModel.actualizarMesa(mesaId, "ocupado");
    alert("✅ Pedido registrado.");
    formulario.style.display = "none";
    resetFormulario();
  } catch (err) {
    console.error(err);
    alert("❌ Error al registrar el pedido.");
  }
});

function resetFormulario() {
  mozoselect.value = "";
  productoSelect.value = "";
  cantidadInput.value = "";
  precioInput.value = "";
  productosPedido = [];
  listaProductos.innerHTML = "";
}

window.addEventListener("DOMContentLoaded", () => {
  cargarMozos();
  cargarProductos();
});
