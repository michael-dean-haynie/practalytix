var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var navData = require('../view-models/navData');
var moment = require('moment-timezone');

/*
|-------------------
| signin
|-------------------
*/
exports.signin_get = function(req, res, next){
  res.render("auth/signin", {navData: navData.get(res)});
};

exports.signin_post = function(req, res, next){
  // validate
  req.assert('email', 'Email must be specified').notEmpty();
  req.assert('password', 'Password must be specified').notEmpty();

  // escape values cause we're about to inject them into a new page if they fail
  req.sanitize('email').trim(); req.sanitize('email').escape();
  req.sanitize('password').trim(); req.sanitize('password').escape();     
  // req.sanitize('date_of_birth').toDate();

  var errors = req.validationErrors() || [];

  viewUser = new User({
    email: req.body.email,
    password: req.body.password,
  });

  // find user with matching email
  User.findOne({email: req.body.email}, function(err, user){
    if (err) return next(err);
    if (!user) errors.push({msg: 'Email/Password invalid'});
    if (user){
      if (!bcrypt.compareSync(req.body.password, user.password)){
        errors.push({msg: 'Email/Password invalid'});
      }
    }
    if (errors.length){
      return res.render('auth/signin', {navData: navData.get(res), user: viewUser, errors: errors});
    } else{
      req.session.user_id = user._id;
      res.redirect('/sessions');
    }
  });
};

/*
|-------------------
| signup
|-------------------
*/
exports.signup_get = function(req, res, next){
  var timezones = moment.tz.names(); // an array of all the moment-timezone supported timezones
  res.render('auth/signup', {navData: navData.get(res), timezones})
}

exports.signup_post = function(req, res, next){
  // validate
  req.assert('firstName', 'First Name must be specified').notEmpty();
  req.assert('familyName', 'Family Name must be specified').notEmpty();
  req.assert('timezone', 'Timezone must be specified').notEmpty();
  req.assert('email', 'Email must be specified').notEmpty();
  req.assert('email', 'Email must be a vailid email address').isEmail();
  req.assert('password', 'Password must be specified').notEmpty();
  req.assert('password', 'Password must be at least 6 characters').isLength({min: 6});
  req.assert('confirm_password', 'Password must be confirmed').notEmpty();
  req.assert('confirm_password', 'Passwords must match').equals(req.body.password);

  // escape values cause we're about to inject them into a new page if they fail
  req.sanitize('firstName').trim(); req.sanitize('firstName').escape();
  req.sanitize('familyName').trim(); req.sanitize('familyName').escape();
  req.sanitize('timezone').trim();// req.sanitize('timezone').escape(); // this was escaping the slashes in the timezones in the db
  req.sanitize('email').trim(); req.sanitize('email').escape();
  req.sanitize('password').trim(); req.sanitize('password').escape();
  req.sanitize('confirm_password').trim(); req.sanitize('confirm_password').escape(); 

  errors = req.validationErrors() || [];

  viewUser = new User({
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    timezone: req.body.timezone,
    email: req.body.email,
    password: req.body.password,
    confirm_password: req.body.confirm_password,
  });

  // check for existing user with email
  User.findOne({email: req.body.email}, function(err, user){
    if (err) return next(err);
    if (user) errors.push({msg: 'That email is alreaady taken :/'});
    if (errors.length){
      var timezones = moment.tz.names(); // an array of all the moment-timezone supported timezones
      return res.render('auth/signup', {navData: navData.get(res), user: viewUser, timezones, errors: errors});
    } else{
      var userToSave = new User({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        timezone: req.body.timezone,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
      });
      userToSave.save(function(err){
        if (err) return next(err);
        req.session.user_id = userToSave._id;
        res.redirect('/sessions');
      });
    }
  });
};

/*
|-------------------
| signout
|-------------------
*/
exports.signout_get = function(req, res, next){
  req.session.destroy();
  res.redirect('/');
}






