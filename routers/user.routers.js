const express = require('express');
const router = express.Router();
// setup multer middlware and cloudinary to upload images
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });  // direct multer to save images on cloudinary

const users = require('../controllers/user.controllers');

router.get('/', users.getAllUsers);

router.post('/register', users.register);

router.post('/login', users.login);

router.get('/logout', users.logout);

router.get('/authenticate', users.authenticateUser);

router.route('/:id')
    .get(users.getUserProfile)
    .put(users.updateUserProfile);

module.exports = router;