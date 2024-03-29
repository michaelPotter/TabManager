src_files = src
output_files = dist/popup.html dist/popup.js dist/background.js dist/manifest.json
zip = TabManager.zip

webpack: $(src_files) ./node_modules/.bin/webpack
	./node_modules/.bin/webpack

release: $(zip)

debug: debug.zip

debug-daemon: debugd
debugd: debug
	npx webpack watch

$(zip): $(src_files) dist
	cp icons/icon.png dist/icon.png
	cd dist && zip -r ../$(zip) .

debug.zip: $(src_files) dist
	cp icons/icon_debug.png dist/icon.png
	cd dist && zip -r ../debug.zip .

dist: webpack
	cp src/popup.html dist/
	cp src/manifest.json dist/

./node_modules/.bin/webpack:
	npm install

clean:
	rm -rf \
		dist/* \
		*.zip

.PHONY: release debug debugd debug-daemon clean test all
