const db = require("./database/db");
const bcrypt = require("bcrypt");
const { encryptEmail } = require("./utils/encryption");

/**
 * Script to add test users to the database
 * Creates:
 * 1. Admin user
 * 2. Regular user
 *
 * Both passwords and emails will be automatically encrypted/hashed
 */

async function addTestUsers() {
  console.log("=".repeat(60));
  console.log("ADD TEST USERS SCRIPT");
  console.log("=".repeat(60));
  console.log("Creating admin and regular user accounts...\n");

  const testUsers = [
    {
      username: "admin",
      email: "admin@filelabs.com",
      password: "admin123",
      user_type: "admin",
    },
    {
      username: "testuser",
      email: "user@filelabs.com",
      password: "user123",
      user_type: "user",
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const user of testUsers) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`🔒 Hashed password for: ${user.username}`);

      // Encrypt email
      const encryptedEmail = encryptEmail(user.email);
      console.log(`🔐 Encrypted email for: ${user.username}`);

      // Check if user already exists
      const checkSql = "SELECT * FROM users WHERE username = ?";

      const exists = await new Promise((resolve, reject) => {
        db.query(checkSql, [user.username], (err, results) => {
          if (err) reject(err);
          else resolve(results.length > 0);
        });
      });

      if (exists) {
        console.log(`⚠️  User ${user.username} already exists, skipping\n`);
        continue;
      }

      // Insert user
      const insertSql = `
        INSERT INTO users (username, user_email, user_password, user_type, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `;

      const result = await new Promise((resolve, reject) => {
        db.query(
          insertSql,
          [user.username, encryptedEmail, hashedPassword, user.user_type],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      console.log(
        `✅ Successfully created ${user.user_type}: ${user.username}`
      );
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   User ID: ${result.insertId}\n`);

      successCount++;
    } catch (error) {
      console.error(`❌ Error creating user ${user.username}:`, error.message);
      errorCount++;
    }
  }

  console.log("=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully created: ${successCount} user(s)`);
  console.log(`❌ Failed: ${errorCount} user(s)`);
  console.log("=".repeat(60));

  if (successCount > 0) {
    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("=".repeat(60));
    console.log("Admin Account:");
    console.log("  Email: admin@filelabs.com");
    console.log("  Password: admin123");
    console.log("\nRegular User Account:");
    console.log("  Email: user@filelabs.com");
    console.log("  Password: user123");
    console.log("=".repeat(60));
  }

  // Close database connection
  db.end();
  process.exit(0);
}

// Run the script
addTestUsers();
