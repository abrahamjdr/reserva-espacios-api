/**
 * @file Instancia de Sequelize, registro de modelos y asociaciones.
 * @description
 *  - Dialecto: PostgreSQL (Supabase)
 *  - Nombres de tablas en snake_case
 *  - Campos/columns en snake_case (underscored: true)
 */

import { Sequelize, DataTypes } from "sequelize";
import defineUser from "./user.model.js";
import defineSpace from "./space.model.js";
import defineReservation from "./reservation.model.js";

const DB_URL = process.env.DB_URL;

/**
 * @constant {Sequelize} sequelize Conexión Sequelize a PostgreSQL
 */
export const sequelize = new Sequelize(DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

/** Modelos */
export const User = defineUser(sequelize, DataTypes);
export const Space = defineSpace(sequelize, DataTypes);
export const Reservation = defineReservation(sequelize, DataTypes);

/** Asociaciones 1:N (User-Reservation, Space-Reservation) */
User.hasMany(Reservation, { foreignKey: "user_id", as: "reservations" });
Reservation.belongsTo(User, { foreignKey: "user_id", as: "user" });

Space.hasMany(Reservation, { foreignKey: "space_id", as: "reservations" });
Reservation.belongsTo(Space, { foreignKey: "space_id", as: "space" });

/**
 * Sincroniza modelos con la base de datos.
 * En dev usamos alter:true para ajustar cambios menores.
 * @returns {Promise<void>}
 */
export async function syncDb() {
  await sequelize.sync({ alter: true });
}
