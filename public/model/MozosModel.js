import { db } from "../conexion/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const mozosRef = collection(db, "mozos");

export async function obtenermozos() {
  const snapshot = await getDocs(mozosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function agregarmozos(mozo) {
  return await addDoc(mozosRef, {
    ...mozo,
    createdAt: serverTimestamp()
  });
}

export async function eliminarmozos(id) {
  return await deleteDoc(doc(db, "mozos", id));
}

export async function actualizarmozos(id, mozo) {
  const mozoRef = doc(db, "mozos", id);
  return await setDoc(mozoRef, {
    ...mozo,
    updatedAt: serverTimestamp()
  });
}
