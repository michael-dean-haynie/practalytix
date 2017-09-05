var express = require('express');
var router = express.Router();

var sessionsController = require('../controllers/sessionsController');

/*
|-------------------
| sessions
|-------------------
*/
router.get('/', sessionsController.index_get);

module.exports = router;