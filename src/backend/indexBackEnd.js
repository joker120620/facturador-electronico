import express from "express";
import cors from "cors";
import { fetchData } from "../peticionServer.js";
import dotenv from "dotenv";

// Cargar las variables del archivo .env
dotenv.config();
// Crear aplicación
const app = express();

// Habilitar CORS (para aceptar peticiones de otros orígenes)
app.use(cors());

// Middleware para leer JSON
app.use(express.json());


///////////////////variable estado bot
let statusBot = false;

//////////////////
// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ msj: "Servidor Online" });
});

//end point para estado del bot
app.post("/statusbot", (req, res) => {
  const response = req.body;
  if(response.entity === "bot"){
    statusBot = response.status;
    console.log("Bot Conectado", statusBot);
    res.json({ msj: "Server conectado 200" });
  }else if(response.entity === "client"){
    res.json({ statusBotServer: statusBot });

  }
 
});
//datos token
const datosToken = 
{
  "grant_type": "password",
  "client_id": process.env.CLIENT_ID,
  "client_secret": process.env.CLIENT_SECRET,
  "username": process.env.USER,
  "password": process.env.PASSWORD
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