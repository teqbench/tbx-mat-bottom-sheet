import { type Signal } from '@angular/core';
import { type TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';

/**
 * Base interface for all bottom sheet footer items — buttons and form controls alike
 *
 * @remarks
 * Every footer item has a `key` (used in the returned {@link TbxMatBottomSheetResult}.footerValues
 * record) and an `align` (determines left or right positioning in the footer row).
 *
 * The footer is a single flex row. Items render in caller-specified array order. The first
 * `align: 'end'` item receives `margin-left: auto`, pushing it and all subsequent items to
 * the right side.
 *
 * @usage
 * Not used directly — extend via the discriminated members of {@link TbxMatBottomSheetFooterControlType}.
 *
 * @example
 * ```typescript
 * // Implementations are the concrete footer item interfaces.
 * const item: TbxMatBottomSheetFooterButton = {
 *     key: 'ok',
 *     type: 'button',
 *     label: 'OK',
 *     emphasis: 'primary',
 *     result: TbxMatBottomSheetDismissReason.Affirm,
 *     align: 'end',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Item
 * @order 5
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterControlType
 *
 * @public
 */
export interface TbxMatBottomSheetFooterItem {
    /**
     * Unique identifier
     *
     * @remarks
     * Used as the property name in {@link TbxMatBottomSheetResult}.footerValues.
     *
     * @order 1
     *
     * @public
     */
    readonly key: string;

    /**
     * Position within the footer row
     *
     * @remarks
     * `'start'` flows left, `'end'` flows right.
     *
     * @order 2
     *
     * @public
     */
    readonly align: 'start' | 'end';
}

/**
 * Button footer item
 *
 * @remarks
 * Clicking a button with a `result` closes the bottom sheet and returns that result in
 * {@link TbxMatBottomSheetResult}. Buttons without a `result` perform side effects (e.g.,
 * navigation) without dismissing the bottom sheet.
 *
 * @usage
 * Add to a {@link TbxMatBottomSheetConfig}.footer array, or use a button preset constant
 * ({@link TBX_MAT_BOTTOM_SHEET_BUTTONS_OK}, etc.).
 *
 * @example
 * ```typescript
 * const proceed: TbxMatBottomSheetFooterButton = {
 *     key: 'proceed',
 *     type: 'button',
 *     label: 'Proceed',
 *     emphasis: 'primary',
 *     result: TbxMatBottomSheetDismissReason.Affirm,
 *     align: 'end',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Button
 * @order 6
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterControlType
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_OK
 *
 * @public
 */
export interface TbxMatBottomSheetFooterButton extends TbxMatBottomSheetFooterItem {
    readonly type: 'button';

    /**
     * Button label text
     *
     * @order 1
     *
     * @public
     */
    readonly label: string;

    /**
     * {@link https://fonts.google.com/icons | Material Symbols} icon name
     *
     * @remarks
     * Rendered before or after the label based on `iconPosition`.
     *
     * @order 2
     *
     * @public
     */
    readonly icon?: string;

    /**
     * Position of the icon relative to the label
     *
     * @remarks
     * Defaults to `'before'`.
     *
     * @order 3
     *
     * @public
     */
    readonly iconPosition?: 'before' | 'after';

    /**
     * Visual emphasis of the button
     *
     * @remarks
     * - `'primary'` — `matButton="filled"` with the bottom-sheet severity tokens.
     * - `'text'` — `matButton="text"` (no background).
     *
     * Defaults to `'text'` when omitted. For destructive prompts, set the bottom
     * sheet `severity` to `'warning'` (reversible) or `'error'` (irreversible);
     * the panel itself communicates danger and a single `'primary'` affirm
     * button reads correctly without per-button palette overrides.
     *
     * @order 4
     *
     * @public
     */
    readonly emphasis?: 'primary' | 'text';

    /**
     * {@link TbxMatBottomSheetDismissReason} returned when this button is clicked
     *
     * @remarks
     * When provided, clicking the button closes the bottom sheet with this result.
     *
     * @order 5
     *
     * @public
     */
    readonly result?: TbxMatBottomSheetDismissReason;

    /**
     * Whether the button is disabled
     *
     * @remarks
     * Accepts a static boolean or a `Signal<boolean>` for reactive binding (e.g., driven
     * by {@link TbxMatBottomSheetData}.isValid).
     *
     * @order 6
     *
     * @public
     */
    readonly disabled?: boolean | Signal<boolean>;
}

/**
 * Checkbox footer control
 *
 * @remarks
 * Value is tracked in {@link TbxMatBottomSheetResult}.footerValues as a boolean under the
 * item's key.
 *
 * @usage
 * Add to a {@link TbxMatBottomSheetConfig}.footer array to collect a boolean alongside the
 * dismiss action.
 *
 * @example
 * ```typescript
 * const remember: TbxMatBottomSheetFooterCheckbox = {
 *     key: 'remember',
 *     type: 'checkbox',
 *     label: "Don't ask again",
 *     align: 'start',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Checkbox
 * @order 7
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterControlType
 *
 * @public
 */
export interface TbxMatBottomSheetFooterCheckbox extends TbxMatBottomSheetFooterItem {
    readonly type: 'checkbox';

    /**
     * Label displayed next to the checkbox
     *
     * @order 1
     *
     * @public
     */
    readonly label: string;

    /**
     * Initial checked state
     *
     * @remarks
     * Defaults to `false`.
     *
     * @order 2
     *
     * @public
     */
    readonly initialValue?: boolean;
}

/**
 * Slide toggle footer control
 *
 * @remarks
 * Value is tracked in {@link TbxMatBottomSheetResult}.footerValues as a boolean under the
 * item's key.
 *
 * @usage
 * Add to a {@link TbxMatBottomSheetConfig}.footer array to collect a boolean alongside the
 * dismiss action — visually distinct from a checkbox.
 *
 * @example
 * ```typescript
 * const notify: TbxMatBottomSheetFooterToggle = {
 *     key: 'notify',
 *     type: 'toggle',
 *     label: 'Email notifications',
 *     initialValue: true,
 *     align: 'start',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Toggle
 * @order 8
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterControlType
 *
 * @public
 */
export interface TbxMatBottomSheetFooterToggle extends TbxMatBottomSheetFooterItem {
    readonly type: 'toggle';

    /**
     * Label displayed next to the toggle
     *
     * @order 1
     *
     * @public
     */
    readonly label: string;

    /**
     * Initial toggle state
     *
     * @remarks
     * Defaults to `false`.
     *
     * @order 2
     *
     * @public
     */
    readonly initialValue?: boolean;
}

/**
 * Radio group footer control — single-select from a set of options
 *
 * @remarks
 * Value is tracked in {@link TbxMatBottomSheetResult}.footerValues as a string under the
 * item's key.
 *
 * @usage
 * Add to a {@link TbxMatBottomSheetConfig}.footer array to let the user pick one option from a
 * small set (typically two to four).
 *
 * @example
 * ```typescript
 * const visibility: TbxMatBottomSheetFooterRadioGroup = {
 *     key: 'visibility',
 *     type: 'radio-group',
 *     options: [
 *         { label: 'Public', value: 'public' },
 *         { label: 'Private', value: 'private' },
 *     ],
 *     initialValue: 'public',
 *     align: 'start',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Radio Group
 * @order 9
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterRadioOption
 * @related TbxMatBottomSheetFooterControlType
 *
 * @public
 */
export interface TbxMatBottomSheetFooterRadioGroup extends TbxMatBottomSheetFooterItem {
    readonly type: 'radio-group';

    /**
     * Available options
     *
     * @order 1
     *
     * @public
     */
    readonly options: readonly TbxMatBottomSheetFooterRadioOption[];

    /**
     * Initially selected option value
     *
     * @order 2
     *
     * @public
     */
    readonly initialValue?: string;
}

/**
 * Individual option within a {@link TbxMatBottomSheetFooterRadioGroup}
 *
 * @example
 * ```typescript
 * const option: TbxMatBottomSheetFooterRadioOption = { label: 'Public', value: 'public' };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Radio Option
 * @order 10
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterRadioGroup
 *
 * @public
 */
export interface TbxMatBottomSheetFooterRadioOption {
    /**
     * Display label for the radio button
     *
     * @order 1
     *
     * @public
     */
    readonly label: string;

    /**
     * Value submitted when this option is selected
     *
     * @order 2
     *
     * @public
     */
    readonly value: string;
}

/**
 * Button toggle group footer control — single-select or multi-select
 *
 * @remarks
 * Value is tracked in {@link TbxMatBottomSheetResult}.footerValues as a string (single-select)
 * or `string[]` (multi-select) under the item's key.
 *
 * @usage
 * Add to a {@link TbxMatBottomSheetConfig}.footer array to let the user pick from a set of
 * options rendered as a toggle button group. Use `multiple: true` to allow several
 * selections.
 *
 * @example
 * ```typescript
 * const align: TbxMatBottomSheetFooterToggleGroup = {
 *     key: 'align',
 *     type: 'toggle-group',
 *     options: [
 *         { label: 'Left', value: 'left', icon: 'format_align_left' },
 *         { label: 'Center', value: 'center', icon: 'format_align_center' },
 *         { label: 'Right', value: 'right', icon: 'format_align_right' },
 *     ],
 *     initialValue: 'left',
 *     align: 'start',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Toggle Group
 * @order 11
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterToggleOption
 * @related TbxMatBottomSheetFooterControlType
 *
 * @public
 */
export interface TbxMatBottomSheetFooterToggleGroup extends TbxMatBottomSheetFooterItem {
    readonly type: 'toggle-group';

    /**
     * Available options
     *
     * @order 1
     *
     * @public
     */
    readonly options: readonly TbxMatBottomSheetFooterToggleOption[];

    /**
     * Allow multiple selections
     *
     * @remarks
     * Defaults to `false` (single-select).
     *
     * @order 2
     *
     * @public
     */
    readonly multiple?: boolean;

    /**
     * Initially selected value(s)
     *
     * @remarks
     * String for single-select, `string[]` for multi-select.
     *
     * @order 3
     *
     * @public
     */
    readonly initialValue?: string | string[];
}

/**
 * Individual option within a {@link TbxMatBottomSheetFooterToggleGroup}
 *
 * @example
 * ```typescript
 * const option: TbxMatBottomSheetFooterToggleOption = {
 *     label: 'Left',
 *     value: 'left',
 *     icon: 'format_align_left',
 * };
 * ```
 *
 * @category Models
 * @displayName BottomSheet Footer Toggle Option
 * @order 12
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterToggleGroup
 *
 * @public
 */
export interface TbxMatBottomSheetFooterToggleOption {
    /**
     * Display label for the toggle button
     *
     * @order 1
     *
     * @public
     */
    readonly label: string;

    /**
     * Value submitted when this option is selected
     *
     * @order 2
     *
     * @public
     */
    readonly value: string;

    /**
     * {@link https://fonts.google.com/icons | Material Symbols} icon name
     *
     * @remarks
     * When provided, renders an icon-only toggle button.
     *
     * @order 3
     *
     * @public
     */
    readonly icon?: string;
}
