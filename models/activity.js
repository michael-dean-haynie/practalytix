var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
  name: {type: String, required: true},
  description: {type: String},
  color: {type: String},
  /*manageable? for the pause activity*/
}, {collection: 'activity'});

module.exports = mongoose.model('Activity', activitySchema);