# kamo.js
A library to control event streams on Functional Reactive Programming model.

* [Install](https://github.com/r7kamura/kamo.js#install)
* [API](https://github.com/r7kamura/kamo.js#api)
 * [new kamo.Stream()](https://github.com/r7kamura/kamo.js#new-kamostream)
 * [.fromEventHandlerSetter](https://github.com/r7kamura/kamo.js#fromeventhandlersetterobject-string---stream)
 * [.fromEventHandlerFunction](https://github.com/r7kamura/kamo.js#fromeventhandlerfunction-object-string-any---stream)
 * [#merge](https://github.com/r7kamura/kamo.js#mergestream---stream)
 * [#scan](https://github.com/r7kamura/kamo.js#scanany-function-any-any---any---stream)
 * [#filter](https://github.com/r7kamura/kamo.js#filterfunction-any---boolean---stream)
 * [#map](https://github.com/r7kamura/kamo.js#mapfunction-any---any---stream)
 * [#combine](https://github.com/r7kamura/kamo.js#combinestream-function-any-any---any---stream)
 * [#sampledBy](https://github.com/r7kamura/kamo.js#sampledbystream-function-any-any---any---stream)
 * [#flatMap](https://github.com/r7kamura/kamo.js#flatmapfunction-any---stream---stream)
 * [#flatMapLatest](https://github.com/r7kamura/kamo.js#flatmaplatestfunction-any---stream---stream)
 * [#bufferWithCount](https://github.com/r7kamura/kamo.js#bufferwithcountintger---stream)
 * [#throttleWithCount](https://github.com/r7kamura/kamo.js#throttlewithcountintger---stream)
 * [#windowWithCount](https://github.com/r7kamura/kamo.js#windowwithcountintger---stream)
 * [#throttle](https://github.com/r7kamura/kamo.js#throttleinteger---stream)
 * [#debounce](https://github.com/r7kamura/kamo.js#debounceinteger---stream)
* [Development](https://github.com/r7kamura/kamo.js/#development)

## Install
As an npm package:

```
npm install r7kamura/kamo.js
```

As a bower package:

```
bower install r7kamura/kamo.js
```

## API & Example
See [/docs/stream.md](docs/stream.md)

## Development
`npm` is required for development.

```sh
# Install dependent modules for development
npm install

# Run tests
make test

# Run lint checker
make lint

# Run `test` and `lint`
make

# Generate API docs to STDOUT
make doc --silent
```
