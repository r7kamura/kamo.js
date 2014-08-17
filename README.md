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
var mergedStream = a.merge(b);
mergedStream.subscribe(function(value) {
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
