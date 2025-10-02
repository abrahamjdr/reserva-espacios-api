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
