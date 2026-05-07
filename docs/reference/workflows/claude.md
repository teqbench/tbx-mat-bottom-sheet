# Claude Code Workflow — `claude.yml`

**Full name:** TeqBench Package - Claude Code Workflow
**File:** `.github/workflows/claude.yml`
**Implementation:** Thin caller delegating to [`teqbench/.github/.github/workflows/claude.yml` ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/claude.yml)

---

## Purpose

The [Claude Code ↗](https://github.com/anthropics/claude-code) workflow provides AI-powered assistance directly in GitHub issues and pull requests. When a user mentions `@claude` in a comment or issue body, Claude reads the codebase, analyzes the request, and can implement features, fix bugs, review code, or create pull requests — all within the GitHub UI.

> **Note:** The local `.yml` file is a thin caller. Event triggers and `@claude` filters live here (reusable workflows only support `workflow_call` triggers). All implementation details below describe the org-wide reusable workflow in `teqbench/.github`. Refer to that repository for the authoritative source.

---

## Triggers

<dl>
    <dt><code>issue_comment</code> (created)</dt>
    <dd>Comment body contains <code>@claude</code>.</dd>
    <dt><code>pull_request_review_comment</code> (created)</dt>
    <dd>Comment body contains <code>@claude</code>.</dd>
    <dt><code>issues</code> (opened)</dt>
    <dd>Issue body contains <code>@claude</code>.</dd>
</dl>

---

## Concurrency

```yaml
group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
cancel-in-progress: false
```

Per-issue/PR concurrency: only one Claude run per issue or PR at a time.

---

## Secrets Used

<dl>
    <dt><code>APP_ID</code></dt>
    <dd>GitHub App ID for generating a bot token.</dd>
    <dt><code>APP_PRIVATE_KEY</code></dt>
    <dd>GitHub App private key.</dd>
    <dt><code>ANTHROPIC_API_KEY</code></dt>
    <dd>Authenticates with the <a href="https://docs.anthropic.com/en/api/overview">Anthropic API ↗</a>.</dd>
</dl>

---

## Behavior

The reusable workflow:

1. Generates an app token for checkout with submodules ([Claude Code ↗](https://github.com/anthropics/claude-code) skills).
2. Checks out with full history and submodules.
3. Runs [Claude Code ↗](https://github.com/anthropics/claude-code) via `anthropics/claude-code-action@v1` with restricted tool access.

### Tool Restrictions

Claude's capabilities are explicitly restricted via `--allowedTools`:

- **File tools:** View, Edit, Write, GlobTool, GrepTool, BatchTool
- **Git:** `git status`, `git diff`, `git log`, `git branch`, `git show`, `git checkout`, `git add`, `git commit`, `git push origin`
- **npm:** `npm run`, `npm ci`, `npx`
- **Excluded:** `git push --force`, `git reset`, `git rebase`, `git branch -D`, arbitrary bash commands

---

## CLAUDE.md

Claude reads the `CLAUDE.md` file in the repo root for project-specific context. Both the GitHub Action and the [Claude Code ↗](https://github.com/anthropics/claude-code) CLI read the same `CLAUDE.md`, ensuring consistent behavior across local and CI environments.

---

## Usage Examples

In any issue or PR comment:

```
@claude implement this feature based on the issue description
@claude fix the bug described above
@claude review this PR
@claude add unit tests for the greet function
```

Claude will:

1. Read the codebase and `CLAUDE.md` for context
2. Create a feature or bugfix branch off `dev`
3. Implement the requested changes
4. Run tests and lint to verify
5. Commit with [Conventional Commits ↗](https://www.conventionalcommits.org) messages
6. Push and create a PR targeting `dev`

---

## Limitations

- **Max turns:** 10 — prevents runaway sessions
- **Timeout:** 30 minutes — hard cap on execution time
- **No workflow edits** — Claude should not modify `.github/workflows/*` without explicit instruction (enforced by `CLAUDE.md` conventions)
- **No release file edits** — Claude should not modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md` (enforced by `CLAUDE.md` conventions)
