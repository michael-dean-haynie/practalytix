var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');
var Activity = require('../models/activity');
var navData = require('./view-models/navData');
var helpers = require('../helpers');
var SessionFormViewModel = require('./view-models/sessionFormViewModel').model;
var async = require('async');
var moment = require('moment-timezone');
var mongoose = require('mongoose');
var Block = require('../models/block');


/*
|-------------------
| index
|-------------------
*/
exports.index_get = function(req, res, next){
  Session.find({user: req.session.user_id})
    .populate('user')
    .populate({
      path: 'blocks',
      options: {
        sort: {'start': 'asc'},
      },
      populate: {
        path: 'activity',
      } 
    })
    .sort({start: 'desc'})
    .exec(function(err, sessions){
      if (err) {console.log(err); return next(err)};
      res.render('sessions/index', {navData: navData.get(res), sessions: sessions});
    });
};

/*
|-------------------
| details
|-------------------
*/
exports.details_get = function(req, res, next){
  Session.findById(req.params.sessionId)
    .populate('user')
    .populate({
      path: 'blocks',
      options: {
        sort: {'start': 'asc'},
      },
      populate: {
        path: 'activity',
      } 
    })
    .exec(function(err, session){
      if (err) {console.log(err); return next(err)};
      console.log(session.blocks);
      res.render('sessions/details', {navData: navData.get(res), session: session});
    });
};

/*
|-------------------
| create
|-------------------
*/
exports.create_get = function(req, res, next){
  Activity.find(function(err, activities){
    if (err) return next(err);
    // create empty viewSession with some defaults
    var sessionFormViewModel = new SessionFormViewModel();
    sessionFormViewModel.populateFromDBModel(new Session());
    sessionFormViewModel.populateActivityOptions(activities);

    res.render('sessions/create', {navData: navData.get(res), session: sessionFormViewModel});
  });
};

/*
|-------------------
| edit
|-------------------
*/
exports.edit_get = function(req, res, next){
  async.parallel([
      function(callback){
        Activity.find(function(err, activities){
          callback(err, activities);
        });
      },
      function(callback){
        Session.findById(req.params.sessionId)
          .populate('user')
          .populate({
            path: 'blocks',
            options: {
              sort: {'start': 'asc'},
            },
            populate: {
              path: 'activity',
            },
          })
          .exec(function(err, session){
            callback(err, session)
          });
      },
    ],
    function(err, results){
      if (err) return next(err);
      var sessionFormViewModel = new SessionFormViewModel();
      sessionFormViewModel.populateActivityOptions(results[0]);
      sessionFormViewModel.populateFromDBModel(results[1]);

      res.render('sessions/edit', {navData: navData.get(res), session: sessionFormViewModel});
  });
};

exports.edit_post = function(req, res, next){
  async.parallel([
      function(callback){
        Activity.find(function(err, activities){
          callback(err, activities);
        });
      },
      function(callback){
        Session.findById(req.params.sessionId)
          .populate('user')
          .populate({
            path: 'blocks',
            options: {
              sort: {'start': 'asc'},
            },
            populate: {
              path: 'activity',
            },
          })
          .exec(function(err, session){
            callback(err, session)
          });
      },
    ],
    function(err, results){
      if (err) return next(err);
      var activities = results[0];
      var session = results[1];
      var startDateTime = req.body.startDateTime;

      // Set as user's timezone and convert from there to UTC so the sessionFormViewModel can convert back
      moment.tz.setDefault(res.locals.authed_user.timezone);
      var startDateTimeUTC = moment(startDateTime).utc().format('YYYY-MM-DD[T]HH:mm');
      moment.tz.setDefault();

      var sessionBlocks = JSON.parse(req.body.sessionBlocksHiddenData);
      var newSessionBlocks = [];
      
      errors = [];
      // errors.push({msg: 'This is a debug error'});

      // update session start from query with data from form
      session.start = new Date(startDateTimeUTC);
      var sessionLength = 0;

      // Update block times based off session start and blocks order.
      var minPastStart = 0;
      for(var i = 0; i < sessionBlocks.length; i++){
        var inputBlock = sessionBlocks[i];
        sessionLength = sessionLength + inputBlock.durationInMin;

        var blockStart = moment(session.start).utc().add(minPastStart, 'minutes').toDate();
        var blockEnd = moment(session.start).utc().add(minPastStart, 'minutes').add(inputBlock.durationInMin, 'minutes').toDate();
        var blockActivity = activities.filter(x => x._id.toString() == inputBlock.activity)[0];
        var dbBlock = null;

        if(inputBlock.dbModel && session.blocks.map(x => x._id.toString()).includes(inputBlock.dbModel._id.toString())){ // if its got a backing persisted model
          dbBlock = session.blocks.filter(x => x._id.toString() == inputBlock.dbModel._id)[0];
          dbBlock.start = blockStart;
          dbBlock.end = blockEnd;
          dbBlock.activity = blockActivity;
        }
        else{
          dbBlock = new Block({
            start: blockStart,
            end: blockEnd,
            session: session._id,
            activity: blockActivity,
          });
        }

        newSessionBlocks.push(dbBlock);
        minPastStart = minPastStart + inputBlock.durationInMin;
      }


      var blocksToDelete = session.blocks.map(x => x._id.toString()).filter(x => !newSessionBlocks.map(y => y._id.toString()).includes(x));
      session.blocks = newSessionBlocks;
      session.end = moment(session.start).utc().add(sessionLength, 'minutes');

      if (errors.length){
        var sessionFormViewModel = new SessionFormViewModel();
        sessionFormViewModel.populateActivityOptions(activities);
        sessionFormViewModel.populateFromDBModel(session);

        res.render('sessions/edit', {navData: navData.get(res), session: sessionFormViewModel, errors: errors});
      }
      else{
        async.parallel(
          [
            // saving session changes
            function(callback){
              session.save(function(err){
                callback(err);
              });
            },
            // updating / creating blocks
            function(callback){
              var i = 0;
              async.whilst(
                function(){ return i < session.blocks.length; },
                function(callback){                  
                  opBlock = session.blocks[i];
                  opBlock.activity = new mongoose.Types.ObjectId(opBlock.activity._id);
                  opBlock.session = new mongoose.Types.ObjectId(opBlock.session);
                  opBlock.save(function(err){
                    i++;
                    callback(err);
                  });
                },
                function(err){
                  callback(err);
                }
              );
            },
            // deleting blocks not returned from form
            function(callback){
              Block.remove({_id: {$in: blocksToDelete}}, function(err, nRemoved){
                callback(err);
              });
            }
          ],
          function(err){
            if (err) return next(err);
            res.redirect(session.urlDetails);
          }
        );
      }
  });
};

