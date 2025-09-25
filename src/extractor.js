import Tesseract from "tesseract.js";
import fs from "fs";

export  async function extraerDatos(imagen) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagen, "spa");

    console.log("Texto OCR detectado:\n", text);
    return text;
  } catch (error) {
    console.error(" Error al procesar la archivo:", error);
  }
}


export async function extraerDatosFactura(imagen) {
  try {
    const text = await extraerDatos(imagen);
    // Regex para campos principales
    const vendedor = text.match(/Vendedor[:\s]*(.+)/i)?.[1]?.trim() || null;
    const cliente = text.match(/Cliente[:\s]*(.+)/i)?.[1]?.trim() || null;
    const nit = text.match(/NIT[:\s]*([\d\.\-]+)/i)?.[1] || null;
    const total = text.match(/Total\s*a\s*pagar[:\s]*([\d\.,]+)/i)?.[1] || null;

    // Detectar productos (ejemplo sencillo: líneas que contienen precio con coma o punto)
    const lineas = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const productos = lineas
      .filter(l => /\d+[\.,]\d{3}/.test(l)) // busca líneas con precios
      .map(l => {
        const partes = l.split(/\s{2,}/); // separar por muchos espacios
        return {
          descripcion: partes[0] || "",
          detalle: partes.slice(1).join(" ") || ""
        };
      });

    const facturaJSON = {
      vendedor,
      cliente,
      nit,
      productos,
      total
    };

    // Guardar resultado en un archivo JSON
    fs.writeFileSync("src/facturaExtraida.json", JSON.stringify(facturaJSON, null, 2));

    console.log(" Datos extraídos guardados en facturaExtraida.json");
    return facturaJSON;

  } catch (error) {
    console.error("Error al filtrar datos:", error);
    return null;
  }
}

// Ejecutar
//extraerDatosFactura("factura.jpg");