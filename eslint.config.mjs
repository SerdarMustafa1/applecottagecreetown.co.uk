import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['**/*.astro', 'dist'] },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        window: 'readonly',
        document: 'readonly',
        URL: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        TouchEvent: 'readonly',
        WheelEvent: 'readonly',
        KeyboardEvent: 'readonly',
        HTMLButtonElement: 'readonly',
      },
    },
    plugins: {
  'jsx-a11y': jsxA11y
    }
  }
];
