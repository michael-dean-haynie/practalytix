$(function($){ // on document ready
  startInput = $('#input-start-date-time');
  startDataInput = $('#utc-session-start-data');

  // do some things
  updateStartInput();

  // define some functions
  function updateStartInput(){
    d = new Date(startDataInput.val());
    var localStart = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    

    console.log(localStart);
    startInput.val(localStart);
  }
});
