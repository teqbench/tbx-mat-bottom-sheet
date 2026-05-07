import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatBottomSheetService, TbxMatBottomSheetDismissReason, type TbxMatBottomSheetFooterControlType } from '../../index';

// Document-level token override blocks. Bottom sheets render in a CDK overlay
// outside the component tree, so per-component styling does not reach the
// surface. Token overrides are scoped to body classes that are toggled
// synchronously around each bottomSheet.show() call.
//
// Specificity notes:
// - Squared corners must out-specify the library rule
//   `.tbx-mat-bottom-sheet-panel .mat-bottom-sheet-container` (specificity 0,2,0).
//   The override below adds the body class for (0,3,1).
// - Padding overrides target `tbx-mat-bottom-sheet-shell` directly because the
//   shell declares `:host { --bottom-sheet-padding-inline: 1.25rem }`, which
//   shadows any value inherited from `body`. Targeting the host element with
//   the body class as ancestor wins specificity (0,1,2 vs the host's 0,1,0).
const TOKEN_OVERRIDE_CSS = `
  body.tbx-demo-squared-corners .tbx-mat-bottom-sheet-panel .mat-bottom-sheet-container {
    border-radius: 0;
  }
  body.tbx-demo-tight-padding tbx-mat-bottom-sheet-shell {
    --bottom-sheet-padding-inline: 0.5rem;
  }
  body.tbx-demo-loose-padding tbx-mat-bottom-sheet-shell {
    --bottom-sheet-padding-inline: 2.5rem;
  }
  body.tbx-demo-large-icon {
    --tbx-mat-bottom-sheet-icon-size: 4rem;
  }
`;

