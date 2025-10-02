/**
 * @file Controlador de espacios (CRUD) con validación previa desde routes.
 */

import {
  listSpaces,
  findSpace,
  createSpace,
  updateSpace,
  removeSpace,
} from "../services/space.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * @route GET /api/spaces
 * @summary Lista todos los espacios
 * @description Retorna un arreglo de espacios en camelCase.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} _req - No se usa
 * @param {import('express').Response} res - Respuesta JSON con { spaces }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK con { spaces: Array }
 */
export async function list(_req, res, next) {
  try {
    const spaces = await listSpaces();
    res.json({ spaces: spaces.map((s) => toCamelCase(s.toJSON())) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/spaces/:id
 * @summary Obtiene un espacio por id
 * @description Retorna un espacio si existe, de lo contrario 404.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number }
 * @param {import('express').Response} res - Respuesta JSON con { space } o error 404
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function get(req, res, next) {
  try {
    const s = await findSpace(Number(req.params.id));
    if (!s) return res.status(404).json({ message: "space_not_found" });
    res.json({ space: toCamelCase(s.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route POST /api/spaces
 * @summary Crea un espacio
 * @description Crea un espacio con nombre, precio por hora y descripción opcional.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Body: { name:string, pricePerHour:number, description?:string }
 * @param {import('express').Response} res - Respuesta JSON con { space }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 201 Created con { space }
 */
export async function create(req, res, next) {
  try {
    const { name, pricePerHour, description } = req.body;
    const space = await createSpace({
      name,
      description,
      price_per_hour: pricePerHour,
    });
    const plainSpace = space.get({ plain: true });
    res.status(201).json({ space: toCamelCase(plainSpace) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route PUT /api/spaces/:id
 * @summary Actualiza un espacio (parcial)
 * @description Actualiza nombre, precio por hora y/o descripción.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number } Body: { name?:string, pricePerHour?:number, description?:string }
 * @param {import('express').Response} res - Respuesta JSON con { space } o error 404
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function update(req, res, next) {
  try {
    const { name, pricePerHour, description } = req.body;
    const updated = await updateSpace(Number(req.params.id), {
      name,
      description,
      price_per_hour: pricePerHour,
    });
    if (!updated) return res.status(404).json({ message: "space_not_found" });
    const plainUpdated = updated.get({ plain: true });
    res.json({ space: toCamelCase(plainUpdated) });
  } catch (err) {
    next(err);
  }
}

/**
 * @route DELETE /api/spaces/:id
 * @summary Elimina un espacio
 * @description Elimina el espacio indicado si existe.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number }
 * @param {import('express').Response} res - Respuesta JSON con { message }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function remove(req, res, next) {
  try {
    const removed = await removeSpace(Number(req.params.id));
    if (!removed) return res.status(404).json({ message: "space_not_found" });
    res.json({ message: "space_removed" });
  } catch (err) {
    next(err);
  }
}
