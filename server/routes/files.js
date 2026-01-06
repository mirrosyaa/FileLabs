const express = require("express");
const router = express.Router();
const db = require("../database/db");
const jwt = require("jsonwebtoken");

//=======================================MIDDLEWARE CODE=======================================
// Secret key for JWT (In production, use environment variable!)
const JWT_SECRET = "hello123456789";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
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
    next();
  });
};

//============================== GET ALL USER'S FILES ==============================
// Get all files for the authenticated user
router.get("/my-files", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT id, user_id, filename, file_path, file_type, created_at, starred 
    FROM files 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching files" });
    }

    res.json({
      files: results,
      count: results.length,
    });
  });
});

//============================== GET STARRED FILES ==============================
// Get all starred files for the authenticated user
router.get("/starred", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT id, user_id, filename, file_path, file_type, created_at, starred 
    FROM files 
    WHERE user_id = ? AND starred = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching starred files" });
    }

    res.json({
      files: results,
      count: results.length,
    });
  });
});

//============================== GET SINGLE FILE ==============================
// Get a specific file by ID (user can only access their own files)
router.get("/file/:fileId", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const fileId = req.params.fileId;

  const sql = `
    SELECT id, user_id, filename, file_path, file_type, created_at, starred 
    FROM files 
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [fileId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching file" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ file: results[0] });
  });
});

//============================== ADD NEW FILE ==============================
// Add a new file record
router.post("/upload", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { filename, file_path, file_type } = req.body;

  // Validate required fields
  if (!filename || !file_path || !file_type) {
    return res.status(400).json({
      message: "Filename, file path, and file type are required",
    });
  }

  const sql = `
    INSERT INTO files (user_id, filename, file_path, file_type, created_at, starred)
    VALUES (?, ?, ?, ?, NOW(), 0)
  `;

  db.query(sql, [userId, filename, file_path, file_type], (err, result) => {
    if (err) {
      console.error("Error inserting file:", err);
      return res.status(500).json({ message: "Error adding file record" });
    }

    res.status(201).json({
      message: "File record created successfully",
      fileId: result.insertId,
      file: {
        id: result.insertId,
        user_id: userId,
        filename,
        file_path,
        file_type,
        starred: 0,
      },
    });
  });
});

//============================== TOGGLE STAR FILE ==============================
// Toggle starred status for a file
router.put("/star/:fileId", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const fileId = req.params.fileId;

  // First check if file exists and belongs to user
  const checkSql = "SELECT starred FROM files WHERE id = ? AND user_id = ?";

  db.query(checkSql, [fileId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error checking file" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    // Toggle the starred status
    const currentStarred = results[0].starred;
    const newStarred = currentStarred === 1 ? 0 : 1;

    const updateSql =
      "UPDATE files SET starred = ? WHERE id = ? AND user_id = ?";

    db.query(updateSql, [newStarred, fileId, userId], (err, result) => {
      if (err) {
        console.error("Error updating file:", err);
        return res.status(500).json({ message: "Error updating file" });
      }

      res.json({
        message: newStarred === 1 ? "File starred" : "File unstarred",
        fileId: fileId,
        starred: newStarred,
      });
    });
  });
});

//============================== DELETE FILE ==============================
// Delete a file record (user can only delete their own files)
router.delete("/file/:fileId", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const fileId = req.params.fileId;

  const sql = "DELETE FROM files WHERE id = ? AND user_id = ?";

  db.query(sql, [fileId, userId], (err, result) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ message: "Error deleting file" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      message: "File deleted successfully",
      deletedFileId: fileId,
    });
  });
});

//============================== ADMIN: GET ALL FILES ==============================
// Admin route to get all files in the system
router.get("/admin/all-files", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  const sql = `
    SELECT f.id, f.user_id, f.filename, f.file_path, f.file_type, f.created_at, f.starred, u.username
    FROM files f
    JOIN users u ON f.user_id = u.userID
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching files" });
    }

    res.json({
      files: results,
      count: results.length,
    });
  });
});

//============================== ADMIN: DELETE ANY FILE ==============================
// Admin route to delete any file
router.delete("/admin/file/:fileId", authenticateToken, (req, res) => {
  const adminUserType = req.user.userType;
  const fileId = req.params.fileId;

  // Check if user is admin
  if (adminUserType !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  const sql = "DELETE FROM files WHERE id = ?";

  db.query(sql, [fileId], (err, result) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ message: "Error deleting file" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      message: "File deleted successfully",
      deletedFileId: fileId,
    });
  });
});

module.exports = router;
