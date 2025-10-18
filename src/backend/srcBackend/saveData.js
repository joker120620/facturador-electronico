import fs from "fs";
import path from "path";


export async function guardarDatos(filePath, data) {
  const absolutePath = path.resolve(filePath);
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ Datos guardados en:", absolutePath);
}