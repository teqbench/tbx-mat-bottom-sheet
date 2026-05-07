# Release Workflow — `release.yml`

**Full name:** TeqBench Package - Release Workflow
**File:** `.github/workflows/release.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/release.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/release.yml)

---

## Purpose

The Release workflow automates versioning, changelog generation, GitHub Release creation, and [npm ↗](https://www.npmjs.com) publishing using Google's [Release Please ↗](https://github.com/googleapis/release-please). When a release is created, the package is automatically published to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).

> **Note:** The local `.yml` file is a thin caller. All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>Branches: <code>main</code>.</dd>
</dl>

Runs on every push to `main`, including merges from release branches, badge commits, and Release PR merges.

---

## Concurrency

```yaml
group: release-${{ github.repository }}
cancel-in-progress: false
```

---

## Secrets Used

<dl>
    <dt><code>APP_ID</code></dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code></dt>
    <dd>GitHub App private key.</dd>
</dl>

The app token is used instead of `GITHUB_TOKEN` so that Release PRs and release commits can trigger downstream workflows (CI, Sync).

---

## Behavior

### Job 1: Release Please

Runs `googleapis/release-please-action@v4` to create or update a Release PR based on [Conventional Commits ↗](https://www.conventionalcommits.org):

- `fix(…):` — **patch** bump
- `feat(…):` — **minor** bump
- `feat(…)!:` or `BREAKING CHANGE:` — **major** bump

The Release PR bumps `version` in `package.json`, `package-lock.json`, updates `CHANGELOG.md`, and updates `.release-please-manifest.json`.

### Job 2: Publish to GitHub Packages

Runs only when a release is created. Builds [TypeScript ↗](https://www.typescriptlang.org) to `dist/` and publishes via `npm publish ./dist`. Consumers resolve against [ng-packagr ↗](https://github.com/ng-packagr/ng-packagr)'s generated `package.json` with APF entry points.

> **Cross-repo `@teqbench` dependencies:** Each dependency package must grant the consuming repository read access in its package settings (**[GitHub Packages ↗](https://github.com/orgs/teqbench/packages) → Manage access**). This applies to the entire transitive dependency tree.

---

## Configuration Files

### `release-please-config.json`

The following is a simplified example; the actual file may include additional fields (e.g., `$schema`).

```json
{
    "release-type": "node",
    "packages": {
        ".": {
            "package-name": "TODO-package-name",
            "initial-version": "0.1.0",
            "extra-files": [
                "package.json",
                { "type": "json", "path": "package-lock.json", "jsonpath": "$.version" },
                { "type": "json", "path": "package-lock.json", "jsonpath": "$.packages[''].version" }
            ],
            "include-component-in-tag": false,
            "changelog-path": "CHANGELOG.md"
        }
    }
}
```

Key settings:

- **`release-type: node`** — uses the [Node.js ↗](https://nodejs.org) release strategy (reads `package.json`).
- **`extra-files`** — also bumps version in `package-lock.json` at two JSON paths.
- **`include-component-in-tag: false`** — produces clean tags like `v0.1.1` instead of prefixed tags.
- **`changelog-path`** — writes changelog to the repo root.

### `.release-please-manifest.json`

The version below is an example; the actual value is updated automatically by [Release Please ↗](https://github.com/googleapis/release-please) on each release.

```json
{
    ".": "0.1.0"
}
```

Tracks the current released version.

---

## Interaction with Other Workflows

<dl>
    <dt>Release PR opened/updated</dt>
    <dd>CI runs as status check on the PR.</dd>
    <dt>Release PR merged (push to main)</dt>
    <dd>CI (badge update), Release (creates GitHub Release + publishes), Sync (merges main into dev).</dd>
    <dt>GitHub Release created</dt>
    <dd>No additional workflow triggers.</dd>
</dl>
