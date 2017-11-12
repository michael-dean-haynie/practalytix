var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var navData = require('../view-models/navData');
var moment = require('moment-timezone');
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');

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
    if (user) errors.push({msg: 'That email is already taken :/'});
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

/*
|-------------------
| details
|-------------------
*/
exports.details_get = function(req, res, next){
  User.findOne({_id: res.locals.authed_user._id}, function(err, user){
    if (err) {return next(err);}
    res.render('auth/details', {navData: navData.get(res), user: user});
  });
}

/*
|-------------------
| edit
|-------------------
*/
exports.edit_get = function(req, res, next){
  var timezones = moment.tz.names(); // an array of all the moment-timezone supported timezones
  User.findOne({_id: res.locals.authed_user._id}, function(err, user){
    if (err) {return next(err);}
    res.render('auth/edit', {navData: navData.get(res), user: user, timezones, errors: []});
  });
}

exports.edit_post = function(req, res, next){
  // validate
  req.assert('firstName', 'First Name must be specified').notEmpty();
  req.assert('familyName', 'Family Name must be specified').notEmpty();
  req.assert('timezone', 'Timezone must be specified').notEmpty();
  req.assert('email', 'Email must be specified').notEmpty();
  req.assert('email', 'Email must be a vailid email address').isEmail();

  // escape values cause we're about to inject them into a new page if they fail
  req.sanitize('firstName').trim(); req.sanitize('firstName').escape();
  req.sanitize('familyName').trim(); req.sanitize('familyName').escape();
  req.sanitize('timezone').trim();// req.sanitize('timezone').escape(); // this was escaping the slashes in the timezones in the db
  req.sanitize('email').trim(); req.sanitize('email').escape();

  errors = req.validationErrors() || [];

  viewUser = new User({
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    timezone: req.body.timezone,
    email: req.body.email,
  });

  // check for existing user with email
  User.findOne({email: req.body.email}, function(err, user){
    if (err) return next(err);
    if (user && user.email != res.locals.authed_user.email) errors.push({msg: 'That email is already taken :/'});
    if (errors.length){
      var timezones = moment.tz.names(); // an array of all the moment-timezone supported timezones
      return res.render('auth/edit', {navData: navData.get(res), user: viewUser, timezones, errors: errors});
    } else{
      user.firstName = viewUser.firstName;
      user.familyName = viewUser.familyName;
      user.timezone = viewUser.timezone;
      user.email = viewUser.email;
      user.save();
      res.redirect('/manage-auth/details');
    }
  });
}

/*
|-------------------
| delete
|-------------------
*/
exports.delete_get = function(req, res, next){
  res.render('auth/delete', {navData: navData.get(res)});
}

exports.delete_post = function(req, res, next){
  User.findById(res.locals.authed_user._id, function(err, user){
    if (err) { return next(err); }    
    User.remove({_id: res.locals.authed_user._id}, function(err){
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect('/');
    });
  });
}

/*
|-------------------
| password reset
|-------------------
*/
exports.pwrsRequest_get = function(req, res, next){
  res.render('auth/pwrsRequest', {navData: navData.get(res)});
}

