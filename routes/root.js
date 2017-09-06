var express = require('express');
var router = express.Router();
var navData = require('../controllers/view-models/navData');

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
  res.render('dash', {title: "Title", navData: navData.get(res)});
});

module.exports = router;