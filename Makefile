files = manifest.json js popup.html popup.js jquery-*.js icon.png Sortable.js

TabManager.zip: $(files)
	zip -r TabManager.zip $(files)

debug: debug.zip

debug.zip: debug_icon $(files) icon_debug.png
	zip -r debug.zip $(files) icon_debug.png

ic_debug:
	sed -i 's/icon.png/icon_debug.png/g' manifest.json
