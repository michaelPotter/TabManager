src_files = manifest.json src lib
output_files = dist/popup.html dist/popup.js dist/background.js manifest.json

webpack: $(src_files) popup.js ./node_modules/.bin/webpack
	./node_modules/.bin/webpack

release: TabManager.zip

debug: debug.zip

TabManager.zip: $(src_files) manifests/main.json dist/popup.js
	cp src/popup.html dist/
	cp icons/icon.png dist/icon.png
	cp manifests/main.json ./manifest.json
	zip -r TabManager.zip $(output_files) dist/icon.png

debug.zip: $(src_files) manifests/debug.json dist/popup.js
	cp src/popup.html dist/
	cp icons/icon_debug.png dist/icon.png
	cp manifests/main.json ./manifest.json
	zip -r debug.zip $(output_files) dist/icon.png

dist/popup.js: webpack

manifest.json:

./node_modules/.bin/webpack:
	npm install

clean:
	rm -rf \
		dist/* \
		*.zip \
		manifest.json
