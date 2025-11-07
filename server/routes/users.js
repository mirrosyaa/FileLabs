const express = require("express");
const router = express.Router();
const db = require("../database/db");
const jwt = require("jsonwebtoken");

// Secret key for JWT (In production, use environment variable!)
const JWT_SECRET = "hello123456789";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorisation header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  // If no token provided
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Token is valid, attach user data to request
    req.user = user;
    next(); // Continue to the route handlerrrtrrrrrrrrrrrr
  });
};

// Route to check if user exists and validate login
router.post("/login", (req, res) => {
  const { user_email, user_password } = req.body;

  // Check if both fields are provided
  if (!user_email || !user_password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // Query to check if the email and password match
  const sql = "SELECT * FROM users WHERE user_email = ? AND user_password = ?";

  db.query(sql, [user_email, user_password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // If no matching user found
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If user found, generate JWT token
    const user = results[0];

    // Create JWT token with user data
    const token = jwt.sign(
      {
        userId: user.userID,
        email: user.user_email,
        username: user.username,
        userType: user.user_type,
      },
      JWT_SECRET,
      { expiresIn: "4h" } // Token expires in 6 hours
    );

    // Send token to frontend
    res.json({
      message: "Login successful!",
      token: token, // JWT token for authentication
      user: {
        id: user.userID,
        email: user.user_email,
        username: user.username,
        created_at: user.created_at,
        userType: user.user_type,
      },
    });
  });
});

// Protected route example - requires valid JWT token
router.get("/profile", authenticateToken, (req, res) => {
  // req.user contains the decoded JWT data (userId, email, username)
  res.json({
    message: "Access granted to protected route!",
    user: req.user, // User data from JWT token
  });
});

module.exports = router;
