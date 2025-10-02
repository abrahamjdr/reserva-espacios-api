/**
 * Configuración de Swagger (OpenAPI 3) con swagger-jsdoc + swagger-ui.
 * - Escanea rutas/controladores y opcionalmente YAMLs sueltos.
 * - Monta Swagger UI en /api/docs.
 */
import path from "node:path";
import url from "node:url";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, "..");

/** Normaliza backslashes a slashes (Windows). */
function norm(p) {
  return p.replace(/\\/g, "/");
}

export default function swagger(router) {
  // Globs ABSOLUTOS y normalizados
  const ROUTES_GLOB = norm(path.join(SRC_ROOT, "routes", "**/*.js"));
  const CTRLS_GLOB = norm(path.join(SRC_ROOT, "controllers", "**/*.js"));
  const YAML_GLOB = norm(path.join(SRC_ROOT, "docs", "paths", "**/*.yaml")); // opcional

  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API Reservas de Espacios",
        version: "1.0.0",
        description:
          "Backend de reservas con Express + Sequelize. Respuestas unificadas { data, meta } y { error }.",
      },
      servers: [{ url: "/api", description: "API local" }],
      tags: [
        { name: "Auth" },
        { name: "Users" },
        { name: "Spaces" },
        { name: "Reservations" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    // Archivos que contienen los bloques @openapi y/o YAML
    apis: [ROUTES_GLOB, CTRLS_GLOB, YAML_GLOB],
    failOnErrors: true, // lanza si hay YAML inválido (útil para depurar)
  });

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[swagger] globs usados:", {
      ROUTES_GLOB,
      CTRLS_GLOB,
      YAML_GLOB,
    });
    // eslint-disable-next-line no-console
    console.log(
      "[swagger] paths encontrados:",
      Object.keys(swaggerSpec.paths || {}).length
    );
  }

  router.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );
}
