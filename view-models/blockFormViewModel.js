exports.model = function BlockFormViewModel(){
  this.dbModel = null;
  this.durationInMin = null;
  this.durationInSec = null;  
  this.activity = null;

  this.populateFromDBModel = function(model){
  
    this.dbModel = model;
    this.durationInMin = model.timeDetails.durationInMin;
    this.durationInSec = model.timeDetails.durationInSec;
    this.activity = model.activity._id;
  }
}
