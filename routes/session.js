var express = require('express');
var router = express.Router();

var sessionsController = require('../controllers/sessionsController');

/*
|-------------------
| sessions
|-------------------
*/
router.get('/create/', sessionsController.create_get);
router.post('/create/', sessionsController.create_post);

router.get('/edit/:sessionId', sessionsController.edit_get);
router.post('/edit/:sessionId', sessionsController.edit_post);

router.get('/delete/:sessionId', sessionsController.delete_get);
router.post('/delete/:sessionId', sessionsController.delete_post);

router.get('/live', sessionsController.live_get);
router.post('/live', sessionsController.create_post);

router.get('/', sessionsController.index_get);
router.get('/:sessionId', sessionsController.details_get);

module.exports = router;