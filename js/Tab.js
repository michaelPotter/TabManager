class Tab {
	constructor(tab) {
		this.tab = tab;
		// this.bookmarked = null;
		// this.__is_bookmarked();
	}

	getTabView() {
		if (! this.tabView) {
			tv = new tabView(this);
			this.tabView = tv;
		}
		return this.tabView;
	}

	bookmark() {

	}

	__is_bookmarked() {
		chrome.bookmarks.search({"url":this.tab.url}, function(array) {
			this.bookmarked = array.length > 0;
		});
	}

	get bookmarked() { return this.bookmarked }
	set bookmarked(x) { this.bookmarked = x }

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
