var express = require('express');
var router = express.Router();

var authController = require('./controllers/authController');

/*
|-------------------
| root
|-------------------
*/
router.get('/', function(req, res, next) {
  res.redirect('/dashboard');
});

router.get('/dashboard', function(req, res, next){
  res.render('dashboard', {title: 'Dashboard'});
});

/*
|-------------------
| auth
|-------------------
*/
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);

module.exports = router;
