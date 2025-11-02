import dotenv from "dotenv";
dotenv.config();
export default async function loginFactus() {
    const url = process.env.HOST_API_FACTUS; // endpoint de login de Factus
    const credentials = {
        "grant_type": "password" || process.env.FACTUS_GRAND_TYPE,
        "client_id": process.env.FACTUS_CLIENT_ID,
        "client_secret": process.env.FACTUS_CLIENT_SECRET,
        "username": process.env.FACTUS_USER,
        "password": process.env.FACTUS_PASSWORD
    }

  const res = await fetch(`${url}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Error de autenticación: ${data.message}`);

  // 🔑 Devolvemos solo el token
  return data.access_token;
}