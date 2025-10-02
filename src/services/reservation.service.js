/**
 * @file Lógica de reservas: disponibilidad, precio, cuotas, tipo de cambio.
 */

import { Reservation, Space } from "../models/index.js";
import { calculateTotalVES } from "../utils/calculatePrice.js";
import { buildQuotas } from "../utils/calculateQuotas.js";
import { isWithinAllowedHours } from "../utils/dateUtils.js";
import { getUsdToVesRate } from "../utils/exchangeRate.js";
import { Op } from "sequelize";

/**
 * Verifica traslape de reservas existentes (mismo espacio/fecha).
 * @param {number} spaceId
 * @param {string} dateISO
 * @param {string} startTime - "HH:mm"
 * @param {number} duration
 * @returns {Promise<boolean>} true si hay choque
 */
async function hasOverlap(spaceId, dateISO, startTime, duration) {
  const [startH, startM] = startTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = start + duration * 60;

  // Trae todas las reservas del mismo día/espacio (suficiente para el reto)
  const sameDay = await Reservation.findAll({
    where: { space_id: spaceId, date: dateISO },
  });
  return sameDay.some((r) => {
    const [h, m] = r.start_time.split(":").map(Number);
    const s = h * 60 + m;
    const e = s + r.duration * 60;
    return start < e && end > s; // solape clásico
  });
}

/**
 * Crea una reserva y devuelve montos (VES/USD) y cuotas (opcional).
 * @param {{userId:number,spaceId:number,date:string,startTime:string,duration:number,cuotas?:number}} payload
 * @returns {Promise<{reservationId:number,montoVES:number,montoUSD:number,cuotas?:{fecha:string,montoVES:number}[]}>}
 * @throws Error con message semántico si no hay disponibilidad u horario inválido
 */
export async function createReservation(payload) {
  const { userId, spaceId, date, startTime, duration, cuotas = 1 } = payload;

  // 1) espacio
  const space = await Space.findByPk(spaceId);
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

  // 3) disponibilidad
  const overlap = await hasOverlap(spaceId, date, startTime, duration);
  if (overlap) {
    const e = new Error("overlapped_reservation");
    e.status = 409;
    throw e;
  }

  // 4) precio
  const base = Number(space.price_per_hour);
  const totalVES = calculateTotalVES(base, duration, date);

  // 5) tipo de cambio
  const rate = await getUsdToVesRate();
  const totalUSD = parseFloat((totalVES / rate).toFixed(2));

  // 6) persistencia
  const reservation = await Reservation.create({
    user_id: userId,
    space_id: spaceId,
    date,
    start_time: startTime,
    duration,
  });

  // 7) cuotas
  const result = {
    reservationId: reservation.id,
    montoVES: totalVES,
    montoUSD: totalUSD,
  };
  if (cuotas && cuotas > 1) result.cuotas = buildQuotas(totalVES, cuotas, date);

  return result;
}

/** Lista reservas del usuario autenticado (simple) */
export function listMyReservations(userId) {
  return Reservation.findAll({
    where: { user_id: userId },
    order: [
      ["date", "DESC"],
      ["start_time", "DESC"],
    ],
  });
}

/** Detalle de una reserva si pertenece al usuario */
export function getReservationByIdForUser(id, userId) {
  return Reservation.findOne({ where: { id, user_id: userId } });
}

/** Cancela/elimina reserva si pertenece al usuario */
export async function cancelReservationForUser(id, userId) {
  const r = await Reservation.findOne({ where: { id, user_id: userId } });
  if (!r) return null;
  await r.destroy();
  return r;
}
