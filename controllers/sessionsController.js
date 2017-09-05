var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');

/*
|-------------------
| index?
|-------------------
*/
exports.index_get = function(req, res, next){
  Session.find({user: req.session.user_id})
    .sort({start: 'desc'})
    .exec(function(err, sessions){
      if (err) return next(err);
      res.render('sessions/index', {title: 'Sessions', sessions: sessions});
    });
};





