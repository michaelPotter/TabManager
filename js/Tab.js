class Tab {
	constructor(tab) {
		this.tab = tab;
	}

	// store this tab in storage
	__store() {
		key = "tab_" + this.tab.id;
		chrome.storage.local.set({key: this});
	}

	// build a tab object from storage
	static from_storage(tab_id, callback) {
		key = "tab_" + this.tab.id;
		chrome.storage.local.get(key, callback);
	}

	getTabView() {
		if (! this.tabView) {
			tv = new tabView(this);
			this.tabView = tv;
		}
		return this.tabView;
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
