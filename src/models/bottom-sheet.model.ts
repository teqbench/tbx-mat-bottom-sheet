import { type Signal, Type } from '@angular/core';
import { type TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { type TbxMatBottomSheetFooterControlType } from '../types/bottom-sheet-footer-control.type';

/**
 * Configuration for opening a bottom sheet via {@link TbxMatBottomSheetService}
 *
 * @remarks
 * The full configuration shape used by {@link TbxMatBottomSheetService}.show(). The opinionated
 * methods (`success()`, `error()`, etc.) accept {@link TbxMatBottomSheetConfigArgs} instead,
 * which makes every field except `title` optional.
 *
 * {@link https://material.angular.dev/components/bottom-sheet/api | Angular Material's MatBottomSheetConfig}
 * does not expose sizing knobs — width and height are controlled entirely via CSS on the
 * host element.
 *
 * @typeParam T - Type of data for input bottom sheets (the value produced by the projected content
 *   component implementing {@link TbxMatBottomSheetData}). Defaults to `void`.
 *
 * @usage
 * Used when calling {@link TbxMatBottomSheetService}.show() for full control over every option.
 * Most callers should use the opinionated methods, which apply sensible defaults.
 *
 * @example
 * ```typescript
 * import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
 *
 * const config: TbxMatBottomSheetConfig = {
 *     title: 'Custom BottomSheet',
 *     icon: 'build',
 *     type: TbxMatSeverityLevel.Warning,
 *     subtitle: 'Optional secondary line',
 *     contextBadge: 'Beta',
 *     message: 'Full control over every option.',
 *     footer: [
 *         { key: 'cancel', type: 'button', label: 'Cancel', result: TbxMatBottomSheetDismissReason.Cancel, align: 'end' },
 *         { key: 'proceed', type: 'button', label: 'Proceed', emphasis: 'primary', result: TbxMatBottomSheetDismissReason.Affirm, align: 'end' },
 *     ],
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Config
 * @order 1
 * @since 0.1.0
 * @related TbxMatBottomSheetService
 * @related TbxMatBottomSheetConfigArgs
 * @related TbxMatBottomSheetResult
 *
 * @public
 */
export interface TbxMatBottomSheetConfig<T = void> {
    /**
     * BottomSheet title displayed in the header. Required.
     *
     * @order 1
     *
     * @public
     */
    readonly title: string;

    /**
     * {@link https://fonts.google.com/icons | Material Symbols} icon name displayed before
     * the title
     *
     * @remarks
     * When provided, takes precedence over the icon resolved from `type` via the configured
     * severity icon resolver. Always rendered as a font ligature.
     *
     * @order 2
     *
     * @public
     */
    readonly icon?: string;

    /**
     * Secondary text displayed below the title
     *
     * @order 3
     *
     * @public
     */
    readonly subtitle?: string;

    /**
     * Short badge text displayed next to the title
     *
     * @remarks
     * Rendered as a compact chip (e.g., "Beta", "v2", "Required").
     *
     * @order 4
     *
     * @public
     */
    readonly contextBadge?: string;

    /**
     * Message text displayed in the bottom sheet body
     *
     * @remarks
     * Ignored when `content` is provided.
     *
     * @order 5
     *
     * @public
     */
    readonly message?: string;

    /**
     * Severity level — determines accent color for icon, buttons, separators, and the
     * per-severity panel class applied to the bottom sheet overlay
     *
     * @remarks
     * Mirrors the `type` field on `TbxMatBannerConfig` and `TbxMatNotificationConfig`.
     *
     * @order 6
     *
     * @public
     */
    readonly type?: TbxMatSeverityLevel;

    /**
     * Component class to render in the bottom sheet body for input bottom sheets
     *
     * @remarks
     * Must implement {@link TbxMatBottomSheetData}. When provided, `message` is ignored.
     *
     * @order 7
     *
     * @public
     */
    readonly content?: Type<TbxMatBottomSheetData<T>>;

    /**
     * Footer items — buttons and form controls rendered in a single flex row
     *
     * @remarks
     * Items render in array order. The first `align: 'end'` item gets `margin-left: auto`,
     * pushing it and all subsequent items to the right side. When omitted,
     * {@link TbxMatBottomSheetService} applies a default button preset based on the bottom sheet method.
     *
     * @order 8
     *
     * @public
     */
    readonly footer?: readonly TbxMatBottomSheetFooterControlType[];

    /**
     * When `true`, prevents closing via Escape key or backdrop click
     *
     * @remarks
     * The user must interact with a footer button to close. Defaults to `false`.
     *
     * @order 9
     *
     * @public
     */
    readonly disableClose?: boolean;
}

/**
 * Typed output returned when a bottom sheet closes
 *
 * @remarks
 * Resolved by every {@link TbxMatBottomSheetService} method. Carries the user's action
 * ({@link TbxMatBottomSheetDismissReason}), any data produced by an input bottom sheet's projected
 * content component, and any values collected from footer form controls.
 *
 * On any non-Affirm dismissal (Deny, Cancel, Close, Escape, backdrop), `data` is `undefined`
 * and `footerValues` is an empty object — negative actions never carry state that implies
 * confirmation.
 *
 * @typeParam T - Type of data returned by input bottom sheets (from {@link TbxMatBottomSheetData}.value).
 *   Defaults to `void` for informational and confirmation bottom sheets.
 * @typeParam F - Type of footer control values. Defaults to `Record<string, unknown>`.
 *   Callers that need typed footer values specify an interface as the second generic
 *   parameter.
 *
 * @usage
 * The return shape of every {@link TbxMatBottomSheetService} method. `await` a bottom sheet call and
 * branch on `result` to handle the user's action.
 *
 * @example
 * ```typescript
 * // Simple confirmation — both generics use defaults.
 * const output: TbxMatBottomSheetResult = await bottomSheet.confirm({ title: 'Continue?' });
 *
 * // Input bottom sheet with typed data.
 * const output: TbxMatBottomSheetResult<string> = await bottomSheet.input<string>({
 *     title: 'Rename',
 *     content: RenameFormComponent, // hypothetical consumer-defined component
 * });
 *
 * // Confirmation with typed footer values.
 * interface MyFooter { dontAskAgain: boolean; }
 * const output: TbxMatBottomSheetResult<void, MyFooter> = await bottomSheet.confirm<MyFooter>({
 *     title: 'Delete?',
 * });
 * ```
 *
 * @category Models
 * @displayName BottomSheet Result
 * @order 2
 * @since 0.1.0
 * @related TbxMatBottomSheetService
 * @related TbxMatBottomSheetDismissReason
 *
 * @public
 */
export interface TbxMatBottomSheetResult<T = void, F extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Which action closed the bottom sheet
     *
     * @order 1
     *
     * @public
     */
    readonly result: TbxMatBottomSheetDismissReason;

    /**
     * Data from the projected input bottom sheet content component
     *
     * @remarks
     * `undefined` for non-input bottom sheets and for non-Affirm dismissals.
     *
     * @order 2
     *
     * @public
     */
    readonly data?: T;

    /**
     * Values from footer controls, keyed by control `key`
     *
     * @remarks
     * Empty object on Cancel / Deny / Close.
     *
     * @order 3
     *
     * @public
     */
    readonly footerValues: F;
}

