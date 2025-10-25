const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/login', (req, res) => {
  const { user_email, user_password } = req.body;

  // Check if both fields are provided
  if (!user_email || !user_password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Query to check if the email and password match
  const sql = 'SELECT * FROM users WHERE user_email = ? AND user_password = ?';

  db.query(sql, [user_email, user_password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If no matching user found
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If user found
    const user = results[0];
    res.json({
      message: 'Login successful!',
      user: {
        id: user.userID,
        email: user.user_email,
        username: user.username,
        created_at: user.created_at
      }
    });
  });
});

module.exports = router;
