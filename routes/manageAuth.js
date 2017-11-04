var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');

/*
|-------------------
| manageAuth
|-------------------
*/
router.get('/details', authController.details_get);

router.get('/edit', authController.edit_get);
router.post('/edit', authController.edit_post);

router.get('/delete', authController.delete_get);
router.post('/delete', authController.delete_post);

module.exports = router;