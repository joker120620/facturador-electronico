import { MongoClient, ServerApiVersion } from "mongodb";


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbInstance = null;

export async function connectDB() {
  if (dbInstance) return dbInstance; // evita reconexiones múltiples

  try {
    await client.connect();
    dbInstance = client.db(process.env.MONGO_DB);
    console.log("✅ Conectado a MongoDB:", process.env.MONGO_DB);
    return dbInstance;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
}

export async function closeDB() {
  await client.close();
  console.log("🔒 Conexión a MongoDB cerrada");
}