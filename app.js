import qrcode from "qrcode-terminal";
import * as fs from 'fs';
import path from "path";
import {extraerDatosFactura , extraerDatos} from "./src/extractor.js";
import { fetchData } from "./src/peticionServer.js";
import { fileURLToPath } from 'url';

// 🔹 Definir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar paquete completo y desestructurar
import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

client.on('ready', async() => {
    console.log('Bot iniciado!');
    //guardar estado del bot en backend
    try {
        const response = await fetchData("http://localhost:3000/statusbot", {entity: "bot", status: true });
        console.log(response.msj);
    } catch (error) {
        console.error("Error backend no encontrado:");
    }
    
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
client.on('message_create', message => {
    console.log(message.body);
});
client.on('message', async (msg) => {
    let user = await msg.getContact();
    
    if (msg.body == "Factura") {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia("src/media");
            if (media) {

                // Detecta extensión según mimetype
                const extension = media.mimetype.split('/')[1];

                // 📌 Nombre fijo para el archivo
                const fileName = `factura.${extension}`;


                const filePath = path.join(__dirname, 'src/media', fileName);

                // Guarda en disco
                fs.writeFileSync(filePath, media.data, { encoding: 'base64' });

                await extraerDatosFactura("src/media/factura.jpeg");

                const jsonPath = path.join(__dirname, 'src', 'facturaExtraida.json');

                // Verificamos que exista
                if (!fs.existsSync(jsonPath)) {
                    console.error("Archivo JSON no encontrado:", jsonPath);
                    await msg.reply("|Lo siento, no encontré los datos procesados.");
                    return;
                }
                const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                // Respondemos al chat con el JSON
                await msg.reply("Aquí está la información procesada:\n```" + JSON.stringify(jsonData, null, 2) + "```");
                const fileJsonPath = path.join(__dirname, 'src', 'facturaExtraida.json');
                fs.unlink(fileJsonPath, (err) => {
                    if (err) {
                        console.error("⚠️ Error al borrar JSON temporal:", err.message);
                    } else {
                        console.log("🗑 JSON temporal borrado:", fileJsonPath);
                    }
                });

            }
        }

    } 
    else if (msg.body === 'Extraer') {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia("src/media");
            if (media) {

                // Detecta extensión según mimetype
                const extension = media.mimetype.split('/')[1];

                // 📌 Nombre fijo para el archivo
                const fileName = `imgExtraer.${extension}`;


                const filePath = path.join(__dirname, 'src/media', fileName);

                // Guarda en disco
                fs.writeFileSync(filePath, media.data, { encoding: 'base64' });

                const textoExtraido = await extraerDatos("src/media/imgExtraer.jpeg");

                // Respondemos al chat con el texto extraído
                await msg.reply("Aquí está la información procesada:\n```" + textoExtraido + "```");
        

            }
        }


    }

    else if (msg.body === 'Foto') {
        const media = await MessageMedia.fromUrl('https://cdn.memegenerator.es/imagenes/memes/full/2/81/2813751.jpg');
        await client.sendMessage(msg.from, media);
    }

    else if (msg.body === 'Hola') {
        console.log("👤 Nombre de usuario:", user.pushname || "N/A");
        msg.reply(`Hola @${user.pushname} ¿en qué puedo ayudarte?`);
    }
    else if (msg.body === '¿Cómo estás?') {
        msg.reply('¡Estoy bien, gracias por preguntar! ¿Y tú?');
    }
    else if (msg.body === 'Adiós') {
        msg.reply('¡Hasta luego! Que tengas un buen día.');
    }
    else if (msg.body === 'Sticker') {
        // Verifica si el mensaje contiene una imagen
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();

            await client.sendMessage(
                msg.from,
                media, // enviamos el mismo archivo
                {
                    sendMediaAsSticker: true, // 👈 convierte en sticker
                    stickerAuthor: "Mi Bot 🤖", // opcional
                    stickerName: "Pack Stickers" // opcional
                }
            );
        } else {
            msg.reply("Por favor envíame una imagen junto con la palabra *Sticker* para convertirla en sticker.");
        }
    }
    else if (msg.body === 'Contacto') {
        const vCard =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:Juan Toloza\n' +
            'ORG:Microsoft;\n' +
            'TEL;type=CELL;type=VOICE;waid=573227093117:+57 (322) 709 3117\n' +
            'END:VCARD';
        msg.reply(vCard, undefined, { sendMediaAsVcard: true });
    }
    else if (msg.body === 'Pokemon') {
        const media = await MessageMedia.fromUrl('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png');
        await client.sendMessage(msg.from, media);
    }
    else if(msg.body === 'Servidor'){
        const response = await fetchData(" http://localhost:3000/token");
        await msg.reply("Aquí está la información del servidor:\n```" + JSON.stringify(response.access_token, null, 2) + ` su token es: `);
    }
});
client.initialize();
