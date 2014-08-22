all: prepare doc lint build test

doc:
	git grep -h "^\s\+// \?" src | sed -E 's; +// ?;;' > doc/stream.md

lint:
	./node_modules/.bin/jshint src

build:
	./node_modules/.bin/uglifyjs src/kamo.js > dist/kamo.min.js
	cp src/kamo.js dist/kamo.js

prepare:
	npm install

test:
	./node_modules/.bin/mocha

.PHONY: build doc lint prepare test
