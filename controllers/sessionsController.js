var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');
var Activity = require('../models/activity');
var navData = require('./view-models/navData');
var helpers = require('../helpers');
var SessionFormViewModel = require('./view-models/sessionFormViewModel').model;
var async = require('async');
var moment = require('moment-timezone');


/*
|-------------------
| index
|-------------------
*/
exports.index_get = function(req, res, next){
  Session.find({user: req.session.user_id})
    .populate({
      path: 'blocks',
      populate: {
        path: 'activity',
      } 
    })
    .sort({start: 'desc'})
    .exec(function(err, sessions){
      if (err) {console.log(err); return next(err)};
      console.log(sessions[0].timeDetails)
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
    .populate({
      path: 'blocks',
      populate: {
        path: 'activity',
      } 
    })
    .exec(function(err, session){
      if (err) {console.log(err); return next(err)};
      console.log(session.timeDetails);
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
      var startDateTime = req.body.start_date_time;
      var sessionBlocks = req.body.session_blocks_hidden_data;
      console.log(session.start);
      console.log(startDateTime);
      console.log(new Date(startDateTime));
      console.log(moment(startDateTime).format('YYYY-MM-DD[T]HH:mm'));
      console.log(JSON.parse(sessionBlocks));
      
      // validate form data
      errors = [];
      errors.push({msg: 'This is a debug error'});

      session.start = new Date(startDateTime);



      if (errors.length){
        var sessionFormViewModel = new SessionFormViewModel();
        sessionFormViewModel.populateActivityOptions(activities);
        sessionFormViewModel.populateFromDBModel(session);

        res.render('sessions/edit', {navData: navData.get(res), session: sessionFormViewModel, errors: errors});
      }
  });
};

