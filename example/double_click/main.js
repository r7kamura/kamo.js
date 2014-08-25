(function () {
  var clickStream = kamo.Stream.fromEventHandlerSetter(window, 'onclick');
  clickStream.buffer(clickStream.debounce(250)).filter(function (buffer) {
    return buffer.length >= 2;
  }).subscribe(function () {
    alert('Conguratulation!');
  });
})();
