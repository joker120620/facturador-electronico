import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Esto asegura que la ruta funcione en Render, Windows o cualquier OS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cargarDatos(nombre) {
  try {
    // Ruta absoluta al archivo data.json
    const dataPath = path.join(__dirname, nombre);
    const contenido = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(contenido);
    return data;
  } catch (error) {
    console.error("Error al leer el JSON:", error);
    return []; // opcional: evita que el servidor se caiga
  }
}

export default cargarDatos;