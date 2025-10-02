/**
 * @file Rutas de reservas (crear, listar, ver, eliminar).
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import {
  create,
  list,
  get,
  remove,
} from "../controllers/reservation.controller.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/reservations:
 *  post:
 *  summary: Crea una reserva
 *  security: [{ bearerAuth: [] }]
 *  tags: [Reservations]
 */
router.post(
  "/",
  body("spaceId").isNumeric(),
  body("date").isISO8601(),
  body("startTime").matches(/^\d{2}:\d{2}$/),
  body("duration").isInt({ gt: 0 }),
  body("cuotas").optional().isInt({ min: 1 }),
  validate,
  create
);

/**
 * @swagger
 * /api/reservations:
 * /api/reservations/:id:
 *  get:
 * summary: Lista todas las reservas del usuario autenticado
 * security: [{ bearerAuth: [] }]
 * tags: [Reservations]
 */
router.get("/", list);
router.get("/:id", get);

/**
 * @swagger
 * /api/reservations/:id:
 *  delete:
 *  summary: Cancela una reserva del usuario autenticado
 *  security: [{ bearerAuth: [] }]
 *  tags: [Reservations]
 */
router.delete("/:id", remove);

export default router;
