import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [angular({ jit: true, tsconfig: 'tsconfig.spec.json' })],
    resolve: {
        // When using npm link, symlinked packages resolve @angular/* from their
        // own node_modules instead of the host's. This causes duplicate Angular
        // instances and breaks DI (inject() context errors). Deduplication forces
        // a single instance across the dependency graph. Safe to leave in place —
        // has no effect when packages are installed from the registry.
        dedupe: ['@angular/core', '@angular/material', '@angular/platform-browser'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test-setup.ts'],
        passWithNoTests: false,
        coverage: {
            // Exclude files that contain only constants, interfaces, types,
            // injection tokens, or test infrastructure — no testable logic to cover.
            exclude: [
                'src/constants/**',
                'src/enums/**',
                'src/models/**',
                'src/tokens/**',
                'src/types/**',
                'src/test-setup.ts',
                'src/**/*.stories.ts',
            ],
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
