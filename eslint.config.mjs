import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
<<<<<<< HEAD
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['**/*.astro', 'dist'] },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: {
      'jsx-a11y': jsxA11y
=======

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,astro}'],
    plugins: {
      'jsx-a11y': jsxA11y
    },
    rules: {
      // custom rules can go here
>>>>>>> 293ac49 (chore: fix lint and test scripts)
    }
  }
];
