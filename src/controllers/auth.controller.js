/**
 * @file Controlador de autenticación:
 *       Maneja registro y login. Devuelve datos normalizados y token JWT.
 */

import { registerUser, loginUser } from "../services/auth.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * @route POST /api/auth/register
 * @summary Registro de usuario
 * @description Crea un usuario nuevo y devuelve la información pública del mismo.
 * @access Público
 *
 * @param {import('express').Request} req  - Body: { name:string, email:string, password:string, role?:string }
 * @param {import('express').Response} res - Respuesta JSON con el usuario creado (sin contraseña)
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 201 Created con { message, user }
 * @throws {Error} email_in_use (409) si el email ya existe
 */
export async function register(req, res, next) {
  try {
    const safeUser = await registerUser(req.body);
    res.status(201).json({
      message: "registered",
      user: toCamelCase(safeUser),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route POST /api/auth/login
 * @summary Login de usuario
 * @description Verifica credenciales y devuelve un JWT + datos del usuario.
 * @access Público
 *
 * @param {import('express').Request} req  - Body: { email:string, password:string }
 * @param {import('express').Response} res - Respuesta JSON con { token, user }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK con { message, token, user }
 * @throws {Error} invalid_credentials (401) si las credenciales no son válidas
 */
export async function login(req, res, next) {
  try {
    const { token, user } = await loginUser(req.body);
    res.json({
      message: "login_ok",
      token,
      user: toCamelCase(user),
    });
  } catch (err) {
    next(err);
  }
}
