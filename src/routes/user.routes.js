/**
 * @file Router de usuarios:
 *       Endpoints protegidos por JWT para listar, obtener, crear, actualizar y eliminar usuarios.
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  requireRole,
  requireSelfOrRole,
} from "../middlewares/rbac.middleware.js";
import { findById } from "../services/user.service.js";
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
 * @openapi
 * /users:
 *   get:
 *     summary: Lista todos los usuarios
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", requireRole("admin"), getUsers);

/**
 * @openapi
 * /users/me:
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
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por id
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 */
router.get(
  "/:id",
  requireRole("admin"),
  param("id").isInt({ gt: 0 }),
  validate,
  getById
);

/**
 * @openapi
 * /users:
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
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
  requireRole("admin"),
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  validate,
  create
);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
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
  requireSelfOrRole((req) => Number(req.params.id), "admin"),
  param("id").isInt({ gt: 0 }),
  body("name").optional().isString().notEmpty(),
  body("email").optional().isEmail(),
  validate,
  update
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eliminado
 *       404:
 *         description: No encontrado
 */
router.delete(
  "/:id",
  requireSelfOrRole((req) => Number(req.params.id), "admin"),
  param("id").isInt({ gt: 0 }),
  validate,
  remove
);

export default router;
