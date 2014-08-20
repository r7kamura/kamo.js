var kamo = require('../src/kamo');
var assert = require('assert');

describe('kamo.Stream', function () {
  beforeEach(function () {
    this.stream = new kamo.Stream();
  });

  describe('.fromEventHandlerSetter', function () {
    it('creates a new Stream from an object and its setter', function (done) {
      var object = {};
      kamo.Stream.fromEventHandlerSetter(object, 'eventHandlerName').subscribe(function (message) {
        done();
      });
      object.eventHandlerName('message');
    });
  });

  describe('.fromEventHandlerFunction', function () {
    it('creates a new Stream from an object, its function name, and optional arguments', function (done) {
      var object = {
        eventHandlerName: function (publisher, argument1, argument2) {
          this.publisher = publisher;
          this.argument1 = 'argument1';
          this.argument2 = 'argument2';
        }
      };
      kamo.Stream.fromEventHandlerFunction(
        object,
        'eventHandlerName',
        'argument1',
        'argument2'
      ).subscribe(function (message) {
        assert.equal(message, 'message');
        done();
      });
      assert.equal(object.argument1, 'argument1');
      assert.equal(object.argument2, 'argument2');
      object.publisher('message');
    });
  });

  describe('#publish', function () {
    it('publishes a message to its subscribers in the order defined', function (done) {
      var index = 0;
      this.stream.subscribe(function (message) {
        assert.equal(index, 0);
        index++;
      });
      this.stream.subscribe(function (message) {
        assert.equal(index, 1);
        index++;
        done();
      });
      this.stream.publish('message');
    });
  });

  describe('#subscribe', function () {
    it('subscribes a callback called with the published message', function (done) {
      var publishedMessage = 'message';
      this.stream.subscribe(function (message) {
        assert.equal(message, publishedMessage);
        done();
      })
      this.stream.publish(publishedMessage);
    });
  });
});
