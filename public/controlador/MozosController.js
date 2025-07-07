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
      url: "../../assets/datatables/es.json"  // ← Ruta corregida
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

  document.getElementById("formmozos").addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const editingId = form.dataset.editingId;

    const mozos = {
      dni: document.getElementById("txtdni").value,
      nombre: document.getElementById("txtnombre").value,
      apellidoPaterno: document.getElementById("txtapepat").value,
      apellidoMaterno: document.getElementById("txtapemat").value,
      direccion: document.getElementById("txtdireccion").value,
      telefono: document.getElementById("txttelefono").value,
      correo: document.getElementById("txtcorreo").value
    };

    if (editingId) {
      await actualizarmozos(editingId, mozos);
      mostrarMensaje("✅ Mozo fue actualizado correctamente");
      delete form.dataset.editingId;
    } else {
      await agregarmozos(mozos);
      mostrarMensaje("✅ Mozo fue agregado correctamente");
    }

    await cargarmozos();
    form.reset();
    document.getElementById("btnSubmit").textContent = "Agregar Mozo";
    document.getElementById("btnCancelar").classList.add("d-none");
  });

  $("#tabla-mozos tbody").on("click", ".eliminar", async function () {
    const id = $(this).data("id");
    if (confirm("¿Eliminar mozo?")) {
      await eliminarmozos(id);
      await cargarmozos();
      mostrarMensaje("🗑️ Mozo fue eliminado correctamente");
    }
  });

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

  document.getElementById("btnCancelar").addEventListener("click", () => {
    const form = document.getElementById("formmozos");
    form.reset();
    delete form.dataset.editingId;
    document.getElementById("btnSubmit").textContent = "Agregar Mozo";
    document.getElementById("btnCancelar").classList.add("d-none");
  });

  // Mostrar mensaje flotante
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
