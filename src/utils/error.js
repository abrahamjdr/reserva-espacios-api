/**
 * @file Utilidades de manejo de errores: clase AppError, helper catchAsync,
 *       y normalización de errores de librerías (Sequelize, validator, etc.).
 */

/**
 * Error de aplicación con status HTTP, código semántico y detalles opcionales.
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {number} status - Código HTTP (ej. 400, 404, 409, 500)
   * @param {string} message - Mensaje o código semántico (ej. 'email_in_use')
   * @param {{code?: string, details?: any}} [opts]
   */
  constructor(status, message, opts = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = opts.code || undefined;
    this.details = opts.details || undefined;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Envoltorio para funciones async de controladores: captura excepciones y llama next(err).
 * @template {import('express').RequestHandler} T
 * @param {T} fn
 * @returns {import('express').RequestHandler}
 */
export function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Normaliza errores de terceros (Sequelize, validator) a AppError.
 * @param {unknown} err
 * @returns {AppError}
 */
export function normalizeError(err) {
  // Sequelize unique/validation
  if (err?.name === "SequelizeUniqueConstraintError") {
    const details = err.errors?.map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return new AppError(409, "unique_constraint", {
      code: "DB_UNIQUE",
      details,
    });
  }
  if (err?.name === "SequelizeValidationError") {
    const details = err.errors?.map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return new AppError(400, "db_validation_error", {
      code: "DB_VALIDATION",
      details,
    });
  }

  // express-validator
  if (err?.type === "validation_error") {
    return new AppError(400, "validation_error", {
      code: "VALIDATION",
      details: err.details,
    });
  }

  // Si ya es AppError, devuélvelo tal cual
  if (err instanceof AppError) return err;

  // Fallback 500
  const message = err?.message || "internal_error";
  return new AppError(500, message, { code: "UNHANDLED", details: err });
}
