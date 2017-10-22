$(function($){ // on document ready

  // set some globals
  window.blocksDataInput = $('#session-blocks-hidden-data');
  window.activityDataInput = $('#activity-options-data');

  window.curAct = null; // current activity
  window.lastAct = null; // last activity / previous activity
  window.intervalHandle = null;

  // do some stuff
  bindActivityButtonHandlers();
  bindStopButtonHandler();

  // define some functions - bind handlers
  function bindActivityButtonHandlers(){
    $('.activity-button').on('click', function(){
      // read data from hidden input
      var blocksData = JSON.parse(blocksDataInput.val());
      var activityData = JSON.parse(activityDataInput.val());

      var pauseId = activityData.filter(x => x.name == 'Paused')[0]._id;
    
      // update buttons
      $('.activity-button').removeClass('btn-primary');
      $(this).addClass('btn-primary');

      // update curAct
      curAct = $(this).data('act-id');

      // update text
      var isPaused = $(this).data('act-id') == pauseId;
      $('#status-text').html('['+(isPaused ? 'Paused' : 'Recording')+']');
      $('#help-text').html(isPaused ? 'Resume recording by selecting an activity' : 'Switch activities by selecting a new one below');

      // show stop button
      $('#stop-button').removeClass('hidden');
      $('#pause-button').removeClass('hidden').data('act-id', pauseId);


      // check for session start
      if (null == lastAct){
        startSession();
      }
    });
  }

  function bindStopButtonHandler(){
    $('#stop-button').on('click', stopSession);
  }


  // define some more functions
  function startSession(){
    intervalHandle = setInterval(tick, 1000);
  }

  function stopSession(){
    clearInterval(intervalHandle);
    var theForm = $('form#live-session-form').submit();
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
    // console.log(blocksDataInput.val());

    // stop watch
    var pauseId = activityData.filter(x => x.name == 'Paused')[0]._id;
    var duration = blocksData.map(b => b.activity == pauseId ? 0 : b.durationInSec).reduce((a,b) => a + b); //sum not including paused time
    var displayVals = formatAsStopWatch(duration);

    $('#sw-hours').html(displayVals.h);
    $('#sw-minutes').html(displayVals.m);
    $('#sw-seconds').html(displayVals.s);

    // Activities 
    var theMarkup = '';
    for(var i = 0; i < blocksData.length; i++){
      var num = i+1;
      var name = activityData.filter(x => x._id == blocksData[i].activity)[0].name;
      var dur = formatAsStopWatch(blocksData[i].durationInSec);
      var durForm = dur.h+':'+dur.m+':'+dur.s;
      var theClass = (i+1) == blocksData.length ? 'success' : name == 'Paused' ? 'active' : '';

      theMarkup = theMarkup + '<tr class="'+theClass+'"><td>'+num+'</td><td>'+name+'</td><td>'+durForm+'</td></tr>';
    }

    $('#activities-log').html(theMarkup);

  }

  function formatAsStopWatch(duration){
    var hours = Math.floor(duration / 60 / 60);
    var mins = Math.floor(duration / 60) - (hours * 60);
    var secs = duration % 60;

    var hourDisplay = '00'.slice(hours.toString().length) + hours.toString();
    var minDisplay = '00'.slice(mins.toString().length) + mins.toString();
    var secDisplay = '00'.slice(secs.toString().length) + secs.toString();

    return {h: hourDisplay, m: minDisplay, s: secDisplay};
  }




});
