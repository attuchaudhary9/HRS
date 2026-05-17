import express from 'express';
import { Room } from '../models';
import { authMiddleware } from '../middleware/auth';

export const roomsRouter = express.Router();

// Get all rooms (authenticated users only)
roomsRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [
        ['floor', 'ASC'],
        ['number', 'ASC']
      ]
    });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
