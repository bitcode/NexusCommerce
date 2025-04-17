/**
 * ToggleController.ts
 * Component for toggling between tree and raw data views
 */

import { ToggleControllerProps } from './types';

export class ToggleController {
  constructor(private props: ToggleControllerProps) {}
  
  /**
   * Renders the toggle controller
   * 
   * @returns HTML string for the toggle controller
   */
  render(): string {
    const { currentView } = this.props;
    
    return `
      <div class="toggle-controller">
        <div class="view-toggle">
          <button class="toggle-button tree-view-button ${currentView === 'tree' ? 'active' : ''}" data-view="tree">
            Tree View
          </button>
          <button class="toggle-button raw-view-button ${currentView === 'raw' ? 'active' : ''}" data-view="raw">
            Raw Data
          </button>
        </div>
        
        <div class="tree-controls" style="display: ${currentView === 'tree' ? 'flex' : 'none'}">
          <button class="expand-all-button">Expand All</button>
          <button class="collapse-all-button">Collapse All</button>
        </div>
      </div>
      
      <style>
        .toggle-controller {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .view-toggle {
          display: flex;
          gap: 10px;
        }
        
        .toggle-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .toggle-button.active {
          background-color: #5c6ac4;
          color: white;
          border-color: #5c6ac4;
        }
        
        .tree-controls {
          display: flex;
          gap: 10px;
        }
        
        .expand-all-button, .collapse-all-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    `;
  }
}