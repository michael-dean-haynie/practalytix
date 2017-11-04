var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');
var Activity = require('../models/activity');
var navData = require('../view-models/navData');
var helpers = require('../helpers');
var SessionFormViewModel = require('../view-models/sessionFormViewModel').model;
var SessionDetailsViewModel = require('../view-models/sessionDetailsViewModel').model;
var async = require('async');
var moment = require('moment-timezone');
var mongoose = require('mongoose');
var Block = require('../models/block');
var PagerModel = require('../view-models/pagerModel').model;
var AnalyticsViewModel = require('../view-models/analyticsViewModel').model;


/*
|-------------------
| index
|-------------------
*/
exports.index_get = function(req, res, next){
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || 10;

  async.parallel([
      function(callback){
        Session.find({user: req.session.user_id})
          .count()
          .exec(function(err, count){
            callback(err, count);
          });
      },
      function(callback){
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
          .skip((page-1)*limit).limit(limit)
          .exec(function(err, sessions){
            callback(err, sessions);
          });
      }
    ],
    function(err, results){
      if (err) {return next(err);}
      var countTotal = results[0];
      var sessions = results[1];
      var countSelected = sessions.length;
      var thePath = '/sessions';
      var pagerModel = new PagerModel(page, limit, countSelected, countTotal, thePath);

      res.render('sessions/index', {navData: navData.get(res), sessions: sessions, pagerModel: pagerModel});
    }
  );
};

/*
|-------------------
| details
|-------------------
*/
exports.details_get = function(req, res, next){
  Session.findById(req.params.sessionId)
    .where('user', req.session.user_id)
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

      if (!session){
        return next(new Error("Could not find requested item."));
      }
      // if (session.user._id != req.session.user_id){
      //   return next(new Error("Could not find requested item."));
      // }

      var sessionDetailsViewModel = new SessionDetailsViewModel();
      sessionDetailsViewModel.populateFromDBModel(session);
      res.render('sessions/details', {navData: navData.get(res), session: sessionDetailsViewModel});
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
    sessionFormViewModel.populateFromDBModel(new Session({user: res.locals.authed_user}));
    sessionFormViewModel.populateActivityOptions(activities);

    res.render('sessions/create', {navData: navData.get(res), session: sessionFormViewModel});
  });
};

exports.create_post = function(req, res, next){
  Activity.find(function(err, activities){
    if (err) return next(err);
    errors = [];

    var session = new Session({user: res.locals.authed_user});

    // Set as user's timezone and convert from there to UTC so the sessionFormViewModel can convert back
    var startDateTime = req.body.startDateTime;
    moment.tz.setDefault(res.locals.authed_user.timezone);
    var startDateTimeUTC = moment(startDateTime).utc().format('YYYY-MM-DD[T]HH:mm');
    moment.tz.setDefault();
    session.start = new Date(startDateTimeUTC);

    // Figure out blocks
    var sessionBlocks = JSON.parse(req.body.sessionBlocksHiddenData);
    var newSessionBlocks = [];
    var sessionLength = 0;
    var secPastStart = 0;

    for(var i = 0; i < sessionBlocks.length; i++){
      var inputBlock = sessionBlocks[i];
      sessionLength = sessionLength + inputBlock.durationInSec;

      var blockStart = moment(session.start).utc().add(secPastStart, 'seconds').toDate();
      var blockEnd = moment(session.start).utc().add(secPastStart, 'seconds').add(inputBlock.durationInSec, 'seconds').toDate();
      var blockActivity = activities.filter(x => x._id.toString() == inputBlock.activity)[0];

      dbBlock = new Block({
        start: blockStart,
        end: blockEnd,
        session: session._id,
        activity: blockActivity,
      });


      newSessionBlocks.push(dbBlock);
      secPastStart = secPastStart + inputBlock.durationInSec;
    }

    session.blocks = newSessionBlocks;
    session.end = moment(session.start).utc().add(sessionLength, 'seconds');

    if (errors.length){
      var sessionFormViewModel = new SessionFormViewModel();
      sessionFormViewModel.populateActivityOptions(activities);
      sessionFormViewModel.populateFromDBModel(session);

      res.render('sessions/create', {navData: navData.get(res), session: sessionFormViewModel, errors: errors});
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
        ],
        function(err){
          if (err) return next(err);
          res.redirect(session.urlDetails);
        }
      );
    }
  });
}

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
          .where('user', req.session.user_id)
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

      if (!session){
        return next(new Error("Could not find requested item."));
      }

      var sessionFormViewModel = new SessionFormViewModel();
      sessionFormViewModel.populateActivityOptions(activities);
      sessionFormViewModel.populateFromDBModel(session);

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

      if (!session){
        return next(new Error("Could not find requested item."));
      }

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
      var secPastStart = 0;
      for(var i = 0; i < sessionBlocks.length; i++){
        var inputBlock = sessionBlocks[i];
        sessionLength = sessionLength + inputBlock.durationInSec;

        var blockStart = moment(session.start).utc().add(secPastStart, 'seconds').toDate();
        var blockEnd = moment(session.start).utc().add(secPastStart, 'seconds').add(inputBlock.durationInSec, 'seconds').toDate();
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
        secPastStart = secPastStart + inputBlock.durationInSec;
      }


      var blocksToDelete = session.blocks.map(x => x._id.toString()).filter(x => !newSessionBlocks.map(y => y._id.toString()).includes(x));
      session.blocks = newSessionBlocks;
      session.end = moment(session.start).utc().add(sessionLength, 'seconds');

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

