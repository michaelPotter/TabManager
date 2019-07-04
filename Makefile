files = manifest.json js popup.html popup.js jquery-*.js icon.png Sortable.js

TabManager.zip: $(files) manifests/main.json
	cp manifests/main.json ./manifest.json
	zip -r TabManager.zip $(files)

debug: debug.zip

debug.zip: $(files) icon_debug.png manifests/debug.json
	cp manifests/debug.json ./manifest.json
	zip -r debug.zip $(files) icon_debug.png
