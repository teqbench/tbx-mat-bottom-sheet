import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { type TbxMatBottomSheetFooterButton } from '../models/bottom-sheet-footer.model';

/**
 * Single OK button preset — right-aligned, primary emphasis
 *
 * @remarks
 * Default footer for the severity-leveled methods (`success`, `error`, `warning`,
 * `information`, `help`, `default`).
 *
 * @usage
 * Spread into a custom `footer` array, or pass directly as the `footer` field. Use when
 * the bottom sheet only needs an acknowledgement.
 *
 * @example
 * ```typescript
 * await bottomSheet.show({ title: 'Saved', message: 'Done.', footer: TBX_MAT_BOTTOM_SHEET_BUTTONS_OK });
 * ```
 *
 * @category Constants
 * @displayName OK Buttons Preset
 * @order 1
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL
 *
 * @public
 */
export const TBX_MAT_BOTTOM_SHEET_BUTTONS_OK: readonly TbxMatBottomSheetFooterButton[] = [
    {
        key: 'ok',
        type: 'button',
        label: 'OK',
        result: TbxMatBottomSheetDismissReason.Affirm,
        emphasis: 'primary',
        align: 'end',
    },
];

/**
 * OK + Cancel buttons preset — Cancel left, OK right
 *
 * @remarks
 * Default footer for the `input` method.
 *
 * @usage
 * Use when the bottom sheet requires a positive commit and offers an explicit cancel path.
 *
 * @example
 * ```typescript
 * await bottomSheet.show({
 *     title: 'Rename',
 *     content: RenameFormComponent, // hypothetical consumer-defined component
 *     footer: TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL,
 * });
 * ```
 *
 * @category Constants
 * @displayName OK/Cancel Buttons Preset
 * @order 2
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_OK
 *
 * @public
 */
export const TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL: readonly TbxMatBottomSheetFooterButton[] = [
    {
        key: 'cancel',
        type: 'button',
        label: 'Cancel',
        result: TbxMatBottomSheetDismissReason.Cancel,
        emphasis: 'text',
        align: 'start',
    },
    {
        key: 'ok',
        type: 'button',
        label: 'OK',
        result: TbxMatBottomSheetDismissReason.Affirm,
        emphasis: 'primary',
        align: 'end',
    },
];

/**
 * Yes + No buttons preset — both right-aligned, Yes primary
 *
 * @remarks
 * Default footer for the `confirm` method.
 *
 * @usage
 * Use when the bottom sheet asks a binary question without a "back out" path.
 *
 * @example
 * ```typescript
 * await bottomSheet.show({
 *     title: 'Continue?',
 *     message: 'Are you sure?',
 *     footer: TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO,
 * });
 * ```
 *
 * @category Constants
 * @displayName Yes/No Buttons Preset
 * @order 3
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_OK
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL
 *
 * @public
 */
export const TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO: readonly TbxMatBottomSheetFooterButton[] = [
    {
        key: 'no',
        type: 'button',
        label: 'No',
        result: TbxMatBottomSheetDismissReason.Deny,
        emphasis: 'text',
        align: 'end',
    },
    {
        key: 'yes',
        type: 'button',
        label: 'Yes',
        result: TbxMatBottomSheetDismissReason.Affirm,
        emphasis: 'primary',
        align: 'end',
    },
];

/**
 * Yes + No + Cancel buttons preset — Cancel left, No and Yes right
 *
 * @usage
 * Use when the bottom sheet asks a binary question and also needs a third option to back out
 * without committing to either answer.
 *
 * @example
 * ```typescript
 * await bottomSheet.show({
 *     title: 'Save changes?',
 *     message: 'You have unsaved changes.',
 *     footer: TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL,
 * });
 * ```
 *
 * @category Constants
 * @displayName Yes/No/Cancel Buttons Preset
 * @order 4
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO
 *
 * @public
 */
export const TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL: readonly TbxMatBottomSheetFooterButton[] = [
    {
        key: 'cancel',
        type: 'button',
        label: 'Cancel',
        result: TbxMatBottomSheetDismissReason.Cancel,
        emphasis: 'text',
        align: 'start',
    },
    {
        key: 'no',
        type: 'button',
        label: 'No',
        result: TbxMatBottomSheetDismissReason.Deny,
        emphasis: 'text',
        align: 'end',
    },
    {
        key: 'yes',
        type: 'button',
        label: 'Yes',
        result: TbxMatBottomSheetDismissReason.Affirm,
        emphasis: 'primary',
        align: 'end',
    },
];
