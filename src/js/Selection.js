class Selection {
	constructor() {
		this.tabs = [];
	}

	addTab(tab) {
		this.tabs.append(tab);
	}

	// applies function to all tabs in selection
	applyFunction(func) {
		for (var i = 0; i < this.tabs.length; i++) {
			func(this.tabs[i]);
		}
	}
}
