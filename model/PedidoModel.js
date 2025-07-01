import { db } from '../conexion/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const PedidoModel = {
  agregarPedido: async (pedido) => {
    const ref = collection(db, 'pedidos');
    await addDoc(ref, {
      ...pedido,
      estado: true,
      fecha: serverTimestamp()
    });
  },

  obtenerPedidos: async () => {
    const ref = collection(db, 'pedidos');
    const snapshot = await getDocs(ref);
    const pedidos = [];

    snapshot.forEach(docu => {
      const data = docu.data();

      let fecha = null;

      // ✅ Validar si data.fecha es un Timestamp
      if (
        data.fecha &&
        typeof data.fecha.toDate === "function"
      ) {
        fecha = data.fecha.toDate();
      } else {
        console.warn("⚠️ Fecha no válida en documento:", docu.id);
      }

      pedidos.push({
        id: docu.id,
        clienteDNI: data.clienteDNI || data.cliente || "",
        productoId: data.productoId || data.producto || "",
        cantidad: typeof data.cantidad === "number" ? data.cantidad : 0,
        estado: data.estado !== false,
        fecha
      });
    });

    return pedidos;
  },

  actualizarPedido: async (id, nuevoData) => {
    const ref = doc(db, 'pedidos', id);
    await updateDoc(ref, nuevoData);
  },

  inactivarPedido: async (id) => {
    const ref = doc(db, 'pedidos', id);
    await updateDoc(ref, { estado: false });
  },

  obtenerPedidoPorId: async (id) => {
    const ref = doc(db, 'pedidos', id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();

    let fecha = null;

    if (
      data.fecha &&
      typeof data.fecha.toDate === "function"
    ) {
      fecha = data.fecha.toDate();
    } else {
      console.warn("⚠️ Fecha no válida en pedido por ID:", id);
    }

    return {
      id: snapshot.id,
      clienteDNI: data.clienteDNI || data.cliente || "",
      productoId: data.productoId || data.producto || "",
      cantidad: typeof data.cantidad === "number" ? data.cantidad : 0,
      estado: data.estado !== false,
      fecha
    };
  }
};

export default PedidoModel;
