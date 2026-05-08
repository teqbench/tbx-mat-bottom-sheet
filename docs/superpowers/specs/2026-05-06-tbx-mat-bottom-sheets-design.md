# `@teqbench/tbx-mat-bottom-sheets` — Package Design

> **Update 2026-05-07:** The `dragHandle` config field was removed post-implementation. The pill was decorative-only (no drag-to-dismiss behavior), which set up an expectation the package didn't fulfill. See `git log --grep='remove dragHandle'` for the removal commits.
>
> **Update 2026-05-07:** The `'destructive'` value was removed from the footer-button `emphasis` enum. Consumers express destructive intent via the bottom sheet `severity` field (`'warning'` for reversible, `'error'` for irreversible) instead. Removes API orthogonality conflict (emphasis described button weight, severity described surface tone — two axes were being conflated) and palette-mixing visual debt. See `git log --grep='drop destructive emphasis'` for the removal commits.

**Date:** 2026-05-06
**Branch:** `fix/package-updates` (off `dev`)
**Status:** Approved for implementation planning

## Summary

A new `@teqbench` package wrapping [Angular Material's `MatBottomSheet`](https://material.angular.dev/components/bottom-sheet/overview), positioned as a peer of `@teqbench/tbx-mat-dialogs`, `@teqbench/tbx-mat-banners`, and `@teqbench/tbx-mat-notifications`. The package mirrors `tbx-mat-dialogs` 1:1 in API surface, models, footer model, button presets, provider-config token, shell anatomy, testing, docs, build, and workflows. Only two surgical adjustments are made to honour the underlying `MatBottomSheet` semantics:

1. **Sizing fields are dropped** from the config (`width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`). `MatBottomSheetConfig` does not expose sizing knobs; the bottom sheet sizes itself per Material defaults.
2. **A `dragHandle?: boolean` field is added** (default `false`). When `true`, the shell renders a centered grabber pill above the header — a near-universal bottom-sheet affordance, opt-in to keep the default chrome aligned with the dialog look.

Drag-to-dismiss, peek/expand modes, and top-anchored sheets are explicitly out of scope.

## Goals

- Provide a typed, opinionated, Promise-based API for opening Material bottom sheets, mirroring the message-surface family conventions established by `tbx-mat-dialogs`.
- Maintain exact convention parity with the dialog package (TSDoc, naming, file layout, tests, docs pipeline, workflows, lint/format/hooks).
- Reuse the severity model and pluggable icon-resolver pattern (font / SVG) via the same provider-config token shape.
- Keep the public surface internally consistent with `TbxMatDialogService` so a developer who knows the dialog API can use the bottom sheet API with no learning curve.

## Non-goals

- Drag-to-dismiss, drag-to-expand, peek/expanded modes.
- Top-anchored sheets (Material does not support; out of scope).
- Action-list / menu-style bottom sheets as a top-level method (the `show()` + `content` projection escape hatch is sufficient).
- Width / height / sizing fields on `TbxMatBottomSheetConfig` (intentionally absent — see Decisions).

## Decisions Captured During Brainstorming

<dl>
    <dt>API surface</dt>
    <dd>Choice: Mirror <code>TbxMatDialogService</code> 1:1. Maximum consistency across the message-surface family.</dd>
    <dt>Sizing fields on config</dt>
    <dd>Choice: Drop entirely. <code>MatBottomSheetConfig</code> has no sizing knobs; bottom sheet sizes itself.</dd>
    <dt>Drag handle</dt>
    <dd>Choice: <code>dragHandle?: boolean</code>, default <code>false</code>. Opt-in keeps default chrome dialog-aligned; consumers can enable for typical bottom-sheet UX.</dd>
    <dt>Mirroring strategy</dt>
    <dd>Choice: Strict mirror (Approach #1). Adapted-shell (#2) erodes consistency; composition (#3) couples internals across packages.</dd>
</dl>

## Package Skeleton

Mirrors `tbx-mat-dialogs` directory-for-directory.

```
src/
  components/
    bottom-sheet-shell.component.ts
    bottom-sheet-shell.component.spec.ts
    *.stories.ts                          (Storybook dev-mode)
  constants/
    bottom-sheet.constants.ts
  enums/
    bottom-sheet-dismiss-reason.enum.ts
  models/
    bottom-sheet.model.ts                 (Config, Result, Data)
    bottom-sheet-footer.model.ts          (Footer item interfaces)
    bottom-sheet-provider-config.model.ts
    resolved-icon.model.ts                (internal)
  services/
    bottom-sheet.service.ts
    bottom-sheet.service.spec.ts
    bottom-sheet-severity-font-icon.service.ts (+ .spec)
    bottom-sheet-severity-svg-icon.service.ts  (+ .spec)
    bottom-sheet-close-font-icon.service.ts    (+ .spec)
  stories/
    bottom-sheets/                        (docs-mode stories)
  styles/
    _tbx-mat-bottom-sheet.scss            (entry partial)
  tokens/
    bottom-sheet-provider-config.token.ts
  types/
    bottom-sheet-config-override.type.ts  (TbxMatBottomSheetConfigArgs<T>)
    bottom-sheet-footer-control.type.ts   (TbxMatBottomSheetFooterControlType)
    bottom-sheet-icon-resolver.type.ts    (TbxMatBottomSheetIconResolver)
  index.ts                                (barrel, with @packageDocumentation)
  test-setup.ts

docs/
  overview.md
  concepts.yml
  features.yml
  accessibility.md
  related.yml
  reference/workflows/                    (per-pipeline docs)

.github/workflows/
  ci.yml                                  (caller → teqbench/.github reusable)
  release.yml                             (caller → teqbench/.github reusable)
  sync.yml
  dep-compat-check.yml
  docs-deploy.yml
  claude.yml

.husky/pre-commit                         (lint-staged)

ng-package.json
tsconfig.json, tsconfig.build.json, tsconfig.spec.json
tsdoc.json
eslint.config.js
.prettierrc, .editorconfig
vitest.config.ts
release-please-config.json, .release-please-manifest.json
.npmrc, .nvmrc
package.json (with devDependenciesPinned rationale block)
README.md, CHANGELOG.md, LICENSE (AGPL-3.0-only), CLAUDE.md
```

### Naming Convention

Per the `@teqbench/tbx-mat-*` rule:

- PascalCase prefix: `TbxMat`
- UPPER*SNAKE_CASE prefix: `TBX_MAT*`
- Component selector: `tbx-mat-bottom-sheet-*`
- Panel class root: `tbx-mat-bottom-sheet-panel`

## Public API Surface

`src/index.ts` is the barrel. Exports grouped with `// Enums`, `// Types`, `// Models`, `// Constants`, `// Tokens`, `// Services` headers.

### Service

`TbxMatBottomSheetService` (`@Injectable({ providedIn: 'root' })`):

```typescript
class TbxMatBottomSheetService {
    show<T = void, F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfig<T>
    ): Promise<TbxMatBottomSheetResult<T, F>>;

    success<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;

    error<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;
    warning<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;
    information<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;
    help<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;
    default<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>;

    confirm<F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<void>
    ): Promise<TbxMatBottomSheetResult<void, F>>; // Help severity + Yes/No buttons

    input<T, F = Record<string, unknown>>(
        config: TbxMatBottomSheetConfigArgs<T>
    ): Promise<TbxMatBottomSheetResult<T, F>>; // Information severity + OK/Cancel + content projection
}
```

#### Internal helpers

- `mergeDefaults<T>(config, defaultSeverity)` — applies the severity default; preserves explicit overrides; defers icon resolution to render time.
- `hasFocusTarget(config, resolvedFooter)` — `true` if the dialog has a content component or a footer button with `result === Affirm`. Drives `autoFocus: 'first-tabbable'` vs `'dialog'`.
- `open<T, F>(config, resolvedFooter)` — opens `BottomSheetShellComponent` via `MatBottomSheet.open()`, attaches panel classes, awaits dismissal, returns the typed result. Catches `undefined` from `afterDismissed()` (backdrop / Escape) and returns `{ result: Close, footerValues: {} }`.

### Config

```typescript
interface TbxMatBottomSheetConfig<T = void> {
    title: string; // required
    icon?: string; // Material Symbols name; overrides severity icon
    subtitle?: string;
    contextBadge?: string;
    message?: string; // ignored when `content` is provided
    type?: TbxMatSeverityLevel;
    content?: Type<TbxMatBottomSheetData<T>>; // projected component
    footer?: readonly TbxMatBottomSheetFooterControlType[];
    disableClose?: boolean;
    dragHandle?: boolean; // default false — opt-in grabber pill
    // No width / minWidth / maxWidth / minHeight / maxHeight (intentionally absent).
}

type TbxMatBottomSheetConfigArgs<T> = { title: string } & Partial<Omit<TbxMatBottomSheetConfig<T>, 'title'>>;
```

### Result

```typescript
interface TbxMatBottomSheetResult<T = void, F = Record<string, unknown>> {
    result: TbxMatBottomSheetDismissReason;
    data?: T; // present only on Affirm with content
    footerValues: F; // {} on any non-Affirm dismissal
}

enum TbxMatBottomSheetDismissReason {
    Affirm = 'affirm',
    Deny = 'deny',
    Cancel = 'cancel',
    Close = 'close',
}
```

### Input contract

```typescript
interface TbxMatBottomSheetData<T> {
    readonly isValid: Signal<boolean>; // gates affirm button disabled state
    readonly value: Signal<T>; // extracted on Affirm
}
```

### Footer item model

```typescript
type TbxMatBottomSheetFooterControlType =
    | TbxMatBottomSheetFooterButton
    | TbxMatBottomSheetFooterCheckbox
    | TbxMatBottomSheetFooterToggle
    | TbxMatBottomSheetFooterRadioGroup
    | TbxMatBottomSheetFooterToggleGroup;

interface TbxMatBottomSheetFooterItem {
    readonly key: string;
    readonly align: 'start' | 'end';
}

interface TbxMatBottomSheetFooterButton extends TbxMatBottomSheetFooterItem {
    readonly type: 'button';
    readonly label: string;
    readonly icon?: string;
    readonly iconPosition?: 'before' | 'after';
    readonly emphasis?: 'primary' | 'destructive' | 'text';
    readonly result?: TbxMatBottomSheetDismissReason;
    readonly disabled?: boolean | Signal<boolean>;
}

interface TbxMatBottomSheetFooterCheckbox extends TbxMatBottomSheetFooterItem {
    readonly type: 'checkbox';
    readonly label: string;
    readonly initialValue?: boolean;
}

interface TbxMatBottomSheetFooterToggle extends TbxMatBottomSheetFooterItem {
    readonly type: 'toggle';
    readonly label: string;
    readonly initialValue?: boolean;
}

interface TbxMatBottomSheetFooterRadioGroup extends TbxMatBottomSheetFooterItem {
    readonly type: 'radio-group';
    readonly options: readonly TbxMatBottomSheetFooterRadioOption[];
    readonly initialValue?: string;
}

interface TbxMatBottomSheetFooterRadioOption {
    readonly label: string;
    readonly value: string;
}

interface TbxMatBottomSheetFooterToggleGroup extends TbxMatBottomSheetFooterItem {
    readonly type: 'toggle-group';
    readonly options: readonly TbxMatBottomSheetFooterToggleOption[];
    readonly multiple?: boolean;
    readonly initialValue?: string | string[];
}

interface TbxMatBottomSheetFooterToggleOption {
    readonly label: string;
    readonly value: string;
    readonly icon?: string;
}
```

Layout rule: a single flex row of items in array order. The first item with `align: 'end'` gets `margin-left: auto`. On `Affirm`, every item's value is collected into the `F` record keyed by `key`. Non-Affirm dismissals return `footerValues: {}`.

### Button presets (constants)

```typescript
TBX_MAT_BOTTOM_SHEET_BUTTONS_OK; // single OK (primary, end)
TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL; // Cancel (text, start) + OK (primary, end)
TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO; // No (text, end) + Yes (primary, end)
TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL; // Cancel (text, start) + No (text, end) + Yes (primary, end)
```

Same shapes / labels / emphasis / alignment as the dialog presets.

> No `TBX_MAT_BOTTOM_SHEET_DEFAULT_WIDTH` constant — sizing is dropped.

### Provider config & token

```typescript
interface TbxMatBottomSheetProviderConfig {
    readonly severityIconResolverService: TbxMatSeverityResolver &
        TbxMatIconResolver<TbxMatSeverityLevel> & { readonly iconType: TbxMatIconType };
    readonly closeIconResolverService?: TbxMatBottomSheetIconResolver;
}

type TbxMatBottomSheetIconResolver = TbxMatIconResolver<string> & { readonly iconType: TbxMatIconType };

const TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG = new InjectionToken<TbxMatBottomSheetProviderConfig>(
    'TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG'
);
```

No automatic provider registration. Without an explicit provider, the shell will not render — documented on the token's TSDoc and in the README installation section.

### Concrete icon resolver services

Three services ship in the package, each `@Injectable`:

- `TbxMatBottomSheetSeverityFontIconService` — registers Material Symbols font icons keyed by `TbxMatSeverityLevel`.
- `TbxMatBottomSheetSeveritySvgIconService` — registers SVG icons keyed by `TbxMatSeverityLevel`.
- `TbxMatBottomSheetCloseFontIconService` — default close-button icon resolver (font).

Each subclasses base classes from `@teqbench/tbx-mat-icons` / `@teqbench/tbx-mat-severity-theme` and exposes `initialize()` for icon registration plus an `iconType` flag (`Font` or `Svg`) used by the shell to choose between font-ligature and SVG rendering.

## Shell Component

`BottomSheetShellComponent`, selector `tbx-mat-bottom-sheet-shell`, internal-only (not exported). `ChangeDetectionStrategy.OnPush`. Standalone.

### Anatomy (top to bottom)

1. **Drag handle** — rendered only when `config.dragHandle === true`. Centered grabber pill, decorative (`aria-hidden="true"`).
2. **Header** — severity-tinted icon circle, `<h2>` title, optional subtitle, optional context-badge chip, close button (resolver-driven icon, `aria-label="Close bottom sheet"`).
3. **Divider**.
4. **Body** — message text _or_ the projected component (instantiated dynamically via `ViewContainerRef.createComponent()` inside an `afterNextRender()` hook — never both).
5. **Divider** — conditional on a non-empty footer.
6. **Footer** — single flex row per the footer-item rules.

### Injection dependencies

- `MAT_BOTTOM_SHEET_DATA` — `BottomSheetShellData` `{ config, resolvedFooter }`.
- `MatBottomSheetRef` — for dismissal.
- `TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG` — required (severity icon resolver) + optional (close icon resolver, falls back to `TbxMatBottomSheetCloseFontIconService`).
- `MAT_ICON_DEFAULT_OPTIONS` — for font-set resolution.

### Reactive state (signals)

- Resolved severity icon, resolved close icon — `computed()` from provider config + per-call `config.icon` override.
- Footer values — backing signals per item, exposed as a single computed record.
- Affirm-button disabled state — supports `boolean | Signal<boolean>` and the input contract's `isValid: Signal<boolean>` for projected content.

### Auto-focus

- Service determines `hasFocusTarget` and passes `autoFocus: 'first-tabbable' | 'dialog'` on `MatBottomSheetConfig.autoFocus` (this maps to the same overlay focus trap behavior).
- Within the shell, `cdkFocusInitial` is conditionally placed on:
    - the projected content (if any), else
    - the first affirm button, else
    - the shell host.

### Panel classes

Service applies `panelClass: ['tbx-mat-bottom-sheet-panel', 'tbx-mat-bottom-sheet-panel-{severity}']` where `{severity}` is one of `default | success | error | warning | information | help`.

### Styles

`src/styles/_tbx-mat-bottom-sheet.scss` is the entry partial. Consumers `@use '@teqbench/tbx-mat-bottom-sheets/styles/tbx-mat-bottom-sheet'` once, globally. Severity-tinted CSS custom properties come from `@teqbench/tbx-mat-severity-theme`.

## Tests

[Vitest](https://vitest.dev) + `@analogjs/vitest-angular`.

- `src/test-setup.ts` — Angular compiler + `setupTestBed` (copy verbatim from dialog package).
- `vitest.config.ts` — jsdom env, globals enabled, `setupFiles: src/test-setup.ts`. Coverage exclusions: `src/constants/**`, `src/enums/**`, `src/models/**`, `src/tokens/**`, `src/types/**`, `src/test-setup.ts`, `src/**/*.stories.ts`. Per-file thresholds 80/80/80/75.
- Spec files adjacent to source.

### Service spec coverage

- For each public method: defaults applied (severity, icon, footer), explicit overrides preserved, `MatBottomSheet.open()` called with `BottomSheetShellComponent` + correct data + correct panel classes + correct `autoFocus`, return type shape.
- `mergeDefaults` — merging precedence (explicit user value beats default).
- Footer preset application on `confirm()` and `input()`.
- Dismissal-without-result (`afterDismissed()` emits `undefined`) → `{ result: Close, footerValues: {} }`.
- `hasFocusTarget` outcomes drive correct `autoFocus` value.

### Shell spec coverage

- Drag handle conditionally rendered.
- Icon resolution branches (font vs SVG).
- Close button visible / hidden when `disableClose` toggles.
- Body renders `message` text vs projected `content` (mutually exclusive).
- Footer flex row: `margin-left: auto` applied to first `align: 'end'` item.
- Affirm button disabled state honors `boolean | Signal<boolean>` and the `isValid` contract.
- `cdkFocusInitial` lands on the right element per `hasFocusTarget` rule.
- Dismissal paths: footer button with `result` → ref `dismiss(result)`; close button → `dismiss({ result: Close, footerValues: {} })`.

### Icon-service specs

Mirror dialog icon-service specs: registration of expected icons, font-set resolution fallback chain, `iconType` flag.

## Documentation

Inputs feeding the README generator (mirroring dialog package):

- `docs/overview.md` — package purpose; positioning vs `tbx-mat-dialogs`, `tbx-mat-banners`, `tbx-mat-notifications`; severity-leveled API; footer model; drag-handle opt-in; "When to use" criteria (modal, mobile-friendly anchored surface, optional drag affordance).
- `docs/concepts.yml` — glossary: severity level, dismiss reason, footer item, footer button emphasis, content component, provider config, drag handle.
- `docs/features.yml` — feature bullets: severity-leveled API, dialog-only-style UX patterns, async by default, typed input sheets, rich footer controls, pluggable icons, theming via CSS custom properties, modal semantics, drag-handle opt-in.
- `docs/accessibility.md` — modal semantics inherited from `MatBottomSheet`, focus management, keyboard (Escape, Tab, Enter/Space on buttons), reduced motion, color contrast, decorative icons (`aria-hidden`), close-button `aria-label`.
- `docs/related.yml` — cross-references to the three sibling packages.
- `docs/reference/workflows/` — per-pipeline documentation files for each `.github/workflows/*.yml`.

README structure: badges → tagline → TOC → Overview → At a glance (from features.yml) → When to use → Installation → Usage (with code examples for severity methods, confirm, input, footer controls, show, drag handle) → Concepts (from concepts.yml) → API Reference → Styling → Accessibility → Compatibility → Related packages → Versioning & releases → Contributing → Security → **Feedback** (bug-report and feature-request issue-template links) → License.

## Build & Publish

- `ng-package.json` — entry `src/index.ts`, dist `dist/`, assets: `CHANGELOG.md`, `src/styles/**` → `styles/`, `docs/*.{md,yml}` → `docs/`.
- `tsconfig.json`, `tsconfig.build.json`, `tsconfig.spec.json` — copy verbatim. Strict mode, ES2022 target, bundler module resolution, isolatedModules, verbatimModuleSyntax. Angular partial compilation.
- `tsdoc.json` — copy verbatim (custom tags `@category`, `@since`, `@related`, `@usage`, `@displayName`, `@order`).
- Release flow: [Release Please](https://github.com/googleapis/release-please) on push to `main`; publishes from `dist/` to GitHub Packages (`@teqbench` scope).

### `package.json` highlights

- `name`: `@teqbench/tbx-mat-bottom-sheets`
- `license`: `AGPL-3.0-only`
- `engines.node`: `>=24.0.0`
- `type`: `module`
- `exports."./styles/*"`: `{ "sass": "./styles/_*.scss" }`
- `peerDependencies`:

```
@angular/cdk                       >=21.0.0
@angular/core                      >=21.0.0
@angular/material                  >=21.0.0
@teqbench/tbx-mat-icons            >=4.0.0
@teqbench/tbx-mat-severity-theme   >=8.0.0
```

- `devDependenciesPinned` rationale block — copy verbatim:
    - `typescript-eslint` pinned without `^` (patch releases have introduced breaking rule changes; update deliberately).
    - `@types/node` pinned to major version matching Node runtime.
- `overrides` — Vite pinned to `7.3.2` (workaround for `@angular/build`; remove when upstream supports newer Vite).

### `release-please-config.json`

Copy verbatim, swap `package-name` to `"@teqbench/tbx-mat-bottom-sheets"`. `extra-files` updates `package.json` and `package-lock.json`. `include-component-in-tag: false`. Initial version `0.1.0`.

## Lint, Format, Hooks

- `eslint.config.js` — flat config; Angular ESLint recommended + typescript-eslint recommended + `tsdoc/syntax`. Component selector prefix `tbx` (kebab-case), directive prefix `tbx` (camelCase).
- `.prettierrc` — 4-space indent for ts/scss/css, 2-space for json/yml, single quotes for ts, semicolons, trailing comma `es5`, print width 999 (md 120), prose wrap preserve.
- `.editorconfig` — 4-space indent, UTF-8, LF.
- `.husky/pre-commit` → `lint-staged`, which runs `prettier --write` on staged `*.{ts,json,md,yml,yaml,scss,css}`.

## Workflows

`.github/workflows/` — six thin callers delegating to `teqbench/.github` reusable workflows:

- `ci.yml` — push/PR to `main`/`dev`. Passes `GIST_ID` for badges.
- `release.yml` — push to `main`. Release-please.
- `sync.yml` — repository sync (config / workflows / skills from `teqbench/.github`).
- `dep-compat-check.yml` — verifies declared peers vs dev deps.
- `docs-deploy.yml` — generated-docs deploy.
- `claude.yml` — Claude Code automation hooks.

Concurrency groups match dialog package: `ci-${{ github.repository }}-${{ github.ref }}` (cancel-in-progress: false), `release-${{ github.repository }}` (cancel-in-progress: false).

## TSDoc Convention

Every export has TSDoc per the project convention:

- Standard tags: `@remarks`, `@typeParam`, `@param`, `@returns`, `@example`, `@public`/`@internal`, `@packageDocumentation` (on `index.ts`), `@see`, `@deprecated`.
- Custom tags: `@category`, `@since`, `@related`, `@usage`, `@displayName`, `@order`.
- Tag order: summary → `@remarks` → `@typeParam`/`@param`/`@returns` → `@usage` → `@example` → `@see` → `@category` → `@displayName` → `@order` → `@since` → `@related` → `@public`/`@internal`.
- Member ordering precedence and `@order` rules per `CLAUDE.md`.
- External links use `{@link url | Name}` inline syntax in every section where an external technology appears, with one `@see {@link url | Name}` tag per distinct external resource referenced in the summary.
- All exported classes and functions include `@example` blocks.

## External Linking Convention

Every prose mention of an external specification, standard, or technology in markdown files and TSDoc comments must be hyperlinked.

- Markdown: `[Name ↗](url)` (↗ U+2197).
- TSDoc: `{@link url | Name}` inline.

## AI Friendliness Convention

All TSDoc and markdown is written for AI consumption. Disambiguation, context completeness, structural consistency, and semantic clarity rules per `CLAUDE.md` are enforced.

## Pinned-Rationale Convention

All non-default dependency constraints in `package.json` are documented in a sibling `<field>Pinned` object with a `"//"` array of rationale lines. The custom field is identified as custom in any prose that references it.

## Implementation Strategy

The implementation will be a near-mechanical clone of `tbx-mat-dialogs` with a global rename and the two surgical adjustments (drop sizing fields, add `dragHandle`). This is best executed via `writing-plans` as a step-by-step plan: scaffold → rename → adjust config → adjust shell → tests → docs → workflows → publish-readiness.

## Open Questions

None at this time. Two adjustments to the dialog blueprint were captured during brainstorming and are reflected throughout this spec; everything else mirrors `tbx-mat-dialogs` 1:1.
