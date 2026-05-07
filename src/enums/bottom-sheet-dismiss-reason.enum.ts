/**
 * Identify which action closed a bottom sheet
 *
 * @remarks
 * Returned as {@link TbxMatBottomSheetResult}.result when the bottom sheet closes.
 *
 * - `Affirm` — User confirmed the action (OK, Yes, Save, Delete, etc.).
 * - `Deny` — User explicitly declined (No).
 * - `Cancel` — User aborted the interaction (Cancel button).
 * - `Close` — User dismissed without choosing (close button, Escape, backdrop).
 *
 * @usage
 * Compare {@link TbxMatBottomSheetResult}.result against the enum members to branch on the
 * user's action. Footer button declarations carry a `result` field that maps the click
 * to one of these values.
 *
 * @example
 * ```typescript
 * const output = await bottomSheet.confirm({ title: 'Delete?', message: 'This cannot be undone.' });
 * if (output.result === TbxMatBottomSheetDismissReason.Affirm) {
 *     // proceed with deletion
 * }
 * ```
 *
 * @category Enums
 * @displayName BottomSheet Dismiss Reason
 * @order 1
 * @since 0.1.0
 * @related TbxMatBottomSheetResult
 *
 * @public
 */
export enum TbxMatBottomSheetDismissReason {
    /**
     * The user confirmed the action (OK, Yes, Save, Delete, etc.)
     *
     * @public
     */
    Affirm = 'affirm',

    /**
     * The user explicitly declined (No)
     *
     * @public
     */
    Deny = 'deny',

    /**
     * The user aborted the interaction (Cancel button)
     *
     * @public
     */
    Cancel = 'cancel',

    /**
     * The user dismissed without choosing (close button, Escape, backdrop)
     *
     * @public
     */
    Close = 'close',
}
