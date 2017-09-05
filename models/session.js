var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User', required: true},
  start: {type: Date},
  end: {type: Date},
}, {collection: 'session'});

module.exports = mongoose.model('Session', sessionSchema);