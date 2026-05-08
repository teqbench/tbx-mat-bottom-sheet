---
tagline: An opinionated [Angular ↗](https://angular.dev) bottom sheet service built on [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api) with severity-leveled methods (success / error / warning / information / help / default), bottom sheet-specific UX patterns (confirm / input), pluggable severity and close icons, and rich footer controls.
---

## Overview

`@teqbench/tbx-mat-bottom-sheets` provides bottom sheets for [Angular ↗](https://angular.dev) applications. It complements small transient notifications and persistent banners with a modal surface anchored to the bottom edge of the viewport — familiar on mobile, unobtrusive on desktop — for focused interactions: confirmations, short input, and simple content projections. Bottom sheets render via [Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api), which manages overlay, backdrop, focus trap, and modal semantics.

`TbxMatBottomSheetService` exposes nine opinionated methods. Six mirror the severity-leveled surface of [`tbx-mat-banners` ↗](https://github.com/teqbench/tbx-mat-banners) and [`tbx-mat-notifications` ↗](https://github.com/teqbench/tbx-mat-notifications) — `success`, `error`, `warning`, `information`, `help`, and `default`. Two are bottom sheet-specific UX patterns layered on top of severity — `confirm` (Yes/No) and `input` (form content with OK/Cancel). The ninth, `show`, takes a full configuration for cases where the opinionated methods do not fit. All methods return a `Promise<TbxMatBottomSheetResult<T, F>>` so consumers can `await` the user's choice with no subscription management.

Severity (`default`, `success`, `error`, `warning`, `information`, `help`) drives the entire bottom sheet surface — header, body, and footer share the severity background and text. The six CSS custom-property pairs are aliased from the shared [`@teqbench/tbx-mat-severity-theme` ↗](https://github.com/teqbench/tbx-mat-severity-theme) tokens, so the colored tiers stay independent of the active [M3 ↗](https://m3.material.io) theme palette while the `default` tier remains theme-responsive. Applications can opt into an inverted palette across every severity-aware `@teqbench` package by calling `provideTbxMatSeverityTheme({ invert: true, applyToRoot: true })` at bootstrap.

The footer is a single flex row of buttons and form controls (checkboxes, toggles, radio groups, toggle groups). On dismiss, all collected control values are returned alongside the dismiss reason. Input bottom sheets project a consumer-defined component into the body — the component implements `TbxMatBottomSheetData<T>` with two signals (`isValid`, `value`); the shell reads them to drive the affirm button's disabled state and to extract the form value on confirm.

[Angular Material's MatBottomSheet ↗](https://material.angular.dev/components/bottom-sheet/api) does not expose sizing knobs — width and height are controlled entirely via CSS on the host element. There are no `width`, `minWidth`, `maxWidth`, `minHeight`, or `maxHeight` config options on this package.

The library is designed for [Angular ↗](https://angular.dev) 21+ applications, and exposes a pluggable icon resolver so consumers can use [Material Symbols ↗](https://fonts.google.com/icons) font icons or bundled SVG icons without changing component code.

## When to use

Bottom sheets are one of three message surfaces in the TeqBench component family. Choose based on the weight of the message, the level of interruption appropriate for the context, and the target platform:

- [`@teqbench/tbx-mat-notifications` ↗](https://github.com/teqbench/tbx-mat-notifications) — small, transient messages with at most one action control. Ideally one line of text, two lines acceptable. Use notifications to acknowledge something without interrupting the user's flow.
- [`@teqbench/tbx-mat-banners` ↗](https://github.com/teqbench/tbx-mat-banners) — wide, persistent messages with multiple action controls. Ideally one line of message text, up to three lines still acceptable. Use a banner when the message needs the user's attention and may offer a few follow-up choices.
- **`@teqbench/tbx-mat-bottom-sheets`** (this package) — anchored modal surface for focused, low-to-medium complexity interactions. Less visually disruptive than a centered dialog; feels natural on mobile because it emerges from the bottom edge.
- [`@teqbench/tbx-mat-dialogs` ↗](https://github.com/teqbench/tbx-mat-dialogs) — centered overlay for the heaviest interactions: long copy, many controls, multi-step input, or anything that demands the user's full visual attention.

Reach for a bottom sheet when the interaction is more than a banner can hold but does not require the full visual weight of a centered dialog. If the content is long, the choices are many, or the layout is complex, promote it to a dialog instead. If a notification or banner is being stretched past its envelope by a single-step confirmation or a short form, a bottom sheet is the right promotion.
