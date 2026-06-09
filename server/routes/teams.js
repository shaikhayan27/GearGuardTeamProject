const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM maintenance_team');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one team with its members
router.get('/:id', async (req, res) => {
  try {
    const [team] = await db.query(
      'SELECT * FROM maintenance_team WHERE id = ?',
      [req.params.id]
    );
    const [members] = await db.query(
      'SELECT * FROM team_member WHERE team_id = ?',
      [req.params.id]
    );
    res.json({ ...team[0], members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a team
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO maintenance_team (name) VALUES (?)',
      [name]
    );
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a member to a team
router.post('/:id/members', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO team_member (name, team_id) VALUES (?, ?)',
      [name, req.params.id]
    );
    res.json({ id: result.insertId, name, team_id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a team
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM maintenance_team WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;