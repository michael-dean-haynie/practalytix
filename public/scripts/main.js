window.helpers = {
  colorActSquares: function(activities){
    $('.act-color-square').each(function(){
      var activity = $(this).data('act');
      if (activities.map(a => a._id).includes(activity)){
        var color = activities.filter(a => a._id == activity)[0].color;
        $(this).css('background-color', color);
      }
    });
  }
}

$(function($){ // on document ready 
  $(".flatpickr").each(function(){
    var iv = $(this).data('init-val');
    var defaultDate = (iv == 'now' ? Date.now() : iv);

    $(this).flatpickr({
      enableTime: true,
      altInput: true,
      defaultDate: defaultDate,
    });
  });
});
