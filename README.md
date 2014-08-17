# stream.js
A library to control event streams.

## Examples
stream.js provides `window.Stream.EventStream` class object.

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
var c = a.merge(b);
c.subscribe(function(value) {
  console.log(value);
});
a.publish('a');
b.publish('b');
```

```
a
b
```
