/**
 * @file Router de usuarios:
 *       Endpoints protegidos por JWT para listar, obtener, crear, actualizar y eliminar usuarios.
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { body, param } from "express-validator";
import {
  getUsers,
  getById,
  profile,
  create,
  update,
  remove,
} from "../controllers/user.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route GET /api/users
 * @summary Lista todos los usuarios
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos los usuarios
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", getUsers);

/**
 * @route GET /api/users/me
 * @summary Perfil del usuario autenticado
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 */
router.get("/me", profile);

/**
 * @route GET /api/users/{id}
 * @summary Obtiene un usuario por id
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por id
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 */
router.get("/:id", param("id").isInt({ gt: 0 }), validate, getById);

/**
 * @route POST /api/users
 * @summary Crea un usuario (ruta administrativa)
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crea un usuario
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string }
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Creado
 *       400:
 *         description: Validación inválida
 *       409:
 *         description: Email ya registrado
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
 * @route PUT /api/users/{id}
 * @summary Actualiza un usuario
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Actualizado
 *       400:
 *         description: Validación inválida
 *       404:
 *         description: No encontrado
 */
router.put(
  "/:id",
  param("id").isInt({ gt: 0 }),
  body("name").optional().isString().notEmpty(),
  body("email").optional().isEmail(),
  validate,
  update
);

/**
 * @route DELETE /api/users/{id}
 * @summary Elimina un usuario
 * @access Privado (JWT)
 *
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Eliminado
 *       404:
 *         description: No encontrado
 */
router.delete("/:id", param("id").isInt({ gt: 0 }), validate, remove);

export default router;
