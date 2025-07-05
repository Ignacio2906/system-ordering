// model/mozosModel.js
import { db } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const mozosRef = collection(db, "mozos");

export async function obtenermozos() {
  const snapshot = await getDocs(mozosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function agregarmozos(mozos) {
  return await addDoc(mozosRef, {
    ...mozos,
    createdAt: serverTimestamp()
  });
}

export async function eliminarmozos(id) {
  return await deleteDoc(doc(db, "mozos", id));
}
