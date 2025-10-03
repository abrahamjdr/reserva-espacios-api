/**
 * Requiere que el usuario autenticado tenga uno de los roles permitidos.
 * Úsalo después de auth.middleware.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden" });
    }
    next();
  };
}

/**
 * Permite si:
 *  - el usuario tiene uno de los roles permitidos, o
 *  - es dueño del recurso (ownerId === req.user.id).
 * `getOwnerId` puede ser sync o async y recibe (req).
 */
export function requireSelfOrRole(getOwnerId, ...roles) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "unauthorized" });
    if (roles.includes(req.user.role)) return next();
    try {
      const ownerId = await getOwnerId(req);
      if (ownerId === req.user.id) return next();
      return res.status(403).json({ message: "forbidden" });
    } catch (err) {
      return next(err);
    }
  };
}
