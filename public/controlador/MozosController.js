import {
  obtenermozos,
  agregarmozos,
  eliminarmozos,
  actualizarmozos
} from "../model/MozosModel.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tabla = $("#tabla-mozos").DataTable({
    responsive: true,
    destroy: true,
    language: {
      url: "../../assets/datatables/es.json"
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
        render: row => `
          <button class="btn btn-primary btn-sm editar" data-id="${row.id}">Editar</button>
          <button class="btn btn-danger btn-sm eliminar" data-id="${row.id}">Eliminar</button>
        `
      }
    ]
  });

  async function cargarmozos() {
    const mozos = await obtenermozos();
    tabla.clear().rows.add(mozos).draw();
  }

  await cargarmozos();

  // Enviar formulario
  document.getElementById("formmozos").addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const editingId = form.dataset.editingId;

    const mozos = {
      dni: document.getElementById("txtdni").value.trim(),
      nombre: document.getElementById("txtnombre").value.trim(),
      apellidoPaterno: document.getElementById("txtapepat").value.trim(),
      apellidoMaterno: document.getElementById("txtapemat").value.trim(),
      direccion: document.getElementById("txtdireccion").value.trim(),
      telefono: document.getElementById("txttelefono").value.trim(),
      correo: document.getElementById("txtcorreo").value.trim()
    };

    try {
      if (editingId) {
        await actualizarmozos(editingId, mozos);
        mostrarMensaje(" Mozo actualizado correctamente");
        delete form.dataset.editingId;
      } else {
        await agregarmozos(mozos);
        mostrarMensaje(" Mozo agregado correctamente");
      }

      await cargarmozos();
      form.reset();
      document.getElementById("btnSubmit").textContent = "Agregar Mozo";
      document.getElementById("btnCancelar").classList.add("d-none");
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarMensaje("❌ Ocurrió un error");
    }
  });

  // Eliminar mozo
  $("#tabla-mozos tbody").on("click", ".eliminar", async function () {
    const id = $(this).data("id");
    if (confirm("¿Eliminar mozo?")) {
      await eliminarmozos(id);
      await cargarmozos();
      mostrarMensaje("🗑️ Mozo eliminado correctamente");
    }
  });

  // Editar mozo
  $("#tabla-mozos tbody").on("click", ".editar", async function () {
    const id = $(this).data("id");
    const mozos = await obtenermozos();
    const mozo = mozos.find(m => m.id === id);

    if (!mozo) return mostrarMensaje("⚠️ Mozo no encontrado");

    document.getElementById("txtdni").value = mozo.dni;
    document.getElementById("txtnombre").value = mozo.nombre;
    document.getElementById("txtapepat").value = mozo.apellidoPaterno;
    document.getElementById("txtapemat").value = mozo.apellidoMaterno;
    document.getElementById("txtdireccion").value = mozo.direccion;
    document.getElementById("txttelefono").value = mozo.telefono;
    document.getElementById("txtcorreo").value = mozo.correo;

    document.getElementById("formmozos").dataset.editingId = id;
    document.getElementById("btnSubmit").textContent = "Actualizar Mozo";
    document.getElementById("btnCancelar").classList.remove("d-none");
  });

  // Cancelar edición
  document.getElementById("btnCancelar").addEventListener("click", () => {
    const form = document.getElementById("formmozos");
    form.reset();
    delete form.dataset.editingId;
    document.getElementById("btnSubmit").textContent = "Agregar Mozo";
    document.getElementById("btnCancelar").classList.add("d-none");
  });

  // Mensaje tipo toast con Bootstrap
  function mostrarMensaje(mensaje) {
    const toastElement = document.getElementById('toastMensaje');
    const toastBody = document.getElementById('toastMensajeTexto');

    toastBody.textContent = mensaje;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
});
