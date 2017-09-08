var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');
var Activity = require('../models/activity');
var navData = require('./view-models/navData');
var helpers = require('../helpers');
var SessionFormViewModel = require('./view-models/sessionFormViewModel').model;


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
      console.log(session);
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
    var sessionFormViewModel = new SessionFormViewModel()
    sessionFormViewModel.populateFromDBModel(new Session());
    sessionFormViewModel.populateActivityOptions(activities);

    res.render('sessions/create', {navData: navData.get(res), session: sessionFormViewModel});
  });
};


