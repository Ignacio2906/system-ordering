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

const coleccion = collection(db, "productos");

async function subirImagen(file) {
  const uniqueName = `${Date.now()}-${file.name}`;
  const ruta = `productos/${uniqueName}`;
  const storageRef = ref(storage, ruta);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

async function agregarProducto(producto, imagenFile) {
  const nuevoProducto = {
    ...producto,
    imagen: "https://via.placeholder.com/60", // Imagen temporal
    imagenNombre: "sin-imagen",
    fecha: new Date()
  };

  await addDoc(coleccion, nuevoProducto);
  console.log("✅ Producto agregado (sin imagen)");
}


async function obtenerProductos() {
  const consulta = await getDocs(coleccion);
  return consulta.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function eliminarProducto(id) {
  const productoRef = doc(db, "productos", id);
  await deleteDoc(productoRef);
  console.log("🗑️ Producto eliminado:", id);
}

export default {
  agregarProducto,
  obtenerProductos,
  eliminarProducto
};
