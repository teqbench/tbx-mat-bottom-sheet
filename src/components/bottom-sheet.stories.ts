import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideTbxMatSeverityTheme } from '@teqbench/tbx-mat-severity-theme';
import { DEFAULT_HARNESS_ARGS, BottomSheetHarnessComponent, SHARED_HARNESS_ARG_TYPES } from './bottom-sheet.stories.common';

const meta: Meta<BottomSheetHarnessComponent> = {
    title: 'Bottom Sheets',
    component: BottomSheetHarnessComponent,
    decorators: [moduleMetadata({ imports: [BottomSheetHarnessComponent] })],
    argTypes: SHARED_HARNESS_ARG_TYPES,
};

export default meta;
type Story = StoryObj<BottomSheetHarnessComponent>;

export const Default: Story = {
    args: { ...DEFAULT_HARNESS_ARGS },
    parameters: {
        docs: {
            description: {
                story: 'Standard severity palette with the default Material Symbols font icons (registered via `TbxMatBottomSheetSeverityFontIconService`). Use the **Icon Size** control to flip between `standard` (3rem default), `medium` (2rem), and `small` (1.5rem); each overrides `--tbx-mat-bottom-sheet-icon-size`. **Icon Animation** drives the Material Symbols `FILL` axis via `font-variation-settings`. **Drag Handle** toggles the centered grabber-pill affordance above the header.',
            },
        },
    },
};

export const Inverted: Story = {
    args: { ...DEFAULT_HARNESS_ARGS },
    decorators: [
        applicationConfig({
            providers: [provideTbxMatSeverityTheme({ invert: true, applyToRoot: true })],
        }),
    ],
    parameters: {
        docs: {
            description: {
                story: 'Inverted severity palette — wired via `provideTbxMatSeverityTheme({ invert: true })` at bootstrap. The inversion is app-global and shared across `tbx-mat-banners`, `tbx-mat-notifications`, `tbx-mat-dialogs`, and `tbx-mat-bottom-sheet`.',
            },
        },
    },
};

export const WithDragHandle: Story = {
    name: 'With drag handle',
    args: { ...DEFAULT_HARNESS_ARGS, dragHandle: true },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates the optional `dragHandle: true` config flag. Every bottom sheet opened from the harness renders a centered grabber pill above the header — a visual affordance signalling dismissibility. The pill is decorative; this package does not implement drag-to-dismiss behavior.',
            },
        },
    },
};
