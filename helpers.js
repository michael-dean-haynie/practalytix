var moment = require('moment-timezone');

exports.momentConfig = function(moment){
  // Set new thresholds
  moment.relativeTimeThreshold('ss', 44); // default: 44
  moment.relativeTimeThreshold('s', 59);  // default: 45
  moment.relativeTimeThreshold('m', 59);  // default: 45
  moment.relativeTimeThreshold('h', 23);  // default: 22
  moment.relativeTimeThreshold('d', 27);  // default: 26
  moment.relativeTimeThreshold('M', 11);  // default: 11

  return moment;
}

// exports.formatDateForInput = function(date){
//   return moment(date).utc().format('YYYY-MM-DD[T]HH:mm');
// }

exports.formatAsStopWatch = function(duration){ // duration is expected in seconds
  var hours = Math.floor(duration / 60 / 60);
  var mins = Math.floor(duration / 60) - (hours * 60);
  var secs = duration % 60;

  var hourDisplay = '00'.slice(hours.toString().length) + hours.toString();
  var minDisplay = '00'.slice(mins.toString().length) + mins.toString();
  var secDisplay = '00'.slice(secs.toString().length) + secs.toString();

  return {h: hourDisplay, m: minDisplay, s: secDisplay, default: hourDisplay+':'+minDisplay+':'+secDisplay};
}