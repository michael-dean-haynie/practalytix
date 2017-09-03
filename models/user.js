var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  first_name: {type: String, required: true},
  family_name: {type: String, required: true},
  email: {type: String, required:true},
  password: {type: String, required: true},
}, {collection: 'user'});

module.exports = mongoose.model('User', userSchema);