/**
 * @file Lógica de autenticación: registro, login y emisión de JWT.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findByEmail } from "./user.service.js";

/**
 * Registra un usuario nuevo con hash de contraseña.
 * @param {{name:string,email:string,password:string,role?:string}} payload
 * @returns {Promise<{id:number,name:string,email:string,role:string}>}
 * @throws {Error} email_in_use si ya existe
 */
export async function registerUser(payload) {
  const { name, email, password, role } = payload;

  const exists = await findByEmail(email);
  if (exists) {
    const e = new Error("email_in_use");
    e.status = 409;
    throw e;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email,
    password: hash,
    role: role || "user",
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/**
 * Verifica credenciales y devuelve un JWT.
 * @param {{email:string,password:string}} payload
 * @returns {Promise<{token:string,user:{id:number,name:string,email:string,role:string}}>}
 * @throws {Error} invalid_credentials si email/clave no coinciden
 */
export async function loginUser(payload) {
  const { email, password } = payload;
  const user = await findByEmail(email);
  if (!user) {
    const e = new Error("invalid_credentials");
    e.status = 401;
    throw e;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const e = new Error("invalid_credentials");
    e.status = 401;
    throw e;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return {
    token,
    user: { name: user.name, email: user.email, role: user.role },
  };
}
