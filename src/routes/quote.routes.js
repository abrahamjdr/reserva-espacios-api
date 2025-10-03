/**
 * @file Router de cuotas (quotes): listar por reserva y marcar pago.
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { param, query } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import {
  listByReservation,
  exportByReservation,
  pay,
} from "../controllers/quote.controller.js";

const router = Router();
router.use(auth);

/**
 * @openapi
 * /quotes/by-reservation/{reservationId}/export:
 *   get:
 *     summary: Exporta cuotas (JSON o CSV)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200: { description: OK }
 */
router.get(
  "/by-reservation/:reservationId/export",
  param("reservationId").isInt({ gt: 0 }),
  query("format").optional().isIn(["json", "csv"]),
  validate,
  exportByReservation
);

/**
 * @openapi
 * /quotes/by-reservation/{reservationId}:
 *   get:
 *     summary: Lista cuotas de una reserva del usuario
 *     tags: [Quotes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get(
  "/by-reservation/:reservationId",
  param("reservationId").isInt({ gt: 0 }),
  validate,
  listByReservation
);

/**
 * @openapi
 * /quotes/{id}/pay:
 *   patch:
 *     summary: Marca una cuota como pagada
 *     tags: [Quotes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200: { description: Pagada }
 *       404: { description: No encontrada }
 */
router.patch("/:id/pay", param("id").isInt({ gt: 0 }), validate, pay);

export default router;
