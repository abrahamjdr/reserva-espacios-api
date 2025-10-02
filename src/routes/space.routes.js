/**
 * @file Router de espacios:
 *       Endpoints protegidos por JWT para listar, obtener, crear, actualizar y eliminar espacios.
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import {
  list,
  get,
  create,
  update,
  remove,
} from "../controllers/space.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route GET /api/spaces
 * @summary Lista todos los espacios
 * @access Privado (JWT)
 *
 * @swagger
 * /api/spaces:
 *   get:
 *     summary: Lista todos los espacios
 *     security: [{ bearerAuth: [] }]
 *     tags: [Spaces]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", list);

/**
 * @route GET /api/spaces/{id}
 * @summary Obtiene un espacio por id
 * @access Privado (JWT)
 *
 * @swagger
 * /api/spaces/{id}:
 *   get:
 *     summary: Obtiene un espacio por id
 *     security: [{ bearerAuth: [] }]
 *     tags: [Spaces]
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
router.get("/:id", param("id").isInt({ gt: 0 }), validate, get);

/**
 * @route POST /api/spaces
 * @summary Crea un espacio
 * @access Privado (JWT)
 *
 * @swagger
 * /api/spaces:
 *   post:
 *     summary: Crea un espacio
 *     security: [{ bearerAuth: [] }]
 *     tags: [Spaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, pricePerHour]
 *             properties:
 *               name:         { type: string }
 *               pricePerHour: { type: number }
 *     responses:
 *       201:
 *         description: Creado
 *       400:
 *         description: Validación inválida
 */
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("pricePerHour").isNumeric(),
  validate,
  create
);

/**
 * @route PUT /api/spaces/{id}
 * @summary Actualiza un espacio
 * @access Privado (JWT)
 *
 * @swagger
 * /api/spaces/{id}:
 *   put:
 *     summary: Actualiza un espacio
 *     security: [{ bearerAuth: [] }]
 *     tags: [Spaces]
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
 *               name:         { type: string }
 *               pricePerHour: { type: number }
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
  body("name").optional().isString(),
  body("pricePerHour").optional().isNumeric(),
  validate,
  update
);

/**
 * @route DELETE /api/spaces/{id}
 * @summary Elimina un espacio
 * @access Privado (JWT)
 *
 * @swagger
 * /api/spaces/{id}:
 *   delete:
 *     summary: Elimina un espacio
 *     security: [{ bearerAuth: [] }]
 *     tags: [Spaces]
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
