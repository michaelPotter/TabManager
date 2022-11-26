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

// This is the extra data we can't get from the browser api.
declare type WindowData = {
	id?: number,
	last_accessed?: number,
};

export default class Window {
	private _last_accessed: number;
	private window: browser.windows.Window;

	/**
	 * Synchronously create a Window.
	 *
	 * Will not pull data from storage. Use Window.get or Window.getAll
	 * instead, so that data can be pulled out of storage if it exists.
	 */
	constructor(window: browser.windows.Window, data: WindowData) {
		this.window = window;
		this._last_accessed = data.last_accessed ?? -1;
	}

	/**
	 * Get a Window
	 *
	 * Creates a Window based on the given id. If storage data is found for
	 * this window, it is retrieved.
	 */
	static async get(id: number): Promise<Window> {
		let key = "win_" + id;
		let data = await browser.storage.local.get(key);
		return Window.inflate(id, data[key]);
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

		return windowList.map(w => new Window(w, data[`win_${w.id}`]))
	}

	/**
	 * Inflates the given data into a Window
	 *
	 * id {int} should be a valid window id.
	 * Data should be a json object created by calling flatten() on another Window.
	 * Data may be null or undefined.
	 */
	static async inflate(id: number, data: WindowData): Promise<Window> {
		let cwin = await browser.windows.get(id)
		let w = new Window(cwin, data)
		return w;
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

	get id()      { return this.window.id; }
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
