/**
 * @file Modelo Quote (cuotas de una reserva).
 * Tabla: quotes (snake_case), con FK a reservations.id
 */

import { DataTypes, Model } from "sequelize";

/**
 * Define el modelo Quote.
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof Model}
 */
export default function defineQuote(sequelize) {
  /**
   * @typedef {object} QuoteAttributes
   * @property {number} id
   * @property {number} reservation_id
   * @property {string} due_date - YYYY-MM-DD
   * @property {number} amount - Monto en VES (o tu moneda base)
   * @property {boolean} paid
   * @property {Date|null} paid_at
   * @property {Date} created_at
   * @property {Date} updated_at
   */

  const Quote = sequelize.define(
    "Quote",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      reservation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "reservations", key: "id" },
        onDelete: "CASCADE",
      },
      due_date: { type: DataTypes.DATEONLY, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      paid_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "quotes",
      underscored: true,
      timestamps: true,
    }
  );

  return Quote;
}
