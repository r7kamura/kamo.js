var kamo = require('../src/kamo');
var assert = require('assert');

describe('kamo.Stream', function () {
  beforeEach(function () {
    this.stream = new kamo.Stream();
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
      this.stream.publish();
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
