const PostImg = require('./postImg.model');
const Post = require('./post.model');
const Comment = require('./comment.model');
const User = require('./user.model');

const initModel = () => {
    //1 User <--------->N Post
    User.hasMany(Post)
    Post.belongsTo(User)

    //1 User <--------->N Post
    User.hasMany(Comment)
    Comment.belongsTo(User)

    //1 User <--------->N Post
    Post.hasMany(Comment)
    Comment.belongsTo(Post)

    //1 User <--------->N Post
    Post.hasMany(PostImg)
    PostImg.belongsTo(Post)
}

module.exports = initModel