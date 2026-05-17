import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class User extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare role: 'USER' | 'ADMIN';
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);
