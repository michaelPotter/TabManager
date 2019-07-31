src_files = manifest.json dist/popup.html icon.png js lib
output_files = dist/popup.html dist/popup.js icon.png manifest.json

TabManager.zip: $(src_files) manifests/main.json dist/popup.js
	cp manifests/main.json ./manifest.json
	zip -r TabManager.zip $(output_files)

debug: debug.zip

debug.zip: $(src_files) icon_debug.png manifests/debug.json dist/popup.js
	cp manifests/debug.json ./manifest.json
	zip -r debug.zip $(output_files) icon_debug.png

webpack: $(src_files) popup.js
	./node_modules/.bin/webpack

dist/popup.html: webpack

manifest.json:
