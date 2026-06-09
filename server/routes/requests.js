const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all requests (with equipment + team name)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.*,
        e.name AS equipment_name,
        t.name AS team_name,
        m.name AS assigned_to_name
      FROM maintenance_request r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN maintenance_team t ON r.team_id = t.id
      LEFT JOIN team_member m ON r.assigned_to = m.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET requests for one specific equipment (smart button)
router.get('/by-equipment/:equipmentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM maintenance_request WHERE equipment_id = ?',
      [req.params.equipmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create request
// Auto-fill: if equipment_id given, fetch its team_id automatically
router.post('/', async (req, res) => {
  let { subject, type, equipment_id, team_id, assigned_to, scheduled_date } = req.body;

  try {
    // AUTO-FILL LOGIC — this is the key business rule
    if (equipment_id && !team_id) {
      const [equip] = await db.query(
        'SELECT team_id FROM equipment WHERE id = ?',
        [equipment_id]
      );
      if (equip.length > 0) {
        team_id = equip[0].team_id; // automatically set from equipment
      }
    }

    const [result] = await db.query(`
      INSERT INTO maintenance_request
        (subject, type, equipment_id, team_id, assigned_to, scheduled_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [subject, type, equipment_id, team_id, assigned_to || null, scheduled_date || null]);

    res.json({ id: result.insertId, ...req.body, team_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update stage (for Kanban drag & drop)
// Also handles scrap logic
router.patch('/:id/stage', async (req, res) => {
  const { stage } = req.body;
  try {
    await db.query(
      'UPDATE maintenance_request SET stage = ? WHERE id = ?',
      [stage, req.params.id]
    );

    // SCRAP LOGIC — if moved to scrap, flag the equipment
    if (stage === 'scrap') {
      const [rows] = await db.query(
        'SELECT equipment_id FROM maintenance_request WHERE id = ?',
        [req.params.id]
      );
      if (rows[0]?.equipment_id) {
        await db.query(
          'UPDATE equipment SET is_scrapped = TRUE WHERE id = ?',
          [rows[0].equipment_id]
        );
      }
    }

    res.json({ message: 'Stage updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH assign technician
router.patch('/:id/assign', async (req, res) => {
  const { assigned_to, duration_hours } = req.body;
  try {
    await db.query(
      'UPDATE maintenance_request SET assigned_to = ?, duration_hours = ? WHERE id = ?',
      [assigned_to, duration_hours, req.params.id]
    );
    res.json({ message: 'Assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;