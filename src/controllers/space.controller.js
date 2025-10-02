/**
 * @file Controlador de espacios con validación previa.
 */

import {
  createSpace,
  listSpaces,
  findSpace,
  updateSpace,
  removeSpace,
} from "../services/space.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/** Crea espacio (restringe por rol si quieres) */
export async function create(req, res, next) {
  try {
    const { name, pricePerHour, description } = req.body;
    const space = await createSpace({
      name,
      description,
      price_per_hour: pricePerHour,
    });
    res.status(201).json({ space: toCamelCase(space.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/** Lista todos los espacios */
export async function list(_req, res, next) {
  try {
    const spaces = await listSpaces();
    res.json({ spaces: spaces.map((s) => toCamelCase(s.toJSON())) });
  } catch (err) {
    next(err);
  }
}

/** Obtiene un espacio por id */
export async function get(req, res, next) {
  try {
    const s = await findSpace(Number(req.params.id));
    if (!s) return res.status(404).json({ error: "space_not_found" });
    res.json({ space: toCamelCase(s.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/** Actualiza un espacio (parcial) */
export async function update(req, res, next) {
  try {
    const { name, pricePerHour, description } = req.body;
    const updated = await updateSpace(Number(req.params.id), {
      name,
      description,
      price_per_hour: pricePerHour,
    });
    if (!updated) return res.status(404).json({ error: "space_not_found" });
    res.json({ space: toCamelCase(updated.toJSON()) });
  } catch (err) {
    next(err);
  }
}

/** Elimina un espacio */
export async function remove(req, res, next) {
  try {
    const removed = await removeSpace(Number(req.params.id));
    if (!removed) return res.status(404).json({ error: "space_not_found" });
    res.json({ message: "space_removed" });
  } catch (err) {
    next(err);
  }
}
