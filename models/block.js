var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../helpers');
var moment = helpers.momentConfig(require('moment'));

var Activity = require('./activity');

var blockSchema = new Schema({
  start: {type: Date},
  end: {type: Date},
  session: {type: Schema.ObjectId, ref: 'Session', required: true},
  activity: {type: Schema.ObjectId, ref: 'Activity', required: true},
}, {collection: 'block'});

blockSchema.virtual('time_details').get(function(){
  return {
    timeSpan: moment(this.start).format('h:mm a') + ' - ' + moment(this.end).format('h:mm a'),
    duration: moment.duration(moment(this.end).diff(moment(this.start))).humanize(),
    durationInMin: moment.duration(moment(this.end).diff(moment(this.start))).asMinutes(),
  };
});

module.exports = mongoose.model('Block', blockSchema);