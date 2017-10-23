var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../helpers');
var moment = helpers.momentConfig(require('moment-timezone'));

var Activity = require('./activity');

var blockSchema = new Schema({
  start: {type: Date},
  end: {type: Date},
  session: {type: Schema.ObjectId, ref: 'Session', required: true},
  activity: {type: Schema.ObjectId, ref: 'Activity', required: true},
}, {collection: 'block'});

blockSchema.methods.timeSpan = function(timezone){
	return moment(this.start).tz('utc').format('h:mm a') + ' - ' + moment(this.end).tz('utc').format('h:mm a');
};

blockSchema.virtual('timeDetails').get(function(){
  var durInSec = moment.duration(moment(this.end).diff(moment(this.start))).asSeconds();
  return {
    durationInMin: moment.duration(moment(this.end).diff(moment(this.start))).asMinutes(),
    durationInSec: durInSec,
    swDur: helpers.formatAsStopWatch(durInSec),
  };
});

module.exports = mongoose.model('Block', blockSchema);