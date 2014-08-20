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

## API
### new kamo.Stream() -> Stream
kamo.Stream is a class for composable mediator, basically for Pub/Sub messaging model.

```js
var stream = new kamo.Stream();
stream.subscribe(function (message) {
  console.log(message);
});
stream.publish(1);
stream.publish(2);
stream.publish(3);
```

### .fromEventHandlerSetter(Object, String) -> Stream
Creates a new Stream from an event handler setter of given object.

```js
kamo.Stream.fromEventHandlerSetter(window, 'onkeyup').subscribe(function (event) {
  console.log(event.keyCode);
});
```

### .fromEventHandlerFunction(Object, String, Any...) -> Stream
Creates a new Stream from an event handler function of given object.

```js
kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).subscribe(function () {
  console.log(1);
});
```

### #publish(Any) -> Stream
Invokes all registered subscriptions with passing given message.

### #subscribe(function (Any)) -> Stream
Registers a given callback function that will be called on each publish message.

### #merge(Stream) -> Stream
Creates a new Stream by merging 2 Stream.

```
a          : --1----->
               |
b          : -----2-->
               |  |
a.merge(b) : --1--2-->
```

```js
var a = new kamo.Stream();
var b = new kamo.Stream();
a.merge(b).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
b.publish(2);
```

### #scan(Any, function (Any, Any) -> Any) -> Stream
Creates a new Stream as an accumulator from given seed and function.

```
a               : --1--2--3-->
                    |  |  |
a.scan(0, plus) : --1--3--6-->
```

```js
var a = new kamo.Stream();
a.scan(0, function (currentMessage, newMessage) {
  return currentMessage + newMessage;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
```
### #filter(function (Any) -> Boolean) -> Stream
Creates a new Stream that filters messages by given function.

```
a           : --1--2--3-->
                |     |
a.filter(f) : --1-----3-->
```

```js
var a = new kamo.Stream();
a.filter(function (message) {
  return message % 2 == 1;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
```
### #map(function (Any) -> Any) -> Stream
Creates a new Stream that publishes applicaiton results of given function.

```
a        : --1--2--3-->
             |  |  |
a.map(f) : --2--4--6-->
```

```js
var a = new kamo.Stream();
a.map(function (message) {
  return message * 2;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
```

### #combine(Stream, function (Any, Any) -> Any) -> Stream
Creates a new Stream that publishes the combination of the latest messages.

```
a               : --1-----3----->
                    |     |
b               : -----2-----4-->
                    `--|`-|`-|
a.combine(b, f) : -----3--5--7-->
```

```js
var a = new kamo.Stream();
var b = new kamo.Stream();
a.combine(b, function (aMessage, bMessage) {
  return aMessage + bMessage;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
b.publish(2);
a.publish(3);
b.publish(4);
```

### #sampledBy(Stream, function (Any, Any) -> Any) -> Stream
Like `combine`, but only publishes messages when any messages are published from given Stream.

```
a                 : --1-----3----->
                      |     |
b                 : -----2-----4-->
                      `--|  `--|
a.sampledBy(b, f) : -----3-----7-->
```

```js
var a = new kamo.Stream();
var b = new kamo.Stream();
a.sampledBy(b, function (aMessage, bMessage) {
  return aMessage + bMessage;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
b.publish(2);
a.publish(3);
b.publish(4);
```

### #flatMap(function (Any) -> Stream) -> Stream
Creates new Streams for each message in the soruce stream, then flattens it.

```
a            : --1---2--------------->
                 |   |
               f(1)------2--3-------->
                     |   |  |
                   f(2)--------4--6-->
                         |  |  |  |
a.flatMap(f) : ----------2--3--4--6-->
```

```js
var a = new kamo.Stream();
a.flatMap(function (message) {
  var eachStream = new kamo.Stream();
  window.setTimeout(
    function () {
      eachStream.publish(message * 2);
      eachStream.publish(message * 3);
    },
    1000
  );
  return eachStream;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
```

### #flatMapLatest(function (Any) -> Stream) -> Stream
Like `flatMap`, but publishes messages only from the latest stream.

```
a                  : --1---2--------------->
                       |   |
                     f(1)------2--3-------->
                           |
                         f(2)--------4--6-->
                                     |  |
a.flatMapLatest(f) : ----------------4--6-->
```

```js
var a = new kamo.Stream();
a.flatMapLatest(function (message) {
  var eachStream = new kamo.Stream();
  window.setTimeout(
    function () {
      eachStream.publish(message * 2);
      eachStream.publish(message * 3);
    },
    1000
  );
  return eachStream;
}).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
```

### #bufferWithCount(Intger) -> Stream
Buffers messages with given count.

```
a                    : --1----2----3----4----5-->
                          `---|     `---|
a.bufferWithCount(2) : -------[1,2]-----[3,4]--->
```

```js
var a = new kamo.Stream();
a.bufferWithCount(2).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
a.publish(4);
a.publish(5);
```

### #throttleWithCount(Intger) -> Stream
Throttles messages with given count.

```
a                      : --1--2--3--4--5-->
                           |     |     |
a.throttleWithCount(2) : --1-----3-----5-->
```

```js
var a = new kamo.Stream();
a.throttleWithCount(2).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
a.publish(4);
a.publish(5);
```

### #windowWithCount(Intger) -> Stream
Slides a window of given length.

```
a                    : --1------2------3------4------5------>
                          `-----|`-----|`-----|`-----|`------
a.windowWithCount(2) : ---------[1,2]--[2,3]--[3,4]--[4,5]-->
```

```js
var a = new kamo.Stream();
a.bufferWithCount(2).subscribe(function (message) {
  console.log(message);
});
a.publish(1);
a.publish(2);
a.publish(3);
a.publish(4);
a.publish(5);
```

### #throttle(Integer) -> Stream
Throttles its stream by given amount of milliseconds.

```
a                   : --1--1--1--1--1-->
                        |     |     |
a.throttle(integer) : --1-----1-----1-->
```

```js
var a = kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).map(function () {
  return 1;
});
a.throttle(1500).subscribe(function (message) {
  console.log(message);
});
```

### #debounce(Integer) -> Stream
Like `throttle`, but so that event is only published after the given quiet period.

```
a                   : --1---1-------1--------->
                             `-----. `-----.
a.debounce(integer) : -------------1-------1-->
```

```js
var a = kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).map(function () {
  return 1;
});
a.debounce(1500).subscribe(function (message) {
  console.log(message);
});
```

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
