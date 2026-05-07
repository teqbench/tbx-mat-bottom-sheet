/**
 * Resolved icon ready for template rendering.
 *
 * Returned by the icon-resolution helpers in the bottom sheet component. The
 * `isSvg` flag tells the template which `<mat-icon>` branch to render
 * (SVG element vs font ligature).
 *
 * @internal
 */
export interface ResolvedIcon {
    readonly name: string;
    readonly isSvg: boolean;
}
