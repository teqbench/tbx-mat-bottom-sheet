import { Component, computed, effect, inject, Injectable, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { applicationConfig } from '@storybook/angular';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatFontIconService } from '@teqbench/tbx-mat-icons';
import { TbxMatBottomSheetService } from '../services/bottom-sheet.service';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL } from '../constants/bottom-sheet.constants';
import { type TbxMatBottomSheetFooterControlType } from '../types/bottom-sheet-footer-control.type';
import { type TbxMatBottomSheetData } from '../models/bottom-sheet.model';
import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG } from '../tokens/bottom-sheet-provider-config.token';
import { TbxMatBottomSheetSeverityFontIconService } from '../services/bottom-sheet-severity-font-icon.service';
import { TbxMatBottomSheetSeveritySvgIconService } from '../services/bottom-sheet-severity-svg-icon.service';

/* ─── Shared icon control types ─────────────────────────────────────────────
 *
 * Mirrors the IconSize / IconAnimation surface used by
 * `tbx-mat-banners/src/components/banner-overlay.stories.common.ts` so the
 * three packages expose the same control shape, but the size scale is
 * bottom-sheet-specific: bottom sheets default to a larger icon (3rem — the
 * equivalent of banners' `large`) because the bottom sheet header has more
 * vertical space than a banner. The options shrink downward from the
 * default — `standard` (the default 3rem), `medium` (2rem), `small` (1.5rem,
 * banners' default).
 */

export type IconSize = 'standard' | 'medium' | 'small';
export type IconAnimation = 'none' | 'state-transition' | 'pulse';

const ICON_SIZE_STYLE_ID = 'tbx-bottom-sheet-story-icon-size';
const ICON_ANIM_STYLE_ID = 'tbx-bottom-sheet-story-icon-animation';

const ICON_SIZE_MAP: Record<IconSize, string> = {
    standard: '',
    medium: '2rem',
    small: '1.5rem',
};

const STATE_TRANSITION_ANIM_CSS = `
    @keyframes tbx-bottom-sheet-icon-fill {
        from { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        to   { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    }
    .material-symbols-rounded {
        animation: tbx-bottom-sheet-icon-fill 0.3s ease-in-out 0.15s forwards;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
`;

const PULSE_ANIM_CSS = `
    @keyframes tbx-bottom-sheet-icon-pulse {
        from { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        to   { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    }
    .tbx-mat-bottom-sheet-icon {
        animation: tbx-bottom-sheet-icon-pulse 1s ease-in-out infinite alternate;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
`;

export function applyIconSize(size: IconSize): void {
    const value = ICON_SIZE_MAP[size];
    document.getElementById(ICON_SIZE_STYLE_ID)?.remove();
    if (!value) return;
    const style = document.createElement('style');
    style.id = ICON_SIZE_STYLE_ID;
    style.textContent = `html { --tbx-mat-bottom-sheet-icon-size: ${value}; }`;
    document.head.appendChild(style);
}

export function applyIconAnimation(mode: IconAnimation): void {
    document.getElementById(ICON_ANIM_STYLE_ID)?.remove();
    if (mode === 'none') return;
    const style = document.createElement('style');
    style.id = ICON_ANIM_STYLE_ID;
    style.textContent = mode === 'state-transition' ? STATE_TRANSITION_ANIM_CSS : PULSE_ANIM_CSS;
    document.head.appendChild(style);
}

/* ─── Shared argTypes for stories ───────────────────────────────────────────
 *
 * Story files spread `SHARED_HARNESS_ARG_TYPES` into their `argTypes`
 * object and `DEFAULT_HARNESS_ARGS` into their `args` object. Mirrors
 * the `SHARED_OVERLAY_ARG_TYPES` / `DEFAULT_OVERLAY_ARGS` exports in
 * banners.
 */

export const SHARED_HARNESS_ARG_TYPES = {
    iconSize: {
        name: 'Icon Size',
        control: 'select' as const,
        options: ['standard', 'medium', 'small'],
        description: 'Severity icon size (overrides --tbx-mat-bottom-sheet-icon-size at the document level). Bottom sheets default to a larger icon than banners/notifications because the header has more vertical space.',
    },
    iconAnimation: {
        name: 'Icon Animation',
        control: 'select' as const,
        options: ['none', 'state-transition', 'pulse'],
        description: 'Severity icon animation. `state-transition` fills the Material Symbols glyph once on enter; `pulse` loops the FILL axis indefinitely.',
    },
};

