import { db } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const pedidosRef = collection(db, "pedidos");
const clientesRef = collection(db, "clientes");
const productosRef = collection(db, "productos");

// Agregar pedido con estado activo
async function agregarPedido(pedido) {
  const nuevoPedido = {
    ...pedido,
    estado: true,  // pedido activo
    fecha: new Date(),
  };
  await addDoc(pedidosRef, nuevoPedido);
}

// Obtener todos los pedidos activos con nombre del cliente y producto
async function obtenerPedidos() {
  const snapshot = await getDocs(pedidosRef);
  const pedidos = [];

  for (const docSnap of snapshot.docs) {
    const pedido = { id: docSnap.id, ...docSnap.data() };

    // Filtrar solo pedidos activos
    if (pedido.estado === false) continue;

    // Buscar cliente por DNI
    let clienteNombre = "(Cliente no definido)";
    if (pedido.cliente) {
      const q = query(clientesRef, where("dni", "==", pedido.cliente));
      const clienteSnap = await getDocs(q);
      if (!clienteSnap.empty) {
        const cliente = clienteSnap.docs[0].data();
        clienteNombre = cliente.nombre;
      }
    }

    // Buscar producto por ID
    let productoNombre = "(Producto no definido)";
    if (pedido.producto) {
      const productoDoc = await getDoc(doc(productosRef, pedido.producto));
      if (productoDoc.exists()) {
        productoNombre = productoDoc.data().nombre;
      }
    }
    
    pedidos.push({
      ...pedido,
      clienteNombre,
      productoNombre,
    });
  }

  return pedidos;
}

// Obtener pedido por ID
async function obtenerPedidoPorId(id) {
  const pedidoDoc = await getDoc(doc(pedidosRef, id));
  if (!pedidoDoc.exists()) return null;
  return { id: pedidoDoc.id, ...pedidoDoc.data() };
}

// Actualizar pedido (producto, cliente, cantidad)
async function actualizarPedido(id, datos) {
  const pedidoRef = doc(pedidosRef, id);
  await updateDoc(pedidoRef, datos);
}

// Inactivar pedido (soft delete)
async function inactivarPedido(id) {
  const pedidoRef = doc(pedidosRef, id);
  await updateDoc(pedidoRef, { estado: false });
}

// Obtener clientes
async function obtenerClientes() {
  const snapshot = await getDocs(clientesRef);
  const clientes = [];
  snapshot.forEach((docSnap) => {
    clientes.push({ id: docSnap.id, ...docSnap.data() });
  });
  return clientes;
}

// Obtener productos
async function obtenerProductos() {
  const snapshot = await getDocs(productosRef);
  const productos = [];
  snapshot.forEach((docSnap) => {
    productos.push({ id: docSnap.id, ...docSnap.data() });
  });
  return productos;
}

export default {
  agregarPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  inactivarPedido,
  obtenerClientes,
  obtenerProductos,
};
