const express = require('express');
const authCtrl = require('../controllers/auth');
const router = express.Router();

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;