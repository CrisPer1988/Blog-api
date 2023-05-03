const Post = require("../models/post.model")
const User = require("../models/user.model")
const Comment = require("../models/comment.model")
const PostImg = require("../models/postImg.model")

const catchAsync = require('../utils/catchAsync');
const {ref, uploadBytes, getDownloadURL} = require("firebase/storage");
const { storage } = require("../utils/firebase");

exports.findAllPost = catchAsync(async (req, res, next) => {
   
    const posts = await Post.findAll({
        where: {
            status: "active"
        },
        attributes: {
            exclude: ["userId", "status"]
        },
        include: [
            {
                model: User,
                attributes: ["id", "name", "profileImgUrl"]
            },
            {
                model: PostImg
            }
          
        ],
        order: [["createdAt", "ASC"]],
        limit: 5
    })

    const postPromise = posts.map(async post => {
        const postImgsPromises = post.postImgs.map(async postImg => {
            const imgRef = ref(storage, postImg.postImgUrl)
            const url = await getDownloadURL(imgRef)
        
            postImg.postImgUrl = url
            return postImg
        })

        const imgRefUser = ref(storage, post.user.profileImgUrl)
        const urlProfile = await getDownloadURL(imgRefUser)

        post.user.profileImgUrl = urlProfile

        const postImgsResolve = await Promise.all(postImgsPromises)
        post.postImg = postImgsResolve
        return posts
    })

    const postResolve = await Promise.all(postPromise)

    res.status(200).json({
        status: "success",
        message: "All users",
        result: posts.length,
        posts: postResolve
    })
});

exports.createPost = catchAsync(async (req, res, next) => {
    const {title, content} = req.body
    const {sessionUser} = req

    const post = await Post.create({
        title,
        content,
        userId: sessionUser.id
    })

    const postImgPromises = req.files.map(async(file) => {
        const imgRef = ref(storage, `posts/${Date.now}-${file.originalname}`)
        const imgUploaded = await uploadBytes(imgRef, file.buffer)
    
       return await PostImg.create({
            postId: post.id,
            postImgUrl: imgUploaded.metadata.fullPath 
        })
    })

    await Promise.all(postImgPromises)

    console.log(postImgPromises);

    res.status(201).json({
        status: "success",
        message: "The post has been created",
        post
    })
});

exports.findMyPosts = catchAsync(async (req, res, next) => {
    const {sessionUser} = req
    
    const posts = await Post.findAll({
        where: {
            status: "active",
            userId: sessionUser.id
        }
    })
//hacer lo mismo que en allpost
    res.status(200).json({
        status: "success",
        message: "My posts",
        results: posts.length,
        posts
    })
});

exports.findUserPost = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const posts = await Post.findAll({
      where: {
        userId: id,
        status: 'active',
      },
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'passwordChangedAt'] },
        },
        {
            model: PostImg
        }
      ],
    });
  
    res.status(200).json({
      status: 'success',
      results: posts.length,
      posts,
    });
  });

exports.findOnePost = catchAsync(async (req, res, next) => {
    const {post} = req

    const allPromises = []

    const imgRefUserProfile = ref(storage, post.user.profileImgUrl)
    const urlProfileUser = await getDownloadURL(imgRefUserProfile)

    post.user.profileImgUrl = urlProfileUser 

    const postImgsPromises = post.postImgs.map(async postImg => {
        const imgRef = ref(storage, postImg.postImgUrl)
        const urlProfileUser = await getDownloadURL(imgRef)
    
        postImg.postImgUrl = urlProfileUser
        return postImg
    
    })

    const userImgsCommentPromise = post.comments.map(async comment => {
        const imgRef = ref(storage, comment.user.profileImgUrl)
        const url = await getDownloadURL(imgRef)

        comment.user.profileImgUrl = url
        return comment
    
    })

    const arrPromise = [...postImgsPromises, ...userImgsCommentPromise]

    await Promise.all(arrPromise)
    
    res.status(200).json({
        status: "succes",
        post
    })
});

exports.updatePost = catchAsync(async (req, res, next) => {
const {title, content} = req.body
const {post} = req
    
 await post.update({
        title,
        content
    })

    res.status(200).json({
        status: 'success',
        message: 'The post has been update',
      });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const {post} = req

    await post.update({
        status: "disabled"
    })

    res.status(200).json({
        status: 'success',
        message: 'The post has been delete',
      });
});