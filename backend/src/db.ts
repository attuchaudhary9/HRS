import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/hms_db';

export const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: connectionString.includes('supabase') ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
