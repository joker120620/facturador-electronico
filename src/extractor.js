
//////============EXTRAER DATOS DE FACTURA=================
// src/extractorFacturaTexto.js
export function extraerJSONdelTexto(texto) {
  try {
    if (!texto || typeof texto !== "string") return null;

    //  Extraer número de teléfono del encabezado
    const telefonoMatch = texto.match(/userPeticion\s*:\s*(\d+)/i);
    const telefono_usuario = telefonoMatch ? telefonoMatch[1] : null;

    // Intentar aislar el bloque JSON entre ```json ... ```
    let jsonString = "";
    const matchCodeBlock = texto.match(/```json([\s\S]*?)```/i);

    if (matchCodeBlock && matchCodeBlock[1]) {
      jsonString = matchCodeBlock[1].trim();
    } else {
      // Si no hay bloque con ```json```, intentar buscar el primer { ... } válido
      const matchBraces = texto.match(/\{[\s\S]*\}/);
      if (matchBraces && matchBraces[0]) {
        jsonString = matchBraces[0].trim();
      } else {
        console.error("⚠️ No se encontró ningún bloque JSON en el texto.");
        return null;
      }
    }

    //  Limpiar posibles caracteres extra o comentarios
    jsonString = jsonString
      .replace(/^[^\{]*/, "") // eliminar texto antes del primer {
      .replace(/[^}]*$/, ""); // eliminar texto después del último }

    // Intentar parsear el JSON
    const data = JSON.parse(jsonString);

    //  Añadir teléfono al objeto resultante
    return { telefono_usuario, ...data };

  } catch (error) {
    console.error("Error al parsear JSON:", error);
    return null;
  }
}