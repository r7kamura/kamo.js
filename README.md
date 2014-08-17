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
```
a          : --1----->
               |
b          : -----2-->
               |  |
a.merge(b) : --1--2-->
```

```js
var a = new Stream.EventStream();
var b = new Stream.EventStream();
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

### scan
```
a               : --1--2--3-->
                    |  |  |
a.scan(0, plus) : --1--3--6-->
```

```js
var a = new Stream.EventStream();
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

### filter
```
a           : --1--2--3-->
                |     |
a.filter(f) : --1-----3-->
```

```js
var a = new Stream.EventStream();
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

### map
```
a        : --1--2--3-->
             |  |  |
a.map(f) : --2--4--6-->
```

```js
var a = new Stream.EventStream();
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

### combine
```
a               : --1-----3----->
                    |     |
b               : -----2-----4-->
                    `--|`-|`-|
a.combine(b, f) : -----3--5--7-->
```

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
```
a                 : --1-----3----->
                      |     |
b                 : -----2-----4-->
                      `--|  `--|
a.sampledBy(b, f) : -----3-----7-->
```

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
var a = new Stream.EventStream();
a.flatMap(function(value) {
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
a.publish(1);
a.publish(2);
```

```
2
3
4
6
```

### flatMapLatest
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
var a = new Stream.EventStream();
a.flatMapLatest(function(value) {
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
a.publish(1);
a.publish(2);
```

```
4
6
```
