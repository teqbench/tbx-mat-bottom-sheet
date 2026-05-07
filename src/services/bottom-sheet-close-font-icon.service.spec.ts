import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TBX_MAT_FONT_ICON_DEFAULT_FONT_SET, TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED, TbxMatIconType } from '@teqbench/tbx-mat-icons';
import { TbxMatBottomSheetCloseFontIconService } from './bottom-sheet-close-font-icon.service';

describe('TbxMatBottomSheetCloseFontIconService', () => {
    describe('with TBX_MAT_FONT_ICON_DEFAULT_FONT_SET token', () => {
        let service: TbxMatBottomSheetCloseFontIconService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: TBX_MAT_FONT_ICON_DEFAULT_FONT_SET,
                        useValue: TBX_MAT_ICON_FONT_SET_MATERIAL_SYMBOLS_ROUNDED,
                    },
                    {
                        provide: TbxMatBottomSheetCloseFontIconService,
                        useFactory: () => new TbxMatBottomSheetCloseFontIconService(),
                    },
                ],
            });

            service = TestBed.inject(TbxMatBottomSheetCloseFontIconService);
        });

        it('should have Font icon type', () => {
            expect(service.iconType).toBe(TbxMatIconType.Font);
        });

        it('should resolve "close" to the "close" ligature', () => {
            expect(service.resolve('close')).toBe('close');
        });

        it('should return undefined for unknown keys', () => {
            expect(service.resolve('unknown')).toBeUndefined();
        });
    });

    describe('with explicit fontSet via constructor', () => {
        let service: TbxMatBottomSheetCloseFontIconService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: TbxMatBottomSheetCloseFontIconService,
                        useFactory: () => new TbxMatBottomSheetCloseFontIconService('material-symbols-sharp'),
                    },
                ],
            });

            service = TestBed.inject(TbxMatBottomSheetCloseFontIconService);
        });

        it('should use the explicitly provided fontSet', () => {
            expect(service.fontSet).toBe('material-symbols-sharp');
        });
    });
});
