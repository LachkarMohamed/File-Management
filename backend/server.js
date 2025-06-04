// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Group = require('./models/Group');

require('dotenv').config(); // Load environment variables from .env

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests (e.g., React app on port 3000)
app.use(express.json()); // Parse JSON data sent in requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
  })




// Define Routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes (login, register)
app.use('/api/users', require('./routes/users')); // User management routes
app.use('/api/files', require('./routes/files')); // File management routes
app.use('/api/groups', require('./routes/groups'));
app.use('/api/folders', require('./routes/folders')); 

// Start the server
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));