exports.pwrsRequest_post = function(req, res, next){
  // validate/clean email field
  req.assert('email', 'Email must be specified').notEmpty();
  req.assert('email', 'Email must be a vailid email address').isEmail();
  req.sanitize('email').trim(); req.sanitize('email').escape();

  theErrors = req.validationErrors() || [];

  if (theErrors.length){
    res.render('auth/pwrsRequest', {navData: navData.get(res), errors: theErrors});
  }
  else{
    User.findOne({'email': req.body.email}, function(err, user){
      if(err) {
        console.log(err);
        theErrors.push({msg: 'Uh oh. Something went wrong.'});
      }


      if (!user){
        theErrors.push({msg: 'Oops! We don\'t have any accounts registered at that address!'});
      }
      else if (user){
        user.token = randtoken.generate(16)
        user.tokenExpires = moment(new Date).add(24, 'hours').toDate();
        user.save(function(err){
          if (err) {
            theErrors.push({msg: 'Uh oh. Something went wrong.'});
            console.log(err);
          }
        });

        // determine protocol
        // var theProtocol = process.env.NODE_ENV == 'development' ? 'http' : 'https'; // was causing problems on prod.
        var theProtocol = 'http';
        //determine domain
        var theDomain = process.env.NODE_ENV == 'development' ? process.env.DEV_DOMAIN : process.env.NODE_ENV == 'production' ? process.env.PROD_DOMAIN : null;

        var resetLink = theProtocol+'://'+theDomain+'/auth/pw-rs-submit?t='+user.token;

        var transporter = nodemailer.createTransport({
          host: 'mail.privateemail.com',
          port: 587,
          auth: {
            user: process.env.PRIVATEEMAIL_USER,
            pass: process.env.PRIVATEEMAIL_PASS,
          }
        });

        var mailOptions = {
          from: process.env.PRIVATEEMAIL_USER,
          to: user.email,
          subject: 'Practalytix Account: Password Reset Token',
          text: 'Hello,\n\nA password reset token was just requested for this email address. Please click on the following link to reset your password. If you did not make this request, please disregard this message.\n\n'+resetLink+'\n\nThanks!',
        };

        transporter.sendMail(mailOptions, function(err, info){
          if(err){
            console.log(err);
            theErrors.push({msg: 'Uh oh. Something went wrong. Please try again.'});
          }else{
            console.log('Message sent: ' + info.response);
            console.log('Message sent to '+user.email);
          }
        });
      }
      else { // no user was found with that email address
        theErrors.push({msg: 'Uh oh. Something went wrong.'})
      }


      if(theErrors.length){
        res.render('auth/pwrsRequest', {navData: navData.get(res), errors: theErrors, email: req.body.email});
      }
      else {
        res.render('auth/pwrsRequest', {navData: navData.get(res), errors: [], tokenSent: true, email: req.body.email});
      }
    });
  }
}

exports.pwrsSubmit_get = function(req, res, next){
  console.log(req.query.t);
  var tokenIsValid = false;
  User.findOne({'token': req.query.t})
    .where('tokenExpires').gt(new Date())
    .exec(function(err, user){
      if (err) {
        console.log(err);
        return next(err);
      }

      if (user){
        tokenIsValid = true;
      }

      model = {
        token: req.query.t,
      };

      res.render('auth/pwrsSubmit', {navData: navData.get(res), tokenIsValid: tokenIsValid, model: model});
    });
}

exports.pwrsSubmit_post = function(req, res, next){
  // validate
  req.assert('password', 'Password must be specified').notEmpty();
  req.assert('password', 'Password must be at least 6 characters').isLength({min: 6});
  req.assert('confirm_password', 'Password must be confirmed').notEmpty();
  req.assert('confirm_password', 'Passwords must match').equals(req.body.password);

  // escape values cause we're about to inject them into a new page if they fail
  req.sanitize('password').trim(); req.sanitize('password').escape();
  req.sanitize('confirm_password').trim(); req.sanitize('confirm_password').escape(); 

  theErrors = req.validationErrors() || [];

  model = {
    password: req.body.password,
    confirm_password: req.body.confirm_password,
    token: req.body.token,
  };

  var tokenIsValid = true;

  if(theErrors.length){
    res.render('auth/pwrsSubmit', {navData: navData.get(res), tokenIsValid: tokenIsValid, model: model, errors: theErrors});
    return;
  }

  // check for existing user with email
  User.findOne({})
    .where('token').equals(req.body.token)
    .where('tokenExpires').gt(new Date())
    .exec(function(err, user){
      if (err){
        console.log(err);
        return next(err);
      }

      if (user){
        user.password = bcrypt.hashSync(req.body.password);
        user.token = null;
        user.tokenExpires = null;
        user.save(function(err){
          if (err) {
            console.log(err);
            return next(err);
          }
          req.session.user_id = user._id;
          res.redirect('/sessions');
        });
      }
      else {
        tokenIsValid = false;
        res.render('auth/pwrsSubmit', {navData: navData.get(res), tokenIsValid: tokenIsValid, model: model, errors: theErrors});
      }
    });
}






