/* Singleton for managing tabs. Do not construct tabs directly,
 * instead go through this function to reuse tab objects
 */


class TabManager {
	constructor() {
		this.tabs = {};
	}


	loadAllTabs(callback) {
		this.loadAllFromApi()
		if (callback != undefined) {
			callback();
		}
	}
	

	loadTab(id, callback) {
		chrome.tabs.get(id, function(id) {
			this.tabs.id = id;
		});
		if (callback != undefined) {
			callback();
		}
	}

	loadAllFromApi(callback) {
		chrome.windows.getAll(null, function(windows) {
			for (var i = 0; i < windows.length; i++) {
				chrome.tabs.query({windowId: window.id}, function(tabs) {
					for (var j = 0; j < tabs.length; j++) {
						this.loadTab(tabs[j].id);
					}
				});
			}
		});
		if (callback != undefined) {
			callback();
		}
	}

	getTab(id) {
		if (this.tabs.id == undefined) {
			loadTab(id)
		}
		return tabs.id
	}
}
