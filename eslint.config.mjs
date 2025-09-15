import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['**/*.astro', 'dist', 'public/cookie-banner/**'] },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        // browser globals for React islands
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        IntersectionObserver: 'readonly',
        URL: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        KeyboardEvent: 'readonly',
        WheelEvent: 'readonly',
        TouchEvent: 'readonly'
      }
    },
    plugins: {
      'jsx-a11y': jsxA11y
    },
    rules: {
      // TypeScript catches undefined identifiers; avoid double-reporting in TS/TSX
      'no-undef': 'off'
    }
  }
];
