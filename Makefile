src_files = src/**
webpack_output = dist/popup.js dist/background.js dist/tabmanager.css
zip = TabManager.zip

########################################################################
#                               COMMANDS                               #
########################################################################

webpack: $(webpack_output)

release: $(zip)

debug: debug.zip

debug-daemon: debugd
debugd: debug
	npx webpack watch --mode development

########################################################################
#                             REAL TARGETS                             #
########################################################################

$(zip): dist
	cp icons/icon.png dist/icon.png
	cd dist && zip -r ../$(zip) .

debug.zip: dist
	cp icons/icon_debug.png dist/icon.png
	cd dist && zip -r ../debug.zip .

dist: $(webpack_output) dist/popup.html dist/manifest.json

$(webpack_output) &: $(src_files) ./node_modules/.bin/webpack
	./node_modules/.bin/webpack --mode production

# TODO have webpack copy html instead, so that webpack watch works on it too
dist/popup.html dist/manifest.json: dist/%: src/%
	cp src/$* dist/

./node_modules/.bin/webpack:
	npm install

clean:
	rm -rf \
		dist/* \
		*.zip

.PHONY: release debug debugd debug-daemon clean test all webpack
