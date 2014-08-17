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

    // Create a new EventStream by merging 2 EventStream.
    // anotherEventStream must be a Stream.EventStream.
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

    // Create a new EventStream as an accumulator from given seed and callback.
    constructor.prototype.scan = function(seed, accumulator) {
      var accumulatorEventStream = new Stream.EventStream();
      var currentValue = seed;
      this.subscribe(function(value) {
        currentValue = accumulator(currentValue, value);
        accumulatorEventStream.publish(currentValue);
      });
      return accumulatorEventStream;
    };

    // filter must be a Function.
    constructor.prototype.filter = function(filter) {
      var filteredEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        if (filter(value)) {
          filteredEventStream.publish(value);
        }
      });
      return filteredEventStream;
    };

    // Create a new EventStream that publishes applicaiton results of given map function.
    // map must be a Function.
    constructor.prototype.map = function(map) {
      var mapEventStream = new Stream.EventStream();
      this.subscribe(function(value) {
        mapEventStream.publish(map(value));
      });
      return mapEventStream;
    };

    // Combines the latest values of 2 EventStreams.
    // anotherEventStream must be a EventStream.
    // combiner must be a Function that takes 2 arguments.
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

    // Like combine, but only outputs a new value on a new value to the anotherEventStream.
    // anotherEventStream must be a EventStream.
    // combiner must be a Function that takes 2 arguments.
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

    // Create a new EventStream for each value in the soruce stream, using the given map.
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

    return constructor;
  })();

  window.Stream = Stream;
})();
