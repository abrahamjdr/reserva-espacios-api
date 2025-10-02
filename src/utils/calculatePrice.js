/**
 * @file Cálculo de precio total con factor por día.
 */

import { isWeekend } from "./dateUtils.js";

/**
 * Calcula monto total en VES: precioBaseHora * duración * factor(día).
 * @param {number} basePerHour
 * @param {number} durationHours
 * @param {string} dateISO
 * @returns {number} totalVES
 */
export function calculateTotalVES(basePerHour, durationHours, dateISO) {
  const factor = isWeekend(dateISO) ? 1.2 : 1.0;
  return parseFloat((basePerHour * durationHours * factor).toFixed(2));
}
