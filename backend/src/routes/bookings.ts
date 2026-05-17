import express from 'express';
import { Room, Booking } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { findOptimalRooms } from '../utils/bookingAlgo';

export const bookingsRouter = express.Router();

bookingsRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { numRooms } = req.body;
  const userId = req.user?.id;

  if (!numRooms || numRooms < 1 || numRooms > 5) {
    return res.status(400).json({ message: 'Can only book between 1 and 5 rooms at a time' });
  }

  try {
    const availableRooms = await Room.findAll({ where: { status: 'AVAILABLE' } });
    
    const optimalRooms = findOptimalRooms(availableRooms, numRooms);

    if (optimalRooms.length === 0) {
      return res.status(400).json({ message: 'Not enough available rooms to fulfill the request' });
    }

    // Create booking
    const booking = await Booking.create({ userId });

    // Mark rooms as booked
    const roomIds = optimalRooms.map(r => r.id);
    await Room.update(
      { status: 'BOOKED', bookingId: booking.id },
      { where: { id: roomIds } }
    );

    const bookedRooms = await Room.findAll({ where: { id: roomIds } });

    res.json({ message: 'Booking successful', booking, bookedRooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
bookingsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const bookings = await Booking.findAll({
      where: { userId },
      include: [Room],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
bookingsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;

    const booking = await Booking.findOne({ where: { id: bookingId, userId } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Free up rooms
    await Room.update(
      { status: 'AVAILABLE', bookingId: null },
      { where: { bookingId: booking.id } }
    );

    // Delete booking
    await booking.destroy();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
