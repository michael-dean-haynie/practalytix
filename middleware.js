var User = require('./models/user');

exports.auth = function(req, res, next){ 
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
  console.log('HERE!');
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err) return next(err);
    return user ? next() : res.redirect('/');
  });
};