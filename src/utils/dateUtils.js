/**
 * @file Utilidades de fechas/horarios.
 */

/**
 * Valida que una reserva esté entre 08:00 y 22:00 y que no exceda el cierre.
 * @param {string} startTime - "HH:mm"
 * @param {number} durationHours
 * @returns {boolean}
 */
export function isWithinAllowedHours(startTime, durationHours) {
  const [h] = startTime.split(":").map(Number);
  return h >= 8 && h + durationHours <= 22;
}

/**
 * Devuelve true si la fecha es fin de semana (sábado=6 o domingo=0).
 * @param {string} dateISO - YYYY-MM-DD
 * @returns {boolean}
 */
export function isWeekend(dateISO) {
  const d = new Date(dateISO);
  const day = d.getDay();
  return day === 0 || day === 6;
}
