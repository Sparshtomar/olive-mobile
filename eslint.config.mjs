// @ts-check
// Architecture rules live here so they're enforced on every commit and in CI, not just described in the README.
import js from '@eslint/js';
import expoConfig from 'eslint-config-expo/flat.js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPluginModule from 'eslint-plugin-import';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';

// Reuse the exact plugin object Expo's preset registers; ESLint rejects two different `import` plugins.
const importPlugin = importPluginModule.flatConfigs.recommended.plugins.import;

// ---------------------------------------------------------------------------
// Layer rules
//   app (routes) → features → api (server state) → lib (infrastructure)
//                        ↘ ui (design system) ↗
// A feature is used by others only through its index.ts.
// ---------------------------------------------------------------------------
const restrict = (...patterns) => ['error', { patterns }];

const sharedInternals = {
  group: ['@sparshtomar/olive-shared/*'],
  message: 'Import the shared package from its root; its internals are not part of the contract.',
};
const deepFeatureImport = {
  group: ['@/features/*/**'],
  message: 'Import a feature through its public API (`@/features/<name>`), not its internals.',
};
const below = (layer, forbidden) => ({
  group: forbidden,
  message: `\`${layer}\` sits below this import in the layer order. See "Architecture rules" in the README.`,
});

const layerRules = [
  {
    files: ['src/**', 'test/**'],
    rules: { 'no-restricted-imports': restrict(sharedInternals) },
  },
  {
    files: ['src/app/**'],
    rules: {
      'no-restricted-imports': restrict(sharedInternals, deepFeatureImport, {
        group: ['@/api', '@/api/**', '@/lib/http', '@/lib/api-error'],
        message: 'Routes only re-export a feature screen; data access belongs in the feature.',
      }),
    },
  },
  {
    // The root layout is the composition root (providers, auth guard, startup work).
    files: ['src/app/_layout.tsx'],
    rules: { 'no-restricted-imports': restrict(sharedInternals, deepFeatureImport) },
  },
  {
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': restrict(
        sharedInternals,
        deepFeatureImport,
        { group: ['../../*'], message: 'Relative imports stay inside the feature. Use `@/` for anything outside it.' },
        { group: ['@/app/**'], message: 'Features must not depend on routes.' },
        {
          group: ['@/lib/http', '@/lib/api-error'],
          message: 'Only the data layer (`@/api`) talks to the HTTP client. Use `@/lib/errors` for error copy.',
        },
      ),
    },
  },
  {
    files: ['src/api/**'],
    rules: {
      'no-restricted-imports': restrict(
        sharedInternals,
        below('api', ['@/features', '@/features/**', '@/ui', '@/ui/**', '@/app/**']),
      ),
    },
  },
  {
    files: ['src/ui/**'],
    rules: {
      'no-restricted-imports': restrict(
        sharedInternals,
        below('ui', ['@/features', '@/features/**', '@/api', '@/api/**', '@/app/**']),
        {
          group: ['@/lib/http', '@/lib/api-error', '@/lib/session', '@/lib/query-client'],
          message: 'The design system is domain-free: no data, session or HTTP access.',
        },
        { group: ['@/ui', '@/ui/*'], message: 'Inside ui, import siblings relatively to avoid barrel cycles.' },
      ),
    },
  },
  {
    files: ['src/lib/**'],
    rules: {
      'no-restricted-imports': restrict(
        sharedInternals,
        below('lib', ['@/features', '@/features/**', '@/api', '@/api/**', '@/ui', '@/ui/**', '@/app/**']),
      ),
    },
  },
];

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/', '**/coverage/', '**/.expo/', 'android/', 'ios/', 'expo-env.d.ts']),

  js.configs.recommended,
  ...expoConfig,
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tsConfigs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tsConfigs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  // Rules that keep the problems seen in older codebases out of this one.
  {
    files: ['**/*.{ts,tsx,mts}'],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': { typescript: { project: ['tsconfig.json'] }, node: true },
    },
    rules: {
      // Type safety: no escape hatches.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Promises are awaited or explicitly `void`-ed; never silently dropped.
      '@typescript-eslint/no-floating-promises': 'error',
      // React event props may receive async handlers; everywhere else a misused promise is an error.
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/require-await': 'off',
      // No debug logging left behind.
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      // No god files. Split by responsibility long before this.
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      // Dependency graph stays acyclic, so modules can be understood and tested in isolation.
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Hooks correctness.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // React Compiler constraints. The compiler isn't enabled, and these misfire on Reanimated
      // shared values (`sv.value = …`). Turn them back on together with the compiler.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      // HTML-entity escaping doesn't apply to React Native <Text>.
      'react/no-unescaped-entities': 'off',
      // Colours come from design tokens.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message: 'Use a colour token from ui/theme.ts instead of a hex literal.',
        },
      ],
    },
  },
  { files: ['src/ui/theme.ts'], rules: { 'no-restricted-syntax': 'off' } },

  ...layerRules,

  { files: ['test/**'], rules: { 'max-lines': 'off' } },
]);
