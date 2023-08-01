/**
 * Wrapper class for browser.windows.Window
 *
 * Create instances of this class by using WindowBuilder.
 */

import Tab from './Tab';
import _ from 'lodash';
import WindowBuilder from './WindowBuilder';

// This is the extra data we can't get from the browser api.
declare type WindowData = {
	id?: number,
	last_accessed?: number,
};

export default class Window {
	private _last_accessed: number;
	private window: browser.windows.Window;
	tabs: Tab[] = [];

	/**
	 * Synchronously create a Window.
	 *
	 * Will not pull data from storage. Use Window.get or Window.getAll
	 * instead, so that data can be pulled out of storage if it exists.
	 */
	constructor(window: browser.windows.Window, tabs: Tab[], data?: WindowData) {
		this.window = window;
		this._last_accessed = data?.last_accessed ?? -1;
		this.tabs = tabs;
	}

	removeTab(tabid: number) {
		this.tabs = this.tabs.filter(t => t.id != tabid);
	}

	/**
	 * Pass to Array.Sort to order Windows by access time.
	 *
	 * Returns an int < 0 if a was accessed more recently than b,
	 * returns > 0 if b more recently than a,
	 * returns 0 if we can't tell
	 */
	static accessCompare(a: Window, b: Window) {
		var atime = a.last_accessed;
		var btime = b.last_accessed;
		if (atime == undefined && btime == undefined) {
			return 0
		} else if (atime == undefined) {
			return 1
		} else if (btime == undefined) {
			return -1
		} else {
			return btime - atime
		}
	}

	////////////////////////////////////////////////////////////////////
	//                        GETTERS/SETTERS                         //
	////////////////////////////////////////////////////////////////////


	/**
	 * Returns the key used for storing this window
	 */
	get key() { return "win_" + this.id; }

	/**
	 * Returns data to be stored for this window
	 */
	get data(): WindowData {
		var data: WindowData = {
			"id": this.id,
			"last_accessed": this.last_accessed
		};
		return data;
	}

	get id()      { return this.window.id ?? -1; }
	get focused() { return this.window.focused; }

	get last_accessed() { return this._last_accessed; }

	/**
	 * Set the last access time for this window.
	 *
	 * Will also modify the stored data.
	 */
	set last_accessed(last_accessed: number) {
		this._last_accessed = last_accessed;
		WindowBuilder.storeWindow(this);
	}

	/**
	 * Return the tab with this Id. May return undefined if the tab could not be found.
	 */
	getTabById(tabId: number) {
		// TODO is there a more efficient way than iterating?
		return this.tabs.find(t => t.id == tabId);
	}

	/**
	 * Return the active tab in this window.
	 */
	getActiveTab() {
		// TODO is there a more efficient way than iterating?
		return this.tabs.find(t => t.active);
	}
}
