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
      populate: {
        path: 'activity',
      } 
    })
    .exec(function(err, session){
      if (err) {console.log(err); return next(err)};
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
      console.log(sessionFormViewModel);

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

      // console.log(session.start);
      // console.log(startDateTime);
      // console.log(startDateTimeUTC);
      console.log('IN');
      console.log(sessionBlocks);

      console.log('BEFORE');
      console.log(session.blocks);
      
      // validate form data
      errors = [];
      errors.push({msg: 'This is a debug error'});

      // update session start from query with data from form
      session.start = new Date(startDateTimeUTC);

      // remove blocks from the queried session that aren't returned in the form
      // session.blocks = session.blocks.filter(x => sessionBlocks.map(y => y.dbModel ? y.dbModel._id : null).includes(x._id.toString()));
      var newSessionBlocks = [];

      // Update block times based off session start and blocks order.
      var minPastStart = 0;
      for(var i = 0; i < sessionBlocks.length; i++){
        var inputBlock = sessionBlocks[i];

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

      session.blocks = newSessionBlocks;

      console.log('OUT');
      console.log(session.blocks);


      if (errors.length){
        var sessionFormViewModel = new SessionFormViewModel();
        sessionFormViewModel.populateActivityOptions(activities);
        sessionFormViewModel.populateFromDBModel(session);

        res.render('sessions/edit', {navData: navData.get(res), session: sessionFormViewModel, errors: errors});
      }
  });
};

