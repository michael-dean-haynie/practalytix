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

exports.determineAuth = function(req, res, next){
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err) return next(err);
    res.locals.authed_user = user;
    next();
  });
};