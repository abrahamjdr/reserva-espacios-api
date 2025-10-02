/**
 * @file Interceptor de respuestas estilo "Exception/Response Filter" (NestJS).
 * Intercepta res.status y res.json para devolver SIEMPRE el formato unificado:
 * - Éxito (2xx/3xx): { data, meta }
 * - Error (4xx/5xx): { error: { status, message, ... } }
 * Mantiene el status que fije el controlador/middleware.
 */

import crypto from "node:crypto";

/**
 * Genera/inyecta un requestId por request (si no existe).
 * Úsalo ANTES del responseFormatter.
 * @returns {import('express').RequestHandler}
 */
export function requestId() {
  return (req, _res, next) => {
    req.id = req.headers["x-request-id"] || crypto.randomUUID();
    next();
  };
}

/**
 * Determina si el payload ya está en nuestro formato final.
 * Evita doble formateo.
 * @param {any} payload
 * @returns {boolean}
 */
function alreadyFormatted(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    (("error" in payload && typeof payload.error === "object") ||
      ("data" in payload && "meta" in payload))
  );
}

/**
 * Interceptor principal. Envuelve res.json conservando el status.
 * @returns {import('express').RequestHandler}
 */
export function responseFormatter() {
  return (req, res, next) => {
    const startedAt = Date.now();

    const _status = res.status.bind(res);
    const _json = res.json.bind(res);

    res.status = (code) => {
      res.statusCode = code;
      return _status(code);
    };

    res.json = (payload) => {
      try {
        // Permitir saltarse el formateo si hace falta:
        if (res.locals?.bypassFormat) return _json(payload);
        if (alreadyFormatted(payload)) return _json(payload);

        const status = res.statusCode || 200;
        const timestamp = new Date().toISOString();
        const baseMeta = {
          path: req.originalUrl,
          method: req.method,
          requestId: req.id,
          timestamp,
          responseTimeMs: Date.now() - startedAt,
        };

        // ÉXITO
        if (status >= 200 && status < 400) {
          return _json({ data: payload, meta: baseMeta });
        }

        // ERROR
        const message =
          (payload && (payload.message || payload.error)) || "internal_error";

        const body = {
          error: {
            status,
            message,
            code: payload?.code,
            details: payload?.details,
            path: baseMeta.path,
            method: baseMeta.method,
            requestId: baseMeta.requestId,
            timestamp: baseMeta.timestamp,
          },
        };

        if (process.env.NODE_ENV !== "production" && payload?.stack) {
          body.error.stack = payload.stack;
        }

        return _json(body);
      } catch {
        // Si algo raro pasa, devolvemos tal cual para no romper la respuesta
        return _json(payload);
      }
    };

    next();
  };
}
