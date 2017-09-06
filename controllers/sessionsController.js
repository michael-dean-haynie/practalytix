var bcrypt = require('bcrypt-nodejs');
var Session = require('../models/session');
var navData = require('./view-models/navData');


/*
|-------------------
| index?
|-------------------
*/
exports.index_get = function(req, res, next){
  Session.find({user: req.session.user_id})
    .populate('blocks')
    .sort({start: 'desc'})
    .exec(function(err, sessions){
      if (err) {console.log(err); return next(err)};
      console.log(sessions[0].blocks);
      res.render('sessions/index', {navData: navData.get(res), sessions: sessions});
    });
};





