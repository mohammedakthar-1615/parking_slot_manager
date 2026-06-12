const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// POST /api/complaints - Submit a complaint
router.post('/', authMiddleware, async (req, res) => {
  const { slot_id, reason } = req.body;
  const user_id = req.user.id;

  try {
    if (!slot_id || !reason)
      return res.status(400).json({ message: 'Slot and reason are required' });

    const result = await db.query(
      `INSERT INTO complaints (user_id, slot_id, reason)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, slot_id, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints/my - Get current user's complaints
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, s.slot_number, s.floor
       FROM complaints c
       JOIN parking_slots s ON c.slot_id = s.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints - All complaints (admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });

  try {
    const result = await db.query(
      `SELECT c.*, s.slot_number, s.floor, u.name AS user_name, u.email
       FROM complaints c
       JOIN parking_slots s ON c.slot_id = s.id
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id/resolve - Resolve a complaint (admin only)
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });

  try {
    const result = await db.query(
      `UPDATE complaints SET status = 'resolved'
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;