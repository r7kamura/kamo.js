var kamo = require('../src/kamo');
var assert = require('assert');
var sinon = require('sinon');

describe('kamo.Stream', function () {
  describe('.fromEventHandlerSetter', function () {
    it('creates a new Stream from an object and its setter', function () {
      var spy = sinon.spy();
      var object = {};
      kamo.Stream.fromEventHandlerSetter(object, 'onKeyup').subscribe(spy);
      object.onKeyup('dummy key event');
      assert(spy.called);
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
      assert(spy.called);
    });
  });

  describe('#publish', function () {
    it('publishes a message to its subscribers', function () {
      var spy = sinon.spy();
      new kamo.Stream().subscribe(spy).subscribe(spy).publish();
      assert(spy.calledTwice);
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
    });

    it('returns itself for method chain', function () {
      var stream = new kamo.Stream();
      assert.equal(stream.subscribe(function() {}), stream);
    });
  });

  describe('#merge', function () {
    it('creates a new Stream by merging 2 Stream', function () {
      var spy = sinon.spy();
      var stream = new kamo.Stream();
      var anotherStream = new kamo.Stream();
      stream.merge(anotherStream).subscribe(spy);
      stream.publish();
      anotherStream.publish();
      assert(spy.calledTwice);
    });
  });

  describe('#scan', function () {
    it('creates a new Stream as an accumulator from given seed and function', function () {
      var spy = sinon.spy();
      var stream = new kamo.Stream();
      stream.scan(0, function (currentValue, newValue) {
        return currentValue + newValue;
      }).subscribe(spy);
      stream.publish(1).publish(2).publish(3);
      assert.equal(spy.args[0], 1);
      assert.equal(spy.args[1], 3);
      assert.equal(spy.args[2], 6);
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
      assert.equal(spy.args[0], 2);
      assert.equal(spy.args[1], 4);
      assert.equal(spy.args[2], 6);
    });
  });
});
