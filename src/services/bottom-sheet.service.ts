import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { firstValueFrom } from 'rxjs';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { BottomSheetShellComponent, type BottomSheetShellData } from '../components/bottom-sheet-shell.component';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { type TbxMatBottomSheetConfig, type TbxMatBottomSheetResult } from '../models/bottom-sheet.model';
import { type TbxMatBottomSheetFooterControlType } from '../types/bottom-sheet-footer-control.type';
import { type TbxMatBottomSheetConfigArgs } from '../types/bottom-sheet-config-override.type';
import { TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO } from '../constants/bottom-sheet.constants';

/**
 * Open a typed bottom sheet and await the user's choice
 *
 * @remarks
 * Application-wide bottom sheet service built on
 * {@link https://material.angular.dev/components/bottom-sheet/api | Angular Material's MatBottomSheet}.
 * Provides nine opinionated bottom sheet methods with sensible defaults and a general-purpose
 * `show()` method for full control. All bottom sheets use the shared internal shell component
 * for consistent chrome (header, body, footer).
 *
 * Severity-leveled methods (`success`, `error`, `warning`, `information`, `help`,
 * `default`) mirror the surface exposed by `TbxMatBannerService` and
 * `TbxMatNotificationService`. Bottom sheet-specific patterns (`confirm`, `input`) layer on top
 * of the severity model with their own default footer presets.
 *
 * All methods return a Promise that resolves when the bottom sheet closes, so consumers use
 * `async`/`await` with no subscription management.
 *
 * Icons are resolved at render time by the bottom sheet shell via the required
 * {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} injection token. Consumers configure the severity
 * icon resolver (font or SVG) and an optional close icon resolver in `app.config.ts`; see
 * {@link TbxMatBottomSheetProviderConfig} for the full shape. Per-call
 * {@link TbxMatBottomSheetConfig}.icon overrides take precedence over the resolved severity
 * icon and are rendered as font ligatures.
 *
 * #### Error handling
 *
 * When the bottom sheet is dismissed via backdrop click or Escape without a button click, the
 * underlying `afterDismissed()` emits `undefined`. The service catches this case and returns
 * a {@link TbxMatBottomSheetDismissReason}.Close result with an empty `footerValues` record —
 * dismissal is a negative action like Cancel or Deny and never carries form state.
 *
 * @usage
 * Inject in any component or service that needs to prompt the user. Prefer the opinionated
 * methods over `show()` so severity, icon, and footer defaults stay consistent across the
 * application.
 *
 * @example
 * ```typescript
 * private readonly bottomSheet = inject(TbxMatBottomSheetService);
 *
 * // Severity methods (mirror banners/notifications).
 * await this.bottomSheet.success({ title: 'Saved', message: 'Your changes are saved.' });
 * await this.bottomSheet.error({ title: 'Failed', message: 'Could not save changes.' });
 * await this.bottomSheet.warning({ title: 'Caution', message: 'This may take a while.' });
 * await this.bottomSheet.information({ title: 'FYI', message: 'Heads up.' });
 * await this.bottomSheet.help({ title: 'How it works', message: 'Tap to learn more.' });
 * await this.bottomSheet.default({ title: 'Notice', message: 'Neutral surface.' });
 *
 * // Confirmation — Help severity, Yes/No buttons.
 * const output = await this.bottomSheet.confirm({ title: 'Continue?', message: 'Proceed?' });
 * if (output.result === TbxMatBottomSheetDismissReason.Affirm) {
 *     // proceed
 * }
 *
 * // Input — Information severity, OK/Cancel buttons.
 * // RenameFormComponent is a hypothetical consumer-defined component that
 * // implements TbxMatBottomSheetData<string>.
 * const output = await this.bottomSheet.input<string>({
 *     title: 'Rename',
 *     content: RenameFormComponent,
 * });
 *
 * // Typed footer values.
 * interface MyFooter { dontAskAgain: boolean; }
 * const output = await this.bottomSheet.confirm<MyFooter>({
 *     title: 'Delete',
 *     message: 'Are you sure?',
 *     footer: [
 *         { key: 'dontAskAgain', type: 'checkbox', label: "Don't ask again", align: 'start' },
 *         ...TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO,
 *     ],
 * });
 *
 * // Full control — no defaults applied.
 * const output = await this.bottomSheet.show({
 *     title: 'Custom',
 *     icon: 'build',
 *     type: TbxMatSeverityLevel.Warning,
 *     message: 'Full control over every option.',
 *     footer: [...customFooter],
 * });
 * ```
 *
 * @see {@link https://angular.dev | Angular}
 * @see {@link https://material.angular.dev/components/bottom-sheet/api | Angular Material MatBottomSheet}
 *
 * @category Services
 * @displayName BottomSheet Service
 * @order 1
 * @since 0.1.0
 * @related TbxMatBottomSheetConfig
 * @related TbxMatBottomSheetConfigArgs
 * @related TbxMatBottomSheetResult
 * @related TbxMatBottomSheetDismissReason
 * @related TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG
 *
 * @public
 */
