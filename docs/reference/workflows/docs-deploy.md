# Docs Deploy Workflow — `docs-deploy.yml`

**Full name:** TeqBench Package - Docs Deploy Workflow
**File:** `.github/workflows/docs-deploy.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/docs-deploy.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/docs-deploy.yml)

---

## Purpose

Publishes the package's per-package documentation (the `docs/` pipeline inputs — `overview.md`, `concepts.yml`, `features.yml`, `related.yml`, `accessibility.md` — plus the source [TSDoc ↗](https://tsdoc.org) extracted by [API Extractor ↗](https://api-extractor.com)) to the central [teqbench.website ↗](https://teqbench.website) docs site after each merge to `main`.

> **Note:** The local `.yml` file is a thin caller. All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

<dl>
    <dt><code>push</code> on <code>main</code></dt>
    <dd>Runs the docs-deploy pipeline after a merge.</dd>
</dl>

Runs on every push to `main`. The reusable workflow is responsible for any path-based filtering (e.g., skipping when only non-docs files changed).

---

## Concurrency

```yaml
group: docs-deploy-${{ github.repository }}
cancel-in-progress: false
```

Per-repository serialization: a second push to `main` queues behind the first rather than cancelling, so an in-flight publish always completes.

---

## Secrets Used

Inherited from the calling repo via `secrets: inherit`. The reusable workflow defines the exact secrets it consumes (typically a [GitHub App ↗](https://docs.github.com/en/apps) token for cross-repo writes to the docs target). Refer to the org-wide workflow for the authoritative list.

---

## Behavior

The reusable workflow:

1. Checks out the repository.
2. Builds the per-package docs payload from `docs/` inputs and the source [TSDoc ↗](https://tsdoc.org) (extracted via [API Extractor ↗](https://api-extractor.com)).
3. Publishes the payload to the central docs target consumed by [teqbench.website ↗](https://teqbench.website).

---

## Interaction with Other Workflows

<dl>
    <dt>CI / Release on <code>main</code></dt>
    <dd>Run independently of docs-deploy. The docs build does not block tests, the build, or release publication; all three workflows run in parallel as side effects of the same push to <code>main</code>.</dd>
    <dt>Sync workflow</dt>
    <dd>Sync also runs on push to <code>main</code> and merges <code>main</code> into <code>dev</code>. Its resulting push lands on <code>dev</code> (not <code>main</code>), so it does not re-trigger docs-deploy. The two workflows are siblings, not chained.</dd>
</dl>
