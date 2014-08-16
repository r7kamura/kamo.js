(function() {
  // Stream is used as a namespace of this library.
  var Stream = {};

  // EventStream is a class object that represents an event stream.
  Stream.EventStream = (function () {
    var constructor = function() {
      this.subscriptions = [];
    };

    // Invoke all registered subscriptions with passing given event.
    constructor.prototype.publish = function(event) {
      for (var i = 0, length = this.subscriptions.length; i < length; i++) {
        this.subscriptions[i](event);
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
      this.subscribe(function(event) {
        mergedEventStream.publish(event);
      });
      anotherEventStream.subscribe(function(event) {
        mergedEventStream.publish(event);
      });
      return mergedEventStream;
    };

    // Create a new EventStream as an accumulator from given seed and callback.
    constructor.prototype.scan = function(seed, accumulator) {
      var eventStream = new Stream.EventStream();
      var currentValue = seed;
      this.subscribe(function(event) {
        currentValue = accumulator(currentValue, event);
        eventStream.publish(currentValue);
      });
      return eventStream;
    };

    return constructor;
  })();

  window.Stream = Stream;
})();
