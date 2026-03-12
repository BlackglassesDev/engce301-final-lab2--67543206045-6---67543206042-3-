const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// GET profile
router.get('/me', async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT id, username, email FROM users LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE profile
router.put('/me', async (req, res) => {
  try {

    const { username, email } = req.body;

    const result = await pool.query(
      "UPDATE users SET username=$1, email=$2 WHERE id=1 RETURNING id,username,email",
      [username, email]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;