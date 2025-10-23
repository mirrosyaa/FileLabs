// Import Express
const express = require('express');
const cors = require('cors');

// Create an Express app
const app = express();

// Middleware
app.use(cors()); // allows frontend requests
app.use(express.json()); // allows JSON body parsing

// Define a simple route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
