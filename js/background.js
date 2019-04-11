chrome.windows.onFocusChanged.addListener(function(id) {
	if (id > 0) {
		Window.get(id, function(w) {
			w.last_accessed = Date.now()
		});
	}
});
