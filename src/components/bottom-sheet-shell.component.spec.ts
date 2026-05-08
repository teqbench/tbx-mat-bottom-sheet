import { describe, it, expect, vi } from 'vitest';
import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BottomSheetShellComponent, type BottomSheetShellData } from './bottom-sheet-shell.component';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TBX_MAT_FONT_ICON_DEFAULT_FONT_SET, TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED } from '@teqbench/tbx-mat-icons';
import { type TbxMatBottomSheetConfig, type TbxMatBottomSheetData } from '../models/bottom-sheet.model';
import { type TbxMatBottomSheetFooterButton } from '../models/bottom-sheet-footer.model';
import { type TbxMatBottomSheetFooterControlType } from '../types/bottom-sheet-footer-control.type';
import { TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL } from '../constants/bottom-sheet.constants';
import { TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG } from '../tokens/bottom-sheet-provider-config.token';
import { TbxMatBottomSheetSeverityFontIconService } from '../services/bottom-sheet-severity-font-icon.service';
import { type TbxMatBottomSheetProviderConfig } from '../models/bottom-sheet-provider-config.model';

/**
 * Test component implementing TbxMatBottomSheetData<string>.
 * Used to verify the shell's content component integration:
 *   - Dynamic creation via ViewContainerRef
 *   - isValid driving affirm button disabled state
 *   - value included in TbxMatBottomSheetResult.data on affirm
 */
@Component({
    selector: 'tbx-test-input',
    template: `<input [value]="name()" (input)="name.set($any($event.target).value)" />`,
})
class TestInputComponent implements TbxMatBottomSheetData<string> {
    readonly name = signal('');
    readonly isValid = computed(() => this.name().trim().length > 0);
    readonly value = computed(() => this.name().trim());
}

function buildDefaultProviderConfig(): TbxMatBottomSheetProviderConfig {
    return {
        severityIconResolverService: new TbxMatBottomSheetSeverityFontIconService(TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED),
    };
}

