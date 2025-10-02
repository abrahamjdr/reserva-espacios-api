/**
 * @file Generación de cuotas equitativas con fechas mensuales.
 */

/**
 * Genera arreglo de cuotas (fecha y montoVES) mensuales desde dateISO.
 * @param {number} totalVES
 * @param {number} n
 * @param {string} dateISO - YYYY-MM-DD
 * @returns {{fecha:string,montoVES:number}[]}
 */
export function buildQuotas(totalVES, n, dateISO) {
  const out = [];
  const per = parseFloat((totalVES / n).toFixed(2));
  const start = new Date(dateISO);
  for (let i = 0; i < n; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    out.push({ fecha: d.toISOString().slice(0, 10), montoVES: per });
  }
  return out;
}
