function updateBlockInputs(){
  var container = $('#session-blocks-input-container');
  var blocksDataInput = $('#session-blocks-hidden-data');
  var activityDataInput = $('#activity-options-data');

  // empty the block inputs container
  container.empty();

  // read data from hidden inputs
  var blocksData = JSON.parse(blocksDataInput.val());
  console.log(blocksData);
  var activityData = JSON.parse(activityDataInput.val());

  // build mkup
  for (var bi = 0; bi < blocksData.length; bi++){ // bi: blockData index
    var block = blocksData[bi];
    var mkup = "\
    <label for='ses-bk-act-" + bi + "'>Activity</label>\
    <select id='ses-bk-act-" + bi + "'>\
    ";

    for(var ai = 0; ai < activityData.length; ai++){ // ai: activityData index
      var actLabel = activityData[ai].name;
      var actIsSelected = activityData[ai]._id === blocksData[bi].activity;
      console.log(actIsSelected = activityData[ai]._id);
      console.log(blocksData[bi].activity);
      mkup = mkup + "<option label='" + actLabel + "' selected='" + (actIsSelected ? 'true' : 'false') + "'></option>";
    }

    var mkup = mkup + "\
    </select>\
    <input type='number' value='" + block.durationInMin || 0 + "'></input>\
    <span>minutes</span>\
    ";

    container.append(mkup);
  }


}