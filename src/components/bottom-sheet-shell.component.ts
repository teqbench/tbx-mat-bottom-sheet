import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal, viewChild, ViewContainerRef, ComponentRef, type Signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatIconType, TBX_MAT_FONT_ICON_DEFAULT_FONT_SET } from '@teqbench/tbx-mat-icons';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { type TbxMatBottomSheetConfig, type TbxMatBottomSheetData } from '../models/bottom-sheet.model';
import { type TbxMatBottomSheetFooterButton, type TbxMatBottomSheetFooterCheckbox, type TbxMatBottomSheetFooterToggle, type TbxMatBottomSheetFooterRadioGroup, type TbxMatBottomSheetFooterToggleGroup } from '../models/bottom-sheet-footer.model';
import { type TbxMatBottomSheetFooterControlType } from '../types/bottom-sheet-footer-control.type';
import { type TbxMatBottomSheetIconResolver } from '../types/bottom-sheet-icon-resolver.type';
import { type ResolvedIcon } from '../models/resolved-icon.model';
import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG } from '../tokens/bottom-sheet-provider-config.token';
import { TbxMatBottomSheetCloseFontIconService } from '../services/bottom-sheet-close-font-icon.service';

/**
 * Internal data payload injected into BottomSheetShellComponent via MAT_BOTTOM_SHEET_DATA.
 *
 * @remarks
 * This is the shape the {@link TbxMatBottomSheetService} passes when opening the shell.
 * It extends {@link TbxMatBottomSheetConfig} with the resolved footer (service applies default
 * button presets when the caller omits footer).
 *
 * @internal
 */
export interface BottomSheetShellData {
    readonly config: TbxMatBottomSheetConfig<unknown>;
    readonly resolvedFooter: readonly TbxMatBottomSheetFooterControlType[];
}

