/**
 * @file Router de reservas:
 *       Endpoints protegidos por JWT para crear, listar, obtener, actualizar y eliminar reservas.
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import {
  list,
  listMe,
  get,
  create,
  update,
  remove,
} from "../controllers/reservation.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Lista todas las reservas
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", list);

/**
 * @openapi
 * /reservations/me:
 *   get:
 *     summary: Lista las reservas del usuario autenticado
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/me", listMe);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     summary: Obtiene una reserva por id
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
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
 *         description: No encontrada
 */
router.get("/:id", param("id").isInt({ gt: 0 }), validate, get);

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Crea una reserva
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, date, startTime, duration]
 *             properties:
 *               spaceId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 description: Fecha en formato ISO (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 description: Hora de inicio en formato HH:mm
 *               duration:
 *                 type: integer
 *                 description: Duración en horas
 *               cuotas:
 *                 type: integer
 *                 description: Número de cuotas (opcional)
 *     responses:
 *       201:
 *         description: Creada
 *       400:
 *         description: Validación / horario inválido
 *       409:
 *         description: Solapada
 */
router.post(
  "/",
  body("spaceId").isInt({ gt: 0 }),
  body("date").isISO8601(),
  body("startTime").matches(/^\d{2}:\d{2}$/),
  body("duration").isInt({ gt: 0 }),
  body("cuotas").optional().isInt({ min: 1 }),
  validate,
  create
);

/**
 * @openapi
 * /reservations/{id}:
 *   put:
 *     summary: Actualiza una reserva
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
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
 *             required: [spaceId, date, startTime, duration]
 *             properties:
 *               spaceId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 description: Fecha en formato ISO (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 description: Hora de inicio en formato HH:mm
 *               duration:
 *                 type: integer
 *                 description: Duración en horas
 *               cuotas:
 *                 type: integer
 *                 description: Número de cuotas (opcional)
 *     responses:
 *       200:
 *         description: Actualizada
 *       400:
 *         description: Validación / horario inválido
 *       404:
 *         description: No encontrada
 *       409:
 *         description: Solapada
 */
router.put(
  "/:id",
  param("id").isInt({ gt: 0 }),
  body("spaceId").isInt({ gt: 0 }),
  body("date").isISO8601(),
  body("startTime").matches(/^\d{2}:\d{2}$/),
  body("duration").isInt({ gt: 0 }),
  body("cuotas").optional().isInt({ min: 1 }),
  validate,
  update
);

/**
 * @openapi
 * /reservations/{id}:
 *   delete:
 *     summary: Cancela una reserva
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eliminada
 *       404:
 *         description: No encontrada
 */
router.delete("/:id", param("id").isInt({ gt: 0 }), validate, remove);

export default router;
