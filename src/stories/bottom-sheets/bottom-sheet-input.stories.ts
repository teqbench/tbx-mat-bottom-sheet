import { Component, computed, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TbxMatBottomSheetService, type TbxMatBottomSheetData } from '../../index';

interface RenameValue {
    readonly name: string;
}

interface ProfileValue {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
}

interface PreferencesValue {
    readonly displayName: string;
    readonly timezone: string;
    readonly notifications: 'all' | 'mentions' | 'none';
}

@Component({
    selector: 'tbx-rename-input',
    imports: [FormsModule, MatFormFieldModule, MatInputModule],
    template: `
        <mat-form-field appearance="outline" class="full-width">
            <mat-label>New name</mat-label>
            <input matInput cdkFocusInitial required [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Enter a new name" />
        </mat-form-field>
    `,
    styles: `
        .full-width {
            width: 100%;
        }
    `,
})
class RenameInputComponent implements TbxMatBottomSheetData<RenameValue> {
    readonly name = signal('');
    readonly isValid = computed(() => this.name().trim().length > 0);
    readonly value = computed<RenameValue>(() => ({ name: this.name().trim() }));
}

@Component({
    selector: 'tbx-profile-input',
    imports: [FormsModule, MatFormFieldModule, MatInputModule],
    template: `
        <div class="grid">
            <mat-form-field appearance="outline">
                <mat-label>First name</mat-label>
                <input matInput cdkFocusInitial required [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Last name</mat-label>
                <input matInput required [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" required [ngModel]="email()" (ngModelChange)="email.set($event)" />
            </mat-form-field>
        </div>
    `,
    styles: `
        .grid {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        mat-form-field {
            width: 100%;
        }
    `,
})
class ProfileInputComponent implements TbxMatBottomSheetData<ProfileValue> {
    readonly firstName = signal('');
    readonly lastName = signal('');
    readonly email = signal('');

    readonly isValid = computed(() => {
        const fn = this.firstName().trim();
        const ln = this.lastName().trim();
        const em = this.email().trim();
        return fn.length > 0 && ln.length > 0 && em.length > 0 && em.includes('@');
    });

    readonly value = computed<ProfileValue>(() => ({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        email: this.email().trim(),
    }));
}

@Component({
    selector: 'tbx-preferences-input',
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
    template: `
        <div class="grid">
            <mat-form-field appearance="outline">
                <mat-label>Display name</mat-label>
                <input matInput cdkFocusInitial required [ngModel]="displayName()" (ngModelChange)="displayName.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Timezone</mat-label>
                <mat-select required [ngModel]="timezone()" (ngModelChange)="timezone.set($event)">
                    <mat-option value="UTC">UTC</mat-option>
                    <mat-option value="America/New_York">America/New_York</mat-option>
                    <mat-option value="Europe/London">Europe/London</mat-option>
                    <mat-option value="Asia/Tokyo">Asia/Tokyo</mat-option>
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Notifications</mat-label>
                <mat-select required [ngModel]="notifications()" (ngModelChange)="notifications.set($event)">
                    <mat-option value="all">All activity</mat-option>
                    <mat-option value="mentions">Mentions only</mat-option>
                    <mat-option value="none">None</mat-option>
                </mat-select>
            </mat-form-field>
        </div>
    `,
    styles: `
        .grid {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        mat-form-field {
            width: 100%;
        }
    `,
})
class PreferencesInputComponent implements TbxMatBottomSheetData<PreferencesValue> {
    readonly displayName = signal('');
    readonly timezone = signal('UTC');
    readonly notifications = signal<'all' | 'mentions' | 'none'>('all');

    readonly isValid = computed(() => this.displayName().trim().length > 0);

    readonly value = computed<PreferencesValue>(() => ({
        displayName: this.displayName().trim(),
        timezone: this.timezone(),
        notifications: this.notifications(),
    }));
}

@Component({
    selector: 'tbx-bottom-sheet-input-harness',
    imports: [MatButtonModule, JsonPipe],
    template: `
        <div class="harness">
            <div class="instructions">
                <p><strong>Input bottom sheets</strong> project a consumer-defined component into the bottom sheet body. The component implements <code>TbxMatBottomSheetData&lt;T&gt;</code> with two signals — <code>isValid: Signal&lt;boolean&gt;</code> drives the affirm button's disabled state, and <code>value: Signal&lt;T&gt;</code> is read on Affirm and returned in <code>TbxMatBottomSheetResult.data</code>. The bottom sheet system never inspects the content beyond these two signals; the component owns its own form layout, validation rules, and reactive state.</p>
                <p><code>TbxMatBottomSheetService.input&lt;T&gt;()</code> defaults to <code>TbxMatSeverityLevel.Information</code> with the <code>TBX_MAT_BOTTOM_SHEET_BUTTONS_OK_CANCEL</code> preset. Apply the <code>cdkFocusInitial</code> attribute to the field that should receive initial focus — this is recognized by the <a href="https://material.angular.dev/cdk/a11y/api#FocusTrap" target="_blank" rel="noopener">CDK FocusTrap</a> without any directive import.</p>
            </div>

            <h3>Single-Field Rename</h3>
            <p class="theme-note">A single required text field. The OK button is disabled until <code>name.trim().length &gt; 0</code>.</p>
            <div class="button-group">
                <button mat-flat-button (click)="openRename()">Rename</button>
            </div>

            <h3>Multi-Field Profile</h3>
            <p class="theme-note">Three fields with cross-field validation — first name, last name, and a basic email check. <code>isValid</code> is a computed signal across all three.</p>
            <div class="button-group">
                <button mat-flat-button (click)="openProfile()">Edit Profile</button>
            </div>

            <h3>Mixed-Control Preferences</h3>
            <p class="theme-note">Text input plus two select dropdowns. The select values flow through the same <code>value</code> signal as text fields.</p>
            <div class="button-group">
                <button mat-flat-button (click)="openPreferences()">Edit Preferences</button>
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
class BottomSheetInputHarnessComponent {
    private readonly bottomSheet = inject(TbxMatBottomSheetService);
    readonly lastResult = signal<unknown>(null);

    async openRename(): Promise<void> {
        const output = await this.bottomSheet.input<RenameValue>({
            title: 'Rename Item',
            content: RenameInputComponent,
        });
        this.lastResult.set({ result: output.result, data: output.data });
    }

    async openProfile(): Promise<void> {
        const output = await this.bottomSheet.input<ProfileValue>({
            title: 'Edit Profile',
            subtitle: 'Update your account information',
            content: ProfileInputComponent,
        });
        this.lastResult.set({ result: output.result, data: output.data });
    }

    async openPreferences(): Promise<void> {
        const output = await this.bottomSheet.input<PreferencesValue>({
            title: 'User Preferences',
            content: PreferencesInputComponent,
        });
        this.lastResult.set({ result: output.result, data: output.data });
    }
}

const meta: Meta<BottomSheetInputHarnessComponent> = {
    title: 'Bottom Sheets',
    tags: ['bottom-sheets'],
    component: BottomSheetInputHarnessComponent,
    decorators: [moduleMetadata({ imports: [BottomSheetInputHarnessComponent] })],
};

export default meta;
type Story = StoryObj<BottomSheetInputHarnessComponent>;

export const Input: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Input bottom sheets project a consumer-defined component into the body. The component implements `TbxMatBottomSheetData<T>` with `isValid` (drives the affirm button) and `value` (returned in `TbxMatBottomSheetResult.data` on Affirm). The shell never inspects the content beyond those two signals — the component owns its own form layout, validation, and reactive state.',
            },
        },
    },
};
