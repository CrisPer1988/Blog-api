const express = require('express');

const postController = require('../controllers/post.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
const userMiddleware = require('../middlewares/user.middleware');
const postMiddleware = require('../middlewares/post.middleware');

const {upload} = require("../utils/multer")

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(postController.findAllPost)
  .post(upload.array("postImgs", 3),validationMiddleware.createPostValidation, postController.createPost);

router.get('/me', postController.findMyPosts);

router.get(
  '/profile/:id',
  userMiddleware.validIfExistUser,
  postController.findUserPost
);

router
  .route('/:id')
  .get(
    postMiddleware.existsPostForFoundIt, 
    postController.findOnePost)
  .patch(
    validationMiddleware.updatePostValidation,
    postMiddleware.validIfExistPost,
    authMiddleware.protectAccountOwner,
    postController.updatePost
  )
  .delete(
    postMiddleware.validIfExistPost,
    authMiddleware.protectAccountOwner,
    postController.deletePost
  );

module.exports = router;
