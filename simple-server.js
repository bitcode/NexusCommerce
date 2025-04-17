const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log endpoint
app.post('/api/log', (req, res) => {
  const { type, message, details } = req.body;
  
  // Format the log message
  const timestamp = new Date().toISOString();
  
  // Log to terminal
  console.log(`[${timestamp}] [${type}] ${message}`);
  if (details) {
    console.log('Details:', details);
  }
  
  res.status(200).json({ success: true });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is working' });
});

// Home page
app.get('/', (req, res) => {
  res.send('Logging server is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Navigation events will be logged here in the terminal');
});