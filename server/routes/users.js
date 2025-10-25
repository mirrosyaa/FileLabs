const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// POST a new user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'User added', userId: result.insertId });
    }
  );
});

module.exports = router;
