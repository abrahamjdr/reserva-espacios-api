/**
 * @file Middleware de paginación y ordenamiento con generador de links absolutos.
 * Deja en res.locals.pagination:
 *  - page, limit, offset, sortBy, sortDir, search
 *  - makeLink(pageNumber): string  => URL absoluta para la página dada
 */

/**
 * Crea middleware de paginación/ordenamiento/búsqueda.
 * @param {{maxLimit?:number, defaultLimit?:number}} [opts]
 * @returns {import('express').RequestHandler}
 */
export function paginate(opts = {}) {
  const maxLimit = Number.isInteger(opts.maxLimit) ? opts.maxLimit : 100;
  const defaultLimit = Number.isInteger(opts.defaultLimit)
    ? opts.defaultLimit
    : 10;

  return (req, res, next) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10) || defaultLimit;
    const limit = Math.min(Math.max(limitRaw, 1), maxLimit);

    let sortDir = String(req.query.sortDir || "ASC").toUpperCase();
    if (!["ASC", "DESC"].includes(sortDir)) sortDir = "ASC";

    const sortBy = req.query.sortBy ? String(req.query.sortBy) : "created_at";
    const search = req.query.search ? String(req.query.search).trim() : "";

    // URL base absoluta (resuelve behind proxy también si se pasa X-Forwarded-Proto)
    const proto =
      req.headers["x-forwarded-proto"]?.toString() || req.protocol || "http";
    const host = req.get("host");
    const baseAbs = `${proto}://${host}${req.baseUrl}${req.path}`;

    const makeLink = (p) => {
      const u = new URL(baseAbs);
      u.searchParams.set("page", String(p));
      u.searchParams.set("limit", String(limit));
      u.searchParams.set("sortBy", String(sortBy));
      u.searchParams.set("sortDir", String(sortDir));
      if (search) u.searchParams.set("search", search);
      return u.toString();
    };

    res.locals.pagination = {
      page,
      limit,
      offset: (page - 1) * limit,
      sortBy,
      sortDir,
      search,
      makeLink,
    };

    next();
  };
}
