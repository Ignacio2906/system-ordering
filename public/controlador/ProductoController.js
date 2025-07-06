import {
  obtenerProductos,
  agregarProducto,
  eliminarProducto,
  actualizarProducto
} from "../model/ProductoModel.js";

import { db, storage } from "../conexion/firebase.js";
import {
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tabla = $("#tabla-productos").DataTable({
    responsive: true,
    language: {
      url: "../assets/datatables/es.json"
    },
    columns: [
      { data: "nombre" },
      { data: "descripcion" },
      { data: "precio" },
      {
        data: "imagenURL",
        render: url => `<img src="${url}" width="60" height="60" style="object-fit:cover;border-radius:5px" />`
      },
      {
        data: null,
        render: data =>
          `<button class="btn btn-sm btn-warning editar" data-id="${data.id}">Editar</button>
           <button class="btn btn-sm btn-danger eliminar" data-id="${data.id}">Eliminar</button>`
      }
    ]
  });

  let modoEdicion = false;
  let idEdicion = null;
  let imagenAnterior = null;

  async function cargarProductos() {
    const productos = await obtenerProductos();
    tabla.clear().rows.add(productos).draw();
  }

  await cargarProductos();

  document.getElementById("formProducto").addEventListener("submit", async e => {
    e.preventDefault();

    const archivo = document.getElementById("imagenArchivo").files[0];
    const nombre = document.getElementById("txtnombre").value;
    const descripcion = document.getElementById("txtdescripcion").value;
    const precio = document.getElementById("txtprecio").value;

    if (modoEdicion) {
      await actualizarProducto(idEdicion, nombre, descripcion, precio, archivo, imagenAnterior);
      mostrarMensaje("Producto actualizado correctamente");
    } else {
      if (!archivo) return alert("Selecciona una imagen");
      await agregarProducto(nombre, descripcion, precio, archivo);
      mostrarMensaje("Producto agregado correctamente");
    }

    await cargarProductos();
    e.target.reset();
    salirModoEdicion();
  });

  $("#tabla-productos tbody").on("click", ".eliminar", async function () {
    const id = $(this).data("id");
    await deleteDoc(doc(db, "productos", id));
    await cargarProductos();
  });

  $("#tabla-productos tbody").on("click", ".editar", function () {
    const data = tabla.row($(this).parents("tr")).data();

    document.getElementById("txtnombre").value = data.nombre;
    document.getElementById("txtdescripcion").value = data.descripcion;
    document.getElementById("txtprecio").value = data.precio;
    idEdicion = data.id;
    imagenAnterior = data.imagenURL;

    document.getElementById("tituloFormulario").textContent = "Editar Producto";
    document.getElementById("btnGuardar").textContent = "Actualizar Producto";
    document.getElementById("btnCancelar").classList.remove("d-none");
    modoEdicion = true;
  });

  document.getElementById("btnCancelar").addEventListener("click", () => {
    document.getElementById("formProducto").reset();
    salirModoEdicion();
  });

  function salirModoEdicion() {
    modoEdicion = false;
    idEdicion = null;
    imagenAnterior = null;
    document.getElementById("tituloFormulario").textContent = "Agregar Producto";
    document.getElementById("btnGuardar").textContent = "Agregar Producto";
    document.getElementById("btnCancelar").classList.add("d-none");
  }

  function mostrarMensaje(mensaje) {
    const alerta = document.getElementById("mensajeExito");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
    setTimeout(() => {
      alerta.classList.add("d-none");
      alerta.textContent = "";
    }, 3000);
  }
});
