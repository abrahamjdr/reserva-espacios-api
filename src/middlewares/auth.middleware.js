/**
 * @file Middleware JWT de protección de rutas.
 */

import jwt from "jsonwebtoken";

/**
 * Verifica el token JWT del header Authorization.
 * @function authMiddleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 * @throws 401 Token inválido o ausente
 */
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(401).json({ error: req.__("messages.invalidToken") });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: req.__("messages.invalidToken") });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: req.__("messages.invalidToken") });
  }
}