/**
 * Contract for components rendered in bottom sheet bodies
 *
 * @remarks
 * The bottom sheet shell reads `isValid` to drive the affirm button's disabled state and reads
 * `value` to include in {@link TbxMatBottomSheetResult}.data when the user confirms. Content
 * components own their own form layout, validation, and state — the bottom sheet system never
 * inspects the content beyond these two signals.
 *
 * #### Focus management
 *
 * For input bottom sheets, the bottom sheet service sets `autoFocus: 'first-tabbable'` so the
 * consumer's `cdkFocusInitial` attribute on a form field inside the projected content
 * component takes precedence. Content components should apply `cdkFocusInitial` to the
 * element that should receive initial focus. This is a plain HTML attribute recognized
 * by the {@link https://material.angular.dev/cdk/a11y/api#FocusTrap | Angular CDK FocusTrap} —
 * no directive import needed. Without it, focus would fall through to the first tabbable
 * element in DOM order (typically the header close button), so applying it on the
 * intended target is required for correct UX.
 *
 * #### Non-input components (display-only content)
 *
 * Components that display content without producing a form value use the null object
 * pattern — `isValid` is always `true` (nothing to validate), `value` is always `undefined`
 * (nothing to extract). This allows any component to be hosted via
 * {@link TbxMatBottomSheetService}.show() without type casts.
 *
 * @typeParam T - Type of value produced by the form content.
 *
 * @usage
 * Implement on consumer-defined components passed to {@link TbxMatBottomSheetService}.input()
 * or {@link TbxMatBottomSheetService}.show() via {@link TbxMatBottomSheetConfig}.content.
 *
 * @example
 * ```typescript
 * // Input bottom sheet form content.
 * @Component({
 *     imports: [MatFormFieldModule, MatInputModule],
 *     template: `
 *         <mat-form-field>
 *             <input matInput cdkFocusInitial [ngModel]="name()" (ngModelChange)="name.set($event)" />
 *         </mat-form-field>
 *     `,
 * })
 * export class RenameFormComponent implements TbxMatBottomSheetData<string> {
 *     readonly name = signal('');
 *     readonly isValid = computed(() => this.name().trim().length > 0);
 *     readonly value = this.name;
 * }
 *
 * // Display-only content — null object pattern.
 * @Component({ ... })
 * export class UserSettingsComponent implements TbxMatBottomSheetData<void> {
 *     readonly isValid = signal(true);
 *     readonly value = signal<void>(undefined);
 * }
 * ```
 *
 * @category Models
 * @displayName BottomSheet Data
 * @order 3
 * @since 0.1.0
 * @related TbxMatBottomSheetService
 * @related TbxMatBottomSheetConfig
 * @related TbxMatBottomSheetResult
 *
 * @public
 */
export interface TbxMatBottomSheetData<T> {
    /**
     * Whether the form content is in a valid state
     *
     * @remarks
     * Drives the affirm button's disabled state.
     *
     * @order 1
     *
     * @public
     */
    readonly isValid: Signal<boolean>;

    /**
     * Current value of the form content
     *
     * @remarks
     * Included in {@link TbxMatBottomSheetResult}.data on Affirm.
     *
     * @order 2
     *
     * @public
     */
    readonly value: Signal<T>;
}
