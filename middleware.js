var User = require('./models/user');

exports.noAuth = function(req, res, next){ 
  // req.session.user_id = '59ab5a6bfb08ce3840636140'; 
  User.findById(req.session.user_id) 
  .exec(function(err, user){ 
    if (err) return next(err); 
    if (!user){ 
      return (req.path === '/signout') ? res.redirect('/auth/signin') : next(); 
    } else { 
      return (req.path === '/signout') ? next() : res.redirect('/'); 
    }
  });
};

exports.authed = function(req, res, next){
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err) return next(err);
    return user ? next() : res.redirect('/');
  });
};

exports.devAutoSignin = function(req, res, next){
  if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTO_SIGNIN === 'true'){
    // check if user is already signed in
      User.findById(req.session.user_id)
        .exec(function(err, user){
          if (err) return next(err);
          // if not signed in, sign in as random user
          if (!user){
            var emails = ['bruno@mars.com', 'ed@sheeran.com']; // emails of users to pick from
            User.find({email: emails}, function(err, users){
              if (err) return next(err);
              var selectedUser = users[Math.floor(Math.random()*users.length)];
              req.session.user_id = selectedUser._id;
              res.locals.authed_user = selectedUser;
              return next();
            });
          } else{
            return next();
          }
      });

  } else {
    return next();
  }
};

exports.determineAuth = function(req, res, next){
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err) return next(err);
    res.locals.authed_user = user;
    next();
  });
};