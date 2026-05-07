# @teqbench/tbx-mat-bottom-sheet

<!-- Badges: gist filenames follow the pattern {repo}-{branch}-{badge}.json.
     GIST_ID is set as an org-level variable; the gist files are created automatically
     by the CI workflow on first push — no manual gist setup is required. -->

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-mat-bottom-sheet-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-mat-bottom-sheet-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-mat-bottom-sheet-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-mat-bottom-sheet-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-mat-bottom-sheet-main-build-number.json)

> An opinionated [Angular ↗](https://angular.dev) bottom sheet service with severity-leveled chrome, signal-based input validation, and rich footer controls. Built on [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api).

<details>
<summary><strong>Table of contents</strong></summary>

- [Overview](#overview)
- [At a glance](#at-a-glance)
- [When to use](#when-to-use)
- [Installation](#installation)
- [Usage](#usage)
- [Concepts](#concepts)
- [API Reference](#api-reference)
- [Styling](#styling)
- [Accessibility](#accessibility)
- [Compatibility](#compatibility)
- [Related packages](#related-packages)
- [Versioning & releases](#versioning--releases)
- [Contributing](#contributing)
- [Security](#security)
- [Feedback](#feedback)
- [License](#license)

</details>

## Overview

`@teqbench/tbx-mat-bottom-sheet` provides bottom sheets for [Angular ↗](https://angular.dev) applications. It complements small transient notifications and persistent banners with a modal surface anchored to the bottom edge of the viewport — familiar on mobile, unobtrusive on desktop — for focused interactions: confirmations, short input, and simple content projections. Bottom sheets render via [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api), which manages overlay, backdrop, focus trap, and modal semantics.

`TbxMatBottomSheetService` exposes nine opinionated methods. Six mirror the severity-leveled surface of [`tbx-mat-banners` ↗](https://github.com/teqbench/tbx-mat-banners) and [`tbx-mat-notifications` ↗](https://github.com/teqbench/tbx-mat-notifications) — `success`, `error`, `warning`, `information`, `help`, and `default`. Two are bottom sheet-specific UX patterns layered on top of severity — `confirm` (Yes/No) and `input` (form content with OK/Cancel). The ninth, `show`, takes a full configuration for cases where the opinionated methods do not fit. All methods return a `Promise<TbxMatBottomSheetResult<T, F>>` so consumers can `await` the user's choice with no subscription management.

Severity (`default`, `success`, `error`, `warning`, `information`, `help`) drives the entire bottom sheet surface — header, body, and footer share the severity background and on-severity text color. The six CSS custom-property pairs are aliased from the shared [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme) tokens, so the colored tiers stay independent of the active [M3 ↗](https://m3.material.io) theme palette while the `default` tier remains theme-responsive. Applications can opt into an inverted palette across every severity-aware `@teqbench` package by calling `provideTbxMatSeverityTheme({ invert: true, applyToRoot: true })` at bootstrap.

The footer is a single flex row of buttons and form controls (checkboxes, toggles, radio groups, toggle groups). On dismiss, all collected control values are returned alongside the dismiss reason. Input bottom sheets project a consumer-defined component into the body — the component implements `TbxMatBottomSheetData<T>` with two signals (`isValid`, `value`); the shell reads them to drive the affirm button's disabled state and to extract the form value on confirm.

## At a glance

- **Severity-leveled API** — `success` / `error` / `warning` / `information` / `help` / `default` mirror the surface used by `tbx-mat-banners` and `tbx-mat-notifications`.
- **Bottom sheet-only UX patterns** — `confirm` (Yes/No) and `input` (projected form content with OK/Cancel) layered on top of severity.
- **Async by default** — every method returns `Promise<TbxMatBottomSheetResult<T, F>>`; use `await`, no subscription management.
- **Typed input bottom sheets** — `TbxMatBottomSheetData<T>` contract with `isValid: Signal<boolean>` and `value: Signal<T>`; the affirm button's disabled state is automatically driven by `isValid`.
- **Rich footer controls** — buttons (text / filled / icon-position) and form controls (checkbox, toggle, radio group, toggle group) collected and returned on dismiss.
- **Pluggable icons** — three icon services ship out of the box (`TbxMatBottomSheetSeverityFontIconService`, `TbxMatBottomSheetSeveritySvgIconService`, `TbxMatBottomSheetCloseFontIconService`); consumers can subclass any of them or supply their own resolver.
- **Theming via CSS custom properties** — six severity background/text token pairs aliased from `@teqbench/tbx-mat-severity-theme`, plus centralized opacity tokens for action button variants.
- **Inverted palette flip** — `provideTbxMatSeverityTheme({ invert: true })` swaps background and text values app-wide; banners, notifications, and bottom sheets invert simultaneously.
- **Modal semantics** — backdrop, focus trap, escape-to-close, and `aria-modal` come from `MatBottomSheet`; this package adds the chrome and the typed result surface.
- **Drag-handle opt-in** — set `dragHandle: true` to render a decorative pill above the header; signals dismissibility without implementing drag-to-dismiss.

## When to use

Bottom sheets are one of three message surfaces in the TeqBench component family. Choose based on the weight of the message, the level of interruption appropriate for the context, and the target platform:

- [`@teqbench/tbx-mat-notifications` ↗](https://github.com/teqbench/tbx-mat-notifications) — small, transient messages with at most one action control. Ideally one line of text, two lines acceptable. Use notifications to acknowledge something without interrupting the user's flow.
- [`@teqbench/tbx-mat-banners` ↗](https://github.com/teqbench/tbx-mat-banners) — wide, persistent messages with multiple action controls. Ideally one line of message text, up to three lines still acceptable. Use a banner when the message needs the user's attention and may offer a few follow-up choices.
- **`@teqbench/tbx-mat-bottom-sheet`** (this package) — anchored modal surface for focused, low-to-medium complexity interactions. Less visually disruptive than a centered dialog; feels natural on mobile because it emerges from the bottom edge.
- [`@teqbench/tbx-mat-dialogs` ↗](https://github.com/teqbench/tbx-mat-dialogs) — centered overlay for the heaviest interactions: long copy, many controls, multi-step input, or anything that demands the user's full visual attention.

Reach for a bottom sheet when the interaction is more than a banner can hold but does not require the full visual weight of a centered dialog. If the content is long, the choices are many, or the layout is complex, promote it to a dialog instead.

## Installation

Configure [npm ↗](https://www.npmjs.com) to use [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) for the `@teqbench` scope:

```bash
echo "@teqbench:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the package:

```bash
npm install @teqbench/tbx-mat-bottom-sheet
```

### Prerequisites

This package uses [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api) for overlay management and [Angular Material ↗](https://material.angular.dev) components for buttons, checkboxes, toggles, and other footer controls. An active [M3 ↗](https://m3.material.io) theme is required for typography, shape, and interactive states.

Bottom sheet severity colors (success = green, error = red, etc.) are **not** tied to the theme palette — they use dedicated CSS custom properties resolved from [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme) and remain consistent regardless of which theme is active.

Import the global bottom sheet styles in your application's stylesheet:

```scss
@use '@teqbench/tbx-mat-bottom-sheet/styles/tbx-mat-bottom-sheet';
```

## Usage

### Severity methods — fire-and-forget

```typescript
import { TbxMatBottomSheetService, TbxMatBottomSheetDismissReason } from '@teqbench/tbx-mat-bottom-sheet';

private readonly bottomSheet = inject(TbxMatBottomSheetService);

await this.bottomSheet.success({ title: 'Saved', message: 'Your changes are saved.' });
await this.bottomSheet.error({ title: 'Save Failed', message: 'Could not save changes.' });
await this.bottomSheet.warning({ title: 'Caution', message: 'This may take a while.' });
await this.bottomSheet.information({ title: 'FYI', message: 'New version available.' });
await this.bottomSheet.help({ title: 'How it works', message: 'Tap any control for details.' });
await this.bottomSheet.default({ title: 'Notice', message: 'Neutral surface.' });
```

### Confirmation — Yes/No flow

```typescript
const output = await this.bottomSheet.confirm({
    title: 'Delete Project?',
    message: 'This action cannot be undone.',
});

if (output.result === TbxMatBottomSheetDismissReason.Affirm) {
    // user confirmed
}
```

### Input — projected form content

```typescript
import { TbxMatBottomSheetData } from '@teqbench/tbx-mat-bottom-sheet';

@Component({
    selector: 'app-rename-form',
    template: `
        <mat-form-field>
            <input matInput cdkFocusInitial [ngModel]="name()" (ngModelChange)="name.set($event)" />
        </mat-form-field>
    `,
})
class RenameFormComponent implements TbxMatBottomSheetData<string> {
    readonly name = signal('');
    readonly isValid = computed(() => this.name().trim().length > 0);
    readonly value = computed(() => this.name().trim());
}

const output = await this.bottomSheet.input<string>({
    title: 'Rename',
    content: RenameFormComponent,
});

if (output.result === TbxMatBottomSheetDismissReason.Affirm) {
    console.log(output.data); // typed: string
}
```

### Footer controls — collect form values alongside the dismiss

```typescript
const output = await this.bottomSheet.confirm<{ dontAskAgain: boolean }>({
    title: 'Enable Notifications?',
    message: 'Would you like to receive notifications for this project?',
    footer: [
        { key: 'dontAskAgain', type: 'checkbox', label: "Don't ask again", align: 'start' },
        { key: 'no', type: 'button', label: 'No', result: TbxMatBottomSheetDismissReason.Deny, align: 'end' },
        {
            key: 'yes',
            type: 'button',
            label: 'Yes',
            result: TbxMatBottomSheetDismissReason.Affirm,
            emphasis: 'primary',
            align: 'end',
        },
    ],
});

if (output.result === TbxMatBottomSheetDismissReason.Affirm) {
    const dontAskAgain = output.footerValues.dontAskAgain;
}
```

### Drag handle

Enable the drag-handle pill above the header (decorative, opt-in):

```typescript
// Enable the drag-handle pill above the header (decorative, opt-in).
await this.bottomSheet.confirm({
    title: 'Save changes?',
    message: 'Save your edits before closing?',
    dragHandle: true,
});
```

The pill is `aria-hidden` and does not implement drag-to-dismiss — it is a visual affordance only.

### Full control via `show()`

```typescript
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';

const output = await this.bottomSheet.show({
    title: 'Custom Bottom Sheet',
    icon: 'build',
    type: TbxMatSeverityLevel.Warning,
    subtitle: 'Optional secondary line',
    contextBadge: 'Beta',
    message: 'Full control over every option.',
    footer: [
        { key: 'cancel', type: 'button', label: 'Cancel', result: TbxMatBottomSheetDismissReason.Cancel, align: 'end' },
        {
            key: 'proceed',
            type: 'button',
            label: 'Proceed',
            result: TbxMatBottomSheetDismissReason.Affirm,
            emphasis: 'primary',
            align: 'end',
        },
    ],
});
```

### Icon Configuration

Icons are configured via the `TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG` injection token, which is required.

#### Font icons with `MAT_ICON_DEFAULT_OPTIONS`

```typescript
// app.config.ts
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import {
    TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
    TbxMatBottomSheetSeverityFontIconService,
} from '@teqbench/tbx-mat-bottom-sheet';

providers: [
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-rounded' } },
    {
        provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
        useFactory: () => ({
            severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService(),
        }),
    },
];
```

#### Font icons with explicit fontSet

```typescript
providers: [
    {
        provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
        useFactory: () => ({
            severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService('material-symbols-rounded'),
        }),
    },
];
```

#### SVG icons

```typescript
providers: [
    {
        provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
        useFactory: () => ({
            severityIconResolverService: new TbxMatBottomSheetSeveritySvgIconService(),
        }),
    },
];
```

#### Custom close icon

The close button uses a package-default `'close'` [Material Symbols ↗](https://fonts.google.com/icons) ligature. Override it by supplying a `closeIconResolverService`:

```typescript
// MyCustomCloseIconService is a consumer-defined service (see below).
providers: [
    {
        provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
        useFactory: () => ({
            severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService(),
            closeIconResolverService: new MyCustomCloseIconService(),
        }),
    },
];
```

`MyCustomCloseIconService` must extend `TbxMatFontIconService<string>` (font) or `TbxMatSvgIconService<string>` (SVG) and register an entry under the `'close'` key.

## Concepts

- **Severity level** — a classification (default, success, error, warning, information, help) that selects the icon and color scheme applied to a bottom sheet. Identical to the severity model used by `tbx-mat-banners` and `tbx-mat-notifications`.
- **Bottom sheet patterns** — `confirm` and `input` are bottom sheet-specific UX wrappers around the severity model. `confirm` defaults to Help severity with Yes/No buttons; `input` defaults to Information severity with a projected content component and OK/Cancel buttons.
- **Footer item** — every footer entry has a `key` (used in the returned `footerValues` record) and an `align` (`'start'` flows left, `'end'` flows right). The first `align: 'end'` item gets `margin-left: auto`, separating start- and end-aligned items.
- **Footer button emphasis** — `'primary'` (filled, severity-colored), `'destructive'` (filled, always Error-colored regardless of bottom sheet severity), or `'text'` / undefined (text, no fill).
- **Dismiss reason** — `Affirm`, `Deny`, `Cancel`, or `Close`. Footer buttons declare a `result` to map their click; backdrop click and Escape both emit `Close` with empty footer values.
- **Provider config** — the DI-provided configuration (`TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG`) that supplies the severity icon resolver and an optional close icon resolver. Required.
- **Content component** — a consumer-defined `@Component` that implements `TbxMatBottomSheetData<T>`. Used in the body of input bottom sheets; the shell reads `isValid` to drive the affirm button's disabled state and `value` to extract data on confirm.
- **Drag handle** — an opt-in decorative pill rendered above the header when `dragHandle: true`. Marked `aria-hidden`; does not implement drag-to-dismiss. Defaults to `false`.

## API Reference

### TbxMatBottomSheetService

<dl>
    <dt><code>show&lt;T, F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;T, F&gt;&gt;</code></dt>
    <dd>Open a bottom sheet with full config — no defaults applied.</dd>
    <dt><code>success&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open a success bottom sheet (success icon + severity, OK button).</dd>
    <dt><code>error&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open an error bottom sheet (error icon + severity, OK button).</dd>
    <dt><code>warning&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open a warning bottom sheet (warning icon + severity, OK button).</dd>
    <dt><code>information&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open an informational bottom sheet (info icon + severity, OK button).</dd>
    <dt><code>help&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open a help bottom sheet (help icon + severity, OK button).</dd>
    <dt><code>default&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open a default-severity (neutral) bottom sheet (default icon + severity, OK button).</dd>
    <dt><code>confirm&lt;F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;void, F&gt;&gt;</code></dt>
    <dd>Open a confirmation bottom sheet (help icon + Help severity, Yes/No buttons).</dd>
    <dt><code>input&lt;T, F&gt;(config)</code> → <code>Promise&lt;TbxMatBottomSheetResult&lt;T, F&gt;&gt;</code></dt>
    <dd>Open an input bottom sheet (info icon + Information severity, OK/Cancel buttons, projected content component).</dd>
</dl>

### TbxMatBottomSheetResult&lt;T, F&gt;

<dl>
    <dt><code>result</code> (<code>TbxMatBottomSheetDismissReason</code>)</dt>
    <dd>Which action closed the bottom sheet.</dd>
    <dt><code>data</code> (<code>T | undefined</code>)</dt>
    <dd>Value returned by the projected content component on Affirm. Undefined for non-input bottom sheets and for non-Affirm dismissals.</dd>
    <dt><code>footerValues</code> (<code>F</code>)</dt>
    <dd>Values from footer controls, keyed by control <code>key</code>. Empty object on Cancel / Deny / Close.</dd>
</dl>

### TbxMatBottomSheetDismissReason

<dl>
    <dt><code>Affirm</code></dt>
    <dd>User confirmed (OK / Yes / Save / Delete).</dd>
    <dt><code>Deny</code></dt>
    <dd>User explicitly declined (No).</dd>
    <dt><code>Cancel</code></dt>
    <dd>User aborted (Cancel button).</dd>
    <dt><code>Close</code></dt>
    <dd>User dismissed without choosing (close button, Escape, backdrop).</dd>
</dl>

### TbxMatBottomSheetConfig&lt;T&gt;

<dl>
    <dt><code>title</code> (<code>string</code>)</dt>
    <dd>Bottom sheet title (required).</dd>
    <dt><code>icon</code> (<code>string</code>)</dt>
    <dd>Material icon name override (font ligature). When omitted, the icon is resolved from <code>type</code> via the configured severity icon resolver.</dd>
    <dt><code>subtitle</code> (<code>string</code>)</dt>
    <dd>Secondary text shown below the title.</dd>
    <dt><code>contextBadge</code> (<code>string</code>)</dt>
    <dd>Compact chip shown next to the title (e.g. "Beta", "v2").</dd>
    <dt><code>message</code> (<code>string</code>)</dt>
    <dd>Body text. Ignored when <code>content</code> is provided.</dd>
    <dt><code>type</code> (<code>TbxMatSeverityLevel</code>)</dt>
    <dd>Severity level — drives icon, header chip color, primary button color, and the per-severity panel class.</dd>
    <dt><code>content</code> (<code>Type&lt;TbxMatBottomSheetData&lt;T&gt;&gt;</code>)</dt>
    <dd>Component class projected into the body for input bottom sheets.</dd>
    <dt><code>footer</code> (<code>readonly TbxMatBottomSheetFooterControlType[]</code>)</dt>
    <dd>Footer items (buttons + form controls). When omitted, the service applies the method's default preset.</dd>
    <dt><code>disableClose</code> (<code>boolean</code>)</dt>
    <dd>When <code>true</code>, blocks Escape and backdrop dismissal. The user must interact with a footer button to close. Default: <code>false</code>.</dd>
    <dt><code>dragHandle</code> (<code>boolean</code>)</dt>
    <dd>When <code>true</code>, renders a centered decorative pill above the header as a dismissal affordance. Does not implement drag-to-dismiss. Default: <code>false</code>.</dd>
</dl>

> **Note on sizing:** [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api) does not expose sizing knobs. Width and height are controlled entirely via CSS on the host element. There are no `width`, `minWidth`, `maxWidth`, `minHeight`, or `maxHeight` config fields on this package.

### TbxMatBottomSheetProviderConfig

<dl>
    <dt><code>severityIconResolverService</code> (<code>TbxMatSeverityResolver &amp; TbxMatIconResolver&lt;TbxMatSeverityLevel&gt; &amp; { iconType }</code>)</dt>
    <dd>Severity icon resolver (required).</dd>
    <dt><code>closeIconResolverService</code> (<code>TbxMatBottomSheetIconResolver</code>)</dt>
    <dd>Close button icon resolver. Default: package-provided <code>TbxMatBottomSheetCloseFontIconService</code>.</dd>
</dl>

### TbxMatBottomSheetData&lt;T&gt;

Implemented by components projected into the body of input bottom sheets.

<dl>
    <dt><code>isValid</code> (<code>Signal&lt;boolean&gt;</code>)</dt>
    <dd>Whether the form is in a valid state. Drives the affirm button's disabled state.</dd>
    <dt><code>value</code> (<code>Signal&lt;T&gt;</code>)</dt>
    <dd>Current value of the form. Included in <code>TbxMatBottomSheetResult.data</code> on Affirm.</dd>
</dl>

### TbxMatBottomSheetConfigArgs&lt;T&gt;

`{ title: string } & Partial<Omit<TbxMatBottomSheetConfig<T>, 'title'>>` — convenience type for the opinionated methods. Requires `title`; all other fields are optional.

### Footer types

`TbxMatBottomSheetFooterControlType` is a discriminated union over `TbxMatBottomSheetFooterButton`, `TbxMatBottomSheetFooterCheckbox`, `TbxMatBottomSheetFooterToggle`, `TbxMatBottomSheetFooterRadioGroup`, and `TbxMatBottomSheetFooterToggleGroup`. Every item has `key` and `align: 'start' | 'end'`. Buttons additionally take `label`, `icon` / `iconPosition`, `emphasis: 'primary' | 'destructive' | 'text'`, `result: TbxMatBottomSheetDismissReason`, and an optional `disabled: boolean | Signal<boolean>`.

Convenience presets are exported alongside:

- `TBX_MAT_BOTTOM_SHEET_BUTTONS_OK` — single OK (Affirm, primary, end-aligned).
- `TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL` — Cancel (start) + OK (end).
- `TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO` — both end-aligned, Yes primary.
- `TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL` — Cancel left, No + Yes right.

## Styling

Bottom sheet appearance is driven by [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme). Importing `tbx-mat-bottom-sheet` styles emits `--tbx-mat-bottom-sheet-{level}-{background,text}` aliases for all six severity tiers, plus per-package opacity tokens used by the severity-aware action button variants. The bottom sheet overlay's `panelClass` includes a per-severity class (`.tbx-mat-bottom-sheet-panel-{level}`) that drives the entire surface via the package's `_severity-panel` SCSS mixin: it sets [Angular Material ↗](https://material.angular.dev)'s overrides so the bottom sheet container, title, and body all take the severity colors, and pipes the same tokens into the button, form field, divider, checkbox, slide-toggle, radio, button-toggle, and chips overrides so every Material control inside the panel reads correctly against the colored surface.

### Color tokens

The shared severity-theme mixin emits per-level pairs. Themes can override the bottom-sheet-prefixed aliases (affects only bottom sheets) or the underlying `--tbx-mat-severity-{level}-*` tokens (affects every severity-aware `@teqbench` package).

<dl>
    <dt><code>--tbx-mat-bottom-sheet-default-background</code> / <code>--tbx-mat-bottom-sheet-default-text</code></dt>
    <dd>Default tier (theme-responsive — aliases the M3 surface tokens).</dd>
    <dt><code>--tbx-mat-bottom-sheet-success-background</code> / <code>--tbx-mat-bottom-sheet-success-text</code></dt>
    <dd>Success tier.</dd>
    <dt><code>--tbx-mat-bottom-sheet-error-background</code> / <code>--tbx-mat-bottom-sheet-error-text</code></dt>
    <dd>Error tier (also used by the always-Error <code>destructive</code> button emphasis).</dd>
    <dt><code>--tbx-mat-bottom-sheet-warning-background</code> / <code>--tbx-mat-bottom-sheet-warning-text</code></dt>
    <dd>Warning tier.</dd>
    <dt><code>--tbx-mat-bottom-sheet-information-background</code> / <code>--tbx-mat-bottom-sheet-information-text</code></dt>
    <dd>Information tier.</dd>
    <dt><code>--tbx-mat-bottom-sheet-help-background</code> / <code>--tbx-mat-bottom-sheet-help-text</code></dt>
    <dd>Help tier.</dd>
</dl>

### Inverted palette

Inverted (white backgrounds with colored text) flips at the [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme) layer. Wire it once at bootstrap; banners, notifications, and bottom sheets invert simultaneously:

```typescript
// app.config.ts
import { provideTbxMatSeverityTheme } from '@teqbench/tbx-mat-severity-theme';

providers: [provideTbxMatSeverityTheme({ invert: true, applyToRoot: true })];
```

### Action button opacity tokens

Mirrors the `@teqbench/tbx-mat-banners` and `@teqbench/tbx-mat-notifications` set verbatim — defined globally so consumers can override without touching individual severity classes.

<dl>
    <dt><code>--tbx-mat-bottom-sheet-action-text-opacity</code></dt>
    <dd>Default: <code>0.8</code>.</dd>
    <dt><code>--tbx-mat-bottom-sheet-action-filled-container-opacity</code> / <code>--tbx-mat-bottom-sheet-action-tonal-container-opacity</code></dt>
    <dd>Default: text-opacity / <code>0.55</code>.</dd>
    <dt><code>--tbx-mat-bottom-sheet-action-outlined-opacity</code> / <code>--tbx-mat-bottom-sheet-action-elevated-opacity</code> / <code>--tbx-mat-bottom-sheet-action-icon-opacity</code> / <code>--tbx-mat-bottom-sheet-close-icon-opacity</code></dt>
    <dd>Default: text-opacity.</dd>
    <dt><code>--tbx-mat-bottom-sheet-action-filled-hover-state-layer-opacity</code> / <code>--tbx-mat-bottom-sheet-action-tonal-hover-state-layer-opacity</code></dt>
    <dd>Default: <code>0.3</code> / filled-hover-state-layer.</dd>
</dl>

## Accessibility

- **Modal semantics.** Bottom sheets render via [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api), which sets `aria-modal="true"`, manages the backdrop, and traps keyboard focus inside the overlay until dismissal.
- **Focus.** When the bottom sheet has an affirm button, the shell auto-applies `cdkFocusInitial` to it. When a content component is projected, the consumer's `cdkFocusInitial` on a form field receives focus. Otherwise `autoFocus` falls back to `'dialog'`. The close button is reachable via Tab in every case.
- **Keyboard.** `Escape` dismisses with `Close` unless `disableClose: true`. `Tab` cycles within the overlay. Footer buttons activate on `Enter` and `Space`.
- **Reduced motion.** [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api) honors `prefers-reduced-motion: reduce`.
- **Color contrast.** The default severity palette meets [WCAG ↗](https://www.w3.org/WAI/standards-guidelines/wcag/) AA contrast. Overriding severity tokens is the consumer's responsibility to re-verify.
- **Icons.** Severity and close icons are decorative and `aria-hidden`.
- **Drag handle.** The drag-handle pill is `aria-hidden="true"` and does not signal a draggable interaction to assistive technology.

## Compatibility

<!-- Kept as a pipe table until teqbench/.github#22 lands; the centralized CI README version-check regex extracts versions from this exact shape. -->

| Dependency                                                                               | Version  |
| ---------------------------------------------------------------------------------------- | -------- |
| [Angular ↗](https://angular.dev)                                                         | >=21.0.0 |
| [Angular CDK ↗](https://material.angular.dev/cdk)                                        | >=21.0.0 |
| [Angular Material ↗](https://material.angular.dev)                                       | >=21.0.0 |
| [@teqbench/tbx-mat-icons ↗](https://github.com/teqbench/tbx-mat-icons)                   | >=4.0.0  |
| [@teqbench/tbx-mat-severity-theme ↗](https://github.com/teqbench/tbx-mat-severity-theme) | >=8.0.0  |
| [TypeScript ↗](https://www.typescriptlang.org)                                           | ~5.9.0   |
| [Node.js ↗](https://nodejs.org)                                                          | >=24.0.0 |

## Related packages

- [`@teqbench/tbx-mat-dialogs` ↗](https://github.com/teqbench/tbx-mat-dialogs) — centered modal dialogs for heavier interactions — long copy, multi-step input, or complex confirmation flows.
- [`@teqbench/tbx-mat-notifications` ↗](https://github.com/teqbench/tbx-mat-notifications) — transient, single-action messages for lightweight acknowledgements.
- [`@teqbench/tbx-mat-banners` ↗](https://github.com/teqbench/tbx-mat-banners) — wide, persistent messages with multiple action controls for situations between notifications and bottom sheets.
- [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme) — severity enum, abstract icon-service bases, default icon sets, shared SCSS color tokens, and the inverted-palette provider helper consumed by this package.
- [`@teqbench/tbx-mat-icons` ↗](https://github.com/teqbench/tbx-mat-icons) — shared icon resolver contracts and base services.

## Versioning & releases

This package follows [Semantic Versioning ↗](https://semver.org). Versions and changelog entries are produced automatically by [Release Please ↗](https://github.com/googleapis/release-please) from [Conventional Commits ↗](https://www.conventionalcommits.org) on `main`. See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## Contributing

Contributions are welcome. See the [contributing guide ↗](https://github.com/teqbench/.github/blob/main/CONTRIBUTING.md) for local setup, [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) authentication, branch conventions, commit format, and the PR workflow.

## Security

See the [security policy ↗](https://github.com/teqbench/.github/blob/main/SECURITY.md) for the supported-version policy and how to report a vulnerability privately.

## Feedback

- [Report a bug ↗](https://github.com/teqbench/tbx-mat-bottom-sheet/issues/new?template=bug_report.md)
- [Request a feature ↗](https://github.com/teqbench/tbx-mat-bottom-sheet/issues/new?template=feature_request.md)

## License

[AGPL-3.0](LICENSE) — Copyright 2026 TeqBench
