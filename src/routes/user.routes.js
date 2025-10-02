/**
 * @file Rutas de usuarios + Swagger JSDoc.
 */

import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import { register, login, profile } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Users]
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
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Users]
 */
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  validate,
  login
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 */
router.get("/profile", auth, profile);

export default router;
