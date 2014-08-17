# kamo.js
A library to control event streams on Functional Reactive Programming model.

## Examples
kamo.js provides `kamo.Stream` class object for pub-sub event model.

```js
var stream = new Stream.Stream();
stream.subscribe(function(value) {
  console.log(value);
});
stream.publish(1);
stream.publish(2);
stream.publish(3);
```

```
1
2
3
```

### merge(stream)
Creates a new Stream by merging 2 Stream.

```
a          : --1----->
               |
b          : -----2-->
               |  |
a.merge(b) : --1--2-->
```

```js
var a = new Stream.Stream();
var b = new Stream.Stream();
a.merge(b).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
b.publish(2);
```

```
1
2
```

### scan(seed, f)
Creates a new Stream as an accumulator from given seed and function.

```
a               : --1--2--3-->
                    |  |  |
a.scan(0, plus) : --1--3--6-->
```

```js
var a = new Stream.Stream();
a.scan(0, function(currentValue, newValue) {
  return currentValue + newValue;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
a.publish(2);
a.publish(3);
```

```
1
3
6
```

### filter(f)
Creates a new Stream that filters values by given function.

```
a           : --1--2--3-->
                |     |
a.filter(f) : --1-----3-->
```

```js
var a = new Stream.Stream();
a.filter(function(value) {
  return value % 2 == 1;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
a.publish(2);
a.publish(3);
```

```
1
3
```

### map(f)
Creates a new Stream that publishes applicaiton results of given function.

```
a        : --1--2--3-->
             |  |  |
a.map(f) : --2--4--6-->
```

```js
var a = new Stream.Stream();
a.map(function(value) {
  return value * 2;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
a.publish(2);
a.publish(3);
```

```
2
4
6
```

### combine(stream, f)
Creates a new Stream that publishes the combination of the latest values.

```
a               : --1-----3----->
                    |     |
b               : -----2-----4-->
                    `--|`-|`-|
a.combine(b, f) : -----3--5--7-->
```

```js
var a = new Stream.Stream();
var b = new Stream.Stream();
a.combine(b, function(aValue, bValue) {
  return aValue + bValue;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
b.publish(2);
a.publish(3);
b.publish(4);
```

```
3
5
7
```

### sampledBy(stream, f)
Like `combine`, but only publishes values when any values are published from given Stream.

```
a                 : --1-----3----->
                      |     |
b                 : -----2-----4-->
                      `--|  `--|
a.sampledBy(b, f) : -----3-----7-->
```

```js
var a = new Stream.Stream();
var b = new Stream.Stream();
a.sampledBy(b, function(aValue, bValue) {
  return aValue + bValue;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
b.publish(2);
a.publish(3);
b.publish(4);
```

```
3
7
```

### flatMap(f)
Creates a new Stream for each value in the soruce stream, using the given map.
The events from all created stream are merged into the result stream.

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
var a = new Stream.Stream();
a.flatMap(function(value) {
  var eachStream = new Stream.Stream();
  window.setTimeout(
    function() {
      eachStream.publish(value * 2);
      eachStream.publish(value * 3);
    },
    1000
  );
  return eachStream;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
a.publish(2);
```

```
2
3
4
6
```

### flatMapLatest(f)
Like `flatMap`, creates new streams for each source event.
Instead of merging all created streams, it switches between them so that
when a new stream is created, the earlier-created stream is no longer listened to.

```
a            : --1---2--------------->
                 |   |
               f(1)------2--3-------->
                     |
                   f(2)--------4--6-->
                               |  |
a.flatMap(f) : ----------------4--6-->
```

```js
var a = new Stream.Stream();
a.flatMapLatest(function(value) {
  var eachStream = new Stream.Stream();
  window.setTimeout(
    function() {
      eachStream.publish(value * 2);
      eachStream.publish(value * 3);
    },
    1000
  );
  return eachStream;
}).subscribe(function(value) {
  console.log(value);
});
a.publish(1);
a.publish(2);
```

```
4
6
```
