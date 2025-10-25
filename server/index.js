const express = require('express');
const cors = require('cors');
const axios = require('axios');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());               // enable CORS
app.use(express.json());       // parse JSON request bodies

// Routes
app.use('/users', usersRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
