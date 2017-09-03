require('dotenv').config();

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var User = require('../models/user');

/*
|-------------------
| sessions
|-------------------
*/
// Not sure if I should clear session in migration?

/*
|-------------------
| users
|-------------------
*/

// empty user collection
User.remove({}, err => {if(err) console.log(err);});

// user data
var test_users = [
  ['Ed', 'Sheeran', 'ed@sheeran.com', 'edsheeran'],
  ['David', 'Guetta', 'david@guetta.com', 'davidguetta'],
  ['Shawn', 'Mendes', 'shawn@mendes.com', 'shawnmendes'],
  ['Bruno', 'Mars', 'bruno@mars.com', 'brunomars'],
  ['Justin', 'Bieber', 'justin@bieber', 'justinbieber'],
  ['Dean', 'Haynie', 'michael.dean.haynie@gmail.com', 'deanhaynie'],
];

// add users
for(var i = 0; i < test_users.length; i++){
  d = test_users[i];
  var user = User({
    first_name: d[0],
    family_name: d[1],
    email: d[2],
    password: d[3],
  });
  user.save();
}


// add other test data


mongoose.connection.close();