// clienteModel.js
import { db } from '../conexion/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const clienteModel = {
  agregarCliente: async function(cliente) {
    try {
      const clientesRef = collection(db, 'clientes');
      const docRef = await addDoc(clientesRef, {
        ...cliente,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error agregando cliente: ", error);
      throw error;
    }
  },

  obtenerClientes: async function () {
    try {
      const clientesRef = collection(db, 'clientes');
      const querySnapshot = await getDocs(clientesRef);

      let clientes = [];
      querySnapshot.forEach((doc) => {
        clientes.push({ id: doc.id, ...doc.data() });
      });

      return clientes;
    } catch (error) {
      console.error("Error obteniendo clientes: ", error);
      throw error;
    }
  },

  eliminarCliente: async function(id) {
    try {
      const docRef = doc(db, 'clientes', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error eliminando cliente: ", error);
      throw error;
    }
  }
};

export default clienteModel;
