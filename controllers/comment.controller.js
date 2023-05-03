const Comment = require("../models/comment.model")
const catchAsync = require('../utils/catchAsync');

exports.findAllComments = catchAsync(async (req, res, next) => {
    const comments = await Comment.findAll({
        where: {
            status: "active"
        }
    })

    res.status(200).json({
        status: "success",
        results: comments.length,
        comments
    })
});

exports.createComment = catchAsync(async (req, res, next) => {
    const {text} = req.body
    const {postId} = req.params
    const {sessionUser} = req

    const comment = await Comment.create({
        text,
        postId,
        userId: sessionUser.id
    })

    res.status(201).json({
        status: "success",
        message: "The comment has been created",
        comment
    })
});

exports.findCommentById = catchAsync(async (req, res, next) => {
    const {comment} = req

    res.status(200).json({
        status: "success",
        comment
    })
});

exports.updateComment = catchAsync(async (req, res, next) => {
    const {text} = req.body
const {comment} = req
    
 await comment.update({
        text
    })

    res.status(200).json({
        status: 'success',
        message: 'The comment has been update',
      });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
    const {comment} = req

    await comment.update({
        status: "disabled"
    })

    res.status(200).json({
        status: 'success',
        message: 'The comment has been delete',
      });
});


