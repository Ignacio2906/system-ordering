import clienteModel from '../model/ClienteModel.js';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cliente = {
    dni: document.getElementById('txtdni').value,
    nombre: document.getElementById('txtnombre').value,
    apellidoPaterno: document.getElementById('txtapepat').value,
    apellidoMaterno: document.getElementById('txtapemat').value,
    direccion: document.getElementById('txtdireccion').value,
    telefono: document.getElementById('txttelefono').value,
    correo: document.getElementById('txtcorreo').value,
  };

  try {
    await clienteModel.agregarCliente(cliente);
    alert('Cliente agregado correctamente');
    e.target.reset();
    cargarClientes();
  } catch (error) {
    alert('Error al agregar cliente');
  }
});

let tabla; // Para mantener la instancia

async function cargarClientes() {
  try {
    const clientes = await clienteModel.obtenerClientes();
    const tablaElement = $('#tabla-clientes');

    // Destruir si existe
    if ($.fn.DataTable.isDataTable(tablaElement)) {
      tablaElement.DataTable().destroy();
      tablaElement.empty(); // Borra thead/tbody generados
    }

    const isMobile = window.innerWidth < 720;

    tabla = tablaElement.DataTable({
      data: clientes,
      scrollX: !isMobile,
      responsive: isMobile
        ? {
            details: {
              type: 'inline',
              target: 'tr'
            }
          }
        : false,
      columns: [
        { data: 'dni', title: 'DNI' },
        { data: 'nombre', title: 'Nombre' },
        { data: 'apellidoPaterno', title: 'Apellido Paterno' },
        { data: 'apellidoMaterno', title: 'Apellido Materno' },
        { data: 'direccion', title: 'Dirección' },
        { data: 'telefono', title: 'Teléfono' },
        { data: 'correo', title: 'Correo' },
        {
          data: null,
          title: 'Acciones',
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            return `<button class="btn btn-danger btn-sm" onclick="eliminarCliente('${row.id}')">Eliminar</button>`;
          }
        }
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
      }
    });

  } catch (error) {
    console.error("Error al cargar clientes: ", error);
  }
}

// Eliminar cliente
window.eliminarCliente = async function (id) {
  try {
    await clienteModel.eliminarCliente(id);
    alert('Cliente eliminado');
    cargarClientes();
  } catch (error) {
    alert('Error eliminando cliente');
  }
};

cargarClientes();

//  Redibujar si se redimensiona la pantalla
window.addEventListener('resize', () => {
  cargarClientes();
});
