all: prepare doc lint test

doc:
	git grep -h "^\s\+// \?" src | sed -E 's; +// ?;;' > doc/stream.md

lint:
	./node_modules/.bin/jshint src

prepare:
	npm install

test:
	./node_modules/.bin/mocha

.PHONY: doc lint prepare test
