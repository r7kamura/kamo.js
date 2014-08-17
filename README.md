# stream.js
A library to control event streams.

## Examples
stream.js provides `window.Stream.EventStream` class object for pub-sub event model.

```js
var stream = new Stream.EventStream();
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

### merge
```js
var a = new Stream.EventStream();
var b = new Stream.EventStream();
a.merge(b).subscribe(function(value) {
  console.log(value);
});
a.publish('a');
b.publish('b');
```

```
a
b
```

### scan
```js
var stream = new Stream.EventStream();
stream.scan(0, function(currentValue, newValue) {
  return currentValue + newValue;
}).subscribe(function(value) {
  console.log(value);
});
stream.publish(1);
stream.publish(2);
stream.publish(3);
```

```
1
3
6
```

### filter
```js
var stream = new Stream.EventStream();
stream.filter(function(value) {
  return value >= 0;
}).subscribe(function(value) {
  console.log(value);
});
stream.publish(1);
stream.publish(-2);
stream.publish(3);
```

```
1
3
```

### map
```js
var stream = new Stream.EventStream();
stream.map(function(value) {
  return value * 2;
}).subscribe(function(value) {
  console.log(value);
});
stream.publish(1);
stream.publish(2);
```

```
2
4
```

### combine
```js
var a = new Stream.EventStream();
var b = new Stream.EventStream();
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

### sampledBy
```js
var a = new Stream.EventStream();
var b = new Stream.EventStream();
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

### flatMap
```js
var stream = new Stream.EventStream();
stream.flatMap(function(value) {
  var eachEventStream = new Stream.EventStream();
  window.setTimeout(
    function() {
      eachEventStream.publish(value * 2);
      eachEventStream.publish(value * 3);
    },
    1000
  );
  return eachEventStream;
}).subscribe(function(value) {
  console.log(value);
});
stream.publish(1);
stream.publish(2);
```

```
2
3
4
6
```
