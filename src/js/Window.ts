/**
 * Wrapper class for browser.windows.Window
 *
 * Create instances of this class by calling Window.get() or Window.getAll().
 * Any two Windows with the same id will have the same properties. If you use
 * the get and getAll functions, data will automatically be propagated to
 * future instances of this Window. For example:
 *
 * Window.get(
 *
 * TODO:
 * 	- review and re-document how storage works in the context of this class. Maybe refactor
 *
 */

import Tab from './Tab';
import _ from 'lodash';

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

	/**
	 * Get a Window
	 *
	 * Creates a Window based on the given id. If storage data is found for
	 * this window, it is retrieved.
	 */
	static async get(id: number): Promise<Window> {
		let key = winKey(id);

		let data = await browser.storage.local.get(key);
		let cwin = await browser.windows.get(id)
		let tabs = await Tab.getAllForWindow(id);

		let w = new Window(cwin, tabs, data[key])
		return w;
	}

	/**
	 * Get all Windows
	 *
	 * Creates all Windows.
	 * Storage data is used, if found.
	 */
	static async getAll(): Promise<Window[]> {
		let windowList = await browser.windows.getAll();

		let keys = windowList.map(w => "win_" + w.id);
		let data = await browser.storage.local.get(keys)

		let tabs = await Tab.getAllForWindows(windowList.map(w => w.id ?? -1));

		let windows = windowList.map(w => {
			let key = winKey(w);
			return new Window(w, tabs[w.id ?? -1], data[key])
		});

		return windows;
	}

	/**
	 * Serializes this object to a json object for storage.
	 *
	 * The returned json will have two attributes: "key" the storage key, and
	 * "val" a json object to be stored.
	 */
	flatten(): {[key: string]: WindowData}  {
		let flat = {
			[this.key]: this.data,
		};
		return flat;
	}

	/**
	 * Performs the actual data storage
	 */
	store(): Promise<void> {
		return browser.storage.local.set(this.flatten());
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
		this.store()
	}
}

/*
 * Takes either a window or window Id, and returns the storage key string
 */
function winKey(w: browser.windows.Window | Window | number) {
	let id = typeof w == 'number' ? w : w.id;
	return "win_" + id
}
