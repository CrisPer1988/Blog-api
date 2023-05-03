const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const commentController = require("../controllers/comment.controller")
const validComment = require("../middlewares/comment.middleware")
const validationMiddleware = require("../middlewares/validations.middleware")

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', commentController.findAllComments)

router.post("/:postId", commentController.createComment);

router
  .use("/:id", validComment.validIfExistComment)
  .route('/:id')
  .get(commentController.findCommentById)
  .patch(
    validationMiddleware.validContentComment,
    commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
