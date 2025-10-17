export function renderUserApp(data) {
  // Renderizar la aplicación de usuario con los datos proporcionados
  const container = document.getElementById("container-user-data");
  container.innerHTML = ""; // Limpiar contenido previo

  // Crear elementos de la interfaz de usuario según los datos
  container.innerHTML = `
      <h3>Usuario: ${data.name}</h3>
      <p>Cédula: ${data.cc}</p>
      <p>Email: ${data.email}</p>
      <p>Teléfono: ${data.phone}</p>
    `;
}
