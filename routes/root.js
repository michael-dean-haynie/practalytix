var express = require('express');
var router = express.Router();
var navData = require('../view-models/navData');

var sessionsController = require('../controllers/sessionsController');

/*
|-------------------
| root
|-------------------
*/
router.get('/', function(req, res, next) {
  res.redirect('/about');
});

router.get('/about', function(req, res, next){
  res.render('about', {navData: navData.get(res)});
});

module.exports = router;