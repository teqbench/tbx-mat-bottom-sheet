import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DEFAULT_HARNESS_ARGS, BottomSheetHarnessComponent, SHARED_HARNESS_ARG_TYPES, withAlternateCloseIcon } from './bottom-sheet.stories.common';

const meta: Meta<BottomSheetHarnessComponent> = {
    title: 'Bottom Sheets/Custom Close Icon',
    component: BottomSheetHarnessComponent,
    decorators: [moduleMetadata({ imports: [BottomSheetHarnessComponent] }), withAlternateCloseIcon()],
    argTypes: SHARED_HARNESS_ARG_TYPES,
};

export default meta;
type Story = StoryObj<BottomSheetHarnessComponent>;

export const Default: Story = {
    name: 'Custom Close Icon',
    args: { ...DEFAULT_HARNESS_ARGS },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates the optional `closeIconResolverService` slot on `TbxMatBottomSheetProviderConfig`. A consumer-defined `StoryAlternateCloseIconService` registers the `cancel` Material Symbols ligature (X-in-circle) under the `close` key. Open any bottom sheet and notice the close button now renders the alternate glyph.',
            },
        },
    },
};