@Component({
    selector: 'tbx-bottom-sheet-custom-harness',
    imports: [MatButtonModule, JsonPipe],
    template: `
        <div class="harness">
            <div class="instructions">
                <p><strong>Custom bottom sheets</strong> use <code>TbxMatBottomSheetService.show()</code> to opt out of every opinionated default. Pass a full <code>TbxMatBottomSheetConfig</code> with explicit severity, icon, footer composition, and chrome flags — no method-level merging. This is the right choice when none of the severity-leveled methods (<code>success</code>, <code>error</code>, etc.) or bottom-sheet-specific patterns (<code>confirm</code>, <code>input</code>) fit.</p>
                <p>The demos below cover the full range: <code>disableClose</code> to block backdrop and <kbd>Escape</kbd> dismissal, custom icon overrides, document-level token overrides for radius and padding, and complex footer compositions. <a href="https://material.angular.dev/components/bottom-sheet/api" target="_blank" rel="noopener">Angular Material's MatBottomSheetConfig</a> does not expose width or height knobs — sizing is controlled entirely via CSS on the host element. Token overrides are scoped to <code>document.body</code> classes that are toggled per story so they don't bleed into other bottom sheet stories.</p>
            </div>

            <h3>Disable Close</h3>
            <p class="theme-note">With <code>disableClose: true</code>, backdrop click and <kbd>Escape</kbd> are blocked. The user must interact with a footer button to close — useful for irreversible actions or required acknowledgements.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showDisableClose()">Disable Close</button>
            </div>

            <h3>Custom Icon Override</h3>
            <p class="theme-note">Pass <code>icon</code> on the config to override the icon resolved from <code>type</code>. The override is rendered as a Material Symbols font ligature and takes precedence over the configured severity icon resolver.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showCustomIcon()">Custom Icon (rocket)</button>
                <button mat-flat-button (click)="showLargeIcon()">Larger Icon (4rem)</button>
            </div>

            <h3>Surface &amp; Padding Tokens</h3>
            <p class="theme-note">CSS custom properties on the bottom sheet surface are overridable via document-level rules. Squared corners zero out the surface <code>border-radius</code>; padding tokens reshape the inset between header / body / footer and the surface edge.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showSquaredCorners()">Squared Corners</button>
                <button mat-flat-button (click)="showTightPadding()">Tight Padding</button>
                <button mat-flat-button (click)="showLoosePadding()">Loose Padding</button>
            </div>

            <h3>Long Content (scrollable body)</h3>
            <p class="theme-note">A bottom sheet's body scrolls when its content exceeds the available vertical space. The header and footer remain pinned.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showLongContent()">Long Content</button>
            </div>

            <h3>No Footer</h3>
            <p class="theme-note">Omit <code>footer</code> from the config and the trailing divider + footer row are not rendered. Dismissal still works via the header close button, backdrop click, and <kbd>Escape</kbd>. Useful for purely informational surfaces where no decision is requested.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showNoFooter()">No Footer</button>
            </div>

            <h3>Complex Footer</h3>
            <p class="theme-note">A mixed footer with start-aligned acknowledgement checkbox plus end-aligned Cancel + Proceed buttons. The Proceed button uses <code>iconPosition: 'after'</code> with a forward-arrow icon.</p>
            <div class="button-group">
                <button mat-flat-button (click)="showComplexFooter()">Complex Footer</button>
            </div>

            @if (lastResult()) {
                <div class="result-panel">
                    <h3>Last Result</h3>
                    <pre>{{ lastResult() | json }}</pre>
                </div>
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
        .harness {
            font-family: Roboto, sans-serif;
            padding: 1.5rem;
        }
        h3 {
            margin: 1.5rem 0 0.5rem;
        }
        h3:first-of-type {
            margin-top: 0;
        }
        .instructions {
            font-size: 0.875rem;
            color: #555;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        .instructions code {
            background: #eef2ff;
            color: #4338ca;
            padding: 0.1em 0.35em;
            border-radius: 3px;
            font-size: 0.9em;
        }
        .instructions p {
            margin: 0 0 0.5rem;
        }
        .instructions p:last-child {
            margin-bottom: 0;
        }
        .instructions a {
            color: #4338ca;
        }
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .theme-note {
            font-size: 0.8125rem;
            color: #666;
            border-left: 3px solid #ddd;
            padding: 0.25rem 0.75rem;
            margin: 0 0 0.75rem;
        }
        .theme-note code {
            background: #eef2ff;
            color: #4338ca;
            padding: 0.1em 0.35em;
            border-radius: 3px;
            font-size: 0.9em;
        }
        .theme-note a {
            color: #4338ca;
        }
        .result-panel {
            margin-top: 1.5rem;
            background: #f0f4ff;
            border-left: 3px solid #1565c0;
            padding: 0.5rem 0.75rem;
        }
        .result-panel pre {
            font-size: 0.8125rem;
            margin: 0.25rem 0 0;
            white-space: pre-wrap;
        }
    `,
})
class BottomSheetCustomHarnessComponent {
    private readonly bottomSheet = inject(TbxMatBottomSheetService);
    readonly lastResult = signal<unknown>(null);

