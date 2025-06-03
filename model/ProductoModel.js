import { db } from '../conexion/firebase.js';
import { storage } from '../conexion/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const productoModel = {
  agregarProducto: async function(producto, imagenFile) {
    try {
      // 1. Subir imagen a Storage
      const storageRef = ref(storage, `productos/${imagenFile.name}`);
      await uploadBytes(storageRef, imagenFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Guardar datos en Firestore
      const productosRef = collection(db, 'productos');
      const docRef = await addDoc(productosRef, {
        ...producto,
        imagenUrl: imageUrl,
        createdAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error("Error agregando producto:", error);
      throw error;
    }
  },

  obtenerProductos: async function () {
    try {
      const productosRef = collection(db, 'productos');
      const snapshot = await getDocs(productosRef);

      const productos = [];
      snapshot.forEach((doc) => {
        productos.push({ id: doc.id, ...doc.data() });
      });

      return productos;
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      throw error;
    }
  },

  eliminarProducto: async function (id) {
    try {
      const docRef = doc(db, 'productos', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  }
};

export default productoModel;
