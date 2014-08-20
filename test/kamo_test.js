var kamo = require('../src/kamo');
var assert = require('assert');
var sinon = require('sinon');

describe('kamo.Stream', function () {
  describe('.fromEventHandlerSetter', function () {
    it('creates a new Stream from an object and its setter', function () {
      var spy = sinon.spy();
      var object = {};
      kamo.Stream.fromEventHandlerSetter(object, 'onClick').subscribe(spy);
      object.onClick();
      assert.deepEqual(spy.args, [[undefined]]);
    });
  });

  describe('.fromEventHandlerFunction', function () {
    it('creates a new Stream from an object, its function name, and optional arguments', function () {
      var spy = sinon.spy();
      var object = {
        onClick: function (click, argument1, argument2) {
          this.click = click;
          this.argument1 = 'argument1';
          this.argument2 = 'argument2';
        }
      };
      kamo.Stream.fromEventHandlerFunction(
        object,
        'onClick',
        'argument1',
        'argument2'
      ).subscribe(spy);
      object.click();
      assert.deepEqual(spy.args, [[undefined]]);
    });
  });

  describe('#publish', function () {
    it('publishes a message to its subscribers', function () {
      var spy = sinon.spy();
      new kamo.Stream().subscribe(spy).subscribe(spy).publish();
      assert.deepEqual(spy.args, [[undefined], [undefined]]);
    });

    it('returns itself for method chain', function () {
      var stream = new kamo.Stream();
      assert.equal(stream.publish(), stream);
    });
  });

  describe('#subscribe', function () {
    it('subscribes a callback called with the published message', function () {
      var spy = sinon.spy();
      var message = 'message';
      new kamo.Stream().subscribe(spy).publish(message);
      assert(spy.calledWith(message));
      assert.deepEqual(spy.args, [['message']]);
    });

    it('returns itself for method chain', function () {
      var stream = new kamo.Stream();
      assert.equal(stream.subscribe(function() {}), stream);
    });
  });

  describe('#merge', function () {
    it('creates a new Stream by merging 2 Stream', function () {
      var spy = sinon.spy();
      var a = new kamo.Stream();
      var b = new kamo.Stream();
      a.merge(b).subscribe(spy);
      a.publish();
      b.publish();
      assert.deepEqual(spy.args, [[undefined], [undefined]]);
    });
  });

  describe('#scan', function () {
    it('creates a new Stream as an accumulator from given seed and function', function () {
      var spy = sinon.spy();
      var stream = new kamo.Stream();
      stream.scan(0, function (currentMessage, newMessage) {
        return currentMessage + newMessage;
      }).subscribe(spy);
      stream.publish(1).publish(2).publish(3);
      assert.equal(spy.args[0], 1);
      assert.equal(spy.args[1], 3);
      assert.equal(spy.args[2], 6);
      assert.deepEqual(spy.args, [[1], [3], [6]]);
    });
  });

  describe('#filter', function () {
    it('creates a new Stream that filters messages by given function', function () {
      var spy = sinon.spy();
      var stream = new kamo.Stream();
      stream.filter(function (message) {
        return message % 2 == 1;
      }).subscribe(spy);
      stream.publish(1);
      stream.publish(2);
      stream.publish(3);
      assert(spy.calledTwice);
      assert.equal(spy.args[0], 1);
      assert.equal(spy.args[1], 3);
      assert.deepEqual(spy.args, [[1], [3]]);
    });
  });

  describe('#map', function () {
    it('creates a new Stream that publishes application results of given function', function () {
      var spy = sinon.spy();
      var stream = new kamo.Stream();
      stream.map(function (message) {
        return message * 2;
      }).subscribe(spy);
      stream.publish(1);
      stream.publish(2);
      stream.publish(3);
      assert.deepEqual(spy.args, [[2], [4], [6]]);
    });
  });

  describe('#combine', function () {
    it('Creates a new Stream that publishes the combination of the latest messages', function () {
      var spy = sinon.spy();
      var a = new kamo.Stream();
      var b = new kamo.Stream();
      a.combine(b, function(aValue, bValue) {
        return aValue + bValue;
      }).subscribe(spy);
      a.publish(1);
      b.publish(2);
      a.publish(3);
      b.publish(4);
      assert.deepEqual(spy.args, [[3], [5], [7]]);
    });
  });

  describe('#sampledBy', function () {
    it('Creates a new Stream that only publishes the combination of the latest messages for the given stream', function () {
      var spy = sinon.spy();
      var a = new kamo.Stream();
      var b = new kamo.Stream();
      a.sampledBy(b, function(aValue, bValue) {
        return aValue + bValue;
      }).subscribe(spy);
      a.publish(1);
      b.publish(2);
      a.publish(3);
      b.publish(4);
      assert.deepEqual(spy.args, [[3], [7]]);
    });
  });
});
