// clienteController.js
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

async function cargarClientes() {
  try {
    const clientes = await clienteModel.obtenerClientes();
    const tabla = $('#tabla-clientes');
    const tbody = tabla.find('tbody');

    if (!tbody.length) {
      console.error("No se encontró el tbody dentro de la tabla.");
      return;
    }

    // Destruir DataTable anterior si ya existe
    if ($.fn.DataTable.isDataTable(tabla)) {
      tabla.DataTable().destroy();
    }

    tbody.html(''); // Limpiar la tabla

    if (clientes.length === 0) {
      tbody.html('<tr><td colspan="8">No hay clientes registrados.</td></tr>');
    } else {
      clientes.forEach(cliente => {
        const tr = `
          <tr>
            <td>${cliente.dni || ''}</td>
            <td>${cliente.nombre || ''}</td>
            <td>${cliente.apellidoPaterno || ''}</td>
            <td>${cliente.apellidoMaterno || ''}</td>
            <td>${cliente.direccion || ''}</td>
            <td>${cliente.telefono || ''}</td>
            <td>${cliente.correo || ''}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="eliminarCliente('${cliente.id}')">Eliminar</button>
            </td>
          </tr>
        `;
        tbody.append(tr);
      });
    }

    // Reiniciar DataTables después de llenar
    tabla.DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
      }
    });

  } catch (error) {
    console.error("Error al cargar clientes: ", error);
  }
}

window.cargarClientes = cargarClientes;

window.eliminarCliente = async function(id) {
  try {
    await clienteModel.eliminarCliente(id);
    alert('Cliente eliminado');
    cargarClientes();
  } catch (error) {
    alert('Error eliminando cliente');
  }
};

cargarClientes();
