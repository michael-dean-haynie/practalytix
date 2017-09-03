var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

exports.login_get = function(req, res, next){
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err){
      return next(new Error("Invalid session state. Try deleting cookies and trying again."));
    }
    if (user){
      return res.redirect('/');
    }
    res.render("auth/login", {title: 'Login'});
  });
};

exports.login_post = function(req, res, next){
  // validate
  req.checkBody('email', 'Email must be specified').notEmpty();
  req.checkBody('password', 'Password must be specified').notEmpty();

  // escape values cause we're about to injedt them into a new page if they fail
  req.sanitize('email').trim();
  req.sanitize('email').escape();
  req.sanitize('password').trim();
  req.sanitize('password').escape();     
  // req.sanitize('date_of_birth').toDate();

  var errors = req.validationErrors() || [];

  viewUser = new User({
    email: req.body.email,
    password: req.body.password,
  });

  // check for existing user with email
  User.findOne({email: req.body.email}, function(err, user){
    if (err) return next(err);
    if (!user) errors.push({msg: 'Email/Password invalid'});
    if (user){
      if (!bcrypt.compareSync(req.body.password, user.password)){
        errors.push({msg: 'Email/Password invalid'});
      }
    }
    if (errors.length){
      console.log(errors);
      console.log(viewUser);
      return res.render('auth/login', {title: 'Login', user: viewUser, errors: errors});
    } else{
      req.session.user_id = user._id;
      console.log(req.session);
      res.redirect('/');
    }
  });
};











  // // validate
  // req.checkBody('email', 'Email must be specified').notEmpty();
  // req.checkBody('email', 'Email must be a vailid email address').isEmail();
  // req.checkBody('password', 'Password must be specified').notEmpty();
  // req.checkBody('password', 'Password must be at least 6 characters').isLength({min: 6});

  // // escape values cause we're about to injedt them into a new page if they fail
  // req.sanitize('email').trim();
  // req.sanitize('email').escape();
  // req.sanitize('password').trim();
  // req.sanitize('password').escape();     
  // // req.sanitize('date_of_birth').toDate();