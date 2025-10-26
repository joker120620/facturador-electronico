import fs from "fs";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: "yamabiko.proxy.rlwy.net",
  user: "root",
  password: "wzjRdMySqqSDrKCHqgqaUezwlkSKYYpc",
  database: "railway", // puedes cambiar a db_facturabot si ya la creaste
  port: 57080,
  multipleStatements: true // 👈 muy importante
});

const sql = fs.readFileSync("./DATABASE.SQL", "utf8");

try {
  await connection.query(sql);
  console.log("✅ Base de datos importada correctamente en Railway");
} catch (err) {
  console.error("❌ Error al importar:", err.message);
}

await connection.end();