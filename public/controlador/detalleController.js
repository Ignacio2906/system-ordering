import DetalleModel from "../model/DetalleModel.js";
import EstadoController from "./EstadoController.js";
import { aplicarPermisos } from "./sessionCheckController.js";
import PedidoModel from "../model/PedidoModel.js";
import { exportarTodosLosPedidosAExcel } from "./exportarExcel.js";

let pedidos = [];
let mozosMap = {};
let tabla;
let sonido;
let rolUsuario = null;

async function init() {
  try {
    // Obtener rol actual del usuario autenticado
    rolUsuario = await aplicarPermisos();
        const mozos = await DetalleModel.obtenerMozos();
    mozos.forEach(m => {
      mozosMap[m.dni] = m.nombre;
    });

    sonido = document.getElementById("notificacion-audio");

    tabla = $("#tabla-detalle").DataTable({
      data: [],
      columns: [
        { title: "Mozo" },
        { title: "Mesa" },
        { title: "Productos" },
        { title: "Total" },
        { title: "Fecha" },
        { title: "Estado" },
        ...(rolUsuario === "admin" || rolUsuario === "mozo" ? [{ title: "Acciones" }] : [])
      ],
      responsive: true,
      language: {
        url: "../../assets/datatables/es.json"
      },
      drawCallback: function () {
        $(".dataTable").find("select").each(function () {
          this.addEventListener("click", e => e.stopPropagation());
          this.addEventListener("mousedown", e => e.stopPropagation());
        });
      }
    });

    // Mostrar botón de exportar solo para admin
    if (rolUsuario === "admin") {
      document.getElementById("btn-exportar-excel-container").style.display = "block";
      document.getElementById("btn-exportar-excel").addEventListener("click", () => {
        exportarTodosLosPedidosAExcel(pedidos, mozosMap);
      });
    }

    // Escuchar cambios en los pedidos
    DetalleModel.escucharPedidos(nuevosPedidos => {
      detectarCambiosSonido(pedidos, nuevosPedidos);
      pedidos = nuevosPedidos;
      actualizarTabla();
    });

  } catch (error) {
    console.error("❌ Error al iniciar vista Detalle:", error);
  }
}

function detectarCambiosSonido(previos, actuales) {
  for (const actual of actuales) {
    const previo = previos.find(p => p.id === actual.id);

    if (!previo) {
      if (rolUsuario === "cocinero" && actual.estado === "pendiente") {
        sonido?.play();
      }
    } else if (previo.estado !== actual.estado) {
      if (rolUsuario === "cocinero" && actual.estado === "pendiente") {
        sonido?.play();
      } else if (rolUsuario === "mozo" && actual.estado === "creado") {
        sonido?.play();
      }
    }
  }
}

function actualizarTabla() {
  const data = pedidos.map(p => {
    const fila = [
      mozosMap[p.mozos] || "(Sin nombre)",
      p.mesa,
      p.items.map(i => `${i.producto} x${i.cantidad}`).join("<br>"),
      p.total?.toFixed(2) || "0.00",
      p.fecha?.toDate?.().toLocaleDateString() || "Sin fecha",
      EstadoController.generarSelectEstado(p, rolUsuario)
    ];

    if (rolUsuario === "admin" || rolUsuario === "mozo") {
      fila.push(generarBotones(p));
    }

    return fila;
  });

  tabla.clear().rows.add(data).draw();
}

function generarBotones(pedido) {
  const editarBtn = `<button onclick="editarPedido('${pedido.id}')" class="btn btn-sm btn-primary me-1">Editar</button>`;
  const eliminarBtn = `<button onclick="eliminarPedido('${pedido.id}')" class="btn btn-sm btn-danger me-1">Eliminar</button>`;
  const exportarBtn = `<button onclick="exportarPDF('${pedido.id}')" class="btn btn-sm btn-success">PDF</button>`;

  if (rolUsuario === "admin") return editarBtn + eliminarBtn + exportarBtn;
  if (rolUsuario === "mozo") return editarBtn;
  return "";
}

window.editarPedido = function (id) {
  window.location.href = `../MntPedido/pedido.html?edit=${id}`;
};

window.eliminarPedido = async function (id) {
  if (!confirm("¿Deseas eliminar este pedido?")) return;
  await DetalleModel.eliminarPedido(id);
  location.reload();
};

window.exportarPDF = async function (id) {
  const pedido = await DetalleModel.obtenerPedidoPorId(id);
  const mozoNombre = mozosMap[pedido.mozos] || "(Sin nombre)";
  const doc = new jspdf.jsPDF();

  doc.text(`Pedido ID: ${id}`, 10, 10);
  doc.text(`Mozo: ${mozoNombre}`, 10, 20);
  doc.text(`Mesa: ${pedido.mesa}`, 10, 30);
  doc.text(`Fecha: ${pedido.fecha.toDate().toLocaleString()}`, 10, 40);
  doc.text(`Estado: ${pedido.estado}`, 10, 50);

  doc.autoTable({
    startY: 60,
    head: [["Producto", "Precio", "Cantidad", "Subtotal"]],
    body: pedido.items.map(i => [
      i.producto,
      i.precio.toFixed(2),
      i.cantidad,
      i.total.toFixed(2)
    ])
  });

  doc.text(`Total: S/ ${pedido.total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
  doc.save(`pedido-${id}.pdf`);
};

window.addEventListener("DOMContentLoaded", init);
