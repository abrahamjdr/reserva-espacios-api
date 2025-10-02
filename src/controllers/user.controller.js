/**
 * @file Controlador de usuarios: validaciones y orquestación.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findByEmail, findById } from "../services/user.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * Registro de usuario.
 * @param {import('express').Request} req - body: {name,email,password}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await findByEmail(email);
    if (exists) return res.status(409).json({ error: "email_in_use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      password: passwordHash,
      role: role || "user",
    });
    const safe = toCamelCase({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    res.status(201).json({ message: "registered", user: safe });
  } catch (err) {
    next(err);
  }
}

/**
 * Login con JWT.
 * @param {import('express').Request} req - body: {email,password}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ message: "login_ok", token });
  } catch (err) {
    next(err);
  }
}

/**
 * Perfil del usuario autenticado.
 */
export async function profile(req, res, next) {
  try {
    const u = await findById(req.user.id);
    if (!u) return res.status(404).json({ error: "user_not_found" });
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
