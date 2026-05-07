import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subject } from 'rxjs';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatBottomSheetService } from './bottom-sheet.service';
import { BottomSheetShellComponent } from '../components/bottom-sheet-shell.component';
import { TbxMatBottomSheetDismissReason } from '../enums/bottom-sheet-dismiss-reason.enum';
import { TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL, TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO } from '../constants/bottom-sheet.constants';

/**
 * Service-level tests focus on what the service is responsible for:
 *   - applying severity-type defaults via mergeDefaults()
 *   - applying footer presets per bottom sheet method
 *   - passing the correct config + bottom sheet options to MatBottomSheet.open()
 *   - returning a Close result when the bottom sheet is dismissed without a value
 *
 * Icon resolution is no longer the service's concern — `BottomSheetShellComponent`
 * resolves both the severity icon and the close icon via
 * `TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG`. Icon-related assertions live in the
 * component spec.
 */
describe('TbxMatBottomSheetService', () => {
    let service: TbxMatBottomSheetService;
    let bottomSheetSpy: { open: ReturnType<typeof vi.fn> };
    let afterDismissed$: Subject<unknown>;

    function setupTestBed(): void {
        afterDismissed$ = new Subject<unknown>();

        bottomSheetSpy = {
            open: vi.fn().mockReturnValue({
                afterDismissed: () => afterDismissed$.asObservable(),
                dismiss: vi.fn(),
            }),
        };

        TestBed.configureTestingModule({
            providers: [TbxMatBottomSheetService, { provide: MatBottomSheet, useValue: bottomSheetSpy }],
        });

        service = TestBed.inject(TbxMatBottomSheetService);
    }

    /** Resolve the pending bottom sheet with a result. */
    function resolveBottomSheet<T>(value: T): void {
        afterDismissed$.next(value);
        afterDismissed$.complete();
    }

    /** Extract the shell data passed to MatBottomSheet.open(). */
    function getShellData(): { config: Record<string, unknown>; resolvedFooter: unknown[] } {
        return bottomSheetSpy.open.mock.calls[0][1].data;
    }

    describe('show()', () => {
        it('should pass config through with no defaults applied', async () => {
            setupTestBed();
            const promise = service.show({
                title: 'Custom',
                icon: 'build',
                type: TbxMatSeverityLevel.Warning,
                message: 'Full control.',
            });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            const shellData = getShellData();
            expect(shellData.config['title']).toBe('Custom');
            expect(shellData.config['icon']).toBe('build');
            expect(shellData.config['type']).toBe(TbxMatSeverityLevel.Warning);
            expect(shellData.config['message']).toBe('Full control.');
        });

        it('should not apply default icon when omitted', async () => {
            setupTestBed();
            const promise = service.show({ title: 'No Icon' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            expect(getShellData().config['icon']).toBeUndefined();
        });

        it('should not apply default type when omitted', async () => {
            setupTestBed();
            const promise = service.show({ title: 'No Type' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            expect(getShellData().config['type']).toBeUndefined();
        });

        it('should use empty footer when no footer provided', async () => {
            setupTestBed();
            const promise = service.show({ title: 'Bare' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            expect(getShellData().resolvedFooter).toEqual([]);
        });

        it('should use provided footer', async () => {
            setupTestBed();
            const promise = service.show({
                title: 'Custom',
                footer: [...TBX_MAT_BOTTOM_SHEET_BUTTONS_OK],
            });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(getShellData().resolvedFooter).toEqual(TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
        });

        it('does not pass any width or height keys to MatBottomSheet.open()', async () => {
            setupTestBed();
            const promise = service.show({ title: 'Sized?', message: 'No.' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            const openConfig = bottomSheetSpy.open.mock.calls[0]?.[1] ?? {};
            expect(openConfig).not.toHaveProperty('width');
            expect(openConfig).not.toHaveProperty('minWidth');
            expect(openConfig).not.toHaveProperty('maxWidth');
            expect(openConfig).not.toHaveProperty('minHeight');
            expect(openConfig).not.toHaveProperty('maxHeight');
        });
    });

    describe('severity methods', () => {
        const cases = [
            { method: 'success', severity: TbxMatSeverityLevel.Success },
            { method: 'error', severity: TbxMatSeverityLevel.Error },
            { method: 'warning', severity: TbxMatSeverityLevel.Warning },
            { method: 'information', severity: TbxMatSeverityLevel.Information },
            { method: 'help', severity: TbxMatSeverityLevel.Help },
            { method: 'default', severity: TbxMatSeverityLevel.Default },
        ] as const;

        for (const { method, severity } of cases) {
            describe(`${method}()`, () => {
                it(`should default to ${severity} severity`, async () => {
                    setupTestBed();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const promise = (service as any)[method]({ title: 'Test' });
                    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
                    await promise;

                    expect(getShellData().config['type']).toBe(severity);
                });

                it('should default to TBX_MAT_BOTTOM_SHEET_BUTTONS_OK footer', async () => {
                    setupTestBed();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const promise = (service as any)[method]({ title: 'Test' });
                    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
                    await promise;

                    expect(getShellData().resolvedFooter).toEqual(TBX_MAT_BOTTOM_SHEET_BUTTONS_OK);
                });

                it('should not pre-compute icon when no override is given', async () => {
                    setupTestBed();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const promise = (service as any)[method]({ title: 'Test' });
                    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
                    await promise;

                    expect(getShellData().config['icon']).toBeUndefined();
                });

                it('should preserve a caller-provided icon override', async () => {
                    setupTestBed();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const promise = (service as any)[method]({
                        title: 'Test',
                        icon: 'celebration',
                    });
                    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
                    await promise;

                    expect(getShellData().config['icon']).toBe('celebration');
                });

                it('should preserve a caller-provided type override', async () => {
                    setupTestBed();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const promise = (service as any)[method]({
                        title: 'Test',
                        type: TbxMatSeverityLevel.Warning,
                    });
                    resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
                    await promise;

                    expect(getShellData().config['type']).toBe(TbxMatSeverityLevel.Warning);
                });
            });
        }
    });

    describe('confirm()', () => {
        it('should default to Help severity', async () => {
            setupTestBed();
            const promise = service.confirm({ title: 'Continue?' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(getShellData().config['type']).toBe(TbxMatSeverityLevel.Help);
        });

        it('should default to TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO footer', async () => {
            setupTestBed();
            const promise = service.confirm({ title: 'Continue?' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(getShellData().resolvedFooter).toEqual(TBX_MAT_BOTTOM_SHEET_BUTTONS_YES_NO);
        });

        it('should return Affirm result when user confirms', async () => {
            setupTestBed();
            const promise = service.confirm({ title: 'Delete?' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Affirm);
        });

        it('should return Deny result when user declines', async () => {
            setupTestBed();
            const promise = service.confirm({ title: 'Delete?' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Deny, footerValues: {} });

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Deny);
        });

        it('should return typed footer values', async () => {
            setupTestBed();
            const promise = service.confirm<{ dontAsk: boolean }>({
                title: 'Delete?',
                footer: [
                    { key: 'dontAsk', type: 'checkbox', label: "Don't ask", align: 'start' },
                    {
                        key: 'yes',
                        type: 'button',
                        label: 'Yes',
                        result: TbxMatBottomSheetDismissReason.Affirm,
                        emphasis: 'primary',
                        align: 'end',
                    },
                ],
            });
            resolveBottomSheet({
                result: TbxMatBottomSheetDismissReason.Affirm,
                footerValues: { dontAsk: true },
            });

            const output = await promise;
            expect(output.footerValues.dontAsk).toBe(true);
        });
    });

    describe('input()', () => {
        it('should default to Information severity', async () => {
            setupTestBed();
            const promise = service.input({ title: 'Rename' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Cancel, footerValues: {} });
            await promise;

            expect(getShellData().config['type']).toBe(TbxMatSeverityLevel.Information);
        });

        it('should default to TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL footer', async () => {
            setupTestBed();
            const promise = service.input({ title: 'Rename' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Cancel, footerValues: {} });
            await promise;

            expect(getShellData().resolvedFooter).toEqual(TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL);
        });

        it('should return typed data on affirm', async () => {
            setupTestBed();
            const promise = service.input<string>({ title: 'Rename' });
            resolveBottomSheet({
                result: TbxMatBottomSheetDismissReason.Affirm,
                data: 'New Name',
                footerValues: {},
            });

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Affirm);
            expect(output.data).toBe('New Name');
        });

        it('should return undefined data on cancel', async () => {
            setupTestBed();
            const promise = service.input<string>({ title: 'Rename' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Cancel, footerValues: {} });

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Cancel);
            expect(output.data).toBeUndefined();
        });
    });

    describe('bottom sheet configuration', () => {
        it('should set disableClose to false by default', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ disableClose: false }));
        });

        it('should pass disableClose true when specified', async () => {
            setupTestBed();
            const promise = service.confirm({ title: 'Critical', disableClose: true });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ disableClose: true }));
        });

        it('should apply tbx-mat-bottom-sheet-panel and per-severity panel classes', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(
                BottomSheetShellComponent,
                expect.objectContaining({
                    panelClass: ['tbx-mat-bottom-sheet-panel', 'tbx-mat-bottom-sheet-panel-information'],
                })
            );
        });

        it('should apply default-severity panel class when type is omitted on show()', async () => {
            setupTestBed();
            const promise = service.show({ title: 'Bare' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(
                BottomSheetShellComponent,
                expect.objectContaining({
                    panelClass: ['tbx-mat-bottom-sheet-panel', 'tbx-mat-bottom-sheet-panel-default'],
                })
            );
        });

        it('should set autoFocus to first-tabbable when the footer has an affirm button', async () => {
            setupTestBed();
            // Severity methods default to TBX_MAT_BOTTOM_SHEET_BUTTONS_OK, which has Affirm.
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ autoFocus: 'first-tabbable' }));
        });

        it('should set autoFocus to first-tabbable when a content component is configured', async () => {
            setupTestBed();
            // Hypothetical consumer-defined content component implementing TbxMatBottomSheetData<unknown>.
            class FormContentComponent {
                readonly isValid = () => true;
                readonly value = () => undefined;
            }
            const promise = service.input({
                title: 'Rename',
                content: FormContentComponent as unknown as Parameters<typeof service.input>[0]['content'],
            });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ autoFocus: 'first-tabbable' }));
        });

        it('should set autoFocus to dialog when there is no content component and no affirm button', async () => {
            setupTestBed();
            // show() with no footer — no actionable element exists besides the close
            // button, which the package opts not to focus initially.
            const promise = service.show({ title: 'Headless', message: 'No buttons.' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Close, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ autoFocus: 'dialog' }));
        });

        it('should set autoFocus to dialog when the footer has only non-affirm buttons', async () => {
            setupTestBed();
            // A footer with a Cancel button but no Affirm button — still no focus
            // target, since Cancel is a passive dismiss path.
            const promise = service.show({
                title: 'Cancel-only',
                footer: [{ key: 'cancel', type: 'button', label: 'Cancel', result: TbxMatBottomSheetDismissReason.Cancel, align: 'end' }],
            });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Cancel, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ autoFocus: 'dialog' }));
        });

        it('should set ariaModal to true', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            expect(bottomSheetSpy.open).toHaveBeenCalledWith(BottomSheetShellComponent, expect.objectContaining({ ariaModal: true }));
        });

        it('should pass title and message through to shell data', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Hello', message: 'World' });
            resolveBottomSheet({ result: TbxMatBottomSheetDismissReason.Affirm, footerValues: {} });
            await promise;

            const shellData = getShellData();
            expect(shellData.config['title']).toBe('Hello');
            expect(shellData.config['message']).toBe('World');
        });
    });

    describe('backdrop/Escape dismissal', () => {
        it('should return Close result when afterDismissed emits undefined', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet(undefined);

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Close);
            expect(output.footerValues).toEqual({});
        });

        it('should return Close result when afterDismissed emits null', async () => {
            setupTestBed();
            const promise = service.information({ title: 'Test' });
            resolveBottomSheet(null);

            const output = await promise;
            expect(output.result).toBe(TbxMatBottomSheetDismissReason.Close);
            expect(output.footerValues).toEqual({});
        });
    });
});
