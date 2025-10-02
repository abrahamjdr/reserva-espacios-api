/**
 * @file Servicio de usuarios.
 */

import { User } from "../models/index.js";

/**
 * Lista todos los usuarios.
 * @returns {Promise<User[]>} Arreglo de usuarios
 */
export function list() {
  return User.findAll();
}

/**
 * Busca un usuario por id.
 * @param {number} id - Identificador del usuario
 * @returns {Promise<User|null>} Usuario o null si no existe
 */
export function findById(id) {
  return User.findByPk(id);
}

/**
 * Busca un usuario por email.
 * @param {string} email - Email único del usuario
 * @returns {Promise<User|null>} Usuario o null si no existe
 */
export function findByEmail(email) {
  return User.findOne({ where: { email } });
}

/**
 * Crea un usuario.
 * @param {{ name:string, email:string, password:string, role?:string }} data - Datos del usuario
 * @returns {Promise<User>} Usuario creado
 */
export function createUser(data) {
  return User.create(data);
}

/**
 * Actualiza parcialmente un usuario.
 * @param {number} id - Identificador del usuario
 * @param {{ name?:string, email?:string, password?:string, role?:string }} payload - Campos a actualizar
 * @returns {Promise<User|null>} Usuario actualizado o null si no existe
 */
export async function updateUser(id, payload) {
  const userExists = await User.findByPk(id);
  if (!userExists) return null;
  return userExists.update(payload);
}

/**
 * Elimina un usuario por id.
 * @param {number} id - Identificador del usuario
 * @returns {Promise<User|null>} Usuario eliminado o null si no existe
 */
export async function deleteUser(id) {
  const userExists = await User.findByPk(id);
  if (!userExists) return null;
  await userExists.destroy();
  return userExists;
}
