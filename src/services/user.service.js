/**
 * @file Lógica de negocio de usuarios (DB via Sequelize).
 */

import { User } from "../models/index.js";

/**
 * Crea un usuario.
 * @param {{name:string,email:string,password:string,role?:string}} data
 * @returns {Promise<import('../models/user.model.js').default>}
 */
export function createUser(data) {
  return User.create(data);
}

/**
 * Busca usuario por email.
 * @param {string} email
 * @returns {Promise<any|null>}
 */
export function findByEmail(email) {
  return User.findOne({ where: { email } });
}

/**
 * Busca por id.
 * @param {number} id
 * @returns {Promise<any|null>}
 */
export function findById(id) {
  return User.findByPk(id);
}

/**
 * Lista todos los usuarios.
 * @returns {Promise<import('../models/user.model.js').default[]>}
 */
export function list() {
  return User.findAll();
}

/**
 * Actualiza un usuario.
 * @param {{name:string,email:string,password:string,role?:string}} data
 * @returns {Promise<import('../models/user.model.js').default>}
 */
export async function updateUser(id, payload) {
  const userExists = await User.findByPk(id);
  if (!userExists) return null;
  return userExists.update(payload);
}

/**
 * Elimina un usuario.
 * @param {{id}} data
 * @returns {Promise<import('../models/user.model.js').default>}
 */
export async function deleteUser(id) {
  const userExists = await User.findByPk(id);
  if (!userExists) return null;
  await userExists.destroy();
  return userExists;
}
