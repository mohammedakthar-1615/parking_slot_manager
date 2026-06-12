const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// POST /api/bookings - Book a slot
router.post('/', authMiddleware, async (req, res) => {
  const { slot_id, vehicle_number } = req.body;
  const user_id = req.user.id;

  try {
    const slot = await db.query('SELECT * FROM parking_slots WHERE id = $1', [slot_id]);
    if (slot.rows.length === 0)
      return res.status(404).json({ message: 'Slot not found' });
    if (slot.rows[0].status === 'occupied')
      return res.status(400).json({ message: 'Slot already occupied' });

    const active = await db.query(
      "SELECT * FROM bookings WHERE user_id = $1 AND status = 'active'",
      [user_id]
    );
    if (active.rows.length > 0)
      return res.status(400).json({ message: 'You already have an active booking' });

    const booking = await db.query(
      `INSERT INTO bookings (user_id, slot_id, vehicle_number)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, slot_id, vehicle_number]
    );

    await db.query(
      "UPDATE parking_slots SET status = 'occupied' WHERE id = $1",
      [slot_id]
    );

    res.status(201).json(booking.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/calculate/:id - Calculate amount before releasing
router.get('/calculate/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await db.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    const checkIn = new Date(booking.rows[0].check_in);
    const now = new Date();
    const durationMs = now - checkIn;
    const durationHrs = durationMs / (1000 * 60 * 60);
    const amount = durationHrs < 1 ? 0 : Math.ceil(durationHrs) * 20;

    res.json({
      booking_id: booking.rows[0].id,
      check_in: booking.rows[0].check_in,
      check_out_estimate: now,
      duration_hrs: durationHrs.toFixed(2),
      duration_mins: Math.floor(durationMs / (1000 * 60)),
      amount,
      is_free: amount === 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/release - Confirm payment & release
router.put('/:id/release', authMiddleware, async (req, res) => {
  const { payment_confirmed } = req.body;

  try {
    const booking = await db.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (booking.rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });
    if (booking.rows[0].status === 'completed')
      return res.status(400).json({ message: 'Booking already completed' });

    const checkIn = new Date(booking.rows[0].check_in);
    const checkOut = new Date();
    const durationMs = checkOut - checkIn;
    const durationHrs = durationMs / (1000 * 60 * 60);
    const amount = durationHrs < 1 ? 0 : Math.ceil(durationHrs) * 20;

    // Block release if payment not confirmed for paid bookings
    if (amount > 0 && !payment_confirmed)
      return res.status(400).json({ message: 'Payment required before releasing slot' });

    const updated = await db.query(
      `UPDATE bookings
       SET status = 'completed', check_out = NOW(), amount = $1
       WHERE id = $2 RETURNING *`,
      [amount, req.params.id]
    );

    await db.query(
      "UPDATE parking_slots SET status = 'available' WHERE id = $1",
      [booking.rows[0].slot_id]
    );

    res.json({
      ...updated.rows[0],
      duration_hrs: durationHrs.toFixed(2),
      amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/my - Current user's booking history
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, s.slot_number, s.floor
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.check_in DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings - All bookings (admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });

  try {
    const result = await db.query(
      `SELECT b.*, s.slot_number, s.floor, u.name AS user_name, u.email
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.check_in DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;