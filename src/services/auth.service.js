/**
 * @file Servicio de autenticación:
 *       - Registro con hash de contraseña (bcrypt)
 *       - Login con verificación de credenciales
 *       - Emisión de JWT (2h) usando JWT_SECRET
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findByEmail } from "./user.service.js";

/** Rondas de hash para bcrypt */
const SALT_ROUNDS = 10;

/**
 * Firma un JWT con los datos mínimos del usuario.
 * @param {{ id:number, email:string, role:string }} payload
 * @returns {string} token JWT
 * @throws {Error} Si falta JWT_SECRET
 */
function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    const e = new Error("jwt_secret_missing");
    e.status = 500;
    throw e;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
}

/**
 * Registra un usuario nuevo con email único y contraseña hasheada.
 * @param {{name:string,email:string,password:string,role?:string}} payload
 * @returns {Promise<{id:number,name:string,email:string,role:string}>}
 * @throws {Error} email_in_use (409) si ya existe el email
 */
export async function registerUser(payload) {
  const { name, email, password, role } = payload;

  // 1) Email único
  const exists = await findByEmail(email);
  if (exists) {
    const e = new Error("email_in_use");
    e.status = 409;
    throw e;
  }

  // 2) Hash de contraseña
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3) Persistencia
  const user = await createUser({
    name,
    email,
    password: hash,
    role: role || "user",
  });

  // 4) Respuesta pública (sin password)
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/**
 * Verifica credenciales y devuelve un JWT + datos del usuario.
 * @param {{email:string,password:string}} payload
 * @returns {Promise<{token:string,user:{id:number,name:string,email:string,role:string}}>}
 * @throws {Error} invalid_credentials (401) si email/clave no coinciden
 */
export async function loginUser(payload) {
  const { email, password } = payload;

  // 1) Buscar usuario por email
  const user = await findByEmail(email);
  if (!user) {
    const e = new Error("invalid_credentials");
    e.status = 401;
    throw e;
  }

  // 2) Comparar contraseña
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const e = new Error("invalid_credentials");
    e.status = 401;
    throw e;
  }

  // 3) Emitir token
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // 4) Respuesta pública (incluye id para consistencia)
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
