/**
 * DashboardCharts.ts
 * Provides interactive chart components for the dashboard using D3.js
 */

import * as d3 from 'd3';

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface ChartOptions {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  width?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  animate?: boolean;
  responsive?: boolean;
}

export class DashboardCharts {
  /**
   * Creates a line chart showing data over time
   * @param selector CSS selector for the container element
   * @param data Chart data
   * @param options Chart options
   */
  static createLineChart(
    selector: string,
    data: ChartData,
    options: ChartOptions = {}
  ): void {
    const container = d3.select(selector);
    if (container.empty()) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    // Clear any existing chart
    container.html('');

    // Set default options
    const defaultOptions: ChartOptions = {
      height: 300,
      width: (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600,
      margin: { top: 30, right: 30, bottom: 50, left: 60 },
      animate: true,
      responsive: true
    };

    const chartOptions = { ...defaultOptions, ...options };
    const { width, height, margin, title, xAxisLabel, yAxisLabel } = chartOptions;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width || 600)
      .attr('height', height || 300)
      .attr('viewBox', `0 0 ${width || 600} ${height || 300}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add title if provided
    if (title) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (margin?.top || 30) / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.labels)
      .range([(margin?.left || 60), (width || 600) - (margin?.right || 30)])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, (d3.max(data.values) || 0) * 1.1])
      .nice()
      .range([(height || 300) - (margin?.bottom || 50), (margin?.top || 30)]);

    // Create line generator with proper typing
    const line = d3.line<number>()
      .x((d, i) => (xScale(data.labels[i]) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${(height || 300) - (margin?.bottom || 50)})`)
      .call(d3.axisBottom(xScale) as any)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin?.left || 60},0)`)
      .call(d3.axisLeft(yScale) as any);

    // Add axis labels if provided
    if (xAxisLabel) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (height || 300) - 5)
        .attr('text-anchor', 'middle')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -((height || 300) / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    }

    // Add the line path with animation
    const path = svg.append('path')
      .datum(data.values)
      .attr('fill', 'none')
      .attr('stroke', '#5c6ac4')
      .attr('stroke-width', 2)
      .attr('d', line(data.values) || '');

    if (chartOptions.animate) {
      const pathNode = path.node();
      if (pathNode) {
        const pathLength = pathNode.getTotalLength();
        path.attr('stroke-dasharray', pathLength)
          .attr('stroke-dashoffset', pathLength)
          .transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0);
      }
    }

    // Add dots for each data point
    svg.selectAll('.dot')
      .data(data.values)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => (xScale(data.labels[i]) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d))
      .attr('r', 4)
      .attr('fill', '#5c6ac4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add responsive behavior if enabled
    if (chartOptions.responsive) {
      // Store resize handler for potential cleanup
      const resizeHandler = () => {
        const newWidth = (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600;
        svg.attr('width', newWidth)
          .attr('viewBox', `0 0 ${newWidth} ${height || 300}`);
        
        xScale.range([(margin?.left || 60), newWidth - (margin?.right || 30)]);
        
        // Update line
        path.attr('d', line(data.values) || '');
        
        // Update dots
        svg.selectAll('.dot')
          .attr('cx', (d, i) => (xScale(data.labels[i]) || 0) + xScale.bandwidth() / 2);
          
        // Update x-axis
        svg.select('.x-axis')
          .call(d3.axisBottom(xScale) as any);
      };
      
      window.addEventListener('resize', resizeHandler);
    }
  }

  /**
   * Creates a bar chart
   * @param selector CSS selector for the container element
   * @param data Chart data
   * @param options Chart options
   */
  static createBarChart(
    selector: string,
    data: ChartData,
    options: ChartOptions = {}
  ): void {
    const container = d3.select(selector);
    if (container.empty()) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    // Clear any existing chart
    container.html('');

    // Set default options
    const defaultOptions: ChartOptions = {
      height: 300,
      width: (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600,
      margin: { top: 30, right: 30, bottom: 50, left: 60 },
      animate: true,
      responsive: true
    };

    const chartOptions = { ...defaultOptions, ...options };
    const { width, height, margin, title, xAxisLabel, yAxisLabel } = chartOptions;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width || 600)
      .attr('height', height || 300)
      .attr('viewBox', `0 0 ${width || 600} ${height || 300}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add title if provided
    if (title) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (margin?.top || 30) / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.labels)
      .range([(margin?.left || 60), (width || 600) - (margin?.right || 30)])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, (d3.max(data.values) || 0) * 1.1])
      .nice()
      .range([(height || 300) - (margin?.bottom || 50), (margin?.top || 30)]);

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${(height || 300) - (margin?.bottom || 50)})`)
      .call(d3.axisBottom(xScale) as any)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin?.left || 60},0)`)
      .call(d3.axisLeft(yScale) as any);

    // Add axis labels if provided
    if (xAxisLabel) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (height || 300) - 5)
        .attr('text-anchor', 'middle')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -((height || 300) / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    }

    // Define default colors if not provided
    const colors = data.colors || Array(data.values.length).fill('#5c6ac4');

    // Add bars with animation
    const bars = svg.selectAll('.bar')
      .data(data.values)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(data.labels[i]) || 0)
      .attr('y', (height || 300) - (margin?.bottom || 50))
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d, i) => colors[i] || '#5c6ac4');

    if (chartOptions.animate) {
      bars.transition()
        .duration(800)
        .attr('y', d => yScale(d))
        .attr('height', d => (height || 300) - (margin?.bottom || 50) - yScale(d))
        .delay((d, i) => i * 50);
    } else {
      bars.attr('y', d => yScale(d))
        .attr('height', d => (height || 300) - (margin?.bottom || 50) - yScale(d));
    }

    // Add responsive behavior if enabled
    if (chartOptions.responsive) {
      // Store resize handler for potential cleanup
      const resizeHandler = () => {
        const newWidth = (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600;
        svg.attr('width', newWidth)
          .attr('viewBox', `0 0 ${newWidth} ${height || 300}`);
        
        xScale.range([(margin?.left || 60), newWidth - (margin?.right || 30)]);
        
        // Update bars
        svg.selectAll('.bar')
          .attr('x', (d, i) => xScale(data.labels[i]) || 0)
          .attr('width', xScale.bandwidth());
          
        // Update x-axis
        svg.select('.x-axis')
          .call(d3.axisBottom(xScale) as any);
      };
      
      window.addEventListener('resize', resizeHandler);
    }
  }

  /**
   * Creates a pie chart
   * @param selector CSS selector for the container element
   * @param data Chart data
   * @param options Chart options
   */
  static createPieChart(
    selector: string,
    data: ChartData,
    options: ChartOptions = {}
  ): void {
    const container = d3.select(selector);
    if (container.empty()) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    // Clear any existing chart
    container.html('');

    // Set default options
    const defaultOptions: ChartOptions = {
      height: 300,
      width: (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600,
      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      animate: true,
      responsive: true
    };

    const chartOptions = { ...defaultOptions, ...options };
    const { width, height, margin, title } = chartOptions;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width || 600)
      .attr('height', height || 300)
      .attr('viewBox', `0 0 ${width || 600} ${height || 300}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add title if provided
    if (title) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (margin?.top || 30) / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Define default colors if not provided
    const colors = data.colors || d3.schemeCategory10;

    // Calculate radius and center
    const radius = Math.min(
      (width || 600) - (margin?.left || 30) - (margin?.right || 30), 
      (height || 300) - (margin?.top || 30) - (margin?.bottom || 30)
    ) / 2;
    const centerX = (width || 600) / 2;
    const centerY = (height || 300) / 2;

    // Create pie layout with proper typing
    const pie = d3.pie<any, number>();
    const pieData = pie(data.values);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Create pie chart group
    const pieGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Add pie slices
    const slices = pieGroup.selectAll('.slice')
      .data(pieData)
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('d', d => arc(d) || '')
      .attr('fill', (d, i) => colors[i % colors.length]);

    if (chartOptions.animate) {
      slices.transition()
        .duration(800)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t) {
            return arc(interpolate(t)) || '';
          };
        });
    }

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    pieGroup.selectAll('.label')
      .data(pieData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('transform', d => {
        const centroid = labelArc.centroid(d as d3.PieArcDatum<number>);
        return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .text((d, i) => {
        const percentage = Math.round((d.value / d3.sum(data.values)) * 100);
        return percentage > 5 ? `${percentage}%` : '';
      });

    // Add legend
    const legendGroup = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${(width || 600) - (margin?.right || 30) - 100}, ${margin?.top || 30})`);

    const legendItems = legendGroup.selectAll('.legend-item')
      .data(data.labels)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d, i) => colors[i % colors.length]);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .style('font-size', '12px')
      .text(d => d);

    // Add responsive behavior if enabled
    if (chartOptions.responsive) {
      // Store resize handler for potential cleanup
      const resizeHandler = () => {
        const newWidth = (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600;
        svg.attr('width', newWidth)
          .attr('viewBox', `0 0 ${newWidth} ${height || 300}`);
        
        const newRadius = Math.min(
          newWidth - (margin?.left || 30) - (margin?.right || 30), 
          (height || 300) - (margin?.top || 30) - (margin?.bottom || 30)
        ) / 2;
        const newCenterX = newWidth / 2;
        
        // Update arc generator
        arc.outerRadius(newRadius);
        labelArc.innerRadius(newRadius * 0.6).outerRadius(newRadius * 0.6);
        
        // Update pie group position
        pieGroup.attr('transform', `translate(${newCenterX}, ${centerY})`);
        
        // Update legend position
        legendGroup.attr('transform', `translate(${newWidth - (margin?.right || 30) - 100}, ${margin?.top || 30})`);
        
        // Update labels position
        pieGroup.selectAll('.label')
          .attr('transform', d => {
            const centroid = labelArc.centroid(d as d3.PieArcDatum<number>);
            return `translate(${centroid[0]},${centroid[1]})`;
          });
      };
      
      window.addEventListener('resize', resizeHandler);
    }
  }

  /**
   * Creates a horizontal bar chart
   * @param selector CSS selector for the container element
   * @param data Chart data
   * @param options Chart options
   */
  static createHorizontalBarChart(
    selector: string,
    data: ChartData,
    options: ChartOptions = {}
  ): void {
    const container = d3.select(selector);
    if (container.empty()) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    // Clear any existing chart
    container.html('');

    // Set default options
    const defaultOptions: ChartOptions = {
      height: 300,
      width: (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600,
      margin: { top: 30, right: 30, bottom: 30, left: 100 },
      animate: true,
      responsive: true
    };

    const chartOptions = { ...defaultOptions, ...options };
    const { width, height, margin, title, xAxisLabel, yAxisLabel } = chartOptions;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width || 600)
      .attr('height', height || 300)
      .attr('viewBox', `0 0 ${width || 600} ${height || 300}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add title if provided
    if (title) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (margin?.top || 30) / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, (d3.max(data.values) || 0) * 1.1])
      .nice()
      .range([(margin?.left || 100), (width || 600) - (margin?.right || 30)]);

    const yScale = d3.scaleBand()
      .domain(data.labels)
      .range([(margin?.top || 30), (height || 300) - (margin?.bottom || 30)])
      .padding(0.1);

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${(height || 300) - (margin?.bottom || 30)})`)
      .call(d3.axisBottom(xScale) as any);

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin?.left || 100},0)`)
      .call(d3.axisLeft(yScale) as any);

    // Add axis labels if provided
    if (xAxisLabel) {
      svg.append('text')
        .attr('x', (width || 600) / 2)
        .attr('y', (height || 300) - 5)
        .attr('text-anchor', 'middle')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -((height || 300) / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    }

    // Define default colors if not provided
    const colors = data.colors || Array(data.values.length).fill('#5c6ac4');

    // Add bars with animation
    const bars = svg.selectAll('.bar')
      .data(data.values)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (margin?.left || 100))
      .attr('y', (d, i) => yScale(data.labels[i]) || 0)
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('fill', (d, i) => colors[i] || '#5c6ac4');

    if (chartOptions.animate) {
      bars.transition()
        .duration(800)
        .attr('width', d => xScale(d as number) - (margin?.left || 100))
        .delay((d, i) => i * 50);
    } else {
      bars.attr('width', d => xScale(d as number) - (margin?.left || 100));
    }

    // Add data labels
    svg.selectAll('.label')
      .data(data.values)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d as number) + 5)
      .attr('y', (d, i) => (yScale(data.labels[i]) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d);

    // Add responsive behavior if enabled
    if (chartOptions.responsive) {
      // Store resize handler for potential cleanup
      const resizeHandler = () => {
        const newWidth = (container.node() as HTMLElement)?.getBoundingClientRect()?.width || 600;
        svg.attr('width', newWidth)
          .attr('viewBox', `0 0 ${newWidth} ${height || 300}`);
        
        xScale.range([(margin?.left || 100), newWidth - (margin?.right || 30)]);
        
        // Update bars
        svg.selectAll('.bar')
          .attr('width', d => xScale(d as number) - (margin?.left || 100));
          
        // Update labels
        svg.selectAll('.label')
          .attr('x', d => xScale(d as number) + 5);
          
        // Update x-axis
        svg.select('.x-axis')
          .call(d3.axisBottom(xScale) as any);
      };
      
      window.addEventListener('resize', resizeHandler);
    }
  }
}