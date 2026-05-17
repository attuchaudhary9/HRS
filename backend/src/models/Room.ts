import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { Booking } from './Booking';

export class Room extends Model {
  declare id: number;
  declare number: number;
  declare floor: number;
  declare status: 'AVAILABLE' | 'BOOKED';
  declare bookingId: number | null;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'BOOKED'),
      defaultValue: 'AVAILABLE',
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Booking,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'rooms',
  }
);

Booking.hasMany(Room, { foreignKey: 'bookingId' });
Room.belongsTo(Booking, { foreignKey: 'bookingId' });
