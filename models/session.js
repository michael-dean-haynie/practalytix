var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../helpers');
var moment = helpers.momentConfig(require('moment'));

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

sessionSchema.virtual('url').get(function(){
  return '/sessions/' + this._id;
});

sessionSchema.virtual('activity_list').get(function(){
  return this.blocks.map(x => x.activity.name)
    // remove "Paused"
    .filter(x => x != "Paused")
    // remove duplicates (also sorts but whatevs)
    .sort()
    .filter(function(item, pos, array){
      return !pos || item != array[pos - 1];
    });
});

sessionSchema.virtual('time_details').get(function(){
  moment.relativeTimeRounding(x => x); // remove rounding
  return {
    startDateFormatted: moment(this.start).format('dddd, MMMM Do YYYY'),
    timeSpan: moment(this.start).format('h:mm a') + ' - ' + moment(this.end).format('h:mm a'),
    duration: moment.duration(moment(this.end).diff(moment(this.start))).humanize(),
    startFormattedForInput: helpers.formatDateForInput(this.start),
  };
});

module.exports = mongoose.model('Session', sessionSchema);