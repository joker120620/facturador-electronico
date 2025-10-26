import express from "express";
import cors from "cors";
import qrcode from "qrcode-terminal";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "whatsapp-web.js";
import { extraerJSONdelTexto } from "./src/extractor.js";
import { fetchData } from "./src/srcFrontEnd/peticionServer.js";

const { Client, LocalAuth, MessageMedia } = pkg;

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================
const app = express();
app.use(express.json());
app.use(cors());

// Obtener dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// CONFIGURAR EL BOT DE WHATSAPP
// =======================================================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

let BOT_STATUS = false;

// Evento: QR para vincular sesión
client.on("qr", qr => {
  console.log("📱 Escanea este código QR:");
  qrcode.generate(qr, { small: true });
});

// Evento: Bot listo
client.on("ready", async () => {
  BOT_STATUS = true;
  console.log("✅ Bot iniciado y conectado correctamente.");

  // Avisar al backend que el bot está activo
  try {
    const response = await fetchData("http://localhost:3000/statusbot", { entity: "bot", status: true });
    console.log(response.msj);
  } catch (error) {
    console.error("⚠️ No se pudo notificar al backend:", error.message);
  }
});

// =======================================================
// EVENTOS DE MENSAJES
// =======================================================
client.on("message", async msg => {
  let user = await msg.getContact();
  const body = msg.body.trim();
  const chatId = `59894101100@c.us`;
  console.log("Mensaje recibido de", user.number, ":", body);

  // === Comandos del bot ===
  if (body === "Facturar") {
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      const mensaje = `extraer los datos de la imagen: en el siguiente formato
      {
    vendedor: { nombre: "", cedula: "" },
    cliente: { nombre: "", cedula: "" },
    fecha: "",
    items: [
    {
    "producto_nombre": "",
      "cantidad": number,
      "precio_unitario": number,
      "precio_total": number
    },

    ],
    total_factura: "number",
  } 
       y el titulo pon "Texto:" y añade un subtitulo llamado "userPeticion : ${user.number}" (este numero te lo doy yo no lo extraigas solo quita el codigo del pais) tambien necesito que omitas cualquier otra informacion que no pida como garantias, selos, etc . ademas quita las tildes`;

      await client.sendMessage(chatId, media, { caption: mensaje });
      msg.reply("Imagen recibida para facturación. Espera la respuesta.");
    }

  } else if (msg.from == chatId && (body.includes("Texto:") || body.includes("Titulo:"))) {
    const infoFactura = body.replace("Titulo:", "").replace("Texto:", "").trim();
    const numeroCliente = body.match(/userPeticion\s*:\s*(\d{6,15})/);
    console.log("Número Cliente Extraído:", numeroCliente ? numeroCliente[1] : "No encontrado");
    const numero = "57"+numeroCliente[1] + "@c.us";
    await client.sendMessage(numero, "📄 Texto Extraido:\n```" + body.split("--")[0].trim(body.replace("Titulo:", "").replace("Texto:", "")) + "```");
    await client.sendMessage(numero, "Desea realizar la factura con estos Datos?");

    client.on("message", async msg2 => {

      if (msg2.from === numero && msg2.body.toLowerCase() === "si") {
        await client.sendMessage(numero, "Generando factura...");
        // Extraer información estructurada
        const datosFactura = extraerJSONdelTexto(infoFactura);
        console.log("Datos Extraidos de la Factura");
        console.log(datosFactura);
        try{
          const response = await fetchData("http://localhost:3000/addFacturaByName",
          datosFactura
        );
        await client.sendMessage(numero, "Informacion:\n```" + JSON.stringify(response.mensaje, null, 2) + "```");

        }catch(error){
          console.error("Error al enviar datos al servidor:", error);
          await client.sendMessage(numero, "⚠️ Hubo un error al procesar la factura. Inténtalo de nuevo.");
        }
        

      }

    });
///===================================BASIC COMMANDS=============================

  } else if (body === "Hola") {
    msg.reply(`👋 ¡Hola ${user.pushname || "amigo"}! ¿En qué puedo ayudarte hoy?`);
  }
  else if (body === "Foto") {
    const media = await MessageMedia.fromUrl("https://cdn.memegenerator.es/imagenes/memes/full/2/81/2813751.jpg");
    await msg.reply(media);
  }
  else if (body === "Sticker" && msg.hasMedia) {
    const media = await msg.downloadMedia();
    await client.sendMessage(msg.from, media, {
      sendMediaAsSticker: true,
      stickerAuthor: "Mi Bot WhatsApp",
      stickerName: "Pack Stickers",
    });
  }
  else if (body === "Servidor") {
    const response = await fetchData("http://localhost:3000/token");
    await msg.reply("📡 Token del servidor:\n```" + JSON.stringify(response.access_token, null, 2) + "```");
  }
});

// =======================================================
// ENDPOINTS EXPRESS
// =======================================================

// Verificar estado del bot
app.get("/bot/status", (req, res) => {
  res.json({ status: BOT_STATUS ? "activo" : "inactivo" });
});

// Enviar mensaje a un número
app.post("/bot/sendMessage", async (req, res) => {
  try {
    const { phone, mensaje } = req.body;
    if (!phone || !mensaje) return res.status(400).json({ mensaje: "Faltan parámetros" });

    const chatId = phone.includes("@c.us") ? phone : `57${phone}@c.us`;
    await client.sendMessage(chatId, mensaje);
    console.log(`✅ Mensaje enviado a ${chatId}: ${mensaje}`);
    res.status(200).json({ status: 200, mensaje: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error enviando mensaje:", error.message);
    res.status(500).json({ mensaje: "Error al enviar el mensaje" });
  }
});

// Reiniciar el bot manualmente
app.post("/bot/restart", async (req, res) => {
  try {
    BOT_STATUS = false;
    await client.destroy();
    client.initialize();
    res.json({ mensaje: "♻️ Bot reiniciado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al reiniciar el bot" });
  }
});

// =======================================================
// INICIAR SERVIDOR
// =======================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

// Iniciar cliente de WhatsApp
client.initialize();