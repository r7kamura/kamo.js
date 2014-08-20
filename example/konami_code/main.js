(function () {
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

  kamo.Stream.fromEventHandlerSetter(window, 'onkeyup').map(function (message) {
    return message.keyCode;
  }).windowWithCount(codes.length).filter(function (message) {
    console.log(message);
    return JSON.stringify(message) == JSON.stringify(codes);
  }).subscribe(function (message) {
    alert('Conguraturation!');
  });
})();
