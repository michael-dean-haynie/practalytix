exports.model = function BlockFormViewModel(){
  this.dbModel = null;
  this.durationInMin = null;
  this.activity = null;

  this.populateFromDBModel = function(model){
    this.dbModel = model;
    this.durationInMin = model.time_details.durationInMin;
    this.activity = model.activity._id;
  }
}