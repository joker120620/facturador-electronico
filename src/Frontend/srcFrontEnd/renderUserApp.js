export function renderUserApp(data) {
  console.log(data)
  // Renderizar la aplicación de usuario con los datos proporcionados
  const container = document.getElementById("container-user-data");
  container.innerHTML = ""; // Limpiar contenido previo

  // Crear elementos de la interfaz de usuario según los datos
  container.innerHTML = `
      <h3>Usuario: ${data.nombre_usuario}</h3>
      <p>Cédula: ${data.cedula_usuario
      }</p>
      <p>Email: ${data.correo_usuario}</p>
      <p>Teléfono: ${data.telefono_usuario}</p>
    `;
}
