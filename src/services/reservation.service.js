/**
 * @file Servicio de reservas:
 *       Disponibilidad, horario permitido, precio, cuotas y tipo de cambio.
 *       Reglas:
 *       - No permite solapes por espacio/fecha/rango horario (independiente del usuario).
 *       - Valida horario permitido (p. ej. 08:00–22:00).
 *       - Usa transacciones y row-level locks para evitar condiciones de carrera.
 *       - En caso de error, rollback automático.
 */

import { Op } from "sequelize";
import { sequelize, Reservation, Space } from "../models/index.js";
import { calculateTotalVES } from "../utils/calculatePrice.js";
import { buildQuotas } from "../utils/calculateQuotas.js";
import { isWithinAllowedHours } from "../utils/dateUtils.js";
import { getUsdToVesRate } from "../utils/exchangeRate.js";

/**
 * Convierte "HH:mm" a minutos desde medianoche.
 * @param {string} hhmm - formato "HH:mm"
 * @returns {number} Minutos desde 00:00
 */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Determina si dos intervalos [startA, endA) y [startB, endB) (en minutos) se solapan.
 * @param {number} aStart
 * @param {number} aEnd
 * @param {number} bStart
 * @param {number} bEnd
 * @returns {boolean} true si existe solape
 */
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Revisa solapes contra TODAS las reservas de ese día/espacio dentro de una transacción.
 * Usa lock de filas para evitar condiciones de carrera.
 * @param {import('sequelize').Transaction} t
 * @param {number} spaceId
 * @param {string} dateISO - YYYY-MM-DD
 * @param {string} startTime - "HH:mm"
 * @param {number} durationHours
 * @param {number} [excludeId] - id de reserva a excluir (para update)
 * @returns {Promise<boolean>} true si hay solape
 */
