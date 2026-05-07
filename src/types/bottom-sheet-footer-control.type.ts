import { type TbxMatBottomSheetFooterButton, type TbxMatBottomSheetFooterCheckbox, type TbxMatBottomSheetFooterToggle, type TbxMatBottomSheetFooterRadioGroup, type TbxMatBottomSheetFooterToggleGroup } from '../models/bottom-sheet-footer.model';

/**
 * Discriminated union of all bottom sheet footer item types
 *
 * @remarks
 * The bottom sheet shell component renders each item via `@switch (control.type)`,
 * and {@link https://www.typescriptlang.org | TypeScript} narrows the type
 * automatically in each branch. Members are {@link TbxMatBottomSheetFooterButton},
 * {@link TbxMatBottomSheetFooterCheckbox}, {@link TbxMatBottomSheetFooterToggle},
 * {@link TbxMatBottomSheetFooterRadioGroup}, and {@link TbxMatBottomSheetFooterToggleGroup}.
 *
 * @usage
 * Use as the element type when assembling a custom `footer` array on a {@link TbxMatBottomSheetConfig}
 * or a {@link TbxMatBottomSheetConfigArgs}.
 *
 * @example
 * ```typescript
 * const footer: readonly TbxMatBottomSheetFooterControlType[] = [
 *     { key: 'remember', type: 'checkbox', label: 'Remember me', align: 'start' },
 *     { key: 'cancel', type: 'button', label: 'Cancel', result: TbxMatBottomSheetDismissReason.Cancel, align: 'end' },
 *     { key: 'ok', type: 'button', label: 'OK', emphasis: 'primary', result: TbxMatBottomSheetDismissReason.Affirm, align: 'end' },
 * ];
 * ```
 *
 * @category Types
 * @displayName BottomSheet Footer Control Type
 * @order 3
 * @since 0.1.0
 * @related TbxMatBottomSheetFooterButton
 * @related TbxMatBottomSheetFooterCheckbox
 * @related TbxMatBottomSheetFooterToggle
 * @related TbxMatBottomSheetFooterRadioGroup
 * @related TbxMatBottomSheetFooterToggleGroup
 *
 * @public
 */
export type TbxMatBottomSheetFooterControlType = TbxMatBottomSheetFooterButton | TbxMatBottomSheetFooterCheckbox | TbxMatBottomSheetFooterToggle | TbxMatBottomSheetFooterRadioGroup | TbxMatBottomSheetFooterToggleGroup;
