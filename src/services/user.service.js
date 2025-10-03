/**
 * @file Servicio de usuarios.
 */

import { User } from "../models/index.js";

/**
 * Lista paginada de usuarios con búsqueda simple (name/email) y ordenamiento.
 * @param {{page:number,limit:number,offset:number,sortBy:string,sortDir:'ASC'|'DESC',search:string}} pg
 * @returns {Promise<{rows:any[],count:number}>}
 */
export function list(pg) {
  const ALLOWED_SORT = new Set(["id", "name", "email", "created_at"]);
  const orderBy = ALLOWED_SORT.has(pg.sortBy) ? pg.sortBy : "created_at";

  const where = pg.search
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${pg.search}%` } },
          { email: { [Op.iLike]: `%${pg.search}%` } },
        ],
      }
    : undefined;

  return User.findAndCountAll({
    where,
    order: [[orderBy, pg.sortDir]],
    limit: pg.limit,
    offset: pg.offset,
  });
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
