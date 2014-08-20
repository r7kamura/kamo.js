jQuery(function($) {
  kamo.Stream.fromEventHandlerFunction(
    $('#input'),
    'keyup'
  ).debounce(1000).map(function(event) {
    return event.target.message;
  }).filter(function(message) {
    return message.length >= 3;
  }).scan([], function(result, message) {
    return [result[1], message];
  }).filter(function(message) {
    return message[0] != message[1];
  }).map(function(message) {
    return message[1];
  }).flatMapLatest(function(message) {
    return kamo.Stream.fromEventHandlerFunction(
      $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
          action: 'opensearch',
          format: 'json',
          search: window.encodeURI(message)
        }
      }),
      'done'
    );
  }).subscribe(
    (function($candidates) {
      return function(data) {
        $candidates.empty();
        $.each(data[1], function(_, message) {
          $('<li>').append(document.createTextNode(message)).appendTo($candidates);
        });
      };
    })($('#candidates'))
  );
});
