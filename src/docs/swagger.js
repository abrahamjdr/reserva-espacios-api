/**
 * @file Configuración de Swagger (OpenAPI 3) con swagger-jsdoc y swagger-ui.
 */

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

/**
 * Monta Swagger UI en /api/docs
 * @param {import('express').Router} router
 */
export default function swagger(router) {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: { title: "API Reservas de Espacios", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    apis: ["src/routes/*.js", "src/controllers/*.js"],
  });

  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
