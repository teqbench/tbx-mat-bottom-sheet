import { addons } from 'storybook/manager-api';
import { RESET_STORY_ARGS, STORY_CHANGED } from 'storybook/internal/core-events';

/**
 * Sidebar tag filter activated via the `filter` URL parameter.
 *
 * When this Storybook is embedded in the teqbench.website demos iframe, the
 * iframe URL includes `&filter={packageTag}` (e.g. `&filter=bottom-sheets`) which
 * scopes the sidebar to stories tagged with that value. When viewed
 * standalone (no `filter` param), the full story list is shown.
 */
function getFilterTag(): string | null {
    return new URLSearchParams(location.search).get('filter');
}

addons.setConfig({
    sidebar: {
        filters: {
            patterns: (item) => {
                const filterTag = getFilterTag();
                if (!filterTag) return true;
                return (item.tags || []).includes(filterTag);
            },
        },
    },
});

/**
 * Reset story args back to declared defaults whenever the user navigates to
 * a different story. Without this, args set via the Controls panel persist
 * across navigations (via URL params and session state). For this Storybook
 * we want every story to load with its declared baseline so that comparing
 * variants is predictable.
 */
addons.register('tbx-reset-args-on-story-change', (api) => {
    const channel = api.getChannel();
    if (!channel) return;
    channel.on(STORY_CHANGED, (storyId: string) => {
        channel.emit(RESET_STORY_ARGS, { storyId });
    });
});
