require('dotenv').config();
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var moment = require('moment-timezone');

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var User = require('../models/user');
var Session = require('../models/session');
var Activity = require('../models/activity');
var Block = require('../models/block')

/*
|-------------------
| cookiesession
|-------------------
*/
// Not sure if I should clear collection in migration?

/*
|-------------------
| user
|-------------------
*/
function userMigration(callback){
  async.series([
    // empty collection
    function(callback){
      User.remove({}, function(err){
        callback(err || null);
      });
    },

    // insert documents 
    function(callback){
      var data = [
        ['Ed', 'Sheeran', 'US/Pacific', 'ed@sheeran.com', 'edsheeran'],
        ['David', 'Guetta', 'US/Central', 'david@guetta.com', 'davidguetta'],
        ['Shawn', 'Mendes', 'US/Eastern', 'shawn@mendes.com', 'shawnmendes'],
        ['Bruno', 'Mars', 'Japan', 'bruno@mars.com', 'brunomars'],
        ['Justin', 'Bieber', 'UTC', 'justin@bieber.com', 'justinbieber'],
        ['Dean', 'Haynie', 'America/Phoenix', 'michael.dean.haynie@gmail.com', 'deanhaynie'],
      ];

      // build test models
      models = [];
      for(var i = 0; i < data.length; i++){
        d = data[i];
        var user = User({
          firstName: d[0],
          familyName: d[1],
          timezone: d[2],
          email: d[3],
          password: bcrypt.hashSync(d[4]),
        });
        models.push(user);
      }

      // save models async by mapping the array to functions that do the saving on the models
      async.parallel(models.map(
        function(currentValue, index, array){
          var theFunction = function(callback){
            currentValue.save(function(err){
              callback(err || null);
            });
          }
          return theFunction;
        }),
        function(err, results){
          callback(err || null);
        }
      );
    },
  ], function(err){ return callback(err); });
}

/*
|-------------------
| activity
|-------------------
*/
function activityMigration(callback){
  async.series([
    // empty collection
    function(callback){
      Activity.remove({}, function(err){
        callback(err || null);
      });
    },

    // insert documents 
    function(callback){
      var data = [
        ['Sight Reading', 'Description', 'rgba(255, 99, 132, 0.8)'],
        ['Technique', 'Description', 'rgba(54, 162, 235, 0.8)'],
        ['Theory', 'Description', 'rgba(75, 192, 192, 0.8)'],
        ['Method Books', 'Description', 'rgba(2, 123, 59, 0.8)'],
        ['Focused Repertoire', 'Description', 'rgba(129, 6, 193, 0.8)'],
        ['Paused', 'Description', 'rgba(224, 229, 101, 0.8)'],
      ];

      // build test models
      models = [];
      for(var i = 0; i < data.length; i++){
        d = data[i];
        var activity = Activity({
          name: d[0],
          description: d[1],
          color: d[2],
        });
        models.push(activity);
      }

      // save models async by mapping the array to functions that do the saving on the models
      async.parallel(models.map(
        function(currentValue, index, array){
          var theFunction = function(callback){
            currentValue.save(function(err){
              callback(err || null);
            });
          }
          return theFunction;
        }),
        function(err, results){
          callback(err || null);
        }
      );
    },
  ], function(err){ return callback(err); });
}

/*
|-------------------
| session, block
|-------------------
*/
function sessionMigration(callback){
  async.waterfall([
    // empty collection
    function(callback){
      Session.remove({}, function(err){
        callback(err || null);
      });
    },

    // empty collection
    function(callback){
      Block.remove({}, function(err){
        callback(err || null);
      });
    },

    // select user id's from migration above
    function(callback){
      User.find({})
      .limit(5)
      .select('_id')
      .exec(function(err, users){
        callback(err || null, users.map(x => x._id));
      });
    },

    // select activity id's from migration above
    function(userIds, callback){
      Activity.find({})
      .select('_id')
      .exec(function(err, activities){
        callback(err || null, activities.map(x => x._id), userIds);
      });
    },

    // insert documents 
    function(activityIds, userIds, callback){

      var userIndex = 0;
      async.whilst( // itterating users
        function(){ return userIndex < userIds.length; },
        function(callback){
          // some config
          var userId = userIds[userIndex];
          var daysRecording = 100;
          var baseFreq = 0.66; // sessions per day
          var maxLength = 120; // max length of session in minutes
          var blockLength = 15;

          var pointer = moment({seconds: 0, milliseconds: 0}).subtract(daysRecording, 'days');
          var stop = moment().subtract(1, 'days');

          async.whilst( // itterating sessions for user
            function(){ return pointer < stop; },
            function(callback){

              // exit if not practicing today
              if(Math.random() > baseFreq){
                pointer.add(1, 'days');
                return callback();
              }

              var numOfBlocks = Math.floor(Math.random() * (6 - 1) + 1); //  1 <= rand <= 5
              var sesStartMin = 7*60;
              var sesStartMax = (19*60)-(maxLength);
              var sesStart = Math.floor(Math.random() * (sesStartMax - sesStartMin) + sesStartMin);

              pointer.hour(0).minute(0).add(sesStart, 'minutes');

              var session = Session({
                user: userId,
                start: pointer.toDate(),
                end: moment(pointer).add(blockLength*numOfBlocks, 'minutes'), // clone and calc session end
              });

              // console.log('user: ' + userId + ', session: '+ session._id);

              session.save(function(err){
                async.whilst(
                  function(){ return numOfBlocks > 0; },
                  function(callback){
                    var blockStart = pointer.toDate();
                    pointer.add(blockLength, 'minutes');
                    var blockEnd = pointer.toDate();
                    var activityId = activityIds[Math.floor(Math.random()*activityIds.length)]; // random activity id

                    var block = Block({
                      start: blockStart,
                      end: blockEnd,
                      session: session._id,
                      activity: activityId,
                    });
                    // console.log('block: ' + block._id + ', numOfBlocks: ' + numOfBlocks);

                    block.save(function(err){ numOfBlocks--; callback(err); });
                  },
                  function(err){ pointer.add(1, 'days'); callback(err); }
                );
              });
            },
            function(err){ userIndex++; callback(err || null); }
          );
        },
        function(err){ callback(err || null); }
      );
    },
  ], function(err){ return callback(err || null); });
}

/*
|-------------------
| migrate in series
|-------------------
*/
async.series([
  userMigration,
  activityMigration,
  sessionMigration,
], function(err, result){
  console.log(err || 'Migrations run successfully!');
  mongoose.connection.close();
});