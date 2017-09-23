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
  return {
    durationInMin: moment.duration(moment(this.end).diff(moment(this.start))).asMinutes(),
  };
});

// // hooks
// function populateSession(next){ this.populate('session'); next();}

// blockSchema.pre('find', populateSession);
// blockSchema.pre('findById', populateSession);


module.exports = mongoose.model('Block', blockSchema);