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
