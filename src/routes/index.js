/**
 * @file Router principal:
 *       Monta los sub-routers de la API y habilita Swagger UI.
 */

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import spaceRoutes from "./space.routes.js";
import reservationRoutes from "./reservation.routes.js";
import swagger from "../docs/swagger.js";

const router = Router();

/**
 * @route /api/auth
 * @summary Autenticación (registro/login)
 */
router.use("/auth", authRoutes);

/**
 * @route /api/users
 * @summary Usuarios (CRUD + perfil)
 */
router.use("/users", userRoutes);

/**
 * @route /api/spaces
 * @summary Espacios (CRUD)
 */
router.use("/spaces", spaceRoutes);

/**
 * @route /api/reservations
 * @summary Reservas (CRUD + flujos)
 */
router.use("/reservations", reservationRoutes);

/**
 * @summary Documentación interactiva con Swagger UI
 */
swagger(router);

export default router;