/**
 * Render the common bottom sheet chrome shared by all bottom sheet types (info, confirm, input).
 *
 * @remarks
 * Renders a consistent layout:
 *   - Header: icon in circular container (optional), title (associated via
 *     aria-labelledby for accessibility), context badge (mat-chip, optional),
 *     subtitle (optional), close button — all vertically centered
 *   - mat-divider separator
 *   - Body: message text or dynamically created content component, with scrollable
 *     overflow for long content
 *   - mat-divider separator (conditional — only if footer has items)
 *   - Footer: single flex row of buttons and controls
 *
 * The shell is internal to the bottom sheet system — consumers never reference it directly.
 * They interact with {@link TbxMatBottomSheetService}, which opens this component via
 * {@link https://material.angular.dev/components/bottom-sheet/api | MatBottomSheet}.
 *
 * Unlike {@link https://material.angular.dev/components/dialog/api | MatDialog}, the
 * {@link https://material.angular.dev/components/bottom-sheet/api | MatBottomSheet} package
 * does not ship structural directives (no `MatBottomSheetTitle`, `MatBottomSheetContent`,
 * or `MatBottomSheetActions`). Semantic HTML carries the structure instead — the title's
 * id is wired to the host via `aria-labelledby` so assistive technologies announce it as
 * the sheet's accessible name.
 *
 * For input bottom sheets, the shell dynamically creates the content component from
 * config.content and reads its isValid/value signals. The affirm button's
 * disabled state is automatically driven by isValid when a content component
 * is present.
 *
 * Footer buttons use separate template elements for filled vs text variants
 * because matButton is a compile-time directive — it cannot be bound dynamically
 * via [attr.matButton]. Each emphasis maps to a static directive:
 *   - 'primary' / 'destructive' → matButton="filled" with CSS class emphasis
 *   - 'text' / undefined → matButton="text"
 *
 * Severity colors are driven by the per-severity panel class
 * (`tbx-mat-bottom-sheet-panel-{level}`) applied to the MatBottomSheet overlay by
 * `TbxMatBottomSheetService`. Each panel class exposes
 * `--tbx-mat-bottom-sheet-current-{background,text}` tokens via the
 * `_severity-panel` mixin in `_tbx-mat-bottom-sheet.scss`. The header icon
 * container and primary/destructive button classes consume those tokens
 * directly — no host attribute binding or inline style bindings needed.
 * Button overrides use Angular Material's `mat.button-overrides()` mixin
 * in the global stylesheet.
 *
 * Icon position uses Material's `iconPositionEnd` attribute on `mat-icon`.
 * Material's button template has separate content projection slots for
 * before-label and after-label icons. The `iconPositionEnd` attribute
 * routes the icon to the after-label slot, which also applies the correct
 * margin spacing via `--mat-button-*-icon-spacing` and `--mat-button-*-icon-offset`.
 *
 * Padding is controlled by a single CSS custom property (--bottom-sheet-padding-inline)
 * on :host, ensuring header, body, footer, and divider insets are always aligned.
 *
 * @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbx-mat-bottom-sheet-shell',
    imports: [MatButtonModule, MatIconModule, MatCheckboxModule, MatSlideToggleModule, MatRadioModule, MatButtonToggleModule, MatDivider, MatChipSet, MatChip],
    host: {
        '[attr.aria-labelledby]': 'titleId',
    },
    template: `
        <!-- ── Header ───────────────────────────────────────── -->
        <header class="bottom-sheet-header">
            <div class="header-content">
                @let severityIconValue = severityIcon();
                @if (severityIconValue) {
                    @if (severityIconValue.isSvg) {
                        <mat-icon class="tbx-mat-bottom-sheet-icon" [svgIcon]="severityIconValue.name" aria-hidden="true"></mat-icon>
                    } @else {
                        <mat-icon class="tbx-mat-bottom-sheet-icon" aria-hidden="true">{{ severityIconValue.name }}</mat-icon>
                    }
                }
                <div class="header-text">
                    <div class="header-title-row">
                        <h2 [id]="titleId" class="bottom-sheet-title">{{ config.title }}</h2>
                        @if (config.contextBadge) {
                            <mat-chip-set>
                                <mat-chip disabled>{{ config.contextBadge }}</mat-chip>
                            </mat-chip-set>
                        }
                    </div>
                    @if (config.subtitle) {
                        <p class="bottom-sheet-subtitle">{{ config.subtitle }}</p>
                    }
                </div>
            </div>
            <button matIconButton class="tbx-mat-bottom-sheet-close-icon-button" (click)="close()" aria-label="Close bottom sheet">
                @let closeIconValue = closeIcon();
                @if (closeIconValue) {
                    @if (closeIconValue.isSvg) {
                        <mat-icon [svgIcon]="closeIconValue.name" aria-hidden="true"></mat-icon>
                    } @else {
                        <mat-icon aria-hidden="true">{{ closeIconValue.name }}</mat-icon>
                    }
                }
            </button>
        </header>

        <mat-divider class="bottom-sheet-separator" />

        <!-- ── Body ─────────────────────────────────────────── -->
        <div class="bottom-sheet-body">
            @if (config.content) {
                <ng-container #contentHost></ng-container>
            } @else if (config.message) {
                <p class="bottom-sheet-message">{{ config.message }}</p>
            }
        </div>

        <!-- ── Footer ───────────────────────────────────────── -->
        @if (resolvedFooter.length > 0) {
            <mat-divider class="bottom-sheet-separator" />

            <div class="bottom-sheet-footer">
                @for (control of resolvedFooter; track control.key; let i = $index) {
                    <div [class.footer-end-start]="i === firstEndIndex()">
                        @switch (control.type) {
                            @case ('button') {
                                @let btn = asButton(control);
                                <!-- matButton is a compile-time directive and cannot be
                                bound dynamically via [attr.matButton]. Separate elements
                                for filled vs text ensure proper Material rendering.
                                Icon position uses Material's iconPositionEnd attribute
                                to route mat-icon to the correct content projection slot,
                                which also applies proper margin spacing. -->
                                @if (btn.emphasis === 'primary' || btn.emphasis === 'destructive') {
                                    <button matButton="filled" [class.tbx-mat-bottom-sheet-btn-destructive]="btn.emphasis === 'destructive'" [attr.cdkFocusInitial]="shouldAutoFocus(btn) ? '' : null" [disabled]="isButtonDisabled(btn)" (click)="onButtonClick(btn)">
                                        @if (btn.icon && btn.iconPosition !== 'after') {
                                            <mat-icon>{{ btn.icon }}</mat-icon>
                                        }
                                        {{ btn.label }}
                                        @if (btn.icon && btn.iconPosition === 'after') {
                                            <mat-icon iconPositionEnd>{{ btn.icon }}</mat-icon>
                                        }
                                    </button>
                                } @else {
                                    <button matButton="text" [disabled]="isButtonDisabled(btn)" (click)="onButtonClick(btn)">
                                        @if (btn.icon && btn.iconPosition !== 'after') {
                                            <mat-icon>{{ btn.icon }}</mat-icon>
                                        }
                                        {{ btn.label }}
                                        @if (btn.icon && btn.iconPosition === 'after') {
                                            <mat-icon iconPositionEnd>{{ btn.icon }}</mat-icon>
                                        }
                                    </button>
                                }
                            }
                            @case ('checkbox') {
                                @let chk = asCheckbox(control);
                                <mat-checkbox [checked]="getFooterValue(chk.key) === true" (change)="setFooterValue(chk.key, $event.checked)">{{ chk.label }}</mat-checkbox>
                            }
                            @case ('toggle') {
                                @let tgl = asToggle(control);
                                <mat-slide-toggle [checked]="getFooterValue(tgl.key) === true" (change)="setFooterValue(tgl.key, $event.checked)">{{ tgl.label }}</mat-slide-toggle>
                            }
                            @case ('radio-group') {
                                @let rdo = asRadioGroup(control);
                                <mat-radio-group [value]="getFooterValue(rdo.key)" (change)="setFooterValue(rdo.key, $event.value)">
                                    @for (option of rdo.options; track option.value) {
                                        <mat-radio-button [value]="option.value">
                                            {{ option.label }}
                                        </mat-radio-button>
                                    }
                                </mat-radio-group>
                            }
                            @case ('toggle-group') {
                                @let tglGrp = asToggleGroup(control);
                                <mat-button-toggle-group [multiple]="tglGrp.multiple ?? false" [value]="getFooterValue(tglGrp.key)" (change)="setFooterValue(tglGrp.key, $event.value)">
                                    @for (option of tglGrp.options; track option.value) {
                                        <mat-button-toggle [value]="option.value">
                                            @if (option.icon) {
                                                <mat-icon>{{ option.icon }}</mat-icon>
                                            }
                                            @if (option.label) {
                                                {{ option.label }}
                                            }
                                        </mat-button-toggle>
                                    }
                                </mat-button-toggle-group>
                            }
                        }
                    </div>
                }
            </div>
        }
    `,
    styles: `
        :host {
            --bottom-sheet-padding-inline: 1.25rem;
            display: block;
        }

        /* ── Header ────────────────────────────────────────── */

        /* The bottom sheet surface itself carries the severity background and
         * on-severity text color (set by the .tbx-mat-bottom-sheet-panel-{level}
         * class via the _severity-panel mixin in _tbx-mat-bottom-sheet.scss).
         * The header / body / footer all sit on the same colored surface,
         * mirroring how tbx-mat-banners and tbx-mat-notifications color
         * their entire panel. */
        .bottom-sheet-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem var(--bottom-sheet-padding-inline) 1rem;
            gap: 0.75rem;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
        }

        /* Severity icon — rendered directly in the colored panel, no
         * surrounding container, no explicit color, no
         * font-variation-settings. Mirrors .tbx-mat-banner-icon /
         * .tbx-mat-notification-icon exactly: same class-name shape,
         * same --tbx-mat-{pkg}-icon-size token, same flex-shrink
         * behavior. The icon inherits its color from the bottom sheet
         * surface (= --tbx-mat-bottom-sheet-current-text, the on-severity
         * color set by the panel mixin), so it renders identically to
         * how banners and notifications render their severity icons. */
        .tbx-mat-bottom-sheet-icon {
            flex-shrink: 0;
            font-size: var(--tbx-mat-bottom-sheet-icon-size, 3rem);
            width: var(--tbx-mat-bottom-sheet-icon-size, 3rem);
            height: var(--tbx-mat-bottom-sheet-icon-size, 3rem);
        }

        .header-text {
            flex: 1;
            min-width: 0;
        }

        .header-title-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* The title's id is wired to the host via aria-labelledby so assistive
         * technologies announce it as the sheet's accessible name.
         * Color: inherits from the colored header (= --tbx-mat-bottom-sheet-current-text). */
        .bottom-sheet-title {
            font: var(--mat-sys-title-large);
            color: inherit;
            display: inline;
            margin: 0;
            padding: 0;
        }

        .bottom-sheet-subtitle {
            font: var(--mat-sys-body-small);
            color: inherit;
            margin: 0.25rem 0 0;
        }

        /* ── Separator ─────────────────────────────────────── */

        .bottom-sheet-separator {
            margin-left: var(--bottom-sheet-padding-inline);
            margin-right: var(--bottom-sheet-padding-inline);
            width: calc(100% - 2 * var(--bottom-sheet-padding-inline));
            opacity: 35%;
        }

        /* ── Body ──────────────────────────────────────────── */

        /* Body element provides scrollable overflow for long content. */
        .bottom-sheet-body {
            padding: 1.25rem var(--bottom-sheet-padding-inline);
            min-height: 3rem;
            max-height: 65vh;
            overflow: auto;
        }

        .bottom-sheet-message {
            font: var(--mat-sys-body-medium);
            color: inherit;
            margin: 0;
            line-height: 1.6;
        }

        /* ── Footer ────────────────────────────────────────── */

        /* Footer element provides semantic action container.
         * The shell manages its own layout via --bottom-sheet-padding-inline. */
        .bottom-sheet-footer {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 1rem var(--bottom-sheet-padding-inline);
            min-height: auto;
        }

        .footer-end-start {
            margin-left: auto;
        }
    `,
})
export class BottomSheetShellComponent {
    private readonly ref = inject(MatBottomSheetRef<BottomSheetShellComponent>);
    private readonly shellData = inject<BottomSheetShellData>(MAT_BOTTOM_SHEET_DATA);
    private readonly providerConfig = inject(TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG);

    /**
     * Package-provided default close icon resolver, used when the consumer's
     * `TbxMatBottomSheetProviderConfig` does not supply a custom `closeIconResolverService`.
     * Mirrors the pattern used by `TbxMatBannerComponent`.
     */
    private readonly defaultCloseIconService = new TbxMatBottomSheetCloseFontIconService(inject(TBX_MAT_FONT_ICON_DEFAULT_FONT_SET, { optional: true }) ?? inject(MAT_ICON_DEFAULT_OPTIONS, { optional: true })?.fontSet);

    /** The caller's configuration (title, icon, message, type, content, etc.). */
    readonly config = this.shellData.config;

    /** Resolved footer items (service applies default presets when caller omits footer). */
    readonly resolvedFooter = this.shellData.resolvedFooter;

    private static nextTitleId = 0;

    /**
     * Stable id for the title h2.
     *
     * @remarks
     * Used as the target of the host's `aria-labelledby` binding so assistive
     * technologies announce the title as the sheet's accessible name. The bottom
     * sheet has no `MatBottomSheetTitle` directive, so this association is
     * managed explicitly by the shell.
     */
    protected readonly titleId = `tbx-mat-bottom-sheet-title-${BottomSheetShellComponent.nextTitleId++}`;

    /**
     * Reference to the dynamically created content component (input bottom sheets only).
     *
     * Signal-based so Angular's reactive system picks up the change when the
     * content component is created in afterNextRender — no manual change
     * detection needed.
     */
    private readonly contentRef = signal<TbxMatBottomSheetData<unknown> | null>(null);

    /** ViewContainerRef for the content host — used to dynamically create input bottom sheet content. */
    readonly contentHost = viewChild('contentHost', { read: ViewContainerRef });

    /**
     * Current values of all footer controls, keyed by control.key.
     * Initialized from initialValue on each control, updated on user interaction.
     * Included in TbxMatBottomSheetResult.footerValues when the bottom sheet closes.
     */
    private readonly footerValues = signal<Record<string, unknown>>(this.buildInitialFooterValues());

    /**
     * The resolved severity — defaults to Default when not specified.
     * Used by `severityIcon` to look up the right icon from the resolver.
     * The per-severity panel class on the MatBottomSheet overlay drives all
     * color tokens; the component does not bind the severity to any
     * host attribute.
     */
    private readonly type = this.config.type ?? TbxMatSeverityLevel.Default;

    /**
     * Resolved severity icon for the header.
     *
     * A consumer-provided `config.icon` override always wins and is rendered
     * as a font ligature. When no override is present, the icon is resolved
     * from the severity (`config.type`) via the configured
     * `severityIconResolverService` on `TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG`.
     * Returns `null` when no icon should be rendered.
     */
    readonly severityIcon = computed<ResolvedIcon | null>(() => {
        if (this.config.icon) {
            return { name: this.config.icon, isSvg: false };
        }
        return this.resolveIcon(this.providerConfig.severityIconResolverService, this.type);
    });

    /**
     * Resolved close button icon. Defers to the consumer's
     * `closeIconResolverService` when provided; otherwise uses the package
     * default `TbxMatBottomSheetCloseFontIconService` (font ligature `'close'`).
     */
    readonly closeIcon = computed<ResolvedIcon | null>(() => this.resolveIcon(this.providerConfig.closeIconResolverService ?? this.defaultCloseIconService, 'close'));

    /**
     * Index of the first footer item with align: 'end'.
     * Used to apply margin-left: auto for the start/end split.
     * Returns -1 if all items are align: 'start'.
     */
    readonly firstEndIndex = computed(() => this.resolvedFooter.findIndex((c) => c.align === 'end'));

    // ── Footer control type cast helpers ────────────────────────────────
    //
    // Angular's template type checker does not narrow discriminated unions
    // inside @switch/@case blocks. These one-line type assertions are used
    // with @let to create typed template variables in each @case branch,
    // restoring full type safety without $any().
    //
    // The @switch guarantees the discriminant matches — the cast is safe.

    /** Cast for `@case ('button')` — provides TbxMatBottomSheetFooterButton type in template. */
    protected asButton(control: TbxMatBottomSheetFooterControlType): TbxMatBottomSheetFooterButton {
        return control as TbxMatBottomSheetFooterButton;
    }

    /** Cast for `@case ('checkbox')` — provides TbxMatBottomSheetFooterCheckbox type in template. */
    protected asCheckbox(control: TbxMatBottomSheetFooterControlType): TbxMatBottomSheetFooterCheckbox {
        return control as TbxMatBottomSheetFooterCheckbox;
    }

    /** Cast for `@case ('toggle')` — provides TbxMatBottomSheetFooterToggle type in template. */
    protected asToggle(control: TbxMatBottomSheetFooterControlType): TbxMatBottomSheetFooterToggle {
        return control as TbxMatBottomSheetFooterToggle;
    }

    /** Cast for `@case ('radio-group')` — provides TbxMatBottomSheetFooterRadioGroup type in template. */
    protected asRadioGroup(control: TbxMatBottomSheetFooterControlType): TbxMatBottomSheetFooterRadioGroup {
        return control as TbxMatBottomSheetFooterRadioGroup;
    }

    /** Cast for `@case ('toggle-group')` — provides TbxMatBottomSheetFooterToggleGroup type in template. */
    protected asToggleGroup(control: TbxMatBottomSheetFooterControlType): TbxMatBottomSheetFooterToggleGroup {
        return control as TbxMatBottomSheetFooterToggleGroup;
    }

    constructor() {
        /**
         * Dynamically create the content component for input bottom sheets.
         *
         * afterNextRender runs after the browser paints, entirely outside
         * Angular's change detection cycle. Setting contentRef here is
         * structurally safe — NG0100 is impossible because no change
         * detection pass is in progress. The signal update triggers a
         * reactive re-evaluation of isButtonDisabled() on the next cycle.
         */
        afterNextRender(() => {
            const host = this.contentHost();

            if (this.config.content && host) {
                const ref: ComponentRef<TbxMatBottomSheetData<unknown>> = host.createComponent(this.config.content);
                this.contentRef.set(ref.instance);
            }
        });
    }

    /** Close the bottom sheet with TbxMatBottomSheetDismissReason.Close (dismiss without choosing). */
    close(): void {
        this.ref.dismiss({
            result: TbxMatBottomSheetDismissReason.Close,
            footerValues: {},
        });
    }

    /**
     * Handle a footer button click. If the button has a result, close the bottom sheet.
     *
     * Only Affirm includes data and footerValues — the user confirmed the
     * bottom sheet's content. Deny, Cancel, and Close are negative actions;
     * returning footer state alongside them would be a mixed signal.
     */
    onButtonClick(button: TbxMatBottomSheetFooterButton): void {
        if (button.result === undefined) {
            return;
        }

        const isAffirm = button.result === TbxMatBottomSheetDismissReason.Affirm;

        this.ref.dismiss({
            result: button.result,
            data: isAffirm ? this.contentRef()?.value() : undefined,
            footerValues: isAffirm ? this.footerValues() : {},
        });
    }

    /**
     * Whether this button should receive initial focus via cdkFocusInitial.
     *
     * For non-input bottom sheets (no content component), the affirm button receives
     * focus so the close button in the header does not. For input bottom sheets,
     * the content component manages its own focus via cdkFocusInitial on the
     * appropriate form element.
     */
    shouldAutoFocus(button: TbxMatBottomSheetFooterButton): boolean {
        return !this.config.content && button.result === TbxMatBottomSheetDismissReason.Affirm;
    }

    /**
     * Resolve a button's disabled state.
     * For affirm buttons in input bottom sheets, also checks content.isValid.
     */
    isButtonDisabled(button: TbxMatBottomSheetFooterButton): boolean {
        const content = this.contentRef();

        if (button.result === TbxMatBottomSheetDismissReason.Affirm && content && !content.isValid()) {
            return true;
        }

        if (button.disabled === undefined) {
            return false;
        }

        if (typeof button.disabled === 'boolean') {
            return button.disabled;
        }

        // Signal<boolean>
        return (button.disabled as Signal<boolean>)();
    }

    /** Get the current value of a footer control by key. */
    getFooterValue(key: string): unknown {
        return this.footerValues()[key];
    }

    /** Update the value of a footer control by key. */
    setFooterValue(key: string, value: unknown): void {
        this.footerValues.update((current) => ({ ...current, [key]: value }));
    }

    /**
     * Build initial footer values from control initialValue properties.
     * Buttons are excluded — they have results, not values.
     */
    private buildInitialFooterValues(): Record<string, unknown> {
        const values: Record<string, unknown> = {};

        for (const control of this.resolvedFooter) {
            switch (control.type) {
                case 'checkbox':
                case 'toggle':
                    values[control.key] = control.initialValue ?? false;
                    break;
                case 'radio-group':
                    values[control.key] = control.initialValue ?? null;
                    break;
                case 'toggle-group':
                    values[control.key] = control.initialValue ?? (control.multiple ? [] : null);
                    break;
            }
        }

        return values;
    }

    /**
     * Resolve a `ResolvedIcon` from a resolver and key.
     *
     * Returns `null` when the resolver or key is missing, or when the
     * resolver does not have an icon registered for the given key. The
     * `isSvg` flag is derived from the resolver's `iconType` property —
     * the template uses it to choose between `<mat-icon [svgIcon]>` and
     * `<mat-icon>{{ name }}</mat-icon>` rendering branches.
     */
    private resolveIcon(resolver: TbxMatBottomSheetIconResolver | undefined, key: string | undefined): ResolvedIcon | null {
        /* v8 ignore start -- defensive guard; resolver and key are present in normal flow */
        if (!resolver || !key) {
            return null;
        }
        /* v8 ignore stop */
        const name = resolver.resolve(key);
        if (!name) {
            return null;
        }
        return { name, isSvg: resolver.iconType === TbxMatIconType.Svg };
    }
}
