# Setup Checklist

Complete these steps after creating a new repository from this template, then delete this file.

## Using Claude Code

Open [Claude Code ↗](https://github.com/anthropics/claude-code) in the new repository root and ask it to follow this checklist:

> Follow the setup checklist in SETUP.md to configure this package as `@teqbench/tbx-<name>` with description "<description>".

[Claude Code ↗](https://github.com/anthropics/claude-code) will read this file automatically and work through the automated steps. It will prompt you when a manual step is needed.

## Steps

Steps marked **[auto]** can be performed by [Claude Code ↗](https://github.com/anthropics/claude-code). Steps marked **[manual]** require action in the GitHub UI or browser. Complete the manual steps first — they configure the infrastructure that CI and automation depend on.

### Pre-requisites (manual)

1. **[manual] Create the repository** from this template on GitHub
2. **[manual] Grant teqbench-automation app access:** go to **github.com/organizations/teqbench/settings/installations**, select the **teqbench-automation** app, and add the new repo to its repository access list (required for CI checkout, badge commits, sync, and release workflows)
3. **[manual] Add repo to org rulesets:** go to **github.com/organizations/teqbench/settings/rules** and add the new repo to the `main` and `dev` ruleset "Selected repositories" lists

### Package setup (automated)

> **Important:** All automated changes must be made on a `feature/*` branch off `dev`, then merged to `dev` via PR. Once merged, create a `release/*` branch from `dev`, merge `main` into it, and PR to `main`. Do not commit directly to `dev` or `main`. See CLAUDE.md and the [org contributing guide ↗](https://github.com/teqbench/.github/blob/main/CONTRIBUTING.md) for the full branching workflow.

4. **[auto] Reset versioning:** set `version` to `0.0.0` in `package.json`, both `version` fields in `package-lock.json`, and `.release-please-manifest.json`. Reset `CHANGELOG.md` to just `# Changelog` (remove all template changelog entries). This ensures the first release starts fresh.
5. **[auto] Update `package.json` and `package-lock.json`:** set `name` to `@teqbench/tbx-*` (or `tbx-ngx-*` / `tbx-mat-*`), set `description`, add any `dependencies` and `peerDependencies`. Update both `name` fields in `package-lock.json` to match.

    If the package depends on other `@teqbench` packages (listed in `dependencies` or `peerDependencies`), you must grant this repository read access to each `@teqbench` package in the entire dependency tree (direct and transitive) on GitHub. For each `@teqbench` package, go to **github.com/orgs/teqbench/packages/npm/\<package-name\>/settings → Manage access**, add the new repository, and set the role to **Read**. [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) has its own access control layer — repository and app permissions alone are not sufficient. Without this, CI will fail with `403 Forbidden` during `npm ci`. For example, if your package depends on `tbx-mat-severity-icons` which depends on `tbx-mat-icons`, you must grant read access on both packages.

6. **[auto] Update `release-please-config.json`:** set `package-name` to match `package.json` name
7. **[auto] Set up dependency compatibility tracking:** create a GitHub issue in the repo titled "Dependency Compatibility Tracking" to serve as the tracking epic. Some dependencies are intentionally pinned below a major (e.g., `@types/node` is pinned to the [Node.js ↗](https://nodejs.org) runtime major, [ESLint ↗](https://eslint.org) is held below 10 until [Angular ESLint ↗](https://github.com/angular-eslint/angular-eslint) catches up); these restrictions are enforced via `allowedVersions` in the central [Renovate ↗](https://docs.renovatebot.com/) config in `teqbench/.github`, not in this repo. [Renovate ↗](https://docs.renovatebot.com/) won't track when those restrictions can be lifted — instead, the `dep-compat-check` workflow checks the [npm ↗](https://www.npmjs.com) registry daily and posts status comments on this epic issue. To track a specific dependency, create a sub-issue with `Part of #<epic>` and a `<!-- dep-compat ... -->` metadata block in the body (see [docs/reference/workflows/dep-compat-check.md](docs/reference/workflows/dep-compat-check.md) for the metadata format). After creating the issue, update `epic-issue-number` in `.github/workflows/dep-compat-check.yml` with the issue number. Pin the issue to the top of the issue board for visibility.
8. **[auto] Update `README.md` and `docs/` pipeline files:** replace the package name, description, install instructions, and usage example with the actual package details. Replace every occurrence of `teqbench.dev.templates.tbx-package` with the new repository name — these appear in badge URLs (so badges point to the correct gist files) and in the Feedback section's `issues/new?template=` links (so bug-report and feature-request links route to the new repo, where they resolve against the org-inherited issue templates in `teqbench/.github`). Fill in the per-package docs pipeline placeholders in `docs/overview.md` (with the `tagline:` frontmatter), `docs/concepts.yml` (glossary terms), `docs/features.yml` (feature highlights), and `docs/accessibility.md`. These are bundled into the published package via `ng-package.json` assets and feed downstream documentation generators.
9. **[auto] Update `CLAUDE.md`:** replace the TODO in the Package Overview with a description of what this package does
10. **[auto] Update `eslint.config.js`:** add [Angular ↗](https://angular.dev)-specific rules if this is a `tbx-ngx-*` or `tbx-mat-*` package (skip for plain `tbx-*` packages)
11. **[auto] Configure [Angular ↗](https://angular.dev) test infrastructure** (skip for plain `tbx-*` packages): this step sets up the [Vitest ↗](https://vitest.dev) + [Angular ↗](https://angular.dev) compiler pipeline that [Angular ↗](https://angular.dev) packages require for TestBed-based specs. Do NOT use manual `TestBed.initTestEnvironment()` — it breaks teardown with the plugin's `vmThreads` pool.
    - Create `src/test-setup.ts`:

        ```typescript
        import '@angular/compiler';
        import '@analogjs/vitest-angular/setup-snapshots';
        import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

        setupTestBed();
        ```

    - Create `tsconfig.spec.json` extending `tsconfig.json` with `include: ["src/**/*.spec.ts", "src/test-setup.ts"]`
    - Update `vitest.config.ts`: add `@analogjs/vite-plugin-angular` plugin with `jit: true` and `tsconfig: 'tsconfig.spec.json'`; set `environment: 'jsdom'` and `setupFiles: ['src/test-setup.ts']`
    - Update `tsconfig.json`: add `experimentalDecorators: true` and `emitDecoratorMetadata: true`
    - Update `tsconfig.build.json`: add `**/test-setup.ts` to excludes
    - Add [Angular ↗](https://angular.dev) devDependencies: `@analogjs/vite-plugin-angular`, `@analogjs/vitest-angular`, `@angular/build`, `@angular/compiler`, `@angular/compiler-cli`, `@angular/platform-browser`, `angular-eslint`, `jsdom`, `zone.js`

12. **[auto] Verify [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) build:** run `npm run build` and confirm `dist/` contains [Angular Package Format ↗](https://angular.dev/tools/libraries/angular-package-format) (APF) output (`fesm2022/`, `types/`, and a generated `package.json`). The build uses [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) with bundler module resolution, so all relative imports in source files must be extensionless (e.g., `'./foo.service'`). No ESM extension rewriting config is needed — [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) handles this.
13. **[auto] Replace example source files** in `src/` — delete `greet.ts` and `greet.spec.ts`, add the actual package source, and update `src/index.ts` barrel exports
14. **[auto] Search for remaining placeholders:** grep the entire repository for `TODO-package-name` and `TODO`. Replace or remove every occurrence — this catches references in documentation, badge URLs, lock files, and code examples that earlier steps may have missed.
15. **[auto] Verify publish contents:** run `npm run build` and confirm that `dist/package.json` contains `module`, `typings`, and `exports` fields: `node -e "const p = require('./dist/package.json'); console.log(p.module, p.typings, Object.keys(p.exports))"`
16. **[auto] Delete this file**

## Verification

After all steps are complete, output a summary table like this:

| Step | Description                                                           | Status                   |
| ---- | --------------------------------------------------------------------- | ------------------------ |
| 1    | Create repository                                                     | Manual — pre-req         |
| 2    | Grant teqbench-automation access                                      | Manual — pre-req         |
| 3    | Add repo to org rulesets                                              | Manual — pre-req         |
| 4    | Reset versioning                                                      | Done                     |
| 5    | Update package.json/lock                                              | Done                     |
| 6    | Update release-please-config.json                                     | Done                     |
| 7    | Set up dep-compat tracking                                            | Done                     |
| 8    | Update README.md                                                      | Done                     |
| 9    | Update CLAUDE.md                                                      | Done                     |
| 10   | Update eslint.config.js                                               | Skipped (tbx-\* package) |
| 11   | Configure [Angular ↗](https://angular.dev) test infrastructure        | Skipped (tbx-\* package) |
| 12   | Verify [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr) build | Done                     |
| 13   | Replace example source files                                          | Done                     |
| 14   | Search for remaining placeholders                                     | Done                     |
| 15   | Verify publish contents                                               | Done                     |
| 16   | Delete SETUP.md                                                       | Done                     |

> **Reminder:** Subscribe to the dep-compat tracking issue (step 7) to receive daily status notifications.

Use **Done**, **Skipped** (with reason), or **Manual — action required** as the status for each step.
