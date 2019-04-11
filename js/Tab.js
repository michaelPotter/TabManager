// Tab.js
class Tab {
	/**
	 * wrapper class for chrome.tabs
	 *
	 * https://developer.chrome.com/extensions/tabs
	 */
	constructor(tab, data) {
		this.tab = tab;
		if (data != undefined && data != null) {
			// set extra properties here
		}
	}

	// store this tab in storage
	__store() {
		chrome.storage.local.set(this.flatten());
	}

	/**
	 * Inflates the given data into a Tab
	 *
	 * Data should be a json object created by calling flatten() on another Tab.
	 * Calls the given callback on the created Tab.
	 *
	 * Behavior is undefined if data does not have the key "id"
	 */
	static inflate(id, data, callback) {
		chrome.tabs.get(id, function(ctab) {
			var t = new Tab(ctab)
			if (data == undefined) {
				t.store();
			}
			callback(t)
		});
	}

	/**
	 * Builds a Tab from storage given a tab's id.
	 *
	 * Calls the given callback on the Tab. Callback should have the form
	 * function(err, Tab). On success, err will be null.
	 */
	static from_storage(tab_id, callback) {
		var key = "tab_" + tab_id;
		chrome.storage.local.get(key, function(item) {
			// even if there was no data in storage, we'll just get a fresh Tab
			Tab.inflate(tab_id, data[key], callback);
		});
	}

	getTabView() {
		if (! this.tabView) {
			tv = new tabView(this);
			this.tabView = tv;
		}
		return this.tabView;
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
	 * Returns the key used for storing this tab
	 */
	get key() { return "tab_" + this.id; }

	/**
	 * Returns data to be stored for this tab
	 */
	get data() {
		data = {"id": this.id};
		return data;
	}

	// Wrapper functions for easy compatibility
	get id()              { return this.tab.id; }
	get index()           { return this.tab.index; }
	get windowId()        { return this.tab.windowId; }
	get openerTabId()     { return this.tab.openerTabId; }
	get highlighted()     { return this.tab.highlighted; }
	get active()          { return this.tab.active; }
	get pinned()          { return this.tab.pinned; }
	get audible()         { return this.tab.audible; }
	get discarded()       { return this.tab.discarded; }
	get autoDiscardable() { return this.tab.autoDiscardable; }
	get mutedInfo()       { return this.tab.mutedInfo; }
	get url()             { return this.tab.url; }
	get title()           { return this.tab.title; }
	get favIconUrl()      { return this.tab.favIconUrl; }
	get status()          { return this.tab.status; }
	get incognito()       { return this.tab.incognito; }
	get width()           { return this.tab.width; }
	get height()          { return this.tab.height; }
	get sessionId()       { return this.tab.sessionId; }
}
