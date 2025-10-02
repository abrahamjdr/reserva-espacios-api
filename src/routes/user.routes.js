/**
 * @file Rutas de usuarios + Swagger JSDoc.
 */

import { Router } from "express";
import { profile } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     tags: [Users]
 */
router.get("/profile", auth, profile);

export default router;
