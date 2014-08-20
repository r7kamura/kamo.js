all: lint test

lint:
	./node_modules/.bin/jshint src

test:
	./node_modules/.bin/mocha

.PHONY: lint test
