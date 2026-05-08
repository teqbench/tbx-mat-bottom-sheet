import { type TbxMatIconResolver, type TbxMatIconType } from '@teqbench/tbx-mat-icons';
import type { TbxMatSeverityResolver, TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';

import { type TbxMatBottomSheetIconResolver } from '../types/bottom-sheet-icon-resolver.type';

/**
 * Configuration for the bottom sheet component's injectable dependencies
 *
 * @remarks
 * Provided via the {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} injection token in `app.config.ts`.
 * Groups all bottom sheet icon customization into a single provider entry, matching the pattern
 * used by `TbxMatBannerProviderConfig` and `TbxMatNotificationProviderConfig`.
 *
 * No provider is registered automatically — consumers must explicitly provide
 * {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} for the bottom sheet component to render.
 *
 * #### Properties
 *
 * - `severityIconResolverService` — resolves severity levels to icon identifiers. Use
 *   {@link TbxMatBottomSheetSeverityFontIconService} for font icons or
 *   {@link TbxMatBottomSheetSeveritySvgIconService} for SVG icons.
 *
 * - `closeIconResolverService` (optional) — resolves the close button icon. When omitted,
 *   the package falls back to a default font-based resolver
 *   ({@link TbxMatBottomSheetCloseFontIconService}) that registers the `'close'`
 *   {@link https://fonts.google.com/icons | Material Symbols} ligature.
 *
 * @usage
 * Provide in `app.config.ts` to wire icon resolution. Required.
 *
 * @example
 * ```typescript
 * // app.config.ts — font icons with explicit fontSet.
 * import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG, TbxMatBottomSheetSeverityFontIconService }
 *     from '@teqbench/tbx-mat-bottom-sheets';
 *
 * providers: [
 *     {
 *         provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
 *         useFactory: () => ({
 *             severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService('material-symbols-rounded'),
 *         }),
 *     },
 * ]
 * ```
 *
 * @example
 * ```typescript
 * // SVG icons.
 * providers: [
 *     {
 *         provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
 *         useFactory: () => ({
 *             severityIconResolverService: new TbxMatBottomSheetSeveritySvgIconService(),
 *         }),
 *     },
 * ]
 * ```
 *
 * @example
 * ```typescript
 * // With a custom close icon resolver.
 * // MyCloseIconService is a hypothetical consumer-defined service that extends
 * // TbxMatFontIconService<string> or TbxMatSvgIconService<string> and registers
 * // an icon under the 'close' key.
 * providers: [
 *     {
 *         provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
 *         useFactory: () => ({
 *             severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService('material-symbols-rounded'),
 *             closeIconResolverService: new MyCloseIconService('material-symbols-rounded'),
 *         }),
 *     },
 * ]
 * ```
 *
 * @category Models
 * @displayName BottomSheet Provider Config
 * @order 4
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG
 * @related TbxMatBottomSheetSeverityFontIconService
 * @related TbxMatBottomSheetSeveritySvgIconService
 * @related TbxMatBottomSheetCloseFontIconService
 *
 * @public
 */
export interface TbxMatBottomSheetProviderConfig {
    /**
     * Severity icon resolver — maps severity levels to icon identifiers
     *
     * @remarks
     * Required. Provide {@link TbxMatBottomSheetSeverityFontIconService} for font icons or
     * {@link TbxMatBottomSheetSeveritySvgIconService} for SVG icons.
     *
     * @order 1
     *
     * @public
     */
    readonly severityIconResolverService: TbxMatSeverityResolver &
        TbxMatIconResolver<TbxMatSeverityLevel> & {
            readonly iconType: TbxMatIconType;
        };

    /**
     * Close button icon resolver — resolves the close/dismiss button icon
     *
     * @remarks
     * When omitted, the package falls back to a default font-based resolver
     * ({@link TbxMatBottomSheetCloseFontIconService}) that registers the `'close'`
     * {@link https://fonts.google.com/icons | Material Symbols} ligature. Consumers who
     * want SVG close icons must provide a custom resolver.
     *
     * @order 2
     *
     * @public
     */
    readonly closeIconResolverService?: TbxMatBottomSheetIconResolver;
}
