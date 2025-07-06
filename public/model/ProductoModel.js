import { db, storage } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const productosRef = collection(db, "productos");

export async function obtenerProductos() {
  const snapshot = await getDocs(productosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function agregarProducto(nombre, descripcion, precio, archivo) {
  const ruta = `productos/${Date.now()}-${archivo.name}`;
  const refArchivo = ref(storage, ruta);
  await uploadBytes(refArchivo, archivo);
  const url = await getDownloadURL(refArchivo);

  return await addDoc(productosRef, {
    nombre,
    descripcion,
    precio: parseFloat(precio),
    imagenURL: url
  });
}

export async function actualizarProducto(id, nombre, descripcion, precio, archivo, imagenAnterior) {
  let imagenURL = imagenAnterior;

  if (archivo) {
    const rutaNueva = `productos/${Date.now()}-${archivo.name}`;
    const refArchivo = ref(storage, rutaNueva);
    await uploadBytes(refArchivo, archivo);
    imagenURL = await getDownloadURL(refArchivo);

    // Eliminar imagen anterior
    if (imagenAnterior) {
      try {
        await deleteObject(ref(storage, imagenAnterior));
      } catch (e) {
        console.warn("Error al eliminar imagen anterior:", e.message);
      }
    }
  }

  return await updateDoc(doc(db, "productos", id), {
    nombre,
    descripcion,
    precio: parseFloat(precio),
    imagenURL
  });
}

export async function eliminarProducto(id, rutaImagen = null) {
  if (rutaImagen) {
    try {
      await deleteObject(ref(storage, rutaImagen));
    } catch (e) {
      console.warn("Error eliminando imagen:", e.message);
    }
  }
  return await deleteDoc(doc(db, "productos", id));
}
