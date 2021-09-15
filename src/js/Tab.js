// Tab.js

import TabView from './TabView.js';
import util from './util.js';

export default class Tab {
	/**
	 * wrapper class for chrome.tabs
	 *
	 * https://developer.chrome.com/extensions/tabs
	 */
	constructor(tab, data) {
		this.tab = tab;
		if (data != undefined && data != null) {
			this.data = data;
			// set extra properties here
		}
	}

	/**
	 * Closes this tab
	 */
	close() {
		chrome.tabs.remove(this.id);
	}

	focus() {
		chrome.tabs.update(this.id, {active: true}, null)
		chrome.windows.update(this.windowId, {focused: true});
	}

	isBookmarked() {
		// searching for certain sites causes errors
		var avoid_these_sites = [
			/^about:.*/,
			/view-source:moz-extension:.*/
		]

		var bad_site = false
		for (var re of avoid_these_sites) {
			if (re.test(this.tab.url)) {
				bad_site = true
			}
		}

		if (! bad_site) {
			return browser.bookmarks
				.search({"url":this.tab.url})
				.then(array => array.length > 0)
		;
		}
		return new Promise((resolve, reject) => false);
	}

	/**
	 * returns a promise w/contextual id
	 */
	get_container() {
		var id = this.tab.cookieStoreId
		return browser.contextualIdentities.get(id)
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
			Tab.inflate(tab_id, this.data[key], callback);
		});
	}

	getTabView() {
		if (! this.tabView) {
			var tv = new TabView(this);
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
		util.runCallback(callback, flat);
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
		var data = {"id": this.id};
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

	set id(value)              { this.tab.id = value; }
	set index(value)           { this.tab.index = value; }
	set windowId(value)        { this.tab.windowId = value; }
	set openerTabId(value)     { this.tab.openerTabId = value; }
	set highlighted(value)     { this.tab.highlighted = value; }
	set active(value)          { this.tab.active = value; }
	set pinned(value)          { this.tab.pinned = value; }
	set audible(value)         { this.tab.audible = value; }
	set discarded(value)       { this.tab.discarded = value; }
	set autoDiscardable(value) { this.tab.autoDiscardable = value; }
	set mutedInfo(value)       { this.tab.mutedInfo = value; }
	set url(value)             { this.tab.url = value; }
	set title(value)           { this.tab.title = value; }
	set favIconUrl(value)      { this.tab.favIconUrl = value; }
	set status(value)          { this.tab.status = value; }
	set incognito(value)       { this.tab.incognito = value; }
	set width(value)           { this.tab.width = value; }
	set height(value)          { this.tab.height = value; }
	set sessionId(value)       { this.tab.sessionId = value; }
}
