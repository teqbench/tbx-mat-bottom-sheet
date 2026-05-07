import type { StorybookConfig } from '@analogjs/storybook-angular';

/**
 * Storybook entry point.
 *
 * Two audiences share this config directory, selected by the `STORYBOOK_MODE`
 * environment variable:
 *
 * - `dev` — development-facing harnesses under `src/components/` used while
 *   implementing the library.
 * - `docs` — consumer-facing demos under `src/stories/` intended for GitHub
 *   Pages publication and embedding in teqbench.website.
 * - `all` (default) — both sets visible; useful for local exploration.
 *
 * The config directory is named `.storybook` because `@analogjs/storybook-angular`
 * and Storybook core have internal references to that literal name. Alternative
 * directory names caused duplicate preview loading and NG0201 DI errors in
 * sibling packages; stick with `.storybook`.
 */
type Mode = 'dev' | 'docs' | 'all';

const mode = (process.env['STORYBOOK_MODE'] ?? 'all') as Mode;

const STORIES_BY_MODE: Record<Mode, string[]> = {
    dev: ['../src/components/**/*.stories.@(ts|mdx)'],
    docs: ['../src/stories/**/*.stories.@(ts|mdx)'],
    all: ['../src/**/*.stories.@(ts|mdx)'],
};

const config: StorybookConfig = {
    stories: STORIES_BY_MODE[mode] ?? STORIES_BY_MODE.all,
    addons: [],
    framework: {
        name: '@analogjs/storybook-angular',
        options: {},
    },
    core: {
        disableWhatsNewNotifications: true,
        builder: {
            name: '@storybook/builder-vite',
            options: {
                viteConfigPath: '.storybook/vite.config.ts',
            },
        },
    },
};

export default config;
