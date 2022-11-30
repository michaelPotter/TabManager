src_files = src lib
output_files = dist/popup.html dist/popup.js dist/background.js dist/manifest.json
zip = TabManager.zip

webpack: $(src_files) ./node_modules/.bin/webpack
	./node_modules/.bin/webpack

release: $(zip)

debug: debug.zip

debugd:
	while sleep 0.1; do fd -tf . src | entr make debug ; done

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
