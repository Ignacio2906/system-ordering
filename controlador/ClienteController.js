import clienteModel from "../model/ClienteModel.js";
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();

  document.getElementById("formCliente").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoCliente = {
      dni: document.getElementById("txtdni").value,
      nombre: document.getElementById("txtnombre").value,
      apellidoPaterno: document.getElementById("txtapepat").value,
      apellidoMaterno: document.getElementById("txtapemat").value,
      direccion: document.getElementById("txtdireccion").value,
      telefono: document.getElementById("txttelefono").value,
      correo: document.getElementById("txtcorreo").value
    };

    await clienteModel.agregarCliente(nuevoCliente);
    await cargarClientes();
    document.getElementById("formCliente").reset();
  });
});

async function cargarClientes() {
  try {
    const clientes = await clienteModel.obtenerClientes();

    $('#tabla-clientes').DataTable({
      data: clientes,
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
          render: function (data, type, row) {
            return `<button class="btn btn-danger btn-sm" onclick="eliminarCliente('${row.id}')">Eliminar</button>`;
          }
        }
      ],
      destroy: true,
      responsive: true,
      language: {
        url: "../assets/datatables/es.json"
      }
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

window.eliminarCliente = async function (id) {
  if (confirm("¿Estás seguro de eliminar este cliente?")) {
    await clienteModel.eliminarCliente(id);
    await cargarClientes();
  }
};
