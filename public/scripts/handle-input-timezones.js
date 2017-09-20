$(function($){ // on document ready
  startInput = $('#input-start-date-time');
  startDataInput = $('#session-start-data');

  // do some things
  updateStartInput();

  // define some functions
  function updateStartInput(){
    console.log(startDataInput.val())
    startInput.val(startDataInput.val());
  }
});