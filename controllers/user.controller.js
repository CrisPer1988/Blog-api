const Post = require('../models/post.model');
const User = require('../models/user.model');
const Comment = require("../models/comment.model")
const catchAsync = require('../utils/catchAsync');
const {ref, getDownloadURL} = require("firebase/storage")
const {storage} = require("../utils/firebase")

exports.findAll = catchAsync(async (req, res) => {
  const users = await User.findAll({
    attributes: {
      exclude: ["password", "passwordChagedAt", "status"]
    },
    where: {
      status: 'active',
    },
    include: [
      {
      model: Post,
      include: [
        {
          model: Comment
        }
      ]
    },
  ]
  });

  const userPromises = users.map(async user => {
    const imgRef = ref(storage, user.profileImgUrl)
    const url = await getDownloadURL(imgRef)

    user.profileImgUrl = url
    return user
  })

  const userResolve = await Promise.all(userPromises)

  return res.status(200).json({
    status: 'success',
    results: users.length,
    users: userResolve
  });
});

exports.findOne = catchAsync(async (req, res) => {
  const { user } = req;

  const imgRef = ref(storage, user.profileImgUrl)
  const url = await getDownloadURL(imgRef)

  user.profileImgUrl = url

  res.status(200).json({
    status: 'success',
    message: 'The query has been done success',
    user,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  const { user } = req;

  await user.update({
    name,
    email,
  });

  res.status(200).json({
    status: 'success',
    message: 'The user update',
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { user } = req;

  await user.update({
    status: 'disabled',
  });

  return res.status(200).json({
    status: 'success',
    message: 'User deleted',
  });
});
