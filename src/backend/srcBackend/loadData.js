import fs from "fs/promises";

async function cargarDatos() {
  try {
    const contenido = await fs.readFile("./srcBackend/data.json", "utf-8");
    const data = JSON.parse(contenido);
    return data;
  } catch (error) {
    console.error("Error al leer el JSON:", error);
  }
}
export default cargarDatos;