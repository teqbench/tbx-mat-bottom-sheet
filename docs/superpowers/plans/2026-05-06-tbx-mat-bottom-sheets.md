# `@teqbench/tbx-mat-bottom-sheets` Implementation Plan

> **Update 2026-05-07:** The `dragHandle` config field was removed post-implementation. The pill was decorative-only (no drag-to-dismiss behavior), which set up an expectation the package didn't fulfill. See `git log --grep='remove dragHandle'` for the removal commits.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clone `@teqbench/tbx-mat-dialogs` into `@teqbench/tbx-mat-bottom-sheets`, swapping `MatDialog` for `MatBottomSheet` and applying two surgical adjustments — drop sizing config fields and add an opt-in `dragHandle?: boolean` — to produce a fully tested, lintable, buildable, publishable Angular library.

**Architecture:** Near-mechanical 1:1 mirror of `tbx-mat-dialogs` per the design spec at `docs/superpowers/specs/2026-05-06-tbx-mat-bottom-sheet-design.md`. Same shell anatomy, same severity-leveled API, same footer-item model, same provider-config token pattern, same TSDoc / lint / format / test / docs / workflow conventions. Implementation-difference: the service opens `BottomSheetShellComponent` via `MatBottomSheet.open()` and awaits `afterDismissed()` instead of `afterClosed()`.

