/**
 * @file Configuración de internacionalización (i18n) y otras cross-cutting concerns.
 */

import i18n from "i18n";
import path from "path";
import { fileURLToPath } from "url";

/** @constant {string} __dirname Directorio compatible con ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configura i18n con locales y carpeta de recursos.
 * Idioma por defecto: 'es'
 */
i18n.configure({
  locales: ["es", "en"],
  directory: path.join(__dirname, "../locales"),
  defaultLocale: "es",
  objectNotation: true,
  autoReload: false,
  updateFiles: false,
  syncFiles: false,
});
