(function() {
  // kamo is a namespace for this library.
  var kamo = {};

  // Stream is a class object that represents an event stream.
  kamo.Stream = (function () {
    var constructor = function() {
      this.subscriptions = [];
    };

    // Invoke all registered subscriptions with passing given value.
    constructor.prototype.publish = function(value) {
      for (var i = 0, length = this.subscriptions.length; i < length; i++) {
        this.subscriptions[i](value);
      }
    };

    // Register a given callback function that will be called on each publish value.
    // subscription must be a Function.
    constructor.prototype.subscribe = function(subscription) {
      this.subscriptions.push(subscription);
    };

    // Creates a new Stream by merging 2 Stream.
    constructor.prototype.merge = function(anotherStream) {
      var mergedStream = new kamo.Stream();
      this.subscribe(function(value) {
        mergedStream.publish(value);
      });
      anotherStream.subscribe(function(value) {
        mergedStream.publish(value);
      });
      return mergedStream;
    };

    // Creates a new Stream as an accumulator from given seed and function.
    constructor.prototype.scan = function(seed, accumulator) {
      var accumulatorStream = new kamo.Stream();
      var currentValue = seed;
      this.subscribe(function(value) {
        currentValue = accumulator(currentValue, value);
        accumulatorStream.publish(currentValue);
      });
      return accumulatorStream;
    };

    // Creates a new Stream that filters values by given function.
    constructor.prototype.filter = function(filter) {
      var filteredStream = new kamo.Stream();
      this.subscribe(function(value) {
        if (filter(value)) {
          filteredStream.publish(value);
        }
      });
      return filteredStream;
    };

    // Creates a new Stream that publishes applicaiton results of given function.
    constructor.prototype.map = function(map) {
      var mapStream = new kamo.Stream();
      this.subscribe(function(value) {
        mapStream.publish(map(value));
      });
      return mapStream;
    };

    // Creates a new Stream that publishes the combination of the latest values.
    constructor.prototype.combine = function(anotherStream, combiner) {
      var combinedStream = new kamo.Stream();
      var latestValueOfThis;
      var latestValueOfAnother;
      var hasAnyValueOfThis = false;
      var hasAnyValueOfAnother = false;
      this.subscribe(function(value) {
        latestValueOfThis = value;
        hasAnyValueOfThis = true;
        if (hasAnyValueOfAnother) {
          combinedStream.publish(combiner(latestValueOfThis, latestValueOfAnother));
        }
      });
      anotherStream.subscribe(function(value) {
        latestValueOfAnother = value;
        hasAnyValueOfAnother = true;
        if (hasAnyValueOfThis) {
          combinedStream.publish(combiner(latestValueOfThis, latestValueOfAnother));
        }
      });
      return combinedStream;
    };

    // Like `combine`, but only publishes values when any values are published from given Stream.
    constructor.prototype.sampledBy = function(anotherStream, combiner) {
      var sampledStream = new kamo.Stream();
      var latestValueOfThis;
      var hasAnyValueOfThis = false;
      this.subscribe(function(value) {
        latestValueOfThis = value;
        hasAnyValueOfThis = true;
      });
      anotherStream.subscribe(function(value) {
        if (hasAnyValueOfThis) {
          sampledStream.publish(combiner(latestValueOfThis, value));
        }
      });
      return sampledStream;
    };

    // Creates a new Stream for each value in the soruce stream, using the given map.
    // The events from all created stream are merged into the result stream.
    constructor.prototype.flatMap = function(streamCreator) {
      var flattenStream = new kamo.Stream();
      this.subscribe(function(value) {
        streamCreator(value).subscribe(function(valueOnEachStream) {
          flattenStream.publish(valueOnEachStream);
        });
      });
      return flattenStream;
    };

    // Like flatMap, create new streams for each source event.
    // Instead of merging all created streams, it switches between them so that
    // when a new stream is created, the earlierly created stream is no longer listened to.
    constructor.prototype.flatMapLatest = function(streamCreator) {
      var flattenStream = new kamo.Stream();
      var latestStream;
      this.subscribe(function(value) {
        var currentStream = streamCreator(value);
        latestStream = currentStream;
        latestStream.subscribe(function(valueOnEachStream) {
          if (currentStream === latestStream) {
            flattenStream.publish(valueOnEachStream);
          }
        });
      });
      return flattenStream;
    };

    return constructor;
  })();

  if (typeof module == 'undefined') {
    window.kamo = kamo;
  } else {
    module.exports = kamo;
  }
})();
