const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/slots - Get all parking slots
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM parking_slots ORDER BY floor, slot_number'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/slots/available - Get only available slots
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM parking_slots WHERE status = 'available' ORDER BY floor, slot_number"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/slots - Add a new slot (admin only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });

  const { slot_number, floor } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO parking_slots (slot_number, floor) VALUES ($1, $2) RETURNING *',
      [slot_number, floor || 'G']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ message: 'Slot number already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/slots/:id - Delete a slot (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });

  try {
    await db.query('DELETE FROM parking_slots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

