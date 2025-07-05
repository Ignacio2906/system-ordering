import PedidoModel from "../model/PedidoModel.js";
import EstadoController from "./EstadoController.js";

const mozoselect = document.getElementById("mozosId");
const mesaSelect = document.getElementById("mesaId");
const productoSelect = document.getElementById("productoId");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precioUnitario");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const btnRegistrar = document.getElementById("btn-registrar");
const listaProductos = document.getElementById("lista-productos");

let mozosMap = {};
let mesasMap = {};
let productosMap = {};
let productosPedido = [];
let tablaPedidos;
let pedidoEditandoId = null;
let pedidosGlobal = [];

const rolUsuario = sessionStorage.getItem("rol") || "";

async function cargarmozos() {
  const mozos = await PedidoModel.obtenermozos();
  if (!mozoselect) return;
  mozoselect.innerHTML = '<option value="">Seleccione un mozo</option>';
  mozos.forEach(mozo => {
    mozoselect.innerHTML += `<option value="${mozo.dni}">${mozo.nombre} (${mozo.dni})</option>`;
    mozosMap[mozo.dni] = mozo;
  });
}

async function cargarMesas() {
  const mesas = await PedidoModel.obtenerMesas();
  if (!mesaSelect) return;
  mesaSelect.innerHTML = '<option value="">Seleccione una mesa</option>';
  mesas.forEach(mesa => {
    mesaSelect.innerHTML += `<option value="${mesa.numero_mesa}">${mesa.numero_mesa}</option>`;
    mesasMap[mesa.numero_mesa] = mesa;
  });
}

async function cargarProductos() {
  const productos = await PedidoModel.obtenerProductos();
  productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
  productos.forEach(producto => {
    productoSelect.innerHTML += `<option value="${producto.id}">${producto.nombre}</option>`;
    productosMap[producto.id] = producto;
  });
}

productoSelect.addEventListener("change", () => {
  const productoId = productoSelect.value;
  const producto = productosMap[productoId];
  precioInput.value = producto ? producto.precio.toFixed(2) : "";
});

