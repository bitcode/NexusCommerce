/**
 * RawDataView.ts
 * Component for displaying raw data in JSON or YAML format
 */

import { RawDataViewProps } from './types';

export class RawDataView {
  constructor(private props: RawDataViewProps) {}
  
  /**
   * Renders the raw data view
   * 
   * @returns HTML string for the raw data view
   */
  render(): string {
    const { data, format = 'json', syntaxHighlight = true } = this.props;
    
    // Format the data
    const formattedData = format === 'json'
      ? JSON.stringify(data, null, 2)
      : this.convertToYaml(data);
    
    // Apply syntax highlighting if enabled
    const highlightedData = syntaxHighlight
      ? this.applySyntaxHighlighting(formattedData, format)
      : formattedData;
    
    return `
      <div class="raw-data-view">
        <div class="raw-data-header">
          <div class="format-selector">
            <label>
              <input type="radio" name="format" value="json" ${format === 'json' ? 'checked' : ''}>
              JSON
            </label>
            <label>
              <input type="radio" name="format" value="yaml" ${format === 'yaml' ? 'checked' : ''}>
              YAML
            </label>
          </div>
          
          <button class="copy-button">Copy</button>
        </div>
        
        <pre class="raw-data-content">${highlightedData}</pre>
      </div>
      
      <style>
        .raw-data-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .raw-data-header {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .format-selector {
          display: flex;
          gap: 10px;
        }
        
        .copy-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .raw-data-content {
          flex: 1;
          overflow: auto;
          margin: 0;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
        }
        
        .syntax-string { color: #c2185b; }
        .syntax-number { color: #1976d2; }
        .syntax-boolean { color: #0d47a1; }
        .syntax-null { color: #b71c1c; }
        .syntax-key { color: #7b1fa2; }
      </style>
      
      <script>
        // Client-side script for handling interactions
        document.addEventListener('DOMContentLoaded', () => {
          // Format selector
          document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
              const target = e.target as HTMLInputElement;
              const format = target.value;
              
              // This would trigger a re-render with the new format
              // For now, we'll just log it
              console.log('Format changed to:', format);
            });
          });
          
          // Copy button
          document.querySelector('.copy-button')?.addEventListener('click', () => {
            const content = document.querySelector('.raw-data-content')?.textContent || '';
            navigator.clipboard.writeText(content).then(() => {
              alert('Copied to clipboard!');
            });
          });
        });
      </script>
    `;
  }
  
  /**
   * Converts data to YAML format
   * 
   * @param data - Data to convert
   * @returns YAML string
   */
  private convertToYaml(data: any): string {
    // This is a simplified YAML converter
    // In a real implementation, you would use a library like js-yaml
    
    const convertObject = (obj: any, indent: number = 0): string => {
      const indentStr = ' '.repeat(indent);
      
      return Object.entries(obj).map(([key, value]) => {
        if (value === null) {
          return `${indentStr}${key}: null`;
        }
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          return `${indentStr}${key}:\n${convertObject(value, indent + 2)}`;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return `${indentStr}${key}: []`;
          }
          
          return `${indentStr}${key}:\n${value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return `${indentStr}- \n${convertObject(item, indent + 4)}`;
            }
            return `${indentStr}- ${item}`;
          }).join('\n')}`;
        }
        
        return `${indentStr}${key}: ${value}`;
      }).join('\n');
    };
    
    return convertObject(data);
  }
  
  /**
   * Applies syntax highlighting to the formatted data
   * 
   * @param data - Formatted data
   * @param format - Data format
   * @returns HTML string with syntax highlighting
   */
  private applySyntaxHighlighting(data: string, format: 'json' | 'yaml'): string {
    // This is a simplified syntax highlighter
    // In a real implementation, you would use a library like highlight.js
    
    if (format === 'json') {
      return data
        .replace(/"([^"]+)":/g, '<span class="syntax-key">"$1"</span>:')
        .replace(/"([^"]+)"/g, '<span class="syntax-string">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="syntax-boolean">$1</span>')
        .replace(/\b(null)\b/g, '<span class="syntax-null">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
    }
    
    // YAML highlighting
    return data
      .replace(/^(\s*)([^:]+):/gm, '$1<span class="syntax-key">$2</span>:')
      .replace(/: (.+)$/gm, ': <span class="syntax-string">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="syntax-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="syntax-null">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
  }
}