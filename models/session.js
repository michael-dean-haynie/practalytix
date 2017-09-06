var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Block = require('./block');

var sessionSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User', required: true},
  start: {type: Date},
  end: {type: Date},
}, {collection: 'session'});

sessionSchema.virtual('blocks', {
  ref: 'Block',
  localField: '_id',
  foreignField: 'session',
});

module.exports = mongoose.model('Session', sessionSchema);