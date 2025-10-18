import { connectDB } from "./conectDb.js";

export async function insertUser(usuario) {
  const db = await connectDB();
  const usuarios = db.collection("usuarios");
  const result = await usuarios.insertOne(usuario);
  return result;
}

export async function getUser() {
  const db = await connectDB();
  const usuarios = db.collection("usuarios");
  return await usuarios.find().toArray();
}