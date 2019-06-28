/* Singleton for managing tabs. Do not construct tabs directly,
 * instead go through this function to reuse tab objects
 *
 * Any mention of a "Tab" in the comments/documentation refers to our Tab class, not the chrome.tabs.Tab class. The chrome.tabs.Tab class may be referred to as a CTab.
 */
class TabManager {
	constructor() {
		this.cache = new TabCache();
		this.storage = new TabStorage();
	}

	/**
	 * Gets the tab with the given id.
	 *
	 * id must be an int.
	 * callback is a function that takes a Tab.
	 */
	getTab(id, callback) {
		var cache = this.cache
		var t = cache.decacheTab(id)
		if (t == undefined) {
			chrome.tabs.get(id, function(ctab) {
				var t = new Tab(ctab);
				cache.cacheTab(t);
				runCallback(callback, t);
			});
		} else {
			runCallback(callback, t);
		}
	}

	/**
	 * Loads all tabs into memory from api.
	 *
	 * Stores tabs into tabs. Does not deal with local storage.
	 */
	loadAllFromApi(callback) {
		var manager = this
		var cache = this.cache
		chrome.windows.getAll(null, function(windows) {
			for (var i = 0; i < windows.length; i++) {
				chrome.tabs.query({windowId: window.id}, function(tabs) {
					for (var j = 0; j < tabs.length; j++) {
						var t = new Tab(tabs[j]);
						cache.cacheTab(t)
					}
				});
			}
		});
		runCallback(callback);
	}

	/**
	 * Returns the number of Tabs stored in the cache
	 */
	size() {
		return this.cache.size();
	}

}



/**
 * Stores our tabs in memory for easier access
 *
 */
class TabCache {
	constructor() {
		/* we'll store our tabs in a dictionary.
		 * KEY:	a string w/format "tab_<tab_id>"
		 * VAL: tab object
		 */
		this.tabs = {};
	}

	/**
	 * Takes a Tab and stores it in our cache
	 */
	cacheTab(tab) {
		var id = tab.id;
		this.tabs["tab_" + id] = tab;
	}

	/**
	 * Returns the Tab with tabid from the cache.
	 *
	 * Returns undefined if the Tab w/tabid isn't in the cache.
	 */
	decacheTab(tabid) {
		return this.tabs["tab_" + tabid];
	}

	isCached(tabid) {
		return this.tabs["tab_" + tabid] != undefined;
	}

	/**
	 * Returns the number of Tabs stored in the cache
	 */
	size() {
		return Object.keys(this.tabs).length;
	}
}

/**
 * Stores our custom tab objects to disk for future reference.
 */
class TabStorage {
	constructor() {
	}

	/**
	 * Stores a Tab in local storage.
	 */
	_storeTab(tab, callback) {
		var key = "tab_" + tab.id;
		chrome.storage.local.set({key: tab});
		runCallback(callback);
	}

	/**
	 * Stores an array of Tabs in local storage.
	 */
	_storeTabs(tabs, callback) {
		for (var i = 0; i < tabs.length; i++) {
			this._storeTab(tabs[i]);
		}
		runCallback(callback);
	}

	/**
	 * Build a tab object from local storage.
	 */
	_getTab(tab_id, callback) {
		var key = "tab_" + tab_id;
		chrome.storage.local.get(key, callback);
	}

	/**
	 * An array of tabids to recover from storage.
	 */
	_getTabs(tab_ids, callback) {
		keys = []
		for (var id in tab_ids) {
			keys.push("tab_" + id);
		}
		chrome.storage.local.get(keys, callback);
	}

}
