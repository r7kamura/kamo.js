(function() {
  var codes = [
    38, // up
    38, // up
    40, // down
    40, // down
    37, // left
    39, // right
    37, // left
    39, // right
    66, // b
    65  // a
  ];

  kamo.Stream.fromEventHandlerSetter(window, 'onkeyup').map(function(value) {
    return value.keyCode;
  }).scan([], function(values, value) {
    values.push(value);
    return values.slice(-codes.length);
  }).filter(function(value) {
    return JSON.stringify(value) == JSON.stringify(codes);
  }).subscribe(function(value) {
    alert('Conguraturation!');
  });
})();
