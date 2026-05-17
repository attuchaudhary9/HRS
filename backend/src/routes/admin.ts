import express from 'express';
import { Room, Booking } from '../models';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

export const adminRouter = express.Router();

adminRouter.post('/randomize', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get only currently available rooms so we don't overwrite existing bookings
    const availableRooms = await Room.findAll({ where: { status: 'AVAILABLE' } });
    
    // Create a dummy admin booking for the randomized rooms
    const booking = await Booking.create({ userId: req.user!.id });

    const updates = [];
    let roomsBookedCount = 0;
    
    for (const room of availableRooms) {
      const isBooked = Math.random() > 0.5; // 50% chance
      if (isBooked) {
        updates.push(
          room.update({
            status: 'BOOKED',
            bookingId: booking.id,
          })
        );
        roomsBookedCount++;
      }
    }
    
    if (roomsBookedCount > 0) {
      await Promise.all(updates);
    } else {
      await booking.destroy(); // Cleanup if random chance resulted in 0 rooms booked
    }

    const updatedRooms = await Room.findAll();
    res.json({ message: 'Rooms randomized', rooms: updatedRooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

adminRouter.post('/reset', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    await Room.update({ status: 'AVAILABLE', bookingId: null }, { where: {} });
    await Booking.destroy({ where: {} }); // Delete all bookings
    
    const updatedRooms = await Room.findAll();
    res.json({ message: 'All bookings reset', rooms: updatedRooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

adminRouter.get('/stats', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const totalRooms = await Room.count();
    const availableRooms = await Room.count({ where: { status: 'AVAILABLE' } });
    const bookedRooms = await Room.count({ where: { status: 'BOOKED' } });
    const totalBookings = await Booking.count();

    const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    res.json({
      totalRooms,
      availableRooms,
      bookedRooms,
      totalBookings,
      occupancyRate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
