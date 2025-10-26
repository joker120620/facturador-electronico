import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// 🔧 Necesario para obtener el path actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "src", "Frontend")));

// Ruta principal (sirve tu indexFrontend.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "Frontend", "indexFrontend.html"));
});

// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor frontend corriendo en http://localhost:${PORT}`);
});