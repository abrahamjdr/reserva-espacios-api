/**
 * @file Controlador de usuarios (perfil y CRUD - sin login/registro).
 */

import { findById } from "../services/user.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * GET /users/profile (requiere auth)
 */
export async function profile(req, res, next) {
  try {
    const u = await findById(req.user.id);
    if (!u) return res.status(404).json({ message: "user_not_found" });
    res.json({
      user: toCamelCase({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }),
    });
  } catch (err) {
    next(err);
  }
}
