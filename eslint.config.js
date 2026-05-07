import angular from 'angular-eslint';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['.claude/', '.shared-skills/', '.storybook/', 'coverage/', 'dist/', 'node_modules/', 'storybook-static/', 'storybook-dev-static/', 'storybook-docs-static/'],
    },
    ...tseslint.configs.recommended,
    ...angular.configs.tsRecommended,
    {
        plugins: { tsdoc },
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.js', 'vitest.config.ts'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'tbx', style: 'camelCase' }],
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'tbx', style: 'kebab-case' }],
            'tsdoc/syntax': 'warn',
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    }
);
