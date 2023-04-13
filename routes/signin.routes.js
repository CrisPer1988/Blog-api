const signinController = require('../controllers/signin.controller');
const express = require('express');

const router = express.Router();

router.post('/signin', signinController.signin)

module.exports = router