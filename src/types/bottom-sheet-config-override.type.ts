import { type TbxMatBottomSheetConfig } from '../models/bottom-sheet.model';

/**
 * Convenience type for the opinionated bottom sheet methods (`success`, `error`, `warning`,
 * `information`, `help`, `default`, `confirm`, `input`)
 *
 * @remarks
 * Requires a `title` — all other {@link TbxMatBottomSheetConfig} fields are optional. Callers
 * specify only what they want to override; the service merges in defaults for severity
 * type and footer button preset.
 *
 * @typeParam T - Type of data for input bottom sheets. Defaults to `void`.
 *
 * @usage
 * Used as the parameter type for the opinionated {@link TbxMatBottomSheetService} methods.
 * Use {@link TbxMatBottomSheetConfig} directly when calling `show()`, which applies no defaults.
 *
 * @example
 * ```typescript
 * await bottomSheet.success({ title: 'Saved' });
 * await bottomSheet.warning({ title: 'Caution', message: 'This may take a while.' });
 * ```
 *
 * @category Types
 * @displayName BottomSheet Config Args
 * @order 2
 * @since 0.1.0
 * @related TbxMatBottomSheetConfig
 * @related TbxMatBottomSheetService
 *
 * @public
 */
export type TbxMatBottomSheetConfigArgs<T = void> = { title: string } & Partial<Omit<TbxMatBottomSheetConfig<T>, 'title'>>;