@Injectable({ providedIn: 'root' })
export class TbxMatBottomSheetService {
    private readonly bottomSheet = inject(MatBottomSheet);

    /**
     * Open a bottom sheet with full control — no defaults applied
     *
     * @remarks
     * Use this when none of the opinionated methods fit, or when the caller needs to
     * specify every aspect of the bottom sheet configuration. The config is passed through to
     * the shell component exactly as provided.
     *
     * @typeParam T - Type of data for input bottom sheets. Defaults to `void`.
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Full {@link TbxMatBottomSheetConfig} for the bottom sheet.
     * @returns A Promise that resolves with the typed {@link TbxMatBottomSheetResult} when the
     *   bottom sheet closes.
     *
     * @public
     */
    async show<T = void, F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfig<T>): Promise<TbxMatBottomSheetResult<T, F>> {
        return this.open<T, F>(config, config.footer ?? []);
    }

    /**
     * Open a success bottom sheet
     *
     * @remarks
     * Defaults: success icon, Success severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async success<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Success), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open an error bottom sheet
     *
     * @remarks
     * Defaults: error icon, Error severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async error<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Error), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open a warning bottom sheet
     *
     * @remarks
     * Defaults: warning icon, Warning severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async warning<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Warning), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open an informational bottom sheet
     *
     * @remarks
     * Defaults: info icon, Information severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async information<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Information), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open a help bottom sheet
     *
     * @remarks
     * Defaults: help icon, Help severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async help<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Help), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open a default-severity (neutral) bottom sheet
     *
     * @remarks
     * Defaults: default icon, Default severity, OK button.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async default<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Default), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
    }

    /**
     * Open a confirmation bottom sheet
     *
     * @remarks
     * BottomSheet-specific UX pattern layered on top of the severity model. Defaults: help
     * icon, Help severity, Yes/No buttons.
     *
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async confirm<F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<void>): Promise<TbxMatBottomSheetResult<void, F>> {
        return this.open<void, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Help), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO);
    }

    /**
     * Open an input bottom sheet
     *
     * @remarks
     * Renders a content component in the bottom sheet body. The content component must implement
     * {@link TbxMatBottomSheetData}. Returns typed data on Affirm.
     *
     * BottomSheet-specific UX pattern layered on top of the severity model. Defaults: info icon,
     * Information severity, OK/Cancel buttons.
     *
     * @typeParam T - Type of data returned by the content component.
     * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
     *
     * @param config - Caller config; merged with the method's defaults.
     * @returns A Promise that resolves with the {@link TbxMatBottomSheetResult} when the bottom
     *   sheet closes.
     *
     * @public
     */
    async input<T, F extends Record<string, unknown> = Record<string, unknown>>(config: TbxMatBottomSheetConfigArgs<T>): Promise<TbxMatBottomSheetResult<T, F>> {
        return this.open<T, F>(this.mergeDefaults(config, TbxMatSeverityLevel.Information), config.footer ?? TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL);
    }

    /**
     * Merge caller overrides with method defaults
     *
     * @remarks
     * Sets `type` to the method's default severity when the caller did not specify one.
     * Icon resolution happens at render time in the bottom sheet shell based on `config.type`
     * and the provider config — the service does not pre-compute icon strings. A
     * caller-provided `config.icon` is preserved as-is and rendered as a font ligature,
     * taking precedence over severity resolution.
     *
     * @internal
     */
    private mergeDefaults<T>(config: TbxMatBottomSheetConfigArgs<T>, defaultType: TbxMatSeverityLevel): TbxMatBottomSheetConfig<T> {
        return {
            ...config,
            type: config.type ?? defaultType,
        } as TbxMatBottomSheetConfig<T>;
    }

    /**
     * Whether the bottom sheet has a focus target that can claim `cdkFocusInitial`
     *
     * @remarks
     * Used to decide between `'first-tabbable'` and `'dialog'` for `autoFocus`.
     * Returns `true` when a content component is projected (the consumer's
     * `cdkFocusInitial` will land focus on a form field) or when the resolved
     * footer contains a button with `result: Affirm` (the shell applies
     * `cdkFocusInitial` to it via {@link BottomSheetShellComponent.shouldAutoFocus}).
     * Otherwise the bottom sheet has no actionable element to receive initial focus
     * besides the header close button, which the package opts to skip.
     *
     * @internal
     */
    private hasFocusTarget<T>(config: TbxMatBottomSheetConfig<T>, resolvedFooter: readonly TbxMatBottomSheetFooterControlType[]): boolean {
        if (config.content) {
            return true;
        }
        return resolvedFooter.some((item) => item.type === 'button' && item.result === TbxMatBottomSheetDismissReason.Affirm);
    }

    /**
     * Open the bottom sheet shell with resolved config
     *
     * @remarks
     * Wires `disableClose`. Sets `ariaModal` for screen reader modal semantics. `autoFocus`
     * is set to `'first-tabbable'` when the bottom sheet has a focus target that can claim
     * `cdkFocusInitial` — either a content component (consumer's `cdkFocusInitial` on a form
     * field) or an affirm button in the footer (the shell applies `cdkFocusInitial` via
     * `shouldAutoFocus()`). Otherwise `autoFocus` falls back to `'dialog'` so initial focus
     * lands on the bottom sheet container rather than the close button. The close button
     * remains in the tab order in every case; only initial focus changes.
     *
     * Footer values and content data are only included in the output when the user
     * affirms. Deny, Cancel, Close, Escape, and backdrop dismiss all return empty
     * `footerValues` — negative actions never carry state that implies confirmation.
     *
     * The `panelClass` list includes the per-severity `tbx-mat-bottom-sheet-panel-{level}`
     * class consumed by the shared severity-theme SCSS mixin.
     *
     * {@link https://material.angular.dev/components/bottom-sheet/api | MatBottomSheetConfig}
     * does not expose width/height knobs — sizing is controlled entirely via CSS on the
     * host element, so no sizing options are passed through.
     *
     * Returns a Promise that resolves with the bottom sheet output, or a fallback Close result
     * if the bottom sheet is dismissed without a result (e.g., backdrop click when
     * `disableClose` is `false`).
     *
     * @internal
     */
    private async open<T, F extends Record<string, unknown>>(config: TbxMatBottomSheetConfig<T>, resolvedFooter: readonly TbxMatBottomSheetFooterControlType[]): Promise<TbxMatBottomSheetResult<T, F>> {
        const shellData: BottomSheetShellData = {
            config: config as TbxMatBottomSheetConfig<unknown>,
            resolvedFooter,
        };

        const severity = config.type ?? TbxMatSeverityLevel.Default;

        const ref = this.bottomSheet.open(BottomSheetShellComponent, {
            data: shellData,
            disableClose: config.disableClose ?? false,
            panelClass: ['tbx-mat-bottom-sheet-panel', `tbx-mat-bottom-sheet-panel-${severity}`],
            // Use `'first-tabbable'` whenever there is a focus target the bottom
            // sheet shell or content can claim via `cdkFocusInitial`:
            //   - input bottom sheets (`config.content` set) — the consumer's
            //     `cdkFocusInitial` on a form field inside the projected
            //     content component takes precedence.
            //   - bottom sheets with an affirm button in the footer — the shell
            //     applies `cdkFocusInitial` to the affirm button via
            //     `BottomSheetShellComponent.shouldAutoFocus()`.
            //
            // When neither is present (footerless `show()` calls or footers
            // that have no affirm button), fall back to `'dialog'` so initial
            // focus goes to the bottom sheet container rather than the close
            // button. The close button is first in DOM order and would
            // otherwise win `'first-tabbable'` — and the heading is not a
            // valid focus target since headings are not actionable.
            // The close button stays in the tab order in every case; only
            // initial focus changes.
            autoFocus: this.hasFocusTarget(config, resolvedFooter) ? 'first-tabbable' : 'dialog',
            ariaModal: true,
        });

        const output = await firstValueFrom(ref.afterDismissed());

        // When bottom sheet is dismissed via backdrop/Escape without a button click,
        // afterDismissed() emits undefined. Return a Close result with empty footer values.
        if (!output) {
            return {
                result: TbxMatBottomSheetDismissReason.Close,
                footerValues: {} as F,
            };
        }

        return output as TbxMatBottomSheetResult<T, F>;
    }
}
