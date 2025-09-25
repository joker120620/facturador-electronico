export async function fetchData(apiUrl, datosEnviar) {
    try {
        async function respuesta(response) {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            const data = await response.json();
            //console.log('Datos obtenidos:', data);
            return data;
        }
        if (datosEnviar) {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosEnviar),
            });
            return await respuesta(response);

        } else {
            const response = await fetch(apiUrl);
            return await respuesta(response);
        }


    } catch (error) {
        console.error('Hubo un problema con la solicitud:', error);
    }
}