**Tech Stack:** [TypeScript](https://www.typescriptlang.org) 5.9+ (strict, ES2022, bundler resolution), [Angular](https://angular.dev) 21+, [Angular Material](https://material.angular.dev) 21+, [Vitest](https://vitest.dev) 4 + `@analogjs/vitest-angular`, [ng-packagr](https://github.com/ng-packagr/ng-packagr) 21+, [ESLint](https://eslint.org) flat config + `angular-eslint` + `typescript-eslint` + `eslint-plugin-tsdoc`, [Prettier](https://prettier.io), [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged), [Release Please](https://github.com/googleapis/release-please).

**Reference source:** `/Users/ben/Development/TeqBench/tbx-mat-dialogs` is added as a working directory and is the authoritative blueprint. Most tasks below copy a file from there and apply a rename map. Storybook setup is **out of scope** for this plan and is deferred to a follow-up plan.

---

## Global Rename Map

Apply these renames whenever a file is copied from `tbx-mat-dialogs`:

<dl>
    <dt><code>@teqbench/tbx-mat-dialogs</code> (in code/imports/docs)</dt>
    <dd>Replace with <code>@teqbench/tbx-mat-bottom-sheets</code>.</dd>
    <dt><code>TbxMatDialog</code> (PascalCase prefix)</dt>
    <dd>Replace with <code>TbxMatBottomSheet</code>.</dd>
    <dt><code>tbxMatDialog</code> (camelCase prefix)</dt>
    <dd>Replace with <code>tbxMatBottomSheet</code>.</dd>
    <dt><code>TBX_MAT_DIALOG_</code> (UPPER_SNAKE prefix)</dt>
    <dd>Replace with <code>TBX_MAT_BOTTOM_SHEET_</code>.</dd>
    <dt><code>tbx-mat-dialog</code> (kebab-case prefix in selectors / panel classes / SCSS)</dt>
    <dd>Replace with <code>tbx-mat-bottom-sheet</code>.</dd>
    <dt><code>dialog</code> (file/directory names)</dt>
    <dd>Replace with <code>bottom-sheet</code>.</dd>
    <dt><code>Dialog</code> (in prose, comments, docs, README)</dt>
    <dd>Replace with <code>BottomSheet</code> (TitleCase) or <code>bottom sheet</code> (prose).</dd>
    <dt><code>MatDialog</code>, <code>MatDialogRef</code>, <code>MAT_DIALOG_DATA</code>, <code>MatDialogConfig</code></dt>
    <dd>Replace with <code>MatBottomSheet</code>, <code>MatBottomSheetRef</code>, <code>MAT_BOTTOM_SHEET_DATA</code>, <code>MatBottomSheetConfig</code>.</dd>
    <dt><code>afterClosed()</code></dt>
    <dd>Replace with <code>afterDismissed()</code>.</dd>
    <dt><code>dialogRef.close(...)</code></dt>
    <dd>Replace with <code>ref.dismiss(...)</code>.</dd>
    <dt>Module path <code>@angular/material/dialog</code></dt>
    <dd>Replace with <code>@angular/material/bottom-sheet</code>.</dd>
</dl>

**Surgical adjustments** (NOT mechanical — these alter behavior):

1. Drop `width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` from `TbxMatBottomSheetConfig` and any references in tests.
2. Drop `TBX_MAT_DIALOG_DEFAULT_WIDTH` constant — do **not** create `TBX_MAT_BOTTOM_SHEET_DEFAULT_WIDTH`. Remove from barrel and tests.
3. Add `dragHandle?: boolean` to `TbxMatBottomSheetConfig` (default `false` when used in shell). Default not explicit in interface; consumed as `config.dragHandle === true` in shell template.
4. The shell renders a centered grabber pill above the header, gated on `config.dragHandle === true`.

---

## Phase 1 — Repo Bootstrap

### Task 1: Update `package.json` with the package name, description, scripts, peer deps, dev deps

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Replace the file contents**

Replace the file with the following (storybook scripts are intentionally absent — Storybook is deferred):

```json
{
    "name": "@teqbench/tbx-mat-bottom-sheets",
    "version": "0.7.0",
    "description": "Opinionated Angular bottom sheet service built on Material's MatBottomSheet. Severity-leveled methods (success / error / warning / information / help / default) plus dialog-style UX patterns (confirm / input). Returns Promise<TbxMatBottomSheetResult<T, F>>. Severity colors via @teqbench/tbx-mat-severity-theme; pluggable icons via TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG. Optional drag-handle affordance. Angular 21+.",
    "type": "module",
    "exports": {
        "./styles/*": {
            "sass": "./styles/_*.scss"
        }
    },
    "license": "AGPL-3.0-only",
    "engines": {
        "node": ">=24.0.0"
    },
    "publishConfig": {
        "registry": "https://npm.pkg.github.com"
    },
    "scripts": {
        "build": "ng-packagr -p ng-package.json -c tsconfig.build.json",
        "typecheck": "tsc --noEmit",
        "lint": "eslint .",
        "test": "vitest run",
        "test:coverage": "vitest run --coverage",
        "format": "prettier --write .",
        "format:check": "prettier --check .",
        "prepare": "husky"
    },
    "devDependenciesPinned": {
        "//": [
            "typescript-eslint is pinned without ^ because patch releases have historically introduced",
            "breaking rule changes. Pin to a known-good version and update deliberately after testing.",
            "@types/node is pinned to the major version matching the Node runtime (24). Auto-updating",
            "to 25 pulls in type definitions for APIs not available on the target runtime, which can",
            "mask compatibility issues. Re-evaluate when the project moves to the next even-numbered Node LTS."
        ]
    },
    "peerDependencies": {
        "@angular/cdk": ">=21.0.0",
        "@angular/core": ">=21.0.0",
        "@angular/material": ">=21.0.0",
        "@teqbench/tbx-mat-icons": ">=4.0.0",
        "@teqbench/tbx-mat-severity-theme": ">=8.0.0"
    },
    "devDependencies": {
        "@analogjs/vite-plugin-angular": "^2.3.1",
        "@analogjs/vitest-angular": "^2.3.1",
        "@angular/animations": "^21.2.6",
        "@angular/build": "^21.2.4",
        "@angular/cdk": "^21.2.4",
        "@angular/common": "^21.2.6",
        "@angular/compiler": "^21.2.6",
        "@angular/compiler-cli": "^21.2.6",
        "@angular/core": "^21.2.6",
        "@angular/forms": "^21.2.6",
        "@angular/material": "^21.2.4",
        "@angular/platform-browser": "^21.2.6",
        "@angular/platform-browser-dynamic": "^21.2.6",
        "@teqbench/tbx-mat-icons": "^4.2.0",
        "@teqbench/tbx-mat-severity-theme": "^8.0.2",
        "@types/node": "~24.12.0",
        "@vitest/coverage-v8": "^4.1.1",
        "angular-eslint": "^21.3.1",
        "eslint": "^9.39.2",
        "eslint-plugin-tsdoc": "^0.5.2",
        "husky": "^9.1.7",
        "jsdom": "^29.0.1",
        "lint-staged": "^16.3.3",
        "ng-packagr": "^21.2.2",
        "prettier": "^3.8.1",
        "typescript": "~5.9.0",
        "typescript-eslint": "8.58.0",
        "vitest": "^4.0.18",
        "zone.js": "^0.16.1"
    },
    "//overrides": "Pin vite to 7.3.2 — @angular/build bundles vite internally but does not constrain the version tightly enough; 7.4+ causes build failures with ng-packagr. Remove when @angular/build supports vite 7.4+.",
    "overrides": {
        "@angular/build": {
            "vite": "7.3.2"
        }
    },
    "lint-staged": {
        "*.{ts,json,md,yml,yaml,scss,css}": ["prettier --write"]
    }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: lockfile updated, no errors. (`npm ci` would fail because the existing lockfile predates the new deps.)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): set package name and add Angular + Material + teqbench peer deps

Adds Angular 21, Material 21, @teqbench/tbx-mat-icons, @teqbench/tbx-mat-severity-theme
peers, and the Vitest + Analog test toolchain. Storybook devDeps deferred to a follow-up.
Mirrors tbx-mat-dialogs except for storybook scripts/devDeps."
```

---

### Task 2: Update `release-please-config.json`

**Files:**

- Modify: `release-please-config.json`

- [ ] **Step 1: Read the current file**

Read `/Users/ben/Development/TeqBench/tbx-mat-bottom-sheet/release-please-config.json` and `/Users/ben/Development/TeqBench/tbx-mat-dialogs/release-please-config.json` to compare.

- [ ] **Step 2: Replace package-name in the bottom-sheet config**

The file already has the structure; only `packages."."` needs `package-name: "@teqbench/tbx-mat-bottom-sheets"` (or whichever field the dialog repo uses — match exactly).

- [ ] **Step 3: Verify `extra-files` covers `package.json` and `package-lock.json`**

Match the dialog repo's `extra-files` entries verbatim.

- [ ] **Step 4: Commit**

```bash
git add release-please-config.json
git commit -m "chore: set release-please package name to @teqbench/tbx-mat-bottom-sheets"
```

---

### Task 3: Update `ng-package.json` to publish styles and docs as assets

**Files:**

- Modify: `ng-package.json`

- [ ] **Step 1: Replace the file**

```json
{
    "$schema": "./node_modules/ng-packagr/ng-package.schema.json",
    "lib": {
        "entryFile": "src/index.ts"
    },
    "dest": "dist",
    "assets": [
        "CHANGELOG.md",
        {
            "input": "src/styles",
            "glob": "**/*",
            "output": "styles"
        },
        {
            "input": "docs",
            "glob": "*.{md,yml}",
            "output": "docs"
        }
    ]
}
```

- [ ] **Step 2: Commit**

```bash
git add ng-package.json
git commit -m "build: publish src/styles and docs/*.{md,yml} as ng-packagr assets"
```

---

### Task 4: Update `vitest.config.ts` to support Angular and apply per-file coverage thresholds

**Files:**

- Modify: `vitest.config.ts`

- [ ] **Step 1: Replace the file with the dialog package's version**

Read `/Users/ben/Development/TeqBench/tbx-mat-dialogs/vitest.config.ts` and copy verbatim. Coverage exclusions to confirm: `src/constants/**`, `src/enums/**`, `src/models/**`, `src/tokens/**`, `src/types/**`, `src/test-setup.ts`, `src/**/*.stories.ts`. Per-file thresholds: 80 / 80 / 80 / 75. SetupFiles: `src/test-setup.ts`. Environment: `jsdom`. Globals: `true`.

- [ ] **Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "test: configure Vitest for Angular + jsdom with per-file coverage thresholds"
```

---

### Task 5: Update `eslint.config.js` to use Angular ESLint + tsdoc/syntax + selector prefix `tbx`

**Files:**

- Modify: `eslint.config.js`

- [ ] **Step 1: Replace with the dialog package's eslint config**

Read `/Users/ben/Development/TeqBench/tbx-mat-dialogs/eslint.config.js` and copy verbatim. Component selector prefix `tbx` (kebab-case), directive selector prefix `tbx` (camelCase).

- [ ] **Step 2: Commit**

```bash
git add eslint.config.js
git commit -m "chore: adopt Angular ESLint + typescript-eslint + tsdoc/syntax flat config"
```

---

### Task 6: Add `tsconfig.spec.json` for Vitest to compile spec files

**Files:**

- Create: `tsconfig.spec.json`

- [ ] **Step 1: Read the dialog package's spec tsconfig**

Read `/Users/ben/Development/TeqBench/tbx-mat-dialogs/tsconfig.spec.json` and copy verbatim. Should extend `tsconfig.json` and include `**/*.spec.ts` and `**/test-setup.ts`.

- [ ] **Step 2: Commit**

```bash
git add tsconfig.spec.json
git commit -m "test: add tsconfig.spec.json scoped to specs and test-setup"
```

---

### Task 7: Verify `tsconfig.json`, `tsconfig.build.json`, `tsdoc.json`, `.prettierrc`, `.editorconfig` match the dialog package

**Files:**

- Modify (only if drift): `tsconfig.json`, `tsconfig.build.json`, `tsdoc.json`, `.prettierrc`, `.editorconfig`

- [ ] **Step 1: Diff each file vs the dialog package**

```bash
for f in tsconfig.json tsconfig.build.json tsdoc.json .prettierrc .editorconfig; do
  echo "=== $f ==="
  diff -u /Users/ben/Development/TeqBench/tbx-mat-bottom-sheet/$f /Users/ben/Development/TeqBench/tbx-mat-dialogs/$f || true
done
```

- [ ] **Step 2: For any file that differs, copy the dialog version verbatim**

The bottom-sheet package must match the dialog package exactly on these.

- [ ] **Step 3: Commit (if any changes)**

```bash
git add tsconfig.json tsconfig.build.json tsdoc.json .prettierrc .editorconfig
git commit -m "chore: align tsconfig / tsdoc / prettier / editorconfig with tbx-mat-dialogs"
```

---

## Phase 2 — Test Infrastructure & Template Cleanup

### Task 8: Create `src/test-setup.ts`

**Files:**

- Create: `src/test-setup.ts`

- [ ] **Step 1: Read the dialog package's test setup and copy verbatim**

```bash
# Reference: /Users/ben/Development/TeqBench/tbx-mat-dialogs/src/test-setup.ts
```

This file initializes the Angular compiler and `setupTestBed` from `@analogjs/vitest-angular`. No renames apply — this is a generic Angular test setup.

- [ ] **Step 2: Commit**

```bash
git add src/test-setup.ts
git commit -m "test: add Angular Vitest test-setup"
```

---

### Task 9: Remove the template `greet` files

**Files:**

- Delete: `src/greet.ts`, `src/greet.spec.ts`
- Modify: `src/index.ts` (remove the export)

- [ ] **Step 1: Read `src/index.ts` to confirm what it exports**

- [ ] **Step 2: Delete the greet files**

```bash
git rm src/greet.ts src/greet.spec.ts
```

- [ ] **Step 3: Replace `src/index.ts` with a minimal placeholder**

This will be filled in fully in Task 25; for now, leave a single line:

```typescript
/**
 * @packageDocumentation
 */
```

- [ ] **Step 4: Run typecheck and tests**

```bash
npm run typecheck && npm test
```

Expected: typecheck passes; vitest reports "no tests" (acceptable for now).

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "chore: remove template greet placeholder"
```

---

## Phase 3 — Models, Types, Enums, Constants, Token

These are pure-TypeScript files (no Angular runtime). Copy each from the dialog package, apply the global rename map, **drop sizing fields where they appear in `TbxMatDialogConfig`**, and **do not create `TBX_MAT_BOTTOM_SHEET_DEFAULT_WIDTH`**.

### Task 10: Create the dismiss-reason enum

**Files:**

- Create: `src/enums/bottom-sheet-dismiss-reason.enum.ts`

- [ ] **Step 1: Read `src/enums/dialog-dismiss-reason.enum.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map and write to the bottom-sheet path**

Rename `TbxMatDialogDismissReason` → `TbxMatBottomSheetDismissReason`, `Dialog` → `BottomSheet` in TSDoc, `dialog` → `bottom sheet` in prose. Enum values stay `'affirm' | 'deny' | 'cancel' | 'close'`.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/enums/bottom-sheet-dismiss-reason.enum.ts
git commit -m "feat: add TbxMatBottomSheetDismissReason enum"
```

---

### Task 11: Create the footer-item interfaces

**Files:**

- Create: `src/models/bottom-sheet-footer.model.ts`

- [ ] **Step 1: Read `src/models/dialog-footer.model.ts` from the dialog package**

- [ ] **Step 2: Apply the global rename map**

All `TbxMatDialogFooter*` interfaces → `TbxMatBottomSheetFooter*`. References to `TbxMatDialogDismissReason` → `TbxMatBottomSheetDismissReason`. Update the import path for the dismiss-reason enum to the new path.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/models/bottom-sheet-footer.model.ts
git commit -m "feat: add footer-item interfaces (button, checkbox, toggle, radio-group, toggle-group)"
```

---

### Task 12: Create the resolved-icon (internal) model

**Files:**

- Create: `src/models/resolved-icon.model.ts`

- [ ] **Step 1: Copy from `src/models/resolved-icon.model.ts` in the dialog package**

This file is internal (`@internal` tag). No prefix renames likely needed inside the type body, but TSDoc text mentioning "dialog" must change to "bottom sheet".

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/models/resolved-icon.model.ts
git commit -m "feat: add internal ResolvedIcon model"
```

---

### Task 13: Create the config / result / data interfaces — drop sizing fields

**Files:**

- Create: `src/models/bottom-sheet.model.ts`

This is the file with the surgical adjustments.

- [ ] **Step 1: Read `src/models/dialog.model.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map and the surgical adjustments**

For `TbxMatBottomSheetConfig<T = void>`:

- Rename per the global rename map.
- **REMOVE** these fields entirely (interface property + TSDoc): `width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`.
- **ADD** `dragHandle?: boolean` with TSDoc:

```typescript
/**
 * Render a centered drag-handle pill above the header
 *
 * @remarks
 * When `true`, the shell renders a small grabber pill — a visual affordance signalling
 * dismissibility. Decorative only; the pill is not interactive (no drag-to-dismiss
 * implementation in this package). Defaults to `false` to keep the default chrome
 * aligned with the dialog look.
 *
 * @order 11
 *
 * @public
 */
readonly dragHandle?: boolean;
```

For `TbxMatBottomSheetResult<T, F>`, `TbxMatBottomSheetData<T>`: rename only.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/models/bottom-sheet.model.ts
git commit -m "feat: add config / result / input-data models

Drops width/minWidth/maxWidth/minHeight/maxHeight (no MatBottomSheetConfig analogue)
and introduces dragHandle?: boolean (default false) for the grabber-pill affordance."
```

---

### Task 14: Create the provider-config interface

**Files:**

- Create: `src/models/bottom-sheet-provider-config.model.ts`

- [ ] **Step 1: Read `src/models/dialog-provider-config.model.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map**

`TbxMatDialogProviderConfig` → `TbxMatBottomSheetProviderConfig`. `TbxMatDialogIconResolver` import path updates.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/models/bottom-sheet-provider-config.model.ts
git commit -m "feat: add provider-config model"
```

---

### Task 15: Create the type aliases

**Files:**

- Create: `src/types/bottom-sheet-config-override.type.ts`
- Create: `src/types/bottom-sheet-footer-control.type.ts`
- Create: `src/types/bottom-sheet-icon-resolver.type.ts`

- [ ] **Step 1: Copy each file from `src/types/` in the dialog package**

Apply the rename map. The `TbxMatBottomSheetConfigArgs<T>` partial-omit type must reference the bottom-sheet config (which already has sizing dropped, so no further adjustment is needed).

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/types
git commit -m "feat: add config-args / footer-control / icon-resolver type aliases"
```

---

### Task 16: Create the provider-config injection token

**Files:**

- Create: `src/tokens/bottom-sheet-provider-config.token.ts`

- [ ] **Step 1: Read `src/tokens/dialog-provider-config.token.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map**

Constant name: `TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG`. `InjectionToken` description string also updates.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/tokens/bottom-sheet-provider-config.token.ts
git commit -m "feat: add TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG injection token"
```

---

### Task 17: Create the constants file (button presets) — drop default-width constant

**Files:**

- Create: `src/constants/bottom-sheet.constants.ts`

- [ ] **Step 1: Read `src/constants/dialog.constants.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map and surgical adjustment**

- Rename all four button preset constants (`TBX_MAT_DIALOG_BUTTONS_*` → `TBX_MAT_BOTTOM_SHEET_BUTTONS_*`).
- **REMOVE** `TBX_MAT_DIALOG_DEFAULT_WIDTH` entirely (constant + TSDoc + import in tests).

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/constants/bottom-sheet.constants.ts
git commit -m "feat: add OK / OK_CANCEL / YES_NO / YES_NO_CANCEL button presets"
```

---

## Phase 4 — Icon Resolver Services (with specs)

### Task 18: Severity font-icon service + spec

**Files:**

- Create: `src/services/bottom-sheet-severity-font-icon.service.ts`
- Create: `src/services/bottom-sheet-severity-font-icon.service.spec.ts`

- [ ] **Step 1: Copy source from the dialog package**

Read `src/services/dialog-severity-font-icon.service.ts`. Apply the rename map.

- [ ] **Step 2: Copy spec from the dialog package**

Read `src/services/dialog-severity-font-icon.service.spec.ts`. Apply the rename map.

- [ ] **Step 3: Run the spec**

```bash
npx vitest run src/services/bottom-sheet-severity-font-icon.service.spec.ts
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/services/bottom-sheet-severity-font-icon.service.ts src/services/bottom-sheet-severity-font-icon.service.spec.ts
git commit -m "feat: add severity font-icon resolver service + spec"
```

---

### Task 19: Severity SVG-icon service + spec

**Files:**

- Create: `src/services/bottom-sheet-severity-svg-icon.service.ts`
- Create: `src/services/bottom-sheet-severity-svg-icon.service.spec.ts`

- [ ] **Step 1: Copy source from `src/services/dialog-severity-svg-icon.service.ts` and apply the rename map**

- [ ] **Step 2: Copy spec from `src/services/dialog-severity-svg-icon.service.spec.ts` and apply the rename map**

- [ ] **Step 3: Run the spec**

```bash
npx vitest run src/services/bottom-sheet-severity-svg-icon.service.spec.ts
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/services/bottom-sheet-severity-svg-icon.service.ts src/services/bottom-sheet-severity-svg-icon.service.spec.ts
git commit -m "feat: add severity SVG-icon resolver service + spec"
```

---

### Task 20: Close font-icon service + spec

**Files:**

- Create: `src/services/bottom-sheet-close-font-icon.service.ts`
- Create: `src/services/bottom-sheet-close-font-icon.service.spec.ts`

- [ ] **Step 1: Copy source from `src/services/dialog-close-font-icon.service.ts` and apply the rename map**

The default close-button `aria-label` text must change: `"Close dialog"` → `"Close bottom sheet"` (if hardcoded in this service; otherwise it lives in the shell template — adjust there in Task 22).

- [ ] **Step 2: Copy spec and apply renames**

- [ ] **Step 3: Run the spec**

```bash
npx vitest run src/services/bottom-sheet-close-font-icon.service.spec.ts
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/services/bottom-sheet-close-font-icon.service.ts src/services/bottom-sheet-close-font-icon.service.spec.ts
git commit -m "feat: add close font-icon resolver service + spec"
```

---

## Phase 5 — Shell Component

The shell is the largest single piece (~1000 LOC). It is also where the drag handle is added, which is the only piece of NEW behavior in this package.

### Task 21: Create the shell component (without drag handle)

**Files:**

- Create: `src/components/bottom-sheet-shell.component.ts`

- [ ] **Step 1: Read `src/components/dialog-shell.component.ts` from the dialog package**

- [ ] **Step 2: Apply the global rename map**

- Class name: `BottomSheetShellComponent`.
- Selector: `tbx-mat-bottom-sheet-shell`.
- Imports: `MatBottomSheetRef`, `MAT_BOTTOM_SHEET_DATA` from `@angular/material/bottom-sheet`.
- Replace `dialogRef.close(...)` with `ref.dismiss(...)`.
- Replace `MAT_DIALOG_DATA` injection with `MAT_BOTTOM_SHEET_DATA`.
- Replace `MatDialogTitle`, `MatDialogContent`, `MatDialogActions` directive imports with the bottom-sheet equivalents (or plain `h2` / `div` if no equivalents exist — Angular Material has no `MatBottomSheetTitle` / `MatBottomSheetContent` / `MatBottomSheetActions` directives).
- Replace any `MatDialogConfig` reference in DI / type with `MatBottomSheetConfig`.
- Update the `BottomSheetShellData` (renamed from `DialogShellData`) interface accordingly.
- The close-button `aria-label`: `"Close dialog"` → `"Close bottom sheet"`.
- The panel-class string referenced anywhere: `tbx-mat-dialog-panel*` → `tbx-mat-bottom-sheet-panel*`.

- [ ] **Step 3: DO NOT add drag-handle DOM yet — that lands in Task 22**

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: pass. If `MatDialogTitle` / `MatDialogContent` directives have no bottom-sheet equivalents and the dialog template used them, replace with semantic HTML (`<h2 id="...">`, plain `<div>`s) and ensure `aria-labelledby` still resolves.

- [ ] **Step 5: Commit**

```bash
git add src/components/bottom-sheet-shell.component.ts
git commit -m "feat: add BottomSheetShellComponent (header + body + footer chrome)"
```

---

### Task 22: Add drag-handle conditional rendering — write the failing test first

**Files:**

- Create: `src/components/bottom-sheet-shell.component.spec.ts`

- [ ] **Step 1: Read `src/components/dialog-shell.component.spec.ts` from the dialog package** as a starting template, apply the rename map, and write to the bottom-sheet path. **Do not yet add drag-handle test cases** — leave the file as the renamed dialog tests.

- [ ] **Step 2: Run the spec**

```bash
npx vitest run src/components/bottom-sheet-shell.component.spec.ts
```

Expected: all tests pass (cloned from working dialog tests).

- [ ] **Step 3: Now write a failing test for the drag-handle behavior**

Append to the spec:

```typescript
describe('drag handle', () => {
    it('does not render the drag-handle pill when config.dragHandle is undefined', async () => {
        const fixture = createShell({ title: 'No handle' });
        await fixture.whenStable();

        const handle = fixture.nativeElement.querySelector('.tbx-mat-bottom-sheet-drag-handle');
        expect(handle).toBeNull();
    });

    it('does not render the drag-handle pill when config.dragHandle is false', async () => {
        const fixture = createShell({ title: 'False handle', dragHandle: false });
        await fixture.whenStable();

        const handle = fixture.nativeElement.querySelector('.tbx-mat-bottom-sheet-drag-handle');
        expect(handle).toBeNull();
    });

    it('renders a decorative drag-handle pill when config.dragHandle is true', async () => {
        const fixture = createShell({ title: 'Has handle', dragHandle: true });
        await fixture.whenStable();

        const handle = fixture.nativeElement.querySelector('.tbx-mat-bottom-sheet-drag-handle');
        expect(handle).not.toBeNull();
        expect(handle?.getAttribute('aria-hidden')).toBe('true');
    });
});
```

(The `createShell(config)` helper is established at the top of the spec file from the dialog template; use the same pattern to construct the component with `MAT_BOTTOM_SHEET_DATA` providers.)

- [ ] **Step 4: Run the new tests — they MUST fail**

```bash
npx vitest run src/components/bottom-sheet-shell.component.spec.ts -t "drag handle"
```

Expected: the third test fails ("element is null"); the first two may already pass since the element is absent everywhere.

- [ ] **Step 5: Implement the drag handle in the shell template**

In `bottom-sheet-shell.component.ts`, add to the very top of the component template (above the header):

```typescript
@if (config.dragHandle === true) {
    <div class="tbx-mat-bottom-sheet-drag-handle" aria-hidden="true"></div>
}
```

- [ ] **Step 6: Run the tests — all must pass**

```bash
npx vitest run src/components/bottom-sheet-shell.component.spec.ts -t "drag handle"
```

Expected: all three tests pass.

- [ ] **Step 7: Run the full shell spec**

```bash
npx vitest run src/components/bottom-sheet-shell.component.spec.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/bottom-sheet-shell.component.ts src/components/bottom-sheet-shell.component.spec.ts
git commit -m "feat: render drag-handle pill above header when config.dragHandle is true"
```

---

## Phase 6 — Main Service

### Task 23: Create `TbxMatBottomSheetService`

**Files:**

- Create: `src/services/bottom-sheet.service.ts`

- [ ] **Step 1: Read `src/services/dialog.service.ts` from the dialog package**

- [ ] **Step 2: Apply the global rename map**

Including:

- `TbxMatDialogService` → `TbxMatBottomSheetService`.
- `MatDialog` (injected) → `MatBottomSheet`.
- `MatDialogConfig` → `MatBottomSheetConfig`.
- `dialogRef.afterClosed()` → `ref.afterDismissed()`.
- `dialogRef.close(value)` (in tests/spec) → `ref.dismiss(value)`.
- Panel class array: `'tbx-mat-bottom-sheet-panel'`, `'tbx-mat-bottom-sheet-panel-{severity}'`.
- All references to `DialogShellComponent` → `BottomSheetShellComponent`.
- `TBX_MAT_DIALOG_PROVIDER_CONFIG` and `TBX_MAT_DIALOG_BUTTONS_*` → bottom-sheet versions.

- [ ] **Step 3: Open() helper signature**

`MatBottomSheet.open()` accepts `config: MatBottomSheetConfig`. Build the config the same way the dialog service does, **omitting any width / height keys** (they don't exist on `MatBottomSheetConfig`).

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/bottom-sheet.service.ts
git commit -m "feat: add TbxMatBottomSheetService with show / severity / confirm / input methods"
```

---

### Task 24: Create the service spec

**Files:**

- Create: `src/services/bottom-sheet.service.spec.ts`

- [ ] **Step 1: Read `src/services/dialog.service.spec.ts` from the dialog package**

- [ ] **Step 2: Apply the global rename map and the sizing-drop adjustment**

In the spec:

- All `TbxMatDialog*` and `MatDialog*` references → bottom-sheet versions.
- `afterClosed$` → `afterDismissed$` (and adjust the mocked `MatBottomSheetRef.afterDismissed()` returning the subject).
- **REMOVE any test cases that exercise `width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`** — these fields don't exist anymore and tests for them would fail.
- **REMOVE any test referencing `TBX_MAT_DIALOG_DEFAULT_WIDTH`** — the constant is gone.
- Replace `getShellData()` to extract from the second arg of `MatBottomSheet.open()`'s mock. The shape is `MatBottomSheetConfig.data`.

- [ ] **Step 3: Add a spec asserting that the service does NOT pass any width/height keys to MatBottomSheet.open()**

```typescript
it('does not pass any width or height keys to MatBottomSheet.open()', async () => {
    void service.show({ title: 'Sized?', message: 'No.' });
    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });

    const bottomSheetConfig = bottomSheetSpy.open.mock.calls[0]?.[1] ?? {};
    expect(bottomSheetConfig).not.toHaveProperty('width');
    expect(bottomSheetConfig).not.toHaveProperty('minWidth');
    expect(bottomSheetConfig).not.toHaveProperty('maxWidth');
    expect(bottomSheetConfig).not.toHaveProperty('minHeight');
    expect(bottomSheetConfig).not.toHaveProperty('maxHeight');
});
```

- [ ] **Step 4: Run the spec**

```bash
npx vitest run src/services/bottom-sheet.service.spec.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/bottom-sheet.service.spec.ts
git commit -m "test: add service spec covering all 9 methods, dismissal handling, and sizing-fields-absent"
```

---

## Phase 7 — Styles

### Task 25: Create the SCSS entry partial

**Files:**

- Create: `src/styles/_tbx-mat-bottom-sheet.scss`

- [ ] **Step 1: Read `src/styles/_tbx-mat-dialogs.scss` from the dialog package** (and any partials it `@use`s)

- [ ] **Step 2: Apply the rename map**

Rename selectors from `.tbx-mat-dialog-*` to `.tbx-mat-bottom-sheet-*`. Severity panel classes: `.tbx-mat-bottom-sheet-panel-{severity}` for each of `default | success | error | warning | information | help`.

- [ ] **Step 3: Add drag-handle styles**

Add a small selector for `.tbx-mat-bottom-sheet-drag-handle`:

```scss
.tbx-mat-bottom-sheet-drag-handle {
    display: block;
    width: 2.5rem;
    height: 0.25rem;
    margin: 0.5rem auto 0.25rem;
    border-radius: 0.25rem;
    background: var(--mat-sys-on-surface-variant, currentColor);
    opacity: 0.4;
    pointer-events: none;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/_tbx-mat-bottom-sheet.scss
git commit -m "feat(styles): add bottom-sheet panel classes and drag-handle pill styles"
```

---

## Phase 8 — Public API Barrel

### Task 26: Update `src/index.ts` with the full barrel + `@packageDocumentation`

**Files:**

- Modify: `src/index.ts`

- [ ] **Step 1: Read `src/index.ts` from the dialog package**

- [ ] **Step 2: Apply the rename map and the surgical adjustments**

Drop the `TBX_MAT_DIALOG_DEFAULT_WIDTH` export. Update all paths to the new bottom-sheet file names. Update the `@packageDocumentation` TSDoc to describe the bottom sheet, including the drag-handle opt-in.

The file should end up matching this shape:

```typescript
/**
 * Opinionated bottom sheet service for {@link https://angular.dev | Angular}
 *
 * @remarks
 * Built on {@link https://material.angular.dev/components/bottom-sheet/overview | Angular Material's MatBottomSheet},
 * this package exposes nine async methods returning `Promise<TbxMatBottomSheetResult<T, F>>`:
 * six severity-leveled methods that mirror `tbx-mat-banners` and `tbx-mat-notifications`
 * (`success`, `error`, `warning`, `information`, `help`, `default`), two dialog-style UX
 * patterns (`confirm` for Yes/No, `input` for projected form content), and `show` for
 * full-control configuration.
 *
 * Severity colors come from `@teqbench/tbx-mat-severity-theme`; pluggable icon resolution
 * is wired via {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} with three default services
 * ({@link TbxMatBottomSheetSeverityFontIconService},
 * {@link TbxMatBottomSheetSeveritySvgIconService},
 * {@link TbxMatBottomSheetCloseFontIconService}). Footer is a single flex row of buttons
 * and form controls. Input content components implement {@link TbxMatBottomSheetData}
 * with signal-based validation. An optional drag-handle pill is rendered above the header
 * when `config.dragHandle === true` (default `false`).
 *
 * @see {@link https://angular.dev | Angular}
 * @see {@link https://material.angular.dev/components/bottom-sheet/overview | Angular Material MatBottomSheet}
 *
 * @packageDocumentation
 */

// Enums
export { TbxMatBottomSheetDismissReason } from './enums/bottom-sheet-dismiss-reason.enum';

// Types
export type { TbxMatBottomSheetFooterControlType } from './types/bottom-sheet-footer-control.type';
export type { TbxMatBottomSheetConfigArgs } from './types/bottom-sheet-config-override.type';
export type { TbxMatBottomSheetIconResolver } from './types/bottom-sheet-icon-resolver.type';

// Models
export type {
    TbxMatBottomSheetResult,
    TbxMatBottomSheetConfig,
    TbxMatBottomSheetData,
} from './models/bottom-sheet.model';
export type { TbxMatBottomSheetProviderConfig } from './models/bottom-sheet-provider-config.model';
export type {
    TbxMatBottomSheetFooterItem,
    TbxMatBottomSheetFooterButton,
    TbxMatBottomSheetFooterCheckbox,
    TbxMatBottomSheetFooterToggle,
    TbxMatBottomSheetFooterRadioGroup,
    TbxMatBottomSheetFooterRadioOption,
    TbxMatBottomSheetFooterToggleGroup,
    TbxMatBottomSheetFooterToggleOption,
} from './models/bottom-sheet-footer.model';

// Constants
export {
    TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
    TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL,
    TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO,
    TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL,
} from './constants/bottom-sheet.constants';

// Tokens
export { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG } from './tokens/bottom-sheet-provider-config.token';

// Services
export { TbxMatBottomSheetService } from './services/bottom-sheet.service';
export { TbxMatBottomSheetSeverityFontIconService } from './services/bottom-sheet-severity-font-icon.service';
export { TbxMatBottomSheetSeveritySvgIconService } from './services/bottom-sheet-severity-svg-icon.service';
export { TbxMatBottomSheetCloseFontIconService } from './services/bottom-sheet-close-font-icon.service';
```

- [ ] **Step 3: Run lint, typecheck, full test suite**

```bash
npm run lint && npm run typecheck && npm test
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: expose public API via src/index.ts barrel"
```

---

## Phase 9 — Documentation

### Task 27: Write `docs/overview.md`

**Files:**

- Modify: `docs/overview.md`

- [ ] **Step 1: Read `docs/overview.md` from the dialog package**

- [ ] **Step 2: Adapt for the bottom sheet**

Apply the rename map, change the positioning paragraph to mention the bottom sheet's anchored-bottom-edge UX, and add a paragraph about the drag-handle opt-in. "When to use" criteria should help consumers choose between dialogs (truly disruptive modal) and bottom sheets (anchored, mobile-friendly modal).

External links must use `[Name ↗](url)` format per `CLAUDE.md`.

- [ ] **Step 3: Commit**

```bash
git add docs/overview.md
git commit -m "docs: write package overview"
```

---

### Task 28: Write `docs/concepts.yml`, `docs/features.yml`, `docs/related.yml`

**Files:**

- Modify: `docs/concepts.yml`
- Modify: `docs/features.yml`
- Create: `docs/related.yml`

- [ ] **Step 1: Read each file from the dialog package**

- [ ] **Step 2: Apply rename map and add drag-handle entries**

- `concepts.yml`: add a "Drag handle" entry alongside "Severity level", "Dismiss reason", "Footer item", etc.
- `features.yml`: add a "Drag-handle opt-in" feature bullet.
- `related.yml`: cross-references to `tbx-mat-dialogs`, `tbx-mat-banners`, `tbx-mat-notifications` (use the same shape as the dialog package's `related.yml`).

- [ ] **Step 3: Commit**

```bash
git add docs/concepts.yml docs/features.yml docs/related.yml
git commit -m "docs: write concepts, features, and related-packages docs"
```

---

### Task 29: Write `docs/accessibility.md`

**Files:**

- Modify: `docs/accessibility.md`

- [ ] **Step 1: Read from the dialog package and apply the rename map**

- [ ] **Step 2: Note that `MatBottomSheet` provides the same `aria-modal` and focus-trap semantics as `MatDialog`**

The drag handle is decorative (`aria-hidden="true"`) — call this out in the accessibility doc.

- [ ] **Step 3: Commit**

```bash
git add docs/accessibility.md
git commit -m "docs: write accessibility notes"
```

---

### Task 30: Write per-pipeline workflow docs

**Files:**

- Create: `docs/reference/workflows/ci.md`
- Create: `docs/reference/workflows/release.md`
- Create: `docs/reference/workflows/sync.md`
- Create: `docs/reference/workflows/dep-compat-check.md`
- Create: `docs/reference/workflows/claude.md`

- [ ] **Step 1: Read each file from `docs/reference/workflows/` in the dialog package and copy verbatim** (these describe the org-wide reusable workflows; package-name references update via the rename map)

- [ ] **Step 2: Commit**

```bash
git add docs/reference/workflows
git commit -m "docs: add per-pipeline workflow reference docs"
```

---

### Task 31: Write the README

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Read `README.md` from the dialog package**

- [ ] **Step 2: Apply the rename map and adjust**

- All examples / code snippets reference the bottom-sheet API, the bottom-sheet token, the bottom-sheet button presets.
- Add a "Drag handle" note in the "Usage" section showing how to enable it.
- Drop any "Sizing" subsection (no sizing knobs).
- Keep the **Feedback** section above **License** with bug-report and feature-request issue-template links pointing to `https://github.com/teqbench/tbx-mat-bottom-sheets/issues/new?template=...`.
- Update badge URLs (build, test, coverage) to the new repo. The `GIST_ID` for badges may need to be created externally; for now, leave the badge URL pattern matching the dialog package and note in a comment that the GIST_ID will be filled in during repo setup.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: write README"
```

---

## Phase 10 — `.github/workflows/` & docs-deploy

### Task 32: Verify each workflow file matches the dialog package's caller workflow

**Files:**

- Modify (if drift): `.github/workflows/ci.yml`, `release.yml`, `sync.yml`, `dep-compat-check.yml`, `claude.yml`
- Create (if missing): `.github/workflows/docs-deploy.yml`

- [ ] **Step 1: Diff each workflow file against the dialog package**

```bash
for f in ci.yml release.yml sync.yml dep-compat-check.yml claude.yml docs-deploy.yml; do
  echo "=== $f ==="
  diff -u /Users/ben/Development/TeqBench/tbx-mat-bottom-sheet/.github/workflows/$f \
          /Users/ben/Development/TeqBench/tbx-mat-dialogs/.github/workflows/$f 2>&1 || true
done
```

- [ ] **Step 2: For any drift, copy the dialog version verbatim**

- [ ] **Step 3: If `docs-deploy.yml` is missing, copy from the dialog package**

- [ ] **Step 4: Commit**

```bash
git add .github/workflows
git commit -m "ci: align workflow callers with tbx-mat-dialogs (add docs-deploy if missing)"
```

---

## Phase 11 — End-to-End Verification

### Task 33: Run the full local verification matrix

**Files:** none (verification only)

- [ ] **Step 1: Format check**

```bash
npm run format:check
```

Expected: pass.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 4: Unit tests with coverage**

```bash
npm run test:coverage
```

Expected: all tests pass; coverage thresholds met (80 / 80 / 80 / 75 per file).

- [ ] **Step 5: Build the package**

```bash
npm run build
```

Expected: `dist/` produced; no warnings about unresolved imports; APF entry points (`fesm2022/`, `index.d.ts`) present.

- [ ] **Step 6: Verify published file shape**

```bash
ls -la dist/
ls -la dist/styles/
ls -la dist/docs/
cat dist/package.json
```

Expected: styles partial present at `dist/styles/_tbx-mat-bottom-sheet.scss`; docs files present; the generated `dist/package.json` has the correct `name`, `peerDependencies`, and APF entry-point fields.

- [ ] **Step 7: Commit any trailing format / lint fixes**

```bash
git add -A
git diff --cached
# Review and commit only if there are format/lint fixes
```

---

## Self-Review Notes

Before handing off:

1. **Spec coverage** — every section of `2026-05-06-tbx-mat-bottom-sheet-design.md` is addressed:
    - Package skeleton & layout → Phase 1, 2.
    - Public API surface → Phase 3, 4, 5, 6.
    - Footer model → Task 11.
    - Provider config & token → Tasks 14, 16.
    - Shell anatomy → Task 21.
    - Drag handle (NEW behavior) → Task 22.
    - Sizing dropped → Tasks 13, 17, 23, 24 (regression test).
    - Tests → embedded throughout; coverage verified in Task 33.
    - Docs → Phase 9.
    - Build & publish → Tasks 1, 3, 33.
    - Lint / format / hooks → Tasks 5, 7.
    - Workflows → Phase 10.

2. **Out of scope (deferred)**:
    - Storybook setup (dev-mode + docs-mode stories, `.storybook/` configuration, `@storybook/angular` devDeps). The spec mentions Storybook in the file layout, but it's a substantial separate workstream and is excluded from this plan. A follow-up plan can pick this up.
    - GIST_ID for badge endpoints (external setup, not source code).

3. **Type / name consistency**: `TbxMatBottomSheet*` used throughout; `TBX_MAT_BOTTOM_SHEET_*` used throughout; selector / panel-class root `tbx-mat-bottom-sheet-*` used throughout. No leftover `Dialog` / `dialog` references should remain after the global rename.

4. **No placeholders in code blocks**: every code block in this plan is complete and runnable as written.
