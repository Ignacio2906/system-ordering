// model/PedidoModel.js
import { db } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Referencias a las colecciones
const pedidosRef = collection(db, "pedidos");
const mozosRef = collection(db, "mozos");
const productosRef = collection(db, "productos");
const mesasRef = collection(db, "mesas");

// Agrega un nuevo pedido
async function agregarPedido(pedido) {
  return await addDoc(pedidosRef, {
    ...pedido,
    fecha: serverTimestamp()
  });
}

// Actualiza un pedido existente
async function actualizarPedido(id, pedidoData) {
  const pedidoDoc = doc(db, "pedidos", id);
  return await updateDoc(pedidoDoc, {
    ...pedidoData,
    fecha: serverTimestamp()
  });
}

// Cambia el estado de un pedido (ej. de "pendiente" a "servido")
async function actualizarEstado(id, nuevoEstado) {
  const pedidoDoc = doc(db, "pedidos", id);
  return await updateDoc(pedidoDoc, { estado: nuevoEstado });
}

// Cambia el estado de una mesa (ej. de "libre" a "ocupado")
async function actualizarMesa(id, nuevoEstado) {
  const mesaDoc = doc(db, "mesas", id);
  return await updateDoc(mesaDoc, {
    estado_mesa: nuevoEstado
  });
}

// Obtiene un pedido por su ID
async function obtenerPedidoPorId(id) {
  const pedidoDoc = doc(db, "pedidos", id);
  const snapshot = await getDoc(pedidoDoc);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Lista todos los mozos
async function obtenerMozos() {
  const snapshot = await getDocs(mozosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Lista todos los productos
async function obtenerProductos() {
  const snapshot = await getDocs(productosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Lista todas las mesas
async function obtenerMesas() {
  const snapshot = await getDocs(mesasRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Escucha en tiempo real los cambios en las mesas
function escucharMesas(callback) {
  return onSnapshot(mesasRef, snapshot => {
    const mesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(mesas);
  });
}

export default {
  agregarPedido,
  actualizarPedido,
  actualizarEstado,
  actualizarMesa,
  obtenerPedidoPorId,
  obtenerMozos,
  obtenerProductos,
  obtenerMesas,
  escucharMesas
};
