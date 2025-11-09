const express = require("express");
const router = express.Router();
const db = require("../database/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");

//=======================================MIDDLEWARE CODE=======================================
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

//=======================================MULTER MIDDLEWARE CODE=======================================
// Configure multer to store files in memory as Buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        ),
        false
      );
    }
  },
});
//============================================================================================

//============================== GET USER PROFILE ==============================
// Get current user's profile (protected)
router.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT userID, username, user_email, user_type, created_at 
    FROM users 
    WHERE userID = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: results[0] });
  });
});

//============================== GET A USERS PROFILE PHOTO ==============================
router.get("/profile-photo/:userId", authenticateToken, (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT user_photo FROM users WHERE userID = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching photo:", err);
      return res.status(500).json({
        message: "Error fetching profile photo - is database connected?",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // Check if user has a profile photo
    if (!user.user_photo) {
      return res
        .status(404)
        .json({ message: "No profile photo found for this user" });
    }

    // Send image - browser will detect type from image data
    res.set("Content-Type", "image/jpeg"); // Default, works for most images
    res.send(user.user_photo);
  });
});

//============================== GET OWN PROFILE PHOTO ==============================
router.get("/my-profile-photo", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT user_photo FROM users WHERE userID = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching photo:", err);
      return res.status(500).json({ message: "Error fetching profile photo" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    if (!user.user_photo) {
      return res
        .status(404)
        .json({ message: "You haven't uploaded a profile photo yet" });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(user.user_photo);
  });
});

//============================== LOGIN ROUTE =================================
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

//============================== REGISTER ROUTE ==============================
router.post("/register", authenticateToken, (req, res) => {
  const { username, user_email, user_password, user_type } = req.body;
  const adminUserType = req.user.userType; // From JWT token

  if (adminUserType !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }

  // Validate required fields
  if (!username || !user_email || !user_password) {
    return res.status(400).json({
      message: "Username, email, and password are required.",
    });
  }

  const checkSql = "SELECT * FROM users WHERE user_email = ? OR username = ?";
  const insertSql =
    "INSERT INTO users (username, user_email, user_password, user_type) VALUES (?, ?, ?, ?)";

  db.query(checkSql, [user_email, username], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Server error - is the database connected?" });
    }
    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.user_email === user_email) {
        return res.status(409).json({ message: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already taken" });
      }
    }
  });

  db.query(
    insertSql,
    [username, user_email, user_password, user_type],
    (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res
          .status(500)
          .json({ message: "Error creating user - likley SQL error" });
      }

      // User created successfully
      res.status(201).json({
        message: "User created successfully!",
        userId: result.insertId,
      });
    }
  );
});

//============================== UPLOAD PROFILE PHOTO ==============================
router.post(
  "/profile-photo",
  authenticateToken,
  upload.single("photo"),
  (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.userId; // From JWT token
    const photoBuffer = req.file.buffer; // Image as binary data

    const sql = `
    UPDATE users 
    SET user_photo = ? 
    WHERE userID = ?
  `;

    db.query(sql, [photoBuffer, userId], (err, result) => {
      if (err) {
        console.error("Error saving photo:", err);
        return res.status(500).json({ message: "Error saving profile photo" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile photo uploaded successfully",
        photoSize: req.file.size,
      });
    });
  }
);

//============================== CHANGE PASSWORD ROUTE ==============================
router.post("/change-password", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Both current password and new password are required",
    });
  }

  const verifySql = "SELECT user_password FROM users WHERE userID = ?";
  const updateSql = "UPDATE users SET user_password = ? WHERE userID = ?";

  db.query(verifySql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Database error occurred",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (results[0].user_password !== oldPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Password verified, now update it
    db.query(updateSql, [newPassword, userId], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Error updating password" });
      }
      res.json({ message: "Password changed successfully" });
    });
  });
});

//============================== EDIT USER ROUTE ==============================
// Update user profile
router.put("/profile", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { username, user_email } = req.body;

  // Validate at least one field is provided
  if (!username && !user_email) {
    return res.status(400).json({
      message: "Provide at least one field to update (username or email)",
    });
  }

  // Build dynamic SQL query based on provided fields
  let updateFields = [];
  let values = [];

  if (username) {
    updateFields.push("username = ?");
    values.push(username);
  }

  if (user_email) {
    updateFields.push("user_email = ?");
    values.push(user_email);
  }

  values.push(userId); // For WHERE clause

  const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE userID = ?`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating user:", err);

      // Check if it's a duplicate entry error
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Username or email already taken",
        });
      }

      return res.status(500).json({ message: "Error updating profile" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      updated: { username, user_email },
    });
  });
});

//============================== DELETE USER ROUTE ==============================
// Delete user account (protected)
router.delete("/account", authenticateToken, (req, res) => {
  const userId = req.user.userId; // From JWT token
  const { password } = req.body; // Require password confirmation

  // Validate password provided
  if (!password) {
    return res.status(400).json({
      message: "Password confirmation required to delete account",
    });
  }

  // Verify password before deleting
  const verifySql = "SELECT user_password FROM users WHERE userID = ?";

  db.query(verifySql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    if (results[0].user_password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Delete the user
    const deleteSql = "DELETE FROM users WHERE userID = ?";

    db.query(deleteSql, [userId], (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Error deleting account" });
      }

      res.json({
        message: "Account deleted successfully",
        deletedUserId: userId,
      });
    });
  });
});

//============================== ADMIN: DELETE ANY USER ==============================
// Admin route to delete any user
router.delete("/admin/user/:userId", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType; // From JWT token
  const targetUserId = req.params.userId;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  // Delete the specified user
  const sql = "DELETE FROM users WHERE userID = ?";

  db.query(sql, [targetUserId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res
        .status(500)
        .json({ message: "Error deleting user - is database connected?" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUserId: targetUserId,
    });
  });
});

//============================== DELETE PROFILE PHOTO ==============================
router.delete("/profile-photo", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `UPDATE users SET user_photo = NULL WHERE userID = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting photo:", err);
      return res.status(500).json({
        message: "Error deleting profile photo - is database connected?",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile photo deleted successfully" });
  });
});

//============================== ADMIN: DELETE ANY USER'S PHOTO ==============================
router.delete("/admin/profile-photo/:userId", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;
  const targetUserId = req.params.userId;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  const sql = `UPDATE users SET user_photo = NULL WHERE userID = ?`;

  db.query(sql, [targetUserId], (err, result) => {
    if (err) {
      console.error("Error deleting photo:", err);
      return res.status(500).json({
        message: "Error deleting profile photo - is database connected?",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User's profile photo deleted successfully",
      deletedForUserId: targetUserId,
    });
  });
});
module.exports = router;
