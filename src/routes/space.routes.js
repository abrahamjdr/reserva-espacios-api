/**
 * @file Rutas de espacios (CRUD).
 */

import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import {
  create,
  list,
  get,
  update,
  remove,
} from "../controllers/space.controller.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/space:
 * /api/space/:id:
 *   get:
 *   summary: Lista todos los espacios o uno por id
 *   security: [{ bearerAuth: [] }]
 *   tags: [Spaces]
 */
router.get("/", list);
router.get("/:id", get);

/**
 * @swagger
 * /api/space:
 *  post:
 *  summary: Crea un espacio
 *  security: [{ bearerAuth: [] }]
 *  tags: [Spaces]
 */
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("pricePerHour").isNumeric(),
  validate,
  create
);
/**
 * @swagger
 * /api/space:
 *  put:
 *  summary: Actualiza un espacio
 *  security: [{ bearerAuth: [] }]
 *  tags: [Spaces]
 */
router.put(
  "/:id",
  body("name").optional().isString(),
  body("pricePerHour").optional().isNumeric(),
  validate,
  update
);

/**
 * @swagger
 * /api/space:
 *  delete:
 *  summary: Elimina un espacio
 *  security: [{ bearerAuth: [] }]
 *  tags: [Spaces]
 */
router.delete("/:id", remove);

export default router;
