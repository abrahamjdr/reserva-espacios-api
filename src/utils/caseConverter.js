/**
 * Devuelve true si es un objeto "plano" ({}), no clases como Date, Buffer, etc.
 * @param {any} o
 */
function isPlainObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

/**
 * Convierte keys snake_case -> camelCase (recursivo).
 * - Si es Date, devuelve ISO string.
 * - Si es array, mapea.
 * - Si es objeto NO plano (ej. Date, Buffer, Model), lo deja tal cual.
 * @param {any} data
 * @returns {any}
 */
export function toCamelCase(data) {
  if (data instanceof Date) return data.toISOString();

  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }

  if (isPlainObject(data)) {
    return Object.entries(data).reduce((acc, [k, v]) => {
      const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camel] = toCamelCase(v);
      return acc;
    }, {});
  }

  // para tipos primitivos, Date, Buffers, etc., devuélvelo tal cual
  return data;
}
