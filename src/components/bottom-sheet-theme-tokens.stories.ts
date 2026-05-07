import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DEFAULT_HARNESS_ARGS, BottomSheetHarnessComponent, SHARED_HARNESS_ARG_TYPES } from './bottom-sheet.stories.common';
import { withCustomProperties } from './story-overrides';

const meta: Meta<BottomSheetHarnessComponent> = {
    title: 'Bottom Sheets/Theme Token Override',
    component: BottomSheetHarnessComponent,
    decorators: [moduleMetadata({ imports: [BottomSheetHarnessComponent] })],
    argTypes: SHARED_HARNESS_ARG_TYPES,
};

export default meta;
type Story = StoryObj<BottomSheetHarnessComponent>;

/* Per-package alias override — only bottom sheets flip; banners/notifications/dialogs
 * retain the shared severity-theme defaults. Uses the
 * `--tbx-mat-bottom-sheet-{level}-{background,text}` aliases emitted by the
 * `severity.tbx-mat-severity-theme('tbx-mat-bottom-sheet')` mixin in
 * `_tbx-mat-bottom-sheet.scss`. */
const PER_PACKAGE_OVERRIDE = `
    html {
        --tbx-mat-bottom-sheet-success-background: #1b5e20;
        --tbx-mat-bottom-sheet-success-text: #ffffff;
        --tbx-mat-bottom-sheet-information-background: #4527a0;
        --tbx-mat-bottom-sheet-information-text: #ffffff;
        --tbx-mat-bottom-sheet-warning-background: #ef6c00;
        --tbx-mat-bottom-sheet-warning-text: #ffffff;
    }
`;

export const Default: Story = {
    name: 'Theme Token Override',
    args: { ...DEFAULT_HARNESS_ARGS },
    decorators: [withCustomProperties(PER_PACKAGE_OVERRIDE)],
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates per-package theme overrides via the `--tbx-mat-bottom-sheet-{level}-{background,text}` aliases. Themes can override the bottom-sheet-prefixed tokens (affects only bottom sheets) or the underlying `--tbx-mat-severity-{level}-*` tokens (affects every severity-aware package). This story overrides the success / information / warning aliases — open the corresponding bottom sheets to see the custom colors.',
            },
        },
    },
};
