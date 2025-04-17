const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app's build directory if it exists
try {
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));
  console.log(`Serving static files from: ${buildPath}`);
} catch (error) {
  console.warn('Build directory not found, skipping static file serving');
}

// Log endpoint
app.post('/api/log', (req, res) => {
  const { type, message, details } = req.body;
  
  // Format the log message
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${type.toUpperCase()}]`;
  
  // Log to terminal with different colors based on type
  switch (type.toLowerCase()) {
    case 'error':
      console.error(`\x1b[31m${logPrefix} ${message}\x1b[0m`); // Red
      if (details) console.error('\x1b[31mDetails:', details, '\x1b[0m');
      break;
    case 'warning':
      console.warn(`\x1b[33m${logPrefix} ${message}\x1b[0m`); // Yellow
      if (details) console.warn('\x1b[33mDetails:', details, '\x1b[0m');
      break;
    case 'navigation':
      console.log(`\x1b[36m${logPrefix} ${message}\x1b[0m`); // Cyan
      if (details) console.log('\x1b[36mDetails:', details, '\x1b[0m');
      break;
    case 'click':
      console.log(`\x1b[35m${logPrefix} ${message}\x1b[0m`); // Magenta
      if (details) console.log('\x1b[35mDetails:', details, '\x1b[0m');
      break;
    default:
      console.log(`\x1b[32m${logPrefix} ${message}\x1b[0m`); // Green
      if (details) console.log('\x1b[32mDetails:', details, '\x1b[0m');
  }
  
  res.status(200).json({ success: true });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('\x1b[32m[TEST] API test endpoint called\x1b[0m');
  res.json({ message: 'API is working' });
});

// Catch-all handler for any other requests
app.get('*', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Nexus Commerce Logging Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .info { background: #f0f0f0; padding: 15px; border-radius: 5px; }
          .code { background: #333; color: #fff; padding: 10px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Nexus Commerce Logging Server</h1>
        <div class="info">
          <p>This server is running and ready to receive logs from the React application.</p>
          <p>The React app should be running separately on port 3000.</p>
          <p>All navigation events and button clicks will be logged to the terminal where this server is running.</p>
        </div>
        <h2>API Endpoints:</h2>
        <ul>
          <li><code>/api/log</code> - POST endpoint for receiving logs</li>
          <li><code>/api/test</code> - GET endpoint for testing the API</li>
        </ul>
        <h2>Test the API:</h2>
        <div class="code">
          curl http://localhost:3001/api/test
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`\x1b[42m\x1b[30m Server running on port ${PORT} \x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', 'Navigation events will be logged here in the terminal');
  console.log('\x1b[35m%s\x1b[0m', 'Button clicks will be logged here in the terminal');
  console.log('\x1b[33m%s\x1b[0m', 'Warnings will be logged here in the terminal');
  console.log('\x1b[31m%s\x1b[0m', 'Errors will be logged here in the terminal');
});