export const DEFAULT_HARNESS_ARGS = {
    iconSize: 'standard' as IconSize,
    iconAnimation: 'none' as IconAnimation,
};

/* ─── Demo input component ──────────────────────────────────────────────────
 *
 * Implements `TbxMatBottomSheetData<StoryInputData>`. Lives inside the stories
 * common file (not exported from the package) so the Input flow story can
 * demonstrate the input bottom sheet UX without exposing a sample/reference
 * component on the public API surface — matching how `tbx-mat-banners`
 * and `tbx-mat-notifications` keep example UI inside their stories files.
 */

export interface StoryInputData {
    readonly firstName: string;
    readonly lastName: string;
    readonly address: string;
}

@Component({
    selector: 'tbx-story-input',
    imports: [FormsModule, MatFormFieldModule, MatInputModule],
    template: `
        <div class="story-input-form">
            <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput cdkFocusInitial required [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" placeholder="Enter first name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput required [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" placeholder="Enter last name" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Address</mat-label>
                <input matInput [ngModel]="address()" (ngModelChange)="address.set($event)" placeholder="Enter address (optional)" />
            </mat-form-field>
        </div>
    `,
    styles: `
        .story-input-form {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .story-input-form mat-form-field {
            width: 100%;
        }
    `,
})
export class StoryInputComponent implements TbxMatBottomSheetData<StoryInputData> {
    readonly firstName = signal('');
    readonly lastName = signal('');
    readonly address = signal('');

    readonly isValid = computed(() => this.firstName().trim().length > 0 && this.lastName().trim().length > 0);

    readonly value = computed<StoryInputData>(() => ({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        address: this.address().trim(),
    }));
}

/* ─── Demo close-icon resolver ──────────────────────────────────────────────
 *
 * A consumer-defined alternate close icon resolver used by the
 * "custom close icon" story. Registers `'cancel'` (a Material Symbols
 * X-in-circle ligature) instead of the default `'close'` ligature.
 */

@Injectable()
export class StoryAlternateCloseIconService extends TbxMatFontIconService<string> {
    constructor(fontSet?: string) {
        super(fontSet);
    }

    protected override initialize(): void {
        super.initialize();
        this.register('close', 'cancel');
    }
}

/* ─── Wrapper harness ───────────────────────────────────────────────────────
 *
 * Buttons that trigger every bottom sheet API surface. Bottom sheets render
 * in the CDK overlay (outside the component tree) so we trigger them
 * programmatically via `TbxMatBottomSheetService`.
 */

@Component({
    selector: 'tbx-bottom-sheet-harness',
    imports: [MatButtonModule],
    styleUrls: ['./story-harness.css'],
    template: `
        <div class="harness">
            @if (description()) {
                <p class="story-description">{{ description() }}</p>
            }
            <p class="theme-note">Theme: Angular Material prebuilt <strong>Azure Blue</strong>. Bottom sheet severity colors are driven by <code>@teqbench/tbx-mat-severity-theme</code>; bottom sheet UX patterns (confirm/input) layer on top of severity.</p>

            <h3>Severity Methods</h3>
            <div class="button-group">
                <button mat-flat-button (click)="showDefault()">Default</button>
                <button mat-flat-button (click)="showSuccess()">Success</button>
                <button mat-flat-button (click)="showError()">Error</button>
                <button mat-flat-button (click)="showWarning()">Warning</button>
                <button mat-flat-button (click)="showInformation()">Information</button>
                <button mat-flat-button (click)="showHelp()">Help</button>
            </div>

            <h3>Bottom Sheet Patterns</h3>
            <div class="button-group">
                <button mat-flat-button (click)="showConfirm()">Confirm</button>
                <button mat-flat-button (click)="showInput()">Input</button>
            </div>

            <h3>Variations</h3>
            <div class="button-group">
                <button mat-flat-button (click)="showWithSubtitle()">With Subtitle</button>
                <button mat-flat-button (click)="showWithContextBadge()">With Badge</button>
                <button mat-flat-button (click)="showConfirmWithCancel()">Yes / No / Cancel</button>
                <button mat-flat-button (click)="showDestructive()">Destructive</button>
            </div>

            <h3>Footer Controls</h3>
            <div class="button-group">
                <button mat-flat-button (click)="showWithCheckbox()">With Checkbox</button>
                <button mat-flat-button (click)="showWithToggle()">With Toggle</button>
                <button mat-flat-button (click)="showWithRadio()">With Radio</button>
            </div>

            <h3>Custom</h3>
            <div class="button-group">
                <button mat-flat-button (click)="showCustom()">Full Control (show)</button>
                <button mat-flat-button (click)="showNoFooter()">No Footer</button>
            </div>

            @if (lastResult()) {
                <p class="state">Last result: {{ lastResult() }}</p>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            background: var(--mat-sys-surface);
            color: var(--mat-sys-on-surface);
            min-height: 100vh;
        }
    `,
})
export class BottomSheetHarnessComponent {
    private readonly bottomSheet = inject(TbxMatBottomSheetService);
    readonly lastResult = signal('');

