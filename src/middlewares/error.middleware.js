/**
 * @file Middleware de manejo global de errores (último en la cadena).
 */

/**
 * Devuelve errores normalizados.
 * @function errorMiddleware
 * @param {Error & {status?: number}} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 * @returns {void}
 */
export default function errorMiddleware(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  const message = err.message || req.__("messages.internalError");
  res.status(status).json({ error: message });
}
