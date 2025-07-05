// controlador/mozosController.js
import {
  obtenermozos,
  agregarmozos,
  eliminarmozos
} from "../model/MozosModel.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tabla = $("#tabla-mozos").DataTable({
    responsive: true,
    destroy: true,
    language: {
      url: "../assets/datatables/es.json"
    },
    columns: [
      { data: "dni", title: "DNI" },
      { data: "nombre", title: "Nombre" },
      { data: "apellidoPaterno", title: "Apellido Paterno" },
      { data: "apellidoMaterno", title: "Apellido Materno" },
      { data: "direccion", title: "Dirección" },
      { data: "telefono", title: "Teléfono" },
      { data: "correo", title: "Correo" },
      {
        data: null,
        title: "Acciones",
        render: row =>
          `<button class="btn btn-danger btn-sm eliminar" data-id="${row.id}">Eliminar</button>`
      }
    ]
  });

  async function cargarmozos() {
    const mozos = await obtenermozos();
    tabla.clear().rows.add(mozos).draw();
  }

  await cargarmozos();

  document.getElementById("formmozos").addEventListener("submit", async e => {
    e.preventDefault();

    const mozos = {
      dni: document.getElementById("txtdni").value,
      nombre: document.getElementById("txtnombre").value,
      apellidoPaterno: document.getElementById("txtapepat").value,
      apellidoMaterno: document.getElementById("txtapemat").value,
      direccion: document.getElementById("txtdireccion").value,
      telefono: document.getElementById("txttelefono").value,
      correo: document.getElementById("txtcorreo").value
    };

    await agregarmozos(mozos);
    await cargarmozos();
    e.target.reset();
  });

  $("#tabla-mozos tbody").on("click", ".eliminar", async function () {
    const id = $(this).data("id");
    if (confirm("¿Eliminar mozos?")) {
      await eliminarmozos(id);
      await cargarmozos();
    }
  });
});
