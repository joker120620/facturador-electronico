import express from "express";
import cors from "cors";
import { fetchData } from "../peticionServer.js";
import dotenv from "dotenv";
import cargarDatos from "./srcBackend/loadData.js";
import { guardarDatos } from "./srcBackend/saveData.js";
import { insertUser, getUser } from "./srcBackend/userServices.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
  try {
    const nuevo = await insertUser({ nombre: "Tatiana", edad: 25 });
    console.log("🟢 Usuario insertado:", nuevo.insertedId);

    const lista = await getUser();
    console.log("📋 Usuarios actuales:", lista);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();

// Cargar las variables del archivo .env
dotenv.config({ path: path.join(__dirname, "./.env") });
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
  } else if (response.entity === "client") {
    res.json({ statusBotServer: statusBot });
    console.log("Cliente consultando estado del bot", statusBot);
  }
 
});
///end point login
app.post("/login", async (req, res) => {
  const usuarios = await cargarDatos("users.json");
  
  const response = req.body;
  if(response.user && response.password){
    const userFound = usuarios.find(user => user.cc === response.user && user.password === response.password);
    console.log("Usuario intentando iniciar sesión:", response.user);
    if(userFound){
      res.json({userStatus: userFound , userAppData: usuarios.find(user => user.cc === response.ccUser) });
      console.log("Login exitoso", userFound );
    } else {
      res.json({status: 401, msj: "Usuario o contraseña incorrectos" ,userAppData: "" });
      console.log("Login fallido para el usuario:", response.user);
    }
  } else {
    res.status(400).json({ msj: "Faltan datos" });
  }
});
//endpoint para actualizar datosde usuario

app.post("/updateDataUser", async (req, res) => {
  try {
    const usuarios = await cargarDatos("users.json");
    const response = req.body.data;

    if (response.cc && response.password) {
      // Buscar el usuario por cc y password
      const userFound = usuarios.find(
        (user) => user.cc === response.cc && user.password === response.password
      );

      console.log("Usuario intentando actualizar datos:", response.name);

      if (userFound) {

        if (response.phone) userFound.phone = response.phone;
        if (response.name) userFound.name = response.name;
        if (response.email) userFound.email = response.email;
        if (response.cc) userFound.cc = response.cc;
        if (response.pass) userFound.password = response.pass;

        await guardarDatos("users.json", usuarios);
        console.log(usuarios)
        //guardarDatos("./src/backend/srcBackend/users.json", [{ nombre: "Prueba", cc: 123 }]);

        console.log("Datos actualizados del usuario:", userFound);
        res.json({ status: 200, msj: "Datos actualizados correctamente" });
      } else {
        console.log("Usuario o contraseña incorrectos:", response.cc);
        res.json({ status: 401, msj: "Usuario o contraseña incorrectos" });
      }
    } else {
      res.status(400).json({ msj: "Faltan datos" });
    }
  } catch (error) {
    console.error("Error actualizando datos del usuario:", error);
    res.status(500).json({ msj: "Error interno del servidor" });
  }
});

//end point para datos

app.post("/data", async (req, res) => {
  const data = await cargarDatos("data.json");
  const { ccUser } = req.body;
  console.log("CC usuario recibido:", ccUser);
  if (ccUser !== 0) {
    if(ccUser == "123456789" || ccUser == "987654321"){ 
      res.json(data);
  }

  }else{
    res.json({ "clientes": [], "facturas": [], "productos": [] });
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