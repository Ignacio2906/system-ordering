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
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const pedidosRef = collection(db, "pedidos");
const mozosRef = collection(db, "mozos");
const productosRef = collection(db, "productos");
const mesasRef = collection(db, "mesas");

async function obtenerPedidos() {
  const snapshot = await getDocs(pedidosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function agregarPedido({ mozos, mesa, estado, items }) {
  return await addDoc(pedidosRef, {
    mozos,
    mesa, // ahora guarda directamente el número de mesa
    estado,
    items,
    fecha: serverTimestamp()
  });
}

async function obtenerPedidoPorId(id) {
  const pedidoDoc = doc(db, "pedidos", id);
  const snap = await getDoc(pedidoDoc);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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

async function obtenermozos() {
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

function escucharPedidos(callback) {
  return onSnapshot(pedidosRef, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pedidos);
  });
}

export default {
  obtenerPedidos,
  agregarPedido,
  obtenerPedidoPorId,
  actualizarPedido,
  actualizarEstado,
  obtenermozos,
  obtenerProductos,
  obtenerMesas,
  escucharPedidos
};
