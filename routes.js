var express = require('express');
var router = express.Router();

var User = require('./models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
|-------------------
| auth
|-------------------
*/

router.get('/login', function(req, res, next){
  User.findById(req.session.user_id)
  .exec(function(err, user){
    if (err){
      return next(new Error("Invalid session state. Try deleting cookies and trying again."));
    }
    if (user){
      return res.redirect('/');
    }
    res.send("This is the login page!");
  });
});

module.exports = router;
