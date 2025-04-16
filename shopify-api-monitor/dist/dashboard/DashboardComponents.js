"use strict";
/**
 * DashboardComponents.ts
 * UI components for displaying API usage analytics and notifications in the admin dashboard.
 * These are framework-agnostic interfaces that can be implemented in React, Vue, or other UI frameworks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBasicDashboardHTML = renderBasicDashboardHTML;
/**
 * Example implementation of how to render the dashboard in HTML/CSS
 * This is a simple template that can be adapted to any framework
 */
function renderBasicDashboardHTML(props) {
    const { apiStatus, analytics, notifications, planConfig } = props;
    // Helper to determine color based on usage percentage
    const getStatusColor = (percentage) => {
        if (percentage >= 90)
            return 'red';
        if (percentage >= 70)
            return 'orange';
        return 'green';
    };
    // Helper to format notification type as CSS class
    const getNotificationClass = (type) => {
        switch (type) {
            case 'error': return 'notification-error';
            case 'warning': return 'notification-warning';
            case 'success': return 'notification-success';
            default: return 'notification-info';
        }
    };
    return `
    <div class="api-monitor-dashboard">
      <header class="dashboard-header">
        <h1>Shopify API Usage Monitor</h1>
        <div class="plan-badge">Plan: ${planConfig.currentPlan.toUpperCase()}</div>
      </header>
      
      <section class="status-section">
        <h2>Current API Status</h2>
        <div class="rate-limit-gauge" style="--percentage: ${apiStatus.usagePercentage}%; --color: ${getStatusColor(apiStatus.usagePercentage)}">
          <div class="gauge-fill"></div>
          <div class="gauge-label">${apiStatus.usagePercentage.toFixed(1)}% Used</div>
        </div>
        <div class="status-details">
          ${apiStatus.currentStatus ? `
            <div>Available Points: ${apiStatus.currentStatus.currentlyAvailable} / ${apiStatus.currentStatus.maximumAvailable}</div>
            <div>Restore Rate: ${apiStatus.currentStatus.restoreRate} points/second</div>
          ` : 'No API status data available'}
        </div>
      </section>
      
      <section class="analytics-section">
        <h2>Usage Analytics</h2>
        <div class="analytics-summary">
          <div class="summary-card">
            <h3>Requests Today</h3>
            <div class="summary-value">${analytics.dailyUsage.reduce((sum, day) => sum + day.count, 0)}</div>
          </div>
          <div class="summary-card">
            <h3>Throttled Requests</h3>
            <div class="summary-value">${analytics.throttledRequests}</div>
          </div>
          <div class="summary-card">
            <h3>Avg. Cost/Request</h3>
            <div class="summary-value">${analytics.averageCostPerRequest.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="usage-chart">
          <!-- Chart would be rendered here using a charting library -->
          <div class="chart-placeholder">Usage Chart (Implement with Chart.js, D3.js, etc.)</div>
        </div>
        
        <div class="recent-requests">
          <h3>Recent API Requests</h3>
          <table class="requests-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Operation</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${analytics.recentRecords.slice(0, 5).map(record => `
                <tr class="${record.throttled ? 'throttled-row' : ''}">
                  <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
                  <td>${record.operation || 'Unknown'}</td>
                  <td>${record.actualQueryCost}</td>
                  <td>${record.success ? 'Success' : 'Failed'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
      
      <section class="notifications-section">
        <h2>Notifications</h2>
        <div class="notifications-list">
          ${notifications.length > 0 ? notifications.slice(0, 5).map(notification => `
            <div class="notification-item ${getNotificationClass(notification.type)}">
              <div class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</div>
              <div class="notification-message">${notification.message}</div>
              <button class="dismiss-button" data-id="${notification.id}">✕</button>
            </div>
          `).join('') : '<div class="no-notifications">No notifications</div>'}
        </div>
        ${notifications.length > 0 ? '<button class="dismiss-all-button">Dismiss All</button>' : ''}
      </section>
      
      <section class="plan-config-section">
        <h2>Plan Configuration</h2>
        <div class="plan-selector">
          <label for="plan-select">Shopify Plan:</label>
          <select id="plan-select">
            ${Object.keys(planConfig.availablePlans).map(plan => `
              <option value="${plan}" ${plan === planConfig.currentPlan ? 'selected' : ''}>
                ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${planConfig.availablePlans[plan].pointsPerSecond} points/sec)
              </option>
            `).join('')}
          </select>
          <button class="update-plan-button">Update Plan</button>
        </div>
      </section>
    </div>
    
    <style>
      .api-monitor-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .plan-badge {
        background-color: #5c6ac4;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
      }
      
      section {
        margin-bottom: 30px;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      h2 {
        margin-top: 0;
        color: #212b36;
      }
      
      .rate-limit-gauge {
        height: 20px;
        background-color: #e6e6e6;
        border-radius: 10px;
        margin: 15px 0;
        position: relative;
        overflow: hidden;
      }
      
      .gauge-fill {
        height: 100%;
        width: var(--percentage, 0%);
        background-color: var(--color, green);
        border-radius: 10px;
        transition: width 0.5s ease;
      }
      
      .gauge-label {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        line-height: 20px;
        color: #fff;
        font-weight: bold;
        text-shadow: 0 0 2px rgba(0,0,0,0.5);
      }
      
      .analytics-summary {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      
      .summary-card {
        flex: 1;
        padding: 15px;
        margin: 0 10px;
        background-color: #f9fafb;
        border-radius: 6px;
        text-align: center;
      }
      
      .summary-card h3 {
        margin-top: 0;
        font-size: 14px;
        color: #637381;
      }
      
      .summary-value {
        font-size: 24px;
        font-weight: bold;
        color: #212b36;
      }
      
      .chart-placeholder {
        height: 200px;
        background-color: #f4f6f8;
        border: 1px dashed #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #637381;
        margin-bottom: 20px;
      }
      
      .requests-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .requests-table th, .requests-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .requests-table th {
        background-color: #f4f6f8;
        font-weight: 500;
      }
      
      .throttled-row {
        background-color: #fff4f4;
      }
      
      .notification-item {
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        position: relative;
      }
      
      .notification-info {
        background-color: #f1f8ff;
        border-left: 4px solid #2c6ecb;
      }
      
      .notification-warning {
        background-color: #fff9e6;
        border-left: 4px solid #ffb400;
      }
      
      .notification-error {
        background-color: #fff4f4;
        border-left: 4px solid #de3618;
      }
      
      .notification-success {
        background-color: #f1f8f5;
        border-left: 4px solid #00a47c;
      }
      
      .notification-time {
        font-size: 12px;
        color: #637381;
        margin-right: 10px;
        min-width: 80px;
      }
      
      .notification-message {
        flex: 1;
      }
      
      .dismiss-button {
        background: none;
        border: none;
        cursor: pointer;
        color: #919eab;
        font-size: 16px;
      }
      
      .dismiss-button:hover {
        color: #637381;
      }
      
      .dismiss-all-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
      
      .no-notifications {
        padding: 20px;
        text-align: center;
        color: #637381;
        background-color: #f9fafb;
        border-radius: 4px;
      }
      
      .plan-selector {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      #plan-select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ddd;
      }
      
      .update-plan-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .update-plan-button:hover {
        background-color: #4959bd;
      }
    </style>
  `;
}
//# sourceMappingURL=DashboardComponents.js.map