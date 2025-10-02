/**
 * @file Modelo Reservation
 * @typedef {object} Reservation
 * @property {number} id
 * @property {string} date - YYYY-MM-DD (DATEONLY)
 * @property {string} start_time - HH:mm (TIME)
 * @property {number} duration - horas
 * @property {number} user_id
 * @property {number} space_id
 */

export default function defineReservation(sequelize, DataTypes) {
  /**
   * Define tabla 'reservations'
   */
  const Reservation = sequelize.define(
    "Reservation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      start_time: { type: DataTypes.TIME, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "reservations",
      underscored: true,
    }
  );

  return Reservation;
}
