/**
 * @file Middleware de manejo global de errores (último en la cadena).
 * - Traduce err.message si es una clave i18n (p. ej. "email_in_use").
 * - Si no hay traducción, devuelve el texto literal.
 * - Formatea una respuesta de error consistente.
 */

/**
 * Devuelve errores normalizados y traducidos si la clave existe.
 * @function errorMiddleware
 * @param {Error & {status?: number, i18nKey?: string}} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export default function errorMiddleware(err, req, res, _next) {
  // Log de servidor (útil para debugging)
  // eslint-disable-next-line no-console
  console.error(err);

  const status = Number.isInteger(err.status) ? err.status : 500;

  // Helper: intenta traducir clave i18n; si no puede, devuelve la clave/texto recibido.
  const t = (key) => {
    // Si por alguna razón i18n no está inicializado, devolvemos un fallback.
    if (typeof req.__ !== "function") {
      return key || "Internal error";
    }
    // Si no hay clave, usamos el mensaje genérico.
    if (!key) return req.__("messages.internalError");

    // Intentamos traducir; si i18n devuelve la misma cadena, no había traducción.
    const translated = req.__(key);
    return translated === key ? key : translated;
  };

  // Permite usar err.i18nKey o err.message como clave
  const msgKey =
    err.i18nKey || `messages.${err.message}` || "messages.internalError";
  const message = t(msgKey);

  res.status(status).json({
    error: {
      status,
      message,
      path: req.originalUrl,
      method: req.method,
      requestId: req.id, // si tienes un middleware que setea un id; opcional
      timestamp: new Date().toISOString(),
    },
  });
}
