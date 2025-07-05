// controlador/ProductoController.js
import { db, storage } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Referencia a la colección
const productosRef = collection(db, "productos");

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
      { data: "stock" },
      {
        data: "imagenURL",
        render: url =>
          `<img src="${url}" width="60" height="60" style="object-fit:cover;border-radius:5px" />`
      },
      {
        data: null,
        render: data =>
          `<button class="btn btn-danger btn-sm eliminar" data-id="${data.id}">Eliminar</button>`
      }
    ]
  });

  const snapshot = await getDocs(productosRef);
  snapshot.forEach(docSnap => {
    const producto = docSnap.data();
    producto.id = docSnap.id;
    tabla.row.add(producto).draw(false);
  });

  document.getElementById("formProducto").addEventListener("submit", async e => {
    e.preventDefault();
    const archivo = document.getElementById("imagenArchivo").files[0];
    if (!archivo) return alert("Selecciona una imagen");

    const ruta = `productos/${Date.now()}-${archivo.name}`;
    const refArchivo = ref(storage, ruta);
    const subida = await uploadBytes(refArchivo, archivo);
    const imagenURL = await getDownloadURL(subida.ref);

    const producto = {
      nombre: document.getElementById("txtnombre").value,
      descripcion: document.getElementById("txtdescripcion").value,
      precio: parseFloat(document.getElementById("txtprecio").value),
      stock: parseInt(document.getElementById("txtstock").value),
      imagenURL
    };

    const docRef = await addDoc(productosRef, producto);
    producto.id = docRef.id;
    tabla.row.add(producto).draw(false);
    e.target.reset();
  });

  $("#tabla-productos tbody").on("click", ".eliminar", async function () {
    const id = $(this).data("id");
    await deleteDoc(doc(db, "productos", id));
    tabla.row($(this).parents("tr")).remove().draw();
  });
});