    constructor() {
        // Inject the demo override CSS once at the document level so it reaches
        // the CDK overlay surface (which renders outside the component tree).
        const STYLE_ID = 'tbx-bottom-sheet-story-custom-tokens';
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = TOKEN_OVERRIDE_CSS;
            document.head.appendChild(style);
        }
    }

    private async open(config: Parameters<TbxMatBottomSheetService['show']>[0], scope?: string): Promise<void> {
        // Toggle the body class synchronously around the bottom sheet lifecycle.
        // An effect-based toggle would defer the class change to the next
        // microtask, which is too late — MatBottomSheet opens the CDK overlay
        // synchronously inside .show() and reads styles immediately, so the
        // override must be on document.body before the call returns.
        if (scope) document.body.classList.add(scope);
        try {
            const output = await this.bottomSheet.show(config);
            this.lastResult.set({ result: output.result, footerValues: output.footerValues });
        } finally {
            if (scope) document.body.classList.remove(scope);
        }
    }

    async showLongContent(): Promise<void> {
        const longMessage = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`).join('\n\n');
        await this.open({
            title: 'Long Content',
            type: TbxMatSeverityLevel.Information,
            message: longMessage,
        });
    }

    async showDisableClose(): Promise<void> {
        await this.open({
            title: 'Required Acknowledgement',
            type: TbxMatSeverityLevel.Warning,
            disableClose: true,
            message: 'Backdrop click and Escape are blocked. You must click Acknowledge to close.',
            footer: [{ key: 'ack', type: 'button', label: 'Acknowledge', emphasis: 'primary', result: TbxMatBottomSheetDismissReason.Affirm, align: 'end' }],
        });
    }

    async showCustomIcon(): Promise<void> {
        await this.open({
            title: 'Launch',
            icon: 'rocket_launch',
            type: TbxMatSeverityLevel.Information,
            message: 'The icon override takes precedence over the icon resolved from the severity type.',
        });
    }

    async showLargeIcon(): Promise<void> {
        await this.open(
            {
                title: 'Larger Icon',
                type: TbxMatSeverityLevel.Help,
                message: 'Icon size is overridable via --tbx-mat-bottom-sheet-icon-size at the document level. This bottom sheet uses 4rem.',
            },
            'tbx-demo-large-icon'
        );
    }

    async showSquaredCorners(): Promise<void> {
        await this.open(
            {
                title: 'Squared Corners',
                type: TbxMatSeverityLevel.Information,
                message: 'border-radius zeroed on .mat-bottom-sheet-container via a custom CSS rule scoped to a body class.',
            },
            'tbx-demo-squared-corners'
        );
    }

    async showTightPadding(): Promise<void> {
        await this.open(
            {
                title: 'Tight Padding',
                type: TbxMatSeverityLevel.Information,
                message: '--bottom-sheet-padding-inline reduced to 0.5rem; header, body, and footer all share the tightened inset.',
            },
            'tbx-demo-tight-padding'
        );
    }

    async showLoosePadding(): Promise<void> {
        await this.open(
            {
                title: 'Loose Padding',
                type: TbxMatSeverityLevel.Information,
                message: '--bottom-sheet-padding-inline increased to 2.5rem.',
            },
            'tbx-demo-loose-padding'
        );
    }

    async showNoFooter(): Promise<void> {
        await this.open({
            title: 'Build Started',
            type: TbxMatSeverityLevel.Information,
            message: 'Your build was queued and will run shortly. There is nothing to confirm — close this sheet via the header close button, backdrop click, or Escape.',
        });
    }

    async showComplexFooter(): Promise<void> {
        const footer: readonly TbxMatBottomSheetFooterControlType[] = [
            { key: 'acknowledge', type: 'checkbox', label: 'I understand', align: 'start' },
            { key: 'cancel', type: 'button', label: 'Cancel', result: TbxMatBottomSheetDismissReason.Cancel, align: 'end' },
            {
                key: 'proceed',
                type: 'button',
                label: 'Proceed',
                icon: 'arrow_forward',
                iconPosition: 'after',
                emphasis: 'primary',
                result: TbxMatBottomSheetDismissReason.Affirm,
                align: 'end',
            },
        ];
        await this.open({
            title: 'Apply Migration',
            subtitle: 'This will modify your data',
            contextBadge: 'v2',
            type: TbxMatSeverityLevel.Warning,
            message: 'Check the acknowledgement and click Proceed to continue. Cancel returns without applying changes.',
            footer,
        });
    }
}

const meta: Meta<BottomSheetCustomHarnessComponent> = {
    title: 'Bottom Sheets',
    tags: ['bottom-sheets'],
    component: BottomSheetCustomHarnessComponent,
    decorators: [moduleMetadata({ imports: [BottomSheetCustomHarnessComponent] })],
};

export default meta;
type Story = StoryObj<BottomSheetCustomHarnessComponent>;

export const Custom: Story = {
    parameters: {
        docs: {
            description: {
                story: '`TbxMatBottomSheetService.show()` for full control — no severity defaults, no footer preset. Demonstrates `disableClose`, icon overrides, document-level CSS token overrides for surface radius and padding, long scrollable content, footer-less informational surfaces, and complex footer compositions. Width and height are not config knobs — they are controlled entirely via CSS on the bottom sheet host.',
            },
        },
    },
};
