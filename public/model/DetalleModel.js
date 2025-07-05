import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "../conexion/firebase.js";

const pedidosRef = collection(db, "pedidos");
const mozosRef = collection(db, "mozos");

async function obtenerPedidos() {
  const snapshot = await getDocs(pedidosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function escucharPedidos(callback) {
  return onSnapshot(pedidosRef, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pedidos);
  });
}

async function obtenerPedidoPorId(id) {
  const ref = doc(db, "pedidos", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function eliminarPedido(id) {
  const ref = doc(db, "pedidos", id);
  await deleteDoc(ref);
}

async function obtenerMozos() {
  const snap = await getDocs(mozosRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export default {
  obtenerPedidos,
  obtenerPedidoPorId,
  eliminarPedido,
  obtenerMozos,
  escucharPedidos
};
