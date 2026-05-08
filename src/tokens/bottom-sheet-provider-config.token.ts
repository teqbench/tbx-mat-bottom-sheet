import { InjectionToken } from '@angular/core';
import type { TbxMatBottomSheetProviderConfig } from '../models/bottom-sheet-provider-config.model';

/**
 * Injection token for bottom sheet component icon configuration
 *
 * @remarks
 * Required. Provide in `app.config.ts` to configure the severity icon resolver service and
 * the close button icon. Use {@link TbxMatBottomSheetSeverityFontIconService} for font icons or
 * {@link TbxMatBottomSheetSeveritySvgIconService} for SVG icons — both ship with sensible
 * defaults from `@teqbench/tbx-mat-severity-theme`.
 *
 * No provider is registered automatically — without an explicit provider, the bottom sheet
 * component will not render.
 *
 * @usage
 * Provide in `app.config.ts` with a {@link TbxMatBottomSheetProviderConfig} factory.
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
 * // Font icons via MAT_ICON_DEFAULT_OPTIONS (no explicit fontSet).
 * import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
 * import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG, TbxMatBottomSheetSeverityFontIconService }
 *     from '@teqbench/tbx-mat-bottom-sheets';
 *
 * providers: [
 *     { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-rounded' } },
 *     {
 *         provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
 *         useFactory: () => ({
 *             severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService(),
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
 * @category Tokens
 * @displayName BottomSheet Provider Config Token
 * @order 1
 * @since 0.1.0
 * @related TbxMatBottomSheetProviderConfig
 * @related TbxMatBottomSheetSeverityFontIconService
 * @related TbxMatBottomSheetSeveritySvgIconService
 * @related TbxMatBottomSheetCloseFontIconService
 *
 * @public
 */
export const TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG = new InjectionToken<TbxMatBottomSheetProviderConfig>('TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG');
