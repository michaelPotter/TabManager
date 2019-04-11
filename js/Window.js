class Window {
	/**
	 * Synchronously create a Window.
	 *
	 * Will not pull data from storage. When async creations are available, avoid this
	 */
	constructor(window, data) {
		this.window = window;
		if (data != undefined && data != null) {
			this.last_accessed = data.last_accessed;
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
		chrome.tabs.get(id, function(cwin) {
			callback(new Window(cwin, data))
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
			Window.inflate(win_id, item[key], callback);
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
		var flat = {k: this.data};
		runCallback(callback, flat);
		return flat;
	}

	/**
	 * Returns the key used for storing this window
	 */
	get key() { return "win_" + this.id; }

	/**
	 * Returns data to be stored for this window
	 */
	get data() {
		data = {
			"id": this.id,
			"last_accessed": this.last_accessed
		};
		return data;
	}

	get id()      { return this.window.id; }
	get focused() { return this.window.focused; }
}
