/**
 * @file Modelo Space
 * @typedef {object} Space
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} price_per_hour - DECIMAL en DB, se maneja como string/number
 */

export default function defineSpace(sequelize, DataTypes) {
  /**
   * Define tabla 'spaces'
   */
  const Space = sequelize.define(
    "Space",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      price_per_hour: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      tableName: "spaces",
      underscored: true,
      timestamps: true,
    }
  );

  return Space;
}
