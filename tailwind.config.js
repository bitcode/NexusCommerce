const ayuTheme = require('./src/styles/ayu-theme.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          bg: ayuTheme.darkMode.base_colors.ui,
          editor: ayuTheme.darkMode.base_colors.editor,
          fg: ayuTheme.darkMode.editor.fg,
          accent: ayuTheme.darkMode.common.accent,
          error: ayuTheme.darkMode.common.error,
          syntax: {
            tag: ayuTheme.darkMode.syntax.tag,
            func: ayuTheme.darkMode.syntax.func,
            entity: ayuTheme.darkMode.syntax.entity,
            string: ayuTheme.darkMode.syntax.string,
            regexp: ayuTheme.darkMode.syntax.regexp,
            markup: ayuTheme.darkMode.syntax.markup,
            keyword: ayuTheme.darkMode.syntax.keyword,
            special: ayuTheme.darkMode.syntax.special,
            constant: ayuTheme.darkMode.syntax.constant,
            operator: ayuTheme.darkMode.syntax.operator
          }
        },
        // Light mode colors
        light: {
          bg: ayuTheme.lightMode.base_colors.ui,
          editor: ayuTheme.lightMode.base_colors.editor,
          fg: ayuTheme.lightMode.editor.fg,
          accent: ayuTheme.lightMode.common.accent,
          error: ayuTheme.lightMode.common.error,
          syntax: {
            tag: ayuTheme.lightMode.syntax.tag,
            func: ayuTheme.lightMode.syntax.func,
            entity: ayuTheme.lightMode.syntax.entity,
            string: ayuTheme.lightMode.syntax.string,
            regexp: ayuTheme.lightMode.syntax.regexp,
            markup: ayuTheme.lightMode.syntax.markup,
            keyword: ayuTheme.lightMode.syntax.keyword,
            special: ayuTheme.lightMode.syntax.special,
            constant: ayuTheme.lightMode.syntax.constant,
            operator: ayuTheme.lightMode.syntax.operator
          }
        }
      }
    }
  },
  plugins: [],
}
