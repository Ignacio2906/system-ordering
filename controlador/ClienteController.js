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

const clientes = await clienteModel.obtenerClientes();
console.log(clientes); // Mira aquí si el campo apellidoPaterno está presente

async function cargarClientes() {
  try {
    const clientes = await clienteModel.obtenerClientes();
    console.log("Clientes obtenidos:", clientes);
    

    const tbody = document.querySelector("#tabla-clientes tbody");
    if (!tbody) {
      console.error("No se encontró el tbody dentro de la tabla.");
      return;
    }

    tbody.innerHTML = ''; // Limpiar contenido previo

    if (clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No hay clientes registrados.</td></tr>';
      return;
    }

    clientes.forEach(cliente => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${cliente.dni || ''}</td>      
        <td>${cliente.nombre || ''}</td>
        <td>${cliente.apellidoPaterno || ''}</td>
        <td>${cliente.apellidoMaterno || ''}</td>
        <td>${cliente.direccion || ''}</td>
        <td>${cliente.telefono || ''}</td>
        <td>${cliente.correo || ''}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarCliente('${cliente.dni}')">Eliminar</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
    console.log("Apellido Paterno del cliente:", cliente.apellidoPaterno);


  } catch (error) {
    console.error("Error al cargar clientes: ", error);
  }
}

window.cargarClientes = cargarClientes; // para que puedas llamarla desde consola o después del login


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
