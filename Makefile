files = manifest.json js popup.html popup.js jquery-*.js icon.png Sortable.js
	
TabManager.zip: $(files)
	zip -r TabManager.zip $(files)
