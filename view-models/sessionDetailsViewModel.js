var BlockFormViewModel = require('./blockFormViewModel').model;

exports.model = function SessionDetailsViewModel(){
  this.blocks = [];
  this.dbModel = null;

  this.populateFromDBModel = function(model){
    if (model.blocks){
      this.blocks = model.blocks.map(function(x){
        var blockFormViewModel = new BlockFormViewModel();
        blockFormViewModel.populateFromDBModel(x);
        return blockFormViewModel;
      });
    }
    this.dbModel = model;
  }

  this.getPieChartData = function(){
    // get unique list of activities in this session
    var labels = this.dbModel.activityList;

    // get activities colors
    var backgroundColor = labels.map(l => this.blocks.filter(b => b.dbModel.activity.name == l)[0].dbModel.activity.color);

    // get sum of seconds for each activity
    var data = labels.map(l => this.blocks.filter(b => b.dbModel.activity.name == l).map(b => b.durationInSec).reduce((a,b) => a+b, 0));
    // convert to minutes to 2 decimal places
    var data = data.map(d => Math.round(100*(d/60))/100);

    var result = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColor
      }]
    }
    return JSON.stringify(result);
  }

  this.getActColors = function(){
    var blocks = this.blocks;
    var result = this.dbModel.activityList.map(function(a){
      var act = blocks.filter(b => b.dbModel.activity.name == a)[0].dbModel.activity;
      return {_id: act._id, color: act.color};
    })

    return JSON.stringify(result);
  }
}