import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,astro}'],
    plugins: {
      'jsx-a11y': jsxA11y
    },
    rules: {
      // custom rules can go here
    }
  }
];
