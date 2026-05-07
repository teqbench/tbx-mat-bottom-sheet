import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        passWithNoTests: false,
        coverage: {
            include: ['src/**/*.ts'],
            // Specs cover their own subjects; the barrel is pure re-exports.
            // Angular packages typically also exclude declarative folders that
            // hold no runtime logic — extend this list when adopting:
            //   'src/test-setup.ts',
            //   'src/models/**',
            //   'src/constants/**',
            //   'src/enums/**',
            //   'src/tokens/**',
            //   'src/types/**',
            //   'src/contracts/**',
            exclude: ['src/**/*.spec.ts', 'src/index.ts'],
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 75,
                perFile: true,
            },
        },
    },
});
