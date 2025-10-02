/**
 * @file Crea y configura la instancia de Express:
 *       - CORS, JSON parser, i18n
 *       - rutas
 *       - manejo de errores
 */

import express from "express";
import cors from "cors";
import i18n from "i18n";
import "./config/config.js"; // inicializa i18n
import router from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

/** CORS básico */
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

/** Parser JSON de Express */
app.use(express.json());

/** Inicializa i18n (configurado en config.js) */
app.use(i18n.init);

/** Rutas principales */
app.use("/api", router);

/** Middleware de errores al final de la cadena */
app.use(errorMiddleware);

export default app;
