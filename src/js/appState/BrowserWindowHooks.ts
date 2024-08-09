import TabDAO from '../model/tab/TabDAO';
import WindowStore from './WindowStore';

import type WindowModel from '../model/window/Window';

type TabCreatedCallback = Parameters<typeof browser.tabs.onCreated.addListener>[0];
type TabActivatedCallback = Parameters<typeof browser.tabs.onActivated.addListener>[0];
type TabUpdatedCallback = Parameters<typeof browser.tabs.onUpdated.addListener>[0];
type TabMovedCallback = Parameters<typeof browser.tabs.onMoved.addListener>[0];
type TabDetachedCallback = Parameters<typeof browser.tabs.onDetached.addListener>[0];
type TabRemovedCallback = Parameters<typeof browser.tabs.onRemoved.addListener>[0];
type WindowCreatedCallback = Parameters<typeof browser.windows.onCreated.addListener>[0];
type WindowRemovedCallback = Parameters<typeof browser.windows.onRemoved.addListener>[0];

// TODO add a hook such that if a current tab (or group of tabs) gets split off of a window in a window group, the newly created window should be added to the window group.
class BrowserWindowHooks {

	public engageHooks() {
		// Set up callbacks
		browser.tabs.onCreated.addListener(this._onTabCreated);
		browser.tabs.onActivated.addListener(this._onTabActivated);
		browser.tabs.onUpdated.addListener(this._onTabUpdated);
		browser.tabs.onMoved.addListener(this._onTabMoved);
		browser.tabs.onRemoved.addListener(this._onTabRemoved);
		browser.windows.onCreated.addListener(this._onWindowCreated);
		browser.windows.onRemoved.addListener(this._onWindowRemoved);
	}

	private _onTabCreated: TabCreatedCallback = async (browserTab) => {
		const tab = await TabDAO.createFromBrowserTab(browserTab);
		if (tab.windowId) {
			this.getWindowById(tab.windowId).addTab(tab);
		} else {
			console.warn(`Invariant failure: tab.windowId unexpectedly undefined: ${tab}`)
		}
	}

	private _onTabActivated: TabActivatedCallback = async (activeInfo) => {
		let windowId = activeInfo.windowId;
		const window = this.getWindowById(windowId);
		window?.getActiveTab()?.setActive(false);
		window?.getTabById(activeInfo.tabId)?.setActive(true);
	}

	private _onTabUpdated: TabUpdatedCallback = async (tabId, changeInfo, tab) => {
		if (tab.windowId) {
			this.getWindowById(tab.windowId)?.updateTab(tab);
		}
	}

	/**
	 * When a tab is dragged within the SAME window.
	 */
	private _onTabMoved: TabMovedCallback = async (tabId, {windowId, fromIndex, toIndex}) => {
		this.getWindowById(windowId)?.moveTab(tabId, fromIndex, toIndex);
	}

	private _onTabRemoved: TabRemovedCallback = async (tabId, removeInfo) => {
		this.getWindowById(removeInfo.windowId)?.removeTab(tabId)
	}

	private _onWindowCreated: WindowCreatedCallback = async (window) => {
		if (window.id) {
			WindowStore.trackNewWindow(window.id);
		}
	}

	private _onWindowRemoved: WindowRemovedCallback = async (windowId) => {
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

