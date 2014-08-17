(function() {
  // Stream is used as a namespace of this library.
  var Stream = {};

  // EventStream is a class object that represents an event stream.
  Stream.EventStream = (function () {
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

    // Creates a new EventStream by merging 2 EventStream.
    constructor.prototype.merge = function(anotherEventStream) {
      var mergedEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        mergedEventStream.publish(value);
      });
      anotherEventStream.subscribe(function(value) {
        mergedEventStream.publish(value);
      });
      return mergedEventStream;
    };

    // Creates a new EventStream as an accumulator from given seed and function.
    constructor.prototype.scan = function(seed, accumulator) {
      var accumulatorEventStream = new Stream.EventStream();
      var currentValue = seed;
      this.subscribe(function(value) {
        currentValue = accumulator(currentValue, value);
        accumulatorEventStream.publish(currentValue);
      });
      return accumulatorEventStream;
    };

    // Creates a new EventStream that filters values by given function.
    constructor.prototype.filter = function(filter) {
      var filteredEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        if (filter(value)) {
          filteredEventStream.publish(value);
        }
      });
      return filteredEventStream;
    };

    // Creates a new EventStream that publishes applicaiton results of given function.
    constructor.prototype.map = function(map) {
      var mapEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        mapEventStream.publish(map(value));
      });
      return mapEventStream;
    };

    // Creates a new EventStream that publishes the combination of the latest values.
    constructor.prototype.combine = function(anotherEventStream, combiner) {
      var combinedEventStream = new Stream.EventStream();
      var latestValueOfThis;
      var latestValueOfAnother;
      var hasAnyValueOfThis = false;
      var hasAnyValueOfAnother = false;
      this.subscribe(function(value) {
        latestValueOfThis = value;
        hasAnyValueOfThis = true;
        if (hasAnyValueOfAnother) {
          combinedEventStream.publish(combiner(latestValueOfThis, latestValueOfAnother));
        }
      });
      anotherEventStream.subscribe(function(value) {
        latestValueOfAnother = value;
        hasAnyValueOfAnother = true;
        if (hasAnyValueOfThis) {
          combinedEventStream.publish(combiner(latestValueOfThis, latestValueOfAnother));
        }
      });
      return combinedEventStream;
    };

    // Like `combine`, but only publishes values when any values are published from given EventStream.
    constructor.prototype.sampledBy = function(anotherEventStream, combiner) {
      var sampledEventStream = new Stream.EventStream();
      var latestValueOfThis;
      var hasAnyValueOfThis = false;
      this.subscribe(function(value) {
        latestValueOfThis = value;
        hasAnyValueOfThis = true;
      });
      anotherEventStream.subscribe(function(value) {
        if (hasAnyValueOfThis) {
          sampledEventStream.publish(combiner(latestValueOfThis, value));
        }
      });
      return sampledEventStream;
    };

    // Creates a new EventStream for each value in the soruce stream, using the given map.
    // The events from all created stream are merged into the result stream.
    constructor.prototype.flatMap = function(streamCreator) {
      var flattenEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        streamCreator(value).subscribe(function(valueOnEachEventStream) {
          flattenEventStream.publish(valueOnEachEventStream);
        });
      });
      return flattenEventStream;
    };

    // Like flatMap, create new streams for each source event.
    // Instead of merging all created streams, it switches between them so that
    // when a new stream is created, the earlierly created stream is no longer listened to.
    constructor.prototype.flatMapLatest = function(streamCreator) {
      var flattenEventStream = new Stream.EventStream();
      var latestStream;
      this.subscribe(function(value) {
        var currentStream = streamCreator(value);
        latestStream = currentStream;
        latestStream.subscribe(function(valueOnEachEventStream) {
          if (currentStream === latestStream) {
            flattenEventStream.publish(valueOnEachEventStream);
          }
        });
      });
      return flattenEventStream;
    };

    return constructor;
  })();

  if (typeof module == 'undefined') {
    window.Stream = Stream;
  } else {
    module.exports = Stream;
  }
})();
