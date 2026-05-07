# Dependency Compatibility Check — `dep-compat-check.yml`

**Full name:** Dependency Compatibility Check
**File:** `.github/workflows/dep-compat-check.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/dep-compat-check.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/dep-compat-check.yml)

---

## Purpose

Tracks pinned dependencies that are waiting for a new version — for example, waiting for a package to release a compatible major version before it can be adopted. The workflow checks the [npm ↗](https://www.npmjs.com) registry daily, evaluates resolution conditions, and posts status updates to a tracking issue.

> **Note:** The local `.yml` file is a thin caller. All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

| Event               | Schedule           |
| ------------------- | ------------------ |
| `schedule`          | Daily at 12:00 UTC |
| `workflow_dispatch` | Manual trigger     |

---

## Concurrency

```yaml
group: dep-compat-check-${{ github.repository }}
cancel-in-progress: false
```

Per-repository isolation: scheduled and manual runs queue sequentially without cancellation.

---

## Configuration

The local `.yml` file passes `epic-issue-number` to the reusable workflow. This must be set to the tracking issue number during repository setup (see SETUP.md step 7).

---

## Issue Metadata Format

Sub-issues of the epic must include a metadata block in their body:

```html
<!-- dep-compat
package: @angular/core
resolution: semver-major:22
description: Waiting for Angular 22 to support new signals API
also-track: @angular/cli, @angular/compiler
-->
```

| Field         | Required | Description                                                       |
| ------------- | -------- | ----------------------------------------------------------------- |
| `package`     | Yes      | [npm ↗](https://www.npmjs.com) package name to check              |
| `resolution`  | No       | Resolution condition (see below). Defaults to `manual`.           |
| `description` | No       | Human-readable context for status reports                         |
| `also-track`  | No       | Comma-separated list of additional packages to show in the report |

### Resolution Conditions

| Condition               | Behavior                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `semver-gte:<version>`  | Resolved when latest version >= target. Status: Monitoring or Blocked |
| `semver-major:<number>` | Resolved when latest major >= target. Status: Resolved or Blocked     |
| `manual` (or omitted)   | Always shows as Action Needed — requires manual evaluation            |

---

## Behavior

The reusable workflow:

1. Finds open issues with `Part of #<EPIC>` and `<!-- dep-compat ... -->` metadata.
2. For each, queries the [npm ↗](https://www.npmjs.com) registry for the latest version.
3. Evaluates the resolution condition against the current version.
4. Compares version fingerprints with the last bot comment to detect changes.
5. Posts a summary comment if: versions changed, it's Monday, or the workflow was triggered manually.

### Status Labels

| Label         | Meaning                                        |
| ------------- | ---------------------------------------------- |
| Resolved      | Resolution condition met — ready to integrate  |
| Blocked       | Waiting for a version that meets the condition |
| Action needed | Manual resolution — requires human evaluation  |
| Monitoring    | Condition met but keeping an eye on it         |

---

## Noise Reduction

The workflow only posts a comment when:

- **Version change detected** — at least one tracked package has a different version than the last check
- **Monday** — weekly summary regardless of changes
- **Manual trigger** — always posts when run via `workflow_dispatch`
