var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  firstName: {type: String, required: true},
  familyName: {type: String, required: true},
  email: {type: String, required:true},
  password: {type: String, required: true},
  timezone: {type: String, required: true},
  token: {type: String, required: false},
  tokenExpires: {type: Date, required:false},
}, {collection: 'user'});

module.exports = mongoose.model('User', userSchema);