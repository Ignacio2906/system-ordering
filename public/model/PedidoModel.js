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

const pedidosRef = collection(db, "pedidos");
const mozosRef = collection(db, "mozos");
const productosRef = collection(db, "productos");
const mesasRef = collection(db, "mesas");

async function agregarPedido(pedido) {
  return await addDoc(pedidosRef, {
    ...pedido,
    fecha: serverTimestamp()
  });
}

async function actualizarPedido(id, pedidoData) {
  const pedidoDoc = doc(db, "pedidos", id);
  return await updateDoc(pedidoDoc, {
    ...pedidoData,
    fecha: serverTimestamp()
  });
}

async function actualizarEstado(id, nuevoEstado) {
  const pedidoDoc = doc(db, "pedidos", id);
  return await updateDoc(pedidoDoc, { estado: nuevoEstado });
}

async function actualizarMesa(id, nuevoEstado) {
  const ref = doc(db, "mesas", id);
  return await updateDoc(ref, {
    estado_mesa: nuevoEstado
  });
}

async function obtenerPedidoPorId(id) {
  const docRef = doc(db, "pedidos", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function obtenerMozos() {
  const snapshot = await getDocs(mozosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function obtenerProductos() {
  const snapshot = await getDocs(productosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function obtenerMesas() {
  const snapshot = await getDocs(mesasRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

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
