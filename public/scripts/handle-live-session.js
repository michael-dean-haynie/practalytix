$(function($){ // on document ready

  // set some globals
  window.blocksDataInput = $('#session-blocks-hidden-data');
  window.activityDataInput = $('#activity-options-data');

  window.curAct = null; // current activity
  window.lastAct = null; // last activity / previous activity
  window.intervalHandle = null;

  // do some stuff
  bindActivityButtonHandlers();

  // define some functions
  function startSession(){
    intervalHandle = setInterval(tick, 1000);
  }

  function stopSession(){
    clearInterval(intervalHandle);
  }

  function tick(){ // runs every second. Adds the just passed second to last block or new block it creates.
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());
    var activityData = JSON.parse(activityDataInput.val());

    // allocate the last second spent
    if (curAct != lastAct){ // new block
      blocksData.push({
        durationInSec: 1,
        activity: curAct,
      });
    }
    else { // increment duration of last block
      blocksData[blocksData.length-1].durationInSec++
    }

    // update lastAct
    lastAct = curAct;

    // update the hidden input
    blocksDataInput.val(JSON.stringify(blocksData));

    // update page
    updatePage()
  }

  function updatePage(){
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());
    var activityData = JSON.parse(activityDataInput.val());

    // console
    console.log(blocksDataInput.val());

    // stop watch
    var pauseId = activityData.filter(x => x.name == 'Paused')[0]._id;
    var duration = blocksData.map(b => b.activity == pauseId ? 0 : b.durationInSec).reduce((a,b) => a + b); //sum not including paused time
    
    var hours = Math.floor(duration / 60 / 60);
    var mins = Math.floor(duration / 60) - (hours * 60);
    var secs = duration % 60;

    var hourDisplay = '00'.slice(hours.toString().length) + hours.toString();
    var minDisplay = '00'.slice(mins.toString().length) + mins.toString();
    var secDisplay = '00'.slice(secs.toString().length) + secs.toString();

    $('#sw-hours').html(hourDisplay);
    $('#sw-minutes').html(minDisplay);
    $('#sw-seconds').html(secDisplay);
  }

  function bindActivityButtonHandlers(){
    $('.activity-button').on('click', function(){
      // update buttons
      $('.activity-button').removeClass('btn-primary');
      $(this).addClass('btn-primary');

      // update curAct
      curAct = $(this).data('act-id');

      // check for session start
      if (null == lastAct){
        startSession();
      }

      // 
    });
  }




});
