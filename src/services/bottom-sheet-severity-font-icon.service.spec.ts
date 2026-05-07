import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TBX_MAT_FONT_ICON_DEFAULT_FONT_SET, TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED } from '@teqbench/tbx-mat-icons';
import { TbxMatSeverityLevel } from '@teqbench/tbx-mat-severity-theme';
import { TbxMatBottomSheetSeverityFontIconService } from './bottom-sheet-severity-font-icon.service';

describe('TbxMatBottomSheetSeverityFontIconService', () => {
    describe('with TBX_MAT_FONT_ICON_DEFAULT_FONT_SET token', () => {
        let service: TbxMatBottomSheetSeverityFontIconService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: TBX_MAT_FONT_ICON_DEFAULT_FONT_SET,
                        useValue: TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED,
                    },
                    {
                        provide: TbxMatBottomSheetSeverityFontIconService,
                        useFactory: () => new TbxMatBottomSheetSeverityFontIconService(),
                    },
                ],
            });

            service = TestBed.inject(TbxMatBottomSheetSeverityFontIconService);
        });

        it('should use the token fontSet', () => {
            expect(service.fontSet).toBe('material-symbols-rounded');
        });

        describe('resolve()', () => {
            it('should resolve every severity level to a non-empty ligature', () => {
                for (const level of Object.values(TbxMatSeverityLevel)) {
                    const name = service.resolve(level);
                    expect(name).toBeTypeOf('string');
                    expect(name!.length).toBeGreaterThan(0);
                }
            });

            it('should return undefined for unknown keys', () => {
                expect(service.resolve('unknown')).toBeUndefined();
            });
        });
    });

    describe('with explicit fontSet via constructor', () => {
        let service: TbxMatBottomSheetSeverityFontIconService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: TbxMatBottomSheetSeverityFontIconService,
                        useFactory: () => new TbxMatBottomSheetSeverityFontIconService('material-symbols-outlined'),
                    },
                ],
            });

            service = TestBed.inject(TbxMatBottomSheetSeverityFontIconService);
        });

        it('should use the explicitly provided fontSet', () => {
            expect(service.fontSet).toBe('material-symbols-outlined');
        });
    });
});
