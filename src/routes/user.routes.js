/**
 * @file Rutas de usuarios + Swagger JSDoc.
 */

import { Router } from "express";
import {
  profile,
  getUsers,
  create,
  getById,
  update,
  remove,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { body } from "express-validator";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/users:
 * /api/users/:id
 *   get:
 *     summary: listado de los usuarios (registrados)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 */
router.get("/", auth, getUsers);

router.get("/:id", getById);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 */
router.get("/profile", auth, profile);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Users]
 */
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  validate,
  create
);

/**
 * @swagger
 * /api/users/:id:
 *   put:
 *     summary: Registro de usuario
 *     tags: [Users]
 */
router.put(
  "/:id",
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  validate,
  update
);

/**
 * @swagger
 * /api/users/:id:
 *  delete:
 *  summary: Elimina un espacio
 *  security: [{ bearerAuth: [] }]
 *  tags: [User]
 */
router.delete("/:id", remove);

export default router;
