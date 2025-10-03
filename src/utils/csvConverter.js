/**
 * Genera un CSV simple y compatible con Excel/Sheets.
 * - BOM UTF-8 para acentos
 * - CRLF para Excel en Windows
 * - Escapa comas, comillas y saltos de línea
 *
 * @param {string[]} headers
 * @param {Array<Record<string, any>>} rows
 * @param {{bom?: boolean}} [opts]
 * @returns {string}
 */
export function toCSV(headers, rows, opts = {}) {
  const NL = "\r\n";
  const { bom = true } = opts;

  const toCell = (v) => {
    if (v === null || v === undefined) return "";
    // homogeneiza objetos/fechas/decimales
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "object") return String(v); // evita [object Object]
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const head = headers.map(toCell).join(",");
  const body = rows
    .map((r) => headers.map((h) => toCell(r[h])).join(","))
    .join(NL);

  const csv = head + NL + body;
  return bom ? "\uFEFF" + csv : csv;
}
