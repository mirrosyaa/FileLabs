const express = require("express");
const router = express.Router();
const db = require("../database/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { encryptEmail, decryptEmail } = require("../utils/encryption");

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

    const user = results[0];

    // Decrypt email before sending to frontend
    try {
      user.user_email = decryptEmail(user.user_email);
    } catch (error) {
      console.error("Error decrypting email:", error);
      return res.status(500).json({ message: "Error retrieving user data" });
    }

    res.json({ user: user });
  });
});

//============================== ADMIN: GET ALL USERS ==============================
router.get("/admin/users", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  const sql = `
    SELECT userID, username, user_email, user_type, created_at 
    FROM users 
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // Decrypt all emails before sending to frontend
    const usersWithDecryptedEmails = results.map((user) => {
      try {
        return {
          ...user,
          user_email: decryptEmail(user.user_email),
        };
      } catch (error) {
        console.error(`Error decrypting email for user ${user.userID}:`, error);
        return {
          ...user,
          user_email: "Error decrypting email",
        };
      }
    });

    res.json({ users: usersWithDecryptedEmails });
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
router.post("/login", async (req, res) => {
  const { user_email, user_password } = req.body;

  // Check if both fields are provided
  if (!user_email || !user_password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Try to find user by username first (since username is not encrypted)
    // If not found, we'll need to check all users and decrypt their emails
    const usernameSql = "SELECT * FROM users WHERE username = ?";
    const allUsersSql = "SELECT * FROM users";

    // First, try to find by username (in case user entered username instead of email)
    db.query(usernameSql, [user_email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      let user = null;

      // If found by username
      if (results.length > 0) {
        user = results[0];
      } else {
        // Not found by username, search by decrypting all emails
        const allUsersResults = await new Promise((resolve, reject) => {
          db.query(allUsersSql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        // Decrypt and compare emails
        for (const dbUser of allUsersResults) {
          try {
            const decryptedEmail = decryptEmail(dbUser.user_email);
            if (decryptedEmail.toLowerCase() === user_email.toLowerCase()) {
              user = dbUser;
              break;
            }
          } catch (decryptError) {
            // Skip users with invalid encrypted emails
            continue;
          }
        }
      }

      // If no matching user found
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(
        user_password,
        user.user_password
      );

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Decrypt email for JWT token
      const decryptedEmail = decryptEmail(user.user_email);

      // Create JWT token with user data
      const token = jwt.sign(
        {
          userId: user.userID,
          email: decryptedEmail,
          username: user.username,
          userType: user.user_type,
        },
        JWT_SECRET,
        { expiresIn: "4h" }
      );

      // Send token to frontend
      res.json({
        message: "Login successful!",
        token: token,
        user: {
          id: user.userID,
          email: decryptedEmail,
          username: user.username,
          created_at: user.created_at,
          userType: user.user_type,
        },
      });
    });
  } catch (error) {
    console.error("Encryption error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//============================== REGISTER ROUTE ==============================
router.post("/register", authenticateToken, async (req, res) => {
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

  try {
    // Encrypt email and hash password
    const encryptedEmail = encryptEmail(user_email);
    const hashedPassword = await bcrypt.hash(user_password, 10);

    const checkSql = "SELECT * FROM users WHERE user_email = ? OR username = ?";

    db.query(checkSql, [encryptedEmail, username], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Server error - is the database connected?" });
      }

      if (results.length > 0) {
        const existingUser = results[0];
        if (existingUser.user_email === encryptedEmail) {
          return res.status(409).json({ message: "Email already registered" });
        }
        if (existingUser.username === username) {
          return res.status(409).json({ message: "Username already taken" });
        }
      }

      const insertSql =
        "INSERT INTO users (username, user_email, user_password, user_type, created_at) VALUES (?, ?, ?, ?, NOW())";

      db.query(
        insertSql,
        [username, encryptedEmail, hashedPassword, user_type || "user"],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res
              .status(500)
              .json({ message: "Error creating user - likely SQL error" });
          }

          // User created successfully
          res.status(201).json({
            message: "User created successfully!",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    console.error("Encryption/Hashing error:", error);
    return res.status(500).json({ message: "Server error" });
  }
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
router.post("/change-password", authenticateToken, async (req, res) => {
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

  db.query(verifySql, [userId], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Database error occurred",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      // Compare old password with hashed password
      const passwordMatch = await bcrypt.compare(
        oldPassword,
        results[0].user_password
      );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Password verified, now update it
      db.query(updateSql, [hashedNewPassword, userId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Error updating password" });
        }
        res.json({ message: "Password changed successfully" });
      });
    } catch (error) {
      console.error("Hashing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
});

//============================== EDIT USER ROUTE ==============================
// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, user_email } = req.body;

  // Validate at least one field is provided
  if (!username && !user_email) {
    return res.status(400).json({
      message: "Provide at least one field to update (username or email)",
    });
  }

  try {
    // Build dynamic SQL query based on provided fields
    let updateFields = [];
    let values = [];

    if (username) {
      updateFields.push("username = ?");
      values.push(username);
    }

    if (user_email) {
      const encryptedEmail = encryptEmail(user_email);
      updateFields.push("user_email = ?");
      values.push(encryptedEmail);
    }

    values.push(userId); // For WHERE clause

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE userID = ?`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating user:", err);

        // Check if it's a duplicate entry error
        if (err.code === "ER_DUP_ENTRY") {
          // Check which field caused the duplicate
          const errorMessage = err.message || "";

          if (errorMessage.includes("username")) {
            return res.status(409).json({
              message: "Username already taken",
            });
          } else if (errorMessage.includes("user_email")) {
            return res.status(409).json({
              message: "Email already registered",
            });
          } else {
            return res.status(409).json({
              message: "Username or email already taken",
            });
          }
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
  } catch (error) {
    console.error("Encryption error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//============================== DELETE USER ROUTE ==============================
// Delete user account (protected)
router.delete("/account", authenticateToken, async (req, res) => {
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

  db.query(verifySql, [userId], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(
        password,
        results[0].user_password
      );

      if (!passwordMatch) {
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
    } catch (error) {
      console.error("Hashing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
});

//============================== ADMIN: DELETE ANY USER ==============================
// Admin route to delete any user
router.delete("/admin/user/:userId", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;
  const adminUserId = req.user.userId;
  const targetUserId = req.params.userId;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  // Prevent admin from deleting themselves
  if (parseInt(targetUserId) === adminUserId) {
    return res.status(403).json({
      message: "You cannot delete your own account.",
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

//============================== ADMIN: UPDATE USER TYPE ==============================
router.put("/admin/user/:userId/type", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;
  const adminUserId = req.user.userId;
  const targetUserId = req.params.userId;
  const { user_type } = req.body;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  // Prevent admin from changing their own user type
  if (parseInt(targetUserId) === adminUserId) {
    return res.status(403).json({
      message: "You cannot change your own user type.",
    });
  }

  // Validate user_type
  if (!user_type || (user_type !== "admin" && user_type !== "user")) {
    return res.status(400).json({
      message: "Invalid user type. Must be 'admin' or 'user'.",
    });
  }

  // Update user type
  const sql = "UPDATE users SET user_type = ? WHERE userID = ?";

  db.query(sql, [user_type, targetUserId], (err, result) => {
    if (err) {
      console.error("Error updating user type:", err);
      return res.status(500).json({
        message: "Error updating user type - is database connected?",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User type updated successfully",
      userId: targetUserId,
      newUserType: user_type,
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
