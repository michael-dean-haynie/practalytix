var helpers = require('../../helpers');
var BlockFormViewModel = require('./blockFormViewModel').model;

exports.model = function SessionFormViewModel(){
  this.date = '';
  this.blocks = [];
  this.activityOptions = [];
  this.dbModel = null;

  this.populateFromDBModel = function(model){
    this.date = helpers.formatDateForInput(model.start || Date.now());
    this.blocks = model.blocks.map(function(x){
      var blockFormViewModel = new BlockFormViewModel();
      blockFormViewModel.populateFromDBModel(x);
      return blockFormViewModel;
    });
    this.dbModel = model;
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