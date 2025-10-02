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
 * @route GET /api/reservations
 * @summary Lista todas las reservas (según reglas de acceso)
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Lista todas las reservas
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", list);

/**
 * @route GET /api/reservations/me
 * @summary Lista las reservas del usuario autenticado
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations/me:
 *   get:
 *     summary: Lista las reservas del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/me", listMe);

/**
 * @route GET /api/reservations/{id}
 * @summary Obtiene una reserva por id (si pertenece al usuario o según reglas)
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Obtiene una reserva por id
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrada
 */
router.get("/:id", param("id").isInt({ gt: 0 }), validate, get);

/**
 * @route POST /api/reservations
 * @summary Crea una reserva
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Crea una reserva
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, date, startTime, duration]
 *             properties:
 *               spaceId:   { type: integer }
 *               date:      { type: string }
 *               startTime: { type: string }
 *               duration:  { type: integer }
 *               cuotas:    { type: integer }
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
 * @route PUT /api/reservations/{id}
 * @summary Actualiza una reserva
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Actualiza una reserva
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
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
 *             required: [spaceId, date, startTime, duration]
 *             properties:
 *               spaceId:   { type: integer }
 *               date:      { type: string }
 *               startTime: { type: string }
 *               duration:  { type: integer }
 *               cuotas:    { type: integer }
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
 * @route DELETE /api/reservations/{id}
 * @summary Cancela/elimina una reserva del usuario autenticado
 * @access Privado (JWT)
 *
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Cancela una reserva
 *     security: [{ bearerAuth: [] }]
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Eliminada
 *       404:
 *         description: No encontrada
 */
router.delete("/:id", param("id").isInt({ gt: 0 }), validate, remove);

export default router;
