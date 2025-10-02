/**
 * @file Middleware de respuesta unificada:
 *       - Inyecta requestId por petición.
 *       - Intercepta res.status/res.json para devolver { data, meta } en éxitos
 *         y { error } en fallos, traduciendo claves i18n en messages.
 */

import crypto from "node:crypto";

/**
 * Genera y adjunta un identificador único por request.
 * @returns {import('express').RequestHandler}
 */
export function requestId() {
  return (req, _res, next) => {
    req.id = req.headers["x-request-id"] || crypto.randomUUID();
    next();
  };
}

/**
 * Detecta si el payload ya viene formateado para evitar doble envuelto.
 * @param {unknown} payload
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
 * Traduce una clave i18n. Si no existe, devuelve la clave original.
 * Intenta primero la clave directa y luego "messages.<key>".
 * @param {import('express').Request} req
 * @param {string} key
 * @returns {string|undefined}
 */
function translate(req, key) {
  if (!key) return undefined;
  if (typeof req.__ !== "function") return key;

  const direct = req.__(key);
  if (direct !== key) return direct;

  if (!key.includes(".")) {
    const withNs = `messages.${key}`;
    const nested = req.__(withNs);
    if (nested !== withNs) return nested;
  }
  return key;
}

/**
 * Interceptor principal que normaliza todas las respuestas:
 * - 2xx/3xx -> { data, meta } y traduce `data.message` si es clave i18n.
 * - 4xx/5xx -> { error: { status, message, ... } } si no se formateó antes.
 * Mantiene el status original y agrega metadatos útiles.
 * @returns {import('express').RequestHandler}
 */
export function responseFormatter() {
  return (req, res, next) => {
    const startedAt = Date.now();

    // Copias de los métodos originales
    const _status = res.status.bind(res);
    const _json = res.json.bind(res);

    // Intercepta res.status para conservar el código
    res.status = (code) => {
      res.statusCode = code;
      return _status(code);
    };

    // Intercepta res.json para envolver la respuesta
    res.json = (payload) => {
      try {
        // Permitir que un handler salte el formateo
        if (res.locals?.bypassFormat) return _json(payload);
        // Evitar doble formateo
        if (alreadyFormatted(payload)) return _json(payload);

        const status = res.statusCode || 200;
        const meta = {
          path: req.originalUrl,
          method: req.method,
          requestId: req.id,
          timestamp: new Date().toISOString(),
          responseTimeMs: Date.now() - startedAt,
        };

        // ÉXITO: normaliza en { data, meta } y traduce message si procede
        if (status < 400) {
          let data = payload;
          if (payload && typeof payload === "object") {
            const { message, ...rest } = payload;
            const out = { ...rest };
            if (typeof message === "string") {
              const translated = translate(req, message);
              out.message =
                translated && translated !== message ? translated : message;
            }
            data = out;
          }
          return _json({ data, meta });
        }

        // ERROR: si llega sin formatear, lo envolvemos
        const message =
          (payload && (payload.message || payload.error)) ||
          translate(req, "messages.internalError");

        return _json({
          error: {
            status,
            message,
            code: payload?.code,
            details: payload?.details,
            path: meta.path,
            method: meta.method,
            requestId: meta.requestId,
            timestamp: meta.timestamp,
          },
        });
      } catch {
        // Fallback absoluto: no romper la respuesta
        return _json(payload);
      }
    };

    next();
  };
}
