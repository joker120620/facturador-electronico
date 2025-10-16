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
    console.log("Cliente consultando estado del bot", statusBot);

  }
 
});

//end point para datos

  // ====================== JSON DE EJEMPLO ======================
  const dataJSON = {
  clientes: [
    { cc: "1001", nombre: "Pepe Florez Torres", email: "pepe@example.com", direccion: "Calle Falsa 123", telefono: "3011111111" },
    { cc: "1002", nombre: "Maria Gomez", email: "maria@example.com", direccion: "Carrera 10 #45-12", telefono: "3022222222" },
    { cc: "1003", nombre: "Juan Perez", email: "juan@example.com", direccion: "Avenida Siempre Viva 742", telefono: "3033333333" },
    { cc: "1004", nombre: "Laura Rodríguez", email: "laura@example.com", direccion: "Calle 12 #4-56", telefono: "3044444444" },
    { cc: "1005", nombre: "Carlos García", email: "carlos@example.com", direccion: "Carrera 7 #8-90", telefono: "3055555555" },
    { cc: "1006", nombre: "Ana Torres", email: "ana@example.com", direccion: "Calle 45 #12-34", telefono: "3066666666" },
    { cc: "1007", nombre: "Luis Mendoza", email: "luis@example.com", direccion: "Transversal 9 #67-89", telefono: "3077777777" },
    { cc: "1008", nombre: "Diana Ruiz", email: "diana@example.com", direccion: "Calle Central 89", telefono: "3088888888" },
    { cc: "1009", nombre: "Pedro López", email: "pedro@example.com", direccion: "Calle 15 #23-45", telefono: "3099999999" },
    { cc: "1010", nombre: "Sofía Morales", email: "sofia@example.com", direccion: "Carrera 21 #32-10", telefono: "3101010101" }
  ],

  productos: [
    { codigo: "00001", nombre: "Queso", descripcion: "Queso costeño 1 kilo" },
    { codigo: "00002", nombre: "Harina", descripcion: "Harina de trigo 1 kilo" },
    { codigo: "00003", nombre: "Café", descripcion: "Café colombiano 1 kilo" },
    { codigo: "00004", nombre: "Azúcar", descripcion: "Azúcar blanca refinada 1 kilo" },
    { codigo: "00005", nombre: "Leche", descripcion: "Leche entera 1 litro" },
    { codigo: "00006", nombre: "Arroz", descripcion: "Arroz blanco 1 kilo" },
    { codigo: "00007", nombre: "Aceite", descripcion: "Aceite vegetal 1 litro" },
    { codigo: "00008", nombre: "Pan", descripcion: "Pan tajado 500 gramos" },
    { codigo: "00009", nombre: "Huevos", descripcion: "Huevos rojos docena" },
    { codigo: "00010", nombre: "Sal", descripcion: "Sal refinada 500 gramos" },
    { codigo: "00011", nombre: "Chocolate", descripcion: "Chocolate de mesa 250 gramos" },
    { codigo: "00012", nombre: "Avena", descripcion: "Avena en hojuelas 500 gramos" },
    { codigo: "00013", nombre: "Mantequilla", descripcion: "Mantequilla con sal 250 gramos" },
    { codigo: "00014", nombre: "Galletas", descripcion: "Galletas surtidas 300 gramos" },
    { codigo: "00015", nombre: "Atún", descripcion: "Atún en agua 170 gramos" },
    { codigo: "00016", nombre: "Pasta", descripcion: "Pasta espagueti 500 gramos" },
    { codigo: "00017", nombre: "Tomate", descripcion: "Tomate chonto 1 kilo" },
    { codigo: "00018", nombre: "Cebolla", descripcion: "Cebolla cabezona 1 kilo" },
    { codigo: "00019", nombre: "Papa", descripcion: "Papa pastusa 1 kilo" },
    { codigo: "00020", nombre: "Pollo", descripcion: "Pechuga de pollo 1 kilo" },
    { codigo: "00021", nombre: "Carne", descripcion: "Carne de res 1 kilo" },
    { codigo: "00022", nombre: "Pescado", descripcion: "Filete de pescado 1 kilo" },
    { codigo: "00023", nombre: "Yogur", descripcion: "Yogur natural 1 litro" },
    { codigo: "00024", nombre: "Jugo", descripcion: "Jugo natural 1 litro" },
    { codigo: "00025", nombre: "Salsa de tomate", descripcion: "Salsa de tomate 250 gramos" },
    { codigo: "00026", nombre: "Mayonesa", descripcion: "Mayonesa 250 gramos" },
    { codigo: "00027", nombre: "Lentejas", descripcion: "Lentejas 1 kilo" },
    { codigo: "00028", nombre: "Fríjoles", descripcion: "Fríjoles rojos 1 kilo" },
    { codigo: "00029", nombre: "Cereal", descripcion: "Cereal de maíz 500 gramos" },
    { codigo: "00030", nombre: "Detergente", descripcion: "Detergente en polvo 1 kilo" },
    { codigo: "00031", nombre: "Jabón", descripcion: "Jabón de baño 100 gramos" },
    { codigo: "00032", nombre: "Shampoo", descripcion: "Shampoo 400 ml" },
    { codigo: "00033", nombre: "Papel higiénico", descripcion: "Paquete de 4 rollos" },
    { codigo: "00034", nombre: "Cepillo dental", descripcion: "Cepillo dental adulto" },
    { codigo: "00035", nombre: "Pasta dental", descripcion: "Crema dental 90 gramos" },
    { codigo: "00036", nombre: "Toallas", descripcion: "Toallas de papel 2 unidades" },
    { codigo: "00037", nombre: "Desodorante", descripcion: "Desodorante en barra 50 gramos" },
    { codigo: "00038", nombre: "Jabón líquido", descripcion: "Jabón líquido 500 ml" },
    { codigo: "00039", nombre: "Limpiavidrios", descripcion: "Limpiavidrios 500 ml" },
    { codigo: "00040", nombre: "Cloro", descripcion: "Cloro 1 litro" },
    { codigo: "00041", nombre: "Suavizante", descripcion: "Suavizante para ropa 1 litro" },
    { codigo: "00042", nombre: "Panela", descripcion: "Panela 500 gramos" },
    { codigo: "00043", nombre: "Vinagre", descripcion: "Vinagre blanco 1 litro" },
    { codigo: "00044", nombre: "Gelatina", descripcion: "Gelatina en polvo 100 gramos" },
    { codigo: "00045", nombre: "Maicena", descripcion: "Maicena 500 gramos" },
    { codigo: "00046", nombre: "Miel", descripcion: "Miel natural 250 gramos" },
    { codigo: "00047", nombre: "Ajo", descripcion: "Cabeza de ajo 250 gramos" },
    { codigo: "00048", nombre: "Cilantro", descripcion: "Manojo de cilantro fresco" },
    { codigo: "00049", nombre: "Lechuga", descripcion: "Lechuga romana unidad" },
    { codigo: "00050", nombre: "Manzana", descripcion: "Manzana roja 1 kilo" }
  ],

  facturas: [
    { codigo: "20001", cc: "1001", cliente: "Pepe Florez Torres", fecha: "2023-01-01", descripcion: "Compra de Queso" },
    { codigo: "20002", cc: "1002", cliente: "Maria Gomez", fecha: "2023-01-02", descripcion: "Compra de Harina" },
    { codigo: "20003", cc: "1003", cliente: "Juan Perez", fecha: "2023-01-03", descripcion: "Compra de Café" },
    { codigo: "20004", cc: "1004", cliente: "Laura Rodríguez", fecha: "2023-01-04", descripcion: "Compra de Azúcar" },
    { codigo: "20005", cc: "1005", cliente: "Carlos García", fecha: "2023-01-05", descripcion: "Compra de Leche" },
    { codigo: "20006", cc: "1006", cliente: "Ana Torres", fecha: "2023-01-06", descripcion: "Compra de Arroz" },
    { codigo: "20007", cc: "1007", cliente: "Luis Mendoza", fecha: "2023-01-07", descripcion: "Compra de Aceite" },
    { codigo: "20008", cc: "1008", cliente: "Diana Ruiz", fecha: "2023-01-08", descripcion: "Compra de Pan" },
    { codigo: "20009", cc: "1009", cliente: "Pedro López", fecha: "2023-01-09", descripcion: "Compra de Huevos" },
    { codigo: "20010", cc: "1010", cliente: "Sofía Morales", fecha: "2023-01-10", descripcion: "Compra de Sal" },
    { codigo: "20011", cc: "1001", cliente: "Pepe Florez Torres", fecha: "2023-01-11", descripcion: "Compra de Chocolate" },
    { codigo: "20012", cc: "1002", cliente: "Maria Gomez", fecha: "2023-01-12", descripcion: "Compra de Avena" },
    { codigo: "20013", cc: "1003", cliente: "Juan Perez", fecha: "2023-01-13", descripcion: "Compra de Mantequilla" },
    { codigo: "20014", cc: "1004", cliente: "Laura Rodríguez", fecha: "2023-01-14", descripcion: "Compra de Galletas" },
    { codigo: "20015", cc: "1005", cliente: "Carlos García", fecha: "2023-01-15", descripcion: "Compra de Atún" },
    { codigo: "20016", cc: "1006", cliente: "Ana Torres", fecha: "2023-01-16", descripcion: "Compra de Pasta" },
    { codigo: "20017", cc: "1007", cliente: "Luis Mendoza", fecha: "2023-01-17", descripcion: "Compra de Tomate" },
    { codigo: "20018", cc: "1008", cliente: "Diana Ruiz", fecha: "2023-01-18", descripcion: "Compra de Cebolla" },
    { codigo: "20019", cc: "1009", cliente: "Pedro López", fecha: "2023-01-19", descripcion: "Compra de Papa" },
    { codigo: "20020", cc: "1010", cliente: "Sofía Morales", fecha: "2023-01-20", descripcion: "Compra de Pollo" },
    { codigo: "20021", cc: "1001", cliente: "Pepe Florez Torres", fecha: "2023-01-21", descripcion: "Compra de Carne" },
    { codigo: "20022", cc: "1002", cliente: "Maria Gomez", fecha: "2023-01-22", descripcion: "Compra de Pescado" },
    { codigo: "20023", cc: "1003", cliente: "Juan Perez", fecha: "2023-01-23", descripcion: "Compra de Yogur" },
    { codigo: "20024", cc: "1004", cliente: "Laura Rodríguez", fecha: "2023-01-24", descripcion: "Compra de Jugo" },
    { codigo: "20025", cc: "1005", cliente: "Carlos García", fecha: "2023-01-25", descripcion: "Compra de Salsa de tomate" },
    { codigo: "20026", cc: "1006", cliente: "Ana Torres", fecha: "2023-01-26", descripcion: "Compra de Mayonesa" },
    { codigo: "20027", cc: "1007", cliente: "Luis Mendoza", fecha: "2023-01-27", descripcion: "Compra de Lentejas" },
    { codigo: "20028", cc: "1008", cliente: "Diana Ruiz", fecha: "2023-01-28", descripcion: "Compra de Fríjoles" },
    { codigo: "20029", cc: "1009", cliente: "Pedro López", fecha: "2023-01-29", descripcion: "Compra de Cereal" },
    { codigo: "20030", cc: "1010", cliente: "Sofía Morales", fecha: "2023-01-30", descripcion: "Compra de Detergente" },
    { codigo: "20031", cc: "1001", cliente: "Pepe Florez Torres", fecha: "2023-02-01", descripcion: "Compra de Jabón" },
    { codigo: "20032", cc: "1002", cliente: "Maria Gomez", fecha: "2023-02-02", descripcion: "Compra de Shampoo" },
    { codigo: "20033", cc: "1003", cliente: "Juan Perez", fecha: "2023-02-03", descripcion: "Compra de Papel higiénico" },
    { codigo: "20034", cc: "1004", cliente: "Laura Rodríguez", fecha: "2023-02-04", descripcion: "Compra de Cepillo dental" },
    { codigo: "20035", cc: "1005", cliente: "Carlos García", fecha: "2023-02-05", descripcion: "Compra de Pasta dental" },
    { codigo: "20036", cc: "1006", cliente: "Ana Torres", fecha: "2023-02-06", descripcion: "Compra de Toallas" },
    { codigo: "20037", cc: "1007", cliente: "Luis Mendoza", fecha: "2023-02-07", descripcion: "Compra de Desodorante" },
    { codigo: "20038", cc: "1008", cliente: "Diana Ruiz", fecha: "2023-02-08", descripcion: "Compra de Jabón líquido" },
    { codigo: "20039", cc: "1009", cliente: "Pedro López", fecha: "2023-02-09", descripcion: "Compra de Limpiavidrios" },
    { codigo: "20040", cc: "1010", cliente: "Sofía Morales", fecha: "2023-02-10", descripcion: "Compra de Cloro" },
    { codigo: "20041", cc: "1001", cliente: "Pepe Florez Torres", fecha: "2023-02-11", descripcion: "Compra de Suavizante" },
    { codigo: "20042", cc: "1002", cliente: "Maria Gomez", fecha: "2023-02-12", descripcion: "Compra de Panela" }
  ]
};
app.post("/data", (req, res) => {
  const { ccUser } = req.body;
  console.log("CC usuario recibido:", ccUser);
  res.json(dataJSON);
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