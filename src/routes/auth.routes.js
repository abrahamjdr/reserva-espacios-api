/**
 * @file Rutas de usuarios + Swagger JSDoc.
 */

import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
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
 * /api/auth/login:
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

export default router;
