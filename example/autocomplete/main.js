jQuery(function($) {
  var $candidates = $('#candidates');

  kamo.Stream.fromEventHandlerFunction(
    $('#input'),
    'keyup'
  ).debounce(1000).map(function(event) {
    return event.target.value;
  }).filter(function(value) {
    return value.length >= 3;
  }).scan([], function(result, value) {
    return [result[1], value];
  }).filter(function(value) {
    return value[0] != value[1];
  }).map(function(value) {
    return value[1];
  }).flatMapLatest(function(value) {
    return kamo.Stream.fromEventHandlerFunction(
      $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
          action: 'opensearch',
          format: 'json',
          search: window.encodeURI(value)
        }
      }),
      'done'
    );
  }).subscribe(function(data) {
    $candidates.empty();
    $.each(data[1], function(_, value) {
      $('<li>' + value + '</li>').appendTo(candidates);
    });
  });
});
