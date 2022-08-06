const express = require('express');
const router = express.Router();
const userControoler = require('../controller/userController');
// const { authorization } = require('../middleware/auth');

//User Api's
router.post('/users', userControoler.userRegistration);
router.post('/login', userControoler.userLogin);


module.exports = router;