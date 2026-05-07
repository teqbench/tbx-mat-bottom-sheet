/**
 * Shared Storybook decorators for injecting CSS custom property overrides
 * into `document.head` for the duration of a story.
 *
 * A single shared style tag id is used across all story files so that the
 * global cleanup decorator in `.storybook/preview.ts` can guarantee a clean
 * slate before each story renders, preventing overrides from leaking when
 * navigating between stories. Mirrors the pattern in `tbx-mat-banners` and
 * `tbx-mat-notifications`.
 */

export const STORY_OVERRIDE_STYLE_TAG_ID = 'tbx-bottom-sheet-story-override';

export function removeStoryOverrideStyleTag(): void {
    document.getElementById(STORY_OVERRIDE_STYLE_TAG_ID)?.remove();
}

export function withCustomProperties(css: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (story: () => any) => {
        removeStoryOverrideStyleTag();
        if (css) {
            const style = document.createElement('style');
            style.id = STORY_OVERRIDE_STYLE_TAG_ID;
            style.textContent = css;
            document.head.appendChild(style);
        }
        return story();
    };
}

export function withDefaultProperties() {
    return withCustomProperties('');
}
