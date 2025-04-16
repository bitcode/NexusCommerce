# Dashboard Implementation Plan

## Overview

This document outlines the steps to create and run a local development server for the Shopify API Monitor dashboard. The dashboard will display real-time API usage data from your Shopify store.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Shopify store credentials (shop URL and access token)
- Basic knowledge of TypeScript and Express

## Implementation Steps

### 1. Install Required Dependencies

First, we need to add Express and related packages to serve the dashboard:

```bash
cd shopify-api-monitor
npm install express cors body-parser express-session
npm install --save-dev @types/express @types/cors @types/body-parser @types/express-session
```

### 2. Create Dashboard Server File

Create a new file `examples/dashboard-server.ts` with the following content:

```typescript
/**
 * Dashboard Server Example
 * 
 * This example creates a simple Express server that renders the Shopify API Monitor dashboard
 * and connects it to your actual Shopify store data.
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { createShopifyMonitor } from '../src';
import { renderBasicDashboardHTML } from '../src/dashboard/DashboardComponents';

// Replace with your actual Shopify store credentials
const SHOP = 'your-store.myshopify.com';
const ACCESS_TOKEN = 'your-admin-api-access-token';
const SHOPIFY_PLAN = 'standard'; // or 'advanced', 'plus', 'enterprise'

// Create the Shopify monitor instance
const monitor = createShopifyMonitor({
  shop: SHOP,
  accessToken: ACCESS_TOKEN,
  plan: SHOPIFY_PLAN,
  
  // Optional analytics configuration
  analytics: {
    maxHistoryLength: 1000,
    persistData: true,
  },
  
  // Optional notification configuration
  notifications: {
    maxNotifications: 100,
    onNewNotification: (notification) => {
      console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
    },
  },
});

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Dashboard route
app.get('/', async (req, res) => {
  try {
    // Generate some API activity to have data to display
    await generateSampleApiActivity();
    
    // Get current API status and analytics
    const summary = monitor.analytics.getSummary();
    const status = summary.currentStatus;
    
    // Get notifications
    const notifications = monitor.notifications.getAll();
    
    // Get plan configuration
    const currentPlan = monitor.planConfig.getCurrentPlan();
    const availablePlans = monitor.planConfig.getAvailablePlans();
    
    // Render dashboard HTML
    const dashboardHtml = renderBasicDashboardHTML({
      apiStatus: {
        currentStatus: status,
        usagePercentage: summary.usagePercentage,
      },
      analytics: summary,
      notifications: notifications,
      planConfig: {
        currentPlan: currentPlan,
        availablePlans: availablePlans,
      },
      onPlanChange: (plan) => {
        monitor.planConfig.updatePlan(plan);
      },
      onDismissNotification: (id) => {
        monitor.notifications.dismiss(id);
      },
      onDismissAllNotifications: () => {
        monitor.notifications.dismissAll();
      },
      onRefresh: () => {
        // This would be handled by client-side JavaScript
      },
    });
    
    // Send the HTML response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopify API Monitor Dashboard</title>
      </head>
      <body>
        ${dashboardHtml}
        
        <script>
          // Simple client-side JavaScript to handle interactions
          document.addEventListener('DOMContentLoaded', () => {
            // Handle plan update
            const planSelect = document.getElementById('plan-select');
            const updatePlanButton = document.querySelector('.update-plan-button');
            
            if (updatePlanButton) {
              updatePlanButton.addEventListener('click', async () => {
                const selectedPlan = planSelect.value;
                try {
                  await fetch('/update-plan', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ plan: selectedPlan }),
                  });
                  // Reload the page to reflect changes
                  window.location.reload();
                } catch (error) {
                  console.error('Error updating plan:', error);
                }
              });
            }
            
            // Handle notification dismissal
            const dismissButtons = document.querySelectorAll('.dismiss-button');
            dismissButtons.forEach(button => {
              button.addEventListener('click', async () => {
                const notificationId = button.getAttribute('data-id');
                try {
                  await fetch('/dismiss-notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: notificationId }),
                  });
                  // Remove the notification from the DOM
                  button.closest('.notification-item').remove();
                } catch (error) {
                  console.error('Error dismissing notification:', error);
                }
              });
            });
            
            // Handle dismiss all notifications
            const dismissAllButton = document.querySelector('.dismiss-all-button');
            if (dismissAllButton) {
              dismissAllButton.addEventListener('click', async () => {
                try {
                  await fetch('/dismiss-all-notifications', {
                    method: 'POST',
                  });
                  // Remove all notifications from the DOM
                  document.querySelectorAll('.notification-item').forEach(item => {
                    item.remove();
                  });
                  // Show "no notifications" message
                  const notificationsList = document.querySelector('.notifications-list');
                  notificationsList.innerHTML = '<div class="no-notifications">No notifications</div>';
                  // Hide the dismiss all button
                  dismissAllButton.style.display = 'none';
                } catch (error) {
                  console.error('Error dismissing all notifications:', error);
                }
              });
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// API routes for dashboard interactions
app.post('/update-plan', (req, res) => {
  try {
    const { plan } = req.body;
    monitor.planConfig.updatePlan(plan);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/dismiss-notification', (req, res) => {
  try {
    const { id } = req.body;
    monitor.notifications.dismiss(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/dismiss-all-notifications', (req, res) => {
  try {
    monitor.notifications.dismissAll();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate some API activity for demonstration
async function generateSampleApiActivity() {
  // Make a few API calls to generate data
  const queries = [
    // Simple product query
    `query { products(first: 5) { edges { node { id title } } } }`,
    
    // Order query
    `query { orders(first: 3) { edges { node { id name } } } }`,
    
    // Customer query
    `query { customers(first: 3) { edges { node { id email } } } }`,
  ];
  
  // Execute queries sequentially
  for (const query of queries) {
    try {
      await monitor.apiClient.request(query);
    } catch (error) {
      console.error(`Error executing sample query: ${error.message}`);
    }
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
  console.log(`Using Shopify store: ${SHOP}`);
  console.log(`Press Ctrl+C to stop the server`);
});
```