    /** Optional description rendered above the button grid (used by docs stories). */
    readonly description = input<string>('');

    /** Severity icon size — wires through to `--tbx-mat-bottom-sheet-icon-size`. */
    readonly iconSize = input<IconSize>('standard');

    /** Severity icon animation mode (state-transition fill / pulse / none). */
    readonly iconAnimation = input<IconAnimation>('none');

    constructor() {
        // Effects react to Storybook arg changes so the icon size/animation
        // controls update the rendered bottom sheet without remounting the harness.
        effect(() => applyIconSize(this.iconSize()));
        effect(() => applyIconAnimation(this.iconAnimation()));
    }

    async showSuccess(): Promise<void> {
        const output = await this.bottomSheet.success({
            title: 'Saved',
            message: 'Your changes have been saved successfully.',
        });
        this.lastResult.set(output.result);
    }

    async showError(): Promise<void> {
        const output = await this.bottomSheet.error({
            title: 'Save Failed',
            message: 'Could not save your changes. The server returned an unexpected error. Please try again or contact support if the problem persists.',
        });
        this.lastResult.set(output.result);
    }

    async showWarning(): Promise<void> {
        const output = await this.bottomSheet.warning({
            title: 'Unsaved Changes',
            message: 'You have unsaved changes that will be lost if you navigate away. Are you sure you want to leave this page?',
        });
        this.lastResult.set(output.result);
    }

    async showInformation(): Promise<void> {
        const output = await this.bottomSheet.information({
            title: 'Session Expired',
            message: 'Your session has expired. Please sign in again to continue working.',
        });
        this.lastResult.set(output.result);
    }

    async showHelp(): Promise<void> {
        const output = await this.bottomSheet.help({
            title: 'How it works',
            message: 'This panel shows tips and guidance for completing your task. Tap any control for more details.',
        });
        this.lastResult.set(output.result);
    }

    async showDefault(): Promise<void> {
        const output = await this.bottomSheet.default({
            title: 'Notice',
            message: 'A neutral, severity-agnostic bottom sheet surface for general announcements.',
        });
        this.lastResult.set(output.result);
    }

    async showConfirm(): Promise<void> {
        const output = await this.bottomSheet.confirm({
            title: 'Delete Project?',
            message: 'This action cannot be undone. All data associated with this project will be permanently removed.',
        });
        this.lastResult.set(output.result);
    }

    async showInput(): Promise<void> {
        const output = await this.bottomSheet.input<StoryInputData>({
            title: 'Enter Details',
            content: StoryInputComponent,
        });
        this.lastResult.set(output.result === TbxMatBottomSheetDismissReason.Affirm ? `${output.result}: ${JSON.stringify(output.data)}` : output.result);
    }

    async showWithSubtitle(): Promise<void> {
        const output = await this.bottomSheet.information({
            title: 'System Update',
            subtitle: 'Version 2.4.0 is now available',
            message: 'A new version is available with performance improvements and bug fixes. The update will be applied automatically during the next maintenance window.',
        });
        this.lastResult.set(output.result);
    }

    async showWithContextBadge(): Promise<void> {
        const output = await this.bottomSheet.information({
            title: 'Feature Preview',
            contextBadge: 'Beta',
            message: 'This feature is currently in beta. Some functionality may change before the final release.',
        });
        this.lastResult.set(output.result);
    }

    async showConfirmWithCancel(): Promise<void> {
        const output = await this.bottomSheet.confirm({
            title: 'Discard Draft?',
            message: 'You have an unsaved draft. Would you like to save it before closing?',
            footer: TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL,
        });
        this.lastResult.set(output.result);
    }

    async showDestructive(): Promise<void> {
        const destructiveButtons: readonly TbxMatBottomSheetFooterControlType[] = [
            {
                key: 'cancel',
                type: 'button',
                label: 'Cancel',
                result: TbxMatBottomSheetDismissReason.Cancel,
                emphasis: 'text',
                align: 'start',
            },
            {
                key: 'delete',
                type: 'button',
                label: 'Delete',
                icon: 'delete',
                iconPosition: 'before',
                result: TbxMatBottomSheetDismissReason.Affirm,
                emphasis: 'primary',
                align: 'end',
            },
        ];
        const output = await this.bottomSheet.show({
            title: 'Delete Account',
            type: TbxMatSeverityLevel.Error,
            message: 'This will permanently delete your account and all associated data. This action cannot be undone.',
            footer: destructiveButtons,
        });
        this.lastResult.set(output.result);
    }

