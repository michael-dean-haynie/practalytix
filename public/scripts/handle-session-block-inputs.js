$(function($){ // on document ready

  // set some globals
  var container = $('#session-blocks-input-container');
  var blocksDataInput = $('#session-blocks-hidden-data');
  var activityDataInput = $('#activity-options-data');

  // do some stuff
  updateBlockInputs();
  $('#add-bk-btn').on('click', addBlock);

  // define some functions
  function bindEventHandlers(){
    $('.ses-bk input, .ses-bk select').on('change', updateBlockData);
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
      <tr id='ses-bk-"+bi+"' class='ses-bk' data-ses-bk-no='"+bi+"'>\
        <td>"+(bi+1)+"</td>\
        <td>\
          <select id='ses-bk-act-"+bi+"'>\
            <!-- <option label='Select Activity' value='none'"+(block.activity === "none" ? " selected='true'" : '')+"></option> -->\
      ";

      for(var ai = 0; ai < activityData.length; ai++){ // ai: activityData index
        var actId = activityData[ai]._id;
        var actLabel = activityData[ai].name;
        var actIsSelected = actId === block.activity;
        mkup = mkup + "<option value='"+actId+"' "+(actIsSelected ? "selected='true'" : "")+">"+actLabel+"</option>";
      }

      mkup = mkup + "\
          </select>\
        </td>\
        <td>\
          <input type='number' min='0' max='9999' id='ses-bk-min-"+bi+"' class='small-input' value='"+(Math.floor(block.durationInSec / 60) || 0)+"' required></input>\
        </td>\
        <td>:</td>\
        <td>\
          <input type='number' min='0' max='59' id='ses-bk-sec-"+bi+"' class='small-input' value='"+((block.durationInSec % 60) || 0)+"' required></input>\
        </td>\
        <td class='button-list'>\
          <button type='button' class='move-bk-up-btn btn btn-sm btn-default' data-bk-idx='"+bi+"'>\
            <span class='glyphicon glyphicon-chevron-up'></span>\
          </button>\
          <button type='button' class='move-bk-down-btn btn btn-sm btn-default' data-bk-idx='"+bi+"'>\
            <span class='glyphicon glyphicon-chevron-down'></span>\
          </button>\
          <button type='button' class='remove-bk-btn btn btn-sm btn-warning' data-bk-idx='"+bi+"'>\
            <span class='glyphicon glyphicon-remove'></span>\
          </button>\
        </td>\
      </tr>\
      ";
    }

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
      var blockNo = $(this).data('ses-bk-no');
      var oldBlock = blocksData[blockNo] || {};
      oldBlock.activity = $('#ses-bk-act-'+blockNo).val();
      // oldBlock.durationInMin = parseInt($('#ses-bk-min-'+blockNo).val());
      oldBlock.durationInSec = (parseInt($('#ses-bk-min-'+blockNo).val())*60) + parseInt($('#ses-bk-sec-'+blockNo).val());
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
