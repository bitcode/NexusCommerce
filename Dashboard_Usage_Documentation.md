# Shopify API Monitor Dashboard Documentation

## Overview

The Shopify API Monitor Dashboard provides a visual interface for monitoring your Shopify API usage, rate limits, and notifications. This document explains how to use the dashboard and understand its various components.

## Current Implementation Status

The dashboard is currently implemented as a framework-agnostic HTML/CSS interface with the following features:

- **API Status Monitoring**: Real-time display of API rate limit usage
- **Usage Analytics**: Summary of API requests, costs, and throttling events
- **Notifications**: System alerts for rate limit warnings and other events
- **Plan Configuration**: Interface to update your Shopify plan settings

The implementation follows the architecture outlined in the Front-End and Developer Integration Enhancement Plan, with the dashboard components defined in `shopify-api-monitor/src/dashboard/DashboardComponents.ts`.

## Running the Dashboard

To run the dashboard, follow the instructions in the `Dashboard_Implementation_Plan.md` document, which provides a step-by-step guide to:

1. Install required dependencies
2. Create a dashboard server implementation
3. Configure your Shopify store credentials
4. Start the server and view the dashboard in a browser

## Dashboard Components

### API Status Section

![API Status Section](https://example.com/api-status-section.png)

This section displays:
- Current API usage as a percentage gauge
- Available points remaining
- Restore rate (points per second)

The gauge changes color based on usage:
- Green: Normal usage (< 70%)
- Orange: Warning level (70-90%)
- Red: Critical level (> 90%)

### Analytics Section

![Analytics Section](https://example.com/analytics-section.png)

This section provides:
- Summary cards with key metrics (requests today, throttled requests, average cost)
- A chart showing usage patterns over time (to be implemented with a charting library)
- Recent API requests table showing time, operation, cost, and status

### Notifications Section

![Notifications Section](https://example.com/notifications-section.png)

This section shows:
- Recent system notifications color-coded by type (info, warning, error, success)
- Timestamp and message for each notification
- Options to dismiss individual notifications or all at once

### Plan Configuration Section

![Plan Configuration Section](https://example.com/plan-config-section.png)

This section allows:
- Viewing your current Shopify plan
- Selecting a different plan from available options
- Updating your plan configuration

## Interacting with the Dashboard

### Updating Your Plan

1. Select your desired plan from the dropdown menu
2. Click the "Update Plan" button
3. The dashboard will refresh to reflect the new rate limits

### Managing Notifications

1. To dismiss a single notification, click the "✕" button on that notification
2. To dismiss all notifications, click the "Dismiss All" button at the bottom of the notifications section

### Refreshing Data

Currently, you need to refresh the page to update the dashboard data. Future implementations will include:
- Automatic polling for updates
- Manual refresh button
- Real-time updates via WebSockets

## Integration with React

As outlined in the Front-End and Developer Integration Enhancement Plan, future versions will include:

- React-specific hooks for data fetching
- React components that implement the dashboard interfaces
- Example React application demonstrating integration

## Customization

The current dashboard implementation uses basic CSS for styling. You can customize the appearance by:

1. Modifying the CSS in the `renderBasicDashboardHTML` function in `DashboardComponents.ts`
2. Implementing your own renderer using the provided interfaces
3. Integrating with a UI framework like React, Vue, or Angular

## Troubleshooting

### Dashboard Shows No Data

If the dashboard doesn't display any data:
- Verify your Shopify credentials are correct
- Check that you've made some API requests to generate data
- Look for error messages in the browser console or server logs

### Rate Limit Gauge Not Updating

If the rate limit gauge doesn't update:
- Ensure your API client is properly configured
- Verify that the API requests are being tracked by the analytics module
- Check that the throttle status is being correctly passed to the dashboard

### Notifications Not Appearing

If notifications aren't showing up:
- Check that the notification system is properly configured
- Verify that events that should trigger notifications are occurring
- Ensure the notifications are being passed to the dashboard renderer

## Next Steps in Dashboard Development

According to the Implementation Priorities and Roadmap, the following enhancements are planned:

1. **Phase 2: React Integration**
   - Implement React hooks and components for the dashboard
   - Create a more interactive and responsive UI

2. **Phase 3: Framework-Agnostic Enhancements**
   - Improve the core API for better developer experience
   - Create adapters for other frameworks

3. **Phase 4: Developer Tools**
   - Add a DevConsole for debugging
   - Implement a SchemaExplorer for metadata
   - Create an OperationBuilder for generating queries

4. **Phase 5: Documentation and Examples**
   - Comprehensive API documentation
   - Example applications for common use cases
   - Interactive tutorials

## Resources

- [Shopify API Documentation](https://shopify.dev/api)
- [Rate Limits Documentation](https://shopify.dev/api/usage/rate-limits)
- [GraphQL Cost Explorer](https://shopify.dev/api/usage/cost-explorer)