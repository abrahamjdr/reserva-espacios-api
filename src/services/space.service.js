/**
 * @file Servicio de espacios (CRUD).
 */

import { Space } from "../models/index.js";

/**
 * Lista todos los espacios.
 * @returns {Promise<Space[]>} Arreglo de espacios
 */
export function listSpaces() {
  return Space.findAll();
}

/**
 * Busca un espacio por id.
 * @param {number} id - Identificador del espacio
 * @returns {Promise<Space|null>} Espacio o null si no existe
 */
export function findSpace(id) {
  return Space.findByPk(id);
}

/**
 * Crea un espacio.
 * @param {{ name:string, description?:string, price_per_hour:number }} data - Payload en snake_case para DB
 * @returns {Promise<Space>} Espacio creado
 */
export function createSpace(data) {
  return Space.create(data);
}

/**
 * Actualiza parcialmente un espacio.
 * @param {number} id - Identificador del espacio
 * @param {{ name?:string, description?:string, price_per_hour?:number }} payload - Campos a actualizar (snake_case)
 * @returns {Promise<Space|null>} Espacio actualizado o null si no existe
 */
export async function updateSpace(id, payload) {
  const s = await Space.findByPk(id);
  if (!s) return null;
  return s.update(payload);
}

/**
 * Elimina un espacio por id.
 * @param {number} id - Identificador del espacio
 * @returns {Promise<Space|null>} Espacio eliminado o null si no existe
 */
export async function removeSpace(id) {
  const s = await Space.findByPk(id);
  if (!s) return null;
  await s.destroy();
  return s;
}
