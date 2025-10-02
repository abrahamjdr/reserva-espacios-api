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
import {
  requestId,
  responseFormatter,
} from "./middlewares/response.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

/** Le colocamos Id al request */
app.use(requestId());

/** CORS básico */
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

/** Parser JSON de Express */
app.use(express.json());

/** Inicializa i18n (configurado en config.js) */
app.use(i18n.init);

/** Middleware para establecer el locale por petición */
app.use((req, _res, next) => {
  if (!req.get("Accept-Language"))
    req.setLocale(process.env.DEFAULT_LOCALE || "es");
  next();
});

/** Interceptor de respuestas unificadas */
app.use(responseFormatter());

/** Rutas principales */
app.use("/api", router);

/** Handler de 404 */
app.use((_req, res) => {
  res.status(404).json({ message: "not_found" });
});
/** Middleware de errores al final de la cadena */
app.use(errorMiddleware);

export default app;
