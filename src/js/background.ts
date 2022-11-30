
import Window from './Window';
import Badge from './Badge';

var badge = new Badge()

/**
 * When a tab is created
 */
browser.tabs.onCreated.addListener(function(tab) {
	badge.inc()
});

/**
 * When a tab is closed
 */
browser.tabs.onRemoved.addListener(function(tabid, removeInfo) {
	badge.dec()
});

/**
 * When the focused window changes
 */
browser.windows.onFocusChanged.addListener(function(id) {
	if (id > 0) {
		Window.get(id).then(w => {
			w.last_accessed = Date.now()
		});
	}
});
