/**
 * @file Router principal: monta sub-routers y Swagger UI.
 */

import { Router } from "express";
import userRoutes from "./user.routes.js";
import spaceRoutes from "./space.routes.js";
import reservationRoutes from "./reservation.routes.js";
import swagger from "../docs/swagger.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/spaces", spaceRoutes);
router.use("/reservations", reservationRoutes);

/** Documentación interactiva */
swagger(router);

export default router;
