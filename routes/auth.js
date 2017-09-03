var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');

var User = require('../models/user')

/*
|-------------------
| auth
|-------------------
*/
router.use(function(req, res, next){
  // req.session.user_id = '59ab5a6bfb08ce3840636140';
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err) return next(err);
    if (!user){
      return (req.path === '/signout') ? res.redirect('/signin') : next();
    } else {
      return (req.path === '/signout') ? next() : res.redirect('/');
    }
  });
});

router.get('/signin', authController.signin_get);
router.post('/signin', authController.signin_post);

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/signout', authController.signout_get);

module.exports = router;
