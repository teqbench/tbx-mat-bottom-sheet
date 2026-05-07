import { Injectable } from '@angular/core';
import { TBX_MAT_SEVERITY_DEFAULT_FONT_LIGATURES, TbxMatSeverityFontIconService, TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';

/**
 * Resolve severity levels to font-based bottom sheet icons
 *
 * @remarks
 * Default font-based severity bottom sheet icon service. Extends `TbxMatSeverityFontIconService`
 * from `@teqbench/tbx-mat-severity-theme` and registers the shared default
 * {@link https://fonts.google.com/icons | Material Symbols} ligatures
 * (`TBX_MAT_SEVERITY_DEFAULT_FONT_LIGATURES`) for every severity level. The inherited
 * `resolve()` and severity methods (`default()`, `success()`, `error()`, etc.) work via
 * the registered mappings.
 *
 * No provider is registered automatically — instantiate explicitly via the
 * {@link TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG} factory.
 *
 * #### fontSet resolution
 *
 * The fontSet is resolved by `TbxMatFontIconService`'s fallback chain:
 *
 * 1. Explicit constructor argument — `new TbxMatBottomSheetSeverityFontIconService('material-symbols-sharp')`.
 * 2. `TBX_MAT_FONT_ICON_DEFAULT_FONT_SET` token — set once in `app.config.ts`.
 * 3. `MAT_ICON_DEFAULT_OPTIONS.fontSet` — {@link https://material.angular.dev | Angular Material}'s global icon default.
 * 4. Error — if none of the above provides a fontSet.
 *
 * @usage
 * Provide as `severityIconResolverService` on {@link TbxMatBottomSheetProviderConfig}. Subclass
 * to override individual ligatures.
 *
 * @example
 * ```typescript
 * // app.config.ts — using with MAT_ICON_DEFAULT_OPTIONS.
 * import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
 * import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG, TbxMatBottomSheetSeverityFontIconService }
 *     from '@teqbench/tbx-mat-bottom-sheet';
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
 * // Using with an explicit fontSet.
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
 * @category Services
 * @displayName Severity Font Icon Service
 * @order 2
 * @since 0.1.0
 * @related TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG
 * @related TbxMatBottomSheetProviderConfig
 * @related TbxMatBottomSheetSeveritySvgIconService
 *
 * @public
 */
@Injectable()
export class TbxMatBottomSheetSeverityFontIconService extends TbxMatSeverityFontIconService {
    /**
     * Construct a font-based severity icon service
     *
     * @param fontSet - Optional fontSet identifier (e.g., `'material-symbols-rounded'`).
     *   When provided, takes precedence over all global defaults.
     *
     * @public
     */
    constructor(fontSet?: string) {
        super(fontSet);
    }

    /**
     * Register the shared default {@link https://fonts.google.com/icons | Material Symbols}
     * ligatures for every severity level
     *
     * @remarks
     * Iterates `TBX_MAT_SEVERITY_DEFAULT_FONT_LIGATURES` from
     * `@teqbench/tbx-mat-severity-theme`, registering each level's ligature. These work
     * with any {@link https://fonts.google.com/icons | Material Symbols} font variant
     * (outlined, rounded, sharp) since the ligature names are consistent across variants.
     * Subclasses can override any of these defaults by calling `register()` with the same
     * key and a different ligature.
     *
     * @internal
     */
    protected override initialize(): void {
        super.initialize();
        for (const level of Object.values(TbxMatSeverityLevel)) {
            this.register(level, TBX_MAT_SEVERITY_DEFAULT_FONT_LIGATURES[level]);
        }
    }
}
