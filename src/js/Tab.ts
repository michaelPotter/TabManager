/*
 * Tab.js
 *
 * TODO:
 * 	- should have this keep track of the container it's in, so you don't have to do the promise thing
 * 	- maybe also keep track of bookmarks internally instead of promise, though maybe not since bookmarks could change underneath you
 * 	- review and re-document how storage works in the context of this class. Maybe refactor
 */
'use strict';

// A flattened tab
declare type FlatTab = {
	// Key should always be tab_0000 where 0000 is the tab id number
	// There should only ever be one key, but idk how to express that
	[key: string]: TabData,
};

// This seems weirdly sparse.. seems like there should be more but I'm just copying over for now.
declare type TabData = {
	id: number,
};

export default class Tab {
	private tab: browser.tabs.Tab;
	// private data: any; // TODO

	/**
	 * wrapper class for browser.tabs
	 *
	 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
	 */
	constructor(tab: browser.tabs.Tab, data?) {
		this.tab = tab;
		// if (data != undefined && data != null) {
		// 	this.data = data;
		// 	// set extra properties here
		// }
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

	/**
	 * Inflates the given data into a Tab
	 *
	 * Data should be a json object created by calling flatten() on another Tab.
	 *
	 * Behavior is undefined if data does not have the key "id"
	 */
	static async inflate(id: number, data?): Promise<Tab> {
		let basetab = await browser.tabs.get(id);
		let tab = new Tab(basetab)
		if (data == undefined) {
			tab.store();
		}
		return tab;
	}

	/**
	 * Builds a Tab from storage given a tab's id.
	 *
	 * Calls the given callback on the Tab. Callback should have the form
	 * function(err, Tab). On success, err will be null.
	 */
	static async from_storage(tab_id: number): Promise<Tab> {
		var key = "tab_" + tab_id;
		let item = browser.storage.local.get(key);
		// even if there was no data in storage, we'll just get a fresh Tab
		return Tab.inflate(tab_id);
	}

	/**
	 * Performs the actual data storage
	 */
	store(): Promise<void> {
		let flatTab: FlatTab = {
			[this.key]: this.data,
		};
		return browser.storage.local.set(flatTab);
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
	// get autoDiscardable() { return this.tab.autoDiscardable; }
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
	// set autoDiscardable(value) { this.tab.autoDiscardable = value; }
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
