var moment = require('moment-timezone');
// console.log(moment.tz.names());
console.log('===============================================');
console.log('===============================================');
console.log('===============================================');

var before = moment.utc([2017, 1, 5]);
console.log('BEFORE ===============================================');
console.log('===== UTC');
console.log(before.format());
console.log('===== In US/Arizona');
console.log(before.tz('US/Arizona').format());
console.log('===== In  US/Eastern');
console.log(before.tz('US/Eastern').format());
console.log('');

var during = moment.utc([2017, 5, 5]);
console.log('DURING ===============================================');
console.log('===== UTC');
console.log(during.format());
console.log('===== In US/Arizona');
console.log(during.tz('US/Arizona').format());
console.log('===== In  US/Eastern');
console.log(during.tz('US/Eastern').format());
console.log('');

var after = moment.utc([2017, 11, 5]);
console.log('AFTER ===============================================');
console.log('===== UTC');
console.log(after.format());
console.log('===== In US/Arizona');
console.log(after.tz('US/Arizona').format());
console.log('===== In  US/Eastern');
console.log(after.tz('US/Eastern').format());
console.log('');