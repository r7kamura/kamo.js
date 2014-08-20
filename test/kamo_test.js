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
});
