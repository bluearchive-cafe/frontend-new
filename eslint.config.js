// ESLint flat config for the BlueArchive.Cafe frontend.
import js from '@eslint/js'
import html from 'eslint-plugin-html'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Matches the repository style: two-space indentation, single quotes, no
// semicolons (see AGENTS.md).
export default tseslint.config(
  // Global ignores: build output, generated content, gitignored tooling.
  {
    ignores: [
      'dist/',
      'node_modules/',
      'public/assets/img/hero/optimized/',
      'src/content/news.generated.ts',
      'tsconfig.tsbuildinfo',
      '.claude/',
      '.agents/',
      '.worktrees/',
    ],
  },
  {
    // Lint the script blocks inside HTML files (index.html's gtag and JSON-LD).
    plugins: { html },
    files: ['**/*.html'],
  },
  // --- TypeScript, type-aware: src/ is covered by tsconfig.json ------------
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
  },
  // --- Vue SFCs with TypeScript, type-aware -------------------------------
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { vue },
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...vue.configs['flat/recommended'],
    ],
    // Template formatting rules are turned off: the project hand-formats its
    // templates (see AGENTS.md) and these rules would only produce noise.
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // --- TypeScript outside tsconfig (tests/, vite.config.ts): syntax only ---
  {
    files: ['tests/**/*.ts', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
        ...globals.node,
      },
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  // --- Plain JavaScript (scripts/): syntax only ---------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Node scripts print progress to stdout; that is their purpose.
      'no-console': 'off',
    },
  },
)
