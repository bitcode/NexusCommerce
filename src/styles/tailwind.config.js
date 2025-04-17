const ayuTheme = require('./ayu-theme.json');

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          ui: ayuTheme.darkMode.base_colors.ui,
          editor: ayuTheme.darkMode.base_colors.editor,
          syntax: {
            tag: ayuTheme.darkMode.syntax.tag,
            func: ayuTheme.darkMode.syntax.func,
            // ... other syntax colors
          }
        },
        // Light mode colors
        light: {
          ui: ayuTheme.lightMode.base_colors.ui,
          editor: ayuTheme.lightMode.base_colors.editor,
          syntax: {
            tag: ayuTheme.lightMode.syntax.tag,
            func: ayuTheme.lightMode.syntax.func,
            // ... other syntax colors
          }
        }
      }
    }
  },
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark']
    }
  }
};