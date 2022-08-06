const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const postController = require('../controller/postController');
const { authorization } = require('../middleware/auth');


//User Api's
router.post('/users', userController.userRegistration);
router.post('/login', userController.userLogin);
router.put('/users/:user_id/profile', authorization, userController.updateProfile);

// Postt Api
router.post('/post', authorization, postController.createPost);
router.put('/post/:postId', authorization, postController.updatePost);
router.delete('/post/:postId', authorization, postController.deletePost);

module.exports = router;