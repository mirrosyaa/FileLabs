const express = require("express");
const cors = require("cors");
const axios = require("axios");
const usersRoutes = require("./routes/users");
const convertRoutes = require("./routes/convert");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Routes
app.use("/users", usersRoutes);
app.use("/api", convertRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
