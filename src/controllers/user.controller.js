/**
 * @file Controlador de usuarios (perfil y CRUD - sin login/registro).
 */

import bcrypt from "bcryptjs";
import {
  list,
  findById,
  findByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * @route GET /api/users
 * @summary Lista todos los usuarios
 * @description Retorna un arreglo de usuarios en camelCase (sin contraseñas).
 * @access Privado (JWT)
 *
 * @param {import('express').Request} _req - No se usa
 * @param {import('express').Response} res - Respuesta JSON con { users }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK con { users: Array }
 */
export async function getUsers(_req, res, next) {
  try {
    const users = await list();
    res.json({
      users: users.map((u) =>
        toCamelCase({ id: u.id, name: u.name, email: u.email, role: u.role })
      ),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/users/profile
 * @summary Perfil del usuario autenticado
 * @description Devuelve el usuario asociado al JWT.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Contiene req.user.id desde el middleware de auth
 * @param {import('express').Response} res - Respuesta JSON con { user } o 404 si no existe
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function profile(req, res, next) {
  try {
    const u = await findById(req.user.id);
    if (!u) return res.status(404).json({ message: "user_not_found" });
    res.json({
      user: toCamelCase({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route GET /api/users/:id
 * @summary Obtiene un usuario por id
 * @description Devuelve un usuario por id (reglas de acceso según negocio).
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number }
 * @param {import('express').Response} res - Respuesta JSON con { user } o 404 si no existe
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function getById(req, res, next) {
  try {
    const u = await findById(Number(req.params.id));
    if (!u) return res.status(404).json({ message: "user_not_found" });
    res.json({
      user: toCamelCase({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route POST /api/users
 * @summary Crea un usuario (ruta administrativa)
 * @description Valida email único, hashea contraseña y crea el usuario.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Body: { name:string, email:string, password:string, role?:string }
 * @param {import('express').Response} res - Respuesta JSON con { user } (sin contraseña)
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 201 Created | 409 Conflict si el email ya existe
 * @throws {Error} email_in_use (409) cuando el email existe
 */
export async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const exists = await findByEmail(email);
    if (exists) {
      const e = new Error("email_in_use");
      e.status = 409;
      throw e;
    }

    const hash = await bcrypt.hash(password, 10);
    const userCreated = await createUser({
      name,
      email,
      password: hash,
      role: role || "user",
    });

    res.status(201).json({
      message: "user_created",
      user: toCamelCase({
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
        role: userCreated.role,
      }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route PUT /api/users/:id
 * @summary Actualiza un usuario
 * @description Actualiza nombre, email y/o rol. Valida email único.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number } Body: { name?:string, email?:string, role?:string }
 * @param {import('express').Response} res - Respuesta JSON con { user } actualizado
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found | 409 Conflict
 * @throws {Error} email_in_use (409) si el email ya pertenece a otro usuario
 */
export async function update(req, res, next) {
  try {
    const { name, email, role } = req.body;

    if (email) {
      const exists = await findByEmail(email);
      if (exists && exists.id !== Number(req.params.id)) {
        const e = new Error("email_in_use");
        e.status = 409;
        throw e;
      }
    }

    const userUpdated = await updateUser(Number(req.params.id), {
      name,
      email,
      role: role || "user",
    });

    if (!userUpdated) {
      return res.status(404).json({ message: "user_not_found" });
    }

    res.json({
      message: "user_updated",
      user: toCamelCase({
        id: userUpdated.id,
        name: userUpdated.name,
        email: userUpdated.email,
        role: userUpdated.role,
      }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route DELETE /api/users/:id
 * @summary Elimina un usuario
 * @description Elimina un usuario por id.
 * @access Privado (JWT)
 *
 * @param {import('express').Request} req - Params: { id:number }
 * @param {import('express').Response} res - Respuesta JSON con { message }
 * @param {import('express').NextFunction} next - Siguiente middleware en caso de error
 * @returns {Promise<void>} 200 OK | 404 Not Found
 */
export async function remove(req, res, next) {
  try {
    const removed = await deleteUser(Number(req.params.id));
    if (!removed) return res.status(404).json({ message: "user_not_found" });
    res.json({ message: "user_deleted" });
  } catch (err) {
    next(err);
  }
}
