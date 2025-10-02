/**
 * @file Middleware helper para resultados de express-validator.
 */

import { validationResult } from "express-validator";

/**
 * Revisa errores de validación y, si existen, eleva un pseudo-error normalizado.
 * @type {import('express').RequestHandler}
 */
export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = {
      type: "validation_error",
      details: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg,
        location: e.location,
        value: e.value,
      })),
    };
    return next(err);
  }
  next();
}
