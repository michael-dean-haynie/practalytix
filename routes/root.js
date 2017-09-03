var express = require('express');
var router = express.Router();

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