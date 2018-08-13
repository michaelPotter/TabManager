class Selection {
	constructor() {
		this.tabs = [];
	}

	addTab(tab) {
		this.tabs.append(tab);
	}

	// applies function to all tabs in selection
	applyFunction(function) {
		for (var i = 0; i < this.tabs.length) {
			function(this.tabs[i]);
		}
	}
}
