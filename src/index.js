/**
 * @file Entry point del servidor: carga variables de entorno, crea el app,
 *       levanta el servidor HTTP y sincroniza la base de datos.
 */

import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import { sequelize } from "./models/index.js";

/**
 * Arranca el servidor HTTP y sincroniza la base de datos.
 * Maneja errores de conexión y reporta el puerto de escucha.
 */
async function main() {
  const port = process.env.PORT || 3000;

  try {
    // await sequelize.authenticate(); // con este comando verificamos la conexión

    await sequelize.sync(); // para investigar, usar migraciones
    // eslint-disable-next-line no-console
    console.log("🗄️  DB conectada y sincronizada");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ Error conectando/sincronizando DB:", err);
    process.exit(1);
  }

  const server = createServer(app);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server escuchando en http://localhost:${port}`);
  });
}

main();
