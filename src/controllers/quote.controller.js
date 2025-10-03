/**
 * @file Controlador de cuotas (quotes): listar por reserva y marcar pago.
 */

import {
  listQuotesByReservation,
  getReservationBundle,
  payQuote,
} from "../services/quote.service.js";
import { toCamelCase } from "../utils/caseConverter.js";
import { toCSV } from "../utils/csvConverter.js";

const fmtDate = (d) => {
  if (!d) return "";
  // soporta DATEONLY(string) o Date
  return typeof d === "string" ? d : new Date(d).toISOString().slice(0, 10);
};
const fmtDateTime = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : new Date(d).toISOString();
};

/**
 * @route GET /api/quotes/by-reservation/:reservationId
 * @summary Lista las cuotas de una reserva del usuario autenticado
 * @description Devuelve todas las cuotas asociadas a una reserva si pertenece al usuario del JWT.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { reservationId:number }, requiere req.user.id desde el middleware de auth
 * @param {import('express').Response} res - Respuesta JSON con { quotes } (en camelCase)
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK (si la reserva existe y pertenece) | 200 con [] (si no pertenece o no existe)
 */
export async function listByReservation(req, res, next) {
  try {
    const reservationId = Number(req.params.reservationId);
    const rows = await listQuotesByReservation(reservationId, req.user.id);

    res.json({
      quotes: rows.map((q) =>
        toCamelCase({
          id: q.id,
          reservationId: q.reservation_id,
          dueDate: q.due_date,
          amount: Number(q.amount),
          paid: q.paid,
          paidAt: q.paid_at,
        })
      ),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/quotes/by-reservation/:reservationId/export
 * @summary Exporta cuotas por reserva (JSON o CSV)
 * @description Usa query param ?format=json|csv
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function exportByReservation(req, res, next) {
  try {
    const reservationId = Number(req.params.reservationId);
    const format = String(req.query.format || "json").toLowerCase();

    const r = await getReservationBundle(reservationId, req.user.id);

    const reservationDTO = {
      id: r.id,
      date: fmtDate(r.date),
      startTime: r.start_time,
      duration: Number(r.duration),
      user: { id: r.user.id, name: r.user.name, email: r.user.email },
      space: {
        id: r.space.id,
        name: r.space.name,
        description: r.space.description,
        pricePerHour: Number(r.space.price_per_hour),
      },
    };

    const quotesDTO = r.quotes.map((q) => ({
      id: q.id,
      reservationId: r.id,
      dueDate: fmtDate(q.due_date),
      amount: Number(q.amount),
      paid: Boolean(q.paid),
      paidAt: q.paid_at ? fmtDateTime(q.paid_at) : "",
    }));

    if (format === "csv") {
      const headers = [
        "reservationId",
        "reservationDate",
        "startTime",
        "durationHours",
        "userId",
        "userName",
        "userEmail",
        "spaceId",
        "spaceName",
        "spacePricePerHour",
        "quoteId",
        "dueDate",
        "amount",
        "paid",
        "paidAt",
      ];

      const rows = r.quotes.map((q) => ({
        reservationId: r.id,
        reservationDate: fmtDate(r.date),
        startTime: r.start_time,
        durationHours: Number(r.duration),
        userId: r.user.id,
        userName: r.user.name,
        userEmail: r.user.email,
        spaceId: r.space.id,
        spaceName: r.space.name,
        spacePricePerHour: Number(r.space.price_per_hour),
        quoteId: q.id,
        dueDate: fmtDate(q.due_date),
        amount: Number(q.amount),
        paid: q.paid,
        paidAt: q.paid_at ? fmtDateTime(q.paid_at) : "",
      }));

      // Evita el formateo automático del interceptor global
      res.locals.bypassFormat = true;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="quotes-reservation-${r.id}.csv"`
      );
      return res.status(200).send(toCSV(headers, rows));
    }

    // JSON agrupado (el interceptor lo envolverá en { data, meta })
    return res.json({
      reservation: reservationDTO,
      quotes: quotesDTO,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route PATCH /api/quotes/:id/pay
 * @summary Marca una cuota como pagada
 * @description Cambia el estado de la cuota a paid=true y setea paidAt. Valida pertenencia por usuario.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number }, requiere req.user.id desde el middleware de auth
 * @param {import('express').Response} res - Respuesta JSON con { quote, message } en camelCase
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found si la cuota no existe o no pertenece al usuario
 * @throws {Error} not_found (404) cuando no existe o no pertenece
 */
export async function pay(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await payQuote(id, req.user.id);

    if (!updated) {
      const e = new Error("not_found");
      e.status = 404;
      throw e;
    }

    res.json({
      quote: toCamelCase({
        id: updated.id,
        reservationId: updated.reservation_id,
        dueDate: updated.due_date,
        amount: Number(updated.amount),
        paid: updated.paid,
        paidAt: updated.paid_at,
      }),
      message: "quote_paid",
    });
  } catch (err) {
    next(err);
  }
}
