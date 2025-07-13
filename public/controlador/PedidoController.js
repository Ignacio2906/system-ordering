import PedidoModel from "../model/PedidoModel.js"; 

const formulario = document.getElementById("formulario-pedido");
const mesaContainer = document.getElementById("mesas-container");
const mozoselect = document.getElementById("mozosId");
const productoSelect = document.getElementById("productoId");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precioUnitario");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const btnRegistrar = document.getElementById("btn-registrar");
const btnActualizar = document.getElementById("btn-actualizar");
const listaProductos = document.getElementById("lista-productos");
const cerrarBtn = document.getElementById("cerrar-formulario");
const mesaIdInput = document.getElementById("mesaId");

const urlParams = new URLSearchParams(window.location.search);
const pedidoId = urlParams.get("edit");

let productosMap = {};
let mesasMap = {};
let productosPedido = [];
let pedidoOriginal = null;

PedidoModel.escucharMesas(mesas => {
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
        btnRegistrar.style.display = "inline-block";
        btnActualizar.style.display = "none";
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
  mozos.forEach(m => {
    mozoselect.innerHTML += `<option value="${m.dni}">${m.nombre}</option>`;
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
  const p = productosMap[productoSelect.value];
  precioInput.value = p ? p.precio.toFixed(2) : "";
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
    actualizarTotal();
  });
  listaProductos.appendChild(fila);

  actualizarTotal();
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
    alert(" Pedido registrado.");
    resetFormulario();
    formulario.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("❌ Error al registrar el pedido.");
  }
});

btnActualizar.addEventListener("click", async () => {
  if (!pedidoOriginal) return;

  const mozo = mozoselect.value;
  if (!mozo) return alert("⚠️ Selecciona un mozo.");
  if (productosPedido.length === 0) return alert("⚠️ Agrega productos.");

  const total = productosPedido.reduce((acc, i) => acc + i.total, 0);

  const pedido = {
    mozos: mozo,
    mesa: pedidoOriginal.mesa,
    estado: "pendiente",
    items: productosPedido,
    total,
    fecha: new Date()
  };

  try {
    await PedidoModel.actualizarPedido(pedidoId, pedido);
    alert(" Pedido actualizado.");
    location.href = "../MntDetalle/detalle.html";
  } catch (err) {
    console.error(err);
    alert("❌ Error al actualizar el pedido.");
  }
});

function resetFormulario() {
  mozoselect.value = "";
  productoSelect.value = "";
  cantidadInput.value = "";
  precioInput.value = "";
  productosPedido = [];
  listaProductos.innerHTML = "";
  mesaIdInput.value = "";
  btnRegistrar.style.display = "inline-block";
  btnActualizar.style.display = "none";
}

function actualizarTotal() {
  const total = productosPedido.reduce((acc, item) => acc + item.total, 0);
  const totalEl = document.getElementById("total-pedido");
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

window.addEventListener("DOMContentLoaded", async () => {
  await cargarMozos();
  await cargarProductos();

  if (pedidoId) {
    pedidoOriginal = await PedidoModel.obtenerPedidoPorId(pedidoId);

    if (!pedidoOriginal) return alert("❌ Pedido no encontrado");

    formulario.style.display = "block";
    formulario.querySelector("h4").textContent = "Editar Pedido";

    btnRegistrar.style.display = "none";
    btnActualizar.style.display = "inline-block";

    mozoselect.value = pedidoOriginal.mozos;
    productosPedido = pedidoOriginal.items || [];

    listaProductos.innerHTML = "";
    productosPedido.forEach(item => {
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
        actualizarTotal();
      });
      listaProductos.appendChild(fila);
    });

    actualizarTotal();
  }
});