function createFixture(config: Partial<TbxMatBottomSheetConfig<unknown>>, footer?: readonly TbxMatBottomSheetFooterControlType[], providerConfig: TbxMatBottomSheetProviderConfig = buildDefaultProviderConfig()): ComponentFixture<BottomSheetShellComponent> {
    const fullConfig: TbxMatBottomSheetConfig<unknown> = {
        title: 'Test BottomSheet',
        ...config,
    };

    const shellData: BottomSheetShellData = {
        config: fullConfig,
        resolvedFooter: footer ?? [],
    };

    TestBed.configureTestingModule({
        imports: [BottomSheetShellComponent, NoopAnimationsModule],
        providers: [
            { provide: MAT_BOTTOM_SHEET_DATA, useValue: shellData },
            { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
            {
                provide: TBX_MAT_FONT_ICON_DEFAULT_FONT_SET,
                useValue: TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED,
            },
            { provide: TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG, useValue: providerConfig },
        ],
    });

    const fixture = TestBed.createComponent(BottomSheetShellComponent);
    fixture.detectChanges();
    return fixture;
}

function getBottomSheetRef(fixture: ComponentFixture<BottomSheetShellComponent>): MatBottomSheetRef<BottomSheetShellComponent> {
    return fixture.debugElement.injector.get(MatBottomSheetRef);
}

/** Select the close button via its aria-label. */
function queryCloseButton(fixture: ComponentFixture<BottomSheetShellComponent>) {
    return fixture.debugElement.query(By.css('button[aria-label="Close bottom sheet"]'));
}

/** Helper to build a typed TbxMatBottomSheetFooterButton with sensible defaults. */
function buildButton(overrides: Partial<TbxMatBottomSheetFooterButton> = {}): TbxMatBottomSheetFooterButton {
    return {
        key: 'test',
        type: 'button',
        label: 'Test',
        align: 'end',
        ...overrides,
    };
}

describe('BottomSheetShellComponent', () => {
    describe('header', () => {
        it('should display the title', () => {
            const fixture = createFixture({ title: 'My BottomSheet' });

            const title = fixture.debugElement.query(By.css('.bottom-sheet-title'));
            expect(title.nativeElement.textContent.trim()).toBe('My BottomSheet');
        });

        it('should associate the title id with the host via aria-labelledby', () => {
            const fixture = createFixture({ title: 'My BottomSheet' });

            const title = fixture.debugElement.query(By.css('.bottom-sheet-title'));
            const titleId = title.nativeElement.getAttribute('id');
            expect(titleId).toBeTruthy();

            const host = fixture.nativeElement as HTMLElement;
            expect(host.getAttribute('aria-labelledby')).toBe(titleId);
        });

        it('should display the consumer-overridden icon as a font ligature', () => {
            const fixture = createFixture({ title: 'Test', icon: 'warning' });

            const icon = fixture.debugElement.query(By.css('.tbx-mat-bottom-sheet-icon'));
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.trim()).toBe('warning');
        });

        it('should display the severity-resolved icon when icon is not overridden', () => {
            // Every bottom sheet renders a header icon — the severity resolver
            // always provides one. Consumers suppress the icon by overriding
            // the severity-icon resolver to return undefined for the level
            // (or by providing one that has no registration for the level).
            const fixture = createFixture({ title: 'Test' });

            const icon = fixture.debugElement.query(By.css('.tbx-mat-bottom-sheet-icon'));
            expect(icon).not.toBeNull();
        });

        it('should hide the icon when the resolver returns no icon for the level', () => {
            // Stub resolver with the same shape as a real severity resolver but
            // returning undefined for every level — verifies the component's
            // null-fall-through path.
            const noopMethod = (): undefined => undefined;
            const emptyResolver = {
                iconType: 0,
                resolve: noopMethod,
                default: noopMethod,
                success: noopMethod,
                error: noopMethod,
                warning: noopMethod,
                information: noopMethod,
                help: noopMethod,
            } as unknown as TbxMatBottomSheetProviderConfig['severityIconResolverService'];
            const fixture = createFixture({ title: 'Test', type: TbxMatSeverityLevel.Default }, undefined, { severityIconResolverService: emptyResolver });

            const icon = fixture.debugElement.query(By.css('.tbx-mat-bottom-sheet-icon'));
            expect(icon).toBeNull();
        });

        it('should display the context badge when provided', () => {
            const fixture = createFixture({ title: 'Test', contextBadge: 'Beta' });

            const badge = fixture.debugElement.query(By.css('mat-chip'));
            expect(badge).not.toBeNull();
            expect(badge.nativeElement.textContent.trim()).toBe('Beta');
        });

        it('should not display the context badge when omitted', () => {
            const fixture = createFixture({ title: 'Test' });

            const badge = fixture.debugElement.query(By.css('mat-chip'));
            expect(badge).toBeNull();
        });

        it('should display the subtitle when provided', () => {
            const fixture = createFixture({ title: 'Test', subtitle: 'Some detail' });

            const subtitle = fixture.debugElement.query(By.css('.bottom-sheet-subtitle'));
            expect(subtitle).not.toBeNull();
            expect(subtitle.nativeElement.textContent.trim()).toBe('Some detail');
        });

        it('should not display the subtitle when omitted', () => {
            const fixture = createFixture({ title: 'Test' });

            const subtitle = fixture.debugElement.query(By.css('.bottom-sheet-subtitle'));
            expect(subtitle).toBeNull();
        });

        it('should have a close button with accessible aria-label', () => {
            const fixture = createFixture({ title: 'Test' });

            const closeBtn = queryCloseButton(fixture);
            expect(closeBtn).not.toBeNull();
            expect(closeBtn.nativeElement.getAttribute('aria-label')).toBe('Close bottom sheet');
        });
    });

    describe('close button', () => {
        it('should close bottom sheet with TbxMatBottomSheetDismissReason.Close', () => {
            const fixture = createFixture({ title: 'Test' });
            const ref = getBottomSheetRef(fixture);

            queryCloseButton(fixture).nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Close,
                })
            );
        });

        it('should return empty footerValues when closing (negative action)', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'remember',
                    type: 'checkbox',
                    label: 'Remember',
                    align: 'start',
                    initialValue: true,
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            queryCloseButton(fixture).nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: 'close',
                    footerValues: {},
                })
            );
        });
    });

    describe('body', () => {
        it('should display the message when provided', () => {
            const fixture = createFixture({ title: 'Test', message: 'Hello world' });

            const message = fixture.debugElement.query(By.css('.bottom-sheet-message'));
            expect(message).not.toBeNull();
            expect(message.nativeElement.textContent.trim()).toBe('Hello world');
        });

        it('should not display a message when omitted', () => {
            const fixture = createFixture({ title: 'Test' });

            const message = fixture.debugElement.query(By.css('.bottom-sheet-message'));
            expect(message).toBeNull();
        });
    });

    describe('content component (input bottom sheets)', () => {
        it('should dynamically create content component when config.content is provided', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);

            const input = fixture.debugElement.query(By.css('tbx-test-input'));
            expect(input).not.toBeNull();
        });

        it('should not display message when content component is provided', () => {
            const fixture = createFixture({ title: 'Input', message: 'Ignored', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);

            const message = fixture.debugElement.query(By.css('.bottom-sheet-message'));
            expect(message).toBeNull();
        });

        it('should disable affirm button when content isValid is false', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);

            // Content starts with empty name → isValid is false
            const affirmButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'OK');

            expect(affirmButton).not.toBeUndefined();
            expect(affirmButton!.nativeElement.disabled).toBe(true);
        });

        it('should enable affirm button when content isValid becomes true', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);

            // Set a value on the content component to make isValid true
            const testInput = fixture.debugElement.query(By.directive(TestInputComponent));
            testInput.componentInstance.name.set('hello');
            fixture.detectChanges();

            const affirmButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'OK');

            expect(affirmButton!.nativeElement.disabled).toBe(false);
        });

        it('should disable affirm button again when isValid transitions back to false', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);

            const testInput = fixture.debugElement.query(By.directive(TestInputComponent));
            testInput.componentInstance.name.set('hello');
            fixture.detectChanges();

            // Now clear the value — isValid flips back to false
            testInput.componentInstance.name.set('');
            fixture.detectChanges();

            const affirmButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'OK');

            expect(affirmButton!.nativeElement.disabled).toBe(true);
        });

        it('should not auto-disable affirm button when no content component is configured', () => {
            const fixture = createFixture({ title: 'Plain' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK]);

            const affirmButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'OK');

            expect(affirmButton).not.toBeUndefined();
            expect(affirmButton!.nativeElement.disabled).toBe(false);
        });

        it('should include content value in output on affirm', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);
            const ref = getBottomSheetRef(fixture);

            // Set a value on the content component
            const testInput = fixture.debugElement.query(By.directive(TestInputComponent));
            testInput.componentInstance.name.set('My Value');
            fixture.detectChanges();

            // Click OK
            const affirmButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'OK');
            affirmButton!.nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    data: 'My Value',
                })
            );
        });

        it('should not include content value in output on cancel', () => {
            const fixture = createFixture({ title: 'Input', content: TestInputComponent }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL]);
            const ref = getBottomSheetRef(fixture);

            // Set a value
            const testInput = fixture.debugElement.query(By.directive(TestInputComponent));
            testInput.componentInstance.name.set('My Value');
            fixture.detectChanges();

            // Click Cancel
            const cancelButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button')).find((btn) => btn.nativeElement.textContent.trim() === 'Cancel');
            cancelButton!.nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Cancel,
                    data: undefined,
                })
            );
        });
    });

    describe('footer', () => {
        it('should not render footer when no items', () => {
            const fixture = createFixture({ title: 'Test' }, []);

            const footer = fixture.debugElement.query(By.css('.bottom-sheet-footer'));
            expect(footer).toBeNull();
        });

        it('should not render footer separator when no items', () => {
            const fixture = createFixture({ title: 'Test' }, []);

            const separators = fixture.debugElement.queryAll(By.css('mat-divider.bottom-sheet-separator'));
            expect(separators.length).toBe(1);
        });

        it('should render footer separator when items exist', () => {
            const fixture = createFixture({ title: 'Test' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK]);

            const separators = fixture.debugElement.queryAll(By.css('mat-divider.bottom-sheet-separator'));
            expect(separators.length).toBe(2);
        });
    });

    describe('footer buttons', () => {
        it('should render button labels', () => {
            const fixture = createFixture({ title: 'Test' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO]);

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            expect(buttons.length).toBe(2);
            expect(buttons[0].nativeElement.textContent.trim()).toContain('No');
            expect(buttons[1].nativeElement.textContent.trim()).toContain('Yes');
        });

        it('should close bottom sheet with button result on click', () => {
            const fixture = createFixture({ title: 'Test' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK]);
            const ref = getBottomSheetRef(fixture);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            button.nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                })
            );
        });

        it('should not close bottom sheet when button has no result', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [buildButton({ key: 'custom', label: 'Custom', result: undefined })];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            button.nativeElement.click();

            expect(ref.dismiss).not.toHaveBeenCalled();
        });

        it('should render button with icon', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'delete',
                    label: 'Delete',
                    icon: 'delete',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    emphasis: 'primary',
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const icon = fixture.debugElement.query(By.css('.bottom-sheet-footer button mat-icon'));
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.trim()).toBe('delete');
        });

        it('should place icon before label by default (no iconPositionEnd)', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'save',
                    label: 'Save',
                    icon: 'save',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    emphasis: 'primary',
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const icon = fixture.debugElement.query(By.css('.bottom-sheet-footer button mat-icon'));
            expect(icon.nativeElement.hasAttribute('iconpositionend')).toBe(false);
        });

        it('should place icon after label when iconPosition is after (iconPositionEnd)', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'next',
                    label: 'Next',
                    icon: 'arrow_forward',
                    iconPosition: 'after',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    emphasis: 'primary',
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const icon = fixture.debugElement.query(By.css('.bottom-sheet-footer button mat-icon'));
            expect(icon.nativeElement.hasAttribute('iconpositionend')).toBe(true);
        });

        it('should disable button when disabled is true', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'ok',
                    label: 'OK',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    disabled: true,
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            expect(button.nativeElement.disabled).toBe(true);
        });

        it('should not disable button when disabled is false', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'ok',
                    label: 'OK',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    disabled: false,
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            expect(button.nativeElement.disabled).toBe(false);
        });

        it('should disable button when disabled is a Signal returning true', () => {
            const disabledSignal = signal(true);
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'ok',
                    label: 'OK',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    disabled: disabledSignal,
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            expect(button.nativeElement.disabled).toBe(true);
        });

        it('should enable button when disabled Signal returns false', () => {
            const disabledSignal = signal(false);
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'ok',
                    label: 'OK',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    disabled: disabledSignal,
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            expect(button.nativeElement.disabled).toBe(false);
        });

        it('should reactively update button disabled state when signal value changes', () => {
            const disabledSignal = signal(true);
            const footer: TbxMatBottomSheetFooterControlType[] = [
                buildButton({
                    key: 'ok',
                    label: 'OK',
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    disabled: disabledSignal,
                }),
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button'));
            expect(button.nativeElement.disabled).toBe(true);

            disabledSignal.set(false);
            fixture.detectChanges();
            expect(button.nativeElement.disabled).toBe(false);

            disabledSignal.set(true);
            fixture.detectChanges();
            expect(button.nativeElement.disabled).toBe(true);
        });
    });

    describe('footer controls', () => {
        it('should render checkbox with label', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [{ key: 'remember', type: 'checkbox', label: 'Remember me', align: 'start' }];
            const fixture = createFixture({ title: 'Test' }, footer);

            const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
            expect(checkbox).not.toBeNull();
            expect(checkbox.nativeElement.textContent.trim()).toContain('Remember me');
        });

        it('should initialize checkbox from initialValue', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'opt',
                    type: 'checkbox',
                    label: 'Opt in',
                    align: 'start',
                    initialValue: true,
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('opt')).toBe(true);
        });

        it('should default checkbox to false when initialValue omitted', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [{ key: 'opt', type: 'checkbox', label: 'Opt in', align: 'start' }];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('opt')).toBe(false);
        });

        it('should render slide toggle with label', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [{ key: 'dark', type: 'toggle', label: 'Dark mode', align: 'start' }];
            const fixture = createFixture({ title: 'Test' }, footer);

            const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
            expect(toggle).not.toBeNull();
            expect(toggle.nativeElement.textContent.trim()).toContain('Dark mode');
        });

        it('should initialize slide toggle from initialValue', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'autoSave',
                    type: 'toggle',
                    label: 'Auto-save',
                    align: 'start',
                    initialValue: true,
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('autoSave')).toBe(true);
        });

        it('should default slide toggle to false when initialValue omitted', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [{ key: 'autoSave', type: 'toggle', label: 'Auto-save', align: 'start' }];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('autoSave')).toBe(false);
        });

        it('should initialize radio-group from initialValue', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'size',
                    type: 'radio-group',
                    align: 'start',
                    options: [
                        { label: 'Small', value: 'sm' },
                        { label: 'Large', value: 'lg' },
                    ],
                    initialValue: 'lg',
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('size')).toBe('lg');
        });

        it('should default radio-group to null when initialValue omitted', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'size',
                    type: 'radio-group',
                    align: 'start',
                    options: [
                        { label: 'Small', value: 'sm' },
                        { label: 'Large', value: 'lg' },
                    ],
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('size')).toBeNull();
        });

        it('should initialize toggle-group from initialValue', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'view',
                    type: 'toggle-group',
                    align: 'end',
                    options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'List', value: 'list' },
                    ],
                    initialValue: 'grid',
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('view')).toBe('grid');
        });

        it('should default single-select toggle-group to null when initialValue omitted', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'view',
                    type: 'toggle-group',
                    align: 'end',
                    options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'List', value: 'list' },
                    ],
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('view')).toBeNull();
        });

        it('should default multi-select toggle-group to empty array when initialValue omitted', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'tags',
                    type: 'toggle-group',
                    align: 'end',
                    multiple: true,
                    options: [
                        { label: 'A', value: 'a' },
                        { label: 'B', value: 'b' },
                    ],
                },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.getFooterValue('tags')).toEqual([]);
        });

        it('should include updated footer values when button closes bottom sheet', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'dontAsk',
                    type: 'checkbox',
                    label: "Don't ask again",
                    align: 'start',
                },
                ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('dontAsk', true);
            fixture.detectChanges();

            const okButton = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            const lastButton = okButton[okButton.length - 1];
            lastButton.nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { dontAsk: true },
                })
            );
        });

        it('should include updated slide toggle value in dismiss output', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [{ key: 'verbose', type: 'toggle', label: 'Verbose logging', align: 'start' }, ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('verbose', true);
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            buttons[buttons.length - 1].nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { verbose: true },
                })
            );
        });

        it('should include updated radio-group value in dismiss output', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'format',
                    type: 'radio-group',
                    align: 'start',
                    options: [
                        { label: 'JSON', value: 'json' },
                        { label: 'CSV', value: 'csv' },
                    ],
                    initialValue: 'json',
                },
                ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('format', 'csv');
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            buttons[buttons.length - 1].nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { format: 'csv' },
                })
            );
        });

        it('should include updated single-select toggle-group value in dismiss output', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'view',
                    type: 'toggle-group',
                    align: 'start',
                    options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'List', value: 'list' },
                    ],
                    initialValue: 'grid',
                },
                ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('view', 'list');
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            buttons[buttons.length - 1].nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { view: 'list' },
                })
            );
        });

        it('should include updated multi-select toggle-group value in dismiss output', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                {
                    key: 'channels',
                    type: 'toggle-group',
                    align: 'start',
                    multiple: true,
                    options: [
                        { label: 'Email', value: 'email' },
                        { label: 'SMS', value: 'sms' },
                        { label: 'Push', value: 'push' },
                    ],
                },
                ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('channels', ['email', 'push']);
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            buttons[buttons.length - 1].nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { channels: ['email', 'push'] },
                })
            );
        });

        it('should aggregate values from mixed control types in dismiss output', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                { key: 'remember', type: 'checkbox', label: 'Remember', align: 'start' },
                { key: 'autoSave', type: 'toggle', label: 'Auto-save', align: 'start' },
                {
                    key: 'channel',
                    type: 'radio-group',
                    align: 'start',
                    options: [
                        { label: 'Stable', value: 'stable' },
                        { label: 'Beta', value: 'beta' },
                    ],
                    initialValue: 'stable',
                },
                ...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK,
            ];
            const fixture = createFixture({ title: 'Test' }, footer);
            const ref = getBottomSheetRef(fixture);

            fixture.componentInstance.setFooterValue('remember', true);
            fixture.componentInstance.setFooterValue('autoSave', true);
            fixture.componentInstance.setFooterValue('channel', 'beta');
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('.bottom-sheet-footer button'));
            buttons[buttons.length - 1].nativeElement.click();

            expect(ref.dismiss).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: TbxMatBottomSheetDismissReason.Affirm,
                    footerValues: { remember: true, autoSave: true, channel: 'beta' },
                })
            );
        });
    });

    describe('footer layout', () => {
        it('should apply margin-left auto to first end-aligned item', () => {
            const fixture = createFixture({ title: 'Test' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO_CANCEL]);

            expect(fixture.componentInstance.firstEndIndex()).toBe(1);
        });

        it('should return -1 when all items are start-aligned', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [
                { key: 'a', type: 'checkbox', label: 'A', align: 'start' },
                { key: 'b', type: 'checkbox', label: 'B', align: 'start' },
            ];
            const fixture = createFixture({ title: 'Test' }, footer);

            expect(fixture.componentInstance.firstEndIndex()).toBe(-1);
        });

        it('should return 0 when all items are end-aligned', () => {
            const fixture = createFixture({ title: 'Test' }, [...TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO]);

            expect(fixture.componentInstance.firstEndIndex()).toBe(0);
        });
    });

    describe('severity', () => {
        // Severity-driven color tokens are now applied via the per-severity
        // panel class on the MatBottomSheet overlay (set by `TbxMatBottomSheetService`),
        // not via a host attribute on the shell component. The component
        // surfaces severity only through `severityIcon` resolution. The
        // panelClass-per-severity behavior is covered in bottom-sheet.service.spec.

        it('should not bind a data-emphasis attribute on the host', () => {
            const fixture = createFixture({
                title: 'Test',
                icon: 'info',
                type: TbxMatSeverityLevel.Error,
            });

            const host = fixture.nativeElement as HTMLElement;
            expect(host.hasAttribute('data-emphasis')).toBe(false);
        });

        it('should render the icon container when an icon is resolved', () => {
            const fixture = createFixture({
                title: 'Test',
                icon: 'info',
                type: TbxMatSeverityLevel.Error,
            });

            const icon = fixture.debugElement.query(By.css('.tbx-mat-bottom-sheet-icon'));
            expect(icon).not.toBeNull();
        });
    });

    describe('button emphasis rendering', () => {
        it('should render primary button as filled', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [buildButton({ emphasis: 'primary', result: TbxMatBottomSheetDismissReason.Affirm })];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button[matButton="filled"]'));
            expect(button).not.toBeNull();
        });

        it('should render text button as text', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [buildButton({ emphasis: 'text', result: TbxMatBottomSheetDismissReason.Cancel })];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button[matButton="text"]'));
            expect(button).not.toBeNull();
        });

        it('should render button without emphasis as text', () => {
            const footer: TbxMatBottomSheetFooterControlType[] = [buildButton({ result: TbxMatBottomSheetDismissReason.Cancel })];
            const fixture = createFixture({ title: 'Test' }, footer);

            const button = fixture.debugElement.query(By.css('.bottom-sheet-footer button[matButton="text"]'));
            expect(button).not.toBeNull();
        });

        // Primary buttons inherit Material's filled-container/label tokens
        // from the panel-level `_severity-panel` mixin in
        // `_tbx-mat-bottom-sheet.scss` (mirroring how banners/notifications
        // style their action buttons), so any `matButton="filled"` button on
        // the bottom sheet inherits the severity styling automatically.
        // Destructive prompts are expressed via the bottom sheet `severity`
        // ('warning' or 'error'), not via a per-button emphasis variant.
    });
});
