import express from 'express';
import cors from 'cors';
import { connectDB, sequelize } from './db';
import { authRouter } from './routes/auth';
import { roomsRouter } from './routes/rooms';
import { bookingsRouter } from './routes/bookings';
import { adminRouter } from './routes/admin';
import { Room } from './models';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 5000;

const seedRooms = async () => {
  const roomCount = await Room.count();
  if (roomCount === 0) {
    console.log('Seeding rooms...');
    const roomsToCreate = [];
    // Floors 1-9: 10 rooms each
    for (let f = 1; f <= 9; f++) {
      for (let r = 1; r <= 10; r++) {
        roomsToCreate.push({
          floor: f,
          number: f * 100 + r,
          status: 'AVAILABLE'
        });
      }
    }
    // Floor 10: 7 rooms
    for (let r = 1; r <= 7; r++) {
      roomsToCreate.push({
        floor: 10,
        number: 1000 + r,
        status: 'AVAILABLE'
      });
    }
    await Room.bulkCreate(roomsToCreate);
    console.log('Rooms seeded successfully.');
  }
};

const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true }); // Sync models
  await seedRooms();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
