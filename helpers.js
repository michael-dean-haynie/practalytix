var moment = require('moment');

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

exports.formatDateForInput = function(date){
  return moment(date).format('YYYY-MM-DD[T]HH:mm');
}