import express from "express";
import cors from "cors";
import { fetchData } from "../peticionServer.js";

// Crear aplicación
const app = express();

// Habilitar CORS (para aceptar peticiones de otros orígenes)
app.use(cors());

// Middleware para leer JSON
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor funcionando 200" });
});

//datos token
const datosToken = 
{
  "grant_type": "password",
  "client_id": "9fec74d6-602e-4c38-b63b-e1a6745e0b7e",
  "client_secret": "whgr8TdnaQUYPqMBMhvXgWXXahn0fDs0XSE8fX49",
  "username": "sandbox@factus.com.co",
  "password": "sandbox2024%"
}
app.get("/token", async (req, res) => {
  try {
    // Llamamos a la función que hace la petición
    const dataRecived = await fetchData(
      "https://api-sandbox.factus.com.co/oauth/token",
      datosToken
    );

    //console.log("Datos recibidos:", dataRecived);

    // Responder al cliente
    res.json(dataRecived);
  } catch (error) {
    console.error("Error al obtener token:", error);
    res.status(500).json({ error: "Error al obtener token" });
  }
});
// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});