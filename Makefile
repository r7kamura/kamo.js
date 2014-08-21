all: doc lint test

doc:
	git grep -h "^\s\+// \?" src | sed -E 's; +// ?;;' > doc/stream.md

lint:
	./node_modules/.bin/jshint src

test:
	./node_modules/.bin/mocha

.PHONY: lint test doc