    async showWithCheckbox(): Promise<void> {
        const footer: readonly TbxMatBottomSheetFooterControlType[] = [
            {
                key: 'dontAskAgain',
                type: 'checkbox',
                label: "Don't ask me again",
                align: 'start',
            },
            ...TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO,
        ];
        const output = await this.bottomSheet.confirm({
            title: 'Enable Notifications?',
            message: 'Would you like to receive notifications for this project?',
            footer,
        });
        this.lastResult.set(`${output.result} (footer: ${JSON.stringify(output.footerValues)})`);
    }

    async showWithToggle(): Promise<void> {
        const footer: readonly TbxMatBottomSheetFooterControlType[] = [
            {
                key: 'verbose',
                type: 'toggle',
                label: 'Verbose output',
                align: 'start',
            },
            ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
        ];
        const output = await this.bottomSheet.information({
            title: 'Export Settings',
            message: 'Export your current configuration to a file.',
            footer,
        });
        this.lastResult.set(`${output.result} (footer: ${JSON.stringify(output.footerValues)})`);
    }

    async showWithRadio(): Promise<void> {
        const footer: readonly TbxMatBottomSheetFooterControlType[] = [
            {
                key: 'format',
                type: 'radio-group',
                options: [
                    { label: 'JSON', value: 'json' },
                    { label: 'CSV', value: 'csv' },
                    { label: 'XML', value: 'xml' },
                ],
                initialValue: 'json',
                align: 'start',
            },
            ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
        ];
        const output = await this.bottomSheet.information({
            title: 'Export Format',
            message: 'Choose the format for your export.',
            footer,
        });
        this.lastResult.set(`${output.result} (footer: ${JSON.stringify(output.footerValues)})`);
    }

    async showNoFooter(): Promise<void> {
        const output = await this.bottomSheet.show({
            title: 'Build Started',
            type: TbxMatSeverityLevel.Information,
            message: 'Your build was queued and will run shortly. There is nothing to confirm — close this sheet via the header close button, backdrop click, or Escape.',
        });
        this.lastResult.set(output.result);
    }

    async showCustom(): Promise<void> {
        const output = await this.bottomSheet.show({
            title: 'Custom Bottom Sheet',
            icon: 'build',
            subtitle: 'Using show() for full control',
            contextBadge: 'v2',
            type: TbxMatSeverityLevel.Warning,
            message: 'This bottom sheet was opened via the show() method with all options configured manually.',
            footer: [
                {
                    key: 'acknowledge',
                    type: 'checkbox',
                    label: 'I understand',
                    align: 'start',
                },
                {
                    key: 'cancel',
                    type: 'button',
                    label: 'Cancel',
                    result: TbxMatBottomSheetDismissReason.Cancel,
                    emphasis: 'text',
                    align: 'end',
                },
                {
                    key: 'proceed',
                    type: 'button',
                    label: 'Proceed',
                    icon: 'arrow_forward',
                    iconPosition: 'after',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    emphasis: 'primary',
                    align: 'end',
                },
            ],
        });
        this.lastResult.set(`${output.result} (footer: ${JSON.stringify(output.footerValues)})`);
    }
}

/* ─── Reusable decorators ───────────────────────────────────────────────────
 *
 * Each decorator overrides the bottom sheet provider config for the scope of
 * a single story. Mirrors the `withSvgIcons()` pattern in
 * `tbx-mat-banners/src/components/banner-overlay.stories.common.ts`.
 */

/** Swap the severity icon resolver to the SVG variant. */
export function withSvgIcons() {
    return applicationConfig({
        providers: [
            {
                provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
                useFactory: () => ({
                    severityIconResolverService: new TbxMatBottomSheetSeveritySvgIconService(),
                }),
            },
        ],
    });
}

/** Override the close icon resolver with a story-defined alternate. */
export function withAlternateCloseIcon() {
    return applicationConfig({
        providers: [
            {
                provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG,
                useFactory: () => ({
                    severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService('material-symbols-rounded'),
                    closeIconResolverService: new StoryAlternateCloseIconService('material-symbols-rounded'),
                }),
            },
        ],
    });
}
