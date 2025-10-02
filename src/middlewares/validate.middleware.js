/**
 * @file Middleware helper para resultados de express-validator.
 */

import { validationResult } from "express-validator";

/**
 * Revisa errores de validación y, si existen, responde 400 con detalles.
 * @function validate
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ error: "validation_error", details: errors.array() });
  next();
}
