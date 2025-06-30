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

// Subir imagen y devolver URL
async function subirImagen(file) {
  const ruta = `productos/${file.name}`;
  const storageRef = ref(storage, ruta);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Agregar producto a Firestore
async function agregarProducto(producto, imagenFile) {
  const urlImagen = await subirImagen(imagenFile);
  const nuevoProducto = {
    ...producto,
    imagen: urlImagen,
    imagenNombre: imagenFile.name, // Para poder eliminarla luego si se quiere
    fecha: new Date()
  };
  await addDoc(coleccion, nuevoProducto);
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
