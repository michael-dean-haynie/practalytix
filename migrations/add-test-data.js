require('dotenv').config();

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var User = require('../models/user');

// add user test data
var user = User({
  first_name: 'Dean',
  family_name: 'Haynie',
  email: 'michael.dean.haynie@gmail.com',
  password: 'password',
});
user.save();

// add other test data


mongoose.connection.close();