import TabDAO from '../model/tab/TabDAO';
import WindowStore from './WindowStore';

import type WindowModel from '../model/window/Window';

// TODO add a hook such that if a current tab (or group of tabs) gets split off of a window in a window group, the newly created window should be added to the window group.
class BrowserWindowHooks {

	public engageHooks() {
		// Set up callbacks
		browser.tabs.onCreated.addListener(this._onTabCreated);
		browser.tabs.onActivated.addListener(this._onTabActivated);
		browser.tabs.onUpdated.addListener(this._onTabUpdated);
		browser.tabs.onMoved.addListener(this._onTabMoved);
		browser.tabs.onRemoved.addListener(this._onTabRemoved);
		browser.windows.onCreated.addListener(this.browserWindow);
		browser.windows.onRemoved.addListener(this._onWindowRemoved);
	}

	private _onTabCreated: Parameters<typeof browser.tabs.onCreated.addListener>[0]
	= async (browserTab) => {
		const tab = await TabDAO.createFromBrowserTab(browserTab);
		if (tab.windowId) {
			this.getWindowById(tab.windowId).addTab(tab);
		} else {
			console.warn(`Invariant failure: tab.windowId unexpectedly undefined: ${tab}`)
		}
	}

	private _onTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0]
	= async (activeInfo) => {
		let windowId = activeInfo.windowId;
		const window = this.getWindowById(windowId);
		window?.getActiveTab()?.setActive(false);
		window?.getTabById(activeInfo.tabId)?.setActive(true);
	}

	private _onTabUpdated: Parameters<typeof browser.tabs.onUpdated.addListener>[0]
	= async (tabId, changeInfo, tab) => {
		if (tab.windowId) {
			this.getWindowById(tab.windowId)?.updateTab(tab);
		}
	}

	/**
	 * When a tab is dragged within the SAME window.
	 */
	private _onTabMoved: Parameters<typeof browser.tabs.onMoved.addListener>[0]
	= async (tabId, {windowId, fromIndex, toIndex}) => {
		this.getWindowById(windowId)?.moveTab(tabId, fromIndex, toIndex);
	}

	private _onTabRemoved: Parameters<typeof browser.tabs.onRemoved.addListener>[0]
	= async (tabId, removeInfo) => {
		this.getWindowById(removeInfo.windowId)?.removeTab(tabId)
	}

	private browserWindow: Parameters<typeof browser.windows.onCreated.addListener>[0]
	= async (window) => {
		if (window.id) {
			WindowStore.trackNewWindow(window.id);
		}
	}

	private _onWindowRemoved: Parameters<typeof browser.windows.onRemoved.addListener>[0]
	= async (windowId) => {
		WindowStore.markWindowAsDeleted(windowId);
	}

	getWindowById(windowId: number): WindowModel {
		let window = WindowStore.getWindowById(windowId);
		if (window == undefined) {
			let err = `Invariant failure: Window not found for WindowId: [${windowId}]`
			console.trace(err)
			throw err;
		}
		return window;
	}

}

export default new BrowserWindowHooks();

