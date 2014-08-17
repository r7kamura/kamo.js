(function() {
  // Stream is used as a namespace of this library.
  var Stream = {};

  // EventStream is a class object that represents an event stream.
  Stream.EventStream = (function () {
    var constructor = function() {
      this.subscriptions = [];
    };

    // Invoke all registered subscriptions with passing given event.
    constructor.prototype.publish = function(value) {
      for (var i = 0, length = this.subscriptions.length; i < length; i++) {
        this.subscriptions[i](value);
      }
    };

    // Register a given callback function that will be called on each publish event.
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

    return constructor;
  })();

  window.Stream = Stream;
})();
