# Sync Workflow — `sync.yml`

**Full name:** TeqBench Package - Sync (Main into Dev) Workflow
**File:** `.github/workflows/sync.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/sync.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/sync.yml)

---

## Purpose

After [Release Please ↗](https://github.com/googleapis/release-please) merges a Release PR to `main`, the `dev` branch falls behind — it's missing the version bump in `package.json`, the updated `CHANGELOG.md`, and the new `.release-please-manifest.json`. This workflow automatically merges `main` back into `dev` to keep the branches in sync.

> **Note:** The local `.yml` file is a thin caller. All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

<dl>
    <dt><code>push</code></dt>
    <dd>Branches: <code>main</code>.</dd>
</dl>

Sync runs on **every push to `main`**. If `dev` is already up to date, the merge is a no-op.

---

## Concurrency

```yaml
group: sync-${{ github.repository }}
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

The app token allows the Sync workflow to bypass the `dev` branch protection ruleset.

---

## Behavior

The reusable workflow:

1. Generates an app token from the `teqbench-automation` GitHub App.
2. Checks out with full history.
3. Merges `origin/main` into `dev` with commit message `chore: sync main into dev [skip ci]`.
4. Pushes to `dev` using the bot token (bypasses branch protection).

The `[skip ci]` tag prevents the push to `dev` from triggering a CI run per the [GitHub Actions ↗](https://docs.github.com/en/actions) specification.

---

## Interaction with Other Workflows

<dl>
    <dt>Sync pushes to <code>dev</code></dt>
    <dd>CI on <code>dev</code> is <strong>skipped</strong> via <code>[skip ci]</code>.</dd>
    <dt>Sync races with another push</dt>
    <dd>Handled by <code>git pull --rebase</code> before pushing.</dd>
</dl>
