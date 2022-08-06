const express = require('express');
const router = express.Router();
const userControoler = require('../controller/userController');
const postController = require('../controller/postController');
// const { authorization } = require('../middleware/auth');


//User Api's
router.post('/users', userControoler.userRegistration);
router.post('/login', userControoler.userLogin);
// router.put('/users/:userId/profile',  userController.updateProfile);

// Product Api-----
router.post('/post', postController.createPost);


module.exports = router;