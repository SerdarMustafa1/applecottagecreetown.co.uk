import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['**/*.astro'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: {
      'jsx-a11y': jsxA11y
    },
    rules: {
      // custom rules can go here
    }
  }
];
