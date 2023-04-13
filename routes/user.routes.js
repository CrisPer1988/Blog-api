const express = require('express');

//controllers
const userController = require('../controllers/user.controller');
const authController = require("../controllers/auth.controller")
//middlewares
const userMeddleware = require("../middlewares/user.middleware")
const validationMiddleware = require("../middlewares/validations.middleware")
const authMiddleware = require("../middlewares/auth.middleware")
//rutas
const router = express.Router();

//protegemos todas las rutas
router.use(authMiddleware.protect)

router.get('/', userController.findAll)


router
.route("/:id")
.get(userMeddleware.validIfExistUser,
    userController.findOne)
.patch(
    userMeddleware.validIfExistUser, 
    validationMiddleware.updateUserValidation,
    userController.update)
.delete(
    userMeddleware.validIfExistUser, 
    userController.delete)

router.patch("/password/:id", 
validationMiddleware.updatedPasswordValidation,
userMeddleware.validIfExistUser, 
authController.updatePassword)

module.exports = router;