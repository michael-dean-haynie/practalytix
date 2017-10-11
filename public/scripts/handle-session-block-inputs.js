$(function($){ // on document ready

  // set some globals
  var container = $('#session-blocks-input-container');
  var blocksDataInput = $('#session-blocks-hidden-data');
  var activityDataInput = $('#activity-options-data');

  // do some stuff
  updateBlockInputs();

  // define some functions
  function bindEventHandlers(){
    $('.ses-bk input, .ses-bk select').on('change', updateBlockData);
    $('#add-bk-btn').on('click', addBlock);
    $('.remove-bk-btn').on('click', function(){removeBlock($(this).data('bk-idx'))});
    $('.move-bk-up-btn').on('click', function(){moveBlock('up', $(this).data('bk-idx'))});
    $('.move-bk-down-btn').on('click', function(){moveBlock('down', $(this).data('bk-idx'))});
  }

  function updateBlockInputs(){
    // empty the block inputs container
    container.empty();

    // read data from hidden inputs
    var blocksData = JSON.parse(blocksDataInput.val());
    var activityData = JSON.parse(activityDataInput.val());

    // build mkup
    var mkup = '';
    for (var bi = 0; bi < blocksData.length; bi++){ // bi: blockData index
      var block = blocksData[bi];
      mkup = mkup + "\
      <div id='ses-bk-"+bi+"' class='ses-bk' data-ses-bk-no='"+bi+"'>\
        <label for='ses-bk-act-"+bi+"'>Activity</label>\
        <select id='ses-bk-act-"+bi+"'>\
          <!-- <option label='Select Activity' value='none'"+(block.activity === "none" ? " selected='true'" : '')+"></option> -->\
      ";

      for(var ai = 0; ai < activityData.length; ai++){ // ai: activityData index
        var actId = activityData[ai]._id;
        var actLabel = activityData[ai].name;
        var actIsSelected = actId === block.activity;
        mkup = mkup + "<option label='"+actLabel+"' value='"+actId+"' "+(actIsSelected ? "selected='true'" : "")+"></option>";
      }

      mkup = mkup + "\
        </select>\
        <label>min:</label>\
        <input type='number' min='0' id='ses-bk-min-"+bi+"' value='"+(block.durationInMin || 0)+"'></input>\
        <label>sec:</label>\
        <input type='number' min='0' max='59' id='ses-bk-sec-"+bi+"' value='"+((block.durationInSec % 60) || 0)+"'></input>\
        <button type='button' class='move-bk-up-btn' data-bk-idx='"+bi+"'>up</button>\
        <button type='button' class='move-bk-down-btn' data-bk-idx='"+bi+"'>down</button>\
        <button type='button' class='remove-bk-btn' data-bk-idx='"+bi+"'>remove</button>\
      </div>\
      ";
    }

    mkup = mkup + "\
      <div>\
        <button id='add-bk-btn' type='button'>Add Block</button>\
      </div>\
    ";

    // insert mkup
    container.append(mkup);

    // bind event handlers to modified DOM
    bindEventHandlers();
  }

  function updateBlockData(){
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());

    var newData = [];
    $('.ses-bk').each(function(){
      // console.log('HERE');
      var blockNo = $(this).data('ses-bk-no');
      var oldBlock = blocksData[blockNo] || {};
      oldBlock.activity = $('#ses-bk-act-'+blockNo).val();
      oldBlock.durationInMin = parseInt($('#ses-bk-min-'+blockNo).val());
      oldBlock.durationInSec = (oldBlock.durationInMin*60) + parseInt($('#ses-bk-sec-'+blockNo).val());
      newData[blockNo] = oldBlock;
    });

    blocksDataInput.val(JSON.stringify(newData));
  }

  function addBlock(){
    // read data from hidden inputs
    var blocksData = JSON.parse(blocksDataInput.val());
    var activityData = JSON.parse(activityDataInput.val());

    // add new block
    blocksData.push({
      durationInMin: 15,
      durationInSec: 15*60,
      // activity: 'none',
      activity: activityData[0]._id,
    });

    // update the hidden input
    blocksDataInput.val(JSON.stringify(blocksData));

    // update the block inputs
    updateBlockInputs();
  }

  function removeBlock(index){
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());
    var newData = [];

    for(var i = 0; i < blocksData.length; i++){
      if (i == index) continue;
      newData.push(blocksData[i]);
    }

    // update the hidden input
    blocksDataInput.val(JSON.stringify(newData));

    // update the block inputs
    updateBlockInputs();    
  }

  function moveBlock(dir, index){
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());
    var newData = [];

    if((dir == 'up' && index == 0) || (dir == 'down' && index == (blocksData.length-1))) return;

    for(var i = 0; i < blocksData.length; i++){
      var indexToPush = i;
      if (dir == 'up'){
        if (i == index - 1) indexToPush = index;
        if (i == index)     indexToPush = (index - 1);
      }
      else if (dir == 'down'){
        if (i == index)     indexToPush = (index + 1);
        if (i == index + 1) indexToPush = index;
      }
      newData.push(blocksData[indexToPush]);
    }

    // update the hidden input
    blocksDataInput.val(JSON.stringify(newData));

    // update the block inputs
    updateBlockInputs();   
  }



});
