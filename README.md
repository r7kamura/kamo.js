# kamo.js
A library to control event streams on Functional Reactive Programming model.

## Install
```sh
# As an npm package
npm install r7kamura/kamo.js

# As a bower package
bower install r7kamura/kamo.js

# As a source code for browser
<script src="http://r7kamura.github.io/kamo.js/dist/kamo.min.js"></script>
```

## API
See [/docs/stream.md](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#new-kamostream)

* [new kamo.Stream()](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#new-kamostream)
* [.fromEventHandlerSetter](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#fromeventhandlersetterobject-string---stream)
* [.fromEventHandlerFunction](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#fromeventhandlerfunction-object-string-any---stream)
* [#merge](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#mergestream---stream)
* [#scan](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#scanany-function-any-any---any---stream)
* [#filter](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#filterfunction-any---boolean---stream)
* [#map](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#mapfunction-any---any---stream)
* [#buffer](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#bufferstream---stream)
* [#combine](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#combinestream-function-any-any---any---stream)
* [#sampledBy](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#sampledbystream-function-any-any---any---stream)
* [#flatMap](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#flatmapfunction-any---stream---stream)
* [#flatMapLatest](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#flatmaplatestfunction-any---stream---stream)
* [#bufferWithCount](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#bufferwithcountintger---stream)
* [#throttleWithCount](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#throttlewithcountintger---stream)
* [#windowWithCount](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#windowwithcountintger---stream)
* [#throttle](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#throttleinteger---stream)
* [#debounce](https://github.com/r7kamura/kamo.js/blob/master/doc/stream.md#debounceinteger---stream)

## Development
`npm` is pre-required for development.

```sh
# Install dependent modules for development
make prepare

# Run tests
make test

# Run lint checker
make lint

# Update docs
make doc

# Update distribution
make build

# Run all above tasks
make
```
