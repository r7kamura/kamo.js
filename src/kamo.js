(function (global) {
  var kamo = {};

  kamo.Stream = (function () {
    // ### new kamo.Stream() -> Stream
    // kamo.Stream is a class for composable mediator, basically for Pub/Sub messaging model.
    //
    // ```js
    // var stream = new kamo.Stream();
    // stream.subscribe(function (message) {
    //   console.log(message);
    // });
    // stream.publish(1);
    // stream.publish(2);
    // stream.publish(3);
    // ```
    //
    var Constructor = function () {
      this.subscriptions = [];
    };

    // ### .fromEventHandlerSetter(Object, String) -> Stream
    // Creates a new Stream from an event handler setter of given object.
    //
    // ```js
    // kamo.Stream.fromEventHandlerSetter(window, 'onkeyup').subscribe(function (event) {
    //   console.log(event.keyCode);
    // });
    // ```
    //
    Constructor.fromEventHandlerSetter = function (object, propertyName) {
      var stream = new Constructor();
      object[propertyName] = function (event) {
        stream.publish(event);
      };
      return stream;
    };

    // ### .fromEventHandlerFunction(Object, String, Any...) -> Stream
    // Creates a new Stream from an event handler function of given object.
    //
    // ```js
    // kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).subscribe(function () {
    //   console.log(1);
    // });
    // ```
    //
    Constructor.fromEventHandlerFunction = function (object, functionName) {
      var args = Array.prototype.slice.call(arguments, 2);
      var stream = new Constructor();
      args.unshift(function (event) {
        stream.publish(event);
      });
      object[functionName].apply(object, args);
      return stream;
    };

    // ### #publish(Any) -> Stream
    // Invokes all registered subscriptions with passing given message.
    //
    Constructor.prototype.publish = function (message) {
      for (var i = 0, length = this.subscriptions.length; i < length; i++) {
        this.subscriptions[i](message);
      }
      return this;
    };

    // ### #subscribe(function (Any)) -> Stream
    // Registers a given callback function that will be called on each publish message.
    //
    Constructor.prototype.subscribe = function (subscription) {
      this.subscriptions.push(subscription);
      return this;
    };

    // ### #merge(Stream) -> Stream
    // Creates a new Stream by merging 2 Stream.
    //
    // ```
    // a          : --1----->
    //                |
    // b          : -----2-->
    //                |  |
    // a.merge(b) : --1--2-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // var b = new kamo.Stream();
    // a.merge(b).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // b.publish(2);
    // ```
    //
    Constructor.prototype.merge = function (anotherStream) {
      var mergedStream = new Constructor();
      this.subscribe(function (message) {
        mergedStream.publish(message);
      });
      anotherStream.subscribe(function (message) {
        mergedStream.publish(message);
      });
      return mergedStream;
    };

    // ### #scan(Any, function (Any, Any) -> Any) -> Stream
    // Creates a new Stream as an accumulator from given seed and function.
    //
    // ```
    // a               : --1--2--3-->
    //                     |  |  |
    // a.scan(0, plus) : --1--3--6-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.scan(0, function (currentMessage, newMessage) {
    //   return currentMessage + newMessage;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // ```
    Constructor.prototype.scan = function (seed, accumulator) {
      var accumulatorStream = new Constructor();
      var currentMessage = seed;
      this.subscribe(function (message) {
        currentMessage = accumulator(currentMessage, message);
        accumulatorStream.publish(currentMessage);
      });
      return accumulatorStream;
    };

    // ### #filter(function (Any) -> Boolean) -> Stream
    // Creates a new Stream that filters messages by given function.
    //
    // ```
    // a           : --1--2--3-->
    //                 |     |
    // a.filter(f) : --1-----3-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.filter(function (message) {
    //   return message % 2 == 1;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // ```
    Constructor.prototype.filter = function (filter) {
      var filteredStream = new Constructor();
      this.subscribe(function (message) {
        if (filter(message)) {
          filteredStream.publish(message);
        }
      });
      return filteredStream;
    };

    // ### #map(function (Any) -> Any) -> Stream
    // Creates a new Stream that publishes applicaiton results of given function.
    //
    // ```
    // a        : --1--2--3-->
    //              |  |  |
    // a.map(f) : --2--4--6-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.map(function (message) {
    //   return message * 2;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // ```
    //
    Constructor.prototype.map = function (map) {
      var mapStream = new Constructor();
      this.subscribe(function (message) {
        mapStream.publish(map(message));
      });
      return mapStream;
    };

    // ### #combine(Stream, function (Any, Any) -> Any) -> Stream
    // Creates a new Stream that publishes the combination of the latest messages.
    //
    // ```
    // a               : --1-----3----->
    //                     |     |
    // b               : -----2-----4-->
    //                     `--|`-|`-|
    // a.combine(b, f) : -----3--5--7-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // var b = new kamo.Stream();
    // a.combine(b, function (aMessage, bMessage) {
    //   return aMessage + bMessage;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // b.publish(2);
    // a.publish(3);
    // b.publish(4);
    // ```
    //
    Constructor.prototype.combine = function (anotherStream, combiner) {
      var combinedStream = new Constructor();
      var latestMessageOfThis;
      var latestMessageOfAnother;
      var hasAnyMessageOfThis = false;
      var hasAnyMessageOfAnother = false;
      this.subscribe(function (message) {
        latestMessageOfThis = message;
        hasAnyMessageOfThis = true;
        if (hasAnyMessageOfAnother) {
          combinedStream.publish(combiner(latestMessageOfThis, latestMessageOfAnother));
        }
      });
      anotherStream.subscribe(function (message) {
        latestMessageOfAnother = message;
        hasAnyMessageOfAnother = true;
        if (hasAnyMessageOfThis) {
          combinedStream.publish(combiner(latestMessageOfThis, latestMessageOfAnother));
        }
      });
      return combinedStream;
    };

    // ### #sampledBy(Stream, function (Any, Any) -> Any) -> Stream
    // Like `combine`, but only publishes messages when any messages are published from given Stream.
    //
    // ```
    // a                 : --1-----3----->
    //                       |     |
    // b                 : -----2-----4-->
    //                       `--|  `--|
    // a.sampledBy(b, f) : -----3-----7-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // var b = new kamo.Stream();
    // a.sampledBy(b, function (aMessage, bMessage) {
    //   return aMessage + bMessage;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // b.publish(2);
    // a.publish(3);
    // b.publish(4);
    // ```
    //
    Constructor.prototype.sampledBy = function (anotherStream, combiner) {
      var sampledStream = new Constructor();
      var latestMessageOfThis;
      var hasAnyMessageOfThis = false;
      this.subscribe(function (message) {
        latestMessageOfThis = message;
        hasAnyMessageOfThis = true;
      });
      anotherStream.subscribe(function (message) {
        if (hasAnyMessageOfThis) {
          sampledStream.publish(combiner(latestMessageOfThis, message));
        }
      });
      return sampledStream;
    };

    // ### #flatMap(function (Any) -> Stream) -> Stream
    // Creates new Streams for each message in the soruce stream, then flattens it.
    //
    // ```
    // a            : --1---2--------------->
    //                  |   |
    //                f(1)------2--3-------->
    //                      |   |  |
    //                    f(2)--------4--6-->
    //                          |  |  |  |
    // a.flatMap(f) : ----------2--3--4--6-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.flatMap(function (message) {
    //   var eachStream = new kamo.Stream();
    //   window.setTimeout(
    //     function () {
    //       eachStream.publish(message * 2);
    //       eachStream.publish(message * 3);
    //     },
    //     1000
    //   );
    //   return eachStream;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // ```
    //
    Constructor.prototype.flatMap = function (streamCreator) {
      var flattenStream = new Constructor();
      this.subscribe(function (message) {
        streamCreator(message).subscribe(function (messageOnEachStream) {
          flattenStream.publish(messageOnEachStream);
        });
      });
      return flattenStream;
    };

    // ### #flatMapLatest(function (Any) -> Stream) -> Stream
    // Like `flatMap`, but publishes messages only from the latest stream.
    //
    // ```
    // a                  : --1---2--------------->
    //                        |   |
    //                      f(1)------2--3-------->
    //                            |
    //                          f(2)--------4--6-->
    //                                      |  |
    // a.flatMapLatest(f) : ----------------4--6-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.flatMapLatest(function (message) {
    //   var eachStream = new kamo.Stream();
    //   window.setTimeout(
    //     function () {
    //       eachStream.publish(message * 2);
    //       eachStream.publish(message * 3);
    //     },
    //     1000
    //   );
    //   return eachStream;
    // }).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // ```
    //
    Constructor.prototype.flatMapLatest = function (streamCreator) {
      var flattenStream = new Constructor();
      var latestStream;
      this.subscribe(function (message) {
        var currentStream = streamCreator(message);
        latestStream = currentStream;
        latestStream.subscribe(function (messageOnEachStream) {
          if (currentStream === latestStream) {
            flattenStream.publish(messageOnEachStream);
          }
        });
      });
      return flattenStream;
    };

    // ### #bufferWithCount(Intger) -> Stream
    // Buffers messages with given count.
    //
    // ```
    // a                    : --1----2----3----4----5-->
    //                           `---|     `---|
    // a.bufferWithCount(2) : -------[1,2]-----[3,4]--->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.bufferWithCount(2).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // a.publish(4);
    // a.publish(5);
    // ```
    //
    Constructor.prototype.bufferWithCount = function (count) {
      return this.windowWithCount(count).throttleWithCount(count);
    };


    // ### #throttleWithCount(Intger) -> Stream
    // Throttles messages with given count.
    //
    // ```
    // a                      : --1--2--3--4--5-->
    //                            |     |     |
    // a.throttleWithCount(2) : --1-----3-----5-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.throttleWithCount(2).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // a.publish(4);
    // a.publish(5);
    // ```
    //
    Constructor.prototype.throttleWithCount = function (count) {
      var index = 0;
      return this.filter(function (message) {
        return index++ % count === 0;
      });
    };

    // ### #windowWithCount(Intger) -> Stream
    // Slides a window of given length.
    //
    // ```
    // a                    : --1------2------3------4------5------>
    //                           `-----|`-----|`-----|`-----|`------
    // a.windowWithCount(2) : ---------[1,2]--[2,3]--[3,4]--[4,5]-->
    // ```
    //
    // ```js
    // var a = new kamo.Stream();
    // a.bufferWithCount(2).subscribe(function (message) {
    //   console.log(message);
    // });
    // a.publish(1);
    // a.publish(2);
    // a.publish(3);
    // a.publish(4);
    // a.publish(5);
    // ```
    //
    Constructor.prototype.windowWithCount = function (count) {
      return this.scan([], function (buffer, message) {
        return buffer.concat([message]).slice(-count);
      }).filter(function (buffer) {
        return buffer.length == count;
      });
    };

    // ### #throttle(Integer) -> Stream
    // Throttles its stream by given amount of milliseconds.
    //
    // ```
    // a                   : --1--1--1--1--1-->
    //                         |     |     |
    // a.throttle(integer) : --1-----1-----1-->
    // ```
    //
    // ```js
    // var a = kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).map(function () {
    //   return 1;
    // });
    // a.throttle(1500).subscribe(function (message) {
    //   console.log(message);
    // });
    // ```
    //
    Constructor.prototype.throttle = function (ms) {
      var throttledStream = new Constructor();
      var locked = false;
      this.subscribe(function (message) {
        if (!locked) {
          locked = true;
          throttledStream.publish(message);
          setTimeout(
            function () {
              locked = false;
            },
            ms
          );
        }
      });
      return throttledStream;
    };

    // ### #debounce(Integer) -> Stream
    // Like `throttle`, but so that event is only published after the given quiet period.
    //
    // ```
    // a                   : --1---1-------1--------->
    //                              `-----. `-----.
    // a.debounce(integer) : -------------1-------1-->
    // ```
    //
    // ```js
    // var a = kamo.Stream.fromEventHandlerFunction(window, 'setInterval', 1000).map(function () {
    //   return 1;
    // });
    // a.debounce(1500).subscribe(function (message) {
    //   console.log(message);
    // });
    // ```
    //
    Constructor.prototype.debounce = function (ms) {
      var timeoutId;
      return this.flatMapLatest(function (message) {
        var timer = { setTimeout: setTimeout };
        return Constructor.fromEventHandlerFunction(timer, 'setTimeout', ms).map(function () {
          return message;
        });
      });
    };

    return Constructor;
  })();

  if (typeof module == 'undefined') {
    global.kamo = kamo;
  } else {
    module.exports = kamo;
  }
})(this);
