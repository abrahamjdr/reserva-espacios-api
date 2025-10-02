/**
 * @file Router de autenticación:
 *       Endpoints de registro y login con validaciones y Swagger minimalista.
 */

import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: Usuario registrado correctamente }
 *       400: { description: Error de validación }
 *       409: { description: Email ya registrado }
 */
router.post(
  "/register",
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  validate,
  register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login exitoso }
 *       400: { description: Error de validación }
 *       401: { description: Credenciales inválidas }
 */
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  validate,
  login
);

export default router;
