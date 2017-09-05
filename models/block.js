var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blockSchema = new Schema({
  start: {type: Date},
  end: {type: Date},
  session: {type: Schema.ObjectId, ref: 'Session', required: true},
  activity: {type: Schema.ObjectId, ref: 'Activity', required: true},
}, {collection: 'block'});

module.exports = mongoose.model('Block', blockSchema);