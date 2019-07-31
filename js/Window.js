/**
 * Wrapper class for chrome.windows.Window
 *
 * Create instances of this class by calling Window.get() or Window.getAll().
 * Any two Windows with the same id will have the same properties. If you use
 * the get and getAll functions, data will automatically be propagated to
 * future instances of this Window. For example:
 *
 * Window.get(
 *
 *
 */

import util from './util.js';

export default class Window {
	/**
	 * Synchronously create a Window.
	 *
	 * Will not pull data from storage. Use Window.get or Window.getAll
	 * instead, so that data can be pulled out of storage if it exists.
	 */
	constructor(window, data) {
		this.window = window;
		if (data != undefined && data != null) {
			this._last_accessed = data.last_accessed;
		}
	}

	/**
	 * Get a Window
	 *
	 * Creates a Window based on the given id. The Window is then passed to
	 * callback. If storage data is found for this window, it is retrieved.
	 */
	static get(win_id, callback) {
		Window.from_storage(win_id, callback);
	}

	/**
	 * Get all Windows
	 *
	 * Creates all Windows. They are then passed to callback in an array.
	 * Storage data is used, if found.
	 */
	static getAll(callback) {
		chrome.windows.getAll(null, function(windows) {
			var keys = windows.map(w => "win_" + w.id);
			chrome.storage.local.get(keys, function(data) {
				var myWindows = []
				for (var w of windows) {
					var key = "win_" + w.id
					var d = data[key]
					myWindows.push(new Window(w, d))
				}
				callback(myWindows);
			});
		});
	}

	/**
	 * Inflates the given data into a Window
	 *
	 * id {int} should be a valid window id.
	 * Data should be a json object created by calling flatten() on another Window.
	 * Data may be null or undefined. Calls the given callback on the created Window.
	 */
	static inflate(id, data, callback) {
		chrome.windows.get(id, function(cwin) {
			var w = new Window(cwin, data)
			if (data == undefined) {
				w.store();
			}
			callback(w)
		});
	}

	/**
	 * Builds a Window from storage given a Window's id.
	 *
	 * Calls the given callback on the Window. It is okay if the given
	 * window doesn't have any data in storage.
	 */
	static from_storage(win_id, callback) {
		var key = "win_" + win_id;
		chrome.storage.local.get(key, function(data) {
			// even if there was no data in storage, we'll just get a fresh Window
			Window.inflate(win_id, data[key], callback);
		});
	}

	/**
	 * Serializes this object to a json object for storage.
	 *
	 * The returned json will have two attributes: "key" the storage key, and
	 * "val" a json object to be stored.
	 * The serialized json will be both returned, and passed to a callback if
	 * one is given
	 */
	flatten(callback) {
		var k = this.key
		var flat = {};
		flat[k] = this.data;
		runCallback(callback, flat);
		return flat;
	}

	/**
	 * Performs the actual data storage
	 */
	store() {
		chrome.storage.local.set(this.flatten());
	}

	/**
	 * Pass to Array.Sort to order Windows by access time.
	 *
	 * Returns an int < 0 if a was accessed more recently than b,
	 * returns > 0 if b more recently than a,
	 * returns 0 if we can't tell
	 */
	static accessCompare(a, b) {
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
	get data() {
		var data = {
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
	set last_accessed(last_accessed) {
		this._last_accessed = last_accessed;
		this.store()
	}
}
