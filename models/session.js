var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../helpers');
var moment = helpers.momentConfig(require('moment-timezone'));

var Block = require('./block');
var User = require('./user');

var sessionSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User', required: true},
  start: {type: Date},
  end: {type: Date},
}, {collection: 'session'});

// virtual fields
sessionSchema.virtual('blocks', {
  ref: 'Block',
  localField: '_id',
  foreignField: 'session',
});

sessionSchema.virtual('urlDetails').get(function(){ return '/sessions/' + this._id; });
sessionSchema.virtual('urlEdit').get(function(){ return '/sessions/edit/' + this._id });
sessionSchema.virtual('urlDelete').get(function(){ return '/sessions/delete/' + this._id });

sessionSchema.virtual('activityList').get(function(){
  return this.blocks.map(x => x.activity.name)
    // remove "Paused"
    .filter(x => x != "Paused")
    // remove duplicates (also sorts but whatevs)
    .sort()
    .filter(function(item, pos, array){
      return !pos || item != array[pos - 1];
    });
});

sessionSchema.virtual('timeDetails').get(function(){
  moment.relativeTimeRounding(x => x); // remove rounding
  var durInSec = moment.duration(moment(this.end).diff(moment(this.start))).asSeconds();
  return {
    startDateFormatted: moment(this.start).tz('utc').format('dddd, MMMM Do YYYY'),
    timeSpan: moment(this.start).tz(this.user.timezone).format('h:mm a') + ' - ' + moment(this.end).tz(this.user.timezone).format('h:mm a'),
    // durationInMin: moment.duration(moment(this.end).diff(moment(this.start))).asMinutes(),
    durationInSec: durInSec,
    swDur: helpers.formatAsStopWatch(durInSec),

  };
});

module.exports = mongoose.model('Session', sessionSchema);