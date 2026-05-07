import tseslint from 'typescript-eslint';
import tsdoc from 'eslint-plugin-tsdoc';

export default tseslint.config(
    {
        ignores: ['.claude/', '.shared-skills/', 'coverage/', 'dist/', 'node_modules/'],
    },
    ...tseslint.configs.recommended,
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
            'tsdoc/syntax': 'error',
        },
    }
);
