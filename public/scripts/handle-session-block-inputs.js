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
          <option label='Select Activity' value='none'"+(block.activity === "none" ? " selected='true'" : '')+"></option>\
      ";

      for(var ai = 0; ai < activityData.length; ai++){ // ai: activityData index
        var actId = activityData[ai]._id;
        var actLabel = activityData[ai].name;
        var actIsSelected = actId === block.activity;
        mkup = mkup + "<option label='"+actLabel+"' value='"+actId+"' "+(actIsSelected ? "selected='true'" : "")+"></option>";
      }

      mkup = mkup + "\
        </select>\
        <input type='number' id='ses-bk-min-"+bi+"' value='"+(block.durationInMin || 0)+"'></input>\
        <label>minutes</label>\
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
      // console.log(oldBlock);
      oldBlock.activity = $('#ses-bk-act-'+blockNo).val();
      oldBlock.durationInMin = parseInt($('#ses-bk-min-'+blockNo).val());
      // console.log(oldBlock);
      newData[blockNo] = oldBlock;
    });

    blocksDataInput.val(JSON.stringify(newData));
  }

  function addBlock(){
    // read data from hidden input
    var blocksData = JSON.parse(blocksDataInput.val());

    // add empty block
    blocksData.push({
      durationInMin: 15,
      activity: 'none',
    });

    // update the hidden input
    blocksDataInput.val(JSON.stringify(blocksData));

    // update the block inputs
    updateBlockInputs();

  }

});
