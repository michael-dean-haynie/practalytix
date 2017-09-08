var helpers = require('../../helpers');

exports.model = function SessionFormViewModel(){
  this.date = '';
  this.blocks = [];
  this.activityOptions = [];

  this.populateFromDBModel = function(model){
    this.date = helpers.formatDateForInput(model.start || Date.now());
    this.blocks = model.blocks || [];
  }

  this.populateActivityOptions = function(opt){
    this.activityOptions = opt;
  }

  this.getActivityOptionsJSON = function(){
    return JSON.stringify(this.activityOptions);
  }

  this.getBlocksJSON = function(){
    return JSON.stringify(this.blocks);
  }
}