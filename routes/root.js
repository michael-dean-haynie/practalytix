var express = require('express');
var router = express.Router();

var sessionsController = require('../controllers/sessionsController');

/*
|-------------------
| root
|-------------------
*/
router.get('/', function(req, res, next) {
  res.redirect('/dash');
});

router.get('/dash', function(req, res, next){
  res.render('dash', {title: 'Dashboard'});
});

module.exports = router;