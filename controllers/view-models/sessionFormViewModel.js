var moment = require('moment-timezone');
var helpers = require('../../helpers');
var BlockFormViewModel = require('./blockFormViewModel').model;

exports.model = function SessionFormViewModel(){
  this.startDateTime = '';
  this.blocks = [];
  this.activityOptions = [];
  this.dbModel = null;

  this.populateFromDBModel = function(model){
    this.startDateTime = moment(model.start).tz(model.user.timezone).format('YYYY-MM-DD[T]HH:mm');
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