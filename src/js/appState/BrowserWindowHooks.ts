import TabBuilder from '../model/tab/TabBuilder';
import WindowManager from '../model/window/WindowManager';

class BrowserWindowHooks {

	public engageHooks() {
        // Set up callbacks
        browser.tabs.onCreated.addListener(this._onTabCreated);
        browser.tabs.onActivated.addListener(this._onTabActivated);
        browser.tabs.onUpdated.addListener(this._onTabUpdated);
        browser.tabs.onMoved.addListener(this._onTabMoved);
        browser.tabs.onRemoved.addListener(this._onTabRemoved);
	}

	private _onTabCreated: Parameters<typeof browser.tabs.onCreated.addListener>[0]
	= async (browserTab) => {
		const tab = await TabBuilder.createFromBrowserTab(browserTab);
		if (tab.windowId) {
			WindowManager.windows[tab.windowId]?.addTab(tab);
		} else {
			console.log(`tab.windowId unexpectedly undefined: ${tab}`)
		}
	}

	private _onTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
	= async (activeInfo) => {
		const window = WindowManager.windows[activeInfo.windowId];
		window.getActiveTab()?.setActive(false);
		window.getTabById(activeInfo.tabId)?.setActive(true);
	}

	private _onTabUpdated: Parameters<typeof browser.tabs.onUpdated.addListener>[0]
	= async (tabId, changeInfo, tab) => {
		if (tab.windowId) {
			WindowManager.windows[tab.windowId]?.updateTab(tab);
		}
	}

	/**
	 * When a tab is dragged within the SAME window.
	 */
	private _onTabMoved: Parameters<typeof browser.tabs.onMoved.addListener>[0]
	= async (tabId, {windowId, fromIndex, toIndex}) => {
		WindowManager.windows[windowId].moveTab(tabId, fromIndex, toIndex);
	}

	private _onTabRemoved: Parameters<typeof browser.tabs.onRemoved.addListener>[0]
	= async (tabId, removeInfo) => {
		WindowManager.windows[removeInfo.windowId].removeTab(tabId)
	}
}

export default new BrowserWindowHooks();