/*
|-------------------
| delete
|-------------------
*/
exports.delete_get = function(req, res, next){
  Session.findById(req.params.sessionId, function(err, session){
    if (err) { return next(err); }
    if (!session) { return next(new Error("Could not find requested item.")); }
    if (session.user.toString() != res.locals.authed_user._id.toString()) { return next(new Error('Could not find requested item.')); } 
    res.render('sessions/delete', {navData: navData.get(res), session: session});
  });
};

exports.delete_post = function(req, res, next){
  Session.findById(req.params.sessionId, function(err, session){
    if (err) { return next(err); }
    if (!session) { return next(new Error("Could not find session.")); }
    if (session.user.toString() != res.locals.authed_user._id.toString()) { return next(new Error('Could not find requested item.')); } 
    
    Session.remove({_id: session._id}, function(err){
      if (err) { return next(err); }
      res.redirect('/sessions');
    });
  });
};

/*
|-------------------
| live
|-------------------
*/
exports.live_get = function(req, res, next){
  Activity.find(function(err, activities){
    if (err) return next(err);

    // create empty viewSession with some defaults
    var sessionFormViewModel = new SessionFormViewModel();
    sessionFormViewModel.populateFromDBModel(new Session({user: res.locals.authed_user}));
    sessionFormViewModel.populateActivityOptions(activities);

    res.render('sessions/live', {navData: navData.get(res), session: sessionFormViewModel});
  });
};

// The sessions/live page posts to the sessions/create action

/*
|-------------------
| analytics
|-------------------
*/
exports.analytics_get = function(req, res, next){
  var range = req.query.dateRange;
  var start = null;
  var end = null;

  if (null != range && range.length){
    start = range.split(' ')[0];
    end = range.split(' ')[2];

    start = moment(start).tz(res.locals.authed_user.timezone).utc().toDate();
    end = moment(end).tz(res.locals.authed_user.timezone).utc().toDate();
  }

  async.parallel([
    function(callback){
      var query = Session.find({user: req.session.user_id})
        .populate('user')
        .populate({
          path: 'blocks',
          options: {
            sort: {'start': 'asc'},
          },
          populate: {
            path: 'activity',
          } 
        });

        if (start && end){
          query = query.where('start').gt(start);
          query = query.where('start').lt(end);
        }

        query.sort({start: 'asc'})
        .exec(function(err, sessions){
          callback(err, sessions);
        });
    },
    function(callback){
      Activity.find(function(err, activities){
        callback(err, activities);
      })
    }
    ], function(err, results){
      if (err) {return next(err);}
      var sessions = results[0];
      var activities = results[1];
      var timezone = res.locals.authed_user.timezone;

      viewModel = new AnalyticsViewModel(sessions, activities, timezone, start, end);

      res.render('sessions/analytics', {navData: navData.get(res), model: viewModel});
  });

};