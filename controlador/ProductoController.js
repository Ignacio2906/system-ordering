import productoModel from '../model/ProductoModel.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formProducto');
  let tabla;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
      nombre: document.getElementById('txtnombre').value,
      descripcion: document.getElementById('txtdescripcion').value,
      precio: parseFloat(document.getElementById('txtprecio').value),
      stock: parseInt(document.getElementById('txtstock').value)
    };

    const imagenFile = document.getElementById('imagenArchivo').files[0];
    if (!imagenFile) {
      alert('Selecciona una imagen.');
      return;
    }

    try {
      await productoModel.agregarProducto(producto, imagenFile);
      alert('Producto agregado correctamente');
      form.reset();
      cargarProductos();
    } catch (error) {
      alert('Error al agregar producto');
    }
  });

  async function cargarProductos() {
    try {
      const productos = await productoModel.obtenerProductos();
      const tablaElement = $('#tabla-productos');

      if ($.fn.DataTable.isDataTable(tablaElement)) {
        tablaElement.DataTable().destroy();
        tablaElement.empty();
      }

      const isMobile = window.innerWidth < 800;

      tabla = tablaElement.DataTable({
        data: productos,
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
          { data: 'nombre', title: 'Nombre' },
          { data: 'descripcion', title: 'Descripción' },
          { data: 'precio', title: 'Precio' },
          { data: 'stock', title: 'Stock' },
          {
            data: 'imagen',
            title: 'Imagen',
            render: function (data) {
              return `<img src="${data}" width="60"/>`;
            }
          },
          {
            data: null,
            title: 'Acciones',
            orderable: false,
            searchable: false,
            render: function (data, type, row) {
              return `<button class="btn btn-danger btn-sm" onclick="eliminarProducto('${row.id}')">Eliminar</button>`;
            }
          }
        ],
        language: {
          url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        }
      });

    } catch (error) {
      console.error("Error al cargar productos: ", error);
    }
  }

  window.eliminarProducto = async function (id) {
    try {
      await productoModel.eliminarProducto(id);
      alert('Producto eliminado');
      cargarProductos();
    } catch (error) {
      alert('Error eliminando producto');
    }
  };

  cargarProductos();

  window.addEventListener('resize', () => {
    if (tabla) {
      tabla.columns.adjust().responsive.recalc();
    }
  });
});
