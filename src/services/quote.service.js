/**
 * @file Lógica de cuotas (quotes): listar por reserva y marcar como pagadas.
 */

import { Quote, Reservation, Space, User } from "../models/index.js";

/**
 * Lista las cuotas de una reserva (si pertenece al usuario o con regla admin).
 * @param {number} reservationId
 * @param {number} userId - dueño de la reserva (seguridad básica)
 * @returns {Promise<import('../models/quote.model.js').default[]>}
 */
export async function listQuotesByReservation(reservationId, userId) {
  const r = await Reservation.findOne({
    where: { id: reservationId, user_id: userId },
  });
  if (!r) return [];
  return Quote.findAll({
    where: { reservation_id: reservationId },
    order: [
      ["due_date", "ASC"],
      ["id", "ASC"],
    ],
  });
}

/**
 * Devuelve la reserva (si pertenece al userId) con usuario, espacio y sus cuotas.
 * @param {number} reservationId
 * @param {number} userId
 * @returns {Promise<Reservation & { user: User, space: Space, quotes: Quote[] }>}
 * @throws 404 si no existe o no pertenece al usuario
 */
export async function getReservationBundle(reservationId, userId) {
  const reservation = await Reservation.findOne({
    where: { id: reservationId, user_id: userId },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      {
        model: Space,
        as: "space",
        attributes: ["id", "name", "description", "price_per_hour"],
      },
      {
        model: Quote,
        as: "quotes",
        attributes: ["id", "due_date", "amount", "paid", "paid_at"],
        separate: true,
        order: [["due_date", "ASC"]],
      },
    ],
  });

  if (!reservation) {
    const e = new Error("reservation_not_found");
    e.status = 404;
    throw e;
  }
  return reservation;
}

/**
 * Marca una cuota como pagada.
 * @param {number} quoteId
 * @param {number} userId - validación de pertenencia vía reservation.user_id
 * @returns {Promise<import('../models/quote.model.js').default|null>}
 */
export async function payQuote(quoteId, userId) {
  const q = await Quote.findByPk(quoteId, {
    include: [{ model: Reservation, as: "reservation" }],
  });
  if (!q) return null;
  if (q.reservation.user_id !== userId) return null; // opcional: lanzar 403
  if (q.paid) return q;
  return q.update({ paid: true, paid_at: new Date() });
}
