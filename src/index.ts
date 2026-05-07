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
 * Key exports:
 *
 * - {@link TbxMatBottomSheetService} — inject and call `show()`, `success()`, `error()`, `warning()`, `information()`, `help()`, `default()`, `confirm()`, `input()`
 * - {@link TbxMatBottomSheetConfig} — full configuration for `show()`
 * - {@link TbxMatBottomSheetConfigArgs} — partial config with required title (for opinionated methods)
 * - {@link TbxMatBottomSheetResult} — typed return value
 * - {@link TbxMatBottomSheetDismissReason} — result enum (`Affirm`, `Deny`, `Cancel`, `Close`)
 * - {@link TbxMatBottomSheetData} — contract for input bottom sheet content components
 * - {@link TbxMatBottomSheetFooterControlType} — discriminated union of footer items
 * - {@link TbxMatBottomSheetProviderConfig} — provider config interface (severity + close icon resolvers)
 * - {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} — injection token for icon provider configuration
 * - {@link TBX_MAT_BOTTOM_SHEET_BUTTONS_OK}, {@link TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL}, {@link TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO}, {@link TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL} — button presets
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
export type { TbxMatBottomSheetResult, TbxMatBottomSheetConfig, TbxMatBottomSheetData } from './models/bottom-sheet.model';
export type { TbxMatBottomSheetProviderConfig } from './models/bottom-sheet-provider-config.model';
export type { TbxMatBottomSheetFooterItem, TbxMatBottomSheetFooterButton, TbxMatBottomSheetFooterCheckbox, TbxMatBottomSheetFooterToggle, TbxMatBottomSheetFooterRadioGroup, TbxMatBottomSheetFooterRadioOption, TbxMatBottomSheetFooterToggleGroup, TbxMatBottomSheetFooterToggleOption } from './models/bottom-sheet-footer.model';

// Constants
export { TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL } from './constants/bottom-sheet.constants';

// Tokens
export { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG } from './tokens/bottom-sheet-provider-config.token';

// Services
export { TbxMatBottomSheetService } from './services/bottom-sheet.service';
export { TbxMatBottomSheetSeverityFontIconService } from './services/bottom-sheet-severity-font-icon.service';
export { TbxMatBottomSheetSeveritySvgIconService } from './services/bottom-sheet-severity-svg-icon.service';
export { TbxMatBottomSheetCloseFontIconService } from './services/bottom-sheet-close-font-icon.service';
