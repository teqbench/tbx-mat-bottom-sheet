# CI Workflow — `ci.yml`

**Full name:** TeqBench Package - CI Workflow
**File:** `.github/workflows/ci.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/ci.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/ci.yml)

---

## Purpose

The CI workflow is the quality gate for the repository. It runs formatting checks, type checking, linting, tests with coverage enforcement, dependency auditing, and README version drift detection on every push and pull request to `main` and `dev`. After a successful push (not PR), it pushes badge data to a shared GitHub Gist and updates the README with branch-specific [Shields.io ↗](https://shields.io) badge URLs.

> **Note:** The local `.yml` file is a thin caller. All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>Branches: <code>main</code>, <code>dev</code>. Full pipeline + badge gist push.</dd>
    <dt><code>pull_request</code></dt>
    <dd>Branches: <code>main</code>, <code>dev</code>. Full pipeline, no badge updates.</dd>
</dl>

---

## Concurrency

```yaml
group: ci-${{ github.repository }}-${{ github.ref }}
cancel-in-progress: false
```

Per-branch isolation: CI on `main` and `dev` run independently. Runs on the same branch queue sequentially (no cancellation).

---

## Secrets & Variables

<dl>
    <dt><code>APP_ID</code> (secret, repo)</dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code> (secret, repo)</dt>
    <dd>GitHub App private key.</dd>
    <dt><code>GIST_TOKEN</code> (secret, org)</dt>
    <dd>PAT with <code>gist</code> scope for pushing badge data.</dd>
    <dt><code>GIST_ID</code> (variable, org)</dt>
    <dd>ID of the shared public badge gist.</dd>
</dl>

The app token is used for checkout with submodules. The gist token is used to push badge JSON data to the shared gist owned by `teqbench-shields-bot`.

---

## Pipeline Steps

The reusable workflow performs the following steps:

1. **Enforce Source Branch for Main** — PRs to `main` must come from `release/*`, `hotfix/*`, or `release-please--*` branches.
2. **Generate App Token** — Creates a short-lived token from the `teqbench-automation` GitHub App. Dependency-update PRs run as this app (via [Renovate ↗](https://docs.renovatebot.com/) — see [renovate.md](renovate.md)), so the app token is available on every CI run, including automated dependency updates.
3. **Checkout Code** — Full history with submodules.
4. **Setup Node** — Reads the [Node.js ↗](https://nodejs.org) version from `.nvmrc` with [npm ↗](https://www.npmjs.com) cache enabled.
5. **Install Dependencies** — `npm ci` for deterministic builds. `GITHUB_TOKEN` authenticates with [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).
6. **Audit Dependencies** — `npm audit --audit-level=high`. Fails on high/critical vulnerabilities.
7. **Check Formatting** — `npm run format:check` ([Prettier ↗](https://prettier.io)).
8. **[TypeScript ↗](https://www.typescriptlang.org) Check** — `npm run typecheck` (`tsc --noEmit`).
9. **Lint** — `npm run lint` ([ESLint ↗](https://eslint.org)).
10. **Run Tests with Coverage** — `npm run test:coverage`. Enforces 80% lines/functions/statements, 75% branches per file.
11. **Evaluate Metrics** — Extracts coverage, test, and version data for badge generation.
12. **Check README Version Drift** — Verifies [TypeScript ↗](https://www.typescriptlang.org) and [Node.js ↗](https://nodejs.org) versions in README match `package.json`.
13. **Build** — `npm run build` compiles [TypeScript ↗](https://www.typescriptlang.org) to `dist/`.
14. **Push Badge Data to Gist** — Five badges pushed on push events (not PRs).

> **Cross-repo `@teqbench` dependencies:** Each dependency package must grant the consuming repository read access in its package settings (**[GitHub Packages ↗](https://github.com/orgs/teqbench/packages) → Manage access**). This applies to the entire transitive dependency tree.

---

## Badge Rendering

Badges are rendered by [Shields.io ↗](https://shields.io/badges/endpoint-badge) endpoint badges. The URL format is:

```
https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/{GIST_OWNER}/{GIST_ID}/raw/{REPO_NAME}-{BRANCH}-{badge}.json
```

[Shields.io ↗](https://shields.io) caches responses for ~5 minutes. After a CI run, badges may take a few minutes to reflect new data.
