const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require("bcryptjs")
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');


exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12)
  const encryptedPassword = await bcrypt.hash(password, salt)

  const user = await User.create({
    name: name.toLowerCase(),
    email: email.toLowerCase(),
    password: encryptedPassword, 
    role
  });
 
  const token = await generateJWT(user.id)

  res.status(201).json({
    status: 'success',
    message: 'The user has been created succesfully!',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImgUrl: user.profileImgUrl,
      role: user.role
    }
  });
});

exports.login = catchAsync(async (req,res,next) =>{
  const {email, password} = req.body 
  
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
      status: "active"
    }
  })

  if(!user) {
    return next(new AppError("The user could not be found", 404))
  }

  if(!(await bcrypt.compare(password, user.password))){
    return next(new AppError("Incorrect email or password", 401))
  }

  const token = await generateJWT(user.id)

  res.status(200).json({
    status: "success",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImgUrl: user.profileImgUrl,
      role: user.role
    }
  })
})

exports.updatePassword = catchAsync(async(req, res, next) => {
  const {user} = req;
  const {currentPassword, newPassword} = req.body;

  if(!(await bcrypt.compare(currentPassword, user.password))){
    return next(new AppError("Incorrect password", 401))
  }

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(newPassword, salt)

  await user.update({
    password: encryptedPassword,
    passwordChagedAt: new Date()
  })

  return res.status(200).json({
    status: "success",
    message: "The user password was update successfully!"
  })

})
