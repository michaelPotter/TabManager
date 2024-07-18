/*
 * Tab.ts
 *
 * TODO:
 * 	- should have this keep track of the container it's in, so you don't have to do the promise thing
 */
'use strict';

import _ from 'lodash';

// This is the extra data we can't get from the browser api.
// ... There isn't anything yet, but that could change.
declare type TabExtraData = {
	id?: number,
};


export default class Tab {
	tab: browser.tabs.Tab;
	// This is tracked differently from other properties for mobx support.
	active: boolean = false;

	/**
	 * wrapper class for browser.tabs
	 *
	 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
	 */
	constructor(tab: browser.tabs.Tab, data?: TabExtraData) {
		this.tab = tab;
		if (tab.active) this.setActive(true);

	}

	/**
	 * Closes this tab
	 */
	close() {
		if (this.id) {
			browser.tabs.remove(this.id);
		}
	}

	focus() {
		if (this.id) {
			browser.tabs.update(this.id, {active: true})
		}
		if (this.windowId) {
			browser.windows.update(this.windowId, {focused: true});
		}
	}

	/**
	 * Given a new browser tab object, update our tab object to reference the new object.
	 * Sometimes the data backing a tab will change, such as on page navigation.
	 */
	updateTab(tab: browser.tabs.Tab) {
		this.tab = tab;
	}

	async isBookmarked(): Promise<boolean> {
		if (!this.tab.url) {
			return false;
		}

		// searching for certain sites causes errors
		const avoid_these_sites = [
			/^about:.*/,
			/^file:.*/,
			/view-source:moz-extension:.*/
		]

		let bad_site = false
		for (let re of avoid_these_sites) {
			if (re.test(this.tab.url)) {
				bad_site = true
			}
		}

		if (! bad_site) {
			let bookmarks = await browser.bookmarks.search({"url":this.tab.url});
			return bookmarks.length > 0;
		}
		return false;
	}

	/**
	 * returns a promise w/contextual id
	 */
	get_container(): Promise<browser.contextualIdentities.ContextualIdentity| null> {
		let id = this.tab.cookieStoreId
		return id ? browser.contextualIdentities.get(id) : new Promise(() => null);
	}

	/**
	 * Inflates the given data into a Tab
	 *
	 * Data should be a json object created by calling flatten() on another Tab.
	 *
	 * Behavior is undefined if data does not have the key "id"
	 */
	static async inflate(id: number, data?: TabExtraData): Promise<Tab> {
		let basetab = await browser.tabs.get(id);
		let tab = new Tab(basetab, data)
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
		let data = await browser.storage.local.get(key);
		// even if there was no data in storage, we'll just get a fresh Tab
		return Tab.inflate(tab_id, data[key]);
	}

	/**
	 * Serializes this object to a json object for storage.
	 *
	 * The returned json will have two attributes: "key" the storage key, and
	 * "val" a json object to be stored.
	 */
	flatten(): {[key: string]: TabExtraData}  {
		let flat = {
			[this.key]: this.data,
		};
		return flat;
	}

	/**
	 * Performs the actual data storage
	 */
	store(): Promise<void> {
		let flatTab = {
			[this.key]: this.data,
		};
		return browser.storage.local.set(flatTab);
	}

	/**
	 * Convenience method for optional chaining
	 */
	setActive(active: boolean) {
		this.tab.active = active;
		this.active = active;
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
	// get active()          { return this.tab.active; }
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
	// set active(value)          { this.tab.active = value; }
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
