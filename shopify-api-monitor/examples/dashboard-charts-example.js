/**
 * dashboard-charts-example.js
 * Example of using the DashboardCharts class to create interactive charts
 */

// This would be imported in a real application
// import { DashboardCharts } from '../src/dashboard/DashboardCharts';

// Mock data for charts
const usageData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  values: [120, 150, 180, 220, 270, 310, 350]
};

const distributionData = {
  labels: ['Products', 'Collections', 'Inventory', 'Content', 'Metaobjects'],
  values: [45, 20, 15, 12, 8],
  colors: ['#5c6ac4', '#47c1bf', '#f49342', '#50b83c', '#9c6ade']
};

const costData = {
  labels: ['API Calls', 'Storage', 'Bandwidth', 'Compute', 'Support'],
  values: [350, 120, 80, 60, 40]
};

const throttlingData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [0, 3, 1, 0, 2, 0, 0]
};

// Function to initialize charts when the analytics section is loaded
function initCharts() {
  console.log('Initializing charts...');
  
  // Usage over time (line chart)
  DashboardCharts.createLineChart('#usage-chart', usageData, {
    title: 'API Usage Over Time',
    xAxisLabel: 'Month',
    yAxisLabel: 'API Calls',
    animate: true
  });
  
  // Request distribution (pie chart)
  DashboardCharts.createPieChart('#distribution-chart', distributionData, {
    title: 'Request Distribution by Endpoint',
    animate: true
  });
  
  // Cost analysis (bar chart)
  DashboardCharts.createBarChart('#cost-chart', costData, {
    title: 'Cost Analysis',
    xAxisLabel: 'Category',
    yAxisLabel: 'Cost ($)',
    animate: true
  });
  
  // Throttling events (horizontal bar chart)
  DashboardCharts.createHorizontalBarChart('#throttling-chart', throttlingData, {
    title: 'Throttling Events',
    xAxisLabel: 'Count',
    yAxisLabel: 'Day',
    animate: true
  });
}

// Mock implementation of DashboardCharts for the example
class DashboardCharts {
  static createLineChart(selector, data, options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Container not found: ${selector}`);
      return;
    }
    
    // Clear loading placeholder
    container.innerHTML = '';
    
    // Create a simple mock chart for demonstration
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw mock line chart
    ctx.strokeStyle = '#5c6ac4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Calculate max value for scaling
    const maxValue = Math.max(...data.values);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw line
    ctx.strokeStyle = '#5c6ac4';
    ctx.beginPath();
    data.values.forEach((value, index) => {
      const x = padding + (index * (chartWidth / (data.values.length - 1)));
      const y = height - padding - ((value / maxValue) * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#5c6ac4';
    data.values.forEach((value, index) => {
      const x = padding + (index * (chartWidth / (data.values.length - 1)));
      const y = height - padding - ((value / maxValue) * chartHeight);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    
    // Draw title
    if (options.title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.title, width / 2, 20);
    }
    
    console.log(`Created line chart in ${selector}`);
  }
  
  static createPieChart(selector, data, options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Container not found: ${selector}`);
      return;
    }
    
    // Clear loading placeholder
    container.innerHTML = '';
    
    // Create a simple mock chart for demonstration
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw mock pie chart
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    // Calculate total for percentages
    const total = data.values.reduce((sum, value) => sum + value, 0);
    
    // Draw title
    if (options.title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.title, width / 2, 20);
    }
    
    // Draw pie slices
    let startAngle = 0;
    data.values.forEach((value, index) => {
      const sliceAngle = (value / total) * (Math.PI * 2);
      
      ctx.fillStyle = data.colors ? data.colors[index] : `hsl(${index * 360 / data.values.length}, 70%, 60%)`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      // Draw label
      const labelAngle = startAngle + (sliceAngle / 2);
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      const percentage = Math.round((value / total) * 100);
      if (percentage > 5) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);
      }
      
      startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = width - 100;
    const legendY = 50;
    
    data.labels.forEach((label, index) => {
      const y = legendY + (index * 20);
      
      // Draw color box
      ctx.fillStyle = data.colors ? data.colors[index] : `hsl(${index * 360 / data.values.length}, 70%, 60%)`;
      ctx.fillRect(legendX, y, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, legendX + 20, y + 6);
    });
    
    console.log(`Created pie chart in ${selector}`);
  }
  
  static createBarChart(selector, data, options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Container not found: ${selector}`);
      return;
    }
    
    // Clear loading placeholder
    container.innerHTML = '';
    
    // Create a simple mock chart for demonstration
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw mock bar chart
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Calculate max value for scaling
    const maxValue = Math.max(...data.values);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw title
    if (options.title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.title, width / 2, 20);
    }
    
    // Draw bars
    const barWidth = chartWidth / data.labels.length * 0.8;
    const barSpacing = chartWidth / data.labels.length * 0.2;
    
    data.values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + (index * (barWidth + barSpacing)) + barSpacing / 2;
      const y = height - padding - barHeight;
      
      ctx.fillStyle = data.colors ? data.colors[index] : '#5c6ac4';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.labels[index], x + barWidth / 2, height - padding + 15);
      
      // Draw value
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + barWidth / 2, y - 5);
    });
    
    console.log(`Created bar chart in ${selector}`);
  }
  
  static createHorizontalBarChart(selector, data, options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Container not found: ${selector}`);
      return;
    }
    
    // Clear loading placeholder
    container.innerHTML = '';
    
    // Create a simple mock chart for demonstration
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw mock horizontal bar chart
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Calculate max value for scaling
    const maxValue = Math.max(...data.values);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw title
    if (options.title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.title, width / 2, 20);
    }
    
    // Draw bars
    const barHeight = chartHeight / data.labels.length * 0.8;
    const barSpacing = chartHeight / data.labels.length * 0.2;
    
    data.values.forEach((value, index) => {
      const barWidth = (value / maxValue) * chartWidth;
      const x = padding;
      const y = padding + (index * (barHeight + barSpacing)) + barSpacing / 2;
      
      ctx.fillStyle = data.colors ? data.colors[index] : '#5c6ac4';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.labels[index], padding - 5, y + barHeight / 2);
      
      // Draw value
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, x + barWidth + 5, y + barHeight / 2);
    });
    
    console.log(`Created horizontal bar chart in ${selector}`);
  }
}

// Add to window for access in HTML
window.initCharts = initCharts;
window.DashboardCharts = DashboardCharts;