async function hasOverlapLocked(
  t,
  spaceId,
  dateISO,
  startTime,
  durationHours,
  excludeId
) {
  const start = toMinutes(startTime);
  const end = start + durationHours * 60;

  const where = { space_id: spaceId, date: dateISO };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  // Traemos y bloqueamos las filas del día/espacio (row-level lock en Postgres).
  const sameDay = await Reservation.findAll({
    where,
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  return sameDay.some((r) => {
    const s = toMinutes(r.start_time);
    const e = s + r.duration * 60;
    return rangesOverlap(start, end, s, e);
  });
}

/**
 * Busca reserva por id (simple).
 * @param {number} id
 * @returns {Promise<Reservation|null>}
 */
export function findByPk(id) {
  return Reservation.findByPk(id);
}

/**
 * Lista reservas del usuario autenticado.
 * @param {number} userId
 * @returns {Promise<Reservation[]>}
 */
export function listMyReservations(userId) {
  return Reservation.findAll({
    where: { user_id: userId },
    order: [
      ["date", "DESC"],
      ["start_time", "DESC"],
    ],
    include: [{ model: Space, as: "space" }],
  });
}

/**
 * Lista todas las reservas (admin/simple).
 * @returns {Promise<Reservation[]>}
 */
export function listReservations() {
  return Reservation.findAll({
    order: [
      ["date", "DESC"],
      ["start_time", "DESC"],
    ],
    include: [{ model: Space, as: "space" }],
  });
}

/**
 * Detalle de una reserva si pertenece al usuario.
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<Reservation|null>}
 */
export function getReservationByIdForUser(id, userId) {
  return Reservation.findOne({
    where: { id, user_id: userId },
    include: [{ model: Space, as: "space" }],
  });
}

/**
 * Crea una reserva con validaciones (horario y solapes) dentro de una transacción.
 * En caso de error, se hace rollback automáticamente.
 *
 * @param {{
 *   userId:number,
 *   spaceId:number,
 *   date:string,         // YYYY-MM-DD
 *   startTime:string,    // "HH:mm"
 *   duration:number,     // horas
 *   cuotas?:number
 * }} payload
 * @returns {Promise<{
 *   reservationId:number,
 *   montoVES:number,
 *   montoUSD:number,
 *   cuotas?:{fecha:string,montoVES:number}[],
 *   calculation:{
 *     basePerHour:number,
 *     durationHours:number,
 *     weekendFactor:boolean,
 *     date:string,
 *     fxUsed:number
 *   }
 * }>}
 * @throws {Error} space_not_found|invalid_hours|overlapped_reservation
 */
export async function createReservation(payload) {
  const { userId, spaceId, date, startTime, duration, cuotas = 1 } = payload;

  return await sequelize.transaction(async (t) => {
    // 1) espacio
    const space = await Space.findByPk(spaceId, { transaction: t });
    if (!space) {
      const e = new Error("space_not_found");
      e.status = 404;
      throw e;
    }

    // 2) horario permitido
    if (!isWithinAllowedHours(startTime, duration)) {
      const e = new Error("invalid_hours");
      e.status = 400;
      throw e;
    }

    // 3) disponibilidad (solapes)
    const overlap = await hasOverlapLocked(
      t,
      spaceId,
      date,
      startTime,
      duration
    );
    if (overlap) {
      const e = new Error("overlapped_reservation");
      e.status = 409;
      throw e;
    }

    // 4) precio total VES + factor finde
    const base = Number(space.price_per_hour);
    const totalVES = calculateTotalVES(base, duration, date);
    const weekendFactor =
      totalVES === +(base * duration * 1.2).toFixed(2) ? true : false;

    // 5) tipo de cambio y USD
    const fx = await getUsdToVesRate(); // modo fake con cache 1h
    const totalUSD = parseFloat((totalVES / fx).toFixed(2));

    // 6) persistencia
    const reservation = await Reservation.create(
      {
        user_id: userId,
        space_id: spaceId,
        date,
        start_time: startTime,
        duration,
      },
      { transaction: t }
    );

    // 7) cuotas (opcional)
    const result = {
      reservationId: reservation.id,
      montoVES: totalVES,
      montoUSD: totalUSD,
      calculation: {
        basePerHour: base,
        durationHours: duration,
        weekendFactor,
        date,
        fxUsed: fx,
      },
    };
    if (cuotas && cuotas > 1) {
      result.cuotas = buildQuotas(totalVES, cuotas, date);
    }

    return result;
  });
}

/**
 * Actualiza una reserva con validaciones dentro de una transacción.
 * En caso de error, rollback automático.
 *
 * @param {number} id
 * @param {{
 *   userId:number,
 *   spaceId:number,
 *   date:string,
 *   startTime:string,
 *   duration:number,
 *   cuotas?:number
 * }} payload
 * @returns {Promise<{
 *   reservationId:number,
 *   montoVES:number,
 *   montoUSD:number,
 *   cuotas?:{fecha:string,montoVES:number}[],
 *   calculation:{
 *     basePerHour:number,
 *     durationHours:number,
 *     weekendFactor:boolean,
 *     date:string,
 *     fxUsed:number
 *   }
 * }>}
 * @throws {Error} reservation_not_found|space_not_found|invalid_hours|overlapped_reservation
 */
export async function updateReservation(id, payload) {
  const { userId, spaceId, date, startTime, duration, cuotas = 1 } = payload;

  return await sequelize.transaction(async (t) => {
    const current = await Reservation.findOne({
      where: { id, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!current) {
      const e = new Error("reservation_not_found");
      e.status = 404;
      throw e;
    }

    const space = await Space.findByPk(spaceId, { transaction: t });
    if (!space) {
      const e = new Error("space_not_found");
      e.status = 404;
      throw e;
    }

    if (!isWithinAllowedHours(startTime, duration)) {
      const e = new Error("invalid_hours");
      e.status = 400;
      throw e;
    }

    // excluimos la propia reserva al verificar solape
    const overlap = await hasOverlapLocked(
      t,
      spaceId,
      date,
      startTime,
      duration,
      id
    );
    if (overlap) {
      const e = new Error("overlapped_reservation");
      e.status = 409;
      throw e;
    }

    const base = Number(space.price_per_hour);
    const totalVES = calculateTotalVES(base, duration, date);
    const weekendFactor =
      totalVES === +(base * duration * 1.2).toFixed(2) ? true : false;

    const fx = await getUsdToVesRate();
    const totalUSD = parseFloat((totalVES / fx).toFixed(2));

    const reservation = await current.update(
      {
        user_id: userId,
        space_id: spaceId,
        date,
        start_time: startTime,
        duration,
      },
      { transaction: t }
    );

    const result = {
      reservationId: reservation.id,
      montoVES: totalVES,
      montoUSD: totalUSD,
      calculation: {
        basePerHour: base,
        durationHours: duration,
        weekendFactor,
        date,
        fxUsed: fx,
      },
    };
    if (cuotas && cuotas > 1) {
      result.cuotas = buildQuotas(totalVES, cuotas, date);
    }

    return result;
  });
}

/**
 * Cancela/elimina una reserva si pertenece al usuario.
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<Reservation|null>} La reserva eliminada o null si no existe
 */
export async function cancelReservationForUser(id, userId) {
  const r = await Reservation.findOne({ where: { id, user_id: userId } });
  if (!r) return null;
  await r.destroy();
  return r;
}
