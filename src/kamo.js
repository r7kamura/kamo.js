(function (global) {
  // kamo is a namespace for this library.
  var kamo = {};

  // Stream is a class object that represents an event stream.
  kamo.Stream = (function () {
    var constructor = function () {
      this.subscriptions = [];
    };

    // Creates a new Stream from an event handler property of given object.
    constructor.fromEventHandlerSetter = function (object, propertyName) {
      var stream = new constructor();
      object[propertyName] = function (event) {
        stream.publish(event);
      };
      return stream;
    };

    // Creates a new Stream from an event handler function of given object.
    constructor.fromEventHandlerFunction = function (object, functionName) {
      var args = Array.prototype.slice.call(arguments, 2);
      var stream = new constructor();
      args.unshift(function (event) {
        stream.publish(event);
      });
      object[functionName].apply(object, args);
      return stream;
    };

    // Invokes all registered subscriptions with passing given message.
    constructor.prototype.publish = function (message) {
      for (var i = 0, length = this.subscriptions.length; i < length; i++) {
        this.subscriptions[i](message);
      }
      return this;
    };

    // Registers a given callback function that will be called on each publish message.
    // subscription must be a Function.
    constructor.prototype.subscribe = function (subscription) {
      this.subscriptions.push(subscription);
      return this;
    };

    // Creates a new Stream by merging 2 Stream.
    constructor.prototype.merge = function (anotherStream) {
      var mergedStream = new constructor();
      this.subscribe(function (message) {
        mergedStream.publish(message);
      });
      anotherStream.subscribe(function (message) {
        mergedStream.publish(message);
      });
      return mergedStream;
    };

    // Creates a new Stream as an accumulator from given seed and function.
    constructor.prototype.scan = function (seed, accumulator) {
      var accumulatorStream = new constructor();
      var currentMessage = seed;
      this.subscribe(function (message) {
        currentMessage = accumulator(currentMessage, message);
        accumulatorStream.publish(currentMessage);
      });
      return accumulatorStream;
    };

    // Creates a new Stream that filters messages by given function.
    constructor.prototype.filter = function (filter) {
      var filteredStream = new constructor();
      this.subscribe(function (message) {
        if (filter(message)) {
          filteredStream.publish(message);
        }
      });
      return filteredStream;
    };

    // Creates a new Stream that publishes applicaiton results of given function.
    constructor.prototype.map = function (map) {
      var mapStream = new constructor();
      this.subscribe(function (message) {
        mapStream.publish(map(message));
      });
      return mapStream;
    };

    // Creates a new Stream that publishes the combination of the latest messages.
    constructor.prototype.combine = function (anotherStream, combiner) {
      var combinedStream = new constructor();
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

    // Like `combine`, but only publishes messages when any messages are published from given Stream.
    constructor.prototype.sampledBy = function (anotherStream, combiner) {
      var sampledStream = new constructor();
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

    // Creates a new Stream for each message in the soruce stream, using the given map.
    // The events from all created stream are merged into the result stream.
    constructor.prototype.flatMap = function (streamCreator) {
      var flattenStream = new constructor();
      this.subscribe(function (message) {
        streamCreator(message).subscribe(function (messageOnEachStream) {
          flattenStream.publish(messageOnEachStream);
        });
      });
      return flattenStream;
    };

    // Like `flatMap`, create new streams for each source event.
    // Instead of merging all created streams, it switches between them so that
    // when a new stream is created, the earlierly created stream is no longer listened to.
    constructor.prototype.flatMapLatest = function (streamCreator) {
      var flattenStream = new constructor();
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

    // Throttles its stream by given amount of milliseconds.
    constructor.prototype.throttle = function (ms) {
      var throttledStream = new constructor();
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

    // Like `throttle`, but so that event is only published after the given quoted period.
    constructor.prototype.debounce = function (ms) {
      var timeoutId;
      return this.flatMapLatest(function (message) {
        var timer = { setTimeout: setTimeout };
        return constructor.fromEventHandlerFunction(timer, 'setTimeout', ms).map(function () {
          return message;
        });
      });
    };

    return constructor;
  })();

  if (typeof module == 'undefined') {
    global.kamo = kamo;
  } else {
    module.exports = kamo;
  }
})(this);
