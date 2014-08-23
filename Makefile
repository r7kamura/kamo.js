all: prepare doc lint build test

build:
	./node_modules/.bin/uglifyjs src/kamo.js > dist/kamo.min.js
	cp src/kamo.js dist/kamo.js

doc:
	git grep -h "^\s\+// \?" src | sed -E 's; +// ?;;' > doc/stream.md

lint:
	./node_modules/.bin/jshint src

prepare:
	npm install

release:
	git push origin master:gh-pages

test:
	./node_modules/.bin/mocha

.PHONY: build doc lint prepare release test
