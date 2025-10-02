/**
 * @file Modelo User
 * @typedef {object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} password - hash bcrypt
 * @property {string} role - 'user' | 'admin'
 */

export default function defineUser(sequelize, DataTypes) {
  /**
   * Define tabla 'users'
   */
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },
    },
    {
      tableName: "users",
      underscored: true,
    }
  );

  return User;
}
