/**
 * @file Controlador de usuarios (perfil y CRUD - sin login/registro).
 */

import bcrypt from "bcryptjs";
import {
  findById,
  findByEmail,
  list,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";
import { toCamelCase } from "../utils/caseConverter.js";

/**
 * GET /users (requiere auth)
 */
export async function getUsers(_req, res, next) {
  try {
    const users = await list();
    res.json({
      users: users.map((u) => {
        const userData = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        };
        return toCamelCase(userData);
      }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/profile (requiere auth)
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
 * GET /users/:id (requiere auth)
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
 * POST /users
 * @param {import('express').Request} req - body: {name,email,password,role?}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
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
      message: "user created",
      user: {
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
        role: userCreated.role,
      },
    });
  } catch (err) {
    next(err);
  }
}
/**
 * PUT /users
 * @param {import('express').Request} req - body: {name,email,password,role?}
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function update(req, res, next) {
  try {
    const { name, email, role } = req.body;

    const exists = await findByEmail(email);
    if (exists && exists.id !== Number(req.params.id)) {
      const e = new Error("email_in_use");
      e.status = 409;
      throw e;
    }

    const userUpdated = await updateUser(Number(req.params.id), {
      name,
      email,
      role: role || "user",
    });
    res.status(201).json({
      message: "user updated",
      user: {
        id: userUpdated.id,
        name: userUpdated.name,
        email: userUpdated.email,
        role: userUpdated.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /users/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function remove(req, res, next) {
  try {
    const removed = await deleteUser(Number(req.params.id));
    if (!removed) return res.status(404).json({ error: "user_not_found" });
    res.json({ message: "user_deleted" });
  } catch (err) {
    next(err);
  }
}
