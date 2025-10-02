/**
 * @file Controlador de reservas: orquesta validaciones y servicio.
 */

import {
  createReservation,
  listMyReservations,
  getReservationByIdForUser,
  cancelReservationForUser,
} from "../services/reservation.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * POST /reservations
 * @param {import('express').Request} req - body: {spaceId,date,startTime,duration,cuotas?}
 */
export async function create(req, res, next) {
  try {
    const { spaceId, date, startTime, duration, cuotas } = req.body;
    const result = await createReservation({
      userId: req.user.id,
      spaceId,
      date,
      startTime,
      duration,
      cuotas,
    });
    res.status(201).json(toCamelCase(result));
  } catch (err) {
    next(err);
  }
}

/** GET /reservations */
export async function list(req, res, next) {
  try {
    const list = await listMyReservations(req.user.id);
    res.json({ reservations: list.map((r) => toCamelCase(r.toJSON())) });
  } catch (err) {
    next(err);
  }
}

/** GET /reservations/:id */
export async function get(req, res, next) {
  try {
    const r = await getReservationByIdForUser(
      Number(req.params.id),
      req.user.id
    );
    if (!r) return res.status(404).json({ error: "reservation_not_found" });
    res.json({ reservation: toCamelCase(r.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/** DELETE /reservations/:id */
export async function remove(req, res, next) {
  try {
    const r = await cancelReservationForUser(
      Number(req.params.id),
      req.user.id
    );
    if (!r) return res.status(404).json({ error: "reservation_not_found" });
    res.json({ message: "reservation_removed" });
  } catch (err) {
    next(err);
  }
}