btnAgregarProducto.addEventListener("click", () => {
  const productoId = productoSelect.value;
  const cantidad = parseInt(cantidadInput.value);
  const producto = productosMap[productoId];

  if (!productoId || !cantidad || cantidad <= 0) {
    alert("⚠️ Complete los campos del producto correctamente.");
    return;
  }

  const subtotal = producto.precio * cantidad;

  productosPedido.push({
    producto: producto.nombre, // ✅ GUARDAR NOMBRE en lugar de ID
    cantidad,
    precio: producto.precio,
    total: subtotal // ✅ TOTAL POR ÍTEM
  });

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${producto.nombre}</td>
    <td>${producto.precio.toFixed(2)}</td>
    <td>${cantidad}</td>
    <td>${subtotal.toFixed(2)}</td>
    <td><button class="btn btn-sm btn-danger">✕</button></td>
  `;
  fila.querySelector("button").addEventListener("click", () => {
    productosPedido = productosPedido.filter(p => p !== productosPedido[productosPedido.length - 1]);
    fila.remove();
  });
  listaProductos.appendChild(fila);

  cantidadInput.value = "";
  precioInput.value = "";
});

async function registrarPedido() {
  const mozoId = mozoselect.value;
  const mesaNumero = mesaSelect.value;

  if (!mozoId || !mesaNumero || productosPedido.length === 0) {
    alert("⚠️ Complete todos los campos y agregue al menos un producto.");
    return;
  }

  const totalPedido = productosPedido.reduce((acc, item) => acc + item.total, 0);

  const pedido = {
    mozos: mozoId,
    mesa: parseInt(mesaNumero),
    estado: "pendiente",
    items: productosPedido,
    total: totalPedido,
    fecha: new Date()
  };

  try {
    if (pedidoEditandoId) {
      await PedidoModel.actualizarPedido(pedidoEditandoId, pedido);
      alert("✅ Pedido actualizado correctamente.");
      pedidoEditandoId = null;
    } else {
      await PedidoModel.agregarPedido(pedido);
      alert("✅ Pedido registrado correctamente.");
    }
    resetFormulario();
  } catch (err) {
    console.error(err);
    alert("❌ Error al registrar o actualizar pedido.");
  }
}

function resetFormulario() {
  mozoselect.value = "";
  mesaSelect.value = "";
  productoSelect.value = "";
  cantidadInput.value = "";
  precioInput.value = "";
  productosPedido = [];
  listaProductos.innerHTML = "";
  btnRegistrar.textContent = "Realizar Pedido";
}

function renderizarPedidos(pedidos) {
  pedidosGlobal = pedidos;
  const filas = [];

  pedidos.forEach(pedido => {
    if (pedido.estado === "inactivo") return;

    const fecha = pedido.fecha?.toDate?.()?.toLocaleDateString() || "Sin fecha";
    const mozo = mozosMap[pedido.mozos]?.nombre || "(No definido)";
    const mesa = pedido.mesa || "(Sin mesa)";
    const productosTexto = Array.isArray(pedido.items)
      ? pedido.items.map(item => `${item.producto} x ${item.cantidad}`).join("<br>")
      : "(Sin productos)";
    const totalTexto = pedido.total?.toFixed(2) || "0.00";

    filas.push([
      mozo,
      mesa,
      productosTexto,
      totalTexto,
      fecha,
      pedido.estado,
      `<button onclick="editarPedido('${pedido.id}')" class="btn btn-sm btn-primary">Editar</button>`
    ]);
  });

  tablaPedidos.clear().rows.add(filas).draw();
}

window.editarPedido = async function (id) {
  const pedido = await PedidoModel.obtenerPedidoPorId(id);
  if (!pedido) return alert("⚠️ Pedido no encontrado.");

  mozoselect.value = pedido.mozos;
  mesaSelect.value = pedido.mesa;
  productosPedido = pedido.items || [];
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
    });
    listaProductos.appendChild(fila);
  });

  pedidoEditandoId = id;
  btnRegistrar.textContent = "Actualizar Pedido";
};

window.mostrarPedidos = () => PedidoModel.obtenerPedidos().then(renderizarPedidos);

window.addEventListener("DOMContentLoaded", async () => {
  await cargarmozos();
  await cargarMesas();
  await cargarProductos();

  tablaPedidos = $("#tabla-pedidos").DataTable({
    responsive: {
      details: {
        type: 'column',
        target: 'tr',
        renderer: function (api, rowIdx, columns) {
          return columns.map(col => {
            if (col.hidden) {
              let value = col.data;
              if (col.title === "Estado") {
                const btn = api.cell(rowIdx, 6).nodes().to$().find("button");
                const pedidoId = btn.attr("onclick")?.match(/'(.+)'/)?.[1];
                const pedido = pedidosGlobal.find(p => p.id === pedidoId);
                value = EstadoController.generarSelectEstado(pedido, rolUsuario);
              }
              return `<tr><td><strong>${col.title}:</strong></td><td style="overflow-x:auto">${value}</td></tr>`;
            }
            return '';
          }).join('');
        }
      }
    },
    destroy: true,
    language: {
      url: "../assets/datatables/es.json"
    },
    columns: [
      { title: "Mozo" },
      { title: "Mesa" },
      { title: "Producto(s)" },
      { title: "Total" },
      { title: "Fecha" },
      { title: "Estado" },
      { title: "Acciones" }
    ],
    createdRow: function (row, data, dataIndex) {
      const btn = row.cells[6]?.querySelector("button");
      if (!btn) return;
      const pedidoId = btn.getAttribute("onclick").match(/'(.+)'/)[1];
      const pedido = pedidosGlobal.find(p => p.id === pedidoId);
      if (pedido) {
        row.cells[5].innerHTML = EstadoController.generarSelectEstado(pedido, rolUsuario);
      }
    }
  });

  PedidoModel.escucharPedidos(renderizarPedidos);
  btnRegistrar.addEventListener("click", registrarPedido);
});
