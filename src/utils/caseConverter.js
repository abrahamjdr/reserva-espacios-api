/**
 * @file Conversión snake_case (DB) -> camelCase (API response).
 */

/**
 * Convierte las claves de un objeto de snake_case a camelCase recursivamente.
 * @param {any} data
 * @returns {any}
 */
export function toCamelCase(data) {
  if (Array.isArray(data)) return data.map(toCamelCase);
  if (data && typeof data === "object") {
    return Object.entries(data).reduce((acc, [k, v]) => {
      const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camel] = toCamelCase(v);
      return acc;
    }, {});
  }
  return data;
}
