const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all equipment (with team name joined)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, t.name AS team_name
      FROM equipment e
      LEFT JOIN maintenance_team t ON e.team_id = t.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one equipment + open request count (for smart button)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, t.name AS team_name
      FROM equipment e
      LEFT JOIN maintenance_team t ON e.team_id = t.id
      WHERE e.id = ?
    `, [req.params.id]);

    const [countRows] = await db.query(`
      SELECT COUNT(*) AS open_requests
      FROM maintenance_request
      WHERE equipment_id = ? AND stage NOT IN ('repaired', 'scrap')
    `, [req.params.id]);

    res.json({ ...rows[0], open_requests: countRows[0].open_requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create equipment
router.post('/', async (req, res) => {
  const { name, serial_number, department, employee_name,
          location, purchase_date, warranty_info, team_id } = req.body;
  try {
    const [result] = await db.query(`
      INSERT INTO equipment
        (name, serial_number, department, employee_name, location, purchase_date, warranty_info, team_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, serial_number, department, employee_name,
        location, purchase_date, warranty_info, team_id]);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  const { name, serial_number, department, employee_name,
          location, purchase_date, warranty_info, team_id, is_scrapped } = req.body;
  try {
    await db.query(`
      UPDATE equipment SET
        name=?, serial_number=?, department=?, employee_name=?,
        location=?, purchase_date=?, warranty_info=?, team_id=?, is_scrapped=?
      WHERE id=?
    `, [name, serial_number, department, employee_name,
        location, purchase_date, warranty_info, team_id, is_scrapped, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;