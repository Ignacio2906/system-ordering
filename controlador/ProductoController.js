import productoModel from '../model/ProductoModel.js';

const form = document.getElementById('formProducto');
const tbody = document.getElementById('producto');

// Cargar productos al iniciar
window.addEventListener('DOMContentLoaded', async () => {
  const productos = await productoModel.obtenerProductos();
  mostrarProductos(productos);
});

// Agregar producto
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value;
  const descripcion = form.descripcion.value;
  const precio = parseFloat(form.precio.value);
  const stock = parseInt(form.stock.value);
  const imagenFile = form.imagen.files[0];

  if (!imagenFile) {
    alert("Selecciona una imagen.");
    return;
  }

  const producto = { nombre, descripcion, precio, stock };

  await productoModel.agregarProducto(producto, imagenFile);
  form.reset();

  const productos = await productoModel.obtenerProductos();
  mostrarProductos(productos);
});

// Mostrar productos en tabla
function mostrarProductos(productos) {
  tbody.innerHTML = '';
  productos.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td>${p.precio}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn btn-danger btn-sm" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Agregar evento para eliminar
  document.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await productoModel.eliminarProducto(id);
      const productos = await productoModel.obtenerProductos();
      mostrarProductos(productos);
    });
  });
}
