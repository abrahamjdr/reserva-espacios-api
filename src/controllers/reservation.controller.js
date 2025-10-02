/**
 * @file Controlador de reservas:
 *       Orquesta validaciones y llama al servicio de reservas.
 */

import {
  createReservation,
  updateReservation,
  listReservations,
  listMyReservations,
  findByPk,
  getReservationByIdForUser,
  cancelReservationForUser,
} from "../services/reservation.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * @route GET /api/reservations
 * @summary Lista todas las reservas (según reglas de acceso)
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Contiene req.user
 * @param {import('express').Response} res - Respuesta JSON con { reservations }
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 200 OK
 */
export async function list(_req, res, next) {
  try {
    const rows = await listReservations();
    res.json({ reservations: rows.map((r) => toCamelCase(r.toJSON())) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/reservations/me
 * @summary Lista reservas del usuario autenticado
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Contiene req.user.id
 * @param {import('express').Response} res - Respuesta JSON con { reservations }
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 200 OK
 */
export async function listMe(req, res, next) {
  try {
    const rows = await listMyReservations(req.user.id);
    res.json({ reservations: rows.map((r) => toCamelCase(r.toJSON())) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/reservations/:id
 * @summary Obtiene una reserva por id (si pertenece al usuario o según reglas)
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Params: { id:number }, req.user.id
 * @param {import('express').Response} res - Respuesta JSON con { reservation } o 404
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function get(req, res, next) {
  try {
    const r = await getReservationByIdForUser(
      Number(req.params.id),
      req.user.id
    );
    if (!r) return res.status(404).json({ message: "reservation_not_found" });
    res.json({ reservation: toCamelCase(r.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route POST /api/reservations
 * @summary Crea una reserva
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Body: { spaceId:number, date:string, startTime:string, duration:number, cuotas?:number }
 * @param {import('express').Response} res - Respuesta JSON con cálculos y cuotas (si aplica)
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 201 Created
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

/**
 * @route PUT /api/reservations/:id
 * @summary Actualiza una reserva
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Params: { id:number } Body: { spaceId:number, date:string, startTime:string, duration:number, cuotas?:number }
 * @param {import('express').Response} res - Respuesta JSON con cálculos recalculados
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const reservationExists = await findByPk(Number(id));
    if (!reservationExists) {
      return res.status(404).json({ message: "reservation_not_found" });
    }

    const { spaceId, date, startTime, duration, cuotas } = req.body;
    const result = await updateReservation(reservationExists.id, {
      userId: req.user.id,
      spaceId,
      date,
      startTime,
      duration,
      cuotas,
    });
    res.json(toCamelCase(result));
  } catch (err) {
    next(err);
  }
}

/**
 * @route DELETE /api/reservations/:id
 * @summary Cancela/elimina una reserva del usuario autenticado
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req  - Params: { id:number }
 * @param {import('express').Response} res - Respuesta JSON con { message }
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function remove(req, res, next) {
  try {
    const r = await cancelReservationForUser(
      Number(req.params.id),
      req.user.id
    );
    if (!r) return res.status(404).json({ message: "reservation_not_found" });
    res.json({ message: "reservation_removed" });
  } catch (err) {
    next(err);
  }
}
