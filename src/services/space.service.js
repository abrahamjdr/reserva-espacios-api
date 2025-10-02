/**
 * @file Lógica de espacios.
 */

import { Space } from "../models/index.js";

/** @param {{name:string,description?:string,price_per_hour:number}} data */
export function createSpace(data) {
  return Space.create(data);
}

// Listar todos los espacios
export function listSpaces() {
  return Space.findAll();
}

// Buscar por id
export function findSpace(id) {
  return Space.findByPk(id);
}

// Actualizar (parcial)
export async function updateSpace(id, payload) {
  const s = await Space.findByPk(id);
  if (!s) return null;
  return s.update(payload);
}

// Eliminar
export async function removeSpace(id) {
  const s = await Space.findByPk(id);
  if (!s) return null;
  await s.destroy();
  return s;
}
