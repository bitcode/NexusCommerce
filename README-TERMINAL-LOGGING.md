# Nexus Commerce Terminal Logging

This project has been enhanced with terminal logging capabilities to help diagnose navigation issues. Instead of logging to the browser console, all navigation events, button clicks, and errors are now logged directly to the terminal where the application is running.

## Setup Instructions

### 1. Install Server Dependencies

First, install the required dependencies for the server:

```bash
cd /home/bitv3/nexusCommerce
npm install express body-parser cors
```

### 2. Start the Simple Logging Server

Start the Express server that will handle the logging in a dedicated terminal:

```bash
cd /home/bitv3/nexusCommerce
node simple-server.js
```

You should see output like:
```
Server running on port 3001
Navigation events will be logged here in the terminal
```

**Important**: Keep this terminal open as all logs will be displayed here.

### 3. Launch the React Front End

The React application must be launched in a separate terminal from the logging server. Open a new terminal window and run:

```bash
cd /home/bitv3/nexusCommerce
npm start
```

This will start the React development server on port 3000. You should see output like:
```
Compiled successfully!

You can now view nexus-commerce in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.125:3000
```

Once the React application is running, open your browser to http://localhost:3000 to access the application. All navigation events and button clicks will now be logged to the terminal where the logging server is running (the first terminal).

### 4. Test the Logging Functionality

There are two ways to test the logging functionality:

#### Option 1: Using the HTML Test Page

Open the `test-logging.html` file in your browser. This page provides buttons to simulate different types of logs:

1. Navigation events
2. Button clicks
3. Warnings
4. Errors
5. Info messages

Each button click will send a log to the terminal where the server is running.

#### Option 2: Using the JavaScript Test Script

Run the JavaScript test script in a separate terminal:

```bash
cd /home/bitv3/nexusCommerce
node test-logging.js
```

This will send a test log to the server, which will then display it in the terminal.

## Complete Setup Summary

To fully set up and use the terminal logging system:

1. **Terminal 1 - Logging Server**:
   ```bash
   cd /home/bitv3/nexusCommerce
   npm install express body-parser cors
   node simple-server.js
   ```

2. **Terminal 2 - React Front End**:
   ```bash
   cd /home/bitv3/nexusCommerce
   npm start
   ```

3. **Browser**:
   - Open http://localhost:3000 to access the React application
   - All navigation events will be logged to Terminal 1

## Viewing Terminal Logs

All navigation events and button clicks will now be logged to the terminal where the server is running (Terminal 1). The logs include:

- The type of event (navigation, click, warning, error, info)
- The message
- Additional details (if provided)
- Timestamp

## Diagnosing Navigation Issues

The terminal logs will help diagnose navigation issues by showing:

1. When a navigation item is clicked
2. Whether the item has an onClick handler
3. Whether the onClick handler is being called
4. Any errors that occur during navigation
5. The complete flow from click to view change

## Understanding the Navigation Flow

The navigation flow in this application works as follows:

1. User clicks a navigation item in the Navigation component
2. Navigation component calls `handleItemClick`
3. `handleItemClick` calls the `onItemClick` prop provided by Layout
4. Layout's `onItemClick` handler calls the item's `onClick` function (if it exists)
5. The `onClick` function (defined in App.tsx) calls `changeView`
6. `changeView` updates the `activeView` state, which triggers a re-render

Each step in this flow is now logged to the terminal, making it easier to identify where the navigation chain might be breaking.

## Troubleshooting

If you don't see logs in the terminal:

1. Make sure the server is running in Terminal 1 (`node simple-server.js`)
2. Ensure the React app is running in Terminal 2 (`npm start`)
3. Verify that both terminals show the correct working directory (`/home/bitv3/nexusCommerce`)
4. Check that the React app is making requests to the correct server URL (http://localhost:3001/api/log)
5. Look for any errors in the browser console related to network requests
6. Try using the test HTML page to verify the server is working correctly

## Files Added

1. `simple-server.js` - A simple Express server that receives and displays logs
2. `test-logging.js` - A JavaScript script to test the logging functionality
3. `test-logging.html` - An HTML page with buttons to test different types of logs
4. `src/services/LoggingService.ts` - A service for the React app to send logs to the server