### 3. Add Start Script to package.json

Add a new script to the `package.json` file:

```json
"scripts": {
  "build": "tsc",
  "test": "jest",
  "lint": "eslint src --ext .ts",
  "prepare": "npm run build",
  "start": "ts-node src/index.ts",
  "dev": "ts-node-dev --respawn src/index.ts",
  "dashboard": "ts-node examples/dashboard-server.ts"
}
```

### 4. Run the Dashboard Server

To run the dashboard server:

```bash
cd shopify-api-monitor
npm run dashboard
```

Then open your browser and navigate to:
```
http://localhost:3000
```

## Customization Options

### Using Different Port

If port 3000 is already in use, you can modify the `PORT` constant in the `dashboard-server.ts` file.

### Styling the Dashboard

The dashboard uses basic CSS included in the `renderBasicDashboardHTML` function. You can customize the styles by modifying the CSS in the `DashboardComponents.ts` file.

### Adding More Features

You can extend the dashboard by:

1. Adding more API endpoints to the Express server
2. Enhancing the client-side JavaScript for more interactivity
3. Adding charts using a library like Chart.js or D3.js

## Troubleshooting

### API Authentication Issues

If you encounter authentication issues:
- Verify your Shopify store URL and access token
- Ensure your access token has the necessary permissions
- Check that your Shopify API version is compatible

### Dashboard Not Showing Data

If the dashboard doesn't show any data:
- Check the browser console for errors
- Verify that the sample API calls are executing successfully
- Check the server logs for any error messages

## Next Steps

After successfully running the dashboard, consider:

1. Implementing real-time updates using WebSockets
2. Adding more detailed analytics visualizations
3. Creating a more sophisticated UI with a framework like React
4. Adding user authentication for the dashboard

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Shopify API Documentation](https://shopify.dev/api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)