/**
 * @file Controlador de autenticación (registro y login).
 */

import { registerUser, loginUser } from "../services/auth.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * POST /auth/register
 * @param {import('express').Request} req - body: {name,email,password,role?}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function register(req, res, next) {
  try {
    const safeUser = await registerUser(req.body);
    res
      .status(201)
      .json({ message: "registered", user: toCamelCase(safeUser) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * @param {import('express').Request} req - body: {email,password}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function login(req, res, next) {
  try {
    const { token, user } = await loginUser(req.body);
    res.json({ message: "login_ok", token, user: toCamelCase(user) });
  } catch (err) {
    next(err);
  }
}
