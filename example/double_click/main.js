(function () {
  var clickStream = kamo.Stream.fromEventHandlerSetter(window, 'onclick');
  var debouncedStream = clickStream.debounce(250);
  clickStream.buffer(debouncedStream).filter(function (buffer) {
    return buffer.length >= 2;
  }).subscribe(function () {
    alert('Confuratulation!');
  });
})();
